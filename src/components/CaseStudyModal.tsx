// react
import { FC, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
// framer-motion
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
// components
import ArchitectureDiagram from "./ArchitectureDiagram";
// data
import { CaseStudy } from "../data";

interface CaseStudyModalProps {
  study: CaseStudy | null;
  /** When set, the panel morphs out of the card sharing this layoutId */
  layoutId?: string;
  onClose: () => void;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

const Section: FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <div className="flex flex-col gap-2.5">
    <h3 className="font-mono text-xs tracking-[0.2em] uppercase text-accent">
      {title}
    </h3>
    {children}
  </div>
);

const Bullets: FC<{ items: string[] }> = ({ items }) => (
  <ul className="flex flex-col gap-2">
    {items.map((item) => (
      <li
        key={item}
        className="flex gap-3 text-sm sm:text-base text-textSecondary leading-relaxed"
      >
        <span aria-hidden="true" className="text-accentAlt mt-1 shrink-0">
          ▹
        </span>
        {item}
      </li>
    ))}
  </ul>
);

const CaseStudyModal: FC<CaseStudyModalProps> = ({
  study,
  layoutId,
  onClose,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (!study) return;

    // Remember what opened the dialog so focus can return there on close
    const opener = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      // Keep Tab focus inside the dialog
      if (e.key === "Tab" && panelRef.current) {
        const nodes = Array.from(
          panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)
        );
        if (nodes.length === 0) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
      opener?.focus();
    };
  }, [study, onClose]);

  return createPortal(
    <AnimatePresence>
      {study && (
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 z-[80] bg-backdrop"
        />
      )}
      {study && (
        // Sibling of the backdrop (not a child) so the morphing panel doesn't
        // inherit the backdrop's fade. Clicks fall through to the backdrop.
        <motion.div
          key="frame"
          className="pointer-events-none fixed inset-0 z-[81] flex items-end sm:items-center justify-center sm:p-6"
        >
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="case-study-title"
            layoutId={layoutId}
            style={layoutId ? { borderRadius: 16 } : undefined}
            initial={
              layoutId
                ? undefined
                : shouldReduceMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 40 }
            }
            animate={layoutId ? undefined : { opacity: 1, y: 0 }}
            exit={
              layoutId
                ? undefined
                : shouldReduceMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 40 }
            }
            transition={
              layoutId
                ? { type: "spring", stiffness: 300, damping: 32 }
                : { duration: 0.3, ease: "easeOut" }
            }
            className="pointer-events-auto relative w-full max-w-3xl max-h-[92vh] overflow-y-auto bg-panel
            border border-stroke rounded-t-2xl sm:rounded-2xl shadow-[0_24px_80px_var(--shadow-modal)]
            pb-[env(safe-area-inset-bottom,0px)]"
          >
            {/* Content fades in after the panel has grown, so text is never
                seen stretching mid-morph */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: layoutId ? 0.2 : 0, duration: 0.2 } }}
              exit={{ opacity: 0, transition: { duration: 0.1 } }}
            >
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Close case study"
              className="absolute top-4 right-4 z-10 flex items-center justify-center h-9 w-9 rounded-full
              bg-surface border border-stroke text-textSecondary hover:text-textPrimary hover:border-strokeStrong
              transition-colors duration-200"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>

            <div className="flex flex-col gap-8 p-6 sm:p-10">
              <header className="flex flex-col gap-3 pr-10">
                <p className="font-mono text-xs tracking-[0.2em] uppercase text-accent">
                  {study.eyebrow}
                </p>
                <h2
                  id="case-study-title"
                  className="font-display text-2xl sm:text-3xl font-bold text-textPrimary"
                >
                  {study.title}
                </h2>
                <p className="text-textSecondary leading-relaxed">
                  {study.summary}
                </p>
              </header>

              <div className="flex items-baseline gap-3 rounded-xl border border-stroke bg-surface px-5 py-4">
                <span className="font-display text-3xl font-bold gradient-text">
                  {study.metric.value}
                </span>
                <span className="text-sm text-textSecondary">
                  {study.metric.label}
                </span>
              </div>

              <Section title="The problem">
                {study.background && (
                  <div className="rounded-xl border border-stroke bg-surface px-4 py-3.5">
                    <p className="font-mono text-[11px] tracking-[0.15em] uppercase text-textMuted">
                      {study.background.label}
                    </p>
                    <p className="mt-1.5 text-sm text-textSecondary leading-relaxed">
                      {study.background.text}
                    </p>
                  </div>
                )}
                <p className="text-sm sm:text-base text-textSecondary leading-relaxed">
                  {study.context}
                </p>
              </Section>

              <Section title="What I owned">
                <Bullets items={study.role} />
              </Section>

              <Section title="How it's built">
                <div className="rounded-xl border border-stroke bg-night/60 p-3 sm:p-5">
                  <div className="overflow-x-auto">
                    <ArchitectureDiagram id={study.diagram} />
                  </div>
                  <p className="mt-2 flex items-center gap-2 text-xs text-textMuted">
                    <span
                      aria-hidden="true"
                      className="inline-block h-2.5 w-2.5 rounded-sm bg-gradient-to-br from-accent to-accentAlt"
                    />
                    Highlighted: the parts I built or worked on
                  </p>
                </div>
                <p className="text-sm sm:text-base text-textSecondary leading-relaxed">
                  {study.build}
                </p>
              </Section>

              <Section title="Outcome">
                <Bullets items={study.outcome} />
              </Section>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-stroke pt-6">
                <ul className="flex flex-wrap gap-2">
                  {study.stack.map((tech) => (
                    <li
                      key={tech}
                      className="font-mono text-[11px] text-textSecondary bg-accentDim/50 border border-stroke rounded-full py-1 px-2.5"
                    >
                      {tech}
                    </li>
                  ))}
                </ul>
                {study.live ? (
                  <a
                    href={study.live.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex shrink-0 items-center gap-2 rounded-full border border-strokeStrong
                    px-4 py-2 text-sm font-medium text-textPrimary whitespace-nowrap
                    hover:border-accent/60 hover:text-accent transition-colors"
                  >
                    {study.live.label}
                    <span aria-hidden="true">↗</span>
                  </a>
                ) : (
                  <span className="font-mono text-[11px] text-textMuted whitespace-nowrap">
                    {study.access}
                  </span>
                )}
              </div>
            </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default CaseStudyModal;
