"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Crown, Zap, Building2, Rocket, X } from "lucide-react";
import { toast } from "sonner";

type Currency = "USD" | "PKR" | "EUR" | "GBP" | "AED";

const PRICES: Record<Currency, { starter: string; pro: string; enterprise: string }> = {
  USD: { starter: "$0", pro: "$49", enterprise: "$299" },
  PKR: { starter: "PKR 0", pro: "PKR 13,500", enterprise: "PKR 82,000" },
  EUR: { starter: "€0", pro: "€45", enterprise: "€275" },
  GBP: { starter: "£0", pro: "£39", enterprise: "£239" },
  AED: { starter: "AED 0", pro: "AED 180", enterprise: "AED 1,100" },
};

const PLANS = [
  {
    name: "Starter",
    icon: Rocket,
    tagline: "For individual buyers exploring opportunities",
    accent: false,
    cta: "Start Free",
    features: [
      "Browse all listings",
      "Save up to 10 deals",
      "Basic AI valuation (5/mo)",
      "Email alerts",
      "Community access",
    ],
    notIncluded: ["Priority support", "API access", "White-label", "Bulk listings"],
  },
  {
    name: "Pro",
    icon: Zap,
    tagline: "For active investors & serial acquirers",
    accent: true,
    badge: "Most Popular",
    cta: "Upgrade to Pro",
    features: [
      "Everything in Starter",
      "Unlimited saved deals",
      "Unlimited AI valuations",
      "Advanced analytics dashboard",
      "Priority support (24h)",
      "Snap-a-Listing (VLM) — unlimited",
      "Web deal search — unlimited",
      "Custom alerts & filters",
      "Direct seller messaging",
    ],
    notIncluded: ["API access", "White-label", "Dedicated manager"],
  },
  {
    name: "Enterprise",
    icon: Building2,
    tagline: "For funds, brokers & M&A teams",
    accent: false,
    cta: "Contact Sales",
    features: [
      "Everything in Pro",
      "Full REST API access",
      "White-label marketplace",
      "Bulk listing uploads (CSV)",
      "Dedicated account manager",
      "SLA guarantee (99.9%)",
      "Custom integrations",
      "Team seats (up to 25)",
      "Advanced compliance tools",
      "Priority deal flow access",
    ],
    notIncluded: [],
  },
];

