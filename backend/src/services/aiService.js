import { GoogleGenAI } from '@google/genai';
import fetch from 'node-fetch'; 

const A_KEY = process.env.ASSEMBLYAI_API_KEY;
const UPLOAD_URL = 'https://api.assemblyai.com/v2/upload';
const TRANSCRIPT_URL = 'https://api.assemblyai.com/v2/transcript';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const aiService = {
  // 1. Transcribe Audio (AssemblyAI)
  async transcribeAudio(buffer) {
    if (!A_KEY) throw new Error('ASSEMBLYAI_API_KEY not set');

    console.log("Uploading audio to AssemblyAI...");
    const uploadRes = await fetch(UPLOAD_URL, {
      method: 'POST',
      headers: { 
        Authorization: A_KEY,
        'Content-Type': 'application/octet-stream' 
      },
      body: buffer
    });

    if (!uploadRes.ok) {
        const errText = await uploadRes.text();
        throw new Error('Upload failed: ' + errText);
    }
    const uploadJson = await uploadRes.json();

    console.log("Audio uploaded, starting transcription job...");
    const createRes = await fetch(TRANSCRIPT_URL, {
      method: 'POST',
      headers: { Authorization: A_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ audio_url: uploadJson.upload_url, punctuate: true })
    });

    if (!createRes.ok) throw new Error('Transcript start failed');
    const job = await createRes.json();

    // Poll
    console.log(`Polling for transcript (Job ID: ${job.id})...`);
    while (true) {
      await new Promise((r) => setTimeout(r, 1000));
      const statusRes = await fetch(`${TRANSCRIPT_URL}/${job.id}`, {
        headers: { Authorization: A_KEY }
      });
      const statusJson = await statusRes.json();
      
      if (statusJson.status === 'completed') return statusJson.text;
      if (statusJson.status === 'error') throw new Error('Transcription error: ' + statusJson.error);
    }
  },

  // 2. Parse Intent (Gemini)
  async parseTranscript(transcript) {
    console.log("Parsing transcript with Gemini...");
    
    // Get precise current context
    const now = new Date();
    const today = now.toLocaleDateString('en-US', {
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric'
    }); 

    const combinedPrompt = `
      SYSTEM INSTRUCTIONS:
      You are a smart Task Manager Assistant. Your goal is to extract structured JSON data from a voice transcript.

      ---
      DATE CONTEXT:
      Today is: ${today}.
      
      CRITICAL RULES FOR DATES:
      1. Use the "Today" date above as the strict anchor.
      2. "Next Friday" usually means the upcoming Friday.
      3. **VERIFICATION STEP:** If the user mentions a specific day of the week (e.g., "Friday"), YOU MUST ensure the calculated 'due_date' falls exactly on that day of the week in the year ${now.getFullYear()}.
      4. Format the date as 'DD-MM-YYYY'.

      ---
      FIELDS TO EXTRACT:
      - title: (String) Concise summary.
      - description: (String) Full details or null. If you can extract any specifics, include them here.
      - due_date: (String) Format 'DD-MM-YYYY'. Return null if no date is mentioned. Or if date cannot be confidently determined, use today's date.
      - priority: (String) "Low"|"Medium"|"High"|"Critical". (Look for words like 'urgent', 'critical', 'ASAP').
      - status: (String) "To Do"|"In Progress"|"Done". Default "To Do".

      Output ONLY valid JSON. No markdown blocks.

      ---
      USER TRANSCRIPT:
      "${transcript}"
    `;

    try {
      const resp = await ai.models.generateContent({
        model: 'gemini-2.5-flash', 
        contents: [
          { role: 'user', parts: [{ text: combinedPrompt }] }
        ],
        config: { temperature: 0.1, maxOutputTokens: 500 }
      });

      console.log("Gemini Response:", resp);

      // Handle response structure
      let candidates;
      if (resp.candidates) {
          candidates = resp.candidates;
      } else if (resp.response && resp.response.candidates) {
          candidates = resp.response.candidates;
      }

      if (!candidates || candidates.length === 0) {
          throw new Error("No candidates returned from Gemini");
      }

      const textResponse = candidates[0].content.parts[0].text;
      const cleanJson = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
      
      console.log("Gemini Response JSON:", cleanJson);

      return JSON.parse(cleanJson);

    } catch (error) {
      console.error("Gemini Parse Error:", error);
      return { 
        title: transcript, 
        priority: "Medium", 
        status: "To Do", 
        due_date: null 
      };
    }
  }
};