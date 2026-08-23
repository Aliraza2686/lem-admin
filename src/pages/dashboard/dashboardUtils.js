// Pure helpers for the dashboard widgets. Kept dependency-free and testable —
// no fetching, no React — because /visitors has no stats/aggregation endpoint
// (see src/api/visitors.js) and this is where that client-side bucketing lives.

export const RANGES = {
  "24h": { label: "24h", buckets: 24, windowMs: 24 * 60 * 60 * 1000, unit: "hour" },
  "7d": { label: "7d", buckets: 7, windowMs: 7 * 24 * 60 * 60 * 1000, unit: "day" },
  "30d": { label: "30d", buckets: 30, windowMs: 30 * 24 * 60 * 60 * 1000, unit: "day" },
};

const formatBucketLabel = (timestamp, unit) => {
  const d = new Date(timestamp);
  return unit === "hour"
    ? d.toLocaleTimeString(undefined, { hour: "numeric" })
    : d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

// Buckets visitor records into `range.buckets` equal-width slots ending now.
export const bucketVisitors = (visitors, rangeKey, now = Date.now()) => {
  const range = RANGES[rangeKey] || RANGES["7d"];
  const bucketMs = range.windowMs / range.buckets;
  const start = now - range.windowMs;

  const buckets = Array.from({ length: range.buckets }, (_, i) => {
    const timestamp = start + i * bucketMs;
    return { timestamp, label: formatBucketLabel(timestamp, range.unit), count: 0 };
  });

  for (const v of visitors) {
    const t = new Date(v.createdAt).getTime();
    if (Number.isNaN(t) || t < start || t > now) continue;
    const idx = Math.min(range.buckets - 1, Math.floor((t - start) / bucketMs));
    buckets[idx].count += 1;
  }

  return buckets;
};

// Total visits in the current window vs. the equal-length window before it.
export const computePeriodChange = (visitors, rangeKey, now = Date.now()) => {
  const range = RANGES[rangeKey] || RANGES["7d"];
  const currentStart = now - range.windowMs;
  const previousStart = now - 2 * range.windowMs;

  let current = 0;
  let previous = 0;
  for (const v of visitors) {
    const t = new Date(v.createdAt).getTime();
    if (Number.isNaN(t)) continue;
    if (t >= currentStart && t <= now) current += 1;
    else if (t >= previousStart && t < currentStart) previous += 1;
  }

  const percentChange = previous === 0 ? (current > 0 ? 100 : 0) : ((current - previous) / previous) * 100;
  return { current, previous, percentChange };
};

// Buckets whose count is well above the window average — a cheap stand-in for
// anomaly detection given there's no server-side stats to draw on.
export const detectSpikes = (buckets, thresholdMultiplier = 1.75, minCount = 3) => {
  if (buckets.length === 0) return [];
  const avg = buckets.reduce((sum, b) => sum + b.count, 0) / buckets.length;
  if (avg === 0) return [];
  return buckets.filter((b) => b.count >= minCount && b.count >= avg * thresholdMultiplier);
};

export const formatCompactNumber = (n) =>
  new Intl.NumberFormat(undefined, { notation: "compact", maximumFractionDigits: 1 }).format(
    Number.isFinite(n) ? n : 0
  );

export const formatPercent = (n) => `${n > 0 ? "+" : ""}${Number.isFinite(n) ? n.toFixed(1) : "0.0"}%`;

// Groups products by category (real field on the Product model) for the
// product-stats breakdown — no sales/inventory numbers exist server-side.
export const categoryBreakdown = (products) => {
  const counts = new Map();
  for (const p of products) {
    const key = p.category || "Uncategorized";
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return [...counts.entries()]
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);
};

export const recentlyUpdated = (items, dateField = "updatedAt", limit = 5) =>
  [...items]
    .sort((a, b) => new Date(b[dateField] || 0) - new Date(a[dateField] || 0))
    .slice(0, limit);
