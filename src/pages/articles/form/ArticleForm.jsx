import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, Save, RotateCcw, Info, Eye, Pencil } from "lucide-react";
import FormField, { inputClass, errorInputClass } from "../../products/form/FormField";
import { createArticle, updateArticle } from "../../../api/articles";
import { useToast } from "../../../components/ui/toast/ToastProvider";
import { validateArticle, isValid } from "./validation";
import { useAutosaveDraft, loadDraft, clearDraft } from "./useAutosaveDraft";
import { slugifyPreview, estimateWordCount, estimateReadTime, getAuthorName } from "../articleUtils";
import RichTextEditor from "./editor/RichTextEditor";
import TagsInput from "./TagsInput";
import CoverImageUpload from "./CoverImageUpload";
import GalleryUpload from "./GalleryUpload";
import SeoFields from "./SeoFields";
import ArticlePreview from "./ArticlePreview";
import PublishActions from "../components/PublishActions";
import { STATUS_META } from "../articleUtils";
import { cn } from "../../../utillls/common";
import { useGlowPulse } from "../../../hooks/useGlowPulse";

const EMPTY = {
  title: "",
  excerpt: "",
  content: "",
  category: "",
  status: "draft",
  isFeatured: false,
  tags: [],
  seo: { metaTitle: "", metaDescription: "", keywords: [] },
  coverImageFile: null,
  existingCoverImage: null,
  galleryFiles: [],
  existingGallery: [],
};

const toFormValues = (article) => ({
  title: article.title || "",
  excerpt: article.excerpt || "",
  content: article.content || "",
  category: article.category || "",
  status: article.status || "draft",
  isFeatured: !!article.isFeatured,
  tags: article.tags || [],
  seo: {
    metaTitle: article.seo?.metaTitle || "",
    metaDescription: article.seo?.metaDescription || "",
    keywords: article.seo?.keywords || [],
  },
  coverImageFile: null,
  existingCoverImage: article.coverImage?.url || null,
  galleryFiles: [],
  existingGallery: article.gallery || [],
  publishedAt: article.publishedAt,
  slug: article.slug,
});

