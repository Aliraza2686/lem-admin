import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, rectSortingStrategy, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import {
  AlertTriangle,
  CheckCircle2,
  GripVertical,
  Images,
  Loader2,
  MessageSquareText,
  Plus,
  RotateCw,
  Search,
  SearchX,
  UploadCloud,
  X,
} from "lucide-react";
import SidebarLayout from "../../layouts/sidebar-layout/SidebarLayout";
import { useToast } from "../../components/ui/toast/ToastProvider";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { cn } from "../../utillls/common";
import { listGallery, deleteGalleryItem, reorderGallery } from "../../api/gallery";
import { reorderPayload } from "./galleryUtils";
import GalleryCard from "./components/GalleryCard";
import GalleryFormPanel from "./components/GalleryFormPanel";
import DeleteGalleryDialog from "./components/DeleteGalleryDialog";

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
      <Shimmer className="aspect-[4/3] rounded-none" />
      <div className="space-y-2 border-t border-gray-100 p-4">
        <Shimmer className="h-4 w-3/5" />
        <Shimmer className="h-3 w-full" />
        <div className="flex justify-between pt-2">
          <Shimmer className="h-3 w-20" />
          <Shimmer className="h-3 w-12" />
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

function OrderStatus({ status }) {
  if (status === "idle") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
        <GripVertical className="size-3.5" /> Drag to reorder — the public gallery follows this order
      </span>
    );
  }
  return (
    <motion.span
      key={status}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-medium",
        status === "saving" ? "text-primary" : "text-emerald-600"
      )}
    >
      {status === "saving" ? <Loader2 className="size-3.5 animate-spin" /> : <CheckCircle2 className="size-3.5" />}
      {status === "saving" ? "Saving order…" : "Order saved"}
    </motion.span>
  );
}

