"use client";

import { useState } from "react";
import {
  Globe2,
  Handshake,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  Shield,
  Twitter,
  Linkedin,
  Facebook,
  Instagram,
} from "lucide-react";
import { toast } from "sonner";

import { useMarketplaceStore } from "./use-marketplace-store";

const SOCIALS = [
  { icon: Twitter, label: "Twitter / X", href: "#" },
  { icon: Linkedin, label: "LinkedIn", href: "#" },
  { icon: Facebook, label: "Facebook", href: "#" },
  { icon: Instagram, label: "Instagram", href: "#" },
];

const COLUMNS: Array<{
  title: string;
  links: Array<{ label: string; action?: () => void; href?: string }>;
}> = [
  {
    title: "Marketplace",
    links: [
      {
        label: "Browse All Projects",
        action: () =>
          document
            .getElementById("listings")
            ?.scrollIntoView({ behavior: "smooth" }),
      },
      {
        label: "Featured Listings",
        action: () =>
          document
            .getElementById("top")
            ?.scrollIntoView({ behavior: "smooth" }),
      },
      {
        label: "Categories",
        action: () =>
          document
            .getElementById("categories")
            ?.scrollIntoView({ behavior: "smooth" }),
      },
      { label: "AI Valuation" },
    ],
  },
  {
    title: "Solutions",
    links: [
      { label: "For Sellers" },
      { label: "For Investors" },
      { label: "For Brokers" },
      { label: "Enterprise" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us" },
      {
        label: "How It Works",
        action: () =>
          document
            .getElementById("how-it-works")
            ?.scrollIntoView({ behavior: "smooth" }),
      },
      { label: "Pricing" },
      { label: "Contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy" },
      { label: "Terms of Service" },
      { label: "Cookie Policy" },
      { label: "Compliance" },
    ],
  },
];

function FooterLink({
  label,
  action,
  href,
  onAi,
}: {
  label: string;
  action?: () => void;
  href?: string;
  onAi?: () => void;
}) {
  const onClick = (e: React.MouseEvent) => {
    if (label === "AI Valuation" && onAi) {
      e.preventDefault();
      onAi();
      return;
    }
    if (action) {
      e.preventDefault();
      action();
    }
  };
  return (
    <a
      href={href || "#"}
      onClick={onClick}
      className="text-sm text-white/65 transition hover:text-[#FF8C32]"
    >
      {label}
    </a>
  );
}

export function Footer() {
  const setAiOpen = useMarketplaceStore((s) => s.setAiOpen);
  const [email, setEmail] = useState("");

  const subscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Enter your email first");
      return;
    }
    toast.success("Subscribed!", {
      description: "You'll get fresh listings + M&A insights weekly.",
    });
    setEmail("");
  };

  return (
    <footer className="mt-auto bg-[#1A1D2E] text-white">
      {/* Newsletter band */}
      <div className="border-b border-white/10">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-10 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-1.5 max-w-md">
            <h3 className="text-lg font-bold tracking-tight">
              Get the deal flow, weekly.
            </h3>
            <p className="text-sm text-white/65">
              New listings, valuation deep-dives, and M&A playbooks — straight
              to your inbox. No spam.
            </p>
          </div>
          <form
            onSubmit={subscribe}
            className="flex w-full max-w-md items-center gap-2"
          >
            <div className="relative flex-1">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-white/40" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="h-11 w-full rounded-full border border-white/15 bg-white/5 pl-10 pr-4 text-sm text-white placeholder:text-white/40 focus:border-[#FF7A00] focus:bg-white/10 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full bg-[#FF7A00] px-5 text-sm font-semibold text-white shadow-[0_6px_18px_rgba(255,122,0,0.28)] transition hover:bg-[#FF8C32]"
            >
              <Send className="size-4" />
              <span className="hidden sm:inline">Subscribe</span>
            </button>
          </form>
        </div>
      </div>

      {/* Main footer */}
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]">
        {/* Brand column */}
        <div className="flex flex-col gap-4 max-w-xs">
          <a href="#top" className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-[#FF7A00] to-[#FF8C32] text-white shadow-[0_4px_12px_rgba(255,122,0,0.25)]">
              <Handshake className="size-5" strokeWidth={2.2} />
            </span>
            <span className="flex flex-col leading-none">
              <span className="flex items-baseline gap-1">
                <span className="text-[15px] font-bold tracking-tight">
                  Make This Deal
                </span>
                <span className="text-[10px] font-semibold text-[#FF8C32]">
                  .biz
                </span>
              </span>
              <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-white/50">
                Together We Grow Strong
              </span>
            </span>
          </a>
          <p className="text-sm leading-relaxed text-white/65">
            The global enterprise marketplace to buy, sell, and invest in
            complete businesses. SaaS, Real Estate, Startups, AI Solutions,
            FinTech, and more.
          </p>

          {/* Contact */}
          <ul className="flex flex-col gap-2 text-sm text-white/70">
            <li className="flex items-center gap-2">
              <Mail className="size-4 text-[#FF8C32]" />
              <a
                href="mailto:playbeatdigital@proton.me"
                className="hover:text-white"
              >
                playbeatdigital@proton.me
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="size-4 text-[#FF8C32]" />
              <a
                href="https://wa.me/923318333368"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white"
              >
                WhatsApp +92 331 8333368
              </a>
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="size-4 text-[#FF8C32]" />
              <span>Karachi, Pakistan</span>
            </li>
          </ul>

          {/* Socials */}
          <div className="mt-1 flex items-center gap-2">
            {SOCIALS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                aria-label={s.label}
                className="grid size-9 place-items-center rounded-full border border-white/15 bg-white/5 text-white/70 transition hover:border-[#FF7A00]/40 hover:bg-[#FF7A00]/10 hover:text-[#FF8C32]"
              >
                <s.icon className="size-4" />
              </a>
            ))}
          </div>
        </div>

        {/* Link columns */}
        {COLUMNS.map((col) => (
          <div key={col.title} className="flex flex-col gap-3">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-white/50">
              {col.title}
            </h4>
            <ul className="flex flex-col gap-2.5">
              {col.links.map((l) => (
                <li key={l.label}>
                  <FooterLink
                    label={l.label}
                    action={l.action}
                    href={l.href}
                    onAi={setAiOpen}
                  />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 text-xs text-white/55 sm:flex-row sm:px-6">
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
            <span>© 2026 MakeThisDeal. All rights reserved.</span>
            <span className="hidden text-white/20 sm:inline">·</span>
            <span className="inline-flex items-center gap-1.5">
              <Globe2 className="size-3.5 text-[#FF8C32]" />
              Trusted by businesses in 120+ countries
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5">
              <Shield className="size-3.5 text-emerald-400" />
              Verified Listings
            </span>
            <span className="text-white/20">·</span>
            <span className="inline-flex items-center gap-1.5">
              <MessageCircle className="size-3.5 text-[#FF8C32]" />
              Made with ❤️ in Karachi
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
