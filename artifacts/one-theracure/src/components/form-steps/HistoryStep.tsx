import { useState, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import VoiceToText from "@/components/VoiceToText";
import { AttachmentMenu } from "@/components/media/AttachmentMenu";
import { CameraCaptureDialog } from "@/components/media/CameraCaptureDialog";
import { ScreenCaptureDialog } from "@/components/media/ScreenCaptureDialog";
import { useDocumentProcessor } from "@/hooks/useDocumentProcessor";
import { useToast } from "@/hooks/use-toast";
import { blobToFile } from "@/utils/file";
import { Sparkles, Upload, X, CheckCircle, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { logger } from '@/lib/logger';

interface HistoryStepProps {
  formData: {
    chiefComplaint: string;
    historyOfPresentIllness: string;
    pastMedicalHistory: string;
    pastSurgicalHistory: string;
    currentMedications: string;
    allergies: string;
    familyHistory: string;
    socialHistory: string;
    reviewOfSystems: string;
    chronicProblems: string;
  };
  onInputChange: (field: string, value: string) => void;
}

const HistoryStep = ({ formData, onInputChange }: HistoryStepProps) => {
  const [showROSSuggestions, setShowROSSuggestions] = useState(false);
  const [socialOpen, setSocialOpen] = useState(false);
  const [cameraDialogOpen, setCameraDialogOpen] = useState(false);
  const [screenDialogOpen, setScreenDialogOpen] = useState(false);
  const [uploadedDocument, setUploadedDocument] = useState<{
    file: File;
    status: 'uploading' | 'scanning' | 'classifying' | 'extracting' | 'completed' | 'error';
    progress: number;
    extractedText?: string;
    preview?: string;
    classification?: { type: string; confidence: number };
    extracted?: { patientName?: string; dateOfBirth?: string; mrn?: string; insuranceId?: string; date?: string };
  } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const { processDocument } = useDocumentProcessor();
  const { toast } = useToast();

  const handleVoiceTranscript = (field: string) => (transcript: string) => {
    const currentValue = formData[field as keyof typeof formData] as string;
    onInputChange(field, currentValue + (currentValue ? ' ' : '') + transcript);
  };

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      toast({
        title: "Unsupported file type",
        description: "Please upload an image or PDF file.",
        variant: "destructive",
      });
      return;
    }

    const preview = file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined;
    
    setUploadedDocument({
      file,
      status: 'uploading',
      progress: 0,
      preview
    });

    try {
      await processDocument(file, (status, progress, data) => {
        setUploadedDocument(prev => prev ? {
          ...prev,
          status,
          progress,
          classification: data?.classification || prev.classification,
          extracted: data?.extracted || prev.extracted,
          extractedText: data?.rawText || prev.extractedText
        } : null);

        // Append extracted text to medical history when completed
        if (status === 'completed' && data?.rawText) {
          const currentValue = formData.pastMedicalHistory;
          const delimiter = currentValue ? '\n\n--- Medical History Document (OCR) ---\n' : '';
          const newValue = currentValue + delimiter + data.rawText;
          onInputChange('pastMedicalHistory', newValue);
          
          toast({
            title: "Document processed successfully",
            description: "Medical history OCR text has been added.",
          });
        }
      });
    } catch (error) {
      logger.error("Document processing failed:", error);
      toast({
        title: "Processing failed",
        description: "Could not process the document. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleCameraCapture = (blob: Blob) => {
    const file = blobToFile(blob, `medical-history-${Date.now()}.jpg`, 'image/jpeg');
    handleFileUpload(file);
  };

  const handleScreenCapture = (blob: Blob) => {
    const file = blobToFile(blob, `medical-history-${Date.now()}.png`, 'image/png');
    handleFileUpload(file);
  };

  const handleRemoveDocument = () => {
    if (uploadedDocument?.preview) {
      URL.revokeObjectURL(uploadedDocument.preview);
    }
    setUploadedDocument(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const renderDocumentUpload = () => {
    if (!uploadedDocument) return null;

    return (
      <Card className="p-3 border-l-4 border-blue-500 bg-blue-500/10 mt-3">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Upload className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium">Medical History Document</span>
            <Badge variant="outline" className="text-xs">{uploadedDocument.file.name}</Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemoveDocument}
            className="h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>

        {/* Progress indicator */}
        {uploadedDocument.status !== 'completed' && uploadedDocument.status !== 'error' && (
          <div className="mb-2">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="capitalize">{uploadedDocument.status.replace('_', ' ')}</span>
              <span>{uploadedDocument.progress}%</span>
            </div>
            <Progress value={uploadedDocument.progress} className="h-1" />
          </div>
        )}

        {/* Image preview */}
        {uploadedDocument.preview && (
          <div className="mt-2">
            <img 
              src={uploadedDocument.preview} 
              alt="Document preview" 
              className="max-h-24 rounded border"
            />
          </div>
        )}

        {uploadedDocument.status === 'error' && (
          <div className="mt-1 text-xs text-red-600 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Failed to process document. Please try uploading again.
          </div>
        )}

        {uploadedDocument.status === 'completed' && (
          <div className="mt-1 text-xs text-green-600 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            ✓ Document processed and text extracted
          </div>
        )}
      </Card>
    );
  };

  const applyROSSuggestions = () => {
    // Auto-suggest based on chief complaint
    const suggestions = "No chest pain, no shortness of breath, no palpitations, no dizziness, no nausea, no vomiting, no fever, no chills.";
    onInputChange("reviewOfSystems", suggestions);
    setShowROSSuggestions(false);
  };

  return (
    <div className="space-y-6">
      {/* Chief Complaint & HPI */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-blue-700">Presenting Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="chiefComplaint">Chief Complaint *</Label>
              <VoiceToText onTranscript={handleVoiceTranscript("chiefComplaint")} />
            </div>
            <Textarea
              id="chiefComplaint"
              value={formData.chiefComplaint}
              onChange={(e) => onInputChange("chiefComplaint", e.target.value)}
              placeholder="Primary reason for visit"
              rows={2}
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="hpi">History of Present Illness</Label>
              <VoiceToText onTranscript={handleVoiceTranscript("historyOfPresentIllness")} />
            </div>
            <Textarea
              id="hpi"
              value={formData.historyOfPresentIllness}
              onChange={(e) => onInputChange("historyOfPresentIllness", e.target.value)}
              placeholder="Detailed history of current symptoms (onset, location, duration, character, aggravating/relieving factors, timing, severity)"
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Medical History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-blue-700 flex items-center justify-between">
            Medical History
            <AttachmentMenu
              onUploadFile={() => fileInputRef.current?.click()}
              onUploadPhoto={() => photoInputRef.current?.click()}
              onTakePhoto={() => setCameraDialogOpen(true)}
              onTakeScreenshot={() => setScreenDialogOpen(true)}
            />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pastMedicalHistory">Past Medical History</Label>
              <Textarea
                id="pastMedicalHistory"
                value={formData.pastMedicalHistory}
                onChange={(e) => onInputChange("pastMedicalHistory", e.target.value)}
                placeholder="Previous illnesses, chronic conditions, hospitalizations"
                rows={4}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="pastSurgicalHistory">Past Surgical History</Label>
              <Textarea
                id="pastSurgicalHistory"
                value={formData.pastSurgicalHistory}
                onChange={(e) => onInputChange("pastSurgicalHistory", e.target.value)}
                placeholder="Previous surgeries, procedures, dates"
                rows={4}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currentMedications">Current Medications</Label>
              <Textarea
                id="currentMedications"
                value={formData.currentMedications}
                onChange={(e) => onInputChange("currentMedications", e.target.value)}
                placeholder="Current medications, dosages, frequency"
                rows={4}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="allergies">Allergies</Label>
              <Textarea
                id="allergies"
                value={formData.allergies}
                onChange={(e) => onInputChange("allergies", e.target.value)}
                placeholder="Drug allergies, food allergies, environmental allergies, reactions"
                rows={4}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="chronicProblems">Chronic Problems</Label>
            <Textarea
              id="chronicProblems"
              value={formData.chronicProblems}
              onChange={(e) => onInputChange("chronicProblems", e.target.value)}
              placeholder="Ongoing chronic medical conditions and their management"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Social & Family History — collapsible for acute visits */}
      <Collapsible open={socialOpen} onOpenChange={setSocialOpen}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardTitle className="text-lg text-blue-700 flex items-center justify-between">
                Social & Family History
                <div className="flex items-center gap-2">
                  {(formData.familyHistory || formData.socialHistory) && (
                    <Badge variant="secondary" className="text-[10px]">Has data</Badge>
                  )}
                  {socialOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </div>
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="familyHistory">Family History</Label>
                  <Textarea
                    id="familyHistory"
                    value={formData.familyHistory}
                    onChange={(e) => onInputChange("familyHistory", e.target.value)}
                    placeholder="Relevant family medical history, genetic conditions"
                    rows={4}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="socialHistory">Social History</Label>
                  <Textarea
                    id="socialHistory"
                    value={formData.socialHistory}
                    onChange={(e) => onInputChange("socialHistory", e.target.value)}
                    placeholder="Smoking, alcohol, drugs, occupation, lifestyle factors, living situation"
                    rows={4}
                  />
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Review of Systems with AI suggestions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-blue-700 flex items-center justify-between">
            Review of Systems
            {formData.chiefComplaint && !formData.reviewOfSystems && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={applyROSSuggestions}
                className="text-xs"
              >
                <Sparkles className="h-3 w-3 mr-1" />
                Auto-fill negatives
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="reviewOfSystems">Review of Systems</Label>
              <VoiceToText onTranscript={handleVoiceTranscript("reviewOfSystems")} />
            </div>
            <Textarea
              id="reviewOfSystems"
              value={formData.reviewOfSystems}
              onChange={(e) => onInputChange("reviewOfSystems", e.target.value)}
              placeholder="Systematic review of symptoms by body system (Constitutional, HEENT, Cardiovascular, Respiratory, GI, GU, Musculoskeletal, Skin, Neurologic, Psychiatric, Endocrine, Hematologic/Lymphatic, Allergic/Immunologic)"
              rows={5}
            />
            {renderDocumentUpload()}
          </div>
        </CardContent>
      </Card>

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,application/pdf"
        onChange={handleFileInputChange}
        className="hidden"
      />
      <input
        ref={photoInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
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

export default HistoryStep;
