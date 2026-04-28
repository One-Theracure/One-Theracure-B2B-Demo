
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Patient } from "@/types/patient";
import { mockPatients } from "@/data/mockPatients";
import { usePatientSelection } from "@/hooks/usePatientSelection";
import PatientSearchBar from "./patients/PatientSearchBar";
import PatientCard from "./patients/PatientCard";
import PatientEmptyState from "./patients/PatientEmptyState";
import PatientRecordModal from "./patients/PatientRecordModal";
import PatientRegistrationModal from "./patients/registration/PatientRegistrationModal";

const PatientList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddPatientModalOpen, setIsAddPatientModalOpen] = useState(false);
  const [editPatient, setEditPatient] = useState<Patient | null>(null);
  const [patients, setPatients] = useState<Patient[]>(mockPatients);
  const { setSelectedPatient: setSelectedPatientId } = usePatientSelection();
  const { toast } = useToast();

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.mrn.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone.includes(searchTerm)
  );

  const handleViewPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsModalOpen(true);
  };

  const handleEditPatient = (patient: Patient) => {
    setEditPatient(patient);
    setIsAddPatientModalOpen(true);
  };

  const handleStartNewVisit = (patient: Patient) => {
    setIsModalOpen(false);
    // URL state instead of sessionStorage: lets a clinician deep-link a
    // visit, survives refresh, and avoids two-tab smearing on shared kiosks.
    // The patient's full profile is hydrated from `mockPatients` (and later
    // from a server lookup) inside `useVisitForm` — nothing PHI-shaped lives
    // in the URL beyond the opaque id.
    setSelectedPatientId(patient.id);
    window.dispatchEvent(new CustomEvent("command:navigate", { detail: "cds-scribe" }));
    toast({
      title: "Starting New Visit",
      description: `New visit form opened for ${patient.name} with pre-filled details`,
    });
  };

  const handleAddPatient = (newPatient: Patient) => {
    if (editPatient) {
      // Update existing patient
      setPatients(prev => prev.map(p => p.id === editPatient.id ? newPatient : p));
      toast({ title: "Patient Updated", description: `${newPatient.name} has been updated` });
    } else {
      setPatients(prev => [newPatient, ...prev]);
    }
  };

  const handleCloseRegistration = () => {
    setIsAddPatientModalOpen(false);
    setEditPatient(null);
  };

  return (
    <div className="space-y-6">
      <PatientSearchBar 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onAddPatient={() => { setEditPatient(null); setIsAddPatientModalOpen(true); }}
      />

      {filteredPatients.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPatients.map((patient) => (
            <PatientCard
              key={patient.id}
              patient={patient}
              onViewPatient={handleViewPatient}
              onStartNewVisit={handleStartNewVisit}
              onEditPatient={handleEditPatient}
            />
          ))}
        </div>
      ) : (
        <PatientEmptyState 
          searchTerm={searchTerm} 
          onAddPatient={() => { setEditPatient(null); setIsAddPatientModalOpen(true); }}
        />
      )}

      <PatientRecordModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        patient={selectedPatient}
        onStartNewVisit={handleStartNewVisit}
      />

      <PatientRegistrationModal
        isOpen={isAddPatientModalOpen}
        onClose={handleCloseRegistration}
        onPatientAdded={handleAddPatient}
        editPatient={editPatient}
      />
    </div>
  );
};

export default PatientList;
