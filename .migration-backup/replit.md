# OneThera Cure — ClinicOS

AI-powered Medical Practice Management & EMR system for Indian doctors.

## Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **UI**: Tailwind CSS + shadcn/ui
- **Routing**: React Router v6
- **Auth**: Mock JWT (localStorage `authToken = 'mock-jwt-token'`)
- **AI/Backend**: All client-side mock — no real backend or database yet
- **Speech**: Web Speech API + Whisper WebGPU (via @huggingface/transformers)
- **Storage**: localStorage-backed services with clean interfaces for future backend swap

## Architecture
Single-page app with tab-based navigation. No real Supabase tables configured — all data is mock.

### Main Tabs (TabNavigation.tsx)
1. **Dashboard** — Analytics, stats, charts
2. **Patients** — Patient list, search, records modal
3. **New Visit** — Multi-step EMR form with AI scribe and live preview
4. **AI Clinical** — AI CDSS + AI Scribe (formerly "CDS & Scribe")
5. **Front Desk** — AI Ops (Queue, Verification, Appointment Copilot, Daily Analytics)
6. **Settings** — Templates, digital signature, user roles

### AI Clinical Module (`src/components/cds/`)
Two flagship features — **AI CDSS** and **AI Scribe** — unified under a single tab.

#### Glass Health-Style Encounter Workspace (Primary View)
The default view is a **three-column clinical workspace** inspired by Glass Health, located in `src/components/cds/workspace/`:

**Layout**: `EncounterWorkspace.tsx` — Full-height three-column layout:
- **Left**: `WorkspaceSidebar.tsx` (240px fixed) — Patient list with search, "New Patient" / "Start Scribing" / "New Chat" action buttons, recent chat history
- **Center-Left**: `ClinicalChat.tsx` (~340px) — AI chat assistant with quick-action pill buttons (Draft DDx, Draft A&P, Draft H&P, etc.), voice input, message history, data sufficiency gate
- **Center**: `ClinicalDocumentEditor.tsx` (flex) — Tabbed document editor with autosave, version history, provenance tags; AI-generated docs open as closable tabs
- **Right**: Toggleable panel (~260px) with three tabs:
  - **Timeline** (`EncounterTimeline.tsx`) — Chronological encounter activity log
  - **Care Path** (`CarePathPanel.tsx`) — Active care paths, pending tasks, follow-ups for chronic conditions
  - **Insights** (`PatientInsightCard.tsx`) — Pre-visit AI insights, red flags, care gaps, HCC recapture
  - **Generate AVS** button at bottom
- **Top Bar**: `PatientWorkspaceHeader.tsx` — Patient info (name, MRN, age/gender) + "Verified" badge (when verified via Front Desk) + "Start Scribing" / "Upload Context" / "Connect EHR" action buttons

**Modals & Dialogs**:
- `ScribingModal.tsx` — Two-panel ambient scribing: raw transcript (left) + real-time structured extraction (right, sections: CC/HPI/ROS/Exam/A&P/Orders/Follow-up), specialty template selector, session review before insert
- `ScribeCompleteModal.tsx` — Post-scribe dialog with draft-type pill buttons and additional context input
- `UploadContextModal.tsx` — Upload patient context documents (text paste / file), entity extraction
- `ConnectEHRModal.tsx` — EHR system selector (Practo, Epic, Cerner, athenahealth, ABDM/NDHM, Bahmni, custom FHIR), connection configuration
- `AVSSummary.tsx` — After-visit summary generator dialog

**Document Features**:
- `VersionHistoryPanel.tsx` — Slide-out panel showing version snapshots with restore
- `ProvenanceTag.tsx` — Inline provenance badges: "AI Generated" / "From Transcript" / "Uploaded" / "Clinician Edited"
- `DataSufficiencyGate.tsx` — Warning UI when critical patient data is missing before AI generation

**State Flow**: Patient select → creates encounter (localStorage) → emits event bus event → loads patient context → Chat/quick actions trigger `generateCDSContent()` → AI output added as new document tab + timeline entry + event → autosave kicks in → version history tracks changes

