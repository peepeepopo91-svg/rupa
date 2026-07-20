import { useState, useEffect, useCallback, useRef } from 'react'
import { getEconomyOverrides, saveEconomyOverrides, getRateHistory, getExchangeRate } from '../../store/miningStore'
import type { EconomyOverrides } from '../../store/miningStore'
import { MINING_CONSTANTS, EXCHANGE_CONSTANTS, RIG_TIERS, NPC_MINERS } from '../../data/mining'
import type { User, UserRig, RigStatus, MiningReward } from '../../data/mining'
import { getDashboardStats, adminUpdateMiningUser } from '../../server/miningServer'
import { addLog } from '../../store/adminStore'

interface Props { admin: string }

// ─── Constants ────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'overview',   label: 'Overview',   icon: '📊' },
  { id: 'exchange',   label: 'Exchange',   icon: '💱' },
  { id: 'mining',     label: 'Mining',     icon: '⛏️' },
  { id: 'hardware',   label: 'Hardware',   icon: '🖥️' },
  { id: 'simulator',  label: 'Simulator',  icon: '🧪' },
  { id: 'history',    label: 'History',    icon: '📋' },
] as const
type Tab = typeof TABS[number]['id']

const HISTORY_KEY = 'bn_economy_history'

interface HistoryEntry {
  ts: number
  overrides: EconomyOverrides
  overrideCount: number
  admin: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number, dec = 0) {
  return n.toLocaleString('en-US', { maximumFractionDigits: dec })
}
function fmtShort(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + 'K'
  return String(Math.floor(n))
}
function fmtMs(ms: number) {
  if (ms >= 3_600_000) return `${(ms / 3_600_000).toFixed(1)}h`
  if (ms >= 60_000)    return `${Math.round(ms / 60_000)}m`
  return `${Math.round(ms / 1000)}s`
}
function safeGet<T>(key: string): T | null {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) as T : null } catch { return null }
}
function safeSet(key: string, v: unknown) {
  try { localStorage.setItem(key, JSON.stringify(v)) } catch {}
}

// Replicate the rate formula client-side (same math as miningStore.getExchangeRate)
function computeRate(now: number, ov: EconomyOverrides) {
  const BASE = ov.BASE_RATE ?? EXCHANGE_CONSTANTS.BASE_RATE
  const MIN  = ov.MIN_RATE  ?? EXCHANGE_CONSTANTS.MIN_RATE
  const MAX  = ov.MAX_RATE  ?? EXCHANGE_CONSTANTS.MAX_RATE
  const PERIOD = EXCHANGE_CONSTANTS.FLUCTUATION_PERIOD_MS
  const t = (now % PERIOD) / PERIOD
  const wave = Math.sin(2 * Math.PI * t) * 0.65 + Math.sin(2 * Math.PI * t * 2.7 + 1.2) * 0.35
  const amplitude = (MAX - MIN) / 2
  return Math.round(BASE + wave * amplitude)
}

function computeRateHistory(ov: EconomyOverrides, points = 96) {
  const PERIOD = EXCHANGE_CONSTANTS.FLUCTUATION_PERIOD_MS
  const step = PERIOD / points
  const now = Date.now()
  const amplitude = ((ov.MAX_RATE ?? EXCHANGE_CONSTANTS.MAX_RATE) - (ov.MIN_RATE ?? EXCHANGE_CONSTANTS.MIN_RATE)) / 2
  // points[0] = 4 h ago, points[95] = now — rightmost dot matches currentRate exactly
  return Array.from({ length: points }, (_, i) => {
    const tMs = now - (points - 1 - i) * step
    const t   = ((tMs % PERIOD) + PERIOD) % PERIOD / PERIOD
    const wave = Math.sin(2 * Math.PI * t) * 0.65 + Math.sin(2 * Math.PI * t * 2.7 + 1.2) * 0.35
    return Math.round((ov.BASE_RATE ?? EXCHANGE_CONSTANTS.BASE_RATE) + wave * amplitude)
  })
}

// ─── Sub-Components ───────────────────────────────────────────────────────────

