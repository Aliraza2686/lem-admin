import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, Save, RotateCcw, Info } from "lucide-react";
import FormField, { inputClass, errorInputClass } from "./FormField";
import ArrayField from "./ArrayField";
import VariantFieldGroup from "./VariantFieldGroup";
import LabReportsFieldGroup from "./LabReportsFieldGroup";
import { validateProduct, isValid } from "./validation";
import { useAutosaveDraft, loadDraft, clearDraft } from "./useAutosaveDraft";
import { createProduct, updateProduct, uploadVariantImages } from "../../../api/products";
import { useToast } from "../../../components/ui/toast/ToastProvider";
import { slugify, slugifyLive } from "../productUtils";
import { cn } from "../../../utillls/common";
import { useGlowPulse } from "../../../hooks/useGlowPulse";

const EMPTY = {
  id: "",
  name: "",
  category: "",
  origin: "",
  desc: "",
  heroNote: "",
  applications: [],
  packaging: [],
  variants: [],
  labReports: [],
};

const stripImageClientFields = (images = []) =>
  images
    .filter((img) => !img._pending && !img._uploading)
    .map(({ src, publicId, is_video }) => ({ src, publicId, is_video }));

export default function ProductForm({ mode, initialProduct }) {
  const navigate = useNavigate();
  const toast = useToast();
  const isEdit = mode === "edit";
  const draftId = isEdit ? initialProduct.id : "new";

  const [values, setValues] = useState(() => (isEdit ? { ...EMPTY, ...initialProduct } : { ...EMPTY }));
  const [effectiveId, setEffectiveId] = useState(isEdit ? initialProduct.id : null);
  const [touched, setTouched] = useState(false);
  const [blurred, setBlurred] = useState(() => new Set());
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [draftBanner, setDraftBanner] = useState(null);

  const markBlurred = (name) => setBlurred((prev) => new Set(prev).add(name));
  const shown = (name) => (blurred.has(name) || attemptedSubmit ? errors[name] : undefined);

  useEffect(() => {
    const draft = loadDraft(draftId);
    if (draft?.values) {
      const hasContent = draft.values.name || draft.values.desc || (draft.values.variants || []).length;
      if (hasContent) setDraftBanner(draft);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useAutosaveDraft(draftId, values, touched && !submitting);

  const errors = useMemo(() => validateProduct(values), [values]);
  const valid = isValid(errors);

  const anyUploading = values.variants.some((v) => (v.images || []).some((img) => img._uploading));
  const readyToSave = valid && touched && !submitting && !anyUploading;
  const glowRef = useGlowPulse(readyToSave);

  const set = (patch) => {
    setTouched(true);
    setValues((prev) => ({ ...prev, ...patch }));
  };

  // True functional update against whatever `prev.variants` is at flush time —
  // required because an in-flight image upload's success handler fires after
  // an arbitrary number of re-renders and must not clobber edits made meanwhile
  // (a snapshot-based "read variants, replace whole array" approach previously
  // dropped uploaded images whenever it resolved after a later render).
  const updateVariantAt = (index, updater) => {
    setTouched(true);
    setValues((prev) => {
      const variants = [...prev.variants];
      variants[index] =
        typeof updater === "function" ? updater(variants[index]) : { ...variants[index], ...updater };
      return { ...prev, variants };
    });
  };

  const restoreDraft = () => {
    setValues((prev) => ({ ...prev, ...draftBanner.values }));
    setTouched(true);
    setDraftBanner(null);
  };
  const discardDraft = () => {
    clearDraft(draftId);
    setDraftBanner(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched(true);
    setAttemptedSubmit(true);
    if (!valid) {
      toast.error("Please fix the highlighted fields before saving.", "Validation failed");
      return;
    }
    setSubmitting(true);
    setServerError(null);

    const basePayload = {
      id: values.id.trim(),
      name: values.name.trim(),
      category: values.category?.trim() || "",
      origin: values.origin?.trim() || "",
      desc: values.desc || "",
      heroNote: values.heroNote || "",
      applications: (values.applications || []).filter(Boolean),
      packaging: (values.packaging || []).filter(Boolean),
      labReports: (values.labReports || []).filter((r) => r.name || r.file || r.size),
    };

    if (!isEdit) {
      const payload = {
        ...basePayload,
        variants: values.variants.map((v) => ({ ...stripVariantMeta(v), images: [] })),
      };
      const res = await createProduct(payload);
      if (!res.success) {
        setSubmitting(false);
        setServerError(res.message);
        applyServerFieldErrors(res.error);
        toast.error(res.message, "Could not create product");
        return;
      }

      const created = res.data.product;
      setEffectiveId(created.id);

      let uploadFailures = 0;
      for (const variant of values.variants) {
        const pendingFiles = (variant.images || []).filter((img) => img._pending && img._file).map((img) => img._file);
        if (!pendingFiles.length) continue;
        const uploadRes = await uploadVariantImages(created.id, variant.key, pendingFiles);
        if (!uploadRes.success) uploadFailures++;
      }

      clearDraft(draftId);
      if (uploadFailures) {
        toast.error(`Product created, but images for ${uploadFailures} variant(s) failed to upload. Re-add them on the edit page.`, "Partial success");
      } else {
        toast.success("Product created successfully.", "Saved");
      }
      navigate(`/products`);
    } else {
      const payload = {
        ...basePayload,
        variants: values.variants.map((v) => ({ ...stripVariantMeta(v), images: stripImageClientFields(v.images) })),
      };
      const res = await updateProduct(effectiveId, payload);
      setSubmitting(false);
      if (!res.success) {
        setServerError(res.message);
        applyServerFieldErrors(res.error);
        toast.error(res.message, "Could not save changes");
        return;
      }
      clearDraft(draftId);
      toast.success("Product updated successfully.", "Saved");
      navigate(`/products/${res.data.product.id}`);
    }
  };

  const applyServerFieldErrors = (errorPayload) => {
    // express-validator shape: { errors: [{ path, msg }] }
    if (errorPayload?.errors?.length) {
      const msgs = errorPayload.errors.map((e) => e.msg).join(" ");
      setServerError(msgs);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 pb-24">
      {draftBanner && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="flex items-center justify-between gap-3 overflow-hidden rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
        >
          <div className="flex items-center gap-2">
            <Info className="size-4 shrink-0" />
            You have an unsaved draft from {new Date(draftBanner.savedAt).toLocaleString()}.
          </div>
          <div className="flex shrink-0 gap-2">
            <button type="button" onClick={restoreDraft} className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700">
              Restore
            </button>
            <button type="button" onClick={discardDraft} className="rounded-lg px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-100">
              Discard
            </button>
          </div>
        </motion.div>
      )}

      {serverError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{serverError}</div>
      )}

      <Section title="Basics">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Product ID (slug)" required error={shown("id")} hint="Lowercase letters, numbers, hyphens — used in URLs and the image upload route">
            <input
              value={values.id}
              onChange={(e) => set({ id: slugifyLive(e.target.value) })}
              onBlur={() => {
                set({ id: slugify(values.id) });
                markBlurred("id");
              }}
              disabled={isEdit}
              className={cn(inputClass, shown("id") && errorInputClass, isEdit && "cursor-not-allowed bg-gray-50 text-gray-400")}
              placeholder="e.g. himalayan-salt"
            />
          </FormField>
          <FormField label="Name" required error={shown("name")}>
            <input
              value={values.name}
              onChange={(e) => set({ name: e.target.value })}
              onBlur={() => markBlurred("name")}
              className={cn(inputClass, shown("name") && errorInputClass)}
              placeholder="e.g. Himalayan Salt"
            />
          </FormField>
          <FormField label="Category" error={shown("category")} hint="Free text — reuse an existing category for consistent filtering">
            <input
              value={values.category}
              onChange={(e) => set({ category: e.target.value })}
              onBlur={() => markBlurred("category")}
              className={cn(inputClass, shown("category") && errorInputClass)}
              placeholder="e.g. Natural Mineral"
              list="category-suggestions"
            />
          </FormField>
          <FormField label="Origin" error={shown("origin")}>
            <input
              value={values.origin}
              onChange={(e) => set({ origin: e.target.value })}
              onBlur={() => markBlurred("origin")}
              className={cn(inputClass, shown("origin") && errorInputClass)}
              placeholder="e.g. Balochistan, Pakistan"
            />
          </FormField>
          <FormField label="Hero note" error={shown("heroNote")} className="sm:col-span-2" hint="Short highlight shown prominently on the storefront">
            <input
              value={values.heroNote}
              onChange={(e) => set({ heroNote: e.target.value })}
              onBlur={() => markBlurred("heroNote")}
              className={cn(inputClass, shown("heroNote") && errorInputClass)}
              maxLength={300}
            />
          </FormField>
          <FormField label="Description" error={shown("desc")} className="sm:col-span-2">
            <textarea
              value={values.desc}
              onChange={(e) => set({ desc: e.target.value })}
              onBlur={() => markBlurred("desc")}
              rows={4}
              maxLength={5000}
              className={cn(inputClass, shown("desc") && errorInputClass)}
            />
          </FormField>
        </div>
      </Section>

      <Section title="Applications & Packaging">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <ArrayField label="Applications" values={values.applications} onChange={(v) => set({ applications: v })} placeholder="e.g. Cement Manufacturing" />
          <ArrayField label="Packaging" values={values.packaging} onChange={(v) => set({ packaging: v })} placeholder="e.g. Jumbo bags (1 ton)" />
        </div>
      </Section>

      <Section title="Variants" subtitle="Each variant needs a unique key. Images upload through the backend's Cloudinary-backed endpoint.">
        {attemptedSubmit && errors.variantsDuplicate && (
          <p className="mb-3 text-xs font-medium text-red-500">{errors.variantsDuplicate}</p>
        )}
        <VariantFieldGroup
          productId={effectiveId}
          variants={values.variants}
          onChange={(v) => set({ variants: v })}
          onUpdateVariant={updateVariantAt}
          errors={attemptedSubmit ? errors.variants || [] : []}
        />
      </Section>

      <Section title="Lab Reports" subtitle="Manual reference entries — the API has no file-upload endpoint for these, only for variant images.">
        <LabReportsFieldGroup reports={values.labReports} onChange={(v) => set({ labReports: v })} />
      </Section>

      <div className="glass-panel fixed inset-x-0 bottom-0 z-30 rounded-none border-x-0 border-b-0 lg:pl-72">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-6 py-3">
          <span className="text-xs text-gray-400">
            {anyUploading ? "Waiting for image uploads to finish..." : touched ? "Draft autosaved locally" : "No changes yet"}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition duration-150 hover:bg-gray-50"
            >
              <RotateCcw className="size-4" />
              Cancel
            </button>
            <button
              ref={glowRef}
              type="submit"
              disabled={submitting || anyUploading || !valid}
              style={readyToSave ? { boxShadow: "0 0 0 1px rgba(79,209,255,0.3), 0 0 calc(4px + 14px * var(--glow-opacity, 0)) 0 rgba(79,209,255,0.35)" } : undefined}
              className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white transition duration-150 hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-40"
            >
              {submitting ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              {submitting ? "Saving..." : isEdit ? "Save changes" : "Create product"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

function stripVariantMeta(v) {
  const { key, label, swatch, desc, purity, quality, highlights } = v;
  return { key, label, swatch, desc, purity, quality, highlights: (highlights || []).filter(Boolean) };
}

function Section({ title, subtitle, children }) {
  return (
    <div className="glass-panel rounded-2xl p-5">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
        {subtitle && <p className="mt-0.5 text-xs text-gray-400">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
