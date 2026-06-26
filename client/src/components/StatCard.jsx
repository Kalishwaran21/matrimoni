import React from "react";

export default function StatCard({ label, value, icon: Icon, color = "maroon" }) {
  const colors = {
    maroon: { bg: "bg-maroon-50", icon: "text-maroon-600", border: "border-maroon-100" },
    emerald: { bg: "bg-emerald-50", icon: "text-emerald-600", border: "border-emerald-100" },
    amber: { bg: "bg-amber-50", icon: "text-amber-600", border: "border-amber-100" },
    blue: { bg: "bg-blue-50", icon: "text-blue-600", border: "border-blue-100" }
  };
  const c = colors[color] || colors.maroon;

  return (
    <div className={`flex items-center gap-4 rounded-2xl border ${c.border} bg-white p-5 shadow-soft card-hover`}>
      <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${c.bg}`}>
        {Icon && <Icon size={22} className={c.icon} />}
      </span>
      <div>
        <p className="text-2xl font-black text-slate-950">{value}</p>
        <p className="text-xs font-semibold text-slate-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
}
