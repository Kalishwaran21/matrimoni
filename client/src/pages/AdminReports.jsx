import React, { useEffect, useState } from "react";
import { AlertTriangle, Bell } from "lucide-react";
import { api } from "../services/api";
import { FullPageSpinner } from "../components/Spinner";

export default function AdminReports() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/admin/reports").then(({ data }) => setData(data));
  }, []);

  if (!data) return <FullPageSpinner />;

  return (
    <div className="grid gap-6 animate-fade-up">
      <div>
        <p className="label">Admin</p>
        <h1 className="mt-2 text-3xl font-black text-slate-950">Reports</h1>
      </div>

      {/* Unread notifications alert */}
      {data.unreadNotifications > 0 && (
        <div className="flex items-center gap-3 rounded-2xl border border-maroon-200 bg-maroon-50 px-5 py-4">
          <Bell size={20} className="text-maroon-600" />
          <p className="font-semibold text-maroon-900">
            {data.unreadNotifications} unread system notifications pending.
          </p>
        </div>
      )}

      {/* Incomplete profiles */}
      <section className="panel">
        <div className="flex items-center gap-2 mb-5">
          <AlertTriangle size={18} className="text-amber-500" />
          <h2 className="text-xl font-black text-slate-950">
            Incomplete Profiles
            <span className="ml-2 rounded-full bg-amber-100 px-2.5 py-0.5 text-sm font-semibold text-amber-700">
              {data.lowCompletion.length}
            </span>
          </h2>
        </div>

        {data.lowCompletion.length === 0 ? (
          <p className="text-center py-8 text-sm text-slate-400">
            No profiles with low completion score. 🎉
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[500px]">
              <thead className="border-b border-slate-100">
                <tr>
                  {["User", "Email", "Score", "Status"].map((h) => (
                    <th key={h} className="pb-3 pr-6 text-xs font-semibold uppercase tracking-wider text-slate-400">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data.lowCompletion.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50">
                    <td className="py-3 pr-6 font-semibold text-slate-900">
                      {p.user?.fullName || "Unknown"}
                    </td>
                    <td className="py-3 pr-6 text-slate-500">{p.user?.email || "—"}</td>
                    <td className="py-3 pr-6">
                      <div className="flex items-center gap-2">
                        <div className="match-bar-track w-20">
                          <div
                            className="match-bar-fill"
                            style={{ width: `${p.completionScore}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-amber-700">
                          {p.completionScore}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className={`badge ${p.user?.isActive ? "badge-green" : "badge-red"}`}>
                        {p.user?.isActive ? "Active" : "Blocked"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
