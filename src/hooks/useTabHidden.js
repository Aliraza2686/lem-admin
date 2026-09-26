import { useEffect, useState } from "react";

// Tracks document.visibilityState so continuous decorative animations
// (glow pulses, twinkle, parallax, walk-cycles) can pause while the tab
// isn't visible instead of burning CPU/GPU/battery in the background.
export function useTabHidden() {
  const [hidden, setHidden] = useState(() => typeof document !== "undefined" && document.hidden);

  useEffect(() => {
    const handler = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, []);

  return hidden;
}
