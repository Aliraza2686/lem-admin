import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Package, Newspaper, Users, UserCircle, Plus } from "lucide-react";
import { formatCompactNumber } from "./dashboardUtils";

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0 },
};

export default function QuickNavTiles({ productsCount, articlesCount, visitorsCount, loading }) {
  const navigate = useNavigate();

  const tiles = [
    { label: "Products", value: productsCount, icon: Package, to: "/products", addTo: "/products/new" },
    { label: "Articles", value: articlesCount, icon: Newspaper, to: "/articles", addTo: "/articles/new", accent: "gold" },
    { label: "Visitors", value: visitorsCount, icon: Users, to: "/visitors" },
    { label: "Profile", value: null, icon: UserCircle, to: "/profile" },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {tiles.map((tile) => {
        const Icon = tile.icon;
        const gold = tile.accent === "gold";
        return (
          <motion.div
            key={tile.label}
            variants={itemVariants}
            whileHover={{ y: -3 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            onClick={() => navigate(tile.to)}
            className="dash-panel dash-panel-hover group relative cursor-pointer overflow-hidden rounded-2xl p-4"
          >
            <div className="flex items-start justify-between">
              <span
                className={`flex size-10 items-center justify-center rounded-xl ${
                  gold ? "bg-accent/15 text-accent-light" : "bg-glow/12 text-glow"
                }`}
              >
                <Icon className="size-5" />
              </span>
              {tile.addTo && (
                <button
                  title={`Add ${tile.label.toLowerCase().replace(/s$/, "")}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(tile.addTo);
                  }}
                  className="flex size-7 items-center justify-center rounded-lg text-white/30 opacity-0 transition-all duration-150 hover:bg-white/10 hover:text-white group-hover:opacity-100"
                >
                  <Plus className="size-4" />
                </button>
              )}
            </div>
            <p className="mt-3 text-xl font-semibold tabular-nums text-white">
              {loading ? "—" : tile.value === null ? "" : formatCompactNumber(tile.value)}
            </p>
            <p className="text-xs text-white/50">{tile.label}</p>
          </motion.div>
        );
      })}
    </div>
  );
}
