import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, AlertTriangle, Pencil, Trash2 } from "lucide-react";
import SidebarLayout from "../../layouts/sidebar-layout/SidebarLayout";
import PageTitle from "../../components/ui/molecules/PageTitle";
import { getArticleBySlug, deleteArticle } from "../../api/articles";
import { useToast } from "../../components/ui/toast/ToastProvider";
import DeleteConfirmModal from "../products/components/DeleteConfirmModal";
import PublishActions from "./components/PublishActions";
import ArticlePreview from "./form/ArticlePreview";
import { formatDate, getAuthorName } from "./articleUtils";

export default function ArticleDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const res = await getArticleBySlug(slug);
      if (cancelled) return;
      if (res.success) setArticle(res.data.article);
      else setError(res.message || "Article not found");
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const handleDelete = async () => {
    setDeleting(true);
    const res = await deleteArticle(article._id);
    setDeleting(false);
    if (res.success) {
      toast.success(`"${article.title}" deleted — Cloudinary assets cleaned up.`, "Article deleted");
      navigate("/articles");
    } else {
      toast.error(res.message, "Delete failed");
    }
  };

  if (loading) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center gap-2 py-24 text-gray-400">
          <Loader2 className="size-5 animate-spin" />
          Loading article...
        </div>
      </SidebarLayout>
    );
  }

  if (error) {
    return (
      <SidebarLayout>
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-gray-200 py-20 text-center">
          <AlertTriangle className="size-8 text-red-400" />
          <p className="text-sm text-gray-600">{error}</p>
          <button onClick={() => navigate("/articles")} className="text-sm font-medium text-indigo-600 hover:underline">
            Back to articles
          </button>
        </div>
      </SidebarLayout>
    );
  }

  const previewValues = {
    title: article.title,
    category: article.category,
    content: article.content,
    tags: article.tags,
    existingCoverImage: article.coverImage?.url,
    coverImageFile: null,
    publishedAt: article.publishedAt || article.createdAt,
  };

  return (
    <SidebarLayout>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageTitle
          title={article.title}
          path={[{ name: "Dashboard", href: "/dashboard" }, { name: "Articles", href: "/articles" }, { name: article.title }]}
        />
        <div className="flex flex-wrap items-center gap-2">
          <PublishActions
            articleId={article._id}
            status={article.status}
            title={article.title}
            onChanged={(updated) => setArticle(updated)}
          />
          <Link to={`/articles/${article.slug}/edit`} className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50">
            <Pencil className="size-4" />
            Edit
          </Link>
          <button onClick={() => setDeleteOpen(true)} className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50">
            <Trash2 className="size-4" />
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <ArticlePreview values={previewValues} authorName={getAuthorName(article.author)} />
          </motion.div>

          {article.gallery?.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="mt-6 rounded-2xl border border-gray-200 bg-white p-4">
              <h2 className="mb-3 text-sm font-semibold text-gray-900">Gallery ({article.gallery.length})</h2>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {article.gallery.map((img) => (
                  <div key={img.publicId} className="aspect-square overflow-hidden rounded-lg bg-gray-100">
                    <img src={img.url} alt={img.caption || ""} className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="flex h-fit flex-col gap-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <h2 className="mb-3 text-sm font-semibold text-gray-900">Metadata</h2>
            <dl className="flex flex-col gap-3 text-xs">
              <MetaRow label="Slug" value={article.slug} mono />
              <MetaRow label="Mongo _id" value={article._id} mono />
              <MetaRow label="Status" value={article.status} />
              <MetaRow label="Author" value={getAuthorName(article.author)} />
              <MetaRow label="Created" value={formatDate(article.createdAt)} />
              <MetaRow label="Updated" value={formatDate(article.updatedAt)} />
              <MetaRow label="Published" value={formatDate(article.publishedAt)} />
              <MetaRow label="Word count" value={article.wordCount?.toLocaleString() ?? "—"} />
              <MetaRow label="Read time" value={article.readTime ? `${article.readTime} min` : "—"} />
              <MetaRow label="Views" value={article.views ?? 0} />
              <MetaRow label="Likes" value={article.likes ?? 0} />
              <MetaRow label="Featured" value={article.isFeatured ? "Yes" : "No"} />
            </dl>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <h2 className="mb-3 text-sm font-semibold text-gray-900">SEO</h2>
            <dl className="flex flex-col gap-3 text-xs">
              <MetaRow label="Meta title" value={article.seo?.metaTitle || "—"} />
              <MetaRow label="Meta description" value={article.seo?.metaDescription || "—"} />
              <MetaRow label="Keywords" value={article.seo?.keywords?.join(", ") || "—"} />
            </dl>
          </div>
        </motion.div>
      </div>

      <DeleteConfirmModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        productName={article.title}
        loading={deleting}
        entityLabel="article"
        assetsNote="including its cover image and gallery stored on Cloudinary"
      />
    </SidebarLayout>
  );
}

function MetaRow({ label, value, mono }) {
  return (
    <div className="flex items-start justify-between gap-2 border-b border-gray-50 pb-2 last:border-0">
      <dt className="shrink-0 text-gray-400">{label}</dt>
      <dd className={mono ? "truncate font-mono text-gray-700" : "text-right font-medium text-gray-700"}>{value ?? "—"}</dd>
    </div>
  );
}
