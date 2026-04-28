export interface DrugInteraction {
  severity: 'high' | 'moderate' | 'low';
  description: string;
  drugPair: string;
}

export interface RxCUIData {
  rxcui: string;
  name: string;
}

// Cache for RxCUI lookups to avoid repeated API calls
const rxcuiCache = new Map<string, string>();

// Common drug interactions database (fallback when API fails)
const commonInteractions: Record<string, Array<{drug: string, severity: 'high' | 'moderate' | 'low', description: string}>> = {
  'warfarin': [
    { drug: 'aspirin', severity: 'high', description: 'Increased risk of bleeding when warfarin is combined with aspirin.' },
    { drug: 'ibuprofen', severity: 'moderate', description: 'NSAIDs like ibuprofen may increase bleeding risk with warfarin.' },
    { drug: 'amoxicillin', severity: 'moderate', description: 'Antibiotics may enhance warfarin effects by altering gut flora.' },
    { drug: 'ciprofloxacin', severity: 'moderate', description: 'Ciprofloxacin may enhance warfarin anticoagulant effects.' },
    { drug: 'omeprazole', severity: 'moderate', description: 'Omeprazole may increase warfarin levels and bleeding risk.' },
  ],
  'aspirin': [
    { drug: 'warfarin', severity: 'high', description: 'Increased risk of bleeding when aspirin is combined with warfarin.' },
    { drug: 'ibuprofen', severity: 'moderate', description: 'Combining aspirin with ibuprofen may increase GI bleeding risk.' },
  ],
  'metformin': [
    { drug: 'furosemide', severity: 'moderate', description: 'Diuretics may affect blood glucose control with metformin.' },
  ],
  'digoxin': [
    { drug: 'furosemide', severity: 'moderate', description: 'Diuretics may increase digoxin toxicity risk by causing electrolyte imbalances.' },
    { drug: 'amiodarone', severity: 'high', description: 'Amiodarone significantly increases digoxin levels and toxicity risk.' },
  ]
};

/**
 * Get RxCUI (RxNorm Concept Unique Identifier) for a drug name
 * Prioritizes ingredient-level concepts for better interaction checking
 */
export async function getRxCUI(drugName: string): Promise<string | null> {
  // Check cache first
  const normalizedName = drugName.toLowerCase().trim();
  if (rxcuiCache.has(normalizedName)) {
    return rxcuiCache.get(normalizedName) || null;
  }

  try {
    const response = await fetch(
      `https://rxnav.nlm.nih.gov/REST/drugs.json?name=${encodeURIComponent(drugName)}`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch RxCUI: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.drugGroup && data.drugGroup.conceptGroup) {
      let rxcui = null;
      
      // First try to find ingredient (IN) level concepts
      for (const group of data.drugGroup.conceptGroup) {
        if (group.tty === 'IN' && group.conceptProperties && group.conceptProperties.length > 0) {
          rxcui = group.conceptProperties[0].rxcui;
          break;
        }
      }
      
      // If no ingredient found, try SCD (Semantic Clinical Drug)
      if (!rxcui) {
        for (const group of data.drugGroup.conceptGroup) {
          if (group.tty === 'SCD' && group.conceptProperties && group.conceptProperties.length > 0) {
            rxcui = group.conceptProperties[0].rxcui;
            break;
          }
        }
      }
      
      // Fallback to any available concept
      if (!rxcui) {
        for (const group of data.drugGroup.conceptGroup) {
          if (group.conceptProperties && group.conceptProperties.length > 0) {
            rxcui = group.conceptProperties[0].rxcui;
            break;
          }
        }
      }
      
      if (rxcui) {
        rxcuiCache.set(normalizedName, rxcui);
        return rxcui;
      }
    }
    
    // Cache null result to avoid repeated failed lookups
    rxcuiCache.set(normalizedName, '');
    return null;
  } catch (error) {
    console.error('Error fetching RxCUI:', error);
    return null;
  }
}

/**
 * Check for drug interactions between two medications using RxCUI
 */
