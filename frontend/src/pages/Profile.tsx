import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import Colors from "@/constants/colors";

export default function Profile() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated || !user) {
    return (
      <div style={{ textAlign: "center", padding: "48px 0" }}>
        <p style={{ color: Colors.light.textSecondary, marginBottom: 20, fontSize: 15 }}>Sign in to view your profile</p>
        <button type="button" onClick={() => navigate("/login")} style={{ background: Colors.light.tint, color: "#fff", border: "none", padding: "14px 28px", borderRadius: 12, cursor: "pointer", fontWeight: 600, fontSize: 16 }}>
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ margin: "0 0 20px", fontSize: "1.5rem", fontWeight: 700, color: Colors.light.text }}>Profile</h1>
      <p style={{ margin: "0 0 4px", color: Colors.light.textSecondary, fontSize: 15 }}>{user.name}</p>
      <p style={{ margin: 0, color: Colors.light.textSecondary, fontSize: 14 }}>{user.email}</p>
      <div style={{ marginTop: 24 }}>
        <Link to="/profile/notifications" style={{ color: Colors.light.tint, textDecoration: "none", fontSize: 15 }}>
          Notifications
        </Link>
      </div>
      <button
        type="button"
        onClick={() => logout().then(() => navigate("/discover"))}
        style={{ marginTop: 28, padding: "12px 24px", minHeight: 48, background: Colors.light.error, color: "#fff", border: "none", borderRadius: 12, cursor: "pointer", fontWeight: 600, fontSize: 15 }}
      >
        Sign Out
      </button>
    </div>
  );
}
