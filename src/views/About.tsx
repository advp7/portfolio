// assets
import homePageIllustation from "../assets/hero-illustration.svg";
// components
import { SectionHeading, Reveal, SpotlightCard } from "../components";
// framer-motion
import { motion } from "framer-motion";
// utils
import { fadeIn } from "../utils/variants";
import { transition } from "../utils/transition";

const highlights = [
  {
    title: "Product-minded frontend",
    body: "React & React Native apps taken from Figma handoff to production, working directly with founders, CTOs and product managers.",
  },
  {
    title: "AI is my current focus",
    body: "Building on a conversational-AI platform at Engati — AI agents and automation for customer experience that actually ship, not demos.",
  },
  {
    title: "Full-stack capable",
    body: "Shipping backend work too — Java (Spring Boot) and Python (FastAPI) services with Redis and AWS, alongside the frontend.",
  },
];

const About = () => {
  return (
    <section
      id="about"
      className="flex items-center justify-center relative border-t border-stroke scroll-mt-16"
    >
      <div className="max-w-screen-2xl flex flex-col xl:flex-row xl:justify-between items-center gap-12 w-full py-24 px-6 sm:px-12">
        <div className="flex-1 flex flex-col gap-6">
          <SectionHeading eyebrow="01 — About" title="About" highlight="me" />

          <Reveal>
            <p className="text-center xl:text-left text-base sm:text-lg text-textSecondary leading-relaxed">
              I'm a software engineer with 4+ years of experience, most of it
              spent building frontend products people actually use. Currently
              a Senior UI Developer at Engati, I specialize in turning design
              concepts into dynamic, user-friendly interfaces — and shipping
              them fast without cutting corners.
            </p>
          </Reveal>

          <motion.div
            variants={fadeIn("up")}
            transition={transition()}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4"
          >
            {highlights.map((item) => (
              <SpotlightCard
                key={item.title}
                className="flex flex-col gap-2 bg-surface border border-stroke rounded-2xl p-6
                hover:border-strokeStrong hover:bg-surfaceHover transition-colors duration-300"
              >
                <h3 className="font-display font-semibold text-textPrimary">
                  {item.title}
                </h3>
                <p className="text-sm text-textSecondary leading-relaxed">
                  {item.body}
                </p>
              </SpotlightCard>
            ))}
          </motion.div>
        </div>

        <motion.div
          variants={fadeIn("up")}
          transition={transition()}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="hidden xl:flex flex-1 items-center justify-center max-w-[420px]"
        >
          <img
            src={homePageIllustation}
            alt=""
            aria-hidden="true"
            className="max-w-full"
          />
        </motion.div>
      </div>
    </section>
  );
};

export default About;
