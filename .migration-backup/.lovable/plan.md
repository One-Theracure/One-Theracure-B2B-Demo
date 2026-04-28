
# Clinical Workspace Review — Approved Implementation Plan

Scope: CDS + scribe + documents flows. Three approved changes implemented in order. Issue #2 (ScribingModal duplication / 3 bugs) is explicitly skipped per user decision, with one carry-over (Re-record cleanup) folded into Issue #4 as data-layer hygiene.

---

## Stage 1 — Tests (Issue #3, Option A)

**Goal:** Add Vitest + Testing Library infrastructure and 12 focused tests covering the recently-stabilized scribe and documents flows. Land before any refactor so Stages 2–3 have a safety net.

### Infrastructure
- Add devDependencies: `vitest@^3`, `@testing-library/react@^16`, `@testing-library/jest-dom@^6`, `jsdom@^20`.
- New file `vitest.config.ts` — jsdom env, globals, `setupFiles: ['./src/test/setup.ts']`, `include: ['src/**/*.{test,spec}.{ts,tsx}']`, `@` alias to `./src`.
- New file `src/test/setup.ts` — imports `@testing-library/jest-dom`, polyfills `window.matchMedia`, polyfills `localStorage` (jsdom has it but ensure clean per-test reset via `beforeEach`).
- `tsconfig.app.json` — add `"vitest/globals"` to `compilerOptions.types`.
- `package.json` scripts — add `"test": "vitest run"` and `"test:watch": "vitest"`.

### Tests (12 total, colocated)

**`src/services/__tests__/ambientSessionService.test.ts`** (4)
1. `createAmbientSession` returns a session with status `active`, empty transcript, and persists to localStorage.
2. `appendTranscript` happy path — appends chunk with leading space, updates `updatedAt`, returns updated session.
3. `appendTranscript` returns `null` for unknown sessionId (pins the contract `ScribingModal` relies on).
4. `extractStructured` populates `physicalExam` BP/Pulse fields when transcript contains them.

**`src/services/__tests__/documentOutputService.test.ts`** (3)
5. `generateSmartPrescription` returns expected shape (clinic, doctor, patient, medications array, follow-up) for a typical patient.
6. `generateDigitalAVS` returns patient-friendly shape (whatWeFound, whatToDo, warningSignsGoER, etc.) for a typical patient.
7. Both functions handle a patient with no `chronicConditions` / `allergies` without throwing.

