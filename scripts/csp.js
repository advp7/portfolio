/**
 * Runs after `react-scripts build`: adds a Content Security Policy and a
 * referrer policy to build/index.html. GitHub Pages can't send security
 * headers, so the policy lives in a <meta> tag instead.
 *
 * Inline scripts (the pre-paint theme script) are allowed by their SHA-256
 * hash, so no 'unsafe-inline' is needed for scripts. If you add a new
 * external service, add its origin below.
 */
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "..", "build", "index.html");
let html = fs.readFileSync(file, "utf8");

const ASSISTANT = "https://chat.askadvaith.workers.dev";
const TURNSTILE = "https://challenges.cloudflare.com";
// Getform rebranded to Forminit and redirects there, so allow both
const FORMS = "https://getform.io https://forminit.com https://*.forminit.com";

const inlineHashes = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(
  ([, body]) =>
    `'sha256-${crypto.createHash("sha256").update(body).digest("base64")}'`
);

const policy = [
  "default-src 'self'",
  `script-src 'self' ${inlineHashes.join(" ")} ${TURNSTILE}`,
  // framer-motion animates via inline style attributes
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data:",
  `connect-src 'self' ${ASSISTANT} ${TURNSTILE} ${FORMS}`,
  `frame-src ${TURNSTILE}`,
  `form-action 'self' ${FORMS}`,
  "media-src 'self'",
  "worker-src 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "upgrade-insecure-requests",
].join("; ");

const tags =
  `<meta http-equiv="Content-Security-Policy" content="${policy}">` +
  `<meta name="referrer" content="strict-origin-when-cross-origin">`;

if (html.includes('http-equiv="Content-Security-Policy"')) {
  throw new Error("CSP already present in build/index.html");
}
// Must come before any script so it applies to all of them
html = html.replace(/<head>/, `<head>${tags}`);
fs.writeFileSync(file, html);
console.log(
  `CSP added (${inlineHashes.length} inline script hash${inlineHashes.length === 1 ? "" : "es"}).`
);
