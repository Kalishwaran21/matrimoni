import React from "react";
import { BarChart3, Flag, LayoutDashboard, Users, ShieldCheck, UserPlus, HeartHandshake, UserCircle, Settings } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

const adminLinks = [
  ["Dashboard", "/admin", LayoutDashboard],
  ["Users", "/admin/users", Users],
  ["Create Profile", "/admin/create-profile", UserPlus],
  ["Client Interests", "/admin/client-interests", HeartHandshake],
  ["Created Profiles", "/admin/created-profiles", UserCircle],
  ["Approvals", "/admin/approvals", ShieldCheck],
  ["Reports", "/admin/reports", Flag],
  ["Analytics", "/admin/analytics", BarChart3],
  ["Settings", "/admin/settings", Settings]
];

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="container-pad grid gap-6 py-6 lg:grid-cols-[240px_1fr]">
        <aside className="h-fit rounded-lg border border-slate-200 bg-white p-3 shadow-soft">
          {adminLinks.map(([label, href, Icon]) => (
            <NavLink key={href} to={href} end={href === "/admin"} className={({ isActive }) => `mb-1 flex items-center gap-3 rounded-md px-3 py-3 text-sm font-semibold ${isActive ? "bg-slate-950 text-white" : "text-slate-700 hover:bg-slate-100"}`}>
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
