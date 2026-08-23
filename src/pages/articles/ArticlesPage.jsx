import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PlusCircle, CheckSquare } from "lucide-react";
import { Link } from "react-router-dom";
import SidebarLayout from "../../layouts/sidebar-layout/SidebarLayout";
import PageTitle from "../../components/ui/molecules/PageTitle";
import Pagination from "../../components/ui/molecules/Pagination";
import { useToast } from "../../components/ui/toast/ToastProvider";
import { listArticles, deleteArticle, createArticle } from "../../api/articles";
import ViewToggle from "../products/components/ViewToggle";
import { GridSkeleton, ListSkeleton, TableSkeleton } from "../products/components/Skeletons";
import BulkActionsBar from "../products/components/BulkActionsBar";
import DeleteConfirmModal from "../products/components/DeleteConfirmModal";
import ArticleFiltersBar from "./components/ArticleFiltersBar";
import ArticleEmptyState from "./components/ArticleEmptyState";
import ArticleCard from "./components/ArticleCard";
import ArticleRow from "./components/ArticleRow";
import ArticleTable from "./components/ArticleTable";
import { useReducedMotion } from "../../hooks/useReducedMotion";

const PAGE_SIZE = 12;
const SEARCH_FETCH_LIMIT = 50; // server max per request — see note in FiltersBar result count
const VIEW_KEY = "articles.viewMode";

