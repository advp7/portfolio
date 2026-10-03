import {
  CASE_STUDY_IDS,
  SECTION_IDS,
  buildSystemPrompt,
} from "./knowledge";

interface Env {
  AI: Ai;
  CHAT_LIMITER: RateLimit;
  SESSION_LIMITER: RateLimit;
  GEMINI_API_KEY?: string;
  TURNSTILE_SECRET_KEY?: string;
  ALLOWED_ORIGINS: string;
  GEMINI_MODEL: string;
  GEMINI_THINKING_LEVEL: string;
  FALLBACK_MODEL: string;
}

type Role = "user" | "assistant";
interface ChatMessage {
  role: Role;
  text: string;
}

/** What the browser receives, one JSON object per SSE `data:` line */
type ClientEvent =
  | { type: "text"; text: string }
  | { type: "action"; name: string; args: Record<string, string> }
  | { type: "done"; provider: Provider };
type Provider = "gemini" | "workers-ai" | "static";
type Emit = (event: ClientEvent) => void;

const SESSION_TTL_MS = 30 * 60 * 1000;
const MAX_MESSAGES = 20; // conversation length cap
const HISTORY_WINDOW = 10; // most recent messages sent to the model
const MAX_USER_CHARS = 500;
const MAX_ASSISTANT_CHARS = 3000;
const MAX_BODY_BYTES = 40_000;
const MAX_OUTPUT_TOKENS = 600;

const SYSTEM_WITH_TOOLS = buildSystemPrompt(true);
const SYSTEM_TEXT_ONLY = buildSystemPrompt(false);

const OFF_TOPIC_REPLY =
  "I can only help with questions about Advaith's work, skills and projects. Is there something about those I can answer?";
const STATIC_REPLY =
  "The assistant has used up its free AI quota for now, so I can't answer properly. You can still explore the case studies on this page, download the resume, or email Advaith directly.";

// Client-side tools. Gemini decides when to call them; the browser runs them.
const TOOLS = [
  {
    name: "open_case_study",
    description: "Open one of Advaith's case studies on the page.",
    parameters: {
      type: "OBJECT",
      properties: {
        id: {
          type: "STRING",
          enum: CASE_STUDY_IDS,
          description: "The case study id from KNOWLEDGE.",
        },
      },
      required: ["id"],
    },
  },
  {
    name: "scroll_to_section",
    description: "Scroll the page to a section.",
    parameters: {
      type: "OBJECT",
      properties: { section: { type: "STRING", enum: SECTION_IDS } },
      required: ["section"],
    },
  },
  {
    name: "download_resume",
    description: "Show the visitor a button to download Advaith's resume (PDF).",
  },
  {
    name: "copy_email",
    description: "Show the visitor a button to copy Advaith's email address.",
  },
];

const encoder = new TextEncoder();

// ---------------------------------------------------------------- utilities

const json = (body: unknown, status: number, headers: HeadersInit = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", ...headers },
  });

const corsHeaders = (origin: string): Record<string, string> => ({
  "Access-Control-Allow-Origin": origin,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "content-type",
  "Access-Control-Max-Age": "86400",
  Vary: "Origin",
});

const b64url = (bytes: ArrayBuffer | Uint8Array) =>
  btoa(String.fromCharCode(...new Uint8Array(bytes)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

const fromB64url = (value: string) => {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  return Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
};

/** Reads an SSE byte stream and yields each `data:` payload */
async function* readSse(body: ReadableStream<Uint8Array>) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let newline: number;
    while ((newline = buffer.indexOf("\n")) >= 0) {
      const line = buffer.slice(0, newline).replace(/\r$/, "");
      buffer = buffer.slice(newline + 1);
      if (line.startsWith("data:")) yield line.slice(5).trim();
    }
  }
  if (buffer.startsWith("data:")) yield buffer.slice(5).trim();
}

// ------------------------------------------------------------------ session
// Turnstile tokens are single-use, so a successful check is exchanged for a
// short-lived signed session that covers the rest of the conversation.

