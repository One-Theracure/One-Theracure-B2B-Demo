import { useState, useRef, useEffect } from "react";
import { Monitor, X, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface ScreenCaptureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCapture: (blob: Blob) => void;
}

export const ScreenCaptureDialog = ({
  open,
  onOpenChange,
  onCapture,
}: ScreenCaptureDialogProps) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      startScreenCapture();
    } else {
      stopScreenCapture();
    }

    return () => stopScreenCapture();
  }, [open]);

  const startScreenCapture = async () => {
    try {
      if (!navigator.mediaDevices?.getDisplayMedia) {
        throw new Error("Screen capture not supported");
      }

      const mediaStream = await navigator.mediaDevices.getDisplayMedia({
        video: { 
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      // Handle stream ending (user cancels screen share)
      mediaStream.getVideoTracks()[0].addEventListener('ended', () => {
        onOpenChange(false);
      });
    } catch (error) {
      console.error("Screen capture error:", error);
      toast({
        title: "Screen Capture Error",
        description: "Could not capture screen. Please try again.",
        variant: "destructive",
      });
      onOpenChange(false);
    }
  };

  const stopScreenCapture = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const captureScreen = () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsCapturing(true);
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      if (blob) {
        onCapture(blob);
        onOpenChange(false);
      }
      setIsCapturing(false);
    }, 'image/png');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Screen Capture
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative bg-muted rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-64 object-cover"
            />
            <canvas
              ref={canvasRef}
              className="hidden"
            />
          </div>
          
          <div className="flex justify-center gap-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isCapturing}
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button
              onClick={captureScreen}
              disabled={isCapturing || !stream}
            >
              <Square className="mr-2 h-4 w-4" />
              {isCapturing ? "Capturing..." : "Capture"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};