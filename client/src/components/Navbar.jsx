import React, { useState, useEffect } from "react";
import { ArrowRight, Heart, HeartHandshake, Menu, Search, ShieldCheck, Sparkles, Star, UsersRound, X, LogOut, UserRound, Bell, Lock } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { useSocket } from "../context/SocketContext";
import { api } from "../services/api";
import { toast } from "./Toast";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const { socket } = useSocket();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [interestPopup, setInterestPopup] = useState(null);

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "ta" : "en");
  };

  useEffect(() => {
    if (!user) return;
    api.get("/notifications").then(({ data }) => {
      setNotifications(data.notifications || []);
    }).catch((err) => console.log(err));
  }, [user]);

  useEffect(() => {
    if (!socket) return;

    socket.on("notification:new", (newNotif) => {
      setNotifications((prev) => [newNotif, ...prev]);

      // If it is an interest received/accepted event, trigger popup
      if (newNotif.type === "New Interest" || newNotif.type === "Interest Accepted") {
        setInterestPopup(newNotif);
      } else {
        toast.success(newNotif.message);
      }
    });

    return () => {
      socket.off("notification:new");
    };
  }, [socket]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter((n) => !n.isRead).map((n) => n._id);
    if (!unreadIds.length) return;
    try {
      await api.post("/notifications/mark-read", { ids: unreadIds });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success(language === "en" ? "All marked as read" : "அனைத்தும் படித்தவையாக குறிக்கப்பட்டது");
    } catch (err) {
      console.error(err);
    }
  };

  const publicLinks = [
    [t("home"), "/"],
    [t("about"), "/about"],
    [t("pricing"), "/pricing"],
    [t("contact"), "/contact"]
  ];

  const authedLinks = [
    [t("matches"), "/matches"],
    [t("interests"), "/interests"],
    [t("chat"), "/chat"],
    [t("plans"), "/subscription"],
    [t("profile"), "/profile"]
  ];

  const links = user
    ? (user.role !== "admin" && !user.isProfileSubmitted
        ? [[t("profile"), "/profile"]]
        : authedLinks)
    : publicLinks;

  return (
    <header className="sticky top-0 z-40 border-b border-rose-100/60 bg-white/95 backdrop-blur-md shadow-sm">
      {/* Support Top Bar */}
      <div className="bg-gradient-to-r from-maroon-700 to-rose-600 py-1.5 px-4 text-center text-xs font-semibold text-white flex items-center justify-center gap-2">
        <span>📞</span>
        <span>
          {language === "en" ? "Customer Support / Queries:" : "வாடிக்கையாளர் சேவை / உதவிக்கு:"}
        </span>
        <a href="tel:+918000000000" className="underline hover:text-rose-100 transition-colors font-bold tracking-wider">
          +91 80000 00000
        </a>
      </div>
      <nav className="container-pad flex min-h-16 items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 text-lg font-black text-maroon-700">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-maroon-600 to-pink-600 text-white shadow-sm animate-pulse-ring">
            <Heart size={18} fill="currentColor" />
          </span>
          <span className="hidden sm:block">Soulmate Matrimony</span>
          <span className="block sm:hidden">Soulmate</span>
        </Link>

        {/* Mobile menu trigger + Switcher wrapper */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={toggleLanguage}
            className="inline-flex items-center gap-1 rounded-xl border border-rose-100 bg-rose-50/50 hover:bg-rose-50 px-3 py-1.5 text-xs font-bold text-maroon-700 transition"
            title="Switch Language / மொழியை மாற்றவும்"
          >
            🌐 {language === "en" ? "தமிழ்" : "EN"}
          </button>
          
          {user && (
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="rounded-xl p-2 text-maroon-700 hover:bg-maroon-50 transition-colors relative"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-600" />
                )}
              </button>
            </div>
          )}

          <button
            className="rounded-xl p-2 text-maroon-700 hover:bg-maroon-50 transition-colors"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>

        {/* Desktop nav links */}
        <div className="hidden items-center gap-1 md:flex">
          {links.map(([label, href]) => (
            <NavLink
              key={href}
              to={href}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                  isActive
                    ? "bg-maroon-50 text-maroon-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-maroon-700"
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden items-center gap-2 md:flex">
          {/* Language Switcher */}
          <button
            onClick={toggleLanguage}
            className="inline-flex items-center gap-1.5 rounded-xl border border-rose-100 bg-rose-50/80 hover:bg-rose-100 px-3 py-2 text-xs font-black text-maroon-700 transition mr-1"
            title="Switch Language / மொழியை மாற்றவும்"
          >
            🌐 {language === "en" ? "தமிழ்" : "English"}
          </button>

          {user ? (
            <>
              {/* Notification Bell with Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="btn-ghost !px-3 !py-2 relative"
                  title="Notifications"
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {notifOpen && (
                  <div className="absolute right-0 mt-3 w-80 rounded-2xl border border-rose-100 bg-white p-4 shadow-xl animate-scale-up">
                    <div className="flex items-center justify-between border-b border-rose-50 pb-2.5 mb-2">
                      <span className="font-black text-slate-900 text-sm">
                        {language === "en" ? "Notifications" : "அறிவிப்புகள்"}
                      </span>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-xs font-bold text-maroon-700 hover:underline"
                        >
                          {language === "en" ? "Mark read" : "படித்தவை"}
                        </button>
                      )}
                    </div>
                    <div className="max-h-60 overflow-y-auto space-y-2">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-slate-400 py-4 text-center">
                          {language === "en" ? "No new notifications" : "புதிய அறிவிப்புகள் எதுவும் இல்லை"}
                        </p>
                      ) : (
                        notifications.slice(0, 10).map((n) => (
                          <div
                            key={n._id}
                            className={`p-2.5 rounded-xl border transition-colors ${
                              n.isRead
                                ? "bg-slate-50/50 border-slate-100 text-slate-500"
                                : "bg-rose-50/40 border-rose-100/60 text-slate-800 font-medium"
                            }`}
                          >
                            <p className="text-xs font-bold text-slate-900">{n.title}</p>
                            <p className="text-[11px] mt-0.5 text-slate-500">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <Link
                to="/profile"
                className="btn-ghost !px-3 !py-2"
                title={t("profile")}
              >
                <UserRound size={17} />
              </Link>
              <button
                onClick={logout}
                className="btn-secondary !px-3 !py-2"
                title={t("logout")}
              >
                <LogOut size={17} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-secondary !px-4 !py-2 text-sm">
                {t("login")}
              </Link>
              <Link to="/register" className="btn-primary !px-4 !py-2 text-sm">
                <Search size={15} /> {t("register")}
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Mobile notifications overlay drawer */}
      {notifOpen && mdViewAlerts(notifOpen, notifications, unreadCount, markAllAsRead, language, setNotifOpen)}

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-rose-100 bg-white px-4 pb-5 pt-3 md:hidden animate-fade-up">
          <div className="grid gap-1">
            {links.map(([label, href]) => (
              <NavLink
                key={href}
                to={href}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                    isActive ? "bg-maroon-50 text-maroon-700" : "text-slate-700 hover:bg-slate-50"
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </div>
          <div className="mt-4 grid gap-2">
            {user ? (
              <button onClick={logout} className="btn-secondary">
                <LogOut size={16} /> {t("logout")}
              </button>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)} className="btn-secondary">
                  {t("login")}
                </Link>
                <Link to="/register" onClick={() => setOpen(false)} className="btn-primary">
                  {t("register")}
                </Link>
              </>
            )}
          </div>
        </div>
      )}

      {/* Real-time Interest Received Popup */}
      {interestPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-sm rounded-3xl border border-rose-100 bg-white p-6 shadow-2xl animate-scale-up text-center">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-rose-500 to-maroon-600 text-white shadow-lg animate-pulse-ring mb-4">
              <Heart size={30} fill="currentColor" />
            </span>
            <h3 className="text-lg font-black text-slate-950">
              {interestPopup.type === "New Interest"
                ? (language === "ta" ? "விருப்பம் பெறப்பட்டது! 💖" : "New Interest Received! 💖")
                : (language === "ta" ? "விருப்பம் ஏற்றுக்கொள்ளப்பட்டது! 💕" : "Interest Accepted! 💕")}
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              {interestPopup.message}
            </p>
            <div className="mt-6 flex flex-col gap-2">
              <Link
                to="/interests"
                onClick={() => setInterestPopup(null)}
                className="btn-primary w-full py-2.5 text-xs font-bold"
              >
                {language === "ta" ? "விருப்பங்கள் பக்கத்தை காண்க" : "View Interests Page"}
              </Link>
              <button
                onClick={() => setInterestPopup(null)}
                className="btn-secondary w-full py-2 text-xs font-semibold"
              >
                {language === "ta" ? "மூடு" : "Close"}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function mdViewAlerts(notifOpen, notifications, unreadCount, markAllAsRead, language, setNotifOpen) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 md:hidden backdrop-blur-sm flex justify-end">
      <div className="w-80 bg-white h-full p-5 flex flex-col shadow-2xl animate-fade-left">
        <div className="flex items-center justify-between border-b border-rose-100 pb-4 mb-4">
          <span className="font-black text-slate-950 text-lg">
            {language === "en" ? "Notifications" : "அறிவிப்புகள்"}
          </span>
          <button
            onClick={() => setNotifOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>
        
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="btn-secondary w-full py-2 mb-4 text-xs font-bold"
          >
            {language === "en" ? "Mark all as read" : "அனைத்தையும் படித்தவையாக குறிக்கவும்"}
          </button>
        )}

        <div className="flex-1 overflow-y-auto space-y-2">
          {notifications.length === 0 ? (
            <p className="text-xs text-slate-400 py-10 text-center">
              {language === "en" ? "No new notifications" : "புதிய அறிவிப்புகள் எதுவும் இல்லை"}
            </p>
          ) : (
            notifications.map((n) => (
              <div
                key={n._id}
                className={`p-3 rounded-xl border ${
                  n.isRead ? "bg-slate-50 border-slate-100" : "bg-rose-50/50 border-rose-100"
                }`}
              >
                <p className="text-xs font-bold text-slate-900">{n.title}</p>
                <p className="text-[11px] text-slate-500 mt-1">{n.message}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