export async function checkDrugInteraction(rxcui1: string, rxcui2: string): Promise<DrugInteraction[]> {
  try {
    const response = await fetch(
      `https://rxnav.nlm.nih.gov/REST/interaction/interaction.json?rxcui=${rxcui1}&sources=DrugBank`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch interactions: ${response.status}`);
    }
    
    const data = await response.json();
    const interactions: DrugInteraction[] = [];
    
    if (data.interactionTypeGroup) {
      for (const typeGroup of data.interactionTypeGroup) {
        if (typeGroup.interactionType) {
          for (const interactionType of typeGroup.interactionType) {
            if (interactionType.interactionPair) {
              for (const pair of interactionType.interactionPair) {
                // Check if this interaction involves our second drug
                const involves2ndDrug = pair.interactionConcept.some((concept: any) => 
                  concept.minConceptItem.rxcui === rxcui2
                );
                
                if (involves2ndDrug && pair.description) {
                  const severity = determineSeverity(pair.severity || pair.description);
                  interactions.push({
                    severity,
                    description: pair.description,
                    drugPair: `${pair.interactionConcept[0]?.minConceptItem?.name || 'Drug 1'} + ${pair.interactionConcept[1]?.minConceptItem?.name || 'Drug 2'}`
                  });
                }
              }
            }
          }
        }
      }
    }
    
    return interactions;
  } catch (error) {
    console.error('Error checking drug interactions:', error);
    return [];
  }
}

/**
 * Determine interaction severity based on description keywords
 */
function determineSeverity(text: string): 'high' | 'moderate' | 'low' {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('contraindicated') || 
      lowerText.includes('avoid') || 
      lowerText.includes('serious') ||
      lowerText.includes('severe') ||
      lowerText.includes('dangerous')) {
    return 'high';
  }
  
  if (lowerText.includes('monitor') || 
      lowerText.includes('caution') ||
      lowerText.includes('moderate') ||
      lowerText.includes('reduce') ||
      lowerText.includes('adjust')) {
    return 'moderate';
  }
  
  return 'low';
}

/**
 * Check for interactions using the fallback database
 */
function checkFallbackInteractions(drug1: string, drug2: string): DrugInteraction[] {
  const interactions: DrugInteraction[] = [];
  const normalized1 = drug1.toLowerCase().trim();
  const normalized2 = drug2.toLowerCase().trim();
  
  // Check if drug1 has interactions with drug2
  if (commonInteractions[normalized1]) {
    const interaction = commonInteractions[normalized1].find(
      inter => inter.drug.toLowerCase() === normalized2
    );
    if (interaction) {
      interactions.push({
        severity: interaction.severity,
        description: interaction.description,
        drugPair: `${drug1} + ${drug2}`
      });
    }
  }
  
  // Check if drug2 has interactions with drug1 (reverse lookup)
  if (commonInteractions[normalized2]) {
    const interaction = commonInteractions[normalized2].find(
      inter => inter.drug.toLowerCase() === normalized1
    );
    if (interaction) {
      interactions.push({
        severity: interaction.severity,
        description: interaction.description,
        drugPair: `${drug2} + ${drug1}`
      });
    }
  }
  
  return interactions;
}

/**
 * Check a new medication against existing medications for interactions
 */
export async function checkMedicationInteractions(
  newMedicationName: string,
  existingMedications: string[]
): Promise<DrugInteraction[]> {
  const allInteractions: DrugInteraction[] = [];
  
  // First try the API approach
  try {
    const newRxCUI = await getRxCUI(newMedicationName);
    if (newRxCUI) {
      // Check against each existing medication using API
      for (const existingMed of existingMedications) {
        const existingRxCUI = await getRxCUI(existingMed);
        if (existingRxCUI) {
          const interactions = await checkDrugInteraction(newRxCUI, existingRxCUI);
          allInteractions.push(...interactions);
        }
      }
    }
  } catch (error) {
    console.warn('API interaction check failed, using fallback database:', error);
  }
  
  // Always also check the fallback database for common interactions
  for (const existingMed of existingMedications) {
    const fallbackInteractions = checkFallbackInteractions(newMedicationName, existingMed);
    // Only add fallback interactions if we don't already have them from API
    for (const fallbackInteraction of fallbackInteractions) {
      const isDuplicate = allInteractions.some(existing => 
        existing.drugPair === fallbackInteraction.drugPair &&
        existing.description === fallbackInteraction.description
      );
      if (!isDuplicate) {
        allInteractions.push(fallbackInteraction);
      }
    }
  }
  
  return allInteractions;
}

/**
 * Parse medications from a text field (like current medications in history)
 */
export function parseMedicationsFromText(medicationsText: string): string[] {
  if (!medicationsText?.trim()) return [];
  
  // Split by common delimiters and clean up
  return medicationsText
    .split(/[,;\n]/)
    .map(med => med.trim())
    .filter(med => med.length > 0)
    .map(med => {
      // Remove dosage information to get just the drug name
      return med.replace(/\d+\s*(mg|ml|g|mcg|units?)\b/gi, '').trim();
    })
    .filter(med => med.length > 2); // Filter out very short strings
}