import { useState } from "react";
import { Loader2, Rocket, Eye, Archive, RotateCcw } from "lucide-react";
import Modal from "../../../components/ui/modal/Modal";
import { useToast } from "../../../components/ui/toast/ToastProvider";
import { setArticleStatus } from "../../../api/articles";
import { STATUS_META } from "../articleUtils";
import { cn } from "../../../utillls/common";
import { TRANSITION_DEFS } from "./statusTransitions";

const TRANSITIONS = Object.fromEntries(
  Object.entries(TRANSITION_DEFS).map(([status, defs]) => [
    status,
    defs.map((t) => ({ ...t, icon: t.label === "Restore to draft" ? RotateCcw : t.to === "published" ? Rocket : t.to === "archived" ? Archive : Eye })),
  ])
);

export default function PublishActions({ articleId, status, title, compact, onChanged }) {
  const toast = useToast();
  const [pending, setPending] = useState(null); // transition object awaiting confirm
  const [loading, setLoading] = useState(false);

  const transitions = TRANSITIONS[status] || TRANSITIONS.draft;

  const runTransition = async () => {
    if (!pending) return;
    setLoading(true);
    const res = await setArticleStatus(articleId, pending.to);
    setLoading(false);
    if (res.success) {
      toast.success(`"${title}" is now ${STATUS_META[pending.to].label.toLowerCase()}.`, "Status updated");
      onChanged?.(res.data.article);
    } else {
      toast.error(res.message, "Could not update status");
    }
    setPending(null);
  };

  return (
    <>
      <div className={cn("flex items-center gap-1.5", compact && "gap-1")}>
        {transitions.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.to}
              type="button"
              title={t.label}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setPending(t);
              }}
              className={cn(
                "flex items-center gap-1.5 rounded-lg font-medium transition",
                compact
                  ? "size-8 justify-center text-gray-500 hover:bg-gray-100"
                  : "px-3 py-2 text-sm",
                !compact && t.tone === "primary" && "bg-indigo-600 text-white hover:bg-indigo-700",
                !compact && t.tone === "muted" && "border border-gray-200 text-gray-600 hover:bg-gray-50"
              )}
            >
              <Icon className="size-4" />
              {!compact && t.label}
            </button>
          );
        })}
      </div>

      <Modal
        open={!!pending}
        onClose={() => setPending(null)}
        title={pending ? `${pending.label} article` : ""}
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <button onClick={() => setPending(null)} disabled={loading} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
            <button
              onClick={runTransition}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading && <Loader2 className="size-4 animate-spin" />}
              Confirm {pending?.label}
            </button>
          </div>
        }
      >
        <p className="text-sm text-gray-600">
          <span className="font-semibold text-gray-900">{title}</span> — {pending?.confirm}
        </p>
      </Modal>
    </>
  );
}
