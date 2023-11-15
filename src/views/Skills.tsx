// assets
import contactPageImg from "../assets/contact-page.svg";

// components
import { Reveal } from "../components";

// framer-motion
import { motion } from "framer-motion";
import { SkillBars } from "react-skills";

// utils
import { fadeIn } from "../utils/variants";
import { transition } from "../utils/transition";
import Clients from "./Clients";

const Skills = () => {
  const skillsData = [
    {
      name: "React",
      level: 80,
      color: "#007CB5",
    },
    {
      name: "HTML/CSS",
      level: 80,
      color: "#027378",
    },

    {
      name: "Javascript",
      level: 80,
      color: "#007CB5",
    },
    {
      name: "Typescript",
      level: 75,
      color: "#027378",
    },
    {
      name: "Material UI",
      level: 90,
      color: "#007CB5",
    },
    {
      name: "Redux Toolkit",
      level: 70,
      color: "#027378",
    },

    {
      name: "Git",
      level: 85,
      color: "#007CB5",
    },
    {
      name: "AWS",
      level: 55,
      color: "#027378",
    },
    {
      name: "PWA dev",
      level: 65,
      color: "#007CB5",
    },
    {
      name: "Figma",
      level: 50,
      color: "#027378",
    },
  ];
  return (
    <div
      id="skills"
      className="min-h-max flex flex-col items-center justify-center relative"
      style={{
        background: `url(${contactPageImg})`,
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
      }}
    >
      <div
        className="max-w-screen-2xl flex flex-col xl:flex-row xl:justify-between
      items-center xl:items-start gap-12 w-full pt-20 pb-20 sm:pb-16 px-12"
      >
        <div className="flex-1 flex flex-col gap-4">
          <Reveal>
            <h2
              className="text-center xl:text-start text-4xl sm:text-5xl lg:text-[64px] 
              font-bold text-textPrimary"
            >
              Skillset<span className="text-secondary"> rating</span>
            </h2>
          </Reveal>
          <p className="text-center xl:text-start text-base sm:text-lg text-textSecondary pt-10">
            Some of the technologies that I have had the opportunity to work
            with over the last 1.5+ years and an accurate percentage wise rating
            of my proficiency in each of them. Continuously looking to learn and
            expand knowledge to stay at the forefront of the latest trends.
          </p>
        </div>

        <motion.div
          variants={fadeIn("up")}
          transition={transition()}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false }}
          className="flex-1 flex flex-col gap-12 w-full max-w-[696px]"
        >
          <SkillBars skills={skillsData} levelProgress />
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-divider" />
      <Clients />
    </div>
  );
};

export default Skills;
