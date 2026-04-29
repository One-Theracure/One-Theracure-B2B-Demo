
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Search, Trash2, Pill, Clock, Calendar, AlertTriangle, Loader2, ShieldAlert, Info } from "lucide-react";
import { checkMedicationInteractions, parseMedicationsFromText, type DrugInteraction } from "@/utils/drugInteractions";
import { lookupDrugInteractions, type DrugInteractionEntry } from "@/data/drugInteractions";
import { useToast } from "@/hooks/use-toast";
import { logger } from '@/lib/logger';

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  route: string;
}

interface PrescriptionBuilderProps {
  medications: Medication[];
  onMedicationsChange: (medications: Medication[]) => void;
  currentMedications?: string;
  allergies?: string;
}

// Common drug-class/ingredient mappings for allergy cross-referencing
const ALLERGY_DRUG_MAP: Record<string, string[]> = {
  penicillin: ["amoxicillin", "ampicillin", "piperacillin", "penicillin", "augmentin", "amoxyclav"],
  sulfa: ["sulfamethoxazole", "trimethoprim", "bactrim", "cotrimoxazole", "sulfasalazine"],
  nsaid: ["ibuprofen", "naproxen", "diclofenac", "aspirin", "ketorolac", "indomethacin", "piroxicam", "meloxicam", "celecoxib"],
  aspirin: ["aspirin"],
  cephalosporin: ["cephalexin", "cefuroxime", "ceftriaxone", "cefixime", "cefpodoxime"],
  codeine: ["codeine", "tramadol"],
  morphine: ["morphine", "oxycodone", "hydrocodone", "fentanyl"],
  statin: ["atorvastatin", "simvastatin", "rosuvastatin", "pravastatin"],
  ace: ["lisinopril", "enalapril", "ramipril", "captopril", "perindopril"],
  metformin: ["metformin"],
  latex: [],
};

interface AllergyAlert {
  allergen: string;
  drugName: string;
  matchType: "direct" | "class";
}

function checkAllergyConflict(drugName: string, allergiesText: string): AllergyAlert[] {
  if (!allergiesText?.trim() || !drugName?.trim()) return [];
  const alerts: AllergyAlert[] = [];
  const normDrug = drugName.toLowerCase().trim();
  const allergyList = allergiesText.toLowerCase().split(/[,;\n]/).map(a => a.trim()).filter(Boolean);

  for (const allergy of allergyList) {
    // Direct name match
    if (normDrug.includes(allergy) || allergy.includes(normDrug)) {
      alerts.push({ allergen: allergy, drugName, matchType: "direct" });
      continue;
    }
    // Class-based match
    for (const [className, members] of Object.entries(ALLERGY_DRUG_MAP)) {
      const allergyMatchesClass = allergy.includes(className) || className.includes(allergy);
      if (allergyMatchesClass && members.some(m => normDrug.includes(m))) {
        alerts.push({ allergen: `${allergy} (${className} class)`, drugName, matchType: "class" });
      }
    }
  }
  return alerts;
}

const commonMedications = [
  "Paracetamol", "Ibuprofen", "Aspirin", "Amoxicillin", "Ciprofloxacin",
  "Metformin", "Atorvastatin", "Lisinopril", "Omeprazole", "Amlodipine",
  "Metoprolol", "Simvastatin", "Losartan", "Hydrochlorothiazide", "Gabapentin",
  "Prednisone", "Azithromycin", "Cephalexin", "Doxycycline", "Furosemide",
  "Warfarin", "Digoxin", "Phenytoin", "Carbamazepine", "Lithium"
];

const frequencies = [
  "Once daily", "Twice daily", "Three times daily", "Four times daily",
  "Every 4 hours", "Every 6 hours", "Every 8 hours", "Every 12 hours",
  "As needed", "Before meals", "After meals", "At bedtime"
];

const routes = [
  "Oral", "Intravenous", "Intramuscular", "Subcutaneous", "Topical",
  "Inhalation", "Rectal", "Sublingual", "Transdermal"
];

const SEVERITY_CONFIG = {
  contraindicated: { bg: "bg-red-50", border: "border-red-500", text: "text-red-800", badge: "destructive" as const, label: "CONTRAINDICATED" },
  major: { bg: "bg-red-50", border: "border-red-400", text: "text-red-700", badge: "destructive" as const, label: "MAJOR" },
  moderate: { bg: "bg-amber-50", border: "border-amber-400", text: "text-amber-700", badge: "default" as const, label: "MODERATE" },
  minor: { bg: "bg-blue-50", border: "border-blue-300", text: "text-blue-700", badge: "secondary" as const, label: "MINOR" },
  high: { bg: "bg-red-50", border: "border-red-400", text: "text-red-700", badge: "destructive" as const, label: "HIGH RISK" },
  low: { bg: "bg-blue-50", border: "border-blue-300", text: "text-blue-700", badge: "secondary" as const, label: "LOW RISK" },
};

