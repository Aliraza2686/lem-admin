import { useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import Modal from "../../../components/ui/modal/Modal";

export default function DeleteConfirmModal({
  open,
  onClose,
  onConfirm,
  productName,
  loading,
  count = 1,
  entityLabel = "product",
  assetsNote = "including all variant images stored on Cloudinary",
}) {
  const [typed, setTyped] = useState("");
  const isBulk = count > 1;
  const confirmTarget = isBulk ? `DELETE ${count}` : productName;
  const matches = typed.trim() === confirmTarget;

  const handleClose = () => {
    if (loading) return;
    setTyped("");
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={isBulk ? `Delete ${count} ${entityLabel}s` : `Delete ${entityLabel}`}
      size="sm"
      footer={
        <div className="flex justify-end gap-2">
          <button
            onClick={handleClose}
            disabled={loading}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!matches || loading}
            className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading && <Loader2 className="size-4 animate-spin" />}
            {loading ? "Deleting..." : "Delete permanently"}
          </button>
        </div>
      }
    >
      <div className="flex gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
          <AlertTriangle className="size-5" />
        </div>
        <div className="text-sm text-gray-600">
          <p>
            This will permanently delete{" "}
            {isBulk ? (
              <span className="font-semibold text-gray-900">{count} {entityLabel}s</span>
            ) : (
              <>
                <span className="font-semibold text-gray-900">{productName}</span>
              </>
            )}
            , {assetsNote}. This action cannot be undone.
          </p>
          <label className="mt-4 block">
            <span className="mb-1.5 block text-xs font-medium text-gray-500">
              Type <span className="font-mono font-semibold text-gray-800">{confirmTarget}</span> to confirm
            </span>
            <input
              autoFocus
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
              placeholder={confirmTarget}
            />
          </label>
        </div>
      </div>
    </Modal>
  );
}
