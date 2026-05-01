import jsPDF from "jspdf";
import type {
  SmartPrescriptionData,
  DigitalAVSData,
} from "@/services/documentOutputService";

const TEAL_DARK: [number, number, number] = [13, 94, 88];
const TEAL_MID: [number, number, number] = [16, 148, 136];
const EMERALD: [number, number, number] = [5, 150, 105];
const ROSE_DARK: [number, number, number] = [136, 19, 55];
const ROSE_MID: [number, number, number] = [225, 29, 72];
const PINK_LIGHT: [number, number, number] = [253, 232, 240];
const TEAL_LIGHT: [number, number, number] = [240, 253, 250];
const TEXT_DARK: [number, number, number] = [30, 41, 59];
const TEXT_MUTED: [number, number, number] = [100, 116, 139];
const BORDER: [number, number, number] = [226, 232, 240];

const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const MARGIN_X = 16;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_X * 2;

type AvsLanguage = DigitalAVSData["language"];

interface AvsLanguageStrings {
  pageTitle: string;
  visitOn: (date: string) => string;
  doctorLabel: string;
  whatWeFound: string;
  whatToDo: string;
  yourMedications: string;
  testsAdvised: string;
  nextAppointment: string;
  warningSigns: string;
  goER: string;
  callClinic: string;
  dailyCare: string;
  digitalCopyFooter: string;
}

const AVS_STRINGS: Record<AvsLanguage, AvsLanguageStrings> = {
  en: {
    pageTitle: "Your Visit Summary",
    visitOn: (d) => `Visit on ${d}`,
    doctorLabel: "Doctor:",
    whatWeFound: "What we found",
    whatToDo: "What you should do",
    yourMedications: "Your medications",
    testsAdvised: "Tests you may need",
    nextAppointment: "Your next appointment",
    warningSigns: "Warning signs — when to seek help",
    goER: "Go to Emergency Room if:",
    callClinic: "Call our clinic if:",
    dailyCare: "Daily care tips",
    digitalCopyFooter: "Digital copy powered by One TheraCure",
  },
  hi: {
    pageTitle: "Your Visit Summary (Hindi)",
    visitOn: (d) => `Visit on ${d}`,
    doctorLabel: "Doctor:",
    whatWeFound: "What we found",
    whatToDo: "What you should do",
    yourMedications: "Your medications",
    testsAdvised: "Tests you may need",
    nextAppointment: "Your next appointment",
    warningSigns: "Warning signs",
    goER: "Go to Emergency Room if:",
    callClinic: "Call our clinic if:",
    dailyCare: "Daily care tips",
    digitalCopyFooter: "Digital copy powered by One TheraCure",
  },
  mr: {
    pageTitle: "Your Visit Summary (Marathi)",
    visitOn: (d) => `Visit on ${d}`,
    doctorLabel: "Doctor:",
    whatWeFound: "What we found",
    whatToDo: "What you should do",
    yourMedications: "Your medications",
    testsAdvised: "Tests you may need",
    nextAppointment: "Your next appointment",
    warningSigns: "Warning signs",
    goER: "Go to Emergency Room if:",
    callClinic: "Call our clinic if:",
    dailyCare: "Daily care tips",
    digitalCopyFooter: "Digital copy powered by One TheraCure",
  },
  ta: {
    pageTitle: "Your Visit Summary (Tamil)",
    visitOn: (d) => `Visit on ${d}`,
    doctorLabel: "Doctor:",
    whatWeFound: "What we found",
    whatToDo: "What you should do",
    yourMedications: "Your medications",
    testsAdvised: "Tests you may need",
    nextAppointment: "Your next appointment",
    warningSigns: "Warning signs",
    goER: "Go to Emergency Room if:",
    callClinic: "Call our clinic if:",
    dailyCare: "Daily care tips",
    digitalCopyFooter: "Digital copy powered by One TheraCure",
  },
  te: {
    pageTitle: "Your Visit Summary (Telugu)",
    visitOn: (d) => `Visit on ${d}`,
    doctorLabel: "Doctor:",
    whatWeFound: "What we found",
    whatToDo: "What you should do",
    yourMedications: "Your medications",
    testsAdvised: "Tests you may need",
    nextAppointment: "Your next appointment",
    warningSigns: "Warning signs",
    goER: "Go to Emergency Room if:",
    callClinic: "Call our clinic if:",
    dailyCare: "Daily care tips",
    digitalCopyFooter: "Digital copy powered by One TheraCure",
  },
  bn: {
    pageTitle: "Your Visit Summary (Bengali)",
    visitOn: (d) => `Visit on ${d}`,
    doctorLabel: "Doctor:",
    whatWeFound: "What we found",
    whatToDo: "What you should do",
    yourMedications: "Your medications",
    testsAdvised: "Tests you may need",
    nextAppointment: "Your next appointment",
    warningSigns: "Warning signs",
    goER: "Go to Emergency Room if:",
    callClinic: "Call our clinic if:",
    dailyCare: "Daily care tips",
    digitalCopyFooter: "Digital copy powered by One TheraCure",
  },
  kn: {
    pageTitle: "Your Visit Summary (Kannada)",
    visitOn: (d) => `Visit on ${d}`,
    doctorLabel: "Doctor:",
    whatWeFound: "What we found",
    whatToDo: "What you should do",
    yourMedications: "Your medications",
    testsAdvised: "Tests you may need",
    nextAppointment: "Your next appointment",
    warningSigns: "Warning signs",
    goER: "Go to Emergency Room if:",
    callClinic: "Call our clinic if:",
    dailyCare: "Daily care tips",
    digitalCopyFooter: "Digital copy powered by One TheraCure",
  },
};

