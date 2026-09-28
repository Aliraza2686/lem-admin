import { useEffect, useMemo } from "react";
import { useDropzone } from "react-dropzone";
import { AnimatePresence, motion } from "framer-motion";
import { ImageIcon, RefreshCw, UploadCloud, X } from "lucide-react";
import { cn } from "../../../utillls/common";
import { ACCEPTED_IMAGES, MAX_IMAGE_BYTES, formatBytes } from "../galleryUtils";

const rejectionMessage = (rejection) => {
  const code = rejection?.errors?.[0]?.code;
  if (code === "file-too-large") return `That image is ${formatBytes(rejection.file.size)} — the limit is 8 MB.`;
  if (code === "file-invalid-type") return "Only image files can be added to the gallery.";
  if (code === "too-many-files") return "Drop a single image.";
  return rejection?.errors?.[0]?.message || "That file can't be used.";
};

/**
 * Drag-and-drop single-image picker with live preview. `value` is a newly chosen File;
 * `existing` is the saved gallery item (edit mode) shown until a replacement is picked.
 */
export default function ImageDropzone({ value, existing, onChange, onReject, error, disabled }) {
  const previewUrl = useMemo(() => (value ? URL.createObjectURL(value) : null), [value]);
  // Revoke on a delay: the preview <img> keeps rendering through the panel's exit animation.
  useEffect(() => () => previewUrl && setTimeout(() => URL.revokeObjectURL(previewUrl), 1000), [previewUrl]);

  const { getRootProps, getInputProps, isDragActive, isDragReject, open } = useDropzone({
    accept: ACCEPTED_IMAGES,
    maxSize: MAX_IMAGE_BYTES,
    multiple: false,
    disabled,
    noClick: !!(value || existing),
    onDropAccepted: (files) => onChange(files[0]),
    onDropRejected: (rejections) => onReject(rejectionMessage(rejections[0])),
  });

  const hasSelection = !!(value || existing);
  const imgSrc = value ? previewUrl : existing?.imageUrl;
  const name = value ? value.name : existing ? existing.imagePublicId?.split("/").pop() : "";

  return (
    <div
      {...getRootProps()}
      className={cn(
        "group relative overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-200 outline-none",
        "focus-visible:border-glow focus-visible:shadow-glow-sm",
        !hasSelection && "cursor-pointer",
        isDragReject
          ? "border-red-400 bg-red-50/70"
          : isDragActive
            ? "scale-[1.01] border-glow bg-glow/5 shadow-glow-md"
            : error
              ? "border-red-300 bg-red-50/30"
              : "border-gray-200 bg-gray-50/60 hover:border-primary/30 hover:bg-white",
        disabled && "pointer-events-none opacity-60"
      )}
    >
      <input {...getInputProps()} aria-label="Gallery image" />

      <AnimatePresence mode="wait" initial={false}>
        {!hasSelection ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center px-6 py-12 text-center"
          >
            <motion.div
              animate={isDragActive ? { y: -6, scale: 1.08 } : { y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className={cn(
                "mb-4 flex size-14 items-center justify-center rounded-2xl shadow-glass-md transition-colors",
                isDragActive ? "bg-primary text-glow" : "bg-white text-primary"
              )}
            >
              <UploadCloud className="size-7" strokeWidth={1.6} />
            </motion.div>
            <p className="text-sm font-semibold text-gray-900">
              {isDragReject ? "That file type isn't supported" : isDragActive ? "Drop to upload" : "Drag & drop a photo here"}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              or <span className="font-semibold text-primary underline decoration-primary/30 underline-offset-2">browse files</span>
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-1.5">
              {["JPG / PNG / WEBP", "Max 8 MB"].map((t) => (
                <span key={t} className="rounded-full border border-gray-200 bg-white px-2 py-0.5 text-[10px] font-medium text-gray-500">
                  {t}
                </span>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key={name}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <div className="relative flex h-60 items-center justify-center bg-[radial-gradient(circle_at_1px_1px,rgba(13,31,53,0.08)_1px,transparent_0)] bg-[length:16px_16px] p-4">
              {imgSrc && (
                <img src={imgSrc} alt="" className="max-h-full max-w-full rounded-lg object-contain shadow-glass-md ring-1 ring-black/5" />
              )}
              {isDragActive && (
                <div className="absolute inset-0 flex items-center justify-center bg-primary/70 text-sm font-semibold text-white backdrop-blur-sm">
                  Drop to replace
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 border-t border-gray-100 bg-white px-4 py-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
                <ImageIcon className="size-4.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900" title={name}>{name}</p>
                <p className="text-xs text-gray-500">{value ? `${formatBytes(value.size)} · ready to upload` : "Current image"}</p>
              </div>
              <button
                type="button"
                onClick={open}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-700 transition hover:border-primary/30 hover:bg-gray-50"
              >
                <RefreshCw className="size-3.5" /> Replace
              </button>
              {value && (
                <button
                  type="button"
                  onClick={() => onChange(null)}
                  title={existing ? "Keep current image" : "Remove image"}
                  aria-label={existing ? "Keep current image" : "Remove image"}
                  className="rounded-lg p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
