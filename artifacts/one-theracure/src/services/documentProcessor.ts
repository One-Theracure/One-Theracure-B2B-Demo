import { DocumentReference, ExtractedEntity, EvidencePointer, EntityCategory } from '@/types/document';

const STORAGE_KEY = 'theracure_documents';

const ENTITY_PATTERNS: { category: EntityCategory; patterns: RegExp[] }[] = [
  {
    category: 'problem',
    patterns: [
      /\b(diabetes|hypertension|asthma|COPD|heart failure|CHF|atrial fibrillation|pneumonia|bronchitis|migraine|epilepsy|depression|anxiety|hypothyroidism|hyperthyroidism|CKD|chronic kidney disease|hepatitis|cirrhosis|GERD|anemia|obesity|osteoarthritis|rheumatoid arthritis|stroke|TIA|DVT|PE|pulmonary embolism)\b/gi,
    ],
  },
  {
    category: 'medication',
    patterns: [
      /\b(metformin|insulin|lisinopril|amlodipine|atorvastatin|rosuvastatin|metoprolol|aspirin|omeprazole|pantoprazole|levothyroxine|albuterol|montelukast|losartan|hydrochlorothiazide|furosemide|warfarin|apixaban|rivaroxaban|clopidogrel|prednisone|azithromycin|amoxicillin|ciprofloxacin|gabapentin|sertraline|fluoxetine|escitalopram|duloxetine|acetaminophen|ibuprofen|naproxen)\b/gi,
    ],
  },
  {
    category: 'allergy',
    patterns: [
      /\ballerg(?:y|ies|ic)\s+(?:to\s+)?([A-Za-z]+(?:\s+[A-Za-z]+)?)\b/gi,
      /\b(penicillin|sulfa|NSAID|latex|iodine|contrast)\s*allergy\b/gi,
      /\bNKDA\b/g,
    ],
  },
  {
    category: 'lab',
    patterns: [
      /\b(HbA1c|A1c|hemoglobin|hematocrit|WBC|RBC|platelets|creatinine|BUN|GFR|eGFR|sodium|potassium|chloride|bicarbonate|glucose|TSH|T3|T4|ALT|AST|bilirubin|albumin|INR|PT|PTT|troponin|BNP|proBNP|CRP|ESR|ferritin|iron|TIBC|lipid panel|cholesterol|LDL|HDL|triglycerides|urinalysis)\s*[:=]?\s*[\d.]+/gi,
    ],
  },
  {
    category: 'imaging',
    patterns: [
      /\b(X-ray|x-ray|CT scan|CT|MRI|ultrasound|echocardiogram|echo|EKG|ECG|PET scan|mammogram|DEXA|bone density|chest x-ray|CXR|abdominal CT|brain MRI|cardiac catheterization)\b/gi,
    ],
  },
  {
    category: 'procedure',
    patterns: [
      /\b(colonoscopy|endoscopy|biopsy|surgery|appendectomy|cholecystectomy|CABG|PCI|stent|pacemaker|dialysis|intubation|bronchoscopy|arthroscopy|arthroplasty|C-section|cesarean)\b/gi,
    ],
  },
  {
    category: 'vital',
    patterns: [
      /\b(BP|blood pressure|HR|heart rate|pulse|temp|temperature|RR|respiratory rate|SpO2|O2 sat|oxygen saturation|BMI|weight|height)\s*[:=]?\s*[\d./]+/gi,
    ],
  },
  {
    category: 'date',
    patterns: [
      /\b(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\b/g,
      /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b/gi,
    ],
  },
];

export function extractEntities(doc: DocumentReference): ExtractedEntity[] {
  const entities: ExtractedEntity[] = [];
  const seen = new Set<string>();

  for (const { category, patterns } of ENTITY_PATTERNS) {
    for (const pattern of patterns) {
      pattern.lastIndex = 0;
      let match: RegExpExecArray | null;
      while ((match = pattern.exec(doc.rawText)) !== null) {
        const text = match[0].trim();
        const key = `${category}:${text.toLowerCase()}`;
        if (seen.has(key)) continue;
        seen.add(key);

        entities.push({
          id: `ent-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          documentId: doc.id,
          category,
          text,
          normalizedText: text.charAt(0).toUpperCase() + text.slice(1),
          confidence: 0.7 + Math.random() * 0.25,
          span: { start: match.index, end: match.index + text.length },
        });
      }
    }
  }

  return entities;
}

export function createEvidencePointers(
  entities: ExtractedEntity[],
  doc: DocumentReference
): EvidencePointer[] {
  return entities.map((entity) => {
    const start = Math.max(0, entity.span.start - 40);
    const end = Math.min(doc.rawText.length, entity.span.end + 40);
    const excerpt = (start > 0 ? '...' : '') + doc.rawText.slice(start, end).trim() + (end < doc.rawText.length ? '...' : '');

    return {
      id: `ep-${entity.id}`,
      entityId: entity.id,
      documentId: doc.id,
      documentTitle: doc.title,
      excerpt,
      sourceType: doc.sourceType,
    };
  });
}

export function saveDocument(doc: DocumentReference): void {
  const existing = getDocuments();
  existing.push(doc);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
}

export function getDocuments(): DocumentReference[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getDocumentsByPatient(patientId: string): DocumentReference[] {
  return getDocuments().filter((d) => d.patientId === patientId);
}

export function createDocumentReference(
  patientId: string,
  title: string,
  rawText: string,
  sourceType: DocumentReference['sourceType'] = 'paste'
): DocumentReference {
  return {
    id: `doc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    patientId,
    title,
    sourceType,
    mimeType: 'text/plain',
    rawText,
    uploadedAt: new Date().toISOString(),
    uploadedBy: 'current-user',
  };
}
