import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "makethisdeal.biz — Premium Deals, Hand-Picked Daily",
  description:
    "Make This Deal — hand-picked premium daily & flash deals. Live countdowns, AI deal finder, snap-a-deal AI, and real-time web deal search.",
  keywords: [
    "deals",
    "flash deals",
    "daily deals",
    "discounts",
    "AI deal finder",
    "makethisdeal",
    "coupons",
    "sale",
  ],
  authors: [{ name: "makethisdeal.biz" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "makethisdeal.biz — Premium Deals, Hand-Picked Daily",
    description:
      "Live countdowns, AI deal finder, snap-a-deal AI, and real-time web deal search.",
    url: "https://makethisdeal.biz",
    siteName: "makethisdeal.biz",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "makethisdeal.biz — Premium Deals, Hand-Picked Daily",
    description:
      "Live countdowns, AI deal finder, snap-a-deal AI, and real-time web deal search.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster
          position="bottom-right"
          theme="dark"
          toastOptions={{
            classNames: {
              toast:
                "bg-card border-border text-foreground rounded-xl shadow-lg",
            },
          }}
        />
      </body>
    </html>
  );
}
