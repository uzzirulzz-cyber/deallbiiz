"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import {
  Camera,
  ImagePlus,
  Loader2,
  Rocket,
  ScanLine,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDealsStore } from "./use-deals-store";
import { analyzeDealImage, createDeal, fetchCategories } from "./api";
import type { AnalyzedDeal } from "./types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/**
 * Generate a realistic deal-card screenshot on a canvas so the "Try sample"
 * button produces a valid image the VLM can actually read and extract from.
 */
function generateSampleDealImage(): string {
  const W = 640;
  const H = 480;
  if (typeof document === "undefined") return "";
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  // Background
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, "#1a1714");
  grad.addColorStop(1, "#0f0d0b");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Discount badge
  ctx.fillStyle = "#f59e0b";
  ctx.fillRect(24, 24, 96, 36);
  ctx.fillStyle = "#1a1208";
  ctx.font = "bold 22px sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("-55%", 40, 50);

  // Flash badge
  ctx.fillStyle = "#e11d48";
  ctx.fillRect(W - 140, 24, 116, 30);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 14px sans-serif";
  ctx.fillText("FLASH DEAL", W - 130, 44);

  // Big product emoji
  ctx.font = "130px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("\uD83C\uDFA7", W / 2, 230);

  // Store
  ctx.textAlign = "left";
  ctx.fillStyle = "#a8a29e";
  ctx.font = "16px sans-serif";
  ctx.fillText("AudioHub", 28, 285);

  // Title
  ctx.fillStyle = "#fafaf9";
  ctx.font = "bold 24px sans-serif";
  ctx.fillText("AuraSound Wireless Headphones", 28, 320);

  // Description
  ctx.fillStyle = "#a8a29e";
  ctx.font = "15px sans-serif";
  ctx.fillText("Active noise cancelling, 40h battery, spatial audio", 28, 346);

  // Price row
  ctx.fillStyle = "#fbbf24";
  ctx.font = "bold 40px sans-serif";
  ctx.fillText("$89", 28, 408);

  // Original price (strikethrough)
  ctx.fillStyle = "#a8a29e";
  ctx.font = "20px sans-serif";
  const orig = "$199";
  ctx.fillText(orig, 120, 408);
  const tw = ctx.measureText(orig).width;
  ctx.strokeStyle = "#a8a29e";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(120, 400);
  ctx.lineTo(120 + tw, 400);
  ctx.stroke();

  // Savings
  ctx.fillStyle = "#34d399";
  ctx.font = "bold 16px sans-serif";
  ctx.fillText("You save $110 (55%)", 28, 442);

  return canvas.toDataURL("image/png");
}


interface FormState {
  title: string;
  store: string;
  storeLogo: string;
  description: string;
  originalPrice: string;
  dealPrice: string;
  currency: string;
  url: string;
  categorySlug: string;
  tags: string;
  flashDeal: boolean;
}

const emptyForm: FormState = {
  title: "",
  store: "",
  storeLogo: "🏷️",
  description: "",
  originalPrice: "",
  dealPrice: "",
  currency: "USD",
  url: "",
  categorySlug: "tech",
  tags: "",
  flashDeal: false,
};