export default function ArticleForm({ mode, initialArticle }) {
  const navigate = useNavigate();
  const toast = useToast();
  const isEdit = mode === "edit";
  const draftId = isEdit ? initialArticle._id : "new";

  const [values, setValues] = useState(() => (isEdit ? toFormValues(initialArticle) : { ...EMPTY }));
  const [article, setArticle] = useState(isEdit ? initialArticle : null);
  const [view, setView] = useState("edit"); // edit | preview
  const [touched, setTouched] = useState(false);
  const [blurred, setBlurred] = useState(() => new Set());
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [draftBanner, setDraftBanner] = useState(null);

  const author = JSON.parse(localStorage.getItem("user") || "null");

  const markBlurred = (name) => setBlurred((prev) => new Set(prev).add(name));

  useEffect(() => {
    const draft = loadDraft(draftId);
    if (draft?.values) {
      const hasContent = draft.values.title || draft.values.content;
      if (hasContent) setDraftBanner(draft);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useAutosaveDraft(draftId, values, touched && !submitting);

  const errors = useMemo(() => validateArticle(values, { isEdit }), [values, isEdit]);
  const shown = (name) => (blurred.has(name) || attemptedSubmit ? errors[name] : undefined);
  const valid = isValid(errors);

  const wordCount = estimateWordCount(values.content);
  const readTime = estimateReadTime(values.content);
  const slugPreview = isEdit ? article?.slug : slugifyPreview(values.title);
  const readyToSave = valid && touched && !submitting;
  const glowRef = useGlowPulse(readyToSave);

  const set = (patch) => {
    setTouched(true);
    setValues((prev) => ({ ...prev, ...patch }));
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

    const res = isEdit ? await updateArticle(article._id, values) : await createArticle(values);
    setSubmitting(false);

    if (!res.success) {
      setServerError(res.message);
      if (res.error?.errors?.length) setServerError(res.error.errors.map((e) => e.msg).join(" "));
      toast.error(res.message, isEdit ? "Could not save changes" : "Could not create article");
      return;
    }

    clearDraft(draftId);
    toast.success(isEdit ? "Article updated successfully." : "Article created successfully.", "Saved");
    navigate(isEdit ? `/articles/${res.data.article.slug}` : "/articles");
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

      {/* Top bar: status + publish workflow + edit/preview toggle */}
      <div className="glass-panel flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4">
        <div className="flex items-center gap-2">
          <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", STATUS_META[values.status].badge)}>
            {STATUS_META[values.status].label}
          </span>
          {isEdit && (
            <PublishActions
              articleId={article._id}
              status={article.status}
              title={article.title}
              onChanged={(updated) => {
                setArticle(updated);
                set({ status: updated.status });
              }}
            />
          )}
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1">
          <button
            type="button"
            onClick={() => setView("edit")}
            className={cn("flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium", view === "edit" ? "bg-white text-primary-hover shadow-sm" : "text-gray-500")}
          >
            <Pencil className="size-3.5" /> Edit
          </button>
          <button
            type="button"
            onClick={() => setView("preview")}
            className={cn("flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium", view === "preview" ? "bg-white text-primary-hover shadow-sm" : "text-gray-500")}
          >
            <Eye className="size-3.5" /> Preview
          </button>
        </div>
      </div>

      {view === "preview" ? (
        <ArticlePreview values={values} authorName={getAuthorName(article?.author) || author?.name || "You"} />
      ) : (
        <>
          <Section title="Basics">
            <div className="grid grid-cols-1 gap-4">
              <FormField label="Title" required error={shown("title")}>
                <input
                  value={values.title}
                  onChange={(e) => set({ title: e.target.value })}
                  onBlur={() => markBlurred("title")}
                  className={cn(inputClass, shown("title") && errorInputClass)}
                  placeholder="e.g. How Bentonite is Used in Piling and Construction"
                  maxLength={200}
                />
              </FormField>

              <div className="-mt-2 flex items-center gap-1.5 text-xs text-gray-400">
                <span className="font-medium text-gray-500">Slug:</span>
                <span className="font-mono">{slugPreview || "—"}</span>
                {!isEdit && <span>(generated by the server on save; shown here as a preview)</span>}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField label="Category">
                  <input
                    value={values.category}
                    onChange={(e) => set({ category: e.target.value })}
                    className={inputClass}
                    placeholder="e.g. Construction Materials"
                  />
                </FormField>
                <FormField label="Status">
                  <select
                    value={values.status}
                    onChange={(e) => set({ status: e.target.value })}
                    className={inputClass}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                  {isEdit && <p className="mt-1 text-xs text-gray-400">Use the Publish/Unpublish/Archive buttons above for a tracked status change — this dropdown only takes effect when you Save.</p>}
                </FormField>
              </div>

              <FormField label="Excerpt" error={shown("excerpt")} hint={`${(values.excerpt || "").length}/300 characters`}>
                <textarea
                  value={values.excerpt}
                  onChange={(e) => set({ excerpt: e.target.value })}
                  onBlur={() => markBlurred("excerpt")}
                  rows={3}
                  maxLength={300}
                  className={cn(inputClass, shown("excerpt") && errorInputClass)}
                />
              </FormField>

              <FormField label="Tags">
                <TagsInput values={values.tags} onChange={(tags) => set({ tags })} />
              </FormField>

              <label className="flex w-fit items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={values.isFeatured}
                  onChange={(e) => set({ isFeatured: e.target.checked })}
                  className="size-4 accent-primary"
                />
                Feature this article
              </label>
            </div>
          </Section>

          <Section title="Cover image" subtitle={isEdit ? "Choosing a new file replaces the current cover on save." : "Required — the API rejects article creation without one."}>
            <CoverImageUpload
              existingUrl={values.existingCoverImage}
              file={values.coverImageFile}
              onFileChange={(file) => set({ coverImageFile: file })}
            />
            {shown("coverImage") && <p className="mt-2 text-xs font-medium text-red-500">{shown("coverImage")}</p>}
          </Section>

          <Section title="Content" subtitle={`${wordCount.toLocaleString()} words · ~${readTime} min read (estimated client-side — the server recalculates on save)`}>
            <RichTextEditor
              articleKey={draftId}
              initialHtml={isEdit ? initialArticle.content : ""}
              onChangeHtml={(html) => set({ content: html })}
              galleryOptions={values.existingGallery}
            />
            {shown("content") && <p className="mt-2 text-xs font-medium text-red-500">{shown("content")}</p>}
          </Section>

          <Section title="Gallery">
            <GalleryUpload
              existingGallery={values.existingGallery}
              stagedFiles={values.galleryFiles}
              onStagedChange={(files) => set({ galleryFiles: files })}
            />
          </Section>

          <Section title="SEO">
            <SeoFields seo={values.seo} onChange={(seo) => set({ seo })} title={values.title} slug={slugPreview} />
          </Section>
        </>
      )}

      <div className="glass-panel fixed inset-x-0 bottom-0 z-30 rounded-none border-x-0 border-b-0 lg:pl-72">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-6 py-3">
          <span className="text-xs text-gray-400">{touched ? "Draft autosaved locally" : "No changes yet"}</span>
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
              disabled={submitting || !valid}
              style={readyToSave ? { boxShadow: "0 0 0 1px rgba(79,209,255,0.3), 0 0 calc(4px + 14px * var(--glow-opacity, 0)) 0 rgba(79,209,255,0.35)" } : undefined}
              className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white transition duration-150 hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-40"
            >
              {submitting ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              {submitting ? "Saving..." : isEdit ? "Save changes" : "Create article"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
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
