import React, { useEffect, useState } from "react";
import { IndianRupee, ShieldCheck, UserCheck, Users, TrendingUp } from "lucide-react";
import StatCard from "../components/StatCard";
import { FullPageSpinner } from "../components/Spinner";
import { api } from "../services/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get("/admin/dashboard").then(({ data }) => setStats(data));
  }, []);

  if (!stats) return <FullPageSpinner />;

  const cards = [
    { label: "Total Users", value: stats.totalUsers ?? 0, icon: Users, color: "blue" },
    { label: "Active Users", value: stats.activeUsers ?? 0, icon: UserCheck, color: "emerald" },
    { label: "Premium Users", value: stats.premiumUsers ?? 0, icon: ShieldCheck, color: "amber" },
    { label: "Revenue", value: `₹${(stats.revenue ?? 0).toLocaleString("en-IN")}`, icon: IndianRupee, color: "maroon" }
  ];

  return (
    <div className="grid gap-6 animate-fade-up">
      <div>
        <p className="label">Admin</p>
        <h1 className="mt-2 text-3xl font-black text-slate-950">Dashboard</h1>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => <StatCard key={c.label} {...c} />)}
      </div>

      {/* Pending interests notice */}
      {stats.pendingInterests > 0 && (
        <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
          <TrendingUp size={20} className="text-amber-600" />
          <p className="font-semibold text-amber-900">
            {stats.pendingInterests} pending interests awaiting response.
          </p>
        </div>
      )}

      {/* Quick links */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Manage Users", href: "/admin/users", desc: "Block / unblock profiles" },
          { label: "View Reports", href: "/admin/reports", desc: "Incomplete profiles & flags" },
          { label: "Analytics", href: "/admin/analytics", desc: "Revenue over time" }
        ].map(({ label, href, desc }) => (
          <a
            key={label}
            href={href}
            className="panel card-hover block no-underline"
          >
            <p className="font-black text-slate-950">{label}</p>
            <p className="mt-1 text-sm text-slate-500">{desc}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
