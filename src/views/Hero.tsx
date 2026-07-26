// assets
import profilePic from "../assets/profile-pic.png";
import downloadIcon from "../assets/download-btn-icon.svg";
import linkedinIcon from "../assets/linkedin-icon.svg";
import githubIcon from "../assets/github-icon.svg";
import twitterIcon from "../assets/twitter-icon.svg";
// components
import { Button, RotatingText, SocialMediaIcon } from "../components";
// data
import { socials } from "../data";
// framer-motion
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
// react
import { useRef } from "react";
// utils
import { transition } from "../utils/transition";
import { fadeIn, scale } from "../utils/variants";

const Hero = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // Parallax: as the hero scrolls out, content drifts up faster than the photo
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const photoY = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const cueOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);

  return (
    <section
      ref={sectionRef}
      id="home"
      className="min-h-screen flex items-center justify-center relative pt-16"
    >
      <motion.div
        style={
          shouldReduceMotion ? undefined : { opacity: heroOpacity }
        }
        className="max-w-screen-2xl flex flex-col-reverse xl:flex-row xl:justify-between items-center gap-12 w-full py-16 px-6 sm:px-12"
      >
        <motion.div
          style={shouldReduceMotion ? undefined : { y: contentY }}
          className="w-full xl:max-w-[720px] flex flex-col items-center xl:items-start"
        >
          <motion.div
            variants={fadeIn("down")}
            transition={transition()}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex items-center gap-2.5 py-1.5 px-4 rounded-full bg-surface border border-stroke mb-8"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accentAlt opacity-60" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accentAlt" />
            </span>
            <span className="text-sm text-textSecondary">
              Open to new opportunities
            </span>
          </motion.div>

          <motion.h1
            variants={fadeIn("down")}
            transition={transition()}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center xl:text-left font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-textPrimary leading-[1.05]"
          >
            Hi, I'm <span className="gradient-text">Advaith.</span>
            <br />
            <RotatingText
              phrases={[
                "Frontend Engineer.",
                "AI Agent Builder.",
                "React Specialist.",
              ]}
              className="text-textPrimary"
            />
          </motion.h1>

          <motion.p
            variants={fadeIn("up")}
            transition={transition()}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mt-6 text-center xl:text-left text-base sm:text-lg text-textSecondary max-w-[560px] leading-relaxed"
          >
            I build fast, polished web and mobile products with React and React
            Native — and I'm currently building{" "}
            <span className="text-textPrimary font-medium">
              AI agents for customer experience
            </span>
            . My work runs in production at Edelweiss, and has been used by
            teams at Swiggy and Zomato.
          </motion.p>

          <motion.div
            variants={fadeIn("up")}
            transition={transition()}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
          >
            <Button secondary href="#projects">
              View my work
            </Button>
            <Button
              href={`${process.env.PUBLIC_URL}/CV_ADVAITH.pdf`}
              icon={downloadIcon}
            >
              Download resume
            </Button>
          </motion.div>

          <motion.div
            variants={fadeIn("up")}
            transition={transition(0.2)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mt-8 flex items-center gap-4"
          >
            <SocialMediaIcon
              imgSrc={linkedinIcon}
              title="LinkedIn"
              link={socials.linkedin}
            />
            <SocialMediaIcon
              imgSrc={githubIcon}
              title="GitHub"
              link={socials.github}
            />
            <SocialMediaIcon
              imgSrc={twitterIcon}
              title="Twitter"
              link={socials.twitter}
            />
          </motion.div>
        </motion.div>

        <motion.div
          style={shouldReduceMotion ? undefined : { y: photoY }}
          className="relative shrink-0"
        >
          <motion.div
            variants={scale()}
            transition={transition()}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="relative"
          >
            <div
              aria-hidden="true"
              className="absolute -inset-6 rounded-full bg-gradient-to-tr from-accent/30 to-accentAlt/30 blur-2xl"
            />
            <img
              src={profilePic}
              alt="Portrait of Advaith Praveen"
              className="relative max-w-[260px] sm:max-w-[340px] xl:max-w-[400px] rounded-full
              border-2 border-strokeStrong shadow-[0_0_60px_rgba(56,189,248,0.15)]"
            />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Scroll cue — fades out as soon as scrolling starts */}
      <motion.a
        href="#about"
        aria-label="Scroll to About section"
        style={shouldReduceMotion ? undefined : { opacity: cueOpacity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden sm:flex flex-col items-center gap-2
        text-textMuted hover:text-textPrimary transition-colors duration-200"
      >
        <span className="font-mono text-[11px] tracking-[0.25em] uppercase">
          Scroll
        </span>
        <motion.svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          animate={shouldReduceMotion ? undefined : { y: [0, 6, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        >
          <path d="M12 5v14M5 12l7 7 7-7" />
        </motion.svg>
      </motion.a>
    </section>
  );
};

export default Hero;
