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
import { toast } from "sonner";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

import { useMarketplaceStore } from "./use-marketplace-store";
import {
  analyzeListingImage,
  createListing,
  fetchCategories,
} from "./api";
import type { AnalyzedListing, Stage } from "./types";

/**
 * Generate a realistic business-listing card on a canvas so the "Try sample"
 * button produces a valid image the VLM can actually read and extract from.
 */
function generateSampleListingImage(): string {
  const W = 720;
  const H = 540;
  if (typeof document === "undefined") return "";
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  // Dark navy background
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, "#1A1D2E");
  grad.addColorStop(1, "#2C2E3E");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Top accent bar
  ctx.fillStyle = "#FF7A00";
  ctx.fillRect(0, 0, W, 6);

  // Category pill (top-left)
  ctx.fillStyle = "rgba(255, 122, 0, 0.18)";
  ctx.fillRect(32, 32, 110, 32);
  ctx.fillStyle = "#FFB775";
  ctx.font = "bold 13px sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("☁ SAAS", 46, 53);

  // Verified badge (top-right)
  ctx.fillStyle = "#10B981";
  ctx.fillRect(W - 132, 32, 100, 32);
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 12px sans-serif";
  ctx.fillText("✓ VERIFIED", W - 124, 53);

  // Business name
  ctx.textAlign = "left";
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 32px sans-serif";
  ctx.fillText("Acme SaaS Corp", 32, 120);

  // Tagline
  ctx.fillStyle = "#9CA3AF";
  ctx.font = "16px sans-serif";
  ctx.fillText("B2B email automation platform · 4 years old", 32, 148);

  // Asking price label
  ctx.fillStyle = "#9CA3AF";
  ctx.font = "bold 11px sans-serif";
  ctx.fillText("ASKING PRICE", 32, 200);

  // Big asking price
  ctx.fillStyle = "#FF7A00";
  ctx.font = "bold 56px sans-serif";
  ctx.fillText("$1.8M", 32, 254);

  // Stage badge
  ctx.fillStyle = "rgba(255, 122, 0, 0.20)";
  ctx.fillRect(W - 156, 218, 124, 32);
  ctx.fillStyle = "#FFB775";
  ctx.font = "bold 12px sans-serif";
  ctx.fillText("GROWTH STAGE", W - 148, 240);

  // Metrics row
  const metricY = 290;
  ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
  ctx.fillRect(32, metricY, 196, 70);
  ctx.fillRect(244, metricY, 196, 70);
  ctx.fillRect(456, metricY, 232, 70);

  // ARR
  ctx.fillStyle = "#9CA3AF";
  ctx.font = "bold 11px sans-serif";
  ctx.fillText("ANNUAL REVENUE", 48, metricY + 24);
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 26px sans-serif";
  ctx.fillText("$620K / yr", 48, metricY + 56);

  // Margins
  ctx.fillStyle = "#9CA3AF";
  ctx.font = "bold 11px sans-serif";
  ctx.fillText("PROFIT MARGIN", 260, metricY + 24);
  ctx.fillStyle = "#10B981";
  ctx.font = "bold 26px sans-serif";
  ctx.fillText("92% margins", 260, metricY + 56);

  // Multiple
  ctx.fillStyle = "#9CA3AF";
  ctx.font = "bold 11px sans-serif";
  ctx.fillText("REVENUE MULTIPLE", 472, metricY + 24);
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 26px sans-serif";
  ctx.fillText("2.9x revenue", 472, metricY + 56);

  // Customers / employees row
  ctx.fillStyle = "#9CA3AF";
  ctx.font = "14px sans-serif";
  ctx.fillText(
    "• 1,200 customers · 96% retention · 6 employees",
    32,
    410,
  );

  // Chart icon area (simple bar chart)
  ctx.fillStyle = "#FF7A00";
  ctx.fillRect(32, 440, 14, 50);
  ctx.fillStyle = "#FF7A00";
  ctx.globalAlpha = 0.85;
  ctx.fillRect(52, 455, 14, 35);
  ctx.globalAlpha = 0.7;
  ctx.fillRect(72, 445, 14, 45);
  ctx.globalAlpha = 0.55;
  ctx.fillRect(92, 425, 14, 65);
  ctx.globalAlpha = 1;

  // Growth label
  ctx.fillStyle = "#10B981";
  ctx.font = "bold 16px sans-serif";
  ctx.fillText("▲ +42% YoY", 124, 470);

  // Footer
  ctx.fillStyle = "#6B7280";
  ctx.font = "12px sans-serif";
  ctx.fillText(
    "makethisdeal.biz · Together We Grow Strong",
    32,
    514,
  );

  return canvas.toDataURL("image/png");
}

