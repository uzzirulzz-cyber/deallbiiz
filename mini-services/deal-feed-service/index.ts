import { createServer } from 'http'
import { Server } from 'socket.io'

const httpServer = createServer()
const io = new Server(httpServer, {
  // DO NOT change the path, it is used by Caddy to forward the request to the correct port
  path: '/',
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  pingTimeout: 60000,
  pingInterval: 25000,
})

// ---- In-memory state for the live deal feed ----
const viewers = new Map<string, Set<string>>() // dealId -> set of socket ids
const onlineCount = { value: 0 }
const recentClaims: Array<{
  id: string
  dealTitle: string
  store: string
  user: string
  at: number
}> = []

const VIEWER_NAMES = ['A shopper in Karachi', 'Someone in Lahore', 'A buyer in NYC', 'A visitor in London', 'A deal hunter in Tokyo', 'Someone in Sydney', 'A shopper in Dubai', 'A visitor in Berlin', 'A buyer in Toronto', 'Someone in Singapore']
const randomName = () => VIEWER_NAMES[Math.floor(Math.random() * VIEWER_NAMES.length)]

function broadcastLiveStats() {
  const stats = {
    online: onlineCount.value,
    viewers: Array.from(viewers.entries()).map(([dealId, set]) => ({
      dealId,
      count: set.size,
    })),
    claimsLastHour: recentClaims.filter((c) => Date.now() - c.at < 3600_000).length,
  }
  io.emit('stats', stats)
}

// Periodically simulate other shoppers viewing / claiming deals to keep the feed alive
const DEAL_TITLES = [
  { id: 'sim-1', title: 'AuraBuds Pro 2', store: 'AudioHub' },
  { id: 'sim-2', title: 'Merino Wool Crewneck', store: 'Northfield' },
  { id: 'sim-3', title: 'Lumina Smart Floor Lamp', store: 'Haus Labs' },
  { id: 'sim-4', title: 'Voidstrike Mechanical Keyboard', store: 'KeyForge' },
  { id: 'sim-5', title: 'Adjustable Dumbbell Pair', store: 'IronCore' },
  { id: 'sim-6', title: 'Glow Serum', store: 'Bloom Skin' },
  { id: 'sim-7', title: 'Bali Beach Villa Escape', store: 'WanderTrips' },
  { id: 'sim-8', title: 'Coffee Sampler', store: 'Bean Theory' },
]

function pushClaim() {
  const deal = DEAL_TITLES[Math.floor(Math.random() * DEAL_TITLES.length)]
  const claim = {
    id: Math.random().toString(36).slice(2),
    dealTitle: deal.title,
    store: deal.store,
    user: randomName(),
    at: Date.now(),
  }
  recentClaims.unshift(claim)
  if (recentClaims.length > 30) recentClaims.pop()
  io.emit('claim', claim)
}

// Every ~6s push a simulated claim to make the feed feel alive
setInterval(() => {
  if (onlineCount.value > 0 && Math.random() > 0.3) pushClaim()
}, 6000)

// Every 5s broadcast fresh stats
setInterval(broadcastLiveStats, 5000)

io.on('connection', (socket) => {
  onlineCount.value++
  console.log(`[deal-feed] connect ${socket.id} (online=${onlineCount.value})`)

  socket.emit('welcome', {
    online: onlineCount.value,
    recentClaims: recentClaims.slice(0, 8),
  })

  // Client tells us which deal they are currently viewing
  socket.on('view', (dealId: string) => {
    if (!dealId || typeof dealId !== 'string') return
    // remove from any previous deal viewer set
    for (const [id, set] of viewers.entries()) {
      if (id !== dealId) {
        if (set.delete(socket.id) && set.size === 0) viewers.delete(id)
      }
    }
    if (!viewers.has(dealId)) viewers.set(dealId, new Set())
    viewers.get(dealId)!.add(socket.id)
    // Acknowledge with current count for this deal
    socket.emit('view-ack', { dealId, count: viewers.get(dealId)!.size })
  })

  socket.on('stop-view', (dealId: string) => {
    const set = viewers.get(dealId)
    if (set) {
      set.delete(socket.id)
      if (set.size === 0) viewers.delete(dealId)
    }
  })

  // A real client claimed a deal — broadcast to everyone
  socket.on('claim', (data: { dealId: string; dealTitle: string; store: string }) => {
    if (!data?.dealId) return
    const claim = {
      id: Math.random().toString(36).slice(2),
      dealTitle: data.dealTitle,
      store: data.store,
      user: randomName(),
      at: Date.now(),
    }
    recentClaims.unshift(claim)
    if (recentClaims.length > 30) recentClaims.pop()
    io.emit('claim', claim)
  })

  socket.on('disconnect', () => {
    onlineCount.value = Math.max(0, onlineCount.value - 1)
    for (const [id, set] of viewers.entries()) {
      if (set.delete(socket.id) && set.size === 0) viewers.delete(id)
    }
    console.log(`[deal-feed] disconnect ${socket.id} (online=${onlineCount.value})`)
  })

  socket.on('error', (err) => console.error(`[deal-feed] socket error ${socket.id}:`, err))
})

const PORT = 3003
httpServer.listen(PORT, () => {
  console.log(`[deal-feed] WebSocket server running on port ${PORT}`)
})

process.on('SIGTERM', () => httpServer.close(() => process.exit(0)))
process.on('SIGINT', () => httpServer.close(() => process.exit(0)))
