import React, { useEffect, useState } from "react";
import { Settings, Save, Upload } from "lucide-react";
import { api } from "../services/api";
import { toast } from "../components/Toast";

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingQr, setUploadingQr] = useState(false);
  const [settings, setSettings] = useState({
    silverPrice: 500,
    goldPrice: 1500,
    diamondPrice: 2500,
    gpayQrUrl: "",
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
        gpayQrUrl: data.gpayQrUrl || "",
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

  const handleQrUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingQr(true);
    const formData = new FormData();
    formData.append("qrCode", file);

    try {
      const { data } = await api.post("/admin/settings/gpay-qr", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSettings({ ...settings, gpayQrUrl: data.settings.gpayQrUrl });
      toast.success("GPay QR Code updated!");
    } catch (err) {
      toast.error("Failed to upload QR code");
    } finally {
      setUploadingQr(false);
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
          <p className="text-sm text-slate-500">Configure app pricing and payment methods.</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 items-start">
        <div className="rounded-2xl border border-rose-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-black text-maroon-800 border-b border-rose-50 pb-2">Plan Pricing</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid gap-4">
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
              </label>

              <label>
                <span className="label">Diamond Plan Price (₹)</span>
                <input
                  type="number"
                  min="0"
                  required
                  className="field mt-1"
                  value={settings.diamondPrice}
                  onChange={(e) => setSettings({ ...settings, diamondPrice: Number(e.target.value) })}
                />
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

        <div className="rounded-2xl border border-rose-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-black text-maroon-800 border-b border-rose-50 pb-2">Payment Settings (GPay)</h2>
          <div className="space-y-4">
            <p className="text-sm text-slate-500">
              Upload your GPay QR code here. Users will scan this QR code to make payments, and then upload a screenshot of their successful transaction.
            </p>

            <div className="flex items-center gap-4">
              {settings.gpayQrUrl ? (
                <img src={settings.gpayQrUrl} alt="GPay QR" className="w-32 h-32 object-contain rounded-xl border border-rose-100" />
              ) : (
                <div className="w-32 h-32 bg-slate-50 border border-dashed border-slate-300 rounded-xl flex items-center justify-center text-slate-400">
                  No QR Code
                </div>
              )}
              <div>
                <label className="btn-primary cursor-pointer flex items-center gap-2 max-w-max">
                  <Upload size={16} />
                  {uploadingQr ? "Uploading..." : "Upload QR Code"}
                  <input type="file" accept="image/*" className="hidden" onChange={handleQrUpload} disabled={uploadingQr} />
                </label>
                <p className="text-xs text-slate-400 mt-2">Max file size: 5MB</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
