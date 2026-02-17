import { BUILDINGS, CATEGORIES, CLUBS, EVENTS, DEFAULT_MEMBERSHIPS, DEFAULT_ANNOUNCEMENTS, DEFAULT_USER } from "./seed-data";
import type { User, Building, Category, Club, Event, ClubMembership, EventSave, Reservation, Announcement, Notification } from "./types";

const KEYS = {
  INITIALIZED: "@byuconnect_initialized",
  USER: "@byuconnect_user",
  AUTH: "@byuconnect_auth",
  BUILDINGS: "@byuconnect_buildings",
  CATEGORIES: "@byuconnect_categories",
  CLUBS: "@byuconnect_clubs",
  EVENTS: "@byuconnect_events",
  MEMBERSHIPS: "@byuconnect_memberships",
  SAVES: "@byuconnect_saves",
  RESERVATIONS: "@byuconnect_reservations",
  ANNOUNCEMENTS: "@byuconnect_announcements",
  NOTIFICATIONS: "@byuconnect_notifications",
};

function getJson<T>(key: string, fallback: T): T {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch {
    return fallback;
  }
}

function setJson(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export async function initializeStore(): Promise<void> {
  if (localStorage.getItem(KEYS.INITIALIZED)) return;
  setJson(KEYS.BUILDINGS, BUILDINGS);
  setJson(KEYS.CATEGORIES, CATEGORIES);
  setJson(KEYS.CLUBS, CLUBS);
  setJson(KEYS.EVENTS, EVENTS);
  setJson(KEYS.MEMBERSHIPS, DEFAULT_MEMBERSHIPS);
  setJson(KEYS.SAVES, []);
  setJson(KEYS.RESERVATIONS, []);
  setJson(KEYS.ANNOUNCEMENTS, DEFAULT_ANNOUNCEMENTS);
  setJson(KEYS.NOTIFICATIONS, []);
  // Preserve existing auth: only set seed user when no user is stored yet
  if (!localStorage.getItem(KEYS.USER)) setJson(KEYS.USER, DEFAULT_USER);
  // Do not set AUTH here so a previous session stays signed in
  localStorage.setItem(KEYS.INITIALIZED, "true");
}

export async function resetStore(): Promise<void> {
  localStorage.removeItem(KEYS.INITIALIZED);
  await initializeStore();
}

export async function login(email: string, password: string): Promise<User | null> {
  const user = getJson<User | null>(KEYS.USER, null);
  if (user && user.email === email && user.password === password) {
    setJson(KEYS.AUTH, user.id);
    return user;
  }
  return null;
}

export async function register(name: string, email: string, password: string): Promise<User> {
  const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
  const user: User = { id, email, name, password, createdAt: new Date().toISOString() };
  setJson(KEYS.USER, user);
  setJson(KEYS.AUTH, user.id);
  return user;
}

/** Synchronous read so the app can restore session on load without flashing logged-out. */
export function getAuthUserSync(): User | null {
  try {
    const authId = localStorage.getItem(KEYS.AUTH);
    if (!authId) return null;
    const user = getJson<User | null>(KEYS.USER, null);
    if (user && authId === user.id) return user;
  } catch {
    /* ignore */
  }
  return null;
}

export async function getAuthUser(): Promise<User | null> {
  return getAuthUserSync();
}

/** Sign out: clear session. Session otherwise persists until explicit logout (refresh/close tab does not sign out). */
export async function logout(): Promise<void> {
  localStorage.removeItem(KEYS.AUTH);
}

export async function getBuildings(): Promise<Building[]> {
  return getJson<Building[]>(KEYS.BUILDINGS, []);
}

export async function getCategories(): Promise<Category[]> {
  return getJson<Category[]>(KEYS.CATEGORIES, []);
}

export async function getClubs(): Promise<Club[]> {
  return getJson<Club[]>(KEYS.CLUBS, []);
}

export async function getClub(id: string): Promise<Club | undefined> {
  const clubs = await getClubs();
  return clubs.find((c) => c.id === id);
}

export async function getEvents(): Promise<Event[]> {
  return getJson<Event[]>(KEYS.EVENTS, []);
}

export async function getEvent(id: string): Promise<Event | undefined> {
  const events = await getEvents();
  return events.find((e) => e.id === id);
}

export async function getMemberships(userId: string): Promise<ClubMembership[]> {
  const all = getJson<ClubMembership[]>(KEYS.MEMBERSHIPS, []);
  return all.filter((m) => m.userId === userId);
}

export async function joinClub(userId: string, clubId: string): Promise<ClubMembership> {
  const memberships = getJson<ClubMembership[]>(KEYS.MEMBERSHIPS, []);
  const existing = memberships.find((m) => m.userId === userId && m.clubId === clubId);
  if (existing) return existing;
  const membership: ClubMembership = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    userId,
    clubId,
    role: "member",
    joinedAt: new Date().toISOString(),
  };
  memberships.push(membership);
  setJson(KEYS.MEMBERSHIPS, memberships);
  const clubs = getJson<Club[]>(KEYS.CLUBS, []);
  const club = clubs.find((c) => c.id === clubId);
  if (club) {
    club.memberCount += 1;
    setJson(KEYS.CLUBS, clubs);
  }
  return membership;
}

