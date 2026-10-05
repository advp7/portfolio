// components
import { CountUp } from "../components";
import { OPEN_CASE_STUDY_EVENT } from "../events";
// framer-motion
import { motion } from "framer-motion";
// utils
import { fadeIn } from "../utils/variants";
import { transition } from "../utils/transition";
// data
import { Stat, stats } from "../data";

const showProof = (proof: Stat["proof"]) => {
  if ("caseStudy" in proof) {
    window.dispatchEvent(
      new CustomEvent(OPEN_CASE_STUDY_EVENT, { detail: proof.caseStudy })
    );
    return;
  }
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document
    .getElementById(proof.section)
    ?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
};

const proofLabel = (proof: Stat["proof"]) =>
  "caseStudy" in proof ? "Read the case study" : "See the experience";

const Stats = () => {
  return (
    <section
      aria-label="Career highlights by the numbers"
      className="relative border-t border-stroke"
    >
      <div className="max-w-screen-2xl mx-auto px-6 sm:px-12 py-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-stroke rounded-2xl overflow-hidden border border-stroke">
          {stats.map((stat, index) => {
            const figure = `${stat.prefix ?? ""}${stat.value}${stat.suffix ?? ""}${
              stat.unit ? ` ${stat.unit}` : ""
            }`;
            return (
              <motion.button
                key={stat.label}
                type="button"
                onClick={() => showProof(stat.proof)}
                aria-label={`${figure} ${stat.label}. ${proofLabel(stat.proof)}`}
                variants={fadeIn("up")}
                transition={transition(index * 0.1)}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                className="group relative flex flex-col items-center justify-start gap-2
                bg-night px-4 pt-8 pb-10 text-center hover:bg-surface transition-colors duration-300"
              >
                <span className="whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.1em] sm:tracking-[0.18em] text-textMuted">
                  {stat.tag}
                </span>
                <span
                  className="flex items-baseline gap-1.5 font-display font-bold tabular-nums
                  text-4xl sm:text-5xl lg:text-6xl"
                >
                  <span className="gradient-text">
                    {/* Counting up to 1 would flash "<0" first */}
                    {stat.value > 1 ? (
                      <CountUp
                        to={stat.value}
                        prefix={stat.prefix}
                        suffix={stat.suffix}
                      />
                    ) : (
                      `${stat.prefix ?? ""}${stat.value}${stat.suffix ?? ""}`
                    )}
                  </span>
                  {stat.unit && (
                    <span className="text-lg sm:text-xl lg:text-2xl font-semibold text-textPrimary">
                      {stat.unit}
                    </span>
                  )}
                </span>
                <span className="text-xs sm:text-sm text-textSecondary max-w-[210px] leading-snug">
                  {stat.label}
                </span>
                {/* Visible on hover/focus with a mouse; always on touch screens */}
                <span
                  aria-hidden="true"
                  className="absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap text-[11px] sm:text-xs font-medium
                  text-accent opacity-0 translate-y-1 transition-all duration-300
                  group-hover:opacity-100 group-hover:translate-y-0
                  group-focus-visible:opacity-100 group-focus-visible:translate-y-0
                  [@media(hover:none)]:opacity-100 [@media(hover:none)]:translate-y-0"
                >
                  {proofLabel(stat.proof)} →
                </span>
                <span
                  aria-hidden="true"
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-0 bg-gradient-to-r
                  from-accent to-accentAlt group-hover:w-2/3 transition-all duration-500"
                />
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Stats;
