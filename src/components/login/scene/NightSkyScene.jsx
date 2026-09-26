import { useEffect, useMemo, useRef } from "react";

// Pure CSS/DOM night sky — no WebGL. A login screen doesn't need a real
// depth buffer for two circles and some dots; box-shadow/filter glow +
// capped-count CSS-keyframe twinkle gets the same read for a fraction of
// the GPU/battery cost of a three.js scene + postprocessing bloom pass.
const STAR_COUNT = 42;

function useStarField() {
  return useMemo(
    () =>
      Array.from({ length: STAR_COUNT }, (_, i) => ({
        id: i,
        top: `${Math.random() * 78}%`,
        left: `${Math.random() * 100}%`,
        size: 1 + Math.random() * 1.8,
        duration: 2.4 + Math.random() * 3.2,
        delay: -(Math.random() * 5),
        variant: i % 2 === 0 ? "star-a" : "star-b",
      })),
    []
  );
}

export default function NightSkyScene({ reduced }) {
  const stars = useStarField();
  const parallaxRef = useRef(null);

  useEffect(() => {
    if (reduced) return;
    const el = parallaxRef.current;
    if (!el) return;

    let ticking = false;
    const handleMove = (e) => {
      if (document.hidden || ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const x = (e.clientX / window.innerWidth) * 2 - 1;
        const y = (e.clientY / window.innerHeight) * 2 - 1;
        el.style.transform = `translate3d(${x * 10}px, ${y * 6}px, 0)`;
        ticking = false;
      });
    };

    window.addEventListener("pointermove", handleMove, { passive: true });
    return () => window.removeEventListener("pointermove", handleMove);
  }, [reduced]);

  return (
    <div className="night-sky" aria-hidden="true">
      <div ref={parallaxRef} className="sky-parallax">
        <div className="moon">
          <div className="moon-halo" />
          <div className="moon-core" />
        </div>

        {stars.map((star) => (
          <span
            key={star.id}
            className={`star ${star.variant} ${reduced ? "" : "is-animating"}`}
            style={{
              top: star.top,
              left: star.left,
              width: star.size,
              height: star.size,
              "--star-duration": `${star.duration}s`,
              "--star-delay": `${star.delay}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
