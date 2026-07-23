import { createServer } from 'http'
import { Server } from 'socket.io'

const httpServer = createServer()
const io = new Server(httpServer, {
  // DO NOT change the path, it is used by Caddy to forward the request to the correct port
  path: '/',
  cors: { origin: '*', methods: ['GET', 'POST'] },
  pingTimeout: 60000,
  pingInterval: 25000,
})

// ---- In-memory state for the live marketplace feed ----
const viewers = new Map<string, Set<string>>() // listingId -> set of socket ids
const onlineCount = { value: 0 }
const recentCloses: Array<{
  id: string
  listingTitle: string
  categorySlug: string
  amount: number
  party: string
  at: number
}> = []

const PARTIES = [
  'An investor in Karachi', 'A buyer in Dubai', 'An acquirer in Singapore', 'A fund in London',
  'A buyer in NYC', 'An investor in Lahore', 'A founder in Berlin', 'A buyer in Toronto',
  'An investor in Sydney', 'A PE firm in Hong Kong',
]
const randomParty = () => PARTIES[Math.floor(Math.random() * PARTIES.length)]

function broadcastLiveStats() {
  const stats = {
    online: onlineCount.value,
    viewers: Array.from(viewers.entries()).map(([listingId, set]) => ({ listingId, count: set.size })),
    dealsClosed24h: recentCloses.filter((c) => Date.now() - c.at < 86400_000).length,
  }
  io.emit('stats', stats)
}

const LISTING_POOL = [
  { id: 'sim-1', title: 'CloudInbox — Email Automation SaaS', categorySlug: 'saas', amount: 1_200_000 },
  { id: 'sim-2', title: 'ResumeAI — AI Resume Builder', categorySlug: 'ai', amount: 980_000 },
  { id: 'sim-3', title: 'PetSupplies Direct — DTC Pet Brand', categorySlug: 'ecommerce', amount: 900_000 },
  { id: 'sim-4', title: 'PayBridge — B2B Cross-Border Payments', categorySlug: 'fintech', amount: 2_400_000 },
  { id: 'sim-5', title: 'CareSync — Clinic Management', categorySlug: 'healthtech', amount: 1_800_000 },
  { id: 'sim-6', title: 'SentinelScan — Vulnerability Scanner', categorySlug: 'cybersecurity', amount: 1_600_000 },
  { id: 'sim-7', title: '8-Unit Mixed-Use Building, Karachi', categorySlug: 'realestate', amount: 1_400_000 },
  { id: 'sim-8', title: 'FlowOps — ERP for Manufacturers', categorySlug: 'crmerp', amount: 2_100_000 },
  { id: 'sim-9', title: 'LinguaLive — Language Tutoring', categorySlug: 'edtech', amount: 780_000 },
  { id: 'sim-10', title: 'RecipeHub.com — Food Blog', categorySlug: 'websites', amount: 220_000 },
]

function pushClose() {
  const l = LISTING_POOL[Math.floor(Math.random() * LISTING_POOL.length)]
  const close = {
    id: Math.random().toString(36).slice(2),
    listingTitle: l.title,
    categorySlug: l.categorySlug,
    amount: l.amount,
    party: randomParty(),
    at: Date.now(),
  }
  recentCloses.unshift(close)
  if (recentCloses.length > 30) recentCloses.pop()
  io.emit('close', close)
}

// Every ~7s push a simulated deal close to keep the feed alive
setInterval(() => {
  if (onlineCount.value > 0 && Math.random() > 0.25) pushClose()
}, 7000)

// Every 5s broadcast fresh stats
setInterval(broadcastLiveStats, 5000)

io.on('connection', (socket) => {
  onlineCount.value++
  console.log(`[mtd-feed] connect ${socket.id} (online=${onlineCount.value})`)

  socket.emit('welcome', {
    online: onlineCount.value,
    recentCloses: recentCloses.slice(0, 8),
  })

  // Client tells us which listing they are currently viewing
  socket.on('view', (listingId: string) => {
    if (!listingId || typeof listingId !== 'string') return
    for (const [id, set] of viewers.entries()) {
      if (id !== listingId) {
        if (set.delete(socket.id) && set.size === 0) viewers.delete(id)
      }
    }
    if (!viewers.has(listingId)) viewers.set(listingId, new Set())
    viewers.get(listingId)!.add(socket.id)
    socket.emit('view-ack', { listingId, count: viewers.get(listingId)!.size })
  })

  socket.on('stop-view', (listingId: string) => {
    const set = viewers.get(listingId)
    if (set) {
      set.delete(socket.id)
      if (set.size === 0) viewers.delete(listingId)
    }
  })

  // A real client closed/connected on a deal — broadcast to everyone
  socket.on('close', (data: { listingId: string; listingTitle: string; categorySlug: string; amount: number }) => {
    if (!data?.listingId) return
    const close = {
      id: Math.random().toString(36).slice(2),
      listingTitle: data.listingTitle,
      categorySlug: data.categorySlug || 'saas',
      amount: data.amount || 0,
      party: randomParty(),
      at: Date.now(),
    }
    recentCloses.unshift(close)
    if (recentCloses.length > 30) recentCloses.pop()
    io.emit('close', close)
  })

  socket.on('disconnect', () => {
    onlineCount.value = Math.max(0, onlineCount.value - 1)
    for (const [id, set] of viewers.entries()) {
      if (set.delete(socket.id) && set.size === 0) viewers.delete(id)
    }
    console.log(`[mtd-feed] disconnect ${socket.id} (online=${onlineCount.value})`)
  })

  socket.on('error', (err) => console.error(`[mtd-feed] socket error ${socket.id}:`, err))
})

const PORT = 3003
httpServer.listen(PORT, () => {
  console.log(`[mtd-feed] WebSocket server running on port ${PORT}`)
})

process.on('SIGTERM', () => httpServer.close(() => process.exit(0)))
process.on('SIGINT', () => httpServer.close(() => process.exit(0)))
