import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Award, FileText, ImageIcon, Plus, RotateCw, Search, SearchX, UploadCloud, X } from "lucide-react";
import SidebarLayout from "../../layouts/sidebar-layout/SidebarLayout";
import { useToast } from "../../components/ui/toast/ToastProvider";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { cn } from "../../utillls/common";
import { listCertifications, deleteCertification } from "../../api/certifications";
import CertificationCard from "./components/CertificationCard";
import CertificationFormPanel from "./components/CertificationFormPanel";
import DeleteCertificationDialog from "./components/DeleteCertificationDialog";

const TYPE_FILTERS = [
  { value: "all", label: "All" },
  { value: "image", label: "Images", icon: ImageIcon },
  { value: "file", label: "Documents", icon: FileText },
];

const GRID = "grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4";

function Shimmer({ className }) {
  return (
    <div className={cn("relative overflow-hidden rounded-md bg-gray-100", className)}>
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-white/80 to-transparent" />
    </div>
  );
}

function CardSkeleton() {
  return (
    <li className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white" aria-hidden="true">
      <Shimmer className="aspect-[16/10] rounded-none" />
      <div className="space-y-2 border-t border-gray-100 p-4">
        <Shimmer className="h-4 w-4/5" />
        <Shimmer className="h-3 w-full" />
        <div className="flex justify-between pt-2">
          <Shimmer className="h-3 w-24" />
          <Shimmer className="h-3 w-16" />
        </div>
      </div>
    </li>
  );
}

function StatPill({ icon: Icon, label, value, tone }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 backdrop-blur-md">
      <div className={cn("flex size-9 items-center justify-center rounded-xl", tone)}>
        <Icon className="size-4.5" />
      </div>
      <div>
        <div className="text-xl font-semibold leading-none text-white tabular-nums">{value}</div>
        <div className="mt-1 text-[11px] uppercase tracking-wider text-white/50">{label}</div>
      </div>
    </div>
  );
}

