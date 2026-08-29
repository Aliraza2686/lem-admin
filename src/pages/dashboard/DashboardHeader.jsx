import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { PackagePlus, FilePlus2 } from "lucide-react";

const getGreeting = (hour) => {
  if (hour < 5) return "Working late";
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

export default function DashboardHeader() {
  const navigate = useNavigate();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  })();
  const firstName = (user?.name || user?.email?.split("@")[0] || "").split(" ")[0];

  const time = now.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  const date = now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });

  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: -12 }, visible: { opacity: 1, y: 0 } }}
      className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
    >
      <div>
        <div className="flex items-baseline gap-3">
          <span className="text-4xl font-semibold tabular-nums text-white">{time}</span>
          <span className="text-sm font-medium text-white/50">{date}</span>
        </div>
        <p className="mt-1 text-sm text-white/70">
          {getGreeting(now.getHours())}
          {firstName ? `, ${firstName}` : ""} — here's how things look today.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <motion.button
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.96 }}
          transition={{ type: "spring", stiffness: 400, damping: 24 }}
          onClick={() => navigate("/products/new")}
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur transition-colors duration-150 hover:border-glow/40 hover:shadow-glow-sm"
        >
          <PackagePlus className="size-4 text-glow" />
          Add Product
        </motion.button>
        <motion.button
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.96 }}
          transition={{ type: "spring", stiffness: 400, damping: 24 }}
          onClick={() => navigate("/articles/new")}
          className="flex items-center gap-2 rounded-xl bg-glow px-4 py-2.5 text-sm font-semibold text-primary-deep shadow-glow-sm transition-colors duration-150 hover:bg-glow-soft"
        >
          <FilePlus2 className="size-4" />
          Add Article
        </motion.button>
      </div>
    </motion.div>
  );
}
