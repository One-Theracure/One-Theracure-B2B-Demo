import { useState, useRef, useEffect } from "react";
import { Camera, X, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface CameraCaptureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCapture: (blob: Blob) => void;
}

export const CameraCaptureDialog = ({
  open,
  onOpenChange,
  onCapture,
}: CameraCaptureDialogProps) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => stopCamera();
  }, [open]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error("Camera access error:", error);
      toast({
        title: "Camera Error",
        description: "Could not access camera. Please check permissions.",
        variant: "destructive",
      });
      onOpenChange(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
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
    }, 'image/jpeg', 0.9);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Take Photo
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
              onClick={capturePhoto}
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