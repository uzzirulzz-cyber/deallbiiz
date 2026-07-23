import { db } from "../src/lib/db";

const categories = [
  { name: "Tech & Gadgets", slug: "tech", icon: "💻", color: "amber" },
  { name: "Fashion", slug: "fashion", icon: "👟", color: "rose" },
  { name: "Home & Living", slug: "home", icon: "🛋️", color: "emerald" },
  { name: "Gaming", slug: "gaming", icon: "🎮", color: "violet" },
  { name: "Beauty", slug: "beauty", icon: "💄", color: "pink" },
  { name: "Travel", slug: "travel", icon: "✈️", color: "sky" },
  { name: "Fitness", slug: "fitness", icon: "💪", color: "lime" },
  { name: "Food & Drink", slug: "food", icon: "🍜", color: "orange" },
];

function pct(off: number, price: number) {
  return Math.round(((off - price) / off) * 100);
}

const now = Date.now();
const hours = (h: number) => new Date(now + h * 3600_000);
const days = (d: number) => new Date(now + d * 86400_000);

const deals = [
  // TECH
  {
    title: "AuraBuds Pro 2 — Active Noise Cancelling Wireless Earbuds",
    description: "Studio-grade ANC earbuds with 40h battery, wireless charging case, and spatial audio. Lowest price ever recorded.",
    store: "AudioHub", storeLogo: "🎧",
    imageUrl: "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=800&q=80",
    originalPrice: 249, dealPrice: 89, currency: "USD",
    url: "https://example.com/aurabuds", categorySlug: "tech",
    featured: true, trending: true, flashDeal: true, expiresAt: hours(8),
    claimedCount: 1240, viewCount: 18900, rating: 4.7, tags: "audio,anc,earbuds,wireless",
  },
  {
    title: "Nimbus 14\" Ultrabook — 32GB / 1TB SSD",
    description: "Featherlight 1.1kg magnesium chassis, OLED 2.8K display, 18-hour battery. Creator-grade performance, budget price.",
    store: "TechVault", storeLogo: "💻",
    imageUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80",
    originalPrice: 1499, dealPrice: 899, currency: "USD",
    url: "https://example.com/nimbus", categorySlug: "tech",
    featured: false, trending: true, flashDeal: false, expiresAt: days(3),
    claimedCount: 320, viewCount: 5400, rating: 4.6, tags: "laptop,ultrabook,oled",
  },
  {
    title: "Pulse Smartwatch Series 7 — Titanium Edition",
    description: "Always-on LTPO display, ECG, blood-oxygen, 7-day battery, titanium body. Includes 3 sport bands.",
    store: "WearableCo", storeLogo: "⌚",
    imageUrl: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&q=80",
    originalPrice: 399, dealPrice: 199, currency: "USD",
    url: "https://example.com/pulse-watch", categorySlug: "tech",
    featured: false, trending: false, flashDeal: true, expiresAt: hours(20),
    claimedCount: 870, viewCount: 12300, rating: 4.5, tags: "smartwatch,wearable,fitness",
  },
  {
    title: "Volta 100W GaN Charger — 4-Port Travel Block",
    description: "Charge laptop + phone + tablet + earbuds simultaneously. Half the size of a stock brick.",
    store: "PowerPod", storeLogo: "🔌",
    imageUrl: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&q=80",
    originalPrice: 79, dealPrice: 29, currency: "USD",
    url: "https://example.com/volta", categorySlug: "tech",
    featured: false, trending: true, flashDeal: false, expiresAt: days(2),
    claimedCount: 2100, viewCount: 31000, rating: 4.8, tags: "charger,travel,gan",
  },
  // FASHION
  {
    title: "Merino Wool Crewneck Sweater — 7 Colorways",
    description: "Buttery-soft 100% extra-fine merino. Breathable, machine-washable, never pills. Wardrobe staple.",
    store: "Northfield", storeLogo: "🧥",
    imageUrl: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&q=80",
    originalPrice: 160, dealPrice: 49, currency: "USD",
    url: "https://example.com/merino", categorySlug: "fashion",
    featured: true, trending: false, flashDeal: true, expiresAt: hours(12),
    claimedCount: 540, viewCount: 8200, rating: 4.6, tags: "sweater,merino,knitwear",
  },
  {
    title: "Trailblazer All-Terrain Sneakers — Waterproof",
    description: "Vibram outsole, Gore-Tex membrane, recycled laces. Built for city streets and weekend trails.",
    store: "Roam Footwear", storeLogo: "👟",
    imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
    originalPrice: 180, dealPrice: 79, currency: "USD",
    url: "https://example.com/trailblazer", categorySlug: "fashion",
    featured: false, trending: true, flashDeal: false, expiresAt: days(4),
    claimedCount: 980, viewCount: 14500, rating: 4.4, tags: "shoes,sneakers,waterproof",
  },
  {
    title: "Heritage Leather Weekender Bag — Full-Grain",
    description: "Vegetable-tanned full-grain leather, brass hardware, canvas lining. Ages beautifully. Lifetime warranty.",
    store: "Atlas & Oak", storeLogo: "👜",
    imageUrl: "https://images.unsplash.com/photo-1547949003-9792a18a2601?w=800&q=80",
    originalPrice: 420, dealPrice: 169, currency: "USD",
    url: "https://example.com/weekender", categorySlug: "fashion",
    featured: false, trending: false, flashDeal: false, expiresAt: days(6),
    claimedCount: 210, viewCount: 4300, rating: 4.9, tags: "bag,leather,travel",
  },
  // HOME
  {
    title: "Lumina Smart Floor Lamp — 16M Colors + Voice",
    description: "Matter-compatible, works with Alexa/Google/Apple. Adaptive lighting that follows your day.",
    store: "Haus Labs", storeLogo: "💡",
    imageUrl: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80",
    originalPrice: 220, dealPrice: 74, currency: "USD",
    url: "https://example.com/lumina", categorySlug: "home",
    featured: false, trending: true, flashDeal: true, expiresAt: hours(6),
    claimedCount: 1450, viewCount: 22000, rating: 4.5, tags: "lighting,smart home,led",
  },
  {
    title: "Cloud9 Memory Foam Pillow — Cooling Gel",
    description: "Clinically-tested contour support, removable cooling cover, hypoallergenic. Wake up without neck pain.",
    store: "RestWell", storeLogo: "🛏️",
    imageUrl: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80",
    originalPrice: 89, dealPrice: 27, currency: "USD",
    url: "https://example.com/cloud9", categorySlug: "home",
    featured: false, trending: false, flashDeal: false, expiresAt: days(5),
    claimedCount: 3200, viewCount: 41000, rating: 4.7, tags: "pillow,sleep,bedding",
  },
  {
    title: "Forge Cast-Iron 10\" Skillet — Pre-Seasoned",
    description: "Hand-cast, pre-seasoned with organic flax oil. Induction + oven + campfire safe. Heirloom-grade.",
    store: "Forge & Co", storeLogo: "🍳",
    imageUrl: "https://images.unsplash.com/photo-1584990347449-a8d2c2ec0a07?w=800&q=80",
    originalPrice: 75, dealPrice: 32, currency: "USD",
    url: "https://example.com/forge-skillet", categorySlug: "home",
    featured: false, trending: false, flashDeal: false, expiresAt: days(7),
    claimedCount: 1800, viewCount: 16700, rating: 4.8, tags: "kitchen,cookware,cast iron",
  },
  // GAMING
  {
    title: "Voidstrike Mechanical Keyboard — Hot-Swap RGB",
    description: "Gasket-mounted, PBT keycaps, south-facing RGB, USB-C + 2.4G + BT tri-mode. Linear switches.",
    store: "KeyForge", storeLogo: "⌨️",
    imageUrl: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80",
    originalPrice: 169, dealPrice: 79, currency: "USD",
    url: "https://example.com/voidstrike", categorySlug: "gaming",
    featured: true, trending: true, flashDeal: true, expiresAt: hours(10),
    claimedCount: 760, viewCount: 9800, rating: 4.7, tags: "keyboard,mechanical,rgb",
  },
  {
    title: "Phantom Wireless Pro Controller — Hall Effect",
    description: "Drift-free Hall-effect sticks, 40h battery, mappable back paddles, low-latency 2.4G dongle.",
    store: "PixelGear", storeLogo: "🎮",
    imageUrl: "https://images.unsplash.com/photo-1592840496694-26d035b52b48?w=800&q=80",
    originalPrice: 89, dealPrice: 39, currency: "USD",
    url: "https://example.com/phantom-pad", categorySlug: "gaming",
    featured: false, trending: false, flashDeal: false, expiresAt: days(3),
    claimedCount: 1120, viewCount: 13500, rating: 4.5, tags: "controller,gaming,wireless",
  },
  // BEAUTY
  {
    title: "Glow Serum — 20% Vitamin C + Hyaluronic",
    description: "Dermatologist-formulated brightening serum. Visible glow in 14 days. Cruelty-free, fragrance-free.",
    store: "Bloom Skin", storeLogo: "✨",
    imageUrl: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&q=80",
    originalPrice: 68, dealPrice: 24, currency: "USD",
    url: "https://example.com/glow-serum", categorySlug: "beauty",
    featured: false, trending: true, flashDeal: false, expiresAt: days(4),
    claimedCount: 2400, viewCount: 28900, rating: 4.6, tags: "skincare,serum,vitamin c",
  },
  {
    title: "Velvet Matte Lip Set — 6 Full-Size Shades",
    description: "Transfer-proof, 12-hour wear, non-drying formula. Six universally-flattering nudes & reds.",
    store: "Maison Rouge", storeLogo: "💄",
    imageUrl: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800&q=80",
    originalPrice: 120, dealPrice: 39, currency: "USD",
    url: "https://example.com/lipset", categorySlug: "beauty",
    featured: false, trending: false, flashDeal: true, expiresAt: hours(16),
    claimedCount: 670, viewCount: 7600, rating: 4.4, tags: "makeup,lipstick,set",
  },
  // TRAVEL
  {
    title: "5-Night Bali Beach Villa Escape — 2 Guests",
    description: "Private pool villa, daily breakfast, airport transfers, spa credit. Book by expiry, travel anytime in 12 months.",
    store: "WanderTrips", storeLogo: "🏝️",
    imageUrl: "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=800&q=80",
    originalPrice: 2400, dealPrice: 899, currency: "USD",
    url: "https://example.com/bali-villa", categorySlug: "travel",
    featured: true, trending: false, flashDeal: false, expiresAt: days(5),
    claimedCount: 180, viewCount: 5200, rating: 4.8, tags: "vacation,bali,villa",
  },
  {
    title: "Carry-On Hardshell 4-Wheel Spinner — 40L",
    description: "Aircraft-grade polycarbonate, TSA lock, silent mag-glide wheels, lifetime warranty. Underseat on most airlines.",
    store: "Voyageur", storeLogo: "🧳",
    imageUrl: "https://images.unsplash.com/photo-1565111144255-8a5f9c4d4f5c?w=800&q=80",
    originalPrice: 280, dealPrice: 99, currency: "USD",
    url: "https://example.com/spinner", categorySlug: "travel",
    featured: false, trending: false, flashDeal: false, expiresAt: days(6),
    claimedCount: 430, viewCount: 6100, rating: 4.6, tags: "luggage,carry-on,travel",
  },
  // FITNESS
  {
    title: "Adjustable Dumbbell Pair — 5 to 52.5 lbs Each",
    description: "Replaces 15 sets of dumbbells. Dial-a-weight, space-saving cradle. Free shipping.",
    store: "IronCore", storeLogo: "🏋️",
    imageUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80",
    originalPrice: 549, dealPrice: 299, currency: "USD",
    url: "https://example.com/dumbbells", categorySlug: "fitness",
    featured: false, trending: true, flashDeal: true, expiresAt: hours(18),
    claimedCount: 290, viewCount: 4700, rating: 4.7, tags: "dumbbells,home gym,strength",
  },
  {
    title: "HyperFlow Vibrating Foam Roller — Recovery Pro",
    description: "4 vibration frequencies, textured surface, 4h battery. Used by pro athletes. Releases tight muscles in minutes.",
    store: "RecoverRight", storeLogo: "🧘",
    imageUrl: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=80",
    originalPrice: 149, dealPrice: 59, currency: "USD",
    url: "https://example.com/hyperflow", categorySlug: "fitness",
    featured: false, trending: false, flashDeal: false, expiresAt: days(4),
    claimedCount: 540, viewCount: 7300, rating: 4.5, tags: "recovery,roller,foam",
  },
  // FOOD
  {
    title: "Single-Origin Coffee Sampler — 12 Micro-Lots",
    description: "Curated by Q-graders. 12x 4oz bags from Ethiopia, Colombia, Guatemala, Kenya. Roast date guaranteed.",
    store: "Bean Theory", storeLogo: "☕",
    imageUrl: "https://images.unsplash.com/photo-1442550528053-c431ecb55509?w=800&q=80",
    originalPrice: 96, dealPrice: 36, currency: "USD",
    url: "https://example.com/coffee-sampler", categorySlug: "food",
    featured: false, trending: false, flashDeal: true, expiresAt: hours(14),
    claimedCount: 890, viewCount: 11200, rating: 4.8, tags: "coffee,specialty,gift",
  },
  {
    title: "Artisan Olive Oil Trio — Cold-Pressed Estate",
    description: "Three 250ml bottles from Tuscan, Andalusian, and Greek estates. Harvested this season. Award-winning.",
    store: "Olivara", storeLogo: "🫒",
    imageUrl: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&q=80",
    originalPrice: 72, dealPrice: 29, currency: "USD",
    url: "https://example.com/olive-oil", categorySlug: "food",
    featured: false, trending: false, flashDeal: false, expiresAt: days(8),
    claimedCount: 410, viewCount: 5400, rating: 4.6, tags: "olive oil,gourmet,pantry",
  },
];

async function main() {
  console.log("Seeding categories...");
  for (const c of categories) {
    await db.category.upsert({
      where: { slug: c.slug },
      update: c,
      create: c,
    });
  }

  console.log("Seeding deals...");
  await db.deal.deleteMany({});
  for (const d of deals) {
    const discountPct = pct(d.originalPrice, d.dealPrice);
    await db.deal.create({
      data: { ...d, discountPct },
    });
  }

  console.log(`Seeded ${categories.length} categories and ${deals.length} deals.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
