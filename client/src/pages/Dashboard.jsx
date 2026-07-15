import React, { useEffect, useState } from "react";
import { Bell, HeartHandshake, MessageCircle, Search, Star, TrendingUp, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import StatCard from "../components/StatCard";
import { FullPageSpinner } from "../components/Spinner";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { formatName } from "../utils/transliterate";

export default function Dashboard() {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [profile, setProfile] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([api.get("/profile/me"), api.get("/notifications")]).then(
      ([profileResult, notifResult]) => {
        if (profileResult.status === "fulfilled") setProfile(profileResult.value.data.profile);
        if (notifResult.status === "fulfilled")
          setNotifications(notifResult.value.data.notifications);
        setLoading(false);
      }
    );
  }, []);

  const unread = notifications.filter((n) => !n.isRead).length;
  const completionScore = profile?.completionScore || 0;

  const stats = [
    { label: t("dashStatProfileScore"), value: `${completionScore}%`, icon: Star, color: completionScore >= 70 ? "emerald" : "amber" },
    { label: t("dashStatNotif"), value: unread, icon: Bell, color: unread > 0 ? "maroon" : "blue" },
    { label: t("dashStatSearch"), value: t("dashStatSearchVal"), icon: Search, color: "blue" },
    { label: t("dashStatInterests"), value: t("dashStatInterestsVal"), icon: HeartHandshake, color: "emerald" }
  ];

  if (loading) return <FullPageSpinner />;

  return (
    <div className="grid gap-6 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="label">{t("dashHeroTag")}</p>
          <h1 className="mt-2 text-3xl font-black text-slate-950">
            {t("dashHeroTitle")}{" "}
            <span className="text-maroon-700">{formatName(user?.fullName?.split(" ")[0], language)}!</span>
          </h1>
        </div>
        {!profile && (
          <Link to="/profile" className="btn-primary shrink-0">
            <UserRound size={16} /> {t("dashCompleteBtn")}
          </Link>
        )}
      </div>

      {/* Completion banner */}
      {profile && completionScore < 80 && (
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
          <div className="flex items-center gap-3">
            <TrendingUp size={20} className="text-amber-600 shrink-0" />
            <div>
              <p className="font-semibold text-amber-900">{t("dashProfileStatusDesc").replace("!", "")} - {completionScore}%</p>
              <p className="text-sm text-amber-700">{t("dashProfileStatusDesc")}</p>
            </div>
          </div>
          <Link to="/profile" className="shrink-0 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 transition-colors">
            {t("dashUpdateBtn")}
          </Link>
        </div>
      )}

      {/* Profile score bar */}
      {profile && (
        <div className="panel">
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold text-slate-800">{t("dashProfileComp")}</p>
            <span className="badge-maroon">{completionScore}%</span>
          </div>
          <div className="match-bar-track h-3">
            <div
              className="match-bar-fill h-3"
              style={{ width: `${completionScore}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between text-xs text-slate-400">
            <span>{t("dashGettingStarted")}</span>
            <span>{t("dashCompleteTick")}</span>
          </div>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: t("dashActionSearchTitle"), icon: Search, href: "/matches", desc: t("dashActionSearchDesc") },
          { label: t("dashActionInterestsTitle"), icon: HeartHandshake, href: "/interests", desc: t("dashActionInterestsDesc") },
          { label: t("dashActionChatTitle"), icon: MessageCircle, href: "/chat", desc: t("dashActionChatDesc") }
        ].map(({ label, icon: Icon, href, desc }) => (
          <Link
            key={label}
            to={href}
            className="flex items-center gap-4 panel card-hover no-underline group"
          >
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-maroon-50 text-maroon-600 group-hover:bg-maroon-100 transition-colors">
              <Icon size={22} />
            </span>
            <div>
              <p className="font-black text-slate-950">{label}</p>
              <p className="text-sm text-slate-500">{desc}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Notifications */}
      <section className="panel">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-black text-slate-950">{t("dashNotifTitle")}</h2>
          {unread > 0 && <span className="badge-maroon">{unread} {t("dashNotifNew")}</span>}
        </div>
        <div className="grid gap-3">
          {notifications.slice(0, 6).map((item) => (
            <div
              key={item._id}
              className={`flex items-start gap-3 rounded-xl px-4 py-3 ${
                item.isRead ? "bg-slate-50" : "bg-maroon-50 border border-maroon-100"
              }`}
            >
              <Bell size={16} className={item.isRead ? "text-slate-400 mt-0.5" : "text-maroon-600 mt-0.5"} />
              <div>
                <p className="font-semibold text-slate-900">{item.title}</p>
                <p className="text-sm text-slate-600 mt-0.5">{item.message}</p>
              </div>
              {!item.isRead && <span className="ml-auto h-2 w-2 shrink-0 rounded-full bg-maroon-500 mt-1.5" />}
            </div>
          ))}
          {!notifications.length && (
            <p className="text-center py-8 text-sm text-slate-400">
              {t("dashNotifEmpty")}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
