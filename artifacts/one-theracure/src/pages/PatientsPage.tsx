import PatientList from "@/components/PatientList";

/**
 * /patients route. Wraps the existing PatientList component (which already
 * uses URL-based selection via `usePatientSelection`).
 */
const PatientsPage = () => <PatientList />;

export default PatientsPage;
