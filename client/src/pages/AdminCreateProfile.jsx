import React, { useState, useRef } from "react";
import { Save, UserPlus, ArrowLeft, ArrowRight, Camera, Eye, X, ShieldCheck, Download } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import html2canvas from "html2canvas";
import { api } from "../services/api";
import { toast } from "../components/Toast";
import Spinner from "../components/Spinner";
import { DATA } from "../utils/constants";
import { useLanguage } from "../context/LanguageContext";

const TABS = ["basic", "religion", "location", "education", "career", "family", "horoscope", "assets", "about", "photos", "preferences"];
const initialProfileState = Object.fromEntries(TABS.map((s) => [s, s === "about" ? "" : {}]));
const degreeNeedsDept = ["B.E","B.Tech","B.Sc","B.Com","BBA","BCA","BA","B.Arch","M.E","M.Tech","M.Sc","M.Com","MBA","MCA","MA","M.Phil","PhD","Doctorate","Diploma","ITI","MBBS","BDS","B.Pharm","B.Nursing","M.Pharm","MD","MS","LLB"];

export default function AdminCreateProfile() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  // Step 1: Login Credentials
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [gender, setGender] = useState("");

  // Step 2: Profile fields
  const [form, setForm] = useState(initialProfileState);
  const showDeptField = degreeNeedsDept.includes(form.education?.degree || "");
  const [photoFile, setPhotoFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Date of Birth dropdown values
  const [dobDay, setDobDay] = useState("");
  const [dobMonth, setDobMonth] = useState("");
  const [dobYear, setDobYear] = useState("");

  const cardRef = useRef(null);

  const updateProfile = (section, field, value) => {
    setForm((cur) => {
      const next = { ...cur };
      if (section === "about") {
        next.about = value;
      } else {
        next[section] = { ...next[section], [field]: value };
        // Reset dynamics
        if (field === "religion" && section === "religion") next.religion.caste = "";
        if (field === "religion" && section === "preferences") next.preferences.caste = "";
        if (field === "rasi") next.horoscope.nakshatra = "";
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
      updateProfile("basic", "dob", `${y}-${paddedMonth}-${paddedDay}`);
    } else {
      updateProfile("basic", "dob", "");
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

  const handleNext = (e) => {
    e.preventDefault();
    if (!email || !password || !fullName || !mobile || !gender) {
      return toast.error("Please fill all user credentials fields.");
    }
    // Sync credentials values with form details
    updateProfile("basic", "name", fullName);
    updateProfile("basic", "gender", gender);
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBack = () => {
    setStep(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
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
    formData.append("email", email);
    formData.append("password", password);
    formData.append("fullName", fullName);
    formData.append("mobile", mobile);
    formData.append("gender", gender);
    formData.append("profileData", JSON.stringify(formToSend));
    if (photoFile) {
      formData.append("photo", photoFile);
    }

    try {
      await api.post("/admin/users/create", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      toast.success("Client profile created and verified successfully!");
      navigate("/admin/users");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create client profile.");
    } finally {
      setSaving(false);
    }
  };

  const downloadCard = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#fff5f8"
      });
      const link = document.createElement("a");
      link.download = `matrimony_${fullName.replace(/\s+/g, "_").toLowerCase()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast.success("Card downloaded successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Download failed.");
    } finally {
      setDownloading(false);
    }
  };

  // Select mappings
  const selectedReligion = form.religion?.religion || "";
  const availableCastes = DATA.castes[selectedReligion] || ["Others"];

  const selectedRasi = form.horoscope?.rasi || "";
  const availableStars = DATA.rasiData[selectedRasi] || [];

  const selectedState = form.location?.state || "";
  const availableStates = DATA.statesByCountry["India"] || [];
  const availableDistricts = DATA.districtsByState[selectedState] || [];

  const fmt = (n) => (n ? parseInt(n).toLocaleString("en-IN") : "—");
  const cardPhoto = preview || "";
  const tagline = [form.career?.jobTitle, form.location?.city].filter(Boolean).join(" • ") || "—";

  return (
    <div className="mx-auto max-w-4xl animate-fade-up">
      {/* Header */}
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center border-b border-rose-100 pb-5">
        <div>
          <h1 className="text-2xl font-black text-slate-950 flex items-center gap-2">
            <UserPlus className="text-maroon-600" /> Create Client Profile
          </h1>
          <p className="text-sm text-slate-400 mt-1">Register and build a verified profile directly on behalf of a client.</p>
        </div>
        <div className="flex gap-2">
          {step === 2 && (
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="btn-secondary flex items-center gap-1.5"
            >
              <Eye size={16} /> Preview Card
            </button>
          )}
          <Link to="/admin/users" className="btn-secondary flex items-center gap-1">
            <ArrowLeft size={15} /> Back to Users
          </Link>
        </div>
      </div>

      {/* Step Indicators */}
      <div className="mb-8 grid grid-cols-2 gap-2 text-center text-xs font-bold text-slate-400">
        <div className={`rounded-lg py-2 ${step === 1 ? "bg-maroon-600 text-white" : "bg-slate-100 text-slate-600"}`}>1. Credentials & Registration</div>
        <div className={`rounded-lg py-2 ${step === 2 ? "bg-maroon-600 text-white" : "bg-slate-100 text-slate-600"}`}>2. Detailed Profile Information</div>
      </div>

      {step === 1 ? (
        <form onSubmit={handleNext} className="panel gap-6 flex flex-col animate-fade-in">
          <h3 className="text-lg font-bold text-maroon-800 border-b border-rose-50 pb-2">Client Login Credentials</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className="label">Full Name *</span>
              <input
                className="field"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="E.g., Ramesh Kumar"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="label">Email Address *</span>
              <input
                className="field"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="E.g., client@example.com"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="label">Mobile Number *</span>
              <input
                className="field"
                required
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="E.g., 9876543210"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="label">Password (For Client Login) *</span>
              <input
                className="field"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 8 characters"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="label">Gender *</span>
              <select
                className="field"
                required
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </label>
          </div>
          <div className="flex justify-end border-t border-rose-50 pt-5 mt-4">
            <button type="submit" className="btn-primary flex items-center gap-1">
              Next & Edit Profile Details <ArrowRight size={16} />
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleSubmit} className="grid gap-6 animate-fade-in">
          {/* Photo */}
          <section className="panel">
            <h2 className="mb-5 text-xl font-black text-maroon-800 flex items-center gap-2">
              <span>📸</span> {t("secPhotos")}
            </h2>
            <div className="flex gap-4 items-start">
              {preview ? (
                <div className="group relative h-40 w-40 overflow-hidden rounded-2xl border border-rose-100 bg-slate-50 shadow-sm animate-fade-in">
                  <img src={preview} alt="New preview" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={removeNewPhoto}
                    className="absolute right-2 top-2 rounded-xl bg-slate-950/65 p-1.5 text-white hover:bg-slate-900 transition"
                  >
                    <X size={15} />
                  </button>
                </div>
              ) : null}

              <label className="flex h-40 w-40 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-rose-200 bg-rose-50/30 hover:bg-rose-50/60 hover:border-rose-300 transition-all">
                <Camera size={28} className="text-maroon-600 animate-pulse" />
                <span className="mt-2 text-xs font-semibold text-maroon-800 px-2 text-center">
                   {preview ? (language === "en" ? "Change Photo" : "படத்தை மாற்றவும்") : (language === "en" ? "Add Photo" : "படம் சேர்க்க")}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhoto}
                />
              </label>
            </div>
          </section>

          {/* Personal info */}
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
                  value={form.basic?.name || ""}
                  onChange={(e) => updateProfile("basic", "name", e.target.value)}
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
                  value={form.basic?.age || ""}
                  onChange={(e) => updateProfile("basic", "age", e.target.value)}
                  placeholder={language === "en" ? "E.g., 25" : "உதாரணம்: 25"}
                />
              </label>
              <div className="flex flex-col gap-1.5">
                <span className="label">{t("fieldDob")} *</span>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  <select
                    className="field"
                    required
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
                    value={dobMonth}
                    onChange={(e) => handleDobChange("month", e.target.value)}
                  >
                    <option value="">Month</option>
                    {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((m, idx) => (
                      <option key={idx + 1} value={idx + 1}>{m}</option>
                    ))}
                  </select>
                  <select
                    className="field"
                    required
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
                  value={form.basic?.gender || ""}
                  onChange={(e) => updateProfile("basic", "gender", e.target.value)}
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
                  value={form.basic?.maritalStatus || ""}
                  onChange={(e) => updateProfile("basic", "maritalStatus", e.target.value)}
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
                  value={form.basic?.height || ""}
                  onChange={(e) => updateProfile("basic", "height", e.target.value)}
                  placeholder={language === "en" ? "E.g., 165" : "உதாரணம்: 165"}
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="label">{t("fieldPhysical")} *</span>
                <select
                  className="field mt-1"
                  required
                  value={form.basic?.physicalStatus || ""}
                  onChange={(e) => updateProfile("basic", "physicalStatus", e.target.value)}
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
                  value={form.basic?.color || ""}
                  onChange={(e) => updateProfile("basic", "color", e.target.value)}
                >
                  <option value="">Select color</option>
                  {DATA.colors.map((c) => (
                    <option key={c} value={c}>{t(c)}</option>
                  ))}
                </select>
              </label>
            </div>
          </section>

          {/* Religion */}
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
                  value={form.religion?.religion || ""}
                  onChange={(e) => updateProfile("religion", "religion", e.target.value)}
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
                  value={form.religion?.caste || ""}
                  onChange={(e) => updateProfile("religion", "caste", e.target.value)}
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
                  value={form.religion?.subCaste || ""}
                  onChange={(e) => updateProfile("religion", "subCaste", e.target.value)}
                  placeholder={language === "en" ? "E.g., Iyer / Sect" : "உதாரணம்: ஐயர் / பிரிவு"}
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="label">{t("fieldMotherTongue")} *</span>
                <select
                  className="field mt-1"
                  required
                  value={form.religion?.motherTongue || ""}
                  onChange={(e) => updateProfile("religion", "motherTongue", e.target.value)}
                >
                  <option value="">Select Mother Tongue</option>
                  {DATA.motherTongue.map((lang) => (
                    <option key={lang} value={lang}>{t(lang)}</option>
                  ))}
                </select>
              </label>
            </div>
          </section>

          {/* Location */}
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
                  value={form.location?.state || ""}
                  onChange={(e) => updateProfile("location", "state", e.target.value)}
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
                    value={form.location?.district || ""}
                    onChange={(e) => updateProfile("location", "district", e.target.value)}
                  >
                    <option value="">{language === "en" ? "Select District" : "மாவட்டம் தேர்வு செய்க"}</option>
                    {availableDistricts.map((d) => (
                      <option key={d} value={d}>{t(d)}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    className="field mt-1"
                    type="text"
                    required
                    value={form.location?.district || ""}
                    onChange={(e) => updateProfile("location", "district", e.target.value)}
                    placeholder={language === "en" ? "E.g., Coimbatore" : "உதாரணம்: கோயம்புத்தூர்"}
                  />
                )}
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="label">{t("fieldCity")} *</span>
                <input
                  className="field mt-1"
                  required
                  value={form.location?.city || ""}
                  onChange={(e) => updateProfile("location", "city", e.target.value)}
                  placeholder={language === "en" ? "E.g., Chennai" : "உதாரணம்: சென்னை"}
                />
              </label>
            </div>
          </section>

          {/* Education */}
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
                  value={form.education?.degree || ""}
                  onChange={(e) => updateProfile("education", "degree", e.target.value)}
                >
                  <option value="">Select Degree</option>
                  {DATA.education.map((e) => (
                    <option key={e} value={e}>{e}</option>
                  ))}
                </select>
              </label>
              {showDeptField && (
                <label className="flex flex-col gap-1.5">
                  <span className="label">{language === "en" ? "Department / Specialization" : "துறை / சிறப்பு பிரிவு"}</span>
                  <input
                    className="field mt-1"
                    value={form.education?.department || ""}
                    onChange={(e) => updateProfile("education", "department", e.target.value)}
                    placeholder={language === "en" ? "E.g., Computer Science, Mechanical, Commerce..." : "உதாரணம்: கணினி அறிவியல், இயந்திரவியல்..."}
                  />
                </label>
              )}
              <label className="flex flex-col gap-1.5">
                <span className="label">{t("fieldCollege")}</span>
                <input
                  className="field mt-1"
                  value={form.education?.college || ""}
                  onChange={(e) => updateProfile("education", "college", e.target.value)}
                  placeholder={language === "en" ? "E.g., Anna University" : "உதாரணம்: அண்ணா பல்கலைக்கழகம்"}
                />
              </label>
            </div>
          </section>

          {/* Professional */}
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
                  value={form.career?.profession || ""}
                  onChange={(e) => updateProfile("career", "profession", e.target.value)}
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
                  value={form.career?.jobTitle || ""}
                  onChange={(e) => updateProfile("career", "jobTitle", e.target.value)}
                  placeholder={language === "en" ? "E.g., Senior iOS Developer" : "உதாரணம்: சீனியர் ஐஓஎஸ் டெவலப்பர்"}
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="label">{t("fieldCompany")}</span>
                <input
                  className="field mt-1"
                  value={form.career?.company || ""}
                  onChange={(e) => updateProfile("career", "company", e.target.value)}
                  placeholder={language === "en" ? "E.g., Infosys Ltd" : "உதாரணம்: இன்போசிஸ் நிறுவனம்"}
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="label">{t("fieldSalary")}</span>
                <input
                  className="field mt-1"
                  type="number"
                  value={form.career?.salary || ""}
                  onChange={(e) => updateProfile("career", "salary", e.target.value)}
                  placeholder={language === "en" ? "E.g., 850000" : "உதாரணம்: 850000"}
                />
              </label>
            </div>
          </section>

          {/* Family */}
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
                  value={form.family?.familyType || ""}
                  onChange={(e) => updateProfile("family", "familyType", e.target.value)}
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
                  value={form.family?.familyValues || ""}
                  onChange={(e) => updateProfile("family", "familyValues", e.target.value)}
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
                  value={form.family?.familyStatus || ""}
                  onChange={(e) => updateProfile("family", "familyStatus", e.target.value)}
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
                  value={form.family?.fatherOccupation || ""}
                  onChange={(e) => updateProfile("family", "fatherOccupation", e.target.value)}
                  placeholder={language === "en" ? "E.g., Retired Govt Officer" : "உதாரணம்: ஓய்வு பெற்ற அரசு அதிகாரி"}
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="label">{t("fieldMotherJob")}</span>
                <input
                  className="field mt-1"
                  value={form.family?.motherOccupation || ""}
                  onChange={(e) => updateProfile("family", "motherOccupation", e.target.value)}
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
                  value={form.family?.siblings || ""}
                  onChange={(e) => updateProfile("family", "siblings", e.target.value)}
                  placeholder={language === "en" ? "E.g., 2" : "உதாரணம்: 2"}
                />
              </label>
            </div>
          </section>

          {/* Horoscope */}
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
                  value={form.horoscope?.rasi || ""}
                  onChange={(e) => updateProfile("horoscope", "rasi", e.target.value)}
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
                  value={form.horoscope?.nakshatra || ""}
                  onChange={(e) => updateProfile("horoscope", "nakshatra", e.target.value)}
                >
                  <option value="">Select Natchathiram</option>
                  {availableStars.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="label">Lagnam (லக்னம்) *</span>
                <select
                  className="field mt-1"
                  required
                  value={form.horoscope?.lagnam || ""}
                  onChange={(e) => updateProfile("horoscope", "lagnam", e.target.value)}
                >
                  <option value="">Select Lagnam</option>
                  {Object.keys(DATA.rasiData).map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="label">{t("fieldDosham")} *</span>
                <select
                  className="field mt-1"
                  required
                  value={form.horoscope?.dosham || ""}
                  onChange={(e) => updateProfile("horoscope", "dosham", e.target.value)}
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
                  value={form.religion?.gothram || ""}
                  onChange={(e) => updateProfile("religion", "gothram", e.target.value)}
                  placeholder={language === "en" ? "E.g., Bharadwaja" : "உதாரணம்: பரத்வாஜ"}
                />
              </label>
            </div>
          </section>

          {/* Assets */}
          <section className="panel">
            <h2 className="mb-5 text-xl font-black text-maroon-800 flex items-center gap-2">
              <span>🏡</span> {t("secAssets")}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5">
                <span className="label">{language === "en" ? "House / Residence" : "வீடு / குடியிருப்பு"}</span>
                <select
                  className="field mt-1"
                  value={form.assets?.house || ""}
                  onChange={(e) => updateProfile("assets", "house", e.target.value)}
                >
                  <option value="">{language === "en" ? "Select House Type" : "வீடு வகை தேர்வு"}</option>
                  <option value="Own House">{language === "en" ? "Own House" : "சொந்த வீடு"}</option>
                  <option value="Rented House">{language === "en" ? "Rented House" : "வாடகை வீடு"}</option>
                  <option value="None / Others">{language === "en" ? "None / Others" : "இல்லை / பிற"}</option>
                </select>
              </label>
              <label className="flex flex-col gap-1.5 sm:col-span-2">
                <span className="label">{language === "en" ? "Asset Details (Describe your property, land, vehicles, etc.)" : "சொத்து விவரங்கள் (நிலம், வாகனம், சொத்து குறிப்புகள்)"}</span>
                <textarea
                  className="field mt-1 resize-y min-h-[100px]"
                  value={form.assets?.description || ""}
                  onChange={(e) => updateProfile("assets", "description", e.target.value)}
                  placeholder={language === "en"
                    ? "Describe your assets freely. E.g.: 2 acres agricultural land in Erode, 1 own house in Chennai, 1 car..."
                    : "உதாரணம்: ஈரோட்டில் 2 ஏக்கர் நிலம், சென்னையில் சொந்த வீடு, 1 கார்..."}
                />
              </label>
            </div>
          </section>

          {/* Bio */}
          <section className="panel">
            <h2 className="mb-5 text-xl font-black text-maroon-800 flex items-center gap-2">
              <span>💬</span> {t("secAbout")}
            </h2>
            <div className="flex flex-col gap-2">
              <span className="label">{t("fieldBio")}</span>
              <textarea
                className="field mt-1 resize-y min-h-[140px]"
                value={form.about || ""}
                onChange={(e) => updateProfile("about", "about", e.target.value)}
                placeholder={t("fieldBioPlaceholder")}
              />
            </div>
          </section>

          {/* Preferences */}
          <section className="panel">
            <h2 className="mb-5 text-xl font-black text-maroon-800 flex items-center gap-2">
              <span>🎯</span> {t("secPreferences")}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <label className="flex flex-col gap-1.5">
                <span className="label">{t("prefMinAge")}</span>
                <input
                  className="field mt-1"
                  type="number"
                  min="18"
                  max="80"
                  value={form.preferences?.ageMin || ""}
                  onChange={(e) => updateProfile("preferences", "ageMin", e.target.value)}
                  placeholder={language === "en" ? "E.g., 21" : "உதாரணம்: 21"}
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="label">{t("prefMaxAge")}</span>
                <input
                  className="field mt-1"
                  type="number"
                  min="18"
                  max="80"
                  value={form.preferences?.ageMax || ""}
                  onChange={(e) => updateProfile("preferences", "ageMax", e.target.value)}
                  placeholder={language === "en" ? "E.g., 30" : "உதாரணம்: 30"}
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="label">{t("prefReligion")}</span>
                <select
                  className="field mt-1"
                  value={form.preferences?.religion || ""}
                  onChange={(e) => updateProfile("preferences", "religion", e.target.value)}
                >
                  <option value="">No Bar / Select Religion</option>
                  {DATA.religions.map((r) => (
                    <option key={r} value={r}>{t(r)}</option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="label">{t("prefCaste")}</span>
                <select
                  className="field mt-1"
                  value={form.preferences?.caste || ""}
                  onChange={(e) => updateProfile("preferences", "caste", e.target.value)}
                >
                  <option value="">No Bar / Select Caste</option>
                  {(DATA.castes[form.preferences?.religion] || ["Others"]).map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="label">{t("prefJob")}</span>
                <select
                  className="field mt-1"
                  value={form.preferences?.job || ""}
                  onChange={(e) => updateProfile("preferences", "job", e.target.value)}
                >
                  <option value="">No Bar / Select Job</option>
                  {DATA.professions.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="label">{t("prefSalary")}</span>
                <input
                  className="field mt-1"
                  type="number"
                  value={form.preferences?.salary || ""}
                  onChange={(e) => updateProfile("preferences", "salary", e.target.value)}
                  placeholder={language === "en" ? "E.g., 600000" : "உதாரணம்: 600000"}
                />
              </label>
              <label className="flex flex-col gap-1.5 sm:col-span-2 lg:col-span-3">
                <span className="label">{t("prefLanguage")}</span>
                <select
                  className="field mt-1"
                  value={form.preferences?.language || ""}
                  onChange={(e) => updateProfile("preferences", "language", e.target.value)}
                >
                  <option value="">No Bar / Select Language</option>
                  {DATA.motherTongue.map((lang) => (
                    <option key={lang} value={lang}>{t(lang)}</option>
                  ))}
                </select>
              </label>
            </div>
          </section>

          {/* Action Row */}
          <div className="flex gap-4 bg-rose-50/50 rounded-2xl border border-rose-100 p-6 mt-4">
            <button type="button" onClick={handleBack} className="btn-secondary !px-6">
              <ArrowLeft size={16} /> Back
            </button>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-soft hover:bg-slate-50 transition"
            >
              <Eye size={17} /> Preview Card
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Spinner size="sm" className="border-white/40 border-t-white" /> Saving...
                </>
              ) : (
                <>
                  <Save size={17} /> Save Client Profile
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* ── CARD PREVIEW MODAL ── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-fade-in">
          <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col rounded-3xl border border-rose-100 bg-white shadow-2xl animate-scale-up">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-rose-100/60 p-5">
              <h3 className="text-lg font-bold text-slate-950">Card Preview</h3>
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
                      alt={fullName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center text-slate-400">
                      <Camera size={40} strokeWidth={1.5} />
                      <span className="mt-2 text-xs font-semibold">No Image Uploaded</span>
                    </div>
                  )}
                  {/* Status Overlay badge */}
                  <div className="absolute left-4 top-4 flex items-center gap-1 rounded-full bg-slate-900/70 px-3 py-1.5 text-[10px] font-black tracking-widest text-white uppercase backdrop-blur-sm">
                    PRE-APPROVED
                  </div>
                  <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-emerald-500 px-3 py-1.5 text-[10px] font-black tracking-widest text-white uppercase shadow-sm">
                    <ShieldCheck size={12} fill="currentColor" /> VERIFIED
                  </div>
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
                        {form.basic?.dob ? new Date(form.basic.dob).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
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
                Close
              </button>
              <button
                type="button"
                onClick={downloadCard}
                disabled={downloading}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 py-3 text-sm font-semibold text-white shadow-soft transition hover:from-rose-600 hover:to-pink-700 disabled:opacity-50"
              >
                {downloading ? "Downloading..." : "Download Card"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
