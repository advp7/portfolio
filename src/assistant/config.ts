/** The Cloudflare Worker in /assistant. Override for local dev with
 *  REACT_APP_ASSISTANT_URL=http://localhost:8787 npm start */
export const ASSISTANT_URL =
  process.env.REACT_APP_ASSISTANT_URL || "https://chat.askadvaith.workers.dev";

/** Public by design: the matching secret key lives only in the Worker */
export const TURNSTILE_SITE_KEY =
  process.env.REACT_APP_TURNSTILE_SITE_KEY || "0x4AAAAAAFL7EiqfIE5GMsZl";

/** Fired by the command palette (and anything else) to open the assistant */
export const OPEN_ASSISTANT_EVENT = "open-assistant";
