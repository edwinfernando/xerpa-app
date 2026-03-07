/**
 * Offline Storage — AsyncStorage para arquitectura Offline First
 *
 * Claves:
 *  - plan_entrenamiento_{YYYY-MM-DD}  — plan del día
 *  - pending_manual_efforts            — array de esfuerzos pendientes de sincronizar
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY_PREFIX_PLAN = 'plan_entrenamiento_';
const KEY_PENDING_EFFORTS = 'pending_manual_efforts';

// ─── Plan de hoy ─────────────────────────────────────────────
export function getPlanKey(dateStr) {
  return `${KEY_PREFIX_PLAN}${dateStr}`;
}

export async function saveTodayPlan(plan) {
  if (!plan) return;
  const hoy = new Date().toISOString().split('T')[0];
  const key = getPlanKey(hoy);
  await AsyncStorage.setItem(key, JSON.stringify(plan));
}

export async function getTodayPlan() {
  const hoy = new Date().toISOString().split('T')[0];
  const key = getPlanKey(hoy);
  const raw = await AsyncStorage.getItem(key);
  return raw ? JSON.parse(raw) : null;
}

// ─── Esfuerzos pendientes (para sincronización posterior) ────
export async function getPendingManualEfforts() {
  const raw = await AsyncStorage.getItem(KEY_PENDING_EFFORTS);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function appendPendingEffort(effort) {
  const pending = await getPendingManualEfforts();
  pending.push({ ...effort, _createdAt: new Date().toISOString() });
  await AsyncStorage.setItem(KEY_PENDING_EFFORTS, JSON.stringify(pending));
}

export async function removePendingEfforts(idsToRemove) {
  const pending = await getPendingManualEfforts();
  const filtered = pending.filter((_, i) => !idsToRemove.includes(i));
  await AsyncStorage.setItem(KEY_PENDING_EFFORTS, JSON.stringify(filtered));
}

export async function clearPendingEfforts() {
  await AsyncStorage.removeItem(KEY_PENDING_EFFORTS);
}
