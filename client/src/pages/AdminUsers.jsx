import React, { useEffect, useState } from "react";
import { Ban, Check } from "lucide-react";
import { api } from "../services/api";
import { FullPageSpinner } from "../components/Spinner";
import { toast } from "../components/Toast";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = () =>
    api.get("/admin/users").then(({ data }) => {
      setUsers(data.users);
      setLoading(false);
    });

  useEffect(() => { load(); }, []);

  const toggle = async (id, currentlyActive) => {
    try {
      await api.patch(`/admin/users/${id}/block`);
      toast.success(currentlyActive ? "User blocked." : "User unblocked.");
      load();
    } catch {
      toast.error("Action failed.");
    }
  };

  const filtered = users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <FullPageSpinner />;

  return (
    <div className="grid gap-6 animate-fade-up">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="label">Admin</p>
          <h1 className="mt-2 text-3xl font-black text-slate-950">
            Manage Users
            <span className="ml-3 rounded-full bg-slate-100 px-3 py-1 text-base font-semibold text-slate-600">
              {users.length}
            </span>
          </h1>
        </div>
        <input
          className="field w-full sm:w-64"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <section className="panel p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50">
              <tr>
                {["Name", "Email", "Gender", "Premium", "Status", "Action"].map((h) => (
                  <th key={h} className="px-5 py-4 font-semibold text-slate-500 text-xs uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((u) => (
                <tr key={u._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4 font-semibold text-slate-900">{u.fullName}</td>
                  <td className="px-5 py-4 text-slate-500">{u.email}</td>
                  <td className="px-5 py-4 text-slate-500">{u.gender}</td>
                  <td className="px-5 py-4">
                    {u.isPremium ? (
                      <span className="badge bg-amber-50 text-amber-700"><Check size={11} /> Yes</span>
                    ) : (
                      <span className="badge bg-slate-100 text-slate-500">No</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`badge ${u.isActive ? "badge-green" : "badge-red"}`}>
                      {u.isActive ? "Active" : "Blocked"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <button
                      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                        u.isActive
                          ? "bg-red-50 text-red-700 hover:bg-red-100"
                          : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                      }`}
                      onClick={() => toggle(u._id, u.isActive)}
                    >
                      <Ban size={13} />
                      {u.isActive ? "Block" : "Unblock"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p className="py-12 text-center text-sm text-slate-400">No users match your search.</p>
          )}
        </div>
      </section>
    </div>
  );
}
