import { LayoutGrid, List, Table2 } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "../../../utillls/common";

const OPTIONS = [
  { key: "grid", label: "Grid", icon: LayoutGrid },
  { key: "list", label: "List", icon: List },
  { key: "table", label: "Table", icon: Table2 },
];

export default function ViewToggle({ value, onChange }) {
  return (
    <div className="relative flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1">
      {OPTIONS.map((opt) => {
        const Icon = opt.icon;
        const active = value === opt.key;
        return (
          <button
            key={opt.key}
            onClick={() => onChange(opt.key)}
            className={cn(
              "relative z-10 flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              active ? "text-primary-hover" : "text-gray-500 hover:text-gray-700"
            )}
          >
            {active && (
              <motion.div
                layoutId="view-toggle-pill"
                className="absolute inset-0 -z-10 rounded-md bg-white shadow-glow-sm ring-1 ring-glow/20"
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
              />
            )}
            <Icon className="size-4" />
            <span className="hidden sm:inline">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
