import React, { useState } from "react";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "../components/Toast";
import Spinner from "../components/Spinner";

export default function Register() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    mobile: "",
    password: "",
    gender: "Female"
  });
  const [showPw, setShowPw] = useState(false);

  const f = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    try {
      await register(form);
      toast.success("Account created! Let's build your profile.");
      navigate("/profile");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed. Please try again.");
    }
  };

  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-[#fff8fa] px-4 py-16">
      <div className="w-full max-w-lg animate-fade-up">
        <form
          onSubmit={submit}
          className="rounded-2xl border border-rose-100 bg-white p-8 shadow-soft"
        >
          <p className="label">Join free</p>
          <h1 className="mt-2 text-3xl font-black text-slate-950">Create your Atamio profile</h1>
          <p className="mt-2 text-sm text-slate-500">
            Already registered?{" "}
            <Link to="/login" className="font-semibold text-maroon-700 hover:underline">
              Sign in
            </Link>
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <label className="sm:col-span-2">
              <span className="label">Full Name</span>
              <input
                id="reg-name"
                className="field mt-2"
                placeholder="Your full name"
                value={form.fullName}
                onChange={f("fullName")}
                required
              />
            </label>

            <label>
              <span className="label">Email</span>
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
              <span className="label">Mobile Number</span>
              <input
                id="reg-mobile"
                className="field mt-2"
                placeholder="+91 9000000000"
                value={form.mobile}
                onChange={f("mobile")}
                required
              />
            </label>

            <label>
              <span className="label">Password</span>
              <div className="relative mt-2">
                <input
                  id="reg-password"
                  className="field pr-12"
                  type={showPw ? "text" : "password"}
                  placeholder="Min 8 characters"
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

            <label>
              <span className="label">I am a</span>
              <select
                id="reg-gender"
                className="field mt-2"
                value={form.gender}
                onChange={f("gender")}
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
            </label>

            <button
              id="reg-submit"
              className="btn-primary sm:col-span-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner size="sm" className="border-white/40 border-t-white" /> Creating account...
                </>
              ) : (
                <>
                  <UserPlus size={17} /> Register Free
                </>
              )}
            </button>
          </div>

          <p className="mt-5 text-center text-xs text-slate-400 leading-5">
            By registering you agree to our{" "}
            <a href="#" className="text-maroon-600 hover:underline">Terms of Service</a>{" "}
            and{" "}
            <a href="#" className="text-maroon-600 hover:underline">Privacy Policy</a>.
          </p>
        </form>
      </div>
    </main>
  );
}