**`src/components/cds/workspace/__tests__/ScribingModal.test.tsx`** (3)
8. Demo fallback fires: mock `window.webkitSpeechRecognition` so `start()` triggers `onerror`; assert transcript populates with the demo string.
9. Re-record resets transcript, elapsed, structured sections, and approvedSections to empty (after Stage 2's cleanup is wired, this also asserts the previous session is stopped).
10. "Use Transcript" calls `onComplete` with the current transcript and structured output.

**`src/components/documents/__tests__/DocumentOutputDrawer.test.tsx`** (2)
11. "Generate Documents" populates both Prescription and AVS tabs (after a tick).
12. "Download" calls `window.print` (spy).

**Verification:** `bunx vitest run` — all 12 green. CI later wired separately.

---

## Stage 2 — Performance (Issue #4, Option A) + Issue #2 carry-over

**Goal:** Move ambient-session reads/writes off the hot path of speech recognition, eliminate O(N²) regex re-scan, and close the Re-record session leak.

### `src/services/ambientSessionService.ts` — refactor
- Add module-level `cache: Map<string, AmbientSession>` and `dirty: Set<string>`.
- `hydrate()` (lazy, idempotent) — on first access, read localStorage once and populate `cache`.
- `appendTranscript`:
  - Mutate the cached session synchronously (no I/O).
  - Mark dirty, schedule debounced flush.
  - Pass only `prev.rawTranscript.slice(-200) + chunk` to `extractStructured` instead of the full transcript. Merge fields conservatively: if a section was previously populated and the windowed pass returns no match, keep the prior value.
- `stopAmbientSession`, `createAmbientSession` — force immediate flush (do not debounce; data must be safe before the user navigates).
- `flushToStorage(immediate = false)` — debounced (500ms) when `immediate=false`. Single write of the full sessions array (still capped to last 50). On `immediate=true`, cancel pending timer and write now.
- Add a one-time `window.addEventListener('beforeunload', () => flushToStorage(true))` on first hydration.
- Public API unchanged — callers untouched.

### `src/components/cds/workspace/ScribingModal.tsx` — Re-record carry-over (1 line)
- In the Re-record handler (currently L336–343), insert before the local-state resets:
  ```ts
  if (sessionIdRef.current) stopAmbientSession(sessionIdRef.current, elapsed);
  ```
- Closes the data-layer leak that becomes more visible with the cache (otherwise a leaked session sits in memory until tab close).

**Verification:**
- Run Stage 1's tests; all 12 still green (extends test #2 to assert the windowed-regex semantics, extends test #9 to assert `stopAmbientSession` was called).
- Manual e2e on the scribe flow: record → pause → resume → stop → re-record → record → stop → use transcript. Confirm transcript continuity, no console errors, structured sections still populate.
- Manual e2e on the documents flow unchanged.

---

## Stage 3 — Architecture (Issue #1, Option B)

**Goal:** Reduce the `EncounterWorkspace` god component's blast radius, make the recently-touched scribe flow testable in isolation, and remove the in-render `RightPanelContent` component definition.

### New file `src/components/cds/workspace/useScribeFlow.ts`
Owns the scribe slice of state and handlers currently inlined in `EncounterWorkspace`:
- State: `scribingModalOpen`, `scribeCompleteModalOpen`, `lastTranscript`.
- Handlers: `handleStartScribing`, `handleScribeComplete` (still emits `transcript.created` via eventBus, still appends to timeline via injected callbacks), `handleScribeDraft` (still calls `generateCDSContent` and `addDocumentTab` via injected callbacks).
- Signature: `useScribeFlow({ patient, encounterId, patientInputs, addDocumentTab, appendTimelineEntry, toast })`.
- Returns `{ scribingModalOpen, setScribingModalOpen, scribeCompleteModalOpen, setScribeCompleteModalOpen, lastTranscript, handleStartScribing, handleScribeComplete, handleScribeDraft }`.

### New file `src/components/cds/workspace/RightPanelContent.tsx`
- Lift the inline component (currently `EncounterWorkspace.tsx` L297–355) to its own file.
- Accept explicit props: `rightPanelView`, `setRightPanelView`, `timelineEntries`, `selectedPatient`, `currentEncounterId`, `formData`, `handleTimelineSelect`, `handleInsertToNote`, `rightPanelTabs`.
- Memoize with `React.memo` since props are mostly stable references.

### `src/components/cds/workspace/EncounterWorkspace.tsx` — wire-up
- Replace inline scribe state/handlers with `const scribe = useScribeFlow({ … })`.
- Replace inline `RightPanelContent` definition with import of the new component, passing the explicit props.
- Net: file shrinks by ~120 lines; no behavioral change.

**Verification:**
- All 12 Stage 1 tests still green; ScribingModal tests now also serve as the proxy for the extracted hook (the hook is exercised through the modal in `EncounterWorkspace`).
- Manual e2e on both flows once more.

---

## Out of scope (explicit non-decisions)

- **Issue #2** — `ScribingModal.tsx` SR-init duplication, missing `onerror` fallback on `resumeListening`, and the TDZ `cleanup` reference. User chose "Do nothing." The bug-#3 ambient-session leak that overlapped with this issue is closed in Stage 2 as a data-layer carry-over.
- **Playwright / e2e harness** — not added; manual browser testing remains the e2e tier for now.
- **Full god-component split** (Issue #1 Option A) — only the scribe slice and `RightPanelContent` are extracted. Other slices (tabs, modals, patient session) remain in `EncounterWorkspace` for now.

---

## Order of operations

```text
Stage 1 (Tests)        ──►  green
        │
        ▼
Stage 2 (Perf + #2 carry-over)  ──►  Stage 1 tests still green; manual scribe e2e
        │
        ▼
Stage 3 (Architecture)  ──►  Stage 1 tests still green; manual scribe + docs e2e
```

Each stage is independently shippable. If any stage fails verification, the next stage does not start.
