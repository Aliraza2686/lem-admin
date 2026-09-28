export const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // mirrors the backend image upload limit
export const TITLE_MAX = 200;
export const DESCRIPTION_MAX = 1000;

export const ACCEPTED_IMAGES = { "image/*": [] };

export const formatBytes = (bytes) => {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB"];
  const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  return `${(bytes / 1024 ** i).toFixed(i ? 1 : 0)} ${units[i]}`;
};

export const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }) : "";

// Small auto-format rendition for admin thumbnails; leaves non-Cloudinary URLs untouched.
export const thumbUrl = (url = "", width = 600) =>
  /\/image\/upload\/v\d+\//.test(url) ? url.replace("/image/upload/", `/image/upload/f_auto,q_auto,w_${width}/`) : url;

export const validateGalleryItem = (values, { isEdit }) => {
  const errors = {};
  const title = values.title?.trim() || "";
  if (!title) errors.title = "Give the image a title.";
  else if (title.length > TITLE_MAX) errors.title = `Keep the title under ${TITLE_MAX} characters.`;
  if ((values.description || "").length > DESCRIPTION_MAX)
    errors.description = `Keep the description under ${DESCRIPTION_MAX} characters.`;
  if (!isEdit && !values.image) errors.image = "Upload an image for the gallery.";
  return errors;
};

// Payload for PATCH /gallery/reorder: only entries whose position actually changed.
export const reorderPayload = (ordered) =>
  ordered.map((item, index) => ({ id: item._id, displayOrder: index, prev: item.displayOrder }))
    .filter((e) => e.prev !== e.displayOrder)
    .map(({ id, displayOrder }) => ({ id, displayOrder }));
