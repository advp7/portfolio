// react
import {
  FC,
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
// framer-motion
import { motion, useInView, useReducedMotion } from "framer-motion";
// data
import { DiagramId } from "../data";

// Per-instance prefix so gradient/marker ids never collide when a diagram
// renders more than once on the page (card + case-study modal).
const UidContext = createContext("d");
const useUid = () => useContext(UidContext);

// Draw-in sequence: idle (hidden) → drawing (nodes then lines appear,
// left to right) → done (lines switch to the flowing dashed animation)
type Phase = "idle" | "drawing" | "done";
const PhaseContext = createContext<Phase>("done");
const VIEW_WIDTH = 560;
/** Stagger by horizontal position so the diagram builds left to right */
const delayForX = (x: number) => (x / VIEW_WIDTH) * 0.6;

interface NodeProps {
  x: number;
  y: number;
  w: number;
  h?: number;
  title: string;
  sub: string;
  /** Highlight the parts of the system I owned or worked on */
  mine?: boolean;
  /** Dashed outline for parts designed-for rather than shipped at launch */
  planned?: boolean;
}

const Node: FC<NodeProps> = ({
  x,
  y,
  w,
  h = 48,
  title,
  sub,
  mine,
  planned,
}) => {
  const uid = useUid();
  const phase = useContext(PhaseContext);
  return (
  <motion.g
    initial={false}
    animate={phase === "idle" ? { opacity: 0, y: 6 } : { opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: phase === "drawing" ? delayForX(x) : 0 }}
  >
    <rect
      x={x}
      y={y}
      width={w}
      height={h}
      rx={10}
      className={mine ? "fill-panelMine" : "fill-panel stroke-strokeStrong"}
      stroke={mine ? `url(#${uid}-accent)` : undefined}
      strokeWidth={mine ? 1.6 : 1}
      strokeDasharray={planned ? "5 4" : undefined}
    />
    <text
      x={x + w / 2}
      y={y + h / 2 - 4}
      textAnchor="middle"
      className="fill-textPrimary font-display"
      fontSize={15}
      fontWeight={600}
    >
      {title}
    </text>
    <text
      x={x + w / 2}
      y={y + h / 2 + 14}
      textAnchor="middle"
      className={mine ? "fill-accent font-mono" : "fill-textMuted font-mono"}
      fontSize={12.5}
    >
      {sub}
    </text>
  </motion.g>
  );
};

const Flow: FC<{ d: string; both?: boolean }> = ({ d, both }) => {
  const uid = useUid();
  const phase = useContext(PhaseContext);

  if (phase !== "done") {
    // Solid line that traces itself in; arrowheads appear once drawn
    const startX = parseFloat(d.slice(1)) || 0;
    return (
      <motion.path
        d={d}
        fill="none"
        className="stroke-accent/60"
        strokeWidth={1.4}
        initial={false}
        animate={
          phase === "drawing"
            ? { pathLength: 1, opacity: 1 }
            : { pathLength: 0, opacity: 0 }
        }
        transition={{
          duration: 0.5,
          delay: 0.25 + delayForX(startX),
          ease: "easeOut",
        }}
      />
    );
  }

  return (
  <path
    d={d}
    fill="none"
    className="flow-line stroke-accent/60"
    strokeWidth={1.4}
    markerEnd={`url(#${uid}-arrow)`}
    markerStart={both ? `url(#${uid}-arrow-start)` : undefined}
  />
  );
};

const Defs = () => {
  const uid = useUid();
  return (
  <defs>
    <linearGradient id={`${uid}-accent`} x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" style={{ stopColor: "rgb(var(--accent))" }} />
      <stop offset="1" style={{ stopColor: "rgb(var(--accent-alt))" }} />
    </linearGradient>
    <marker
      id={`${uid}-arrow`}
      viewBox="0 0 10 10"
      refX="9"
      refY="5"
      markerWidth="6"
      markerHeight="6"
      orient="auto"
    >
      <path d="M0 0L10 5L0 10z" className="fill-accent/80" />
    </marker>
    <marker
      id={`${uid}-arrow-start`}
      viewBox="0 0 10 10"
      refX="1"
      refY="5"
      markerWidth="6"
      markerHeight="6"
      orient="auto"
    >
      <path d="M10 0L0 5L10 10z" className="fill-accent/80" />
    </marker>
  </defs>
  );
};

const AiAssistantDiagram = () => (
  <svg
    viewBox="0 0 560 280"
    role="img"
    className="w-full min-w-[520px] xl:min-w-0 h-auto"
  >
    <title>
      Architecture: website visitors use a React chat UI, which calls a
      FastAPI service that orchestrates the Gemini model, tool calls and a
      Redis cache.
    </title>
    <Defs />
    <Flow d="M110 142 L138 142" />
    <Flow d="M252 142 L284 142" />
    <Flow d="M404 142 C424 142 420 54 438 54" />
    <Flow d="M404 142 L438 142" />
    <Flow d="M404 142 C424 142 420 230 438 230" />

    <Node x={10} y={118} w={100} title="Visitor" sub="website" />
    <Node x={140} y={118} w={112} title="Chat UI" sub="React" mine />
    <Node x={286} y={118} w={118} title="API service" sub="FastAPI" mine />
    <Node x={440} y={30} w={110} title="Gemini" sub="LLM" />
    <Node x={440} y={118} w={110} title="Tools" sub="tool calling" />
    <Node x={440} y={206} w={110} title="Redis" sub="cache" />
  </svg>
);

const RcsDiagram = () => (
  <svg
    viewBox="0 0 560 280"
    role="img"
    className="w-full min-w-[520px] xl:min-w-0 h-auto"
  >
    <title>
      Architecture: backend APIs feed one shared RCS layer of components and
      state, which powers broadcast campaigns and the template-message node,
      and is designed to extend to template creation.
    </title>
    <Defs />
    <Flow d="M122 142 L158 142" both />
    <Flow d="M310 142 C332 142 328 54 348 54" />
    <Flow d="M310 142 L348 142" />
    <Flow d="M310 142 C332 142 328 230 348 230" />

    <Node x={10} y={118} w={110} title="Backend APIs" sub="REST" />
    <Node
      x={160}
      y={96}
      w={150}
      h={92}
      title="Shared RCS layer"
      sub="components + state"
      mine
    />
    <Node x={350} y={30} w={200} title="Broadcast campaigns" sub="consumer" />
    <Node x={350} y={118} w={200} title="Template-message node" sub="consumer" />
    <Node
      x={350}
      y={206}
      w={200}
      title="Template creation"
      sub="designed to plug in"
      planned
    />
  </svg>
);

const ArchitectureDiagram: FC<{ id: DiagramId }> = ({ id }) => {
  const uid = `dg${useId().replace(/:/g, "")}`;
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const shouldReduceMotion = useReducedMotion();
  const [phase, setPhase] = useState<Phase>(
    shouldReduceMotion ? "done" : "idle"
  );

  useEffect(() => {
    if (shouldReduceMotion) {
      setPhase("done");
      return;
    }
    if (!inView) return;
    setPhase("drawing");
    // Longest line finishes at ~1.35s; then hand over to the flowing dashes
    const timer = window.setTimeout(() => setPhase("done"), 1500);
    return () => window.clearTimeout(timer);
  }, [inView, shouldReduceMotion]);

  return (
    <div ref={ref}>
      <UidContext.Provider value={uid}>
        <PhaseContext.Provider value={phase}>
          {id === "ai-assistant" ? <AiAssistantDiagram /> : <RcsDiagram />}
        </PhaseContext.Provider>
      </UidContext.Provider>
    </div>
  );
};

export default ArchitectureDiagram;
