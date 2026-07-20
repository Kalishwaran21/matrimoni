import React, { useEffect, useState } from "react";
import { Eye, Search, ShieldCheck, Edit, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import { FullPageSpinner } from "../components/Spinner";
import { toast } from "../components/Toast";

export default function AdminCreatedProfiles() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = () => {
    setLoading(true);
    api.get("/admin/created-profiles")
      .then(({ data }) => {
        setProfiles(data.profiles || []);
        setLoading(false);
      })
      .catch(() => {
        toast.error("Could not load created profiles.");
        setLoading(false);
      });
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id) => {
    if (!id) return;
    if (!window.confirm("Are you sure you want to delete this profile permanently?")) return;
    
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success("Profile deleted successfully");
      setProfiles(prev => prev.filter(p => p.user?._id !== id));
    } catch (err) {
      toast.error("Failed to delete profile");
    }
  };

  const filtered = profiles.filter((p) => {
    const name = p.basic?.name || p.user?.fullName || "";
    const email = p.user?.email || "";
    return (
      name.toLowerCase().includes(search.toLowerCase()) ||
      email.toLowerCase().includes(search.toLowerCase())
    );
  });

  if (loading) return <FullPageSpinner />;

  return (
    <div className="grid gap-6 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="label">Admin Desk</p>
          <h1 className="mt-2 text-3xl font-black text-slate-950">
            Admin Created Profiles
            <span className="ml-3 rounded-full bg-rose-50 border border-rose-100 px-3 py-1 text-base font-black text-maroon-700">
              {profiles.length}
            </span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">Review all profiles that were manually created by the admin.</p>
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
              <div className="flex flex-col md:flex-row gap-5 items-start justify-between">
                <div className="flex gap-4 items-start">
                  {/* Photo Thumbnail */}
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-rose-100 bg-rose-50 flex items-center justify-center relative">
                    {photo ? (
                      <img src={photo} alt={name} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-2xl font-black text-maroon-200 select-none">
                        {name.charAt(0).toUpperCase()}
                      </span>
                    )}
                    {profile.isApproved && (
                      <span className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-0.5 text-white shadow" title="Verified">
                        <ShieldCheck size={12} fill="currentColor" />
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
                    <p className="text-[10px] text-slate-400 mt-2">
                      Created: {new Date(profile.createdAt).toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0">
                  <Link
                    to={`/profile/${profile.profileId || profile._id}`}
                    target="_blank"
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                    title="View Profile"
                  >
                    <Eye size={14} />
                  </Link>
                  <Link
                    to={`/manager/edit/${profile.user?._id}`}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                    title="Edit Profile"
                  >
                    <Edit size={14} />
                  </Link>
                  <button
                    onClick={() => handleDelete(profile.user?._id)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition-colors hover:bg-rose-100"
                    title="Delete Profile"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-rose-100 bg-white py-16 text-center">
            <ShieldCheck size={44} className="text-emerald-500 mb-3" />
            <p className="font-black text-slate-950 text-base">No Profiles Found</p>
            <p className="mt-1 text-sm text-slate-400 max-w-sm">There are no admin-created profiles matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
