import { motion } from "framer-motion";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChevronLeft, ChevronRight, ExternalLink, GripVertical, Pencil, Trash2 } from "lucide-react";
import { cn } from "../../../utillls/common";
import { formatDate, thumbUrl } from "../galleryUtils";

/**
 * Sortable gallery tile. Drag via the grip handle (mouse, touch, or keyboard: focus the grip,
 * Space to lift, arrows to move, Space to drop); the chevrons move one slot for quick nudges.
 * `sortable` is false while a search filter is active, since positions would be ambiguous.
 */
export default function GalleryCard({ item, position, total, sortable, reduced, onEdit, onDelete, onMove }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: item._id,
    disabled: !sortable,
  });

  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <li ref={setNodeRef} style={style} className={cn("relative", isDragging && "z-20")}>
      <motion.div
        initial={reduced ? false : { opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30, delay: reduced ? 0 : Math.min(position, 12) * 0.035 }}
        className={cn(
          "group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-white transition-[box-shadow,border-color] duration-300",
          isDragging
            ? "scale-[1.02] border-glow shadow-glow-md ring-4 ring-glow/15"
            : "border-gray-200/80 shadow-glass-sm hover:border-glow/40 hover:shadow-glass-lg"
        )}
      >
        {/* Thumbnail */}
        <button
          type="button"
          onClick={() => onEdit(item)}
          className="relative block aspect-[4/3] overflow-hidden bg-gray-100 outline-none"
          aria-label={`Edit ${item.title}`}
        >
          <img
            src={thumbUrl(item.imageUrl)}
            alt=""
            loading="lazy"
            draggable={false}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary-deep/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <span className="absolute bottom-3 left-3 rounded-full bg-primary-deep/80 px-2 py-0.5 text-[10px] font-bold tabular-nums tracking-wider text-accent-light shadow-glass-sm backdrop-blur-md">
            #{position + 1}
          </span>
        </button>

        {/* Drag handle */}
        {sortable && (
          <button
            type="button"
            ref={setActivatorNodeRef}
            {...attributes}
            {...listeners}
            aria-label={`Reorder ${item.title} (position ${position + 1} of ${total})`}
            title="Drag to reorder"
            className={cn(
              "absolute left-3 top-3 flex size-8 touch-none items-center justify-center rounded-lg bg-white/90 text-gray-500 shadow-glass-md ring-1 ring-black/5 backdrop-blur-md transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow",
              isDragging ? "cursor-grabbing text-primary" : "cursor-grab"
            )}
          >
            <GripVertical className="size-4" />
          </button>
        )}

        {/* Row actions — always visible on touch, reveal on hover for pointer devices */}
        <div className="absolute right-3 top-3 flex gap-1 transition-all duration-200 [@media(hover:hover)]:translate-y-1 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-focus-within:translate-y-0 [@media(hover:hover)]:group-focus-within:opacity-100 [@media(hover:hover)]:group-hover:translate-y-0 [@media(hover:hover)]:group-hover:opacity-100">
          {[
            { icon: Pencil, label: "Edit", onClick: () => onEdit(item), cls: "hover:text-primary" },
            { icon: ExternalLink, label: "Open image", href: item.imageUrl, cls: "hover:text-primary" },
            { icon: Trash2, label: "Delete", onClick: () => onDelete(item), cls: "hover:bg-red-50 hover:text-red-600" },
          ].map(({ icon: Icon, label, onClick, href, cls }) => {
            const common = cn(
              "flex size-8 items-center justify-center rounded-lg bg-white/90 text-gray-500 shadow-glass-md ring-1 ring-black/5 backdrop-blur-md transition",
              cls
            );
            return href ? (
              <a key={label} href={href} target="_blank" rel="noreferrer" title={label} aria-label={label} className={common}>
                <Icon className="size-4" />
              </a>
            ) : (
              <button key={label} type="button" onClick={onClick} title={label} aria-label={`${label} ${item.title}`} className={common}>
                <Icon className="size-4" />
              </button>
            );
          })}
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col border-t border-gray-100 p-4">
          <h3 className="line-clamp-1 text-[15px] font-semibold leading-snug text-gray-900" title={item.title}>
            {item.title}
          </h3>
          {item.description ? (
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-gray-500">{item.description}</p>
          ) : (
            <p className="mt-1 text-xs italic text-gray-400">No description</p>
          )}
          <div className="mt-auto flex items-center justify-between gap-2 pt-3">
            <span className="text-[11px] tabular-nums text-gray-400">{formatDate(item.updatedAt || item.createdAt)}</span>
            {sortable && (
              <div className="flex items-center gap-0.5">
                {[
                  { icon: ChevronLeft, label: "Move earlier", dir: -1, disabled: position === 0 },
                  { icon: ChevronRight, label: "Move later", dir: 1, disabled: position === total - 1 },
                ].map(({ icon: Icon, label, dir, disabled }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => onMove(item, dir)}
                    disabled={disabled}
                    title={label}
                    aria-label={`${label}: ${item.title}`}
                    className="rounded-md p-1 text-gray-400 transition hover:bg-gray-100 hover:text-primary disabled:pointer-events-none disabled:opacity-30"
                  >
                    <Icon className="size-4" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </li>
  );
}
