// data
import { navLinks, socials } from "../data";

const Footer = () => {
  return (
    <footer className="border-t border-stroke">
      <div className="max-w-screen-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 py-10 px-6 sm:px-12">
        <a href="#home" className="font-display font-bold text-textPrimary">
          advaith<span className="gradient-text">.dev</span>
        </a>

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
