import React from "react";
import { Check, Sparkles, Zap } from "lucide-react";
import { Link } from "react-router-dom";

export default function PlanCard({ plan, onSelect }) {
  const isPremium = plan.name === "Premium";
  const isFree = plan.name === "Free";

  return (
    <div
      className={`relative flex flex-col overflow-hidden rounded-2xl border shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
        isPremium
          ? "border-maroon-300 bg-gradient-to-b from-maroon-50 to-white"
          : "border-rose-100 bg-white"
      }`}
    >
      {/* Popular / Best Value badge */}
      {isPremium && (
        <div className="absolute right-4 top-4">
          <span className="badge-maroon !text-xs font-black">
            <Sparkles size={10} /> Most Popular
          </span>
        </div>
      )}

      <div className="p-7">
        {/* Plan name */}
        <div
          className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl text-white text-lg font-black ${
            isPremium ? "bg-gradient-to-br from-maroon-600 to-pink-600" :
            "bg-gradient-to-br from-slate-400 to-slate-500"
          }`}
        >
          {plan.name.charAt(0)}
        </div>

        <h3 className="text-xl font-black text-slate-950">{plan.name}</h3>

        <div className="mt-3 flex items-end gap-1">
          <span className="text-4xl font-black text-slate-950">
            {isFree ? "Free" : `₹${plan.price}`}
          </span>
          {!isFree && <span className="mb-1 text-sm text-slate-500">/plan</span>}
        </div>

        {/* Features */}
        <ul className="mt-6 grid gap-3">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-center gap-2.5 text-sm text-slate-700">
              <Check
                size={15}
                className={`shrink-0 ${
                  isPremium ? "text-maroon-600" : "text-slate-400"
                }`}
              />
              {feature}
            </li>
          ))}
        </ul>
      </div>

      {/* CTA */}
      <div className="mt-auto px-7 pb-7">
        {onSelect ? (
          <button
            id={`plan-select-${plan.name.toLowerCase()}`}
            onClick={() => onSelect(plan.name)}
            className={`w-full rounded-xl py-3 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 ${
              isPremium
                ? "btn-primary"
                : "btn-secondary"
            }`}
          >
            {isFree ? "Get Started" : `Choose ${plan.name}`}
          </button>
        ) : (
          <Link
            to="/subscription"
            className={`block w-full rounded-xl py-3 text-center text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 ${
              isPremium
                ? "btn-primary"
                : "btn-secondary"
            }`}
          >
            {isFree ? "Get Started" : `Choose ${plan.name}`}
          </Link>
        )}
      </div>
    </div>
  );
}
