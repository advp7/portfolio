// react
import {
  CSSProperties,
  FormEvent,
  KeyboardEvent as ReactKeyboardEvent,
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
import Orb, { OrbState } from "../assistant/Orb";
import {
  speak,
  speechOutputSupported,
  stopSpeaking,
  unlockSpeech,
  useVoiceInput,
  voiceInputSupported,
  warmUpVoices,
} from "../assistant/voice";
// components
import { OPEN_CASE_STUDY_EVENT, isMac } from "./CommandPalette";
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

const SUGGESTIONS: { icon: ReactNode; text: string }[] = [
  {
    icon: <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />,
    text: "What has Advaith built with AI?",
  },
  {
    icon: (
      <>
        <path d="M12 2l9 5-9 5-9-5 9-5z" />
        <path d="M3 12l9 5 9-5M3 17l9 5 9-5" />
      </>
    ),
    text: "Is Advaith frontend or full-stack?",
  },
  {
    icon: (
      <>
        <path d="M5 15c-1.5 1.3-2 5-2 5s3.7-.5 5-2c.7-.8.7-2.1-.1-2.9-.8-.8-2.1-.8-2.9-.1z" />
        <path d="M12 15l-3-3a22 22 0 012-4A12.9 12.9 0 0122 2c0 2.7-.8 7.5-6 11a22.4 22.4 0 01-4 2z" />
      </>
    ),
    text: "Tell me about the RCS launch",
  },
  {
    icon: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M3 7l9 6 9-6" />
      </>
    ),
    text: "How do I get in touch?",
  },
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

const openCaseStudy = (id: string) =>
  window.dispatchEvent(new CustomEvent(OPEN_CASE_STUDY_EVENT, { detail: id }));

/** Words for a reply that was only a tool call (also sent back as history) */
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
  return <div className="ai-rich flex flex-col gap-2">{blocks}</div>;
};

// ----------------------------------------------------------------- icons

const Icon = ({
  children,
  className = "h-4 w-4",
}: {
  children: ReactNode;
  className?: string;
}) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {children}
  </svg>
);

