import { motion } from "framer-motion";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { RANGES } from "./dashboardUtils";

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="dash-panel rounded-lg px-3 py-2 text-xs">
      <p className="font-medium text-white">{label}</p>
      <p className="text-white/50">{payload[0].value} visits</p>
    </div>
  );
}

export default function VisitorsChart({ buckets, range, onRangeChange, loading, reduced }) {
  return (
    <motion.div
      variants={cardVariants}
      className="dash-panel flex h-full flex-col rounded-2xl p-5"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-white">Visitors over time</h2>
          <p className="text-xs text-white/40">Site traffic for the selected range</p>
        </div>

        <div className="flex gap-1 rounded-lg border border-white/10 bg-white/5 p-0.5">
          {Object.keys(RANGES).map((key) => (
            <button
              key={key}
              onClick={() => onRangeChange(key)}
              className={`cursor-pointer rounded-md px-2.5 py-1 text-xs font-medium transition-colors duration-150 ${
                range === key
                  ? "bg-glow text-primary-deep"
                  : "text-white/50 hover:text-white"
              }`}
            >
              {RANGES[key].label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 min-h-[220px] flex-1">
        {loading ? (
          <div className="h-full w-full animate-pulse rounded-lg bg-white/5" />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={buckets} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="visitorsFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4fd1ff" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#4fd1ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-white/5" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "currentColor" }}
                className="text-white/30"
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis tick={{ fontSize: 11, fill: "currentColor" }} className="text-white/30" tickLine={false} axisLine={false} width={36} allowDecimals={false} />
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#4fd1ff"
                strokeWidth={2}
                fill="url(#visitorsFill)"
                isAnimationActive={!reduced}
                animationDuration={900}
                animationEasing="ease-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </motion.div>
  );
}
