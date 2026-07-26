// components
import { SectionHeading, Reveal, SpotlightCard } from "../components";
// data
import { skillGroups } from "../data";
// framer-motion
import { motion } from "framer-motion";
// utils
import { fadeIn } from "../utils/variants";
import { transition } from "../utils/transition";

const Skills = () => {
  return (
    <section
      id="skills"
      className="flex flex-col items-center justify-center relative border-t border-stroke scroll-mt-16"
    >
      <div className="max-w-screen-2xl flex flex-col gap-14 w-full py-24 px-6 sm:px-12">
        <div className="flex flex-col gap-6 max-w-[720px]">
          <SectionHeading
            eyebrow="03 — Skills"
            title="What I work"
            highlight="with"
          />
          <Reveal>
            <p className="text-center xl:text-left text-base sm:text-lg text-textSecondary leading-relaxed">
              Technologies I've shipped with over the last 4+ years, grouped
              by how I actually use them — always learning, currently going
              deep on AI-powered products.
            </p>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {skillGroups.map((group, index) => (
            <motion.div
              key={group.title}
              variants={fadeIn("up")}
              transition={transition(index * 0.08)}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
            >
              <SpotlightCard
                className="flex flex-col gap-4 h-full bg-surface border border-stroke rounded-2xl p-6
                hover:border-strokeStrong hover:bg-surfaceHover transition-colors duration-300"
              >
                <div>
                  <h3 className="font-display text-lg font-semibold text-textPrimary">
                    {group.title}
                  </h3>
                  <p className="text-sm text-textMuted mt-0.5">{group.blurb}</p>
                </div>

                <ul className="flex flex-wrap gap-2">
                  {group.skills.map((skill) => (
                    <li
                      key={skill}
                      className="text-sm text-textSecondary bg-accentDim/50 border border-stroke rounded-full
                      py-1.5 px-3.5 hover:text-textPrimary hover:border-accent/50 transition-colors duration-200"
                    >
                      {skill}
                    </li>
                  ))}
                </ul>
              </SpotlightCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Skills;
