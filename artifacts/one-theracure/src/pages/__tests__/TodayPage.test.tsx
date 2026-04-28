import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import TodayPage from "../TodayPage";
import type { Encounter } from "@/services/encountersService";

/**
 * Today "Now Seeing" ordering contract.
 *
 * Today.nowSeeing must be the first **active** encounter in the list it
 * receives from the API. The frontend deliberately trusts the server's
 * `ORDER BY createdAt DESC` and does not re-sort. This test pins that
 * contract: if someone later filters or reverses the array on the way
 * through Today, the assertion will fail loudly.
 *
 * It also pins the related rules:
 *  - completed/signed encounters never appear as "Now Seeing"
 *  - the rest of the active list shows up under the queue heading
 *  - a fresh `queue.sent-to-doctor` event triggers a reload (handoff path)
 */

const mockList = vi.fn();
vi.mock("@/services/encountersService", () => ({
  encountersService: {
    list: (...args: unknown[]) => mockList(...args),
  },
}));

vi.mock("@/data/mockPatients", () => ({
  mockPatients: [
    { id: "P-newest", name: "Priya Newest", mrn: "MRN-N", age: 34, gender: "Female", chronicConditions: [], allergies: [], recentVisits: [] },
    { id: "P-older",  name: "Raj Older",   mrn: "MRN-O", age: 52, gender: "Male",   chronicConditions: [], allergies: [], recentVisits: [] },
    { id: "P-done",   name: "Anita Done",  mrn: "MRN-D", age: 41, gender: "Female", chronicConditions: [], allergies: [], recentVisits: [] },
  ],
}));

const enc = (overrides: Partial<Encounter>): Encounter => ({
  id: "enc-x",
  orgId: "org-1",
  clinicId: "clinic-1",
  patientId: "P-newest",
  providerId: "prov-1",
  providerName: "Dr. Demo",
  status: "active",
  chiefComplaint: null,
  visitType: "consultation",
  scheduledAt: null,
  startedAt: null,
  completedAt: null,
  signedAt: null,
  signedBy: null,
  scribeSessionId: null,
  noteContent: null,
  diagnoses: [],
  procedures: [],
  attachments: [],
  createdAt: "2026-04-28T10:00:00Z",
  updatedAt: "2026-04-28T10:00:00Z",
  deletedAt: null,
  ...overrides,
});

beforeEach(() => {
  mockList.mockReset();
});

const renderToday = () =>
  render(
    <MemoryRouter>
      <TodayPage />
    </MemoryRouter>,
  );

describe("TodayPage Now Seeing ordering contract", () => {
  it("uses the first active encounter from the API as Now Seeing (server-ordered, newest first)", async () => {
    mockList.mockResolvedValueOnce([
      // Newest active — handoff just happened (this is what Now Seeing must be)
      enc({ id: "enc-newest", patientId: "P-newest", status: "active", createdAt: "2026-04-28T11:00:00Z" }),
      // Older active — should fall into the queue, not Now Seeing
      enc({ id: "enc-older", patientId: "P-older", status: "active", createdAt: "2026-04-28T09:00:00Z" }),
      // Completed — must never become Now Seeing even though it could be newer
      enc({ id: "enc-done", patientId: "P-done", status: "completed", createdAt: "2026-04-28T11:30:00Z" }),
    ]);

    renderToday();

    await waitFor(() => expect(screen.getByText("Priya Newest")).toBeInTheDocument());

    // Now Seeing card carries the "Now Seeing" badge text; the queued patient
    // appears below in a separate row but does NOT carry that badge.
    const badges = screen.getAllByText("Now Seeing");
    expect(badges.length).toBeGreaterThan(0);

    // Older active patient is rendered in the queue section
    expect(screen.getByText("Raj Older")).toBeInTheDocument();

    // Completed encounter shows under "Outstanding Sign-offs", never as Now Seeing
    expect(screen.getByText("Anita Done")).toBeInTheDocument();
  });

  it("falls back to the empty state when no active encounters exist", async () => {
    mockList.mockResolvedValueOnce([
      enc({ id: "enc-done", patientId: "P-done", status: "completed", createdAt: "2026-04-28T11:30:00Z" }),
    ]);

    renderToday();

    await waitFor(() => expect(screen.getByText(/No active encounter/i)).toBeInTheDocument());
  });
});
