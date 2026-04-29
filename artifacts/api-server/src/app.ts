import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import pinoHttp from "pino-http";
import { clerkMiddleware, getAuth } from "@clerk/express";
import { CLERK_PROXY_PATH, clerkProxyMiddleware } from "./middlewares/clerkProxyMiddleware";
import router from "./routes";
import { logger } from "./lib/logger";
import { Sentry, sentryEnabled } from "./lib/sentry";

const app: Express = express();

app.disable("x-powered-by");

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

app.use(CLERK_PROXY_PATH, clerkProxyMiddleware());

// Security headers — sane defaults; CSP is intentionally permissive in dev so
// the Vite proxy + Clerk frontend keep working. Tighten when we add a CDN.
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  }),
);

// Trust proxy so express-rate-limit sees the real client IP through Replit's
// edge. Without this, every request appears to share an IP and one user can
// trip the limit for everyone else.
app.set("trust proxy", 1);

// CSRF posture: API auth is bearer-token only via the `Authorization` header
// (Clerk session JWT). We deliberately do NOT include credentials so the
// browser will not attach cookies cross-origin — eliminating the standard
// CSRF attack surface for cookie-borne sessions. If a future flow needs
// cookies, re-introduce CSRF middleware before flipping `credentials: true`.
app.use(cors({ credentials: false, origin: true }));

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Clerk must run BEFORE the per-user write limiter so we can key by user ID.
app.use(clerkMiddleware());

// Rate limits per Phase 1 contract:
//   - global:  100 req / minute / IP
//   - writes:   20 req / minute / user (falls back to IP for unauth requests)
// Read-heavy surfaces (charts, dashboards) won't notice; abusive scripted
// writes will.
const globalLimiter = rateLimit({
  windowMs: 60_000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
const writeLimiter = rateLimit({
  windowMs: 60_000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  // Key by authenticated user when available so one logged-in user cannot
  // exhaust another's quota, and so a single shared NAT'd IP doesn't get
  // throttled for the entire clinic.
  keyGenerator: (req) => {
    const userId = getAuth(req)?.userId;
    if (userId) return `u:${userId}`;
    return `ip:${req.ip ?? "unknown"}`;
  },
});

app.use("/api", globalLimiter);
app.use("/api", (req, res, next) => {
  if (req.method === "GET" || req.method === "HEAD" || req.method === "OPTIONS") {
    return next();
  }
  return writeLimiter(req, res, next);
});

app.use("/api", router);

// Centralised error handler — logs + reports to Sentry with PHI scrubbed by
// our `beforeSend` hook. Do this BEFORE any default Express handler runs so
// we never leak stack traces to clients.
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  req.log?.error({ err }, "Unhandled request error");
  if (sentryEnabled()) Sentry.captureException(err);
  if (res.headersSent) return;
  res.status(500).json({ error: "Internal server error" });
});

export default app;
