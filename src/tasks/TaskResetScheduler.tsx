import { useEffect } from 'react';
import { AppState } from 'react-native';
import { useTaskStore } from '../store/taskStore';
import { getNextTaskResetAt } from '../utils/date';

const MAX_TIMEOUT_MS = 2_147_483_647;
const MIN_TIMEOUT_MS = 1_000;

export function TaskResetScheduler() {
  const load = useTaskStore((state) => state.load);

  useEffect(() => {
    let cancelled = false;
    let timeout: ReturnType<typeof setTimeout> | null = null;

    function clearScheduledReset() {
      if (!timeout) return;
      clearTimeout(timeout);
      timeout = null;
    }

    function scheduleNextReset() {
      clearScheduledReset();
      const delay = Math.min(
        Math.max(getNextTaskResetAt().getTime() - Date.now(), MIN_TIMEOUT_MS),
        MAX_TIMEOUT_MS,
      );

      timeout = setTimeout(() => {
        if (cancelled) return;
        void load().finally(() => {
          if (!cancelled) scheduleNextReset();
        });
      }, delay);
    }

    scheduleNextReset();
    const appStateSubscription = AppState.addEventListener('change', (state) => {
      if (state !== 'active') return;
      void load().finally(() => {
        if (!cancelled) scheduleNextReset();
      });
    });

    return () => {
      cancelled = true;
      clearScheduledReset();
      appStateSubscription.remove();
    };
  }, [load]);

  return null;
}
