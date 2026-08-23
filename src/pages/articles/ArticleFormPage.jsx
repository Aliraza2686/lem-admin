import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2, AlertTriangle } from "lucide-react";
import SidebarLayout from "../../layouts/sidebar-layout/SidebarLayout";
import PageTitle from "../../components/ui/molecules/PageTitle";
import { getArticleBySlug } from "../../api/articles";
import ArticleForm from "./form/ArticleForm";

export default function ArticleFormPage({ mode }) {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(mode === "edit");
  const [error, setError] = useState(null);

  useEffect(() => {
    if (mode !== "edit") return;
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
  }, [slug, mode]);

  return (
    <SidebarLayout>
      <PageTitle
        title={mode === "edit" ? "Edit Article" : "Add Article"}
        path={[
          { name: "Dashboard", href: "/dashboard" },
          { name: "Articles", href: "/articles" },
          { name: mode === "edit" ? article?.title || "Edit" : "New" },
        ]}
      />

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-24 text-gray-400">
          <Loader2 className="size-5 animate-spin" />
          Loading article...
        </div>
      ) : error ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-gray-200 py-20 text-center">
          <AlertTriangle className="size-8 text-red-400" />
          <p className="text-sm text-gray-600">{error}</p>
          <button onClick={() => navigate("/articles")} className="text-sm font-medium text-indigo-600 hover:underline">
            Back to articles
          </button>
        </div>
      ) : (
        <div className="mx-auto max-w-5xl">
          <ArticleForm mode={mode} initialArticle={article} />
        </div>
      )}
    </SidebarLayout>
  );
}
