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

const TABS = ["basic", "religion", "location", "education", "career", "family", "horoscope", "assets", "about", "photos", "preferences"];
const initial = Object.fromEntries(TABS.map((s) => [s, s === "about" ? "" : {}]));

export default function Profile() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const { t, language } = useLanguage();
  const [form, setForm] = useState(initial);
  const [photos, setPhotos] = useState([]);
  const [existingPhotos, setExistingPhotos] = useState([]);
  const [saving, setSaving] = useState(false);
  const [previews, setPreviews] = useState([]);
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
        setForm(next);
        setExistingPhotos(data.profile.photos || []);
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
        if (field === "rasi") next.horoscope.nakshatra = "";
        if (field === "country") next.location.state = "";
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
      update("basic", "dob", `${y}-${paddedMonth}-${paddedDay}`);
    } else {
      update("basic", "dob", "");
    }
  };

  const handlePhotos = (e) => {
    const files = Array.from(e.target.files);
    setPhotos((prev) => [...prev, ...files]);

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removePhoto = async (index, isExisting = false, photoId = null) => {
    if (isExisting && photoId) {
      if (!window.confirm(language === "en" ? "Delete this photo?" : "இந்த புகைப்படத்தை நீக்கவா?")) return;
      try {
        await api.delete(`/profile/photos/${photoId}`);
        setExistingPhotos((prev) => prev.filter((p) => p.publicId !== photoId));
        toast.success(language === "en" ? "Photo deleted" : "புகைப்படம் நீக்கப்பட்டது");
      } catch (err) {
        toast.error(err.response?.data?.message || (language === "en" ? "Delete failed" : "நீக்க முடியவில்லை"));
      }
    } else {
      setPhotos((prev) => prev.filter((_, i) => i !== index));
      setPreviews((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const formData = new FormData();
    formData.append("updates", JSON.stringify(form));
    photos.forEach((file) => formData.append("photos", file));

    try {
      const { data } = await api.post("/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      updateUser(data.user);
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
      setExistingPhotos(data.profile.photos || []);
      setPhotos([]);
      setPreviews([]);
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

  const selectedRasi = form.horoscope?.rasi || "";
  const availableStars = DATA.rasiData[selectedRasi] || [];

  const selectedCountry = form.location?.country || "";
  const availableStates = DATA.statesByCountry[selectedCountry] || ["Other"];

  const fmt = (n) => (n ? parseInt(n).toLocaleString("en-IN") : "—");
  const cardPhoto = previews[0] || existingPhotos[0]?.url || "";
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

      {/* ── SECTION 1: Photos ── */}
      <section className="panel">
        <h2 className="mb-5 text-xl font-black text-maroon-800 flex items-center gap-2">
          <span>📸</span> {t("secPhotos")}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          {/* Upload card */}
          {isEditMode && (
            <label className="flex h-40 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-rose-200 bg-rose-50/30 hover:bg-rose-50/60 hover:border-rose-300 transition-all">
              <Camera size={28} className="text-maroon-600 animate-pulse" />
              <span className="mt-2 text-xs font-semibold text-maroon-800">{language === "en" ? "Add Photo" : "படம் சேர்க்க"}</span>
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handlePhotos}
              />
            </label>
          )}

          {/* New previews */}
          {previews.map((url, i) => (
            <div key={`new-${i}`} className="group relative h-40 overflow-hidden rounded-2xl border border-rose-100 bg-slate-50 shadow-sm animate-fade-in">
              <img src={url} alt="New preview" className="h-full w-full object-cover" />
              {isEditMode && (
                <button
                  type="button"
                  onClick={() => removePhoto(i, false)}
                  className="absolute right-2 top-2 rounded-xl bg-slate-950/65 p-1.5 text-white hover:bg-slate-900 transition"
                >
                  <X size={15} />
                </button>
              )}
            </div>
          ))}

          {/* Existing photos */}
          {existingPhotos.map((p, i) => (
            <div key={`ex-${i}`} className="group relative h-40 overflow-hidden rounded-2xl border border-rose-100 bg-slate-50 shadow-sm">
              <img src={p.url} alt="Saved photo" className="h-full w-full object-cover" />
              {isEditMode && (
                <button
                  type="button"
                  onClick={() => removePhoto(i, true, p.publicId)}
                  className="absolute right-2 top-2 rounded-xl bg-slate-950/65 p-1.5 text-white hover:bg-slate-900 transition"
                >
                  <X size={15} />
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── SECTION 2: Personal Information ── */}
      <section className="panel">
        <h2 className="mb-5 text-xl font-black text-maroon-800 flex items-center gap-2">
          <span>👤</span> {t("secBasic")}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className="flex flex-col gap-1.5">
            <span className="label">{t("fieldName")} *</span>
            <input
              className="field mt-1"
              required
              disabled={!isEditMode}
              value={form.basic?.name || ""}
              onChange={(e) => update("basic", "name", e.target.value)}
              placeholder={language === "en" ? "E.g., Priya Sharma" : "உதாரணம்: பிரியா சர்மா"}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="label">{t("fieldAge")} *</span>
            <input
              className="field mt-1"
              type="number"
              required
              min="18"
              max="80"
              disabled={!isEditMode}
              value={form.basic?.age || ""}
              onChange={(e) => update("basic", "age", e.target.value)}
              placeholder={language === "en" ? "E.g., 25" : "உதாரணம்: 25"}
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
            <span className="label">{t("fieldWeight")}</span>
            <input
              className="field mt-1"
              type="number"
              min="30"
              max="200"
              disabled={!isEditMode}
              value={form.basic?.weight || ""}
              onChange={(e) => update("basic", "weight", e.target.value)}
              placeholder={language === "en" ? "E.g., 60" : "உதாரணம்: 60"}
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
              onChange={(e) => update("religion", "caste", e.target.value)}
            >
              <option value="">Select Caste</option>
              {availableCastes.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="label">{t("fieldSubcaste")}</span>
            <input
              className="field mt-1"
              disabled={!isEditMode}
              value={form.religion?.subCaste || ""}
              onChange={(e) => update("religion", "subCaste", e.target.value)}
              placeholder={language === "en" ? "E.g., Iyer / Sect" : "உதாரணம்: ஐயர் / பிரிவு"}
            />
          </label>
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
            <span className="label">{t("fieldCountry")} *</span>
            <select
              className="field mt-1"
              required
              disabled={!isEditMode}
              value={form.location?.country || ""}
              onChange={(e) => update("location", "country", e.target.value)}
            >
              <option value="">Select Country</option>
              {DATA.locations.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>
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
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="label">{t("fieldCity")} *</span>
            <input
              className="field mt-1"
              required
              disabled={!isEditMode}
              value={form.location?.city || ""}
              onChange={(e) => update("location", "city", e.target.value)}
              placeholder={language === "en" ? "E.g., Chennai" : "உதாரணம்: சென்னை"}
            />
          </label>
        </div>
      </section>

      {/* ── SECTION 5: Education ── */}
      <section className="panel">
        <h2 className="mb-5 text-xl font-black text-maroon-800 flex items-center gap-2">
          <span>🎓</span> {t("secEducation")}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="label">{t("fieldEducation")} *</span>
            <select
              className="field mt-1"
              required
              disabled={!isEditMode}
              value={form.education?.degree || ""}
              onChange={(e) => update("education", "degree", e.target.value)}
            >
              <option value="">Select Degree</option>
              {DATA.education.map((e) => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="label">{t("fieldCollege")}</span>
            <input
              className="field mt-1"
              disabled={!isEditMode}
              value={form.education?.college || ""}
              onChange={(e) => update("education", "college", e.target.value)}
              placeholder={language === "en" ? "E.g., Anna University" : "உதாரணம்: அண்ணா பல்கலைக்கழகம்"}
            />
          </label>
        </div>
      </section>

      {/* ── SECTION 6: Professional ── */}
      <section className="panel">
        <h2 className="mb-5 text-xl font-black text-maroon-800 flex items-center gap-2">
          <span>💼</span> {t("secCareer")}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="flex flex-col gap-1.5">
            <span className="label">{t("fieldProfession")} *</span>
            <select
              className="field mt-1"
              required
              disabled={!isEditMode}
              value={form.career?.profession || ""}
              onChange={(e) => update("career", "profession", e.target.value)}
            >
              <option value="">Select Profession</option>
              {DATA.professions.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="label">{t("fieldJobTitle")} *</span>
            <input
              className="field mt-1"
              required
              disabled={!isEditMode}
              value={form.career?.jobTitle || ""}
              onChange={(e) => update("career", "jobTitle", e.target.value)}
              placeholder={language === "en" ? "E.g., Senior iOS Developer" : "உதாரணம்: சீனியர் ஐஓஎஸ் டெவலப்பர்"}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="label">{t("fieldCompany")}</span>
            <input
              className="field mt-1"
              disabled={!isEditMode}
              value={form.career?.company || ""}
              onChange={(e) => update("career", "company", e.target.value)}
              placeholder={language === "en" ? "E.g., Infosys Ltd" : "உதாரணம்: இன்போசிஸ் நிறுவனம்"}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="label">{t("fieldSalary")}</span>
            <input
              className="field mt-1"
              type="number"
              disabled={!isEditMode}
              value={form.career?.salary || ""}
              onChange={(e) => update("career", "salary", e.target.value)}
              placeholder={language === "en" ? "E.g., 850000" : "உதாரணம்: 850000"}
            />
          </label>
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
              <option value="">Select Family Type</option>
              <option value="Joint">{t("Joint")}</option>
              <option value="Nuclear">{t("Nuclear")}</option>
              <option value="Others">{t("Others")}</option>
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="label">{t("fieldFamilyValue")} *</span>
            <select
              className="field mt-1"
              required
              disabled={!isEditMode}
              value={form.family?.familyValues || ""}
              onChange={(e) => update("family", "familyValues", e.target.value)}
            >
              <option value="">Select Values</option>
              <option value="Orthodox">{t("Orthodox")}</option>
              <option value="Traditional">{t("Traditional")}</option>
              <option value="Moderate">{t("Moderate")}</option>
              <option value="Liberal">{t("Liberal")}</option>
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="label">{t("fieldFamilyStatus")} *</span>
            <select
              className="field mt-1"
              required
              disabled={!isEditMode}
              value={form.family?.familyStatus || ""}
              onChange={(e) => update("family", "familyStatus", e.target.value)}
            >
              <option value="">Select Status</option>
              <option value="Middle Class">{t("Middle Class")}</option>
              <option value="Upper Middle Class">{t("Upper Middle Class")}</option>
              <option value="Rich">{t("Rich")}</option>
              <option value="Affluent">{t("Affluent")}</option>
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="label">{t("fieldFatherJob")}</span>
            <input
              className="field mt-1"
              disabled={!isEditMode}
              value={form.family?.fatherOccupation || ""}
              onChange={(e) => update("family", "fatherOccupation", e.target.value)}
              placeholder={language === "en" ? "E.g., Retired Govt Officer" : "உதாரணம்: ஓய்வு பெற்ற அரசு அதிகாரி"}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="label">{t("fieldMotherJob")}</span>
            <input
              className="field mt-1"
              disabled={!isEditMode}
              value={form.family?.motherOccupation || ""}
              onChange={(e) => update("family", "motherOccupation", e.target.value)}
              placeholder={language === "en" ? "E.g., Homemaker" : "உதாரணம்: இல்லத்தரசி"}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="label">{t("fieldSiblings")}</span>
            <input
              className="field mt-1"
              type="number"
              min="0"
              max="15"
              disabled={!isEditMode}
              value={form.family?.siblings || ""}
              onChange={(e) => update("family", "siblings", e.target.value)}
              placeholder={language === "en" ? "E.g., 2" : "உதாரணம்: 2"}
            />
          </label>
        </div>
      </section>

      {/* ── SECTION 8: Horoscope Details ── */}
      <section className="panel">
        <h2 className="mb-5 text-xl font-black text-maroon-800 flex items-center gap-2">
          <span>✨</span> {t("secHoroscope")}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
              {Object.keys(DATA.rasiData).map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="label">{t("fieldStar")} *</span>
            <select
              className="field mt-1"
              required
              disabled={!isEditMode}
              value={form.horoscope?.nakshatra || ""}
              onChange={(e) => update("horoscope", "nakshatra", e.target.value)}
            >
              <option value="">Select Natchathiram</option>
              {availableStars.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
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
              {DATA.doshamTypes.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </label>
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
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="flex flex-col gap-1.5">
            <span className="label">{t("fieldHouse")}</span>
            <select
              className="field mt-1"
              disabled={!isEditMode}
              value={form.assets?.house || ""}
              onChange={(e) => update("assets", "house", e.target.value)}
            >
              <option value="">Select House Type</option>
              <option value="Own House">{t("Own House")}</option>
              <option value="Rented House">{t("Rented House")}</option>
              <option value="None / Others">{t("None / Others")}</option>
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="label">{t("fieldLand")}</span>
            <input
              className="field mt-1"
              type="text"
              disabled={!isEditMode}
              value={form.assets?.land || ""}
              onChange={(e) => update("assets", "land", e.target.value)}
              placeholder={language === "en" ? "E.g., 2 Acres / 5 Cents" : "உதாரணம்: 2 ஏக்கர் / 5 சென்ட்"}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="label">{t("fieldAssetValue")}</span>
            <input
              className="field mt-1"
              type="text"
              disabled={!isEditMode}
              value={form.assets?.totalValue || ""}
              onChange={(e) => update("assets", "totalValue", e.target.value)}
              placeholder={language === "en" ? "E.g., ₹50 Lakhs / ₹1 Crore" : "உதாரணம்: ₹50 லட்சம் / ₹1 கோடி"}
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
                <option key={c} value={c}>{c}</option>
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
                <option key={p} value={p}>{p}</option>
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
              placeholder={language === "en" ? "E.g., 600000" : "உதாரணம்: 600000"}
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
                        {form.horoscope?.rasi ? `${form.horoscope.rasi}, ${form.horoscope.nakshatra || "—"}` : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{t("fieldDosham")}</p>
                      <p className="mt-0.5 font-bold text-slate-800">{form.horoscope?.dosham || "—"}</p>
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
