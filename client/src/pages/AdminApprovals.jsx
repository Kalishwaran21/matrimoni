import React, { useEffect, useState } from "react";
import { Check, Eye, Search, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import { FullPageSpinner } from "../components/Spinner";
import { toast } from "../components/Toast";

export default function AdminApprovals() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = () => {
    setLoading(true);
    api.get("/admin/approvals")
      .then(({ data }) => {
        setPending(data.pending || []);
        setLoading(false);
      })
      .catch(() => {
        toast.error("Could not load pending approvals.");
        setLoading(false);
      });
  };

  useEffect(() => {
    load();
  }, []);

  const approve = async (id) => {
    try {
      await api.patch(`/admin/approvals/${id}/approve`);
      toast.success("Profile approved successfully!");
      load();
    } catch {
      toast.error("Approval action failed.");
    }
  };


  const filtered = pending.filter((p) => {
    const name = p.basic?.name || p.user?.fullName || "";
    const email = p.user?.email || "";
    return (
      name.toLowerCase().includes(search.toLowerCase()) ||
      email.toLowerCase().includes(search.toLowerCase())
    );
  });

  const fmt = (n) => (n ? parseInt(n).toLocaleString("en-IN") : "—");

  if (loading) return <FullPageSpinner />;

  return (
    <div className="grid gap-6 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="label">Admin Desk</p>
          <h1 className="mt-2 text-3xl font-black text-slate-950">
            Pending Approvals
            <span className="ml-3 rounded-full bg-rose-50 border border-rose-100 px-3 py-1 text-base font-black text-maroon-700">
              {pending.length}
            </span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">Review submitted profiles and award the verified badge status.</p>
        </div>
        <div className="relative">
          <input
            className="field w-full sm:w-64 pl-10"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search className="absolute left-3.5 top-3.5 text-slate-400" size={17} />
        </div>
      </div>

      {/* Main List */}
      <div className="grid gap-4">
        {filtered.map((profile) => {
          const name = profile.basic?.name || profile.user?.fullName || "—";
          const user = profile.user || {};
          const photo = profile.photo?.url;

          return (
            <div
              key={profile._id}
              className="panel border border-rose-100/70 bg-white shadow-soft transition-all duration-300 hover:border-rose-200"
            >
              {/* Summary Layout */}
              <div className="flex flex-col md:flex-row gap-5 items-start justify-between">
                <div className="flex gap-4 items-start">
                  {/* Photo Thumbnail */}
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-rose-100 bg-rose-50 flex items-center justify-center">
                    {photo ? (
                      <img src={photo} alt={name} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-2xl font-black text-maroon-200 select-none">
                        {name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* Short description */}
                  <div>
                    <h3 className="text-lg font-black text-slate-950 flex items-center gap-1.5">
                      {name}
                      {user.isPremium && (
                        <span className="badge bg-amber-50 text-amber-700 text-[10px] py-0.5 font-bold">Premium</span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-500 font-semibold mt-0.5 flex flex-wrap gap-x-2 gap-y-1">
                      <span>{user.email || "No Email"}</span>
                      <span className="text-slate-300">•</span>
                      <span>{user.mobile || "No Mobile"}</span>
                      <span className="text-slate-300">•</span>
                      <span>Gender: {profile.basic?.gender || user.gender || "—"}</span>
                    </p>
                    <p className="text-xs text-maroon-700 font-black mt-2">
                      {[
                        profile.basic?.age ? `${profile.basic.age} yrs` : null,
                        profile.religion?.religion,
                        profile.religion?.caste,
                        profile.location?.city
                      ].filter(Boolean).join(" • ")}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0">
                  <Link
                    to={`/profile/${profile._id}`}
                    className="btn-secondary !py-2 !px-3 text-xs flex items-center gap-1.5 flex-1 md:flex-initial justify-center"
                  >
                    <Eye size={14} />
                    View Details
                  </Link>
                  <button
                    type="button"
                    onClick={() => approve(profile._id)}
                    className="btn-primary !py-2 !px-4 text-xs bg-emerald-600 hover:bg-emerald-700 border-none flex items-center gap-1.5 flex-1 md:flex-initial justify-center"
                  >
                    <Check size={14} />
                    Approve
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-rose-100 bg-white py-16 text-center">
            <ShieldCheck size={44} className="text-emerald-500 mb-3" />
            <p className="font-black text-slate-950 text-base">All Caught Up!</p>
            <p className="mt-1 text-sm text-slate-400 max-w-sm">There are no pending profile verification requests at this moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}
