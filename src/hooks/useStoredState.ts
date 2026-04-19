import { useState, useEffect } from "react";

export function useStoredState<T>(key: string, defaultValue: T | (() => T)) {
  const [state, setState] = useState<T>(() => {
    if (typeof window === "undefined") {
      return typeof defaultValue === "function"
        ? (defaultValue as () => T)()
        : defaultValue;
    }

    try {
      const raw = window.localStorage.getItem(key);
      if (raw) {
        return JSON.parse(raw) as T;
      }
    } catch {
      // ignore malformed stored state
    }

    return typeof defaultValue === "function"
      ? (defaultValue as () => T)()
      : defaultValue;
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch {
      // ignore storage failures
    }
  }, [key, state]);

  return [state, setState] as const;
}
