
export type UserRole = 'admin' | 'doctor' | 'nurse';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  permissions: string[];
  createdAt: string;
}

export interface Role {
  id: string;
  name: string;
  permissions: string[];
  description: string;
}

export const defaultPermissions = [
  'read_patients',
  'write_patients',
  'read_prescriptions',
  'write_prescriptions',
  'access_records', 
  'manage_appointments',
  'view_analytics',
  'manage_templates',
  'manage_users',
  'system_settings'
];

export const defaultRoles: Role[] = [
  {
    id: '1',
    name: 'Admin',
    description: 'Full system access',
    permissions: defaultPermissions
  },
  {
    id: '2', 
    name: 'Doctor',
    description: 'Patient care and clinical access',
    permissions: ['read_patients', 'write_patients', 'read_prescriptions', 'write_prescriptions', 'access_records', 'manage_appointments', 'view_analytics', 'manage_templates']
  },
  {
    id: '3',
    name: 'Nurse',
    description: 'Patient support and basic clinical access',
    permissions: ['read_patients', 'write_patients', 'manage_appointments', 'view_analytics']
  }
];

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Dr. Smith',
    email: 'doctor@clinic.com',
    role: 'doctor',
    isActive: true,
    permissions: ['read_patients', 'write_prescriptions', 'access_records'],
    createdAt: '2024-01-15'
  },
  {
    id: '2', 
    name: 'Nurse Johnson',
    email: 'nurse@clinic.com',
    role: 'nurse',
    isActive: true,
    permissions: ['read_patients', 'manage_appointments'],
    createdAt: '2024-01-20'
  }
];
