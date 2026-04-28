
import { useState, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Upload } from "lucide-react";
import AIInsightsPill from "@/components/AIInsightsPill";
import { useDocumentProcessor } from "@/hooks/useDocumentProcessor";
import { useToast } from "@/hooks/use-toast";
import { AttachmentMenu } from "@/components/media/AttachmentMenu";
import { CameraCaptureDialog } from "@/components/media/CameraCaptureDialog";
import { ScreenCaptureDialog } from "@/components/media/ScreenCaptureDialog";
import { blobToFile } from "@/utils/file";

interface InvestigationsStepProps {
  formData: {
    investigations: string;
    labResults: string;
    imagingResults: string;
  };
  onInputChange: (field: string, value: string) => void;
}

const InvestigationsStep = ({ formData, onInputChange }: InvestigationsStepProps) => {
  // Lab document upload state
  const [labDocument, setLabDocument] = useState<{
    file: File;
    status: 'uploading' | 'scanning' | 'classifying' | 'extracting' | 'completed' | 'error';
    progress: number;
    extractedText?: string;
    preview?: string;
  } | null>(null);

  // Imaging document upload state
  const [imagingDocument, setImagingDocument] = useState<{
    file: File;
    status: 'uploading' | 'scanning' | 'classifying' | 'extracting' | 'completed' | 'error';
    progress: number;
    extractedText?: string;
    preview?: string;
  } | null>(null);

  const [cameraDialogOpen, setCameraDialogOpen] = useState(false);
  const [screenDialogOpen, setScreenDialogOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<'lab' | 'imaging' | null>(null);

  const labFileInputRef = useRef<HTMLInputElement>(null);
  const labPhotoInputRef = useRef<HTMLInputElement>(null);
  const imagingFileInputRef = useRef<HTMLInputElement>(null);
  const imagingPhotoInputRef = useRef<HTMLInputElement>(null);
  const { processDocument } = useDocumentProcessor();
  const { toast } = useToast();

  const labTrends = [
    "Hemoglobin stable at 12.5 g/dL (within normal range)",
    "Creatinine trending up: 1.0 → 1.2 mg/dL (monitor kidney function)",
    "HbA1c improved: 8.2% → 7.8% (diabetes management effective)"
  ];

  const imagingInsights = [
    "Chest X-ray: No acute findings, stable cardiomegaly",
    "Previous CT scan (3 months ago) showed no significant changes"
  ];
  const handleLabFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    await handleFileUpload(event, 'lab');
  };

  const handleImagingFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    await handleFileUpload(event, 'imaging');
  };

  const handleCameraCapture = (blob: Blob) => {
    const file = blobToFile(blob, `camera-${Date.now()}.jpg`, 'image/jpeg');
    if (activeSection) {
      handleFileUploadDirect(file, activeSection);
    }
  };

  const handleScreenCapture = (blob: Blob) => {
    const file = blobToFile(blob, `screenshot-${Date.now()}.png`, 'image/png');
    if (activeSection) {
      handleFileUploadDirect(file, activeSection);
    }
  };

  const handleFileUploadDirect = async (file: File, type: 'lab' | 'imaging') => {
    // Validate file type
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      toast({
        title: "Invalid file type",
        description: "Please upload an image or PDF file.",
        variant: "destructive",
      });
      return;
    }

    // Create preview for images
    let preview: string | undefined;
    if (file.type.startsWith('image/')) {
      preview = URL.createObjectURL(file);
    }

    const documentState = {
      file,
      status: 'uploading' as const,
      progress: 0,
      preview
    };

    if (type === 'lab') {
      setLabDocument(documentState);
    } else {
      setImagingDocument(documentState);
    }

    try {
      await processDocument(file, async (status, progress, data) => {
        const updateState = {
          status,
          progress,
          extractedText: data?.rawText
        };

        if (type === 'lab') {
          setLabDocument(prev => prev ? { ...prev, ...updateState } : null);
        } else {
          setImagingDocument(prev => prev ? { ...prev, ...updateState } : null);
        }

        // If processing is completed, extract text and append to field
        if (status === 'completed' && data?.rawText) {
          const fieldName = type === 'lab' ? 'labResults' : 'imagingResults';
          const currentValue = formData[fieldName];
          const newValue = currentValue 
            ? `${currentValue}\n\n--- Uploaded Document (${file.name}) ---\n${data.rawText}`
            : `--- Uploaded Document (${file.name}) ---\n${data.rawText}`;
          
          onInputChange(fieldName, newValue);
          
          toast({
            title: "Document processed",
            description: `${type === 'lab' ? 'Lab' : 'Imaging'} document text has been extracted and added.`,
          });
        }
      });
    } catch (error) {
      console.error('Document processing failed:', error);
      toast({
        title: "Processing failed",
        description: "Failed to process the document. Please try again.",
        variant: "destructive",
      });
      
      if (type === 'lab') {
        setLabDocument(prev => prev ? { ...prev, status: 'error' } : null);
      } else {
        setImagingDocument(prev => prev ? { ...prev, status: 'error' } : null);
      }
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'lab' | 'imaging') => {
    const file = event.target.files?.[0];
    if (!file) return;
    handleFileUploadDirect(file, type);
  };

  const handleRemoveDocument = (type: 'lab' | 'imaging') => {
    const document = type === 'lab' ? labDocument : imagingDocument;
    if (document?.preview) {
      URL.revokeObjectURL(document.preview);
    }
    
    if (type === 'lab') {
      setLabDocument(null);
      if (labFileInputRef.current) {
        labFileInputRef.current.value = '';
      }
    } else {
      setImagingDocument(null);
      if (imagingFileInputRef.current) {
        imagingFileInputRef.current.value = '';
      }
    }
  };

  const renderDocumentUpload = (document: typeof labDocument, type: 'lab' | 'imaging') => {
    if (!document) return null;

    return (
      <Card className="p-3 border-l-4 border-blue-500 bg-blue-500/10 mt-3">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Upload className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium">Uploaded Document</span>
            <Badge variant="outline" className="text-xs">{document.file.name}</Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleRemoveDocument(type)}
            className="h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>

        {/* Progress indicator */}
        {document.status !== 'completed' && document.status !== 'error' && (
          <div className="mb-2">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="capitalize">{document.status.replace('_', ' ')}</span>
              <span>{document.progress}%</span>
            </div>
            <Progress value={document.progress} className="h-1" />
          </div>
        )}

        {/* Image preview */}
        {document.preview && (
          <div className="mt-2">
            <img 
              src={document.preview} 
              alt="Document preview" 
              className="max-h-24 rounded border"
            />
          </div>
        )}

        {document.status === 'error' && (
          <div className="mt-1 text-xs text-red-600">
            Failed to process document. Please try uploading again.
          </div>
        )}

        {document.status === 'completed' && (
          <div className="mt-1 text-xs text-green-600">
            ✓ Document processed and text extracted
          </div>
        )}
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-blue-700 flex items-center justify-between">
            Laboratory Results
            <div className="flex items-center space-x-2">
              <AIInsightsPill insights={labTrends} type="trends" />
              <AttachmentMenu
                onUploadFile={() => labFileInputRef.current?.click()}
                onUploadPhoto={() => labPhotoInputRef.current?.click()}
                onTakePhoto={() => {
                  setActiveSection('lab');
                  setCameraDialogOpen(true);
                }}
                onTakeScreenshot={() => {
                  setActiveSection('lab');
                  setScreenDialogOpen(true);
                }}
              />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="labResults">Previous Laboratory Results</Label>
            <Textarea
              id="labResults"
              value={formData.labResults}
              onChange={(e) => onInputChange("labResults", e.target.value)}
              placeholder="Previous CBC, biochemistry, serology results"
              rows={4}
            />
            {renderDocumentUpload(labDocument, 'lab')}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-blue-700 flex items-center justify-between">
            Imaging Results
            <div className="flex items-center space-x-2">
              <AIInsightsPill insights={imagingInsights} type="trends" />
              <AttachmentMenu
                onUploadFile={() => imagingFileInputRef.current?.click()}
                onUploadPhoto={() => imagingPhotoInputRef.current?.click()}
                onTakePhoto={() => {
                  setActiveSection('imaging');
                  setCameraDialogOpen(true);
                }}
                onTakeScreenshot={() => {
                  setActiveSection('imaging');
                  setScreenDialogOpen(true);
                }}
              />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="imagingResults">Previous Imaging Results</Label>
            <Textarea
              id="imagingResults"
              value={formData.imagingResults}
              onChange={(e) => onInputChange("imagingResults", e.target.value)}
              placeholder="Previous X-ray, CT, MRI, ultrasound findings"
              rows={4}
            />
            {renderDocumentUpload(imagingDocument, 'imaging')}
          </div>
        </CardContent>
      </Card>

      {/* Hidden file inputs */}
      <input
        ref={labFileInputRef}
        type="file"
        accept="image/*,application/pdf"
        onChange={handleLabFileUpload}
        className="hidden"
      />
      <input
        ref={labPhotoInputRef}
        type="file"
        accept="image/*"
        onChange={handleLabFileUpload}
        className="hidden"
      />
      <input
        ref={imagingFileInputRef}
        type="file"
        accept="image/*,application/pdf"
        onChange={handleImagingFileUpload}
        className="hidden"
      />
      <input
        ref={imagingPhotoInputRef}
        type="file"
        accept="image/*"
        onChange={handleImagingFileUpload}
        className="hidden"
      />

      {/* Camera and Screen Capture Dialogs */}
      <CameraCaptureDialog
        open={cameraDialogOpen}
        onOpenChange={setCameraDialogOpen}
        onCapture={handleCameraCapture}
      />
      <ScreenCaptureDialog
        open={screenDialogOpen}
        onOpenChange={setScreenDialogOpen}
        onCapture={handleScreenCapture}
      />
    </div>
  );
};

export default InvestigationsStep;
