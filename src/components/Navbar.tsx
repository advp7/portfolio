// react
import { useEffect, useState } from "react";
// data
import { navLinks } from "../data";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Scroll spy: highlight the nav link of the section currently in view
  useEffect(() => {
    const sections = navLinks
      .map((link) => document.getElementById(link.href.slice(1)))
      .filter((el): el is HTMLElement => el !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(`#${entry.target.id}`);
        });
      },
      // Band across the middle of the viewport decides the active section
      { rootMargin: "-40% 0px -55% 0px" }
    );

    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled || menuOpen ? "glass border-b border-stroke" : ""
      }`}
    >
      <nav
        aria-label="Main"
        className="max-w-screen-2xl mx-auto flex items-center justify-between px-6 sm:px-12 h-16"
      >
        <a
          href="#home"
          className="font-display font-bold text-lg text-textPrimary"
          onClick={() => setMenuOpen(false)}
        >
          advaith<span className="gradient-text">.dev</span>
        </a>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <li key={link.href} className="relative">
              <a
                href={link.href}
                className={`text-sm transition-colors duration-200 ${
                  activeSection === link.href
                    ? "text-textPrimary"
                    : "text-textSecondary hover:text-textPrimary"
                }`}
              >
                {link.label}
              </a>
              <span
                aria-hidden="true"
                className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full
                bg-gradient-to-r from-accent to-accentAlt transition-opacity duration-300 ${
                  activeSection === link.href ? "opacity-100" : "opacity-0"
                }`}
              />
            </li>
          ))}
          <li>
            <a
              href={`${process.env.PUBLIC_URL}/CV_ADVAITH.pdf`}
              download="Advaith_Resume.pdf"
              className="text-sm font-medium py-2 px-5 rounded-full bg-gradient-to-r from-accent to-accentAlt
              text-[#04121b] hover:shadow-[0_0_24px_rgba(56,189,248,0.35)] transition-shadow duration-300"
            >
              Resume
            </a>
          </li>
        </ul>

        {/* Mobile hamburger */}
        <button
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          className="md:hidden flex flex-col justify-center items-center gap-1.5 h-10 w-10"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span
            className={`block h-0.5 w-6 bg-textPrimary transition-transform duration-300 ${
              menuOpen ? "translate-y-2 rotate-45" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-6 bg-textPrimary transition-opacity duration-300 ${
              menuOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-6 bg-textPrimary transition-transform duration-300 ${
              menuOpen ? "-translate-y-2 -rotate-45" : ""
            }`}
          />
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <ul className="md:hidden glass border-b border-stroke px-6 pb-6 flex flex-col gap-4">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="block py-1 text-textSecondary hover:text-textPrimary transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </a>
            </li>
          ))}
          <li>
            <a
              href={`${process.env.PUBLIC_URL}/CV_ADVAITH.pdf`}
              download="Advaith_Resume.pdf"
              className="inline-block text-sm font-medium py-2 px-5 rounded-full bg-gradient-to-r from-accent to-accentAlt text-[#04121b]"
              onClick={() => setMenuOpen(false)}
            >
              Resume
            </a>
          </li>
        </ul>
      )}
    </header>
  );
};

export default Navbar;