export function SnapADeal() {
  const open = useDealsStore((s) => s.snapOpen);
  const setOpen = useDealsStore((s) => s.setSnapOpen);
  const queryClient = useQueryClient();

  const { data: catData } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: 5 * 60_000,
  });
  const categories = catData?.categories ?? [];

  const [preview, setPreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      // Reset when the dialog closes so the next open is fresh
      setPreview(null);
      setAnalyzing(false);
      setPublishing(false);
      setForm(emptyForm);
      setShowForm(false);
      setDragOver(false);
    }
    setOpen(next);
  };

  const readFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please pick an image file");
      return;
    }
    if (file.size > 6_000_000) {
      toast.error("Image is too large (max 6MB)");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setPreview(dataUrl);
      void analyze(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const analyze = async (imageDataUrl: string) => {
    setAnalyzing(true);
    setShowForm(false);
    try {
      const res = await analyzeDealImage(imageDataUrl);
      const d: AnalyzedDeal = res.deal;
      setForm({
        title: d.title || "",
        store: d.store || "",
        storeLogo: d.storeLogo || "🏷️",
        description: d.description || "",
        originalPrice: d.originalPrice ? String(d.originalPrice) : "",
        dealPrice: d.dealPrice ? String(d.dealPrice) : "",
        currency: d.currency || "USD",
        url: d.url || "",
        categorySlug: d.categorySlug || "tech",
        tags: d.tags || "",
        flashDeal: false,
      });
      setShowForm(true);
      toast.success("Deal extracted ✨", {
        description: `Detected ${d.title || "a deal"} from ${d.store || "a store"}${
          typeof d.confidence === "number" ? ` · ${(d.confidence * 100).toFixed(0)}% confidence` : ""
        }`,
      });
    } catch (e) {
      toast.error("Couldn't analyze the image", {
        description: e instanceof Error ? e.message : undefined,
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const handlePublish = async () => {
    if (!form.title || !form.store || !form.url || !form.originalPrice || !form.dealPrice) {
      toast.error("Please fill in title, store, url, and both prices");
      return;
    }
    setPublishing(true);
    try {
      // Default expiry = now + 3 days
      const expiresAt = new Date(Date.now() + 3 * 24 * 3600_000).toISOString();
      await createDeal({
        title: form.title,
        store: form.store,
        storeLogo: form.storeLogo,
        imageUrl: preview || "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800",
        originalPrice: Number(form.originalPrice),
        dealPrice: Number(form.dealPrice),
        currency: form.currency,
        url: form.url,
        categorySlug: form.categorySlug,
        description: form.description,
        expiresAt,
        flashDeal: form.flashDeal,
        tags: form.tags,
      });
      // Invalidate the deals + trending queries so the new deal appears
      await queryClient.invalidateQueries({ queryKey: ["deals"] });
      await queryClient.invalidateQueries({ queryKey: ["trending"] });
      toast.success("Deal published to the live feed! 🚀", {
        description: `${form.title} is now visible in the trending rail`,
      });
      setOpen(false);
    } catch (e) {
      toast.error("Couldn't publish deal", {
        description: e instanceof Error ? e.message : undefined,
      });
    } finally {
      setPublishing(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) readFile(file);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-hidden rounded-2xl border-border/60 bg-background p-0 sm:max-w-lg">
        <div className="flex max-h-[92vh] flex-col">
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-border/60 bg-gradient-to-r from-amber-500/15 to-transparent px-5 py-4">
            <span className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-amber-950 shadow-lg shadow-amber-500/20">
              <ScanLine className="size-5" />
            </span>
            <DialogHeader className="p-0">
              <DialogTitle className="text-base font-bold">
                Snap a Deal
              </DialogTitle>
              <DialogDescription className="text-xs">
                Upload a deal screenshot — AI extracts the details, you publish.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4">
            {/* Drop zone / preview */}
            {!preview && (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click();
                }}
                className={cn(
                  "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-colors",
                  dragOver
                    ? "border-amber-500/60 bg-amber-500/5"
                    : "border-border/60 bg-card/40 hover:border-amber-500/40",
                )}
              >
                <span className="grid size-12 place-items-center rounded-full bg-amber-500/10 text-amber-400">
                  <ImagePlus className="size-6" />
                </span>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium">
                    Drag &amp; drop a deal screenshot
                  </p>
                  <p className="text-xs text-muted-foreground">
                    or click to browse · PNG/JPG up to 6MB
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                >
                  <Camera className="size-3.5" />
                  Choose image
                </Button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const dataUrl = generateSampleDealImage();
                    if (!dataUrl) return;
                    setPreview(dataUrl);
                    void analyze(dataUrl);
                  }}
                  className="text-xs text-amber-400 underline-offset-2 hover:underline"
                >
                  or try a sample image
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) readFile(f);
                    e.currentTarget.value = "";
                  }}
                />
              </div>
            )}

            {preview && (
              <div className="flex flex-col gap-4">
                <div className="relative overflow-hidden rounded-xl border border-border/60 bg-card">
                  <img
                    src={preview}
                    alt="Deal screenshot preview"
                    className="max-h-64 w-full object-contain"
                  />
                  {analyzing && (
                    <div className="absolute inset-0 grid place-items-center bg-background/70 backdrop-blur-sm">
                      <div className="flex flex-col items-center gap-2 text-center">
                        <Loader2 className="size-8 animate-spin text-amber-400" />
                        <p className="text-sm font-medium text-foreground">
                          Analyzing with AI…
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Extracting deal details from your image
                        </p>
                      </div>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setPreview(null);
                      setShowForm(false);
                      setForm(emptyForm);
                    }}
                    className="absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-black/50 text-white backdrop-blur transition-colors hover:bg-black/70"
                    aria-label="Clear image"
                  >
                    <X className="size-4" />
                  </button>
                </div>

                {showForm && (
                  <div className="flex flex-col gap-3">
                    <h3 className="text-sm font-semibold">Review &amp; publish</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Title" className="col-span-2">
                        <Input
                          value={form.title}
                          onChange={(e) => setForm({ ...form, title: e.target.value })}
                          className="bg-input/40"
                        />
                      </Field>
                      <Field label="Store">
                        <Input
                          value={form.store}
                          onChange={(e) => setForm({ ...form, store: e.target.value })}
                          className="bg-input/40"
                        />
                      </Field>
                      <Field label="Store logo (emoji)">
                        <Input
                          value={form.storeLogo}
                          onChange={(e) => setForm({ ...form, storeLogo: e.target.value })}
                          maxLength={4}
                          className="bg-input/40"
                        />
                      </Field>
                      <Field label="Original price" className="col-span-1">
                        <Input
                          type="number"
                          inputMode="decimal"
                          value={form.originalPrice}
                          onChange={(e) => setForm({ ...form, originalPrice: e.target.value })}
                          className="bg-input/40"
                        />
                      </Field>
                      <Field label="Deal price" className="col-span-1">
                        <Input
                          type="number"
                          inputMode="decimal"
                          value={form.dealPrice}
                          onChange={(e) => setForm({ ...form, dealPrice: e.target.value })}
                          className="bg-input/40"
                        />
                      </Field>
                      <Field label="URL" className="col-span-2">
                        <Input
                          type="url"
                          value={form.url}
                          onChange={(e) => setForm({ ...form, url: e.target.value })}
                          placeholder="https://…"
                          className="bg-input/40"
                        />
                      </Field>
                      <Field label="Category" className="col-span-2">
                        <Select
                          value={form.categorySlug}
                          onValueChange={(v) => setForm({ ...form, categorySlug: v })}
                        >
                          <SelectTrigger className="bg-input/40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((c) => (
                              <SelectItem key={c.slug} value={c.slug}>
                                {c.icon} {c.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                      <Field label="Description" className="col-span-2">
                        <Textarea
                          value={form.description}
                          onChange={(e) => setForm({ ...form, description: e.target.value })}
                          rows={2}
                          className="resize-none bg-input/40"
                        />
                      </Field>
                      <Field label="Tags (comma-separated)" className="col-span-2">
                        <Input
                          value={form.tags}
                          onChange={(e) => setForm({ ...form, tags: e.target.value })}
                          placeholder="headphones, wireless, sale"
                          className="bg-input/40"
                        />
                      </Field>
                      <div className="col-span-2 flex items-center justify-between rounded-lg border border-border/60 bg-card/40 px-3 py-2">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="flash-switch" className="cursor-pointer text-sm font-medium">
                            Flash deal
                          </Label>
                          <span className="text-xs text-muted-foreground">
                            Adds an urgency countdown
                          </span>
                        </div>
                        <Switch
                          id="flash-switch"
                          checked={form.flashDeal}
                          onCheckedChange={(v) => setForm({ ...form, flashDeal: v })}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          {showForm && (
            <div className="flex items-center justify-end gap-2 border-t border-border/60 bg-background/80 px-5 py-3">
              <Button variant="outline" onClick={() => setOpen(false)} disabled={publishing}>
                Cancel
              </Button>
              <Button
                onClick={handlePublish}
                disabled={publishing}
                className="bg-amber-500 text-amber-950 hover:bg-amber-400"
              >
                {publishing ? <Loader2 className="size-4 animate-spin" /> : <Rocket className="size-4" />}
                Publish to feed
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
