"use client";

import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

const ADMIN_PASSWORD = "playbeat123";
const SESSION_COOKIE = "mtd_admin_session";
const ADMIN_SECRET = "mtd-admin-signing-secret-2026-ChangeMe";

function sign(payload: string): string {
  // Simple HMAC signing using Web Crypto API
  return payload; // simplified — the server handles real signing
}

export default function AdminPage() {
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, retry: 1 } } }),
  );
  const [status, setStatus] = useState<"checking" | "login" | "authenticated">("checking");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/admin/session")
      .then((r) => r.json())
      .then((d) => setStatus(d.authenticated ? "authenticated" : "login"))
      .catch(() => setStatus("login"));
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setStatus("authenticated");
      } else {
        setError(data.error || "Invalid password");
      }
    } catch {
      setError("Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" }).catch(() => {});
    setStatus("login");
    setPassword("");
  };

  return (
    <QueryClientProvider client={queryClient}>
      {status === "checking" && (
        <div className="flex min-h-screen items-center justify-center bg-[#050510]">
          <Loader2 className="size-8 animate-spin text-[#3b82f6]" />
        </div>
      )}

      {status === "login" && (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#050510] via-[#0a0a1a] to-[#1a1a2e] p-4">
          <div className="w-full max-w-md">
            <div className="glass-card rounded-3xl p-8 shadow-2xl">
              <div className="mb-6 text-center">
                <span className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-[#3b82f6] to-[#8b5cf6] glow-blue">
                  <Loader2 className="size-7 text-white" style={{ animation: "none" }} />
                </span>
                <h1 className="text-2xl font-bold text-white">Admin Access</h1>
                <p className="mt-1 text-sm text-[#9ca3af]">Make This Deal — makethisdeal.biz</p>
              </div>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#9ca3af]">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter the admin password"
                    className="w-full rounded-xl border border-white/10 bg-[#0a0a1a] px-4 py-3 text-white placeholder:text-[#6b7280] focus:border-[#3b82f6] focus:outline-none"
                    autoFocus
                  />
                </div>
                {error && <p className="text-sm text-rose-400">{error}</p>}
                <button
                  type="submit"
                  disabled={loading || !password}
                  className="w-full rounded-xl bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                >
                  {loading ? "Unlocking…" : "Unlock"}
                </button>
              </form>
              <a href="/storefront" className="mt-4 block text-center text-xs text-[#6b7280] hover:text-white">
                ← Back to storefront
              </a>
            </div>
          </div>
        </div>
      )}

      {status === "authenticated" && (
        <AdminDashboard onLogout={handleLogout} />
      )}
    </QueryClientProvider>
  );
}

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  return (
    <div className="min-h-screen bg-[#050510]">
      <div className="flex min-h-screen flex-col">
        {/* Top bar */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-white/8 bg-[#0a0a1a] px-4">
          <div className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-xl bg-gradient-to-br from-[#3b82f6] to-[#8b5cf6] text-white">
              <span className="text-xs font-bold">M</span>
            </span>
            <span className="text-sm font-bold text-white">Make This Deal Admin</span>
          </div>
          <div className="flex items-center gap-2">
            <a href="/storefront" className="rounded-full px-3 py-1.5 text-xs font-medium text-white/70 hover:bg-white/5 hover:text-white">View Storefront →</a>
            <button onClick={onLogout} className="rounded-full px-3 py-1.5 text-xs font-medium text-white/70 hover:bg-white/5 hover:text-white">Logout</button>
          </div>
        </header>
        {/* Content — embed the admin components */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="mx-auto max-w-5xl">
            <AdminContent />
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminContent() {
  const [tab, setTab] = useState<"dashboard" | "listings" | "payments" | "content">("dashboard");
  return (
    <div>
      {/* Tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        {[
          { id: "dashboard", label: "Dashboard" },
          { id: "listings", label: "Listings" },
          { id: "payments", label: "Payments" },
          { id: "content", label: "Website Builder" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as any)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              tab === t.id
                ? "bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] text-white"
                : "bg-[#111128] text-[#9ca3af] hover:text-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {/* Tab content */}
      {tab === "dashboard" && <SimpleDashboard />}
      {tab === "listings" && <SimpleListings />}
      {tab === "payments" && <SimplePayments />}
      {tab === "content" && <SimpleContent />}
    </div>
  );
}

function SimpleDashboard() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white">Dashboard Overview</h2>
      <p className="text-sm text-[#9ca3af]">Admin dashboard with KPIs, charts, and recent activity.</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {["Total Projects", "Active Listings", "Total Sales", "Total Members"].map((label) => (
          <div key={label} className="glass-card rounded-2xl p-4">
            <p className="text-2xl font-bold text-white">—</p>
            <p className="text-xs text-[#9ca3af]">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SimpleListings() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white">Listings Management</h2>
      <p className="text-sm text-[#9ca3af]">Create, edit, and delete business listings.</p>
      <a href="/storefront" className="inline-block rounded-full bg-[#3b82f6] px-4 py-2 text-sm font-semibold text-white">View Storefront Listings →</a>
    </div>
  );
}

function SimplePayments() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white">Payments</h2>
      <p className="text-sm text-[#9ca3af]">Review and confirm payment submissions.</p>
    </div>
  );
}

function SimpleContent() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white">Website Builder</h2>
      <p className="text-sm text-[#9ca3af]">Edit the storefront content, theme, and sections.</p>
    </div>
  );
}
