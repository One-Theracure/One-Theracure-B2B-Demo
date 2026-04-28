import { Patient } from '@/types/patient';
import {
  FHIRPatient,
  FHIREncounter,
  FHIRCondition,
  FHIRDocumentReference,
} from '@/types/fhir';

export function mapPatientToFHIR(patient: Patient): FHIRPatient {
  const nameParts = patient.name.split(' ');
  const family = nameParts.pop() || '';
  const given = nameParts;

  return {
    resourceType: 'Patient',
    id: patient.id,
    identifier: [
      {
        system: 'urn:onetheracure:mrn',
        value: patient.mrn,
      },
    ],
    active: patient.status === 'Active',
    name: [
      {
        use: 'official',
        family,
        given,
        text: patient.name,
      },
    ],
    gender: mapGender(patient.gender),
    telecom: [
      {
        system: 'phone',
        value: patient.phone,
        use: 'mobile',
      },
      ...(patient.email
        ? [{ system: 'email' as const, value: patient.email, use: 'home' as const }]
        : []),
    ],
    address: patient.address
      ? [{ use: 'home', text: patient.address }]
      : [],
  };
}

export function mapEncounterToFHIR(
  encounterId: string,
  patientId: string,
  status: string,
  visitType: string,
  startDate: string,
): FHIREncounter {
  return {
    resourceType: 'Encounter',
    id: encounterId,
    status: mapEncounterStatus(status),
    class: {
      system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
      code: 'AMB',
      display: 'ambulatory',
    },
    type: [
      {
        coding: [
          {
            system: 'http://snomed.info/sct',
            display: visitType,
          },
        ],
        text: visitType,
      },
    ],
    subject: {
      reference: `Patient/${patientId}`,
    },
    period: {
      start: startDate,
    },
  };
}

export function mapConditionToFHIR(
  conditionId: string,
  patientId: string,
  conditionName: string,
  status: 'active' | 'resolved' | 'inactive' = 'active',
): FHIRCondition {
  return {
    resourceType: 'Condition',
    id: conditionId,
    clinicalStatus: {
      coding: [
        {
          system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
          code: status,
        },
      ],
    },
    code: {
      text: conditionName,
    },
    subject: {
      reference: `Patient/${patientId}`,
    },
  };
}

export function mapDocumentToFHIR(
  docId: string,
  patientId: string,
  title: string,
  contentType: string,
  createdAt: string,
): FHIRDocumentReference {
  return {
    resourceType: 'DocumentReference',
    id: docId,
    status: 'current',
    type: {
      text: title,
    },
    subject: {
      reference: `Patient/${patientId}`,
    },
    date: createdAt,
    content: [
      {
        attachment: {
          contentType,
          title,
        },
      },
    ],
  };
}

function mapGender(gender: string): 'male' | 'female' | 'other' | 'unknown' {
  const g = gender.toLowerCase();
  if (g === 'male' || g === 'm') return 'male';
  if (g === 'female' || g === 'f') return 'female';
  if (g === 'other') return 'other';
  return 'unknown';
}

type EncounterStatus = 'arrived' | 'cancelled' | 'entered-in-error' | 'finished' | 'in-progress' | 'onleave' | 'planned' | 'triaged' | 'unknown';

function mapEncounterStatus(status: string): EncounterStatus {
  const mapping: Record<string, EncounterStatus> = {
    draft: 'planned',
    active: 'in-progress',
    review: 'in-progress',
    completed: 'finished',
    signed: 'finished',
    amended: 'finished',
  };
  return mapping[status] || 'unknown';
}
