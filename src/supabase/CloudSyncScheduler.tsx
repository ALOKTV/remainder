import { useEffect } from "react";
import { AppState } from "react-native";
import { useNoteStore } from "../store/noteStore";
import { useReminderStore } from "../store/reminderStore";
import { useTaskStore } from "../store/taskStore";
import { useTodayItemStore } from "../store/todayItemStore";
import { syncCloudNow } from "./autoSync";

export function CloudSyncScheduler() {
  const loadTasks = useTaskStore((state) => state.load);
  const loadTodayItems = useTodayItemStore((state) => state.load);
  const loadReminders = useReminderStore((state) => state.load);
  const loadNotes = useNoteStore((state) => state.load);

  useEffect(() => {
    let cancelled = false;

    async function syncAndReload() {
      try {
        await syncCloudNow({ pull: true, push: true });
        if (cancelled) return;
        await Promise.all([loadTasks(), loadTodayItems(), loadReminders(), loadNotes()]);
      } catch (error) {
        console.warn("Cloud auto-sync failed.", error);
      }
    }

    void syncAndReload();
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") void syncAndReload();
    });

    return () => {
      cancelled = true;
      subscription.remove();
    };
  }, [loadTasks, loadTodayItems, loadReminders, loadNotes]);

  return null;
}
