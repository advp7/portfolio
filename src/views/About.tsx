// assets
import aboutPageImg from "../assets/about-me-page.svg";
import profilePic from "../assets/profile-pic.png";
import linkedinIcon from "../assets/linkedin-icon.svg";
import twitterIcon from "../assets/twitter-icon.svg";
import githubIcon from "../assets/github-icon.svg";

// components
import { SocialMediaIcon, Reveal } from "../components";

// framer-motion
import { motion } from "framer-motion";

// utils
import { fadeIn } from "../utils/variants";
import { transition } from "../utils/transition";

const About = () => {
  return (
    <div
      id="about"
      className="min-h-screen flex items-center justify-center relative"
      style={{
        background: `url(${aboutPageImg})`,
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
      }}
    >
      <div
        className="max-w-screen-2xl flex flex-col xl:flex-row xl:justify-between
      items-center xl:items-start gap-12 w-full py-16 px-12"
      >
        <div className="flex-1 flex flex-col gap-4">
          <Reveal>
            <h2
              className="text-center xl:text-start text-4xl sm:text-5xl lg:text-[64px] 
              font-bold text-textPrimary"
            >
              About <span className="text-secondary"> me</span>
            </h2>
          </Reveal>
          <Reveal>
            <p className="text-center xl:text-start text-base sm:text-lg text-textSecondary">
              23-year-old Frontend Engineer with ~2 years experience building
              user interfaces using HTML, CSS and React (Javascript/Typescript).
              This, coupled with my knowledge of Git and AWS, allows me to
              create dynamic, user-friendly web interfaces. I am passionate
              about translating design concepts into responsive, engaging
              digital experiences, and I'm dedicated to staying at the forefront
              of the latest trends to deliver high quality results.
            </p>
          </Reveal>

          <motion.div
            variants={fadeIn("up")}
            transition={transition()}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false }}
            className="flex items-center justify-center xl:justify-start gap-6"
          >
            <SocialMediaIcon
              imgSrc={linkedinIcon}
              title="LinkedIn"
              link="https://www.linkedin.com/in/advaith-praveen"
            />
            <SocialMediaIcon
              imgSrc={githubIcon}
              title="Github"
              link="https://github.com/advp7"
            />
            <SocialMediaIcon
              imgSrc={twitterIcon}
              title="Twitter"
              link="https://twitter.com/advp007"
            />
          </motion.div>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <img
            src={profilePic}
            alt=""
            className="max-w-full sm:max-w-[401px] border-2 border-secondary rounded-full"
          />
        </div>
      </div>

      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-divider" />
    </div>
  );
};

export default About;
