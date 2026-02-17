import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as store from "@/lib/store";
import { useAuth } from "@/lib/auth-context";
import type { Club, ClubMembership } from "@/lib/types";
import Colors from "@/constants/colors";

export default function MyClubs() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [memberships, setMemberships] = useState<ClubMembership[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [allClubs, setAllClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    (async () => {
      const [m, c] = await Promise.all([store.getMemberships(user.id), store.getClubs()]);
      setMemberships(m);
      setAllClubs(c);
      const myIds = new Set(m.map((x) => x.clubId));
      setClubs(c.filter((cl) => myIds.has(cl.id)));
      setLoading(false);
    })();
  }, [user]);

  if (!isAuthenticated) {
    return (
      <div style={{ textAlign: "center", padding: "48px 0" }}>
        <p style={{ color: Colors.light.textSecondary, marginBottom: 20, fontSize: 15 }}>Sign in to see your clubs</p>
        <button type="button" onClick={() => navigate("/login")} style={{ background: Colors.light.tint, color: "#fff", border: "none", padding: "14px 28px", borderRadius: 12, cursor: "pointer", fontWeight: 600, fontSize: 16 }}>
          Sign In
        </button>
      </div>
    );
  }

  if (loading) return <div style={{ textAlign: "center", padding: "48px 0", color: Colors.light.textSecondary }}>Loading…</div>;

  return (
    <div>
      <h1 style={{ margin: "0 0 20px", fontSize: "1.5rem", fontWeight: 700, color: Colors.light.text }}>My Clubs</h1>
      {clubs.length === 0 ? (
        <p style={{ color: Colors.light.textSecondary }}>You haven’t joined any clubs yet. Browse clubs from Discover.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {clubs.map((club) => (
            <li key={club.id} style={{ marginBottom: 14 }}>
              <Link
                to={`/club/${club.id}`}
                style={{
                  display: "block",
                  padding: 14,
                  background: Colors.light.surface,
                  borderRadius: 12,
                  border: `1px solid ${Colors.light.border}`,
                  textDecoration: "none",
                  color: Colors.light.text,
                }}
              >
                <span style={{ display: "inline-block", width: 12, height: 12, borderRadius: 6, background: club.imageColor, marginRight: 8, verticalAlign: "middle" }} />
                <strong>{club.name}</strong>
                <span style={{ marginLeft: 8, color: Colors.light.textSecondary, fontSize: 14 }}>{club.memberCount} members</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <h2 style={{ fontSize: "1.1rem", fontWeight: 600, marginTop: 28, marginBottom: 14, color: Colors.light.text }}>All clubs</h2>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {allClubs.slice(0, 6).map((club) => (
          <li key={club.id} style={{ marginBottom: 10 }}>
            <Link to={`/club/${club.id}`} style={{ color: Colors.light.tint, textDecoration: "none" }}>
              {club.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
