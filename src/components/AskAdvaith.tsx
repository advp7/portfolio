// react
import {
  FormEvent,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
// framer-motion
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
// data
import { caseStudies, socials } from "../data";
// assistant
import {
  AssistantAction,
  AssistantSession,
  ChatTurn,
  ErrorCode,
  errorCode,
  loadTurnstile,
  streamChat,
} from "../assistant/client";
import {
  HIGHLIGHT_ASSISTANT_EVENT,
  OPEN_ASSISTANT_EVENT,
} from "../assistant/config";
// components
import { OPEN_CASE_STUDY_EVENT } from "./CommandPalette";
// intro
import { useIntro } from "../intro";

interface Message {
  id: number;
  role: "user" | "assistant";
  text: string;
  actions: AssistantAction[];
  status: "streaming" | "done" | "error";
  /** Failed exchanges are kept on screen but not sent back to the model */
  excluded?: boolean;
}

const MAX_MESSAGES = 20;
const MAX_CHARS = 500;

const SUGGESTIONS = [
  "What has Advaith built with AI?",
  "Is Advaith frontend or full-stack?",
  "Tell me about the RCS launch",
  "How do I get in touch?",
];

const ERROR_TEXT: Record<ErrorCode, string> = {
  session: "My session expired. Please send that again.",
  rate: "That's a lot of questions at once. Give it a minute and try again.",
  verify:
    "I couldn't confirm you're human (Cloudflare Turnstile). Check that it isn't blocked, then try again.",
  network: "I couldn't reach the assistant. Check your connection and try again.",
  server: "Something went wrong on my side. Please try again.",
};

const SECTION_LABELS: Record<string, string> = {
  home: "the top",
  about: "About",
  experience: "Experience",
  skills: "Skills",
  projects: "Projects",
  contact: "Contact",
};

const RESUME_HREF = `${process.env.PUBLIC_URL}/CV_ADVAITH.pdf`;

const isSmallScreen = () => window.matchMedia("(max-width: 639px)").matches;

const scrollToSection = (id: string) => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document
    .getElementById(id)
    ?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
};

/** Words the model can use when a reply is only a tool call */
const describeActions = (actions: AssistantAction[]) =>
  actions
    .map((action) => {
      switch (action.name) {
        case "open_case_study":
          return `Opened the case study "${
            caseStudies.find((s) => s.id === action.args.id)?.title ?? ""
          }".`;
        case "scroll_to_section":
          return `Took you to ${SECTION_LABELS[action.args.section]}.`;
        case "download_resume":
          return "Here's Advaith's resume.";
        case "copy_email":
          return "Here's Advaith's email.";
        default:
          return "";
      }
    })
    .join(" ");

// ------------------------------------------------------------ rich text

const INLINE =
  /(\*\*[^*]+\*\*|https?:\/\/[^\s)]*[^\s).,]|[\w.+-]+@[\w-]+\.[\w.-]*\w)/g;

