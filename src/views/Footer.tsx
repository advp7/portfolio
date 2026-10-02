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
      <div className="max-w-screen-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 py-10 px-6 sm:px-12">
        <div className="flex flex-col items-center sm:items-start gap-2">
          <a href="#home" className="font-display font-bold text-textPrimary">
            advaith<span className="gradient-text">.dev</span>
          </a>
          <p className="flex items-center gap-2 font-mono text-[11px] text-textMuted">
            <span className="relative flex h-2 w-2">
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
                className="text-sm text-textMuted hover:text-textPrimary transition-colors duration-200"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <p className="text-sm text-textMuted">
          © {new Date().getFullYear()} Advaith Praveen ·{" "}
          <a
            href={socials.github}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-textPrimary transition-colors duration-200"
          >
            Built with React
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
