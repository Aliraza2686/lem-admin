import { useEffect, useRef } from "react";

const KEY_PREFIX = "product-draft:";

export function draftKey(id) {
  return `${KEY_PREFIX}${id || "new"}`;
}

export function loadDraft(id) {
  try {
    const raw = localStorage.getItem(draftKey(id));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearDraft(id) {
  localStorage.removeItem(draftKey(id));
}

// Debounced autosave of form values to localStorage; images (File objects) are stripped
// since they aren't serializable — only already-uploaded image metadata survives a refresh.
export function useAutosaveDraft(id, values, enabled) {
  const timerRef = useRef(null);

  useEffect(() => {
    if (!enabled) return;
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const serializable = {
        ...values,
        variants: (values.variants || []).map((v) => ({
          ...v,
          images: (v.images || []).filter((img) => !img._pending && !img._uploading).map(({ src, publicId, is_video }) => ({ src, publicId, is_video })),
        })),
      };
      localStorage.setItem(draftKey(id), JSON.stringify({ savedAt: Date.now(), values: serializable }));
    }, 800);
    return () => clearTimeout(timerRef.current);
  }, [id, values, enabled]);
}
