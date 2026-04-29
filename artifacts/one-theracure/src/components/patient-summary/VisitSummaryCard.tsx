
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Stethoscope, AlertCircle, Activity, Heart, FileText } from "lucide-react";

interface VisitSummaryCardProps {
  chiefComplaint: string;
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
  diagnosis: string;
  icdCode: string;
}

const VisitSummaryCard = ({ 
  chiefComplaint, 
  vitalSigns, 
  generalExamination, 
  systemicExamination, 
  diagnosis, 
  icdCode 
}: VisitSummaryCardProps) => {
  const formatVitals = () => {
    const vitals = [];
    if (vitalSigns.bp) vitals.push(`BP: ${vitalSigns.bp}`);
    if (vitalSigns.pulse) vitals.push(`Pulse: ${vitalSigns.pulse}`);
    if (vitalSigns.temp) vitals.push(`Temp: ${vitalSigns.temp}`);
    if (vitalSigns.spo2) vitals.push(`SpO2: ${vitalSigns.spo2}`);
    return vitals.length > 0 ? vitals.join(' | ') : 'Not recorded';
  };

  return (
    <Card className="border-green-200 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center space-x-2 mb-3">
          <Stethoscope className="h-4 w-4 text-green-600" />
          <h3 className="font-semibold text-green-800">Visit Summary</h3>
        </div>
        
        <div className="space-y-3">
          <div className="bg-green-50 p-3 rounded-lg border border-green-200">
            <div className="flex items-center space-x-2 mb-2">
              <AlertCircle className="h-4 w-4 text-green-600" />
              <span className="font-medium text-green-800">Main Concern</span>
            </div>
            <p className="text-sm text-gray-700">{chiefComplaint || "General consultation"}</p>
          </div>

          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-2 mb-2">
              <Activity className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-800">Vital Signs</span>
            </div>
            <p className="text-sm text-gray-700">{formatVitals()}</p>
          </div>

          <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
            <div className="flex items-center space-x-2 mb-2">
              <Heart className="h-4 w-4 text-purple-600" />
              <span className="font-medium text-purple-800">Examination Findings</span>
            </div>
            <div className="text-sm space-y-1">
              <div><strong>General:</strong> {generalExamination || "Within normal limits"}</div>
              <div><strong>Systemic:</strong> {systemicExamination || "No significant findings"}</div>
            </div>
          </div>

          <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
            <div className="flex items-center space-x-2 mb-2">
              <FileText className="h-4 w-4 text-orange-600" />
              <span className="font-medium text-orange-800">Diagnosis</span>
            </div>
            <p className="text-sm text-gray-700">
              {diagnosis || "Assessment in progress"}
              {icdCode && <span className="text-gray-500 ml-2">(ICD: {icdCode})</span>}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VisitSummaryCard;
