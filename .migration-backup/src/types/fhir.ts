export interface FHIRResource {
  resourceType: string;
  id?: string;
  meta?: {
    versionId?: string;
    lastUpdated?: string;
    profile?: string[];
  };
}

export interface FHIRHumanName {
  use?: 'official' | 'usual' | 'temp' | 'nickname' | 'anonymous' | 'old' | 'maiden';
  family?: string;
  given?: string[];
  prefix?: string[];
  suffix?: string[];
  text?: string;
}

export interface FHIRContactPoint {
  system?: 'phone' | 'fax' | 'email' | 'pager' | 'url' | 'sms' | 'other';
  value?: string;
  use?: 'home' | 'work' | 'temp' | 'old' | 'mobile';
}

export interface FHIRAddress {
  use?: 'home' | 'work' | 'temp' | 'old' | 'billing';
  type?: 'postal' | 'physical' | 'both';
  text?: string;
  line?: string[];
  city?: string;
  district?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface FHIRCodeableConcept {
  coding?: {
    system?: string;
    code?: string;
    display?: string;
  }[];
  text?: string;
}

export interface FHIRReference {
  reference?: string;
  type?: string;
  display?: string;
}

export interface FHIRPeriod {
  start?: string;
  end?: string;
}

export interface FHIRQuantity {
  value?: number;
  unit?: string;
  system?: string;
  code?: string;
}

export interface FHIRPatient extends FHIRResource {
  resourceType: 'Patient';
  identifier?: { system?: string; value?: string }[];
  active?: boolean;
  name?: FHIRHumanName[];
  telecom?: FHIRContactPoint[];
  gender?: 'male' | 'female' | 'other' | 'unknown';
  birthDate?: string;
  address?: FHIRAddress[];
  maritalStatus?: FHIRCodeableConcept;
  contact?: {
    relationship?: FHIRCodeableConcept[];
    name?: FHIRHumanName;
    telecom?: FHIRContactPoint[];
  }[];
}

export interface FHIREncounter extends FHIRResource {
  resourceType: 'Encounter';
  identifier?: { system?: string; value?: string }[];
  status: 'planned' | 'arrived' | 'triaged' | 'in-progress' | 'onleave' | 'finished' | 'cancelled' | 'entered-in-error' | 'unknown';
  class?: {
    system?: string;
    code?: string;
    display?: string;
  };
  type?: FHIRCodeableConcept[];
  subject?: FHIRReference;
  participant?: {
    type?: FHIRCodeableConcept[];
    individual?: FHIRReference;
    period?: FHIRPeriod;
  }[];
  period?: FHIRPeriod;
  reasonCode?: FHIRCodeableConcept[];
  diagnosis?: {
    condition?: FHIRReference;
    use?: FHIRCodeableConcept;
    rank?: number;
  }[];
}

export interface FHIRObservation extends FHIRResource {
  resourceType: 'Observation';
  identifier?: { system?: string; value?: string }[];
  status: 'registered' | 'preliminary' | 'final' | 'amended' | 'corrected' | 'cancelled' | 'entered-in-error' | 'unknown';
  category?: FHIRCodeableConcept[];
  code: FHIRCodeableConcept;
  subject?: FHIRReference;
  encounter?: FHIRReference;
  effectiveDateTime?: string;
  issued?: string;
  valueQuantity?: FHIRQuantity;
  valueString?: string;
  valueCodeableConcept?: FHIRCodeableConcept;
  interpretation?: FHIRCodeableConcept[];
  referenceRange?: {
    low?: FHIRQuantity;
    high?: FHIRQuantity;
    text?: string;
  }[];
  component?: {
    code: FHIRCodeableConcept;
    valueQuantity?: FHIRQuantity;
    valueString?: string;
  }[];
}

export interface FHIRCondition extends FHIRResource {
  resourceType: 'Condition';
  identifier?: { system?: string; value?: string }[];
  clinicalStatus?: FHIRCodeableConcept;
  verificationStatus?: FHIRCodeableConcept;
  category?: FHIRCodeableConcept[];
  severity?: FHIRCodeableConcept;
  code?: FHIRCodeableConcept;
  subject: FHIRReference;
  encounter?: FHIRReference;
  onsetDateTime?: string;
  abatementDateTime?: string;
  recordedDate?: string;
  note?: { text: string }[];
}

export interface FHIRMedicationRequest extends FHIRResource {
  resourceType: 'MedicationRequest';
  identifier?: { system?: string; value?: string }[];
  status: 'active' | 'on-hold' | 'cancelled' | 'completed' | 'entered-in-error' | 'stopped' | 'draft' | 'unknown';
  intent: 'proposal' | 'plan' | 'order' | 'original-order' | 'reflex-order' | 'filler-order' | 'instance-order' | 'option';
  medicationCodeableConcept?: FHIRCodeableConcept;
  subject: FHIRReference;
  encounter?: FHIRReference;
  authoredOn?: string;
  requester?: FHIRReference;
  dosageInstruction?: {
    text?: string;
    timing?: {
      repeat?: {
        frequency?: number;
        period?: number;
        periodUnit?: string;
      };
    };
    route?: FHIRCodeableConcept;
    doseAndRate?: {
      doseQuantity?: FHIRQuantity;
    }[];
  }[];
  dispenseRequest?: {
    numberOfRepeatsAllowed?: number;
    quantity?: FHIRQuantity;
    expectedSupplyDuration?: {
      value?: number;
      unit?: string;
    };
  };
}

export interface FHIRDocumentReference extends FHIRResource {
  resourceType: 'DocumentReference';
  identifier?: { system?: string; value?: string }[];
  status: 'current' | 'superseded' | 'entered-in-error';
  type?: FHIRCodeableConcept;
  category?: FHIRCodeableConcept[];
  subject?: FHIRReference;
  date?: string;
  author?: FHIRReference[];
  description?: string;
  content: {
    attachment: {
      contentType?: string;
      language?: string;
      data?: string;
      url?: string;
      size?: number;
      hash?: string;
      title?: string;
      creation?: string;
    };
    format?: {
      system?: string;
      code?: string;
      display?: string;
    };
  }[];
  context?: {
    encounter?: FHIRReference[];
    period?: FHIRPeriod;
  };
}

export interface FHIRBundle extends FHIRResource {
  resourceType: 'Bundle';
  type: 'document' | 'message' | 'transaction' | 'transaction-response' | 'batch' | 'batch-response' | 'history' | 'searchset' | 'collection';
  total?: number;
  entry?: {
    fullUrl?: string;
    resource?: FHIRResource;
  }[];
}
