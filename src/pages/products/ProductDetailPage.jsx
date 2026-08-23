import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, AlertTriangle, Pencil, Trash2, ImageOff, Layers, FlaskConical, ChevronLeft, ChevronRight, X } from "lucide-react";
import SidebarLayout from "../../layouts/sidebar-layout/SidebarLayout";
import PageTitle from "../../components/ui/molecules/PageTitle";
import { getProduct, deleteProduct } from "../../api/products";
import { useToast } from "../../components/ui/toast/ToastProvider";
import DeleteConfirmModal from "./components/DeleteConfirmModal";
import { formatDate, getImageCount } from "./productUtils";

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [lightbox, setLightbox] = useState(null); // { images, index }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const res = await getProduct(id);
      if (cancelled) return;
      if (res.success) setProduct(res.data.product);
      else setError(res.message || "Product not found");
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleDelete = async () => {
    setDeleting(true);
    const res = await deleteProduct(id);
    setDeleting(false);
    if (res.success) {
      toast.success(`"${product.name}" deleted — Cloudinary assets cleaned up.`, "Product deleted");
      navigate("/products");
    } else {
      toast.error(res.message, "Delete failed");
    }
  };

  if (loading) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center gap-2 py-24 text-gray-400">
          <Loader2 className="size-5 animate-spin" />
          Loading product...
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
          <button onClick={() => navigate("/products")} className="text-sm font-medium text-indigo-600 hover:underline">
            Back to products
          </button>
        </div>
      </SidebarLayout>
    );
  }

  const imageCount = getImageCount(product);

  return (
    <SidebarLayout>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageTitle
          title={product.name}
          path={[
            { name: "Dashboard", href: "/dashboard" },
            { name: "Products", href: "/products" },
            { name: product.name },
          ]}
        />
        <div className="flex gap-2">
          <Link
            to={`/products/${product.id}/edit`}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            <Pencil className="size-4" />
            Edit
          </Link>
          <button
            onClick={() => setDeleteOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
          >
            <Trash2 className="size-4" />
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-gray-200 bg-white p-5"
          >
            <div className="flex flex-wrap items-center gap-2">
              {product.category && (
                <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-600">
                  {product.category}
                </span>
              )}
              {product.origin && <span className="text-xs text-gray-500">{product.origin}</span>}
            </div>
            {product.heroNote && <p className="mt-3 text-sm font-medium text-gray-700">{product.heroNote}</p>}
            {product.desc && <p className="mt-2 text-sm leading-relaxed text-gray-600 whitespace-pre-wrap">{product.desc}</p>}

            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
              <ListField label="Applications" items={product.applications} />
              <ListField label="Packaging" items={product.packaging} />
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
              <Layers className="size-4 text-indigo-500" />
              Variants ({product.variants?.length || 0})
            </h2>
            <div className="flex flex-col gap-4">
              {(product.variants || []).map((variant) => (
                <div key={variant.key} className="rounded-2xl border border-gray-200 bg-white p-4">
                  <div className="flex items-center gap-2">
                    <span className="size-4 rounded-full border border-gray-200" style={{ background: variant.swatch || "#e5e7eb" }} />
                    <h3 className="text-sm font-semibold text-gray-900">{variant.label || variant.key}</h3>
                    <span className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[10px] text-gray-500">{variant.key}</span>
                    {variant.quality && (
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-600">{variant.quality}</span>
                    )}
                  </div>
                  {variant.purity && <p className="mt-1 text-xs text-gray-500">Purity: {variant.purity}</p>}
                  {variant.desc && <p className="mt-2 text-sm text-gray-600">{variant.desc}</p>}
                  {variant.highlights?.length > 0 && (
                    <ul className="mt-2 list-inside list-disc space-y-0.5 text-xs text-gray-500">
                      {variant.highlights.map((h, i) => (
                        <li key={i}>{h}</li>
                      ))}
                    </ul>
                  )}

                  {variant.images?.length > 0 ? (
                    <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                      {variant.images.map((img, i) => (
                        <button
                          key={img.publicId || i}
                          onClick={() => setLightbox({ images: variant.images, index: i })}
                          className="aspect-square overflow-hidden rounded-lg bg-gray-100 transition hover:opacity-80"
                        >
                          <img src={img.src} alt="" className="h-full w-full object-cover" />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-400">
                      <ImageOff className="size-3.5" />
                      No images
                    </div>
                  )}
                </div>
              ))}
              {(!product.variants || product.variants.length === 0) && (
                <p className="text-sm text-gray-400">No variants defined.</p>
              )}
            </div>
          </motion.div>

          {product.labReports?.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-2xl border border-gray-200 bg-white p-4">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
                <FlaskConical className="size-4 text-indigo-500" />
                Lab Reports
              </h2>
              <div className="flex flex-col gap-2">
                {product.labReports.map((r, i) => (
                  <a key={i} href={r.file} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2 text-sm hover:bg-gray-50">
                    <span className="text-gray-700">{r.name || "Untitled report"}</span>
                    <span className="text-xs text-gray-400">{r.size}</span>
                  </a>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="h-fit rounded-2xl border border-gray-200 bg-white p-5"
        >
          <h2 className="mb-3 text-sm font-semibold text-gray-900">Metadata</h2>
          <dl className="flex flex-col gap-3 text-xs">
            <MetaRow label="Slug ID" value={product.id} mono />
            <MetaRow label="Mongo _id" value={product._id} mono />
            <MetaRow label="Created" value={formatDate(product.createdAt)} />
            <MetaRow label="Updated" value={formatDate(product.updatedAt)} />
            <MetaRow label="Variants" value={product.variants?.length || 0} />
            <MetaRow label="Total images" value={imageCount} />
            <MetaRow label="Lab reports" value={product.labReports?.length || 0} />
          </dl>
        </motion.div>
      </div>

      <AnimatePresence>
        {lightbox && (
          <Lightbox
            images={lightbox.images}
            index={lightbox.index}
            onClose={() => setLightbox(null)}
            onNav={(i) => setLightbox((prev) => ({ ...prev, index: i }))}
          />
        )}
      </AnimatePresence>

      <DeleteConfirmModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        productName={product.name}
        loading={deleting}
      />
    </SidebarLayout>
  );
}

function ListField({ label, items = [] }) {
  if (!items?.length) return null;
  return (
    <div>
      <p className="text-xs font-semibold text-gray-500">{label}</p>
      <ul className="mt-1 flex flex-col gap-0.5 text-xs text-gray-600">
        {items.map((it, i) => (
          <li key={i}>· {it}</li>
        ))}
      </ul>
    </div>
  );
}

function MetaRow({ label, value, mono }) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-gray-50 pb-2 last:border-0">
      <dt className="text-gray-400">{label}</dt>
      <dd className={mono ? "font-mono text-gray-700" : "font-medium text-gray-700"}>{value ?? "—"}</dd>
    </div>
  );
}

function Lightbox({ images, index, onClose, onNav }) {
  const img = images[index];
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[95] flex items-center justify-center bg-gray-900/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.img
        key={index}
        src={img.src}
        alt=""
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 340, damping: 30 }}
        className="max-h-[85vh] max-w-[85vw] rounded-xl object-contain"
        onClick={(e) => e.stopPropagation()}
      />
      <button onClick={onClose} className="absolute top-5 right-5 rounded-full bg-white/10 p-2 text-white hover:bg-white/20">
        <X className="size-5" />
      </button>
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNav((index - 1 + images.length) % images.length);
            }}
            className="absolute left-5 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNav((index + 1) % images.length);
            }}
            className="absolute right-5 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          >
            <ChevronRight className="size-5" />
          </button>
        </>
      )}
    </motion.div>
  );
}
