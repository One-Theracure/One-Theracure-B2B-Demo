import { describe, it, expect, beforeEach } from "vitest";
import { demoEncounterStore, demoAuditStore } from "@/lib/demoStore";

describe("demoEncounterStore", () => {
  beforeEach(() => {
    demoEncounterStore.__resetForTests();
  });

  it("seeds at least one active encounter", () => {
    const all = demoEncounterStore.list();
    expect(all.length).toBeGreaterThanOrEqual(1);
    expect(all.some((e) => e.status === "active")).toBe(true);
  });

  it("filters by patientId", () => {
    const p1 = demoEncounterStore.list("P001");
    expect(p1.every((e) => e.patientId === "P001")).toBe(true);
    expect(p1.length).toBeGreaterThan(0);
  });

  it("create → get round-trip preserves fields", () => {
    const created = demoEncounterStore.create({
      patientId: "P002",
      chiefComplaint: "Test complaint",
      visitType: "consultation",
    });
    expect(created.id).toBeTruthy();
    expect(created.status).toBe("active");
    expect(created.chiefComplaint).toBe("Test complaint");
    const fetched = demoEncounterStore.get(created.id);
    expect(fetched.id).toBe(created.id);
  });

  it("update mutates and bumps updatedAt", async () => {
    const created = demoEncounterStore.create({ patientId: "P002" });
    await new Promise((r) => setTimeout(r, 5));
    const updated = demoEncounterStore.update(created.id, { status: "completed" });
    expect(updated.status).toBe("completed");
    expect(updated.updatedAt >= created.updatedAt).toBe(true);
  });

  it("delete soft-removes (hidden from list, keeps row)", () => {
    const created = demoEncounterStore.create({ patientId: "P002" });
    demoEncounterStore.delete(created.id);
    expect(demoEncounterStore.list().some((e) => e.id === created.id)).toBe(false);
    expect(() => demoEncounterStore.get(created.id)).toThrow();
  });
});

describe("demoAuditStore", () => {
  beforeEach(() => {
    demoEncounterStore.__resetForTests();
  });

  it("logs an event with hardcoded demo identity", () => {
    const ev = demoAuditStore.log({
      action: "cds.generate",
      entityType: "cds_output",
      patientId: "P001",
    });
    expect(ev.userId).toBe("demo-doctor-001");
    expect(ev.orgId).toBe("demo-org");
    expect(ev.action).toBe("cds.generate");
  });

  it("query filters by patientId", () => {
    const rows = demoAuditStore.query({ patientId: "P001" });
    expect(rows.every((r) => r.patientId === "P001")).toBe(true);
  });
});
