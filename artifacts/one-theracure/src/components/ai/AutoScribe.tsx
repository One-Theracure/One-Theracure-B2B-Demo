import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Square, Play, Copy, Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAutoScribe } from "@/hooks/useAutoScribe";

interface AutoScribeProps {
  onTranscriptApply: (transcript: string, section?: 'history' | 'examination' | 'plan') => void;
  className?: string;
}

const AutoScribe = ({ onTranscriptApply, className }: AutoScribeProps) => {
  const [showTranscript, setShowTranscript] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  
  const {
    isListening,
    transcript,
    chunks,
    isProcessing,
    startRecording,
    stopRecording,
    clearTranscript,
    error
  } = useAutoScribe();

  const handleStartStop = () => {
    if (isListening) {
      stopRecording();
    } else {
      startRecording();
      setShowTranscript(true);
    }
  };

  const handleApplyToSection = (section: 'history' | 'examination' | 'plan') => {
    if (transcript.trim()) {
      onTranscriptApply(transcript, section);
      toast({
        title: "Applied to form",
        description: `Transcript added to ${section} section`
      });
    }
  };

  const handleCopyChunk = async (chunkText: string, index: number) => {
    try {
      await navigator.clipboard.writeText(chunkText);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
      toast({ title: "Copied", description: "Text copied to clipboard" });
    } catch {
      toast({ title: "Copy failed", description: "Unable to copy text" });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="text-center text-destructive">
            <p className="text-sm">Auto Scribe unavailable</p>
            <p className="text-xs text-muted-foreground mt-1">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Mic className="h-4 w-4" />
            Auto Scribe
          </CardTitle>
          <div className="flex items-center gap-2">
            {isListening && (
              <Badge variant="destructive" className="animate-pulse">
                Recording
              </Badge>
            )}
            {isProcessing && (
              <Badge variant="secondary">
                Processing...
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant={isListening ? "destructive" : "default"}
            size="sm"
            onClick={handleStartStop}
            disabled={isProcessing}
          >
            {isListening ? (
              <>
                <Square className="h-4 w-4 mr-2" />
                Stop
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Start
              </>
            )}
          </Button>
          
          {transcript && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearTranscript}
            >
              Clear
            </Button>
          )}
        </div>

        {/* Live transcript */}
        {showTranscript && (
          <div className="space-y-3">
            {transcript && (
              <div className="p-3 bg-muted rounded-lg">
                <h4 className="text-sm font-medium mb-2">Live Transcript</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {transcript}
                </p>
              </div>
            )}

            {/* Apply buttons */}
            {transcript && (
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleApplyToSection('history')}
                >
                  Add to History
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleApplyToSection('examination')}
                >
                  Add to Exam
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleApplyToSection('plan')}
                >
                  Add to Plan
                </Button>
              </div>
            )}

            {/* Processed chunks */}
            {chunks.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Processed Segments</h4>
                {chunks.map((chunk, index) => (
                  <div key={index} className="p-2 bg-accent/50 rounded text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-muted-foreground">
                        Segment {index + 1} • {formatTime(chunk.timestamp)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyChunk(chunk.text, index)}
                        className="h-6 w-6 p-0"
                      >
                        {copiedIndex === index ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                    <p className="text-foreground">{chunk.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AutoScribe;