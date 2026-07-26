// components
import { ProjectCard, SectionHeading, Reveal } from "../components";
// data
import { projects } from "../data";
// framer-motion
import { motion } from "framer-motion";
// utils
import { fadeIn } from "../utils/variants";
import { transition } from "../utils/transition";

const Projects = () => {
  return (
    <section
      id="projects"
      className="relative border-t border-stroke scroll-mt-16"
    >
      <div className="max-w-screen-2xl w-full py-24 px-6 sm:px-12 mx-auto flex flex-col gap-14">
        <div className="flex flex-col gap-6 max-w-[720px]">
          <SectionHeading
            eyebrow="04 — Projects"
            title="Things I've"
            highlight="built"
          />
          <Reveal>
            <p className="text-center xl:text-left text-base sm:text-lg text-textSecondary leading-relaxed">
              Production work shipped for real clients — including AI products
              live in the wild — plus personal projects built to explore new
              ideas.
            </p>
          </Reveal>
        </div>

        <motion.div
          variants={fadeIn("up")}
          transition={transition()}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
        >
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Projects;
