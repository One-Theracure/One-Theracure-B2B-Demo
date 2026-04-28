import { useState, useEffect } from "react";

const STORAGE_KEY = "ot-workspace-layout";
const DEFAULT_SIZES = [20, 55, 25];

export function useWorkspaceLayout() {
  const getSizes = (): number[] => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length === 3 && parsed.every(n => typeof n === "number")) {
          return parsed;
        }
      }
    } catch {}
    return [...DEFAULT_SIZES];
  };

  const [sizes, setSizes] = useState<number[]>(getSizes);
  const [layoutKey, setLayoutKey] = useState(0);

  const saveSizes = (newSizes: number[]) => {
    setSizes(newSizes);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSizes));
    } catch {}
  };

  const resetLayout = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    setSizes([...DEFAULT_SIZES]);
    setLayoutKey(k => k + 1);
  };

  useEffect(() => {
    const handler = () => resetLayout();
    window.addEventListener("workspace:reset-layout", handler);
    return () => window.removeEventListener("workspace:reset-layout", handler);
  }, []);

  return { sizes, saveSizes, resetLayout, layoutKey };
}
