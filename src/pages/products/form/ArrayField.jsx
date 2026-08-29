import { AnimatePresence, motion } from "framer-motion";
import { Plus, X } from "lucide-react";
import { inputClass } from "./FormField";

export default function ArrayField({ label, values = [], onChange, placeholder, hint }) {
  const update = (i, val) => {
    const next = [...values];
    next[i] = val;
    onChange(next);
  };
  const add = () => onChange([...values, ""]);
  const remove = (i) => onChange(values.filter((_, idx) => idx !== i));

  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs font-semibold text-gray-600">{label}</label>}
      <div className="flex flex-col gap-2">
        <AnimatePresence initial={false}>
          {values.map((val, i) => (
            <motion.div
              key={i}
              layout
              initial={{ opacity: 0, height: 0, y: -6 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -6, transition: { duration: 0.15 } }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2"
            >
              <input
                value={val}
                onChange={(e) => update(i, e.target.value)}
                placeholder={placeholder}
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => remove(i)}
                className="flex size-8 shrink-0 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-500"
              >
                <X className="size-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <button
        type="button"
        onClick={add}
        className="flex w-fit items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-primary transition hover:bg-primary/5"
      >
        <Plus className="size-3.5" />
        Add {label ? label.toLowerCase().replace(/s$/, "") : "item"}
      </button>
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  );
}
