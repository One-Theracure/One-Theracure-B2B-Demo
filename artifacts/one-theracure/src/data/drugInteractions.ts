export interface DrugInteractionEntry {
  drug1: string;
  drug2: string;
  severity: "contraindicated" | "major" | "moderate" | "minor";
  effect: string;
  mechanism: string;
  management: string;
}

export const drugInteractionTable: DrugInteractionEntry[] = [
  {
    drug1: "warfarin",
    drug2: "aspirin",
    severity: "major",
    effect: "Increased risk of bleeding",
    mechanism: "Additive anticoagulant and antiplatelet effects",
    management: "Avoid combination unless specifically indicated (e.g., mechanical valve). Monitor INR closely if used together.",
  },
  {
    drug1: "warfarin",
    drug2: "ibuprofen",
    severity: "major",
    effect: "Increased risk of GI bleeding and elevated INR",
    mechanism: "NSAIDs inhibit platelet function and may displace warfarin from protein binding",
    management: "Use paracetamol as alternative analgesic. If NSAID required, use lowest dose for shortest duration with PPI cover.",
  },
  {
    drug1: "warfarin",
    drug2: "ciprofloxacin",
    severity: "major",
    effect: "Enhanced anticoagulant effect, risk of bleeding",
    mechanism: "Ciprofloxacin inhibits CYP1A2, reducing warfarin metabolism",
    management: "Monitor INR within 3 days of starting/stopping ciprofloxacin. Consider dose reduction.",
  },
  {
    drug1: "warfarin",
    drug2: "metronidazole",
    severity: "major",
    effect: "Increased anticoagulant effect",
    mechanism: "Metronidazole inhibits CYP2C9 metabolism of S-warfarin",
    management: "Reduce warfarin dose by 25-50%. Monitor INR frequently.",
  },
  {
    drug1: "metformin",
    drug2: "contrast dye",
    severity: "major",
    effect: "Risk of lactic acidosis",
    mechanism: "Contrast-induced nephropathy impairs metformin renal clearance",
    management: "Hold metformin 48 hours before and after contrast. Check renal function before restarting.",
  },
  {
    drug1: "metformin",
    drug2: "furosemide",
    severity: "moderate",
    effect: "Altered glycaemic control and metformin levels",
    mechanism: "Furosemide may increase metformin plasma concentration",
    management: "Monitor blood glucose more frequently. Adjust doses as needed.",
  },
  {
    drug1: "ace inhibitor",
    drug2: "potassium supplement",
    severity: "major",
    effect: "Hyperkalemia",
    mechanism: "ACE inhibitors reduce aldosterone, decreasing potassium excretion",
    management: "Monitor serum potassium within 1 week. Avoid routine potassium supplementation with ACEi/ARB.",
  },
  {
    drug1: "ace inhibitor",
    drug2: "spironolactone",
    severity: "major",
    effect: "Severe hyperkalemia",
    mechanism: "Both drugs promote potassium retention",
    management: "If combination necessary, start spironolactone at low dose (12.5-25 mg). Monitor K+ within 3-7 days.",
  },
  {
    drug1: "digoxin",
    drug2: "amiodarone",
    severity: "major",
    effect: "Digoxin toxicity (nausea, arrhythmias, visual disturbances)",
    mechanism: "Amiodarone inhibits P-glycoprotein, increasing digoxin levels by 70-100%",
    management: "Reduce digoxin dose by 50% when starting amiodarone. Monitor digoxin levels.",
  },
  {
    drug1: "digoxin",
    drug2: "furosemide",
    severity: "moderate",
    effect: "Increased risk of digoxin toxicity",
    mechanism: "Furosemide-induced hypokalemia enhances digoxin cardiac effects",
    management: "Monitor potassium and magnesium levels. Supplement as needed.",
  },
  {
    drug1: "simvastatin",
    drug2: "amlodipine",
    severity: "moderate",
    effect: "Increased risk of myopathy/rhabdomyolysis",
    mechanism: "Amlodipine inhibits CYP3A4, increasing simvastatin levels",
    management: "Limit simvastatin to 20 mg/day when used with amlodipine. Consider atorvastatin as alternative.",
  },
  {
    drug1: "simvastatin",
    drug2: "clarithromycin",
    severity: "contraindicated",
    effect: "Rhabdomyolysis risk",
    mechanism: "Strong CYP3A4 inhibition markedly increases statin exposure",
    management: "Contraindicated. Suspend statin during clarithromycin course, or use azithromycin instead.",
  },
  {
    drug1: "clopidogrel",
    drug2: "omeprazole",
    severity: "major",
    effect: "Reduced antiplatelet efficacy of clopidogrel",
    mechanism: "Omeprazole inhibits CYP2C19, blocking clopidogrel activation",
    management: "Use pantoprazole instead of omeprazole. Avoid esomeprazole as well.",
  },
  {
    drug1: "ssri",
    drug2: "tramadol",
    severity: "major",
    effect: "Serotonin syndrome risk",
    mechanism: "Both drugs increase serotonergic activity",
    management: "Avoid combination if possible. Monitor for agitation, tremor, hyperthermia, clonus.",
  },
  {
    drug1: "ssri",
    drug2: "nsaid",
    severity: "moderate",
    effect: "Increased GI bleeding risk",
    mechanism: "SSRIs impair platelet serotonin uptake; NSAIDs impair mucosal protection",
    management: "Co-prescribe PPI if NSAID necessary. Use paracetamol as alternative.",
  },
  {
    drug1: "lithium",
    drug2: "nsaid",
    severity: "major",
    effect: "Lithium toxicity (tremor, confusion, renal impairment)",
    mechanism: "NSAIDs reduce renal lithium clearance",
    management: "Avoid NSAIDs or monitor lithium levels within 5 days. Reduce lithium dose if needed.",
  },
  {
    drug1: "lithium",
    drug2: "ace inhibitor",
    severity: "major",
    effect: "Lithium toxicity",
    mechanism: "ACE inhibitors reduce renal lithium clearance",
    management: "Monitor lithium levels closely. Consider dose reduction.",
  },
  {
    drug1: "methotrexate",
    drug2: "trimethoprim",
    severity: "contraindicated",
    effect: "Pancytopenia, severe bone marrow suppression",
    mechanism: "Both drugs inhibit folate metabolism",
    management: "Contraindicated. Use alternative antibiotic.",
  },
  {
    drug1: "amlodipine",
    drug2: "beta blocker",
    severity: "moderate",
    effect: "Excessive bradycardia and hypotension",
    mechanism: "Additive negative chronotropic and hypotensive effects",
    management: "Monitor heart rate and blood pressure. Start with low doses and titrate slowly.",
  },
  {
    drug1: "insulin",
    drug2: "beta blocker",
    severity: "moderate",
    effect: "Masked hypoglycemia symptoms, prolonged hypoglycemia",
    mechanism: "Beta blockers blunt tachycardia and tremor from hypoglycemia",
    management: "Educate patient on non-adrenergic hypoglycemia symptoms (sweating, hunger). Monitor glucose more frequently.",
  },
  {
    drug1: "theophylline",
    drug2: "ciprofloxacin",
    severity: "major",
    effect: "Theophylline toxicity (seizures, arrhythmias)",
    mechanism: "Ciprofloxacin inhibits CYP1A2, reducing theophylline clearance",
    management: "Reduce theophylline dose by 30-50%. Monitor theophylline levels. Use alternative antibiotic if possible.",
  },
  {
    drug1: "potassium",
    drug2: "spironolactone",
    severity: "major",
    effect: "Life-threatening hyperkalemia",
    mechanism: "Spironolactone is potassium-sparing; exogenous potassium adds to retention",
    management: "Avoid routine potassium supplementation. Monitor serum K+ closely.",
  },
];

export function lookupDrugInteractions(
  drugName: string,
  againstDrugs: string[]
): DrugInteractionEntry[] {
  const normalised = drugName.toLowerCase().trim();
  const results: DrugInteractionEntry[] = [];

  for (const against of againstDrugs) {
    const normAgainst = against.toLowerCase().trim();
    for (const entry of drugInteractionTable) {
      const d1 = entry.drug1.toLowerCase();
      const d2 = entry.drug2.toLowerCase();
      if (
        (normalised.includes(d1) && normAgainst.includes(d2)) ||
        (normalised.includes(d2) && normAgainst.includes(d1))
      ) {
        results.push(entry);
      }
    }
  }

  return results;
}

export function checkAllInteractions(
  medications: string[]
): DrugInteractionEntry[] {
  const results: DrugInteractionEntry[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < medications.length; i++) {
    for (let j = i + 1; j < medications.length; j++) {
      const found = lookupDrugInteractions(medications[i], [medications[j]]);
      for (const entry of found) {
        const key = `${entry.drug1}-${entry.drug2}`;
        if (!seen.has(key)) {
          seen.add(key);
          results.push(entry);
        }
      }
    }
  }

  return results;
}
