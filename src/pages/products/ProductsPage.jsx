import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PlusCircle, CheckSquare } from "lucide-react";
import { Link } from "react-router-dom";
import SidebarLayout from "../../layouts/sidebar-layout/SidebarLayout";
import PageTitle from "../../components/ui/molecules/PageTitle";
import Pagination from "../../components/ui/molecules/Pagination";
import { useToast } from "../../components/ui/toast/ToastProvider";
import { listProducts, deleteProduct, createProduct } from "../../api/products";
import ViewToggle from "./components/ViewToggle";
import FiltersBar from "./components/FiltersBar";
import EmptyState from "./components/EmptyState";
import BulkActionsBar from "./components/BulkActionsBar";
import DeleteConfirmModal from "./components/DeleteConfirmModal";
import ProductCard from "./components/ProductCard";
import ProductRow from "./components/ProductRow";
import ProductTable from "./components/ProductTable";
import { GridSkeleton, ListSkeleton, TableSkeleton } from "./components/Skeletons";
import { getVariantCount } from "./productUtils";
import { useReducedMotion } from "../../hooks/useReducedMotion";

const PAGE_SIZE = 12;
const VIEW_KEY = "products.viewMode";

export default function ProductsPage() {
  const toast = useToast();
  const reduced = useReducedMotion();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [view, setView] = useState(() => localStorage.getItem(VIEW_KEY) || "grid");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("");
  const [origin, setOrigin] = useState("");
  const [sortValue, setSortValue] = useState("createdAt:desc");
  const [page, setPage] = useState(1);

  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState(new Set());

  const [deleteTarget, setDeleteTarget] = useState(null); // single product or { bulk: true, ids }
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    localStorage.setItem(VIEW_KEY, view);
  }, [view]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, category, origin, sortValue]);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    const res = await listProducts();
    if (res.success) {
      setProducts(res.data.products || []);
    } else {
      setError(res.message);
      toast.error(res.message, "Failed to load products");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const categories = useMemo(
    () => [...new Set(products.map((p) => p.category).filter(Boolean))].sort(),
    [products]
  );
  const origins = useMemo(
    () => [...new Set(products.map((p) => p.origin).filter(Boolean))].sort(),
    [products]
  );

  const filtered = useMemo(() => {
    let list = [...products];

    if (debouncedSearch.trim()) {
      const q = debouncedSearch.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.id?.toLowerCase().includes(q) ||
          p.origin?.toLowerCase().includes(q) ||
          p.desc?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q)
      );
    }
    if (category) list = list.filter((p) => p.category === category);
    if (origin) list = list.filter((p) => p.origin === origin);

    const [field, dir] = sortValue.split(":");
    list.sort((a, b) => {
      let av, bv;
      if (field === "variantCount") {
        av = getVariantCount(a);
        bv = getVariantCount(b);
      } else {
        av = a[field] ?? "";
        bv = b[field] ?? "";
      }
      if (field === "createdAt" || field === "updatedAt") {
        av = new Date(av).getTime();
        bv = new Date(bv).getTime();
      }
      if (typeof av === "string") av = av.toLowerCase();
      if (typeof bv === "string") bv = bv.toLowerCase();
      if (av < bv) return dir === "asc" ? -1 : 1;
      if (av > bv) return dir === "asc" ? 1 : -1;
      return 0;
    });

    return list;
  }, [products, debouncedSearch, category, origin, sortValue]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const hasActiveFilters = !!(search || category || origin);
  const resetFilters = () => {
    setSearch("");
    setCategory("");
    setOrigin("");
  };

  const handleTableSort = (field) => {
    const [curField, curDir] = sortValue.split(":");
    if (curField === field) {
      setSortValue(`${field}:${curDir === "asc" ? "desc" : "asc"}`);
    } else {
      setSortValue(`${field}:asc`);
    }
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
      if (allIn) return new Set();
      return new Set(ids);
    });
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    if (deleteTarget.bulk) {
      const ids = deleteTarget.ids;
      let okCount = 0;
      for (const id of ids) {
        const res = await deleteProduct(id);
        if (res.success) okCount++;
      }
      setProducts((prev) => prev.filter((p) => !ids.includes(p.id)));
      setSelected(new Set());
      setSelectMode(false);
      if (okCount === ids.length) {
        toast.success(`${okCount} products deleted (Cloudinary assets cleaned up per-product).`, "Bulk delete complete");
      } else {
        toast.error(`${okCount}/${ids.length} deleted — some requests failed.`, "Partial failure");
      }
    } else {
      const res = await deleteProduct(deleteTarget.id);
      if (res.success) {
        setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
        toast.success(`"${deleteTarget.name}" deleted successfully.`, "Product deleted");
      } else {
        toast.error(res.message, "Delete failed");
      }
    }
    setDeleting(false);
    setDeleteTarget(null);
  };

  const handleDuplicate = async (product) => {
    const newId = `${product.id}-copy-${Date.now().toString(36).slice(-4)}`;
    const payload = {
      id: newId,
      name: `${product.name} (Copy)`,
      category: product.category,
      origin: product.origin,
      desc: product.desc,
      heroNote: product.heroNote,
      applications: product.applications,
      packaging: product.packaging,
      // Images intentionally omitted — duplicating Cloudinary publicIds would let
      // deleting either product's images orphan/break the other's references.
      variants: (product.variants || []).map((v) => ({ ...v, images: [] })),
      labReports: product.labReports,
    };
    const res = await createProduct(payload);
    if (res.success) {
      setProducts((prev) => [res.data.product, ...prev]);
      toast.success("Duplicated without images — upload new images on the copy.", "Product duplicated");
    } else {
      toast.error(res.message, "Duplicate failed");
    }
  };

  const viewProps = {
    onDelete: (p) => setDeleteTarget(p),
    selected,
    onToggleSelect: toggleSelect,
    selectMode,
  };

  return (
    <SidebarLayout>
      <div className="flex items-start justify-between">
        <PageTitle title="Products" path={[{ name: "Dashboard", href: "/dashboard" }, { name: "Products" }]} />
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectMode((v) => !v);
              setSelected(new Set());
            }}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition ${
              selectMode
                ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            <CheckSquare className="size-4" />
            Select
          </button>
          <Link
            to="/products/new"
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
          >
            <PlusCircle className="size-4" />
            Add Product
          </Link>
        </div>
      </div>

      <div className="mt-2 flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex-1">
            <FiltersBar
              search={search}
              onSearch={setSearch}
              category={category}
              onCategory={setCategory}
              origin={origin}
              onOrigin={setOrigin}
              categories={categories}
              origins={origins}
              sort={sortValue}
              onSort={setSortValue}
              onReset={resetFilters}
              hasActiveFilters={hasActiveFilters}
              resultCount={filtered.length}
            />
          </div>
          <ViewToggle value={view} onChange={setView} />
        </div>

        <BulkActionsBar
          count={selected.size}
          onClear={() => setSelected(new Set())}
          onDeleteSelected={() => setDeleteTarget({ bulk: true, ids: [...selected] })}
        />

        {error && !loading && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            Could not load products: {error}
          </div>
        )}

        {loading ? (
          view === "grid" ? <GridSkeleton /> : view === "list" ? <ListSkeleton /> : <TableSkeleton />
        ) : filtered.length === 0 ? (
          <EmptyState filtered={hasActiveFilters} />
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
                    {paged.map((p) => (
                      <ProductCard key={p.id} product={p} {...viewProps} />
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}

              {view === "list" && (
                <motion.div layout className="space-y-2">
                  <AnimatePresence mode="popLayout">
                    {paged.map((p) => (
                      <ProductRow key={p.id} product={p} {...viewProps} />
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}

              {view === "table" && (
                <ProductTable
                  products={paged}
                  onDelete={(p) => setDeleteTarget(p)}
                  onDuplicate={handleDuplicate}
                  selected={selected}
                  onToggleSelect={toggleSelect}
                  onToggleSelectAll={toggleSelectAll}
                  sortField={sortValue.split(":")[0]}
                  sortDir={sortValue.split(":")[1]}
                  onSort={handleTableSort}
                />
              )}
            </motion.div>
          </AnimatePresence>
        )}

        {!loading && filtered.length > 0 && (
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        )}
      </div>

      <DeleteConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        productName={deleteTarget?.bulk ? undefined : deleteTarget?.name}
        count={deleteTarget?.bulk ? deleteTarget.ids.length : 1}
        loading={deleting}
      />
    </SidebarLayout>
  );
}
