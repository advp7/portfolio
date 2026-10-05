// react
import { useEffect, useState } from "react";
// data
import { navLinks, socials } from "../data";

const formatBengaluruTime = () =>
  new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  }).format(new Date());

/** Live local time in Bengaluru, refreshed every 15s */
const useBengaluruTime = () => {
  const [time, setTime] = useState(formatBengaluruTime);
  useEffect(() => {
    const id = window.setInterval(() => setTime(formatBengaluruTime()), 15000);
    return () => window.clearInterval(id);
  }, []);
  return time;
};

const Footer = () => {
  const time = useBengaluruTime();
  return (
    <footer className="border-t border-stroke">
      <div className="max-w-screen-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 pt-10 pb-28 sm:pb-10 px-6 sm:px-12">
        <div className="flex flex-col items-center sm:items-start gap-2">
          <a href="#home" className="inline-block py-1.5 font-display font-bold text-textPrimary">
            advaith<span className="gradient-text">.dev</span>
          </a>
          {/* The dot flows with the text, so it stays attached when the line
              wraps on narrow phones */}
          <p className="text-center sm:text-left font-mono text-xs leading-relaxed text-textMuted">
            <span className="relative mr-2 inline-flex h-2 w-2 align-middle">
              <span className="animate-ping motion-reduce:animate-none absolute inline-flex h-full w-full rounded-full bg-accentAlt opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accentAlt" />
            </span>
            Bengaluru · {time} IST · building AI agents
          </p>
        </div>

        <ul className="flex flex-wrap items-center justify-center gap-6">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="inline-block py-2 text-sm text-textMuted hover:text-textPrimary transition-colors duration-200"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <p className="text-center text-sm text-textMuted">
          © {new Date().getFullYear()} Advaith Praveen ·{" "}
          <a
            href={socials.github}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block py-2 hover:text-textPrimary transition-colors duration-200"
          >
            Built with React
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