export default function ArticlesPage() {
  const toast = useToast();
  const reduced = useReducedMotion();

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [serverTotalPages, setServerTotalPages] = useState(1);

  const [view, setView] = useState(() => localStorage.getItem(VIEW_KEY) || "grid");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [tag, setTag] = useState("");
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);

  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState(new Set());

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const isSearching = !!debouncedSearch.trim();

  useEffect(() => {
    localStorage.setItem(VIEW_KEY, view);
  }, [view]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status, category, tag, featuredOnly, sort]);

  const fetchArticles = async () => {
    setLoading(true);
    setError(null);
    const params = { sort: sort === "newest" ? undefined : sort };
    if (status) params.status = status;
    if (category) params.category = category;
    if (tag) params.tag = tag;

    if (isSearching) {
      // No server-side text search endpoint exists — fetch the max page size and
      // filter client-side instead of paginating server-side while searching.
      params.limit = SEARCH_FETCH_LIMIT;
      params.page = 1;
    } else {
      params.limit = PAGE_SIZE;
      params.page = page;
    }

    const res = await listArticles(params);
    if (res.success) {
      setArticles(res.data.articles || []);
      setServerTotalPages(res.data.totalPages || 1);
    } else {
      setError(res.message);
      toast.error(res.message, "Failed to load articles");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchArticles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, category, tag, sort, page, isSearching]);

  const categories = useMemo(() => [...new Set(articles.map((a) => a.category).filter(Boolean))].sort(), [articles]);
  const tags = useMemo(() => [...new Set(articles.flatMap((a) => a.tags || []))].sort(), [articles]);

  const filtered = useMemo(() => {
    let list = [...articles];
    if (featuredOnly) list = list.filter((a) => a.isFeatured);
    if (isSearching) {
      const q = debouncedSearch.trim().toLowerCase();
      list = list.filter(
        (a) =>
          a.title?.toLowerCase().includes(q) ||
          a.excerpt?.toLowerCase().includes(q) ||
          a.slug?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [articles, featuredOnly, isSearching, debouncedSearch]);

  const paged = isSearching ? filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE) : filtered;
  const totalPages = isSearching ? Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)) : serverTotalPages;

  const hasActiveFilters = !!(search || status || category || tag || featuredOnly);
  const resetFilters = () => {
    setSearch("");
    setStatus("");
    setCategory("");
    setTag("");
    setFeaturedOnly(false);
  };

  const handleTableSort = (field) => {
    const fieldToSort = { views: "popular", likes: "liked", createdAt: sort === "oldest" ? "newest" : "oldest" };
    if (fieldToSort[field]) setSort(fieldToSort[field]);
  };

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  const toggleSelectAll = (ids) => {
    setSelected((prev) => {
      const allIn = ids.every((id) => prev.has(id));
      return allIn ? new Set() : new Set(ids);
    });
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    if (deleteTarget.bulk) {
      const ids = deleteTarget.ids;
      let okCount = 0;
      for (const id of ids) {
        const res = await deleteArticle(id);
        if (res.success) okCount++;
      }
      setArticles((prev) => prev.filter((a) => !ids.includes(a._id)));
      setSelected(new Set());
      setSelectMode(false);
      if (okCount === ids.length) toast.success(`${okCount} articles deleted (Cloudinary assets cleaned up per-article).`, "Bulk delete complete");
      else toast.error(`${okCount}/${ids.length} deleted — some requests failed.`, "Partial failure");
    } else {
      const res = await deleteArticle(deleteTarget._id);
      if (res.success) {
        setArticles((prev) => prev.filter((a) => a._id !== deleteTarget._id));
        toast.success(`"${deleteTarget.title}" deleted successfully.`, "Article deleted");
      } else {
        toast.error(res.message, "Delete failed");
      }
    }
    setDeleting(false);
    setDeleteTarget(null);
  };

  const handleDuplicate = async (article) => {
    try {
      let coverImageFile = null;
      if (article.coverImage?.url) {
        const blob = await fetch(article.coverImage.url).then((r) => r.blob());
        coverImageFile = new File([blob], "cover.jpg", { type: blob.type || "image/jpeg" });
      }
      const res = await createArticle({
        title: `${article.title} (Copy)`,
        excerpt: article.excerpt,
        content: article.content,
        category: article.category,
        status: "draft",
        isFeatured: false,
        tags: article.tags,
        seo: article.seo || {},
        coverImageFile,
        galleryFiles: [], // gallery intentionally not duplicated — see Cloudinary asset-sharing note in Products module
      });
      if (res.success) {
        setArticles((prev) => [res.data.article, ...prev]);
        toast.success("Duplicated as a new draft — gallery images were not carried over.", "Article duplicated");
      } else {
        toast.error(res.message, "Duplicate failed");
      }
    } catch {
      toast.error("Could not fetch the original cover image to duplicate it.", "Duplicate failed");
    }
  };

  const viewProps = {
    onDelete: (a) => setDeleteTarget(a),
    selected,
    onToggleSelect: toggleSelect,
    selectMode,
  };

  return (
    <SidebarLayout>
      <div className="flex items-start justify-between">
        <PageTitle title="Articles" path={[{ name: "Dashboard", href: "/dashboard" }, { name: "Articles" }]} />
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectMode((v) => !v);
              setSelected(new Set());
            }}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition ${
              selectMode ? "border-indigo-300 bg-indigo-50 text-indigo-700" : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            <CheckSquare className="size-4" />
            Select
          </button>
          <Link to="/articles/new" className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700">
            <PlusCircle className="size-4" />
            Add Article
          </Link>
        </div>
      </div>

      <div className="mt-2 flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex-1">
            <ArticleFiltersBar
              search={search}
              onSearch={setSearch}
              status={status}
              onStatus={setStatus}
              category={category}
              onCategory={setCategory}
              tag={tag}
              onTag={setTag}
              featuredOnly={featuredOnly}
              onFeaturedOnly={setFeaturedOnly}
              categories={categories}
              tags={tags}
              sort={sort}
              onSort={setSort}
              onReset={resetFilters}
              hasActiveFilters={hasActiveFilters}
              resultCount={paged.length}
            />
          </div>
          <ViewToggle value={view} onChange={setView} />
        </div>

        <BulkActionsBar count={selected.size} onClear={() => setSelected(new Set())} onDeleteSelected={() => setDeleteTarget({ bulk: true, ids: [...selected] })} />

        {error && !loading && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">Could not load articles: {error}</div>
        )}

        {loading ? (
          view === "grid" ? <GridSkeleton /> : view === "list" ? <ListSkeleton /> : <TableSkeleton />
        ) : paged.length === 0 ? (
          <ArticleEmptyState filtered={hasActiveFilters} />
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, y: reduced ? 0 : 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reduced ? 0 : -8 }}
              transition={{ duration: reduced ? 0.01 : 0.25 }}
            >
              {view === "grid" && (
                <motion.div layout className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  <AnimatePresence mode="popLayout">
                    {paged.map((a) => (
                      <ArticleCard key={a._id} article={a} {...viewProps} />
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}

              {view === "list" && (
                <motion.div layout className="space-y-2">
                  <AnimatePresence mode="popLayout">
                    {paged.map((a) => (
                      <ArticleRow key={a._id} article={a} {...viewProps} />
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}

              {view === "table" && (
                <ArticleTable
                  articles={paged}
                  onDelete={(a) => setDeleteTarget(a)}
                  onDuplicate={handleDuplicate}
                  selected={selected}
                  onToggleSelect={toggleSelect}
                  onToggleSelectAll={toggleSelectAll}
                  sortField={sort === "popular" ? "views" : sort === "liked" ? "likes" : "createdAt"}
                  sortDir={sort === "oldest" ? "asc" : "desc"}
                  onSort={handleTableSort}
                />
              )}
            </motion.div>
          </AnimatePresence>
        )}

        {!loading && paged.length > 0 && <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />}
        {isSearching && filtered.length >= SEARCH_FETCH_LIMIT && (
          <p className="text-center text-xs text-gray-400">
            Search looks across the {SEARCH_FETCH_LIMIT} most recent articles (the API has no server-side text search).
          </p>
        )}
      </div>

      <DeleteConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        productName={deleteTarget?.bulk ? undefined : deleteTarget?.title}
        count={deleteTarget?.bulk ? deleteTarget.ids.length : 1}
        loading={deleting}
        entityLabel="article"
        assetsNote="including its cover image and gallery stored on Cloudinary"
      />
    </SidebarLayout>
  );
}
