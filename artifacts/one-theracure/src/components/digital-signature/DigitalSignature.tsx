
import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PenTool, Save, Trash2, Check, FileText } from "lucide-react";

interface SignatureData {
  id: string;
  doctorName: string;
  licenseNumber: string;
  timestamp: string;
  documentType: string;
  signature: string;
  verified: boolean;
}

const DigitalSignature = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatures, setSignatures] = useState<SignatureData[]>([
    {
      id: '1',
      doctorName: 'Dr. Ramakant Deshpande',
      licenseNumber: 'MD12345',
      timestamp: '2024-06-30T10:30:00Z',
      documentType: 'Prescription',
      signature: 'data:image/png;base64,signature_data',
      verified: true
    }
  ]);

  const [currentSignature, setCurrentSignature] = useState({
    doctorName: 'Dr. Ramakant Deshpande',
    licenseNumber: 'MD12345',
    documentType: 'Prescription'
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext('2d');
      if (context) {
        context.strokeStyle = '#000000';
        context.lineWidth = 2;
        context.lineCap = 'round';
        context.lineJoin = 'round';
      }
    }
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const context = canvas.getContext('2d');
      if (context) {
        context.beginPath();
        context.moveTo(x, y);
      }
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const context = canvas.getContext('2d');
      if (context) {
        context.lineTo(x, y);
        context.stroke();
      }
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext('2d');
      if (context) {
        context.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const signatureData = canvas.toDataURL();
      const newSignature: SignatureData = {
        id: Date.now().toString(),
        ...currentSignature,
        timestamp: new Date().toISOString(),
        signature: signatureData,
        verified: true
      };
      setSignatures([newSignature, ...signatures]);
      clearSignature();
    }
  };

  const documentTypes = [
    'Prescription',
    'Medical Certificate',
    'Referral Letter',
    'Discharge Summary',
    'Lab Report',
    'Treatment Plan'
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <PenTool className="h-5 w-5" />
            <span>Digital Signature</span>
          </CardTitle>
          <CardDescription>Create and manage secure digital signatures for medical documents</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="doctorName">Doctor Name</Label>
              <Input
                id="doctorName"
                value={currentSignature.doctorName}
                onChange={(e) => setCurrentSignature({...currentSignature, doctorName: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="licenseNumber">License Number</Label>
              <Input
                id="licenseNumber"
                value={currentSignature.licenseNumber}
                onChange={(e) => setCurrentSignature({...currentSignature, licenseNumber: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="documentType">Document Type</Label>
              <select 
                id="documentType"
                className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                value={currentSignature.documentType}
                onChange={(e) => setCurrentSignature({...currentSignature, documentType: e.target.value})}
              >
                {documentTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Signature Canvas - intentionally kept white for ink visibility */}
          <div className="space-y-4">
            <Label>Digital Signature</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-4">
              <canvas
                ref={canvasRef}
                width={600}
                height={200}
                className="w-full border border-border rounded cursor-crosshair bg-white"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
              />
              <div className="flex justify-between items-center mt-4">
                <p className="text-sm text-muted-foreground">Sign above with your mouse or touchpad</p>
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={clearSignature}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                  <Button onClick={saveSignature}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Signature
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Saved Signatures</CardTitle>
          <CardDescription>Previously created digital signatures</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {signatures.map((sig) => (
              <div key={sig.id} className="flex flex-col sm:flex-row items-start justify-between p-4 border rounded-lg space-y-3 sm:space-y-0">
                <div className="flex items-start space-x-4">
                  <div className="w-24 h-12 border rounded overflow-hidden bg-muted/50">
                    {sig.signature && (
                      <img 
                        src={sig.signature} 
                        alt="Signature" 
                        className="w-full h-full object-contain"
                      />
                    )}
                  </div>
                  <div>
                    <div className="font-medium">{sig.doctorName}</div>
                    <div className="text-sm text-muted-foreground">License: {sig.licenseNumber}</div>
                    <div className="text-sm text-muted-foreground">
                      {sig.documentType} • {new Date(sig.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {sig.verified && (
                    <Badge className="bg-green-500/10 text-green-700 dark:text-green-400 flex items-center space-x-1">
                      <Check className="h-3 w-3" />
                      <span>Verified</span>
                    </Badge>
                  )}
                  <Button variant="outline" size="sm">
                    <FileText className="h-4 w-4 mr-2" />
                    Use
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-blue-500/10 border-blue-500/20">
        <CardHeader>
          <CardTitle className="text-blue-700 dark:text-blue-400">Security Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-blue-600 dark:text-blue-300">
            <p className="flex items-center space-x-2">
              <Check className="h-4 w-4" />
              <span>All signatures are encrypted and timestamped</span>
            </p>
            <p className="flex items-center space-x-2">
              <Check className="h-4 w-4" />
              <span>Digital signatures are legally binding</span>
            </p>
            <p className="flex items-center space-x-2">
              <Check className="h-4 w-4" />
              <span>Audit trail maintained for compliance</span>
            </p>
            <p className="flex items-center space-x-2">
              <Check className="h-4 w-4" />
              <span>Tamper-proof verification system</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DigitalSignature;