interface FormState {
  title: string;
  tagline: string;
  description: string;
  categorySlug: string;
  askingPrice: string;
  annualRevenue: string;
  annualProfit: string;
  stage: Stage;
  location: string;
  ageYears: string;
  employees: string;
  imageUrl: string;
  url: string;
  metrics: string;
  tags: string;
}

const emptyForm: FormState = {
  title: "",
  tagline: "",
  description: "",
  categorySlug: "saas",
  askingPrice: "",
  annualRevenue: "",
  annualProfit: "",
  stage: "Startup",
  location: "",
  ageYears: "",
  employees: "",
  imageUrl: "",
  url: "",
  metrics: "",
  tags: "",
};

function fromAnalyzed(d: AnalyzedListing): FormState {
  return {
    title: d.title || "",
    tagline: d.tagline || "",
    description: d.description || "",
    categorySlug: d.categorySlug || "saas",
    askingPrice: d.askingPrice ? String(d.askingPrice) : "",
    annualRevenue: d.annualRevenue ? String(d.annualRevenue) : "",
    annualProfit: d.annualProfit ? String(d.annualProfit) : "",
    stage: d.stage || "Startup",
    location: d.location || "",
    ageYears: d.ageYears ? String(d.ageYears) : "",
    employees: d.employees ? String(d.employees) : "",
    imageUrl: "",
    url: "",
    metrics: d.metrics || "",
    tags: d.tags || "",
  };
}

