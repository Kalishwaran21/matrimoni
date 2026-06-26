import React, { useEffect, useState, useRef } from "react";
import { Save, Upload, Camera, Download, Eye, X, ShieldCheck, Mail, Phone, Lock, Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";
import html2canvas from "html2canvas";
import { api } from "../services/api";
import { toast } from "../components/Toast";
import Spinner from "../components/Spinner";
import { DATA } from "../utils/constants";
import { useAuth } from "../context/AuthContext";

const TABS = ["basic", "religion", "location", "education", "career", "family", "lifestyle", "horoscope", "about", "photos"];
const initial = Object.fromEntries(TABS.map((s) => [s, s === "about" ? "" : {}]));

export default function Profile() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState(initial);
  const [photos, setPhotos] = useState([]);
  const [existingPhotos, setExistingPhotos] = useState([]);
  const [saving, setSaving] = useState(false);
  const [previews, setPreviews] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(true);
  const [isApproved, setIsApproved] = useState(false);
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
        if (field === "religion") next.religion.caste = "";
        if (field === "rasi") next.horoscope.nakshatra = "";
        if (field === "country") next.location.state = "";
      }
      return next;
    });
  };

  const handlePhotos = (e) => {
    const files = Array.from(e.target.files);
    setPhotos((prev) => [...prev, ...files]);
    setPreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
  };

  const removeNewPhoto = (index) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingPhoto = (index) => {
    setExistingPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const submit = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const body = new FormData();
      const submissionForm = { ...form };
      submissionForm.photos = existingPhotos;
      submissionForm.isSubmitted = true;
      body.append("profile", JSON.stringify(submissionForm));
      photos.forEach((f) => body.append("photos", f));

      await api.put("/profile", body, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Profile saved successfully!");
      
      updateUser({ isProfileSubmitted: true, isProfileApproved: isApproved });

      const { data } = await api.get("/profile/me");
      if (data.profile) {
        setExistingPhotos(data.profile.photos || []);
        setPhotos([]);
        setPreviews([]);
        setIsEditMode(false);
        setIsApproved(data.profile.isApproved || false);
      }
      navigate("/matches");
    } catch (err) {
      toast.error(err.response?.data?.message || "Save failed. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const downloadCard = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    await new Promise((r) => setTimeout(r, 200));
    try {
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
      toast.success("Profile card downloaded successfully!");
    } catch (err) {
      console.error("Download failed:", err);
      toast.error("Download failed. Please try again.");
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
          <p className="label">Profile</p>
          <h1 className="mt-2 text-3xl font-black text-slate-950 flex items-center gap-2">
            Matrimony Profile
            {isApproved && (
              <span className="inline-flex items-center justify-center rounded-full bg-emerald-500 p-1 text-white shadow-sm" title="Verified Profile">
                <ShieldCheck size={16} fill="currentColor" />
              </span>
            )}
          </h1>
          <p className="text-sm text-slate-500 mt-1">Fill in your details below for admin approval and profile card generator.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="btn-secondary flex items-center gap-1.5"
          >
            <Eye size={17} /> Preview Card
          </button>
          {!isEditMode ? (
            <button
              type="button"
              onClick={() => setIsEditMode(true)}
              className="btn-primary flex items-center gap-1.5"
            >
              <Edit size={17} /> Edit Details
            </button>
          ) : (
            <button
              id="profile-save"
              type="submit"
              className="btn-primary flex items-center gap-1.5"
              disabled={saving}
            >
              {saving ? <Spinner size="sm" className="border-white/40 border-t-white" /> : <Save size={17} />}
              {saving ? "Saving..." : (user?.isProfileSubmitted ? "Complete Editing" : "Complete Profile")}
            </button>
          )}
        </div>
      </div>

      {/* ── SECTION 1: Photos Upload ── */}
      <section className="panel">
        <h2 className="mb-5 text-xl font-black text-maroon-800 flex items-center gap-2">
          <span>📸</span> Profile Photos
        </h2>

        {/* Existing photos */}
        {existingPhotos.length > 0 && (
          <div className="mb-6">
            <p className="label mb-3">Current Photos</p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
              {existingPhotos.map((p, i) => (
                <div key={i} className="relative aspect-square overflow-hidden rounded-xl border border-rose-100 group">
                  <img src={p.url} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" />
                  {isEditMode && (
                    <button
                      type="button"
                      onClick={() => removeExistingPhoto(i)}
                      className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 shadow hover:bg-red-700 transition opacity-0 group-hover:opacity-100 focus:opacity-100"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload block */}
        {isEditMode && (
          <label className="block cursor-pointer">
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-rose-200 bg-rose-50/50 py-10 transition hover:border-maroon-400 hover:bg-maroon-50/50">
              <Upload size={28} className="text-maroon-400 mb-3" />
              <p className="font-semibold text-slate-700">Click to upload photos</p>
              <p className="text-sm text-slate-400 mt-1">JPG, PNG — select multiple images</p>
            </div>
            <input type="file" multiple accept="image/*" onChange={handlePhotos} className="hidden" />
          </label>
        )}

        {/* Previews */}
        {previews.length > 0 && (
          <div className="mt-5">
            <p className="label mb-3">New Photos (will be uploaded on save)</p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
              {previews.map((src, i) => (
                <div key={i} className="relative aspect-square overflow-hidden rounded-xl border border-maroon-200 ring-2 ring-maroon-100 group">
                  <img src={src} alt={`Preview ${i + 1}`} className="h-full w-full object-cover" />
                  {isEditMode && (
                    <button
                      type="button"
                      onClick={() => removeNewPhoto(i)}
                      className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 shadow hover:bg-red-700 transition opacity-0 group-hover:opacity-100 focus:opacity-100"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ── SECTION 2: Personal Information ── */}
      <section className="panel">
        <h2 className="mb-5 text-xl font-black text-maroon-800 flex items-center gap-2">
          <span>👤</span> Personal Information
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className="sm:col-span-2 flex flex-col gap-1.5">
            <span className="label">Full Name *</span>
            <input
              className="field mt-1"
              type="text"
              required
              disabled={!isEditMode}
              value={form.basic?.name || ""}
              onChange={(e) => update("basic", "name", e.target.value)}
              placeholder="E.g., Priya Sharma"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="label">Age *</span>
            <input
              className="field mt-1"
              type="number"
              required
              min="18"
              max="80"
              disabled={!isEditMode}
              value={form.basic?.age || ""}
              onChange={(e) => update("basic", "age", e.target.value)}
              placeholder="E.g., 25"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="label">Date of Birth</span>
            <input
              className="field mt-1"
              type="date"
              disabled={!isEditMode}
              value={form.basic?.dob ? form.basic.dob.split("T")[0] : ""}
              onChange={(e) => update("basic", "dob", e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="label">Gender *</span>
            <select
              className="field mt-1"
              required
              disabled={!isEditMode}
              value={form.basic?.gender || ""}
              onChange={(e) => update("basic", "gender", e.target.value)}
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="label">Marital Status *</span>
            <select
              className="field mt-1"
              required
              disabled={!isEditMode}
              value={form.basic?.marital || ""}
              onChange={(e) => update("basic", "marital", e.target.value)}
            >
              <option value="">Select Status</option>
              {DATA.maritalStatus.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="label">Mother Tongue *</span>
            <select
              className="field mt-1"
              required
              disabled={!isEditMode}
              value={form.basic?.language || ""}
              onChange={(e) => update("basic", "language", e.target.value)}
            >
              <option value="">Select Tongue</option>
              {DATA.motherTongue.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="label">Religion *</span>
            <select
              className="field mt-1"
              required
              disabled={!isEditMode}
              value={form.religion?.religion || ""}
              onChange={(e) => update("religion", "religion", e.target.value)}
            >
              <option value="">Select Religion</option>
              {DATA.religions.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="label">Caste *</span>
            <select
              className="field mt-1"
              required
              disabled={!isEditMode || form.religion?.religion === "No Bar"}
              value={form.religion?.caste || ""}
              onChange={(e) => update("religion", "caste", e.target.value)}
            >
              <option value="">Select Caste</option>
              {availableCastes.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <label className="sm:col-span-2 flex flex-col gap-1.5">
            <span className="label">Sub Caste / Gotram</span>
            <input
              className="field mt-1"
              type="text"
              disabled={!isEditMode}
              value={form.religion?.subCaste || ""}
              onChange={(e) => update("religion", "subCaste", e.target.value)}
              placeholder="E.g., Iyer, Iyengar..."
            />
          </label>
        </div>
      </section>

      {/* ── SECTION 3: Family Details ── */}
      <section className="panel">
        <h2 className="mb-5 text-xl font-black text-maroon-800 flex items-center gap-2">
          <span>👨‍👩‍👧</span> Family Details
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="label">Father's Occupation</span>
            <input
              className="field mt-1"
              type="text"
              disabled={!isEditMode}
              value={form.family?.fatherOccupation || ""}
              onChange={(e) => update("family", "fatherOccupation", e.target.value)}
              placeholder="E.g., Business, Retired..."
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="label">Mother's Occupation</span>
            <input
              className="field mt-1"
              type="text"
              disabled={!isEditMode}
              value={form.family?.motherOccupation || ""}
              onChange={(e) => update("family", "motherOccupation", e.target.value)}
              placeholder="E.g., Homemaker, Teacher..."
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="label">No. of Siblings</span>
            <input
              className="field mt-1"
              type="number"
              min="0"
              disabled={!isEditMode}
              value={form.family?.siblings || ""}
              onChange={(e) => update("family", "siblings", e.target.value)}
              placeholder="E.g., 2"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="label">Family Type</span>
            <select
              className="field mt-1"
              disabled={!isEditMode}
              value={form.family?.familytype || ""}
              onChange={(e) => update("family", "familytype", e.target.value)}
            >
              <option value="">Select Type</option>
              <option value="Joint Family">Joint Family</option>
              <option value="Nuclear Family">Nuclear Family</option>
            </select>
          </label>
        </div>
      </section>

      {/* ── SECTION 4: Education & Career ── */}
      <section className="panel">
        <h2 className="mb-5 text-xl font-black text-maroon-800 flex items-center gap-2">
          <span>🎓</span> Education & Career
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className="flex flex-col gap-1.5">
            <span className="label">Highest Education *</span>
            <select
              className="field mt-1"
              required
              disabled={!isEditMode}
              value={form.education?.degree || ""}
              onChange={(e) => update("education", "degree", e.target.value)}
            >
              <option value="">Select Education</option>
              {DATA.education.map((e) => <option key={e} value={e}>{e}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="label">Profession *</span>
            <select
              className="field mt-1"
              required
              disabled={!isEditMode}
              value={form.career?.jobTitle || ""}
              onChange={(e) => update("career", "jobTitle", e.target.value)}
            >
              <option value="">Select Profession</option>
              {DATA.professions.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="label">Monthly Income (INR) *</span>
            <input
              className="field mt-1"
              type="number"
              required
              disabled={!isEditMode}
              value={form.career?.salary || ""}
              onChange={(e) => update("career", "salary", e.target.value)}
              placeholder="E.g., 50000"
            />
          </label>
        </div>
      </section>

      {/* ── SECTION 5: Physical Attributes ── */}
      <section className="panel">
        <h2 className="mb-5 text-xl font-black text-maroon-800 flex items-center gap-2">
          <span>🧍</span> Physical Attributes
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="flex flex-col gap-1.5">
            <span className="label">Height *</span>
            <select
              className="field mt-1"
              required
              disabled={!isEditMode}
              value={form.basic?.height || ""}
              onChange={(e) => update("basic", "height", e.target.value)}
            >
              <option value="">Select Height</option>
              {Array.from({ length: 101 }, (_, i) => 120 + i).map((h) => (
                <option key={h} value={`${h} cm`}>{h} cm</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="label">Weight *</span>
            <select
              className="field mt-1"
              required
              disabled={!isEditMode}
              value={form.basic?.weight || ""}
              onChange={(e) => update("basic", "weight", e.target.value)}
            >
              <option value="">Select Weight</option>
              {["Below 40 Kg", "40-50 Kg", "51-60 Kg", "61-70 Kg", "71-80 Kg", "81-90 Kg", "91-100 Kg", "Above 100 Kg"].map((w) => (
                <option key={w} value={w}>{w}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="label">Physical Status *</span>
            <select
              className="field mt-1"
              required
              disabled={!isEditMode}
              value={form.basic?.physical || ""}
              onChange={(e) => update("basic", "physical", e.target.value)}
            >
              <option value="">Select Status</option>
              {DATA.physicalStatus.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="label">Complexion / Color</span>
            <select
              className="field mt-1"
              disabled={!isEditMode}
              value={form.basic?.color || ""}
              onChange={(e) => update("basic", "color", e.target.value)}
            >
              <option value="">Select Color</option>
              {DATA.colors.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
        </div>
      </section>

      {/* ── SECTION 6: Contact Details ── */}
      <section className="panel">
        <h2 className="mb-5 text-xl font-black text-maroon-800 flex items-center gap-2">
          <span>📞</span> Contact Details
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="label">Phone Number *</span>
            <input
              className="field mt-1 bg-slate-50 cursor-not-allowed text-slate-500"
              type="text"
              readOnly
              value={user?.mobile || ""}
              title="Change from settings"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="label">Email Address *</span>
            <input
              className="field mt-1 bg-slate-50 cursor-not-allowed text-slate-500"
              type="text"
              readOnly
              value={user?.email || ""}
              title="Change from settings"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="label">Native Place *</span>
            <input
              className="field mt-1"
              type="text"
              required
              disabled={!isEditMode}
              value={form.location?.nativePlace || ""}
              onChange={(e) => update("location", "nativePlace", e.target.value)}
              placeholder="E.g., Madurai"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="label">Current Place *</span>
            <input
              className="field mt-1"
              type="text"
              required
              disabled={!isEditMode}
              value={form.location?.currentPlace || ""}
              onChange={(e) => update("location", "currentPlace", e.target.value)}
              placeholder="E.g., Chennai"
            />
          </label>
        </div>
      </section>

      {/* ── SECTION 7: Horoscope Details ── */}
      <section className="panel">
        <h2 className="mb-5 text-xl font-black text-maroon-800 flex items-center gap-2">
          <span>⭐</span> Horoscope Details
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="flex flex-col gap-1.5">
            <span className="label">Rasi *</span>
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
            <span className="label">Natchathiram *</span>
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
            <span className="label">Dosham *</span>
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
            <span className="label">Gothram / Kulam</span>
            <input
              className="field mt-1"
              type="text"
              disabled={!isEditMode}
              value={form.religion?.gothram || ""}
              onChange={(e) => update("religion", "gothram", e.target.value)}
              placeholder="E.g., Bharadwaja"
            />
          </label>
        </div>
      </section>

      {/* ── SECTION 8: About Yourself ── */}
      <section className="panel">
        <h2 className="mb-5 text-xl font-black text-maroon-800 flex items-center gap-2">
          <span>💬</span> About Yourself
        </h2>
        <div className="flex flex-col gap-2">
          <span className="label">Brief Bio</span>
          <textarea
            className="field mt-1 resize-y min-h-[140px]"
            disabled={!isEditMode}
            value={form.about || ""}
            onChange={(e) => update("about", "about", e.target.value)}
            placeholder="Write a few lines about yourself, your interests, and what you are looking for in a partner..."
          />
        </div>
      </section>

      {/* Bottom Action Buttons */}
      <div className="flex gap-4 bg-rose-50/50 rounded-2xl border border-rose-100 p-6">
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-soft hover:bg-slate-50 transition"
        >
          <Eye size={17} /> Preview Card
        </button>
        {!isEditMode ? (
          <button
            type="button"
            onClick={() => setIsEditMode(true)}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-maroon-600 px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-maroon-700 hover:-translate-y-0.5 active:translate-y-0"
          >
            <Edit size={17} /> Edit Details
          </button>
        ) : (
          <button
            type="submit"
            disabled={saving}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-maroon-600 px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-maroon-700 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
          >
            {saving ? <Spinner size="sm" className="border-white/40 border-t-white" /> : <Save size={17} />}
            {saving ? "Saving..." : (user?.isProfileSubmitted ? "Complete Editing" : "Complete Profile")}
          </button>
        )}
      </div>

      {/* ══════════════════════════════════════
           PROFILE CARD PREVIEW MODAL
      ══════════════════════════════════════ */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-955/70 backdrop-blur-sm overflow-y-auto">
          <div className="relative bg-white rounded-3xl p-6 shadow-soft max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 bg-rose-50 text-maroon-600 rounded-full p-2 hover:bg-maroon-600 hover:text-white transition"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <h2 className="text-2xl font-black text-maroon-800">Your Profile Card</h2>
            <p className="text-xs text-slate-400 mb-5">Preview how your profile will appear. Download it as a PNG image.</p>

            {/* ── DOWNLOADABLE PROFILE CARD ── */}
            <div className="border border-rose-100 rounded-2xl overflow-hidden p-1 bg-white mb-6">
              <div
                ref={cardRef}
                className="w-full bg-gradient-to-br from-[#fff5f8] via-white to-[#fff9e6] overflow-hidden relative flex flex-col p-6 items-center border border-rose-100 rounded-xl"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                {/* banner background */}
                <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-r from-maroon-700 via-maroon-800 to-maroon-900 flex items-center justify-center z-0">
                  <span className="text-[10px] tracking-[4px] font-black text-white/30 uppercase select-none">
                    💍 MatriMonial 💍
                  </span>
                </div>

                {/* photo */}
                <div className="relative h-28 w-28 rounded-full bg-gradient-to-br from-maroon-600 to-orange-500 p-1 mt-6 z-10 shadow-md">
                  {cardPhoto ? (
                    <img
                      src={cardPhoto}
                      alt={form.basic?.name || "Profile"}
                      className="h-full w-full object-cover rounded-full border-4 border-white bg-rose-50"
                    />
                  ) : (
                    <div className="h-full w-full rounded-full border-4 border-white bg-rose-100 flex items-center justify-center text-4xl font-black text-maroon-300 select-none">
                      {(form.basic?.name || user?.fullName || "?").charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="absolute bottom-1 right-1 w-7 h-7 bg-amber-400 border-2 border-white rounded-full flex items-center justify-center text-xs shadow">
                    💍
                  </div>
                </div>

                {/* header details */}
                <div className="mt-4 text-center w-full z-10">
                  <h3 className="text-xl font-black text-maroon-900 flex items-center justify-center gap-1.5">
                    {form.basic?.name || user?.fullName || "—"}
                    {isApproved && (
                      <span className="inline-flex items-center justify-center rounded-full bg-emerald-500 p-0.5 text-white shadow-sm shrink-0" style={{ width: "16px", height: "16px" }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="20 6 9 17 4 12"/></svg>
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-400 font-semibold tracking-wide mt-1">
                    {tagline}
                  </p>
                </div>

                <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-rose-100 to-transparent my-4" />

                {/* details grid */}
                <div className="grid grid-cols-2 gap-2.5 w-full text-left">
                  {[
                    { icon: "🎂", label: "Age", value: form.basic?.age ? `${form.basic.age} yrs` : "—" },
                    { icon: "⚧", label: "Gender", value: form.basic?.gender || "—" },
                    { icon: "📏", label: "Height", value: form.basic?.height || "—" },
                    { icon: "⚖️", label: "Weight", value: form.basic?.weight || "—" },
                    { icon: "💍", label: "Status", value: form.basic?.marital || "—" },
                    { icon: "🗣️", label: "Tongue", value: form.basic?.language || "—" },
                    { icon: "⭐", label: "Rasi", value: form.horoscope?.rasi || "—" },
                    { icon: "🌟", label: "Star", value: form.horoscope?.nakshatra || "—" },
                    { icon: "🛕", label: "Religion", value: form.religion?.religion || "—" },
                    { icon: "🏷️", label: "Caste", value: form.religion?.caste || "—" },
                    { icon: "🎓", label: "Education", value: form.education?.degree || "—" },
                    { icon: "💼", label: "Profession", value: form.career?.jobTitle || "—" },
                    { icon: "💰", label: "Income", value: form.career?.salary ? `₹${fmt(form.career.salary)} p.a.` : "—" },
                    { icon: "🏡", label: "Native Place", value: form.location?.nativePlace || "—" },
                    { icon: "📍", label: "Current Place", value: form.location?.currentPlace || "—" },
                    { icon: "🎨", label: "Color", value: form.basic?.color || "—" }
                  ].map(({ icon, label, value }) => (
                    <div key={label} className="flex gap-2 bg-[#fdf1f6] border border-[#f8d7e6] rounded-xl p-2 items-start">
                      <span className="text-sm shrink-0 mt-0.5">{icon}</span>
                      <div>
                        <span className="block text-[9px] font-bold text-maroon-600 uppercase tracking-wide">
                          {label}
                        </span>
                        <span className="block text-xs font-semibold text-slate-800 leading-tight">
                          {value}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-rose-100 to-transparent my-4" />

                {/* bio */}
                <div className="w-full bg-[#fff8fb] border border-[#f8d7e6] rounded-xl p-3 text-xs text-slate-600 italic text-left min-h-12 leading-relaxed">
                  {form.about || "No bio provided."}
                </div>

                {/* contact details */}
                <div className="flex flex-wrap gap-2 justify-center w-full mt-1">
                  <span className="bg-gradient-to-r from-rose-50 to-[#fff8e1] border border-rose-200 rounded-full px-3 py-1 text-xs font-bold text-maroon-800 shadow-sm flex items-center gap-1">
                    📞 {user?.mobile || "—"}
                  </span>
                  <span className="bg-gradient-to-r from-rose-50 to-[#fff8e1] border border-rose-200 rounded-full px-3 py-1 text-xs font-bold text-maroon-800 shadow-sm flex items-center gap-1">
                    ✉️ {user?.email || "—"}
                  </span>
                </div>

                <div className="text-[9px] text-[#e0a0b5] font-black uppercase tracking-wider mt-4">
                  MatriMonial • Find Your Perfect Match
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-3 mt-4">
              <button
                type="button"
                onClick={downloadCard}
                disabled={downloading}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 text-white font-bold py-3 text-sm transition hover:bg-blue-700 shadow-md disabled:opacity-50"
              >
                {downloading ? <Spinner size="sm" className="border-white/40 border-t-white" /> : <Download size={16} />}
                {downloading ? "Generating..." : "Download as PNG"}
              </button>
              {isEditMode && (
                <button
                  type="button"
                  onClick={submit}
                  disabled={saving}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-maroon-600 text-white font-bold py-3 text-sm transition hover:bg-maroon-700 shadow-md disabled:opacity-50"
                >
                  <Save size={16} /> {user?.isProfileSubmitted ? "Complete Editing" : "Complete Profile"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
