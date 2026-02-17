import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "@/components/Layout";
import Discover from "@/pages/Discover";
import MyClubs from "@/pages/MyClubs";
import Profile from "@/pages/Profile";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import EventDetail from "@/pages/EventDetail";
import ClubDetail from "@/pages/ClubDetail";

export default function App() {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
      <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/discover" replace />} />
        <Route path="discover" element={<Discover />} />
        <Route path="clubs" element={<MyClubs />} />
        <Route path="profile" element={<Profile />} />
        <Route path="event/:id" element={<EventDetail />} />
        <Route path="club/:id" element={<ClubDetail />} />
      </Route>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      </Routes>
    </div>
  );
}
