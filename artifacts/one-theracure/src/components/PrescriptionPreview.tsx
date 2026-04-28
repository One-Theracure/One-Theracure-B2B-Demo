
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FileText, User, Calendar, Stethoscope, Pill, MessageCircle } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";

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
  familyHistory: string;
  socialHistory: string;
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
  followUp: string;
  advice: string;
}

interface ProfileData {
  name: string;
  role: string;
  email: string;
  phone: string;
  specialty: string;
  clinicName: string;
  clinicAddress: string;
  about: string;
}

interface PrescriptionPreviewProps {
  formData: FormData;
  profileData?: ProfileData;
}

const PrescriptionPreview = ({ formData, profileData }: PrescriptionPreviewProps) => {
  const currentDate = new Date().toLocaleDateString();
  
  // Use profileData if available, otherwise fall back to defaults
  const doctorName = profileData?.name || "Dr. Ramakant Deshpande";
  const clinicName = profileData?.clinicName || "One TheraCure Clinic";
  const clinicAddress = profileData?.clinicAddress || "Medical Center, Healthcare District";
  const doctorSpecialty = profileData?.specialty || formData.specialty || "General Medicine";
  const registrationNo = "MCI-12345";

  return (
    <div className="bg-white p-6 text-black font-sans text-sm">
      {/* Header */}
      <div className="mb-6 border-b-2 border-blue-600 pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 text-center">
            <h1 className="text-2xl font-bold text-blue-800 mb-1">{clinicName}</h1>
            <p className="text-gray-600 mb-1">{clinicAddress}</p>
            <div className="flex justify-center items-center space-x-4 text-sm text-gray-600">
              <span>{doctorName}</span>
              <span>•</span>
              <span>Reg. No: {registrationNo}</span>
              <span>•</span>
              <span>{doctorSpecialty}</span>
            </div>
          </div>
          <div className="flex flex-col items-center ml-4 shrink-0">
            <QRCodeSVG
              value={`https://app.onetheracure.com/visit/${formData.mrn || 'demo-visit'}-${formData.visitDate || currentDate}`}
              size={56}
              level="M"
              className="border border-blue-200 rounded p-0.5"
            />
            <span className="text-[9px] text-blue-600 mt-1 font-medium text-center leading-tight">Scan for<br/>digital copy</span>
            <button
              onClick={() => {
                const visitUrl = `https://app.onetheracure.com/visit/${formData.mrn || 'demo-visit'}-${formData.visitDate || currentDate}`;
                const message = `Hi ${formData.patientName || 'Patient'}, here is your prescription from ${clinicName}. View it here: ${visitUrl}`;
                window.open(`https://wa.me/${formData.contactNumber?.replace(/\D/g, '') || ''}?text=${encodeURIComponent(message)}`, '_blank');
              }}
              className="mt-1.5 flex items-center gap-1 px-2 py-0.5 bg-green-500 hover:bg-green-600 text-white text-[9px] font-semibold rounded-full transition-colors print:hidden"
            >
              <MessageCircle className="h-3 w-3" />
              WhatsApp
            </button>
          </div>
        </div>
      </div>

      {/* Patient Information */}
      <div className="grid grid-cols-2 gap-4 mb-6 bg-gray-50 p-4 rounded-lg">
        <div>
          <p className="font-semibold text-gray-800">Patient Details:</p>
          <p><strong>Name:</strong> {formData.patientName || "N/A"}</p>
          <p><strong>Age/Gender:</strong> {formData.age || "N/A"} / {formData.gender || "N/A"}</p>
          <p><strong>MRN:</strong> {formData.mrn || "N/A"}</p>
        </div>
        <div>
          <p className="font-semibold text-gray-800">Visit Information:</p>
          <p><strong>Date:</strong> {formData.visitDate || currentDate}</p>
          <p><strong>Contact:</strong> {formData.contactNumber || "N/A"}</p>
          <p><strong>Diagnosis:</strong> {formData.diagnosis || "N/A"}</p>
        </div>
      </div>

      {/* Prescription Header */}
      <div className="flex items-center space-x-2 mb-4">
        <FileText className="h-5 w-5 text-blue-600" />
        <h2 className="text-xl font-bold text-blue-800">PRESCRIPTION</h2>
      </div>

      {/* Medications */}
      <div className="space-y-4 mb-8">
        {formData.medications && formData.medications.length > 0 ? (
          formData.medications.map((medication, index) => (
            <div key={medication.id} className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50 rounded-r-lg">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-800">
                    {index + 1}. {medication.name}
                  </h3>
                  <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                    <p><strong>Dosage:</strong> {medication.dosage}</p>
                    <p><strong>Route:</strong> {medication.route}</p>
                    <p><strong>Frequency:</strong> {medication.frequency}</p>
                    {medication.duration && (
                      <p><strong>Duration:</strong> {medication.duration}</p>
                    )}
                  </div>
                  {medication.instructions && (
                    <div className="mt-2 p-2 bg-yellow-50 border-l-2 border-yellow-400">
                      <p className="text-sm"><strong>Instructions:</strong> {medication.instructions}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Pill className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No medications prescribed</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t-2 border-gray-300 pt-6 mt-8">
        <div className="flex justify-between items-end">
          <div>
            <p className="text-sm text-gray-600">Generated on: {currentDate}</p>
            <p className="text-xs text-gray-500 mt-1">
              This is a computer-generated prescription. Please verify all medications before dispensing.
            </p>
          </div>
          <div className="text-right">
            <div className="border-t border-gray-400 pt-2 mt-8 w-48">
              <p className="font-semibold">{doctorName}</p>
              <p className="text-sm text-gray-600">{doctorSpecialty}</p>
              <p className="text-xs text-gray-500">Registration No: {registrationNo}</p>
            </div>
          </div>
        </div>
        <p className="text-center text-[10px] text-gray-400 mt-4">Digital copy powered by One TheraCure • www.onetheracure.com</p>
      </div>
    </div>
  );
};

export default PrescriptionPreview;
