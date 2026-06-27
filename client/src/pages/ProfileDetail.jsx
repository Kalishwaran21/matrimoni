import React from "react";
import { ArrowRight, Briefcase, GraduationCap, Heart, HeartHandshake, MapPin, Star, Lock, Mail, Phone, Check, X, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../services/api";
import { toast } from "../components/Toast";
import { FullPageSpinner } from "../components/Spinner";
import { useAuth } from "../context/AuthContext";

const labelize = (v) => v.replace(/([A-Z])/g, " $1").replace(/^./, (l) => l.toUpperCase());

export default function ProfileDetail() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isContactShared, setIsContactShared] = useState(false);
  const [interest, setInterest] = useState(null);
  const [sending, setSending] = useState(false);

  const fetchProfile = () => {
    api.get(`/profile/${id}`).then(({ data }) => {
      setProfile(data.profile);
      setIsContactShared(data.isContactShared);
      setInterest(data.interest);
    }).catch((err) => {
      toast.error(err.response?.data?.message || "Could not load profile.");
    });
  };

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const sendInterest = async () => {
    setSending(true);
    try {
      await api.post("/interest/send", { to: profile.user?._id });
      toast.success("Interest sent!");
      fetchProfile();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not send interest.");
    } finally {
      setSending(false);
    }
  };

  const acceptInterest = async () => {
    if (!interest) return;
    setSending(true);
    try {
      await api.post("/interest/respond", { interestId: interest._id, status: "Accepted" });
      toast.success("Interest accepted!");
      fetchProfile();
    } catch (err) {
      toast.error("Could not accept interest.");
    } finally {
      setSending(false);
    }
  };

  const rejectInterest = async () => {
    if (!interest) return;
    setSending(true);
    try {
      await api.post("/interest/respond", { interestId: interest._id, status: "Rejected" });
      toast.success("Interest rejected.");
      fetchProfile();
    } catch (err) {
      toast.error("Could not reject interest.");
    } finally {
      setSending(false);
    }
  };

  if (!profile) return <FullPageSpinner />;

  const name = profile.basic?.name || profile.user?.fullName || "Profile";
  const allPhotos = profile.photos || [];

  return (
    <div className="grid gap-6 animate-fade-up">
      {/* Hero card */}
      <section className="overflow-hidden rounded-2xl border border-rose-100 bg-white shadow-soft">
        <div className="grid lg:grid-cols-[380px_1fr]">
          {/* Main photo */}
          <div className="relative aspect-[4/3] bg-gradient-to-br from-rose-50 to-maroon-50 lg:aspect-auto">
            {allPhotos[0]?.url ? (
              <img src={allPhotos[0].url} alt={name} className="h-full w-full object-cover" />
            ) : (
              <div className="grid h-full min-h-72 place-items-center text-7xl font-black text-maroon-200 select-none">
                {name.charAt(0).toUpperCase()}
              </div>
            )}
            {/* Completion badge */}
            <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-white/90 px-3 py-1.5 text-xs font-black text-maroon-700 shadow backdrop-blur">
              <Star size={12} fill="currentColor" /> {profile.completionScore}% complete
            </div>
          </div>

          {/* Info */}
          <div className="p-7">
            <p className="label">Profile</p>
            <h1 className="mt-2 text-3xl font-black text-slate-950 flex items-center gap-2">
              {name}
              {profile.isApproved && (
                <span className="inline-flex items-center justify-center rounded-full bg-emerald-500 p-1 text-white shadow-sm" title="Verified Profile">
                  <ShieldCheck size={18} fill="currentColor" />
                </span>
              )}
            </h1>

            {profile.user?.isPremium && (
              <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 px-3 py-1 text-xs font-black text-white">
                ✦ Premium Member
              </span>
            )}

            <div className="mt-5 grid gap-2.5 text-sm text-slate-600 sm:grid-cols-2">
              <span className="flex items-center gap-2">
                <MapPin size={15} className="text-maroon-400" />
                {[profile.location?.city, profile.location?.state].filter(Boolean).join(", ") || "Location not set"}
              </span>
              <span className="flex items-center gap-2">
                <GraduationCap size={15} className="text-maroon-400" />
                {profile.education?.degree || "Education not set"}
              </span>
              <span className="flex items-center gap-2">
                <Briefcase size={15} className="text-maroon-400" />
                {profile.career?.jobTitle || "Career not set"}
              </span>
              <span className="flex items-center gap-2">
                <Heart size={15} className="text-maroon-400" />
                {profile.religion?.religion || "Religion not set"}
                {profile.religion?.caste ? ` · ${profile.religion.caste}` : ""}
              </span>
            </div>

            <div className="mt-6 flex flex-wrap gap-3 items-center">
              {currentUser?._id !== profile.user?._id && (
                <>
                  {!interest && (
                    <button
                      id="profile-detail-interest"
                      className="btn-primary"
                      onClick={sendInterest}
                      disabled={sending}
                    >
                      <HeartHandshake size={17} />
                      {sending ? "Sending..." : "Send Interest"}
                    </button>
                  )}

                  {interest && interest.status === "Pending" && interest.from === currentUser?._id && (
                    <button
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-200 px-5 py-3 text-sm font-semibold text-slate-500 cursor-not-allowed"
                      disabled
                    >
                      <HeartHandshake size={17} />
                      Interest Pending
                    </button>
                  )}

                  {interest && interest.status === "Pending" && interest.to === currentUser?._id && (
                    <div className="flex gap-2">
                      <button
                        className="btn-primary !bg-emerald-600 hover:!bg-emerald-700"
                        onClick={acceptInterest}
                        disabled={sending}
                      >
                        <Check size={17} /> Accept
                      </button>
                      <button
                        className="btn-secondary !text-red-600 !border-red-200 hover:!bg-red-50 hover:!border-red-400"
                        onClick={rejectInterest}
                        disabled={sending}
                      >
                        <X size={17} /> Reject
                      </button>
                    </div>
                  )}

                  {interest && interest.status === "Accepted" && (
                    <span className="badge bg-emerald-50 text-emerald-700 px-4 py-2 border border-emerald-200 text-sm font-black flex items-center gap-1.5 rounded-xl">
                      <Check size={16} /> Connected
                    </span>
                  )}

                  {interest && interest.status === "Rejected" && (
                    <button
                      id="profile-detail-interest"
                      className="btn-primary"
                      onClick={sendInterest}
                      disabled={sending}
                    >
                      <HeartHandshake size={17} />
                      {sending ? "Sending..." : "Send Interest Again"}
                    </button>
                  )}
                </>
              )}
              <Link to="/matches" className="btn-secondary">
                <ArrowRight size={17} /> Back to Matches
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Photo gallery */}
      {allPhotos.length > 1 && (
        <section className="panel">
          <h2 className="mb-5 text-xl font-black text-maroon-800">Photos</h2>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {allPhotos.map((p, i) => (
              <div key={i} className="aspect-square overflow-hidden rounded-xl border border-rose-100">
                <img src={p.url} alt={`Photo ${i + 1}`} className="h-full w-full object-cover hover:scale-105 transition-transform duration-300" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Detail sections */}
      {["basic", "religion", "career", "family", "assets"].map((section) => {
        const entries = Object.entries(profile[section] || {}).filter(([, v]) => v !== "" && v !== null && v !== undefined);
        if (!entries.length) return null;
        return (
          <section key={section} className="panel">
            <h2 className="mb-5 text-xl font-black capitalize text-maroon-800">{section}</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {entries.map(([key, value]) => (
                <div key={key} className="rounded-xl bg-rose-50 px-4 py-3 border border-rose-100">
                  <p className="label text-rose-400">{labelize(key)}</p>
                  <p className="mt-1 font-semibold text-slate-800">{String(value)}</p>
                </div>
              ))}
            </div>
          </section>
        );
      })}

      {/* Horoscope Section */}
      <section className="panel">
        <h2 className="mb-5 text-xl font-black text-maroon-800">Horoscope Details</h2>
        {isContactShared ? (
          (() => {
            const entries = Object.entries(profile.horoscope || {}).filter(([, v]) => v !== "" && v !== null && v !== undefined);
            if (!entries.length) {
              return <p className="text-slate-500 text-sm">No horoscope details provided.</p>;
            }
            return (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {entries.map(([key, value]) => (
                  <div key={key} className="rounded-xl bg-rose-50 px-4 py-3 border border-rose-100">
                    <p className="label text-rose-400">{labelize(key)}</p>
                    <p className="mt-1 font-semibold text-slate-800">{String(value)}</p>
                  </div>
                ))}
              </div>
            );
          })()
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl bg-rose-50/50 border border-dashed border-rose-200 py-8 px-4 text-center">
            <span className="mb-3 grid h-12 w-12 place-items-center rounded-full bg-maroon-50 text-maroon-600 shadow-soft animate-pulse-ring">
              <Lock size={20} />
            </span>
            <p className="font-semibold text-slate-800">Horoscope Details Locked</p>
            <p className="mt-1 text-sm text-slate-500 max-w-sm">
              Connect and accept each other's interest to automatically unlock horoscope details (Rasi, Nakshatra, Dosham).
            </p>
          </div>
        )}
      </section>

      {/* Contact Details Section */}
      <section className="panel">
        <h2 className="mb-5 text-xl font-black text-maroon-800">Contact Details</h2>
        {isContactShared ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl bg-rose-50 px-4 py-3 border border-rose-100 flex items-center gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-maroon-100 text-maroon-600">
                <Mail size={16} />
              </span>
              <div>
                <p className="label text-rose-400">Email Address</p>
                <p className="mt-0.5 font-semibold text-slate-800">{profile.user?.email || "Not provided"}</p>
              </div>
            </div>
            <div className="rounded-xl bg-rose-50 px-4 py-3 border border-rose-100 flex items-center gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-maroon-100 text-maroon-600">
                <Phone size={16} />
              </span>
              <div>
                <p className="label text-rose-400">Mobile Number</p>
                <p className="mt-0.5 font-semibold text-slate-800">{profile.user?.mobile || "Not provided"}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl bg-rose-50/50 border border-dashed border-rose-200 py-8 px-4 text-center">
            <span className="mb-3 grid h-12 w-12 place-items-center rounded-full bg-maroon-50 text-maroon-600 shadow-soft animate-pulse-ring">
              <Lock size={20} />
            </span>
            <p className="font-semibold text-slate-800">Contact Details Locked</p>
            <p className="mt-1 text-sm text-slate-500 max-w-sm">
              Connect and accept each other's interest to automatically unlock phone and email details.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