export function SnapAListing() {
  const open = useMarketplaceStore((s) => s.snapOpen);
  const setOpen = useMarketplaceStore((s) => s.setSnapOpen);
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
      const res = await analyzeListingImage(imageDataUrl);
      setForm(fromAnalyzed(res.listing));
      setShowForm(true);
      toast.success("Listing extracted ✨", {
        description: `Detected ${
          res.listing.title || "a business"
        }${
          typeof res.listing.confidence === "number"
            ? ` · ${(res.listing.confidence * 100).toFixed(0)}% confidence`
            : ""
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
    if (!form.title || !form.askingPrice) {
      toast.error("Please fill in the title and asking price");
      return;
    }
    setPublishing(true);
    try {
      const FALLBACK_IMG =
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80";
      await createListing({
        title: form.title,
        tagline: form.tagline,
        description: form.description,
        categorySlug: form.categorySlug,
        askingPrice: Number(form.askingPrice),
        annualRevenue: Number(form.annualRevenue) || 0,
        annualProfit: Number(form.annualProfit) || 0,
        stage: form.stage,
        location: form.location || "Remote / Global",
        ageYears: Number(form.ageYears) || 0,
        employees: Number(form.employees) || 0,
        imageUrl: form.imageUrl || preview || FALLBACK_IMG,
        metrics: form.metrics,
        tags: form.tags,
        url: form.url,
      });
      await queryClient.invalidateQueries({ queryKey: ["listings"] });
      await queryClient.invalidateQueries({ queryKey: ["trending"] });
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Listing published! 🚀", {
        description:
          "It'll appear in the feed after a quick review by our team.",
      });
      setOpen(false);
    } catch (e) {
      toast.error("Couldn't publish listing", {
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
      <DialogContent className="max-h-[92vh] overflow-hidden rounded-3xl border-[#E5E7EB] bg-white p-0 sm:max-w-lg">
        <div className="flex max-h-[92vh] flex-col">
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-[#E5E7EB] bg-gradient-to-r from-[#FF7A00]/10 to-transparent px-5 py-4">
            <span className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-[#FF7A00] to-[#FF8C32] text-white shadow-[0_4px_14px_rgba(255,122,0,0.28)]">
              <ScanLine className="size-5" />
            </span>
            <DialogHeader className="p-0">
              <DialogTitle className="text-base font-bold text-[#111827]">
                List a Business ✨
              </DialogTitle>
              <DialogDescription className="text-xs">
                Upload a financial screenshot — AI extracts the details, you
                publish.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4">
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
                  if (e.key === "Enter" || e.key === " ")
                    fileInputRef.current?.click();
                }}
                className={cn(
                  "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-colors",
                  dragOver
                    ? "border-[#FF7A00]/60 bg-[#FFF8F2]"
                    : "border-[#E5E7EB] bg-[#FAFAFB] hover:border-[#FF7A00]/40",
                )}
              >
                <span className="grid size-12 place-items-center rounded-full bg-[#FFF4EB] text-[#FF7A00]">
                  <ImagePlus className="size-6" />
                </span>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium text-[#111827]">
                    Drag &amp; drop a business screenshot
                  </p>
                  <p className="text-xs text-[#6B7280]">
                    A financial dashboard, listing card, or revenue report ·
                    PNG/JPG up to 6MB
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-1 rounded-full border-[#E5E7EB] bg-white text-[#111827] hover:border-[#FF7A00]/40"
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
                    const dataUrl = generateSampleListingImage();
                    if (!dataUrl) return;
                    setPreview(dataUrl);
                    void analyze(dataUrl);
                  }}
                  className="text-xs font-medium text-[#FF7A00] underline-offset-2 hover:underline"
                >
                  or try a sample business card
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
                <div className="relative overflow-hidden rounded-2xl border border-[#E5E7EB] bg-[#FAFAFB]">
                  <img
                    src={preview}
                    alt="Listing screenshot preview"
                    className="max-h-64 w-full object-contain"
                  />
                  {analyzing && (
                    <div className="absolute inset-0 grid place-items-center bg-white/80 backdrop-blur-sm">
                      <div className="flex flex-col items-center gap-2 text-center">
                        <Loader2 className="size-8 animate-spin text-[#FF7A00]" />
                        <p className="text-sm font-semibold text-[#111827]">
                          Analyzing with AI…
                        </p>
                        <p className="text-xs text-[#6B7280]">
                          Extracting business financials from your image
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
                    <h3 className="text-sm font-semibold text-[#111827]">
                      Review &amp; publish
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Business title" className="col-span-2">
                        <Input
                          value={form.title}
                          onChange={(e) =>
                            setForm({ ...form, title: e.target.value })
                          }
                          className="bg-white"
                        />
                      </Field>
                      <Field label="Tagline" className="col-span-2">
                        <Input
                          value={form.tagline}
                          onChange={(e) =>
                            setForm({ ...form, tagline: e.target.value })
                          }
                          placeholder="$620K ARR · 92% margins · 4 years old"
                          className="bg-white"
                        />
                      </Field>
                      <Field label="Category" className="col-span-2">
                        <Select
                          value={form.categorySlug}
                          onValueChange={(v) =>
                            setForm({ ...form, categorySlug: v })
                          }
                        >
                          <SelectTrigger className="bg-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl">
                            {categories.map((c) => (
                              <SelectItem key={c.slug} value={c.slug}>
                                {c.icon} {c.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                      <Field label="Asking price (USD)">
                        <Input
                          type="number"
                          inputMode="decimal"
                          value={form.askingPrice}
                          onChange={(e) =>
                            setForm({ ...form, askingPrice: e.target.value })
                          }
                          className="bg-white"
                        />
                      </Field>
                      <Field label="Stage">
                        <Select
                          value={form.stage}
                          onValueChange={(v) =>
                            setForm({ ...form, stage: v as Stage })
                          }
                        >
                          <SelectTrigger className="bg-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl">
                            <SelectItem value="Startup">Startup</SelectItem>
                            <SelectItem value="Growth">Growth</SelectItem>
                            <SelectItem value="Established">
                              Established
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </Field>
                      <Field label="Annual revenue (USD)">
                        <Input
                          type="number"
                          inputMode="decimal"
                          value={form.annualRevenue}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              annualRevenue: e.target.value,
                            })
                          }
                          className="bg-white"
                        />
                      </Field>
                      <Field label="Annual profit (USD)">
                        <Input
                          type="number"
                          inputMode="decimal"
                          value={form.annualProfit}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              annualProfit: e.target.value,
                            })
                          }
                          className="bg-white"
                        />
                      </Field>
                      <Field label="Location">
                        <Input
                          value={form.location}
                          onChange={(e) =>
                            setForm({ ...form, location: e.target.value })
                          }
                          placeholder="Karachi, Pakistan"
                          className="bg-white"
                        />
                      </Field>
                      <Field label="Listing URL (optional)">
                        <Input
                          type="url"
                          value={form.url}
                          onChange={(e) =>
                            setForm({ ...form, url: e.target.value })
                          }
                          placeholder="https://…"
                          className="bg-white"
                        />
                      </Field>
                      <Field label="Years in business">
                        <Input
                          type="number"
                          inputMode="numeric"
                          value={form.ageYears}
                          onChange={(e) =>
                            setForm({ ...form, ageYears: e.target.value })
                          }
                          className="bg-white"
                        />
                      </Field>
                      <Field label="Employees">
                        <Input
                          type="number"
                          inputMode="numeric"
                          value={form.employees}
                          onChange={(e) =>
                            setForm({ ...form, employees: e.target.value })
                          }
                          className="bg-white"
                        />
                      </Field>
                      <Field
                        label="Image URL (optional)"
                        className="col-span-2"
                      >
                        <Input
                          type="url"
                          value={form.imageUrl}
                          onChange={(e) =>
                            setForm({ ...form, imageUrl: e.target.value })
                          }
                          placeholder="https://images.unsplash.com/…"
                          className="bg-white"
                        />
                      </Field>
                      <Field
                        label="Headline metrics"
                        className="col-span-2"
                      >
                        <Input
                          value={form.metrics}
                          onChange={(e) =>
                            setForm({ ...form, metrics: e.target.value })
                          }
                          placeholder="1,200 customers, 96% retention"
                          className="bg-white"
                        />
                      </Field>
                      <Field
                        label="Description"
                        className="col-span-2"
                      >
                        <Textarea
                          value={form.description}
                          onChange={(e) =>
                            setForm({ ...form, description: e.target.value })
                          }
                          rows={2}
                          className="resize-none bg-white"
                        />
                      </Field>
                      <Field
                        label="Tags (comma-separated)"
                        className="col-span-2"
                      >
                        <Input
                          value={form.tags}
                          onChange={(e) =>
                            setForm({ ...form, tags: e.target.value })
                          }
                          placeholder="saas, b2b, email-automation"
                          className="bg-white"
                        />
                      </Field>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {showForm && (
            <div className="flex items-center justify-end gap-2 border-t border-[#E5E7EB] bg-[#FAFAFB] px-5 py-3">
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={publishing}
                className="rounded-full border-[#E5E7EB]"
              >
                Cancel
              </Button>
              <Button
                onClick={handlePublish}
                disabled={publishing}
                className="rounded-full bg-[#FF7A00] text-white shadow-[0_4px_14px_rgba(255,122,0,0.24)] hover:bg-[#FF8C32]"
              >
                {publishing ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Rocket className="size-4" />
                )}
                Publish to marketplace
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
      <Label className="text-xs font-medium text-[#6B7280]">{label}</Label>
      {children}
    </div>
  );
}
