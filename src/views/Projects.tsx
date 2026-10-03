// react
import {
  FC,
  useCallback,
  useEffect,
  useState,
} from "react";
// components
import {
  ArchitectureDiagram,
  CaseStudyModal,
  SectionHeading,
  Reveal,
  SpotlightCard,
} from "../components";
// data
import { CaseStudy, EarlierWork, caseStudies, earlierWork } from "../data";
// framer-motion
import {
  motion,
  useReducedMotion,
} from "framer-motion";
import { OPEN_CASE_STUDY_EVENT } from "../components/CommandPalette";
// assistant
import Orb from "../assistant/Orb";
import {
  HIGHLIGHT_ASSISTANT_EVENT,
  OPEN_ASSISTANT_EVENT,
} from "../assistant/config";
// utils
import { fadeIn } from "../utils/variants";
import { transition } from "../utils/transition";

const LockIcon = () => (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    className="h-3 w-3 shrink-0"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const ExternalIcon = () => (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    className="h-3.5 w-3.5 shrink-0 transition-transform duration-300
    group-hover/live:translate-x-0.5 group-hover/live:-translate-y-0.5"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M7 17L17 7M9 7h8v8" />
  </svg>
);

const StackChips: FC<{ stack: string[] }> = ({ stack }) => (
  <ul className="flex flex-wrap gap-2">
    {stack.map((tech) => (
      <li
        key={tech}
        className="font-mono text-[11px] text-textSecondary bg-accentDim/50 border border-stroke rounded-full py-1 px-2.5"
      >
        {tech}
      </li>
    ))}
  </ul>
);

// Native CSS scroll-driven animations (Chrome/Edge/Safari). Where they're
// unsupported (currently Firefox), cards fall back to a simple fade-in.
const supportsScrollTimeline =
  typeof CSS !== "undefined" && CSS.supports("animation-timeline: view()");

const FeaturedProject: FC<{
  study: CaseStudy;
  flip: boolean;
  layoutId?: string;
  onOpen: (study: CaseStudy) => void;
}> = ({ study, flip, layoutId, onOpen }) => (
  // bg-panel (opaque) rather than bg-surface: stacked cards slide over each other
  <SpotlightCard
    layoutId={layoutId}
    className="bg-panel border border-stroke rounded-2xl hover:border-strokeStrong transition-colors duration-300"
  >
    {/* The whole card opens the case study (custom cursor shows "View");
        the button below remains the keyboard-accessible control */}
    <div
      data-cursor="View"
      onClick={() => onOpen(study)}
      className="grid cursor-pointer grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-8 xl:gap-12 p-6 sm:p-8 xl:p-10 items-center"
    >
      <div className={`flex flex-col gap-5 ${flip ? "xl:order-2" : ""}`}>
        <p className="font-mono text-xs tracking-[0.2em] uppercase text-accent">
          {study.eyebrow}
        </p>
        <h3 className="font-display text-2xl sm:text-3xl font-bold text-textPrimary leading-tight">
          {study.title}
        </h3>
        <p className="text-textSecondary leading-relaxed">{study.summary}</p>

        <div className="flex items-baseline gap-3">
          <span className="font-display text-4xl font-bold gradient-text">
            {study.metric.value}
          </span>
          <span className="text-sm text-textSecondary max-w-[220px] leading-snug">
            {study.metric.label}
          </span>
        </div>

        <StackChips stack={study.stack} />

        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 sm:gap-4 pt-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation(); // the card's own click would open it twice
              onOpen(study);
            }}
            className="group/btn inline-flex items-center justify-center gap-2 py-2.5 px-6 rounded-full font-medium text-sm
            bg-gradient-to-r from-accent to-accentAlt text-onAccent
            hover:shadow-[0_0_28px_rgba(56,189,248,0.35)] hover:-translate-y-0.5 transition-all duration-300"
          >
            Read the case study
            <span
              aria-hidden="true"
              className="transition-transform duration-300 group-hover/btn:translate-x-0.5"
            >
              →
            </span>
          </button>
          {study.live ? (
            <a
              href={study.live.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="group/live inline-flex items-center justify-center gap-2 py-2.5 px-5 rounded-full text-sm font-medium
              text-textPrimary border border-strokeStrong hover:border-accent/60 hover:text-accent
              hover:-translate-y-0.5 transition-all duration-300"
            >
              <span className="sm:hidden">{study.live.shortLabel}</span>
              <span className="hidden sm:inline">{study.live.label}</span>
              <ExternalIcon />
            </a>
          ) : (
            <span className="flex items-center gap-1.5 font-mono text-[11px] text-textMuted">
              <LockIcon />
              {study.access}
            </span>
          )}
        </div>
      </div>

      <div
        className={`overflow-x-auto rounded-xl border border-stroke bg-night/60 p-3 sm:p-5 ${
          flip ? "xl:order-1" : ""
        }`}
      >
        <ArchitectureDiagram id={study.diagram} />
      </div>
    </div>
  </SpotlightCard>
);

