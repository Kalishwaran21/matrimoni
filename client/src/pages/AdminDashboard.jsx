import React, { useEffect, useRef, useState } from "react";
import { IndianRupee, ShieldCheck, Upload, UserCheck, Users, TrendingUp, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import StatCard from "../components/StatCard";
import { FullPageSpinner } from "../components/Spinner";
import { api } from "../services/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get("/admin/dashboard").then(({ data }) => setStats(data));
  }, []);

  if (!stats) return <FullPageSpinner />;

  const cards = [
    { label: "Total Users", value: stats.totalUsers ?? 0, icon: Users, color: "blue" },
    { label: "Active Users", value: stats.activeUsers ?? 0, icon: UserCheck, color: "emerald" },
    { label: "Premium Users", value: stats.premiumUsers ?? 0, icon: ShieldCheck, color: "amber" },
    { label: "Revenue", value: `Rs.${(stats.revenue ?? 0).toLocaleString("en-IN")}`, icon: IndianRupee, color: "maroon" }
  ];

  return (
    <div className="grid gap-6 animate-fade-up">
      <div>
        <p className="label">Admin</p>
        <h1 className="mt-2 text-3xl font-black text-slate-950">Dashboard</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => <StatCard key={c.label} {...c} />)}
      </div>

      {stats.pendingInterests > 0 && (
        <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
          <TrendingUp size={20} className="text-amber-600" />
          <p className="font-semibold text-amber-900">
            {stats.pendingInterests} pending interests awaiting response.
          </p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Manage Users", href: "/admin/users", desc: "Block / unblock profiles" },
          { label: "View Reports", href: "/admin/reports", desc: "Incomplete profiles & flags" },
          { label: "Analytics", href: "/admin/analytics", desc: "Revenue over time" }
        ].map(({ label, href, desc }) => (
          <a key={label} href={href} className="panel card-hover block no-underline">
            <p className="font-black text-slate-950">{label}</p>
            <p className="mt-1 text-sm text-slate-500">{desc}</p>
          </a>
        ))}
      </div>

      <AdminPricingSettings />
      <ImportProfilesPanel />
    </div>
  );
}

function AdminPricingSettings() {
  const [settings, setSettings] = useState({ silverPrice: 500, goldPrice: 1500, diamondPrice: 2500 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/admin/settings").then(({ data }) => {
      if (data.settings) setSettings(data.settings);
    });
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put("/admin/settings", settings);
      alert("Settings updated successfully!");
    } catch {
      alert("Failed to update settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="panel mt-4">
      <h2 className="text-xl font-black text-slate-950 mb-4">Subscription Pricing (Rs.)</h2>
      <form onSubmit={handleUpdate} className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="label">Silver Price</label>
          <input type="number" className="input mt-1" value={settings.silverPrice}
            onChange={e => setSettings({ ...settings, silverPrice: Number(e.target.value) })} required />
        </div>
        <div>
          <label className="label">Gold Price</label>
          <input type="number" className="input mt-1" value={settings.goldPrice}
            onChange={e => setSettings({ ...settings, goldPrice: Number(e.target.value) })} required />
        </div>
        <div>
          <label className="label">Diamond Price</label>
          <input type="number" className="input mt-1" value={settings.diamondPrice}
            onChange={e => setSettings({ ...settings, diamondPrice: Number(e.target.value) })} required />
        </div>
        <div className="sm:col-span-3 flex justify-end mt-2">
          <button type="submit" className="btn-primary py-2 px-6" disabled={loading}>
            {loading ? "Saving..." : "Save Prices"}
          </button>
        </div>
      </form>
    </div>
  );
}

