import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  fallback: [
    "ui-sans-serif",
    "system-ui",
    "-apple-system",
    "Segoe UI",
    "Roboto",
    "Helvetica",
    "Arial",
    "sans-serif",
  ],
});

export const metadata: Metadata = {
  title:
    "Make This Deal — Global Enterprise Marketplace | Together We Grow Strong",
  description:
    "Buy, sell, invest in, and showcase complete businesses worldwide. SaaS, Real Estate, Startups, E-commerce, AI Solutions, FinTech, and 50+ categories. Trusted by businesses in 120+ countries.",
  keywords: [
    "buy a business",
    "sell a business",
    "acquire SaaS",
    "business for sale",
    "invest in startups",
    "AI valuation",
    "M&A marketplace",
    "enterprise marketplace",
    "Make This Deal",
    "makethisdeal.biz",
  ],
  authors: [{ name: "Make This Deal" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title:
      "Make This Deal — Global Enterprise Marketplace | Together We Grow Strong",
    description:
      "Buy, sell, invest in, and showcase complete businesses worldwide. SaaS, Real Estate, Startups, E-commerce, AI Solutions, and more.",
    url: "https://makethisdeal.biz",
    siteName: "Make This Deal",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Make This Deal — Global Enterprise Marketplace",
    description:
      "Buy, sell, and invest in complete businesses worldwide. Together We Grow Strong.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster
          position="bottom-right"
          theme="light"
          toastOptions={{
            classNames: {
              toast:
                "bg-card border-border text-foreground rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.08)]",
              description: "text-muted-foreground",
            },
          }}
        />
      </body>
    </html>
  );
}
