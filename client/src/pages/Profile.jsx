import React, { useEffect, useState, useRef } from "react";
import { Save, Upload, Camera, Download, Eye, X, ShieldCheck, Mail, Phone, Lock, Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";
import html2canvas from "html2canvas";
import { api } from "../services/api";
import { toast } from "../components/Toast";
import Spinner from "../components/Spinner";
import { DATA } from "../utils/constants";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { translateToTamil, translateToEnglish } from "../utils/translateText";

const TABS = ["basic", "religion", "location", "education", "career", "family", "contact", "horoscope", "assets", "about", "photos", "preferences"];
const initial = Object.fromEntries(TABS.map((s) => [s, s === "about" ? "" : {}]));

export default function Profile() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const { t, language } = useLanguage();
  const [form, setForm] = useState(initial);
  const [photoFile, setPhotoFile] = useState(null);
  const [existingPhoto, setExistingPhoto] = useState(null);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(true);
  const [isApproved, setIsApproved] = useState(false);
  const [dobDay, setDobDay] = useState("");
  const [dobMonth, setDobMonth] = useState("");
  const [dobYear, setDobYear] = useState("");
  const cardRef = useRef(null);

  useEffect(() => {
    api.get("/profile/me").then(({ data }) => {
      if (data.profile) {
        const next = { ...initial };
        TABS.forEach((s) => {
          if (s === "about") {
            next.about = data.profile.about || "";
          } else {
            next[s] = data.profile[s] || {};
          }
        });
        
        // Populate names from user object if missing in profile
        if (!next.basic.name && user?.fullName) next.basic.name = user.fullName;
        if (!next.basic.nameTamil && user?.fullNameTamil) next.basic.nameTamil = user.fullNameTamil;

        setForm(next);
        setExistingPhoto(data.profile.photo || null);
        setIsEditMode(!data.profile.isSubmitted);
        setIsApproved(data.profile.isApproved || false);

        if (data.profile.basic?.dob) {
          const dobDate = new Date(data.profile.basic.dob);
          if (!isNaN(dobDate.getTime())) {
            setDobDay(dobDate.getDate());
            setDobMonth(dobDate.getMonth() + 1); // 1-12
            setDobYear(dobDate.getFullYear());
          }
        }
      } else {
        setIsEditMode(true);
      }
    });
  }, []);

  const update = (section, field, value) => {
    setForm((cur) => {
      const next = { ...cur };
      if (section === "about") {
        next.about = value;
      } else {
        next[section] = { ...next[section], [field]: value };
        
        // Reset dynamic fields
        if (field === "religion" && section === "religion") next.religion.caste = "";
        if (field === "religion" && section === "preferences") next.preferences.caste = "";
        if (field === "rasi") {
          next.horoscope.nakshatra = "";
          // Also reset lagnam if desired (optional)
        }
        if (field === "state") next.location.district = "";
      }
      return next;
    });
  };

  const handleDobChange = (field, val) => {
    let d = field === "day" ? val : dobDay;
    let m = field === "month" ? val : dobMonth;
    let y = field === "year" ? val : dobYear;

    if (field === "day") setDobDay(val);
    if (field === "month") setDobMonth(val);
    if (field === "year") setDobYear(val);

    if (d && m && y) {
      const paddedMonth = String(m).padStart(2, "0");
      const paddedDay = String(d).padStart(2, "0");
      const dobStr = `${y}-${paddedMonth}-${paddedDay}`;
      
      // Calculate age dynamically
      const today = new Date();
      const birthDate = new Date(dobStr);
      let calculatedAge = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        calculatedAge--;
      }

      setForm((cur) => {
        const next = { ...cur };
        next.basic = {
          ...next.basic,
          dob: dobStr,
          age: calculatedAge
        };
        return next;
      });
    } else {
      update("basic", "dob", "");
    }
  };

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const removeNewPhoto = () => {
    setPhotoFile(null);
    setPreview(null);
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const formToSend = {
      ...form,
      location: {
        ...form.location,
        country: "India"
      }
    };
    const formData = new FormData();
    formData.append("updates", JSON.stringify(formToSend));
    if (photoFile) {
      formData.append("photo", photoFile);
    }

    try {
      const { data } = await api.post("/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      updateUser({ ...data.user });
      setForm((cur) => {
        const next = { ...cur };
        TABS.forEach((s) => {
          if (s === "about") {
            next.about = data.profile.about || "";
          } else {
            next[s] = data.profile[s] || {};
          }
        });
        return next;
      });
      setExistingPhoto(data.profile.photo || null);
      setPhotoFile(null);
      setPreview(null);
      setIsEditMode(false);
      toast.success(language === "en" ? "Profile saved successfully!" : "சுயவிவரம் வெற்றிகரமாக சேமிக்கப்பட்டது!");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      toast.error(err.response?.data?.message || (language === "en" ? "Failed to save profile." : "சுயவிவரத்தை சேமிக்க முடியவில்லை."));
    } finally {
      setSaving(false);
    }
  };

  const downloadCard = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      // Small timeout to let elements render fully
      await new Promise((resolve) => setTimeout(resolve, 300));
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#fff5f8"
      });
      const link = document.createElement("a");
      const nameSlug = (form.basic?.name || user?.fullName || "profile").replace(/\s+/g, "_").toLowerCase();
      link.download = `matrimony_${nameSlug}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast.success(language === "en" ? "Profile card downloaded successfully!" : "சுயவிவர அட்டை பதிவிறக்கம் செய்யப்பட்டது!");
    } catch (err) {
      console.error("Download failed:", err);
      toast.error(language === "en" ? "Download failed. Please try again." : "பதிவிறக்கம் தோல்வியடைந்தது. மீண்டும் முயற்சிக்கவும்.");
    } finally {
      setDownloading(false);
    }
  };

  // Dropdown mappings
  const selectedReligion = form.religion?.religion || "";
  const availableCastes = DATA.castes[selectedReligion] || ["Others"];
  const castesOptions = [...availableCastes];
  if (form.religion?.caste && !availableCastes.includes(form.religion.caste)) {
    const othersIdx = castesOptions.indexOf("Others");
    if (othersIdx !== -1) {
      castesOptions.splice(othersIdx, 0, form.religion.caste);
    } else {
      castesOptions.push(form.religion.caste);
    }
  }
  const isCustomCaste = form.religion?.caste === "Others" || 
    (form.religion?.caste && !availableCastes.filter(c => c !== "Others").includes(form.religion?.caste));

  const selectedRasi = form.horoscope?.rasi || "";
  const availableStars = DATA.rasiData[selectedRasi] || [];

  const selectedState = form.location?.state || "";
  const availableStates = DATA.statesByCountry["India"] || [];
  const availableDistricts = DATA.districtsByState[selectedState] || [];

  // Career cascading
  const selectedJobCategory = form.career?.profession || "";
  const availableJobTitles = DATA.jobsByCategory[selectedJobCategory] || [];

  // Degree needs department field?
  const degreeNeedsDept = ["B.E","B.Tech","B.Sc","B.Com","BBA","BCA","BA","B.Arch","M.E","M.Tech","M.Sc","M.Com","MBA","MCA","MA","M.Phil","PhD","Doctorate","Diploma","ITI","MBBS","BDS","B.Pharm","B.Nursing","M.Pharm","MD","MS","LLB"];
  const showDeptField = degreeNeedsDept.includes(form.education?.degree || "");

  const fmt = (n) => (n ? parseInt(n).toLocaleString("en-IN") : "—");
  const cardPhoto = preview || existingPhoto?.url || "";
  const tagline = [form.career?.jobTitle, form.location?.city].filter(Boolean).join(" • ") || "—";
  const profileId = `M${(user?._id || "").substring(18).toUpperCase()}`;

  return (
    <form onSubmit={submit} className="grid gap-6 animate-fade-up max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="label">{t("profile")}</p>
          <h1 className="mt-2 text-3xl font-black text-slate-950 flex items-center gap-2">
            {t("profileTitle")}
            {isApproved && (
              <span className="inline-flex items-center justify-center rounded-full bg-emerald-500 p-1 text-white shadow-sm" title="Verified Profile">
                <ShieldCheck size={16} fill="currentColor" />
              </span>
            )}
          </h1>
          <p className="text-sm text-slate-500 mt-1">{t("profileDesc")}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="btn-secondary flex items-center gap-1.5"
          >
            <Eye size={16} /> {t("previewCard")}
          </button>
          {!isEditMode && (
            <button
              type="button"
              onClick={() => setIsEditMode(true)}
              className="btn-primary flex items-center gap-1.5"
            >
              <Edit size={16} /> {t("editDetails")}
            </button>
          )}
        </div>
      </div>

      {/* ── SECTION 1: Profile Photo ── */}
      <section className="panel">
        <h2 className="mb-5 text-xl font-black text-maroon-800 flex items-center gap-2">
          <span>📸</span> {language === "en" ? "Profile Photo" : "சுயவிவரப் படம்"}
        </h2>
        <div className="flex gap-4 items-start">
          {/* Preview or Existing Photo */}
          {(preview || existingPhoto?.url) ? (
            <div className="group relative h-40 w-40 overflow-hidden rounded-2xl border border-rose-100 bg-slate-50 shadow-sm animate-fade-in">
              <img src={preview || existingPhoto?.url} alt="Profile" className="h-full w-full object-cover" />
              {isEditMode && preview && (
                <button
                  type="button"
                  onClick={removeNewPhoto}
                  className="absolute right-2 top-2 rounded-xl bg-slate-950/65 p-1.5 text-white hover:bg-slate-900 transition"
                  title="Remove new selection"
                >
                  <X size={15} />
                </button>
              )}
            </div>
          ) : null}

          {/* Upload Button */}
          {isEditMode && (
            <label className="flex h-40 w-40 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-rose-200 bg-rose-50/30 hover:bg-rose-50/60 hover:border-rose-300 transition-all">
              <Camera size={28} className="text-maroon-600 animate-pulse" />
              <span className="mt-2 text-xs font-semibold text-maroon-800 text-center px-2">
                {(preview || existingPhoto) 
                  ? (language === "en" ? "Change Photo" : "படத்தை மாற்றவும்") 
                  : (language === "en" ? "Add Photo" : "படம் சேர்க்க")}
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhoto}
              />
            </label>
          )}
        </div>
      </section>

      {/* ── SECTION 2: Personal Information ── */}
      <section className="panel">
        <h2 className="mb-5 text-xl font-black text-maroon-800 flex items-center gap-2">
          <span>👤</span> {t("secBasic")}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className="flex flex-col gap-1.5">
            <span className="label">{t("fullName")} *</span>
            <input
              className="field mt-1"
              required
              disabled={!isEditMode}
              value={form.basic?.name || ""}
              onChange={(e) => update("basic", "name", e.target.value)}
              placeholder="E.g., Priya Sharma"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="label">{language === "en" ? "Full Name (Tamil)" : "முழு பெயர் (தமிழ்)"} *</span>
            <input
              className="field mt-1"
              required
              disabled={!isEditMode}
              value={form.basic?.nameTamil || ""}
              onChange={(e) => update("basic", "nameTamil", e.target.value)}
              placeholder="உதாரணம்: பிரியா சர்மா"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="label">{t("fieldAge")} (Calculated from DOB) *</span>
            <input
              className="field mt-1 bg-slate-50 border-slate-200 cursor-not-allowed"
              type="number"
              required
              readOnly
              disabled
              value={form.basic?.age || ""}
              placeholder={language === "en" ? "Calculated from DOB" : "பிறந்த தேதியிலிருந்து கணக்கிடப்படும்"}
            />
          </label>
          <div className="flex flex-col gap-1.5">
            <span className="label">{t("fieldDob")} *</span>
            <div className="grid grid-cols-3 gap-2 mt-1">
              <select
                className="field"
                required
                disabled={!isEditMode}
                value={dobDay}
                onChange={(e) => handleDobChange("day", e.target.value)}
              >
                <option value="">Day</option>
                {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>

              <select
                className="field"
                required
                disabled={!isEditMode}
                value={dobMonth}
                onChange={(e) => handleDobChange("month", e.target.value)}
              >
                <option value="">Month</option>
                {[
                  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
                ].map((m, idx) => (
                  <option key={idx + 1} value={idx + 1}>{m}</option>
                ))}
              </select>

              <select
                className="field"
                required
                disabled={!isEditMode}
                value={dobYear}
                onChange={(e) => handleDobChange("year", e.target.value)}
              >
                <option value="">Year</option>
                {Array.from({ length: 59 }, (_, i) => 2008 - i).map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>
          <label className="flex flex-col gap-1.5">
            <span className="label">{t("fieldGender")} *</span>
            <select
              className="field mt-1"
              required
              disabled={!isEditMode}
              value={form.basic?.gender || ""}
              onChange={(e) => update("basic", "gender", e.target.value)}
            >
              <option value="">Select Gender</option>
              <option value="Male">{t("male")}</option>
              <option value="Female">{t("female")}</option>
              <option value="Other">{t("other")}</option>
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="label">{t("fieldMarital")} *</span>
            <select
              className="field mt-1"
              required
              disabled={!isEditMode}
              value={form.basic?.maritalStatus || ""}
              onChange={(e) => update("basic", "maritalStatus", e.target.value)}
            >
              <option value="">Select status</option>
              {DATA.maritalStatus.map((s) => (
                <option key={s} value={s}>{t(s)}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="label">{t("fieldHeight")} *</span>
            <input
              className="field mt-1"
              type="number"
              required
              min="100"
              max="250"
              disabled={!isEditMode}
              value={form.basic?.height || ""}
              onChange={(e) => update("basic", "height", e.target.value)}
              placeholder={language === "en" ? "E.g., 165" : "உதாரணம்: 165"}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="label">{t("fieldPhysical")} *</span>
            <select
              className="field mt-1"
              required
              disabled={!isEditMode}
              value={form.basic?.physicalStatus || ""}
              onChange={(e) => update("basic", "physicalStatus", e.target.value)}
            >
              <option value="">Select physical status</option>
              {DATA.physicalStatus.map((s) => (
                <option key={s} value={s}>{t(s)}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="label">{t("fieldColor")} *</span>
            <select
              className="field mt-1"
              required
              disabled={!isEditMode}
              value={form.basic?.color || ""}
              onChange={(e) => update("basic", "color", e.target.value)}
            >
              <option value="">Select color</option>
              {DATA.colors.map((c) => (
                <option key={c} value={c}>{t(c)}</option>
              ))}
            </select>
          </label>
        </div>
      </section>

      {/* ── SECTION 3: Religion ── */}
      <section className="panel">
        <h2 className="mb-5 text-xl font-black text-maroon-800 flex items-center gap-2">
          <span>🕉️</span> {t("secReligion")}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="flex flex-col gap-1.5">
            <span className="label">{t("fieldReligion")} *</span>
            <select
              className="field mt-1"
              required
              disabled={!isEditMode}
              value={form.religion?.religion || ""}
              onChange={(e) => update("religion", "religion", e.target.value)}
            >
              <option value="">Select Religion</option>
              {DATA.religions.slice(0, -1).map((r) => (
                <option key={r} value={r}>{t(r)}</option>
              ))}
            </select>
          </label>
           <label className="flex flex-col gap-1.5">
            <span className="label">{t("fieldCaste")} *</span>
            <select
              className="field mt-1"
              required
              disabled={!isEditMode}
              value={form.religion?.caste || ""}
              onChange={(e) => {
                const val = e.target.value;
                update("religion", "caste", val);
                if (val !== "Others") {
                  update("religion", "casteTamil", "");
                }
              }}
            >
              <option value="">Select Caste</option>
              {castesOptions.map((c) => (
                <option key={c} value={c}>{t(c)}</option>
              ))}
            </select>
          </label>

          {/* Custom Caste Inputs */}
          {isCustomCaste && (
            <>
              {language === "en" ? (
                <label className="flex flex-col gap-1.5 animate-fade-in">
                  <span className="label">Custom Caste (English) *</span>
                  <input
                    className="field mt-1"
                    required
                    disabled={!isEditMode}
                    value={form.religion?.caste === "Others" ? "" : form.religion?.caste || ""}
                    onChange={(e) => update("religion", "caste", e.target.value)}
                    onBlur={async (e) => {
                      const translated = await translateToTamil(e.target.value);
                      if (translated) {
                        update("religion", "casteTamil", translated);
                      }
                    }}
                    placeholder="Type custom caste in English"
                  />
                </label>
              ) : (
                <label className="flex flex-col gap-1.5 animate-fade-in">
                  <span className="label">தனிப்பயன் சாதி (தமிழ்) *</span>
                  <input
                    className="field mt-1"
                    required
                    disabled={!isEditMode}
                    value={form.religion?.casteTamil || ""}
                    onChange={(e) => update("religion", "casteTamil", e.target.value)}
                    onBlur={async (e) => {
                      const translated = await translateToEnglish(e.target.value);
                      if (translated) {
                        update("religion", "caste", translated);
                      }
                    }}
                    placeholder="தனிப்பயன் சாதியை தமிழில் தட்டச்சு செய்க"
                  />
                </label>
              )}
            </>
          )}

          {/* Sub Caste Input */}
          {language === "en" ? (
            <label className="flex flex-col gap-1.5">
              <span className="label">Sub-Caste (English)</span>
              <input
                className="field mt-1"
                disabled={!isEditMode}
                value={form.religion?.subCaste || ""}
                onChange={(e) => update("religion", "subCaste", e.target.value)}
                onBlur={async (e) => {
                  const translated = await translateToTamil(e.target.value);
                  if (translated) {
                    update("religion", "subCasteTamil", translated);
                  }
                }}
                placeholder="E.g., Iyer, Sect"
              />
            </label>
          ) : (
            <label className="flex flex-col gap-1.5">
              <span className="label">உட்சாதி (தமிழ்)</span>
              <input
                className="field mt-1"
                disabled={!isEditMode}
                value={form.religion?.subCasteTamil || ""}
                onChange={(e) => update("religion", "subCasteTamil", e.target.value)}
                onBlur={async (e) => {
                  const translated = await translateToEnglish(e.target.value);
                  if (translated) {
                    update("religion", "subCaste", translated);
                  }
                }}
                placeholder="உதாரணம்: ஐயர், ஐயங்கார்..."
              />
            </label>
          )}
          <label className="flex flex-col gap-1.5">
            <span className="label">{t("fieldMotherTongue")} *</span>
            <select
              className="field mt-1"
              required
              disabled={!isEditMode}
              value={form.religion?.motherTongue || ""}
              onChange={(e) => update("religion", "motherTongue", e.target.value)}
            >
              <option value="">Select Mother Tongue</option>
              {DATA.motherTongue.map((lang) => (
                <option key={lang} value={lang}>{t(lang)}</option>
              ))}
            </select>
          </label>
        </div>
      </section>

      {/* ── SECTION 4: Location ── */}
      <section className="panel">
        <h2 className="mb-5 text-xl font-black text-maroon-800 flex items-center gap-2">
          <span>📍</span> {t("secLocation")}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className="flex flex-col gap-1.5">
            <span className="label">{t("fieldState")} *</span>
            <select
              className="field mt-1"
              required
              disabled={!isEditMode}
              value={form.location?.state || ""}
              onChange={(e) => update("location", "state", e.target.value)}
            >
              <option value="">Select State</option>
              {availableStates.map((s) => (
                <option key={s} value={s}>{t(s)}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="label">{language === "en" ? "District" : "மாவட்டம்"} *</span>
            {availableDistricts.length > 0 ? (
              <select
                className="field mt-1"
                required
                disabled={!isEditMode}
                value={form.location?.district || ""}
                onChange={(e) => update("location", "district", e.target.value)}
              >
                <option value="">{language === "en" ? "Select District" : "மாவட்டம் தேர்வு செய்க"}</option>
                {availableDistricts.map((d) => (
                  <option key={d} value={d}>{t(d)}</option>
                ))}
              </select>
            ) : (
              <input
                className="field mt-1"
                required
                disabled={!isEditMode}
                value={form.location?.district || ""}
                onChange={(e) => update("location", "district", e.target.value)}
                placeholder={language === "en" ? "E.g., Coimbatore" : "உதாரணம்: கோயம்புத்தூர்"}
              />
            )}
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="label">{language === "en" ? "Village / City" : "கிராமம் / நகர்"} *</span>
            <input
              className="field mt-1"
              required
              disabled={!isEditMode}
              value={form.location?.city || ""}
              onChange={(e) => update("location", "city", e.target.value)}
              placeholder={language === "en" ? "Type here..." : "இங்கே தட்டச்சு செய்யவும்..."}
            />
          </label>
        </div>
      </section>

      {/* ── SECTION 5: Education ── */}
      <section className="panel">
        <h2 className="mb-5 text-xl font-black text-maroon-800 flex items-center gap-2">
          <span>🎓</span> {t("secEducation")}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Education Level */}
          <label className="flex flex-col gap-1.5">
            <span className="label">{language === "en" ? "Education Level" : "கல்வி நிலை"} *</span>
            <select
              className="field mt-1"
              required
              disabled={!isEditMode}
              value={form.education?.degree || ""}
              onChange={(e) => update("education", "degree", e.target.value)}
            >
              <option value="">{language === "en" ? "Select Education Level" : "கல்வி நிலை தேர்வு செய்க"}</option>
              {DATA.education.map((e) => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
          </label>

          {/* Department / Specialization — only show when degree chosen */}
          {showDeptField && (
            <label className="flex flex-col gap-1.5">
              <span className="label">{language === "en" ? "Department / Specialization" : "துறை / சிறப்பு பிரிவு"}</span>
              <input
                className="field mt-1"
                disabled={!isEditMode}
                value={form.education?.department || ""}
                onChange={(e) => update("education", "department", e.target.value)}
                placeholder={language === "en" ? "E.g., Computer Science, Mechanical, Commerce..." : "உதாரணம்: கணினி அறிவியல், இயந்திரவியல்..."}
              />
            </label>
          )}

          {/* College / Institution Name */}
          <label className="flex flex-col gap-1.5">
            <span className="label">{language === "en" ? "College / Institution" : "கல்லூரி / நிறுவனம்"}</span>
            <input
              className="field mt-1"
              disabled={!isEditMode}
              value={form.education?.college || ""}
              onChange={(e) => update("education", "college", e.target.value)}
              placeholder={language === "en" ? "E.g., Anna University, PSG College..." : "உதாரணம்: அண்ணா பல்கலைக்கழகம்"}
            />
          </label>
        </div>
      </section>

      {/* ── SECTION 6: Professional ── */}
      <section className="panel">
        <h2 className="mb-5 text-xl font-black text-maroon-800 flex items-center gap-2">
          <span>💼</span> {t("secCareer")}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Step 1: Job Category */}
          <label className="flex flex-col gap-1.5">
            <span className="label">{language === "en" ? "Job Category" : "தொழில் பிரிவு"} *</span>
            <select
              className="field mt-1"
              required
              disabled={!isEditMode}
              value={form.career?.profession || ""}
              onChange={(e) => {
                const val = e.target.value;
                update("career", "profession", val);
                if (val === "Not Working") {
                  update("career", "jobTitle", "");
                  update("career", "customJobTitle", "");
                  update("career", "company", "");
                  update("career", "workingPlace", "");
                  update("career", "salary", "");
                } else {
                  update("career", "jobTitle", "");
                }
              }}
            >
              <option value="">{language === "en" ? "Select Category" : "பிரிவு தேர்வு செய்க"}</option>
              {DATA.jobCategories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>

          {/* Step 2: Specific Job Title (cascades from category) */}
          {selectedJobCategory && selectedJobCategory !== "Not Working" && (
            <label className="flex flex-col gap-1.5">
              <span className="label">{language === "en" ? "Job Title / Role" : "குறிப்பிட்ட பணி"} *</span>
              <select
                className="field mt-1"
                required
                disabled={!isEditMode}
                value={form.career?.jobTitle || ""}
                onChange={(e) => update("career", "jobTitle", e.target.value)}
              >
                <option value="">{language === "en" ? "Select Job Title" : "பணி தேர்வு செய்க"}</option>
                {availableJobTitles.map((j) => (
                  <option key={j} value={j}>{j}</option>
                ))}
                <option value="__custom__">{language === "en" ? "Type my own..." : "நானே தட்டச்சு செய்கிறேன்..."}</option>
              </select>
            </label>
          )}

          {/* If user picks 'Type my own' */}
          {form.career?.jobTitle === "__custom__" && selectedJobCategory !== "Not Working" && (
            <label className="flex flex-col gap-1.5">
              <span className="label">{language === "en" ? "Enter Job Title" : "பணி பெயர் உள்ளிடவும்"} *</span>
              <input
                className="field mt-1"
                required
                disabled={!isEditMode}
                value={form.career?.customJobTitle || ""}
                onChange={(e) => update("career", "customJobTitle", e.target.value)}
                placeholder={language === "en" ? "Type your job title..." : "உங்கள் பணி பெயர்..."}
              />
            </label>
          )}

          {/* Company Name */}
          {selectedJobCategory !== "Not Working" && (
            <label className="flex flex-col gap-1.5">
              <span className="label">{language === "en" ? "Company / Organisation" : "நிறுவனம் / அமைப்பு"}</span>
              <input
                className="field mt-1"
                disabled={!isEditMode}
                value={form.career?.company || ""}
                onChange={(e) => update("career", "company", e.target.value)}
                placeholder={language === "en" ? "E.g., TCS, Infosys, Govt Hospital..." : "உதாரணம்: டி.சி.எஸ், இன்போசிஸ்..."}
              />
            </label>
          )}

          {/* Working Place */}
          {selectedJobCategory !== "Not Working" && (
            <label className="flex flex-col gap-1.5">
              <span className="label">{language === "en" ? "Working Place / Location" : "வேலை செய்யும் இடம்"}</span>
              <input
                className="field mt-1"
                disabled={!isEditMode}
                value={form.career?.workingPlace || ""}
                onChange={(e) => update("career", "workingPlace", e.target.value)}
                placeholder={language === "en" ? "E.g., Chennai, Bangalore, Singapore..." : "உதாரணம்: சென்னை, பெங்களூர், சிங்கப்பூர்..."}
              />
            </label>
          )}

          {/* Monthly Salary */}
          {selectedJobCategory !== "Not Working" && (
            <label className="flex flex-col gap-1.5">
              <span className="label">{language === "en" ? "Monthly Salary (₹)" : "மாத சம்பளம் (₹)"}</span>
              <input
                className="field mt-1"
                type="number"
                min="0"
                disabled={!isEditMode}
                value={form.career?.salary || ""}
                onChange={(e) => update("career", "salary", e.target.value)}
                placeholder={language === "en" ? "E.g., 35000" : "உதாரணம்: 35000"}
              />
            </label>
          )}
        </div>
      </section>

      {/* ── SECTION 7: Family Background ── */}
      <section className="panel">
        <h2 className="mb-5 text-xl font-black text-maroon-800 flex items-center gap-2">
          <span>👨‍👩‍👧‍👦</span> {t("secFamily")}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className="flex flex-col gap-1.5">
            <span className="label">{t("fieldFamilyType")} *</span>
            <select
              className="field mt-1"
              required
              disabled={!isEditMode}
              value={form.family?.familyType || ""}
              onChange={(e) => update("family", "familyType", e.target.value)}
            >
              <option value="">{language === "en" ? "Select Family Type" : "குடும்ப வகை தேர்வு"}</option>
              <option value="Joint">{t("Joint")}</option>
              <option value="Nuclear">{t("Nuclear")}</option>
              <option value="Others">{t("Others")}</option>
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="label">{t("fieldFatherName")}</span>
            <input className="field mt-1" disabled={!isEditMode}
              value={form.family?.fatherName || ""}
              onChange={(e) => update("family", "fatherName", e.target.value)}
              placeholder={language === "en" ? "Father's Name" : "தந்தையின் பெயர்"}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="label">{t("fieldFatherJob")}</span>
            <input className="field mt-1" disabled={!isEditMode}
              value={form.family?.fatherOccupation || ""}
              onChange={(e) => update("family", "fatherOccupation", e.target.value)}
              placeholder={language === "en" ? "E.g., Retired Govt Officer" : "உதாரணம்: ஓய்வு பெற்ற அரசு அதிகாரி"}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="label">{t("fieldMotherName")}</span>
            <input className="field mt-1" disabled={!isEditMode}
              value={form.family?.motherName || ""}
              onChange={(e) => update("family", "motherName", e.target.value)}
              placeholder={language === "en" ? "Mother's Name" : "தாயின் பெயர்"}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="label">{t("fieldMotherJob")}</span>
            <input className="field mt-1" disabled={!isEditMode}
              value={form.family?.motherOccupation || ""}
              onChange={(e) => update("family", "motherOccupation", e.target.value)}
              placeholder={language === "en" ? "E.g., Homemaker" : "உதாரணம்: இல்லத்தரசி"}
            />
          </label>

          {/* No. of Siblings */}
          <label className="flex flex-col gap-1.5">
            <span className="label">{language === "en" ? "No. of Siblings" : "உடன்பிறந்தோர் எண்ணிக்கை"}</span>
            <input
              className="field mt-1"
              type="number" min="0" max="15"
              disabled={!isEditMode}
              value={form.family?.siblings || ""}
              onChange={(e) => update("family", "siblings", e.target.value)}
              placeholder="0"
            />
          </label>
        </div>

        {/* Sibling breakdown — appears only when siblings > 0 */}
        {Number(form.family?.siblings) > 0 && (
          <div className="mt-5 rounded-2xl border border-rose-100 bg-rose-50/40 p-4">
            <p className="text-sm font-black text-maroon-800 mb-3">
              {language === "en" ? `Sibling Details (Total: ${form.family.siblings})` : `உடன்பிறந்தோர் விவரம் (மொத்தம்: ${form.family.siblings})`}
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <label className="flex flex-col gap-1">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">{language === "en" ? "👦 Brothers" : "👦 அண்ணன் / தம்பி"}</span>
                <input
                  className="field"
                  type="number" min="0" max={form.family.siblings}
                  disabled={!isEditMode}
                  value={form.family?.brotherCount || ""}
                  onChange={(e) => update("family", "brotherCount", e.target.value)}
                  placeholder="0"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">{language === "en" ? "👧 Sisters" : "👧 அக்கா / தங்கை"}</span>
                <input
                  className="field"
                  type="number" min="0" max={form.family.siblings}
                  disabled={!isEditMode}
                  value={form.family?.sisterCount || ""}
                  onChange={(e) => update("family", "sisterCount", e.target.value)}
                  placeholder="0"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">{language === "en" ? "💍 Married" : "💍 திருமணமானவர்"}</span>
                <input
                  className="field"
                  type="number" min="0" max={form.family.siblings}
                  disabled={!isEditMode}
                  value={form.family?.marriedSiblings || ""}
                  onChange={(e) => update("family", "marriedSiblings", e.target.value)}
                  placeholder="0"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">{language === "en" ? "💛 Unmarried" : "💛 திருமணமாகாதவர்"}</span>
                <input
                  className="field"
                  type="number" min="0" max={form.family.siblings}
                  disabled={!isEditMode}
                  value={form.family?.unmarriedSiblings || ""}
                  onChange={(e) => update("family", "unmarriedSiblings", e.target.value)}
                  placeholder="0"
                />
              </label>
            </div>
          </div>
        )}
      </section>


      {/* ── SECTION 8: Contact Details ── */}
      <section className="panel">
        <h2 className="mb-5 text-xl font-black text-maroon-800 flex items-center gap-2">
          <span>📞</span> {language === "en" ? "Contact Details" : "தொடர்பு விவரங்கள்"}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className="flex flex-col gap-1.5">
            <span className="label">{language === "en" ? "Phone Number" : "தொலைபேசி எண்"} *</span>
            <input
              className="field mt-1"
              type="tel"
              required
              disabled={!isEditMode}
              value={form.contact?.phone || ""}
              onChange={(e) => update("contact", "phone", e.target.value)}
              placeholder="9876543210"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="label">{language === "en" ? "Email Address (Optional)" : "மின்னஞ்சல் (விருப்பம்)"}</span>
            <input
              className="field mt-1"
              type="email"
              disabled={!isEditMode}
              value={form.contact?.email || ""}
              onChange={(e) => update("contact", "email", e.target.value)}
              placeholder="example@mail.com"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="label">{language === "en" ? "Alternate Phone" : "மாற்று தொலைபேசி எண்"}</span>
            <input
              className="field mt-1"
              type="tel"
              disabled={!isEditMode}
              value={form.contact?.altPhone || ""}
              onChange={(e) => update("contact", "altPhone", e.target.value)}
              placeholder="9876543211"
            />
          </label>
        </div>
      </section>

      {/* ── SECTION 9: Horoscope Details ── */}
      <section className="panel">
        <h2 className="mb-5 text-xl font-black text-maroon-800 flex items-center gap-2">
          <span>✨</span> {t("secHoroscope")}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* 1. Rasi */}
          <label className="flex flex-col gap-1.5">
            <span className="label">{t("fieldRasi")} *</span>
            <select
              className="field mt-1"
              required
              disabled={!isEditMode}
              value={form.horoscope?.rasi || ""}
              onChange={(e) => update("horoscope", "rasi", e.target.value)}
            >
              <option value="">Select Rasi</option>
              {Object.keys(DATA.rasiData).map((r) => <option key={r} value={r}>{t(r)}</option>)}
            </select>
          </label>
          {/* 2. Natchathiram (depends on Rasi) */}
          <label className="flex flex-col gap-1.5">
            <span className="label">{language === "en" ? "Natchathiram" : "நட்சத்திரம்"} *</span>
            <select
              className="field mt-1"
              required
              disabled={!isEditMode}
              value={form.horoscope?.nakshatra || ""}
              onChange={(e) => update("horoscope", "nakshatra", e.target.value)}
            >
              <option value="">{language === "en" ? "Select Natchathiram" : "நட்சத்திரம் தேர்வு செய்க"}</option>
              {availableStars.map((s) => <option key={s} value={s}>{t(s)}</option>)}
            </select>
          </label>
          {/* 3. Lagnam */}
          <label className="flex flex-col gap-1.5">
            <span className="label">{language === "en" ? "Lagnam" : "லக்னம்"} *</span>
            <select
              className="field mt-1"
              required
              disabled={!isEditMode}
              value={form.horoscope?.lagnam || ""}
              onChange={(e) => update("horoscope", "lagnam", e.target.value)}
            >
              <option value="">{language === "en" ? "Select Lagnam" : "லக்னம் தேர்வு செய்க"}</option>
              {Object.keys(DATA.rasiData).map((r) => <option key={r} value={r}>{t(r)}</option>)}
            </select>
          </label>
          {/* 4. Dosham */}
          <label className="flex flex-col gap-1.5">
            <span className="label">{t("fieldDosham")} *</span>
            <select
              className="field mt-1"
              required
              disabled={!isEditMode}
              value={form.horoscope?.dosham || ""}
              onChange={(e) => update("horoscope", "dosham", e.target.value)}
            >
              <option value="">Select Dosham</option>
              {DATA.doshamTypes.map((d) => <option key={d} value={d}>{t(d)}</option>)}
            </select>
          </label>
          {/* 5. Gothram */}
          <label className="flex flex-col gap-1.5">
            <span className="label">{t("fieldGothram")}</span>
            <input
              className="field mt-1"
              type="text"
              disabled={!isEditMode}
              value={form.religion?.gothram || ""}
              onChange={(e) => update("religion", "gothram", e.target.value)}
              placeholder={language === "en" ? "E.g., Bharadwaja" : "உதாரணம்: பரத்வாஜ"}
            />
          </label>
        </div>
      </section>


      {/* ── SECTION: Assets Details ── */}
      <section className="panel">
        <h2 className="mb-5 text-xl font-black text-maroon-800 flex items-center gap-2">
          <span>🏡</span> {t("secAssets")}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {/* House Type */}
          <label className="flex flex-col gap-1.5">
            <span className="label">{language === "en" ? "House / Residence" : "வீடு / குடியிருப்பு"}</span>
            <select
              className="field mt-1"
              disabled={!isEditMode}
              value={form.assets?.house || ""}
              onChange={(e) => update("assets", "house", e.target.value)}
            >
              <option value="">{language === "en" ? "Select House Type" : "வீடு வகை தேர்வு"}</option>
              <option value="Own House">{language === "en" ? "Own House" : "சொந்த வீடு"}</option>
              <option value="Rented House">{language === "en" ? "Rented House" : "வாடகை வீடு"}</option>
              <option value="None / Others">{language === "en" ? "None / Others" : "இல்லை / பிற"}</option>
            </select>
          </label>

          {/* Free-text asset description */}
          <label className="flex flex-col gap-1.5 sm:col-span-2">
            <span className="label">{language === "en" ? "Asset Details (Describe your property, land, vehicles, etc.)" : "சொத்து விவரங்கள் (நிலம், வாகனம், சொத்து குறிப்புகள்)"}</span>
            <textarea
              className="field mt-1 resize-y min-h-[100px]"
              disabled={!isEditMode}
              value={form.assets?.description || ""}
              onChange={(e) => update("assets", "description", e.target.value)}
              placeholder={language === "en"
                ? "Describe your assets freely. E.g.: 2 acres agricultural land in Erode, 1 own house in Chennai, 1 car..."
                : "உதாரணம்: ஈரோட்டில் 2 ஏக்கர் நிலம், சென்னையில் சொந்த வீடு, 1 கார்..."}
            />
          </label>
        </div>
      </section>

      {/* ── SECTION 9: About Yourself ── */}
      <section className="panel">
        <h2 className="mb-5 text-xl font-black text-maroon-800 flex items-center gap-2">
          <span>💬</span> {t("secAbout")}
        </h2>
        <div className="flex flex-col gap-2">
          <span className="label">{t("fieldBio")}</span>
          <textarea
            className="field mt-1 resize-y min-h-[140px]"
            disabled={!isEditMode}
            value={form.about || ""}
            onChange={(e) => update("about", "about", e.target.value)}
            placeholder={t("fieldBioPlaceholder")}
          />
        </div>
      </section>

      {/* ── SECTION 10: Partner Preferences ── */}
      <section className="panel">
        <h2 className="mb-5 text-xl font-black text-maroon-800 flex items-center gap-2">
          <span>🎯</span> {t("secPreferences")}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Min Age */}
          <label className="flex flex-col gap-1.5">
            <span className="label">{t("prefMinAge")}</span>
            <input
              className="field mt-1"
              type="number"
              min="18"
              max="80"
              disabled={!isEditMode}
              value={form.preferences?.ageMin || ""}
              onChange={(e) => update("preferences", "ageMin", e.target.value)}
              placeholder={language === "en" ? "E.g., 21" : "உதாரணம்: 21"}
            />
          </label>

          {/* Max Age */}
          <label className="flex flex-col gap-1.5">
            <span className="label">{t("prefMaxAge")}</span>
            <input
              className="field mt-1"
              type="number"
              min="18"
              max="80"
              disabled={!isEditMode}
              value={form.preferences?.ageMax || ""}
              onChange={(e) => update("preferences", "ageMax", e.target.value)}
              placeholder={language === "en" ? "E.g., 30" : "உதாரணம்: 30"}
            />
          </label>

          {/* Expected Religion */}
          <label className="flex flex-col gap-1.5">
            <span className="label">{t("prefReligion")}</span>
            <select
              className="field mt-1"
              disabled={!isEditMode}
              value={form.preferences?.religion || ""}
              onChange={(e) => update("preferences", "religion", e.target.value)}
            >
              <option value="">No Bar / Select Religion</option>
              {DATA.religions.map((r) => (
                <option key={r} value={r}>{t(r)}</option>
              ))}
            </select>
          </label>

          {/* Expected Caste */}
          <label className="flex flex-col gap-1.5">
            <span className="label">{t("prefCaste")}</span>
            <select
              className="field mt-1"
              disabled={!isEditMode}
              value={form.preferences?.caste || ""}
              onChange={(e) => update("preferences", "caste", e.target.value)}
            >
              <option value="">No Bar / Select Caste</option>
              {(DATA.castes[form.preferences?.religion] || ["Others"]).map((c) => (
                <option key={c} value={c}>{t(c)}</option>
              ))}
            </select>
          </label>

          {/* Expected Job */}
          <label className="flex flex-col gap-1.5">
            <span className="label">{t("prefJob")}</span>
            <select
              className="field mt-1"
              disabled={!isEditMode}
              value={form.preferences?.job || ""}
              onChange={(e) => update("preferences", "job", e.target.value)}
            >
              <option value="">No Bar / Select Job</option>
              {DATA.professions.map((p) => (
                <option key={p} value={p}>{t(p)}</option>
              ))}
            </select>
          </label>

          {/* Expected Min Income */}
          <label className="flex flex-col gap-1.5">
            <span className="label">{t("prefSalary")}</span>
            <input
              className="field mt-1"
              type="number"
              disabled={!isEditMode}
              value={form.preferences?.salary || ""}
              onChange={(e) => update("preferences", "salary", e.target.value)}
              placeholder={language === "en" ? "E.g., 50000" : "உதாரணம்: 50000"}
            />
          </label>

          {/* Expected Language */}
          <label className="flex flex-col gap-1.5 sm:col-span-2 lg:col-span-3">
            <span className="label">{t("prefLanguage")}</span>
            <select
              className="field mt-1"
              disabled={!isEditMode}
              value={form.preferences?.language || ""}
              onChange={(e) => update("preferences", "language", e.target.value)}
            >
              <option value="">No Bar / Select Language</option>
              {DATA.motherTongue.map((lang) => (
                <option key={lang} value={lang}>{t(lang)}</option>
              ))}
            </select>
          </label>
        </div>
      </section>

      {/* Bottom Action Buttons */}
      <div className="flex gap-4 bg-rose-50/50 rounded-2xl border border-rose-100 p-6">
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-soft hover:bg-slate-50 transition"
        >
          <Eye size={17} /> {t("previewCard")}
        </button>
        {!isEditMode ? (
          <button
            type="button"
            onClick={() => setIsEditMode(true)}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-maroon-600 px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-maroon-700 hover:-translate-y-0.5 active:translate-y-0"
          >
            <Edit size={17} /> {t("editDetails")}
          </button>
        ) : (
          <button
            type="submit"
            disabled={saving}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:from-rose-600 hover:to-pink-700 disabled:opacity-50 hover:-translate-y-0.5 active:translate-y-0"
          >
            {saving ? (
              <>
                <Spinner size="sm" className="border-white/40 border-t-white" /> {t("saving")}
              </>
            ) : (
              <>
                <Save size={17} />
                {form.basic?.name ? t("completeEditing") : t("completeProfile")}
              </>
            )}
          </button>
        )}
      </div>

      {/* ── CARD PREVIEW MODAL ── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-fade-in">
          <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col rounded-3xl border border-rose-100 bg-white shadow-2xl animate-scale-up">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-rose-100/60 p-5">
              <h3 className="text-lg font-bold text-slate-950">{t("previewCard")}</h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-rose-50 hover:text-slate-600 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Printable Card Area */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
              <div
                ref={cardRef}
                className="mx-auto max-w-[370px] overflow-hidden rounded-3xl border border-rose-200/80 bg-white shadow-md"
                style={{ width: "370px" }}
              >
                {/* Photo container */}
                <div className="relative h-[280px] w-full bg-slate-100">
                  {cardPhoto ? (
                    <img
                      src={cardPhoto}
                      alt={name}
                      className="h-full w-full object-cover"
                      crossOrigin="anonymous"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center text-slate-400">
                      <Camera size={40} strokeWidth={1.5} />
                      <span className="mt-2 text-xs font-semibold">{language === "en" ? "No Image Uploaded" : "படம் இல்லை"}</span>
                    </div>
                  )}
                  {/* Status Overlay badge */}
                  <div className="absolute left-4 top-4 flex items-center gap-1 rounded-full bg-slate-900/70 px-3 py-1.5 text-[10px] font-black tracking-widest text-white uppercase backdrop-blur-sm">
                    {profileId}
                  </div>
                  {isApproved && (
                    <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-emerald-500 px-3 py-1.5 text-[10px] font-black tracking-widest text-white uppercase shadow-sm">
                      <ShieldCheck size={12} fill="currentColor" /> {language === "en" ? "VERIFIED" : "சரிபார்க்கப்பட்டது"}
                    </div>
                  )}
                </div>

                {/* Card Details */}
                <div className="bg-gradient-to-b from-rose-50/20 to-white p-6">
                  <div>
                    <h4 className="text-xl font-black text-slate-950">{form.basic?.name || "—"}</h4>
                    <p className="mt-1 text-xs font-semibold text-rose-600 uppercase tracking-wider">{tagline}</p>
                  </div>

                  {/* Highlights Grid */}
                  <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-3.5 border-t border-rose-100/60 pt-5 text-sm">
                    <div>
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{t("fieldDob")}</p>
                      <p className="mt-0.5 font-bold text-slate-800">
                        {form.basic?.dob ? new Date(form.basic.dob).toLocaleDateString(language === "en" ? "en-IN" : "ta-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{t("fieldMarital")}</p>
                      <p className="mt-0.5 font-bold text-slate-800">{form.basic?.maritalStatus ? t(form.basic.maritalStatus) : "—"}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{t("fieldReligion")} / {t("fieldCaste")}</p>
                      <p className="mt-0.5 font-bold text-slate-800">
                        {form.religion?.religion ? `${t(form.religion.religion)}, ${form.religion.caste || "—"}` : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{t("fieldMotherTongue")}</p>
                      <p className="mt-0.5 font-bold text-slate-800">{form.religion?.motherTongue ? t(form.religion.motherTongue) : "—"}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{t("fieldEducation")}</p>
                      <p className="mt-0.5 font-bold text-slate-800">{form.education?.degree || "—"}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{t("fieldSalary")}</p>
                      <p className="mt-0.5 font-bold text-slate-800">₹ {fmt(form.career?.salary)}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{t("fieldRasi")} / {t("fieldStar")}</p>
                      <p className="mt-0.5 font-bold text-slate-800">
                        {form.horoscope?.rasi ? `${t(form.horoscope.rasi)}, ${form.horoscope.nakshatra ? t(form.horoscope.nakshatra) : "—"}` : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{t("fieldDosham")}</p>
                      <p className="mt-0.5 font-bold text-slate-800">{form.horoscope?.dosham ? t(form.horoscope.dosham) : "—"}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{t("fieldHouse")} / {t("fieldLand")}</p>
                      <p className="mt-0.5 font-bold text-slate-800">
                        {form.assets?.house ? `${t(form.assets.house)}${form.assets.land ? `, ${form.assets.land}` : ""}` : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{t("fieldAssetValue")}</p>
                      <p className="mt-0.5 font-bold text-slate-800">{form.assets?.totalValue || "—"}</p>
                    </div>
                  </div>

                  {/* Brand Footer in Card */}
                  <div className="mt-6 flex items-center justify-between border-t border-rose-100/60 pt-4 text-[10px] font-semibold text-slate-400">
                    <p className="flex items-center gap-1">
                      <span className="text-rose-500">💖</span> Soulmate Matrimony
                    </p>
                    <p>soulmate.in</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-3 border-t border-rose-100/60 p-5 bg-slate-50/50">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="flex-1 rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 shadow-soft hover:bg-slate-50 transition"
              >
                {language === "en" ? "Close" : "மூடு"}
              </button>
              <button
                type="button"
                onClick={downloadCard}
                disabled={downloading}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 py-3 text-sm font-semibold text-white shadow-soft transition hover:from-rose-600 hover:to-pink-700 disabled:opacity-50"
              >
                {downloading ? (
                  <>
                    <Spinner size="sm" className="border-white/40 border-t-white" /> {language === "en" ? "Downloading..." : "பதிவிறக்கம் செய்யப்படுகிறது..."}
                  </>
                ) : (
                  <>
                    <Download size={16} /> {language === "en" ? "Download Card" : "அட்டையை பதிவிறக்கு"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