export function PremiumSection() {
  const [currency, setCurrency] = useState<Currency>("USD");
  const [annual, setAnnual] = useState(true);

  return (
    <section id="premium" className="relative overflow-hidden py-20 sm:py-28">
      {/* Background glow */}
      <div aria-hidden className="glow-orb-blue pointer-events-none absolute -left-40 top-0 size-[500px]" />
      <div aria-hidden className="glow-orb-violet pointer-events-none absolute -right-40 bottom-0 size-[500px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#3b82f6]/30 bg-[#3b82f6]/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-[#3b82f6]">
            <Crown className="size-3.5" /> Premium Membership
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Unlock the full power of <span className="gradient-text">Make This Deal</span>
          </h2>
          <p className="mt-3 text-base text-[#9ca3af] sm:text-lg">
            From free browsing to enterprise-grade API access — choose the plan that scales with your deal flow.
          </p>

          {/* Billing toggle */}
          <div className="mt-6 flex items-center justify-center gap-3">
            <span className={`text-sm font-medium ${!annual ? "text-white" : "text-[#6b7280]"}`}>Monthly</span>
            <button
              onClick={() => setAnnual(!annual)}
              className="relative h-7 w-12 rounded-full bg-[#1a1a2e] transition-colors"
              style={{ backgroundColor: annual ? "#3b82f6" : "#1a1a2e" }}
            >
              <span
                className="absolute top-1 size-5 rounded-full bg-white transition-transform"
                style={{ transform: annual ? "translateX(24px)" : "translateX(4px)" }}
              />
            </button>
            <span className={`text-sm font-medium ${annual ? "text-white" : "text-[#6b7280]"}`}>
              Annual <span className="text-[#10b981]">(-20%)</span>
            </span>
          </div>

          {/* Currency selector */}
          <div className="mt-4 flex items-center justify-center gap-2">
            <span className="text-xs text-[#6b7280]">Currency:</span>
            {(["USD", "PKR", "EUR", "GBP", "AED"] as Currency[]).map((c) => (
              <button
                key={c}
                onClick={() => setCurrency(c)}
                className={`rounded-full px-2.5 py-1 text-xs font-semibold transition ${
                  currency === c
                    ? "bg-[#3b82f6] text-white"
                    : "bg-[#1a1a2e] text-[#9ca3af] hover:text-white"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Plans grid */}
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {PLANS.map((plan, i) => {
            const Icon = plan.icon;
            const priceKey = plan.name.toLowerCase() as "starter" | "pro" | "enterprise";
            const monthly = PRICES[currency][priceKey];
            const displayPrice = annual && priceKey !== "starter"
              ? monthly.replace(/[\d,]+/, (m) => String(Math.round(Number(m.replace(/[,]/g, "")) * 0.8)).replace(/\B(?=(\d{3})+(?!\d))/g, ","))
              : monthly;
            const period = priceKey === "starter" ? "forever" : annual ? "/mo billed annually" : "/month";

            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`relative rounded-3xl border p-6 sm:p-8 ${
                  plan.accent
                    ? "border-[#3b82f6]/40 bg-gradient-to-b from-[#3b82f6]/10 to-[#111128] glow-blue"
                    : "border-white/8 bg-[#111128]/60"
                }`}
              >
                {plan.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] px-4 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow-lg">
                    {plan.badge}
                  </span>
                )}

                <div className="flex items-center gap-3">
                  <span className={`grid size-11 place-items-center rounded-2xl ${plan.accent ? "bg-gradient-to-br from-[#3b82f6] to-[#8b5cf6]" : "bg-[#1a1a2e]"}`}>
                    <Icon className="size-5 text-white" />
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                    <p className="text-[11px] text-[#9ca3af]">{plan.tagline}</p>
                  </div>
                </div>

                {/* Price */}
                <div className="mt-5">
                  <span className="text-4xl font-bold tabular-nums text-white">{displayPrice}</span>
                  <span className="ml-1 text-sm text-[#6b7280]">{period}</span>
                </div>

                {/* CTA */}
                <button
                  onClick={() => toast.success(`${plan.name} plan selected!`, { description: plan.cta === "Contact Sales" ? "Our team will reach out within 24h." : "Redirecting to checkout…" })}
                  className={`mt-5 w-full rounded-full py-3 text-sm font-semibold transition ${
                    plan.accent
                      ? "bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] text-white hover:opacity-90"
                      : "border border-white/15 bg-transparent text-white hover:bg-white/5"
                  }`}
                >
                  {plan.cta}
                </button>

                {/* Features */}
                <div className="mt-6 space-y-2.5">
                  {plan.features.map((f) => (
                    <div key={f} className="flex items-start gap-2.5">
                      <Check className="mt-0.5 size-4 shrink-0 text-[#10b981]" />
                      <span className="text-sm text-[#e5e7eb]">{f}</span>
                    </div>
                  ))}
                  {plan.notIncluded.map((f) => (
                    <div key={f} className="flex items-start gap-2.5 opacity-40">
                      <X className="mt-0.5 size-4 shrink-0 text-[#6b7280]" />
                      <span className="text-sm text-[#6b7280] line-through">{f}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Enterprise CTA strip */}
        <div className="mt-10 overflow-hidden rounded-3xl border border-white/8 bg-gradient-to-r from-[#0a0a1a] via-[#111128] to-[#0a0a1a] p-6 sm:p-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-3">
              <span className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-[#8b5cf6] to-[#3b82f6] glow-violet">
                <Building2 className="size-6 text-white" />
              </span>
              <div>
                <h3 className="text-base font-bold text-white">Need a custom enterprise solution?</h3>
                <p className="text-sm text-[#9ca3af]">White-label marketplace, on-premise deployment, custom integrations & unlimited team seats.</p>
              </div>
            </div>
            <button
              onClick={() => toast.success("Sales team notified!", { description: "We'll email you within 24 hours." })}
              className="shrink-0 rounded-full bg-white px-6 py-3 text-sm font-bold text-[#050510] transition hover:bg-[#e5e7eb]"
            >
              Talk to Sales →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
