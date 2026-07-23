"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles, Send, Trash2, User } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDealsStore } from "./use-deals-store";
import { chatWithDealio } from "./api";
import type { ChatHistoryItem, ChatMessage } from "./types";
import { toast } from "sonner";

const SUGGESTIONS = [
  "Best headphones under $100",
  "Cheapest 4K TV right now",
  "Is the AuraBuds deal worth it?",
  "Gift ideas under $50",
];

function uid() {
  return `m_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export function AiFinder() {
  const open = useDealsStore((s) => s.aiOpen);
  const setOpen = useDealsStore((s) => s.setAiOpen);
  const history = useDealsStore((s) => s.chatHistory);
  const addMessage = useDealsStore((s) => s.addChatMessage);
  const typing = useDealsStore((s) => s.chatTyping);
  const setTyping = useDealsStore((s) => s.setChatTyping);
  const clearChat = useDealsStore((s) => s.clearChat);

  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages or typing change
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [history, typing, open]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || typing) return;
    const userMsg: ChatMessage = { id: uid(), role: "user", content: trimmed };
    addMessage(userMsg);
    setInput("");
    setTyping(true);

    // Build history payload (last 8 turns, excluding the new message we just added)
    const payload: ChatHistoryItem[] = [...history, userMsg]
      .slice(-9, -1)
      .map((m) => ({ role: m.role, content: m.content }));

    try {
      const res = await chatWithDealio(trimmed, payload);
      addMessage({
        id: uid(),
        role: "assistant",
        content: res.reply,
      });
      if (res.error) {
        toast.warning("Showing fallback reply", { description: res.error });
      }
    } catch (e) {
      addMessage({
        id: uid(),
        role: "assistant",
        content:
          "Sorry, I hit a snag talking to the AI. Try again in a moment? 🙏",
      });
      toast.error("AI chat failed", {
        description: e instanceof Error ? e.message : undefined,
      });
    } finally {
      setTyping(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-md"
      >
        {/* Amber gradient header */}
        <div className="relative flex items-center gap-3 border-b border-border/60 bg-gradient-to-br from-amber-500/15 via-amber-500/5 to-transparent px-5 py-4">
          <span className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-amber-950 shadow-lg shadow-amber-500/20">
            <Sparkles className="size-5" strokeWidth={2.4} />
          </span>
          <div className="flex flex-col">
            <SheetHeader className="p-0">
              <SheetTitle className="text-base font-bold">
                Dealio · AI Deal Finder
              </SheetTitle>
              <SheetDescription className="text-xs">
                Ask me anything — I&apos;ll dig through live deals for you.
              </SheetDescription>
            </SheetHeader>
          </div>
          {history.length > 0 && (
            <Button
              onClick={clearChat}
              size="icon"
              variant="ghost"
              className="ml-auto size-8 text-muted-foreground hover:text-foreground"
              aria-label="Clear chat"
            >
              <Trash2 className="size-4" />
            </Button>
          )}
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1">
          <div ref={scrollRef} className="flex flex-col gap-4 px-4 py-5">
            {history.length === 0 && (
              <div className="flex flex-col gap-4">
                <div className="rounded-xl border border-border/60 bg-card/60 p-4 text-sm text-muted-foreground">
                  Hi! I&apos;m <span className="font-semibold text-amber-400">Dealio</span> 🤝
                  Tell me what you&apos;re hunting for and I&apos;ll surface the
                  best live deals from our catalogue.
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground/80">
                    Try one of these
                  </p>
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="rounded-lg border border-border/60 bg-card/60 px-3 py-2 text-left text-sm transition-colors hover:border-amber-500/40 hover:text-foreground"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {history.map((m) =>
              m.role === "user" ? (
                <div key={m.id} className="flex justify-end">
                  <div className="flex max-w-[85%] items-start gap-2">
                    <div className="rounded-2xl rounded-br-sm bg-amber-500 px-3.5 py-2 text-sm text-amber-950 shadow-md shadow-amber-500/10">
                      <p className="whitespace-pre-wrap break-words">{m.content}</p>
                    </div>
                    <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-amber-500/20 text-amber-300">
                      <User className="size-3.5" />
                    </span>
                  </div>
                </div>
              ) : (
                <div key={m.id} className="flex justify-start">
                  <div className="flex max-w-[85%] items-start gap-2">
                    <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-amber-500/20 text-amber-300">
                      <Sparkles className="size-3.5" />
                    </span>
                    <div className="rounded-2xl rounded-bl-sm border border-border/60 bg-card px-3.5 py-2 text-sm">
                      <p className="whitespace-pre-wrap break-words">{m.content}</p>
                    </div>
                  </div>
                </div>
              ),
            )}

            {typing && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2">
                  <span className="grid size-6 place-items-center rounded-full bg-amber-500/20 text-amber-300">
                    <Sparkles className="size-3.5" />
                  </span>
                  <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm border border-border/60 bg-card px-4 py-3">
                    <span className="ttd-typing-dot size-1.5 rounded-full bg-amber-400" />
                    <span className="ttd-typing-dot size-1.5 rounded-full bg-amber-400" />
                    <span className="ttd-typing-dot size-1.5 rounded-full bg-amber-400" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="border-t border-border/60 bg-background/80 p-3 backdrop-blur">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-center gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Dealio for a deal…"
              aria-label="Message Dealio"
              className="h-10 rounded-full bg-input/40"
              disabled={typing}
            />
            <Button
              type="submit"
              size="icon"
              className="size-10 shrink-0 rounded-full bg-amber-500 text-amber-950 hover:bg-amber-400"
              disabled={!input.trim() || typing}
              aria-label="Send message"
            >
              <Send className="size-4" />
            </Button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
