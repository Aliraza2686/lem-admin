import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { UploadCloud, RefreshCw, ImageOff } from "lucide-react";
import { cn } from "../../../utillls/common";

// Cover image can only be REPLACED, never cleared to empty — the API has no
// "unset coverImage" affordance; omitting the field on update just leaves the
// existing one untouched, and create requires one to be present at all.
export default function CoverImageUpload({ existingUrl, file, onFileChange }) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const previewUrl = file ? URL.createObjectURL(file) : existingUrl;

  const pick = (fileList) => {
    const picked = fileList?.[0];
    if (picked && picked.type.startsWith("image/")) onFileChange(picked);
  };

  return (
    <div className="flex flex-col gap-2">
      <motion.div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          pick(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        animate={dragOver ? { scale: 1.01, borderColor: "#4fd1ff" } : { scale: 1, borderColor: "#d1d5db" }}
        transition={{ duration: 0.15 }}
        className={cn(
          "relative flex h-48 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed bg-gray-50/50",
          dragOver && "bg-primary/5 shadow-glow-sm"
        )}
      >
        {previewUrl ? (
          <>
            <img src={previewUrl} alt="Cover" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-black/0 transition-colors hover:bg-black/40" />
            <div className="absolute right-3 bottom-3 flex items-center gap-1.5 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-semibold text-gray-700 shadow">
              <RefreshCw className="size-3.5" />
              Replace
            </div>
            {file && (
              <span className="absolute top-3 left-3 rounded bg-amber-500/90 px-2 py-0.5 text-[10px] font-semibold text-white">
                Pending upload
              </span>
            )}
          </>
        ) : (
          <>
            <UploadCloud className={cn("size-8", dragOver ? "text-glow" : "text-gray-400")} />
            <p className="mt-2 text-sm text-gray-500">
              <span className="font-medium text-primary">Click to upload</span> or drag and drop
            </p>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-400">
              <ImageOff className="size-3" /> No cover image set
            </p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            pick(e.target.files);
            e.target.value = "";
          }}
        />
      </motion.div>
    </div>
  );
}