const renderInline = (text: string, keyPrefix: string) =>
  text.split(INLINE).map((part, i): ReactNode => {
    const key = `${keyPrefix}-${i}`;
    if (/^\*\*[^*]+\*\*$/.test(part)) {
      return (
        <strong key={key} className="font-semibold text-textPrimary">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (/^https?:\/\//.test(part)) {
      return (
        <a
          key={key}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent underline underline-offset-2 break-all"
        >
          {part.replace(/^https?:\/\/(www\.)?/, "")}
        </a>
      );
    }
    if (/^[\w.+-]+@[\w-]+\.[\w.-]*\w$/.test(part)) {
      return (
        <a
          key={key}
          href={`mailto:${part}`}
          className="text-accent underline underline-offset-2"
        >
          {part}
        </a>
      );
    }
    return part;
  });

/** Paragraphs, "- " bullets, **bold**, links. No HTML is ever injected. */
const RichText = ({ text }: { text: string }) => {
  const blocks: ReactNode[] = [];
  let bullets: string[] = [];
  const flush = () => {
    if (!bullets.length) return;
    const key = `ul-${blocks.length}`;
    blocks.push(
      <ul key={key} className="list-disc space-y-1 pl-5 marker:text-accent">
        {bullets.map((item, i) => (
          <li key={i}>{renderInline(item, `${key}-${i}`)}</li>
        ))}
      </ul>
    );
    bullets = [];
  };
  text.split("\n").forEach((line) => {
    const bullet = line.match(/^\s*[-*•]\s+(.*)$/);
    if (bullet) {
      bullets.push(bullet[1]);
      return;
    }
    flush();
    if (line.trim()) {
      const key = `p-${blocks.length}`;
      blocks.push(<p key={key}>{renderInline(line, key)}</p>);
    }
  });
  flush();
  return <div className="flex flex-col gap-2">{blocks}</div>;
};

// ----------------------------------------------------------------- icons

const SparkIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12 2c.7 5.3 4.7 9.3 10 10-5.3.7-9.3 4.7-10 10-.7-5.3-4.7-9.3-10-10 5.3-.7 9.3-4.7 10-10z" />
  </svg>
);

const IconButton = ({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) => (
  <button
    type="button"
    aria-label={label}
    title={label}
    onClick={onClick}
    className="flex h-8 w-8 items-center justify-center rounded-full text-textMuted
    hover:bg-surfaceHover hover:text-textPrimary transition-colors"
  >
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  </button>
);

// --------------------------------------------------------------- actions

const ActionChip = ({ action }: { action: AssistantAction }) => {
  const [copied, setCopied] = useState(false);
  const chip =
    "inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent hover:bg-accent/20 transition-colors";

  switch (action.name) {
    case "open_case_study": {
      const study = caseStudies.find((s) => s.id === action.args.id);
      if (!study) return null;
      return (
        <button
          type="button"
          className={chip}
          onClick={() =>
            window.dispatchEvent(
              new CustomEvent(OPEN_CASE_STUDY_EVENT, { detail: study.id })
            )
          }
        >
          Open case study ↗
        </button>
      );
    }
    case "scroll_to_section":
      return (
        <button
          type="button"
          className={chip}
          onClick={() => scrollToSection(action.args.section)}
        >
          Go to {SECTION_LABELS[action.args.section] ?? "section"} ↓
        </button>
      );
    case "download_resume":
      return (
        <a className={chip} href={RESUME_HREF} download="Advaith_Resume.pdf">
          Download resume (PDF) ↓
        </a>
      );
    case "copy_email":
      return (
        <button
          type="button"
          className={chip}
          onClick={() =>
            navigator.clipboard
              ?.writeText(socials.email)
              .then(() => setCopied(true))
              .catch(() => setCopied(false))
          }
        >
          {copied ? "Copied ✓" : `Copy ${socials.email}`}
        </button>
      );
    default:
      return null;
  }
};

// ---------------------------------------------------------------- widget

const AskAdvaith = () => {
  const { done: introDone } = useIntro();
  const shouldReduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [highlighted, setHighlighted] = useState(false);
  const [pendingQuestion, setPendingQuestion] = useState<string | null>(null);

  const sessionRef = useRef(new AssistantSession());
  const abortRef = useRef<AbortController | null>(null);
  const messagesRef = useRef<Message[]>([]);
  const nextId = useRef(1);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const wasOpen = useRef(false);

  messagesRef.current = messages;

  // Opened from the command palette or the project card, optionally with
  // a question to ask straight away
  useEffect(() => {
    const onOpen = (e: Event) => {
      const question = (e as CustomEvent<{ question?: string } | undefined>)
        .detail?.question;
      setHighlighted(false);
      setOpen(true);
      if (question) setPendingQuestion(question);
    };
    const onHighlight = (e: Event) =>
      setHighlighted(Boolean((e as CustomEvent<boolean>).detail));
    window.addEventListener(OPEN_ASSISTANT_EVENT, onOpen);
    window.addEventListener(HIGHLIGHT_ASSISTANT_EVENT, onHighlight);
    return () => {
      window.removeEventListener(OPEN_ASSISTANT_EVENT, onOpen);
      window.removeEventListener(HIGHLIGHT_ASSISTANT_EVENT, onHighlight);
    };
  }, []);

  // Focus in on open, back to the launcher on close
  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    } else if (wasOpen.current) {
      launcherRef.current?.focus({ preventScroll: true });
    }
    wasOpen.current = open;
  }, [open]);

  // Keep the newest message in view while it streams
  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [messages]);

  // The Turnstile widget lives inside the panel, so tie it to the panel
  const turnstileRef = useCallback((el: HTMLDivElement | null) => {
    const session = sessionRef.current;
    if (el) {
      session.attach(el);
      // Verify in the background while the visitor reads / types
      session.get().catch(() => {});
    } else {
      session.detach();
    }
  }, []);

  const patch = (id: number, update: (m: Message) => Message) =>
    setMessages((prev) => prev.map((m) => (m.id === id ? update(m) : m)));

  const runAction = useCallback((action: AssistantAction) => {
    // These two act on the page; the others wait for the visitor's click
    if (action.name === "open_case_study") {
      if (isSmallScreen()) setOpen(false);
      window.setTimeout(() =>
        window.dispatchEvent(
          new CustomEvent(OPEN_CASE_STUDY_EVENT, { detail: action.args.id })
        )
      );
    } else if (action.name === "scroll_to_section") {
      if (isSmallScreen()) setOpen(false);
      scrollToSection(action.args.section);
    }
  }, []);

  const send = async (raw: string) => {
    const text = raw.trim().slice(0, MAX_CHARS);
    if (!text || busy) return;

    const history: ChatTurn[] = messagesRef.current
      .filter((m) => !m.excluded && m.status !== "error")
      .map((m) => ({
        role: m.role,
        text: m.text.trim() || describeActions(m.actions),
      }))
      .filter((m) => m.text);
    history.push({ role: "user", text });

    const userId = nextId.current++;
    const replyId = nextId.current++;
    setMessages((prev) => [
      ...prev,
      { id: userId, role: "user", text, actions: [], status: "done" },
      { id: replyId, role: "assistant", text: "", actions: [], status: "streaming" },
    ]);
    setInput("");
    setBusy(true);

    const controller = new AbortController();
    abortRef.current = controller;
    const session = sessionRef.current;

    const attempt = async (canRetry: boolean): Promise<void> => {
      try {
        // Usually instant (cached session); only mention the human check
        // when Cloudflare is actually waiting on the visitor
        const hint = window.setTimeout(() => setVerifying(true), 600);
        let token: string;
        try {
          token = await session.get();
        } finally {
          window.clearTimeout(hint);
          setVerifying(false);
        }
        await streamChat(
          token,
          history,
          (event) => {
            if (event.type === "text") {
              patch(replyId, (m) => ({ ...m, text: m.text + event.text }));
            } else if (event.type === "action") {
              const action = { name: event.name, args: event.args };
              patch(replyId, (m) => ({ ...m, actions: [...m.actions, action] }));
              runAction(action);
            }
          },
          controller.signal
        );
      } catch (err) {
        if (errorCode(err) === "session" && canRetry) {
          session.invalidate();
          return attempt(false);
        }
        throw err;
      }
    };

    try {
      await attempt(true);
      patch(replyId, (m) => ({
        ...m,
        status: "done",
        text: m.text || (m.actions.length ? describeActions(m.actions) : "…"),
      }));
    } catch (err) {
      if (controller.signal.aborted) {
        patch(replyId, (m) => ({ ...m, status: "done", excluded: true }));
        patch(userId, (m) => ({ ...m, excluded: true }));
      } else {
        const code = errorCode(err) ?? "server";
        patch(replyId, (m) => ({ ...m, status: "error", text: ERROR_TEXT[code] }));
        patch(userId, (m) => ({ ...m, excluded: true }));
      }
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
      setBusy(false);
      inputRef.current?.focus({ preventScroll: true });
    }
  };

  // A question handed over from elsewhere on the page (e.g. the project
  // card) is asked once the panel, and its Turnstile slot, are mounted
  const sendRef = useRef(send);
  sendRef.current = send;
  useEffect(() => {
    if (!open || !pendingQuestion) return;
    if (busy) {
      setInput(pendingQuestion);
    } else {
      sendRef.current(pendingQuestion);
    }
    setPendingQuestion(null);
  }, [open, pendingQuestion, busy]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    send(input);
  };

  const stop = () => abortRef.current?.abort();

  const reset = () => {
    abortRef.current?.abort();
    setMessages([]);
    setInput("");
    inputRef.current?.focus();
  };

  const atLimit = messages.length >= MAX_MESSAGES;

  const panelMotion = shouldReduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, scale: 0.92, y: 16 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.92, y: 16 },
      };

  return createPortal(
    <>
      <AnimatePresence>
        {introDone && !open && (
          <motion.button
            key="launcher"
            ref={launcherRef}
            type="button"
            onClick={() => setOpen(true)}
            // Warm up Turnstile as soon as the visitor shows intent
            onPointerEnter={() => loadTurnstile().catch(() => {})}
            onFocus={() => loadTurnstile().catch(() => {})}
            initial={{ opacity: 0, y: 16, scale: 0.9 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: highlighted && !shouldReduceMotion ? 1.08 : 1,
            }}
            exit={{ opacity: 0, y: 16, scale: 0.9 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            aria-haspopup="dialog"
            className={`ai-launcher fixed bottom-6 right-6 z-[60] flex h-11 items-center gap-2 rounded-full
            ${highlighted ? "is-highlighted" : ""}
            glass pl-3.5 pr-4 text-sm font-medium text-textPrimary
            shadow-[0_12px_40px_var(--shadow-modal)] hover:-translate-y-0.5 transition-transform`}
          >
            <span className="text-accent">
              <SparkIcon />
            </span>
            Ask Advaith
            <span className="sr-only"> (AI assistant)</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* "It's right here": answers the project card's hover */}
      <AnimatePresence>
        {introDone && !open && highlighted && (
          <motion.div
            key="nudge"
            aria-hidden="true"
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="pointer-events-none fixed bottom-[1.85rem] right-[10.75rem] z-[60] whitespace-nowrap
            rounded-full bg-accent px-3 py-1 text-xs font-semibold text-onAccent
            shadow-[0_8px_24px_var(--shadow-modal)]"
          >
            It's right here →
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            role="dialog"
            aria-label="Ask Advaith, an AI assistant"
            {...panelMotion}
            transition={{ duration: 0.22, ease: "easeOut" }}
            style={{ transformOrigin: "bottom right" }}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                e.stopPropagation();
                setOpen(false);
              }
            }}
            className="fixed inset-x-3 bottom-3 z-[70] flex h-[min(640px,calc(100dvh_-_1.5rem))] flex-col
            overflow-hidden rounded-2xl border border-stroke bg-panel
            shadow-[0_24px_80px_var(--shadow-modal)]
            sm:inset-x-auto sm:bottom-6 sm:right-6 sm:w-[400px] sm:h-[min(620px,calc(100dvh_-_3rem))]"
          >
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-stroke px-4 py-3">
              <span
                aria-hidden="true"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full
                bg-gradient-to-br from-accent to-accentAlt text-onAccent"
              >
                <SparkIcon />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display font-semibold leading-tight text-textPrimary">
                  Ask Advaith
                </p>
                <p className="truncate text-xs text-textMuted">
                  AI assistant · answers from this site
                </p>
              </div>
              {messages.length > 0 && (
                <IconButton label="New chat" onClick={reset}>
                  <path d="M3 12a9 9 0 109-9 9.75 9.75 0 00-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                </IconButton>
              )}
              <IconButton label="Close assistant" onClick={() => setOpen(false)}>
                <path d="M18 6L6 18M6 6l12 12" />
              </IconButton>
            </div>

            {/* Conversation */}
            <div
              ref={logRef}
              role="log"
              aria-live="polite"
              aria-busy={busy}
              className="flex-1 overflow-y-auto overscroll-contain px-4 py-4"
            >
              <div className="flex flex-col gap-4 text-sm leading-relaxed">
                <div className="max-w-[90%] rounded-2xl rounded-tl-md bg-surface px-3.5 py-2.5 text-textSecondary">
                  Hi! I'm an AI assistant that knows Advaith's work. Ask me
                  about their experience, projects or skills, or ask me to
                  open a case study.
                </div>

                {messages.length === 0 && (
                  <div className="flex flex-wrap gap-2">
                    {SUGGESTIONS.map((question) => (
                      <button
                        key={question}
                        type="button"
                        onClick={() => send(question)}
                        className="rounded-full border border-stroke px-3 py-1.5 text-xs text-textSecondary
                        hover:border-accent/50 hover:text-textPrimary transition-colors"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                )}

                {messages.map((message) =>
                  message.role === "user" ? (
                    <div
                      key={message.id}
                      className="max-w-[85%] self-end whitespace-pre-wrap break-words rounded-2xl rounded-tr-md
                      bg-accent px-3.5 py-2.5 text-onAccent"
                    >
                      {message.text}
                    </div>
                  ) : (
                    <div key={message.id} className="flex max-w-[90%] flex-col gap-2">
                      <div
                        className={`rounded-2xl rounded-tl-md px-3.5 py-2.5 break-words ${
                          message.status === "error"
                            ? "border border-red-400/40 bg-red-400/10 text-textPrimary"
                            : "bg-surface text-textSecondary"
                        }`}
                      >
                        {message.status === "streaming" && !message.text && verifying ? (
                          <span className="text-textMuted">
                            Running a quick human check. If a checkbox
                            appears below, tick it to continue.
                          </span>
                        ) : message.status === "streaming" && !message.text ? (
                          <span className="flex gap-1 py-1.5" aria-label="Thinking">
                            {[0, 1, 2].map((dot) => (
                              <span
                                key={dot}
                                className="ai-typing-dot h-1.5 w-1.5 rounded-full bg-textMuted"
                                style={{ animationDelay: `${dot * 150}ms` }}
                              />
                            ))}
                          </span>
                        ) : (
                          <RichText text={message.text} />
                        )}
                      </div>
                      {message.actions.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {message.actions.map((action, i) => (
                            <ActionChip key={i} action={action} />
                          ))}
                        </div>
                      )}
                    </div>
                  )
                )}

                {atLimit && (
                  <p className="text-center text-xs text-textMuted">
                    That's the end of this conversation.{" "}
                    <button
                      type="button"
                      onClick={reset}
                      className="text-accent underline underline-offset-2"
                    >
                      Start a new chat
                    </button>
                  </p>
                )}
              </div>
            </div>

            {/* Only becomes visible if Cloudflare needs a click */}
            <div ref={turnstileRef} className="flex justify-center px-4" />

            {/* Composer */}
            <form onSubmit={onSubmit} className="border-t border-stroke p-3">
              <div
                className="flex items-center gap-2 rounded-xl border border-stroke bg-surface pl-3.5 pr-1.5
                focus-within:border-accent/60 transition-colors"
              >
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  maxLength={MAX_CHARS}
                  disabled={atLimit}
                  placeholder={atLimit ? "Start a new chat to continue" : "Ask about Advaith's work…"}
                  aria-label="Your question"
                  className="h-11 min-w-0 flex-1 bg-transparent text-sm text-textPrimary placeholder-textMuted outline-none"
                  style={{ outline: "none" }}
                />
                {busy ? (
                  <button
                    type="button"
                    onClick={stop}
                    aria-label="Stop generating"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-stroke text-textPrimary"
                  >
                    <span aria-hidden="true" className="h-2.5 w-2.5 rounded-sm bg-current" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!input.trim() || atLimit}
                    aria-label="Send"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent text-onAccent
                    disabled:opacity-40 transition-opacity"
                  >
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 19V5M5 12l7-7 7 7" />
                    </svg>
                  </button>
                )}
              </div>
              <p className="mt-2 text-center text-[11px] leading-snug text-textMuted">
                AI-generated answers can be wrong. Messages are processed by
                Google Gemini.
              </p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>,
    document.body
  );
};

export default AskAdvaith;
