// react
import { CSSProperties, forwardRef } from "react";

/** static: no animation (older messages, so only the live orb moves) */
export type OrbState = "idle" | "thinking" | "listening" | "speaking" | "static";

interface OrbProps {
  size: number;
  state?: OrbState;
  className?: string;
}

/**
 * The assistant's face: a gradient orb that breathes when idle, spins while
 * thinking, pulses while answering and swells with the visitor's voice
 * (via the --level custom property, 0–1). Purely decorative.
 */
const Orb = forwardRef<HTMLSpanElement, OrbProps>(
  ({ size, state = "idle", className = "" }, ref) => (
    <span
      ref={ref}
      aria-hidden="true"
      data-state={state}
      className={`orb ${className}`}
      style={{ width: size, height: size, "--orb-size": `${size}px` } as CSSProperties}
    />
  )
);

Orb.displayName = "Orb";

export default Orb;
