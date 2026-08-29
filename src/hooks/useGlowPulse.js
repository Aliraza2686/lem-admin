import { useEffect, useRef } from "react";
import { animate } from "animejs";
import { useReducedMotion } from "./useReducedMotion";

// Continuous "breathing" glow loop on a --glow-opacity CSS variable, driven
// by anime.js (better suited to an alternating background loop than
// framer-motion's mount/gesture-oriented API). Only runs while `active`;
// stays fully off when the user prefers reduced motion.
export function useGlowPulse(active) {
  const ref = useRef(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (!active || reduced) {
      el.style.setProperty("--glow-opacity", active ? "1" : "0");
      return;
    }

    el.style.setProperty("--glow-opacity", "0.6");
    const anim = animate(el, {
      "--glow-opacity": [0.45, 1],
      duration: 1800,
      ease: "inOutSine",
      alternate: true,
      loop: true,
    });

    return () => anim.pause();
  }, [active, reduced]);

  return ref;
}
