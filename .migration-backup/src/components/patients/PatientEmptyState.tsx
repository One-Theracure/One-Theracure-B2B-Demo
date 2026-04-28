
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Plus } from "lucide-react";

interface PatientEmptyStateProps {
  searchTerm: string;
  onAddPatient: () => void;
}

const PatientEmptyState = ({ searchTerm, onAddPatient }: PatientEmptyStateProps) => {
  return (
    <Card>
      <CardContent className="text-center py-12">
        <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">No patients found</h3>
        <p className="text-muted-foreground mb-4">
          {searchTerm ? "No patients match your search criteria." : "Start by adding your first patient."}
        </p>
        <Button onClick={onAddPatient}>
          <Plus className="h-4 w-4 mr-2" />
          Add New Patient
        </Button>
      </CardContent>
    </Card>
  );
};

export default PatientEmptyState;
