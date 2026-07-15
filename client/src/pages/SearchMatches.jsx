import React, { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Search, SlidersHorizontal, X, ShieldCheck } from "lucide-react";
import MatchCard from "../components/MatchCard";
import { CardSkeleton } from "../components/Spinner";
import { toast } from "../components/Toast";
import { api } from "../services/api";
import { useLanguage } from "../context/LanguageContext";
import { formatName } from "../utils/transliterate";

export default function SearchMatches() {
  const { t, language } = useLanguage();
  const [filters, setFilters] = useState({});
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(true);

  // Daily Match Popup States
  const [showPopup, setShowPopup] = useState(false);
  const [popupMatches, setPopupMatches] = useState([]);
  const [popupIndex, setPopupIndex] = useState(0);

  const filterConfig = [
    { key: "ageMin", label: t("prefMinAge"), type: "number", placeholder: "18" },
    { key: "ageMax", label: t("prefMaxAge"), type: "number", placeholder: "45" },
    { key: "religion", label: t("fieldReligion"), type: "text", placeholder: "e.g. Hindu" },
    { key: "caste", label: t("fieldCaste"), type: "text", placeholder: "e.g. Nadar" },
    { key: "city", label: t("fieldCity"), type: "text", placeholder: "e.g. Chennai" },
    { key: "education", label: t("fieldEducation"), type: "text", placeholder: "e.g. B.Tech" },
    { key: "job", label: t("fieldProfession"), type: "text", placeholder: "e.g. Developer" },
    { key: "salaryMin", label: t("prefSalary"), type: "number", placeholder: "500000" }
  ];

  const search = async () => {
    setLoading(true);
    try {
      const clean = Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v !== "" && v !== undefined)
      );
      const { data } = await api.get("/search", { params: clean });
      setResults(data.results || []);
    } catch {
      toast.error(language === "en" ? "Search failed. Please try again." : "தேடல் தோல்வியடைந்தது. மீண்டும் முயற்சிக்கவும்.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    search();
    
    // Check first login of the day matching preferences
    const today = new Date().toISOString().split("T")[0];
    const lastShown = localStorage.getItem("last_matches_popup_shown_date");
    
    if (lastShown !== today) {
      api.get("/profile/me").then(({ data }) => {
        if (data.profile?.preferences) {
          const pref = data.profile.preferences;
          const params = {
            ageMin: pref.ageMin || undefined,
            ageMax: pref.ageMax || undefined,
            religion: pref.religion || undefined,
            caste: pref.caste || undefined,
            job: pref.job || undefined,
            language: pref.language || undefined
          };
          api.get("/search", { params }).then((res) => {
            const list = res.data.results || [];
            if (list.length > 0) {
              setPopupMatches(list.slice(0, 5));
              setPopupIndex(0);
              setShowPopup(true);
            }
          }).catch(err => console.error(err));
        }
      }).catch(err => console.error(err));
    }
  }, []);

  const sendInterest = async (to) => {
    try {
      await api.post("/interest/send", { to });
      toast.success(language === "en" ? "Interest sent successfully!" : "விருப்பம் வெற்றிகரமாக அனுப்பப்பட்டது!");
    } catch (err) {
      toast.error(err.response?.data?.message || (language === "en" ? "Unable to send interest." : "விருப்பம் அனுப்ப முடியவில்லை."));
    }
  };

  const handleClosePopup = () => {
    if (popupIndex < popupMatches.length - 1) {
      setPopupIndex((prev) => prev + 1);
    } else {
      setShowPopup(false);
      const today = new Date().toISOString().split("T")[0];
      localStorage.setItem("last_matches_popup_shown_date", today);
      toast.success(language === "en" ? "Check out more profiles on Matches page!" : "வரன்கள் பக்கத்தில் கூடுதல் சுயவிவரங்களை காண்க!");
    }
  };

  const reset = () => {
    setFilters({});
    setTimeout(search, 50);
  };

  // Popup Profile fields
  const activeMatch = popupMatches[popupIndex];
  const activeProfile = activeMatch?.profile;
  const activeUser = activeMatch?.user;

  return (
    <div className="grid gap-6 animate-fade-up">
      {/* Header */}
      <div>
        <p className="label">{t("matches")}</p>
        <h1 className="mt-2 text-3xl font-black text-slate-950">{t("advancedSearch")}</h1>
        <p className="mt-1 text-sm text-slate-500">
          {loading ? (language === "en" ? "Searching..." : "தேடப்படுகிறது...") : `${results.length} ${t("profilesFound")}`}
        </p>
      </div>

      {/* Filter panel */}
      <section className="panel">
        <button
          type="button"
          onClick={() => setFiltersOpen((v) => !v)}
          className="flex w-full items-center justify-between text-left"
        >
          <div className="flex items-center gap-2 font-black text-maroon-800">
            <SlidersHorizontal size={18} />
            {t("filterMatches")}
          </div>
          {filtersOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>

        {filtersOpen && (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {filterConfig.map(({ key, label, type, placeholder }) => (
              <label key={key}>
                <span className="label">{label}</span>
                <input
                  className="field mt-2"
                  type={type}
                  placeholder={placeholder}
                  value={filters[key] || ""}
                  onChange={(e) => setFilters({ ...filters, [key]: e.target.value })}
                />
              </label>
            ))}
            <div className="sm:col-span-2 lg:col-span-4 flex gap-3 pt-1">
              <button id="search-submit" className="btn-primary" onClick={search}>
                <Search size={17} /> {t("search")}
              </button>
              <button type="button" className="btn-secondary" onClick={reset}>
                {t("clearFilters")}
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Results */}
      {loading ? (
        <CardSkeleton count={6} />
      ) : results.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {results.map((item) => (
            <MatchCard
              key={item.profile._id}
              item={item}
              onInterest={sendInterest}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-rose-100 bg-white py-20 text-center">
          <Search size={40} className="text-maroon-200 mb-4" />
          <p className="font-black text-slate-950">{t("noMatches")}</p>
          <p className="mt-2 text-sm text-slate-400">{t("adjustFilters")}</p>
        </div>
      )}

      {/* DAILY MATCH RECOMMENDATION POPUP */}
      {showPopup && activeProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-fade-in">
          <div className="relative flex max-h-[90vh] w-full max-w-sm flex-col rounded-3xl border border-rose-100 bg-white shadow-2xl animate-scale-up p-5">
            
            {/* Header / Tracker */}
            <div className="flex items-center justify-between border-b border-rose-100/50 pb-3 mb-4">
              <div>
                <h3 className="font-black text-slate-950 text-base">
                  {language === "en" ? "Daily Matches for You" : "இன்றைய வரன் பரிந்துரைகள்"}
                </h3>
                <p className="text-[11px] text-slate-400 font-bold mt-0.5 uppercase tracking-wider">
                  {language === "en" ? `Profile ${popupIndex + 1} of ${popupMatches.length}` : `வரன் ${popupIndex + 1} / ${popupMatches.length}`}
                </p>
              </div>
              <button
                type="button"
                onClick={handleClosePopup}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-rose-50 hover:text-slate-600 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Profile body */}
            <div className="flex flex-col items-center text-center space-y-3.5">
              <div className="h-44 w-44 rounded-full overflow-hidden border-2 border-rose-200 shadow bg-slate-50 relative shrink-0">
                {activeProfile.photos?.[0]?.url ? (
                  <img
                    src={activeProfile.photos[0].url}
                    alt={activeProfile.basic?.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="grid h-full place-items-center text-5xl font-black text-maroon-200 uppercase">
                    {formatName(activeProfile.user, language).charAt(0)}
                  </div>
                )}
                {activeProfile.isApproved && (
                  <div className="absolute -bottom-1 -right-1 grid h-5 w-5 place-items-center rounded-full bg-emerald-500 text-white border-2 border-white shadow-sm">
                    <ShieldCheck size={12} />
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-lg font-black text-slate-950">{formatName(activeProfile.user, language)}</h4>
                <p className="text-xs font-bold text-rose-600 mt-0.5">
                  {activeProfile.career?.jobTitle || "—"} • {activeProfile.location?.city || "—"}
                </p>
              </div>

              <div className="w-full grid grid-cols-2 gap-2 text-left text-xs bg-rose-50/30 rounded-2xl p-4 border border-rose-100/50">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">{t("fieldAge")}</p>
                  <p className="font-bold text-slate-800 mt-0.5">{activeProfile.basic?.age || "—"} Yrs</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">{t("fieldReligion")}</p>
                  <p className="font-bold text-slate-800 mt-0.5 truncate">{t(activeProfile.religion?.religion) || "—"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">{t("fieldCaste")}</p>
                  <p className="font-bold text-slate-800 mt-0.5 truncate">{activeProfile.religion?.caste || "—"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">{t("fieldMotherTongue")}</p>
                  <p className="font-bold text-slate-800 mt-0.5 truncate">{t(activeProfile.religion?.motherTongue) || "—"}</p>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2.5 mt-5 border-t border-rose-100/50 pt-4">
              <button
                type="button"
                onClick={handleClosePopup}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-700 shadow-soft hover:bg-slate-50 transition"
              >
                {language === "en" ? "Skip" : "தவிர்"}
              </button>
              <button
                type="button"
                onClick={() => {
                  sendInterest(activeUser?._id);
                  handleClosePopup();
                }}
                className="flex-1 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 py-2.5 text-xs font-bold text-white shadow-soft transition hover:from-rose-600 hover:to-pink-700"
              >
                {t("interestBtn")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
