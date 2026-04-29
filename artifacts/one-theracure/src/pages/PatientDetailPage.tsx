import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { mockPatients } from "@/data/mockPatients";
import PatientCard from "@/components/patients/PatientCard";

/**
 * /patients/:id — read-only patient profile. Uses the existing PatientCard
 * for consistency with the registry view; "View" / "Start Visit" actions
 * route back through the standard flows.
 */
const PatientDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const patient = useMemo(() => mockPatients.find((p) => p.id === id), [id]);

  if (!patient) {
    return (
      <div className="rounded-2xl border border-border/60 bg-card p-8 text-center">
        <p className="text-sm text-muted-foreground">Patient not found.</p>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/patients" className="gap-2"><ArrowLeft className="h-4 w-4" /> Back to Patients</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Button asChild variant="ghost" size="sm" className="gap-2">
        <Link to="/patients"><ArrowLeft className="h-4 w-4" /> All Patients</Link>
      </Button>
      <PatientCard
        patient={patient}
        onViewPatient={() => {}}
        onStartNewVisit={() => window.dispatchEvent(new Event("command:start-visit"))}
      />
    </div>
  );
};

export default PatientDetailPage;