**"More Tools" Button**: CDSSubNav (legacy sub-pages) accessible via "More Tools" toggle in header, keeping all 11 individual tool pages available.

#### Legacy Sub-Pages (via "More Tools")
**AI CDSS Group**:
- **Ask Questions** (consult) — Clinical Q&A with evidence-based answers and citations
- **Differential Dx** (ddx) — Tiered DDx: Most Likely / Expanded / Can't Miss
- **Assessment & Plan** (assessment-plan) — Problem-oriented A&P with safety netting
- **Pre-Visit Tools** (summarize) — 4-tab summary: Chart Summary, Pre-Visit Summary, Conditions Advisor, Hospital Stay Summary
- **Clinical Notes** (notes) — H&P, Progress Note, Discharge Summary, Discharge Instructions, Patient Handout, Referral Letter

**AI Scribe Group**:
- **Ambient Scribe** (scribe) — Real-time transcription with multi-speaker attribution, 22 Indian languages, live insights, offline buffering
- **Chart Chat** (chart-chat) — Real-time Q&A about patient chart data
- **Med Assist** (med-assist) — AI-suggested medications with dose, route, frequency, rationale, interaction warnings
- **Patient Instructions** (patient-instructions) — Plain-language care instructions with language selector
- **Templates** (templates) — Per-doctor/clinic templates with variable substitution + audit log

**Sub-Nav Structure** (CDSSubNav.tsx): Grouped with visual separators and section headers — Encounter | AI CDSS | AI Scribe. Sub-page type values unchanged (`CDSSubPage` union type).

**Output Enhancements:**
- **ICD-10 Code Assist** — Collapsible section on all generated outputs showing suggested ICD-10 codes with confidence %, copy-to-clipboard per code
- **Safety Banner** — "AI CDSS Draft — for clinician review only." on every page

### Core Services Layer

#### Clinical Ops Service Layer (Amazon Connect Health-inspired)
- `src/services/clinicalOpsService.ts` — Unified facade for all operational services
- `src/services/patientVerificationService.ts` — Patient identity verification (phone/DOB/MRN/ABHA), confidence scoring, audit log
- `src/services/appointmentOpsService.ts` — Slot suggestion, conflict detection, doctor availability rules
- `src/services/patientInsightsService.ts` — Pre-visit AI insight generation from patientGraph (red flags, care gaps, HCC recapture, meds, allergies)
- `src/services/codingAssistService.ts` — ICD-10/CPT code suggestion with confidence scores and evidence links
- `src/services/communicationService.ts` — Communication event log, channel adapters (WhatsApp/SMS/Email/Voice), outbound triggers
- `src/services/ambientSessionService.ts` — Ambient session lifecycle, structured output extraction, localStorage persistence

#### Event Bus (`src/services/eventBus.ts`)
Centralized event store (localStorage-backed, max 1000 events):
- **Event types**: `transcript.created`, `note.drafted`, `document.uploaded`, `dx.generated`, `followup.sent`, `encounter.created`, `encounter.updated`, `patient.updated`, `ai.called`, `carepath.activated`
- **API**: `eventBus.emit(type, data)`, `eventBus.on(type, handler)`, `eventBus.onAll(handler)`, `eventBus.getByPatient(id)`, `eventBus.getByEncounter(id)`

#### AI Client Abstraction (`src/services/aiClient.ts`)
Pluggable AI provider with `MockAIProvider` wrapping existing `mockAI.ts`. Interface supports OpenAI/Gemini/Anthropic swap-in.

#### Prompt Registry (`src/services/promptRegistry.ts`)
Versioned prompt template registry with variable substitution. Templates for all CDS modes.

#### Document Processor (`src/services/documentProcessor.ts`)
Mock entity extraction from uploaded documents. Extracts: conditions, medications, allergies, labs, vitals, procedures with evidence pointers.

#### Data Sufficiency (`src/services/dataSufficiency.ts`)
Checks CDSInputs for missing critical fields before AI generation. Returns severity (critical/warning/info) and recommended actions.

#### Care Path Engine (`src/services/carePathEngine.ts`)
State machine for chronic conditions (DM2, HTN, Asthma, COPD, CKD). Generates care tasks, follow-up schedules, and threshold alerts.

