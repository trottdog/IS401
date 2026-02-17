import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import * as store from "@/lib/store";
import * as api from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import type { Event, Club, Building } from "@/lib/types";
import { getTimeLabel, getTimeLabelColor, formatEventTime, formatEventDate } from "@/lib/types";
import Colors from "@/constants/colors";
import PageHeader from "@/components/PageHeader";

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [club, setClub] = useState<Club | null>(null);
  const [building, setBuilding] = useState<Building | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const e = await store.getEvent(id);
      setEvent(e || null);
      if (e) {
        const [c, buildings] = await Promise.all([store.getClub(e.clubId), store.getBuildings()]);
        const b = e.buildingId ? buildings.find((x) => x.id === e.buildingId) : undefined;
        setClub(c || null);
        setBuilding(b || null);
        if (user) {
          const apiSaves = await api.apiGetSaves(user.id);
          if (apiSaves !== null) setSaved(apiSaves.some((s) => s.eventId === id));
          else setSaved((await store.getSaves(user.id)).some((s) => s.eventId === id));
        }
      }
    })();
  }, [id, user]);

  const handleSave = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (!event) return;
    if (saved) {
      const ok = await api.apiUnsaveEvent(user.id, event.id);
      if (ok) setSaved(false);
      else {
        await store.unsaveEvent(user.id, event.id);
        setSaved(false);
      }
    } else {
      const s = await api.apiSaveEvent(user.id, event.id);
      if (s) setSaved(true);
      else {
        await store.saveEvent(user.id, event.id);
        setSaved(true);
      }
    }
  };

  if (!event) {
    return (
      <>
        <PageHeader title="Event" backTo="/discover" />
        <div style={{ padding: 24, color: Colors.light.textSecondary }}>Event not found.</div>
      </>
    );
  }

  const label = getTimeLabel(event.startTime, event.endTime);
  const labelColor = getTimeLabelColor(label);

  return (
    <div>
      <PageHeader title="Event" backTo="/discover" />
      <div style={{ marginBottom: 14 }}>
        <span style={{ background: labelColor + "22", color: labelColor, padding: "5px 10px", borderRadius: 8, fontSize: 12, fontWeight: 600 }}>{label}</span>
      </div>
      <h1 style={{ margin: "0 0 10px", fontSize: "1.35rem", fontWeight: 700, color: Colors.light.text }}>{event.title}</h1>
      {club && (
        <p style={{ margin: "0 0 14px", color: Colors.light.textSecondary, fontSize: 15 }}>
          <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 4, background: club.imageColor, marginRight: 6, verticalAlign: "middle" }} />
          {club.name}
        </p>
      )}
      <p style={{ color: Colors.light.textSecondary, marginBottom: 14, fontSize: 15, lineHeight: 1.45 }}>{event.description}</p>
      <div style={{ fontSize: 14, color: Colors.light.textSecondary, marginBottom: 6 }}>
        {formatEventTime(event.startTime)} – {formatEventDate(event.startTime)}
      </div>
      {building && (
        <div style={{ fontSize: 14, color: Colors.light.textSecondary, marginBottom: 18 }}>
          {building.name} · Room {event.room}
        </div>
      )}
      <button type="button" onClick={handleSave} style={{ padding: "12px 20px", minHeight: 48, background: Colors.light.surfaceSecondary, border: `1px solid ${Colors.light.border}`, borderRadius: 12, cursor: "pointer", fontWeight: 600, fontSize: 15 }}>
        {saved ? "Unsave" : "Save"} event
      </button>
    </div>
  );
}
