/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      // Every colour resolves to a CSS variable defined per theme in
      // index.css. Triplet tokens support Tailwind's /opacity modifiers.
      colors: {
        night: "rgb(var(--night) / <alpha-value>)",
        panel: "rgb(var(--panel) / <alpha-value>)",
        panelMine: "rgb(var(--panel-mine) / <alpha-value>)",
        surface: "var(--surface)",
        surfaceHover: "var(--surface-hover)",
        stroke: "var(--stroke)",
        strokeStrong: "var(--stroke-strong)",
        backdrop: "var(--backdrop)",
        textPrimary: "rgb(var(--text-primary) / <alpha-value>)",
        textSecondary: "rgb(var(--text-secondary) / <alpha-value>)",
        textMuted: "rgb(var(--text-muted) / <alpha-value>)",
        accent: "rgb(var(--accent) / <alpha-value>)",
        accentAlt: "rgb(var(--accent-alt) / <alpha-value>)",
        accentDim: "rgb(var(--accent-dim) / <alpha-value>)",
        onAccent: "rgb(var(--on-accent) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Space Grotesk", "Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      screens: {
        xs: "420px",
        xl: "1170px",
      },
    },
  },
  plugins: [],
};
