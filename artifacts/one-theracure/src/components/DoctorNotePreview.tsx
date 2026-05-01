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
  medications: string;
  labOrders: string;
  diagnosticOrders: string;
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

interface DoctorNotePreviewProps {
  formData: FormData;
  profileData?: ProfileData;
}

const DoctorNotePreview = ({ formData, profileData }: DoctorNotePreviewProps) => {
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

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: true 
    });
  };

  const hasVitalSigns = Object.values(formData.vitalSigns).some(v => v && v.trim());
  const hasPersonalHistory = formData.pastMedicalHistory || formData.pastSurgicalHistory || 
                            formData.currentMedications || formData.allergies || 
                            formData.familyHistory || formData.socialHistory || 
                            formData.reviewOfSystems || formData.chronicProblems;
  const hasInvestigations = formData.investigations || formData.labResults || formData.imagingResults;
  const hasTreatmentPlanning = formData.diagnosis || formData.treatment || formData.medications || 
                               formData.labOrders || formData.diagnosticOrders || formData.followUp || formData.advice;

  // Use profileData if available, otherwise fall back to defaults
  const doctorName = profileData?.name || "Dr. Ramakant Deshpande";
  const clinicName = profileData?.clinicName || "Triumph Oncology Clinic";
  const clinicAddress = profileData?.clinicAddress || "One TheraCure Smart-OPD • Main Branch";
  const doctorSpecialty = profileData?.specialty || formData.specialty || "General Medicine";

  return (
    <div className="space-y-4 text-sm font-sf-pro bg-white">
      {/* Professional Header with Logo */}
      <div className="relative bg-gradient-to-r from-blue-50 via-indigo-50 to-slate-50 border-2 border-blue-200 rounded-xl p-6 mb-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex-1"></div>
          <div className="text-center flex-1">
            <h1 className="text-display-lg text-brand-navy mb-2">{clinicName}</h1>
            <h2 className="text-lg font-semibold font-sf-pro text-blue-700 mb-1 tracking-wide">OPD VISIT SUMMARY / INITIAL ASSESSMENT</h2>
            <p className="text-sm text-slate-600 font-inter">{clinicAddress}</p>
            <p className="text-sm text-slate-600 mt-1 font-inter">Visit Date & Time: {formatDate(formData.visitDate)} • {getCurrentTime()} • IST</p>
          </div>
          <div className="flex-1 flex justify-end">
            <div className="w-16 h-16 bg-white rounded-full border-2 border-blue-300 flex items-center justify-center shadow-lg">
              <img 
                src="/lovable-uploads/cfbef34a-ed2e-4440-ad32-4d4961dc6954.png" 
                alt="One TheraCure Logo" 
                className="w-12 h-12 object-contain"
              />
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-base font-semibold text-brand-navy mb-3 bg-brand-soft p-2 rounded-airbnb-sm border border-brand-trust/15">1. Administrative Data</h2>
        <div className="grid grid-cols-2 gap-3 text-xs bg-gradient-to-br from-gray-50 to-slate-50 p-4 rounded-lg border shadow-inner">
          <div className="bg-white p-2 rounded font-sf-pro shadow-sm"><strong className="font-playfair">MR / Reg No.</strong> {formData.mrn || "To be assigned"}</div>
          <div className="bg-white p-2 rounded font-sf-pro shadow-sm"><strong className="font-playfair">CR No.</strong> {formData.mrn || "To be assigned"}</div>
          <div className="bg-white p-2 rounded font-sf-pro shadow-sm"><strong className="font-playfair">Patient Name</strong> {formData.patientName || "[Patient Name]"}</div>
          <div className="bg-white p-2 rounded font-sf-pro shadow-sm"><strong className="font-playfair">Gender</strong> {formData.gender || "To be recorded"}</div>
          <div className="bg-white p-2 rounded font-sf-pro shadow-sm"><strong className="font-playfair">Date of Birth / Age</strong> {formData.age ? `${formData.age} yr` : "To be recorded"}</div>
          <div className="bg-white p-2 rounded font-sf-pro shadow-sm"><strong className="font-playfair">Marital Status</strong> To be recorded</div>
          <div className="bg-white p-2 rounded font-sf-pro shadow-sm"><strong className="font-playfair">Address</strong> To be recorded</div>
          <div className="bg-white p-2 rounded font-sf-pro shadow-sm"><strong className="font-playfair">Contact No.</strong> {formData.contactNumber || "To be recorded"}</div>
          <div className="bg-white p-2 rounded font-sf-pro shadow-sm"><strong className="font-playfair">Consultant</strong> {doctorName}, {doctorSpecialty}</div>
          <div className="bg-white p-2 rounded font-sf-pro shadow-sm"><strong className="font-playfair">Assist By</strong> One TheraCure ClinDesk System</div>
        </div>
      </div>

      <Separator className="my-4" />

      <div>
        <h2 className="text-base font-semibold text-brand-navy mb-3 bg-brand-soft p-2 rounded-airbnb-sm border border-brand-trust/15">2. Presenting Information</h2>
        <div className="space-y-3 bg-gradient-to-br from-gray-50 to-slate-50 p-4 rounded-lg shadow-inner">
          <div className="bg-white p-3 rounded font-sf-pro shadow-sm"><strong className="font-playfair">Chief Complaint(s):</strong> {formData.chiefComplaint || "To be documented during visit"}</div>
          <div className="bg-white p-3 rounded font-sf-pro shadow-sm">
            <strong className="font-playfair">History of Present Illness:</strong><br />
            <div className="ml-4 mt-2 text-gray-700 font-inter leading-relaxed">{formData.historyOfPresentIllness || "To be documented during examination"}</div>
          </div>
        </div>
      </div>

      <Separator className="my-4" />

      {/* Personal History Section */}
      <div>
        <h2 className="text-base font-semibold text-brand-navy mb-3 bg-brand-soft p-2 rounded-airbnb-sm border border-brand-trust/15">3. Personal History</h2>
        {hasPersonalHistory ? (
          <div className="space-y-3 bg-gradient-to-br from-gray-50 to-slate-50 p-4 rounded-lg shadow-inner">
            {formData.pastMedicalHistory && (
              <div className="bg-white p-3 rounded font-sf-pro shadow-sm">
                <strong className="font-playfair">Past Medical History:</strong><br />
                <div className="ml-4 mt-2 text-gray-700">{formData.pastMedicalHistory}</div>
              </div>
            )}
            {formData.pastSurgicalHistory && (
              <div className="bg-white p-3 rounded font-sf-pro shadow-sm">
                <strong className="font-playfair">Past Surgical History:</strong><br />
                <div className="ml-4 mt-2 text-gray-700">{formData.pastSurgicalHistory}</div>
              </div>
            )}
            {formData.currentMedications && (
              <div className="bg-white p-3 rounded font-sf-pro shadow-sm">
                <strong className="font-playfair">Current Medications:</strong><br />
                <div className="ml-4 mt-2 text-gray-700">{formData.currentMedications}</div>
              </div>
            )}
            {formData.allergies && (
              <div className="bg-white p-3 rounded font-sf-pro shadow-sm">
                <strong className="font-playfair">Allergies:</strong><br />
                <div className="ml-4 mt-2 text-gray-700">{formData.allergies}</div>
              </div>
            )}
            {formData.familyHistory && (
              <div className="bg-white p-3 rounded font-sf-pro shadow-sm">
                <strong className="font-playfair">Family History:</strong><br />
                <div className="ml-4 mt-2 text-gray-700">{formData.familyHistory}</div>
              </div>
            )}
            {formData.socialHistory && (
              <div className="bg-white p-3 rounded font-sf-pro shadow-sm">
                <strong className="font-playfair">Social History:</strong><br />
                <div className="ml-4 mt-2 text-gray-700">{formData.socialHistory}</div>
              </div>
            )}
            {formData.reviewOfSystems && (
              <div className="bg-white p-3 rounded font-sf-pro shadow-sm">
                <strong className="font-playfair">Review of Systems:</strong><br />
                <div className="ml-4 mt-2 text-gray-700">{formData.reviewOfSystems}</div>
              </div>
            )}
            {formData.chronicProblems && (
              <div className="bg-white p-3 rounded font-sf-pro shadow-sm">
                <strong className="font-playfair">Chronic Problems:</strong><br />
                <div className="ml-4 mt-2 text-gray-700">{formData.chronicProblems}</div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
            <p className="text-yellow-600 text-sm">Personal history to be documented during consultation</p>
          </div>
        )}
      </div>

      <Separator className="my-4" />

      <div>
        <h2 className="text-base font-semibold text-brand-navy mb-3 bg-brand-soft p-2 rounded-airbnb-sm border border-brand-trust/15">4. Symptoms & Signs</h2>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="grid grid-cols-3 gap-2 text-xs mb-3">
            <div className="bg-blue-100 p-2 rounded font-bold">System</div>
            <div className="bg-blue-100 p-2 rounded font-bold">Findings</div>
            <div className="bg-blue-100 p-2 rounded font-bold">Status</div>
            <div className="bg-white p-2 rounded">General</div>
            <div className="bg-white p-2 rounded">{formData.generalExamination || "Examination pending"}</div>
            <div className="bg-white p-2 rounded">{formData.generalExamination ? "Documented" : "To be examined"}</div>
            <div className="bg-white p-2 rounded">Systemic</div>
            <div className="bg-white p-2 rounded">{formData.systemicExamination || "Examination pending"}</div>
            <div className="bg-white p-2 rounded">{formData.systemicExamination ? "Documented" : "To be examined"}</div>
          </div>
        </div>
        
        {hasVitalSigns ? (
          <div className="mt-3 bg-blue-50 p-3 rounded-lg">
            <strong className="text-blue-700">Vital Signs:</strong>
            <div className="mt-2 flex flex-wrap gap-2">
              {formData.vitalSigns.bp && <span className="bg-white px-2 py-1 rounded text-xs">BP: {formData.vitalSigns.bp} mmHg</span>}
              {formData.vitalSigns.pulse && <span className="bg-white px-2 py-1 rounded text-xs">Pulse: {formData.vitalSigns.pulse} bpm</span>}
              {formData.vitalSigns.temp && <span className="bg-white px-2 py-1 rounded text-xs">Temp: {formData.vitalSigns.temp}°F</span>}
              {formData.vitalSigns.rr && <span className="bg-white px-2 py-1 rounded text-xs">RR: {formData.vitalSigns.rr}/min</span>}
              {formData.vitalSigns.spo2 && <span className="bg-white px-2 py-1 rounded text-xs">SpO2: {formData.vitalSigns.spo2}%</span>}
              {formData.vitalSigns.weight && <span className="bg-white px-2 py-1 rounded text-xs">Weight: {formData.vitalSigns.weight} kg</span>}
              {formData.vitalSigns.height && <span className="bg-white px-2 py-1 rounded text-xs">Height: {formData.vitalSigns.height} cm</span>}
            </div>
          </div>
        ) : (
          <div className="mt-3 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
            <strong className="text-yellow-700">Vital Signs:</strong>
            <div className="mt-2 text-yellow-600 text-xs">To be recorded during examination</div>
          </div>
        )}
      </div>

      <Separator className="my-4" />

      {hasInvestigations && (
        <>
          <div>
            <h2 className="text-base font-semibold text-brand-navy mb-3 bg-brand-soft p-2 rounded-airbnb-sm border border-brand-trust/15">5. Investigations Summary</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-5 gap-2 text-xs">
                <div className="bg-blue-100 p-2 rounded font-bold">Date</div>
                <div className="bg-blue-100 p-2 rounded font-bold">Type</div>
                <div className="bg-blue-100 p-2 rounded font-bold">Modality / Lab</div>
                <div className="bg-blue-100 p-2 rounded font-bold">Key Findings</div>
                <div className="bg-blue-100 p-2 rounded font-bold">Impression</div>
                
                {formData.investigations && (
                  <>
                    <div className="bg-white p-2 rounded">{formatDate(formData.visitDate)}</div>
                    <div className="bg-white p-2 rounded">Ordered</div>
                    <div className="bg-white p-2 rounded">Various</div>
                    <div className="bg-white p-2 rounded">{formData.investigations}</div>
                    <div className="bg-white p-2 rounded">Pending</div>
                  </>
                )}
                
                {formData.labResults && (
                  <>
                    <div className="bg-white p-2 rounded">{formatDate(formData.visitDate)}</div>
                    <div className="bg-white p-2 rounded">Laboratory</div>
                    <div className="bg-white p-2 rounded">Lab Tests</div>
                    <div className="bg-white p-2 rounded">{formData.labResults}</div>
                    <div className="bg-white p-2 rounded">As documented</div>
                  </>
                )}
                
                {formData.imagingResults && (
                  <>
                    <div className="bg-white p-2 rounded">{formatDate(formData.visitDate)}</div>
                    <div className="bg-white p-2 rounded">Radiology</div>
                    <div className="bg-white p-2 rounded">Imaging</div>
                    <div className="bg-white p-2 rounded">{formData.imagingResults}</div>
                    <div className="bg-white p-2 rounded">As documented</div>
                  </>
                )}
              </div>
            </div>
          </div>
          <Separator className="my-4" />
        </>
      )}

      {hasTreatmentPlanning && (
        <>
          <div>
            <h2 className="text-base font-semibold text-brand-navy mb-3 bg-brand-soft p-2 rounded-airbnb-sm border border-brand-trust/15">
              {hasInvestigations ? "6" : "5"}. Treatment Planning
            </h2>
            <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
              {formData.diagnosis && (
                <div className="bg-white p-3 rounded">
                  <strong className="text-blue-700">1. Diagnosis</strong><br />
                  <div className="ml-4 mt-2">
                    <strong>Primary:</strong> {formData.diagnosis}
                    {formData.icdCode && <span className="text-gray-600 ml-2">(ICD-10: {formData.icdCode})</span>}
                  </div>
                </div>
              )}

              {formData.treatment && (
                <div className="bg-white p-3 rounded">
                  <strong className="text-blue-700">2. Treatment Plan</strong><br />
                  <div className="ml-4 mt-2">
                    <strong>Approach:</strong> {formData.treatment}
                  </div>
                </div>
              )}

              {formData.medications && (
                <div className="bg-white p-3 rounded">
                  <strong className="text-blue-700">3. Medications Prescribed</strong><br />
                  <div className="ml-4 mt-2">
                    {formData.medications.split('\n').map((med, index) => (
                      med.trim() && <div key={index} className="text-sm">• {med.trim()}</div>
                    ))}
                  </div>
                </div>
              )}

              {formData.labOrders && (
                <div className="bg-white p-3 rounded">
                  <strong className="text-blue-700">4. Lab Tests Ordered</strong><br />
                  <div className="ml-4 mt-2">
                    {formData.labOrders.split('\n').map((lab, index) => (
                      lab.trim() && <div key={index} className="text-sm">• {lab.trim()}</div>
                    ))}
                  </div>
                </div>
              )}

              {formData.diagnosticOrders && (
                <div className="bg-white p-3 rounded">
                  <strong className="text-blue-700">5. Imaging and Diagnostic Tests Ordered</strong><br />
                  <div className="ml-4 mt-2">
                    {formData.diagnosticOrders.split('\n').map((order, index) => (
                      order.trim() && <div key={index} className="text-sm">• {order.trim()}</div>
                    ))}
                  </div>
                </div>
              )}

              {formData.followUp && (
                <div className="bg-white p-3 rounded">
                  <strong className="text-blue-700">6. Follow-up Recommendations</strong><br />
                  <div className="ml-4 mt-2">
                    <strong>Schedule:</strong> {formData.followUp}
                  </div>
                </div>
              )}

              {formData.advice && (
                <div className="bg-white p-3 rounded">
                  <strong className="text-blue-700">7. Additional Notes & Patient Advice</strong><br />
                  <div className="ml-4 mt-2">{formData.advice}</div>
                </div>
              )}
            </div>
          </div>
          <Separator className="my-4" />
        </>
      )}

      {!hasTreatmentPlanning && (
        <>
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h2 className="text-base font-semibold text-brand-warning mb-2">
              {hasInvestigations ? "6" : "5"}. Treatment Planning
            </h2>
            <p className="text-yellow-600 text-sm">Treatment planning and clinical decisions to be documented during consultation</p>
          </div>
          <Separator className="my-4" />
        </>
      )}

      {formData.icdCode && (
        <div>
          <h2 className="text-base font-semibold text-brand-navy mb-3 bg-brand-soft p-2 rounded-airbnb-sm border border-brand-trust/15">
            {hasInvestigations ? "7" : hasTreatmentPlanning ? "7" : "6"}. Coding & Billing
          </h2>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="bg-blue-100 p-2 rounded font-bold">Condition</div>
              <div className="bg-blue-100 p-2 rounded font-bold">ICD-10-CM</div>
              <div className="bg-blue-100 p-2 rounded font-bold">CPT / Procedure Code</div>
              <div className="bg-white p-2 rounded">{formData.diagnosis}</div>
              <div className="bg-white p-2 rounded font-bold">{formData.icdCode}</div>
              <div className="bg-white p-2 rounded">To be assigned</div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Footer */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-slate-50 border-t-2 border-blue-200 pt-4 mt-6 rounded-xl p-4 shadow-lg">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <img 
              src="/lovable-uploads/26a26947-ddd6-4b8a-8e46-c032ba574a21.png" 
              alt="One TheraCure Logo" 
              className="h-6 object-contain"
            />
          </div>
          <p className="text-sm font-semibold text-brand-trust">
            Powered by One TheraCure | onetheracure.com
          </p>
          <p className="text-xs text-gray-600 font-sf-pro">
            <strong>Prepared by:</strong> One TheraCure AI Engine v2.0 • <strong>Physician Sign-off:</strong> {doctorName}
          </p>
          <p className="text-xs text-gray-500 font-inter">
            <em>Print / Save Time {getCurrentTime()}</em>
          </p>
          <div className="border-t border-gray-200 pt-2 mt-3">
            <p className="text-xs text-gray-500 leading-relaxed font-inter">
              <strong>Disclaimer:</strong> This record is generated by the doctor in consultation with the patient. 
              AI suggestions are not a substitute for clinical judgment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorNotePreview;
