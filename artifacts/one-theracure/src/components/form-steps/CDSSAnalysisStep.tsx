import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Stethoscope, 
  Send, 
  Copy,
  FileText,
  Lightbulb,
  CheckCircle,
  ChevronUp,
  ChevronDown,
  AlertTriangle,
  Users,
  Clock,
  ArrowRight,
  Edit,
  X,
  Upload
} from "lucide-react";
import TransparentLogo from "@/components/TransparentLogo";
import { useDocumentProcessor } from "@/hooks/useDocumentProcessor";
import { useToast } from "@/hooks/use-toast";
import { AttachmentMenu } from "@/components/media/AttachmentMenu";
import { CameraCaptureDialog } from "@/components/media/CameraCaptureDialog";
import { ScreenCaptureDialog } from "@/components/media/ScreenCaptureDialog";
import { blobToFile } from "@/utils/file";

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  route: string;
}

interface FormData {
  patientName: string;
  age: string;
  gender: string;
  mrn: string;
  contactNumber: string;
  visitDate: string;
  specialty: string;
  consultationType: string;
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
  vitalSigns: {
    bp: string;
    pulse: string;
    temp: string;
    rr: string;
    spo2: string;
    weight: string;
    height: string;
  };
  generalExamination: string;
  systemicExamination: string;
  investigations: string;
  labResults: string;
  imagingResults: string;
  diagnosis: string;
  icdCode: string;
  treatment: string;
  medications: Medication[];
  labOrders: string;
  diagnosticOrders: string;
  followUp: string;
  advice: string;
}

interface CDSSAnalysisStepProps {
  formData?: FormData;
  onInputChange?: (field: string, value: string) => void;
  onMedicationsChange?: (medications: Medication[]) => void;
}

interface AnalysisSteps {
  step: string;
  status: 'completed' | 'current' | 'pending';
}

interface DifferentialDiagnosis {
  diagnosis: string;
  probability: 'High' | 'Moderate' | 'Low';
  reasoning: string;
  supportingFindings: string[];
  againstFindings: string[];
}

interface ClinicalRecommendation {
  category: 'Immediate' | 'Urgent' | 'Routine';
  action: string;
  rationale: string;
}

interface AnalysisResults {
  clinicalSummary: string;
  differentialDiagnoses: DifferentialDiagnosis[];
  workupRecommendations: ClinicalRecommendation[];
  treatmentConsiderations: ClinicalRecommendation[];
  patientEducation: string[];
  redFlags: string[];
  followUp: string;
  confidence: number;
  suggestedDiagnosis: string;
  suggestedTreatment: string;
  suggestedMedications: Medication[];
  suggestedInvestigations: string[];
  suggestedAdvice: string;
}

