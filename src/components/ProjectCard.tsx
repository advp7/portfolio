// react
import { FC } from "react";
// components
import SpotlightCard from "./SpotlightCard";
// data
import { Project } from "../data";

const ProjectCard: FC<{ project: Project }> = ({ project }) => {
  return (
    <SpotlightCard
      tilt
      className="group bg-surface border border-stroke rounded-2xl overflow-hidden
      hover:border-strokeStrong hover:bg-surfaceHover
      hover:shadow-[0_16px_48px_rgba(0,0,0,0.4)] transition-colors duration-300"
    >
      <a
        href={project.link}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col h-full"
      >
        <div className="relative h-[200px] overflow-hidden bg-[#0b1120]">
          <img
            src={project.img}
            alt={`Screenshot of ${project.title}`}
            loading="lazy"
            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500 ease-out"
          />
          <span
            className={`absolute top-3 right-3 font-mono text-[11px] tracking-wide py-1 px-2.5 rounded-full glass border ${
              project.tag === "Professional"
                ? "border-accent/40 text-accent"
                : "border-stroke text-textSecondary"
            }`}
          >
            {project.tag}
          </span>
        </div>

        <div className="flex flex-col gap-3 p-6 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-display text-lg font-semibold text-textPrimary">
              {project.title}
            </h3>
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-5 w-5 shrink-0 mt-0.5 text-textMuted group-hover:text-accent
              group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M7 17L17 7M9 7h8v8" />
            </svg>
          </div>

          <p className="text-sm text-textSecondary leading-relaxed flex-1">
            {project.description}
          </p>

          <ul className="flex flex-wrap gap-2 mt-1">
            {project.stack.map((tech) => (
              <li
                key={tech}
                className="font-mono text-[11px] text-textSecondary bg-accentDim/50 border border-stroke
                rounded-full py-1 px-2.5"
              >
                {tech}
              </li>
            ))}
          </ul>
        </div>
      </a>
    </SpotlightCard>
  );
};

export default ProjectCard;
