import { useSyncQueueStore } from "../store/syncQueueStore";

export function getPendingSyncCount() {
  return useSyncQueueStore.getState().queue.length;
}

export function hasPendingSync() {
  return getPendingSyncCount() > 0;
}

export function getSyncStatusLabel() {
  const count = getPendingSyncCount();
  if (count === 0) return "All updates saved";
  if (count === 1) return "1 update waiting to sync";
  return `${count} updates waiting to sync`;
}
