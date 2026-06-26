import React, { useEffect, useState } from "react";
import { Crown, Zap } from "lucide-react";
import PlanCard from "../components/PlanCard";
import { FullPageSpinner } from "../components/Spinner";
import { toast } from "../components/Toast";
import { api } from "../services/api";
import { plans as fallbackPlans } from "../utils/constants";
import { useAuth } from "../context/AuthContext";

// Load Razorpay checkout script dynamically
function loadRazorpay() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function Subscription() {
  const { user } = useAuth();
  const [plans, setPlans] = useState(fallbackPlans);
  const [razorpayKey, setRazorpayKey] = useState("");
  const [loading, setLoading] = useState(true);
  const [processingPlan, setProcessingPlan] = useState(null);

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
      if (data.razorpayKey) setRazorpayKey(data.razorpayKey);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSelect = async (planName) => {
    if (planName === "Free") {
      toast.info("You're already on the Free plan!");
      return;
    }

    setProcessingPlan(planName);

    try {
      // 1. Create Razorpay order on server
      const { data } = await api.post("/subscription/order", { plan: planName });
      const order = data.order;

      if (!order) {
        toast.error("Could not create payment order. Check Razorpay config.");
        setProcessingPlan(null);
        return;
      }

      // 2. Load Razorpay script
      const loaded = await loadRazorpay();
      if (!loaded) {
        toast.error("Razorpay failed to load. Check your internet connection.");
        setProcessingPlan(null);
        return;
      }

      // 3. Open Razorpay checkout
      const rzp = new window.Razorpay({
        key: razorpayKey,
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        name: "Atamio Matrimony",
        description: `${planName} Membership`,
        theme: { color: "#9f1239" },
        prefill: {
          name: user?.fullName || "",
          email: user?.email || ""
        },
        handler: async (response) => {
          // 4. Verify payment on server
          try {
            await api.post("/subscription/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan: planName
            });
            toast.success(`🎉 ${planName} plan activated successfully!`);
          } catch {
            toast.error("Payment verification failed. Contact support.");
          } finally {
            setProcessingPlan(null);
          }
        },
        modal: {
          ondismiss: () => {
            toast.info("Payment cancelled.");
            setProcessingPlan(null);
          }
        }
      });

      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to start payment. Try again.");
      setProcessingPlan(null);
    }
  };

  if (loading) return <FullPageSpinner />;

  return (
    <div className="grid gap-8 animate-fade-up">
      {/* Header */}
      <div className="text-center">
        <p className="label">Membership</p>
        <h1 className="mt-2 text-3xl font-black text-slate-950">
          Upgrade Your <span className="text-maroon-700">Atamio</span> Experience
        </h1>
        <p className="mt-3 text-sm text-slate-500 max-w-lg mx-auto">
          Unlock premium features to connect faster, chat freely, and stand out to potential matches.
        </p>
      </div>

      {/* Current plan indicator */}
      {user?.isPremium && (
        <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
          <Crown size={20} className="text-amber-600" />
          <p className="font-semibold text-amber-900">
            You're on a Premium plan. Enjoy full access!
          </p>
          <Zap size={20} className="text-amber-600 ml-auto" />
        </div>
      )}

      {/* Plan cards */}
      <div className="grid gap-6 md:grid-cols-2 max-w-3xl mx-auto">
        {plans.map((plan) => (
          <div key={plan.name} className={processingPlan === plan.name ? "opacity-70 pointer-events-none" : ""}>
            <PlanCard
              plan={plan}
              onSelect={handleSelect}
            />
          </div>
        ))}
      </div>

      {/* Payment note */}
      <p className="text-center text-xs text-slate-400">
        Payments are processed securely via Razorpay. All prices are in Indian Rupees (₹) and include GST.
      </p>
    </div>
  );
}
