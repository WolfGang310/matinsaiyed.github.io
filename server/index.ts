import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple in-memory rate limiter for the contact form endpoint
const rateLimit = new Map<string, number[]>();
const RATE_WINDOW_MS = 60_000;
const RATE_MAX_REQUESTS = 3;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = (rateLimit.get(ip) ?? []).filter(
    (t) => now - t < RATE_WINDOW_MS,
  );
  if (timestamps.length >= RATE_MAX_REQUESTS) return true;
  timestamps.push(now);
  rateLimit.set(ip, timestamps);
  return false;
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  // --- Security headers (CSP + common hardening) ---
  app.use((_req, res, next) => {
    res.setHeader(
      "Content-Security-Policy",
      [
        "default-src 'self'",
        "script-src 'self' https://fonts.googleapis.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: blob: https:",
        "connect-src 'self' https://api.web3forms.com https://prod.spline.design https://forge.butterfly-effect.dev",
        "frame-src 'none'",
        "object-src 'none'",
        "base-uri 'self'",
      ].join("; "),
    );
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    next();
  });

  // --- Contact form proxy (keeps Web3Forms key server-side) ---
  app.post("/api/contact", express.json(), async (req, res) => {
    const ip = req.ip ?? req.socket.remoteAddress ?? "unknown";
    if (isRateLimited(ip)) {
      res.status(429).json({ error: "Too many requests. Try again later." });
      return;
    }

    const accessKey = process.env.WEB3FORMS_KEY;
    if (!accessKey) {
      res.status(500).json({ error: "Contact form is not configured." });
      return;
    }

    const { name, email, subject_line, message } = req.body ?? {};
    if (!name || !email || !message) {
      res.status(400).json({ error: "Name, email, and message are required." });
      return;
    }

    try {
      const formData = new FormData();
      formData.append("access_key", accessKey);
      formData.append("name", String(name));
      formData.append("email", String(email));
      formData.append("subject", subject_line ? String(subject_line) : "Portfolio Contact Form Submission");
      formData.append("message", String(message));

      const upstream = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      });

      if (upstream.ok) {
        res.json({ success: true });
      } else {
        res.status(502).json({ error: "Failed to deliver message." });
      }
    } catch {
      res.status(502).json({ error: "Network error contacting mail service." });
    }
  });

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  // Handle client-side routing - serve index.html for all routes
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch((err) => {
  console.error(err);
  process.exit(1);
});
