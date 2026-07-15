import React, { useEffect, useState } from "react";
import { Check, Clock, HeartHandshake, X, SlidersHorizontal, ThumbsUp, ThumbsDown, ShieldCheck, MoreVertical } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import { FullPageSpinner } from "../components/Spinner";
import { toast } from "../components/Toast";
import { useLanguage } from "../context/LanguageContext";
import { formatName } from "../utils/transliterate";

export default function Interests() {
  const { t, language } = useLanguage();
  const [data, setData] = useState({ received: [], sent: [] });
  const [loading, setLoading] = useState(true);
  const [section, setSection] = useState("received"); // "received" or "sent"
  const [statusFilter, setStatusFilter] = useState("All"); // "All", "Pending", "Accepted", "Rejected"
  const [respondingId, setRespondingId] = useState(null);

  const load = () =>
    api.get("/interest").then(({ data }) => {
      setData(data);
      setLoading(false);
    }).catch(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const respond = async (interestId, status) => {
    setRespondingId(interestId);
    try {
      await api.post("/interest/respond", { interestId, status });
      toast.success(
        language === "en" 
          ? `Interest ${status === "Accepted" ? "accepted" : "declined"}!`
          : `விருப்பக்கோரிக்கை ${status === "Accepted" ? "ஏற்கப்பட்டது" : "நிராகரிக்கப்பட்டது"}!`
      );
      await load();
    } catch {
      toast.error(language === "en" ? "Action failed. Please try again." : "செயல் தோல்வியடைந்தது. மீண்டும் முயற்சிக்கவும்.");
    } finally {
      setRespondingId(null);
    }
  };

  const getFilteredList = () => {
    const list = section === "received" ? data.received : data.sent;
    if (statusFilter === "All") return list;
    if (statusFilter === "Pending") return list.filter((i) => i.status === "Pending");
    if (statusFilter === "Accepted") return list.filter((i) => i.status === "Accepted");
    if (statusFilter === "Rejected") return list.filter((i) => i.status === "Rejected");
    return list;
  };

  const getCounts = (sectionName) => {
    const list = sectionName === "received" ? data.received : data.sent;
    return {
      all: list.length,
      pending: list.filter((i) => i.status === "Pending").length,
      accepted: list.filter((i) => i.status === "Accepted").length,
      declined: list.filter((i) => i.status === "Rejected").length
    };
  };

  if (loading) return <FullPageSpinner />;

  const filteredList = getFilteredList();
  const receivedCounts = getCounts("received");
  const sentCounts = getCounts("sent");

  const transLabel = (label) => {
    if (label === "All") return language === "en" ? "All" : "அனைத்தும்";
    if (label === "Pending") return language === "en" ? "Pending" : "காத்திருப்பவை";
    if (label === "Accepted/Replied") return language === "en" ? "Accepted/Replied" : "ஏற்கப்பட்டவை";
    if (label === "Declined") return language === "en" ? "Declined" : "நிராகரிக்கப்பட்டவை";
    return label;
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[280px_1fr] animate-fade-up items-start">
      {/* ── Left Sidebar Navigation ──────────────── */}
      <div className="rounded-2xl border border-rose-100 bg-white p-5 shadow-soft flex flex-col gap-6">
        {/* Interests Received */}
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 px-3 mb-3">{t("receivedTitle")}</h3>
          <nav className="flex flex-col gap-1">
            {[
              { label: "All", filter: "All", count: receivedCounts.all },
              { label: "Pending", filter: "Pending", count: receivedCounts.pending, badge: true },
              { label: "Accepted/Replied", filter: "Accepted", count: receivedCounts.accepted },
              { label: "Declined", filter: "Rejected", count: receivedCounts.declined }
            ].map(({ label, filter, count, badge }) => {
              const isActive = section === "received" && statusFilter === filter;
              return (
                <button
                  key={label}
                  onClick={() => {
                    setSection("received");
                    setStatusFilter(filter);
                  }}
                  className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-maroon-50 text-maroon-800 font-bold"
                      : "text-slate-600 hover:bg-rose-50/50 hover:text-slate-950"
                  }`}
                >
                  <span className={isActive && filter === "All" ? "text-emerald-600 font-bold" : ""}>
                    {transLabel(label)} ({count})
                  </span>
                  {badge && count > 0 && (
                    <span className="rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-black text-white">
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <hr className="border-rose-50" />

        {/* Interests Sent */}
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 px-3 mb-3">{t("sentTitle")}</h3>
          <nav className="flex flex-col gap-1">
            {[
              { label: "All", filter: "All", count: sentCounts.all },
              { label: "Pending", filter: "Pending", count: sentCounts.pending },
              { label: "Accepted/Replied", filter: "Accepted", count: sentCounts.accepted },
              { label: "Declined", filter: "Rejected", count: sentCounts.declined }
            ].map(({ label, filter, count }) => {
              const isActive = section === "sent" && statusFilter === filter;
              return (
                <button
                  key={label}
                  onClick={() => {
                    setSection("sent");
                    setStatusFilter(filter);
                  }}
                  className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-maroon-50 text-maroon-800 font-bold"
                      : "text-slate-600 hover:bg-rose-50/50 hover:text-slate-950"
                  }`}
                >
                  <span>
                    {transLabel(label)} ({count})
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* ── Main Content Area ────────────────────── */}
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-950">
              {transLabel(statusFilter === "Accepted" ? "Accepted/Replied" : statusFilter === "Rejected" ? "Declined" : statusFilter)}{" "}
              {language === "en" ? "interests" : "விருப்பக்கோரிக்கைகள்"}{" "}
              {section === "received" ? (language === "en" ? "received" : "வந்துள்ளன") : (language === "en" ? "sent" : "அனுப்பப்பட்டுள்ளன")}{" "}
              ({filteredList.length})
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {section === "received" 
                ? (language === "en" ? "Interests and responses from other members" : "இதர உறுப்பினர்களிடமிருந்து வந்த விருப்பங்கள் மற்றும் பதில்கள்")
                : (language === "en" ? "Interests and responses from you" : "உங்களால் அனுப்பப்பட்ட விருப்பங்கள் மற்றும் பதில்கள்")}
            </p>
          </div>
          <button className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-rose-100 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-soft hover:bg-rose-50/50 transition">
            <SlidersHorizontal size={14} className="text-slate-500" /> {language === "en" ? "Filter" : "வடிகட்டி"}
          </button>
        </div>

        {/* List Grid */}
        <div className="grid gap-4">
          {filteredList.map((item) => {
            const isReceived = section === "received";
            const person = isReceived ? item.from : item.to;
            const personProfile = isReceived ? item.fromProfile : item.toProfile;

            // Details line format
            const age = personProfile?.basic?.age ? `${personProfile.basic.age} ${language === "en" ? "yrs" : "வயது"}` : "";
            const height = personProfile?.basic?.height ? `${personProfile.basic.height} cm` : "";
            const religion = personProfile?.religion?.religion || "";
            const caste = personProfile?.religion?.caste || "";
            const job = personProfile?.career?.jobTitle || "";
            const salary = personProfile?.career?.salary
              ? `₹${(personProfile.career.salary / 100000).toFixed(1)} Lakhs p.a.`
              : "";
            const city = personProfile?.location?.city || "";

            const details = [age, height, religion, caste, job, salary, city].filter(Boolean).join(" · ");
            const photoUrl = personProfile?.photo?.url;
            const profileId = `M${(person?._id || "").substring(18).toUpperCase()}`;

            const formattedDate = new Date(item.createdAt).toLocaleDateString(language === "en" ? "en-IN" : "ta-IN", {
              day: "numeric",
              month: "short",
              year: "2-digit"
            });

            return (
              <div
                key={item._id}
                className="relative rounded-2xl border border-rose-100 bg-white p-5 shadow-soft hover:shadow-md transition-all flex flex-col sm:flex-row gap-5"
              >
                {/* Photo / Avatar */}
                {personProfile ? (
                  <Link
                    to={`/profile/${personProfile._id}`}
                    className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl border border-rose-100 bg-rose-50 flex items-center justify-center group"
                  >
                    {photoUrl ? (
                      <img
                        src={photoUrl}
                        alt={person?.fullName}
                        className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    ) : (
                      <span className="text-4xl font-black text-maroon-200 select-none group-hover:scale-110 transition duration-300">
                        {formatName(person, language).charAt(0).toUpperCase()}
                      </span>
                    )}
                  </Link>
                ) : (
                  <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl border border-rose-100 bg-rose-50 flex items-center justify-center">
                    <div className="grid h-full w-full place-items-center bg-rose-100 text-3xl font-black text-maroon-300">
                      {formatName(person, language).charAt(0).toUpperCase()}
                    </div>
                  </div>
                )}

                {/* Details Content */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      {personProfile ? (
                        <Link
                          to={`/profile/${personProfile._id}`}
                          className="text-lg font-black text-slate-950 hover:text-maroon-700 transition"
                        >
                          {formatName(person, language)}
                        </Link>
                      ) : (
                        <h3 className="text-lg font-black text-slate-950">{formatName(person, language)}</h3>
                      )}
                      {personProfile?.isApproved && (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-black text-emerald-600 border border-emerald-100">
                          <ShieldCheck size={10} className="fill-current text-emerald-600" /> {language === "en" ? "Verified" : "சரிபார்க்கப்பட்டது"}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 font-semibold tracking-wider mt-0.5">{profileId}</p>

                    {details && (
                      <p className="text-xs text-slate-500 mt-2 font-semibold leading-relaxed">
                        {details}
                      </p>
                    )}

                    {/* Status Message Context */}
                    <p className="text-xs text-slate-600 mt-3 font-semibold flex items-center gap-1.5">
                      {isReceived ? (
                        item.status === "Pending" ? (
                          <>
                            <Clock size={12} className="text-amber-500" />
                            <span>
                              {language === "en"
                                ? `He sent you an interest · ${formattedDate}. Accept his interest to start a conversation.`
                                : `அவர் உங்களுக்கு விருப்பக் கோரிக்கை அனுப்பியுள்ளார் · ${formattedDate}. உரையாடலைத் தொடங்க விருப்பத்தை ஏற்கவும்.`}
                            </span>
                          </>
                        ) : item.status === "Accepted" ? (
                          <>
                            <Check size={12} className="text-emerald-500" />
                            <span className="text-emerald-600">
                              {language === "en"
                                ? `You accepted his interest · ${formattedDate}.`
                                : `அவரது விருப்பக் கோரிக்கையை நீங்கள் ஏற்றுக்கொண்டீர்கள் · ${formattedDate}.`}
                            </span>
                          </>
                        ) : (
                          <>
                            <X size={12} className="text-red-500" />
                            <span className="text-red-500">
                              {language === "en" ? "You declined his interest." : "அவரது விருப்பக் கோரிக்கையை நீங்கள் நிராகரித்துவிட்டீர்கள்."}
                            </span>
                          </>
                        )
                      ) : (
                        item.status === "Pending" ? (
                          <>
                            <Clock size={12} className="text-slate-400" />
                            <span>
                              {language === "en"
                                ? `You sent an interest · ${formattedDate}. Waiting for response.`
                                : `நீங்கள் விருப்பக் கோரிக்கை அனுப்பியுள்ளீர்கள் · ${formattedDate}. பதிலுக்காக காத்திருக்கிறது.`}
                            </span>
                          </>
                        ) : item.status === "Accepted" ? (
                          <>
                            <Check size={12} className="text-emerald-500" />
                            <span className="text-emerald-600">
                              {language === "en"
                                ? `He accepted your interest · ${formattedDate}.`
                                : `அவர் உங்கள் விருப்பக் கோரிக்கையை ஏற்றுக்கொண்டார் · ${formattedDate}.`}
                            </span>
                          </>
                        ) : (
                          <>
                            <X size={12} className="text-red-500" />
                            <span className="text-red-500">
                              {language === "en" ? "He declined your interest." : "அவர் உங்கள் விருப்பக் கோரிக்கையை நிராகரித்துவிட்டார்."}
                            </span>
                          </>
                        )
                      )}
                    </p>
                  </div>

                  {/* Actions buttons */}
                  {isReceived && item.status === "Pending" && (
                    <div className="mt-4 flex items-center gap-3">
                      <button
                        onClick={() => respond(item._id, "Rejected")}
                        disabled={respondingId === item._id}
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-black text-slate-600 shadow-soft transition-all hover:bg-slate-50 active:translate-y-0.5 disabled:opacity-50"
                      >
                        <ThumbsDown size={13} /> {t("declineBtn")}
                      </button>
                      <button
                        onClick={() => respond(item._id, "Accepted")}
                        disabled={respondingId === item._id}
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-orange-600 px-5 py-2.5 text-xs font-black text-white shadow-soft transition-all hover:bg-orange-700 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
                      >
                        <ThumbsUp size={13} /> {respondingId === item._id ? (language === "en" ? "Accepting..." : "ஏற்கப்படுகிறது...") : (language === "en" ? "Accept Interest" : "விருப்பத்தை ஏற்றுக்கொள்")}
                      </button>
                    </div>
                  )}
                </div>

                {/* Options button */}
                <button className="absolute right-4 top-4 text-slate-300 hover:text-slate-500 transition">
                  <MoreVertical size={18} />
                </button>
              </div>
            );
          })}

          {filteredList.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center panel bg-white">
              <HeartHandshake size={48} className="text-maroon-200 mb-4" />
              <p className="font-black text-slate-900 text-lg">
                {language === "en" 
                  ? `No ${statusFilter.toLowerCase()} interests found`
                  : `${transLabel(statusFilter)} விருப்பக்கோரிக்கைகள் எதுவும் இல்லை`}
              </p>
              <p className="mt-2 text-sm text-slate-400 max-w-sm">
                {language === "en"
                  ? "There are currently no interests matching this category. Explore more profiles and make a connection!"
                  : "இந்த பிரிவில் தற்சமயம் விருப்பக் கோரிக்கைகள் எதுவும் இல்லை. கூடுதல் வரன்களைத் தேடி இணைப்பை ஏற்படுத்தவும்!"}
              </p>
              <Link to="/matches" className="btn-primary mt-6 text-xs">
                {t("exploreMatches")}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
