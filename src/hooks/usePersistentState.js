import { useEffect, useState } from "react";

export function usePersistentState(key, defaultValue) {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw !== null) {
        return JSON.parse(raw);
      }
    } catch (err) {
      console.warn("Persist read failed", err);
    }
    return defaultValue;
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw !== null) {
        setState(JSON.parse(raw));
        return;
      }
    } catch (err) {
      console.warn("Persist reload failed", err);
    }
    setState(defaultValue);
  }, [key, defaultValue]);

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (err) {
      console.warn("Persist write failed", err);
    }
  }, [key, state]);

  return [state, setState];
}
