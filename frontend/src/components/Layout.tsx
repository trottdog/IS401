import type { CSSProperties } from "react";
import { Outlet, NavLink } from "react-router-dom";
import Colors from "@/constants/colors";

const FOOTER_HEIGHT = 60;

const navStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-around",
  alignItems: "stretch",
  height: FOOTER_HEIGHT,
  padding: "8px 4px 0",
  background: Colors.light.surface,
  borderTop: `1px solid ${Colors.light.border}`,
  position: "absolute",
  bottom: 0,
  left: 0,
  right: 0,
};

const linkBase: CSSProperties = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 4,
  textDecoration: "none",
  padding: "6px 8px",
  borderRadius: 12,
  minHeight: 44,
  maxWidth: 120,
};

const iconSize = { width: 22, height: 22 };

function DiscoverIcon({ active }: { active: boolean }) {
  return (
    <svg {...iconSize} viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}

function ClubsIcon({ active }: { active: boolean }) {
  return (
    <svg {...iconSize} viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function ProfileIcon({ active }: { active: boolean }) {
  return (
    <svg {...iconSize} viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function NavItem({ to, label, icon: Icon }: { to: string; label: string; icon: React.ComponentType<{ active: boolean }> }) {
  return (
    <NavLink
      to={to}
      end={to !== "/clubs"}
      style={({ isActive }) => ({
        ...linkBase,
        color: isActive ? Colors.light.tint : Colors.light.textSecondary,
        fontWeight: isActive ? 600 : 500,
        fontSize: 12,
        background: isActive ? Colors.light.tint + "14" : "transparent",
      })}
    >
      {({ isActive }) => (
        <>
          <span style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon active={isActive} />
          </span>
          <span>{label}</span>
        </>
      )}
    </NavLink>
  );
}

export default function Layout() {
  return (
    <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
      <main className="page-content" style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch" }}>
        <Outlet />
      </main>
      <nav style={navStyle} aria-label="Main navigation">
        <NavItem to="/discover" label="Discover" icon={DiscoverIcon} />
        <NavItem to="/clubs" label="My Clubs" icon={ClubsIcon} />
        <NavItem to="/profile" label="Profile" icon={ProfileIcon} />
      </nav>
    </div>
  );
}
