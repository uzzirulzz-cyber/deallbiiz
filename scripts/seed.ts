import { db } from "../src/lib/db";

// Real categories from makethisdeal.biz (18 industries)
const categories = [
  { name: "SaaS", slug: "saas", icon: "☁️", color: "orange", blurb: "Cloud software businesses with recurring revenue" },
  { name: "AI Solutions", slug: "ai", icon: "🤖", color: "violet", blurb: "AI products, models, and automation tools" },
  { name: "E-commerce", slug: "ecommerce", icon: "🛒", color: "rose", blurb: "DTC stores, marketplaces, and online retailers" },
  { name: "Real Estate", slug: "realestate", icon: "🏢", color: "emerald", blurb: "Commercial, residential, and mixed-use properties" },
  { name: "Mobile Apps", slug: "mobileapps", icon: "📱", color: "sky", blurb: "iOS & Android apps with active user bases" },
  { name: "Startups", slug: "startups", icon: "🚀", color: "amber", blurb: "Early-stage ventures and pre-revenue ideas" },
  { name: "FinTech", slug: "fintech", icon: "💳", color: "lime", blurb: "Payments, lending, and financial platforms" },
  { name: "HealthTech", slug: "healthtech", icon: "🩺", color: "teal", blurb: "Digital health, telemedicine, and medtech" },
  { name: "EdTech", slug: "edtech", icon: "📚", color: "indigo", blurb: "Learning platforms and education tools" },
  { name: "Cybersecurity", slug: "cybersecurity", icon: "🛡️", color: "red", blurb: "Security software and threat-intel services" },
  { name: "CRM/ERP", slug: "crmerp", icon: "⚙️", color: "slate", blurb: "Business operations and customer software" },
  { name: "Retail", slug: "retail", icon: "🏪", color: "orange", blurb: "Brick-and-mortar and omnichannel retail" },
  { name: "Wholesale", slug: "wholesale", icon: "📦", color: "stone", blurb: "Distribution and B2B supply businesses" },
  { name: "Investments", slug: "investments", icon: "📈", color: "emerald", blurb: "Equity stakes, funds, and investment opportunities" },
  { name: "Domains", slug: "domains", icon: "🌐", color: "sky", blurb: "Premium domain names and digital real estate" },
  { name: "Digital Products", slug: "digitalproducts", icon: "🎨", color: "fuchsia", blurb: "Templates, courses, and digital assets" },
  { name: "Manufacturing", slug: "manufacturing", icon: "🏭", color: "zinc", blurb: "Production facilities and industrial operations" },
  { name: "Websites", slug: "websites", icon: "💻", color: "blue", blurb: "Content sites, blogs, and online communities" },
];

const now = Date.now();
const days = (d: number) => new Date(now + d * 86400_000);

interface SeedListing {
  title: string; tagline: string; description: string; categorySlug: string;
  askingPrice: number; valuation: number; annualRevenue: number; annualProfit: number;
  stage: string; location: string; ageYears: number; employees: number;
  verified: boolean; featured: boolean; trending: boolean;
  imageUrl: string; metrics: string; tags: string; url: string; rating: number;
}

