import React, { useEffect, useState } from "react";
import { X, Sparkles, ChevronRight } from "lucide-react";
import MatchCard from "./MatchCard";
import { api } from "../services/api";
import { toast } from "./Toast";
import { useLanguage } from "../context/LanguageContext";

export default function DailyMatchesPopup() {
  const [profiles, setProfiles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const { language } = useLanguage();

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const lastShown = localStorage.getItem("lastDailyMatchesShown");
    
    if (lastShown === today) {
      setLoading(false);
      return;
    }

    const fetchDailyMatches = async () => {
      try {
        const { data } = await api.get("/search/daily-matches");
        if (data.results && data.results.length > 0) {
          setProfiles(data.results);
          setIsOpen(true);
        }
      } catch (err) {
        console.error("Failed to fetch daily matches", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDailyMatches();
  }, []);

  const handleNext = () => {
    if (currentIndex < profiles.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      closePopup();
    }
  };

  const closePopup = () => {
    const today = new Date().toISOString().split("T")[0];
    localStorage.setItem("lastDailyMatchesShown", today);
    setIsOpen(false);
  };

  const handleInterest = async (userId) => {
    try {
      await api.post("/interest/send", { to: userId });
      toast.success(language === "en" ? "Interest sent!" : "விருப்பம் அனுப்பப்பட்டது!");
      handleNext();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not send interest.");
    }
  };

  if (!isOpen || profiles.length === 0) return null;

  const currentMatch = profiles[currentIndex];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-sm rounded-3xl bg-white shadow-2xl animate-fade-up flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-rose-100 p-4">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-rose-100 text-maroon-600">
              <Sparkles size={16} />
            </div>
            <h2 className="font-black text-slate-800">
              {language === "en" ? "Daily Matches" : "தினசரி பொருத்தங்கள்"}
            </h2>
          </div>
          <button
            onClick={handleNext}
            className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
            title="Next profile"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="mb-4 text-center text-sm font-semibold text-slate-500">
            {language === "en" ? "Profile" : "சுயவிவரம்"} {currentIndex + 1} / {profiles.length}
          </p>
          
          <div className="pointer-events-auto">
             <MatchCard item={currentMatch} onInterest={handleInterest} />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-center border-t border-rose-100 p-4">
          <button
            onClick={handleNext}
            className="flex items-center gap-2 rounded-xl bg-slate-100 px-6 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-200 transition-colors"
          >
            {language === "en" ? "Skip to Next" : "அடுத்தது"} <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
