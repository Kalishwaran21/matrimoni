import React from "react";
import { DatabaseZap, Users } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

const managerLinks = [
  ["Outside Data", "/manager", DatabaseZap],
  ["Outside Data Profiles", "/manager/created-profiles", Users]
];

export default function ManagerLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="container-pad grid gap-6 py-6 lg:grid-cols-[240px_1fr]">
        <aside className="h-fit rounded-lg border border-slate-200 bg-white p-3 shadow-soft">
          {managerLinks.map(([label, href, Icon]) => (
            <NavLink key={href} to={href} end={href === "/manager"} className={({ isActive }) => `mb-1 flex items-center gap-3 rounded-md px-3 py-3 text-sm font-semibold ${isActive ? "bg-slate-950 text-white" : "text-slate-700 hover:bg-slate-100"}`}>
              <Icon size={17} /> {label}
            </NavLink>
          ))}
        </aside>
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
