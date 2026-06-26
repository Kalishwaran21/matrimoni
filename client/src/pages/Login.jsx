import React, { useState } from "react";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "../components/Toast";
import Spinner from "../components/Spinner";

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    try {
      const user = await login(form);
      toast.success("Welcome back!");
      navigate(user.role === "admin" ? "/admin" : "/matches");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed. Please check your credentials.");
    }
  };

  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-[#fff8fa] px-4 py-16">
      <div className="w-full max-w-md animate-fade-up">
        <form
          onSubmit={submit}
          className="rounded-2xl border border-rose-100 bg-white p-8 shadow-soft"
        >
          <p className="label">Welcome back</p>
          <h1 className="mt-2 text-3xl font-black text-slate-950">Sign in to Atamio</h1>
          <p className="mt-2 text-sm text-slate-500">
            Don't have an account?{" "}
            <Link to="/register" className="font-semibold text-maroon-700 hover:underline">
              Register free
            </Link>
          </p>

          <div className="mt-8 grid gap-4">
            <label>
              <span className="label">Email</span>
              <input
                id="login-email"
                className="field mt-2"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                autoComplete="email"
              />
            </label>

            <label>
              <span className="label">Password</span>
              <div className="relative mt-2">
                <input
                  id="login-password"
                  className="field pr-12"
                  type={showPw ? "text" : "password"}
                  placeholder="Your password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  autoComplete="current-password"
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

            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-sm font-semibold text-maroon-700 hover:underline">
                Forgot password?
              </Link>
            </div>

            <button id="login-submit" className="btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <Spinner size="sm" className="border-white/40 border-t-white" /> Signing in...
                </>
              ) : (
                <>
                  <LogIn size={17} /> Sign In
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
