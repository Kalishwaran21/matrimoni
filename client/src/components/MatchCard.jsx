import React from "react";
import { Briefcase, GraduationCap, Heart, HeartHandshake, MapPin, Star, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { formatName } from "../utils/transliterate";

export default function MatchCard({ item, onInterest }) {
  const { t, language } = useLanguage();
  const profile = item.profile || item;
  const user = profile.user || {};
  const photo = profile.photo?.url;
  const match = item.matchPercentage ?? 60;
  const rawName = profile.basic?.name || user.fullName || "Unknown";
  const name = formatName(rawName, language);

  // Gradient color for match % badge
  const matchColor =
    match >= 80 ? "text-emerald-700 bg-emerald-50" :
    match >= 50 ? "text-amber-700 bg-amber-50" :
    "text-maroon-700 bg-maroon-50";

  return (
    <article className="group overflow-hidden rounded-2xl border border-rose-100 bg-white shadow-soft card-hover">
      {/* Photo */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-rose-50 to-maroon-50">
        {photo ? (
          <img
            src={photo}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full place-items-center text-6xl font-black text-maroon-200 select-none">
            {name.charAt(0).toUpperCase()}
          </div>
        )}

        {/* Match % overlay badge */}
        <div className={`absolute right-3 top-3 flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-black shadow ${matchColor}`}>
          <Star size={11} fill="currentColor" />
          {match}% {language === "en" ? "Match" : "பொருத்தம்"}
        </div>

        {/* Premium badge */}
        {user.isPremium && (
          <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 px-2.5 py-1 text-xs font-black text-white shadow">
            ✦ {language === "en" ? "Premium" : "பிரீமியம்"}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-5">
        <div className="mb-3">
          <h3 className="text-lg font-black text-slate-950 flex items-center gap-1.5">
            {name}
            {profile.isApproved && (
              <span className="inline-flex items-center justify-center rounded-full bg-emerald-500 p-0.5 text-white shadow-sm shrink-0" title="Verified Profile">
                <ShieldCheck size={14} fill="currentColor" />
              </span>
            )}
          </h3>
          <p className="text-sm text-slate-500">
            {profile.basic?.age ? `${profile.basic.age} ${language === "en" ? "yrs" : "வயது"}` : "--"}{profile.basic?.height ? ` · ${profile.basic.height} cm` : ""}
          </p>
        </div>

        {/* Match % bar */}
        <div className="mb-4">
          <div className="match-bar-track">
            <div className="match-bar-fill" style={{ width: `${match}%` }} />
          </div>
        </div>

        {/* Details */}
        <div className="grid gap-1.5 text-sm text-slate-600">
          <span className="flex items-center gap-2">
            <MapPin size={14} className="text-maroon-400 shrink-0" />
            {profile.location?.city || (language === "en" ? "Location pending" : "இருப்பிடம் குறிப்பிடப்படவில்லை")}
          </span>
          <span className="flex items-center gap-2">
            <GraduationCap size={14} className="text-maroon-400 shrink-0" />
            {profile.education?.degree || (language === "en" ? "Education pending" : "கல்வி குறிப்பிடப்படவில்லை")}
          </span>
          <span className="flex items-center gap-2">
            <Briefcase size={14} className="text-maroon-400 shrink-0" />
            {profile.career?.jobTitle || (language === "en" ? "Career pending" : "தொழில் குறிப்பிடப்படவில்லை")}
          </span>
        </div>

        {/* Actions */}
        <div className="mt-5 flex gap-2">
          <Link to={`/profile/${profile._id}`} className="btn-secondary flex-1 !py-2.5 text-xs">
            {t("viewProfile")}
          </Link>
          <button
            id={`interest-${profile._id}`}
            className="btn-primary flex-1 !py-2.5 text-xs"
            onClick={() => onInterest?.(profile.user?._id || profile.user)}
          >
            <HeartHandshake size={15} /> {t("interestBtn")}
          </button>
        </div>
      </div>
    </article>
  );
}
