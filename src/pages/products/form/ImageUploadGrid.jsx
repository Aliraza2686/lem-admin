import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { UploadCloud, X, GripVertical, CheckCircle2, ImageIcon } from "lucide-react";
import { uploadVariantImages, deleteVariantImage } from "../../../api/products";
import { useToast } from "../../../components/ui/toast/ToastProvider";
import { cn } from "../../../utillls/common";

let localIdCounter = 0;

// images: [{ src, publicId, is_video, _localId, _pending, _file, _uploading, _progress, _justUploaded }]
export default function ImageUploadGrid({ productId, variantKey, images, onChange }) {
  const toast = useToast();
  const [dragOver, setDragOver] = useState(false);
  const [dragIndex, setDragIndex] = useState(null);
  const inputRef = useRef(null);

  const isPersisted = !!(productId && variantKey);

  // Forwards the updater itself (rather than resolving it against the local `images`
  // prop here) so the parent can apply it functionally against whatever the true latest
  // state is when it flushes — an async upload's success handler can resolve long after
  // this component re-rendered with newer props, and resolving locally against a
  // closed-over `images` snapshot silently discarded the staged/uploaded image.
  const setImages = (updater) => {
    onChange(updater);
  };

  // Deliberately not memoized — it must always close over the latest `onChange` prop
  // (a stale useCallback here previously caused edits made after mount to be
  // silently overwritten whenever an image was staged).
  const handleFiles = async (fileList) => {
    const files = Array.from(fileList).filter((f) => f.type.startsWith("image/"));
      if (!files.length) return;

      if (!isPersisted) {
        // Create mode: product/variant don't exist server-side yet — stage locally,
        // real upload happens right after the product is created (see ProductForm submit).
        const staged = files.map((file) => ({
          _localId: ++localIdCounter,
          _pending: true,
          _file: file,
          src: URL.createObjectURL(file),
          is_video: false,
        }));
        setImages((prev) => [...prev, ...staged]);
        return;
      }

      const staged = files.map((file) => ({
        _localId: ++localIdCounter,
        _uploading: true,
        _progress: 0,
        _file: file,
        src: URL.createObjectURL(file),
        is_video: false,
      }));
      setImages((prev) => [...prev, ...staged]);

      const res = await uploadVariantImages(productId, variantKey, files, (pct) => {
        setImages((prev) =>
          prev.map((img) => (staged.some((s) => s._localId === img._localId) ? { ...img, _progress: pct } : img))
        );
      });

      if (res.success) {
        const uploadedVariant = res.data.product.variants.find((v) => v.key === variantKey);
        const uploadedImages = uploadedVariant?.images?.slice(-files.length) || [];
        setImages((prev) => {
          const withoutStaged = prev.filter((img) => !staged.some((s) => s._localId === img._localId));
          const justUploaded = uploadedImages.map((img, i) => ({
            ...img,
            _localId: staged[i]?._localId ?? ++localIdCounter,
            _justUploaded: true,
          }));
          return [...withoutStaged, ...justUploaded];
        });
        toast.success(`${files.length} image${files.length > 1 ? "s" : ""} uploaded.`);
        setTimeout(() => {
          setImages((prev) => prev.map((img) => ({ ...img, _justUploaded: false })));
        }, 1400);
      } else {
        setImages((prev) => prev.filter((img) => !staged.some((s) => s._localId === img._localId)));
        toast.error(res.message, "Upload failed");
      }
  };

  const handleDelete = async (img) => {
    if (img._pending || !img.publicId) {
      setImages((prev) => prev.filter((i) => i._localId !== img._localId));
      return;
    }
    const prevImages = images;
    setImages((prev) => prev.filter((i) => i._localId !== img._localId));
    const res = await deleteVariantImage(productId, variantKey, img.publicId);
    if (res.success) {
      toast.success("Image deleted — Cloudinary asset cleaned up.");
    } else {
      setImages(prevImages);
      toast.error(res.message, "Delete failed");
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
  };

  const reorder = (from, to) => {
    if (from === to || to < 0 || to >= images.length) return;
    const next = [...images];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setImages(next);
  };

  return (
    <div className="flex flex-col gap-3">
      <motion.div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        animate={dragOver ? { scale: 1.015, borderColor: "#6366f1" } : { scale: 1, borderColor: "#d1d5db" }}
        transition={{ duration: 0.15 }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed bg-gray-50/50 px-4 py-8 text-center transition-colors",
          dragOver && "bg-indigo-50/60"
        )}
      >
        <motion.div animate={dragOver ? { y: [-2, 2, -2] } : { y: 0 }} transition={{ repeat: dragOver ? Infinity : 0, duration: 0.8 }}>
          <UploadCloud className={cn("size-8", dragOver ? "text-indigo-500" : "text-gray-400")} />
        </motion.div>
        <p className="text-sm text-gray-500">
          <span className="font-medium text-indigo-600">Click to upload</span> or drag and drop images here
        </p>
        <p className="text-xs text-gray-400">PNG, JPG up to 8MB each — max 10 per request</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </motion.div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          <AnimatePresence initial={false}>
            {images.map((img, i) => (
              <motion.div
                key={img._localId ?? img.publicId ?? img.src}
                layout
                draggable
                onDragStart={() => setDragIndex(i)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  reorder(dragIndex, i);
                  setDragIndex(null);
                }}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.15 } }}
                transition={{ type: "spring", stiffness: 350, damping: 28 }}
                className="group relative aspect-square overflow-hidden rounded-lg border border-gray-200 bg-gray-100"
              >
                <img src={img.src} alt="" className="h-full w-full object-cover" />

                {i === 0 && (
                  <span className="absolute top-1 left-1 rounded bg-indigo-600/90 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                    Cover
                  </span>
                )}

                <div className="absolute top-1 right-1 flex cursor-grab items-center justify-center rounded bg-white/80 p-0.5 text-gray-500 opacity-0 transition-opacity group-hover:opacity-100">
                  <GripVertical className="size-3.5" />
                </div>

                <button
                  type="button"
                  onClick={() => handleDelete(img)}
                  className="absolute bottom-1 right-1 flex size-6 items-center justify-center rounded-full bg-white/90 text-red-500 opacity-0 shadow transition-opacity group-hover:opacity-100"
                >
                  <X className="size-3.5" />
                </button>

                {img._uploading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/40 px-3">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/30">
                      <motion.div
                        className="h-full bg-white"
                        initial={{ width: 0 }}
                        animate={{ width: `${img._progress || 0}%` }}
                        transition={{ duration: 0.2 }}
                      />
                    </div>
                    <span className="text-[10px] font-medium text-white">{img._progress || 0}%</span>
                  </div>
                )}

                {img._pending && (
                  <div className="absolute bottom-1 left-1 rounded bg-amber-500/90 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                    Pending
                  </div>
                )}

                <AnimatePresence>
                  {img._justUploaded && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex items-center justify-center bg-emerald-500/70"
                    >
                      <CheckCircle2 className="size-8 text-white" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {images.length === 0 && (
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <ImageIcon className="size-3.5" />
          No images yet for this variant
        </div>
      )}
    </div>
  );
}