function Toast({ msg, type }: { msg: string; type: 'success' | 'error' }) {
  return (
    <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl text-sm font-semibold shadow-xl border ${
      type === 'success' ? 'bg-green-500/15 border-green-500/30 text-green-400' : 'bg-red-500/15 border-red-500/30 text-red-400'
    }`}>
      {type === 'success' ? '✓ ' : '⚠ '}{msg}
    </div>
  )
}

function SectionHeader({ icon, title, sub }: { icon: string; title: string; sub?: string }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-9 h-9 rounded-xl bg-[#00BFFF]/10 border border-[#00BFFF]/20 flex items-center justify-center text-base">
        {icon}
      </div>
      <div>
        <h3 className="font-['Space_Grotesk'] font-black text-white text-base">{title}</h3>
        {sub && <p className="text-gray-600 text-xs">{sub}</p>}
      </div>
    </div>
  )
}

// Sparkline SVG
function RateChart({ points, min, max, base, current }: {
  points: number[]; min: number; max: number; base: number; current: number
}) {
  const W = 600; const H = 120; const PAD = 8
  const range = max - min || 1
  const scaleY = (v: number) => PAD + (1 - (v - min) / range) * (H - PAD * 2)
  const scaleX = (i: number) => PAD + (i / (points.length - 1)) * (W - PAD * 2)
  const d = points.map((v, i) => `${i === 0 ? 'M' : 'L'}${scaleX(i).toFixed(1)},${scaleY(v).toFixed(1)}`).join(' ')
  const area = d + ` L${scaleX(points.length - 1).toFixed(1)},${H} L${PAD},${H} Z`
  const baseY = scaleY(base)
  const curX = scaleX(points.length - 1) // current is at rightmost
  const curY = scaleY(current)
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-28" preserveAspectRatio="none">
      <defs>
        <linearGradient id="rateGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#00BFFF" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#00BFFF" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {/* area fill */}
      <path d={area} fill="url(#rateGrad)" />
      {/* base rate dashed line */}
      <line x1={PAD} y1={baseY} x2={W - PAD} y2={baseY}
        stroke="#ffffff" strokeOpacity="0.12" strokeWidth="1" strokeDasharray="4 4" />
      {/* min/max lines */}
      <line x1={PAD} y1={scaleY(min)} x2={W - PAD} y2={scaleY(min)}
        stroke="#ef4444" strokeOpacity="0.2" strokeWidth="1" strokeDasharray="2 4" />
      <line x1={PAD} y1={scaleY(max)} x2={W - PAD} y2={scaleY(max)}
        stroke="#22c55e" strokeOpacity="0.2" strokeWidth="1" strokeDasharray="2 4" />
      {/* main line */}
      <path d={d} fill="none" stroke="#00BFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {/* current dot */}
      <circle cx={curX} cy={curY} r="5" fill="#00BFFF" />
      <circle cx={curX} cy={curY} r="9" fill="#00BFFF" fillOpacity="0.2" />
    </svg>
  )
}

// Reward split donut using SVG
function SplitDonut({ finder, equal, hashrate }: { finder: number; equal: number; hashrate: number }) {
  const total = finder + equal + hashrate || 1
  const f = finder / total; const e = equal / total; const h = hashrate / total
  const R = 36; const cx = 44; const cy = 44; const stroke = 14
  const circumference = 2 * Math.PI * R
  function arc(from: number, pct: number) {
    return {
      strokeDasharray: `${(pct * circumference).toFixed(2)} ${circumference.toFixed(2)}`,
      strokeDashoffset: `${(-from * circumference).toFixed(2)}`,
    }
  }
  const segments = [
    { pct: f, from: 0, color: '#f59e0b', label: 'Finder' },
    { pct: e, from: f, color: '#00BFFF', label: 'Equal' },
    { pct: h, from: f + e, color: '#a78bfa', label: 'Hashrate' },
  ]
  return (
    <div className="flex items-center gap-6">
      <svg width="88" height="88">
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={stroke} />
        {segments.map(s => (
          <circle key={s.label} cx={cx} cy={cy} r={R} fill="none"
            stroke={s.color} strokeWidth={stroke}
            {...arc(s.from, s.pct)}
            style={{ transition: 'stroke-dasharray 0.4s, stroke-dashoffset 0.4s' }}
            transform="rotate(-90, 44, 44)"
          />
        ))}
      </svg>
      <div className="space-y-1.5">
        {[
          { label: 'Finder Bonus', val: finder, color: 'bg-amber-400' },
          { label: 'Equal Split',  val: equal,  color: 'bg-[#00BFFF]' },
          { label: 'Hashrate Share', val: hashrate, color: 'bg-purple-400' },
        ].map(s => (
          <div key={s.label} className="flex items-center gap-2 text-xs">
            <span className={`w-2 h-2 rounded-full shrink-0 ${s.color}`} />
            <span className="text-gray-500 w-24">{s.label}</span>
            <span className="text-white font-bold font-mono">{(s.val * 100).toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Slider + number field combo
function Field({
  label, desc, value, defaultVal, min, max, step, unit, pct, ms,
  onChange, onReset,
}: {
  label: string; desc: string; value: number; defaultVal: number
  min: number; max: number; step: number; unit: string
  pct?: boolean; ms?: boolean
  onChange: (v: number) => void; onReset: () => void
}) {
  const isOverridden = value !== defaultVal
  const display = pct ? `${(value * 100).toFixed(1)}%` : ms ? fmtMs(value) : `${fmt(value, step < 1 ? 3 : 0)} ${unit}`
  return (
    <div className={`p-5 rounded-xl border transition-all ${isOverridden ? 'bg-orange-500/5 border-orange-500/20' : 'bg-white/3 border-white/6'}`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-white text-sm font-semibold">{label}</span>
            {isOverridden && (
              <span className="text-[9px] font-bold bg-orange-500/15 text-orange-400 border border-orange-500/25 px-1.5 py-0.5 rounded-full">OVERRIDE</span>
            )}
          </div>
          <p className="text-gray-600 text-xs mt-0.5">{desc}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`font-['Space_Grotesk'] font-black text-lg ${isOverridden ? 'text-orange-300' : 'text-white'}`}>
            {display}
          </span>
          {isOverridden && (
            <button onClick={onReset} title="Reset to default"
              className="text-gray-700 hover:text-gray-300 transition-colors text-sm">✕</button>
          )}
        </div>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="w-full accent-[#00BFFF] cursor-pointer"
      />
      <div className="flex items-center justify-between mt-2 gap-2">
        <span className="text-[10px] text-gray-700">Default: {pct ? `${(defaultVal * 100).toFixed(0)}%` : ms ? fmtMs(defaultVal) : `${defaultVal} ${unit}`}</span>
        <input type="number" min={min} max={max} step={step} value={value}
          onChange={e => { const n = parseFloat(e.target.value); if (!isNaN(n)) onChange(n) }}
          className={`w-24 text-right text-xs bg-white/5 border rounded-lg px-2 py-1 outline-none font-mono transition-colors ${isOverridden ? 'border-orange-500/30 text-orange-300 focus:border-orange-500/60' : 'border-white/10 text-white focus:border-[#00BFFF]/40'}`}
        />
      </div>
    </div>
  )
}

// ─── NPC Pool Manager ─────────────────────────────────────────────────────────

const NPC_POOL_KEY = 'bn_admin_npc_pool'
const NPC_EMOJIS = ['🤖','👾','🦾','⚡','💎','🔮','🌀','🧬','🔬','🛸','🎮','💻','⚙️','🔧','🌐']

interface NpcEntry {
  id: string
  name: string
  hashrate: number
  rigTier: string
  active: boolean
  emoji: string
  addedAt: number
  onLeaderboard: boolean
}

// Default NPCs are "veterans" — 60-90 days of history so earnings are meaningful
const DEFAULT_NPC_POOL: NpcEntry[] = (NPC_MINERS as readonly { name: string; hashrate: number }[]).map((n, i) => ({
  id: `npc_default_${i}`,
  name: n.name,
  hashrate: n.hashrate,
  rigTier: 'pro',
  active: true,
  emoji: NPC_EMOJIS[i % NPC_EMOJIS.length],
  addedAt: Date.now() - (60 + i * 7) * 86_400_000, // 60/67/74/81/88 days ago
  onLeaderboard: false,
}))

function NpcPoolManager({ blockReward, equalPct, hashratePct, blockIntervalMs, allUsers, admin: adminName }: {
  blockReward: number; equalPct: number; hashratePct: number
  blockIntervalMs: number; allUsers: Record<string, User>; admin: string
}) {
  const [pool, setPool]             = useState<NpcEntry[]>(() => safeGet<NpcEntry[]>(NPC_POOL_KEY) ?? DEFAULT_NPC_POOL)
  const [editingId, setEditingId]   = useState<string | null>(null)
  const [editName, setEditName]     = useState('')
  const [editHashrate, setEditHashrate] = useState(10)
  const [editEmoji, setEditEmoji]   = useState('🤖')
  const [editTier, setEditTier]     = useState('pro')
  const [showAdd, setShowAdd]       = useState(false)
  const [newName, setNewName]       = useState('')
  const [newHashrate, setNewHashrate] = useState(10)
  const [newEmoji, setNewEmoji]     = useState('🤖')
  const [newTier, setNewTier]       = useState('pro')
  const [sort, setSort]             = useState<'hashrate' | 'name' | 'earnings'>('hashrate')
  const [filter, setFilter]         = useState('')
  const [lbWorking, setLbWorking]   = useState<string | null>(null)
  const [showLb, setShowLb]         = useState(false)
  const [npcToast, setNpcToast]     = useState<string | null>(null)
  const toastRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Auto-sync: push updated earnings for every on-leaderboard NPC silently ──
  // Uses a ref so the interval always sees the latest buildNpcUser + pool state.
  const poolRef    = useRef(pool)
  const syncFnRef  = useRef<(npc: NpcEntry) => Promise<void>>(async () => {})
  useEffect(() => { poolRef.current = pool }, [pool])

  useEffect(() => {
    async function autoSyncAll() {
      const live = poolRef.current.filter(n => n.onLeaderboard)
      for (const npc of live) {
        try { await syncFnRef.current(npc) } catch { /* silent */ }
      }
    }
    // 1.5 s delay so the router is fully settled before the first server call
    const boot = setTimeout(() => {
      autoSyncAll()
      const id = setInterval(autoSyncAll, 5 * 60 * 1000)
      timerRef.current = id
    }, 1500)
    return () => { clearTimeout(boot); clearInterval(timerRef.current ?? undefined) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  function savePool(next: NpcEntry[]) { setPool(next); safeSet(NPC_POOL_KEY, next) }
  function toast(msg: string) {
    setNpcToast(msg)
    if (toastRef.current) clearTimeout(toastRef.current)
    toastRef.current = setTimeout(() => setNpcToast(null), 2800)
  }

  const activePool       = pool.filter(n => n.active)
  const totalNpcHashrate = activePool.reduce((s, n) => s + n.hashrate, 0)
  const blocksPerDay     = (24 * 60 * 60 * 1000) / blockIntervalMs

  function npcEarnings(n: NpcEntry) {
    if (!n.active || totalNpcHashrate === 0) return 0
    const hs = (n.hashrate / totalNpcHashrate) * blockReward * hashratePct
    const eq = activePool.length > 0 ? (blockReward * equalPct) / activePool.length : 0
    return hs + eq
  }
  function npcBcDay(n: NpcEntry) { return npcEarnings(n) * blocksPerDay }

  const displayed = [...pool]
    .filter(n => n.name.toLowerCase().includes(filter.toLowerCase()))
    .sort((a, b) => sort === 'name' ? a.name.localeCompare(b.name) : sort === 'earnings' ? npcBcDay(b) - npcBcDay(a) : b.hashrate - a.hashrate)

  // Leaderboard mix: real users + NPCs ranked by simulated 7-day balance
  const lbEntries = [
    ...Object.values(allUsers).map(u => ({ name: u.username, balance: Math.floor(u.balance), isNpc: false, id: u.username })),
    ...activePool.map(n => ({ name: n.emoji + ' ' + n.name, balance: Math.floor(npcBcDay(n) * 7), isNpc: true, id: n.id, onLb: n.onLeaderboard })),
  ].sort((a, b) => b.balance - a.balance).map((e, i) => ({ ...e, rank: i + 1 }))

  function startEdit(n: NpcEntry) { setEditingId(n.id); setEditName(n.name); setEditHashrate(n.hashrate); setEditEmoji(n.emoji); setEditTier(n.rigTier) }
  function commitEdit() {
    if (!editingId) return
    savePool(pool.map(n => n.id === editingId ? { ...n, name: editName.trim() || n.name, hashrate: editHashrate, emoji: editEmoji, rigTier: editTier } : n))
    setEditingId(null)
    toast('NPC updated')
  }
  function addNpc() {
    if (!newName.trim()) return
    const entry: NpcEntry = { id: `npc_${Date.now()}`, name: newName.trim(), hashrate: newHashrate, rigTier: newTier, active: true, emoji: newEmoji, addedAt: Date.now(), onLeaderboard: false }
    savePool([...pool, entry])
    setNewName(''); setNewHashrate(10); setShowAdd(false)
    toast(`${newEmoji} ${newName.trim()} added to the pool`)
  }
  function removeNpc(id: string) { savePool(pool.filter(n => n.id !== id)); toast('NPC removed') }
  function toggleActive(id: string) { savePool(pool.map(n => n.id === id ? { ...n, active: !n.active } : n)) }

  // Build a fully-simulated User record for an NPC — realistic balance, reward
  // history, gems and active rigs based on how long they've been in the pool.
  function buildNpcUser(npc: NpcEntry): User {
    const tier      = RIG_TIERS.find(t => t.id === npc.rigTier) ?? RIG_TIERS[2]
    const rigCount  = Math.max(1, Math.ceil(npc.hashrate / tier.hashrate))
    const now       = Date.now()

    const rigs: UserRig[] = Array.from({ length: rigCount }, (_, i) => ({
      id: `npc_rig_${npc.id}_${i}`,
      tierId: tier.id,
      name: `${npc.name} Rig #${i + 1}`,
      durability: 7500 + Math.floor(Math.random() * 2000),
      status: npc.active ? ('mining' as RigStatus) : ('idle' as RigStatus),
      miningSince: npc.active ? now - blockIntervalMs * 2 : null,
      purchasedAt: npc.addedAt,
    }))

    // Enforce minimum 30-day history so newly-added NPCs still have meaningful earnings
    const MIN_AGE_MS   = 30 * 24 * 60 * 60 * 1000
    const effectiveAt  = Math.min(npc.addedAt, now - MIN_AGE_MS)
    const msActive     = Math.max(0, now - effectiveAt)
    const blocksActive = Math.floor(msActive / blockIntervalMs)
    const perBlock    = npcEarnings(npc)

    // Generate reward history — store last 50 blocks
    const historyCount = Math.min(50, blocksActive)
    const rewardHistory: MiningReward[] = Array.from({ length: historyCount }, (_, i) => {
      const blocksAgo = historyCount - i          // oldest entry first
      // small deterministic variance (±15%) so amounts look organic
      const seed      = (npc.id.charCodeAt(0) + i) % 100
      const variance  = 0.85 + (seed / 100) * 0.30
      const amount    = Math.round(perBlock * variance * 100) / 100
      const types: MiningReward['type'][] = ['hashrate_share', 'equal_split', 'equal_split', 'hashrate_share', 'finder']
      return {
        blockNumber: Math.max(1, blocksActive - blocksAgo + 1),
        solvedAt:    now - blocksAgo * blockIntervalMs,
        amount,
        type: types[i % types.length],
      }
    })

    // Lifetime earnings — full history (beyond the stored 50)
    const totalEarned = blocksActive * perBlock

    // Simulate ~25% of earnings exchanged to Gems at roughly base rate
    const BASE_RATE     = EXCHANGE_CONSTANTS.BASE_RATE
    const FEE           = EXCHANGE_CONSTANTS.FEE_PCT
    const exchangedBC   = Math.floor(totalEarned * 0.25)
    const gemsFromExch  = Math.floor(exchangedBC * BASE_RATE * (1 - FEE))
    const balance       = Math.floor(totalEarned - exchangedBC)

    return {
      username:          npc.name,
      createdAt:         npc.addedAt,
      balance,
      gems:              gemsFromExch,
      rigs,
      rewardHistory,
      lastCheckedAt:     now,
      exchangeUsedToday: Math.floor(Math.random() * 2),
      exchangeResetAt:   now + 86_400_000,
      miningExpiresAt:   npc.active ? now + 12 * 3_600_000 : null,
      miningRenewedAt:   npc.active ? now - 3_600_000 : null,
    }
  }

  async function pushToLeaderboard(npc: NpcEntry) {
    setLbWorking(npc.id)
    try {
      await adminUpdateMiningUser({ data: { user: buildNpcUser(npc) } })
      savePool(pool.map(n => n.id === npc.id ? { ...n, onLeaderboard: true } : n))
      addLog(`NPC "${npc.name}" injected into live leaderboard`, 'economy', adminName)
      toast(`🏆 ${npc.name} is now on the live leaderboard`)
    } catch {
      toast('❌ Failed to add to leaderboard')
    }
    setLbWorking(null)
  }

  async function syncEarnings(npc: NpcEntry) {
    setLbWorking(npc.id)
    try {
      await adminUpdateMiningUser({ data: { user: buildNpcUser(npc) } })
      addLog(`NPC "${npc.name}" earnings synced`, 'economy', adminName)
      toast(`🔄 ${npc.name} earnings synced`)
    } catch {
      toast('❌ Sync failed')
    }
    setLbWorking(null)
  }
  // Keep the auto-sync interval pointed at the freshest version of syncEarnings
  // (re-runs every render so closed-over state/props are never stale)
  syncFnRef.current = syncEarnings

  async function removeFromLeaderboard(npc: NpcEntry) {
    setLbWorking(npc.id)
    try {
      const emptyUser: User = {
        username: npc.name, createdAt: npc.addedAt,
        balance: 0, gems: 0, rigs: [], rewardHistory: [],
        lastCheckedAt: Date.now(), exchangeUsedToday: 0,
        exchangeResetAt: Date.now() + 86_400_000,
        miningExpiresAt: null, miningRenewedAt: null,
      }
      await adminUpdateMiningUser({ data: { user: emptyUser } })
      savePool(pool.map(n => n.id === npc.id ? { ...n, onLeaderboard: false } : n))
      addLog(`NPC "${npc.name}" removed from leaderboard`, 'economy', adminName)
      toast(`${npc.name} removed from leaderboard`)
    } catch {
      toast('❌ Failed to remove from leaderboard')
    }
    setLbWorking(null)
  }

  const totalBcDay   = activePool.reduce((s, n) => s + npcBcDay(n), 0)
  const dominance    = totalNpcHashrate > 0 && Object.values(allUsers).length > 0
    ? (totalNpcHashrate / (totalNpcHashrate + Object.values(allUsers).reduce((s, u) => s + u.rigs.filter(r => r.status === 'mining').reduce((rs, r) => rs + (RIG_TIERS.find(t => t.id === r.tierId)?.hashrate ?? 0), 0), 0))) * 100
    : 100
  const strongest = activePool.length > 0 ? activePool.reduce((a, b) => a.hashrate > b.hashrate ? a : b) : null
  const weakest   = activePool.length > 0 ? activePool.reduce((a, b) => a.hashrate < b.hashrate ? a : b) : null

  return (
    <div className="space-y-5">
      {/* Toast */}
      {npcToast && (
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl text-sm font-semibold shadow-xl border bg-purple-500/15 border-purple-500/30 text-purple-200 backdrop-blur-md">
          {npcToast}
        </div>
      )}

      {/* ── Stats header ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        {[
          { label: 'Total NPCs',    value: pool.length,              color: 'text-white',      icon: '🤖' },
          { label: 'Active',        value: activePool.length,        color: 'text-green-400',  icon: '✅' },
          { label: 'Pool GH/s',     value: fmt(totalNpcHashrate),   color: 'text-purple-400', icon: '⚡' },
          { label: 'Est. BC/day',   value: fmtShort(totalBcDay),    color: 'text-amber-400',  icon: '💰' },
          { label: 'Pool Dominance',value: `${dominance.toFixed(0)}%`, color: dominance > 50 ? 'text-red-400' : 'text-green-400', icon: '📊' },
          { label: 'Avg GH/s',      value: activePool.length > 0 ? fmt(totalNpcHashrate / activePool.length, 1) : '0', color: 'text-[#00BFFF]', icon: '📈' },
        ].map(s => (
          <div key={s.label} className="glass rounded-xl border border-white/6 p-3 text-center">
            <p className="text-lg mb-1">{s.icon}</p>
            <p className={`font-['Space_Grotesk'] font-black text-xl ${s.color}`}>{s.value}</p>
            <p className="text-[9px] text-gray-600 uppercase tracking-wide mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Pool hashrate bar ── */}
      {activePool.length > 0 && (
        <div className="glass rounded-2xl border border-white/6 p-4">
          <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-3">Pool Hashrate Distribution</p>
          <div className="flex h-5 rounded-full overflow-hidden gap-px">
            {activePool.map((n, i) => {
              const pct = totalNpcHashrate > 0 ? (n.hashrate / totalNpcHashrate) * 100 : 0
              const hue = (i * 47) % 360
              return (
                <div key={n.id} title={`${n.emoji} ${n.name}: ${n.hashrate} GH/s (${pct.toFixed(1)}%)`}
                  className="h-full transition-all duration-500 first:rounded-l-full last:rounded-r-full cursor-default"
                  style={{ width: `${pct}%`, background: `hsl(${hue},70%,55%)`, opacity: 0.85 }} />
              )
            })}
          </div>
          <div className="flex flex-wrap gap-3 mt-3">
            {activePool.map((n, i) => {
              const hue = (i * 47) % 360
              return (
                <span key={n.id} className="flex items-center gap-1.5 text-[10px] text-gray-500">
                  <span className="w-2 h-2 rounded-full" style={{ background: `hsl(${hue},70%,55%)` }} />
                  {n.emoji} {n.name} <span className="text-gray-700">({n.hashrate} GH/s)</span>
                </span>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Strongest/Weakest callouts ── */}
      {strongest && weakest && strongest.id !== weakest.id && (
        <div className="grid grid-cols-2 gap-3">
          <div className="glass rounded-xl border border-green-500/15 p-4 flex items-center gap-3">
            <span className="text-2xl">{strongest.emoji}</span>
            <div>
              <p className="text-[9px] text-gray-600 uppercase tracking-widest">Strongest NPC</p>
              <p className="text-white text-sm font-semibold">{strongest.name}</p>
              <p className="text-green-400 text-xs font-bold">{strongest.hashrate} GH/s · {fmtShort(npcBcDay(strongest))} BC/day</p>
            </div>
          </div>
          <div className="glass rounded-xl border border-red-500/15 p-4 flex items-center gap-3">
            <span className="text-2xl">{weakest.emoji}</span>
            <div>
              <p className="text-[9px] text-gray-600 uppercase tracking-widest">Weakest NPC</p>
              <p className="text-white text-sm font-semibold">{weakest.name}</p>
              <p className="text-red-400 text-xs font-bold">{weakest.hashrate} GH/s · {fmtShort(npcBcDay(weakest))} BC/day</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Controls bar ── */}
      <div className="flex flex-wrap items-center gap-2">
        <input placeholder="Filter by name…" value={filter} onChange={e => setFilter(e.target.value)}
          className="flex-1 min-w-32 px-3 py-2 rounded-xl bg-white/4 border border-white/8 text-white text-sm outline-none focus:border-purple-500/40 placeholder:text-gray-700" />
        <select value={sort} onChange={e => setSort(e.target.value as typeof sort)}
          className="px-3 py-2 rounded-xl bg-white/4 border border-white/8 text-white text-sm outline-none cursor-pointer">
          <option value="hashrate">⬇ Hashrate</option>
          <option value="earnings">⬇ Earnings</option>
          <option value="name">A–Z Name</option>
        </select>
        <button onClick={() => savePool(pool.map(n => ({ ...n, active: true })))}
          className="px-3 py-2 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold hover:bg-green-500/15 transition-colors">
          Activate All
        </button>
        <button onClick={() => savePool(pool.map(n => ({ ...n, active: false })))}
          className="px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold hover:bg-red-500/15 transition-colors">
          Disable All
        </button>
        <button onClick={() => setShowLb(v => !v)}
          className={`px-3 py-2 rounded-xl border text-xs font-semibold transition-colors ${showLb ? 'bg-amber-500/15 border-amber-500/25 text-amber-300' : 'bg-white/4 border-white/8 text-gray-400 hover:text-white'}`}>
          🏆 Leaderboard
        </button>
        <button onClick={() => setShowAdd(v => !v)}
          className="px-4 py-2 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300 text-sm font-semibold hover:bg-purple-500/22 transition-colors">
          + Add NPC
        </button>
      </div>

      {/* ── Add NPC form ── */}
      {showAdd && (
        <div className="glass rounded-2xl border border-purple-500/25 p-5 space-y-4">
          <p className="text-sm font-semibold text-purple-300">➕ New NPC Miner</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-gray-500">Name</label>
              <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. GhostMiner_X"
                className="w-full px-3 py-2 rounded-xl bg-white/4 border border-white/10 text-white text-sm outline-none focus:border-purple-500/40"
                onKeyDown={e => e.key === 'Enter' && addNpc()} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-gray-500">Avatar</label>
              <div className="flex flex-wrap gap-1.5">
                {NPC_EMOJIS.map(e => (
                  <button key={e} onClick={() => setNewEmoji(e)}
                    className={`w-8 h-8 rounded-lg text-base transition-all ${newEmoji === e ? 'bg-purple-500/25 border border-purple-500/45 scale-110' : 'bg-white/4 border border-white/8 hover:bg-white/8'}`}>
                    {e}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-gray-500">Hashrate: <strong className="text-white">{newHashrate} GH/s</strong></label>
              <input type="range" min={1} max={100} value={newHashrate} onChange={e => setNewHashrate(+e.target.value)} className="w-full accent-purple-500" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-gray-500">Rig Tier</label>
              <div className="flex flex-wrap gap-2">
                {RIG_TIERS.map(t => (
                  <button key={t.id} onClick={() => setNewTier(t.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${newTier === t.id ? 'bg-[#00BFFF]/18 border border-[#00BFFF]/35 text-[#00BFFF]' : 'bg-white/4 border border-white/8 text-gray-500 hover:text-white'}`}>
                    {t.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={addNpc} disabled={!newName.trim()}
              className="px-4 py-2 rounded-xl bg-purple-500/20 border border-purple-500/35 text-purple-300 text-sm font-semibold hover:bg-purple-500/28 transition-colors disabled:opacity-40">
              Add Miner
            </button>
            <button onClick={() => setShowAdd(false)}
              className="px-4 py-2 rounded-xl bg-white/4 border border-white/8 text-gray-400 text-sm hover:text-white transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── NPC cards grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayed.map((n, cardIdx) => {
          const isEditing = editingId === n.id
          const share     = totalNpcHashrate > 0 ? (n.hashrate / totalNpcHashrate) * 100 : 0
          const bcDay     = npcBcDay(n)
          const tier      = RIG_TIERS.find(t => t.id === n.rigTier) ?? RIG_TIERS[2]
          const hue       = (cardIdx * 47) % 360

          return (
            <div key={n.id} className={`glass rounded-2xl border p-4 transition-all duration-200 ${n.active ? 'border-purple-500/20' : 'border-white/5 opacity-55'}`}>

              {/* Card header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {isEditing ? (
                    <select value={editEmoji} onChange={e => setEditEmoji(e.target.value)}
                      className="w-11 h-10 rounded-xl bg-white/8 border border-white/12 text-xl outline-none cursor-pointer text-center">
                      {NPC_EMOJIS.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                  ) : (
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 border"
                      style={{ background: `hsl(${hue},60%,35%,0.2)`, borderColor: `hsl(${hue},60%,55%,0.25)` }}>
                      {n.emoji}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <input value={editName} onChange={e => setEditName(e.target.value)}
                        className="w-full px-2 py-1 rounded-lg bg-white/6 border border-white/15 text-white text-sm font-semibold outline-none focus:border-purple-500/50"
                        onKeyDown={e => e.key === 'Enter' && commitEdit()} autoFocus />
                    ) : (
                      <p className="text-white text-sm font-semibold truncate">{n.name}</p>
                    )}
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${n.active ? 'bg-green-500/12 text-green-400' : 'bg-red-500/12 text-red-400'}`}>
                        {n.active ? '● ACTIVE' : '○ OFFLINE'}
                      </span>
                      {n.onLeaderboard && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/12 text-amber-400">🏆 LB</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0 ml-2">
                  {isEditing ? (
                    <>
                      <button onClick={commitEdit} className="px-2.5 py-1 rounded-lg bg-green-500/15 border border-green-500/25 text-green-400 text-xs font-bold hover:bg-green-500/22 transition-colors">Save</button>
                      <button onClick={() => setEditingId(null)} className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-gray-500 text-xs hover:text-white transition-colors">✕</button>
                    </>
                  ) : (
                    <button onClick={() => startEdit(n)} title="Edit"
                      className="w-7 h-7 rounded-lg bg-white/5 border border-white/8 text-gray-600 hover:text-white hover:bg-white/10 transition-colors flex items-center justify-center text-sm">
                      ✏️
                    </button>
                  )}
                </div>
              </div>

              {/* Hashrate */}
              {isEditing ? (
                <div className="mb-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-600 uppercase tracking-wide">Hashrate</span>
                    <span className="text-xs font-bold text-purple-300">{editHashrate} GH/s</span>
                  </div>
                  <input type="range" min={1} max={100} value={editHashrate} onChange={e => setEditHashrate(+e.target.value)} className="w-full accent-purple-500" />
                </div>
              ) : (
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] text-gray-600 uppercase tracking-wide">Hashrate</span>
                    <span className="font-['Space_Grotesk'] font-black text-lg" style={{ color: `hsl(${hue},70%,65%)` }}>
                      {n.hashrate} <span className="text-xs font-normal text-gray-600">GH/s</span>
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, n.hashrate)}%`, background: `hsl(${hue},65%,55%)` }} />
                  </div>
                </div>
              )}

              {/* Rig tier */}
              {isEditing ? (
                <div className="mb-3 flex flex-wrap gap-1.5">
                  {RIG_TIERS.map(t => (
                    <button key={t.id} onClick={() => setEditTier(t.id)}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition-all ${editTier === t.id ? 'bg-[#00BFFF]/18 border border-[#00BFFF]/35 text-[#00BFFF]' : 'bg-white/4 border border-white/8 text-gray-600 hover:text-white'}`}>
                      {t.name}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] text-gray-600 uppercase tracking-wide">Rig tier</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#00BFFF]/8 border border-[#00BFFF]/15 text-[#00BFFF]">{tier.name}</span>
                </div>
              )}

              {/* Pool share bar */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-gray-600 uppercase tracking-wide">Pool share</span>
                  <span className="text-[10px] font-bold text-white">{n.active ? `${share.toFixed(1)}%` : '—'}</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: n.active ? `${share}%` : '0%', background: `hsl(${hue},65%,55%)` }} />
                </div>
              </div>

              {/* Stats mini grid */}
              <div className="grid grid-cols-3 gap-2 mb-3">
                {[
                  { v: n.active ? fmtShort(bcDay)             : '—', label: 'BC/day',   color: 'text-amber-400'   },
                  { v: n.active ? fmtShort(npcEarnings(n))    : '—', label: 'BC/block', color: 'text-[#00BFFF]'   },
                  { v: n.active ? `${share.toFixed(0)}%`       : '—', label: 'share',    color: 'text-purple-400'  },
                ].map(s => (
                  <div key={s.label} className="p-2 rounded-xl bg-white/3 border border-white/5 text-center">
                    <p className={`font-['Space_Grotesk'] font-black text-sm ${s.color}`}>{s.v}</p>
                    <p className="text-[9px] text-gray-700 uppercase tracking-wide mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Action footer */}
              <div className="flex gap-1.5 pt-2 border-t border-white/5">
                <button onClick={() => toggleActive(n.id)}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${n.active ? 'bg-red-500/8 border-red-500/15 text-red-400 hover:bg-red-500/14' : 'bg-green-500/8 border-green-500/15 text-green-400 hover:bg-green-500/14'}`}>
                  {n.active ? 'Disable' : 'Activate'}
                </button>
                {n.onLeaderboard ? (
                  <>
                    <button onClick={() => syncEarnings(n)} disabled={!!lbWorking} title="Recalculate balance + reward history based on time active"
                      className="flex-1 py-1.5 rounded-xl text-xs font-semibold border bg-[#00BFFF]/8 border-[#00BFFF]/15 text-[#00BFFF] hover:bg-[#00BFFF]/14 transition-colors disabled:opacity-50">
                      {lbWorking === n.id ? '…' : '🔄 Sync'}
                    </button>
                    <button onClick={() => removeFromLeaderboard(n)} disabled={!!lbWorking}
                      className="flex-1 py-1.5 rounded-xl text-xs font-semibold border bg-amber-500/8 border-amber-500/15 text-amber-400 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400 transition-colors disabled:opacity-50">
                      {lbWorking === n.id ? '…' : '🏆 Remove'}
                    </button>
                  </>
                ) : (
                  <button onClick={() => pushToLeaderboard(n)} disabled={!!lbWorking}
                    className="flex-1 py-1.5 rounded-xl text-xs font-semibold border bg-white/5 border-white/10 text-gray-400 hover:text-amber-400 hover:border-amber-500/20 hover:bg-amber-500/6 transition-colors disabled:opacity-50">
                    {lbWorking === n.id ? '…' : '🏆 Add to LB'}
                  </button>
                )}
                <button onClick={() => removeNpc(n.id)}
                  className="w-8 flex items-center justify-center rounded-xl bg-white/4 border border-white/8 text-gray-700 hover:text-red-400 hover:border-red-500/20 hover:bg-red-500/6 transition-colors">
                  🗑
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Leaderboard preview panel ── */}
      {showLb && (
        <div className="glass rounded-2xl border border-amber-500/15 overflow-hidden">
          <div className="px-5 py-4 border-b border-white/6 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white">🏆 Leaderboard Preview</p>
              <p className="text-[10px] text-gray-600 mt-0.5">NPCs shown with simulated 7-day earnings · Real players show live balance</p>
            </div>
            <span className="text-[10px] px-2 py-1 rounded-lg bg-purple-500/10 border border-purple-500/15 text-purple-400">{lbEntries.length} total entries</span>
          </div>
          <div className="divide-y divide-white/4 max-h-96 overflow-y-auto">
            {lbEntries.slice(0, 20).map(e => (
              <div key={e.id} className={`flex items-center gap-3 px-5 py-2.5 hover:bg-white/2 transition-colors ${e.isNpc ? 'bg-purple-500/3' : ''}`}>
                <span className={`w-7 text-center font-['Space_Grotesk'] font-black text-sm ${e.rank <= 3 ? 'text-amber-400' : 'text-gray-600'}`}>
                  {e.rank === 1 ? '🥇' : e.rank === 2 ? '🥈' : e.rank === 3 ? '🥉' : `#${e.rank}`}
                </span>
                <span className={`flex-1 text-sm font-semibold truncate ${e.isNpc ? 'text-purple-300' : 'text-white'}`}>{e.name}</span>
                {e.isNpc && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/20 text-purple-400 shrink-0">NPC</span>
                )}
                {'onLb' in e && e.onLb && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/12 border border-amber-500/18 text-amber-400 shrink-0">LIVE</span>
                )}
                <span className={`font-['Space_Grotesk'] font-black text-sm shrink-0 ${e.isNpc ? 'text-amber-400' : 'text-[#00BFFF]'}`}>
                  {fmtShort(e.balance)} BC
                </span>
              </div>
            ))}
          </div>
          {lbEntries.length > 20 && (
            <p className="text-center text-[10px] text-gray-700 py-2">+{lbEntries.length - 20} more entries</p>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function EconomyManager({ admin }: Props) {
  const [tab, setTab]           = useState<Tab>('overview')
  const [overrides, setOverrides] = useState<EconomyOverrides>(getEconomyOverrides)
  const [toast, setToast]       = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [showReset, setShowReset] = useState(false)
  const [now, setNow]           = useState(Date.now())
  const [users, setUsers]       = useState<Record<string, User>>({})
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [history, setHistory]   = useState<HistoryEntry[]>([])

  // Simulator state
  const [simRigTier,  setSimRigTier]  = useState('pro')
  const [simRigCount, setSimRigCount] = useState(3)
  const [simBlocks,   setSimBlocks]   = useState(24)
  const [simBcInput,  setSimBcInput]  = useState(100)

  // Live clock
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  // Load users for overview metrics
  useEffect(() => {
    getDashboardStats()
      .then(s => { setUsers(s.users ?? {}); setLoadingUsers(false) })
      .catch(() => setLoadingUsers(false))
  }, [])

  // Load history
  useEffect(() => {
    setHistory(safeGet<HistoryEntry[]>(HISTORY_KEY) ?? [])
  }, [])

  // ── Derived values ──────────────────────────────────────────────────────────

  function get<K extends keyof EconomyOverrides>(key: K, def: number): number {
    const v = overrides[key]
    return v !== undefined ? (v as number) : def
  }

  const currentRate = computeRate(now, overrides)
  const rateHistory = computeRateHistory(overrides, 96)
  const minRate  = get('MIN_RATE', EXCHANGE_CONSTANTS.MIN_RATE)
  const maxRate  = get('MAX_RATE', EXCHANGE_CONSTANTS.MAX_RATE)
  const baseRate = get('BASE_RATE', EXCHANGE_CONSTANTS.BASE_RATE)
  const feePct   = get('FEE_PCT', EXCHANGE_CONSTANTS.FEE_PCT)
  const dailyTxLimit = get('DAILY_TX_LIMIT', EXCHANGE_CONSTANTS.DAILY_TX_LIMIT)
  const blockReward     = get('BLOCK_REWARD', MINING_CONSTANTS.BLOCK_REWARD)
  const blockIntervalMs = get('BLOCK_INTERVAL_MS', MINING_CONSTANTS.BLOCK_INTERVAL_MS)
  const finderPct    = get('FINDER_BONUS_PCT',  MINING_CONSTANTS.FINDER_BONUS_PCT)
  const equalPct     = get('EQUAL_SPLIT_PCT',   MINING_CONSTANTS.EQUAL_SPLIT_PCT)
  const hashratePct  = get('HASHRATE_SHARE_PCT',MINING_CONSTANTS.HASHRATE_SHARE_PCT)
  const startingBal  = get('STARTING_BALANCE',  MINING_CONSTANTS.STARTING_BALANCE)

  const splitSum = finderPct + equalPct + hashratePct
  const splitOk  = Math.abs(splitSum - 1) < 0.011

  const userList   = Object.values(users)
  const totalBC    = userList.reduce((s, u) => s + (u.balance ?? 0), 0)
  const totalGems  = userList.reduce((s, u) => s + (u.gems ?? 0), 0)
  const activeRigs = userList.reduce((s, u) => s + u.rigs.filter(r => r.status === 'mining').length, 0)
  const overrideCount = Object.values(overrides).filter(v => v !== undefined).length

  // Simulator
  const simTier = RIG_TIERS.find(t => t.id === simRigTier) ?? RIG_TIERS[2]
  const userHashrate = simTier.hashrate * simRigCount
  const npcHashrate  = NPC_MINERS.reduce((s, n) => s + n.hashrate, 0)
  const totalHashrate = userHashrate + npcHashrate
  const userShare = userHashrate / totalHashrate
  const blocksPerDay = (24 * 60 * 60 * 1000) / blockIntervalMs
  const finderBonus   = blockReward * finderPct
  const equalShare    = (blockReward * equalPct) / (NPC_MINERS.length + 1) // +1 for user
  const hashrateShare = blockReward * hashratePct * userShare
  const avgPerBlock   = finderBonus * userShare + equalShare + hashrateShare
  const simEarnings   = avgPerBlock * simBlocks
  const simDays       = simBlocks / blocksPerDay
  const rigCost       = simTier.cost * simRigCount
  const blocksToROI   = rigCost / (avgPerBlock || 1)

  // Exchange calculator
  const calcFee      = simBcInput * currentRate * feePct
  const calcGems     = simBcInput * currentRate - calcFee

  // ── Actions ─────────────────────────────────────────────────────────────────

  function showMsg(msg: string, type: 'success' | 'error' = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  function handleSave() {
    if (!splitOk) {
      showMsg(`Reward splits must sum to 1.00 (currently ${splitSum.toFixed(3)})`, 'error')
      return
    }
    saveEconomyOverrides(overrides)
    addLog(admin, 'economy:save', `Saved ${overrideCount} override${overrideCount !== 1 ? 's' : ''}`)
    const entry: HistoryEntry = { ts: Date.now(), overrides: { ...overrides }, overrideCount, admin }
    const newHistory = [entry, ...history].slice(0, 15)
    setHistory(newHistory)
    safeSet(HISTORY_KEY, newHistory)
    showMsg(`Economy saved — ${overrideCount} override${overrideCount !== 1 ? 's' : ''} active.`)
  }

  function handleReset() {
    saveEconomyOverrides({})
    setOverrides({})
    setShowReset(false)
    addLog(admin, 'economy:reset', 'Reset all economy overrides to defaults')
    showMsg('Economy reset to coded defaults.')
  }

  function restoreHistory(entry: HistoryEntry) {
    setOverrides(entry.overrides)
    showMsg('Snapshot restored — click Save to apply.')
  }

  function setField(key: keyof EconomyOverrides, val: number) {
    setOverrides(prev => ({ ...prev, [key]: val }))
  }

  function resetField(key: keyof EconomyOverrides) {
    setOverrides(prev => { const n = { ...prev }; delete n[key]; return n })
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-0">
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <div className="glass rounded-2xl border border-white/8 p-6 mb-6 bg-gradient-to-r from-amber-500/5 via-transparent to-transparent">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-['Space_Grotesk'] font-black text-white text-xl flex items-center gap-2">
              ⚙️ Economy Control Panel
            </h2>
            <p className="text-gray-500 text-sm mt-0.5">Configure exchange rates, mining rewards, and platform constants</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {overrideCount > 0 && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-orange-500/10 border border-orange-500/25 text-orange-400">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                {overrideCount} override{overrideCount !== 1 ? 's' : ''} active
              </span>
            )}
            <button onClick={() => setShowReset(true)}
              className="px-4 py-2 rounded-xl text-xs text-gray-400 border border-white/10 hover:border-white/20 hover:text-white transition-all">
              ↺ Reset All
            </button>
            <button onClick={handleSave}
              className={`px-5 py-2 rounded-xl text-sm font-bold border transition-all ${
                !splitOk
                  ? 'bg-red-500/10 border-red-500/30 text-red-400 cursor-not-allowed'
                  : 'btn-primary text-white'
              }`}>
              💾 Save Economy
            </button>
          </div>
        </div>

        {/* Quick stat pills */}
        <div className="mt-4 flex flex-wrap gap-2">
          {[
            { label: 'Current Rate',   value: `${currentRate} Gems/BC`, color: 'text-[#00BFFF]' },
            { label: 'Block Reward',   value: `${blockReward} BC`,      color: 'text-amber-400' },
            { label: 'Block Interval', value: fmtMs(blockIntervalMs),   color: 'text-purple-400' },
            { label: 'Daily TX Limit', value: `${dailyTxLimit}/day`,    color: 'text-green-400' },
            { label: 'Exchange Fee',   value: `${(feePct*100).toFixed(1)}%`, color: 'text-pink-400' },
            { label: 'Starting BC',    value: `${startingBal} BC`,      color: 'text-cyan-400' },
          ].map(p => (
            <div key={p.label} className="px-3 py-1.5 rounded-lg bg-white/3 border border-white/6 flex items-center gap-1.5">
              <span className={`font-['Space_Grotesk'] font-black text-sm ${p.color}`}>{p.value}</span>
              <span className="text-gray-600 text-[10px]">{p.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Tabs ────────────────────────────────────────────────────────────── */}
      <div className="flex gap-1 mb-5 overflow-x-auto pb-1">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all ${
              tab === t.id
                ? 'bg-[#00BFFF]/12 border-[#00BFFF]/30 text-[#00BFFF]'
                : 'border-white/8 text-gray-500 hover:text-gray-300 hover:border-white/15'
            }`}>
            <span>{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════════════════════════════════════════
          TAB: OVERVIEW
      ════════════════════════════════════════════════════════════════════════ */}
      {tab === 'overview' && (
        <div className="space-y-5">

          {/* Live Rate Card */}
          <div className="glass rounded-2xl border border-[#00BFFF]/15 p-6">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">Live Exchange Rate</p>
                <div className="flex items-end gap-3">
                  <span className="font-['Space_Grotesk'] font-black text-5xl text-[#00BFFF]">{currentRate}</span>
                  <span className="text-gray-400 text-lg mb-1">Gems / BC</span>
                </div>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
                  <span>↓ Min <strong className="text-red-400">{minRate}</strong></span>
                  <span>◆ Base <strong className="text-white">{baseRate}</strong></span>
                  <span>↑ Max <strong className="text-green-400">{maxRate}</strong></span>
                  <span>📈 Amplitude <strong className="text-purple-400">±{Math.round((maxRate - minRate) / 2)}</strong></span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-gray-500 text-xs mb-1">4-hour wave cycle</p>
                <div className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${
                  currentRate > baseRate
                    ? 'bg-green-500/10 border-green-500/20 text-green-400'
                    : currentRate < baseRate
                    ? 'bg-red-500/10 border-red-500/20 text-red-400'
                    : 'bg-white/5 border-white/10 text-gray-400'
                }`}>
                  {currentRate > baseRate ? '▲ Above base' : currentRate < baseRate ? '▼ Below base' : '◆ At base'}
                  {' '}({currentRate > baseRate ? '+' : ''}{currentRate - baseRate})
                </div>
              </div>
            </div>
            <RateChart points={rateHistory} min={minRate} max={maxRate} base={baseRate} current={currentRate} />
            <p className="text-gray-700 text-[10px] mt-1 text-center">Full 4-hour wave cycle — current position at right</p>
          </div>

          {/* Economy Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: '₿', label: 'BC Circulating', value: fmtShort(totalBC),   sub: `${fmt(totalBC)} BlueCoin`, color: 'text-amber-400' },
              { icon: '💎', label: 'Gems Circulating', value: fmtShort(totalGems), sub: `${fmt(totalGems)} Gems`, color: 'text-purple-400' },
              { icon: '⛏️', label: 'Active Rigs', value: String(activeRigs), sub: `across ${userList.length} accounts`, color: 'text-cyan-400' },
              { icon: '⚙️', label: 'Overrides Active', value: String(overrideCount), sub: overrideCount ? 'Custom values in effect' : 'All at defaults', color: overrideCount ? 'text-orange-400' : 'text-gray-500' },
            ].map(c => (
              <div key={c.label} className="glass rounded-xl border border-white/8 p-5">
                <span className="text-lg">{c.icon}</span>
                <p className={`font-['Space_Grotesk'] font-black text-2xl mt-2 ${c.color}`}>{loadingUsers ? '—' : c.value}</p>
                <p className="text-white text-xs font-semibold mt-1">{c.label}</p>
                <p className="text-gray-600 text-[10px] mt-0.5">{c.sub}</p>
              </div>
            ))}
          </div>

          {/* Reward Split + Block Info side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="glass rounded-2xl border border-white/8 p-6">
              <SectionHeader icon="🎁" title="Block Reward Distribution" sub="How each block's BC is split among miners" />
              <SplitDonut finder={finderPct} equal={equalPct} hashrate={hashratePct} />
              <div className="mt-4 p-3 rounded-xl bg-white/3 border border-white/5">
                <p className="text-gray-500 text-xs mb-2">At {blockReward} BC per block:</p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  {[
                    { label: 'Finder Bonus', val: Math.round(blockReward * finderPct), color: 'text-amber-400' },
                    { label: 'Equal Pool', val: Math.round(blockReward * equalPct), color: 'text-[#00BFFF]' },
                    { label: 'Hashrate Pool', val: Math.round(blockReward * hashratePct), color: 'text-purple-400' },
                  ].map(s => (
                    <div key={s.label}>
                      <p className={`font-['Space_Grotesk'] font-black text-xl ${s.color}`}>{s.val}</p>
                      <p className="text-gray-600 text-[9px]">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
              {!splitOk && (
                <p className="mt-3 text-red-400 text-xs flex items-center gap-1">
                  <span>⚠</span> Splits sum to {splitSum.toFixed(3)} — must equal 1.000
                </p>
              )}
            </div>

            <div className="glass rounded-2xl border border-white/8 p-6">
              <SectionHeader icon="🧱" title="Block Economics" sub="Mining cadence and earning potential" />
              <div className="space-y-3">
                {[
                  { label: 'Block Interval',    value: fmtMs(blockIntervalMs),  sub: `${(blockIntervalMs / 60000).toFixed(0)} minutes`, color: 'text-purple-400' },
                  { label: 'Blocks per Day',    value: fmt(blocksPerDay, 1),     sub: 'theoretical maximum',     color: 'text-[#00BFFF]' },
                  { label: 'Daily Max Payout',  value: `${fmt(blockReward * blocksPerDay)} BC`, sub: 'total BC distributed/day', color: 'text-amber-400' },
                  { label: 'Session Duration',  value: fmtMs(MINING_CONSTANTS.RENEWAL_DURATION_MS), sub: 'per renewal', color: 'text-green-400' },
                  { label: 'Starting Balance',  value: `${startingBal} BC`,     sub: 'new account bonus',       color: 'text-cyan-400' },
                ].map(r => (
                  <div key={r.label} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                    <div>
                      <p className="text-white text-xs font-semibold">{r.label}</p>
                      <p className="text-gray-600 text-[10px]">{r.sub}</p>
                    </div>
                    <span className={`font-['Space_Grotesk'] font-black text-base ${r.color}`}>{r.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* NPC Pool — grand manager */}
          <div className="glass rounded-2xl border border-white/8 p-6">
            <SectionHeader icon="🤖" title="NPC Miner Pool" sub="Simulated miners that keep the network active" />
            <NpcPoolManager
              blockReward={blockReward}
              equalPct={equalPct}
              hashratePct={hashratePct}
              blockIntervalMs={blockIntervalMs}
              allUsers={users}
              admin={admin}
            />
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          TAB: EXCHANGE
      ════════════════════════════════════════════════════════════════════════ */}
      {tab === 'exchange' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Controls */}
            <div className="lg:col-span-2 space-y-4">
              <div className="glass rounded-2xl border border-white/8 p-6">
                <SectionHeader icon="📈" title="Rate Bounds" sub="Define the min, base, and max of the exchange rate wave" />
                <div className="space-y-4">
                  <Field label="Base Rate" desc="Centre of the sine wave — the long-run equilibrium"
                    value={baseRate} defaultVal={EXCHANGE_CONSTANTS.BASE_RATE}
                    min={1} max={500} step={1} unit="Gems/BC"
                    onChange={v => setField('BASE_RATE', v)}
                    onReset={() => resetField('BASE_RATE')} />
                  <Field label="Minimum Rate" desc="Floor — rate can never fall below this value"
                    value={minRate} defaultVal={EXCHANGE_CONSTANTS.MIN_RATE}
                    min={1} max={baseRate - 1} step={1} unit="Gems/BC"
                    onChange={v => setField('MIN_RATE', v)}
                    onReset={() => resetField('MIN_RATE')} />
                  <Field label="Maximum Rate" desc="Ceiling — rate can never exceed this value"
                    value={maxRate} defaultVal={EXCHANGE_CONSTANTS.MAX_RATE}
                    min={baseRate + 1} max={10000} step={1} unit="Gems/BC"
                    onChange={v => setField('MAX_RATE', v)}
                    onReset={() => resetField('MAX_RATE')} />
                </div>
              </div>
              <div className="glass rounded-2xl border border-white/8 p-6">
                <SectionHeader icon="🔒" title="Rate Chart Preview" sub="Live wave with current settings applied" />
                <RateChart points={computeRateHistory(overrides, 96)} min={minRate} max={maxRate} base={baseRate} current={currentRate} />
                <div className="mt-2 flex justify-between text-[10px] text-gray-700">
                  <span>Now</span><span>+1h</span><span>+2h</span><span>+3h</span><span>+4h (full cycle)</span>
                </div>
              </div>
              <div className="glass rounded-2xl border border-white/8 p-6">
                <SectionHeader icon="⏱️" title="Transaction Controls" sub="Manage exchange throughput and costs" />
                <div className="space-y-4">
                  <Field label="Daily Transaction Limit" desc="Max exchange transactions per player per 24-hour window"
                    value={dailyTxLimit} defaultVal={EXCHANGE_CONSTANTS.DAILY_TX_LIMIT}
                    min={1} max={100} step={1} unit="trades/day"
                    onChange={v => setField('DAILY_TX_LIMIT', v)}
                    onReset={() => resetField('DAILY_TX_LIMIT')} />
                  <Field label="Exchange Fee" desc="Percentage taken from each exchange output (0 = free)"
                    value={feePct} defaultVal={EXCHANGE_CONSTANTS.FEE_PCT}
                    min={0} max={0.5} step={0.001} unit="fraction" pct
                    onChange={v => setField('FEE_PCT', v)}
                    onReset={() => resetField('FEE_PCT')} />
                </div>
              </div>
            </div>

            {/* Live Calculator */}
            <div className="space-y-4">
              <div className="glass rounded-2xl border border-[#00BFFF]/15 p-6 sticky top-4">
                <SectionHeader icon="🧮" title="Exchange Calculator" sub="Live preview at current rate" />
                <div className="space-y-4">
                  <div>
                    <label className="text-gray-500 text-xs mb-1.5 block">BC to exchange</label>
                    <input type="number" value={simBcInput} min={1} onChange={e => setSimBcInput(Number(e.target.value))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-lg outline-none focus:border-[#00BFFF]/40" />
                  </div>
                  <div className="p-4 rounded-xl bg-[#00BFFF]/5 border border-[#00BFFF]/15 space-y-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Rate</span>
                      <span className="text-[#00BFFF] font-bold">{currentRate} Gems/BC</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Gross output</span>
                      <span className="text-white font-mono">{fmt(simBcInput * currentRate)} Gems</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Fee ({(feePct * 100).toFixed(1)}%)</span>
                      <span className="text-red-400 font-mono">−{fmt(calcFee, 1)} Gems</span>
                    </div>
                    <div className="border-t border-white/8 pt-2 flex justify-between">
                      <span className="text-white text-sm font-bold">Net received</span>
                      <span className="text-purple-400 font-['Space_Grotesk'] font-black text-lg">{fmt(calcGems, 1)} ✦</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/3 border border-white/5 text-xs space-y-1.5 text-gray-500">
                    <div className="flex justify-between"><span>Min rate scenario</span><span className="text-red-400">{fmt(simBcInput * minRate * (1 - feePct), 1)} Gems</span></div>
                    <div className="flex justify-between"><span>Max rate scenario</span><span className="text-green-400">{fmt(simBcInput * maxRate * (1 - feePct), 1)} Gems</span></div>
                    <div className="flex justify-between"><span>Daily limit</span><span className="text-white">{dailyTxLimit} trades</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          TAB: MINING
      ════════════════════════════════════════════════════════════════════════ */}
      {tab === 'mining' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 space-y-4">
              <div className="glass rounded-2xl border border-white/8 p-6">
                <SectionHeader icon="🧱" title="Block Settings" sub="Control block cadence and total reward per block" />
                <div className="space-y-4">
                  <Field label="Block Reward" desc="Total BC distributed to all active miners when a block is solved"
                    value={blockReward} defaultVal={MINING_CONSTANTS.BLOCK_REWARD}
                    min={1} max={100000} step={1} unit="BC"
                    onChange={v => setField('BLOCK_REWARD', v)}
                    onReset={() => resetField('BLOCK_REWARD')} />
                  <Field label="Block Interval" desc="Time between consecutive block solutions (determines earning speed)"
                    value={blockIntervalMs} defaultVal={MINING_CONSTANTS.BLOCK_INTERVAL_MS}
                    min={60000} max={86400000} step={60000} unit="ms" ms
                    onChange={v => setField('BLOCK_INTERVAL_MS', v)}
                    onReset={() => resetField('BLOCK_INTERVAL_MS')} />
                  <Field label="Starting Balance" desc="BC awarded to new mining accounts on registration"
                    value={startingBal} defaultVal={MINING_CONSTANTS.STARTING_BALANCE}
                    min={0} max={100000} step={50} unit="BC"
                    onChange={v => setField('STARTING_BALANCE', v)}
                    onReset={() => resetField('STARTING_BALANCE')} />
                </div>
              </div>

              <div className="glass rounded-2xl border border-white/8 p-6">
                <SectionHeader icon="🎁" title="Reward Distribution" sub={`Must sum to 1.000 — currently ${splitSum.toFixed(3)}`} />
                <div className={`mb-4 flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold border ${splitOk ? 'bg-green-500/8 border-green-500/20 text-green-400' : 'bg-red-500/8 border-red-500/20 text-red-400'}`}>
                  <span>{splitOk ? '✓' : '⚠'}</span>
                  {splitOk ? `Splits are valid (sum = ${splitSum.toFixed(3)})` : `Invalid: sum is ${splitSum.toFixed(3)}, needs to be 1.000`}
                </div>
                <div className="space-y-4">
                  <Field label="Finder Bonus" desc="Extra bonus for the miner who wins the block lottery"
                    value={finderPct} defaultVal={MINING_CONSTANTS.FINDER_BONUS_PCT}
                    min={0} max={1} step={0.01} unit="fraction" pct
                    onChange={v => setField('FINDER_BONUS_PCT', v)}
                    onReset={() => resetField('FINDER_BONUS_PCT')} />
                  <Field label="Equal Split" desc="Fraction split evenly among all active miners regardless of hashrate"
                    value={equalPct} defaultVal={MINING_CONSTANTS.EQUAL_SPLIT_PCT}
                    min={0} max={1} step={0.01} unit="fraction" pct
                    onChange={v => setField('EQUAL_SPLIT_PCT', v)}
                    onReset={() => resetField('EQUAL_SPLIT_PCT')} />
                  <Field label="Hashrate Share" desc="Fraction distributed proportionally by each miner's hashrate"
                    value={hashratePct} defaultVal={MINING_CONSTANTS.HASHRATE_SHARE_PCT}
                    min={0} max={1} step={0.01} unit="fraction" pct
                    onChange={v => setField('HASHRATE_SHARE_PCT', v)}
                    onReset={() => resetField('HASHRATE_SHARE_PCT')} />
                </div>
              </div>
            </div>

            {/* Right panel */}
            <div className="space-y-4">
              <div className="glass rounded-2xl border border-white/8 p-6">
                <SectionHeader icon="🥧" title="Split Visualizer" />
                <SplitDonut finder={finderPct} equal={equalPct} hashrate={hashratePct} />
                <div className="mt-4 p-3 rounded-xl bg-white/3 border border-white/5 text-xs space-y-2 text-gray-500">
                  <p className="text-gray-400 font-semibold text-[11px] mb-2">Per block ({blockReward} BC total)</p>
                  <div className="flex justify-between"><span>🏆 Finder gets</span><span className="text-amber-400 font-bold">{Math.round(blockReward * finderPct)} BC</span></div>
                  <div className="flex justify-between"><span>👥 Equal pool</span><span className="text-[#00BFFF] font-bold">{Math.round(blockReward * equalPct)} BC</span></div>
                  <div className="flex justify-between"><span>⚡ Hashrate pool</span><span className="text-purple-400 font-bold">{Math.round(blockReward * hashratePct)} BC</span></div>
                </div>
              </div>

              <div className="glass rounded-2xl border border-white/8 p-6">
                <SectionHeader icon="🔒" title="Fixed Constants" sub="Hardcoded — not overrideable" />
                <div className="space-y-2 text-xs">
                  {[
                    { label: 'Repair Cost', value: `${(MINING_CONSTANTS.REPAIR_COST_PCT * 100).toFixed(0)}% of rig cost` },
                    { label: 'Max Sell-Back', value: `${(MINING_CONSTANTS.SELL_MAX_PCT * 100).toFixed(0)}% at 100% dur.` },
                    { label: 'UI Tick', value: fmtMs(MINING_CONSTANTS.TICK_INTERVAL_MS) },
                    { label: 'Session Length', value: fmtMs(MINING_CONSTANTS.RENEWAL_DURATION_MS) },
                    { label: 'Price Cycle', value: fmtMs(EXCHANGE_CONSTANTS.FLUCTUATION_PERIOD_MS) },
                    { label: 'Max Rigs/User', value: '10 rigs' },
                  ].map(r => (
                    <div key={r.label} className="flex justify-between py-1.5 border-b border-white/5 last:border-0">
                      <span className="text-gray-600">{r.label}</span>
                      <span className="text-gray-400 font-mono">{r.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          TAB: HARDWARE
      ════════════════════════════════════════════════════════════════════════ */}
      {tab === 'hardware' && (
        <div className="space-y-5">
          <div className="glass rounded-2xl border border-white/8 p-6">
            <SectionHeader icon="🖥️" title="Rig Tier Catalogue" sub="All hardware tiers and their specifications (read-only)" />
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/8">
                    {['Rig', 'Hashrate', 'Cost', 'Lifespan', 'Repair (full)', 'Max Sell', 'Blocks to ROI', 'BC/day (avg)'].map(h => (
                      <th key={h} className="text-left py-3 pr-4 text-gray-500 font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {RIG_TIERS.map(rig => {
                    const lifedays = rig.maxDurability / (rig.lossPerSecond * 86400)
                    const repairCost = Math.ceil(rig.cost * MINING_CONSTANTS.REPAIR_COST_PCT)
                    const maxSell = Math.floor(rig.cost * MINING_CONSTANTS.SELL_MAX_PCT)
                    const npcTotal = npcHashrate
                    const userShare = rig.hashrate / (npcTotal + rig.hashrate)
                    const avgBlockEarn = blockReward * finderPct * userShare
                      + (blockReward * equalPct) / (NPC_MINERS.length + 1)
                      + blockReward * hashratePct * userShare
                    const dailyEarn = avgBlockEarn * blocksPerDay
                    const blocksROI = Math.ceil(rig.cost / (avgBlockEarn || 1))
                    return (
                      <tr key={rig.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            <span className="text-base">{rig.emoji}</span>
                            <div>
                              <p className={`font-semibold ${rig.color}`}>{rig.name}</p>
                              <p className="text-gray-700 text-[9px]">{rig.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 pr-4">
                          <span className="font-['Space_Grotesk'] font-black text-[#00BFFF]">{rig.hashrate}</span>
                          <span className="text-gray-600"> GH/s</span>
                        </td>
                        <td className="py-3 pr-4">
                          <span className="font-bold text-amber-400">{rig.cost.toLocaleString()}</span>
                          <span className="text-gray-600"> BC</span>
                        </td>
                        <td className="py-3 pr-4">
                          <span className="text-white">{lifedays.toFixed(1)}d</span>
                        </td>
                        <td className="py-3 pr-4">
                          <span className="text-orange-400">{repairCost.toLocaleString()} BC</span>
                        </td>
                        <td className="py-3 pr-4">
                          <span className="text-green-400">{maxSell.toLocaleString()} BC</span>
                        </td>
                        <td className="py-3 pr-4">
                          <span className="text-purple-400 font-bold">{blocksROI.toLocaleString()}</span>
                          <span className="text-gray-600"> blocks</span>
                        </td>
                        <td className="py-3">
                          <span className="text-cyan-400 font-bold">{fmt(dailyEarn, 0)}</span>
                          <span className="text-gray-600"> BC</span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Rig comparison cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {RIG_TIERS.map(rig => {
              const lifedays = rig.maxDurability / (rig.lossPerSecond * 86400)
              const userShareR = rig.hashrate / (npcHashrate + rig.hashrate)
              const avgBlockEarn = blockReward * finderPct * userShareR
                + (blockReward * equalPct) / (NPC_MINERS.length + 1)
                + blockReward * hashratePct * userShareR
              const daysROI = (rig.cost / (avgBlockEarn * blocksPerDay)) || 0
              return (
                <div key={rig.id} className={`glass rounded-xl p-4 border ${rig.borderColor} text-center`}
                  style={{ boxShadow: `0 0 20px ${rig.glowColor}20` }}>
                  <span className="text-2xl">{rig.emoji}</span>
                  <p className={`font-semibold text-xs mt-1 ${rig.color}`}>{rig.name}</p>
                  <p className="font-['Space_Grotesk'] font-black text-xl text-white mt-2">{rig.hashrate} <span className="text-gray-600 text-[10px] font-normal">GH/s</span></p>
                  <div className="mt-3 space-y-1 text-[10px]">
                    <div className="flex justify-between"><span className="text-gray-600">Cost</span><span className="text-amber-400 font-bold">{rig.cost.toLocaleString()} BC</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Lifespan</span><span className="text-white">{lifedays.toFixed(1)}d</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">ROI</span><span className="text-purple-400 font-bold">{daysROI.toFixed(1)}d</span></div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          TAB: SIMULATOR
      ════════════════════════════════════════════════════════════════════════ */}
      {tab === 'simulator' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

            {/* Controls */}
            <div className="lg:col-span-2 space-y-4">
              <div className="glass rounded-2xl border border-white/8 p-6">
                <SectionHeader icon="🧪" title="Mining Simulator" sub="Projected earnings with current economy settings" />
                <div className="space-y-5">
                  <div>
                    <label className="text-gray-400 text-xs font-semibold block mb-2">Rig Tier</label>
                    <div className="grid grid-cols-1 gap-2">
                      {RIG_TIERS.map(t => (
                        <button key={t.id} onClick={() => setSimRigTier(t.id)}
                          className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border text-left transition-all ${
                            simRigTier === t.id ? `${t.borderColor} bg-white/5` : 'border-white/8 hover:border-white/15'
                          }`}>
                          <span className="text-base">{t.emoji}</span>
                          <div className="flex-1">
                            <p className={`text-xs font-semibold ${simRigTier === t.id ? t.color : 'text-gray-400'}`}>{t.name}</p>
                            <p className="text-gray-700 text-[10px]">{t.hashrate} GH/s · {t.cost.toLocaleString()} BC</p>
                          </div>
                          {simRigTier === t.id && <span className={`text-[10px] font-bold ${t.color}`}>✓</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs font-semibold block mb-2">Number of Rigs: <span className="text-white">{simRigCount}</span></label>
                    <input type="range" min={1} max={10} step={1} value={simRigCount}
                      onChange={e => setSimRigCount(Number(e.target.value))}
                      className="w-full accent-[#00BFFF]" />
                    <div className="flex justify-between text-[10px] text-gray-700 mt-1"><span>1</span><span>5</span><span>10</span></div>
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs font-semibold block mb-2">Blocks to Simulate: <span className="text-white">{simBlocks}</span></label>
                    <input type="range" min={1} max={500} step={1} value={simBlocks}
                      onChange={e => setSimBlocks(Number(e.target.value))}
                      className="w-full accent-[#00BFFF]" />
                    <div className="flex justify-between text-[10px] text-gray-700 mt-1"><span>1</span><span>≈{fmt(blocksPerDay,0)}/day</span><span>500</span></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="lg:col-span-3 space-y-4">
              <div className="glass rounded-2xl border border-[#00BFFF]/15 p-6">
                <SectionHeader icon="📈" title="Projected Earnings" sub={`${simRigCount}× ${simTier.name} over ${simBlocks} blocks`} />
                <div className="grid grid-cols-2 gap-4 mb-5">
                  {[
                    { label: 'Total Hashrate', value: `${userHashrate} GH/s`, color: 'text-[#00BFFF]', sub: `${simRigCount} × ${simTier.hashrate} GH/s` },
                    { label: 'Pool Share', value: `${(userShare * 100).toFixed(1)}%`, color: 'text-purple-400', sub: `vs ${npcHashrate} GH/s NPC pool` },
                    { label: 'Avg Per Block', value: `${fmt(avgPerBlock, 1)} BC`, color: 'text-amber-400', sub: 'expected average' },
                    { label: 'Time Elapsed', value: fmtMs(simBlocks * blockIntervalMs), color: 'text-green-400', sub: `${simDays.toFixed(1)} days` },
                  ].map(s => (
                    <div key={s.label} className="p-4 rounded-xl bg-white/3 border border-white/5">
                      <p className={`font-['Space_Grotesk'] font-black text-2xl ${s.color}`}>{s.value}</p>
                      <p className="text-white text-xs font-semibold mt-1">{s.label}</p>
                      <p className="text-gray-600 text-[10px] mt-0.5">{s.sub}</p>
                    </div>
                  ))}
                </div>

                {/* Big earnings display */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 text-center">
                  <p className="text-gray-400 text-xs uppercase tracking-widest mb-2">Projected BC Earned</p>
                  <p className="font-['Space_Grotesk'] font-black text-5xl text-amber-400">{fmt(simEarnings)}</p>
                  <p className="text-gray-500 text-sm mt-1">BlueCoin over {simBlocks} block{simBlocks !== 1 ? 's' : ''}</p>
                  <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                    <div>
                      <p className="text-amber-300 font-bold text-sm">{fmt(simEarnings / (simDays || 1))}</p>
                      <p className="text-gray-600 text-[10px]">BC per day</p>
                    </div>
                    <div>
                      <p className="text-amber-300 font-bold text-sm">{fmt(simEarnings / (simBlocks || 1), 1)}</p>
                      <p className="text-gray-600 text-[10px]">BC per block</p>
                    </div>
                    <div>
                      <p className="text-amber-300 font-bold text-sm">{fmt(simEarnings * currentRate * (1 - feePct))}</p>
                      <p className="text-gray-600 text-[10px]">Gems if exchanged</p>
                    </div>
                  </div>
                </div>

                {/* ROI section */}
                <div className="mt-4 p-4 rounded-xl bg-white/3 border border-white/5">
                  <p className="text-gray-400 text-xs font-semibold mb-3">Return on Investment</p>
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-gray-500 text-xs">Rig cost ({simRigCount}×)</p>
                      <p className="font-['Space_Grotesk'] font-black text-xl text-white">{fmt(rigCost)} BC</p>
                    </div>
                    <div className="flex-1 text-center text-gray-700">→</div>
                    <div>
                      <p className="text-gray-500 text-xs">Break-even at</p>
                      <p className="font-['Space_Grotesk'] font-black text-xl text-green-400">{fmt(blocksToROI)} blocks</p>
                      <p className="text-gray-600 text-[10px]">≈ {fmtMs(blocksToROI * blockIntervalMs)}</p>
                    </div>
                    <div className="flex-1 text-center text-gray-700">→</div>
                    <div>
                      <p className="text-gray-500 text-xs">Net after {simBlocks} blocks</p>
                      <p className={`font-['Space_Grotesk'] font-black text-xl ${simEarnings - rigCost >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {simEarnings - rigCost >= 0 ? '+' : ''}{fmt(simEarnings - rigCost)} BC
                      </p>
                    </div>
                  </div>
                  {/* ROI progress bar */}
                  <div className="mt-3">
                    <div className="flex justify-between text-[10px] text-gray-600 mb-1">
                      <span>0</span>
                      <span>ROI at {fmt(blocksToROI)} blocks</span>
                      <span>{simBlocks} blocks</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                      <div className={`h-2 rounded-full transition-all ${simEarnings >= rigCost ? 'bg-gradient-to-r from-green-500/60 to-green-400' : 'bg-gradient-to-r from-orange-500/60 to-orange-400'}`}
                        style={{ width: `${Math.min(100, (simBlocks / blocksToROI) * 100)}%` }} />
                    </div>
                  </div>
                </div>

                {/* Win probability */}
                <div className="mt-4 p-4 rounded-xl bg-white/3 border border-white/5">
                  <p className="text-gray-400 text-xs font-semibold mb-3">Block Win Probability (Finder Bonus)</p>
                  <div className="flex items-center gap-3">
                    <div className="relative w-16 h-16">
                      <svg viewBox="0 0 56 56" className="w-full h-full -rotate-90">
                        <circle cx="28" cy="28" r="22" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
                        <circle cx="28" cy="28" r="22" fill="none" stroke="#f59e0b" strokeWidth="6"
                          strokeDasharray={`${userShare * 2 * Math.PI * 22} ${2 * Math.PI * 22}`}
                          strokeLinecap="round" />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-amber-400 font-['Space_Grotesk'] font-black text-xs">
                        {(userShare * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="flex-1 text-xs text-gray-500 space-y-1">
                      <p>Probability of winning each block's finder bonus</p>
                      <p>Expected wins in {simBlocks} blocks: <span className="text-amber-400 font-bold">{(userShare * simBlocks).toFixed(1)}</span></p>
                      <p>Finder BC per win: <span className="text-amber-400 font-bold">{Math.round(blockReward * finderPct)} BC</span></p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          TAB: HISTORY
      ════════════════════════════════════════════════════════════════════════ */}
      {tab === 'history' && (
        <div className="space-y-4">
          <div className="glass rounded-2xl border border-white/8 p-6">
            <SectionHeader icon="📋" title="Save History" sub="Last 15 economy snapshots — click Restore to load a previous configuration" />
            {history.length === 0 ? (
              <div className="text-center py-12 text-gray-600">
                <div className="text-4xl mb-3 opacity-30">📋</div>
                <p className="text-sm">No saves yet. Changes appear here after you click Save Economy.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((entry, i) => {
                  const ov = entry.overrides
                  const date = new Date(entry.ts)
                  return (
                    <div key={entry.ts} className={`p-5 rounded-xl border ${i === 0 ? 'bg-[#00BFFF]/4 border-[#00BFFF]/15' : 'bg-white/2 border-white/6'} hover:border-white/15 transition-all`}>
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            {i === 0 && <span className="text-[9px] font-bold bg-[#00BFFF]/15 text-[#00BFFF] border border-[#00BFFF]/20 px-1.5 py-0.5 rounded-full">LATEST</span>}
                            <span className="text-white text-sm font-semibold">
                              {date.toLocaleDateString()} at {date.toLocaleTimeString()}
                            </span>
                            <span className="text-gray-600 text-xs">by {entry.admin}</span>
                          </div>
                          <p className="text-gray-500 text-xs mt-1">
                            {entry.overrideCount === 0 ? 'All defaults (reset)' : `${entry.overrideCount} override${entry.overrideCount !== 1 ? 's' : ''} active`}
                          </p>
                        </div>
                        <button onClick={() => restoreHistory(entry)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#00BFFF] border border-[#00BFFF]/25 hover:bg-[#00BFFF]/10 transition-all shrink-0">
                          ↩ Restore
                        </button>
                      </div>
                      {entry.overrideCount > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {Object.entries(ov).map(([key, val]) =>
                            val !== undefined ? (
                              <span key={key} className="px-2 py-0.5 rounded-md text-[10px] bg-orange-500/10 border border-orange-500/15 text-orange-300 font-mono">
                                {key}={key.endsWith('PCT') ? `${((val as number)*100).toFixed(0)}%` : key.endsWith('MS') ? fmtMs(val as number) : String(val)}
                              </span>
                            ) : null
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Save bar ───────────────────────────────────────────────────────── */}
      <div className="sticky bottom-0 mt-6 pt-4 pb-1">
        <div className="glass rounded-2xl border border-white/10 px-6 py-4 flex flex-wrap items-center justify-between gap-4"
          style={{ backdropFilter: 'blur(20px)' }}>
          <div className="flex items-center gap-3">
            {overrideCount > 0 ? (
              <span className="flex items-center gap-1.5 text-xs text-orange-400">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                {overrideCount} unsaved override{overrideCount !== 1 ? 's' : ''}
              </span>
            ) : (
              <span className="text-xs text-gray-600">All settings at defaults</span>
            )}
            {!splitOk && (
              <span className="text-xs text-red-400">⚠ Reward splits invalid (sum={splitSum.toFixed(3)})</span>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowReset(true)}
              className="px-4 py-2 rounded-xl text-xs text-gray-400 border border-white/10 hover:border-white/20 hover:text-white transition-all">
              ↺ Reset All
            </button>
            <button onClick={handleSave} disabled={!splitOk}
              className={`px-6 py-2 rounded-xl text-sm font-bold border transition-all ${
                !splitOk
                  ? 'bg-red-500/10 border-red-500/30 text-red-400 cursor-not-allowed opacity-60'
                  : 'btn-primary text-white'
              }`}>
              💾 Save Economy
            </button>
          </div>
        </div>
      </div>

      {/* ── Reset confirm modal ─────────────────────────────────────────────── */}
      {showReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="glass rounded-2xl border border-orange-500/20 p-8 max-w-sm w-full text-center">
            <div className="text-5xl mb-4">⚠️</div>
            <h3 className="text-white font-['Space_Grotesk'] font-black text-xl mb-2">Reset Economy?</h3>
            <p className="text-gray-500 text-sm mb-6">
              All {overrideCount} custom override{overrideCount !== 1 ? 's' : ''} will be cleared and every value will revert to its coded default. This takes effect immediately on save.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowReset(false)}
                className="flex-1 py-3 rounded-xl text-sm text-gray-400 border border-white/10 hover:bg-white/5 transition-all">
                Cancel
              </button>
              <button onClick={handleReset}
                className="flex-1 py-3 rounded-xl text-sm font-bold text-orange-400 border border-orange-500/30 bg-orange-500/10 hover:bg-orange-500/20 transition-all">
                Reset to Defaults
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
