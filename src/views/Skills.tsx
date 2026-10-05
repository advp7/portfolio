// react
import { FC, ReactNode } from "react";
// components
import { SectionHeading, Reveal, SpotlightCard } from "../components";
// data
import { skillGroups } from "../data";
// framer-motion
import { motion } from "framer-motion";
// utils
import { fadeIn } from "../utils/variants";
import { transition } from "../utils/transition";

type Visual = "code" | "chat" | "terminal" | "design";

/**
 * Bento layout. Order matters: with these spans the 4-column grid packs into
 * three full rows (Frontend Core spans two rows on the left).
 */
const BENTO: { title: string; span: string; visual?: Visual }[] = [
  { title: "Frontend Core", span: "md:col-span-2 lg:row-span-2", visual: "code" },
  { title: "AI Engineering", span: "md:col-span-2", visual: "chat" },
  { title: "Backend & Cloud", span: "" },
  { title: "Mobile", span: "" },
  { title: "AI-Assisted Development", span: "md:col-span-2", visual: "terminal" },
  { title: "Design & Tooling", span: "md:col-span-2", visual: "design" },
];

const Window: FC<{ children: ReactNode; label: string; grow?: boolean }> = ({
  children,
  label,
  grow,
}) => (
  <div
    aria-hidden="true"
    // grow: fill the rest of a tall tile, like an editor pane
    className={`overflow-hidden rounded-xl border border-stroke bg-night/70 ${
      grow ? "flex-1 min-h-[180px]" : "mt-auto"
    }`}
  >
    <div className="flex items-center gap-1.5 border-b border-stroke px-3 py-2">
      <span className="h-2 w-2 rounded-full bg-textMuted/40" />
      <span className="h-2 w-2 rounded-full bg-textMuted/40" />
      <span className="h-2 w-2 rounded-full bg-textMuted/40" />
      <span className="ml-2 font-mono text-[11px] text-textMuted">{label}</span>
    </div>
    <div className="overflow-x-auto p-4 font-mono text-[12px] leading-relaxed">
      {children}
    </div>
  </div>
);

const CODE_LINES: ReactNode[] = [
  <>
    <span className="text-accent">import</span>{" "}
    <span className="text-textPrimary">{"{ motion }"}</span>{" "}
    <span className="text-accent">from</span>{" "}
    <span className="text-textSecondary">"framer-motion"</span>;
  </>,
  "",
  <>
    <span className="text-accent">export const</span>{" "}
    <span className="text-textPrimary">Hero</span>{" "}
    <span className="text-textMuted">= () =&gt; (</span>
  </>,
  <span className="pl-4">
    <span className="text-accentAlt">&lt;motion.h1</span>{" "}
    <span className="text-accent">layout</span>
    <span className="text-accentAlt">&gt;</span>
  </span>,
  <span className="pl-8 text-textSecondary">Polished, fast, accessible.</span>,
  <span className="pl-4 text-accentAlt">&lt;/motion.h1&gt;</span>,
  <span className="text-textMuted">);</span>,
];

const CodeVisual = () => (
  <Window label="Hero.tsx" grow>
    {CODE_LINES.map((line, i) => (
      <p key={i} className="flex gap-4">
        <span className="w-4 shrink-0 text-right text-textMuted/50 select-none">
          {i + 1}
        </span>
        <span className="whitespace-pre">{line}</span>
      </p>
    ))}
  </Window>
);

const ChatVisual = () => (
  <div aria-hidden="true" className="mt-auto flex flex-col gap-2 text-[13px]">
    <p className="self-end max-w-[80%] rounded-2xl rounded-br-md border border-accent/30 bg-accent/20 px-3.5 py-2 text-textPrimary">
      Can I change my delivery address?
    </p>
    <p className="self-start max-w-[80%] rounded-2xl rounded-bl-md border border-stroke bg-night/70 px-3.5 py-2 text-textSecondary">
      Done — I've updated it. Anything else I can help with?
    </p>
    <span className="self-start flex gap-1 rounded-2xl border border-stroke bg-night/70 px-3.5 py-3">
      <span className="h-1.5 w-1.5 rounded-full bg-accent/70 animate-bounce motion-reduce:animate-none [animation-delay:-0.3s]" />
      <span className="h-1.5 w-1.5 rounded-full bg-accent/70 animate-bounce motion-reduce:animate-none [animation-delay:-0.15s]" />
      <span className="h-1.5 w-1.5 rounded-full bg-accent/70 animate-bounce motion-reduce:animate-none" />
    </span>
  </div>
);

