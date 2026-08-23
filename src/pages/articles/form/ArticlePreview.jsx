import { ArrowLeft } from "lucide-react";
import { formatDate, estimateReadTime, estimateWordCount } from "../articleUtils";

// Ported (not reimplemented) from lem-frontend's ArticleBody.jsx typography rules,
// so "preview as reader" actually matches what the public site renders — same
// selectors, same values, just scoped locally instead of shared across repos.
const READER_CSS = `
  .admin-article-preview h2 {
    font-family: 'Playfair Display', serif;
    font-size: 1.65rem; font-weight: 800; color: #0d1f35;
    margin: 0 0 1rem; line-height: 1.25;
  }
  .admin-article-preview h3 {
    font-family: 'Playfair Display', serif;
    font-size: 1.3rem; font-weight: 700; color: #0d1f35;
    margin: 0 0 0.85rem; line-height: 1.3;
  }
  .admin-article-preview p { font-size: 1.05rem; line-height: 1.85; color: #3f3a33; margin: 0 0 1.1rem; }
  .admin-article-preview ul, .admin-article-preview ol { margin: 0 0 1.1rem 1.25rem; padding: 0; color: #3f3a33; }
  .admin-article-preview li { margin-bottom: 0.6rem; line-height: 1.75; font-size: 1.02rem; }
  .admin-article-preview strong { color: #0d1f35; font-weight: 700; }
  .admin-article-preview img {
    width: 100%; aspect-ratio: 4 / 3; object-fit: cover; background: #e7e5e4;
    border-radius: 1rem; margin: 0.5rem 0 1.5rem;
  }
  .admin-article-preview blockquote {
    border-left: 3px solid #a88940; padding-left: 1rem; margin: 0 0 1.1rem;
    font-style: italic; color: #6b5f4a;
  }
`;

export default function ArticlePreview({ values, authorName }) {
  const coverUrl = values.coverImageFile ? URL.createObjectURL(values.coverImageFile) : values.existingCoverImage;
  const wordCount = estimateWordCount(values.content);
  const readTime = estimateReadTime(values.content);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-[#FAF8F4]">
      <style>{READER_CSS}</style>

      <div className="relative h-64">
        {coverUrl ? (
          <img src={coverUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gray-200" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d1f35] via-[#0d1f35]/50 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 px-6 pb-6">
          <span className="mb-3 inline-flex items-center gap-1.5 text-xs font-medium text-white/70">
            <ArrowLeft className="size-3" /> All Articles
          </span>
          {values.category && (
            <span className="mb-3 inline-flex rounded-full bg-[#c8aa64] px-3 py-1 text-[11px] font-bold tracking-widest text-[#0d1f35] uppercase">
              {values.category}
            </span>
          )}
          <h1 className="font-serif text-2xl leading-tight font-extrabold text-white md:text-4xl">
            {values.title || "Untitled article"}
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 pt-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 pb-6">
          <div className="text-sm text-stone-600">
            <span className="font-semibold text-stone-800">{authorName}</span> ·{" "}
            {formatDate(values.publishedAt || new Date())} · {readTime} min read
          </div>
          <p className="font-mono text-xs tracking-wide text-stone-400 uppercase">{wordCount.toLocaleString()} words</p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-8">
        <div
          className="admin-article-preview"
          dangerouslySetInnerHTML={{ __html: values.content || "<p>Nothing written yet.</p>" }}
        />

        {values.tags?.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2 border-t border-stone-200 pt-6">
            {values.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
