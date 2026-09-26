import { useEffect, useMemo } from "react";
import { useDropzone } from "react-dropzone";
import { AnimatePresence, motion } from "framer-motion";
import { FileText, ImageIcon, RefreshCw, UploadCloud, X } from "lucide-react";
import { cn } from "../../../utillls/common";
import { ACCEPTED_FILES, MAX_FILE_BYTES, formatBytes, storedFilenameFor, formatLabelFor } from "../certificationUtils";

const rejectionMessage = (rejection) => {
  const code = rejection?.errors?.[0]?.code;
  if (code === "file-too-large") return `That file is ${formatBytes(rejection.file.size)} — the limit is 10 MB.`;
  if (code === "file-invalid-type") return "Only images, PDFs, or Word documents can be uploaded.";
  if (code === "too-many-files") return "Drop a single file.";
  return rejection?.errors?.[0]?.message || "That file can't be used.";
};

function DocTile({ label }) {
  return (
    <div className="relative flex h-16 w-13 shrink-0 items-end justify-center rounded-md border border-gray-200 bg-white pb-2 shadow-glass-sm">
      <span className="absolute right-0 top-0 size-3.5 rounded-bl-md border-b border-l border-gray-200 bg-gray-50" />
      <FileText className="absolute top-3 size-5 text-primary/40" />
      <span className="rounded bg-primary px-1.5 py-px text-[9px] font-bold tracking-wider text-accent-light">{label}</span>
    </div>
  );
}

/**
 * Drag-and-drop single-file picker. `value` is a newly chosen File; `existing` is the
 * saved certification (edit mode) shown until a replacement is picked.
 */
export default function FileDropzone({ value, existing, onChange, onReject, error, disabled }) {
  const previewUrl = useMemo(
    () => (value && value.type.startsWith("image/") ? URL.createObjectURL(value) : null),
    [value]
  );
  // Revoke on a delay: the preview <img> keeps rendering through the panel's exit animation.
  useEffect(() => () => previewUrl && setTimeout(() => URL.revokeObjectURL(previewUrl), 1000), [previewUrl]);

  const { getRootProps, getInputProps, isDragActive, isDragReject, open } = useDropzone({
    accept: ACCEPTED_FILES,
    maxSize: MAX_FILE_BYTES,
    multiple: false,
    disabled,
    noClick: !!(value || existing),
    onDropAccepted: (files) => onChange(files[0]),
    onDropRejected: (rejections) => onReject(rejectionMessage(rejections[0])),
  });

  const hasSelection = !!(value || existing);
  const isImage = value ? value.type.startsWith("image/") : existing?.fileType === "image";
  const imgSrc = value ? previewUrl : existing?.fileUrl;
  const docLabel = value ? (value.name.split(".").pop() || "DOC").toUpperCase().slice(0, 4) : formatLabelFor(existing || {}).slice(0, 4);
  const name = value ? value.name : existing ? storedFilenameFor(existing) : "";

  return (
    <div>
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
        <input {...getInputProps()} aria-label="Certification file" />

        <AnimatePresence mode="wait" initial={false}>
          {!hasSelection ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center px-6 py-10 text-center"
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
                {isDragReject ? "That file type isn't supported" : isDragActive ? "Drop to upload" : "Drag & drop the certificate here"}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                or <span className="font-semibold text-primary underline decoration-primary/30 underline-offset-2">browse files</span>
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-1.5">
                {["JPG / PNG / WEBP", "PDF", "DOC / DOCX", "Max 10 MB"].map((t) => (
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
              {isImage && imgSrc ? (
                <div className="relative flex h-52 items-center justify-center bg-[radial-gradient(circle_at_1px_1px,rgba(13,31,53,0.08)_1px,transparent_0)] bg-[length:16px_16px] p-4">
                  <img src={imgSrc} alt="" className="max-h-full max-w-full rounded-lg object-contain shadow-glass-md ring-1 ring-black/5" />
                  {isDragActive && (
                    <div className="absolute inset-0 flex items-center justify-center bg-primary/70 text-sm font-semibold text-white backdrop-blur-sm">
                      Drop to replace
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center bg-gradient-to-br from-gray-50 to-white px-6 py-8">
                  <DocTile label={docLabel} />
                </div>
              )}

              <div className="flex items-center gap-3 border-t border-gray-100 bg-white px-4 py-3">
                <div
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-lg",
                    isImage ? "bg-sky-50 text-sky-600" : "bg-amber-50 text-amber-700"
                  )}
                >
                  {isImage ? <ImageIcon className="size-4.5" /> : <FileText className="size-4.5" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900" title={name}>{name}</p>
                  <p className="text-xs text-gray-500">
                    {value ? `${formatBytes(value.size)} · ready to upload` : "Current file"}
                  </p>
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
                    title={existing ? "Keep current file" : "Remove file"}
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
    </div>
  );
}
