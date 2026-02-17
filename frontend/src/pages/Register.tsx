import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import Colors from "@/constants/colors";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const ok = await register(name, email, password);
      if (ok) navigate("/discover");
      else setError("Registration failed.");
    } catch {
      setError("Registration failed.");
    }
    setLoading(false);
  };

  return (
    <div className="auth-page" style={{ minHeight: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <Link to="/discover" className="auth-back" style={{ display: "inline-block", color: Colors.light.tint, fontSize: 15, fontWeight: 500, textDecoration: "none", alignSelf: "flex-start" }}>
        ← Back
      </Link>
      <h1 style={{ margin: "0 0 24px", fontSize: "1.5rem", fontWeight: 700, color: Colors.light.text }}>Register</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 18 }}>
          <label style={{ display: "block", marginBottom: 8, fontSize: 15, color: Colors.light.textSecondary, fontWeight: 500 }}>Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required style={{ width: "100%", padding: "14px 12px", borderRadius: 12, border: `1px solid ${Colors.light.border}`, fontSize: 16 }} />
        </div>
        <div style={{ marginBottom: 18 }}>
          <label style={{ display: "block", marginBottom: 8, fontSize: 15, color: Colors.light.textSecondary, fontWeight: 500 }}>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: "100%", padding: "14px 12px", borderRadius: 12, border: `1px solid ${Colors.light.border}`, fontSize: 16 }} />
        </div>
        <div style={{ marginBottom: 18 }}>
          <label style={{ display: "block", marginBottom: 8, fontSize: 15, color: Colors.light.textSecondary, fontWeight: 500 }}>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: "100%", padding: "14px 12px", borderRadius: 12, border: `1px solid ${Colors.light.border}`, fontSize: 16 }} />
        </div>
        {error && <p style={{ color: Colors.light.error, fontSize: 14, marginBottom: 12 }}>{error}</p>}
        <button type="submit" disabled={loading} style={{ width: "100%", padding: 14, minHeight: 48, background: Colors.light.tint, color: "#fff", border: "none", borderRadius: 12, cursor: "pointer", fontWeight: 600, fontSize: 16 }}>
          {loading ? "Creating account…" : "Register"}
        </button>
      </form>
      <p style={{ marginTop: 20, fontSize: 15, color: Colors.light.textSecondary }}>
        Already have an account? <Link to="/login" style={{ color: Colors.light.tint, fontWeight: 500 }}>Sign In</Link>
      </p>
    </div>
  );
}
