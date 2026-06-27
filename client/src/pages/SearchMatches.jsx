import React, { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Search, SlidersHorizontal } from "lucide-react";
import MatchCard from "../components/MatchCard";
import { CardSkeleton } from "../components/Spinner";
import { toast } from "../components/Toast";
import { api } from "../services/api";
import { useLanguage } from "../context/LanguageContext";

export default function SearchMatches() {
  const { t, language } = useLanguage();
  const [filters, setFilters] = useState({});
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(true);

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

  useEffect(() => { search(); }, []);

  const sendInterest = async (to) => {
    try {
      await api.post("/interest/send", { to });
      toast.success(language === "en" ? "Interest sent successfully!" : "விருப்பம் வெற்றிகரமாக அனுப்பப்பட்டது!");
    } catch (err) {
      toast.error(err.response?.data?.message || (language === "en" ? "Unable to send interest." : "விருப்பம் அனுப்ப முடியவில்லை."));
    }
  };

  const reset = () => {
    setFilters({});
    setTimeout(search, 50);
  };

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
    </div>
  );
}
