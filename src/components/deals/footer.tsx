"use client";

import {
  BadgePercent,
  Github,
  Instagram,
  Mail,
  Sparkles,
  Camera,
  Globe,
  Twitter,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useDealsStore } from "./use-deals-store";

function FooterCol({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-amber-400/90">
        {title}
      </h3>
      <div className="flex flex-col gap-2 text-sm text-muted-foreground">
        {children}
      </div>
    </div>
  );
}

function FooterLink({
  icon: Icon,
  label,
  onClick,
}: {
  icon?: LucideIcon;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="inline-flex w-fit items-center gap-1.5 text-left transition-colors hover:text-foreground"
    >
      {Icon && <Icon className="size-3.5" />}
      {label}
    </button>
  );
}

export function Footer() {
  const setAiOpen = useDealsStore((s) => s.setAiOpen);
  const setSnapOpen = useDealsStore((s) => s.setSnapOpen);
  const setWebOpen = useDealsStore((s) => s.setWebOpen);
  const setCategory = useDealsStore((s) => s.setCategory);

  const scrollToGrid = () => {
    if (typeof document !== "undefined") {
      document.getElementById("deals-grid")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <footer className="mt-auto border-t border-amber-500/10 bg-card/40">
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2.5">
              <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-amber-950">
                <BadgePercent className="size-5" strokeWidth={2.5} />
              </span>
              <span className="text-lg font-bold tracking-tight">
                makethisdeal
                <span className="text-muted-foreground/70">.biz</span>
              </span>
            </div>
            <p className="max-w-xs text-sm text-muted-foreground">
              Premium hand-picked deals, refreshed daily. Live countdowns, an
              AI deal hunter, and a snap-a-deal assistant — all in one feed.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                toast.success("Subscribed! 🔔 Deal drops incoming.");
                (e.currentTarget.querySelector("input") as HTMLInputElement).value = "";
              }}
              className="flex w-full max-w-xs items-center gap-2"
            >
              <Input
                type="email"
                required
                placeholder="you@email.com"
                aria-label="Email for deal newsletter"
                className="h-9 bg-input/40"
              />
              <Button
                type="submit"
                size="sm"
                className="bg-amber-500 text-amber-950 hover:bg-amber-400"
              >
                Subscribe
              </Button>
            </form>
          </div>

          {/* Categories */}
          <FooterCol title="Categories">
            <FooterLink label="🎧 Tech" onClick={() => { setCategory("tech"); scrollToGrid(); }} />
            <FooterLink label="👟 Fashion" onClick={() => { setCategory("fashion"); scrollToGrid(); }} />
            <FooterLink label="🛋️ Home" onClick={() => { setCategory("home"); scrollToGrid(); }} />
            <FooterLink label="🎮 Gaming" onClick={() => { setCategory("gaming"); scrollToGrid(); }} />
            <FooterLink label="💄 Beauty" onClick={() => { setCategory("beauty"); scrollToGrid(); }} />
            <FooterLink label="✈️ Travel" onClick={() => { setCategory("travel"); scrollToGrid(); }} />
          </FooterCol>

          {/* Tools */}
          <FooterCol title="Tools">
            <FooterLink icon={Sparkles} label="AI Deal Finder" onClick={() => setAiOpen(true)} />
            <FooterLink icon={Camera} label="Snap a Deal" onClick={() => setSnapOpen(true)} />
            <FooterLink icon={Globe} label="Web Deal Search" onClick={() => setWebOpen(true)} />
          </FooterCol>

          {/* Social */}
          <FooterCol title="Stay in the loop">
            <div className="flex items-center gap-2">
              {[
                { Icon: Twitter, label: "Twitter" },
                { Icon: Instagram, label: "Instagram" },
                { Icon: Github, label: "GitHub" },
                { Icon: Mail, label: "Email" },
              ].map(({ Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  onClick={(e) => e.preventDefault()}
                  className="grid size-9 place-items-center rounded-lg border border-border/60 bg-input/30 text-muted-foreground transition-colors hover:border-amber-500/40 hover:text-amber-400"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
            <p className="text-xs text-muted-foreground/70">
              New deals drop every day at 9am. Set a reminder, or just bookmark
              us.
            </p>
          </FooterCol>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-2 border-t border-border/40 pt-6 text-xs text-muted-foreground/70 sm:flex-row sm:items-center">
          <p>© 2026 makethisdeal.biz · Made for deal hunters.</p>
          <p className="text-muted-foreground/60">Powered by Z.ai</p>
        </div>
      </div>
    </footer>
  );
}
