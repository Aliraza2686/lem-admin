import { motion } from "framer-motion";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Link } from "react-router-dom";
import { Eye, Heart } from "lucide-react";

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

// Light-blue-to-glow ramp derived from brand tokens — bars sit on a dark
// dash-panel card here, so a navy-heavy ramp would nearly disappear; this
// stays bright throughout instead of fading to dark like the light-mode ramp.
const BAR_COLORS = ["#2f93c9", "#4fd1ff", "#6fdaff", "#8fe3ff", "#b8edff"];

const truncate = (str, max = 18) => (str && str.length > max ? `${str.slice(0, max)}…` : str || "");

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <div className="dash-panel rounded-lg px-3 py-2 text-xs">
      <p className="max-w-48 truncate font-medium text-white">{item.title}</p>
      <p className="text-white/50">{item.views} views</p>
    </div>
  );
}

export default function TopArticles({ articles, loading, reduced }) {
  const data = articles.map((a) => ({ id: a._id, title: a.title, slug: a.slug, views: a.views || 0, likes: a.likes || 0 }));

  return (
    <motion.div
      variants={cardVariants}
      className="dash-panel rounded-2xl p-5"
    >
      <h2 className="text-sm font-semibold text-white">Top articles by views</h2>
      <p className="text-xs text-white/40">Highest-viewed published content</p>

      {loading ? (
        <div className="mt-4 space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-8 w-full animate-pulse rounded bg-white/5" />
          ))}
        </div>
      ) : data.length === 0 ? (
        <p className="mt-6 text-center text-sm text-white/30">No articles yet</p>
      ) : (
        <>
          <div className="mt-4 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="title"
                  width={110}
                  tickFormatter={(v) => truncate(v)}
                  tick={{ fontSize: 11, fill: "currentColor" }}
                  className="text-white/40"
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(79, 209, 255, 0.06)" }} />
                <Bar dataKey="views" radius={[0, 6, 6, 0]} isAnimationActive={!reduced} animationDuration={800}>
                  {data.map((entry, i) => (
                    <Cell key={entry.id} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <ul className="mt-3 divide-y divide-white/5">
            {data.map((a, i) => (
              <li key={a.id}>
                <Link
                  to={`/articles/${a.slug}`}
                  className="flex items-center gap-3 py-2 text-sm text-white/70 transition-colors duration-150 hover:text-glow"
                >
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-[11px] font-semibold text-white/50">
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1 truncate">{a.title}</span>
                  <span className="flex shrink-0 items-center gap-1 text-xs text-white/35">
                    <Eye className="size-3.5" />
                    {a.views}
                  </span>
                  <span className="flex shrink-0 items-center gap-1 text-xs text-white/35">
                    <Heart className="size-3.5" />
                    {a.likes}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </motion.div>
  );
}
