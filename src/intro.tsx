// react
import {
  FC,
  ReactNode,
  RefObject,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
// framer-motion
import { AnimatePresence, motion } from "framer-motion";

const GREETINGS = ["Hello", "ನಮಸ್ಕಾರ", "नमस्ते"];
const WORD_MS = 400;
const HOLD_MS = 450;
const FLY_MS = 850;
/** Smooth start and stop for the flight onto the headline */
const FLY_EASE = [0.76, 0, 0.24, 1] as const;
/** Each word blurs in from below and out upwards, overlapping the next */
const WORD_IN = { opacity: 0, y: 18, filter: "blur(8px)" };
const WORD_SHOWN = { opacity: 1, y: 0, filter: "blur(0px)" };
const WORD_OUT = { opacity: 0, y: -18, filter: "blur(8px)" };
const WORD_FADE = { duration: 0.38, ease: [0.16, 1, 0.3, 1] as const };

/** Hero starts its "Hi," this far into the flight, so the two overlap */
export const HI_DELAY_S = (FLY_MS * 0.55) / 1000;

// Same type classes as the hero <h1>, so the overlay's final line lays out
// identically to the real headline and only needs to slide into place
// (One step smaller below 420px so "I'm Advaith." fits a 320px phone.)
export const HEADLINE_CLASSES =
  "font-display text-[2.75rem] xs:text-5xl sm:text-6xl lg:text-7xl font-bold text-textPrimary leading-[1.05]";

/**
 * Plays on every page load and reload. The only exception is reduced motion:
 * those visitors go straight to the site.
 */
const shouldShowIntro = () =>
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

interface IntroContextValue {
  /** The intro is part of this page load */
  active: boolean;
  /** The greeting has started flying — the rest of the hero can animate in */
  revealed: boolean;
  /** The greeting has landed — the real headline takes over */
  done: boolean;
  /** Hero attaches this to the "I'm Advaith." part of its headline */
  greetingRef: RefObject<HTMLSpanElement>;
}

const IntroContext = createContext<IntroContextValue | null>(null);

export const useIntro = () => {
  const ctx = useContext(IntroContext);
  if (!ctx) throw new Error("useIntro must be used inside <IntroProvider>");
  return ctx;
};

type Phase = "words" | "final" | "fly";

export const IntroProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [active] = useState(shouldShowIntro);
  const [revealed, setRevealed] = useState(!active);
  const [done, setDone] = useState(!active);
  const greetingRef = useRef<HTMLSpanElement>(null);
  const reveal = useCallback(() => setRevealed(true), []);
  const finish = useCallback(() => setDone(true), []);

  return (
    <IntroContext.Provider value={{ active, revealed, done, greetingRef }}>
      {children}
      <AnimatePresence>
        {active && !done && (
          <IntroOverlay
            key="intro"
            greetingRef={greetingRef}
            onReveal={reveal}
            onDone={finish}
          />
        )}
      </AnimatePresence>
    </IntroContext.Provider>
  );
};

