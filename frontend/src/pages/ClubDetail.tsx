import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import * as store from "@/lib/store";
import { useAuth } from "@/lib/auth-context";
import type { Club } from "@/lib/types";
import Colors from "@/constants/colors";
import PageHeader from "@/components/PageHeader";

export default function ClubDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [club, setClub] = useState<Club | null>(null);
  const [isMember, setIsMember] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const c = await store.getClub(id);
      setClub(c || null);
      if (user) {
        const memberships = await store.getMemberships(user.id);
        setIsMember(memberships.some((m) => m.clubId === id));
      }
    })();
  }, [id, user]);

  const handleJoin = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (!club) return;
    await store.joinClub(user.id, club.id);
    setIsMember(true);
    setClub({ ...club, memberCount: club.memberCount + 1 });
  };

  const handleLeave = async () => {
    if (!user || !club) return;
    await store.leaveClub(user.id, club.id);
    setIsMember(false);
    setClub({ ...club, memberCount: club.memberCount - 1 });
  };

  if (!club) {
    return (
      <>
        <PageHeader title="Club" backTo="/clubs" />
        <div style={{ padding: 24, color: Colors.light.textSecondary }}>Club not found.</div>
      </>
    );
  }

  return (
    <div>
      <PageHeader title={club.name} backTo="/clubs" />
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <div style={{ width: 48, height: 48, borderRadius: 24, background: club.imageColor, flexShrink: 0 }} />
        <p style={{ margin: 0, color: Colors.light.textSecondary, fontSize: 14 }}>{club.memberCount} members</p>
      </div>
      <p style={{ color: Colors.light.text, marginBottom: 20, fontSize: 15, lineHeight: 1.45 }}>{club.description}</p>
      {user && (
        <div>
          {isMember ? (
            <button type="button" onClick={handleLeave} style={{ padding: "12px 20px", minHeight: 48, background: Colors.light.error, color: "#fff", border: "none", borderRadius: 12, cursor: "pointer", fontWeight: 600, fontSize: 15 }}>
              Leave club
            </button>
          ) : (
            <button type="button" onClick={handleJoin} style={{ padding: "12px 20px", minHeight: 48, background: Colors.light.tint, color: "#fff", border: "none", borderRadius: 12, cursor: "pointer", fontWeight: 600, fontSize: 15 }}>
              Join club
            </button>
          )}
        </div>
      )}
    </div>
  );
}