const HeaderButton = ({
  label,
  onClick,
  pressed,
  className = "",
  children,
}: {
  label: string;
  onClick: () => void;
  pressed?: boolean;
  className?: string;
  children: ReactNode;
}) => (
  <button
    type="button"
    aria-label={label}
    aria-pressed={pressed}
    title={label}
    onClick={onClick}
    className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors
    ${pressed ? "bg-accent/15 text-accent" : "text-textMuted hover:bg-surfaceHover hover:text-textPrimary"}
    ${className}`}
  >
    <Icon>{children}</Icon>
  </button>
);

// --------------------------------------------------------------- actions

const chip =
  "inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent hover:bg-accent/20 transition-colors";

const ActionView = ({ action }: { action: AssistantAction }) => {
  const [copied, setCopied] = useState(false);

  switch (action.name) {
    case "open_case_study": {
      const study = caseStudies.find((s) => s.id === action.args.id);
      if (!study) return null;
      // A preview card rather than a bare link
      return (
        <button
          type="button"
          onClick={() => openCaseStudy(study.id)}
          className="group flex w-full items-center gap-3 rounded-xl border border-stroke bg-surface p-3 text-left
          hover:border-accent/50 hover:bg-surfaceHover transition-colors"
        >
          <span className="min-w-0 flex-1">
            <span className="block font-mono text-[10px] uppercase tracking-[0.16em] text-accent">
              Case study
            </span>
            <span className="block truncate text-sm font-semibold text-textPrimary">
              {study.title}
            </span>
            <span className="block truncate text-xs text-textMuted">
              {study.metric.value} {study.metric.label}
            </span>
          </span>
          <span
            aria-hidden="true"
            className="text-accent transition-transform group-hover:translate-x-0.5"
          >
            →
          </span>
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
  const [expanded, setExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [highlighted, setHighlighted] = useState(false);
  const [pendingQuestion, setPendingQuestion] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [speakReplies, setSpeakReplies] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [canUseVoice] = useState(voiceInputSupported);
  const [canSpeak] = useState(speechOutputSupported);

  const sessionRef = useRef(new AssistantSession());
  const abortRef = useRef<AbortController | null>(null);
  const messagesRef = useRef<Message[]>([]);
  const nextId = useRef(1);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const wasOpen = useRef(false);
  /** Once the visitor mutes replies, voice questions stop un-muting them */
  const userMuted = useRef(false);

  messagesRef.current = messages;

  // ---- voice in: the orbs and the waveform follow the mic level
  const setLevel = useCallback((level: number) => {
    panelRef.current?.style.setProperty("--level", level.toFixed(3));
  }, []);

  const voice = useVoiceInput({
    onInterim: setCaption,
    onFinal: (text) => {
      setCaption("");
      if (!userMuted.current && canSpeak) setSpeakReplies(true);
      if (text) sendRef.current(text);
    },
    onLevel: setLevel,
  });

  useEffect(warmUpVoices, []);

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
    // ⌘J / Ctrl+J toggles the assistant from anywhere
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "j") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener(OPEN_ASSISTANT_EVENT, onOpen);
    window.addEventListener(HIGHLIGHT_ASSISTANT_EVENT, onHighlight);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener(OPEN_ASSISTANT_EVENT, onOpen);
      window.removeEventListener(HIGHLIGHT_ASSISTANT_EVENT, onHighlight);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  // Focus in on open, back to the launcher on close; closing also silences
  const { cancel: cancelVoice } = voice;
  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    } else {
      cancelVoice();
      stopSpeaking();
      setSpeaking(false);
      if (wasOpen.current) launcherRef.current?.focus({ preventScroll: true });
    }
    wasOpen.current = open;
  }, [open, cancelVoice]);

  // Keep the newest message in view while it streams
  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [messages]);

  // Grow the textarea with its content, up to a few lines
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [input, open]);

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
      window.setTimeout(() => openCaseStudy(action.args.id));
    } else if (action.name === "scroll_to_section") {
      if (isSmallScreen()) setOpen(false);
      scrollToSection(action.args.section);
    }
  }, []);

  const speakReply = (text: string) =>
    speak(text, {
      onStart: () => setSpeaking(true),
      onEnd: () => setSpeaking(false),
    });

  const send = async (raw: string) => {
    const text = raw.trim().slice(0, MAX_CHARS);
    if (!text || busy) return;
    stopSpeaking();

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
    let reply = "";
    let replyActions: AssistantAction[] = [];

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
              reply += event.text;
              patch(replyId, (m) => ({ ...m, text: m.text + event.text }));
            } else if (event.type === "action") {
              const action = { name: event.name, args: event.args };
              replyActions = [...replyActions, action];
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
      const finalText =
        reply || (replyActions.length ? describeActions(replyActions) : "…");
      patch(replyId, (m) => ({ ...m, status: "done", text: finalText }));
      if (speakRepliesRef.current) speakReply(finalText);
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

  // send() is async and outlives renders; read the latest values via refs
  const sendRef = useRef(send);
  sendRef.current = send;
  const speakRepliesRef = useRef(speakReplies);
  speakRepliesRef.current = speakReplies;

  // A question handed over from elsewhere on the page (e.g. the project
  // card) is asked once the panel, and its Turnstile slot, are mounted
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

  const onInputKeyDown = (e: ReactKeyboardEvent<HTMLTextAreaElement>) => {
    // Enter sends; Shift+Enter adds a line
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      send(input);
    }
  };

  const stop = () => abortRef.current?.abort();

  const reset = () => {
    abortRef.current?.abort();
    stopSpeaking();
    setSpeaking(false);
    setMessages([]);
    setInput("");
    inputRef.current?.focus();
  };

  const toggleSpeech = () => {
    if (speakReplies) {
      userMuted.current = true;
      stopSpeaking();
      setSpeaking(false);
    } else {
      userMuted.current = false;
      unlockSpeech(); // still inside the tap, as iOS requires
    }
    setSpeakReplies((s) => !s);
  };

  const toggleMic = () => {
    if (voice.listening) {
      voice.stop();
    } else {
      stopSpeaking();
      setSpeaking(false);
      // Spoken questions get spoken replies; unlock speech while we still
      // have the tap (iOS), before voice.start() awaits the mic
      unlockSpeech();
      voice.start();
    }
  };

  const atLimit = messages.length >= MAX_MESSAGES;
  const latest = messages[messages.length - 1];
  const awaitingFirstToken =
    busy && latest?.role === "assistant" && !latest.text && !latest.actions.length;

  const orbState: OrbState = voice.listening
    ? "listening"
    : awaitingFirstToken
    ? "thinking"
    : busy || speaking
    ? "speaking"
    : "idle";

  const status = voice.listening
    ? "Listening…"
    : verifying
    ? "Checking you're human…"
    : awaitingFirstToken
    ? "Thinking…"
    : busy
    ? "Answering…"
    : speaking
    ? "Speaking…"
    : "Online";

  const panelMotion = shouldReduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, scale: 0.9, y: 24, filter: "blur(6px)" },
        animate: { opacity: 1, scale: 1, y: 0, filter: "blur(0px)" },
        exit: { opacity: 0, scale: 0.94, y: 16, filter: "blur(4px)" },
      };

  const shortcut = isMac() ? "⌘J" : "Ctrl J";
  const orbLayoutId = shouldReduceMotion ? undefined : "assistant-orb";

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
            aria-keyshortcuts={isMac() ? "Meta+J" : "Control+J"}
            className={`ai-launcher fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-[60] flex h-12 items-center gap-2.5 rounded-full
            glass px-[9px] sm:pl-2 sm:pr-4 text-sm font-medium text-textPrimary
            shadow-[0_12px_40px_var(--shadow-modal)] hover:-translate-y-0.5 transition-transform
            ${highlighted ? "is-highlighted" : ""}`}
          >
            <Orb size={30} />
            {/* Phones get just the orb, so it never sits on top of content */}
            <span className="hidden sm:inline">Ask Advaith</span>
            <kbd className="hidden lg:inline rounded border border-stroke px-1.5 py-0.5 font-mono text-[10px] text-textMuted">
              {shortcut}
            </kbd>
            <span className="sr-only sm:hidden">Ask Advaith</span>
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
            className="pointer-events-none fixed bottom-[2.1rem] right-[11.5rem] lg:right-[14.5rem] z-[60]
            whitespace-nowrap rounded-full bg-accent px-3 py-1 text-xs font-semibold text-onAccent
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
            ref={panelRef}
            role="dialog"
            aria-label="Ask Advaith, an AI assistant"
            {...panelMotion}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformOrigin: "bottom right" }}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                e.stopPropagation();
                if (voice.listening) voice.cancel();
                else setOpen(false);
              }
            }}
            className={`ai-panel fixed inset-x-3 bottom-3 z-[70] flex h-[min(680px,calc(100dvh_-_1.5rem))] flex-col
            overflow-hidden rounded-3xl border border-stroke bg-panel
            shadow-[0_32px_100px_var(--shadow-modal)]
            sm:inset-x-auto sm:bottom-6 sm:right-6 transition-[width,height] duration-300
            ${
              expanded
                ? "sm:w-[620px] sm:h-[min(820px,calc(100dvh_-_3rem))]"
                : "sm:w-[420px] sm:h-[min(640px,calc(100dvh_-_3rem))]"
            }`}
          >
            <div aria-hidden="true" className="ai-aurora pointer-events-none absolute inset-x-0 top-0 h-56" />

            {/* Header. The orb only lives here once a conversation starts;
                before that it's the big one in the welcome screen, and it
                glides between the two (shared layoutId). */}
            <div className="relative flex min-h-[70px] items-center gap-3 px-4 pt-4 pb-3">
              {messages.length > 0 && (
                <motion.span layoutId={orbLayoutId} className="flex shrink-0">
                  <Orb size={38} state={orbState} />
                </motion.span>
              )}
              <motion.div layout={shouldReduceMotion ? false : "position"} className="min-w-0 flex-1">
                <p className="font-display font-semibold leading-tight text-textPrimary">
                  Ask Advaith
                </p>
                <p className="flex items-center gap-1.5 truncate text-xs text-textMuted" aria-live="polite">
                  {status === "Online" && (
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                  )}
                  {status}
                </p>
              </motion.div>
              {canSpeak && (
                <HeaderButton
                  label={speakReplies ? "Stop reading replies aloud" : "Read replies aloud"}
                  pressed={speakReplies}
                  onClick={toggleSpeech}
                >
                  <path d="M11 5L6 9H2v6h4l5 4V5z" />
                  {speakReplies ? (
                    <path d="M15.5 8.5a5 5 0 010 7M19 5a10 10 0 010 14" />
                  ) : (
                    <path d="M22 9l-6 6M16 9l6 6" />
                  )}
                </HeaderButton>
              )}
              <HeaderButton
                label={expanded ? "Shrink" : "Expand"}
                onClick={() => setExpanded((x) => !x)}
                className="hidden sm:flex"
              >
                {expanded ? (
                  <path d="M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7" />
                ) : (
                  <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                )}
              </HeaderButton>
              {messages.length > 0 && (
                <HeaderButton label="New chat" onClick={reset}>
                  <path d="M3 12a9 9 0 109-9 9.75 9.75 0 00-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                </HeaderButton>
              )}
              <HeaderButton label="Close assistant" onClick={() => setOpen(false)}>
                <path d="M18 6L6 18M6 6l12 12" />
              </HeaderButton>
            </div>

            {/* Conversation */}
            <div
              ref={logRef}
              role="log"
              aria-live="polite"
              aria-busy={busy}
              className="relative flex-1 overflow-y-auto overscroll-contain px-4 pb-4"
            >
              {messages.length === 0 ? (
                <div className="flex min-h-full flex-col justify-center gap-6 py-4">
                  <div className="flex flex-col items-center gap-4 text-center">
                    <motion.span layoutId={orbLayoutId} className="flex">
                      <Orb size={76} state={orbState} />
                    </motion.span>
                    <div className="flex flex-col gap-1.5">
                      <h3 className="font-display text-xl font-semibold text-textPrimary">
                        <span className="gradient-text">Ask me anything</span> about
                        Advaith
                      </h3>
                      <p className="mx-auto max-w-[300px] text-sm text-textMuted">
                        Experience, projects and skills. Type below
                        {canUseVoice ? ", or tap the mic and just ask" : ""}.
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 xs:grid-cols-2 gap-2">
                    {SUGGESTIONS.map(({ icon, text }, i) => (
                      <motion.button
                        key={text}
                        type="button"
                        onClick={() => send(text)}
                        initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.08 + i * 0.05, duration: 0.3 }}
                        className="group flex items-start gap-2.5 rounded-xl border border-stroke bg-surface p-3 text-left
                        text-[13px] leading-snug text-textSecondary
                        hover:border-accent/50 hover:bg-surfaceHover hover:text-textPrimary transition-colors"
                      >
                        <span className="mt-0.5 text-accent">
                          <Icon className="h-4 w-4">{icon}</Icon>
                        </span>
                        {text}
                      </motion.button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-5 pt-2 text-sm leading-relaxed">
                  {messages.map((message) =>
                    message.role === "user" ? (
                      <motion.div
                        key={message.id}
                        initial={shouldReduceMotion ? false : { opacity: 0, y: 8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className="max-w-[85%] self-end whitespace-pre-wrap break-words rounded-2xl rounded-br-md
                        bg-gradient-to-br from-accent to-accentAlt px-3.5 py-2.5 text-onAccent
                        shadow-[0_8px_24px_rgb(var(--accent)/0.2)]"
                      >
                        {message.text}
                      </motion.div>
                    ) : (
                      <motion.div
                        key={message.id}
                        initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex gap-3"
                      >
                        <Orb
                          size={22}
                          state={message.id === latest?.id ? orbState : "static"}
                          className="mt-0.5"
                        />
                        <div className="flex min-w-0 flex-1 flex-col gap-2.5">
                          {message.status === "error" ? (
                            <div className="rounded-xl border border-red-400/40 bg-red-400/10 px-3.5 py-2.5 text-textPrimary">
                              {message.text}
                            </div>
                          ) : message.status === "streaming" && !message.text ? (
                            verifying ? (
                              <p className="text-textMuted">
                                Running a quick human check. If a checkbox
                                appears below, tick it to continue.
                              </p>
                            ) : (
                              !message.actions.length && (
                                <p className="ai-shimmer font-medium">Thinking</p>
                              )
                            )
                          ) : (
                            <div
                              className={`break-words text-textSecondary ${
                                message.status === "streaming" ? "ai-streaming" : ""
                              }`}
                            >
                              <RichText text={message.text} />
                            </div>
                          )}
                          {message.actions.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {message.actions.map((action, i) => (
                                <ActionView key={i} action={action} />
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
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
              )}
            </div>

            {/* Only becomes visible if Cloudflare needs a click */}
            <div ref={turnstileRef} className="flex justify-center px-4" />

            {/* Composer */}
            <form onSubmit={onSubmit} className="relative px-3 pb-3 pt-1">
              {voice.error && (
                <p role="alert" className="mb-2 flex items-start justify-between gap-2 rounded-lg bg-surface px-3 py-2 text-xs text-textSecondary">
                  {voice.error}
                  <button
                    type="button"
                    onClick={voice.clearError}
                    aria-label="Dismiss"
                    className="text-textMuted hover:text-textPrimary"
                  >
                    ✕
                  </button>
                </p>
              )}
              <div
                className={`flex items-end gap-2 rounded-2xl border bg-surface p-1.5 pl-4 transition-colors
                ${voice.listening ? "border-accent/60" : "border-stroke focus-within:border-accent/60"}`}
              >
                {voice.listening ? (
                  <div className="flex min-h-[40px] min-w-0 flex-1 items-center gap-3" aria-live="polite">
                    <span aria-hidden="true" className="flex h-6 items-center gap-[3px]">
                      {[0.45, 0.75, 1, 0.7, 0.4].map((f, i) => (
                        <span
                          key={i}
                          className="voice-bar w-[3px] rounded-full bg-accent"
                          style={{ "--f": f } as CSSProperties}
                        />
                      ))}
                    </span>
                    <span className="min-w-0 truncate text-sm text-textSecondary">
                      {caption || "Listening… ask your question"}
                    </span>
                  </div>
                ) : (
                  <textarea
                    ref={inputRef}
                    rows={1}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={onInputKeyDown}
                    maxLength={MAX_CHARS}
                    disabled={atLimit}
                    placeholder={atLimit ? "Start a new chat to continue" : "Ask me anything…"}
                    aria-label="Your question"
                    className="min-h-[40px] min-w-0 flex-1 resize-none bg-transparent py-2.5 text-sm text-textPrimary
                    placeholder-textMuted outline-none"
                    style={{ outline: "none" }}
                  />
                )}

                {canUseVoice && !busy && (
                  <button
                    type="button"
                    onClick={toggleMic}
                    disabled={atLimit}
                    aria-label={voice.listening ? "Stop listening" : "Ask with your voice"}
                    aria-pressed={voice.listening}
                    title="Voice input uses your browser's speech recognition"
                    className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors
                    disabled:opacity-40 ${
                      voice.listening
                        ? "bg-accent text-onAccent"
                        : "text-textMuted hover:bg-surfaceHover hover:text-textPrimary"
                    }`}
                  >
                    {voice.listening && (
                      <span aria-hidden="true" className="mic-ring absolute inset-0 rounded-xl" />
                    )}
                    <Icon className="relative h-[18px] w-[18px]">
                      {voice.listening ? (
                        <rect x="7" y="7" width="10" height="10" rx="2" fill="currentColor" stroke="none" />
                      ) : (
                        <>
                          <rect x="9" y="3" width="6" height="11" rx="3" />
                          <path d="M5 11a7 7 0 0014 0M12 18v3" />
                        </>
                      )}
                    </Icon>
                  </button>
                )}

                {busy ? (
                  <button
                    type="button"
                    onClick={stop}
                    aria-label="Stop generating"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-stroke text-textPrimary
                    hover:border-strokeStrong"
                  >
                    <span aria-hidden="true" className="h-3 w-3 rounded-sm bg-current" />
                  </button>
                ) : (
                  !voice.listening && (
                    <button
                      type="submit"
                      disabled={!input.trim() || atLimit}
                      aria-label="Send"
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl
                      bg-gradient-to-br from-accent to-accentAlt text-onAccent
                      disabled:from-surfaceHover disabled:to-surfaceHover disabled:text-textMuted
                      hover:shadow-[0_0_20px_rgb(var(--accent)/0.4)] transition-shadow"
                    >
                      <Icon className="h-[18px] w-[18px]">
                        <path d="M12 19V5M5 12l7-7 7 7" />
                      </Icon>
                    </button>
                  )
                )}
              </div>
              <p className="mt-2 text-center text-[11px] leading-snug text-textMuted">
                AI answers, grounded in Advaith's portfolio
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
