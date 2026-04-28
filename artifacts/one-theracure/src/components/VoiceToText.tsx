
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Square } from "lucide-react";

interface VoiceToTextProps {
  onTranscript: (text: string) => void;
  className?: string;
}

const VoiceToText = ({ onTranscript, className }: VoiceToTextProps) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported] = useState(() => 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const startListening = () => {
    if (!isSupported) return;
    
    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('');
      onTranscript(transcript);
    };
    
    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  if (!isSupported) {
    return null;
  }

  return (
    <Button
      type="button"
      variant={isListening ? "destructive" : "outline"}
      size="sm"
      onClick={isListening ? stopListening : startListening}
      className={className}
    >
      {isListening ? (
        <>
          <Square className="h-3 w-3 mr-1" />
          Stop
        </>
      ) : (
        <>
          <Mic className="h-3 w-3 mr-1" />
          Voice
        </>
      )}
    </Button>
  );
};

export default VoiceToText;
