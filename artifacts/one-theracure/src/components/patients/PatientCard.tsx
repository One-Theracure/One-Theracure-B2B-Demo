
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MoreVertical, 
  User, 
  Calendar,
  Phone,
  FileText,
  Edit,
  Eye,
  Activity
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Patient } from "@/types/patient";

interface PatientCardProps {
  patient: Patient;
  onViewPatient: (patient: Patient) => void;
  onStartNewVisit: (patient: Patient) => void;
  onEditPatient?: (patient: Patient) => void;
}

const PatientCard = ({ patient, onViewPatient, onStartNewVisit, onEditPatient }: PatientCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20";
      case "Follow-up":
        return "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/20";
      case "Inactive":
        return "bg-muted text-muted-foreground border-border";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-3">
            <div className="bg-primary/10 p-2 rounded-full">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold sm:text-lg">{patient.name}</CardTitle>
              <CardDescription className="text-sm">
                {patient.age} years • {patient.gender}
              </CardDescription>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onViewPatient(patient)}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEditPatient?.(patient)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Patient
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStartNewVisit(patient)}>
                <FileText className="h-4 w-4 mr-2" />
                New Visit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Calendar className="h-4 w-4 mr-2" />
                Visit History
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="records">Records</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-3 mt-4">
            <div className="grid grid-cols-2 gap-2 text-sm font-medium">
              <div>
                <span className="text-muted-foreground">MRN:</span>
                <p className="font-medium text-foreground">{patient.mrn}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Specialty:</span>
                <p className="font-medium text-foreground">{patient.specialty}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span>{patient.phone}</span>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Last visit: {new Date(patient.lastVisit).toLocaleDateString()}</span>
            </div>
            
            <div className="flex justify-between items-center pt-2">
              <Badge className={getStatusColor(patient.status)} variant="outline">
                {patient.status}
              </Badge>
              <span className="text-sm font-medium text-muted-foreground">
                {patient.totalVisits} visits
              </span>
            </div>
          </TabsContent>
          
          <TabsContent value="records" className="space-y-3 mt-4">
            <div className="space-y-2">
              {patient.recentVisits && patient.recentVisits.length > 0 ? (
                patient.recentVisits.slice(0, 2).map((visit, index) => (
                  <div key={index} className="bg-muted/50 p-2 rounded text-sm">
                    <div className="flex items-center space-x-1 mb-1">
                      <Activity className="h-4 w-4 text-primary" />
                      <span className="font-medium text-foreground">{visit.diagnosis}</span>
                    </div>
                    <p className="text-muted-foreground">{new Date(visit.date).toLocaleDateString()}</p>
                    <p className="text-muted-foreground/70">{visit.doctor}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No recent visits</p>
              )}
              
              {patient.chronicConditions && patient.chronicConditions.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium text-foreground mb-1">Chronic Conditions:</p>
                  <div className="flex flex-wrap gap-1">
                    {patient.chronicConditions.map((condition, index) => (
                      <Badge key={index} variant="secondary" className="text-sm">
                        {condition}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex space-x-2 pt-2">
          <Button 
            className="flex-1 h-9 text-sm"
            onClick={() => onStartNewVisit(patient)}
          >
            <FileText className="h-4 w-4 mr-1" />
            New Visit
          </Button>
          <Button 
            className="h-9 text-sm"
            variant="outline"
            onClick={() => onViewPatient(patient)}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PatientCard;
