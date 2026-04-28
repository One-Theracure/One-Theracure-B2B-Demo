
import { Separator } from "@/components/ui/separator";

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
  medications: string;
  followUp: string;
  advice: string;
}

interface PatientHandoutPreviewProps {
  formData: FormData;
}

const PatientHandoutPreview = ({ formData }: PatientHandoutPreviewProps) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return new Date().toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
    return new Date(dateString).toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  return (
    <div className="space-y-4 text-sm">
      <div className="text-center border-b pb-4">
        <h1 className="text-lg font-bold text-green-800">Your Visit Summary – One TheraCure</h1>
        <p className="text-gray-600"><em>Date:</em> {formatDate(formData.visitDate)}</p>
      </div>

      <div className="bg-green-50 p-3 rounded">
        <p><strong>Hi {formData.patientName ? formData.patientName.split(' ')[0] : 'Patient'},</strong></p>
        <p className="mt-2">Here's an easy-to-read recap of today's appointment.</p>
      </div>

      <Separator />

      {formData.diagnosis && (
        <div>
          <h2 className="text-md font-bold text-green-700">What We Learned</h2>
          <ul className="ml-4 list-disc space-y-1">
            <li><strong>Main finding:</strong> {formData.diagnosis}</li>
            {formData.chiefComplaint && <li><strong>Your main concern:</strong> {formData.chiefComplaint}</li>}
          </ul>
        </div>
      )}

      {(formData.diagnosis || formData.treatment) && (
        <div>
          <h2 className="text-md font-bold text-green-700">Why It Matters</h2>
          <p className="ml-2">
            {formData.diagnosis ? 
              `Your condition (${formData.diagnosis}) is being managed with appropriate medical care. Your healthcare team will monitor your progress and adjust treatment as needed.` :
              "Your healthcare team has developed a personalized treatment plan based on your examination and symptoms."
            }
          </p>
        </div>
      )}

      {(formData.treatment || formData.medications || formData.followUp) && (
        <div>
          <h2 className="text-md font-bold text-green-700">Our Plan</h2>
          <div className="grid grid-cols-3 gap-2 text-xs bg-gray-50 p-2 rounded">
            <div><strong>Step</strong></div>
            <div><strong>What will happen</strong></div>
            <div><strong>When</strong></div>
            
            {formData.treatment && (
              <>
                <div>1</div>
                <div>{formData.treatment}</div>
                <div>As scheduled</div>
              </>
            )}
            
            {formData.followUp && (
              <>
                <div>2</div>
                <div>Follow-up appointment</div>
                <div>{formData.followUp}</div>
              </>
            )}
          </div>
        </div>
      )}

      {formData.medications && (
        <div>
          <h3 className="font-semibold text-green-700">Medicines</h3>
          <div className="ml-2 p-2 bg-yellow-50 rounded border-l-4 border-yellow-400">
            <p>{formData.medications}</p>
            <p className="text-xs text-yellow-700 mt-1">⚠️ Take medications exactly as prescribed</p>
          </div>
          <p className="text-xs text-gray-500 mt-1"><em>(Full e-prescription stored in your app's Health Locker.)</em></p>
        </div>
      )}

      <Separator />

      <div className="bg-red-50 p-3 rounded border-l-4 border-red-400">
        <h3 className="font-semibold text-red-700">Watch Out For</h3>
        <p className="text-sm text-red-700 mb-2">Call or chat with us sooner if you notice:</p>
        <ul className="text-xs text-red-700 ml-2 list-disc list-inside space-y-1">
          <li>Sudden severe pain or worsening symptoms</li>
          <li>New symptoms that concern you</li>
          <li>Side effects from medications</li>
          <li>Any questions about your treatment</li>
        </ul>
      </div>

      {(formData.treatment || formData.diagnosis) && (
        <div>
          <h2 className="text-md font-bold text-green-700">Looking Ahead</h2>
          <p className="ml-2">
            With proper treatment and follow-up care, we expect you to feel better. 
            Your healthcare team will continue to monitor your progress and adjust your care plan as needed.
          </p>
        </div>
      )}

      <Separator />

      <div className="text-center text-xs text-gray-500 border-t pt-2">
        <p>Need help? Tap <strong>"Chat with Care Team"</strong> in the One TheraCure app or call <strong>1800-THERACURE</strong>.</p>
        <p className="mt-1"><em>— Your One TheraCure Team</em></p>
        <p className="mt-2">Generated by TheraCure ClinDesk • Keep this summary for your records</p>
      </div>
    </div>
  );
};

export default PatientHandoutPreview;
