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

## 🚢 Deployment

Deployment is configured per-artifact in `artifacts/<name>/.replit-artifact/artifact.toml`. The web app is set up for `static` serve mode (the SPA build in `dist/public`) with SPA fallback rewrites. Port binding is via the `PORT` environment variable, which is injected by the Replit runtime — never hard-code a port.

To publish:

1. From the main version of the project, click the **Publish** button.
2. After the first publish, copy the resulting `.replit.app` URL into the **Public demo URL** section above.

The deployment skill notes that publish must be initiated by the user from the main repl, not from a task agent. After this task merges, please publish from the main project to fill in the URL.

## 🛡 Brand foundation

The Trust Blue identity (tokens, fonts, gradients) is defined in `artifacts/one-theracure/src/index.css` and `artifacts/one-theracure/tailwind.config.ts`. Any new artifact (mobile app, video, pitch deck) should reuse the same HSL tokens (`--brand-navy`, `--brand-trust`, `--brand-sky`, `--brand-soft`, `--brand-slate`, `--brand-success`, `--brand-warning`) and the Inter / Playfair Display font pairing. Red is reserved exclusively for clinical emergency states.
