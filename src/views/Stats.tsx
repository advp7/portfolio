// components
import { CountUp } from "../components";
// framer-motion
import { motion } from "framer-motion";
// utils
import { fadeIn } from "../utils/variants";
import { transition } from "../utils/transition";
// data
import { stats } from "../data";

const Stats = () => {
  return (
    <section
      aria-label="Career highlights by the numbers"
      className="relative border-t border-stroke"
    >
      <div className="max-w-screen-2xl mx-auto px-6 sm:px-12 py-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-stroke rounded-2xl overflow-hidden border border-stroke">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              variants={fadeIn("up")}
              transition={transition(index * 0.1)}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              className="group relative flex flex-col items-center justify-center gap-2
              bg-night px-4 py-10 text-center hover:bg-surface transition-colors duration-300"
            >
              <span
                className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold gradient-text
                tabular-nums"
              >
                <CountUp
                  to={stat.value}
                  prefix={stat.prefix}
                  suffix={stat.suffix}
                />
              </span>
              <span className="text-xs sm:text-sm text-textSecondary max-w-[160px] leading-snug">
                {stat.label}
              </span>
              <span
                aria-hidden="true"
                className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-0 bg-gradient-to-r
                from-accent to-accentAlt group-hover:w-2/3 transition-all duration-500"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
