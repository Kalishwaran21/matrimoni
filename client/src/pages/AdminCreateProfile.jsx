import React, { useState } from "react";
import { Save, UserPlus, ShieldAlert, ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { toast } from "../components/Toast";
import Spinner from "../components/Spinner";
import { DATA } from "../utils/constants";

export default function AdminCreateProfile() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // User credentials
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [gender, setGender] = useState("");

  // Profile data
  const [basic, setBasic] = useState({
    name: "", age: "", dob: "", maritalStatus: "", height: "", weight: "", physicalStatus: "", color: ""
  });
  const [religion, setReligion] = useState({
    religion: "", caste: "", subCaste: "", gothram: "", motherTongue: ""
  });
  const [location, setLocation] = useState({
    country: "", state: "", city: ""
  });
  const [education, setEducation] = useState({
    degree: "", college: ""
  });
  const [career, setCareer] = useState({
    profession: "", jobTitle: "", company: "", salary: ""
  });
  const [family, setFamily] = useState({
    familyType: "", familyValues: "", familyStatus: "", fatherOccupation: "", motherOccupation: "", siblings: ""
  });
  const [assets, setAssets] = useState({
    house: "", land: "", totalValue: ""
  });
  const [horoscope, setHoroscope] = useState({
    rasi: "", nakshatra: "", dosham: ""
  });
  const [about, setAbout] = useState("");

  const updateSection = (section, field, value) => {
    const setters = {
      basic: setBasic,
      religion: setReligion,
      location: setLocation,
      education: setEducation,
      career: setCareer,
      family: setFamily,
      assets: setAssets,
      horoscope: setHoroscope
    };
    if (setters[section]) {
      setters[section]((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (step === 1) {
      if (!email || !password || !fullName || !mobile || !gender) {
        return toast.error("Please fill all user registration fields.");
      }
      // Prefill profile basic name/gender with user input
      setBasic((prev) => ({ ...prev, name: fullName, gender }));
    }
    setStep((prev) => prev + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBack = () => {
    setStep((prev) => prev - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      email,
      password,
      fullName,
      mobile,
      gender,
      profileData: {
        basic,
        religion,
        location,
        education,
        career,
        family,
        assets,
        horoscope,
        about
      }
    };

    try {
      await api.post("/admin/users/create", payload);
      toast.success("Client profile created and pre-verified successfully!");
      navigate("/admin/users");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create client profile.");
    } finally {
      setLoading(false);
    }
  };

  // Caste / State helper bindings
  const availableCastes = DATA.castes[religion.religion] || ["Others"];
  const availableStates = DATA.statesByCountry[location.country] || ["Other"];
  const availableStars = DATA.rasiData[horoscope.rasi] || [];

  return (
    <div className="mx-auto max-w-4xl animate-fade-up">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between border-b border-rose-100 pb-5">
        <div>
          <h1 className="text-2xl font-black text-slate-950 flex items-center gap-2">
            <UserPlus className="text-maroon-600" /> Create Client Profile
          </h1>
          <p className="text-sm text-slate-400 mt-1">Register and build a verified profile directly on behalf of a client.</p>
        </div>
        <Link to="/admin/users" className="btn-secondary flex items-center gap-1">
          <ArrowLeft size={15} /> Back to Users
        </Link>
      </div>

      {/* Step Indicators */}
      <div className="mb-8 grid grid-cols-4 gap-2 text-center text-xs font-bold text-slate-400">
        <div className={`rounded-lg py-2 ${step === 1 ? "bg-maroon-600 text-white" : "bg-slate-100 text-slate-600"}`}>1. Credentials</div>
        <div className={`rounded-lg py-2 ${step === 2 ? "bg-maroon-600 text-white" : "bg-slate-100 text-slate-600"}`}>2. Personal Details</div>
        <div className={`rounded-lg py-2 ${step === 3 ? "bg-maroon-600 text-white" : "bg-slate-100 text-slate-600"}`}>3. Family & Assets</div>
        <div className={`rounded-lg py-2 ${step === 4 ? "bg-maroon-600 text-white" : "bg-slate-100 text-slate-600"}`}>4. Horoscope & About</div>
      </div>

      <form onSubmit={step === 4 ? handleSubmit : handleNext} className="panel gap-6 flex flex-col">
        {/* STEP 1: Registration Credentials */}
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
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
          </div>
        )}

        {/* STEP 2: Personal & Religion & Location details */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            {/* Basic section */}
            <div>
              <h3 className="text-lg font-bold text-maroon-800 border-b border-rose-50 pb-2 mb-4">Personal Details</h3>
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                <label className="flex flex-col gap-1.5">
                  <span className="label">Age *</span>
                  <input
                    className="field"
                    type="number"
                    required
                    value={basic.age}
                    onChange={(e) => updateSection("basic", "age", e.target.value)}
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="label">Date of Birth (YYYY-MM-DD) *</span>
                  <input
                    className="field"
                    type="date"
                    required
                    value={basic.dob}
                    onChange={(e) => updateSection("basic", "dob", e.target.value)}
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="label">Marital Status *</span>
                  <select
                    className="field"
                    required
                    value={basic.maritalStatus}
                    onChange={(e) => updateSection("basic", "maritalStatus", e.target.value)}
                  >
                    <option value="">Select Status</option>
                    {DATA.maritalStatus.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="label">Height (cm) *</span>
                  <input
                    className="field"
                    type="number"
                    required
                    value={basic.height}
                    onChange={(e) => updateSection("basic", "height", e.target.value)}
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="label">Physical Status *</span>
                  <select
                    className="field"
                    required
                    value={basic.physicalStatus}
                    onChange={(e) => updateSection("basic", "physicalStatus", e.target.value)}
                  >
                    <option value="">Select Status</option>
                    {DATA.physicalStatus.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="label">Complexion *</span>
                  <select
                    className="field"
                    required
                    value={basic.color}
                    onChange={(e) => updateSection("basic", "color", e.target.value)}
                  >
                    <option value="">Select Complexion</option>
                    {DATA.colors.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </label>
              </div>
            </div>

            {/* Religion Section */}
            <div>
              <h3 className="text-lg font-bold text-maroon-800 border-b border-rose-50 pb-2 mb-4">Religion & Mother Tongue</h3>
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                <label className="flex flex-col gap-1.5">
                  <span className="label">Religion *</span>
                  <select
                    className="field"
                    required
                    value={religion.religion}
                    onChange={(e) => updateSection("religion", "religion", e.target.value)}
                  >
                    <option value="">Select Religion</option>
                    {DATA.religions.slice(0, -1).map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="label">Caste *</span>
                  <select
                    className="field"
                    required
                    value={religion.caste}
                    onChange={(e) => updateSection("religion", "caste", e.target.value)}
                  >
                    <option value="">Select Caste</option>
                    {availableCastes.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="label">Subcaste</span>
                  <input
                    className="field"
                    value={religion.subCaste}
                    onChange={(e) => updateSection("religion", "subCaste", e.target.value)}
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="label">Mother Tongue *</span>
                  <select
                    className="field"
                    required
                    value={religion.motherTongue}
                    onChange={(e) => updateSection("religion", "motherTongue", e.target.value)}
                  >
                    <option value="">Select Mother Tongue</option>
                    {DATA.motherTongue.map((lang) => <option key={lang} value={lang}>{lang}</option>)}
                  </select>
                </label>
              </div>
            </div>

            {/* Location Section */}
            <div>
              <h3 className="text-lg font-bold text-maroon-800 border-b border-rose-50 pb-2 mb-4">Location Details</h3>
              <div className="grid gap-4 sm:grid-cols-3">
                <label className="flex flex-col gap-1.5">
                  <span className="label">Country *</span>
                  <select
                    className="field"
                    required
                    value={location.country}
                    onChange={(e) => updateSection("location", "country", e.target.value)}
                  >
                    <option value="">Select Country</option>
                    {DATA.locations.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="label">State *</span>
                  <select
                    className="field"
                    required
                    value={location.state}
                    onChange={(e) => updateSection("location", "state", e.target.value)}
                  >
                    <option value="">Select State</option>
                    {availableStates.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="label">City *</span>
                  <input
                    className="field"
                    required
                    value={location.city}
                    onChange={(e) => updateSection("location", "city", e.target.value)}
                  />
                </label>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Education, Family & Assets */}
        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            {/* Education & Career */}
            <div>
              <h3 className="text-lg font-bold text-maroon-800 border-b border-rose-50 pb-2 mb-4">Education & Career</h3>
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                <label className="flex flex-col gap-1.5">
                  <span className="label">Education *</span>
                  <select
                    className="field"
                    required
                    value={education.degree}
                    onChange={(e) => updateSection("education", "degree", e.target.value)}
                  >
                    <option value="">Select Degree</option>
                    {DATA.education.map((e) => <option key={e} value={e}>{e}</option>)}
                  </select>
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="label">Profession *</span>
                  <select
                    className="field"
                    required
                    value={career.profession}
                    onChange={(e) => updateSection("career", "profession", e.target.value)}
                  >
                    <option value="">Select Profession</option>
                    {DATA.professions.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="label">Job Title *</span>
                  <input
                    className="field"
                    required
                    value={career.jobTitle}
                    onChange={(e) => updateSection("career", "jobTitle", e.target.value)}
                    placeholder="E.g., Software Architect"
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="label">Working Company</span>
                  <input
                    className="field"
                    value={career.company}
                    onChange={(e) => updateSection("career", "company", e.target.value)}
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="label">Annual Salary (₹ p.a.)</span>
                  <input
                    className="field"
                    type="number"
                    value={career.salary}
                    onChange={(e) => updateSection("career", "salary", e.target.value)}
                  />
                </label>
              </div>
            </div>

            {/* Family Details */}
            <div>
              <h3 className="text-lg font-bold text-maroon-800 border-b border-rose-50 pb-2 mb-4">Family Background</h3>
              <div className="grid gap-4 sm:grid-cols-3">
                <label className="flex flex-col gap-1.5">
                  <span className="label">Family Type *</span>
                  <select
                    className="field"
                    required
                    value={family.familyType}
                    onChange={(e) => updateSection("family", "familyType", e.target.value)}
                  >
                    <option value="">Select Family Type</option>
                    <option value="Joint">Joint Family</option>
                    <option value="Nuclear">Nuclear Family</option>
                    <option value="Others">Others</option>
                  </select>
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="label">Family Values *</span>
                  <select
                    className="field"
                    required
                    value={family.familyValues}
                    onChange={(e) => updateSection("family", "familyValues", e.target.value)}
                  >
                    <option value="">Select Values</option>
                    <option value="Orthodox">Orthodox</option>
                    <option value="Traditional">Traditional</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Liberal">Liberal</option>
                  </select>
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="label">Family Status *</span>
                  <select
                    className="field"
                    required
                    value={family.familyStatus}
                    onChange={(e) => updateSection("family", "familyStatus", e.target.value)}
                  >
                    <option value="">Select Status</option>
                    <option value="Middle Class">Middle Class</option>
                    <option value="Upper Middle Class">Upper Middle Class</option>
                    <option value="Rich">Rich</option>
                    <option value="Affluent">Affluent</option>
                  </select>
                </label>
              </div>
            </div>

            {/* Assets Details */}
            <div>
              <h3 className="text-lg font-bold text-maroon-800 border-b border-rose-50 pb-2 mb-4">Assets Details</h3>
              <div className="grid gap-4 sm:grid-cols-3">
                <label className="flex flex-col gap-1.5">
                  <span className="label">House Ownership</span>
                  <select
                    className="field"
                    value={assets.house}
                    onChange={(e) => updateSection("assets", "house", e.target.value)}
                  >
                    <option value="">Select Ownership</option>
                    <option value="Own House">Own House</option>
                    <option value="Rented House">Rented House</option>
                    <option value="None / Others">None / Others</option>
                  </select>
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="label">Land owned Details</span>
                  <input
                    className="field"
                    value={assets.land}
                    onChange={(e) => updateSection("assets", "land", e.target.value)}
                    placeholder="E.g., 2 Acres / 10 Cents"
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="label">Total Asset Value</span>
                  <input
                    className="field"
                    value={assets.totalValue}
                    onChange={(e) => updateSection("assets", "totalValue", e.target.value)}
                    placeholder="E.g., ₹50 Lakhs / ₹1 Crore"
                  />
                </label>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Horoscope & About */}
        {step === 4 && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="text-lg font-bold text-maroon-800 border-b border-rose-50 pb-2 mb-4">Horoscope & Bio</h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <label className="flex flex-col gap-1.5">
                <span className="label">Rasi *</span>
                <select
                  className="field"
                  required
                  value={horoscope.rasi}
                  onChange={(e) => updateSection("horoscope", "rasi", e.target.value)}
                >
                  <option value="">Select Rasi</option>
                  {Object.keys(DATA.rasiData).map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="label">Natchathiram *</span>
                <select
                  className="field"
                  required
                  value={horoscope.nakshatra}
                  onChange={(e) => updateSection("horoscope", "nakshatra", e.target.value)}
                >
                  <option value="">Select Star</option>
                  {availableStars.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="label">Dosham *</span>
                <select
                  className="field"
                  required
                  value={horoscope.dosham}
                  onChange={(e) => updateSection("horoscope", "dosham", e.target.value)}
                >
                  <option value="">Select Dosham</option>
                  {DATA.doshamTypes.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </label>
            </div>
            <label className="flex flex-col gap-1.5 mt-2">
              <span className="label">About Yourself / Bio</span>
              <textarea
                className="field min-h-24 resize-y"
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                placeholder="Write a brief profile description..."
              />
            </label>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between border-t border-rose-50 pt-5 mt-4">
          {step > 1 ? (
            <button type="button" onClick={handleBack} className="btn-secondary flex items-center gap-1">
              <ArrowLeft size={16} /> Back
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button type="submit" className="btn-primary flex items-center gap-1">
              Next <ArrowRight size={16} />
            </button>
          ) : (
            <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2 !bg-gradient-to-r !from-emerald-500 !to-teal-600">
              {loading ? <Spinner size="sm" /> : <Save size={16} />} Save Client Profile
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
