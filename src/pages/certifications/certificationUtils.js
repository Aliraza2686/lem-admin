export const MAX_FILE_BYTES = 10 * 1024 * 1024; // mirrors the backend multer limit
export const TITLE_MAX = 200;
export const DESCRIPTION_MAX = 1000;

// Mirrors lem-backend middlewheres/certificationUpload.js
export const ACCEPTED_FILES = {
  "image/*": [],
  "application/pdf": [".pdf"],
  "application/msword": [".doc"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
};

// Documents are stored as extensionless Cloudinary "raw" assets with the format kept
// as a "-pdf"/"-docx" token in the name (see lem-backend certificationController).
export const fileExtensionFor = (url = "") => {
  const last = url.split("?")[0].split("/").pop() || "";
  const token = last.match(/-([a-z0-9]{2,5})_[a-z0-9]+$/i);
  if (token) return token[1].toLowerCase();
  const ext = last.match(/\.([a-z0-9]{2,5})$/i);
  return ext ? ext[1].toLowerCase() : "";
};

export const formatLabelFor = (cert) =>
  cert.fileType === "image" ? "Image" : fileExtensionFor(cert.fileUrl).toUpperCase() || "Document";

// Human-readable stored filename, e.g. ".../ISO_9001-pdf_ab12cd" -> "ISO 9001.pdf"
export const storedFilenameFor = (cert) => {
  const last = (cert.filePublicId || "").split("/").pop() || "";
  const m = last.match(/^(.*)-([a-z0-9]{2,5})_[a-z0-9]+$/i);
  if (m) return `${m[1].replace(/_/g, " ")}.${m[2].toLowerCase()}`;
  return last || "file";
};

export const formatBytes = (bytes) => {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB"];
  const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  return `${(bytes / 1024 ** i).toFixed(i ? 1 : 0)} ${units[i]}`;
};

export const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }) : "";

export const validateCertification = (values, { isEdit }) => {
  const errors = {};
  const title = values.title?.trim() || "";
  if (!title) errors.title = "Give the certification a title.";
  else if (title.length > TITLE_MAX) errors.title = `Keep the title under ${TITLE_MAX} characters.`;
  if ((values.description || "").length > DESCRIPTION_MAX)
    errors.description = `Keep the description under ${DESCRIPTION_MAX} characters.`;
  if (!isEdit && !values.file) errors.file = "Upload the certificate image or document.";
  return errors;
};