const PrescriptionBuilder = ({ medications, onMedicationsChange, currentMedications = "", allergies = "" }: PrescriptionBuilderProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [newMedication, setNewMedication] = useState<Partial<Medication>>({
    name: "", dosage: "", frequency: "", duration: "", instructions: "", route: "Oral"
  });
  const [isCheckingInteractions, setIsCheckingInteractions] = useState(false);
  const [showInteractionDialog, setShowInteractionDialog] = useState(false);
  const [currentInteractions, setCurrentInteractions] = useState<DrugInteraction[]>([]);
  const [pendingMedication, setPendingMedication] = useState<Medication | null>(null);
  const [richInteractions, setRichInteractions] = useState<DrugInteractionEntry[]>([]);

  const { toast } = useToast();

  // Real-time allergy alerts as user selects a medication
  const allergyAlerts = useMemo(
    () => checkAllergyConflict(newMedication.name || "", allergies),
    [newMedication.name, allergies]
  );

  // Real-time drug-drug interaction preview (local DB, instant)
  const inlineInteractions = useMemo(() => {
    if (!newMedication.name) return [];
    const existingNames = [
      ...medications.map(m => m.name),
      ...parseMedicationsFromText(currentMedications),
    ];
    return lookupDrugInteractions(newMedication.name, existingNames);
  }, [newMedication.name, medications, currentMedications]);

  const filteredMedications = commonMedications.filter(med =>
    med.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addMedication = async () => {
    if (newMedication.name && newMedication.dosage && newMedication.frequency) {
      const medication: Medication = {
        id: Date.now().toString(),
        name: newMedication.name,
        dosage: newMedication.dosage || "",
        frequency: newMedication.frequency || "",
        duration: newMedication.duration || "",
        instructions: newMedication.instructions || "",
        route: newMedication.route || "Oral"
      };

      // Block if allergy is a direct match
      if (allergyAlerts.some(a => a.matchType === "direct")) {
        toast({
          title: "⛔ Allergy Conflict",
          description: `${medication.name} is contraindicated — patient has a documented allergy to ${allergyAlerts[0].allergen}.`,
          variant: "destructive"
        });
        return;
      }

      setIsCheckingInteractions(true);
      try {
        const existingMedNames = [
          ...medications.map(med => med.name),
          ...parseMedicationsFromText(currentMedications)
        ];

        const interactions = await checkMedicationInteractions(medication.name, existingMedNames);
        const rich = lookupDrugInteractions(medication.name, existingMedNames);
        setRichInteractions(rich);

        const allAlerts = [...interactions];
        const hasAllergyWarning = allergyAlerts.length > 0;

        if (allAlerts.length > 0 || hasAllergyWarning || rich.length > 0) {
          setCurrentInteractions(allAlerts);
          setPendingMedication(medication);
          setShowInteractionDialog(true);
        } else {
          finalizeMedicationAdd(medication);
        }
      } catch (error) {
        logger.error('Error checking interactions:', error);
        toast({
          title: "Warning",
          description: "Could not check for drug interactions. Medication added without interaction check.",
          variant: "destructive"
        });
        finalizeMedicationAdd(medication);
      } finally {
        setIsCheckingInteractions(false);
      }
    }
  };

  const finalizeMedicationAdd = (medication: Medication) => {
    onMedicationsChange([...medications, medication]);
    setNewMedication({ name: "", dosage: "", frequency: "", duration: "", instructions: "", route: "Oral" });
    setSearchTerm("");
    setPendingMedication(null);
    setCurrentInteractions([]);
    setRichInteractions([]);
  };

  const handleConfirmAddWithInteractions = () => {
    if (pendingMedication) {
      const warnings: string[] = [];
      if (currentInteractions.length > 0) warnings.push(`⚠️ Drug interaction: ${currentInteractions[0].description}`);
      if (richInteractions.length > 0) warnings.push(`📋 ${richInteractions[0].management}`);
      if (allergyAlerts.length > 0) warnings.push(`🔴 Allergy caution: ${allergyAlerts[0].allergen}`);

      const interactionNote = warnings.join(" | ");
      const medicationWithWarning = {
        ...pendingMedication,
        instructions: pendingMedication.instructions
          ? `${pendingMedication.instructions}. ${interactionNote}`
          : interactionNote
      };

      finalizeMedicationAdd(medicationWithWarning);
      setShowInteractionDialog(false);
      toast({ title: "Medication Added", description: "Added with safety warnings in instructions." });
    }
  };

  const handleCancelAddWithInteractions = () => {
    setShowInteractionDialog(false);
    setPendingMedication(null);
    setCurrentInteractions([]);
    setRichInteractions([]);
  };

  const removeMedication = (id: string) => {
    onMedicationsChange(medications.filter(med => med.id !== id));
  };

  const selectMedication = (medName: string) => {
    setNewMedication(prev => ({ ...prev, name: medName }));
    setSearchTerm("");
  };

  return (
    <Card className="w-full">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardTitle className="flex items-center space-x-2">
          <Pill className="h-5 w-5 text-blue-600" />
          <span>Interactive Prescription Environment</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Allergy Banner */}
        {allergies && (
          <div className="flex items-start gap-2 p-3 rounded-xl border border-red-200 bg-red-50/80">
            <ShieldAlert className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-red-700 uppercase tracking-wide">Known Allergies</p>
              <p className="text-sm text-red-800 mt-0.5">{allergies}</p>
            </div>
          </div>
        )}

        {/* Add New Medication */}
        <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-semibold text-foreground">Add New Medication</h4>

          {/* Medication Search */}
          <div className="space-y-2">
            <Label htmlFor="medicationSearch">Search Medication</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="medicationSearch"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search medications..."
                className="pl-10"
              />
            </div>

            {searchTerm && (
              <div className="max-h-32 overflow-y-auto border rounded-md bg-card">
                {filteredMedications.map((med, index) => (
                  <button
                    key={index}
                    onClick={() => selectMedication(med)}
                    className="w-full text-left px-3 py-2 hover:bg-primary/10 border-b last:border-b-0"
                  >
                    {med}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Selected Medication + Real-time Alerts */}
          {newMedication.name && (
            <div className="space-y-2">
              <div className="p-3 bg-blue-50 rounded-md">
                <Badge variant="secondary" className="mb-2">{newMedication.name}</Badge>
              </div>

              {/* Inline Allergy Alert */}
              {allergyAlerts.length > 0 && (
                <div className="rounded-xl border-l-4 border-red-500 bg-red-50 p-3 animate-fade-in">
                  <div className="flex items-center gap-2 mb-1">
                    <ShieldAlert className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-bold text-red-700">Allergy Conflict</span>
                    <Badge variant="destructive" className="text-[10px] px-1.5 py-0">DANGER</Badge>
                  </div>
                  {allergyAlerts.map((alert, i) => (
                    <p key={i} className="text-sm text-red-700">
                      Patient is allergic to <strong>{alert.allergen}</strong>
                      {alert.matchType === "class" && " — cross-reactivity risk"}
                    </p>
                  ))}
                </div>
              )}

              {/* Inline Drug-Drug Interaction Alerts */}
              {inlineInteractions.length > 0 && (
                <div className="space-y-2 animate-fade-in">
                  {inlineInteractions.map((ix, i) => {
                    const config = SEVERITY_CONFIG[ix.severity] || SEVERITY_CONFIG.moderate;
                    return (
                      <div key={i} className={`rounded-xl border-l-4 ${config.border} ${config.bg} p-3`}>
                        <div className="flex items-center gap-2 mb-1">
                          <AlertTriangle className={`h-4 w-4 ${config.text}`} />
                          <span className={`text-sm font-bold ${config.text}`}>Drug Interaction</span>
                          <Badge variant={config.badge} className="text-[10px] px-1.5 py-0">{config.label}</Badge>
                        </div>
                        <p className={`text-sm ${config.text} font-medium`}>
                          {ix.drug1} + {ix.drug2}: {ix.effect}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          <Info className="h-3 w-3 inline mr-1" />
                          {ix.management}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Dosage and Frequency */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dosage">Dosage *</Label>
              <Input
                id="dosage"
                value={newMedication.dosage}
                onChange={(e) => setNewMedication(prev => ({ ...prev, dosage: e.target.value }))}
                placeholder="e.g., 500mg, 10ml, 1 tablet"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency *</Label>
              <Select
                value={newMedication.frequency}
                onValueChange={(value) => setNewMedication(prev => ({ ...prev, frequency: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  {frequencies.map((freq) => (
                    <SelectItem key={freq} value={freq}>{freq}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Duration and Route */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <Input
                id="duration"
                value={newMedication.duration}
                onChange={(e) => setNewMedication(prev => ({ ...prev, duration: e.target.value }))}
                placeholder="e.g., 7 days, 2 weeks"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="route">Route</Label>
              <Select
                value={newMedication.route}
                onValueChange={(value) => setNewMedication(prev => ({ ...prev, route: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {routes.map((route) => (
                    <SelectItem key={route} value={route}>{route}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-2">
            <Label htmlFor="instructions">Special Instructions</Label>
            <Input
              id="instructions"
              value={newMedication.instructions}
              onChange={(e) => setNewMedication(prev => ({ ...prev, instructions: e.target.value }))}
              placeholder="e.g., Take with food, Avoid alcohol"
            />
          </div>

          <Button
            onClick={addMedication}
            disabled={!newMedication.name || !newMedication.dosage || !newMedication.frequency || isCheckingInteractions}
            className="w-full"
          >
            {isCheckingInteractions ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Checking Interactions...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Add Medication
              </>
            )}
          </Button>
        </div>

        <Separator />

        {/* Current Prescriptions */}
        <div className="space-y-4">
          <h4 className="font-semibold text-foreground flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>Current Prescriptions ({medications.length})</span>
          </h4>

          {medications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Pill className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
              <p>No medications added yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {medications.map((medication) => (
                <Card key={medication.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant="default">{medication.name}</Badge>
                        <Badge variant="outline">{medication.route}</Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Pill className="h-3 w-3" />
                          <span>{medication.dosage}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{medication.frequency}</span>
                        </div>
                        {medication.duration && (
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{medication.duration}</span>
                          </div>
                        )}
                      </div>
                      {medication.instructions && (
                        <p className={`text-sm mt-2 italic ${
                          medication.instructions.includes('⚠️') || medication.instructions.includes('🔴')
                            ? 'text-amber-700 dark:text-amber-400 bg-amber-500/10 p-2 rounded border-l-4 border-amber-400'
                            : 'text-muted-foreground'
                        }`}>
                          {medication.instructions}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeMedication(medication.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </CardContent>

      {/* Drug Interaction Warning Dialog */}
      <AlertDialog open={showInteractionDialog} onOpenChange={setShowInteractionDialog}>
        <AlertDialogContent className="max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center space-x-2 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
              <span>Safety Alerts</span>
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>Review the following alerts before proceeding:</p>

                {/* Allergy warnings in dialog */}
                {allergyAlerts.length > 0 && (
                  <div className="p-3 rounded-lg border-l-4 border-red-500 bg-red-50">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="destructive">ALLERGY</Badge>
                      <span className="text-sm font-medium text-red-800">{pendingMedication?.name}</span>
                    </div>
                    {allergyAlerts.map((a, i) => (
                      <p key={i} className="text-sm text-red-700">
                        Patient allergic to <strong>{a.allergen}</strong>
                        {a.matchType === "class" ? " — possible cross-reactivity" : " — direct match"}
                      </p>
                    ))}
                  </div>
                )}

                {/* Rich interactions with management advice */}
                {richInteractions.map((ix, i) => {
                  const config = SEVERITY_CONFIG[ix.severity];
                  return (
                    <div key={`rich-${i}`} className={`p-3 rounded-lg border-l-4 ${config.border} ${config.bg}`}>
                      <div className="flex items-center space-x-2 mb-1">
                        <Badge variant={config.badge}>{config.label}</Badge>
                        <span className="text-sm font-medium">{ix.drug1} + {ix.drug2}</span>
                      </div>
                      <p className={`text-sm ${config.text} font-medium`}>{ix.effect}</p>
                      <p className="text-xs text-muted-foreground mt-1.5 italic">
                        <strong>Management:</strong> {ix.management}
                      </p>
                    </div>
                  );
                })}

                {/* API-sourced interactions */}
                {currentInteractions.filter(ci => !richInteractions.some(ri =>
                  ci.drugPair.toLowerCase().includes(ri.drug1) && ci.drugPair.toLowerCase().includes(ri.drug2)
                )).map((interaction, index) => {
                  const config = SEVERITY_CONFIG[interaction.severity] || SEVERITY_CONFIG.moderate;
                  return (
                    <div key={`api-${index}`} className={`p-3 rounded-lg border-l-4 ${config.border} ${config.bg}`}>
                      <div className="flex items-center space-x-2 mb-1">
                        <Badge variant={config.badge}>{config.label}</Badge>
                        <span className="text-sm font-medium">{interaction.drugPair}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{interaction.description}</p>
                    </div>
                  );
                })}

                <p className="text-sm text-muted-foreground mt-3">
                  Do you want to proceed? Safety warnings will be added to the medication instructions.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelAddWithInteractions}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmAddWithInteractions}
              className="bg-amber-600 hover:bg-amber-700"
            >
              Add with Warning
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default PrescriptionBuilder;
