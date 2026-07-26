// components
import { SectionHeading, SpotlightCard } from "../components";
// data
import { experience } from "../data";
// react
import { useRef } from "react";
// framer-motion
import { motion, useScroll, useSpring } from "framer-motion";
// utils
import { fadeIn } from "../utils/variants";
import { transition } from "../utils/transition";

const Experience = () => {
  const timelineRef = useRef<HTMLDivElement>(null);

  // Rail fills as the timeline scrolls through the viewport
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ["start 0.8", "end 0.6"],
  });
  const railScale = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <section
      id="experience"
      className="flex items-center justify-center relative border-t border-stroke scroll-mt-16"
    >
      <div className="max-w-screen-2xl flex flex-col gap-14 w-full py-24 px-6 sm:px-12">
        <SectionHeading
          eyebrow="02 — Experience"
          title="Where I've"
          highlight="worked"
        />

        <div
          ref={timelineRef}
          className="relative max-w-[920px] w-full mx-auto xl:mx-0"
        >
          {/* Timeline rail: static track + scroll-linked gradient fill */}
          <div
            aria-hidden="true"
            className="absolute left-[21px] top-3 bottom-3 w-px bg-stroke"
          />
          <motion.div
            aria-hidden="true"
            style={{ scaleY: railScale }}
            className="absolute left-[21px] top-3 bottom-3 w-px origin-top
            bg-gradient-to-b from-accent via-accentAlt to-accent
            shadow-[0_0_12px_rgba(56,189,248,0.5)]"
          />

          <ol className="relative flex flex-col gap-8">
            {experience.map((job, index) => {
              const isCurrent = job.period.includes("Present");

              return (
                <motion.li
                  key={job.id}
                  variants={fadeIn("up")}
                  transition={transition(index * 0.12)}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-60px" }}
                  className="relative pl-16"
                >
                  {/* Company monogram node */}
                  <div
                    aria-hidden="true"
                    className="absolute left-0 top-2 h-11 w-11 rounded-full p-[2px]
                    bg-gradient-to-br from-accent to-accentAlt
                    shadow-[0_0_20px_rgba(56,189,248,0.35)]"
                  >
                    {/* bg-night must live on its own element: .gradient-text sets the
                        `background` shorthand, which would otherwise wipe the fill */}
                    <div className="h-full w-full rounded-full bg-night flex items-center justify-center">
                      <span className="font-display font-bold text-lg gradient-text">
                        {job.company.charAt(0)}
                      </span>
                    </div>
                    {isCurrent && (
                      <span className="absolute -right-0.5 -top-0.5 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accentAlt opacity-70" />
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-accentAlt border-2 border-night" />
                      </span>
                    )}
                  </div>

                  <SpotlightCard className="bg-surface border border-stroke rounded-2xl p-5 sm:p-6 hover:border-strokeStrong transition-colors duration-300">
                    <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                      <h3 className="font-display text-xl sm:text-2xl font-semibold text-textPrimary">
                        {job.role}
                      </h3>
                      <p className="font-mono text-xs sm:text-sm text-accent whitespace-nowrap">
                        {job.period}
                      </p>
                    </div>

                    <p className="mt-1 text-textSecondary font-medium">
                      {job.company} · {job.location}
                    </p>

                    <ul className="mt-4 flex flex-col gap-2.5">
                      {job.points.map((point) => (
                        <li
                          key={point}
                          className="flex gap-3 text-sm sm:text-base text-textSecondary leading-relaxed"
                        >
                          <span
                            aria-hidden="true"
                            className="text-accentAlt mt-1 shrink-0"
                          >
                            ▹
                          </span>
                          {point}
                        </li>
                      ))}
                    </ul>

                    <ul className="mt-4 flex flex-wrap gap-2">
                      {job.stack.map((tech) => (
                        <li
                          key={tech}
                          className="font-mono text-[11px] text-textSecondary bg-accentDim/50 border border-stroke
                          rounded-full py-1 px-2.5"
                        >
                          {tech}
                        </li>
                      ))}
                    </ul>
                  </SpotlightCard>
                </motion.li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
};

export default Experience;