const IntroOverlay: FC<{
  greetingRef: RefObject<HTMLSpanElement>;
  onReveal: () => void;
  onDone: () => void;
}> = ({ greetingRef, onReveal, onDone }) => {
  const [phase, setPhase] = useState<Phase>("words");
  const [wordIndex, setWordIndex] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [frame, setFrame] = useState<{ width: number; align: string } | null>(
    null
  );
  const overlayLineRef = useRef<HTMLSpanElement>(null);
  const finishedRef = useRef(false);
  const prevOverflowRef = useRef("");
  const timers = useRef<number[]>([]);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    // Unlock scrolling immediately, not when the overlay finishes fading
    document.body.style.overflow = prevOverflowRef.current;
    onReveal();
    onDone();
    // The intro plays at the top of the page; if the visitor loaded a deep
    // link (e.g. /#projects, or a reload after using the nav), take them there
    const hash = window.location.hash.slice(1);
    if (hash) {
      window.setTimeout(() => {
        document
          .getElementById(decodeURIComponent(hash))
          // "instant", not "auto": auto defers to the site's CSS
          // scroll-behavior: smooth, which would glide down the whole page
          ?.scrollIntoView({ behavior: "instant" as ScrollBehavior });
      }, 0);
    }
  }, [onReveal, onDone]);

  // Skip on any key, click or tap
  const skip = useCallback(() => {
    timers.current.forEach(window.clearTimeout);
    finish();
  }, [finish]);

  // Lock scrolling and pin the page to the top while the intro plays
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
    prevOverflowRef.current = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // Switching away mid-intro skips it: there's nothing to come back to
    const onVisibility = () => {
      if (document.visibilityState === "hidden") skip();
    };
    window.addEventListener("keydown", skip);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      if (!finishedRef.current) {
        document.body.style.overflow = prevOverflowRef.current;
      }
      window.removeEventListener("keydown", skip);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [skip]);

  // Timeline: greetings → hold on the name → fly into the hero headline.
  // In a background tab (e.g. cmd-clicked from LinkedIn) the overlay waits on
  // the first greeting and starts only once the tab is actually visible.
  useEffect(() => {
    let started = false;
    const begin = () => {
      if (started) return;
      started = true;
      runTimeline();
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") begin();
    };
    if (document.visibilityState === "visible") begin();
    else document.addEventListener("visibilitychange", onVisible);

    const pending = timers.current;
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      pending.forEach(window.clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function runTimeline() {
    GREETINGS.forEach((_, i) => {
      if (i > 0) later(() => setWordIndex(i), i * WORD_MS);
    });
    const finalAt = GREETINGS.length * WORD_MS;
    later(() => {
      // Match the real headline's width and alignment so lines wrap identically
      const h1 = greetingRef.current?.closest("h1");
      if (h1) {
        setFrame({
          width: h1.getBoundingClientRect().width,
          align: getComputedStyle(h1).textAlign,
        });
      }
      setPhase("final");
    }, finalAt);

    later(() => {
      const from = overlayLineRef.current?.getBoundingClientRect();
      const to = greetingRef.current?.getBoundingClientRect();
      if (from && to) setOffset({ x: to.left - from.left, y: to.top - from.top });
      setPhase("fly");
      onReveal();
    }, finalAt + HOLD_MS);

    later(finish, finalAt + HOLD_MS + FLY_MS);
  }

  return (
    <motion.div
      className="fixed inset-0 z-[90]"
      onPointerDown={skip}
      // The landed line sits exactly on the real headline, so swap instantly:
      // a fade here would briefly show both copies
      exit={{ opacity: 0, transition: { duration: 0 } }}
    >
      {/* Backdrop fades away as the name flies, revealing the site */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 bg-night"
        animate={{ opacity: phase === "fly" ? 0 : 1 }}
        transition={{ duration: FLY_MS / 1000, ease: FLY_EASE }}
      />

      {/* Words stack in one grid cell so outgoing and incoming overlap */}
      <div
        aria-hidden="true"
        className="absolute inset-0 grid place-items-center px-6 sm:px-12"
      >
        <AnimatePresence initial={false}>
        {phase === "words" ? (
          <motion.p
            key={wordIndex}
            initial={WORD_IN}
            animate={WORD_SHOWN}
            exit={WORD_OUT}
            transition={WORD_FADE}
            className={`${HEADLINE_CLASSES} text-center [grid-area:1/1]`}
          >
            {GREETINGS[wordIndex]}
          </motion.p>
        ) : (
          <motion.div
            key="name"
            initial={WORD_IN}
            animate={
              phase === "fly"
                ? { ...WORD_SHOWN, x: offset.x, y: offset.y }
                : WORD_SHOWN
            }
            transition={
              phase === "fly"
                ? { duration: FLY_MS / 1000, ease: FLY_EASE }
                : WORD_FADE
            }
            style={
              frame
                ? { width: frame.width, textAlign: frame.align as "left" }
                : undefined
            }
            className={`${HEADLINE_CLASSES} [grid-area:1/1]`}
          >
            {/* The greetings already said hello, so the name lands on its
                own; the hero adds its "Hi," once it's there */}
            <span ref={overlayLineRef} className="whitespace-nowrap">
              I'm <span className="gradient-text">Advaith.</span>
            </span>
          </motion.div>
        )}
        </AnimatePresence>
      </div>

      <button
        type="button"
        onClick={skip}
        className="absolute bottom-[max(1.5rem,env(safe-area-inset-bottom))] right-6 font-mono text-xs
        tracking-[0.2em] uppercase text-textMuted hover:text-textPrimary transition-colors"
      >
        Skip intro
      </button>
    </motion.div>
  );
};
