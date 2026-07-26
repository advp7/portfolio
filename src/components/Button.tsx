// react
import { FC, ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  secondary?: boolean;
  icon?: string;
  onClick?: () => void;
  href?: string;
  type?: "button" | "submit";
}

const Button: FC<ButtonProps> = ({
  children,
  secondary,
  icon,
  onClick,
  href,
  type = "button",
}) => {
  const className = secondary
    ? `inline-flex items-center justify-center gap-2.5 py-3 px-8 rounded-full font-medium text-base
       bg-gradient-to-r from-accent to-accentAlt text-[#04121b]
       hover:shadow-[0_0_32px_rgba(56,189,248,0.35)] hover:-translate-y-0.5
       transition-all duration-300 w-full sm:w-fit`
    : `inline-flex items-center justify-center gap-2.5 py-3 px-8 rounded-full font-medium text-base
       text-textPrimary bg-surface border border-stroke
       hover:border-strokeStrong hover:bg-surfaceHover hover:-translate-y-0.5
       transition-all duration-300 w-full sm:w-fit`;

  const content = (
    <>
      <span>{children}</span>
      {icon && <img src={icon} alt="" className="h-4 w-4" />}
    </>
  );

  if (href) {
    return (
      <a href={href} className={className}>
        {content}
      </a>
    );
  }

  return (
    <button type={type} onClick={onClick} className={className}>
      {content}
    </button>
  );
};

export default Button;
