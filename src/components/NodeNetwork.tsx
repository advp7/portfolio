// react
import { useEffect, useRef } from "react";
// framer-motion
import { useReducedMotion } from "framer-motion";
// theme
import { useTheme } from "../theme";

interface Point {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

const LINK_DISTANCE = 140;
const CURSOR_DISTANCE = 180;
/** Nodes inside this radius are gently pushed away from the cursor */
const REPEL_RADIUS = 130;
const DRIFT_SPEED = 0.35;
/** A click pushes nodes within this radius outward */
const SHOCKWAVE_RADIUS = 240;

/**
 * Softly drifting network of connected nodes behind the hero, a visual nod to
 * AI agents and systems. Lines reach toward the cursor. Pauses whenever the
 * hero is off-screen; renders a single still frame for reduced motion.
 */
const NodeNetwork = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shouldReduceMotion = useReducedMotion();
  // Re-read colours whenever the theme changes
  const { resolved } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const accent = getComputedStyle(document.documentElement)
      .getPropertyValue("--accent")
      .trim()
      .split(/\s+/)
      .join(",");
    const dotAlpha = resolved === "dark" ? 0.55 : 0.45;
    const lineAlpha = resolved === "dark" ? 0.22 : 0.18;

    let width = 0;
    let height = 0;
    let points: Point[] = [];
    const cursor = { x: -9999, y: -9999 };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Density scales with area, capped so large screens stay cheap
      const count = Math.min(90, Math.round((width * height) / 16000));
      points = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * DRIFT_SPEED,
        vy: (Math.random() - 0.5) * DRIFT_SPEED,
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < points.length; i++) {
        const a = points[i];
        for (let j = i + 1; j < points.length; j++) {
          const b = points[j];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < LINK_DISTANCE) {
            ctx.strokeStyle = `rgba(${accent},${lineAlpha * (1 - dist / LINK_DISTANCE)})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
        const toCursor = Math.hypot(a.x - cursor.x, a.y - cursor.y);
        if (toCursor < CURSOR_DISTANCE) {
          ctx.strokeStyle = `rgba(${accent},${
            lineAlpha * 1.8 * (1 - toCursor / CURSOR_DISTANCE)
          })`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(cursor.x, cursor.y);
          ctx.stroke();
        }
        ctx.fillStyle = `rgba(${accent},${dotAlpha})`;
        ctx.beginPath();
        ctx.arc(a.x, a.y, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const step = () => {
      for (const p of points) {
        // Repel from the cursor
        const dx = p.x - cursor.x;
        const dy = p.y - cursor.y;
        const dist = Math.hypot(dx, dy);
        if (dist > 0 && dist < REPEL_RADIUS) {
          const force = (1 - dist / REPEL_RADIUS) * 0.12;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }
        // Ease anything moving faster than the base drift back to calm
        const speed = Math.hypot(p.vx, p.vy);
        if (speed > DRIFT_SPEED) {
          p.vx *= 0.96;
          p.vy *= 0.96;
        }
        p.x += p.vx;
        p.y += p.vy;
        // Clamp-and-reflect: a plain sign flip can trap a node that a
        // shockwave pushed past the edge, oscillating outside the canvas
        if (p.x < 0) {
          p.x = 0;
          p.vx = Math.abs(p.vx);
        } else if (p.x > width) {
          p.x = width;
          p.vx = -Math.abs(p.vx);
        }
        if (p.y < 0) {
          p.y = 0;
          p.vy = Math.abs(p.vy);
        } else if (p.y > height) {
          p.y = height;
          p.vy = -Math.abs(p.vy);
        }
      }
      draw();
    };

    resize();
    draw();

    if (shouldReduceMotion) {
      const redraw = () => {
        resize();
        draw();
      };
      window.addEventListener("resize", redraw);
      return () => window.removeEventListener("resize", redraw);
    }

    let raf = 0;
    let running = false;
    const loop = () => {
      step();
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (!running) {
        running = true;
        raf = requestAnimationFrame(loop);
      }
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    // Only animate while the hero is actually visible
    const observer = new IntersectionObserver(([entry]) =>
      entry.isIntersecting ? start() : stop()
    );
    observer.observe(canvas);

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      cursor.x = e.clientX - rect.left;
      cursor.y = e.clientY - rect.top;
    };
    const onLeave = () => {
      cursor.x = -9999;
      cursor.y = -9999;
    };
    // Click anywhere over the hero: shockwave through nearby nodes
    const onPointerDown = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      if (cx < 0 || cy < 0 || cx > rect.width || cy > rect.height) return;
      for (const p of points) {
        const dx = p.x - cx;
        const dy = p.y - cy;
        const dist = Math.hypot(dx, dy);
        if (dist > 0 && dist < SHOCKWAVE_RADIUS) {
          const impulse = (1 - dist / SHOCKWAVE_RADIUS) * 4;
          p.vx += (dx / dist) * impulse;
          p.vy += (dy / dist) * impulse;
        }
      }
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    window.addEventListener("resize", resize);

    return () => {
      stop();
      observer.disconnect();
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("resize", resize);
    };
  }, [resolved, shouldReduceMotion]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="hero-network-mask pointer-events-none absolute inset-0 h-full w-full"
    />
  );
};

export default NodeNetwork;
