import { PatientInsightSnapshot, InsightItem, InsightProvenance, CareGapInsight, FollowUpGap } from "@/types/insights";
import { mockPatients } from "@/data/mockPatients";
import { getPatientGraph as getGraph } from "@/services/patientGraph";

const STORAGE_KEY = "ot_patient_insights";

function load(): Record<string, PatientInsightSnapshot> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function save(data: Record<string, PatientInsightSnapshot>): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function makeProvenance(source: InsightProvenance["source"], label: string, ref: string): InsightProvenance {
  return { source, label, reference: ref, date: new Date().toISOString() };
}

function makeItem(text: string, severity: InsightItem["severity"], prov: InsightProvenance): InsightItem {
  return { id: `ins-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, text, severity, provenance: prov };
}

export function generatePatientInsights(
  patientId: string,
  encounterId?: string,
  clinicId: string = "default"
): PatientInsightSnapshot {
  const patient = mockPatients.find((p) => p.id === patientId);
  const graph = getGraph(patientId);

  if (!patient) {
    const empty: PatientInsightSnapshot = {
      id: `ins-${Date.now()}`,
      clinicId,
      patientId,
      encounterId,
      generatedAt: new Date().toISOString(),
      generatedBy: "system",
      sufficientData: false,
      preVisitSummary: "Insufficient data — patient record not found.",
      healthEventsSinceLastVisit: [],
      activeProblems: [],
      currentMedications: [],
      allergies: [],
      recentLabs: [],
      recentImaging: [],
      openFollowUps: [],
      careGaps: [],
      hccRecapturePlaceholder: [],
      redFlags: [],
    };
    return empty;
  }

  const structuredProv = makeProvenance("structured-data", "Patient Record", `MRN: ${patient.mrn}`);
  const priorNoteProv = makeProvenance("prior-note", "Last Visit Note", `Visit: ${patient.lastVisit || "unknown"}`);

  const activeProblems: InsightItem[] = (patient.chronicConditions || []).map((c) =>
    makeItem(c, "warning", structuredProv)
  );

  const allergies: InsightItem[] = (patient.allergies || []).map((a) =>
    makeItem(a, "critical", structuredProv)
  );

  const currentMedications: InsightItem[] = (graph?.medications || []).slice(0, 5).map((m) => {
    if (typeof m === "string") return makeItem(m, "info", structuredProv);
    const med = m as { name?: string };
    return makeItem(med.name ?? JSON.stringify(m), "info", structuredProv);
  });

  const recentLabs: InsightItem[] = (graph?.labs || []).slice(0, 3).map((l) => {
    if (typeof l === "string") return makeItem(l, "info", structuredProv);
    const lab = l as { test?: string; value?: string };
    return makeItem(`${lab.test ?? "lab"}: ${lab.value ?? ""}`, "info", structuredProv);
  });

  const openFollowUps: FollowUpGap[] = (patient.chronicConditions || []).map((c, i) => ({
    id: `fu-${i}`,
    description: `Follow-up for ${c} — last reviewed ${patient.lastVisit || "unknown"}`,
    overdueBy: i === 0 ? "3 months" : undefined,
  }));

  const careGaps: CareGapInsight[] = [];
  if ((patient.chronicConditions || []).includes("Diabetes Type 2")) {
    careGaps.push({ id: "cg-hba1c", description: "HbA1c not recorded in last 3 months", priority: "warning", category: "Lab", dueDate: "" });
    careGaps.push({ id: "cg-retina", description: "Annual retinal screening due", priority: "info", category: "Screening" });
  }
  if ((patient.chronicConditions || []).includes("Hypertension")) {
    careGaps.push({ id: "cg-bp", description: "BP monitoring record missing this visit", priority: "warning", category: "Vitals" });
  }

  const redFlags: InsightItem[] = [];
  if ((patient.allergies || []).length > 0) {
    redFlags.push(makeItem(`Known allergies: ${patient.allergies!.join(", ")}`, "critical", structuredProv));
  }

  const hccRecapture: string[] = [];
  if ((patient.chronicConditions || []).includes("Diabetes Type 2")) hccRecapture.push("E11 – Type 2 Diabetes Mellitus (recapture)");
  if ((patient.chronicConditions || []).includes("Hypertension")) hccRecapture.push("I10 – Essential Hypertension (recapture)");

  const snapshot: PatientInsightSnapshot = {
    id: `ins-snap-${Date.now()}`,
    clinicId,
    patientId,
    encounterId,
    generatedAt: new Date().toISOString(),
    generatedBy: "system",
    sufficientData: activeProblems.length > 0 || allergies.length > 0,
    preVisitSummary: `${patient.name}, ${patient.age}y ${patient.gender}. Known ${(patient.chronicConditions || []).join(", ") || "no chronic conditions"}. Last visit: ${patient.lastVisit || "unknown"}.`,
    healthEventsSinceLastVisit: graph?.vitals?.length
      ? [makeItem("Vitals recorded at last visit", "info", priorNoteProv)]
      : [makeItem("No recent health events recorded", "normal", structuredProv)],
    activeProblems,
    currentMedications,
    allergies,
    recentLabs,
    recentImaging: [],
    openFollowUps,
    careGaps,
    hccRecapturePlaceholder: hccRecapture,
    redFlags,
  };

  const all = load();
  all[patientId] = snapshot;
  save(all);
  return snapshot;
}

export function getLastInsight(patientId: string): PatientInsightSnapshot | null {
  return load()[patientId] ?? null;
}
