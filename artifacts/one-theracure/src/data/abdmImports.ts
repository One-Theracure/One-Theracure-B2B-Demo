/**
 * Mock ABDM (Ayushman Bharat Digital Mission) cross-clinic record handoff data.
 *
 * When a patient registered against an ABHA Health ID arrives at a new
 * clinic, scanning their QR pulls in their longitudinal record from any
 * prior ABDM-connected facility. The encounter workspace consumes this
 * data to render a brief "Scanning ABHA QR..." moment, then materialises
 * the imported entries into the encounter timeline tagged with the source
 * clinic name and an ABDM badge — proving continuity of care without
 * manual re-entry.
 *
 * Today only P008 (Mrs. Fatima Sheikh) is wired up because her scripted
 * scribe storyline is built around the cross-clinic handoff.
 */

export type AbdmImportKind =
  | "lab"
  | "medication"
  | "consult"
  | "allergy"
  | "immunization";

export interface AbdmImportRecord {
  /** Stable id used for React keys / timeline ids. */
  id: string;
  /** Category of imported record. */
  kind: AbdmImportKind;
  /** Short headline shown in the timeline entry. */
  title: string;
  /** Optional secondary line — value, dose, etc. */
  detail?: string;
  /** Source clinic / facility that originally captured the record. */
  sourceClinic: string;
  /** City — shown as "Clinic, City" suffix. */
  sourceCity: string;
  /** ISO timestamp of the original record (used for "5 mo ago" labels). */
  recordedAt: string;
}

export interface AbdmImportProfile {
  patientId: string;
  /** Masked ABHA address shown in the scan overlay (e.g. fatima.s@abdm). */
  abhaAddress: string;
  /** Masked 14-digit ABHA number for display. */
  abhaNumberMasked: string;
  /** Where the records are being imported from (for the overlay label). */
  sourceFacilities: string[];
  records: AbdmImportRecord[];
}

const P008_IMPORTS: AbdmImportProfile = {
  patientId: "P008",
  abhaAddress: "fatima.sheikh@abdm",
  abhaNumberMasked: "91-XXXX-XXXX-4421",
  sourceFacilities: [
    "Ruby Hall Clinic, Mumbai",
    "Saifee Hospital, Mumbai",
  ],
  records: buildP008Records(),
};

/**
 * Source-clinic record dates are computed *relative to today* so the demo
 * narrative stays consistent with the scripted scribe transcript ("most
 * recent TSH from 5 months ago", "diagnosed 3 years ago"). If we hard-code
 * absolute dates they go stale and start reading as "2 yr ago" inside an
 * investor walkthrough.
 */
function buildP008Records(now: Date = new Date()): AbdmImportRecord[] {
  const monthsAgo = (m: number, hour = 10, minute = 0): string => {
    const d = new Date(now);
    d.setMonth(d.getMonth() - m);
    d.setHours(hour, minute, 0, 0);
    return d.toISOString();
  };

  return [
    {
      id: "abdm-p008-tsh",
      kind: "lab",
      title: "TSH 6.8 mIU/L (free T4 normal)",
      detail: "Most recent thyroid panel",
      sourceClinic: "Ruby Hall Clinic",
      sourceCity: "Mumbai",
      recordedAt: monthsAgo(5, 9, 15),
    },
    {
      id: "abdm-p008-levo",
      kind: "medication",
      title: "Levothyroxine 50 mcg once daily",
      detail: "Active prescription, refilled monthly",
      sourceClinic: "Ruby Hall Clinic",
      sourceCity: "Mumbai",
      recordedAt: monthsAgo(1, 11, 40),
    },
    {
      id: "abdm-p008-endo",
      kind: "consult",
      title: "Endocrinology consult — primary hypothyroidism (initial dx)",
      detail: "Dr. Anand Iyer · diagnostic visit, started Levothyroxine",
      sourceClinic: "Saifee Hospital",
      sourceCity: "Mumbai",
      recordedAt: monthsAgo(36, 16, 25),
    },
    {
      id: "abdm-p008-allergy",
      kind: "allergy",
      title: "No known drug allergies recorded",
      detail: "Allergy & immunisation summary verified",
      sourceClinic: "Ruby Hall Clinic",
      sourceCity: "Mumbai",
      recordedAt: monthsAgo(1, 11, 40),
    },
  ];
}

const PROFILES: Record<string, AbdmImportProfile> = {
  P008: P008_IMPORTS,
};

/**
 * Look up the ABDM cross-clinic import profile for a patient. Returns
 * `undefined` when the patient does not have a scripted handoff.
 */
export function getAbdmImportProfile(
  patientId: string | undefined | null,
): AbdmImportProfile | undefined {
  if (!patientId) return undefined;
  return PROFILES[patientId];
}

/**
 * Render-friendly "5 mo ago" / "3 yr ago" suffix for an imported record.
 * Kept here so timeline + overview note share identical phrasing.
 */
export function formatRelativeFromNow(iso: string, now: Date = new Date()): string {
  const then = new Date(iso).getTime();
  const diffMs = now.getTime() - then;
  if (diffMs < 0) return "today";

  const day = 24 * 60 * 60 * 1000;
  const days = Math.floor(diffMs / day);
  if (days < 1) return "today";
  if (days < 30) return `${days} d ago`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months} mo ago`;

  const years = Math.floor(days / 365);
  return years === 1 ? "1 yr ago" : `${years} yr ago`;
}
