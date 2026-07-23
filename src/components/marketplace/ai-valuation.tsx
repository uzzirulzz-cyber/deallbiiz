"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

import { useMarketplaceStore } from "./use-marketplace-store";
import { chatWithDealio } from "./api";
import type { ChatHistoryItem } from "./types";

const SUGGESTED_PROMPTS = [
  "Value a SaaS with $300K ARR",
  "What's a fair price for an E-commerce store?",
  "Compare the top 3 listings under $1M",
  "How do I value a pre-revenue startup?",
];

function mkId() {
  return "msg_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function AiValuation() {
  const open = useMarketplaceStore((s) => s.aiOpen);
  const setOpen = useMarketplaceStore((s) => s.setAiOpen);
  const chatHistory = useMarketplaceStore((s) => s.chatHistory);
  const addChatMessage = useMarketplaceStore((s) => s.addChatMessage);
  const chatTyping = useMarketplaceStore((s) => s.chatTyping);
  const setChatTyping = useMarketplaceStore((s) => s.setChatTyping);
  const clearChat = useMarketplaceStore((s) => s.clearChat);

  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [open, chatHistory, chatTyping]);

  const send = async (text: string) => {
    const message = text.trim();
    if (!message || sending) return;
    setInput("");
    setSending(true);
    addChatMessage({ id: mkId(), role: "user", content: message });
    setChatTyping(true);

    const history: ChatHistoryItem[] = chatHistory
      .slice(-8)
      .map((m) => ({ role: m.role, content: m.content }));

    try {
      const res = await chatWithDealio(message, history);
      if (res.error) {
        toast.warning("Dealio replied with a fallback", {
          description: res.error,
        });
      }
      addChatMessage({
        id: mkId(),
        role: "assistant",
        content: res.reply,
      });
    } catch (e) {
      toast.error("Couldn't reach Dealio", {
        description: e instanceof Error ? e.message : undefined,
      });
      addChatMessage({
        id: mkId(),
        role: "assistant",
        content:
          "Sorry, I hit a snag reaching the model. Try again in a moment?",
      });
    } finally {
      setChatTyping(false);
      setSending(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 border-[#E5E7EB] p-0 sm:max-w-md"
      >
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#FF7A00] to-[#FF8C32] px-5 py-4 text-white">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-white/10 blur-2xl"
          />
          <SheetHeader className="relative p-0">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-white/15 backdrop-blur">
                <Sparkles className="size-5" />
              </span>
              <div className="flex flex-col gap-0.5">
                <SheetTitle className="text-base font-bold text-white">
                  Dealio · AI Valuation Advisor
                </SheetTitle>
                <SheetDescription className="text-xs text-white/80">
                  Value businesses · compare listings · close better deals
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>
          {chatHistory.length > 0 && (
            <button
              type="button"
              onClick={() => {
                clearChat();
                toast("Chat cleared");
              }}
              className="absolute right-12 top-4 grid size-8 place-items-center rounded-full text-white/80 transition hover:bg-white/15 hover:text-white"
              aria-label="Clear chat"
            >
              <Trash2 className="size-4" />
            </button>
          )}
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto bg-[#FAFAFB]"
        >
          <div className="flex flex-col gap-4 p-5">
            {chatHistory.length === 0 && (
              <div className="flex flex-col gap-4">
                <div className="rounded-2xl bg-white p-4 shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="grid size-7 place-items-center rounded-full bg-[#FF7A00]/10 text-[#FF7A00]">
                      <Sparkles className="size-4" />
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#9CA3AF]">
                      Dealio
                    </span>
                  </div>
                  <p className="text-sm text-[#374151]">
                    Hi! I&apos;m <strong>Dealio</strong>, your AI valuation &
                    deal advisor. Ask me to value a business, compare listings,
                    or walk through an M&A scenario.
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="px-1 text-xs font-semibold uppercase tracking-wider text-[#9CA3AF]">
                    Try asking
                  </span>
                  {SUGGESTED_PROMPTS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => send(p)}
                      className="rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-left text-sm text-[#111827] transition hover:border-[#FF7A00]/40 hover:bg-[#FFF8F2]"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {chatHistory.map((m) => (
              <div
                key={m.id}
                className={cn(
                  "flex items-end gap-2",
                  m.role === "user" ? "justify-end" : "justify-start",
                )}
              >
                {m.role === "assistant" && (
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#FF7A00]/10 text-[#FF7A00]">
                    <Sparkles className="size-4" />
                  </span>
                )}
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap",
                    m.role === "user"
                      ? "rounded-br-sm bg-[#FF7A00] text-white shadow-[0_4px_14px_rgba(255,122,0,0.18)]"
                      : "rounded-bl-sm bg-white text-[#111827] shadow-[0_2px_10px_rgba(0,0,0,0.04)]",
                  )}
                >
                  {m.content}
                </div>
              </div>
            ))}

            {chatTyping && (
              <div className="flex items-end gap-2">
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#FF7A00]/10 text-[#FF7A00]">
                  <Sparkles className="size-4" />
                </span>
                <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-white px-4 py-3.5 shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
                  <span className="mtd-typing-dot size-2 rounded-full bg-[#9CA3AF]" />
                  <span className="mtd-typing-dot size-2 rounded-full bg-[#9CA3AF]" />
                  <span className="mtd-typing-dot size-2 rounded-full bg-[#9CA3AF]" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Input */}
        <div className="border-t border-[#E5E7EB] bg-white p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void send(input);
            }}
            className="flex items-end gap-2"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send(input);
                }
              }}
              rows={1}
              placeholder="Ask Dealio to value a business…"
              className="max-h-32 flex-1 resize-none rounded-2xl border border-[#E5E7EB] bg-[#F5F5F7] px-4 py-3 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:border-[#FF7A00] focus:bg-white focus:outline-none"
            />
            <button
              type="submit"
              disabled={!input.trim() || sending}
              aria-label="Send message"
              className="grid size-11 shrink-0 place-items-center rounded-full bg-[#FF7A00] text-white shadow-[0_4px_14px_rgba(255,122,0,0.28)] transition hover:bg-[#FF8C32] disabled:opacity-40"
            >
              <ArrowUp className="size-5" />
            </button>
          </form>
          <p className="mt-2 text-center text-[10px] text-[#9CA3AF]">
            Dealio uses live marketplace data + M&A heuristics. Always do your
            own due diligence.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
