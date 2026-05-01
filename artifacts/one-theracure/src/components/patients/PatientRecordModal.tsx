
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Phone, 
  Calendar, 
  FileText, 
  Heart, 
  Pill,
  Activity,
  Plus
} from "lucide-react";
import { Patient } from "@/types/patient";
import PrintRxButton from "@/components/documents/PrintRxButton";

interface PatientRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
  onStartNewVisit: (patient: Patient) => void;
}

const PatientRecordModal = ({ isOpen, onClose, patient, onStartNewVisit }: PatientRecordModalProps) => {
  if (!patient) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-500/10 text-green-700 dark:text-green-400";
      case "Follow-up":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400";
      case "Inactive":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <div className="bg-blue-500/10 p-2 rounded-full">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{patient.name}</h2>
              <p className="text-muted-foreground font-normal">MRN: {patient.mrn}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <span className="text-sm text-muted-foreground">Age</span>
                <p className="font-medium">{patient.age} years</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Gender</span>
                <p className="font-medium">{patient.gender}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Blood Group</span>
                <p className="font-medium">{patient.bloodGroup || "Not recorded"}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge className={getStatusColor(patient.status)}>
                  {patient.status}
                </Badge>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center">
              <Phone className="h-5 w-5 mr-2" />
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-muted-foreground">Phone</span>
                <p className="font-medium">{patient.phone}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Email</span>
                <p className="font-medium">{patient.email || "Not provided"}</p>
              </div>
              <div className="md:col-span-2">
                <span className="text-sm text-muted-foreground">Address</span>
                <p className="font-medium">{patient.address || "Not provided"}</p>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              <Heart className="h-5 w-5 mr-2" />
              Medical Information
            </h3>
            
            {patient.allergies && patient.allergies.length > 0 && (
              <div>
                <span className="text-sm text-muted-foreground">Allergies</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {patient.allergies.map((allergy, index) => (
                    <Badge key={index} variant="destructive" className="text-xs">
                      {allergy}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {patient.chronicConditions && patient.chronicConditions.length > 0 && (
              <div>
                <span className="text-sm text-muted-foreground">Chronic Conditions</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {patient.chronicConditions.map((condition, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {condition}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Separator />

          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Recent Visits ({patient.totalVisits} total)
            </h3>
            
            {patient.recentVisits && patient.recentVisits.length > 0 ? (
              <div className="space-y-2">
                {patient.recentVisits.map((visit, index) => (
                  <div key={index} className="bg-muted/50 p-3 rounded-lg">
                    <div className="flex justify-between items-start gap-3">
                      <div className="min-w-0">
                        <p className="font-medium">{visit.diagnosis}</p>
                        <p className="text-sm text-muted-foreground">Dr. {visit.doctor}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-sm text-muted-foreground">
                          {new Date(visit.date).toLocaleDateString()}
                        </span>
                        <PrintRxButton
                          patient={patient}
                          visit={{
                            date: visit.date,
                            diagnosis: visit.diagnosis,
                            doctor: visit.doctor,
                            encounterId: `${patient.id}-${visit.date}`,
                          }}
                          variant="ghost"
                          size="sm"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No recent visits recorded</p>
            )}
          </div>

          <div className="flex space-x-3 pt-4">
            <Button 
              onClick={() => onStartNewVisit(patient)}
              className="flex-1"
            >
              <Plus className="h-4 w-4 mr-2" />
              Start New Visit
            </Button>
            <Button variant="outline" className="flex-1">
              <FileText className="h-4 w-4 mr-2" />
              View Full History
            </Button>
            <Button variant="outline" className="flex-1">
              <Activity className="h-4 w-4 mr-2" />
              Vital Trends
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PatientRecordModal;
