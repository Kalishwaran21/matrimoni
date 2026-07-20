import React, { useEffect, useState } from "react";
import { Crown, Zap, Upload, CheckCircle2, X } from "lucide-react";
import PlanCard from "../components/PlanCard";
import { FullPageSpinner } from "../components/Spinner";
import { toast } from "../components/Toast";
import { api } from "../services/api";
import { plans as fallbackPlans } from "../utils/constants";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

export default function Subscription() {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [plans, setPlans] = useState(fallbackPlans);
  const [gpayQrUrl, setGpayQrUrl] = useState("");
  const [loading, setLoading] = useState(true);
  
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [txnId, setTxnId] = useState("");
  const [screenshot, setScreenshot] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    api.get("/subscription/plans").then(({ data }) => {
      if (data.plans) {
        setPlans(
          data.plans.map((p) => ({
            ...p,
            price: p.price > 0 ? Number(p.price).toLocaleString("en-IN") : "0"
          }))
        );
      }
      if (data.gpayQrUrl) setGpayQrUrl(data.gpayQrUrl);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSelect = (planName) => {
    if (planName === "Free") {
      toast.info("You're already on the Free plan!");
      return;
    }
    const planObj = plans.find(p => p.name === planName);
    setSelectedPlan(planObj);
    setSuccessMsg("");
  };

  const submitPayment = async (e) => {
    e.preventDefault();
    if (!screenshot) {
      toast.error("Please upload the payment screenshot.");
      return;
    }
    if (!txnId) {
      toast.error("Please enter the Transaction ID.");
      return;
    }
    if (!gpayQrUrl) {
      toast.error("Admin hasn't setup GPay QR yet.");
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append("plan", selectedPlan.name);
    formData.append("transactionId", txnId);
    formData.append("screenshot", screenshot);

    try {
      await api.post("/subscription/submit", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setSuccessMsg("Payment submitted successfully! Your account will be upgraded once an admin approves it.");
      setSelectedPlan(null);
      setTxnId("");
      setScreenshot(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit payment.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <FullPageSpinner />;

  return (
    <div className="grid gap-8 animate-fade-up">
      {/* Header */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-white sm:p-12 relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none">
          <Crown size={240} className="-mr-10 -mt-10 rotate-12" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-sm font-semibold backdrop-blur-md">
            <Zap size={16} className="text-yellow-400" /> {t("upgradeTitle") || "Upgrade to Premium"}
          </p>
          <h1 className="text-3xl font-black leading-tight sm:text-5xl">
            {language === "en" ? "Unlock the full potential of your search" : "உங்கள் தேடலின் முழு திறனையும் திறக்கவும்"}
          </h1>
          <p className="mt-4 text-lg text-slate-300">
            {language === "en" ? "Connect with more matches, view contact details, and stand out." : "மேலும் தொடர்புகளுடன் இணைக, தொடர்பு விவரங்களைக் காண்க."}
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="rounded-2xl border border-green-100 bg-green-50 p-6 flex items-start gap-4">
          <CheckCircle2 className="text-green-600 mt-1" size={24} />
          <div>
            <h3 className="font-bold text-green-900">Success!</h3>
            <p className="text-green-700 mt-1">{successMsg}</p>
          </div>
        </div>
      )}

      {/* Plan Selection */}
      {!selectedPlan ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => (
            <PlanCard
              key={plan.name}
              plan={plan}
              onSelect={() => handleSelect(plan.name)}
            />
          ))}
        </div>
      ) : (
        /* Payment Flow */
        <div className="max-w-3xl mx-auto w-full">
          <div className="rounded-3xl border border-rose-100 bg-white shadow-soft overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50">
              <h2 className="text-xl font-black text-slate-900">Complete Payment</h2>
              <button onClick={() => setSelectedPlan(null)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 sm:p-10 grid gap-8 md:grid-cols-2">
              {/* Left: QR Code */}
              <div className="flex flex-col items-center justify-center text-center space-y-4 rounded-2xl bg-slate-50 p-6 border border-slate-100">
                <h3 className="font-bold text-slate-700">Scan & Pay ₹{selectedPlan.price}</h3>
                {gpayQrUrl ? (
                  <img src={gpayQrUrl} alt="GPay QR Code" className="w-48 h-48 rounded-xl border border-rose-100 shadow-sm" />
                ) : (
                  <div className="w-48 h-48 bg-slate-200 animate-pulse rounded-xl flex items-center justify-center text-slate-500 text-sm p-4">
                    Admin hasn't uploaded a QR Code yet
                  </div>
                )}
                <p className="text-sm text-slate-500">Open GPay, PhonePe, or Paytm and scan the QR code to pay.</p>
              </div>

              {/* Right: Upload Form */}
              <form onSubmit={submitPayment} className="space-y-6">
                <div>
                  <label className="label">1. Enter Transaction ID</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. T230912..."
                    className="field mt-2"
                    value={txnId}
                    onChange={(e) => setTxnId(e.target.value)}
                  />
                  <p className="text-xs text-slate-500 mt-1">Found in your payment app history.</p>
                </div>

                <div>
                  <label className="label">2. Upload Payment Screenshot</label>
                  <label className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-rose-200 bg-rose-50/50 p-6 transition-colors hover:bg-rose-50">
                    <Upload className="mb-2 text-maroon-300" size={32} />
                    <span className="text-sm font-semibold text-maroon-700">
                      {screenshot ? screenshot.name : "Click to upload image"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => setScreenshot(e.target.files[0])}
                    />
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={submitting || !gpayQrUrl}
                  className="btn-primary w-full"
                >
                  {submitting ? "Submitting..." : "Submit for Approval"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
