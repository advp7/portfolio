// react
import { useEffect, useRef } from "react";
// framer-motion
import { useReducedMotion } from "framer-motion";

/**
 * Soft radial glow that trails the cursor across the whole page.
 * Sits between the ambient background (-z-10) and the content, so it
 * illuminates the backdrop without tinting text. Desktop pointers only.
 */
const CursorGlow = () => {
  const ref = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (shouldReduceMotion) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    let raf = 0;
    const onMove = (e: MouseEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = ref.current;
        if (el) {
          el.style.background = `radial-gradient(600px circle at ${e.clientX}px ${e.clientY}px, rgba(56, 189, 248, 0.07), transparent 70%)`;
        }
      });
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [shouldReduceMotion]);

  if (shouldReduceMotion) return null;

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-[5] hidden md:block"
    />
  );
};

export default CursorGlow;
