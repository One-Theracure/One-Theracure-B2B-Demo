
import PatientList from "@/components/PatientList";

const PatientsContent = () => {
  return (
    <div className="space-y-6">
      <div className="bg-card/90 backdrop-blur-xl rounded-2xl border border-border shadow-xl p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold font-playfair bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-2">Patient Management</h2>
        <p className="text-muted-foreground font-inter font-medium text-sm sm:text-base">View and manage patient records and schedule appointments</p>
      </div>
      
      <PatientList />
    </div>
  );
};

export default PatientsContent;
