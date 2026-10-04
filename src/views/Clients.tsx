// assets
// Raster logos are WebP at 2x their 56px display height
import swiggyImg from "../assets/swiggy.webp";
import zomatoImg from "../assets/zomato.webp";
import cypherockImg from "../assets/cypherock.webp";
import mamaketoImg from "../assets/mamaketo.svg";
import o4hImg from "../assets/o4h.webp";
import edelweissImg from "../assets/edelweiss_logo.svg";

// react
import { useRef } from "react";

// framer-motion
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "framer-motion";

// invertOnDark: logo artwork is black, so it vanishes on the dark theme.
// w/h: intrinsic size, so the browser reserves the right space up front.
const clients: {
  name: string;
  img: string;
  w: number;
  h: number;
  invertOnDark?: boolean;
}[] = [
  { name: "Swiggy", img: swiggyImg, w: 374, h: 112 },
  { name: "Zomato", img: zomatoImg, w: 523, h: 112 },
  { name: "Edelweiss", img: edelweissImg, w: 12726, h: 2518 },
  { name: "Cypherock", img: cypherockImg, w: 112, h: 112, invertOnDark: true },
  { name: "Mamaketo", img: mamaketoImg, w: 150, h: 95, invertOnDark: true },
  { name: "O4H — Order for Health", img: o4hImg, w: 144, h: 112 },
];

const wrap = (min: number, max: number, value: number) => {
  const range = max - min;
  return min + (((value - min) % range) + range) % range;
};

const Clients = () => {
  const shouldReduceMotion = useReducedMotion();

  // Constant drift, boosted and re-directed by the user's scroll velocity
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 400,
  });
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 4], {
    clamp: false,
  });
  const directionFactor = useRef(1);

  useAnimationFrame((_, delta) => {
    if (shouldReduceMotion) return;

    const baseVelocity = -0.5; // % of strip width per second
    let moveBy = directionFactor.current * baseVelocity * (delta / 1000);

    const factor = velocityFactor.get();
    if (factor < 0) directionFactor.current = -1;
    else if (factor > 0) directionFactor.current = 1;

    moveBy += directionFactor.current * moveBy * factor;
    baseX.set(baseX.get() + moveBy);
  });

  // Strip holds six copies of the logos (one copy ≈ 900px), so wrapping every
  // -1/6 of the strip is seamless while the strip exceeds the viewport plus
  // one copy — which holds beyond 4K-wide (3840px) screens.
  const COPIES = 6;
  const x = useTransform(baseX, (v) => `${wrap(-100 / COPIES, 0, v)}%`);

  const marqueeItems = Array.from({ length: COPIES }, () => clients).flat();

  return (
    <section
      id="clients"
      aria-label="Brands and teams that have used software I built"
      className="relative border-t border-stroke py-14 overflow-hidden"
    >
      <p className="text-center font-mono text-sm tracking-[0.2em] uppercase text-textMuted mb-10">
        Software I built, used by
      </p>

      <div
        className="relative w-full overflow-hidden
        [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]"
      >
        <motion.div
          style={{ x }}
          className="flex w-max items-center gap-20 pr-20"
        >
          {marqueeItems.map((client, index) => (
            <img
              key={`${client.name}-${index}`}
              src={client.img}
              alt={client.name}
              width={client.w}
              height={client.h}
              loading="lazy"
              decoding="async"
              className={`h-12 sm:h-14 w-auto max-w-[140px] object-contain opacity-60 ${
                client.invertOnDark ? "invert-on-dark" : ""
              } hover:opacity-100 transition-opacity duration-300`}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Clients;
