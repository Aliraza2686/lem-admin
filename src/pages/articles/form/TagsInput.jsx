import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

export default function TagsInput({ values = [], onChange, placeholder = "Add a tag and press Enter" }) {
  const [draft, setDraft] = useState("");

  const commit = (raw) => {
    const tag = raw.trim();
    if (!tag || values.includes(tag)) return;
    onChange([...values, tag]);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commit(draft);
      setDraft("");
    } else if (e.key === "Backspace" && !draft && values.length) {
      onChange(values.slice(0, -1));
    }
  };

  const remove = (tag) => onChange(values.filter((t) => t !== tag));

  return (
    <div className="transition-glow flex flex-wrap items-center gap-1.5 rounded-lg border border-gray-300 px-2 py-1.5 focus-within:border-glow focus-within:shadow-glow-sm">
      <AnimatePresence initial={false}>
        {values.map((tag) => (
          <motion.span
            key={tag}
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-1 rounded-full bg-primary/5 px-2.5 py-1 text-xs font-medium text-primary-hover"
          >
            {tag}
            <button type="button" onClick={() => remove(tag)} className="rounded-full hover:bg-primary/10">
              <X className="size-3" />
            </button>
          </motion.span>
        ))}
      </AnimatePresence>
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => {
          commit(draft);
          setDraft("");
        }}
        placeholder={values.length ? "" : placeholder}
        className="min-w-[120px] flex-1 border-none py-1 text-sm outline-none"
      />
    </div>
  );
}