#### Follow-Up Agent (`src/services/followUpAgent.ts`)
Post-visit check-in message generator with red flag escalation support.

#### AVS Generator (`src/services/avsGenerator.ts`)
Patient-friendly after-visit summary with diagnosis explanation, medication instructions, next steps checklist, and red flags.

#### FHIR Mapper (`src/services/fhirMapper.ts`)
Maps internal types to FHIR R4 resources: Patient, Encounter, Condition, DocumentReference.

#### Patient Graph (`src/services/patientGraph.ts`)
Longitudinal patient record store (localStorage). Tracks problems, medications, vitals, labs, imaging, procedures across encounters. Includes `synthesizePatientSummary()` for cross-encounter synthesis.

#### Version History (`src/services/versionHistory.ts`)
Document version snapshots (max 20/doc) with localStorage persistence.

#### Autosave Hook (`src/hooks/useAutosave.ts`)
Debounced autosave to localStorage (2s delay) with dirty detection.

### Data Layer
- `src/data/guidelineSnippets.ts` — Curated clinical guidelines (HTN, DM2, Chest Pain, Asthma, COPD, CKD)
- `src/data/drugInteractions.ts` — Drug interaction lookup table with severity levels

### Types
- `src/types/cds.ts` — CDS types: CDSMode, CDSInputs, CDSOutput, MedicationSuggestion, etc.
- `src/types/patient.ts` — Patient model
- `src/types/encounter.ts` — Encounter model with status machine (draft → active → review → completed → signed), localStorage CRUD
- `src/types/fhir.ts` — FHIR R4 resource stubs (Patient, Encounter, Observation, Condition, MedicationRequest, DocumentReference)
- `src/types/document.ts` — DocumentReference, ExtractedEntity, EvidencePointer
- `src/types/longitudinal.ts` — PatientGraph, VitalEntry, LabEntry, ProblemEntry, MedicationEntry
- `src/types/carePath.ts` — CarePath, CareTask, FollowUpSchedule, Threshold, AVSSummary

### CDS Services
- `src/services/mockAI.ts` — Mock AI provider with realistic Indian-context clinical responses. Exports:
  - `generateCDSContent()` — Main generator for all 16 CDS modes
  - `generateLiveInsights()` — Live ambient scribe insights
  - `generateMedicationSuggestions()` — Medication card suggestions with interactions/contraindications
  - `generateICD10Suggestions()` — Context-aware ICD-10 code suggestions
- `src/hooks/useCDSAuditLog.ts` — Audit logging to localStorage

### CDS Live Preview & Speech-to-Text
- `CDSLivePreview.tsx` — Real-time clinical document preview rendering CDSInputs as formatted note
- `CDSInputPanel.tsx` — Per-field speech-to-text mic buttons (Web Speech API, `lang=en-IN`)
- Workspace, Notes Generator, and Ambient Scribe all have tabbed right panels with Live Preview
- Right panels are sticky (`top-[140px]`) on desktop

### Safety & Compliance
- Every screen shows "AI CDSS Draft — for clinician review only." disclaimer banner (collapsible in ClinicalDocumentEditor)
- `PatientInsightCard` shows "AI-generated" provenance chip on every insight snapshot
- Medication Assist has additional safety warning about verifying before prescribing
- Data sufficiency gate warns when critical fields are missing
- Drug interaction checker with severity levels
- Guideline snippets for evidence-based recommendations
- All generations are logged to audit log + event bus
- No auto-placement of orders
- No PHI leaves the browser (mock AI is entirely client-side)

