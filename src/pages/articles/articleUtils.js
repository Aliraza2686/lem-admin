export const STATUS_META = {
  draft: { label: "Draft", badge: "bg-gray-100 text-gray-600" },
  published: { label: "Published", badge: "bg-emerald-50 text-emerald-600" },
  archived: { label: "Archived", badge: "bg-amber-50 text-amber-600" },
};

export const formatDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
};

export const slugifyPreview = (str) =>
  (str || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/(^-|-$)/g, "");

const plainTextFromHtml = (html) => (html || "").replace(/<[^>]*>/g, " ");

export const estimateWordCount = (html) => {
  const text = plainTextFromHtml(html).trim();
  if (!text) return 0;
  return text.split(/\s+/).filter(Boolean).length;
};

export const estimateReadTime = (html) => Math.max(1, Math.ceil(estimateWordCount(html) / 200));

export const getAuthorName = (author) => {
  if (!author) return "Unknown";
  if (typeof author === "string") return author;
  return author.name || author.email || "Unknown";
};
