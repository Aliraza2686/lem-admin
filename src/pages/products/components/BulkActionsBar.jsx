import { AnimatePresence, motion } from "framer-motion";
import { Trash2, X } from "lucide-react";

export default function BulkActionsBar({ count, onClear, onDeleteSelected }) {
  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, y: -10, height: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 32 }}
          className="overflow-hidden"
        >
          <div className="flex items-center justify-between rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5">
            <div className="flex items-center gap-2 text-sm font-medium text-indigo-700">
              <span className="flex size-5 items-center justify-center rounded-full bg-indigo-600 text-xs text-white">
                {count}
              </span>
              selected
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onDeleteSelected}
                className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700"
              >
                <Trash2 className="size-3.5" />
                Delete selected
              </button>
              <button
                onClick={onClear}
                className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-indigo-600 transition hover:bg-indigo-100"
              >
                <X className="size-3.5" />
                Clear
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
