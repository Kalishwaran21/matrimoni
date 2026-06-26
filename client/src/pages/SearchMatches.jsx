import React, { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Search, SlidersHorizontal } from "lucide-react";
import MatchCard from "../components/MatchCard";
import { CardSkeleton } from "../components/Spinner";
import { toast } from "../components/Toast";
import { api } from "../services/api";

const filterConfig = [
  { key: "ageMin", label: "Min Age", type: "number", placeholder: "18" },
  { key: "ageMax", label: "Max Age", type: "number", placeholder: "45" },
  { key: "religion", label: "Religion", type: "text", placeholder: "e.g. Hindu" },
  { key: "caste", label: "Caste", type: "text", placeholder: "e.g. Brahmin" },
  { key: "city", label: "City", type: "text", placeholder: "e.g. Chennai" },
  { key: "education", label: "Education", type: "text", placeholder: "e.g. B.Tech" },
  { key: "job", label: "Job Title", type: "text", placeholder: "e.g. Engineer" },
  { key: "salaryMin", label: "Min Salary (₹)", type: "number", placeholder: "500000" }
];

export default function SearchMatches() {
  const [filters, setFilters] = useState({});
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(true);

  const search = async () => {
    setLoading(true);
    try {
      const clean = Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v !== "" && v !== undefined)
      );
      const { data } = await api.get("/search", { params: clean });
      setResults(data.results || []);
    } catch {
      toast.error("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { search(); }, []);

  const sendInterest = async (to) => {
    try {
      await api.post("/interest/send", { to });
      toast.success("Interest sent successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to send interest.");
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
        <p className="label">Match search</p>
        <h1 className="mt-2 text-3xl font-black text-slate-950">Advanced Partner Search</h1>
        <p className="mt-1 text-sm text-slate-500">
          {loading ? "Searching..." : `${results.length} profiles found`}
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
            Filter Matches
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
                <Search size={17} /> Search
              </button>
              <button type="button" className="btn-secondary" onClick={reset}>
                Clear Filters
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
          <p className="font-black text-slate-950">No matches found</p>
          <p className="mt-2 text-sm text-slate-400">Try adjusting your filters to find more profiles.</p>
        </div>
      )}
    </div>
  );
}