const EarlierWorkCard: FC<{ work: EarlierWork }> = ({ work }) => {
  const inner = (
    <div className="flex flex-col gap-3 h-full p-6">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <span className="whitespace-nowrap font-mono text-[11px] text-textMuted">{work.org}</span>
        {work.link ? (
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-4 w-4 text-textMuted group-hover:text-accent group-hover:translate-x-0.5
            group-hover:-translate-y-0.5 transition-all duration-300"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M7 17L17 7M9 7h8v8" />
          </svg>
        ) : (
          work.access && (
            <span className="flex items-center gap-1.5 whitespace-nowrap font-mono text-[10px] text-textMuted">
              <LockIcon />
              {work.access}
            </span>
          )
        )}
      </div>
      <h4 className="font-display text-lg font-semibold text-textPrimary">
        {work.title}
      </h4>
      <p className="text-sm text-textSecondary leading-relaxed flex-1">
        {work.description}
      </p>
      <StackChips stack={work.stack} />
    </div>
  );

  return (
    <SpotlightCard className="group h-full bg-surface border border-stroke rounded-2xl hover:border-strokeStrong transition-colors duration-300">
      {work.link ? (
        <a
          href={work.link}
          target="_blank"
          rel="noopener noreferrer"
          className="block h-full rounded-2xl"
        >
          {inner}
        </a>
      ) : (
        inner
      )}
    </SpotlightCard>
  );
};

const TRY_QUESTIONS = [
  "What did Advaith build for Edelweiss?",
  "Show me the RCS case study",
];

const openAssistant = (question?: string) =>
  window.dispatchEvent(
    new CustomEvent(OPEN_ASSISTANT_EVENT, { detail: { question } })
  );

const highlightAssistant = (on: boolean) =>
  window.dispatchEvent(
    new CustomEvent(HIGHLIGHT_ASSISTANT_EVENT, { detail: on })
  );

const PIPELINE = [
  "Your question",
  "Cloudflare Worker",
  "Gemini + tools",
  "Streamed back",
];

