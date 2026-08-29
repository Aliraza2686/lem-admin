import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { PackagePlus, FilePlus2, Users2, ChevronRight } from "lucide-react";

const ACTIONS = [
  { label: "Add a product", desc: "New catalog entry", icon: PackagePlus, to: "/products/new" },
  { label: "Add an article", desc: "New blog post", icon: FilePlus2, to: "/articles/new" },
  { label: "Visitor log", desc: "Traffic & sessions", icon: Users2, to: "/visitors" },
];

export default function QuickActionsPanel() {
  const navigate = useNavigate();

  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
      className="dash-panel flex flex-col gap-1 rounded-2xl p-4"
    >
      <h3 className="px-1 pb-1 text-sm font-semibold text-white">Quick actions</h3>
      {ACTIONS.map((action, i) => {
        const Icon = action.icon;
        return (
          <motion.button
            key={action.label}
            onClick={() => navigate(action.to)}
            whileHover={{ x: 3 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            className="flex items-center gap-3 rounded-xl px-2 py-2.5 text-left transition-colors duration-150 hover:bg-white/5"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-glow/12 text-glow">
              <Icon className="size-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-white">{action.label}</span>
              <span className="block truncate text-xs text-white/40">{action.desc}</span>
            </span>
            <ChevronRight className="size-4 shrink-0 text-white/20" />
          </motion.button>
        );
      })}
    </motion.div>
  );
}
