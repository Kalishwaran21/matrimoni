import React from "react";
import { ArrowRight, Briefcase, GraduationCap, Heart, HeartHandshake, MapPin, Star, Lock, Mail, Phone, Check, X, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../services/api";
import { toast } from "../components/Toast";
import { FullPageSpinner } from "../components/Spinner";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { formatName } from "../utils/transliterate";

const labelize = (v) => v.replace(/([A-Z])/g, " $1").replace(/^./, (l) => l.toUpperCase());
const getFieldKey = (key) => {
  if (key === "fatherOccupation") return "fieldFatherJob";
  if (key === "motherOccupation") return "fieldMotherJob";
  return `field${key.charAt(0).toUpperCase() + key.slice(1)}`;
};

export default function ProfileDetail() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const { t, language } = useLanguage();
  const [profile, setProfile] = useState(null);
  const [isContactShared, setIsContactShared] = useState(false);
  const [limitExceeded, setLimitExceeded] = useState(false);
  const [userPlan, setUserPlan] = useState("Free");
  const [interest, setInterest] = useState(null);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfile = () => {
    setLoading(true);
    setError(null);
    api.get(`/profile/${id}`).then(({ data }) => {
      setProfile(data.profile);
      setIsContactShared(data.isContactShared);
      setLimitExceeded(data.limitExceeded);
      setUserPlan(data.userPlan || "Free");
      setInterest(data.interest);
    }).catch((err) => {
      const errMsg = err.response?.data?.message || "Could not load profile.";
      setError(errMsg);
      toast.error(errMsg);
    }).finally(() => {
      setLoading(false);

    });
  };

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const sendInterest = async () => {
    setSending(true);
    try {
      await api.post("/interest/send", { to: profile.user?._id });
      toast.success("Interest sent!");
      fetchProfile();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not send interest.");
    } finally {
      setSending(false);
    }
  };

  const acceptInterest = async () => {
    if (!interest) return;
    setSending(true);
    try {
      await api.post("/interest/respond", { interestId: interest._id, status: "Accepted" });
      toast.success("Interest accepted!");
      fetchProfile();
    } catch (err) {
      toast.error("Could not accept interest.");
    } finally {
      setSending(false);
    }
  };

  const rejectInterest = async () => {
    if (!interest) return;
    setSending(true);
    try {
      await api.post("/interest/respond", { interestId: interest._id, status: "Rejected" });
      toast.success("Interest rejected.");
      fetchProfile();
    } catch (err) {
      toast.error("Could not reject interest.");
    } finally {
      setSending(false);
    }
  };

  if (loading) return <FullPageSpinner />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-rose-100 bg-white py-20 px-6 text-center max-w-lg mx-auto shadow-soft mt-10">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-rose-100 text-maroon-600 mb-4 animate-bounce">
          ⚠️
        </span>
        <h2 className="text-xl font-black text-slate-950">{language === "ta" ? "சுயவிவரத்தை ஏற்ற முடியவில்லை" : "Failed to Load Profile"}</h2>
        <p className="mt-2 text-sm text-slate-500 mb-6">{error}</p>
        <Link to="/matches" className="btn-primary">
          {language === "ta" ? "வரன்கள் பக்கத்திற்குச் செல்லவும்" : "Go Back to Matches"}
        </Link>
      </div>
    );
  }

  if (!profile) return null;

  const name = formatName(profile.user, language);
  const isOwnProfile = profile.user?._id === currentUser?._id;
  const allPhotos = profile.photo ? [profile.photo] : [];

  return (
    <div className="grid gap-6 animate-fade-up">
      {/* Hero card */}
      <section className="overflow-hidden rounded-2xl border border-rose-100 bg-white shadow-soft">
        <div className="grid lg:grid-cols-[380px_1fr]">
          {/* Main photo */}
          <div className="relative aspect-[4/3] bg-gradient-to-br from-rose-50 to-maroon-50 lg:aspect-auto">
            {allPhotos[0]?.url ? (
              <img src={allPhotos[0].url} alt={name} loading="lazy" className="h-full w-full object-cover" />
            ) : (
              <div className="grid h-full min-h-72 place-items-center text-7xl font-black text-maroon-200 select-none">
                {name.charAt(0).toUpperCase()}
              </div>
            )}
            {/* Completion badge */}
            <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-white/90 px-3 py-1.5 text-xs font-black text-maroon-700 shadow backdrop-blur">
              <Star size={12} fill="currentColor" /> {profile.completionScore}% complete
            </div>
          </div>

          {/* Info */}
          <div className="p-7">
            <p className="label">Profile</p>
            <h1 className="mt-2 text-3xl font-black text-slate-950 flex items-center gap-2">
              {name}
              {profile.isApproved && (
                <span className="inline-flex items-center justify-center rounded-full bg-emerald-500 p-1 text-white shadow-sm" title="Verified Profile">
                  <ShieldCheck size={18} fill="currentColor" />
                </span>
              )}
            </h1>

            {profile.user?.isPremium && (
              <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 px-3 py-1 text-xs font-black text-white">
                ✦ Premium Member
              </span>
            )}

            <div className="mt-5 grid gap-2.5 text-sm text-slate-600 sm:grid-cols-2">
              <span className="flex items-center gap-2">
                <MapPin size={15} className="text-maroon-400" />
                {[profile.location?.city, profile.location?.district, profile.location?.state].filter(Boolean).join(", ") || "Location not set"}
              </span>
              <span className="flex items-center gap-2">
                <GraduationCap size={15} className="text-maroon-400" />
                {profile.education?.degree || "Education not set"}
              </span>
              <span className="flex items-center gap-2">
                <Briefcase size={15} className="text-maroon-400" />
                {profile.career?.jobTitle || "Career not set"}
              </span>
              <span className="flex items-center gap-2">
                <Heart size={15} className="text-maroon-400" />
                {profile.religion?.religion ? t(profile.religion.religion) : "Religion not set"}
                {profile.religion?.caste ? ` · ${language === "ta" && profile.religion.casteTamil ? profile.religion.casteTamil : t(profile.religion.caste)}` : ""}
              </span>
            </div>

            <div className="mt-6 flex flex-wrap gap-3 items-center">
              {currentUser?._id !== profile.user?._id && (
                <>
                  {!interest && (
                    <button
                      id="profile-detail-interest"
                      className="btn-primary"
                      onClick={sendInterest}
                      disabled={sending}
                    >
                      <HeartHandshake size={17} />
                      {sending ? "Sending..." : "Send Interest"}
                    </button>
                  )}

                  {interest && interest.status === "Pending" && interest.from === currentUser?._id && (
                    <button
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-200 px-5 py-3 text-sm font-semibold text-slate-500 cursor-not-allowed"
                      disabled
                    >
                      <HeartHandshake size={17} />
                      Interest Pending
                    </button>
                  )}

                  {interest && interest.status === "Pending" && interest.to === currentUser?._id && (
                    <div className="flex gap-2">
                      <button
                        className="btn-primary !bg-emerald-600 hover:!bg-emerald-700"
                        onClick={acceptInterest}
                        disabled={sending}
                      >
                        <Check size={17} /> Accept
                      </button>
                      <button
                        className="btn-secondary !text-red-600 !border-red-200 hover:!bg-red-50 hover:!border-red-400"
                        onClick={rejectInterest}
                        disabled={sending}
                      >
                        <X size={17} /> Reject
                      </button>
                    </div>
                  )}

                  {interest && interest.status === "Accepted" && (
                    <span className="badge bg-emerald-50 text-emerald-700 px-4 py-2 border border-emerald-200 text-sm font-black flex items-center gap-1.5 rounded-xl">
                      <Check size={16} /> Connected
                    </span>
                  )}

                  {interest && interest.status === "Rejected" && (
                    <button
                      id="profile-detail-interest"
                      className="btn-primary"
                      onClick={sendInterest}
                      disabled={sending}
                    >
                      <HeartHandshake size={17} />
                      {sending ? "Sending..." : "Send Interest Again"}
                    </button>
                  )}
                </>
              )}
              <Link to="/matches" className="btn-secondary">
                <ArrowRight size={17} /> Back to Matches
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Photo gallery */}
      {allPhotos.length > 1 && (
        <section className="panel">
          <h2 className="mb-5 text-xl font-black text-maroon-800">Photos</h2>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {allPhotos.map((p, i) => (
              <div key={i} className="aspect-square overflow-hidden rounded-xl border border-rose-100">
                <img src={p.url} alt={`Photo ${i + 1}`} className="h-full w-full object-cover hover:scale-105 transition-transform duration-300" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Detail sections */}
      {["basic", "religion", "career", "family", "assets"].map((section) => {
        const entries = Object.entries(profile[section] || {}).filter(([k, v]) => 
          v !== "" && v !== null && v !== undefined &&
          k !== "landValue" && k !== "landUnit" && k !== "assetValueLakhs"
        );
        if (!entries.length) return null;
        return (
          <section key={section} className="panel">
            <h2 className="mb-5 text-xl font-black capitalize text-maroon-800">{section === "basic" ? t("secBasic") : section === "religion" ? t("secReligion") : section === "career" ? t("secCareer") : section === "family" ? t("secFamily") : t("secAssets")}</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {entries.map(([key, value]) => {
                let displayVal = t(String(value));
                if (key === "caste" && language === "ta" && profile.religion?.casteTamil) {
                  displayVal = profile.religion.casteTamil;
                }
                if (key === "subCaste" && language === "ta" && profile.religion?.subCasteTamil) {
                  displayVal = profile.religion.subCasteTamil;
                }
                if (key === "dob") {
                  try {
                    displayVal = new Date(value).toISOString().split("T")[0];
                  } catch (e) {
                    displayVal = String(value).split("T")[0];
                  }
                }
                return (
                  <div key={key} className="rounded-xl bg-rose-50 px-4 py-3 border border-rose-100">
                    <p className="label text-rose-400">{t(getFieldKey(key)) !== getFieldKey(key) ? t(getFieldKey(key)) : labelize(key)}</p>
                    <p className="mt-1 font-semibold text-slate-800">{displayVal}</p>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      {/* Horoscope Section */}
      <section className="panel">
        <h2 className="mb-5 text-xl font-black text-maroon-800">Horoscope Details</h2>
        {isContactShared ? (
          (() => {
            const order = ["rasi", "nakshatra", "lagnam", "dosham"];
            const entries = order
              .map((k) => [k, profile.horoscope?.[k]])
              .filter(([, v]) => v !== "" && v !== null && v !== undefined);
            if (!entries.length) {
              return <p className="text-slate-500 text-sm">No horoscope details provided.</p>;
            }
            return (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {entries.map(([key, value]) => (
                  <div key={key} className="rounded-xl bg-rose-50 px-4 py-3 border border-rose-100">
                    <p className="label text-rose-400">{t(getFieldKey(key)) !== getFieldKey(key) ? t(getFieldKey(key)) : labelize(key)}</p>
                    <p className="mt-1 font-semibold text-slate-800">{t(String(value))}</p>
                  </div>
                ))}
              </div>
            );
          })()
        ) : userPlan === "Free" ? (
          <div className="flex flex-col items-center justify-center rounded-xl bg-rose-50/50 border border-dashed border-rose-200 py-8 px-4 text-center">
            <span className="mb-3 grid h-12 w-12 place-items-center rounded-full bg-maroon-50 text-maroon-600 shadow-soft animate-pulse-ring">
              <Lock size={20} />
            </span>
            <p className="font-semibold text-slate-800">
              {language === "ta" ? "ஜாதக விவரங்கள் பூட்டப்பட்டுள்ளன" : "Horoscope Details Locked"}
            </p>
            <p className="mt-1 mb-4 text-sm text-slate-500 max-w-md">
              {language === "ta"
                ? "விருப்பம் (Interest) அனுப்பவும். அவர்கள் அதனை ஏற்றுக் கொண்டதும் ஜாதக விவரங்களை நீங்கள் காண முடியும், அல்லது உடனடியாகப் பார்க்க உங்கள் திட்டத்தை மேம்படுத்தவும்."
                : "Send an interest request. Once the interest is accepted, you can see the horoscope details, or upgrade your plan to unlock instantly."}
            </p>
            <div className="flex gap-3">
              {currentUser?._id !== profile.user?._id && !interest && (
                <button className="btn-primary !py-2 !px-4 text-xs flex items-center gap-1.5" onClick={sendInterest} disabled={sending}>
                  {sending 
                    ? (language === "ta" ? "அனுப்பப்படுகிறது..." : "Sending...") 
                    : (language === "ta" ? "விருப்பம் அனுப்பவும்" : "Send Interest")}
                </button>
              )}
              <Link to="/subscription" className="btn-secondary !py-2 !px-4 text-xs">
                {language === "ta" ? "திட்டத்தை மேம்படுத்தவும்" : "Upgrade Plan"}
              </Link>
            </div>
          </div>
        ) : limitExceeded ? (
          <div className="flex flex-col items-center justify-center rounded-xl bg-amber-50/50 border border-dashed border-amber-200 py-8 px-4 text-center">
            <span className="mb-3 grid h-12 w-12 place-items-center rounded-full bg-amber-100 text-amber-600 shadow-soft">
              <Lock size={20} />
            </span>
            <p className="font-semibold text-slate-800">
              {language === "ta" ? "தினசரி வரம்பு முடிந்தது" : "Daily Limit Reached"}
            </p>
            <p className="mt-1 mb-4 text-sm text-slate-500 max-w-sm">
              {language === "ta"
                ? "தினசரி சுயவிவரம் பார்க்கும் வரம்பை நீங்கள் எட்டிவிட்டீர்கள். மேலும் பார்க்க உங்கள் திட்டத்தை மேம்படுத்தவும்."
                : "You cannot see this, you have reached your daily limit."}
            </p>
            <Link to="/subscription" className="btn-primary">
              {language === "ta" ? "திட்டத்தை மேம்படுத்தவும்" : "Upgrade Plan"}
            </Link>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl bg-rose-50/50 border border-dashed border-rose-200 py-8 px-4 text-center">
            <span className="mb-3 grid h-12 w-12 place-items-center rounded-full bg-maroon-50 text-maroon-600 shadow-soft animate-pulse-ring">
              <Lock size={20} />
            </span>
            <p className="font-semibold text-slate-800">
              {language === "ta" ? "ஜாதக விவரங்கள் பூட்டப்பட்டுள்ளன" : "Horoscope Details Locked"}
            </p>
            <p className="mt-1 text-sm text-slate-500 max-w-sm">
              {language === "ta"
                ? "இருவரும் விருப்பங்களை ஏற்று இணைந்த பிறகு ஜாதக விவரங்கள் (ராசி, லக்னம், நட்சத்திரம், தோஷம்) தானாகவே திறக்கப்படும்."
                : "Connect and accept each other's interest to automatically unlock horoscope details (Rasi, Lagnam, Nakshatra, Dosham)."}
            </p>
          </div>
        )}
      </section>

      {/* Contact Details Section */}
      <section className="panel">
        <h2 className="mb-5 text-xl font-black text-maroon-800">Contact Details</h2>
        {isContactShared ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl bg-rose-50 px-4 py-3 border border-rose-100 flex items-center gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-maroon-100 text-maroon-600">
                <Mail size={16} />
              </span>
              <div>
                <p className="label text-rose-400">Email Address</p>
                <p className="mt-0.5 font-semibold text-slate-800">{profile.user?.email || "Not provided"}</p>
              </div>
            </div>
            <div className="rounded-xl bg-rose-50 px-4 py-3 border border-rose-100 flex items-center gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-maroon-100 text-maroon-600">
                <Phone size={16} />
              </span>
              <div>
                <p className="label text-rose-400">Mobile Number</p>
                <p className="mt-0.5 font-semibold text-slate-800">{profile.user?.mobile || "Not provided"}</p>
              </div>
            </div>
          </div>
        ) : userPlan === "Free" ? (
          <div className="flex flex-col items-center justify-center rounded-xl bg-rose-50/50 border border-dashed border-rose-200 py-8 px-4 text-center">
            <span className="mb-3 grid h-12 w-12 place-items-center rounded-full bg-maroon-50 text-maroon-600 shadow-soft animate-pulse-ring">
              <Lock size={20} />
            </span>
            <p className="font-semibold text-slate-800">
              {language === "ta" ? "தொடர்பு விவரங்கள் பூட்டப்பட்டுள்ளன" : "Contact Details Locked"}
            </p>
            <p className="mt-1 mb-4 text-sm text-slate-500 max-w-md">
              {language === "ta"
                ? "விருப்பம் (Interest) அனுப்பவும். அவர்கள் அதனை ஏற்றுக் கொண்டதும் தொடர்பு விவரங்களை நீங்கள் காண முடியும், அல்லது உடனடியாகப் பார்க்க உங்கள் திட்டத்தை மேம்படுத்தவும்."
                : "Send an interest request. Once the interest is accepted, you can see the contact details, or upgrade your plan to unlock instantly."}
            </p>
            <div className="flex gap-3">
              {currentUser?._id !== profile.user?._id && !interest && (
                <button className="btn-primary !py-2 !px-4 text-xs flex items-center gap-1.5" onClick={sendInterest} disabled={sending}>
                  {sending 
                    ? (language === "ta" ? "அனுப்பப்படுகிறது..." : "Sending...") 
                    : (language === "ta" ? "விருப்பம் அனுப்பவும்" : "Send Interest")}
                </button>
              )}
              <Link to="/subscription" className="btn-secondary !py-2 !px-4 text-xs">
                {language === "ta" ? "திட்டத்தை மேம்படுத்தவும்" : "Upgrade Plan"}
              </Link>
            </div>
          </div>
        ) : limitExceeded ? (
          <div className="flex flex-col items-center justify-center rounded-xl bg-amber-50/50 border border-dashed border-amber-200 py-8 px-4 text-center">
            <span className="mb-3 grid h-12 w-12 place-items-center rounded-full bg-amber-100 text-amber-600 shadow-soft">
              <Lock size={20} />
            </span>
            <p className="font-semibold text-slate-800">
              {language === "ta" ? "தினசரி வரம்பு முடிந்தது" : "Daily Limit Reached"}
            </p>
            <p className="mt-1 mb-4 text-sm text-slate-500 max-w-sm">
              {language === "ta"
                ? "தினசரி சுயவிவரம் பார்க்கும் வரம்பை நீங்கள் எட்டிவிட்டீர்கள். மேலும் பார்க்க உங்கள் திட்டத்தை மேம்படுத்தவும்."
                : "You cannot see this, you have reached your daily limit."}
            </p>
            <Link to="/subscription" className="btn-primary">
              {language === "ta" ? "திட்டத்தை மேம்படுத்தவும்" : "Upgrade Plan"}
            </Link>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl bg-rose-50/50 border border-dashed border-rose-200 py-8 px-4 text-center">
            <span className="mb-3 grid h-12 w-12 place-items-center rounded-full bg-maroon-50 text-maroon-600 shadow-soft animate-pulse-ring">
              <Lock size={20} />
            </span>
            <p className="font-semibold text-slate-800">
              {language === "ta" ? "தொடர்பு விவரங்கள் பூட்டப்பட்டுள்ளன" : "Contact Details Locked"}
            </p>
            <p className="mt-1 text-sm text-slate-500 max-w-sm">
              {language === "ta"
                ? "இருவரும் விருப்பங்களை ஏற்று இணைந்த பிறகு தொலைபேசி மற்றும் மின்னஞ்சல் விவரங்கள் தானாகவே திறக்கப்படும்."
                : "Connect and accept each other's interest to automatically unlock phone and email details."}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
