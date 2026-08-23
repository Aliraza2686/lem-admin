export const getCoverImage = (product) => {
  for (const variant of product.variants || []) {
    const img = (variant.images || [])[0];
    if (img?.src) return img.src;
  }
  return null;
};

export const getImageCount = (product) =>
  (product.variants || []).reduce((sum, v) => sum + (v.images?.length || 0), 0);

export const getVariantCount = (product) => (product.variants || []).length;

export const formatDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
};

export const slugify = (str) =>
  (str || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

// Used on every keystroke — unlike slugify(), never strips a trailing hyphen,
// otherwise a hyphen typed at the end of the string (always the case while typing)
// would be deleted before the next character lands. Final cleanup happens on blur.
export const slugifyLive = (str) =>
  (str || "").toLowerCase().replace(/[^a-z0-9-]+/g, "-");
