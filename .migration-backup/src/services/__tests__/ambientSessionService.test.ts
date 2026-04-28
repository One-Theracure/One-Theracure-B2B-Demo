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
