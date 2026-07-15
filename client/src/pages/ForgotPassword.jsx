import React, { useState } from "react";
import { Mail, ArrowRight, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import { toast } from "../components/Toast";
import Spinner from "../components/Spinner";
import { useLanguage } from "../context/LanguageContext";

export default function ForgotPassword() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [devToken, setDevToken] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/auth/forgot-password", { email });
      setSent(true);
      // Dev-only: backend returns the token when NODE_ENV !== production
      if (data.devResetToken) setDevToken(data.devResetToken);
      toast.success(t("forgotSuccess"));
    } catch (err) {
      toast.error(err.response?.data?.message || "Request failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-[#fff8fa] px-4 py-16">
      <div className="w-full max-w-md animate-fade-up">
        <div className="rounded-2xl border border-rose-100 bg-white p-8 shadow-soft">
          {/* Icon */}
          <div className="mb-6 flex justify-center">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-maroon-50 text-maroon-700">
              <Mail size={28} />
            </span>
          </div>

          <p className="label text-center">{t("forgotHeroTag")}</p>
          <h1 className="mt-2 text-center text-3xl font-black text-slate-950">{t("forgotHeroTitle")}</h1>

          {sent ? (
            <div className="mt-8 text-center">
              <CheckCircle size={40} className="mx-auto text-emerald-500 mb-4" />
              <p className="font-semibold text-slate-800">Check your email</p>
              <p className="mt-2 text-sm text-slate-500 leading-6">
                If <strong>{email}</strong> is registered, you'll receive a reset link within minutes.
              </p>

              {/* Dev helper — visible only in development */}
              {devToken && (
                <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-left">
                  <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2">
                    🛠 Dev Mode — Reset Token
                  </p>
                  <code className="block break-all text-xs text-amber-800">{devToken}</code>
                  <Link
                    to={`/reset-password?token=${devToken}`}
                    className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-maroon-700 hover:underline"
                  >
                    Reset password now <ArrowRight size={14} />
                  </Link>
                </div>
              )}

              <Link to="/login" className="mt-6 inline-block text-sm font-semibold text-maroon-700 hover:underline">
                {t("forgotBackLogin")}
              </Link>
            </div>
          ) : (
            <>
              <p className="mt-3 text-center text-sm text-slate-500 leading-6">
                {t("forgotHeroDesc")}
              </p>
              <form onSubmit={submit} className="mt-8 grid gap-4">
                <label>
                  <span className="label">{t("forgotEmailLabel")}</span>
                  <input
                    id="forgot-email"
                    className="field mt-2"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </label>
                <button id="forgot-submit" className="btn-primary" disabled={loading}>
                  {loading ? (
                    <>
                      <Spinner size="sm" className="border-white/40 border-t-white" /> {t("forgotSending")}
                    </>
                  ) : (
                    <>
                      <Mail size={17} /> {t("forgotSubmitBtn")}
                    </>
                  )}
                </button>
                <Link to="/login" className="text-center text-sm font-semibold text-maroon-700 hover:underline">
                  {t("forgotBackLogin")}
                </Link>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
