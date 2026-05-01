import { describe, it, expect, beforeEach } from "vitest";
import {
  createAmbientSession,
  appendTranscript,
  stopAmbientSession,
  getSession,
  __resetAmbientSessionCacheForTests,
} from "@/services/ambientSessionService";

describe("ambientSessionService", () => {
  beforeEach(() => {
    localStorage.clear();
    __resetAmbientSessionCacheForTests();
  });

  it("createAmbientSession returns an active session with empty transcript and persists to localStorage", () => {
    const s = createAmbientSession("p1", "enc1");
    expect(s.id).toMatch(/^ambs-/);
    expect(s.status).toBe("active");
    expect(s.rawTranscript).toBe("");
    expect(s.patientId).toBe("p1");
    expect(s.encounterId).toBe("enc1");

    const raw = localStorage.getItem("ot_ambient_sessions");
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw!);
    expect(parsed.find((x: { id: string }) => x.id === s.id)).toBeDefined();
  });

  it("appendTranscript happy path appends chunk with leading space and updates updatedAt", async () => {
    const s = createAmbientSession("p1", "enc1");
    const firstUpdated = s.updatedAt;
    // ensure clock ticks
    await new Promise((r) => setTimeout(r, 5));

    const u1 = appendTranscript(s.id, "Hello");
    expect(u1).not.toBeNull();
    expect(u1!.rawTranscript).toBe("Hello");
    expect(u1!.updatedAt).not.toBe(firstUpdated);

    const u2 = appendTranscript(s.id, "world");
    expect(u2!.rawTranscript).toBe("Hello world");
  });

  it("appendTranscript returns null for an unknown sessionId — pins the contract ScribingModal relies on", () => {
    const result = appendTranscript("does-not-exist", "anything");
    expect(result).toBeNull();
  });

  it("extractStructured populates physicalExam BP/Pulse fields when transcript contains them", () => {
    const s = createAmbientSession("p1", "enc1");
    const u = appendTranscript(
      s.id,
      "On examination today blood pressure: 138/88 and pulse: 78. Patient is comfortable.",
    );
    expect(u).not.toBeNull();
    const exam = u!.structuredOutput.physicalExam.content;
    expect(exam).toContain("BP: 138/88");
    expect(exam).toContain("Pulse: 78");
  });

  it("extractStructured raises a Warfarin+NSAID safety alert when the transcript pairs warfarin with ibuprofen", () => {
    const s = createAmbientSession("p005", "enc-meera");
    const u = appendTranscript(
      s.id,
      "Patient on Warfarin 5mg daily. She started taking over-the-counter Ibuprofen 400mg three times daily for knee pain.",
    );
    expect(u).not.toBeNull();
    const alerts = u!.structuredOutput.safetyAlerts;
    expect(alerts).toHaveLength(1);
    expect(alerts[0].id).toBe("drug-interaction:warfarin+nsaid");
    expect(alerts[0].severity).toBe("high");
    expect(alerts[0].title.toLowerCase()).toContain("warfarin");
    expect(alerts[0].title.toLowerCase()).toContain("ibuprofen");
    expect(alerts[0].quickAction?.label).toMatch(/paracetamol/i);
  });

  it("extractStructured does not duplicate the same safety alert across multiple appends", () => {
    const s = createAmbientSession("p005", "enc-meera");
    appendTranscript(s.id, "Patient is on Warfarin 5mg daily.");
    const u = appendTranscript(s.id, "Started Ibuprofen 400mg today for knee pain.");
    appendTranscript(s.id, "Continue Warfarin and stop Ibuprofen.");
    expect(u).not.toBeNull();
    const refetched = getSession(s.id)!;
    const sameIdAlerts = refetched.structuredOutput.safetyAlerts.filter(
      (a) => a.id === "drug-interaction:warfarin+nsaid",
    );
    expect(sameIdAlerts).toHaveLength(1);
  });

  it("extractStructured does NOT raise the Warfarin+NSAID alert when only topical Diclofenac is mentioned alongside Warfarin", () => {
    const s = createAmbientSession("p005", "enc-meera");
    const u = appendTranscript(
      s.id,
      "Patient on Warfarin 5mg daily; knee pain managed with topical Diclofenac gel only.",
    );
    expect(u).not.toBeNull();
    expect(u!.structuredOutput.safetyAlerts).toHaveLength(0);
  });

  it("stopAmbientSession marks completed and generates AVS draft", () => {
    const s = createAmbientSession("p1", "enc1");
    appendTranscript(s.id, "Patient complaining of fatigue. Plan to start metformin. Follow-up in 2 weeks.");
    const stopped = stopAmbientSession(s.id, 120);
    expect(stopped).not.toBeNull();
    expect(stopped!.status).toBe("completed");
    expect(stopped!.durationSeconds).toBe(120);
    expect(stopped!.avsGenerated).toBe(true);
    expect(stopped!.avsDraft).toContain("After-Visit Summary");

    const refetched = getSession(s.id);
    expect(refetched?.status).toBe("completed");
  });
});
