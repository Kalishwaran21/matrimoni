import React, { useEffect, useState } from "react";
import PlanCard from "../components/PlanCard";
import { FullPageSpinner } from "../components/Spinner";
import { toast } from "../components/Toast";
import { api } from "../services/api";
import { plans as fallbackPlans } from "../utils/constants";
import { Check } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

const comparison = [
  { feature: "Create Profile", free: true, silver: true, gold: true, diamond: true },
  { feature: "Search Matches", free: true, silver: true, gold: true, diamond: true },
  { feature: "Send Interests / day", free: "5", silver: "10", gold: "15", diamond: "Unlimited" },
  { feature: "View Contacts & Horoscopes / day", free: false, silver: false, gold: "5", diamond: "20" },
  { feature: "Real-time Chat", free: false, silver: "After Accept", gold: "After Accept", diamond: "Direct Chat" },
  { feature: "Profile Boost", free: false, silver: false, gold: true, diamond: true }
];

function Cell({ val }) {
  if (val === true) return <Check size={18} className="mx-auto text-maroon-600" />;
  if (val === false) return <span className="mx-auto block text-center text-slate-300">—</span>;
  return <span className="block text-center text-xs font-semibold text-amber-700">{val}</span>;
}

export default function Pricing() {
  const { t } = useLanguage();
  const [plans, setPlans] = useState(fallbackPlans);
  const [loading, setLoading] = useState(true);

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
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <FullPageSpinner />;

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-maroon-700 to-maroon-900 py-20 text-white text-center">
        <div className="container-pad">
          <p className="label text-maroon-300">{t("pricingHeroTag")}</p>
          <h1 className="mt-3 text-4xl font-black sm:text-5xl">{t("pricingHeroTitle")}</h1>
          <p className="mt-4 text-maroon-200 max-w-lg mx-auto">
            {t("pricingHeroDesc")}
          </p>
        </div>
      </section>

      {/* Plan cards */}
      <section className="bg-[#fff8fa] py-20">
        <div className="container-pad grid gap-6 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <PlanCard key={plan.name} plan={plan} />
          ))}
        </div>
      </section>

      {/* Feature comparison */}
      <section className="bg-white py-16">
        <div className="container-pad max-w-4xl mx-auto">
          <p className="label text-center">{t("pricingCompareTag")}</p>
          <h2 className="mt-3 section-title text-center mb-10">{t("pricingCompareTitle")}</h2>
          <div className="overflow-x-auto panel p-0">
            <table className="w-full text-sm min-w-[480px]">
              <thead>
                <tr className="border-b border-rose-100 bg-rose-50">
                  <th className="py-4 pl-6 text-left font-semibold text-slate-700">{t("pricingFeature")}</th>
                  {["Free", "Silver", "Gold", "Diamond"].map((p) => (
                    <th key={p} className="py-4 px-4 text-center font-black text-slate-950">{t(p)}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {comparison.map(({ feature, free, silver, gold, diamond }) => (
                  <tr key={feature} className="hover:bg-slate-50">
                    <td className="py-3.5 pl-6 font-medium text-slate-700">{t(feature)}</td>
                    <td className="py-3.5 px-4"><Cell val={typeof free === "string" ? t(free) : free} /></td>
                    <td className="py-3.5 px-4"><Cell val={typeof silver === "string" ? t(silver) : silver} /></td>
                    <td className="py-3.5 px-4"><Cell val={typeof gold === "string" ? t(gold) : gold} /></td>
                    <td className="py-3.5 px-4"><Cell val={typeof diamond === "string" ? t(diamond) : diamond} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
}