const TerminalVisual = () => (
  <Window label="terminal">
    <p className="text-textPrimary">
      <span className="text-accentAlt">›</span> add a circular theme reveal
    </p>
    <p className="text-textMuted">reading theme.tsx, ThemeToggle.tsx…</p>
    <p className="text-accentAlt">✓ 3 files updated</p>
    <p className="text-textPrimary">
      <span className="text-accentAlt">›</span>{" "}
      <span className="caret-blink inline-block h-3.5 w-[7px] translate-y-0.5 bg-accent" />
    </p>
  </Window>
);

const SWATCHES = [
  { token: "--accent", className: "bg-accent" },
  { token: "--accent-alt", className: "bg-accentAlt" },
  { token: "--text", className: "bg-textPrimary" },
  { token: "--night", className: "bg-night" },
];

// Live design tokens: swatches read the same CSS variables the site uses,
// so they change with the theme toggle
const DesignVisual = () => (
  <Window label="tokens.css">
    <div className="grid grid-cols-2 xs:grid-cols-4 gap-3">
      {SWATCHES.map((swatch) => (
        <div key={swatch.token} className="flex flex-col gap-1.5">
          <span
            className={`h-10 rounded-lg border border-stroke ${swatch.className}`}
          />
          <span className="whitespace-nowrap text-[11px] text-textMuted">
            {swatch.token}
          </span>
        </div>
      ))}
    </div>
    <p className="mt-3 flex items-baseline gap-3 text-textMuted">
      <span className="font-display text-2xl font-bold text-textPrimary">Aa</span>
      Space Grotesk · Inter · JetBrains Mono
    </p>
  </Window>
);

const VISUALS: Record<Visual, FC> = {
  code: CodeVisual,
  chat: ChatVisual,
  terminal: TerminalVisual,
  design: DesignVisual,
};

const Skills = () => {
  return (
    <section
      id="skills"
      className="flex flex-col items-center justify-center relative border-t border-stroke scroll-mt-16"
    >
      <div className="max-w-screen-2xl flex flex-col gap-14 w-full py-24 px-6 sm:px-12">
        <div className="flex flex-col gap-6 max-w-[720px]">
          <SectionHeading
            eyebrow="03 — Skills"
            title="What I work"
            highlight="with"
          />
          <Reveal>
            <p className="text-center xl:text-left text-base sm:text-lg text-textSecondary leading-relaxed">
              Technologies I've shipped with over the last 4+ years, grouped
              by how I actually use them — always learning, currently going
              deep on AI-powered products.
            </p>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {BENTO.map(({ title, span, visual }, index) => {
            const group = skillGroups.find((g) => g.title === title);
            if (!group) return null;
            const VisualComponent = visual ? VISUALS[visual] : null;
            return (
              <motion.div
                key={group.title}
                variants={fadeIn("up")}
                transition={transition(index * 0.08)}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                className={span}
              >
                <SpotlightCard
                  className="flex flex-col gap-5 h-full bg-surface border border-stroke rounded-2xl p-6
                  hover:border-strokeStrong hover:bg-surfaceHover transition-colors duration-300"
                >
                  <div>
                    <h3 className="font-display text-lg font-semibold text-textPrimary">
                      {group.title}
                    </h3>
                    <p className="text-sm text-textMuted mt-0.5">{group.blurb}</p>
                  </div>

                  <ul className="flex flex-wrap gap-2">
                    {group.skills.map((skill) => (
                      <li
                        key={skill}
                        className="text-sm text-textSecondary bg-accentDim/50 border border-stroke rounded-full
                        py-1.5 px-3.5 hover:text-textPrimary hover:border-accent/50 transition-colors duration-200"
                      >
                        {skill}
                      </li>
                    ))}
                  </ul>

                  {VisualComponent && <VisualComponent />}
                </SpotlightCard>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Skills;
