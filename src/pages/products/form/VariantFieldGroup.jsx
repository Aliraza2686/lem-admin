import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Trash2, ChevronDown, GripVertical } from "lucide-react";
import FormField, { inputClass, errorInputClass } from "./FormField";
import ArrayField from "./ArrayField";
import ImageUploadGrid from "./ImageUploadGrid";
import { slugify, slugifyLive } from "../productUtils";
import { cn } from "../../../utillls/common";

export default function VariantFieldGroup({ productId, variants, onChange, onUpdateVariant, errors = [] }) {
  const [openIndex, setOpenIndex] = useState(0);

  const update = (i, patch) => {
    const next = [...variants];
    next[i] = { ...next[i], ...patch };
    onChange(next);
  };

  const add = () => {
    onChange([
      ...variants,
      { key: "", label: "", swatch: "#8b5a3c", desc: "", purity: "", quality: "", highlights: [], images: [] },
    ]);
    setOpenIndex(variants.length);
  };

  const remove = (i) => {
    onChange(variants.filter((_, idx) => idx !== i));
  };

  return (
    <div className="flex flex-col gap-3">
      <AnimatePresence initial={false}>
        {variants.map((variant, i) => {
          const isOpen = openIndex === i;
          const err = errors[i];
          return (
            <motion.div
              key={i}
              layout
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0, transition: { duration: 0.2 } }}
              transition={{ duration: 0.25 }}
              className="glass-panel overflow-hidden rounded-xl"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? -1 : i)}
                className="flex w-full items-center justify-between gap-3 px-4 py-3"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <GripVertical className="size-4 shrink-0 text-gray-300" />
                  <span
                    className="size-4 shrink-0 rounded-full border border-gray-200"
                    style={{ background: variant.swatch || "#e5e7eb" }}
                  />
                  <span className="truncate text-sm font-semibold text-gray-800">
                    {variant.label || variant.key || `Variant ${i + 1}`}
                  </span>
                  {err && <span className="shrink-0 text-xs font-medium text-red-500">· {err}</span>}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <span
                    role="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      remove(i);
                    }}
                    className="flex size-7 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-500"
                  >
                    <Trash2 className="size-4" />
                  </span>
                  <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="size-4 text-gray-400" />
                  </motion.div>
                </div>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden border-t border-gray-100"
                  >
                    <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2">
                      <FormField label="Variant key" required error={err} hint="Used in the image upload URL — must be unique per product">
                        <input
                          value={variant.key}
                          onChange={(e) => update(i, { key: slugifyLive(e.target.value) })}
                          onBlur={() => update(i, { key: slugify(variant.key) })}
                          className={cn(inputClass, err && errorInputClass)}
                          placeholder="e.g. pink, ore, graded"
                        />
                      </FormField>
                      <FormField label="Label">
                        <input
                          value={variant.label || ""}
                          onChange={(e) => update(i, { label: e.target.value })}
                          className={inputClass}
                          placeholder="e.g. Pink Salt"
                        />
                      </FormField>
                      <FormField label="Swatch color">
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={variant.swatch || "#8b5a3c"}
                            onChange={(e) => update(i, { swatch: e.target.value })}
                            className="size-9 shrink-0 cursor-pointer rounded-lg border border-gray-300 p-0.5"
                          />
                          <input
                            value={variant.swatch || ""}
                            onChange={(e) => update(i, { swatch: e.target.value })}
                            className={inputClass}
                            placeholder="#8b5a3c"
                          />
                        </div>
                      </FormField>
                      <FormField label="Purity">
                        <input
                          value={variant.purity || ""}
                          onChange={(e) => update(i, { purity: e.target.value })}
                          className={inputClass}
                          placeholder="e.g. More than 98% SiO₂"
                        />
                      </FormField>
                      <FormField label="Quality" className="sm:col-span-2">
                        <input
                          value={variant.quality || ""}
                          onChange={(e) => update(i, { quality: e.target.value })}
                          className={inputClass}
                          placeholder="e.g. Export Grade"
                        />
                      </FormField>
                      <FormField label="Description" className="sm:col-span-2">
                        <textarea
                          value={variant.desc || ""}
                          onChange={(e) => update(i, { desc: e.target.value })}
                          rows={3}
                          className={inputClass}
                        />
                      </FormField>
                      <div className="sm:col-span-2">
                        <ArrayField
                          label="Highlights"
                          values={variant.highlights || []}
                          onChange={(v) => update(i, { highlights: v })}
                          placeholder="e.g. Sourced from Balochistan, Pakistan"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="mb-1.5 block text-xs font-semibold text-gray-600">Images</label>
                        <ImageUploadGrid
                          productId={productId}
                          variantKey={variant.key}
                          images={variant.images || []}
                          onChange={(imagesOrUpdater) =>
                            onUpdateVariant(i, (v) => ({
                              ...v,
                              images: typeof imagesOrUpdater === "function" ? imagesOrUpdater(v.images || []) : imagesOrUpdater,
                            }))
                          }
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </AnimatePresence>

      <button
        type="button"
        onClick={add}
        className="flex w-fit items-center gap-1.5 rounded-lg border border-dashed border-gray-300 px-3 py-2 text-sm font-medium text-primary transition hover:bg-primary/5"
      >
        <Plus className="size-4" />
        Add variant
      </button>
    </div>
  );
}
