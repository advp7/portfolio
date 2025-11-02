// assets
import contactPageImg from "../assets/contact-page.svg";

// components
import { Reveal } from "../components";

// framer-motion
import { motion, useInView, animate } from "framer-motion";
import { useEffect, useRef, useState, useMemo, memo } from "react";

// utils
import { fadeIn } from "../utils/variants";
import { transition } from "../utils/transition";
import Clients from "./Clients";

interface Skill {
  name: string;
  level: number;
  color: string;
}

const AnimatedNumber = memo(({ value, delay, isInView }: { value: number; delay: number; isInView: boolean }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const animationRef = useRef<ReturnType<typeof animate> | null>(null);

  useEffect(() => {
    if (isInView) {
      // Stop any existing animation
      if (animationRef.current) {
        animationRef.current.stop();
      }

      // Start new animation
      animationRef.current = animate(0, value, {
        duration: 1,
        delay: delay,
        ease: "easeOut",
        onUpdate: (latest) => {
          const rounded = Math.round(latest);
          setDisplayValue((prev) => {
            // Only update if value actually changed to prevent unnecessary re-renders
            return rounded !== prev ? rounded : prev;
          });
        },
      });

      return () => {
        if (animationRef.current) {
          animationRef.current.stop();
        }
      };
    } else {
      setDisplayValue(0);
      if (animationRef.current) {
        animationRef.current.stop();
      }
    }
  }, [isInView, value, delay]);

  return (
    <span className="text-sm sm:text-base font-semibold text-textSecondary">
      {displayValue}%
    </span>
  );
});

AnimatedNumber.displayName = "AnimatedNumber";

const SkillBar = memo(({ skill, index, isInView }: { skill: Skill; index: number; isInView: boolean }) => {
  const delay = useMemo(() => index * 0.1, [index]);

  return (
    <div className="w-full mb-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-base sm:text-lg font-medium text-textPrimary">
          {skill.name}
        </span>
        <AnimatedNumber value={skill.level} delay={delay} isInView={isInView} />
      </div>
      <div className="w-full h-3 bg-accent rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${skill.level}%` }}
          viewport={{ once: false }}
          transition={{
            duration: 1,
            delay: delay,
            ease: "easeOut",
          }}
          className="h-full rounded-full"
          style={{ backgroundColor: skill.color }}
        />
      </div>
    </div>
  );
});

SkillBar.displayName = "SkillBar";

const SkillsList = memo(({ skills }: { skills: Skill[] }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: false, margin: "-100px" });

  return (
    <div ref={containerRef} className="w-full">
      {skills.map((skill, index) => (
        <SkillBar key={skill.name} skill={skill} index={index} isInView={isInView} />
      ))}
    </div>
  );
});

SkillsList.displayName = "SkillsList";

const Skills = () => {
  const skillsData = [
    {
      name: "React",
      level: 80,
      color: "#007CB5",
    },
    {
      name: "React Native",
      level: 80,
      color: "#007CB5",
    },
    {
      name: "Android Studio/Xcode",
      level: 65,
      color: "#027378",
    },
    {
      name: "HTML/CSS",
      level: 85,
      color: "#027378",
    },
    {
      name: "Javascript/Typescript",
      level: 85,
      color: "#027378",
    },
    {
      name: "Tailwind",
      level: 65,
      color: "#007CB5",
    },
    {
      name: "Material UI/Base UI",
      level: 90,
      color: "#027378",
    },
    {
      name: "Redux Toolkit",
      level: 70,
      color: "#007CB5",
    },
    {
      name: "Java",
      level: 60,
      color: "#027378",
    },
    {
      name: "SQL & MongoDB",
      level: 60,
      color: "#007CB5",
    },
    {
      name: "Git",
      level: 85,
      color: "#027378",
    },
    {
      name: "AWS",
      level: 55,
      color: "#007CB5",
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
            with over the last 3 years and an accurate percentage wise rating
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
          className="flex-1 flex flex-col gap-12 w-full max-w-[750px]"
        >
          <SkillsList skills={skillsData} />
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-divider" />
      <Clients />
    </div>
  );
};

export default Skills;
