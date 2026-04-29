import type { AnalyticsMonth, KpiSnapshot, Integration } from "@/types/demo";

export const analytics12Months: AnalyticsMonth[] = [
  { month: "Feb '25", opdVolume: 412, followUpRecovery: 38, retention: 64, rxCompletion: 71, appScans: 318, docMinutesSaved: 1820 },
  { month: "Mar '25", opdVolume: 438, followUpRecovery: 41, retention: 65, rxCompletion: 73, appScans: 342, docMinutesSaved: 1944 },
  { month: "Apr '25", opdVolume: 465, followUpRecovery: 44, retention: 67, rxCompletion: 74, appScans: 388, docMinutesSaved: 2105 },
  { month: "May '25", opdVolume: 492, followUpRecovery: 47, retention: 68, rxCompletion: 76, appScans: 421, docMinutesSaved: 2244 },
  { month: "Jun '25", opdVolume: 511, followUpRecovery: 51, retention: 70, rxCompletion: 78, appScans: 466, docMinutesSaved: 2401 },
  { month: "Jul '25", opdVolume: 528, followUpRecovery: 55, retention: 72, rxCompletion: 80, appScans: 502, docMinutesSaved: 2588 },
  { month: "Aug '25", opdVolume: 552, followUpRecovery: 59, retention: 74, rxCompletion: 82, appScans: 547, docMinutesSaved: 2702 },
  { month: "Sep '25", opdVolume: 574, followUpRecovery: 62, retention: 75, rxCompletion: 84, appScans: 591, docMinutesSaved: 2840 },
  { month: "Oct '25", opdVolume: 593, followUpRecovery: 64, retention: 77, rxCompletion: 85, appScans: 627, docMinutesSaved: 2986 },
  { month: "Nov '25", opdVolume: 612, followUpRecovery: 67, retention: 78, rxCompletion: 87, appScans: 668, docMinutesSaved: 3128 },
  { month: "Dec '25", opdVolume: 638, followUpRecovery: 70, retention: 79, rxCompletion: 88, appScans: 712, docMinutesSaved: 3262 },
  { month: "Jan '26", opdVolume: 661, followUpRecovery: 73, retention: 81, rxCompletion: 90, appScans: 758, docMinutesSaved: 3398 },
];

export const kpiSnapshot: KpiSnapshot = {
  opdVolume: { value: 661, deltaPct: 3.6 },
  docTimeSaved: { value: 3398, unit: "min", deltaPct: 4.2 },
  followUpRecovery: { value: 73, deltaPct: 4.3 },
  retention: { value: 81, deltaPct: 2.5 },
  rxCompletion: { value: 90, deltaPct: 2.3 },
  appScans: { value: 758, deltaPct: 6.5 },
};

// Spotlight order matters: ABDM, Thyrocare, 1mg, Apollo are the four narrative
// partners called out in the investor pitch. PhonePe + WhatsApp follow as
// supporting capabilities — kept visible but de-emphasized in the panel.
export const integrations: Integration[] = [
  {
    id: "abdm",
    name: "ABDM (NHA)",
    category: "National Health Stack",
    status: "connected",
    description: "Ayushman Bharat Digital Mission · UHID + ABHA verification, FHIR R4 records exchange.",
    logoLetter: "A",
  },
  {
    id: "thyrocare",
    name: "Thyrocare Labs",
    category: "Lab partner",
    status: "connected",
    description: "Direct order placement, home sample collection, results pulled into the chart automatically.",
    logoLetter: "T",
  },
  {
    id: "1mg",
    name: "1mg Pharmacy",
    category: "Pharmacy partner",
    status: "pending",
    description: "Auto-fulfilment of e-prescriptions with 90-min delivery in 18 cities.",
    logoLetter: "M",
  },
  {
    id: "apollo-his",
    name: "Apollo HIS",
    category: "Hospital information system",
    status: "available",
    description: "Bidirectional sync for shared patients across the Apollo network.",
    logoLetter: "AP",
  },
  {
    id: "phonepe",
    name: "PhonePe Payments",
    category: "Payments",
    status: "connected",
    description: "Instant settlement, UPI auto-collect for follow-up payments.",
    logoLetter: "P",
  },
  {
    id: "whatsapp",
    name: "WhatsApp Business",
    category: "Patient communication",
    status: "connected",
    description: "Care reminders, AVS delivery, and follow-up nudges via official WABA.",
    logoLetter: "W",
  },
];

// The four narrative partners surfaced first in the Admin integration panel.
export const SPOTLIGHT_INTEGRATION_IDS = ["abdm", "thyrocare", "1mg", "apollo-his"] as const;