function ImportProfilesPanel() {
  const fileRef = useRef(null);
  const [step, setStep] = useState("idle");
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [fileName, setFileName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [profiles, setProfiles] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) { setFileName(file.name); setStep("idle"); setPreview(null); setResult(null); }
  };

  const handleVerify = async () => {
    const file = fileRef.current?.files[0];
    if (!file) return alert("Please select a JSON file first.");
    if (!file.name.endsWith(".json")) return alert("Only .json files are accepted.");
    setStep("previewing"); setErrorMsg("");
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed)) throw new Error("JSON must be an array of profiles.");
      setProfiles(parsed);
      const { data } = await api.post("/admin/import-preview", { profiles: parsed });
      setPreview(data); setStep("preview_done");
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || "Preview failed.");
      setStep("error");
    }
  };

  const handleImport = async () => {
    if (!profiles) return;
    setStep("importing");
    try {
      const { data } = await api.post("/admin/import-profiles", { profiles });
      setResult(data); setStep("done");
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || "Import failed.");
      setStep("error");
    }
  };

  const reset = () => {
    setStep("idle"); setPreview(null); setResult(null);
    setProfiles(null); setFileName("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const stepLabels = ["1. Select File", "2. Verify Data", "3. Confirm Import"];
  const stepActive = (i) => {
    if (i === 0) return step === "idle" || step === "error";
    if (i === 1) return step === "previewing" || step === "preview_done";
    if (i === 2) return step === "importing" || step === "done";
    return false;
  };
  const stepDone = (i) => {
    if (i === 0) return step !== "idle" && step !== "error";
    if (i === 1) return step === "importing" || step === "done";
    return false;
  };

  return (
    <div className="panel mt-4">
      <h2 className="text-xl font-black text-slate-950 mb-1 flex items-center gap-2">
        <Upload size={20} className="text-maroon-700" />
        Import Scraped Profiles
      </h2>
      <p className="text-sm text-slate-500 mb-5">
        Upload a <strong>scraped_profiles_full.json</strong> file. Verify data first, then confirm import.
      </p>

      {/* Step indicators */}
      <div className="flex items-center gap-2 mb-6">
        {stepLabels.map((s, i) => (
          <React.Fragment key={s}>
            <div className={`flex items-center gap-1.5 text-xs font-bold whitespace-nowrap ${stepDone(i) ? "text-emerald-600" : stepActive(i) ? "text-maroon-700" : "text-slate-400"}`}>
              <span className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-black ${stepDone(i) ? "bg-emerald-100 text-emerald-700" : stepActive(i) ? "bg-rose-100 text-maroon-700" : "bg-slate-100 text-slate-400"}`}>
                {stepDone(i) ? "v" : i + 1}
              </span>
              <span className="hidden sm:inline">{s.split(". ")[1]}</span>
            </div>
            {i < 2 && <div className="flex-1 h-px bg-slate-200" />}
          </React.Fragment>
        ))}
      </div>

      {/* STEP 1: File picker */}
      {(step === "idle" || step === "error") && (
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <label className="flex-1 cursor-pointer rounded-xl border-2 border-dashed border-rose-200 bg-rose-50/50 hover:bg-rose-50 px-5 py-4 text-center transition">
            <Upload size={24} className="mx-auto mb-1 text-rose-400" />
            <p className="text-sm font-semibold text-slate-700">{fileName || "Click to select JSON file"}</p>
            <p className="text-xs text-slate-400 mt-1">scraped_profiles_full.json</p>
            <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleFileChange} />
          </label>
          <button onClick={handleVerify} className="btn-primary px-6 py-3 shrink-0">Verify Data</button>
        </div>
      )}

      {/* STEP 1b: Spinning */}
      {step === "previewing" && (
        <div className="flex items-center gap-3 py-6 text-slate-500 text-sm">
          <span className="h-5 w-5 rounded-full border-2 border-maroon-600 border-t-transparent animate-spin" />
          Analysing and mapping profiles...
        </div>
      )}

      {/* STEP 2: Preview table */}
      {step === "preview_done" && preview && (
        <div className="space-y-4">
          {/* Count summary */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl bg-slate-50 border p-3">
              <p className="text-2xl font-black text-slate-800">{preview.total}</p>
              <p className="text-xs text-slate-400 mt-0.5">Total in file</p>
            </div>
            <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3">
              <p className="text-2xl font-black text-emerald-700">{preview.valid}</p>
              <p className="text-xs text-slate-400 mt-0.5">Will be imported</p>
            </div>
            <div className="rounded-xl bg-amber-50 border border-amber-100 p-3">
              <p className="text-2xl font-black text-amber-600">{preview.invalid}</p>
              <p className="text-xs text-slate-400 mt-0.5">Will be skipped</p>
            </div>
          </div>

          {/* Sample data table */}
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Sample of 5 mapped profiles — verify the data looks correct
          </p>
          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-xs">
              <thead className="bg-slate-50">
                <tr>
                  {["ID", "Name", "Gender", "Age", "Religion", "Caste", "Education", "City", "Rasi", "Phone"].map(h => (
                    <th key={h} className="px-3 py-2 text-left font-bold text-slate-600 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.sampleMapped.map((p, i) => (
                  <tr key={i} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-3 py-2 text-slate-400 font-mono">{p.memberId}</td>
                    <td className="px-3 py-2 font-semibold text-slate-800">{p.name}</td>
                    <td className="px-3 py-2">{p.gender}</td>
                    <td className="px-3 py-2">{p.age}</td>
                    <td className="px-3 py-2">{p.religion}</td>
                    <td className="px-3 py-2">{p.caste}</td>
                    <td className="px-3 py-2">{p.education}</td>
                    <td className="px-3 py-2">{p.city}</td>
                    <td className="px-3 py-2">{p.rasi}</td>
                    <td className="px-3 py-2 font-mono">{p.phone}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Skipped reasons */}
          {preview.invalidReasons?.length > 0 && (
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Sample of skipped profiles (reason shown)
              </p>
              {preview.invalidReasons.map((r, i) => (
                <div key={i} className="flex gap-3 rounded-lg bg-amber-50 border border-amber-100 px-3 py-2 text-xs mb-1">
                  <span className="font-mono text-slate-400">{r.member_id}</span>
                  <span className="font-semibold text-slate-700">{r.name}</span>
                  <span className="text-amber-600 ml-auto">{r.reason}</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3 pt-1 flex-wrap">
            <button onClick={reset} className="btn-secondary px-5 py-2 text-sm">
              Choose Different File
            </button>
            <button onClick={handleImport} className="btn-primary px-6 py-2 text-sm">
              Confirm and Import {preview.valid} Profiles
            </button>
          </div>
        </div>
      )}

      {/* STEP 3a: Importing spinner */}
      {step === "importing" && (
        <div className="flex items-center gap-3 py-6 text-slate-500 text-sm">
          <span className="h-5 w-5 rounded-full border-2 border-maroon-600 border-t-transparent animate-spin" />
          Importing {preview?.valid} profiles into the database... please wait.
        </div>
      )}

      {/* STEP 3b: Done result */}
      {step === "done" && result && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle size={20} className="text-emerald-600" />
            <p className="font-black text-emerald-800">Import Complete!</p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl bg-white border border-emerald-100 p-3">
              <p className="text-2xl font-black text-emerald-700">{result.imported}</p>
              <p className="text-xs text-slate-400 mt-0.5">Imported</p>
            </div>
            <div className="rounded-xl bg-white border border-amber-100 p-3">
              <p className="text-2xl font-black text-amber-600">{result.skipped}</p>
              <p className="text-xs text-slate-400 mt-0.5">Skipped</p>
            </div>
            <div className="rounded-xl bg-white border border-red-100 p-3">
              <p className="text-2xl font-black text-red-600">{result.errors}</p>
              <p className="text-xs text-slate-400 mt-0.5">Errors</p>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-3 text-center">Total processed: {result.total} profiles</p>
          <button onClick={reset} className="btn-secondary w-full mt-4 text-sm">Import Another File</button>
        </div>
      )}

      {/* Error state */}
      {step === "error" && (
        <div className="mt-3 rounded-2xl border border-red-200 bg-red-50 p-4 flex items-start gap-3">
          <XCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-red-800">Failed</p>
            <p className="text-sm text-red-600 mt-0.5">{errorMsg}</p>
            <button onClick={reset} className="mt-2 text-xs font-bold text-red-700 underline">Try Again</button>
          </div>
        </div>
      )}

      <div className="mt-5 flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-100 p-3">
        <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700">
          <strong>Note:</strong> Duplicate profiles are automatically skipped. Safe to run multiple times.
          Contact details of imported profiles are hidden from Free users — Premium plan required to view phone numbers.
        </p>
      </div>
    </div>
  );
}
