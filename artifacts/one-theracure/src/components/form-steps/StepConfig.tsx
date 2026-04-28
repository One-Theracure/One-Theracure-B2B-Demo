
import { 
  User, 
  Stethoscope, 
  FileText, 
  CheckCircle,
  Heart,
  Activity
} from "lucide-react";

export const steps = [
  { id: 0, title: "Patient Info", icon: User, description: "Demographics & visit details" },
  { id: 1, title: "History", icon: FileText, description: "CC, HPI, PMH & ROS" },
  { id: 2, title: "Vital Signs", icon: Heart, description: "Physical measurements & exam" },
  { id: 3, title: "Past Records", icon: Activity, description: "Labs & imaging results" },
  { id: 4, title: "AI Analysis", icon: Stethoscope, description: "Clinical decision support" },
  { id: 5, title: "Assessment", icon: CheckCircle, description: "Diagnosis & treatment plan" }
];
