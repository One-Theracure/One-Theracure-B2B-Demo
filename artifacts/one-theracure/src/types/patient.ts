
export interface Patient {
  id: string;
  tenantId?: string;
  clinicId?: string;
  name: string;
  age: number;
  gender: string;
  mrn: string;
  phone: string;
  lastVisit: string;
  totalVisits: number;
  specialty: string;
  status: string;
  email?: string;
  address?: string;
  emergencyContact?: string;
  bloodGroup?: string;
  allergies?: string[];
  chronicConditions?: string[];
  recentVisits?: {
    date: string;
    diagnosis: string;
    doctor: string;
  }[];
}