function setColor(
  doc: jsPDF,
  rgb: [number, number, number],
  kind: "fill" | "text" | "draw",
) {
  if (kind === "fill") doc.setFillColor(rgb[0], rgb[1], rgb[2]);
  if (kind === "text") doc.setTextColor(rgb[0], rgb[1], rgb[2]);
  if (kind === "draw") doc.setDrawColor(rgb[0], rgb[1], rgb[2]);
}

function drawGradientHeader(
  doc: jsPDF,
  start: [number, number, number],
  end: [number, number, number],
  height: number,
) {
  // Approximate a gradient by drawing many thin rectangles across the page.
  const steps = 60;
  const stripeH = height / steps;
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);
    const r = Math.round(start[0] + (end[0] - start[0]) * t);
    const g = Math.round(start[1] + (end[1] - start[1]) * t);
    const b = Math.round(start[2] + (end[2] - start[2]) * t);
    doc.setFillColor(r, g, b);
    doc.rect(0, i * stripeH, PAGE_WIDTH, stripeH + 0.5, "F");
  }
}

function drawClinicFooter(doc: jsPDF, rx: SmartPrescriptionData) {
  const y = PAGE_HEIGHT - 14;
  setColor(doc, BORDER, "draw");
  doc.setLineWidth(0.2);
  doc.line(MARGIN_X, y, PAGE_WIDTH - MARGIN_X, y);
  setColor(doc, TEXT_MUTED, "text");
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(
    `${rx.clinicName} · ${rx.clinicAddress} · ${rx.clinicPhone}`,
    MARGIN_X,
    y + 5,
  );
  doc.text(
    "Digital copy powered by One TheraCure",
    PAGE_WIDTH - MARGIN_X,
    y + 5,
    { align: "right" },
  );
}

function wrapAndPrint(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight = 5,
): number {
  const lines = doc.splitTextToSize(text, maxWidth);
  doc.text(lines, x, y);
  return y + lines.length * lineHeight;
}

