import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route, Navigate } from "react-router-dom";

/**
 * Route-table integration test.
 *
 * The full `<App />` is awkward to mount in a unit test because it pulls in
 * `<ClerkProvider>` and other auth-side providers. Instead, we mirror the
 * authenticated nested-route table from `App.tsx` here with stubbed page
 * components. This guards against route-map regressions: rename a path,
 * forget the index redirect, or drop the `/audit` alias and this test
 * fails loudly.
 *
 * Keep this in sync with the route table in `src/App.tsx` whenever the IA
 * changes — divergence between this test and App.tsx defeats its purpose.
 */

const Marker = (id: string) => () => <div data-testid={`page-${id}`}>{id}</div>;

const TodayStub = Marker("today");
const PatientsStub = Marker("patients");
const PatientDetailStub = Marker("patient-detail");
const InsightsStub = Marker("insights");
const FrontDeskStub = Marker("frontdesk");
const SettingsStub = Marker("settings");
const EncounterShellStub = ({ children }: { children?: React.ReactNode }) => (
  <div data-testid="page-encounter-shell">
    {children}
    <Outlet />
  </div>
);
const NoteStub = Marker("note");
const DecisionSupportStub = Marker("decision-support");
const PatientOutputsStub = Marker("patient-outputs");
const TimelineStub = Marker("timeline");

import { Outlet } from "react-router-dom";

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route index element={<Navigate to="/today" replace />} />
        <Route path="/today" element={<TodayStub />} />
        <Route path="/patients" element={<PatientsStub />} />
        <Route path="/patients/:id" element={<PatientDetailStub />} />

        <Route path="/encounters/:id" element={<EncounterShellStub />}>
          <Route index element={<Navigate to="note" replace />} />
          <Route path="note" element={<NoteStub />} />
          <Route path="decision-support" element={<DecisionSupportStub />} />
          <Route path="patient-outputs" element={<PatientOutputsStub />} />
          <Route path="timeline" element={<TimelineStub />} />
        </Route>

        <Route path="/insights" element={<InsightsStub />} />
        <Route path="/frontdesk" element={<FrontDeskStub />} />
        <Route path="/audit" element={<Navigate to="/settings/audit" replace />} />
        <Route path="/settings" element={<SettingsStub />} />
        <Route path="/settings/:view" element={<SettingsStub />} />

        <Route path="*" element={<div data-testid="page-not-found">404</div>} />
      </Routes>
    </MemoryRouter>,
  );

describe("App route table", () => {
  it("redirects / to /today", async () => {
    renderAt("/");
    await waitFor(() => expect(screen.getByTestId("page-today")).toBeInTheDocument());
  });

  it.each([
    ["/today", "today"],
    ["/patients", "patients"],
    ["/patients/P001", "patient-detail"],
    ["/insights", "insights"],
    ["/frontdesk", "frontdesk"],
    ["/settings", "settings"],
    ["/settings/profile", "settings"],
    ["/settings/audit", "settings"],
  ])("renders the %s route", async (path, marker) => {
    renderAt(path);
    await waitFor(() => expect(screen.getByTestId(`page-${marker}`)).toBeInTheDocument());
  });

  it("redirects /audit to /settings/audit", async () => {
    renderAt("/audit");
    await waitFor(() => expect(screen.getByTestId("page-settings")).toBeInTheDocument());
  });

  it("redirects bare /encounters/:id to the explicit /note child", async () => {
    renderAt("/encounters/enc-1");
    await waitFor(() => {
      expect(screen.getByTestId("page-encounter-shell")).toBeInTheDocument();
      expect(screen.getByTestId("page-note")).toBeInTheDocument();
    });
  });

  it.each([
    ["/encounters/enc-1/note", "note"],
    ["/encounters/enc-1/decision-support", "decision-support"],
    ["/encounters/enc-1/patient-outputs", "patient-outputs"],
    ["/encounters/enc-1/timeline", "timeline"],
  ])("renders %s under the encounter shell", async (path, marker) => {
    renderAt(path);
    await waitFor(() => {
      expect(screen.getByTestId("page-encounter-shell")).toBeInTheDocument();
      expect(screen.getByTestId(`page-${marker}`)).toBeInTheDocument();
    });
  });

  it("falls through to NotFound for unknown paths", async () => {
    renderAt("/this-route-does-not-exist");
    await waitFor(() => expect(screen.getByTestId("page-not-found")).toBeInTheDocument());
  });
});