const CDSSAnalysisStep = ({ formData, onInputChange, onMedicationsChange }: CDSSAnalysisStepProps) => {
  const [patientInput, setPatientInput] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResults | null>(null);
  const [showSteps, setShowSteps] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editableResults, setEditableResults] = useState<AnalysisResults | null>(null);
  
  // Document upload state
  const [uploadedDocument, setUploadedDocument] = useState<{
    file: File;
    status: 'uploading' | 'scanning' | 'classifying' | 'extracting' | 'completed' | 'error';
    progress: number;
    classification?: { type: string; confidence: number };
    extracted?: { patientName?: string; dateOfBirth?: string; mrn?: string; insuranceId?: string; date?: string };
    preview?: string;
  } | null>(null);
  const [cameraDialogOpen, setCameraDialogOpen] = useState(false);
  const [screenDialogOpen, setScreenDialogOpen] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const { processDocument } = useDocumentProcessor();
  const { toast } = useToast();

  const analysisSteps: AnalysisSteps[] = [
    { step: "Processing clinical presentation", status: 'completed' },
    { step: "Analyzing symptoms and signs", status: 'completed' },
    { step: "Generating differential diagnoses", status: 'completed' },
    { step: "Reviewing evidence-based guidelines", status: 'completed' },
    { step: "Formulating clinical recommendations", status: 'completed' }
  ];

  const quickPrompts = [
    { 
      text: "Analyze chest pain", 
      prompt: "57-year-old male presents with acute onset chest pain, radiating to left arm, associated with diaphoresis and nausea. Pain started 2 hours ago while climbing stairs. Has history of hypertension and smoking." 
    },
    { 
      text: "Evaluate dyspnea", 
      prompt: "34-year-old female with 3-day history of shortness of breath, dry cough, and pleuritic chest pain. No fever. Recent long-haul flight 1 week ago. Taking oral contraceptives." 
    },
    { 
      text: "Assess abdominal pain", 
      prompt: "25-year-old female with right lower quadrant pain for 8 hours, nausea, and low-grade fever. Pain initially periumbilical, now localized to RLQ. Last menstrual period 3 weeks ago." 
    },
    { 
      text: "Review headache", 
      prompt: "42-year-old male with sudden onset severe headache, described as 'worst headache of my life', associated with photophobia and neck stiffness. No previous history of similar headaches." 
    }
  ];

  const handleAnalyze = async () => {
    if (!patientInput.trim()) return;
    
    setIsAnalyzing(true);
    setShowSteps(true);
    
    // Simulate step-by-step analysis
    for (let i = 0; i < analysisSteps.length; i++) {
      setTimeout(() => {
        setCurrentStep(i);
      }, i * 1000);
    }
    
    // Simulate analysis completion with structured medical reasoning
    setTimeout(() => {
      const mockAnalysis: AnalysisResults = {
        clinicalSummary: "This case presents a complex clinical scenario requiring systematic evaluation. The patient's presentation suggests multiple diagnostic possibilities that need to be carefully considered through evidence-based clinical reasoning.",
        differentialDiagnoses: [
          {
            diagnosis: "Acute Myocardial Infarction (STEMI/NSTEMI)",
            probability: "High",
            reasoning: "Classic presentation with chest pain radiating to left arm, diaphoresis, and risk factors including age, male gender, hypertension, and smoking history.",
            supportingFindings: ["Chest pain with radiation", "Diaphoresis", "Risk factors present", "Exertional trigger"],
            againstFindings: ["Would need ECG and cardiac biomarkers to confirm"]
          },
          {
            diagnosis: "Unstable Angina",
            probability: "Moderate",
            reasoning: "Similar presentation to MI but may have normal cardiac biomarkers initially. Requires urgent evaluation to rule out ACS.",
            supportingFindings: ["Chest pain pattern", "Risk factors", "Exertional component"],
            againstFindings: ["Associated symptoms suggest more than stable angina"]
          },
          {
            diagnosis: "Aortic Dissection",
            probability: "Low",
            reasoning: "Should be considered in hypertensive patients with chest pain, though presentation is more typical for ACS.",
            supportingFindings: ["Hypertension", "Acute chest pain"],
            againstFindings: ["Pain radiation pattern more typical for ACS", "No back pain described"]
          }
        ],
        workupRecommendations: [
          {
            category: "Immediate",
            action: "12-lead ECG stat",
            rationale: "Essential for diagnosing STEMI and guiding immediate treatment decisions"
          },
          {
            category: "Immediate", 
            action: "Cardiac biomarkers (Troponin I/T)",
            rationale: "Required for diagnosis of myocardial infarction and risk stratification"
          },
          {
            category: "Urgent",
            action: "Chest X-ray",
            rationale: "Evaluate for complications and rule out other causes of chest pain"
          },
          {
            category: "Urgent",
            action: "Complete metabolic panel, CBC, PT/PTT",
            rationale: "Baseline labs needed for treatment planning and anticoagulation decisions"
          }
        ],
        treatmentConsiderations: [
          {
            category: "Immediate",
            action: "Dual antiplatelet therapy (Aspirin + P2Y12 inhibitor)",
            rationale: "Standard of care for ACS unless contraindicated"
          },
          {
            category: "Immediate",
            action: "Anticoagulation (Heparin or LMWH)",
            rationale: "Reduces thrombotic risk in ACS patients"
          },
          {
            category: "Urgent",
            action: "Cardiology consultation",
            rationale: "Expert evaluation needed for further management and intervention decisions"
          }
        ],
        patientEducation: [
          "Explain the importance of immediate evaluation for chest pain",
          "Discuss cardiac risk factors and lifestyle modifications",
          "Provide information about follow-up care and warning signs",
          "Emphasize compliance with prescribed medications"
        ],
        redFlags: [
          "Ongoing chest pain despite treatment",
          "Hemodynamic instability",
          "Signs of cardiogenic shock",
          "New murmurs or gallops suggesting complications"
        ],
        followUp: "Cardiology follow-up within 1-2 weeks if stable discharge. Primary care follow-up within 1 week for risk factor modification and medication management.",
        confidence: 85,
        suggestedDiagnosis: "Acute Coronary Syndrome - NSTEMI",
        suggestedTreatment: "Dual antiplatelet therapy, anticoagulation, beta-blocker if stable, statin therapy",
        suggestedMedications: [
          {
            id: "1",
            name: "Aspirin",
            dosage: "81mg",
            frequency: "Once daily",
            duration: "Indefinitely",
            instructions: "Take with food to reduce GI upset",
            route: "Oral"
          },
          {
            id: "2", 
            name: "Clopidogrel",
            dosage: "75mg",
            frequency: "Once daily",
            duration: "12 months",
            instructions: "Take at same time daily",
            route: "Oral"
          },
          {
            id: "3",
            name: "Metoprolol",
            dosage: "25mg",
            frequency: "Twice daily",
            duration: "Ongoing",
            instructions: "Monitor heart rate and blood pressure",
            route: "Oral"
          }
        ],
        suggestedInvestigations: [
          "12-lead ECG",
          "Cardiac biomarkers (Troponin I/T)",
          "Chest X-ray",
          "Complete metabolic panel",
          "CBC with differential",
          "PT/PTT/INR"
        ],
        suggestedAdvice: "Avoid strenuous activity, take medications as prescribed, follow up with cardiology, seek immediate care for worsening chest pain or shortness of breath"
      };
      
      setAnalysisResults(mockAnalysis);
      setEditableResults({ ...mockAnalysis });
      setIsAnalyzing(false);
    }, 5000);
  };

  const handleApplyToRecord = () => {
    const resultsToApply = editableResults || analysisResults;
    if (!resultsToApply || !onInputChange || !onMedicationsChange) return;

    // Update diagnosis
    onInputChange('diagnosis', resultsToApply.suggestedDiagnosis);
    
    // Update treatment
    onInputChange('treatment', resultsToApply.suggestedTreatment);
    
    // Update medications
    onMedicationsChange(resultsToApply.suggestedMedications);
    
    // Update investigations
    onInputChange('investigations', resultsToApply.suggestedInvestigations.join('\n'));
    
    // Update advice
    onInputChange('advice', resultsToApply.suggestedAdvice);
    
    // Update follow-up
    onInputChange('followUp', resultsToApply.followUp);
  };

  const handleEditableChange = (field: keyof AnalysisResults, value: any) => {
    if (!editableResults) return;
    setEditableResults(prev => ({
      ...prev!,
      [field]: value
    }));
  };

  const handleQuickPrompt = (prompt: string) => {
    setPatientInput(prompt);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

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
          classification: data?.classification,
          extracted: data?.extracted
        } : null);

        // Append extracted text to patient input when completed
        if (status === 'completed' && data?.rawText) {
          setPatientInput(prev => {
            const delimiter = prev ? '\n\n--- Attached document (OCR) ---\n' : '';
            return prev + delimiter + data.rawText;
          });
          toast({
            title: "Document processed successfully",
            description: "OCR text has been added to your analysis input.",
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
      setUploadedDocument(prev => prev ? { ...prev, status: 'error' } : null);
    }
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

  const handleCameraCapture = (blob: Blob) => {
    const file = blobToFile(blob, `camera-${Date.now()}.jpg`, 'image/jpeg');
    handleFileFromBlob(file);
  };

  const handleScreenCapture = (blob: Blob) => {
    const file = blobToFile(blob, `screenshot-${Date.now()}.png`, 'image/png');
    handleFileFromBlob(file);
  };

  const handleFileFromBlob = async (file: File) => {
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
          classification: data?.classification,
          extracted: data?.extracted
        } : null);

        // Append extracted text to patient input when completed
        if (status === 'completed' && data?.rawText) {
          setPatientInput(prev => {
            const delimiter = prev ? '\n\n--- Attached document (OCR) ---\n' : '';
            return prev + delimiter + data.rawText;
          });
          toast({
            title: "Document processed successfully",
            description: "OCR text has been added to your analysis input.",
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
      setUploadedDocument(prev => prev ? { ...prev, status: 'error' } : null);
    }
  };

  const getProbabilityColor = (probability: string) => {
    switch (probability) {
      case 'High': return 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30';
      case 'Moderate': return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/30';
      case 'Low': return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Immediate': return 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30';
      case 'Urgent': return 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/30';
      case 'Routine': return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <div className="text-center py-6 px-4">
        <div className="flex items-center justify-center space-x-3 mb-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <TransparentLogo 
              originalSrc="/lovable-uploads/b4de0912-4a22-4126-9122-19ce612ae71f.png"
              alt="One TheraCure Logo" 
              className="w-6 h-6 object-contain"
            />
          </div>
          <h1 className="text-xl font-bold font-playfair bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            ONE THERACURE AI
          </h1>
        </div>
        <p className="text-base text-muted-foreground font-inter">Clinical Decision Support System</p>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 pb-8">
        {!analysisResults ? (
          <div className="space-y-4">
            {/* Input Section */}
            <div className="relative">
              <Textarea
                value={patientInput}
                onChange={(e) => setPatientInput(e.target.value)}
                placeholder="Present your clinical case here... Include patient demographics, chief complaint, history of present illness, physical examination findings, and any relevant investigations."
                className="min-h-[140px] text-sm p-4 border-2 border-border rounded-xl focus:border-primary resize-none shadow-sm"
              />
              <div className="absolute bottom-3 right-3 flex items-center space-x-2">
                <AttachmentMenu
                  onUploadFile={() => fileInputRef.current?.click()}
                  onUploadPhoto={() => photoInputRef.current?.click()}
                  onTakePhoto={() => setCameraDialogOpen(true)}
                  onTakeScreenshot={() => setScreenDialogOpen(true)}
                />
                <Button
                  onClick={handleAnalyze}
                  disabled={!patientInput.trim() || isAnalyzing}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                >
                  <Stethoscope className="h-4 w-4 mr-1" />
                  Analyze Case
                </Button>
              </div>
            </div>

            {/* Hidden file inputs */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
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

            {/* Document Upload Status */}
            {uploadedDocument && (
              <Card className="p-4 border-l-4 border-blue-500">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Upload className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">Attached Document</span>
                    <Badge variant="outline">{uploadedDocument.file.name}</Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveDocument}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Progress indicator */}
                {uploadedDocument.status !== 'completed' && uploadedDocument.status !== 'error' && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="capitalize">{uploadedDocument.status.replace('_', ' ')}</span>
                      <span>{uploadedDocument.progress}%</span>
                    </div>
                    <Progress value={uploadedDocument.progress} className="h-2" />
                  </div>
                )}

                {/* Classification and extracted data */}
                {uploadedDocument.classification && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div>
                      <h4 className="font-medium mb-2">Classification</h4>
                      <Badge className="text-xs">
                        {uploadedDocument.classification.type} ({Math.round(uploadedDocument.classification.confidence * 100)}%)
                      </Badge>
                    </div>
                    
                    {uploadedDocument.extracted && Object.keys(uploadedDocument.extracted).length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Extracted Information</h4>
                        <div className="space-y-1">
                          {uploadedDocument.extracted.patientName && (
                            <p><span className="font-medium">Patient:</span> {uploadedDocument.extracted.patientName}</p>
                          )}
                          {uploadedDocument.extracted.dateOfBirth && (
                            <p><span className="font-medium">DOB:</span> {uploadedDocument.extracted.dateOfBirth}</p>
                          )}
                          {uploadedDocument.extracted.mrn && (
                            <p><span className="font-medium">MRN:</span> {uploadedDocument.extracted.mrn}</p>
                          )}
                          {uploadedDocument.extracted.insuranceId && (
                            <p><span className="font-medium">Insurance:</span> {uploadedDocument.extracted.insuranceId}</p>
                          )}
                          {uploadedDocument.extracted.date && (
                            <p><span className="font-medium">Date:</span> {uploadedDocument.extracted.date}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Image preview */}
                {uploadedDocument.preview && (
                  <div className="mt-3">
                    <img 
                      src={uploadedDocument.preview} 
                      alt="Document preview" 
                      className="max-h-32 rounded border"
                    />
                  </div>
                )}

                {uploadedDocument.status === 'error' && (
                  <div className="mt-2 text-xs text-red-600">
                    Failed to process document. Please try uploading again.
                  </div>
                )}
              </Card>
            )}

            {/* Quick Case Examples */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {quickPrompts.map((example, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="h-auto p-3 text-left hover:bg-muted/50 justify-start"
                  onClick={() => handleQuickPrompt(example.prompt)}
                >
                  <div className="flex items-start space-x-2">
                    <Stethoscope className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                    <span className="text-xs font-medium">{example.text}</span>
                  </div>
                </Button>
              ))}
            </div>

            {/* Processing Steps */}
            {isAnalyzing && showSteps && (
              <Card className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm">Processing Clinical Case...</h3>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span className="text-xs text-muted-foreground">~30 seconds</span>
                  </div>
                </div>
                <div className="space-y-2">
                  {analysisSteps.map((step, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                        index <= currentStep ? 'bg-green-500' : 'bg-muted'
                      }`}>
                        {index <= currentStep && <CheckCircle className="h-3 w-3 text-white" />}
                      </div>
                      <span className={`text-xs ${index <= currentStep ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {step.step}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Analysis Results */}
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Stethoscope className="h-5 w-5 text-blue-600" />
                    <h2 className="text-lg font-bold">Clinical Analysis</h2>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant={isEditing ? "default" : "outline"}
                      size="sm"
                      onClick={() => setIsEditing(!isEditing)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      {isEditing ? "View Mode" : "Edit Mode"}
                    </Button>
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={handleApplyToRecord}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <ArrowRight className="h-4 w-4 mr-1" />
                      Apply to Record
                    </Button>
                    <Button variant="outline" size="sm">
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </Button>
                    <Button variant="outline" size="sm">
                      Export PDF
                    </Button>
                  </div>
                </div>

                <div className="space-y-6 text-sm">
                  {/* Clinical Summary */}
                  <div>
                    <h3 className="font-semibold mb-2 text-primary">Clinical Summary</h3>
                    {isEditing ? (
                      <Textarea
                        value={editableResults?.clinicalSummary || ""}
                        onChange={(e) => handleEditableChange("clinicalSummary", e.target.value)}
                        className="text-foreground leading-relaxed min-h-[80px]"
                      />
                    ) : (
                      <p className="text-foreground leading-relaxed">{editableResults?.clinicalSummary || analysisResults.clinicalSummary}</p>
                    )}
                  </div>

                  {/* Suggested Diagnosis */}
                  <div>
                    <h3 className="font-semibold mb-2 text-primary">Primary Diagnosis</h3>
                    {isEditing ? (
                      <Input
                        value={editableResults?.suggestedDiagnosis || ""}
                        onChange={(e) => handleEditableChange("suggestedDiagnosis", e.target.value)}
                        className="text-foreground"
                      />
                    ) : (
                      <p className="text-foreground font-medium">{editableResults?.suggestedDiagnosis || analysisResults.suggestedDiagnosis}</p>
                    )}
                  </div>

                  {/* Suggested Treatment */}
                  <div>
                    <h3 className="font-semibold mb-2 text-primary">Treatment Plan</h3>
                    {isEditing ? (
                      <Textarea
                        value={editableResults?.suggestedTreatment || ""}
                        onChange={(e) => handleEditableChange("suggestedTreatment", e.target.value)}
                        className="text-foreground min-h-[60px]"
                      />
                    ) : (
                      <p className="text-foreground">{editableResults?.suggestedTreatment || analysisResults.suggestedTreatment}</p>
                    )}
                  </div>

                  {/* Suggested Investigations */}
                  <div>
                    <h3 className="font-semibold mb-2 text-primary">Recommended Investigations</h3>
                    {isEditing ? (
                      <Textarea
                        value={editableResults?.suggestedInvestigations.join('\n') || ""}
                        onChange={(e) => handleEditableChange("suggestedInvestigations", e.target.value.split('\n').filter(item => item.trim()))}
                        className="text-foreground min-h-[80px]"
                        placeholder="Enter each investigation on a new line"
                      />
                    ) : (
                      <ul className="list-disc list-inside space-y-1 text-foreground">
                        {(editableResults?.suggestedInvestigations || analysisResults.suggestedInvestigations).map((investigation, index) => (
                          <li key={index}>{investigation}</li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Suggested Advice */}
                  <div>
                    <h3 className="font-semibold mb-2 text-primary">Patient Advice</h3>
                    {isEditing ? (
                      <Textarea
                        value={editableResults?.suggestedAdvice || ""}
                        onChange={(e) => handleEditableChange("suggestedAdvice", e.target.value)}
                        className="text-foreground min-h-[60px]"
                      />
                    ) : (
                      <p className="text-foreground">{editableResults?.suggestedAdvice || analysisResults.suggestedAdvice}</p>
                    )}
                  </div>

                  {/* Follow-up Plan */}
                  <div>
                    <h3 className="font-semibold mb-2 text-primary">Follow-up Plan</h3>
                    {isEditing ? (
                      <Textarea
                        value={editableResults?.followUp || ""}
                        onChange={(e) => handleEditableChange("followUp", e.target.value)}
                        className="text-foreground min-h-[60px]"
                      />
                    ) : (
                      <p className="text-foreground bg-primary/10 p-3 rounded-lg">{editableResults?.followUp || analysisResults.followUp}</p>
                    )}
                  </div>

                  {/* Differential Diagnoses - Read Only */}
                  <div>
                    <h3 className="font-semibold mb-3 text-primary">Differential Diagnoses</h3>
                    <div className="space-y-3">
                      {analysisResults.differentialDiagnoses.map((dx, index) => (
                        <div key={index} className="border rounded-lg p-3 bg-muted/50">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{dx.diagnosis}</h4>
                            <Badge className={`text-xs ${getProbabilityColor(dx.probability)}`}>
                              {dx.probability} Probability
                            </Badge>
                          </div>
                          <p className="text-muted-foreground text-xs mb-2">{dx.reasoning}</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="font-medium text-green-700 dark:text-green-400">Supporting:</span>
                              <ul className="list-disc list-inside ml-2 text-muted-foreground">
                                {dx.supportingFindings.map((finding, idx) => (
                                  <li key={idx}>{finding}</li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <span className="font-medium text-orange-700 dark:text-orange-400">Against:</span>
                              <ul className="list-disc list-inside ml-2 text-muted-foreground">
                                {dx.againstFindings.map((finding, idx) => (
                                  <li key={idx}>{finding}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Workup Recommendations */}
                  <div>
                    <h3 className="font-semibold mb-3 text-primary">Recommended Workup</h3>
                    <div className="space-y-2">
                      {analysisResults.workupRecommendations.map((rec, index) => (
                        <div key={index} className="flex items-start space-x-3 p-2 border-l-4 border-blue-500/20 bg-blue-500/10">
                          <Badge className={`text-xs ${getCategoryColor(rec.category)} mt-1`}>
                            {rec.category}
                          </Badge>
                          <div className="flex-1">
                            <p className="font-medium text-xs">{rec.action}</p>
                            <p className="text-muted-foreground text-xs">{rec.rationale}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Treatment Considerations */}
                  <div>
                    <h3 className="font-semibold mb-3 text-primary">Treatment Considerations</h3>
                    <div className="space-y-2">
                      {analysisResults.treatmentConsiderations.map((treatment, index) => (
                        <div key={index} className="flex items-start space-x-3 p-2 border-l-4 border-green-500/20 bg-green-500/10">
                          <Badge className={`text-xs ${getCategoryColor(treatment.category)} mt-1`}>
                            {treatment.category}
                          </Badge>
                          <div className="flex-1">
                            <p className="font-medium text-xs">{treatment.action}</p>
                            <p className="text-muted-foreground text-xs">{treatment.rationale}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Red Flags */}
                  {analysisResults.redFlags.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2 text-red-700 flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        Red Flags to Monitor
                      </h3>
                      <ul className="list-disc list-inside space-y-1 text-xs text-foreground bg-red-500/10 p-3 rounded-lg">
                        {analysisResults.redFlags.map((flag, index) => (
                          <li key={index}>{flag}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Patient Education */}
                  <div>
                    <h3 className="font-semibold mb-2 text-blue-700 flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      Patient Education Points
                    </h3>
                    <ul className="list-disc list-inside space-y-1 text-xs text-foreground">
                      {analysisResults.patientEducation.map((point, index) => (
                        <li key={index}>{point}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* New Analysis Input */}
            <div className="relative">
              <Textarea
                placeholder="Analyze another case..."
                className="min-h-[80px] text-sm p-4 border-2 border-border rounded-xl focus:border-primary resize-none"
                onFocus={() => {
                  setAnalysisResults(null);
                  setEditableResults(null);
                  setIsEditing(false);
                  setPatientInput("");
                }}
              />
              <div className="absolute bottom-3 right-3">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
                  <Stethoscope className="h-4 w-4 mr-1" />
                  New Analysis
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center py-4 text-xs text-muted-foreground border-t bg-background">
        <p className="mb-2">⚠️ For educational and decision support purposes only. Always verify with current clinical guidelines.</p>
        <div className="space-x-4">
          <span>Clinical Guidelines</span>
          <span>Evidence Base</span>
          <span>Feedback</span>
        </div>
      </div>
    </div>
  );
};

export default CDSSAnalysisStep;