function renderPrescriptionPage(
  doc: jsPDF,
  rx: SmartPrescriptionData,
): void {
  // Gradient header band (teal → emerald), matching the on-screen card.
  drawGradientHeader(doc, TEAL_DARK, EMERALD, 38);

  setColor(doc, [255, 255, 255], "text");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(rx.clinicName, MARGIN_X, 16);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(rx.clinicAddress, MARGIN_X, 22);
  doc.text(rx.clinicPhone, MARGIN_X, 27);

  // Doctor block, right aligned
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(rx.doctorName, PAGE_WIDTH - MARGIN_X, 16, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(rx.doctorRegistration, PAGE_WIDTH - MARGIN_X, 21, {
    align: "right",
  });
  doc.text("MBBS, MD (General Medicine)", PAGE_WIDTH - MARGIN_X, 25, {
    align: "right",
  });

  // Patient bar (light teal)
  setColor(doc, TEAL_LIGHT, "fill");
  doc.rect(MARGIN_X, 44, CONTENT_WIDTH, 14, "F");
  setColor(doc, TEAL_DARK, "text");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("Patient", MARGIN_X + 3, 50);
  doc.text("Age / Gender", MARGIN_X + 60, 50);
  doc.text("MRN", MARGIN_X + 105, 50);
  doc.text("Date", MARGIN_X + 140, 50);

  setColor(doc, TEXT_DARK, "text");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(rx.patientName, MARGIN_X + 3, 55);
  doc.text(`${rx.patientAge} yrs / ${rx.patientGender}`, MARGIN_X + 60, 55);
  doc.text(rx.mrn, MARGIN_X + 105, 55);
  doc.text(
    new Date(rx.generatedAt).toLocaleDateString("en-IN"),
    MARGIN_X + 140,
    55,
  );

  // Diagnosis
  let cursor = 68;
  setColor(doc, TEAL_MID, "text");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Diagnosis", MARGIN_X, cursor);
  cursor += 5;
  setColor(doc, TEXT_DARK, "text");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  cursor = wrapAndPrint(doc, rx.diagnosis, MARGIN_X, cursor, CONTENT_WIDTH);

  // Rx — Medications
  cursor += 4;
  setColor(doc, TEAL_MID, "text");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Rx", MARGIN_X, cursor);
  doc.setFontSize(10);
  doc.text("Medications", MARGIN_X + 12, cursor);
  cursor += 5;

  setColor(doc, TEXT_DARK, "text");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  rx.medications.forEach((m, i) => {
    if (cursor > 230) {
      drawClinicFooter(doc, rx);
      doc.addPage();
      cursor = 20;
    }
    doc.setFont("helvetica", "bold");
    doc.text(`${i + 1}. ${m.name} — ${m.dosage}`, MARGIN_X, cursor);
    cursor += 5;
    doc.setFont("helvetica", "normal");
    setColor(doc, TEXT_MUTED, "text");
    doc.setFontSize(9);
    doc.text(
      `${m.route} · ${m.frequency} · ${m.duration}`,
      MARGIN_X + 6,
      cursor,
    );
    cursor += 4;
    if (m.instructions) {
      doc.setFont("helvetica", "italic");
      cursor = wrapAndPrint(
        doc,
        m.instructions,
        MARGIN_X + 6,
        cursor,
        CONTENT_WIDTH - 6,
        4,
      );
      doc.setFont("helvetica", "normal");
    }
    setColor(doc, TEXT_DARK, "text");
    doc.setFontSize(10);
    cursor += 2;
  });

  // Investigations
  if (rx.investigations.length) {
    cursor += 4;
    setColor(doc, TEAL_MID, "text");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Investigations advised", MARGIN_X, cursor);
    cursor += 5;
    setColor(doc, TEXT_DARK, "text");
    doc.setFont("helvetica", "normal");
    cursor = wrapAndPrint(
      doc,
      rx.investigations.join(", "),
      MARGIN_X,
      cursor,
      CONTENT_WIDTH,
    );
  }

  // Follow-up + Special instructions
  cursor += 4;
  setColor(doc, TEAL_MID, "text");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Follow-up", MARGIN_X, cursor);
  doc.text("Instructions", MARGIN_X + CONTENT_WIDTH / 2, cursor);
  cursor += 5;
  setColor(doc, TEXT_DARK, "text");
  doc.setFont("helvetica", "normal");
  const halfWidth = CONTENT_WIDTH / 2 - 4;
  const followLines = doc.splitTextToSize(rx.followUp, halfWidth);
  const instrLines = doc.splitTextToSize(rx.specialInstructions, halfWidth);
  doc.text(followLines, MARGIN_X, cursor);
  doc.text(instrLines, MARGIN_X + CONTENT_WIDTH / 2, cursor);
  cursor += Math.max(followLines.length, instrLines.length) * 5;

  // Signature line
  const sigY = Math.max(cursor + 18, 240);
  setColor(doc, TEXT_MUTED, "draw");
  doc.setLineWidth(0.3);
  doc.line(PAGE_WIDTH - MARGIN_X - 60, sigY, PAGE_WIDTH - MARGIN_X, sigY);
  setColor(doc, TEXT_DARK, "text");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(rx.doctorName, PAGE_WIDTH - MARGIN_X, sigY + 5, {
    align: "right",
  });
  setColor(doc, TEXT_MUTED, "text");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(rx.doctorRegistration, PAGE_WIDTH - MARGIN_X, sigY + 9, {
    align: "right",
  });

  drawClinicFooter(doc, rx);
}

function renderAvsPage(
  doc: jsPDF,
  rx: SmartPrescriptionData,
  avs: DigitalAVSData,
): void {
  doc.addPage();

  // Rose gradient header band
  drawGradientHeader(doc, ROSE_DARK, ROSE_MID, 32);
  setColor(doc, [255, 255, 255], "text");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  const strings = AVS_STRINGS[avs.language] ?? AVS_STRINGS.en;
  doc.text(strings.pageTitle, MARGIN_X, 16);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Dear ${avs.patientName}`, MARGIN_X, 22);
  const visitDateStr = new Date(avs.visitDate).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  doc.text(strings.visitOn(visitDateStr), MARGIN_X, 27);
  doc.text(
    `${strings.doctorLabel} ${avs.doctorName}`,
    PAGE_WIDTH - MARGIN_X,
    27,
    { align: "right" },
  );

  let cursor = 42;

  const section = (label: string, items: string[]) => {
    if (!items.length) return;
    if (cursor > 250) {
      drawClinicFooter(doc, rx);
      doc.addPage();
      cursor = 20;
    }
    setColor(doc, ROSE_DARK, "text");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(label, MARGIN_X, cursor);
    cursor += 5;
    setColor(doc, TEXT_DARK, "text");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    items.forEach((item) => {
      const lines = doc.splitTextToSize(`• ${item}`, CONTENT_WIDTH);
      doc.text(lines, MARGIN_X, cursor);
      cursor += lines.length * 5;
    });
    cursor += 3;
  };

  section(strings.whatWeFound, avs.whatWeFound);
  section(strings.whatToDo, avs.whatToDo);

  // Medications block (rose-tinted card)
  if (avs.medications.length) {
    if (cursor > 230) {
      drawClinicFooter(doc, rx);
      doc.addPage();
      cursor = 20;
    }
    setColor(doc, ROSE_DARK, "text");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(strings.yourMedications, MARGIN_X, cursor);
    cursor += 5;
    avs.medications.forEach((m) => {
      setColor(doc, PINK_LIGHT, "fill");
      const cardH = 12;
      doc.roundedRect(MARGIN_X, cursor, CONTENT_WIDTH, cardH, 1.5, 1.5, "F");
      setColor(doc, ROSE_DARK, "text");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text(`${m.name} (${m.dose})`, MARGIN_X + 3, cursor + 4.5);
      setColor(doc, TEXT_DARK, "text");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      const howToTakeLines = doc.splitTextToSize(
        m.howToTake,
        CONTENT_WIDTH - 6,
      );
      doc.text(howToTakeLines[0] ?? "", MARGIN_X + 3, cursor + 9);
      cursor += cardH + 2;
    });
    cursor += 2;
  }

  section(strings.testsAdvised, avs.testsAdvised);

  // Follow-up
  if (cursor > 250) {
    drawClinicFooter(doc, rx);
    doc.addPage();
    cursor = 20;
  }
  setColor(doc, ROSE_DARK, "text");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(strings.nextAppointment, MARGIN_X, cursor);
  cursor += 5;
  setColor(doc, TEXT_DARK, "text");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const followDate = new Date(avs.followUpDate).toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  doc.text(followDate, MARGIN_X, cursor);
  cursor += 5;
  setColor(doc, TEXT_MUTED, "text");
  doc.setFontSize(9);
  cursor = wrapAndPrint(
    doc,
    avs.followUpInstructions,
    MARGIN_X,
    cursor,
    CONTENT_WIDTH,
  );
  cursor += 3;

  // Warning signs
  if (cursor > 230) {
    drawClinicFooter(doc, rx);
    doc.addPage();
    cursor = 20;
  }
  setColor(doc, ROSE_DARK, "text");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(strings.warningSigns, MARGIN_X, cursor);
  cursor += 5;

  setColor(doc, TEXT_DARK, "text");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text(strings.goER, MARGIN_X, cursor);
  cursor += 4;
  doc.setFont("helvetica", "normal");
  avs.warningSignsGoER.forEach((w) => {
    const lines = doc.splitTextToSize(`• ${w}`, CONTENT_WIDTH);
    doc.text(lines, MARGIN_X, cursor);
    cursor += lines.length * 4.5;
  });
  cursor += 2;

  doc.setFont("helvetica", "bold");
  doc.text(strings.callClinic, MARGIN_X, cursor);
  cursor += 4;
  doc.setFont("helvetica", "normal");
  avs.warningSignsCallClinic.forEach((w) => {
    const lines = doc.splitTextToSize(`• ${w}`, CONTENT_WIDTH);
    doc.text(lines, MARGIN_X, cursor);
    cursor += lines.length * 4.5;
  });

  if (avs.careRoutine.length) {
    cursor += 3;
    section(strings.dailyCare, avs.careRoutine);
  }

  drawClinicFooter(doc, rx);
}

export interface BuiltPdf {
  blob: Blob;
  fileName: string;
  dataUrl: string;
}

export function buildPrescriptionPdf(
  rx: SmartPrescriptionData,
  avs?: DigitalAVSData | null,
): BuiltPdf {
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  renderPrescriptionPage(doc, rx);
  if (avs) renderAvsPage(doc, rx, avs);

  const datePart = new Date(rx.generatedAt).toISOString().slice(0, 10);
  const safeMrn = rx.mrn.replace(/[^a-z0-9_-]/gi, "");
  const fileName = `prescription_${safeMrn}_${datePart}.pdf`;

  const blob = doc.output("blob");
  const dataUrl = doc.output("datauristring");
  return { blob, fileName, dataUrl };
}

export function downloadPdf(built: BuiltPdf): void {
  const url = URL.createObjectURL(built.blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = built.fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  // Defer revocation so the click has a chance to start the download.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
