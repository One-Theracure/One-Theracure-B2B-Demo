export interface ICD10Code {
  code: string;
  description: string;
  category: string;
  keywords: string[];
}

// Common primary care ICD-10 codes with keywords for matching
export const icd10Codes: ICD10Code[] = [
  // Respiratory
  { code: "J06.9", description: "Acute upper respiratory infection, unspecified", category: "Respiratory", keywords: ["upper respiratory", "uri", "cold", "flu", "cough", "congestion"] },
  { code: "J20.9", description: "Acute bronchitis, unspecified", category: "Respiratory", keywords: ["bronchitis", "acute bronchitis", "chest cold", "productive cough"] },
  { code: "J45.9", description: "Asthma, unspecified", category: "Respiratory", keywords: ["asthma", "wheezing", "bronchial asthma", "respiratory distress"] },
  { code: "J44.1", description: "Chronic obstructive pulmonary disease with acute exacerbation", category: "Respiratory", keywords: ["copd", "chronic bronchitis", "emphysema", "shortness of breath"] },
  { code: "J18.9", description: "Pneumonia, unspecified organism", category: "Respiratory", keywords: ["pneumonia", "lung infection", "chest infection", "consolidation"] },
  
  // Cardiovascular
  { code: "I10", description: "Essential hypertension", category: "Cardiovascular", keywords: ["hypertension", "high blood pressure", "htn", "elevated bp"] },
  { code: "I25.10", description: "Atherosclerotic heart disease of native coronary artery without angina pectoris", category: "Cardiovascular", keywords: ["coronary artery disease", "cad", "atherosclerosis", "heart disease"] },
  { code: "I48.91", description: "Unspecified atrial fibrillation", category: "Cardiovascular", keywords: ["atrial fibrillation", "afib", "irregular heartbeat", "arrhythmia"] },
  { code: "I50.9", description: "Heart failure, unspecified", category: "Cardiovascular", keywords: ["heart failure", "congestive heart failure", "chf", "cardiac failure"] },
  
  // Endocrine
  { code: "E11.9", description: "Type 2 diabetes mellitus without complications", category: "Endocrine", keywords: ["diabetes", "type 2 diabetes", "dm", "hyperglycemia", "blood sugar"] },
  { code: "E11.65", description: "Type 2 diabetes mellitus with hyperglycemia", category: "Endocrine", keywords: ["diabetes hyperglycemia", "high blood sugar", "diabetic hyperglycemia"] },
  { code: "E78.5", description: "Hyperlipidemia, unspecified", category: "Endocrine", keywords: ["hyperlipidemia", "high cholesterol", "dyslipidemia", "lipid disorder"] },
  { code: "E03.9", description: "Hypothyroidism, unspecified", category: "Endocrine", keywords: ["hypothyroidism", "underactive thyroid", "thyroid disorder"] },
  { code: "E05.90", description: "Thyrotoxicosis, unspecified without thyrotoxic crisis or storm", category: "Endocrine", keywords: ["hyperthyroidism", "thyrotoxicosis", "overactive thyroid"] },
  
  // Musculoskeletal
  { code: "M25.50", description: "Pain in unspecified joint", category: "Musculoskeletal", keywords: ["joint pain", "arthralgia", "joint ache", "joint discomfort"] },
  { code: "M79.3", description: "Panniculitis, unspecified", category: "Musculoskeletal", keywords: ["muscle pain", "myalgia", "muscle ache", "muscle soreness"] },
  { code: "M54.5", description: "Low back pain", category: "Musculoskeletal", keywords: ["back pain", "lower back pain", "lumbar pain", "lumbago"] },
  { code: "M25.511", description: "Pain in right shoulder", category: "Musculoskeletal", keywords: ["shoulder pain", "right shoulder", "shoulder discomfort"] },
  { code: "M17.9", description: "Osteoarthritis of knee, unspecified", category: "Musculoskeletal", keywords: ["knee arthritis", "osteoarthritis", "knee pain", "degenerative joint"] },
  
  // Gastrointestinal
  { code: "K59.00", description: "Constipation, unspecified", category: "Gastrointestinal", keywords: ["constipation", "difficulty passing stool", "hard stool", "infrequent bowel"] },
  { code: "K59.1", description: "Diarrhea, unspecified", category: "Gastrointestinal", keywords: ["diarrhea", "loose stool", "watery stool", "frequent bowel"] },
  { code: "K30", description: "Functional dyspepsia", category: "Gastrointestinal", keywords: ["dyspepsia", "indigestion", "stomach upset", "epigastric pain"] },
  { code: "K21.9", description: "Gastro-esophageal reflux disease without esophagitis", category: "Gastrointestinal", keywords: ["gerd", "acid reflux", "heartburn", "gastroesophageal reflux"] },
  { code: "K92.2", description: "Gastrointestinal hemorrhage, unspecified", category: "Gastrointestinal", keywords: ["gi bleeding", "gastrointestinal bleeding", "blood in stool"] },
  
  // Neurological
  { code: "G43.909", description: "Migraine, unspecified, not intractable, without status migrainosus", category: "Neurological", keywords: ["migraine", "headache", "severe headache", "migraine headache"] },
  { code: "R51", description: "Headache", category: "Neurological", keywords: ["headache", "head pain", "cephalgia"] },
  { code: "G93.1", description: "Anoxic brain damage, not elsewhere classified", category: "Neurological", keywords: ["dizziness", "vertigo", "lightheadedness", "balance problems"] },
  
  // Mental Health
  { code: "F32.9", description: "Major depressive disorder, single episode, unspecified", category: "Mental Health", keywords: ["depression", "major depression", "depressive episode", "mood disorder"] },
  { code: "F41.9", description: "Anxiety disorder, unspecified", category: "Mental Health", keywords: ["anxiety", "anxiety disorder", "generalized anxiety", "panic"] },
  { code: "F43.10", description: "Post-traumatic stress disorder, unspecified", category: "Mental Health", keywords: ["ptsd", "post traumatic stress", "trauma", "stress disorder"] },
  
  // Skin
  { code: "L30.9", description: "Dermatitis, unspecified", category: "Dermatological", keywords: ["dermatitis", "skin inflammation", "eczema", "rash"] },
  { code: "L20.9", description: "Atopic dermatitis, unspecified", category: "Dermatological", keywords: ["atopic dermatitis", "eczema", "allergic dermatitis"] },
  { code: "L40.9", description: "Psoriasis, unspecified", category: "Dermatological", keywords: ["psoriasis", "scaly skin", "plaque psoriasis"] },
  
  // General/Symptoms
  { code: "R50.9", description: "Fever, unspecified", category: "General", keywords: ["fever", "pyrexia", "elevated temperature", "febrile"] },
  { code: "R06.02", description: "Shortness of breath", category: "General", keywords: ["shortness of breath", "dyspnea", "difficulty breathing", "breathlessness"] },
  { code: "R53.83", description: "Fatigue", category: "General", keywords: ["fatigue", "tiredness", "exhaustion", "weakness"] },
  { code: "R42", description: "Dizziness and giddiness", category: "General", keywords: ["dizziness", "vertigo", "lightheaded", "unsteady"] },
  { code: "R10.9", description: "Unspecified abdominal pain", category: "General", keywords: ["abdominal pain", "stomach pain", "belly pain", "gastric pain"] },
  
  // Preventive/Screening
  { code: "Z00.00", description: "Encounter for general adult medical examination without abnormal findings", category: "Preventive", keywords: ["annual exam", "physical exam", "checkup", "routine exam"] },
  { code: "Z12.11", description: "Encounter for screening for malignant neoplasm of colon", category: "Preventive", keywords: ["colonoscopy", "colon screening", "cancer screening"] },
  { code: "Z87.891", description: "Personal history of nicotine dependence", category: "History", keywords: ["smoking history", "tobacco use", "former smoker", "nicotine"] }
];

