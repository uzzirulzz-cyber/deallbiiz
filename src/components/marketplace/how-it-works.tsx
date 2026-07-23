"use client";

import { motion } from "framer-motion";
import { Handshake, MessageSquare, Search, UserPlus } from "lucide-react";

const STEPS = [
  {
    n: 1,
    icon: UserPlus,
    title: "Create Your Account",
    desc: "Sign up free as a buyer, seller, or investor. Personalise your feed in under 60 seconds.",
  },
  {
    n: 2,
    icon: Search,
    title: "List or Browse",
    desc: "List your business with AI-assisted Snap-a-Listing, or browse 50+ verified opportunities.",
  },
  {
    n: 3,
    icon: MessageSquare,
    title: "Connect & Negotiate",
    desc: "Reach sellers directly, ask the hard questions, and use Dealio AI to value every deal.",
  },
  {
    n: 4,
    icon: Handshake,
    title: "Close the Deal",
    desc: "Finalise terms, transfer ownership, and grow together. Together We Grow Strong.",
  },
];

export function HowItWorks() {
  return (
    <section className="bg-[#FAFAFB] py-16 sm:py-20">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 sm:px-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-[#FF7A00]">
            Get Started
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-[#111827] sm:text-3xl">
            How It Works
          </h2>
          <p className="max-w-2xl text-sm text-[#6B7280]">
            From sign-up to closed deal in four simple steps. No middlemen, no
            hidden fees — just businesses changing hands.
          </p>
        </div>

        <div className="relative grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Dashed connector line on desktop */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-0 right-0 top-[3.25rem] hidden h-px bg-[length:10px_1px] bg-repeat-x lg:block"
            style={{
              backgroundImage:
                "linear-gradient(to right, #FFD0A8 50%, transparent 0)",
            }}
          />

          {STEPS.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="relative flex flex-col gap-4 rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.05)]"
            >
              <div className="flex items-center justify-between">
                <span className="grid size-12 place-items-center rounded-full bg-gradient-to-br from-[#FF7A00] to-[#FF8C32] text-base font-bold text-white shadow-[0_6px_18px_rgba(255,122,0,0.28)]">
                  {s.n}
                </span>
                <span className="grid size-10 place-items-center rounded-full bg-[#FFF4EB] text-[#FF7A00]">
                  <s.icon className="size-5" strokeWidth={2} />
                </span>
              </div>
              <h3 className="text-base font-semibold text-[#111827]">
                {s.title}
              </h3>
              <p className="text-sm leading-relaxed text-[#6B7280]">
                {s.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
