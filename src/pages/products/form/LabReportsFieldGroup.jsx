import { AnimatePresence, motion } from "framer-motion";
import { Plus, Trash2, FlaskConical } from "lucide-react";
import { inputClass } from "./FormField";

// The API has no upload endpoint for lab report files (unlike variant images) —
// `file` is a plain string on the schema, so this stays a manual URL field.
export default function LabReportsFieldGroup({ reports = [], onChange }) {
  const update = (i, patch) => {
    const next = [...reports];
    next[i] = { ...next[i], ...patch };
    onChange(next);
  };
  const add = () => onChange([...reports, { name: "", file: "", size: "" }]);
  const remove = (i) => onChange(reports.filter((_, idx) => idx !== i));

  return (
    <div className="flex flex-col gap-3">
      <AnimatePresence initial={false}>
        {reports.map((report, i) => (
          <motion.div
            key={i}
            layout
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0, transition: { duration: 0.2 } }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-1 gap-2 overflow-hidden rounded-xl border border-gray-200 p-3 sm:grid-cols-[1fr_1fr_100px_auto]"
          >
            <input
              value={report.name || ""}
              onChange={(e) => update(i, { name: e.target.value })}
              placeholder="Report name"
              className={inputClass}
            />
            <input
              value={report.file || ""}
              onChange={(e) => update(i, { file: e.target.value })}
              placeholder="File URL"
              className={inputClass}
            />
            <input
              value={report.size || ""}
              onChange={(e) => update(i, { size: e.target.value })}
              placeholder="Size"
              className={inputClass}
            />
            <button
              type="button"
              onClick={() => remove(i)}
              className="flex items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-500 sm:size-9"
            >
              <Trash2 className="size-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>

      <button
        type="button"
        onClick={add}
        className="flex w-fit items-center gap-1.5 rounded-lg border border-dashed border-gray-300 px-3 py-2 text-sm font-medium text-primary transition hover:bg-primary/5"
      >
        <Plus className="size-4" />
        Add lab report
      </button>

      {reports.length === 0 && (
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <FlaskConical className="size-3.5" />
          No lab reports linked
        </div>
      )}
    </div>
  );
}
