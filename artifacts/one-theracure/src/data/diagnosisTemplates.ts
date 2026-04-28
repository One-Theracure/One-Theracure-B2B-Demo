
import { Medication } from "@/types/visitForm";

interface DiagnosisTemplate {
  icdCode: string;
  treatment: string;
  medications: Medication[];
  labOrders: string;
  diagnosticOrders: string;
  followUp: string;
  advice: string;
}

export const diagnosisTemplates: Record<string, DiagnosisTemplate> = {
  "Acute Myocardial Infarction": {
    icdCode: "I21.9",
    treatment: "Dual antiplatelet therapy, anticoagulation, beta-blocker therapy, statin therapy. Monitor for complications and consider PCI if indicated.",
    medications: [
      {
        id: "1",
        name: "Aspirin",
        dosage: "81mg",
        frequency: "Once daily",
        duration: "Indefinitely",
        instructions: "Take with food to reduce GI upset",
        route: "Oral"
      },
      {
        id: "2",
        name: "Clopidogrel",
        dosage: "75mg",
        frequency: "Once daily",
        duration: "12 months",
        instructions: "Take at same time daily",
        route: "Oral"
      },
      {
        id: "3",
        name: "Metoprolol",
        dosage: "25mg",
        frequency: "Twice daily",
        duration: "Ongoing",
        instructions: "Monitor heart rate and blood pressure",
        route: "Oral"
      }
    ],
    labOrders: "Cardiac biomarkers (Troponin I/T), Complete metabolic panel, CBC with differential, PT/PTT/INR, Lipid profile",
    diagnosticOrders: "12-lead ECG, Chest X-ray, Echocardiogram, Coronary angiography if indicated",
    followUp: "Cardiology follow-up within 1-2 weeks",
    advice: "Avoid strenuous activity, take medications as prescribed, follow up with cardiology, seek immediate care for worsening chest pain or shortness of breath"
  },
  "Hypertension": {
    icdCode: "I10",
    treatment: "Lifestyle modifications including diet, exercise, weight management. Antihypertensive therapy as needed.",
    medications: [
      {
        id: "1",
        name: "Lisinopril",
        dosage: "10mg",
        frequency: "Once daily",
        duration: "Ongoing",
        instructions: "Take at same time daily, monitor for dry cough",
        route: "Oral"
      }
    ],
    labOrders: "Complete metabolic panel, Urinalysis, Lipid profile",
    diagnosticOrders: "ECG, Chest X-ray if indicated",
    followUp: "Follow-up in 2-4 weeks to assess response to treatment",
    advice: "Monitor blood pressure at home, follow DASH diet, regular exercise, limit sodium intake, maintain healthy weight"
  },
  "Type 2 Diabetes Mellitus": {
    icdCode: "E11.9",
    treatment: "Lifestyle modifications, glucose monitoring, glycemic control with appropriate medications.",
    medications: [
      {
        id: "1",
        name: "Metformin",
        dosage: "500mg",
        frequency: "Twice daily",
        duration: "Ongoing",
        instructions: "Take with meals to reduce GI upset",
        route: "Oral"
      }
    ],
    labOrders: "HbA1c, Fasting glucose, Complete metabolic panel, Lipid profile, Microalbumin",
    diagnosticOrders: "Fundoscopy, Foot examination",
    followUp: "Follow-up in 3 months for HbA1c monitoring",
    advice: "Monitor blood glucose regularly, follow diabetic diet, regular exercise, foot care, medication compliance"
  },
  "Pneumonia": {
    icdCode: "J18.9",
    treatment: "Antibiotic therapy based on severity and risk factors. Supportive care including hydration and rest.",
    medications: [
      {
        id: "1",
        name: "Amoxicillin-Clavulanate",
        dosage: "875mg",
        frequency: "Twice daily",
        duration: "7-10 days",
        instructions: "Take with food, complete full course",
        route: "Oral"
      }
    ],
    labOrders: "CBC with differential, Blood cultures if indicated, Sputum culture",
    diagnosticOrders: "Chest X-ray, CT chest if complications suspected",
    followUp: "Follow-up in 3-5 days, sooner if worsening",
    advice: "Complete antibiotic course, rest, adequate hydration, return if symptoms worsen or fever persists"
  },
  "Acute Bronchitis": {
    icdCode: "J20.9",
    treatment: "Supportive care, bronchodilators if indicated. Antibiotics usually not required unless bacterial superinfection suspected.",
    medications: [
      {
        id: "1",
        name: "Albuterol Inhaler",
        dosage: "2 puffs",
        frequency: "Every 4-6 hours as needed",
        duration: "Until symptoms resolve",
        instructions: "Shake before use, rinse mouth after use",
        route: "Inhalation"
      }
    ],
    labOrders: "CBC if systemic symptoms present",
    diagnosticOrders: "Chest X-ray if pneumonia suspected",
    followUp: "Follow-up if symptoms persist beyond 2-3 weeks",
    advice: "Rest, adequate hydration, honey for cough, avoid smoking and irritants"
  }
};
