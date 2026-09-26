// Walk-cycle, leg swing, and body bob are all plain CSS @keyframes on
// transform (see night-scene.css) — no JS animation library needed for a
// linear translate + a couple of oscillating rotates. Per-camel timing
// varies via CSS custom properties so each still walks independently.
function CamelSilhouette({ reduced, duration, delay, top, left, scale = 1, flip = false, opacity = 0.85 }) {
  return (
    <svg
      className={`camel-silhouette ${reduced ? "" : "is-animating"}`}
      style={{
        top,
        left: reduced ? left : undefined,
        width: 120 * scale,
        height: 70 * scale,
        opacity,
        "--camel-duration": `${duration}s`,
        "--camel-delay": `${delay}s`,
        transform: flip ? "scaleX(-1)" : undefined,
      }}
      viewBox="0 0 120 70"
      fill="none"
      aria-hidden="true"
    >
      <g className="camel-body" fill="#080a18">
        <path d="M10 55 Q8 40 20 36 Q24 20 34 22 Q40 10 48 18 Q56 8 62 20 Q70 16 74 28 Q90 26 92 40 Q100 42 98 50 L96 55 Q70 60 50 58 Q28 60 10 55 Z" />
        <path d="M78 26 Q84 12 92 14 Q88 22 86 28 Z" />
      </g>
      <g fill="#080a18">
        <rect className="leg-a" x="24" y="52" width="5" height="16" rx="2" />
        <rect className="leg-b" x="36" y="52" width="5" height="16" rx="2" />
        <rect className="leg-b" x="70" y="52" width="5" height="16" rx="2" />
        <rect className="leg-a" x="84" y="52" width="5" height="16" rx="2" />
      </g>
    </svg>
  );
}

export default function Camels({ reduced }) {
  return (
    <div className="camel-layer" aria-hidden="true">
      <CamelSilhouette reduced={reduced} duration={46} delay={0} top="64%" left="10%" scale={0.85} opacity={0.5} />
      <CamelSilhouette reduced={reduced} duration={34} delay={-6} top="73%" left="55%" scale={1.05} opacity={0.85} flip />
      <CamelSilhouette reduced={reduced} duration={52} delay={-14} top="80%" left="30%" scale={0.7} opacity={0.35} />
    </div>
  );
}
