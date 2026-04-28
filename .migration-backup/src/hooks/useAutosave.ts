import { useEffect, useRef, useCallback, useState } from "react";

const AUTOSAVE_PREFIX = "autosave:";

export type AutosaveStatus = "idle" | "saving" | "saved" | "error";

export function useAutosave<T>(
  key: string,
  data: T,
  delay: number = 2000
): { status: AutosaveStatus; lastSavedAt: string | null; restore: () => T | null } {
  const [status, setStatus] = useState<AutosaveStatus>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dataRef = useRef(data);

  dataRef.current = data;

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      try {
        setStatus("saving");
        const now = new Date().toISOString();
        localStorage.setItem(
          AUTOSAVE_PREFIX + key,
          JSON.stringify({ data: dataRef.current, savedAt: now })
        );
        setLastSavedAt(now);
        setStatus("saved");
      } catch {
        setStatus("error");
      }
    }, delay);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [key, data, delay]);

  const restore = useCallback((): T | null => {
    try {
      const raw = localStorage.getItem(AUTOSAVE_PREFIX + key);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed.data as T;
    } catch {
      return null;
    }
  }, [key]);

  return { status, lastSavedAt, restore };
}
