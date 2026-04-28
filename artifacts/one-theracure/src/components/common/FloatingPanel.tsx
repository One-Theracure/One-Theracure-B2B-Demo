import { useState, useRef, useEffect, ReactNode } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Minus, Square, GripHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface FloatingPanelProps {
  children: ReactNode;
  title: string;
  isMinimized?: boolean;
  onMinimize?: () => void;
  onClose?: () => void;
  width?: number;
  height?: number;
  className?: string;
}

const FloatingPanel = ({
  children,
  title,
  isMinimized = false,
  onMinimize,
  onClose,
  width = 480,
  height = 600,
  className
}: FloatingPanelProps) => {
  const [position, setPosition] = useState({ x: window.innerWidth - width - 32, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      
      // Constrain to viewport
      const maxX = window.innerWidth - (isMinimized ? 200 : width);
      const maxY = window.innerHeight - (isMinimized ? 50 : height);
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, width, height, isMinimized]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!panelRef.current) return;
    
    const rect = panelRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setIsDragging(true);
  };

  if (isMinimized) {
    return (
      <div
        ref={panelRef}
        className="fixed z-50 animate-scale-in"
        style={{
          left: position.x,
          top: position.y,
        }}
      >
        <Card className="w-48 shadow-lg border-border">
          <CardHeader 
            className="p-2 cursor-move bg-muted/50 flex flex-row items-center justify-between space-y-0"
            onMouseDown={handleMouseDown}
          >
            <div className="flex items-center space-x-2">
              <GripHorizontal className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs font-medium truncate">{title}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={onMinimize}>
                <Square className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={onClose}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div
      ref={panelRef}
      className={cn("fixed z-50 animate-scale-in", className)}
      style={{
        left: position.x,
        top: position.y,
        width,
        height,
      }}
    >
      <Card className="h-full shadow-lg border-border flex flex-col">
        <CardHeader 
          className="p-3 cursor-move bg-muted/50 flex flex-row items-center justify-between space-y-0 border-b"
          onMouseDown={handleMouseDown}
        >
          <div className="flex items-center space-x-2">
            <GripHorizontal className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{title}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={onMinimize}>
              <Minus className="h-3 w-3" />
            </Button>
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={onClose}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 p-0 overflow-hidden">
          {children}
        </CardContent>
      </Card>
    </div>
  );
};

export default FloatingPanel;