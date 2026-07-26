// framer-motion
import { motion } from "framer-motion";
// react
import { FC, ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
}

const Reveal: FC<RevealProps> = ({ children }) => {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 24 },
        visible: { opacity: 1, y: 0 },
      }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
};

export default Reveal;
