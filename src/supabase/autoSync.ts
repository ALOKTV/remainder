import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { getCurrentSession } from "./auth";
import { getSupabaseClient } from "./client";
import { pullCloudToLocal, pushLocalToCloud, SyncResult } from "./sync";

type CloudTable = "tasks" | "today_items" | "reminders" | "notes";
type PendingDelete = { table: CloudTable; id: string };

type SyncOptions = {
  pull?: boolean;
  push?: boolean;
};

const PENDING_DELETES_KEY = "remainder.pendingCloudDeletes.v1";
const EMPTY_RESULT: SyncResult = { tasks: 0, todayItems: 0, reminders: 0, notes: 0 };

let pushTimer: ReturnType<typeof setTimeout> | null = null;
let syncInFlight: Promise<SyncResult> | null = null;
let pushQueued = false;

export function isProbablyOnline(): boolean {
  if (Platform.OS === "web" && typeof navigator !== "undefined" && "onLine" in navigator) {
    return navigator.onLine;
  }
  return true;
}

export async function queueCloudPush(): Promise<void> {
  pushQueued = true;
  scheduleQueuedPush();
}

export async function queueCloudDelete(table: CloudTable, id: string): Promise<void> {
  const deletes = await readPendingDeletes();
  if (!deletes.some((item) => item.table === table && item.id === id)) {
    deletes.push({ table, id });
    await writePendingDeletes(deletes);
  }
  pushQueued = true;
  scheduleQueuedPush();
}

export async function syncCloudNow(options: SyncOptions = { pull: true, push: true }): Promise<SyncResult> {
  if (syncInFlight) return syncInFlight;
  syncInFlight = runSync(options).finally(() => {
    syncInFlight = null;
  });
  return syncInFlight;
}

function scheduleQueuedPush(): void {
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(() => {
    pushTimer = null;
    void syncCloudNow({ pull: false, push: true }).catch((error) => {
      console.warn("Cloud auto-push failed.", error);
    });
  }, 1200);
}

async function runSync({ pull = true, push = true }: SyncOptions): Promise<SyncResult> {
  if (!isProbablyOnline()) return EMPTY_RESULT;

  const session = await getCurrentSession().catch(() => null);
  if (!session) return EMPTY_RESULT;

  await flushPendingDeletes();

  let result = EMPTY_RESULT;
  if (pull) result = addResults(result, await pullCloudToLocal());
  if (push || pushQueued) {
    result = addResults(result, await pushLocalToCloud());
    pushQueued = false;
  }
  return result;
}

async function flushPendingDeletes(): Promise<void> {
  const deletes = await readPendingDeletes();
  if (deletes.length === 0) return;

  const supabase = getSupabaseClient();
  const remaining: PendingDelete[] = [];

  for (const item of deletes) {
    const now = new Date().toISOString();
    const { error } = await supabase
      .from(item.table)
      .update({ is_deleted: true, deleted_at: now, updated_at: now })
      .eq("id", item.id);

    if (error) remaining.push(item);
  }

  await writePendingDeletes(remaining);
}

async function readPendingDeletes(): Promise<PendingDelete[]> {
  const raw = await AsyncStorage.getItem(PENDING_DELETES_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isPendingDelete) : [];
  } catch {
    return [];
  }
}

async function writePendingDeletes(deletes: PendingDelete[]): Promise<void> {
  if (deletes.length === 0) {
    await AsyncStorage.removeItem(PENDING_DELETES_KEY);
    return;
  }
  await AsyncStorage.setItem(PENDING_DELETES_KEY, JSON.stringify(deletes));
}

function isPendingDelete(value: unknown): value is PendingDelete {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<PendingDelete>;
  return ["tasks", "today_items", "reminders", "notes"].includes(String(item.table)) && typeof item.id === "string";
}

function addResults(left: SyncResult, right: SyncResult): SyncResult {
  return {
    tasks: left.tasks + right.tasks,
    todayItems: left.todayItems + right.todayItems,
    reminders: left.reminders + right.reminders,
    notes: left.notes + right.notes,
  };
}
