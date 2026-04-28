import React from "react";

const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-background to-muted/40">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin" aria-label="Loading" />
        <p className="text-sm text-muted-foreground">Loading experience…</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
