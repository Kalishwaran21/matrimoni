import React, { useState } from "react";
import { ArrowRight, Heart, HeartHandshake, Menu, Search, ShieldCheck, Sparkles, Star, UsersRound, X, LogOut, UserRound, Bell } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "ta" : "en");
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
    <header className="sticky top-0 z-40 border-b border-rose-100/60 bg-white/90 backdrop-blur-md shadow-sm">
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
    </header>
  );
}
