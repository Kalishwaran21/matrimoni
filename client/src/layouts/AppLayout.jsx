import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-[#fff8fa]">
      <Navbar />
      <div className="container-pad py-6">
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
