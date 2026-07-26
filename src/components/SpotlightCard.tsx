// react
import { FC, ReactNode, useRef } from "react";
// framer-motion
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";

interface SpotlightCardProps {
  children: ReactNode;
  className?: string;
  /** Enable subtle 3D tilt toward the cursor */
  tilt?: boolean;
}

/**
 * Card wrapper with a mouse-tracked spotlight glow (via --px/--py CSS vars,
 * see .spotlight-card in index.css) and an optional 3D tilt.
 */
const SpotlightCard: FC<SpotlightCardProps> = ({
  children,
  className = "",
  tilt = false,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const rotateX = useSpring(useMotionValue(0), { stiffness: 180, damping: 18 });
  const rotateY = useSpring(useMotionValue(0), { stiffness: 180, damping: 18 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    el.style.setProperty("--px", `${x}px`);
    el.style.setProperty("--py", `${y}px`);

    if (tilt && !shouldReduceMotion) {
      rotateX.set(((y - rect.height / 2) / (rect.height / 2)) * -4);
      rotateY.set(((x - rect.width / 2) / (rect.width / 2)) * 4);
    }
  };

  const handleMouseLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={
        tilt && !shouldReduceMotion
          ? { rotateX, rotateY, transformPerspective: 900 }
          : undefined
      }
      className={`spotlight-card relative ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default SpotlightCard;
