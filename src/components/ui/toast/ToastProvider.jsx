import { createContext, useCallback, useContext, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";
import { cn } from "../../../utillls/common";

const ToastContext = createContext(null);

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

const ACCENTS = {
  success: "text-emerald-600 bg-emerald-50 border-emerald-200",
  error: "text-red-600 bg-red-50 border-red-200",
  info: "text-primary bg-primary/5 border-primary/20",
};

let idCounter = 0;

function ToastItem({ toast, onDismiss }) {
  const { id, type, message, duration } = toast;
  const Icon = ICONS[type] || Info;
  const timerRef = useRef(null);

  const startTimer = useCallback(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onDismiss(id), duration);
  }, [id, duration, onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -16, x: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 60, scale: 0.9, transition: { duration: 0.18 } }}
      transition={{ type: "spring", stiffness: 380, damping: 30 }}
      onMouseEnter={() => clearTimeout(timerRef.current)}
      onMouseLeave={startTimer}
      onAnimationComplete={() => startTimer()}
      className={cn(
        "pointer-events-auto relative w-80 overflow-hidden rounded-xl border bg-white shadow-lg",
        "flex items-start gap-3 p-4"
      )}
      role="status"
    >
      <div className={cn("flex size-8 shrink-0 items-center justify-center rounded-full border", ACCENTS[type])}>
        <Icon className="size-4.5" />
      </div>
      <div className="min-w-0 flex-1 pt-0.5">
        {toast.title && <p className="text-sm font-semibold text-gray-900">{toast.title}</p>}
        <p className="text-sm text-gray-600 break-words">{message}</p>
      </div>
      <button
        onClick={() => onDismiss(id)}
        className="shrink-0 rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
      >
        <X className="size-4" />
      </button>

      <motion.div
        className={cn("absolute bottom-0 left-0 h-0.5", type === "error" ? "bg-red-400" : type === "success" ? "bg-emerald-400" : "bg-primary")}
        initial={{ width: "100%" }}
        animate={{ width: "0%" }}
        transition={{ duration: duration / 1000, ease: "linear" }}
      />
    </motion.div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    ({ type = "info", title, message, duration = 4000 }) => {
      const id = ++idCounter;
      setToasts((prev) => [...prev, { id, type, title, message, duration }]);
      return id;
    },
    []
  );

  const toast = {
    success: (message, title) => push({ type: "success", message, title }),
    error: (message, title) => push({ type: "error", message, title, duration: 6000 }),
    info: (message, title) => push({ type: "info", message, title }),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="pointer-events-none fixed top-4 right-4 z-[100] flex flex-col gap-2">
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
