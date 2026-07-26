// react
import { FC, useEffect, useState } from "react";
// framer-motion
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

interface RotatingTextProps {
  phrases: string[];
  className?: string;
  intervalMs?: number;
}

const RotatingText: FC<RotatingTextProps> = ({
  phrases,
  className = "",
  intervalMs = 3000,
}) => {
  const [index, setIndex] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (shouldReduceMotion) return;
    const id = setInterval(
      () => setIndex((i) => (i + 1) % phrases.length),
      intervalMs
    );
    return () => clearInterval(id);
  }, [phrases.length, intervalMs, shouldReduceMotion]);

  if (shouldReduceMotion) {
    return <span className={className}>{phrases[0]}</span>;
  }

  return (
    <span className={`relative inline-block ${className}`}>
      <AnimatePresence mode="wait">
        <motion.span
          key={index}
          initial={{ y: "0.6em", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "-0.6em", opacity: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="inline-block"
        >
          {phrases[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
};

export default RotatingText;
