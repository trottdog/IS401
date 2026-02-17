import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as store from "@/lib/store";
import * as api from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import type { Event, Club, Building, EventSave } from "@/lib/types";
import { getTimeLabel, getTimeLabelColor, formatEventTime, formatEventDate } from "@/lib/types";
import Colors from "@/constants/colors";
import EventMap, { type MapMarker } from "@/components/EventMap";

type ViewMode = "list" | "map";

export default function Discover() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [saves, setSaves] = useState<EventSave[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  useEffect(() => {
    (async () => {
      await store.initializeStore();
      const [e, c, b] = await Promise.all([store.getEvents(), store.getClubs(), store.getBuildings()]);
      setEvents(e);
      setClubs(c);
      setBuildings(b);
      if (user) {
        const apiSaves = await api.apiGetSaves(user.id);
        if (apiSaves !== null) setSaves(apiSaves);
        else setSaves(await store.getSaves(user.id));
      }
      setLoading(false);
    })();
  }, [user]);

  const sortedEvents = useMemo(() => {
    const now = new Date();
    return [...events]
      .filter((e) => !e.isCancelled && new Date(e.endTime) > now)
      .sort((a, b) => {
        const aStart = new Date(a.startTime);
        const bStart = new Date(b.startTime);
        const aNow = now >= aStart && now <= new Date(a.endTime);
        const bNow = now >= bStart && now <= new Date(b.endTime);
        if (aNow && !bNow) return -1;
        if (!aNow && bNow) return 1;
        return aStart.getTime() - bStart.getTime();
      });
  }, [events]);

  const getClub = (id: string) => clubs.find((c) => c.id === id);
  const getBuilding = (id: string) => buildings.find((b) => b.id === id);
  const savedIds = new Set(saves.map((s) => s.eventId));

  const mapMarkers = useMemo((): MapMarker[] => {
    const now = new Date();
    const upcomingByBuilding = new Map<string, number>();
    events
      .filter((e) => !e.isCancelled && new Date(e.endTime) > now)
      .forEach((e) => upcomingByBuilding.set(e.buildingId, (upcomingByBuilding.get(e.buildingId) ?? 0) + 1));
    return buildings
      .filter((b) => (upcomingByBuilding.get(b.id) ?? 0) > 0)
      .map((b) => ({
        id: b.id,
        latitude: b.latitude,
        longitude: b.longitude,
        count: upcomingByBuilding.get(b.id) ?? 0,
        label: b.name,
      }));
  }, [events, buildings]);

  const handleSave = async (eventId: string) => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (savedIds.has(eventId)) {
      const ok = await api.apiUnsaveEvent(user.id, eventId);
      if (ok) setSaves((prev) => prev.filter((s) => s.eventId !== eventId));
      else {
        await store.unsaveEvent(user.id, eventId);
        setSaves((prev) => prev.filter((s) => s.eventId !== eventId));
      }
    } else {
      const s = await api.apiSaveEvent(user.id, eventId);
      if (s) setSaves((prev) => [...prev, s]);
      else {
        const fallback = await store.saveEvent(user.id, eventId);
        setSaves((prev) => [...prev, fallback]);
      }
    }
  };

  if (loading) {
    return <div style={{ textAlign: "center", padding: "48px 0", color: Colors.light.textSecondary, fontSize: 15 }}>Loading…</div>;
  }

  return (
    <div style={{ paddingBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 14 }}>
        <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700, color: Colors.light.text }}>Discover</h1>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", background: Colors.light.surfaceSecondary, borderRadius: 10, padding: 3 }}>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              style={{
                padding: "8px 14px",
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: 14,
                background: viewMode === "list" ? Colors.light.surface : "transparent",
                color: viewMode === "list" ? Colors.light.text : Colors.light.textSecondary,
                boxShadow: viewMode === "list" ? "0 1px 2px rgba(0,0,0,.06)" : "none",
              }}
            >
              List
            </button>
            <button
              type="button"
              onClick={() => setViewMode("map")}
              style={{
                padding: "8px 14px",
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: 14,
                background: viewMode === "map" ? Colors.light.surface : "transparent",
                color: viewMode === "map" ? Colors.light.text : Colors.light.textSecondary,
                boxShadow: viewMode === "map" ? "0 1px 2px rgba(0,0,0,.06)" : "none",
              }}
            >
              Map
            </button>
          </div>
          <Link to="/discover" style={{ background: Colors.light.tint, color: "#fff", padding: "10px 14px", borderRadius: 10, textDecoration: "none", fontWeight: 600, fontSize: 14 }}>
            + Add
          </Link>
        </div>
      </div>
      <p style={{ margin: "0 0 16px", fontSize: 14, color: Colors.light.textSecondary }}>Search events, clubs…</p>

      {viewMode === "map" && (
        <div style={{ marginBottom: 16, borderRadius: 16, overflow: "hidden", border: `1px solid ${Colors.light.border}`, background: Colors.light.surface, boxShadow: "0 1px 3px rgba(0,0,0,.06)" }}>
          <EventMap
            height={280}
            markers={mapMarkers}
            onMarkerClick={(buildingId) => {
              const evt = sortedEvents.find((e) => e.buildingId === buildingId);
              if (evt) navigate(`/event/${evt.id}`);
            }}
          />
        </div>
      )}

      {viewMode === "list" &&
        (sortedEvents.length === 0 ? (
          <p style={{ color: Colors.light.textSecondary, textAlign: "center", padding: "24px 0", fontSize: 15 }}>No upcoming events.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {sortedEvents.map((evt) => {
              const club = getClub(evt.clubId);
              const building = getBuilding(evt.buildingId);
              const label = getTimeLabel(evt.startTime, evt.endTime);
              const labelColor = getTimeLabelColor(label);
              return (
                <li
                  key={evt.id}
                  style={{
                    background: Colors.light.surface,
                    borderRadius: 14,
                    padding: 16,
                    marginBottom: 12,
                    border: `1px solid ${Colors.light.border}`,
                    boxShadow: "0 1px 2px rgba(0,0,0,.04)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <span style={{ background: labelColor + "22", color: labelColor, padding: "5px 10px", borderRadius: 8, fontSize: 12, fontWeight: 600 }}>
                      {label}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleSave(evt.id)}
                      style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, padding: 4, lineHeight: 1 }}
                      title={savedIds.has(evt.id) ? "Unsave" : "Save"}
                    >
                      {savedIds.has(evt.id) ? "★" : "☆"}
                    </button>
                  </div>
                  <Link to={`/event/${evt.id}`} style={{ color: Colors.light.text, textDecoration: "none", fontWeight: 600, fontSize: 16, display: "block", marginBottom: 4 }}>
                    {evt.title}
                  </Link>
                  <p style={{ margin: "0 0 8px", fontSize: 14, color: Colors.light.textSecondary, lineHeight: 1.4 }}>{evt.description}</p>
                  <div style={{ fontSize: 13, color: Colors.light.textSecondary }}>
                    {formatEventTime(evt.startTime)} · {formatEventDate(evt.startTime)}
                    {building && ` · ${building.name} ${evt.room}`}
                  </div>
                  {club && (
                    <div style={{ marginTop: 8, fontSize: 13, color: Colors.light.textSecondary }}>
                      <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 4, background: club.imageColor, marginRight: 6, verticalAlign: "middle" }} />
                      {club.name}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        ))}
    </div>
  );
}
