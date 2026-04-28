import { useCallback } from "react";
import { createWorker } from "tesseract.js";
import { pipeline } from "@huggingface/transformers";
import { logger } from '@/lib/logger';

interface ProcessingStatus {
  classification?: {
    type: 'referral' | 'prior_auth' | 'denial' | 'insurance' | 'lab' | 'junk';
    confidence: number;
  };
  extracted?: {
    patientName?: string;
    dateOfBirth?: string;
    mrn?: string;
    insuranceId?: string;
    date?: string;
  };
  rawText?: string;
}

type StatusCallback = (
  status: 'uploading' | 'scanning' | 'classifying' | 'extracting' | 'completed' | 'error',
  progress: number,
  data?: ProcessingStatus
) => void;

export const useDocumentProcessor = () => {
  const extractTextFromImage = useCallback(async (file: File): Promise<string> => {
    const worker = await createWorker('eng');
    try {
      const { data: { text } } = await worker.recognize(file);
      return text;
    } finally {
      await worker.terminate();
    }
  }, []);

  const extractTextFromPDF = useCallback(async (file: File): Promise<string> => {
    // Simplified PDF text extraction
    // In a real implementation, you'd use pdf-parse or similar
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        // This is a placeholder - real PDF parsing would be more complex
        resolve("PDF text extraction not fully implemented in this demo");
      };
      reader.readAsText(file);
    });
  }, []);

  const classifyDocument = useCallback(async (text: string): Promise<ProcessingStatus['classification']> => {
    try {
      // Simple keyword-based classification
      const lowerText = text.toLowerCase();
      
      const classifications = [
        { type: 'referral' as const, keywords: ['referral', 'refer', 'consultation', 'specialist'], weight: 0 },
        { type: 'prior_auth' as const, keywords: ['prior authorization', 'pre-auth', 'authorization', 'approval'], weight: 0 },
        { type: 'denial' as const, keywords: ['denial', 'denied', 'reject', 'not covered', 'claim denied'], weight: 0 },
        { type: 'insurance' as const, keywords: ['insurance', 'coverage', 'policy', 'benefit', 'claim'], weight: 0 },
        { type: 'lab' as const, keywords: ['lab', 'laboratory', 'test results', 'pathology', 'blood work'], weight: 0 },
        { type: 'junk' as const, keywords: ['advertisement', 'marketing', 'unsubscribe', 'promotion'], weight: 0 }
      ];

      // Score each classification
      for (const classification of classifications) {
        for (const keyword of classification.keywords) {
          if (lowerText.includes(keyword)) {
            classification.weight += 1;
          }
        }
      }

      // Find the best match
      const bestMatch = classifications.reduce((best, current) => 
        current.weight > best.weight ? current : best
      );

      const confidence = Math.min(bestMatch.weight * 0.3, 0.95);
      
      return {
        type: bestMatch.type,
        confidence: confidence > 0 ? confidence : 0.1
      };
    } catch (error) {
      logger.error("Classification failed:", error);
      return {
        type: 'junk',
        confidence: 0.1
      };
    }
  }, []);

  const extractEntities = useCallback(async (text: string): Promise<ProcessingStatus['extracted']> => {
    const extracted: ProcessingStatus['extracted'] = {};

    // Simple regex-based entity extraction
    // In production, use more sophisticated NER models

    // Patient name patterns
    const namePatterns = [
      /patient:?\s*([A-Z][a-z]+ [A-Z][a-z]+)/gi,
      /name:?\s*([A-Z][a-z]+ [A-Z][a-z]+)/gi,
      /^([A-Z][a-z]+ [A-Z][a-z]+)/gm
    ];

    for (const pattern of namePatterns) {
      const match = text.match(pattern);
      if (match) {
        extracted.patientName = match[0].replace(/^(patient:?|name:?)\s*/i, '').trim();
        break;
      }
    }

    // Date of birth patterns
    const dobPatterns = [
      /(?:dob|date of birth):?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/gi,
      /born:?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/gi
    ];

    for (const pattern of dobPatterns) {
      const match = text.match(pattern);
      if (match) {
        extracted.dateOfBirth = match[1];
        break;
      }
    }

    // MRN patterns
    const mrnPatterns = [
      /(?:mrn|medical record number):?\s*([A-Z0-9]{6,})/gi,
      /patient id:?\s*([A-Z0-9]{6,})/gi
    ];

    for (const pattern of mrnPatterns) {
      const match = text.match(pattern);
      if (match) {
        extracted.mrn = match[1];
        break;
      }
    }

    // Insurance ID patterns
    const insurancePatterns = [
      /(?:insurance|policy) (?:id|number):?\s*([A-Z0-9]{6,})/gi,
      /member id:?\s*([A-Z0-9]{6,})/gi
    ];

    for (const pattern of insurancePatterns) {
      const match = text.match(pattern);
      if (match) {
        extracted.insuranceId = match[1];
        break;
      }
    }

    // Document date patterns
    const datePatterns = [
      /(?:date|dated):?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/gi,
      /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/g
    ];

    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) {
        extracted.date = match[0].replace(/^(date|dated):?\s*/i, '').trim();
        break;
      }
    }

    return extracted;
  }, []);

  const processDocument = useCallback(async (
    file: File,
    onStatusUpdate: StatusCallback
  ) => {
    try {
      // Step 1: Upload (immediate)
      onStatusUpdate('uploading', 10);

      // Step 2: OCR/Text extraction
      onStatusUpdate('scanning', 20);
      let text: string;
      
      if (file.type.startsWith('image/')) {
        text = await extractTextFromImage(file);
      } else if (file.type === 'application/pdf') {
        text = await extractTextFromPDF(file);
      } else {
        throw new Error('Unsupported file type');
      }

      onStatusUpdate('scanning', 50);

      // Step 3: Classification
      onStatusUpdate('classifying', 60);
      const classification = await classifyDocument(text);
      onStatusUpdate('classifying', 75, { classification });

      // Step 4: Entity extraction
      onStatusUpdate('extracting', 80);
      const extracted = await extractEntities(text);
      onStatusUpdate('extracting', 95, { classification, extracted });

      // Step 5: Complete
      onStatusUpdate('completed', 100, { classification, extracted, rawText: text });

    } catch (error) {
      logger.error('Document processing failed:', error);
      onStatusUpdate('error', 0);
      throw error;
    }
  }, [extractTextFromImage, extractTextFromPDF, classifyDocument, extractEntities]);

  return {
    processDocument
  };
};