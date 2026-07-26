// react
import { FC } from "react";

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
      hover:border-accent/60 hover:bg-accentDim hover:-translate-y-0.5
      transition-all duration-300"
    >
      <img src={imgSrc} alt="" className="h-5 w-5" />
    </a>
  );
};

export default SocialMediaIcon;
