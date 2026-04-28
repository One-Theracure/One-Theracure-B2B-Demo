# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Artifacts

### `artifacts/one-theracure` — One TheraCure Web App

A healthcare EMR (Electronic Medical Record) platform for Indian doctors ("AI-powered clinic in minutes").

**Tech**: React + Vite + Tailwind v3 + react-router-dom + react-hook-form + shadcn/ui

**Features**:
- Auth page with login modal and multi-step signup flow
- SecurityContext (mock auth with session/localStorage)
- Patient registration modal with multi-step form (demographics, insurance, emergency contact)
- Dashboard with sidebar navigation
- Command palette
- AI scribe, prescriptions, appointments, analytics pages
- Theme support (light/dark via next-themes)
- Fonts: Inter + Playfair Display from Google Fonts

**Supabase replacement**: `src/integrations/supabase/client.ts` is now a stub that falls through to the existing local-patient fallback in `PatientRegistrationModal.tsx`. No live database connection is required; auth is handled by the mock SecurityContext.

**Routes** (all under `<ProtectedRoute>` except auth):
- `/` → redirects to `/today`
- `/today` — Doctor's day landing (Now Seeing, Queue, Follow-ups, Sign-offs)
- `/patients` and `/patients/:id`
- `/encounters/:id` (with nested `Outlet`):
  - index → redirects to `/note`
  - `/note` → full `EncounterWorkspace` (documentation surface)
  - `/decision-support` → consult / DDx / A&P / chart-chat
  - `/patient-outputs` → instructions / med-assist / templates (AVS in Phase 6)
  - `/timeline` → audit-backed timeline
- `/audit` — alias redirect to `/settings/audit`
- `/insights` — Longitudinal patient analytics (`?patientId=` filter)
- `/frontdesk` — Operational queue with one-click "Send to Doctor" handoff
- `/settings/:view` — `profile|security|users|audit|specialties|integrations|notifications|preferences`
- `/auth`, `/sign-in/*`, `/sign-up/*` — Public auth routes

**Phase 3 patterns to preserve**:
- Encounter selection is 100% URL-driven via `/encounters/:id`. `EncounterWorkspace` accepts optional `initialEncounterId`/`initialPatient` props; in URL mode, the patient picker creates the encounter then `navigate()`s to `/encounters/:newId/note` — it never mutates local encounter state. `EncounterNoteSurface` passes `key={encounter.id}` to force a clean remount on encounter switch.
- Front-desk → doctor handoff goes through `eventBus.emit("queue.sent-to-doctor", ...)`; `TodayPage` subscribes via `eventBus.on()`.
- Healthcare safety contract: clients NEVER post `providerId`, `providerName`, `orgId`, or `clinicId` on encounter create — those are stamped server-side from the Clerk session. Tests assert this for every create call site.

### `artifacts/api-server` — API Server

Express API server at `/api`. Currently has only a `/api/healthz` endpoint. Extend it with routes for patients, appointments, etc. as needed.

### `artifacts/mockup-sandbox` — Design Mockup Sandbox

Used for UI prototyping/canvas work.

## Shared Libraries

- `lib/api-spec/` — OpenAPI spec (contract-first)
- `lib/api-client-react/` — Generated React Query hooks (from Orval)
- `lib/db/` — Drizzle schema + PostgreSQL pool
