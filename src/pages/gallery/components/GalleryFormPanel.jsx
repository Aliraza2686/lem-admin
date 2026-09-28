import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Images, Loader2, X } from "lucide-react";
import { cn } from "../../../utillls/common";
import { useReducedMotion } from "../../../hooks/useReducedMotion";
import { useToast } from "../../../components/ui/toast/ToastProvider";
import { createGalleryItem, updateGalleryItem } from "../../../api/gallery";
import { DESCRIPTION_MAX, TITLE_MAX, validateGalleryItem } from "../galleryUtils";
import ImageDropzone from "./ImageDropzone";

const EMPTY = { title: "", description: "", image: null };

function FieldError({ id, children }) {
  return (
    <AnimatePresence initial={false}>
      {children && (
        <motion.p
          id={id}
          initial={{ opacity: 0, height: 0, y: -4 }}
          animate={{ opacity: 1, height: "auto", y: 0 }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-600"
        >
          <AlertCircle className="size-3.5 shrink-0" /> {children}
        </motion.p>
      )}
    </AnimatePresence>
  );
}

function Counter({ value, max }) {
  const near = value > max * 0.9;
  return (
    <span className={cn("text-[11px] tabular-nums", value > max ? "text-red-600" : near ? "text-amber-600" : "text-gray-400")}>
      {value}/{max}
    </span>
  );
}

/** Slide-over create/edit panel. `item` = null for create, a gallery record for edit. */
export default function GalleryFormPanel({ open, item, onClose, onSaved }) {
  const toast = useToast();
  const reduced = useReducedMotion();
  const isEdit = !!item;
  const titleRef = useRef(null);

  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!open) return;
    setValues(item ? { title: item.title, description: item.description || "", image: null } : EMPTY);
    setErrors({});
    setTouched({});
    setProgress(0);
    setSubmitting(false);
    const t = setTimeout(() => titleRef.current?.focus(), 250);
    return () => clearTimeout(t);
  }, [open, item]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && !submitting && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, submitting, onClose]);

  const set = (field, val) => {
    const next = { ...values, [field]: val };
    setValues(next);
    // Re-validate live once a field has been touched (or after a submit attempt).
    if (touched[field] || touched._submit) setErrors(validateGalleryItem(next, { isEdit }));
  };

  const blur = (field) => {
    setTouched((t) => ({ ...t, [field]: true }));
    setErrors(validateGalleryItem(values, { isEdit }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = validateGalleryItem(values, { isEdit });
    setTouched({ title: true, description: true, image: true, _submit: true });
    setErrors(found);
    if (Object.keys(found).length) return;

    setSubmitting(true);
    setProgress(0);
    const res = isEdit ? await updateGalleryItem(item._id, values, setProgress) : await createGalleryItem(values, setProgress);
    setSubmitting(false);

    if (res.success) {
      toast.success(
        isEdit ? `"${res.data.item.title}" was updated.` : `"${res.data.item.title}" is now live in the gallery.`,
        isEdit ? "Gallery image updated" : "Added to gallery"
      );
      onSaved(res.data.item, { isEdit });
      onClose();
    } else {
      toast.error(res.message, isEdit ? "Update failed" : "Upload failed");
    }
  };

  const uploadingImage = submitting && !!values.image;
  const processing = uploadingImage && progress >= 100;
  const showErr = (f) => (touched[f] || touched._submit) && errors[f];

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[90]">
          <motion.div
            className="absolute inset-0 bg-primary-deep/50 backdrop-blur-[6px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0.01 : 0.25 }}
            onClick={() => !submitting && onClose()}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="gallery-panel-title"
            className="absolute inset-y-0 right-0 flex w-full max-w-xl flex-col bg-white shadow-[-24px_0_60px_-20px_rgba(5,18,35,0.35)] sm:rounded-l-3xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={reduced ? { duration: 0.01 } : { type: "spring", stiffness: 320, damping: 34 }}
          >
            {/* Header */}
            <div className="relative overflow-hidden border-b border-gray-100 px-6 py-5 sm:rounded-tl-3xl">
              <div className="pointer-events-none absolute -right-16 -top-20 size-56 rounded-full bg-glow/10 blur-3xl" />
              <div className="pointer-events-none absolute -left-10 top-0 size-40 rounded-full bg-accent/10 blur-3xl" />
              <div className="relative flex items-start gap-4">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-deep text-accent-light shadow-glass-md">
                  <Images className="size-5.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent-dark">
                    {isEdit ? "Edit gallery image" : "New gallery image"}
                  </p>
                  <h2 id="gallery-panel-title" className="mt-0.5 truncate text-lg font-semibold text-gray-900">
                    {isEdit ? item.title : "Add a photograph"}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={submitting}
                  aria-label="Close"
                  className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-40"
                >
                  <X className="size-5" />
                </button>
              </div>
            </div>

            {/* Body */}
            <form id="gallery-form" onSubmit={handleSubmit} noValidate className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-800">
                    Image {!isEdit && <span className="text-red-500">*</span>}
                  </span>
                  <span className="text-[11px] text-gray-400">Opens full-size in the site viewer</span>
                </div>
                <ImageDropzone
                  value={values.image}
                  existing={item}
                  disabled={submitting}
                  error={showErr("image")}
                  onChange={(file) => {
                    set("image", file);
                    setTouched((t) => ({ ...t, image: true }));
                    if (file) setErrors((e2) => ({ ...e2, image: undefined }));
                  }}
                  onReject={(msg) => {
                    setTouched((t) => ({ ...t, image: true }));
                    setErrors((e2) => ({ ...e2, image: msg }));
                  }}
                />
                <FieldError id="gallery-image-err">{showErr("image")}</FieldError>
                {isEdit && values.image && (
                  <p className="mt-2 text-xs text-gray-500">The current image will be replaced and removed from Cloudinary after saving.</p>
                )}
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label htmlFor="gallery-title" className="text-sm font-medium text-gray-800">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <Counter value={values.title.length} max={TITLE_MAX} />
                </div>
                <input
                  id="gallery-title"
                  ref={titleRef}
                  value={values.title}
                  onChange={(e) => set("title", e.target.value)}
                  onBlur={() => blur("title")}
                  disabled={submitting}
                  placeholder="e.g. Pink Salt Lumps at Khewra"
                  aria-invalid={!!showErr("title")}
                  aria-describedby="gallery-title-err"
                  className={cn(
                    "w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-glass-sm outline-none transition-glow placeholder:text-gray-400",
                    showErr("title")
                      ? "border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-100"
                      : "border-gray-200 focus:border-glow focus:shadow-glow-sm"
                  )}
                />
                <FieldError id="gallery-title-err">{showErr("title")}</FieldError>
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label htmlFor="gallery-desc" className="text-sm font-medium text-gray-800">
                    Description <span className="font-normal text-gray-400">(optional)</span>
                  </label>
                  <Counter value={values.description.length} max={DESCRIPTION_MAX} />
                </div>
                <textarea
                  id="gallery-desc"
                  rows={4}
                  value={values.description}
                  onChange={(e) => set("description", e.target.value)}
                  onBlur={() => blur("description")}
                  disabled={submitting}
                  placeholder="Where it was taken, the product or grade shown — a line or two for the viewer caption."
                  aria-invalid={!!showErr("description")}
                  aria-describedby="gallery-desc-err"
                  className={cn(
                    "w-full resize-none rounded-xl border bg-white px-3.5 py-2.5 text-sm leading-relaxed text-gray-900 shadow-glass-sm outline-none transition-glow placeholder:text-gray-400",
                    showErr("description")
                      ? "border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-100"
                      : "border-gray-200 focus:border-glow focus:shadow-glow-sm"
                  )}
                />
                <FieldError id="gallery-desc-err">{showErr("description")}</FieldError>
              </div>
            </form>

            {/* Footer */}
            <div className="border-t border-gray-100 bg-gray-50/60 px-6 py-4 sm:rounded-bl-3xl">
              <AnimatePresence>
                {uploadingImage && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mb-3">
                    <div className="mb-1.5 flex items-center justify-between text-xs">
                      <span className="font-medium text-gray-700">{processing ? "Storing on Cloudinary…" : "Uploading image…"}</span>
                      <span className="tabular-nums text-gray-500">{progress}%</span>
                    </div>
                    <div className="relative h-1.5 overflow-hidden rounded-full bg-gray-200">
                      <motion.div
                        className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary via-sky-500 to-glow"
                        animate={{ width: `${progress}%` }}
                        transition={{ ease: "easeOut", duration: 0.2 }}
                      />
                      {processing && (
                        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.2s_infinite] bg-gradient-to-r from-transparent via-white/70 to-transparent" />
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={submitting}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <motion.button
                  type="submit"
                  form="gallery-form"
                  disabled={submitting}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex min-w-40 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-glass-md transition hover:bg-primary-hover hover:shadow-glow-sm disabled:cursor-wait disabled:opacity-80"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" /> {isEdit ? "Saving…" : "Publishing…"}
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="size-4" /> {isEdit ? "Save changes" : "Add to gallery"}
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
