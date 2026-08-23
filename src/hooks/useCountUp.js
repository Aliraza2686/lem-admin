import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "./useReducedMotion";

// Animates a number from 0 (or its previous value) up to `value` on change.
// Collapses to an instant jump when the user prefers reduced motion.
export function useCountUp(value, { duration = 900 } = {}) {
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState(0);
  const fromRef = useRef(0);
  const rafRef = useRef(null);

  useEffect(() => {
    const target = Number.isFinite(value) ? value : 0;

    if (reduced) {
      setDisplay(target);
      fromRef.current = target;
      return;
    }

    const from = fromRef.current;
    const start = performance.now();

    cancelAnimationFrame(rafRef.current);

    const tick = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setDisplay(Math.round(from + (target - from) * eased));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = target;
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, duration, reduced]);

  return display;
}
