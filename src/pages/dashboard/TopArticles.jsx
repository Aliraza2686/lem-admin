import { motion } from "framer-motion";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Link } from "react-router-dom";
import { Eye, Heart } from "lucide-react";

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

const BAR_COLORS = ["#4f46e5", "#6366f1", "#818cf8", "#a5b4fc", "#c7d2fe"];

const truncate = (str, max = 18) => (str && str.length > max ? `${str.slice(0, max)}…` : str || "");

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs shadow-lg dark:border-gray-700 dark:bg-gray-900">
      <p className="max-w-48 truncate font-medium text-gray-900 dark:text-white">{item.title}</p>
      <p className="text-gray-500 dark:text-gray-400">{item.views} views</p>
    </div>
  );
}

export default function TopArticles({ articles, loading, reduced }) {
  const data = articles.map((a) => ({ id: a._id, title: a.title, slug: a.slug, views: a.views || 0, likes: a.likes || 0 }));

  return (
    <motion.div
      variants={cardVariants}
      className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900"
    >
      <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Top articles by views</h2>
      <p className="text-xs text-gray-500 dark:text-gray-400">Highest-viewed published content</p>

      {loading ? (
        <div className="mt-4 space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-8 w-full animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
          ))}
        </div>
      ) : data.length === 0 ? (
        <p className="mt-6 text-center text-sm text-gray-400">No articles yet</p>
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
                  className="text-gray-500"
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(79, 70, 229, 0.06)" }} />
                <Bar dataKey="views" radius={[0, 6, 6, 0]} isAnimationActive={!reduced} animationDuration={800}>
                  {data.map((entry, i) => (
                    <Cell key={entry.id} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <ul className="mt-3 divide-y divide-gray-100 dark:divide-gray-800">
            {data.map((a, i) => (
              <li key={a.id}>
                <Link
                  to={`/articles/${a.slug}`}
                  className="flex items-center gap-3 py-2 text-sm transition-colors hover:text-primary"
                >
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-gray-100 text-[11px] font-semibold text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-gray-700 dark:text-gray-300">{a.title}</span>
                  <span className="flex shrink-0 items-center gap-1 text-xs text-gray-400">
                    <Eye className="size-3.5" />
                    {a.views}
                  </span>
                  <span className="flex shrink-0 items-center gap-1 text-xs text-gray-400">
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
