import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { UploadCloud, X, AlertTriangle, GripVertical } from "lucide-react";
import { cn } from "../../../utillls/common";

// The gallery has no per-image add/remove/reorder endpoint: a PUT with no gallery
// files leaves the existing gallery untouched; a PUT with ANY gallery files
// wholesale-replaces it (old Cloudinary assets deleted). So this control either
// stages nothing (existing gallery survives untouched) or stages a full
// replacement set — there is no partial-edit affordance to fake here.
export default function GalleryUpload({ existingGallery = [], stagedFiles = [], onStagedChange }) {
  const [dragOver, setDragOver] = useState(false);
  const [dragIndex, setDragIndex] = useState(null);
  const inputRef = useRef(null);

  const addFiles = (fileList) => {
    const files = Array.from(fileList).filter((f) => f.type.startsWith("image/"));
    if (files.length) onStagedChange([...stagedFiles, ...files]);
  };

  const removeStaged = (idx) => onStagedChange(stagedFiles.filter((_, i) => i !== idx));

  const reorder = (from, to) => {
    if (from === to || to < 0 || to >= stagedFiles.length) return;
    const next = [...stagedFiles];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onStagedChange(next);
  };

  return (
    <div className="flex flex-col gap-3">
      {existingGallery.length > 0 && (
        <div>
          <p className="mb-1.5 text-xs font-semibold text-gray-500">
            Current gallery ({existingGallery.length}) — read-only
          </p>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
            {existingGallery.map((img) => (
              <div key={img.publicId || img.url} className="aspect-square overflow-hidden rounded-lg bg-gray-100">
                <img src={img.url} alt={img.caption || ""} className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}

      {existingGallery.length > 0 && stagedFiles.length > 0 && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
          Saving will replace the entire gallery above with the {stagedFiles.length} new image
          {stagedFiles.length > 1 ? "s" : ""} below — individual add/remove isn't supported by the API.
        </div>
      )}

      <motion.div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          addFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        animate={dragOver ? { scale: 1.015, borderColor: "#6366f1" } : { scale: 1, borderColor: "#d1d5db" }}
        transition={{ duration: 0.15 }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed bg-gray-50/50 px-4 py-6 text-center",
          dragOver && "bg-indigo-50/60"
        )}
      >
        <UploadCloud className={cn("size-6", dragOver ? "text-indigo-500" : "text-gray-400")} />
        <p className="text-sm text-gray-500">
          <span className="font-medium text-indigo-600">Click to upload</span> or drag and drop
          {existingGallery.length > 0 ? " a replacement gallery" : " gallery images"}
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </motion.div>

      {stagedFiles.length > 0 && (
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
          <AnimatePresence initial={false}>
            {stagedFiles.map((file, i) => (
              <motion.div
                key={file.name + file.lastModified + i}
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
                <img src={URL.createObjectURL(file)} alt="" className="h-full w-full object-cover" />
                <div className="absolute top-1 left-1 flex cursor-grab items-center justify-center rounded bg-white/80 p-0.5 text-gray-500 opacity-0 transition-opacity group-hover:opacity-100">
                  <GripVertical className="size-3.5" />
                </div>
                <button
                  type="button"
                  onClick={() => removeStaged(i)}
                  className="absolute right-1 bottom-1 flex size-6 items-center justify-center rounded-full bg-white/90 text-red-500 opacity-0 shadow transition-opacity group-hover:opacity-100"
                >
                  <X className="size-3.5" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
