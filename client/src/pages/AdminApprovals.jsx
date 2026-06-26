import React, { useEffect, useState } from "react";
import { Check, ChevronDown, ChevronUp, Eye, Search, ShieldCheck } from "lucide-react";
import { api } from "../services/api";
import { FullPageSpinner } from "../components/Spinner";
import { toast } from "../components/Toast";

export default function AdminApprovals() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState({});

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

  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
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
          const isUserExpanded = expanded[profile._id];
          const photo = profile.photos?.[0]?.url;

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
                  <button
                    type="button"
                    onClick={() => toggleExpand(profile._id)}
                    className="btn-secondary !py-2 !px-3 text-xs flex items-center gap-1.5 flex-1 md:flex-initial justify-center"
                  >
                    <Eye size={14} />
                    {isUserExpanded ? "Hide Details" : "View Details"}
                    {isUserExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
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

              {/* Collapsible Details */}
              {isUserExpanded && (
                <div className="mt-5 border-t border-rose-50 pt-5 grid gap-6 animate-fade-up">
                  {/* Gallery */}
                  {profile.photos?.length > 0 && (
                    <div>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">Submitted Photos</p>
                      <div className="flex flex-wrap gap-3">
                        {profile.photos.map((ph, idx) => (
                          <a
                            key={idx}
                            href={ph.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="h-24 w-24 overflow-hidden rounded-xl border border-rose-100 hover:scale-105 transition"
                          >
                            <img src={ph.url} alt={`submitted-${idx}`} className="h-full w-full object-cover" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Detail Grid */}
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {/* Basic */}
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5">
                      <p className="text-xs font-black text-maroon-800 uppercase tracking-wider mb-2">Personal & Physical</p>
                      <div className="text-xs space-y-1.5 text-slate-700">
                        <p><span className="font-semibold text-slate-400">Date of Birth:</span> {profile.basic?.dob ? new Date(profile.basic.dob).toLocaleDateString("en-IN") : "—"}</p>
                        <p><span className="font-semibold text-slate-400">Height / Weight:</span> {profile.basic?.height || "—"} / {profile.basic?.weight || "—"}</p>
                        <p><span className="font-semibold text-slate-400">Marital Status:</span> {profile.basic?.marital || "—"}</p>
                        <p><span className="font-semibold text-slate-400">Mother Tongue:</span> {profile.basic?.language || "—"}</p>
                        <p><span className="font-semibold text-slate-400">Physical Status:</span> {profile.basic?.physical || "—"}</p>
                        <p><span className="font-semibold text-slate-400">Complexion:</span> {profile.basic?.color || "—"}</p>
                      </div>
                    </div>

                    {/* Religion & Horoscope */}
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5">
                      <p className="text-xs font-black text-maroon-800 uppercase tracking-wider mb-2">Religion & Horoscope</p>
                      <div className="text-xs space-y-1.5 text-slate-700">
                        <p><span className="font-semibold text-slate-400">Religion / Caste:</span> {profile.religion?.religion || "—"} / {profile.religion?.caste || "—"}</p>
                        <p><span className="font-semibold text-slate-400">Sub-caste / Gothram:</span> {profile.religion?.subCaste || "—"} / {profile.religion?.gothram || "—"}</p>
                        <p><span className="font-semibold text-slate-400">Rasi / Star:</span> {profile.horoscope?.rasi || "—"} / {profile.horoscope?.nakshatra || "—"}</p>
                        <p><span className="font-semibold text-slate-400">Dosham:</span> {profile.horoscope?.dosham || "—"}</p>
                      </div>
                    </div>

                    {/* Education & Career */}
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5">
                      <p className="text-xs font-black text-maroon-800 uppercase tracking-wider mb-2">Education & Career</p>
                      <div className="text-xs space-y-1.5 text-slate-700">
                        <p><span className="font-semibold text-slate-400">Degree / College:</span> {profile.education?.degree || "—"} / {profile.education?.college || "—"}</p>
                        <p><span className="font-semibold text-slate-400">Profession / Company:</span> {profile.career?.jobTitle || "—"} / {profile.career?.company || "—"}</p>
                        <p><span className="font-semibold text-slate-400">Income:</span> {profile.career?.salary ? `₹${fmt(profile.career.salary)} p.a.` : "—"}</p>
                      </div>
                    </div>

                    {/* Family */}
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5">
                      <p className="text-xs font-black text-maroon-800 uppercase tracking-wider mb-2">Family Information</p>
                      <div className="text-xs space-y-1.5 text-slate-700">
                        <p><span className="font-semibold text-slate-400">Father's Status:</span> {profile.family?.fatherOccupation || "—"}</p>
                        <p><span className="font-semibold text-slate-400">Mother's Status:</span> {profile.family?.motherOccupation || "—"}</p>
                        <p><span className="font-semibold text-slate-400">Siblings:</span> {profile.family?.siblings ?? "—"}</p>
                        <p><span className="font-semibold text-slate-400">Family Type:</span> {profile.family?.familytype || "—"}</p>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5">
                      <p className="text-xs font-black text-maroon-800 uppercase tracking-wider mb-2">Location</p>
                      <div className="text-xs space-y-1.5 text-slate-700">
                        <p><span className="font-semibold text-slate-400">Current Place:</span> {profile.location?.currentPlace || "—"}</p>
                        <p><span className="font-semibold text-slate-400">City / State:</span> {profile.location?.city || "—"} / {profile.location?.state || "—"}</p>
                        <p><span className="font-semibold text-slate-400">Country:</span> {profile.location?.country || "—"}</p>
                        <p><span className="font-semibold text-slate-400">Native Place:</span> {profile.location?.nativePlace || "—"}</p>
                      </div>
                    </div>

                    {/* Lifestyle */}
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5">
                      <p className="text-xs font-black text-maroon-800 uppercase tracking-wider mb-2">Lifestyle</p>
                      <div className="text-xs space-y-1.5 text-slate-700">
                        <p><span className="font-semibold text-slate-400">Diet Type:</span> {profile.lifestyle?.foodType || "—"}</p>
                        <p><span className="font-semibold text-slate-400">Smoking:</span> {profile.lifestyle?.smoking || "—"}</p>
                        <p><span className="font-semibold text-slate-400">Drinking:</span> {profile.lifestyle?.drinking || "—"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="bg-rose-50/30 border border-rose-100/40 rounded-xl p-4">
                    <p className="text-xs font-black text-maroon-800 uppercase tracking-wider mb-2">About Me Bio</p>
                    <p className="text-xs text-slate-600 leading-relaxed italic">"{profile.about || "No bio provided."}"</p>
                  </div>
                </div>
              )}
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
