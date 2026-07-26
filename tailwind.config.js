/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        night: "#060911",
        surface: "rgba(255, 255, 255, 0.04)",
        surfaceHover: "rgba(255, 255, 255, 0.07)",
        stroke: "rgba(255, 255, 255, 0.09)",
        strokeStrong: "rgba(255, 255, 255, 0.16)",
        textPrimary: "#f1f5f9",
        textSecondary: "#94a3b8",
        textMuted: "#64748b",
        accent: "#38bdf8",
        accentAlt: "#2dd4bf",
        accentDim: "rgba(56, 189, 248, 0.12)",
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