export async function leaveClub(userId: string, clubId: string): Promise<void> {
  const memberships = getJson<ClubMembership[]>(KEYS.MEMBERSHIPS, []);
  const filtered = memberships.filter((m) => !(m.userId === userId && m.clubId === clubId));
  setJson(KEYS.MEMBERSHIPS, filtered);
  const clubs = getJson<Club[]>(KEYS.CLUBS, []);
  const club = clubs.find((c) => c.id === clubId);
  if (club && club.memberCount > 0) {
    club.memberCount -= 1;
    setJson(KEYS.CLUBS, clubs);
  }
}

export async function getSaves(userId: string): Promise<EventSave[]> {
  const all = getJson<EventSave[]>(KEYS.SAVES, []);
  return all.filter((s) => s.userId === userId);
}

export async function saveEvent(userId: string, eventId: string): Promise<EventSave> {
  const saves = getJson<EventSave[]>(KEYS.SAVES, []);
  const existing = saves.find((s) => s.userId === userId && s.eventId === eventId);
  if (existing) return existing;
  const save: EventSave = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    userId,
    eventId,
    savedAt: new Date().toISOString(),
  };
  saves.push(save);
  setJson(KEYS.SAVES, saves);
  return save;
}

export async function unsaveEvent(userId: string, eventId: string): Promise<void> {
  const saves = getJson<EventSave[]>(KEYS.SAVES, []);
  const filtered = saves.filter((s) => !(s.userId === userId && s.eventId === eventId));
  setJson(KEYS.SAVES, filtered);
}

export async function getReservations(userId: string): Promise<Reservation[]> {
  const all = getJson<Reservation[]>(KEYS.RESERVATIONS, []);
  return all.filter((r) => r.userId === userId && r.status === "confirmed");
}

export async function makeReservation(userId: string, eventId: string): Promise<Reservation | null> {
  const events = getJson<Event[]>(KEYS.EVENTS, []);
  const event = events.find((e) => e.id === eventId);
  if (!event || !event.hasLimitedCapacity) return null;
  if (event.maxCapacity && event.currentReservations >= event.maxCapacity) return null;
  const reservations = getJson<Reservation[]>(KEYS.RESERVATIONS, []);
  const existing = reservations.find((r) => r.userId === userId && r.eventId === eventId && r.status === "confirmed");
  if (existing) return existing;
  const reservation: Reservation = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    userId,
    eventId,
    reservedAt: new Date().toISOString(),
    status: "confirmed",
  };
  reservations.push(reservation);
  setJson(KEYS.RESERVATIONS, reservations);
  event.currentReservations += 1;
  setJson(KEYS.EVENTS, events);
  return reservation;
}

export async function cancelReservation(userId: string, eventId: string): Promise<void> {
  const reservations = getJson<Reservation[]>(KEYS.RESERVATIONS, []);
  const res = reservations.find((r) => r.userId === userId && r.eventId === eventId && r.status === "confirmed");
  if (res) {
    res.status = "cancelled";
    setJson(KEYS.RESERVATIONS, reservations);
    const events = getJson<Event[]>(KEYS.EVENTS, []);
    const event = events.find((e) => e.id === eventId);
    if (event && event.currentReservations > 0) {
      event.currentReservations -= 1;
      setJson(KEYS.EVENTS, events);
    }
  }
}

export async function getAnnouncements(clubId?: string): Promise<Announcement[]> {
  const all = getJson<Announcement[]>(KEYS.ANNOUNCEMENTS, []);
  if (clubId) return all.filter((a) => a.clubId === clubId);
  return all;
}

export async function createAnnouncement(clubId: string, title: string, body: string): Promise<Announcement> {
  const announcements = getJson<Announcement[]>(KEYS.ANNOUNCEMENTS, []);
  const announcement: Announcement = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    clubId,
    title,
    body,
    createdAt: new Date().toISOString(),
  };
  announcements.unshift(announcement);
  setJson(KEYS.ANNOUNCEMENTS, announcements);
  return announcement;
}

export async function getNotifications(userId: string): Promise<Notification[]> {
  const all = getJson<Notification[]>(KEYS.NOTIFICATIONS, []);
  return all.filter((n) => n.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function markNotificationRead(notifId: string): Promise<void> {
  const all = getJson<Notification[]>(KEYS.NOTIFICATIONS, []);
  const notif = all.find((n) => n.id === notifId);
  if (notif) {
    notif.read = true;
    setJson(KEYS.NOTIFICATIONS, all);
  }
}

export async function createEvent(event: Omit<Event, "id" | "currentReservations" | "isCancelled">): Promise<Event> {
  const events = getJson<Event[]>(KEYS.EVENTS, []);
  const newEvent: Event = {
    ...event,
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    currentReservations: 0,
    isCancelled: false,
  };
  events.push(newEvent);
  setJson(KEYS.EVENTS, events);
  return newEvent;
}

export async function updateEventCoverImage(eventId: string, imageUri: string): Promise<void> {
  const events = getJson<Event[]>(KEYS.EVENTS, []);
  const event = events.find((e) => e.id === eventId);
  if (event) {
    event.coverImage = imageUri;
    setJson(KEYS.EVENTS, events);
  }
}

export async function updateClubCoverImage(clubId: string, imageUri: string): Promise<void> {
  const clubs = getJson<Club[]>(KEYS.CLUBS, []);
  const club = clubs.find((c) => c.id === clubId);
  if (club) {
    club.coverImage = imageUri;
    setJson(KEYS.CLUBS, clubs);
  }
}
