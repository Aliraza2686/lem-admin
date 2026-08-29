import { motion } from "framer-motion";
import { Users } from "lucide-react";
import { RANGES, formatCompactNumber, formatPercent } from "./dashboardUtils";

const SIZE = 148;
const STROKE = 12;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function VisitorsGauge({ current, percentChange, range, onRangeChange, loading, reduced }) {
  const hasDelta = Number.isFinite(percentChange);
  const positive = hasDelta && percentChange >= 0;
  // Ring fill is a scannable "how much movement" indicator, not a literal 0-100% —
  // magnitude clamped so a +8% swing still reads as a visible arc, not a sliver.
  const fillRatio = hasDelta ? Math.min(1, Math.abs(percentChange) / 50) : 0;
  const offset = CIRCUMFERENCE * (1 - fillRatio);

  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
      className="dash-panel flex flex-col items-center rounded-2xl p-5 text-center"
    >
      <div className="flex w-full items-center justify-between text-left">
        <div>
          <h3 className="text-sm font-semibold text-white">Visitors</h3>
          <p className="text-xs text-white/40">This period</p>
        </div>
        <Users className="size-4 text-white/30" />
      </div>

      <div className="relative mt-3 flex items-center justify-center">
        <svg width={SIZE} height={SIZE} className="-rotate-90">
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={STROKE}
          />
          <motion.circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="#4fd1ff"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            initial={{ strokeDashoffset: CIRCUMFERENCE }}
            animate={{ strokeDashoffset: loading ? CIRCUMFERENCE : offset }}
            transition={{ duration: reduced ? 0.01 : 1.1, ease: [0.22, 1, 0.36, 1] }}
            style={{ filter: "drop-shadow(0 0 6px rgba(79,209,255,0.6))" }}
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-2xl font-semibold tabular-nums text-white">
            {loading ? "—" : formatCompactNumber(current)}
          </span>
          {hasDelta && !loading && (
            <span className={positive ? "text-xs font-medium text-emerald-400" : "text-xs font-medium text-rose-400"}>
              {formatPercent(percentChange)}
            </span>
          )}
        </div>
      </div>

      <div className="mt-3 flex gap-1 rounded-lg border border-white/10 bg-white/5 p-0.5">
        {Object.keys(RANGES).map((key) => (
          <button
            key={key}
            onClick={() => onRangeChange(key)}
            className={`cursor-pointer rounded-md px-2.5 py-1 text-xs font-medium transition-colors duration-150 ${
              range === key ? "bg-glow text-primary-deep" : "text-white/50 hover:text-white"
            }`}
          >
            {RANGES[key].label}
          </button>
        ))}
      </div>
    </motion.div>
  );
}
