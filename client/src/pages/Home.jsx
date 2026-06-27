import React from "react";
import { ArrowRight, HeartHandshake, Lock, Search, ShieldCheck, Sparkles, Star, UsersRound } from "lucide-react";
import { Link } from "react-router-dom";
import PlanCard from "../components/PlanCard";
import StatCard from "../components/StatCard";
import { heroImage, plans, testimonials } from "../utils/constants";
import { useLanguage } from "../context/LanguageContext";

export default function Home() {
  const { t, language } = useLanguage();

  const stats = [
    { label: t("verifiedProfiles"), value: "32K+", icon: ShieldCheck, color: "maroon" },
    { label: t("interestsTitle") + " " + (language === "en" ? "Matches" : "வரன்கள்"), value: "8.5K", icon: HeartHandshake, color: "emerald" },
    { label: t("chat") + " " + (language === "en" ? "Members" : "உறுப்பினர்கள்"), value: "18K", icon: UsersRound, color: "amber" },
    { label: t("home") === "Home" ? "Cities Covered" : "நகரங்கள்", value: "140+", icon: Sparkles, color: "blue" }
  ];

  const whyUs = [
    {
      icon: ShieldCheck,
      title: t("verifiedProfiles"),
      desc: t("verifiedDesc")
    },
    {
      icon: Star,
      title: t("home") === "Home" ? "Smart Matching" : "மேம்பட்ட வரன் பொருத்தம்",
      desc: t("smartMatchingDesc")
    },
    {
      icon: Lock,
      title: t("home") === "Home" ? "Privacy First" : "முழு பாதுகாப்பு",
      desc: t("secureDesc")
    },
    {
      icon: HeartHandshake,
      title: t("home") === "Home" ? "Interest System" : "விருப்பம் தெரிவிக்கும் முறை",
      desc: t("home") === "Home" 
        ? "Send and accept interests before starting a conversation — always respectful."
        : "அரட்டையைத் தொடங்குவதற்கு முன் வரன்களின் விருப்பத்தைப் பெறலாம்."
    }
  ];

  return (
    <>
      {/* ── Hero ────────────────────────────────────── */}
      <section className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
        <img
          src={heroImage}
          alt="Wedding couple"
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-maroon-950/90 via-maroon-900/70 to-transparent" />

        <div className="container-pad relative flex min-h-[calc(100vh-4rem)] items-center py-20">
          <div className="max-w-2xl animate-fade-up text-white">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur">
              <Sparkles size={15} className="text-pink-300" />
              {t("home") === "Home" ? "Trusted profiles · Meaningful matches" : "நம்பகமான வரன்கள் · பொருத்தமான இணைகள்"}
            </p>

            <h1 className="text-5xl font-black leading-[1.1] sm:text-6xl lg:text-7xl">
              {t("home") === "Home" ? "Find Your" : "கண்டறியுங்கள்"}
              <br />
              <span className="bg-gradient-to-r from-rose-300 to-pink-200 bg-clip-text text-transparent">
                {t("home") === "Home" ? "Perfect Life" : "சரியான வாழ்க்கை"}
              </span>
              <br />
              {t("home") === "Home" ? "Partner" : "துணையை"}
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-8 text-rose-100">
              {t("heroSubtitle")}
            </p>

            <div className="mt-10 flex flex-wrap gap-3">
              <Link to="/register" id="hero-register" className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:from-amber-500 hover:to-orange-600 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 focus:outline-none">
                {t("registerFree")} <ArrowRight size={18} />
              </Link>
              <Link to="/matches" className="rounded-xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20">
                {t("exploreMatches")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Quick Search ────────────────────────────── */}
      <section className="bg-white py-10">
        <div className="container-pad">
          <div className="rounded-2xl border border-rose-100 bg-white p-6 shadow-soft">
            <p className="label mb-4 text-center">
              {t("home") === "Home" ? "Quick Partner Search" : "விரைவான வரன் தேடல்"}
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[(t("home") === "Home" ? "Age" : "வயது"), (t("home") === "Home" ? "Religion" : "மதம்"), (t("home") === "Home" ? "City" : "நகரம்"), (t("home") === "Home" ? "Education" : "கல்வி")].map((label) => (
                <label key={label}>
                  <span className="label mb-2 block">{label}</span>
                  <input
                    className="field"
                    placeholder={t("home") === "Home" ? `Preferred ${label.toLowerCase()}` : `விரும்பிய ${label}`}
                  />
                </label>
              ))}
            </div>
            <div className="mt-5 flex justify-center">
              <Link to="/matches" className="btn-primary gap-2">
                <Search size={17} /> {t("search")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ───────────────────────────────────── */}
      <section className="bg-[#fff8fa] py-14">
        <div className="container-pad grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>
      </section>

      {/* ── Why Us ──────────────────────────────────── */}
      <section className="bg-white py-20">
        <div className="container-pad">
          <div className="mb-12 text-center">
            <p className="label">{t("whyChooseUs")}</p>
            <h2 className="mt-3 section-title">
              {t("seriousComp")}
            </h2>
            <p className="section-subtitle mx-auto max-w-xl">
              {t("whyUsDesc")}
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {whyUs.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="rounded-2xl border border-rose-100 bg-white p-6 shadow-soft card-hover text-center"
              >
                <span className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-xl bg-maroon-50">
                  <Icon size={22} className="text-maroon-600" />
                </span>
                <h3 className="font-black text-slate-950">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Plans ───────────────────────────────────── */}
      <section className="bg-[#fff8fa] py-20">
        <div className="container-pad">
          <div className="mb-12 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="label">{t("home") === "Home" ? "Membership plans" : "உறுப்பினர் திட்டங்கள்"}</p>
              <h2 className="mt-2 section-title">
                {t("home") === "Home" ? "Choose how you connect" : "உங்களுக்கான சரியான திட்டத்தை தேர்வு செய்யவும்"}
              </h2>
            </div>
            <Link to="/pricing" className="btn-secondary shrink-0">
              {t("home") === "Home" ? "View All Plans" : "அனைத்து திட்டங்களையும் காண்க"}
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-2 max-w-3xl mx-auto">
            {plans.map((plan) => (
              <PlanCard key={plan.name} plan={plan} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Success Stories ─────────────────────────── */}
      <section className="bg-white py-20">
        <div className="container-pad">
          <div className="mb-12 text-center">
            <p className="label">{t("home") === "Home" ? "Success stories" : "வெற்றிக் கதைகள்"}</p>
            <h2 className="mt-2 section-title">
              {t("home") === "Home" ? "Stories that began with a" : "சுயவிவரத்தில் தொடங்கிய"}{" "}
              <span className="text-maroon-700">
                {t("home") === "Home" ? "thoughtful profile" : "வாழ்க்கை பயணங்கள்"}
              </span>
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((story) => (
              <article
                key={story.name}
                className="relative overflow-hidden rounded-2xl border border-rose-100 bg-gradient-to-b from-[#fff8fa] to-white p-7 shadow-soft card-hover"
              >
                <div className="mb-4 text-4xl text-maroon-200 font-black select-none">&ldquo;</div>
                <p className="leading-7 text-slate-600">{story.text}</p>
                <div className="mt-6 flex items-center gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-maroon-100 font-black text-maroon-700">
                    {story.name.charAt(0)}
                  </span>
                  <div>
                    <p className="font-black text-maroon-700">{story.name}</p>
                    <div className="flex gap-0.5 mt-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={11} fill="currentColor" className="text-amber-400" />
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ──────────────────────────────── */}
      <section className="bg-gradient-to-r from-maroon-700 via-maroon-800 to-maroon-900 py-16">
        <div className="container-pad text-center">
          <h2 className="text-3xl font-black text-white sm:text-4xl">
            {t("home") === "Home" ? "Ready to find your life partner?" : "உங்கள் வாழ்க்கை துணையை கண்டறிய தயாரா?"}
          </h2>
          <p className="mt-4 text-maroon-200">
            {t("home") === "Home" ? "Join thousands of verified members across India." : "இந்தியா முழுவதும் உள்ள ஆயிரக்கணக்கான சரிபார்க்கப்பட்ட உறுப்பினர்களுடன் இணையுங்கள்."}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link to="/register" className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-8 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:from-amber-500 hover:to-orange-600 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 focus:outline-none">
              {t("registerFree")} <ArrowRight className="inline ml-1" size={16} />
            </Link>
            <Link to="/about" className="rounded-xl border border-white/30 px-8 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
              {t("home") === "Home" ? "Learn More" : "மேலும் அறிய"}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
