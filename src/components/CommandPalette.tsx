// react
import {
  KeyboardEvent as ReactKeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
// framer-motion
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
// data
import { caseStudies, socials } from "../data";
// theme
import { useTheme } from "../theme";
// assistant
import { OPEN_ASSISTANT_EVENT } from "../assistant/config";

interface Command {
  id: string;
  group: "Navigate" | "Case studies" | "Actions" | "Theme" | "Links";
  label: string;
  keywords?: string;
  run: () => void;
}

/** Fired by the nav hint button (and anything else) to open the palette */
export const OPEN_PALETTE_EVENT = "open-command-palette";
/** Fired by the palette; Projects listens and opens the matching case study */
export const OPEN_CASE_STUDY_EVENT = "open-case-study";

export const isMac = () =>
  typeof navigator !== "undefined" &&
  /Mac|iPhone|iPad/i.test(navigator.platform || navigator.userAgent);

const scrollToSection = (id: string) => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document
    .getElementById(id)
    ?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
};

const viewportCentre = () => ({
  x: window.innerWidth / 2,
  y: window.innerHeight / 2,
});

const CommandPalette = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const { setMode } = useTheme();
  const shouldReduceMotion = useReducedMotion();

  const showToast = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2200);
  }, []);

  const commands = useMemo<Command[]>(
    () => [
      ...[
        ["home", "Home"],
        ["about", "About"],
        ["experience", "Experience"],
        ["skills", "Skills"],
        ["projects", "Projects"],
        ["contact", "Contact"],
      ].map(([id, label]) => ({
        id: `nav-${id}`,
        group: "Navigate" as const,
        label: `Go to ${label}`,
        keywords: "section scroll jump",
        run: () => scrollToSection(id),
      })),
      ...caseStudies.map((study) => ({
        id: `case-${study.id}`,
        group: "Case studies" as const,
        label: study.title,
        keywords: `${study.stack.join(" ")} project case study`,
        run: () =>
          window.dispatchEvent(
            new CustomEvent(OPEN_CASE_STUDY_EVENT, { detail: study.id })
          ),
      })),
      {
        id: "ask-advaith",
        group: "Actions",
        label: "Ask Advaith (AI assistant)",
        keywords: "ai chat question bot help",
        run: () => window.dispatchEvent(new Event(OPEN_ASSISTANT_EVENT)),
      },
      {
        id: "copy-email",
        group: "Actions",
        label: "Copy email address",
        keywords: `contact mail ${socials.email}`,
        run: () => {
          navigator.clipboard
            ?.writeText(socials.email)
            .then(() => showToast("Email copied to clipboard"))
            .catch(() => showToast(socials.email));
        },
      },
      {
        id: "download-resume",
        group: "Actions",
        label: "Download resume",
        keywords: "cv pdf",
        run: () => {
          const a = document.createElement("a");
          a.href = `${process.env.PUBLIC_URL}/CV_ADVAITH.pdf`;
          a.download = "Advaith_Resume.pdf";
          a.click();
        },
      },
      {
        id: "theme-light",
        group: "Theme",
        label: "Switch to light theme",
        keywords: "mode appearance",
        run: () => setMode("light", viewportCentre()),
      },
      {
        id: "theme-dark",
        group: "Theme",
        label: "Switch to dark theme",
        keywords: "mode appearance",
        run: () => setMode("dark", viewportCentre()),
      },
      {
        id: "theme-system",
        group: "Theme",
        label: "Use system theme",
        keywords: "mode appearance auto os",
        run: () => setMode("system", viewportCentre()),
      },
      {
        id: "link-linkedin",
        group: "Links",
        label: "Open LinkedIn",
        keywords: "social profile",
        run: () => window.open(socials.linkedin, "_blank", "noopener"),
      },
      {
        id: "link-github",
        group: "Links",
        label: "Open GitHub",
        keywords: "social code repositories",
        run: () => window.open(socials.github, "_blank", "noopener"),
      },
    ],
    [setMode, showToast]
  );

  const results = useMemo(() => {
    const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
    if (terms.length === 0) return commands;
    return commands.filter((c) => {
      const haystack = `${c.label} ${c.group} ${c.keywords ?? ""}`.toLowerCase();
      return terms.every((t) => haystack.includes(t));
    });
  }, [commands, query]);

  // Global shortcut + external open requests
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_PALETTE_EVENT, onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_PALETTE_EVENT, onOpen);
    };
  }, []);

  // Scroll lock, focus in, focus restore
  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    setQuery("");
    setActive(0);
    // The input is mounted in the same commit, so focus it right away;
    // no animation frame needed (those never fire in background tabs)
    inputRef.current?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
      opener?.focus({ preventScroll: true });
    };
  }, [open]);

  // Keep the highlighted option in view while arrowing through the list
  useEffect(() => {
    listRef.current
      ?.querySelector(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const run = (command: Command) => {
    setOpen(false);
    // Let the palette release scroll-lock and focus before the action runs
    window.setTimeout(() => command.run(), 0);
  };

  const onInputKeyDown = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (results.length ? (i + 1) % results.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) =>
        results.length ? (i - 1 + results.length) % results.length : 0
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results[active]) run(results[active]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    } else if (e.key === "Tab") {
      // The input is the only focus stop; keep focus inside the dialog
      e.preventDefault();
    }
  };

  const activeCommand = results[active];
  let lastGroup = "";

  return createPortal(
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            key="palette"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[85] bg-backdrop flex items-start justify-center px-4 pt-[12vh]"
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Command menu"
              onClick={(e) => e.stopPropagation()}
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: -8 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="w-full max-w-xl overflow-hidden rounded-2xl border border-stroke bg-panel
              shadow-[0_24px_80px_var(--shadow-modal)]"
            >
              <div className="flex items-center gap-3 border-b border-stroke px-4">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-4 w-4 shrink-0 text-textMuted"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="M20 20l-3.5-3.5" />
                </svg>
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setActive(0);
                  }}
                  onKeyDown={onInputKeyDown}
                  placeholder="Type a command or search…"
                  role="combobox"
                  aria-expanded="true"
                  aria-controls="command-list"
                  aria-autocomplete="list"
                  aria-activedescendant={
                    activeCommand ? `command-${activeCommand.id}` : undefined
                  }
                  className="h-14 w-full bg-transparent text-base text-textPrimary placeholder-textMuted outline-none"
                  style={{ outline: "none" }}
                />
                <kbd className="shrink-0 rounded border border-stroke px-1.5 py-0.5 font-mono text-[10px] text-textMuted">
                  ESC
                </kbd>
              </div>

              <ul
                ref={listRef}
                id="command-list"
                role="listbox"
                aria-label="Commands"
                className="max-h-[min(60vh,420px)] overflow-y-auto p-2"
              >
                {results.length === 0 && (
                  <li className="px-3 py-8 text-center text-sm text-textMuted">
                    No results for “{query}”
                  </li>
                )}
                {results.map((command, index) => {
                  const showGroup = command.group !== lastGroup;
                  lastGroup = command.group;
                  const selected = index === active;
                  return (
                    <li key={command.id} role="presentation">
                      {showGroup && (
                        <p
                          role="presentation"
                          className="px-3 pb-1 pt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-textMuted"
                        >
                          {command.group}
                        </p>
                      )}
                      <div
                        id={`command-${command.id}`}
                        role="option"
                        aria-selected={selected}
                        data-index={index}
                        onMouseMove={() => setActive(index)}
                        onClick={() => run(command)}
                        className={`flex cursor-pointer items-center justify-between rounded-lg px-3 py-2.5 text-sm ${
                          selected
                            ? "bg-accent/10 text-textPrimary"
                            : "text-textSecondary"
                        }`}
                      >
                        <span>{command.label}</span>
                        {selected && (
                          <span
                            aria-hidden="true"
                            className="font-mono text-[11px] text-accent"
                          >
                            ↵
                          </span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Live region exists before any message so screen readers announce it;
          the flex wrapper centres the toast without fighting framer's transform */}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-6 z-[95] flex justify-center px-4"
      >
        <AnimatePresence>
          {toast && (
            <motion.div
              key="toast"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              className="rounded-full border border-stroke bg-panel px-4 py-2 text-sm text-textPrimary
              shadow-[0_12px_40px_var(--shadow-modal)]"
            >
              {toast}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>,
    document.body
  );
};

export default CommandPalette;