export default function CertificationsPage() {
  const toast = useToast();
  const reduced = useReducedMotion();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");

  const [panel, setPanel] = useState({ open: false, certification: null });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await listCertifications();
    if (res.success) setItems(res.data.certifications || []);
    else {
      setError(res.message);
      toast.error(res.message, "Failed to load certifications");
    }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((c) => (type === "all" || c.fileType === type) && (!q || c.title.toLowerCase().includes(q)));
  }, [items, search, type]);

  const counts = useMemo(
    () => ({ all: items.length, image: items.filter((c) => c.fileType === "image").length, file: items.filter((c) => c.fileType === "file").length }),
    [items]
  );

  const openCreate = () => setPanel({ open: true, certification: null });
  const openEdit = useCallback((certification) => setPanel({ open: true, certification }), []);
  const closePanel = useCallback(() => setPanel((p) => ({ ...p, open: false })), []);
  const cancelDelete = useCallback(() => setDeleteTarget(null), []);

  const handleSaved = (saved, { isEdit }) => {
    setItems((prev) => (isEdit ? prev.map((c) => (c._id === saved._id ? saved : c)) : [saved, ...prev]));
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const res = await deleteCertification(deleteTarget._id);
    setDeleting(false);
    if (res.success) {
      setItems((prev) => prev.filter((c) => c._id !== deleteTarget._id));
      toast.success(`"${deleteTarget.title}" and its file were removed.`, "Certification deleted");
      setDeleteTarget(null);
    } else {
      toast.error(res.message, "Delete failed");
    }
  };

  const isFiltering = !!search.trim() || type !== "all";

  return (
    <SidebarLayout>
      {/* Header */}
      <motion.section
        initial={reduced ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="dash-shell relative mb-6 overflow-hidden p-6 sm:p-8"
      >
        <div className="pointer-events-none absolute -right-10 -top-10 size-72 rounded-full bg-glow/10 blur-3xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-accent-light/30 bg-accent/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-light">
              <Award className="size-3.5" /> Trust & compliance
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">Certifications</h1>
            <p className="mt-1.5 max-w-lg text-sm text-white/60">
              Everything here is shown publicly on the site’s Certifications page. Images open in a viewer; documents download.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="grid grid-cols-3 gap-2 sm:flex">
              <StatPill icon={Award} label="Total" value={loading ? "–" : counts.all} tone="bg-accent/20 text-accent-light" />
              <StatPill icon={ImageIcon} label="Images" value={loading ? "–" : counts.image} tone="bg-sky-400/15 text-sky-300" />
              <StatPill icon={FileText} label="Docs" value={loading ? "–" : counts.file} tone="bg-amber-400/15 text-amber-300" />
            </div>
            <motion.button
              type="button"
              onClick={openCreate}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-primary shadow-glass-lg transition hover:shadow-glow-md"
            >
              <Plus className="size-4" /> New certification
            </motion.button>
          </div>
        </div>
      </motion.section>

      {/* Toolbar */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute z-10 left-3.5 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title…"
            aria-label="Search certifications by title"
            className="glass-panel w-full rounded-xl py-2.5 pl-10 pr-9 text-sm text-gray-900 outline-none transition-glow placeholder:text-gray-400 focus:border-glow focus:shadow-glow-sm"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Clear search"
              className="absolute z-10 right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        <div className="glass-panel inline-flex self-start rounded-xl p-1" role="tablist" aria-label="Filter by file type">
          {TYPE_FILTERS.map((f) => {
            const active = type === f.value;
            return (
              <button
                key={f.value}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setType(f.value)}
                className={cn(
                  "relative flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                  active ? "text-white" : "text-gray-500 hover:text-gray-800"
                )}
              >
                {active && (
                  <motion.span
                    layoutId="cert-type-pill"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    className="absolute inset-0 rounded-lg bg-primary shadow-glass-md"
                  />
                )}
                <span className="relative flex items-center gap-1.5">
                  {f.icon && <f.icon className="size-3.5" />}
                  {f.label}
                  <span className={cn("rounded-full px-1.5 text-[10px] tabular-nums", active ? "bg-white/15" : "bg-gray-100")}>
                    {counts[f.value]}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <ul className={GRID}>
          {Array.from({ length: 8 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </ul>
      ) : error ? (
        <div className="glass-panel mx-auto flex max-w-md flex-col items-center rounded-3xl px-6 py-12 text-center">
          <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <AlertTriangle className="size-6" />
          </div>
          <h2 className="font-semibold text-gray-900">Couldn’t load certifications</h2>
          <p className="mt-1 text-sm text-gray-500">{error}</p>
          <button
            type="button"
            onClick={fetchItems}
            className="mt-5 inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <RotateCw className="size-4" /> Retry
          </button>
        </div>
      ) : items.length === 0 ? (
        <motion.button
          type="button"
          onClick={openCreate}
          initial={reduced ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="group mx-auto flex w-full max-w-2xl flex-col items-center rounded-3xl border-2 border-dashed border-gray-200 bg-white/60 px-6 py-16 text-center transition hover:border-glow/50 hover:bg-white hover:shadow-glow-sm"
        >
          <div className="relative mb-5">
            <div className="absolute inset-0 rounded-3xl bg-glow/20 blur-xl transition group-hover:bg-glow/30" />
            <div className="relative flex size-16 items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-primary-deep text-accent-light shadow-glass-lg transition-transform group-hover:-translate-y-1">
              <UploadCloud className="size-7" />
            </div>
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Publish your first certification</h2>
          <p className="mt-1.5 max-w-sm text-sm text-gray-500">
            Upload a certificate image or a PDF — it appears on the public Certifications page as soon as you save.
          </p>
          <span className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-glass-md">
            <Plus className="size-4" /> New certification
          </span>
        </motion.button>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
            <SearchX className="size-6" />
          </div>
          <h2 className="font-semibold text-gray-900">No certifications match</h2>
          <p className="mt-1 text-sm text-gray-500">Try a different title or file type.</p>
          {isFiltering && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setType("all");
              }}
              className="mt-4 text-sm font-semibold text-primary underline decoration-primary/30 underline-offset-4 hover:decoration-primary"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <motion.ul layout={!reduced} className={GRID}>
          <AnimatePresence mode="popLayout">
            {filtered.map((cert, i) => (
              <CertificationCard key={cert._id} cert={cert} index={i} reduced={reduced} onEdit={openEdit} onDelete={setDeleteTarget} />
            ))}
          </AnimatePresence>
        </motion.ul>
      )}

      <CertificationFormPanel open={panel.open} certification={panel.certification} onClose={closePanel} onSaved={handleSaved} />
      <DeleteCertificationDialog target={deleteTarget} loading={deleting} onCancel={cancelDelete} onConfirm={handleDelete} />
    </SidebarLayout>
  );
}
