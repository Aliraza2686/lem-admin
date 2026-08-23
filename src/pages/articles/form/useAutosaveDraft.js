import { useEffect, useRef } from "react";

const KEY_PREFIX = "article-draft:";

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

// File objects (coverImageFile / galleryFiles) aren't JSON-serializable and aren't
// persisted — a refresh loses staged-but-unsaved images, everything else survives.
export function useAutosaveDraft(id, values, enabled) {
  const timerRef = useRef(null);

  useEffect(() => {
    if (!enabled) return;
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const { coverImageFile, galleryFiles, ...serializable } = values;
      localStorage.setItem(draftKey(id), JSON.stringify({ savedAt: Date.now(), values: serializable }));
    }, 800);
    return () => clearTimeout(timerRef.current);
  }, [id, values, enabled]);
}
