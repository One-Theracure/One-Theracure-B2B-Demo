
import { useState, useEffect } from 'react';
import { removeBackground, loadImage } from '@/utils/backgroundRemoval';
import { logger } from '@/lib/logger';

interface TransparentLogoProps {
  originalSrc: string;
  alt: string;
  className?: string;
}

const TransparentLogo = ({ originalSrc, alt, className }: TransparentLogoProps) => {
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingError, setProcessingError] = useState(false);

  useEffect(() => {
    const processImage = async () => {
      try {
        setIsProcessing(true);
        setProcessingError(false);

        // Load the original image
        const response = await fetch(originalSrc);
        const blob = await response.blob();
        const imageElement = await loadImage(blob);

        // Remove background
        const processedBlob = await removeBackground(imageElement);
        
        // Create URL for processed image
        const processedUrl = URL.createObjectURL(processedBlob);
        setProcessedImageUrl(processedUrl);
      } catch (error) {
        logger.error('Failed to process image:', error);
        setProcessingError(true);
      } finally {
        setIsProcessing(false);
      }
    };

    processImage();

    // Cleanup function to revoke object URL
    return () => {
      if (processedImageUrl) {
        URL.revokeObjectURL(processedImageUrl);
      }
    };
  }, [originalSrc]);

  // Show original image while processing or if processing failed
  if (isProcessing || processingError || !processedImageUrl) {
    return (
      <img 
        src={originalSrc}
        alt={alt}
        className={className}
      />
    );
  }

  return (
    <img 
      src={processedImageUrl}
      alt={alt}
      className={className}
    />
  );
};

export default TransparentLogo;
