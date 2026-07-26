// react
import { FC } from "react";
// components
import { Reveal } from ".";

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  highlight: string;
  align?: "left" | "center";
}

const SectionHeading: FC<SectionHeadingProps> = ({
  eyebrow,
  title,
  highlight,
  align = "left",
}) => {
  const alignClass =
    align === "center"
      ? "items-center text-center"
      : "items-center xl:items-start text-center xl:text-left";

  return (
    <div className={`flex flex-col gap-3 ${alignClass}`}>
      <Reveal>
        <p className="font-mono text-sm tracking-[0.2em] uppercase text-accent">
          {eyebrow}
        </p>
      </Reveal>
      <Reveal>
        <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-textPrimary">
          {title} <span className="gradient-text">{highlight}</span>
        </h2>
      </Reveal>
    </div>
  );
};

export default SectionHeading;
