import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';
import { api } from '../../api/endpoints';

export default function VoiceInputModal({ isOpen, onClose, onTaskReady }) {
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [audioUrl, setAudioUrl] = useState(null); 
  const [audioBlob, setAudioBlob] = useState(null); 
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    if (isOpen) {
      setTranscript(''); 
      setRecording(false);
      setProcessing(false);
      
      // To clear audio too (fresh start)
      // setAudioUrl(null);
      // setAudioBlob(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob); 
        setAudioUrl(url);   
      };

      mediaRecorderRef.current.start();
      setRecording(true);
      setTranscript(''); // Clear old transcript on new recording
      setAudioUrl(null); // Clear old audio on new recording
    } catch (err) {
      alert("Microphone access denied.");
      console.error(err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  const handleProcess = async () => {
    if (!audioBlob) return;
    setProcessing(true);
    setTranscript(''); // Clear previous text before new processing
    
    const formData = new FormData();
    formData.append('audio', audioBlob, 'voice.webm');

    try {
      const data = await api.processVoice(formData);
      if (data.error) throw new Error(data.error);
      
      setTranscript(data.transcript);
      setTimeout(() => onTaskReady(data.parsedData), 1500);
    } catch (err) {
      setTranscript("Error: " + err.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden text-center p-8 animate-[slideUp_0.3s_ease-out]">
         
         <div className="mb-6 relative h-24 flex items-center justify-center">
            <button 
                onClick={recording ? stopRecording : startRecording}
                disabled={processing}
                className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
                    recording ? 'bg-red-500 text-white scale-110' : 
                    processing ? 'bg-slate-100 text-slate-400' : 
                    'bg-blue-600 text-white hover:bg-blue-700'
                }`}
            >
                {processing ? <Loader2 className="animate-spin" size={32} /> : recording ? <Square size={28} fill="currentColor" /> : <Mic size={32} />}
            </button>
         </div>

         <h3 className="text-xl font-bold text-slate-800 mb-2">
            {recording ? 'Listening...' : processing ? 'Analyzing...' : 'Tap to Speak'}
         </h3>

         {/* Audio Preview Section */}
         {!recording && audioUrl && !processing && (
            <div className="my-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <p className="text-xs text-slate-500 font-semibold mb-2 uppercase">Preview Recording</p>
                <audio controls src={audioUrl} className="w-full h-8" />
                <button 
                    onClick={handleProcess}
                    className="mt-3 w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-medium text-sm transition-colors"
                >
                    Create Task from Audio
                </button>
            </div>
         )}

         {transcript && (
             <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs text-slate-600 italic">
                 "{transcript}"
             </div>
         )}

         <button onClick={onClose} className="mt-4 text-slate-400 hover:text-slate-600 text-sm font-medium">Close</button>
      </div>
    </div>
  );
}