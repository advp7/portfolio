// mui
import { Tooltip } from "@mui/material";
// react
import { FC } from "react";

interface SocialMediaIconProps {
  imgSrc: string;
  title: string;
  link: string;
}

const SocialMediaIcon: FC<SocialMediaIconProps> = ({ imgSrc, title, link }) => {
  return (
    <a href={link} target="_blank" rel="noopener noreferrer">
      <Tooltip title={title} placement="bottom" arrow>
        <div
          className="flex items-center justify-center h-12 w-12 rounded-full bg-icons cursor-pointer
        hover:bg-secondary transition-all ease-linear duration-300"
        >
          <img src={imgSrc} alt="" />
        </div>
      </Tooltip>
    </a>
  );
};

export default SocialMediaIcon;