export default function GalleryPage() {
  const toast = useToast();
  const reduced = useReducedMotion();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [orderStatus, setOrderStatus] = useState("idle");
  const pendingSaves = useRef(0);
  const savedTimer = useRef(null);

  const [panel, setPanel] = useState({ open: false, item: null });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await listGallery();
    if (res.success) setItems(res.data.items || []);
    else {
      setError(res.message);
      toast.error(res.message, "Failed to load gallery");
    }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchItems();
    return () => clearTimeout(savedTimer.current);
  }, [fetchItems]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? items.filter((g) => g.title.toLowerCase().includes(q) || g.description?.toLowerCase().includes(q)) : items;
  }, [items, search]);

  const isFiltering = !!search.trim();
  const described = useMemo(() => items.filter((g) => g.description?.trim()).length, [items]);
  const positionOf = useMemo(() => new Map(items.map((g, i) => [g._id, i])), [items]);

  // Optimistic: reorder locally, persist only the entries whose position changed,
  // and fall back to the server's order if the save fails.
  const commitOrder = async (next) => {
    const changes = reorderPayload(next);
    if (!changes.length) return;
    setItems(next.map((g, i) => ({ ...g, displayOrder: i })));

    pendingSaves.current += 1;
    clearTimeout(savedTimer.current);
    setOrderStatus("saving");
    const res = await reorderGallery(changes);
    pendingSaves.current -= 1;

    if (!res.success) {
      toast.error(res.message, "Couldn't save the new order");
      setOrderStatus("idle");
      fetchItems();
      return;
    }
    if (pendingSaves.current === 0) {
      setOrderStatus("saved");
      savedTimer.current = setTimeout(() => setOrderStatus("idle"), 2200);
    }
  };

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    commitOrder(arrayMove(items, positionOf.get(active.id), positionOf.get(over.id)));
  };

  const handleMove = useCallback(
    (item, dir) => {
      const from = positionOf.get(item._id);
      const to = from + dir;
      if (to < 0 || to >= items.length) return;
      commitOrder(arrayMove(items, from, to));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items, positionOf]
  );

  const openCreate = () => setPanel({ open: true, item: null });
  const openEdit = useCallback((item) => setPanel({ open: true, item }), []);
  const closePanel = useCallback(() => setPanel((p) => ({ ...p, open: false })), []);
  const cancelDelete = useCallback(() => setDeleteTarget(null), []);
  const requestDelete = useCallback((item) => setDeleteTarget(item), []);

  const handleSaved = (saved, { isEdit }) => {
    setItems((prev) => (isEdit ? prev.map((g) => (g._id === saved._id ? saved : g)) : [...prev, saved]));
  };

  const sharedAsset =
    !!deleteTarget && items.some((g) => g._id !== deleteTarget._id && g.imagePublicId === deleteTarget.imagePublicId);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const res = await deleteGalleryItem(deleteTarget._id);
    setDeleting(false);
    if (res.success) {
      // Mirror the server, which shifts later entries up to close the gap.
      setItems((prev) => prev.filter((g) => g._id !== deleteTarget._id).map((g, i) => ({ ...g, displayOrder: i })));
      toast.success(
        sharedAsset
          ? `"${deleteTarget.title}" was removed from the gallery.`
          : `"${deleteTarget.title}" and its image were removed.`,
        "Gallery image deleted"
      );
      setDeleteTarget(null);
    } else {
      toast.error(res.message, "Delete failed");
    }
  };

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
              <Images className="size-3.5" /> Showcase
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">Gallery</h1>
            <p className="mt-1.5 max-w-lg text-sm text-white/60">
              Everything here appears on the site’s public Gallery page, in exactly the order shown below.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="grid grid-cols-2 gap-2 sm:flex">
              <StatPill icon={Images} label="Images" value={loading ? "–" : items.length} tone="bg-accent/20 text-accent-light" />
              <StatPill icon={MessageSquareText} label="Described" value={loading ? "–" : described} tone="bg-sky-400/15 text-sky-300" />
            </div>
            <motion.button
              type="button"
              onClick={openCreate}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-primary shadow-glass-lg transition hover:shadow-glow-md"
            >
              <Plus className="size-4" /> Add image
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
            placeholder="Search by title or description…"
            aria-label="Search gallery"
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
        {!loading && !error && items.length > 1 && (
          <div aria-live="polite">
            {isFiltering ? (
              <span className="text-xs text-gray-500">Clear the search to reorder</span>
            ) : (
              <OrderStatus status={orderStatus} />
            )}
          </div>
        )}
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
          <h2 className="font-semibold text-gray-900">Couldn’t load the gallery</h2>
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
          <h2 className="text-lg font-semibold text-gray-900">Add your first gallery image</h2>
          <p className="mt-1.5 max-w-sm text-sm text-gray-500">
            Upload a photograph — it appears on the public Gallery page as soon as you save.
          </p>
          <span className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-glass-md">
            <Plus className="size-4" /> Add image
          </span>
        </motion.button>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
            <SearchX className="size-6" />
          </div>
          <h2 className="font-semibold text-gray-900">No images match</h2>
          <p className="mt-1 text-sm text-gray-500">Try a different title or phrase.</p>
          <button
            type="button"
            onClick={() => setSearch("")}
            className="mt-4 text-sm font-semibold text-primary underline decoration-primary/30 underline-offset-4 hover:decoration-primary"
          >
            Clear search
          </button>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={filtered.map((g) => g._id)} strategy={rectSortingStrategy}>
            <ul className={GRID}>
              {filtered.map((item) => (
                <GalleryCard
                  key={item._id}
                  item={item}
                  position={positionOf.get(item._id)}
                  total={items.length}
                  sortable={!isFiltering}
                  reduced={reduced}
                  onEdit={openEdit}
                  onDelete={requestDelete}
                  onMove={handleMove}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}

      <GalleryFormPanel open={panel.open} item={panel.item} onClose={closePanel} onSaved={handleSaved} />
      <DeleteGalleryDialog
        target={deleteTarget && { ...deleteTarget, position: positionOf.get(deleteTarget._id) }}
        sharedAsset={sharedAsset}
        loading={deleting}
        onCancel={cancelDelete}
        onConfirm={handleDelete}
      />
    </SidebarLayout>
  );
}
