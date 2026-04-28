
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Phone, Calendar } from "lucide-react";

interface PatientInfoCardProps {
  patientName: string;
  age: string;
  gender: string;
  mrn: string;
  contactNumber: string;
  visitDate: string;
  specialty: string;
  profileData?: {
    name: string;
    specialty: string;
  };
}

const PatientInfoCard = ({ 
  patientName, 
  age, 
  gender, 
  mrn, 
  contactNumber, 
  visitDate, 
  specialty,
  profileData 
}: PatientInfoCardProps) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return new Date().toLocaleDateString('en-GB');
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  return (
    <Card className="border-blue-200 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center space-x-2 mb-3">
          <User className="h-4 w-4 text-blue-600" />
          <h3 className="font-semibold font-playfair text-blue-800">Patient Information</h3>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm font-sf-pro">
          <div className="flex items-center space-x-2">
            <span className="font-medium font-inter">Name:</span>
            <span>{patientName || "Not specified"}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-medium font-inter">Age:</span>
            <span>{age || "Not specified"}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-medium font-inter">Gender:</span>
            <span>{gender || "Not specified"}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-medium font-inter">MRN:</span>
            <span>{mrn || "Auto-generated"}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Phone className="h-3 w-3 text-gray-500" />
            <span>{contactNumber || "Not provided"}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="h-3 w-3 text-gray-500" />
            <span>{formatDate(visitDate)}</span>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium font-inter text-blue-700">Consulting Doctor:</span>
            <Badge variant="outline" className="font-sf-pro text-blue-700 border-blue-200">
              {profileData?.name || "Dr. Ramakant Deshpande"} ({profileData?.specialty || specialty || "General Medicine"})
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PatientInfoCard;
