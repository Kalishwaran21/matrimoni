import React, { useEffect, useState } from "react";
import { Settings, Save } from "lucide-react";
import { api } from "../services/api";
import { toast } from "../components/Toast";

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    silverPrice: 500,
    goldPrice: 1500,
    diamondPrice: 2500,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await api.get("/settings");
      setSettings({
        silverPrice: data.silverPrice || 500,
        goldPrice: data.goldPrice || 1500,
        diamondPrice: data.diamondPrice || 2500,
      });
    } catch (err) {
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put("/settings", settings);
      toast.success("Settings saved successfully!");
    } catch (err) {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading settings...</div>;
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-2">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-maroon-100 text-maroon-700">
          <Settings size={20} />
        </span>
        <div>
          <h1 className="text-2xl font-black text-slate-900">System Settings</h1>
          <p className="text-sm text-slate-500">Configure app pricing and rules.</p>
        </div>
      </div>

      <div className="rounded-2xl border border-rose-100 bg-white p-6 shadow-sm max-w-2xl">
        <h2 className="mb-4 text-lg font-black text-maroon-800 border-b border-rose-50 pb-2">Plan Pricing</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label>
              <span className="label">Silver Plan Price (₹)</span>
              <input
                type="number"
                min="0"
                required
                className="field mt-1"
                value={settings.silverPrice}
                onChange={(e) => setSettings({ ...settings, silverPrice: Number(e.target.value) })}
              />
              <span className="text-xs text-slate-400 mt-1 block">Default: ₹500. 10 Interests/day, basic matching.</span>
            </label>

            <label>
              <span className="label">Gold Plan Price (₹)</span>
              <input
                type="number"
                min="0"
                required
                className="field mt-1"
                value={settings.goldPrice}
                onChange={(e) => setSettings({ ...settings, goldPrice: Number(e.target.value) })}
              />
              <span className="text-xs text-slate-400 mt-1 block">Default: ₹1500. 15 Interests/day, 5 contact views/day.</span>
            </label>

            <label className="sm:col-span-2">
              <span className="label">Diamond Plan Price (₹)</span>
              <input
                type="number"
                min="0"
                required
                className="field mt-1"
                value={settings.diamondPrice}
                onChange={(e) => setSettings({ ...settings, diamondPrice: Number(e.target.value) })}
              />
              <span className="text-xs text-slate-400 mt-1 block">Default: ₹2500. Unlimited Interests, 20 contact views/day, Direct Chat.</span>
            </label>
          </div>
          
          <div className="pt-4 flex justify-end">
            <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
              <Save size={16} />
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
