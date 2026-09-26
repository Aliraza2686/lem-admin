import { motion } from "framer-motion";
import { Award, ExternalLink, FileText, ImageIcon, Pencil, Trash2 } from "lucide-react";
import { cn } from "../../../utillls/common";
import { formatDate, formatLabelFor, storedFilenameFor } from "../certificationUtils";

export default function CertificationCard({ cert, index, reduced, onEdit, onDelete }) {
  const isImage = cert.fileType === "image";
  const label = formatLabelFor(cert);

  return (
    <motion.li
      layout={!reduced}
      initial={reduced ? false : { opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.18 } }}
      transition={{ type: "spring", stiffness: 300, damping: 30, delay: reduced ? 0 : Math.min(index, 12) * 0.035 }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-glass-sm transition-[box-shadow,border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-glow/40 hover:shadow-glass-lg"
    >
      {/* Preview */}
      <button
        type="button"
        onClick={() => onEdit(cert)}
        className="relative block aspect-[16/10] overflow-hidden bg-gray-50 outline-none"
        aria-label={`Edit ${cert.title}`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(13,31,53,0.07)_1px,transparent_0)] bg-[length:14px_14px]" />
        {isImage ? (
          <img
            src={cert.fileUrl}
            alt=""
            loading="lazy"
            className="relative h-full w-full object-contain p-4 transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="relative flex h-full items-center justify-center">
            <div className="relative flex h-24 w-19 flex-col items-center justify-end rounded-md border border-gray-200 bg-white pb-3 shadow-glass-md transition-transform duration-500 group-hover:-translate-y-1 group-hover:-rotate-2">
              <span className="absolute right-0 top-0 size-5 rounded-bl-md border-b border-l border-gray-200 bg-gray-50" />
              <div className="absolute left-3 right-5 top-4 space-y-1.5">
                <div className="h-1 w-3/4 rounded-full bg-primary/15" />
                <div className="h-1 w-full rounded-full bg-gray-100" />
                <div className="h-1 w-5/6 rounded-full bg-gray-100" />
              </div>
              <div className="mb-1.5 flex size-6 items-center justify-center rounded-full bg-gradient-to-br from-accent-light to-accent-dark text-white">
                <Award className="size-3.5" />
              </div>
              <span className="rounded bg-primary px-1.5 py-px text-[9px] font-bold tracking-wider text-accent-light">{label}</span>
            </div>
          </div>
        )}

        <span
          className={cn(
            "absolute left-3 top-3 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider shadow-glass-sm backdrop-blur-md",
            isImage ? "bg-white/85 text-sky-700 ring-1 ring-sky-200/70" : "bg-white/85 text-amber-800 ring-1 ring-amber-200/80"
          )}
        >
          {isImage ? <ImageIcon className="size-3" /> : <FileText className="size-3" />}
          {isImage ? "Image" : label}
        </span>
      </button>

      {/* Row actions — always visible on touch, reveal on hover for pointer devices */}
      <div className="absolute right-3 top-3 flex gap-1 transition-all duration-200 [@media(hover:hover)]:translate-y-1 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-focus-within:translate-y-0 [@media(hover:hover)]:group-focus-within:opacity-100 [@media(hover:hover)]:group-hover:translate-y-0 [@media(hover:hover)]:group-hover:opacity-100">
        {[
          { icon: Pencil, label: "Edit", onClick: () => onEdit(cert), cls: "hover:text-primary" },
          { icon: ExternalLink, label: "Open file", href: cert.fileUrl, cls: "hover:text-primary" },
          { icon: Trash2, label: "Delete", onClick: () => onDelete(cert), cls: "hover:bg-red-50 hover:text-red-600" },
        ].map(({ icon: Icon, label: l, onClick, href, cls }) => {
          const common = cn(
            "flex size-8 items-center justify-center rounded-lg bg-white/90 text-gray-500 shadow-glass-md ring-1 ring-black/5 backdrop-blur-md transition",
            cls
          );
          return href ? (
            <a key={l} href={href} target="_blank" rel="noreferrer" title={l} aria-label={l} className={common}>
              <Icon className="size-4" />
            </a>
          ) : (
            <button key={l} type="button" onClick={onClick} title={l} aria-label={`${l} ${cert.title}`} className={common}>
              <Icon className="size-4" />
            </button>
          );
        })}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col border-t border-gray-100 p-4">
        <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug text-gray-900">{cert.title}</h3>
        {cert.description ? (
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-gray-500">{cert.description}</p>
        ) : (
          <p className="mt-1 text-xs italic text-gray-400">No description</p>
        )}
        <div className="mt-auto flex items-center justify-between gap-2 pt-3 text-[11px] text-gray-400">
          <span className="truncate" title={isImage ? undefined : storedFilenameFor(cert)}>
            {isImage ? "Opens in viewer" : storedFilenameFor(cert)}
          </span>
          <span className="shrink-0 tabular-nums">{formatDate(cert.updatedAt || cert.createdAt)}</span>
        </div>
      </div>
    </motion.li>
  );
}
