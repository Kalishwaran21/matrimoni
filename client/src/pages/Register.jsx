import React, { useState } from "react";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { toast } from "../components/Toast";
import Spinner from "../components/Spinner";

export default function Register() {
  const { register, loading } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    mobile: "",
    password: ""
  });
  const [showPw, setShowPw] = useState(false);

  const f = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) {
      toast.error(language === "en" ? "Password must be at least 8 characters" : "கடவுச்சொல் குறைந்தது 8 எழுத்துக்களைக் கொண்டிருக்க வேண்டும்");
      return;
    }
    try {
      await register(form);
      toast.success(language === "en" ? "Account created! Let's build your profile." : "கணக்கு உருவாக்கப்பட்டது! உங்களது சுயவிவரத்தை பூர்த்தி செய்க.");
      navigate("/profile");
    } catch (err) {
      toast.error(err.response?.data?.message || (language === "en" ? "Registration failed. Please try again." : "பதிவு தோல்வியடைந்தது. மீண்டும் முயற்சிக்கவும்."));
    }
  };

  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-[#fff8fa] px-4 py-16">
      <div className="w-full max-w-lg animate-fade-up">
        <form
          onSubmit={submit}
          className="rounded-2xl border border-rose-100 bg-white p-8 shadow-soft"
        >
          <p className="label">{t("joinFree")}</p>
          <h1 className="mt-2 text-3xl font-black text-slate-950">{t("createProfile")}</h1>
          <p className="mt-2 text-sm text-slate-500">
            {t("alreadyReg")}{" "}
            <Link to="/login" className="font-semibold text-maroon-700 hover:underline">
              {t("signInLink")}
            </Link>
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <label className="sm:col-span-2">
              <span className="label">{t("fullName")}</span>
              <input
                id="reg-name"
                className="field mt-2"
                placeholder={language === "en" ? "Your full name" : "உங்களது முழு பெயர்"}
                value={form.fullName}
                onChange={f("fullName")}
                required
              />
            </label>

            <label>
              <span className="label">{t("email")}</span>
              <input
                id="reg-email"
                className="field mt-2"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={f("email")}
                required
                autoComplete="email"
              />
            </label>

            <label>
              <span className="label">{t("mobile")}</span>
              <input
                id="reg-mobile"
                className="field mt-2"
                placeholder="+91 9000000000"
                value={form.mobile}
                onChange={f("mobile")}
                required
              />
            </label>


            <label className="sm:col-span-2">
              <span className="label">{t("password")}</span>
              <div className="relative mt-2">
                <input
                  id="reg-password"
                  className="field pr-12"
                  type={showPw ? "text" : "password"}
                  placeholder={language === "en" ? "Min 8 characters" : "குறைந்தது 8 எழுத்துக்கள்"}
                  value={form.password}
                  onChange={f("password")}
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>


            <button
              id="reg-submit"
              className="btn-primary sm:col-span-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner size="sm" className="border-white/40 border-t-white" /> {t("registering")}
                </>
              ) : (
                <>
                  <UserPlus size={17} /> {t("registerBtn")}
                </>
              )}
            </button>
          </div>

          <p className="mt-5 text-center text-xs text-slate-400 leading-5">
            {language === "en" ? "By registering you agree to our" : "பதிவு செய்வதன் மூலம் நீங்கள் எங்களது"}{" "}
            <a href="#" className="text-maroon-600 hover:underline">
              {language === "en" ? "Terms of Service" : "விதிமுறைகள் மற்றும் நிபந்தனைகள்"}
            </a>{" "}
            {language === "en" ? "and" : "மற்றும்"}{" "}
            <a href="#" className="text-maroon-600 hover:underline">
              {language === "en" ? "Privacy Policy" : "தனியுரிமைக் கொள்கை"}
            </a>
            {language === "en" ? "." : " ஆகியவற்றை ஏற்கிறீர்கள்."}
          </p>
        </form>
      </div>
    </main>
  );
}