## Key Files
- `src/pages/Index.tsx` — Main layout + tab routing
- `src/components/layout/Header.tsx` — Sticky header (z-50, ~73px height) with Upgrade button
- `src/components/layout/TabNavigation.tsx` — 5-tab navigation
- `src/components/NewVisitForm.tsx` — ResizablePanelGroup form
- `src/components/PatientContextBanner.tsx` — Sticky at top-[73px] z-40
- `src/components/cds/CDSLayout.tsx` — AI Clinical module entry point
- `src/components/cds/CDSSubNav.tsx` — Grouped sub-navigation (AI CDSS / AI Scribe)
- `src/components/cds/workspace/EncounterWorkspace.tsx` — Glass Health workspace (primary view)
- `src/components/cds/workspace/` — All workspace components
- `src/components/frontdesk/` — Front Desk AI Ops (FrontDeskLayout, PatientVerificationPanel, OperationalQueueView, AppointmentCopilot)
- `src/components/insights/PatientInsightCard.tsx` — Pre-visit patient insights card with evidence provenance
- `src/components/coding/CodingAssistPanel.tsx` — ICD-10/CPT coding suggestions with evidence
- `src/components/coding/CodingReviewDrawer.tsx` — Slide-in coding review drawer from document editor
- `src/components/communication/CommunicationEventLog.tsx` — Outbound/inbound communication event log
- `src/services/eventBus.ts` — Centralized event bus
- `src/services/aiClient.ts` — AI client abstraction
- `src/services/carePathEngine.ts` — Chronic care path state machine
- `src/services/fhirMapper.ts` — FHIR R4 resource mapping
- `src/services/patientGraph.ts` — Longitudinal patient memory

## Layout Notes
- `PatientContextBanner`: sticky at `top-[73px] z-40` (below header)
- `NewVisitForm` panel group: `min-h-[calc(100vh-16rem)]`
- `main` container: `max-w-7xl` matching header
- All tab bars: `flex overflow-x-auto` (no cramped grid wrapping)
- Currency: ₹ (Indian Rupee) throughout

## Indian Locale
- Metric units: kg, cm, °C
- Currency: ₹ (INR)
- Phone: +91 format
- Date: en-IN locale
- Speech: en-IN (default), 22 Indian languages supported
- Languages: English, Hindi, Tamil, Telugu, Kannada, Malayalam, Bengali, Marathi, Gujarati, Punjabi, Odia, Assamese, Urdu, Sindhi, Kashmiri, Nepali, Konkani, Maithili, Dogri, Sanskrit, Manipuri, Santali

## Typography & Accessibility Standards (Audit v2)

### Global Standards (all pages)
- **Minimum body text**: `text-sm` (14px) — all labels, descriptions, body content
- **Minimum button text**: `text-sm` (14px); primary action buttons: `text-base` (16px)
- **Headings**: Page titles `text-2xl font-bold`; section headers `text-lg` or `text-base font-semibold`
- **Tertiary metadata only** may use `text-xs` (12px): badges, timestamps, session IDs
- **No `text-[10px]` or `text-[9px]`** anywhere in the app
- **Input heights**: All inputs/selects `h-9` (36px) minimum; all buttons `h-8` (32px) minimum
- **Touch targets**: All interactive elements ≥48px height via padding or min-h (WCAG AAA)
- **Tab navigation**: `text-sm` mobile / `text-base` desktop, `min-h-[48px]`, `font-semibold` active
- **Color contrast**: Body text `text-gray-600` minimum; `text-muted-foreground` for icons/inactive only
- **Fonts**: `font-inter` (sans-serif) for body/UI; `font-playfair` (serif) for main headings only

### Global Accessibility Toggle
- **Location**: Header bar (visible on all pages), persisted to `localStorage` key `app_accessibility`
- **CSS class**: `.app-accessible` in `src/index.css` — applied to `<main>` wrapper in `Index.tsx`
- **Effect**: Bumps `text-xs`→14px, `text-sm`→16px, `text-base`→18px; forces `min-height: 2.5rem` on small containers; darkens all gray text to `#374151`; widens focus rings to 3px
- **Scope**: Applies across Dashboard, Patients, New Visit, AI Clinical, Settings

### AI Clinical-specific
- **Safety banner**: "AI CDSS Draft — for clinician review only." with amber left border accent
- **Breadcrumbs**: Shown on all sub-pages (not workspace): "AI Clinical > [Page Name]" with clickable back
- **Toast confirmations**: Every action (Generate, Finalize, Copy, Save, Start/Stop Scribe, Print) shows a toast
- **Sub-nav grouping**: Visual separators + section headers for AI CDSS / AI Scribe groups

