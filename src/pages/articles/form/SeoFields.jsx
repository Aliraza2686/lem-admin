import { Search } from "lucide-react";
import { inputClass } from "../../products/form/FormField";
import TagsInput from "./TagsInput";

export default function SeoFields({ seo, onChange, title, slug }) {
  const metaTitle = seo.metaTitle || "";
  const metaDescription = seo.metaDescription || "";

  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label className="text-xs font-semibold text-gray-600">Meta title</label>
          <span className={`text-xs ${metaTitle.length > 60 ? "text-amber-500" : "text-gray-400"}`}>
            {metaTitle.length}/60
          </span>
        </div>
        <input
          value={metaTitle}
          onChange={(e) => onChange({ ...seo, metaTitle: e.target.value })}
          placeholder={title || "Defaults to article title"}
          className={inputClass}
          maxLength={200}
        />
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label className="text-xs font-semibold text-gray-600">Meta description</label>
          <span className={`text-xs ${metaDescription.length > 160 ? "text-amber-500" : "text-gray-400"}`}>
            {metaDescription.length}/160
          </span>
        </div>
        <textarea
          value={metaDescription}
          onChange={(e) => onChange({ ...seo, metaDescription: e.target.value })}
          rows={3}
          placeholder="Defaults to the article excerpt"
          className={inputClass}
          maxLength={300}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold text-gray-600">Keywords</label>
        <TagsInput
          values={seo.keywords || []}
          onChange={(keywords) => onChange({ ...seo, keywords })}
          placeholder="Add a keyword and press Enter"
        />
      </div>

      {/* Google-style SERP preview */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-gray-500">
          <Search className="size-3.5" />
          Search preview
        </p>
        <div className="max-w-[560px]">
          <p className="truncate text-xs text-emerald-700">
            luminaearthminerals.com › blog › {slug || "article-slug"}
          </p>
          <p className="mt-0.5 truncate text-lg text-[#1a0dab] hover:underline">
            {metaTitle || title || "Article title"}
          </p>
          <p className="mt-0.5 line-clamp-2 text-sm text-gray-600">
            {metaDescription || "Add a meta description so this preview reflects what search engines will show."}
          </p>
        </div>
      </div>
    </div>
  );
}
