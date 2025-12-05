import { aiService } from '../services/aiService.js';

export const processVoice = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No audio file provided' });

  try {
    const transcript = await aiService.transcribeAudio(req.file.buffer);
    const parsedData = await aiService.parseTranscript(transcript);
    
    res.json({ transcript, parsedData });
  } catch (err) {
    console.error("Voice processing failed:", err);
    res.status(500).json({ error: err.message });
  }
};