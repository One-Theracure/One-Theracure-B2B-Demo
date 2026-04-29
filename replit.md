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

### `artifacts/one-theracure` — One TheraCure (Investor Demo)

A frontend-only investor demo of the One TheraCure clinic OS. **No backend, no auth, no database.** Boots with only `PORT` and `BASE_PATH` env vars.

**Tech**: React + Vite + Tailwind v3 + react-router-dom + shadcn/ui + framer-motion + recharts + zustand (persisted to localStorage).

**Brand**: Blue → purple gradient for the product, gold (`#B7791F`) for AI surfaces, red for clinical red flags. Fonts: Playfair Display (display) + Inter (body).

**State**:
- `src/stores/useDemoStore.ts` — zustand store (key `one-theracure-demo-v1`) holding personas, patients, appointments, follow-ups, integrations, approved encounters, and dev toggles.
- `src/contexts/DemoContext.tsx` — exposes `currentPersona`, `switchPersona`, `resetDemo`, `signOut`.
- `src/data/seed/` — staged demo data: 8 patients (P001 = Mrs. Lakshmi Iyer is the hero scribe patient), appointments, follow-ups, scribe script, AVS in 4 languages, 12-month analytics, integration partners, clinic profile.

**Personas (no real auth)**: Doctor (Dr. Priya Sharma), Admin (Rajesh Mehta), Front Desk (Anita Verma). Selected on `/persona`; `PersonaGate` enforces per-route access.

**Key flows**:
1. `/persona` — Persona picker (hero doctor card)
2. `/dashboard` — 4 narrative cards + "Now seeing" hero
3. `/consultation/P001` — Cinematic ambient scribe (waveform + transcript bubbles + live SOAP panel + plan + Approve bar)
4. `/prescriptions` — Rx letterhead + AVS in English/Hindi/Marathi/Tamil with QR
5. `/follow-ups` — AI-segmented outreach with bulk-send animation
6. `/admin`, `/admin/analytics`, `/admin/settings` — KPI command center, recharts analytics, integration partner toggles
7. `/frontdesk`, `/frontdesk/appointments`, `/frontdesk/registry`, `/frontdesk/verification` — Walk-in queue, ABDM QR registration, 5-step verification flow

**Demo affordances**:
- Persistent left sidebar (per-persona nav) + header with DEMO MODE pill, Reset Demo, Demo Tour
- Demo Tour (`src/components/tour/DemoTour.tsx`) — custom SVG spotlight with Elevator (5 stops, ~2 min) and Deep Dive (9 stops, ~10 min) scripts
- Cmd/Ctrl+K opens DevMenu (toggles for empty appointments, offline, AI processing, QR-not-scanned)
- Reset Demo wipes localStorage and returns to `/persona`

### `artifacts/mockup-sandbox` — Design Mockup Sandbox

Used for UI prototyping/canvas work.

## Shared Libraries

- `lib/api-spec/` — OpenAPI spec (contract-first)
- `lib/api-client-react/` — Generated React Query hooks (from Orval)
- `lib/db/` — Drizzle schema + PostgreSQL pool
