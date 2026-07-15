import React from "react";
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../services/api";
import { toast } from "../components/Toast";
import { KeyRound, Eye, EyeOff } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export default function ResetPassword() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [form, setForm] = useState({ token: params.get("token") || "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast.error("Passwords do not match");
      return;
    }
    if (form.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/reset-password", {
        token: form.token,
        password: form.password
      });
      toast.success(t("resetSuccess"));
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || "Reset failed. Token may have expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-[#fff8fa] min-h-[calc(100vh-4rem)] flex items-center justify-center py-16 px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <form
          onSubmit={submit}
          className="rounded-2xl border border-rose-100 bg-white p-8 shadow-soft"
        >
          {/* Icon */}
          <div className="mb-6 flex justify-center">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-maroon-50 text-maroon-700">
              <KeyRound size={28} />
            </span>
          </div>

          <p className="label text-center">{t("resetHeroTag")}</p>
          <h1 className="mt-2 text-center text-3xl font-black text-slate-950">{t("resetHeroTitle")}</h1>
          <p className="mt-3 text-center text-sm text-slate-500 leading-6">
            {t("resetHeroDesc")}
          </p>

          <div className="mt-8 grid gap-4">
            {/* Token field — pre-filled from URL if available */}
            <label>
              <span className="label">Reset Token</span>
              <input
                id="reset-token"
                className="field mt-2"
                placeholder="Paste your reset token"
                value={form.token}
                onChange={(e) => setForm({ ...form, token: e.target.value })}
                required
              />
            </label>

            {/* New password */}
            <label>
              <span className="label">{t("resetPwLabel")}</span>
              <div className="relative mt-2">
                <input
                  id="reset-password"
                  className="field pr-12"
                  type={showPw ? "text" : "password"}
                  placeholder="At least 8 characters"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>

            {/* Confirm password */}
            <label>
              <span className="label">Confirm Password</span>
              <input
                id="reset-confirm"
                className="field mt-2"
                type="password"
                placeholder="Repeat password"
                value={form.confirm}
                onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                required
              />
            </label>

            <button id="reset-submit" className="btn-primary" disabled={loading}>
              {loading ? t("resetUpdating") : t("resetSubmitBtn")}
            </button>
          </div>

          <p className="mt-6 text-center text-sm text-slate-600">
            Remember your password?{" "}
            <Link to="/login" className="font-semibold text-maroon-700 hover:underline">
              Login
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