const sessionKey = async (env: Env) => {
  const raw = await crypto.subtle.digest(
    "SHA-256",
    encoder.encode(`ask-advaith-session:${env.TURNSTILE_SECRET_KEY}`)
  );
  return crypto.subtle.importKey(
    "raw",
    raw,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
};

const issueSession = async (env: Env) => {
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const payload = b64url(encoder.encode(JSON.stringify({ exp: expiresAt })));
  const signature = await crypto.subtle.sign(
    "HMAC",
    await sessionKey(env),
    encoder.encode(payload)
  );
  return { session: `${payload}.${b64url(signature)}`, expiresAt };
};

const verifySession = async (env: Env, token: unknown) => {
  if (typeof token !== "string" || token.length > 512) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;
  try {
    const valid = await crypto.subtle.verify(
      "HMAC",
      await sessionKey(env),
      fromB64url(signature),
      encoder.encode(payload)
    );
    if (!valid) return false;
    const { exp } = JSON.parse(new TextDecoder().decode(fromB64url(payload)));
    return typeof exp === "number" && exp > Date.now();
  } catch {
    return false;
  }
};

const verifyTurnstile = async (
  env: Env,
  token: string,
  ip: string,
  allowedHosts: string[]
) => {
  const form = new FormData();
  form.append("secret", env.TURNSTILE_SECRET_KEY ?? "");
  form.append("response", token);
  form.append("remoteip", ip);
  const res = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    { method: "POST", body: form }
  );
  const outcome = await res.json<{
    success: boolean;
    hostname?: string;
    "error-codes"?: string[];
  }>();
  if (!outcome.success) {
    console.warn("turnstile rejected", outcome["error-codes"]);
    return false;
  }
  return !outcome.hostname || allowedHosts.includes(outcome.hostname);
};

// -------------------------------------------------------------- validation

const parseMessages = (value: unknown): ChatMessage[] | null => {
  if (!Array.isArray(value) || value.length === 0) return null;
  if (value.length > MAX_MESSAGES) return null;
  const messages: ChatMessage[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") return null;
    const { role, text } = item as Record<string, unknown>;
    if ((role !== "user" && role !== "assistant") || typeof text !== "string") {
      return null;
    }
    const limit = role === "user" ? MAX_USER_CHARS : MAX_ASSISTANT_CHARS;
    const trimmed = text.trim();
    if (!trimmed || trimmed.length > limit) return null;
    messages.push({ role, text: trimmed });
  }
  if (messages[messages.length - 1].role !== "user") return null;
  // Gemini needs the history to start with a user turn
  const recent = messages.slice(-HISTORY_WINDOW);
  while (recent.length && recent[0].role !== "user") recent.shift();
  return recent;
};

/** Only pass through tool calls with arguments we recognise */
const toAction = (call: {
  name?: string;
  args?: Record<string, unknown>;
}): ClientEvent | null => {
  const args = call.args ?? {};
  switch (call.name) {
    case "open_case_study":
      return CASE_STUDY_IDS.includes(String(args.id))
        ? { type: "action", name: call.name, args: { id: String(args.id) } }
        : null;
    case "scroll_to_section":
      return SECTION_IDS.includes(String(args.section))
        ? {
            type: "action",
            name: call.name,
            args: { section: String(args.section) },
          }
        : null;
    case "download_resume":
    case "copy_email":
      return { type: "action", name: call.name, args: {} };
    default:
      return null;
  }
};

// --------------------------------------------------------------- providers

/**
 * "ok": something was streamed. "empty": Gemini answered with nothing usable
 * (e.g. a safety block), which we don't retry elsewhere. "unavailable":
 * quota, outage or config problem; try the fallback.
 */
