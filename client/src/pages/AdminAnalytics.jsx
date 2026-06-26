import React, { useEffect, useState } from "react";
import { BarChart3 } from "lucide-react";
import { api } from "../services/api";
import { FullPageSpinner } from "../components/Spinner";

export default function AdminAnalytics() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/admin/analytics").then(({ data }) => setData(data));
  }, []);

  if (!data) return <FullPageSpinner />;

  const { monthlyRevenue = [] } = data;
  const maxRevenue = Math.max(...monthlyRevenue.map((m) => m.revenue), 1);

  return (
    <div className="grid gap-6 animate-fade-up">
      <div>
        <p className="label">Admin</p>
        <h1 className="mt-2 text-3xl font-black text-slate-950">Revenue Analytics</h1>
      </div>

      <section className="panel">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 size={20} className="text-maroon-600" />
          <h2 className="text-xl font-black text-slate-950">Monthly Revenue (₹)</h2>
        </div>

        {monthlyRevenue.length === 0 ? (
          <div className="flex flex-col items-center py-14 text-center">
            <BarChart3 size={40} className="text-slate-200 mb-4" />
            <p className="font-semibold text-slate-500">No revenue data yet.</p>
            <p className="text-sm text-slate-400 mt-1">Revenue will appear here once subscriptions are purchased.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Bar chart */}
            <div className="flex items-end gap-3 h-48 border-b border-slate-100 pb-2">
              {monthlyRevenue.map((m) => {
                const height = Math.round((m.revenue / maxRevenue) * 100);
                return (
                  <div key={m._id} className="flex flex-col items-center gap-1 flex-1 min-w-0">
                    <span className="text-xs font-semibold text-slate-600">
                      ₹{m.revenue.toLocaleString("en-IN")}
                    </span>
                    <div className="w-full rounded-t-lg bg-gradient-to-t from-maroon-600 to-pink-500 transition-all duration-700"
                      style={{ height: `${height}%`, minHeight: "4px" }} />
                  </div>
                );
              })}
            </div>
            {/* Month labels */}
            <div className="flex gap-3">
              {monthlyRevenue.map((m) => (
                <div key={m._id} className="flex-1 min-w-0 text-center">
                  <span className="text-xs text-slate-400 truncate block">{m._id}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Summary table */}
      {monthlyRevenue.length > 0 && (
        <section className="panel">
          <h2 className="text-lg font-black text-slate-950 mb-4">Revenue Breakdown</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="pb-3 pr-8 font-semibold text-slate-500">Month</th>
                  <th className="pb-3 font-semibold text-slate-500">Revenue (₹)</th>
                </tr>
              </thead>
              <tbody>
                {monthlyRevenue.map((m) => (
                  <tr key={m._id} className="border-b border-slate-50">
                    <td className="py-3 pr-8 font-semibold text-slate-900">{m._id}</td>
                    <td className="py-3 text-maroon-700 font-black">
                      ₹{m.revenue.toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))}
                <tr>
                  <td className="pt-4 pr-8 font-black text-slate-950">Total</td>
                  <td className="pt-4 font-black text-maroon-700">
                    ₹{monthlyRevenue.reduce((s, m) => s + m.revenue, 0).toLocaleString("en-IN")}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