// Fuzzy search function
export const searchICD10Codes = (query: string): Array<ICD10Code & { confidence: number }> => {
  if (!query.trim()) return [];
  
  const queryLower = query.toLowerCase();
  const results: Array<ICD10Code & { confidence: number }> = [];
  
  for (const code of icd10Codes) {
    let confidence = 0;
    
    // Exact matches in description or code
    if (code.description.toLowerCase().includes(queryLower)) {
      confidence += 0.8;
    }
    if (code.code.toLowerCase().includes(queryLower)) {
      confidence += 0.9;
    }
    
    // Keyword matches
    for (const keyword of code.keywords) {
      if (keyword.toLowerCase().includes(queryLower) || queryLower.includes(keyword.toLowerCase())) {
        confidence += 0.6;
      }
    }
    
    // Partial word matches
    const queryWords = queryLower.split(/\s+/);
    const descWords = code.description.toLowerCase().split(/\s+/);
    const keywordWords = code.keywords.join(' ').toLowerCase().split(/\s+/);
    
    for (const qWord of queryWords) {
      for (const dWord of [...descWords, ...keywordWords]) {
        if (dWord.includes(qWord) || qWord.includes(dWord)) {
          confidence += 0.3;
        }
      }
    }
    
    if (confidence > 0) {
      results.push({ ...code, confidence: Math.min(confidence, 1) });
    }
  }
  
  // Sort by confidence and return top results
  return results
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 20);
};