### Dashboard & Patient List
- **Chart axes**: 14px font on recharts XAxis/YAxis
- **KPI values**: `text-2xl` or larger
- **Patient search**: `h-10 text-base` input
- **Patient cards**: name `text-base font-semibold`, action buttons `h-9 text-sm`

## Quality Audit Notes (Pass 2 — Dashboard Audit, March 2026)

### Fixed
- **QuickActions.tsx**: All 3 buttons now navigate — "New Visit"→`new-visit`, "Find Patient"→`patients`, "Templates"→`settings`
- **RecentVisits.tsx**: "View All" button + each row now navigates to `patients` tab
- **UnifiedAnalyticsSection.tsx**: "Export Report" button now shows toast; KPI grid changed from `xl:grid-cols-6` to `grid-cols-2 md:grid-cols-3 xl:grid-cols-6`; KPI card padding unified to `p-5`
- **Dashboard.tsx**: Removed duplicate `<AnalyticsMetrics />` from top-level (8 KPI cards in a row → now 4); added "Detailed Reports" section heading above outer tabs; renamed "Overview" tab to "Charts"; wired "Export Report" + "Last 30 Days" buttons to toasts; Visits tab mini-stat cards upgraded from bare `bg-color-50 rounded-lg` divs to proper Card components
- **StatsGrid.tsx**: Icon containers changed from `rounded-full bg-color-500` to `rounded-xl bg-color-100` with `text-color-600` icons — matches app-wide soft icon style
- **AnalyticsMetrics.tsx**: Icon containers and colors unified to same `rounded-xl bg-color-100` style; value text upgraded from `text-2xl` to `text-3xl` to match StatsGrid
- **ChartsSection.tsx**: Added `<Legend />` to BarChart and LineChart; pie chart labels removed (clipped), replaced with `<Legend />`; chart heights normalised to 280px; `radius` added to bar charts
- **MedicationsAnalytics.tsx**: Added `<Legend />` to monthly prescriptions BarChart; pie chart migrated from clipped inline labels to `<Legend />`; consistent chart grid color

### Verified Clean
- TS: `npx tsc --noEmit` — zero errors
- E2E: All QuickActions buttons navigate; Export Report toasts; Visits tab stat cards use Card style; charts have legends; pie charts no overflowing labels; View All navigates to patients; Settings opened via Templates

## Quality Audit Notes (Pass 1 — March 2026)

### Fixed
- **AIScribeStep.tsx**: Replaced dead "removed" screen with redirect card pointing to Ambient Scribing tab; button dispatches `command:navigate` correctly
- **PatientList.tsx**: `window.location.hash` navigation replaced with `CustomEvent("command:navigate", { detail: "new-visit" })` (matches Index.tsx handler format)
- **ClinicalChat.tsx**: localStorage persistence keyed by `patientId` (key: `ot_chat_<patientId>`, max 60 messages); inline `AlertCircle` error banner on AI failure; paddings standardised
- **ClinicalDocumentEditor.tsx**: AI disclaimer collapsible (chevron toggle, shows title always, body text on expand)
- **FrontDeskLayout.tsx**: Analytics tab added (Daily Ops Summary stats + Appointment Status + Verification Methods bar charts, mock data labelled)
- **CommandPalette.tsx**: "Open Front Desk" (`frontdesk`) and "Open AI Clinical" (`cds-scribe`) added to navigation group
- **PatientInsightCard.tsx**: "AI-generated" provenance chip (violet, Sparkles icon) added alongside "Patient Insights" heading

### Verified Clean
- TS: `npx tsc --noEmit` — zero errors
- E2E: Command palette opens Front Desk; Analytics tab renders stats; AI disclaimer collapses/expands; Patient Queue loads stable queue data; CDSSubNav "Encounter" breadcrumb navigates back to workspace

## Running the App
```bash
cd thera-scribe-clinic-main
npm run dev -- --port 5000 --host 0.0.0.0
```
Auth bypass: set `localStorage.authToken = 'mock-jwt-token'` in browser console.

## RBAC
- Doctor: full AI CDSS + AI Scribe + templates
- Nurse: view summaries, start transcription, chart chat, patient instructions
- Admin: clinic templates + audit logs
- Reception: no AI Clinical access
