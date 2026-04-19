import { useStoredState } from "./useStoredState";

const STORAGE_KEY = "cult-classics-notes";

export function useNotes() {
  const [notes, setNotes] = useStoredState<Record<string, string>>(STORAGE_KEY, {});

  const setNote = (itemId: string, note: string) => {
    setNotes((current) => ({ ...current, [itemId]: note }));
  };

  return { notes, setNote };
}
