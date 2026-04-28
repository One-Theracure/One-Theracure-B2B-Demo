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

**Routes**:
- `/` — Main dashboard (ProtectedRoute)
- `/auth` — Auth page (login/signup)

### `artifacts/api-server` — API Server

Express API server at `/api`. Currently has only a `/api/healthz` endpoint. Extend it with routes for patients, appointments, etc. as needed.

### `artifacts/mockup-sandbox` — Design Mockup Sandbox

Used for UI prototyping/canvas work.

## Shared Libraries

- `lib/api-spec/` — OpenAPI spec (contract-first)
- `lib/api-client-react/` — Generated React Query hooks (from Orval)
- `lib/db/` — Drizzle schema + PostgreSQL pool
