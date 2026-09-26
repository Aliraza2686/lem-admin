import Camels from "./Camels";

// Shimmer sweep is a CSS @keyframes translateX loop (see night-scene.css) —
// no JS ticker required for a single back-and-forth drift.
export default function Dunes({ reduced }) {
  return (
    <div className="dune-layer" aria-hidden="true">
      <svg className="dune dune-back" viewBox="0 0 1440 320" preserveAspectRatio="none">
        <path d="M0,180 Q220,110 460,150 T900,140 T1440,170 L1440,320 L0,320 Z" fill="#151b34" />
      </svg>
      <svg className="dune dune-mid" viewBox="0 0 1440 320" preserveAspectRatio="none">
        <path d="M0,220 Q260,160 520,200 T980,190 T1440,215 L1440,320 L0,320 Z" fill="#0e1226" />
      </svg>

      <div className={`dune-shimmer ${reduced ? "" : "is-animating"}`} />
      <Camels reduced={reduced} />

      <svg className="dune dune-front" viewBox="0 0 1440 320" preserveAspectRatio="none">
        <path d="M0,255 Q300,210 600,245 T1140,235 T1440,250 L1440,320 L0,320 Z" fill="#080a18" />
      </svg>
    </div>
  );
}
