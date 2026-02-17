/**
 * Backend API client. Used by the Save button to update the database.
 * Set VITE_API_URL in .env (e.g. http://localhost:5000) or it defaults to that.
 */
import type { EventSave } from "./types";

const BASE = typeof import.meta.env.VITE_API_URL !== "undefined" ? import.meta.env.VITE_API_URL : "http://localhost:5000";

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
    credentials: "include",
  });
  if (!res.ok) throw new Error(await res.text().catch(() => res.statusText));
  return res.json();
}

export async function apiGetSaves(userId: string): Promise<EventSave[] | null> {
  try {
    const data = await fetchJson<EventSave[]>(`${BASE}/api/saves?userId=${encodeURIComponent(userId)}`);
    return Array.isArray(data) ? data : null;
  } catch {
    return null;
  }
}

export async function apiSaveEvent(userId: string, eventId: string): Promise<EventSave | null> {
  try {
    const data = await fetchJson<EventSave>(`${BASE}/api/saves`, {
      method: "POST",
      body: JSON.stringify({ userId, eventId }),
    });
    return data && typeof data.id === "string" ? data : null;
  } catch {
    return null;
  }
}

export async function apiUnsaveEvent(userId: string, eventId: string): Promise<boolean> {
  try {
    await fetch(`${BASE}/api/saves`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, eventId }),
    });
    return true;
  } catch {
    return false;
  }
}

export async function apiHealth(): Promise<{ ok: boolean; db?: boolean } | null> {
  try {
    return await fetchJson(`${BASE}/api/health`);
  } catch {
    return null;
  }
}
