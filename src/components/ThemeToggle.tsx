// react
import { FC, ReactNode } from "react";
// framer-motion
import { motion, useReducedMotion } from "framer-motion";
// theme
import { ThemeMode, useTheme } from "../theme";

const Icon: FC<{ children: ReactNode }> = ({ children }) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    className="relative h-4 w-4"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {children}
  </svg>
);

const OPTIONS: { mode: ThemeMode; label: string; icon: ReactNode }[] = [
  {
    mode: "system",
    label: "Use system theme",
    icon: (
      <Icon>
        <rect x="3" y="4" width="18" height="12" rx="2" />
        <path d="M8 20h8M12 16v4" />
      </Icon>
    ),
  },
  {
    mode: "light",
    label: "Use light theme",
    icon: (
      <Icon>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
      </Icon>
    ),
  },
  {
    mode: "dark",
    label: "Use dark theme",
    icon: (
      <Icon>
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </Icon>
    ),
  },
];

const ThemeToggle = () => {
  const { mode, setMode } = useTheme();
  const shouldReduceMotion = useReducedMotion();

  return (
    <div
      role="group"
      aria-label="Colour theme"
      className="flex items-center gap-0.5 rounded-full border border-stroke bg-surface p-1"
    >
      {OPTIONS.map((option) => {
        const active = mode === option.mode;
        return (
          <button
            key={option.mode}
            type="button"
            onClick={(e) => {
              // Grow the new theme from the centre of this button (works for
              // keyboard activation too, unlike the pointer coordinates)
              const r = e.currentTarget.getBoundingClientRect();
              setMode(option.mode, {
                x: r.left + r.width / 2,
                y: r.top + r.height / 2,
              });
            }}
            aria-label={option.label}
            aria-pressed={active}
            title={option.label}
            className={`relative flex h-8 w-8 items-center justify-center rounded-full transition-colors duration-200 ${
              active
                ? "text-accent"
                : "text-textMuted hover:text-textPrimary"
            }`}
          >
            {active && (
              <motion.span
                layoutId="theme-toggle-pill"
                transition={
                  shouldReduceMotion
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 500, damping: 35 }
                }
                className="absolute inset-0 rounded-full bg-accent/15 border border-accent/30"
              />
            )}
            {option.icon}
          </button>
        );
      })}
    </div>
  );
};

export default ThemeToggle;
