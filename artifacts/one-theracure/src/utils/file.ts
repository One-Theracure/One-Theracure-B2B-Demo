export const blobToFile = (blob: Blob, filename: string, type?: string): File => {
  return new File([blob], filename, { type: type || blob.type });
};

export const ensureImagePng = async (blob: Blob): Promise<Blob> => {
  if (blob.type === 'image/png') {
    return blob;
  }
  
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      canvas.toBlob((pngBlob) => {
        resolve(pngBlob || blob);
      }, 'image/png');
    };
    
    img.src = URL.createObjectURL(blob);
  });
};