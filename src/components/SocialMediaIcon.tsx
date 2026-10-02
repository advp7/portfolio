// react
import { CSSProperties, FC } from "react";

interface SocialMediaIconProps {
  imgSrc: string;
  title: string;
  link: string;
}

const SocialMediaIcon: FC<SocialMediaIconProps> = ({ imgSrc, title, link }) => {
  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={title}
      title={title}
      className="flex items-center justify-center h-11 w-11 rounded-full bg-surface border border-stroke
      text-textPrimary hover:text-accent hover:border-accent/60 hover:bg-accentDim/[0.12] hover:-translate-y-0.5
      transition-all duration-300"
    >
      <span
        aria-hidden="true"
        className="icon-mask h-5 w-5"
        style={{ "--icon": `url(${imgSrc})` } as CSSProperties}
      />
    </a>
  );
};

export default SocialMediaIcon;
