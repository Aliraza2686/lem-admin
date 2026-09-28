import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Trash2 } from "lucide-react";
import { useEffect } from "react";
import { useReducedMotion } from "../../../hooks/useReducedMotion";
import { thumbUrl } from "../galleryUtils";

/** `sharedAsset` = another gallery entry uses the same Cloudinary image, so the server keeps it. */
export default function DeleteGalleryDialog({ target, sharedAsset, loading, onCancel, onConfirm }) {
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!target) return;
    const onKey = (e) => e.key === "Escape" && !loading && onCancel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [target, loading, onCancel]);

  return (
    <AnimatePresence>
      {target && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center p-4">
          <motion.div
            className="absolute inset-0 bg-primary-deep/55 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !loading && onCancel()}
          />
          <motion.div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="del-gallery-title"
            className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-glass-lg"
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={reduced ? { duration: 0.01 } : { type: "spring", stiffness: 360, damping: 28 }}
          >
            <div className="relative flex flex-col items-center px-6 pb-6 pt-8 text-center">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-red-50 to-transparent" />
              <motion.div
                initial={reduced ? false : { scale: 0.6, rotate: -12 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 14, delay: 0.05 }}
                className="relative mb-4 flex size-14 items-center justify-center rounded-2xl bg-red-600 text-white shadow-[0_12px_24px_-8px_rgba(220,38,38,0.55)]"
              >
                <Trash2 className="size-6" />
              </motion.div>
              <h2 id="del-gallery-title" className="relative text-lg font-semibold text-gray-900">Delete this image?</h2>
              <p className="relative mt-1.5 text-sm text-gray-500">
                {sharedAsset
                  ? "It disappears from the public Gallery immediately. The image file is kept on Cloudinary because another gallery entry still uses it."
                  : "It disappears from the public Gallery immediately, and the image is permanently removed from Cloudinary."}
              </p>

              <div className="relative mt-5 flex w-full items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50/70 p-3 text-left">
                <div className="size-12 shrink-0 overflow-hidden rounded-xl bg-white ring-1 ring-gray-200">
                  <img src={thumbUrl(target.imageUrl, 160)} alt="" className="h-full w-full object-cover" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-gray-900">{target.title}</p>
                  <p className="text-xs text-gray-500">Position #{(target.position ?? 0) + 1}</p>
                </div>
              </div>
            </div>
            <div className="flex gap-2 border-t border-gray-100 bg-gray-50/60 px-6 py-4">
              <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                autoFocus
                className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
              >
                Keep it
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={loading}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-70"
              >
                {loading ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                {loading ? "Deleting…" : "Delete permanently"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
