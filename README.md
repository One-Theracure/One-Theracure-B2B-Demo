# One TheraCure

The clinic operating system for India — ambient scribing, AI safety checks, smart prescriptions, ABDM cross-clinic handoff, and a multilingual After-Visit Summary, all in one place.

## 🌐 Public demo URL

> **Pending publish — see follow-up task #52.**
>
> The web app is fully configured for production publishing (see `artifacts/one-theracure/.replit-artifact/artifact.toml`: `static` serve mode, `PORT`-bound, SPA fallback rewrites in place). However, **only the main project version can trigger an actual publish** — task agents cannot. The first-publish click and the URL-capture step have therefore been split out into follow-up task **#52 ("Run the published demo with a non-Replit network and capture the URL")**.
>
> Once that follow-up is run from the main repl, replace this entire block with:
>
> ```
> Live demo: https://<project-slug>.replit.app/
> ```
>
> This URL is the canonical link to share in follow-up emails after a sales conversation. The app serves as a static SPA from each artifact's production build, so cold-start cost is minimal and there is no server-side rendering to worry about in production.

## 🎬 10-minute guided demo

The app ships with a built-in narrative tour. From the dashboard, click **"Take the tour"** in the Quick Actions card. It walks one patient end-to-end through:

1. **Ambient Scribe** — capture the visit hands-free.
2. **AI Safety Alert** — interaction caught, safer alternative accepted.
3. **Smart Prescription** — generated PDF with QR for the patient.
4. **ABDM Inbound Handoff** — scan an ABHA QR and pull cross-clinic records.
5. **Multilingual AVS** — patient walks home with the plan in English, Hindi, Marathi, or Tamil.

A written script that mirrors the in-app tour lives at [`docs/pitch-script.md`](docs/pitch-script.md). Read along with the tour during sales calls.

## 🗂 Project layout

This is a pnpm monorepo. Each top-level product lives under `artifacts/`:

| Artifact path | Kind | What it is |
|---|---|---|
| `artifacts/one-theracure` | web | The clinician-facing web app (React + Vite). |
| `artifacts/api-server` | api | Backend API service. |
| `artifacts/mockup-sandbox` | design | Internal canvas for design exploration; not user-facing. |

Future artifacts (mobile app, promo video, pitch deck) will be created under the same `artifacts/` directory and should pick up the **Trust Blue** brand foundation (deep navy `#1a2c5b`, trust blue `#0066cc`, Inter for UI, Playfair for editorial) at creation time.

## 🚢 Deployment (Vercel)

For a free public demo, deploy the frontend to Vercel directly from this monorepo.

### Frontend-only demo (fastest path)

This is enough for sales demos: the app runs fully in browser, and patient registration falls back to local demo mode when `/api` is unavailable.

1. Import the repo in Vercel.
2. Set **Root Directory** to `artifacts/one-theracure`.
3. Vercel should auto-detect **Vite** (`build: vite build`, output: `dist/public`).
4. Add env var:
   - `VITE_CLERK_PUBLISHABLE_KEY` (required)
   - `VITE_CLERK_PROXY_URL` (optional)
   - `VITE_API_BASE_URL` (optional)
5. Deploy and copy the generated `.vercel.app` URL.

SPA fallback and the correct static output path are in `artifacts/one-theracure/vercel.json` (Vite writes to `dist/public`, not the default `dist`).

**If the deploy succeeds but you see Vercel’s `404: NOT_FOUND`:** the site is not serving the built files. In the Vercel project, set **Root Directory** to `artifacts/one-theracure`, confirm **Output Directory** is `dist/public` (or pull the latest `vercel.json` and redeploy), then open the **Production** deployment URL from the Deployments tab.

### Full-stack demo (optional)

If you also want persistent patient storage:

1. Deploy `artifacts/api-server` as a separate backend service (Vercel/Render/Railway).
2. Set backend env vars (`DATABASE_URL`, `CLERK_SECRET_KEY`, and related Clerk keys).
3. Set frontend `VITE_API_BASE_URL` to the backend origin (for example, `https://one-theracure-api.vercel.app`).
4. Re-deploy the frontend so browser calls target the hosted API.

## 🛡 Brand foundation

The Trust Blue identity (tokens, fonts, gradients) is defined in `artifacts/one-theracure/src/index.css` and `artifacts/one-theracure/tailwind.config.ts`. Any new artifact (mobile app, video, pitch deck) should reuse the same HSL tokens (`--brand-navy`, `--brand-trust`, `--brand-sky`, `--brand-soft`, `--brand-slate`, `--brand-success`, `--brand-warning`) and the Inter / Playfair Display font pairing. Red is reserved exclusively for clinical emergency states.
