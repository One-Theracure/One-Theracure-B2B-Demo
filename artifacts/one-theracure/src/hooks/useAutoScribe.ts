import { useState, useRef, useCallback } from "react";
import { pipeline } from "@huggingface/transformers";

interface TranscriptChunk {
  text: string;
  timestamp: number;
  confidence?: number;
}

export const useAutoScribe = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [chunks, setChunks] = useState<TranscriptChunk[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const transcriperRef = useRef<any>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingStartTime = useRef<number>(0);
  const finalTextRef = useRef<string>("");

  // Initialize Whisper on first use
  const initializeTranscriper = useCallback(async () => {
    if (transcriperRef.current) return transcriperRef.current;
    
    try {
      transcriperRef.current = await pipeline(
        "automatic-speech-recognition",
        "onnx-community/whisper-tiny.en",
        { device: "webgpu" }
      );
      return transcriperRef.current;
    } catch (err) {
      console.warn("WebGPU Whisper failed, falling back to Web Speech API:", err);
      // Return null to indicate fallback should be used
      return null;
    }
  }, []);

  // Fallback to Web Speech API
  const startWebSpeechRecognition = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError("Speech recognition not supported in this browser");
      return;
    }

    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    
    recognition.onstart = () => {
      setIsListening(true);
      recordingStartTime.current = Date.now();
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };
    
    recognition.onresult = (event) => {
      let newFinalText = "";
      let interimTranscript = "";
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          newFinalText += result[0].transcript;
          const chunk: TranscriptChunk = {
            text: result[0].transcript,
            timestamp: Math.floor((Date.now() - recordingStartTime.current) / 1000),
            confidence: result[0].confidence
          };
          setChunks(prev => [...prev, chunk]);
        } else {
          interimTranscript += result[0].transcript;
        }
      }
      
      if (newFinalText) {
        finalTextRef.current += newFinalText;
      }
      
      setTranscript(finalTextRef.current + (interimTranscript ? " " + interimTranscript : ""));
    };
    
    recognition.onerror = (event) => {
      setError(`Speech recognition error: ${event.error}`);
      setIsListening(false);
    };
    
    recognition.start();
    return recognition;
  }, []);

  // Process audio chunk with Whisper
  const processAudioChunk = useCallback(async (audioBlob: Blob) => {
    try {
      setIsProcessing(true);
      const transcriber = await initializeTranscriper();
      
      if (!transcriber) {
        // Fallback already handled by Web Speech API
        return;
      }

      const arrayBuffer = await audioBlob.arrayBuffer();
      const result = await transcriber(arrayBuffer);
      
      if (result?.text) {
        const chunk: TranscriptChunk = {
          text: result.text.trim(),
          timestamp: Math.floor((Date.now() - recordingStartTime.current) / 1000)
        };
        
        setChunks(prev => [...prev, chunk]);
        setTranscript(prev => prev + " " + result.text);
      }
    } catch (err) {
      console.error("Whisper transcription failed:", err);
    } finally {
      setIsProcessing(false);
    }
  }, [initializeTranscriper]);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      setTranscript("");
      setChunks([]);
      finalTextRef.current = "";
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        }
      });
      
      streamRef.current = stream;
      recordingStartTime.current = Date.now();

      // Try to initialize Whisper
      const transcriber = await initializeTranscriper();
      
      if (transcriber) {
        // Use MediaRecorder for Whisper
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: 'audio/webm'
        });
        
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];
        
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };
        
        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          processAudioChunk(audioBlob);
        };
        
        mediaRecorder.start();
        setIsListening(true);
        
        // Process in chunks every 8 seconds
        const chunkInterval = setInterval(() => {
          if (mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
            setTimeout(() => {
              if (streamRef.current) {
                const newRecorder = new MediaRecorder(streamRef.current, {
                  mimeType: 'audio/webm'
                });
                mediaRecorderRef.current = newRecorder;
                audioChunksRef.current = [];
                newRecorder.ondataavailable = mediaRecorder.ondataavailable;
                newRecorder.onstop = mediaRecorder.onstop;
                newRecorder.start();
              }
            }, 100);
          }
        }, 8000);
        
        // Store interval for cleanup
        (mediaRecorder as any).chunkInterval = chunkInterval;
      } else {
        // Fallback to Web Speech API
        startWebSpeechRecognition();
      }
      
    } catch (err) {
      setError("Microphone access denied or unavailable");
      console.error("Recording error:", err);
    }
  }, [initializeTranscriper, processAudioChunk, startWebSpeechRecognition]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current) {
      const recorder = mediaRecorderRef.current;
      if ((recorder as any).chunkInterval) {
        clearInterval((recorder as any).chunkInterval);
      }
      recorder.stop();
      mediaRecorderRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    setIsListening(false);
  }, []);

  const clearTranscript = useCallback(() => {
    setTranscript("");
    setChunks([]);
    audioChunksRef.current = [];
    finalTextRef.current = "";
  }, []);

  return {
    isListening,
    transcript,
    chunks,
    isProcessing,
    error,
    startRecording,
    stopRecording,
    clearTranscript
  };
};