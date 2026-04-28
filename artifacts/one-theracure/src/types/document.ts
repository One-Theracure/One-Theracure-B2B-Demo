export interface DocumentReference {
  id: string;
  patientId: string;
  title: string;
  sourceType: 'paste' | 'upload' | 'ehr-import';
  mimeType: string;
  rawText: string;
  uploadedAt: string;
  uploadedBy: string;
}

export type EntityCategory = 'problem' | 'medication' | 'allergy' | 'lab' | 'imaging' | 'procedure' | 'date' | 'vital';

export interface ExtractedEntity {
  id: string;
  documentId: string;
  category: EntityCategory;
  text: string;
  normalizedText: string;
  confidence: number;
  span: { start: number; end: number };
}

export interface EvidencePointer {
  id: string;
  entityId: string;
  documentId: string;
  documentTitle: string;
  excerpt: string;
  sourceType: DocumentReference['sourceType'];
}