const streamGemini = async (
  env: Env,
  messages: ChatMessage[],
  emit: Emit
): Promise<"ok" | "empty" | "unavailable"> => {
  if (!env.GEMINI_API_KEY) return "unavailable";
  let produced = false;
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${env.GEMINI_MODEL}:streamGenerateContent?alt=sse`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-goog-api-key": env.GEMINI_API_KEY,
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_WITH_TOOLS }] },
          contents: messages.map((m) => ({
            role: m.role === "assistant" ? "model" : "user",
            parts: [{ text: m.text }],
          })),
          tools: [{ functionDeclarations: TOOLS }],
          generationConfig: {
            maxOutputTokens: MAX_OUTPUT_TOKENS,
            temperature: 0.4,
            // Short factual answers need as little thinking as possible
            thinkingConfig: { thinkingLevel: env.GEMINI_THINKING_LEVEL },
          },
        }),
      }
    );
    if (!res.ok || !res.body) {
      console.error("gemini error", res.status, await res.text().catch(() => ""));
      return "unavailable";
    }
    for await (const data of readSse(res.body)) {
      let chunk: any;
      try {
        chunk = JSON.parse(data);
      } catch {
        continue;
      }
      const parts: any[] = chunk?.candidates?.[0]?.content?.parts ?? [];
      for (const part of parts) {
        if (typeof part.text === "string" && part.text && !part.thought) {
          emit({ type: "text", text: part.text });
          produced = true;
        } else if (part.functionCall) {
          const action = toAction(part.functionCall);
          if (action) {
            emit(action);
            produced = true;
          }
        }
      }
    }
    return produced ? "ok" : "empty";
  } catch (err) {
    console.error("gemini failed", err);
    return produced ? "ok" : "unavailable";
  }
};

const streamWorkersAi = async (
  env: Env,
  messages: ChatMessage[],
  emit: Emit
): Promise<boolean> => {
  let produced = false;
  try {
    const stream = (await env.AI.run(env.FALLBACK_MODEL as any, {
      messages: [
        { role: "system", content: SYSTEM_TEXT_ONLY },
        ...messages.map((m) => ({ role: m.role, content: m.text })),
      ],
      stream: true,
      max_tokens: MAX_OUTPUT_TOKENS,
      temperature: 0.4,
    })) as ReadableStream<Uint8Array>;
    for await (const data of readSse(stream)) {
      if (data === "[DONE]") break;
      let chunk: any;
      try {
        chunk = JSON.parse(data);
      } catch {
        continue;
      }
      const text = chunk?.response ?? chunk?.choices?.[0]?.delta?.content;
      if (typeof text === "string" && text) {
        emit({ type: "text", text });
        produced = true;
      }
    }
  } catch (err) {
    console.error("workers ai failed", err);
  }
  return produced;
};

// ---------------------------------------------------------------- handlers

const handleSession = async (
  request: Request,
  env: Env,
  ip: string,
  cors: Record<string, string>,
  allowedHosts: string[]
) => {
  if (!env.TURNSTILE_SECRET_KEY) {
    console.error("TURNSTILE_SECRET_KEY is not set");
    return json({ error: "not_configured" }, 503, cors);
  }
  const { success } = await env.SESSION_LIMITER.limit({ key: ip });
  if (!success) return json({ error: "rate_limited" }, 429, cors);

  const body = await request.json<{ token?: unknown }>().catch(() => null);
  const token = body?.token;
  if (typeof token !== "string" || !token || token.length > 4096) {
    return json({ error: "bad_request" }, 400, cors);
  }
  if (!(await verifyTurnstile(env, token, ip, allowedHosts))) {
    return json({ error: "verification_failed" }, 403, cors);
  }
  return json(await issueSession(env), 200, cors);
};

const handleChat = async (
  request: Request,
  env: Env,
  ctx: ExecutionContext,
  ip: string,
  cors: Record<string, string>
) => {
  const { success } = await env.CHAT_LIMITER.limit({ key: ip });
  if (!success) return json({ error: "rate_limited" }, 429, cors);

  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) {
    return json({ error: "too_large" }, 413, cors);
  }
  let body: { session?: unknown; messages?: unknown };
  try {
    body = JSON.parse(raw);
  } catch {
    return json({ error: "bad_request" }, 400, cors);
  }
  if (!env.TURNSTILE_SECRET_KEY || !(await verifySession(env, body.session))) {
    return json({ error: "session_expired" }, 401, cors);
  }
  const messages = parseMessages(body.messages);
  if (!messages) return json({ error: "bad_request" }, 400, cors);

  const { readable, writable } = new TransformStream<Uint8Array>();
  const writer = writable.getWriter();
  const emit: Emit = (event) => {
    // The visitor may have closed the chat; nothing to do about it
    writer
      .write(encoder.encode(`data: ${JSON.stringify(event)}\n\n`))
      .catch(() => {});
  };

  ctx.waitUntil(
    (async () => {
      let provider: Provider = "gemini";
      try {
        const result = await streamGemini(env, messages, emit);
        if (result === "empty") {
          emit({ type: "text", text: OFF_TOPIC_REPLY });
        } else if (result === "unavailable") {
          provider = "workers-ai";
          if (!(await streamWorkersAi(env, messages, emit))) {
            provider = "static";
            emit({ type: "text", text: STATIC_REPLY });
          }
        }
      } finally {
        emit({ type: "done", provider });
        await writer.close().catch(() => {});
      }
    })()
  );

  return new Response(readable, {
    headers: {
      ...cors,
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-cache, no-transform",
    },
  });
};

export default {
  async fetch(request, env, ctx): Promise<Response> {
    const url = new URL(request.url);
    const allowedOrigins = env.ALLOWED_ORIGINS.split(",").map((o) => o.trim());
    const allowedHosts = allowedOrigins.map((o) => new URL(o).hostname);
    const origin = request.headers.get("Origin") ?? "";
    const cors = allowedOrigins.includes(origin) ? corsHeaders(origin) : null;

    if (url.pathname === "/health") return json({ ok: true }, 200);
    if (!cors) return json({ error: "forbidden" }, 403);
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }
    if (request.method !== "POST") {
      return json({ error: "method_not_allowed" }, 405, cors);
    }

    const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";
    try {
      if (url.pathname === "/session") {
        return await handleSession(request, env, ip, cors, allowedHosts);
      }
      if (url.pathname === "/chat") {
        return await handleChat(request, env, ctx, ip, cors);
      }
      return json({ error: "not_found" }, 404, cors);
    } catch (err) {
      console.error("unhandled", err);
      return json({ error: "server_error" }, 500, cors);
    }
  },
} satisfies ExportedHandler<Env>;