/** The one project here you don't have to take my word for: it's on the page */
const AskAdvaithCard = () => (
  <SpotlightCard className="ai-orbit-border group bg-surface border border-stroke rounded-2xl">
    <div
      onMouseEnter={() => highlightAssistant(true)}
      onMouseLeave={() => highlightAssistant(false)}
      onFocus={() => highlightAssistant(true)}
      onBlur={() => highlightAssistant(false)}
      className="grid grid-cols-1 lg:grid-cols-[1.25fr_1fr] gap-8 p-6 sm:p-8"
    >
      {/* The story */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="font-mono text-[11px] text-textMuted">
            Side project · 2026
          </span>
          <span className="flex items-center gap-1.5 font-mono text-[10px] text-accent">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-60 animate-ping motion-reduce:animate-none" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
            Live on this page
          </span>
        </div>
        <h4 className="font-display text-xl sm:text-2xl font-semibold text-textPrimary">
          Ask Advaith: an AI assistant you can try right now
        </h4>
        <p className="text-sm sm:text-base text-textSecondary leading-relaxed">
          The chat in the corner of this page is a project too. It answers
          questions about my work from the same data this site is built from,
          and uses tool calls to open case studies or hand over my resume. It
          runs entirely on free tiers, with a fallback model, bot protection
          and rate limits.
        </p>
        <ol
          aria-label="How a question travels"
          className="flex flex-col items-start gap-1 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-1.5 sm:gap-y-2
          font-mono text-[11px]"
        >
          {PIPELINE.map((step, i) => (
            <li key={step} className="flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:gap-1.5">
              <span className="rounded-md border border-stroke px-2 py-1 text-textSecondary">
                {step}
              </span>
              {i < PIPELINE.length - 1 && (
                <span aria-hidden="true" className="pl-3 text-accent sm:pl-0">
                  <span className="sm:hidden">↓</span>
                  <span className="hidden sm:inline">→</span>
                </span>
              )}
            </li>
          ))}
        </ol>
        <div className="mt-auto pt-2">
          <StackChips
            stack={["Cloudflare Workers", "Gemini", "Tool calling", "Streaming", "Turnstile"]}
          />
        </div>
      </div>

      {/* The invitation: looks like the chat it opens */}
      <div className="flex flex-col gap-4 rounded-xl border border-stroke bg-night/60 p-5">
        <div className="flex items-center gap-2.5">
          <Orb size={28} />
          <span className="text-sm font-semibold text-textPrimary">Ask Advaith</span>
        </div>
        <p className="max-w-[90%] rounded-2xl rounded-tl-md bg-surface px-3.5 py-2.5 text-sm text-textSecondary">
          Hi! Ask me anything about Advaith's work. I can also open a case
          study for you.
        </p>
        <div className="flex flex-col gap-2">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-textMuted">
            Try asking
          </p>
          <div className="flex flex-wrap gap-2">
            {TRY_QUESTIONS.map((question) => (
              <button
                key={question}
                type="button"
                onClick={() => openAssistant(question)}
                className="rounded-full border border-stroke bg-surface px-3 py-1.5 text-left text-xs text-textSecondary
                hover:border-accent/60 hover:text-textPrimary transition-colors"
              >
                “{question}”
              </button>
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={() => openAssistant()}
          className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-full
          bg-gradient-to-r from-accent to-accentAlt px-6 py-3 text-sm font-medium text-onAccent
          hover:shadow-[0_0_32px_rgba(56,189,248,0.35)] hover:-translate-y-0.5 transition-all duration-300"
        >
          Try it now
          <span aria-hidden="true">↘</span>
        </button>
      </div>
    </div>
  </SpotlightCard>
);

const Projects = () => {
  // fromCard: opened by clicking a card (morph from it) vs. the command menu
  const [open, setOpen] = useState<{
    study: CaseStudy;
    fromCard: boolean;
  } | null>(null);
  const handleClose = useCallback(() => setOpen(null), []);
  const openFromCard = useCallback(
    (study: CaseStudy) => setOpen({ study, fromCard: true }),
    []
  );

  const shouldReduceMotion = useReducedMotion();
  useEffect(() => {
    const onOpenRequest = (e: Event) => {
      const study = caseStudies.find(
        (s) => s.id === (e as CustomEvent<string>).detail
      );
      if (study) setOpen({ study, fromCard: false });
    };
    window.addEventListener(OPEN_CASE_STUDY_EVENT, onOpenRequest);
    return () =>
      window.removeEventListener(OPEN_CASE_STUDY_EVENT, onOpenRequest);
  }, []);

  const layoutIdFor = (study: CaseStudy) =>
    shouldReduceMotion ? undefined : `case-study-${study.id}`;

  return (
    <section
      id="projects"
      className="relative border-t border-stroke scroll-mt-16"
    >
      <div className="max-w-screen-2xl w-full py-24 px-6 sm:px-12 mx-auto flex flex-col gap-14">
        <div className="flex flex-col gap-6 max-w-[720px]">
          <SectionHeading
            eyebrow="04 — Projects"
            title="Selected"
            highlight="work"
          />
          <Reveal>
            <p className="text-center xl:text-left text-base sm:text-lg text-textSecondary leading-relaxed">
              Most of my best work lives inside products and on client sites,
              so instead of links, here's how it was built: the problem, what I
              owned, and what it delivered. And one you can try for yourself:
              the AI assistant on this page.
            </p>
          </Reveal>
        </div>

        <div className="flex flex-col gap-8">
          {caseStudies.map((study, index) =>
            supportsScrollTimeline ? (
              // Unfolds as it scrolls into view (see .card-unfold in index.css)
              <div key={study.id} className="card-unfold">
                <FeaturedProject
                  study={study}
                  flip={index % 2 === 1}
                  layoutId={layoutIdFor(study)}
                  onOpen={openFromCard}
                />
              </div>
            ) : (
              <motion.div
                key={study.id}
                variants={fadeIn("up")}
                transition={transition(index * 0.1)}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
              >
                <FeaturedProject
                  study={study}
                  flip={index % 2 === 1}
                  layoutId={layoutIdFor(study)}
                  onOpen={openFromCard}
                />
              </motion.div>
            )
          )}
        </div>

        <div className="flex flex-col gap-6">
          <h3 className="font-mono text-xs tracking-[0.2em] uppercase text-textMuted">
            More work
          </h3>
          <div className="flex flex-col gap-6">
            <motion.div
              variants={fadeIn("up")}
              transition={transition()}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
            >
              <AskAdvaithCard />
            </motion.div>
            {earlierWork.map((work, index) => (
              <motion.div
                key={work.id}
                variants={fadeIn("up")}
                transition={transition((index + 1) * 0.1)}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
              >
                <EarlierWorkCard work={work} />
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <CaseStudyModal
        study={open?.study ?? null}
        layoutId={open?.fromCard ? layoutIdFor(open.study) : undefined}
        onClose={handleClose}
      />
    </section>
  );
};

export default Projects;
