import { ASSISTANT_URL, TURNSTILE_SITE_KEY } from "./config";

export interface ChatTurn {
  role: "user" | "assistant";
  text: string;
  /** The Worker's signature on its own replies; unsigned ones are ignored */
  sig?: string;
}

export type ActionName =
  | "open_case_study"
  | "scroll_to_section"
  | "download_resume"
  | "copy_email"
  /** args.questions: follow-ups separated by newlines */
  | "suggest_replies";

export interface AssistantAction {
  name: ActionName;
  args: Record<string, string>;
}

export type ServerEvent =
  | { type: "text"; text: string }
  | ({ type: "action" } & AssistantAction)
  | { type: "done"; provider: string; sig?: string };

export type ErrorCode = "session" | "rate" | "verify" | "network" | "server";

export const fail = (code: ErrorCode) =>
  Object.assign(new Error(code), { code });

export const errorCode = (err: unknown): ErrorCode | null =>
  (err as { code?: ErrorCode })?.code ?? null;

// ---------------------------------------------------------------- turnstile

interface TurnstileApi {
  render: (
    el: HTMLElement,
    options: {
      sitekey: string;
      appearance?: "always" | "execute" | "interaction-only";
      action?: string;
      size?: "normal" | "compact" | "flexible";
      theme?: "auto" | "light" | "dark";
      callback?: (token: string) => void;
      "error-callback"?: () => void;
      "expired-callback"?: () => void;
    }
  ) => string;
  reset: (id: string) => void;
  remove: (id: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

let scriptPromise: Promise<void> | null = null;

/** Loads Cloudflare Turnstile once, on demand (not on page load) */
export const loadTurnstile = () => {
  if (window.turnstile) return Promise.resolve();
  scriptPromise ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src =
      "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptPromise = null;
      reject(fail("verify"));
    };
    document.head.appendChild(script);
  });
  return scriptPromise;
};

/**
 * Proves the visitor is human once (Turnstile), then holds the short-lived
 * session the Worker hands back so later messages don't re-challenge.
 */
export class AssistantSession {
  private token: string | null = null;
  private expiresAt = 0;
  private inflight: Promise<string> | null = null;
  private container: HTMLElement | null = null;
  private widgetId: string | null = null;
  private waiter: {
    resolve: (token: string) => void;
    reject: (err: Error) => void;
  } | null = null;

  /** The Turnstile widget lives in the open chat panel */
  attach(el: HTMLElement) {
    this.container = el;
  }

  detach() {
    if (this.widgetId && window.turnstile) {
      window.turnstile.remove(this.widgetId);
    }
    this.widgetId = null;
    this.container = null;
    this.waiter?.reject(fail("verify"));
    this.waiter = null;
  }

  invalidate() {
    this.token = null;
  }

  get(): Promise<string> {
    // Refresh a minute early so a session never expires mid-request
    if (this.token && this.expiresAt - 60_000 > Date.now()) {
      return Promise.resolve(this.token);
    }
    this.inflight ??= this.create().finally(() => {
      this.inflight = null;
    });
    return this.inflight;
  }

  private async create() {
    const turnstileToken = await this.challenge();
    let res: Response;
    try {
      res = await fetch(`${ASSISTANT_URL}/session`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token: turnstileToken }),
      });
    } catch {
      throw fail("network");
    }
    if (res.status === 429) throw fail("rate");
    if (res.status === 403) throw fail("verify");
    if (!res.ok) throw fail("server");
    const { session, expiresAt } = await res.json();
    this.token = session;
    this.expiresAt = expiresAt;
    return session as string;
  }

  private async challenge() {
    await loadTurnstile();
    const turnstile = window.turnstile;
    const container = this.container;
    if (!turnstile || !container) throw fail("verify");

    return new Promise<string>((resolve, reject) => {
      const timeout = window.setTimeout(() => reject(fail("verify")), 45_000);
      this.waiter = {
        resolve: (token) => {
          window.clearTimeout(timeout);
          resolve(token);
        },
        reject: (err) => {
          window.clearTimeout(timeout);
          reject(err);
        },
      };
      if (this.widgetId) {
        turnstile.reset(this.widgetId);
        return;
      }
      this.widgetId = turnstile.render(container, {
        sitekey: TURNSTILE_SITE_KEY,
        // The Worker only accepts tokens issued for this action
        action: "ask-advaith",
        // Invisible unless Cloudflare actually needs the visitor to click
        appearance: "interaction-only",
        theme: "auto",
        // The normal widget is a fixed 300px; narrow phones need compact
        size: container.clientWidth < 310 ? "compact" : "normal",
        callback: (token) => {
          this.waiter?.resolve(token);
          this.waiter = null;
        },
        "error-callback": () => {
          this.waiter?.reject(fail("verify"));
          this.waiter = null;
        },
      });
    });
  }
}

// --------------------------------------------------------------------- chat

/** Streams one reply, calling onEvent for every text chunk / tool call */
export const streamChat = async (
  session: string,
  messages: ChatTurn[],
  onEvent: (event: ServerEvent) => void,
  signal: AbortSignal
) => {
  let res: Response;
  try {
    res = await fetch(`${ASSISTANT_URL}/chat`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ session, messages }),
      signal,
    });
  } catch (err) {
    if (signal.aborted) throw err;
    throw fail("network");
  }
  if (res.status === 401) throw fail("session");
  if (res.status === 429) throw fail("rate");
  if (!res.ok || !res.body) throw fail("server");

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let boundary: number;
    while ((boundary = buffer.indexOf("\n\n")) >= 0) {
      const block = buffer.slice(0, boundary);
      buffer = buffer.slice(boundary + 2);
      for (const line of block.split("\n")) {
        if (!line.startsWith("data:")) continue;
        try {
          onEvent(JSON.parse(line.slice(5)));
        } catch {
          // Ignore a malformed chunk rather than dropping the whole reply
        }
      }
    }
  }
};