const listings: SeedListing[] = [
  // SaaS
  {
    title: "CloudInbox — Email Automation SaaS",
    tagline: "$480K ARR · 92% gross margins · 4 years old",
    description: "Profitable B2B email automation platform serving 1,200+ paying customers across 38 countries. Sticky product with 96% logo retention and a clean, well-documented codebase. Founder seeking exit to focus on a new venture.",
    categorySlug: "saas", askingPrice: 1_200_000, valuation: 1_280_000,
    annualRevenue: 480_000, annualProfit: 310_000, stage: "Growth",
    location: "Remote / Global", ageYears: 4, employees: 6,
    verified: true, featured: true, trending: true,
    imageUrl: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&q=80",
    metrics: "1,200 customers, 96% retention, 4.9 NPS", tags: "saas,b2b,automation,recurring revenue",
    url: "https://makethisdeal.biz/listing/cloudinbox", rating: 4.9,
  },
  {
    title: "TaskPilot — Project Management for Agencies",
    tagline: "$210K ARR · bootstrapped · 3.5 years old",
    description: "Niche PM tool purpose-built for creative agencies. Strong organic growth, 0% churn in last 2 quarters. Integrations with Slack, Figma, and QuickBooks included.",
    categorySlug: "saas", askingPrice: 620_000, valuation: 600_000,
    annualRevenue: 210_000, annualProfit: 145_000, stage: "Growth",
    location: "Remote / Global", ageYears: 4, employees: 3,
    verified: true, featured: false, trending: true,
    imageUrl: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&q=80",
    metrics: "740 customers, 0% churn (2Q), 18% MoM growth", tags: "saas,pm,agencies,bootstrap",
    url: "https://makethisdeal.biz/listing/taskpilot", rating: 4.7,
  },
  // AI Solutions
  {
    title: "ResumeAI — AI Resume Builder & Optimizer",
    tagline: "$340K ARR · 180K users · 2 years old",
    description: "Consumer AI resume builder with a viral free-tier funnel. 180K registered users, 12K paid. GPT-powered tailoring + ATS scoring. Strong SEO and a 22% free-to-paid conversion on paid plans.",
    categorySlug: "ai", askingPrice: 980_000, valuation: 1_050_000,
    annualRevenue: 340_000, annualProfit: 190_000, stage: "Growth",
    location: "Remote / Global", ageYears: 2, employees: 4,
    verified: true, featured: true, trending: true,
    imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
    metrics: "180K users, 12K paid, 22% conv.", tags: "ai,gpt,consumer,resume",
    url: "https://makethisdeal.biz/listing/resumeai", rating: 4.8,
  },
  {
    title: "VisionQC — AI Defect Detection for Manufacturing",
    tagline: "$520K ARR · 6 enterprise clients · 3 years old",
    description: "Computer-vision QA platform deployed in 14 factories across APAC. 99.2% defect-detection accuracy. Long-term enterprise contracts (avg 3yr, $85K ACV).",
    categorySlug: "ai", askingPrice: 1_650_000, valuation: 1_700_000,
    annualRevenue: 520_000, annualProfit: 280_000, stage: "Established",
    location: "Singapore / APAC", ageYears: 3, employees: 9,
    verified: true, featured: false, trending: false,
    imageUrl: "https://images.unsplash.com/photo-1565043666747-69f6646db940?w=800&q=80",
    metrics: "6 enterprise clients, 99.2% accuracy, $85K ACV", tags: "ai,vision,enterprise,manufacturing",
    url: "https://makethisdeal.biz/listing/visionqc", rating: 4.8,
  },
  // E-commerce
  {
    title: "PetSupplies Direct — DTC Pet Brand",
    tagline: "$1.8M TTM revenue · 38% gross margin · 5 years old",
    description: "Bootstrapped DTC pet-supplies brand with 47K repeat customers and a 32% repeat-purchase rate. Strong Shopify presence, owned warehouse, 4 private-label SKUs.",
    categorySlug: "ecommerce", askingPrice: 900_000, valuation: 950_000,
    annualRevenue: 1_800_000, annualProfit: 240_000, stage: "Established",
    location: "Austin, USA", ageYears: 5, employees: 8,
    verified: true, featured: true, trending: true,
    imageUrl: "https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=800&q=80",
    metrics: "$1.8M TTM, 47K customers, 32% repeat", tags: "ecommerce,dtc,pet,shopify",
    url: "https://makethisdeal.biz/listing/petsupplies", rating: 4.6,
  },
  {
    title: "GreenLeaf Co. — Sustainable Home Goods Store",
    tagline: "$640K revenue · eco niche · 3 years old",
    description: "Eco-friendly home goods e-commerce with a mission-driven brand. 28K Instagram followers, strong organic traffic. Dropship + 11 owned SKUs.",
    categorySlug: "ecommerce", askingPrice: 280_000, valuation: 300_000,
    annualRevenue: 640_000, annualProfit: 95_000, stage: "Growth",
    location: "Remote / USA", ageYears: 3, employees: 4,
    verified: true, featured: false, trending: false,
    imageUrl: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=800&q=80",
    metrics: "$640K rev, 28K IG, 11 SKUs", tags: "ecommerce,eco,home,shopify",
    url: "https://makethisdeal.biz/listing/greenleaf", rating: 4.5,
  },
  // Real Estate
  {
    title: "8-Unit Mixed-Use Building — Downtown Karachi",
    tagline: "$132K/yr net rent · 100% occupied · prime location",
    description: "Fully-occupied mixed-use building (4 retail + 4 residential) on a high-footfall street in Saddar, Karachi. 100% occupancy, 6-year avg tenant tenure, recent structural certification.",
    categorySlug: "realestate", askingPrice: 1_400_000, valuation: 1_450_000,
    annualRevenue: 158_000, annualProfit: 132_000, stage: "Established",
    location: "Karachi, Pakistan", ageYears: 22, employees: 2,
    verified: true, featured: true, trending: false,
    imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80",
    metrics: "8 units, 100% occupied, 6yr tenant tenure", tags: "realestate,mixed-use,karachi,income",
    url: "https://makethisdeal.biz/listing/saddar-building", rating: 4.7,
  },
  {
    title: "Co-Working Space — 240 Desks, Lahore",
    tagline: "$420K/yr revenue · 78% occupancy · turnkey",
    description: "Operational co-working space in DHA Lahore with 240 desks, 12 private cabins, 2 meeting rooms, and a 78% occupancy rate. Fully staffed, profitable from month 9.",
    categorySlug: "realestate", askingPrice: 880_000, valuation: 900_000,
    annualRevenue: 420_000, annualProfit: 140_000, stage: "Established",
    location: "Lahore, Pakistan", ageYears: 3, employees: 7,
    verified: true, featured: false, trending: true,
    imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
    metrics: "240 desks, 78% occ., 12 cabins", tags: "realestate,coworking,lahore,turnkey",
    url: "https://makethisdeal.biz/listing/coworking-lahore", rating: 4.6,
  },
  // Mobile Apps
  {
    title: "FocusFlow — Productivity App",
    tagline: "180K MAU · 4.8★ rating · 3 years old",
    description: "Minimalist focus-timer & habit tracker with 180K monthly active users and a 4.8★ rating across 1,400 reviews. Freemium model, 4% paid conversion.",
    categorySlug: "mobileapps", askingPrice: 300_000, valuation: 320_000,
    annualRevenue: 95_000, annualProfit: 60_000, stage: "Growth",
    location: "Remote / Global", ageYears: 3, employees: 2,
    verified: true, featured: false, trending: true,
    imageUrl: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&q=80",
    metrics: "180K MAU, 4.8★, 4% conv.", tags: "mobile,productivity,freemium,ios",
    url: "https://makethisdeal.biz/listing/focusflow", rating: 4.8,
  },
  // Startups
  {
    title: "QuickMed — Telehealth Platform (Pre-Revenue)",
    tagline: "MVP live · 3 pilot clinics · seeking seed exit",
    description: "Telehealth platform connecting patients with GPs via video. MVP live, 3 pilot clinics in Karachi, regulatory groundwork complete. Founder open to a seed-stage acquisition.",
    categorySlug: "startups", askingPrice: 80_000, valuation: 90_000,
    annualRevenue: 12_000, annualProfit: -24_000, stage: "Startup",
    location: "Karachi, Pakistan", ageYears: 1, employees: 2,
    verified: true, featured: false, trending: false,
    imageUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80",
    metrics: "MVP live, 3 pilot clinics, regulated", tags: "startup,telehealth,karachi,mvp",
    url: "https://makethisdeal.biz/listing/quickmed", rating: 4.3,
  },
  // FinTech
  {
    title: "PayBridge — B2B Cross-Border Payments",
    tagline: "$950K ARR · $14M TPV · regulated",
    description: "B2B payments platform processing $14M/yr in cross-border invoices for SMEs. Licensed in UAE & Pakistan. 340 active business clients, 1.2% take rate.",
    categorySlug: "fintech", askingPrice: 2_400_000, valuation: 2_500_000,
    annualRevenue: 950_000, annualProfit: 320_000, stage: "Growth",
    location: "Dubai, UAE", ageYears: 3, employees: 11,
    verified: true, featured: true, trending: true,
    imageUrl: "https://images.unsplash.com/photo-1565514020179-026b92b84bb6?w=800&q=80",
    metrics: "$14M TPV, 340 clients, licensed", tags: "fintech,payments,cross-border,regulated",
    url: "https://makethisdeal.biz/listing/paybridge", rating: 4.7,
  },
  // HealthTech
  {
    title: "CareSync — Clinic Management for 42 Clinics",
    tagline: "$680K ARR · 42 clinics · sticky B2B",
    description: "Clinic management SaaS used by 42 multi-location clinics across Pakistan. Handles bookings, EMR, billing, and pharmacy. 98% gross retention, 5yr avg contract.",
    categorySlug: "healthtech", askingPrice: 1_800_000, valuation: 1_850_000,
    annualRevenue: 680_000, annualProfit: 410_000, stage: "Established",
    location: "Lahore, Pakistan", ageYears: 6, employees: 14,
    verified: true, featured: false, trending: false,
    imageUrl: "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=800&q=80",
    metrics: "42 clinics, 98% retention, 5yr ACV", tags: "healthtech,saas,clinics,emr",
    url: "https://makethisdeal.biz/listing/caresync", rating: 4.8,
  },
  // EdTech
  {
    title: "LinguaLive — Live Language Tutoring",
    tagline: "$340K ARR · 2,800 tutors · 5 years old",
    description: "Marketplace connecting 2,800 vetted tutors with learners across 12 languages. $340K ARR, take rate 18%, profitable since year 3. Strong unit economics.",
    categorySlug: "edtech", askingPrice: 780_000, valuation: 800_000,
    annualRevenue: 340_000, annualProfit: 95_000, stage: "Growth",
    location: "Remote / Global", ageYears: 5, employees: 5,
    verified: true, featured: false, trending: false,
    imageUrl: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80",
    metrics: "2,800 tutors, 12 languages, 18% take", tags: "edtech,marketplace,tutoring,live",
    url: "https://makethisdeal.biz/listing/lingualive", rating: 4.6,
  },
  // Cybersecurity
  {
    title: "SentinelScan — Vulnerability Scanner SaaS",
    tagline: "$520K ARR · SOC 2 Type II · 4 years old",
    description: "Automated vulnerability scanner for SMBs. SOC 2 Type II certified, 640 paying business customers, 91% net retention. Channel partner program contributes 30% of new revenue.",
    categorySlug: "cybersecurity", askingPrice: 1_600_000, valuation: 1_650_000,
    annualRevenue: 520_000, annualProfit: 300_000, stage: "Established",
    location: "Remote / Global", ageYears: 4, employees: 8,
    verified: true, featured: false, trending: true,
    imageUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80",
    metrics: "640 clients, SOC 2, 91% NRR", tags: "cybersecurity,saas,soc2,scanner",
    url: "https://makethisdeal.biz/listing/sentinelscan", rating: 4.7,
  },
  // Domains
  {
    title: "cloudpeak.io — Premium .io Domain",
    tagline: "Short, brandable, tech-friendly",
    description: "Premium 2-word .io domain, ideal for a cloud-infrastructure or dev-tools startup. Clean ownership history, no trademarks, easy transfer via escrow.",
    categorySlug: "domains", askingPrice: 45_000, valuation: 48_000,
    annualRevenue: 0, annualProfit: 0, stage: "Established",
    location: "Digital / Global", ageYears: 6, employees: 0,
    verified: true, featured: false, trending: false,
    imageUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80",
    metrics: "2-word .io, brandable, no TM", tags: "domain,premium,io,brandable",
    url: "https://makethisdeal.biz/listing/cloudpeak-domain", rating: 4.5,
  },
  // Websites
  {
    title: "RecipeHub.com — 2.4M visits/mo Food Blog",
    tagline: "$140K/yr ad revenue · 5 years old · evergreen",
    description: "Established recipe site with 2.4M monthly visits (72% organic). Monetized via display ads + 3 sponsored partnerships. Evergreen content, minimal maintenance.",
    categorySlug: "websites", askingPrice: 220_000, valuation: 230_000,
    annualRevenue: 140_000, annualProfit: 120_000, stage: "Established",
    location: "Remote / Global", ageYears: 5, employees: 1,
    verified: true, featured: false, trending: false,
    imageUrl: "https://images.unsplash.com/photo-1495521821757-a1efb6729472?w=800&q=80",
    metrics: "2.4M visits/mo, 72% organic, $140K/yr", tags: "website,content,ads,seo",
    url: "https://makethisdeal.biz/listing/recipehub", rating: 4.6,
  },
  // CRM/ERP
  {
    title: "FlowOps — ERP for Mid-Sized Manufacturers",
    tagline: "$720K ARR · 38 clients · 7 years old",
    description: "Purpose-built ERP for mid-sized manufacturers (50-500 staff). 38 clients, $19K avg ACV, 94% retention. Includes inventory, production, and procurement modules.",
    categorySlug: "crmerp", askingPrice: 2_100_000, valuation: 2_150_000,
    annualRevenue: 720_000, annualProfit: 430_000, stage: "Established",
    location: "Remote / Global", ageYears: 7, employees: 12,
    verified: true, featured: false, trending: false,
    imageUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80",
    metrics: "38 clients, $19K ACV, 94% ret.", tags: "erp,manufacturing,saas,b2b",
    url: "https://makethisdeal.biz/listing/flowops", rating: 4.7,
  },
  // Digital Products
  {
    title: "DesignVault — 1,200+ Premium UI Kit Bundle",
    tagline: "$190K TTM · 9,000 customers · digital-only",
    description: "Bundle of 1,200+ premium UI components, templates, and icon sets sold via Gumroad and own site. 9,000 customers, 60% margin, fully digital delivery.",
    categorySlug: "digitalproducts", askingPrice: 360_000, valuation: 380_000,
    annualRevenue: 190_000, annualProfit: 130_000, stage: "Growth",
    location: "Remote / Global", ageYears: 3, employees: 2,
    verified: true, featured: false, trending: false,
    imageUrl: "https://images.unsplash.com/photo-1561070791-2526d30994b8?w=800&q=80",
    metrics: "1,200 assets, 9K customers, 60% margin", tags: "digital,ui-kit,templates,bundle",
    url: "https://makethisdeal.biz/listing/designvault", rating: 4.6,
  },
  // Investments
  {
    title: "20% Equity Stake — Logistics Tech Startup",
    tagline: "Series A · $4M post-money · secondary sale",
    description: "Secondary sale of 20% equity in a Series-A logistics-tech startup. $4M post-money valuation, $1.1M ARR, growing 15% MoM. Clean cap table, lead investor supportive.",
    categorySlug: "investments", askingPrice: 800_000, valuation: 800_000,
    annualRevenue: 1_100_000, annualProfit: -180_000, stage: "Growth",
    location: "Remote / APAC", ageYears: 2, employees: 18,
    verified: true, featured: false, trending: false,
    imageUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80",
    metrics: "20% stake, $4M post, 15% MoM", tags: "investment,equity,secondary,series-a",
    url: "https://makethisdeal.biz/listing/logistics-equity", rating: 4.5,
  },
];

async function main() {
  console.log("Seeding categories...");
  await db.category.deleteMany({});
  for (const c of categories) {
    await db.category.create({ data: c });
  }

  console.log("Seeding listings...");
  await db.listing.deleteMany({});
  for (const l of listings) {
    const revenueMultiple = l.annualRevenue > 0 ? Math.round((l.askingPrice / l.annualRevenue) * 100) / 100 : 0;
    const profitMultiple = l.annualProfit > 0 ? Math.round((l.askingPrice / l.annualProfit) * 100) / 100 : 0;
    await db.listing.create({
      data: {
        ...l,
        revenueMultiple,
        profitMultiple,
      },
    });
  }

  console.log(`Seeded ${categories.length} categories and ${listings.length} business listings.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
