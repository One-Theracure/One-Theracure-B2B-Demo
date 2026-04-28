
import React, { createContext, useContext, useState } from 'react';

interface LanguageContextType {
  currentLanguage: string;
  setLanguage: (language: string) => void;
  t: (key: string) => string;
  availableLanguages: { code: string; name: string; flag: string }[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Translation dictionary
const translations = {
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.patients': 'Patients',
    'nav.newVisit': 'New Visit',
    'nav.appointments': 'Appointments',
    'nav.portal': 'Patient Portal',
    'nav.signature': 'Digital Signature',
    'nav.analytics': 'Analytics',
    'nav.settings': 'Settings',
    
    // Common
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.search': 'Search',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.confirm': 'Confirm',
    'common.yes': 'Yes',
    'common.no': 'No',
    
    // Patient Form
    'patient.name': 'Patient Name',
    'patient.age': 'Age',
    'patient.gender': 'Gender',
    'patient.phone': 'Phone Number',
    'patient.email': 'Email',
    'patient.address': 'Address',
    'patient.diagnosis': 'Diagnosis',
    'patient.treatment': 'Treatment',
    
    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.overview': 'Overview',
    'dashboard.totalPatients': 'Total Patients',
    'dashboard.appointments': 'Appointments Today',
    'dashboard.prescriptions': 'Prescriptions',
    'dashboard.revenue': 'Revenue',
    
    // Medical
    'medical.chiefComplaint': 'Chief Complaint',
    'medical.history': 'Medical History',
    'medical.vitals': 'Vital Signs',
    'medical.bloodPressure': 'Blood Pressure',
    'medical.pulse': 'Pulse',
    'medical.temperature': 'Temperature',
    'medical.weight': 'Weight',
    'medical.height': 'Height',
    'medical.medication': 'Medication',
    'medical.dosage': 'Dosage',
    'medical.frequency': 'Frequency',
    'medical.duration': 'Duration'
  },
  hi: {
    // Navigation
    'nav.dashboard': 'डैशबोर्ड',
    'nav.patients': 'मरीज़',
    'nav.newVisit': 'नई विज़िट',
    'nav.appointments': 'अपॉइंटमेंट',
    'nav.portal': 'मरीज़ पोर्टल',
    'nav.signature': 'डिजिटल हस्ताक्षर',
    'nav.analytics': 'एनालिटिक्स',
    'nav.settings': 'सेटिंग्स',
    
    // Common
    'common.save': 'सेव करें',
    'common.cancel': 'रद्द करें',
    'common.edit': 'संपादित करें',
    'common.delete': 'हटाएं',
    'common.search': 'खोजें',
    'common.loading': 'लोड हो रहा है...',
    'common.error': 'त्रुटि',
    'common.success': 'सफलता',
    'common.confirm': 'पुष्टि करें',
    'common.yes': 'हाँ',
    'common.no': 'नहीं',
    
    // Patient Form
    'patient.name': 'मरीज़ का नाम',
    'patient.age': 'उम्र',
    'patient.gender': 'लिंग',
    'patient.phone': 'फोन नंबर',
    'patient.email': 'ईमेल',
    'patient.address': 'पता',
    'patient.diagnosis': 'निदान',
    'patient.treatment': 'उपचार',
    
    // Dashboard
    'dashboard.title': 'डैशबोर्ड',
    'dashboard.overview': 'अवलोकन',
    'dashboard.totalPatients': 'कुल मरीज़',
    'dashboard.appointments': 'आज के अपॉइंटমेंट',
    'dashboard.prescriptions': 'प्रिस्क्रिप्शन',
    'dashboard.revenue': 'आय',
    
    // Medical
    'medical.chiefComplaint': 'मुख्य शिकायत',
    'medical.history': 'चिकित्सा इतिहास',
    'medical.vitals': 'वाइटल साइन्स',
    'medical.bloodPressure': 'रक्तचाप',
    'medical.pulse': 'नाड़ी',
    'medical.temperature': 'तापमान',
    'medical.weight': 'वजन',
    'medical.height': 'ऊंचाई',
    'medical.medication': 'दवा',
    'medical.dosage': 'खुराक',
    'medical.frequency': 'आवृत्ति',
    'medical.duration': 'अवधि'
  },
  es: {
    // Navigation
    'nav.dashboard': 'Panel de Control',
    'nav.patients': 'Pacientes',
    'nav.newVisit': 'Nueva Visita',
    'nav.appointments': 'Citas',
    'nav.portal': 'Portal del Paciente',
    'nav.signature': 'Firma Digital',
    'nav.analytics': 'Análisis',
    'nav.settings': 'Configuración',
    
    // Common
    'common.save': 'Guardar',
    'common.cancel': 'Cancelar',
    'common.edit': 'Editar',
    'common.delete': 'Eliminar',
    'common.search': 'Buscar',
    'common.loading': 'Cargando...',
    'common.error': 'Error',
    'common.success': 'Éxito',
    'common.confirm': 'Confirmar',
    'common.yes': 'Sí',
    'common.no': 'No',
    
    // Patient Form
    'patient.name': 'Nombre del Paciente',
    'patient.age': 'Edad',
    'patient.gender': 'Género',
    'patient.phone': 'Número de Teléfono',
    'patient.email': 'Correo Electrónico',
    'patient.address': 'Dirección',
    'patient.diagnosis': 'Diagnóstico',
    'patient.treatment': 'Tratamiento',
    
    // Dashboard
    'dashboard.title': 'Panel de Control',
    'dashboard.overview': 'Resumen',
    'dashboard.totalPatients': 'Total de Pacientes',
    'dashboard.appointments': 'Citas de Hoy',
    'dashboard.prescriptions': 'Recetas',
    'dashboard.revenue': 'Ingresos',
    
    // Medical
    'medical.chiefComplaint': 'Queja Principal',
    'medical.history': 'Historia Médica',
    'medical.vitals': 'Signos Vitales',
    'medical.bloodPressure': 'Presión Arterial',
    'medical.pulse': 'Pulso',
    'medical.temperature': 'Temperatura',
    'medical.weight': 'Peso',
    'medical.height': 'Altura',
    'medical.medication': 'Medicamento',
    'medical.dosage': 'Dosis',
    'medical.frequency': 'Frecuencia',
    'medical.duration': 'Duración'
  }
};

const availableLanguages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
  { code: 'es', name: 'Español', flag: '🇪🇸' }
];

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('en');

  const setLanguage = (language: string) => {
    if (availableLanguages.find(lang => lang.code === language)) {
      setCurrentLanguage(language);
      localStorage.setItem('preferredLanguage', language);
    }
  };

  const t = (key: string): string => {
    const languageTranslations = translations[currentLanguage as keyof typeof translations];
    return languageTranslations?.[key as keyof typeof languageTranslations] || key;
  };

  // Load saved language preference on mount
  React.useEffect(() => {
    const savedLanguage = localStorage.getItem('preferredLanguage');
    if (savedLanguage && availableLanguages.find(lang => lang.code === savedLanguage)) {
      setCurrentLanguage(savedLanguage);
    }
  }, []);

  const value: LanguageContextType = {
    currentLanguage,
    setLanguage,
    t,
    availableLanguages
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
