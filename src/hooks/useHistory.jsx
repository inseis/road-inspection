/* ─── History hook ───────────────────────────────────────────── */

import { useCallback, useEffect, useState } from "react";
import { STORAGE_KEY } from "../constants/storage";

export function useHistory() {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    try {
      const r = localStorage.getItem(STORAGE_KEY);

      if (r) setRecords(JSON.parse(r));
    } catch {
      // localStorage 읽기 실패 무시
    }
  }, []);

  const saveRecord = useCallback((data) => {
    const rec = {
      ...data,
      id: `r_${Date.now()}`,
      created_at: new Date().toISOString(),
    };

    setRecords((prev) => {
      const next = [rec, ...prev].slice(0, 20);

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // localStorage 저장 실패 무시
      }

      return next;
    });

    return rec;
  }, []);

  const removeRecord = useCallback((id) => {
    setRecords((prev) => {
      const next = prev.filter((r) => r.id !== id);

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {}

      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}

    setRecords([]);
  }, []);

  return { records, saveRecord, removeRecord, clearAll };
}
