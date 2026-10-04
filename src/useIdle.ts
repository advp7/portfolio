// react
import { useEffect, useState } from "react";

/**
 * True once the browser has a quiet moment after load (or after `timeout`
 * ms at the latest). Used to fetch non-critical UI without competing with
 * the first paint.
 */
export const useIdle = (timeout = 2500) => {
  const [idle, setIdle] = useState(false);
  useEffect(() => {
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    if (w.requestIdleCallback && w.cancelIdleCallback) {
      const id = w.requestIdleCallback(() => setIdle(true), { timeout });
      return () => w.cancelIdleCallback?.(id);
    }
    // Safari has no requestIdleCallback
    const id = window.setTimeout(() => setIdle(true), 1200);
    return () => window.clearTimeout(id);
  }, [timeout]);
  return idle;
};
