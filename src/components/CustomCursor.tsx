// react
import { useEffect, useRef, useState } from "react";

type CursorState = "default" | "link" | "card" | "text" | "hidden";

const INTERACTIVE =
  'a, button, [role="button"], [role="option"], label, summary, select';
const TEXT_ENTRY =
  'input:not([type="button"]):not([type="submit"]):not([type="checkbox"]):not([type="radio"]), textarea, [contenteditable="true"]';

/** Fine pointer (mouse/trackpad) and no reduced-motion preference */
const shouldEnable = () =>
  window.matchMedia("(pointer: fine)").matches &&
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Custom cursor: an exact-position dot plus a trailing ring that reacts to
 * what's underneath (links grow it, case-study cards turn it into a "View"
 * bubble, text fields hand back the native I-beam). Also lights up the
 * background dot grid around the pointer.
 */
const CustomCursor = () => {
  const [enabled] = useState(shouldEnable);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const gridGlowRef = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState("View");

  useEffect(() => {
    if (!enabled) return;
    const html = document.documentElement;
    html.classList.add("custom-cursor");

    const mouse = { x: -100, y: -100 };
    const ring = { x: -100, y: -100 };
    let raf = 0;
    let visible = false;

    const setState = (state: CursorState) => {
      if (rootRef.current) rootRef.current.dataset.state = state;
    };

    // The ring eases toward the pointer; the loop stops once it has caught up
    const follow = () => {
      ring.x += (mouse.x - ring.x) * 0.2;
      ring.y += (mouse.y - ring.y) * 0.2;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ring.x}px, ${ring.y}px, 0)`;
      }
      if (Math.abs(mouse.x - ring.x) > 0.1 || Math.abs(mouse.y - ring.y) > 0.1) {
        raf = requestAnimationFrame(follow);
      } else {
        raf = 0;
      }
    };

    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      if (!visible) {
        // First move after entering: start the ring where the pointer is
        visible = true;
        ring.x = mouse.x;
        ring.y = mouse.y;
        if (ringRef.current) {
          ringRef.current.style.transform = `translate3d(${ring.x}px, ${ring.y}px, 0)`;
        }
        rootRef.current?.classList.add("is-visible");
      }
      // The dot is written synchronously on every event: no perceived lag
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouse.x}px, ${mouse.y}px, 0)`;
      }
      const glow = gridGlowRef.current;
      if (glow) {
        glow.style.setProperty("--mx", `${mouse.x}px`);
        glow.style.setProperty("--my", `${mouse.y}px`);
      }
      if (!raf) raf = requestAnimationFrame(follow);
    };

    const onOver = (e: MouseEvent) => {
      const target = e.target as Element | null;
      if (!target?.closest) return;
      if (target.closest(TEXT_ENTRY)) {
        setState("text");
        return;
      }
      // Real controls win over a surrounding card, so the cursor always
      // describes what a click will actually do
      if (target.closest(INTERACTIVE)) {
        setState("link");
        return;
      }
      const card = target.closest<HTMLElement>("[data-cursor]");
      if (card) {
        setLabel(card.dataset.cursor || "View");
        setState("card");
        return;
      }
      setState("default");
    };

    const onDown = () => rootRef.current?.classList.add("is-pressed");
    const onUp = () => rootRef.current?.classList.remove("is-pressed");
    const onLeave = () => {
      visible = false;
      rootRef.current?.classList.remove("is-visible");
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseover", onOver, { passive: true });
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    document.documentElement.addEventListener("mouseleave", onLeave);

    return () => {
      html.classList.remove("custom-cursor");
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      document.documentElement.removeEventListener("mouseleave", onLeave);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      {/* Brighter copy of the background dot grid, revealed around the pointer */}
      <div
        ref={gridGlowRef}
        aria-hidden="true"
        className="cursor-grid-glow pointer-events-none fixed inset-0 -z-[9]"
      />
      <div
        ref={rootRef}
        aria-hidden="true"
        data-state="default"
        className="custom-cursor-root pointer-events-none fixed inset-0 z-[100]"
      >
        <div ref={ringRef} className="cursor-ring absolute left-0 top-0">
          <div className="cursor-ring-circle" />
          <span className="cursor-label">{label}</span>
        </div>
        <div ref={dotRef} className="cursor-dot absolute left-0 top-0" />
      </div>
    </>
  );
};

export default CustomCursor;
