// react
import { FC } from "react";
// framer-motion
import { motion, useReducedMotion } from "framer-motion";
// components
import { Reveal } from ".";

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  highlight: string;
  align?: "left" | "center";
}

/** One word that rises into view from behind its own clipping mask */
const MaskedWord: FC<{ word: string; index: number; gradient?: boolean }> = ({
  word,
  index,
  gradient,
}) => (
  // pb/-mb keep descenders (g, y, p) from being clipped by the mask
  <span className="inline-block overflow-hidden pb-[0.12em] -mb-[0.12em] align-bottom">
    <motion.span
      className={`inline-block ${gradient ? "gradient-text" : ""}`}
      variants={{
        hidden: { y: "110%" },
        visible: {
          y: "0%",
          transition: {
            duration: 0.7,
            delay: index * 0.08,
            ease: [0.16, 1, 0.3, 1],
          },
        },
      }}
    >
      {word}
    </motion.span>
  </span>
);

const SectionHeading: FC<SectionHeadingProps> = ({
  eyebrow,
  title,
  highlight,
  align = "left",
}) => {
  const shouldReduceMotion = useReducedMotion();
  const alignClass =
    align === "center"
      ? "items-center text-center"
      : "items-center xl:items-start text-center xl:text-left";

  const words = [
    ...title.split(" ").map((w) => ({ w, gradient: false })),
    ...highlight.split(" ").map((w) => ({ w, gradient: true })),
  ];

  return (
    <div className={`flex flex-col gap-3 ${alignClass}`}>
      <Reveal>
        <p className="font-mono text-sm tracking-[0.2em] uppercase text-accent">
          {eyebrow}
        </p>
      </Reveal>
      {shouldReduceMotion ? (
        <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-textPrimary">
          {title} <span className="gradient-text">{highlight}</span>
        </h2>
      ) : (
        <motion.h2
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-textPrimary"
        >
          {/* Screen readers get the plain heading, not word fragments */}
          <span className="sr-only">{`${title} ${highlight}`}</span>
          {words.map(({ w, gradient }, i) => (
            <span key={`${w}-${i}`} aria-hidden="true">
              <MaskedWord word={w} index={i} gradient={gradient} />
              {i < words.length - 1 ? " " : null}
            </span>
          ))}
        </motion.h2>
      )}
    </div>
  );
};

export default SectionHeading;
