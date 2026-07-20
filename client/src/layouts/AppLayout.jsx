import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import DailyMatchesPopup from "../components/DailyMatchesPopup";
import { useAuth } from "../context/AuthContext";

export default function AppLayout() {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-[#fff8fa]">
      <Navbar />
      <div className="container-pad py-6">
        <main>
          <Outlet />
        </main>
      </div>
      {user && user.role !== "admin" && <DailyMatchesPopup />}
    </div>
  );
}
