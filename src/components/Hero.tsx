import { useState, useEffect, useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import { Copy, Check } from 'lucide-react'
import playersData from '../../data/players.json'

const DiscordIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057.1 18.08.114 18.1.12 18.12a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
  </svg>
)

const MODE_LABELS: Record<string, string> = {
  sword: 'Sword',
  crystal: 'Crystal',
  axe: 'Axe',
  mace: 'Mace',
  uhc: 'UHC',
  nethpot: 'Nethpot',
  diapot: 'Diapot',
}

// Build a flat list of real player+tier+mode entries (exclude NONE ranks)
type Entry = { player: string; tier: string; mode: string }

function buildEntries(): Entry[] {
  const entries: Entry[] = []
  for (const p of playersData as Array<{ name: string; ranks: Record<string, string> }>) {
    for (const [mode, tier] of Object.entries(p.ranks)) {
      if (tier && tier !== 'NONE') {
        entries.push({ player: p.name, tier, mode: MODE_LABELS[mode] ?? mode })
      }
    }
  }
  // Shuffle so order is random on every page load
  for (let i = entries.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[entries[i], entries[j]] = [entries[j], entries[i]]
  }
  return entries
}

function LiveTicker() {
  const entries = useMemo(() => buildEntries(), [])
  const [idx, setIdx] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (entries.length === 0) return
    const timer = setInterval(() => {
      // Fade out, swap, fade in
      setVisible(false)
      setTimeout(() => {
        setIdx((i) => (i + 1) % entries.length)
        setVisible(true)
      }, 300)
    }, 5000)
    return () => clearInterval(timer)
  }, [entries])

  if (entries.length === 0) return null
  const activity = entries[idx]

  return (
    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm mb-8 backdrop-blur-sm">
      <span className="flex items-center gap-1.5 shrink-0">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
        </span>
        <span className="text-red-400 font-bold text-[11px] tracking-wider">LIVE</span>
      </span>
      <span
        className="text-white/60 text-[12px] transition-opacity duration-300"
        style={{ opacity: visible ? 1 : 0 }}
      >
        <span className="text-white font-semibold">{activity.player}</span>
        {' '}got{' '}
        <span
          style={{
            background: 'linear-gradient(90deg, #00BFFF, #8b5cf6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
          className="font-bold"
        >
          {activity.tier}
        </span>
        {' '}in {activity.mode}
      </span>
    </div>
  )
}

function CopyIPButton() {
  const [copied, setCopied] = useState(false)
  const ip = 'play.sennahosting.com'

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(ip)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* fallback */ }
  }

  return (
    <button
      onClick={handleCopy}
      className="group inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all duration-200 cursor-pointer mb-8"
    >
      <span className="font-mono text-white/70 text-sm">{ip}</span>
      <span className={`flex items-center gap-1 text-xs transition-colors ${copied ? 'text-green-400' : 'text-white/30 group-hover:text-white/50'}`}>
        {copied ? <Check size={11} /> : <Copy size={11} />}
        {copied ? 'Copied!' : 'Copy'}
      </span>
    </button>
  )
}

export function Hero() {
  return (
    <section className="relative flex flex-col items-center justify-center min-h-screen text-center px-4 pt-14 pb-8">
      {/* Live ticker */}
      <LiveTicker />

      {/* Main headline */}
      <h1 className="font-black leading-none tracking-tight mb-6 select-none">
        <span className="block text-[64px] sm:text-[96px] lg:text-[128px] text-white drop-shadow-2xl">
          DOMINATE
        </span>
        <span
          className="block text-[64px] sm:text-[96px] lg:text-[128px]"
          style={{
            background: 'linear-gradient(135deg, #00BFFF 0%, #8b5cf6 50%, #ec4899 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          THE TIERS
        </span>
      </h1>

      {/* Subtitle */}
      <p className="text-white/50 text-base sm:text-lg mb-8 max-w-md">
        The ultimate Minecraft PvP tier ranking platform. Discover the best — and the worst.
      </p>

      {/* CTA buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3 mb-10">
        <a
          href="https://discord.gg/DmEPAb3NFU"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold text-sm text-white transition-all duration-200 hover:opacity-90 hover:scale-[1.02]"
          style={{ background: 'linear-gradient(135deg, #5865F2, #4752c4)' }}
        >
          <DiscordIcon />
          Join Discord
        </a>
        <Link
          to="/rankings"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/8 border border-white/15 text-white font-semibold text-sm hover:bg-white/12 hover:border-white/25 transition-all duration-200 hover:scale-[1.02]"
        >
          Leaderboards
        </Link>
      </div>

      {/* Server IP */}
      <CopyIPButton />

      {/* Scroll hint */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 opacity-20 animate-bounce">
        <div className="w-4 h-7 border border-white/40 rounded-full flex justify-center pt-1.5">
          <div className="w-0.5 h-1.5 bg-white rounded-full" />
        </div>
      </div>
    </section>
  )
}
