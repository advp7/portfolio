// react
import {
  FC,
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { flushSync } from "react-dom";

export type ThemeMode = "system" | "light" | "dark";
type ResolvedTheme = "light" | "dark";

const STORAGE_KEY = "theme";
const THEME_COLORS: Record<ResolvedTheme, string> = {
  dark: "#060911",
  light: "#f8fafc",
};

/** Viewport point the circular reveal grows from (e.g. the toggle button) */
export type RevealOrigin = { x: number; y: number };

interface ThemeContextValue {
  mode: ThemeMode;
  resolved: ResolvedTheme;
  setMode: (mode: ThemeMode, origin?: RevealOrigin) => void;
}

// View Transitions API — not in TypeScript 4.9's DOM lib yet
type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => void) => {
    ready: Promise<void>;
    finished: Promise<void>;
  };
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

// Dark unless the OS explicitly prefers light — same rule as the pre-paint
// script in public/index.html, so React never disagrees with first paint.
const systemQuery = () => window.matchMedia("(prefers-color-scheme: light)");

const readStoredMode = (): ThemeMode => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    // storage unavailable (private mode, blocked site data) — fall through
  }
  return "system";
};

const resolve = (mode: ThemeMode): ResolvedTheme =>
  mode === "system" ? (systemQuery().matches ? "light" : "dark") : mode;

const applyTheme = (theme: ResolvedTheme) => {
  const root = document.documentElement;
  // Suppress per-element colour transitions for the switch itself
  root.classList.add("theme-switching");
  root.dataset.theme = theme;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", THEME_COLORS[theme]);
  requestAnimationFrame(() =>
    requestAnimationFrame(() => root.classList.remove("theme-switching"))
  );
};

export const ThemeProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<ThemeMode>(readStoredMode);
  const [resolved, setResolved] = useState<ResolvedTheme>(() =>
    resolve(readStoredMode())
  );

  // Apply whenever the chosen mode changes; in "system" mode, also follow
  // live OS changes (e.g. macOS auto dark mode at sunset)
  useEffect(() => {
    const update = () => {
      const next = resolve(mode);
      setResolved(next);
      applyTheme(next);
    };
    update();

    if (mode !== "system") return;
    const query = systemQuery();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, [mode]);

  const setMode = useCallback((next: ThemeMode, origin?: RevealOrigin) => {
    try {
      if (next === "system") localStorage.removeItem(STORAGE_KEY);
      else localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // choice still applies for this visit
    }

    const from = document.documentElement.dataset.theme;
    const to = resolve(next);
    const doc = document as ViewTransitionDocument;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Instant switch when nothing visibly changes, the browser lacks View
    // Transitions, or the visitor prefers reduced motion
    if (!origin || from === to || !doc.startViewTransition || reduceMotion) {
      setModeState(next);
      return;
    }

    const transition = doc.startViewTransition(() => {
      // The new theme must be in the DOM before the browser snapshots it
      flushSync(() => setModeState(next));
      applyTheme(to);
    });

    // Browsers may legitimately abort a transition (tab hidden, rapid
    // re-clicks). The theme has already switched by then, so the only effect
    // is a skipped animation; don't let the rejection surface as an error.
    transition.finished.catch(() => {});
    transition.ready.then(() => {
      const { x, y } = origin;
      const radius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      );
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${radius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 550,
          easing: "cubic-bezier(0.4, 0, 0.2, 1)",
          pseudoElement: "::view-transition-new(root)",
        } as KeyframeAnimationOptions
      );
    }).catch(() => {});
  }, []);

  return (
    <ThemeContext.Provider value={{ mode, resolved, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
};
