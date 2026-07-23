import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { BarChart2, Copy, Check } from 'lucide-react'

const DiscordIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057.1 18.08.114 18.1.12 18.12a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
  </svg>
)

function CopyIPButton() {
  const [copied, setCopied] = useState(false)
  const ip = 'play.sennahosting.com'

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(ip)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="group inline-flex items-center gap-2.5 px-4 py-2 rounded-lg bg-[#111111] border border-[#222222] hover:border-[#333333] transition-all duration-200 cursor-pointer"
    >
      <span className="font-mono text-white text-sm">{ip}</span>
      <span className={`flex items-center gap-1 text-xs transition-colors duration-200 ${copied ? 'text-green-400' : 'text-[#555555] group-hover:text-[#888888]'}`}>
        {copied ? <Check size={12} /> : <Copy size={12} />}
        {copied ? 'Copied!' : 'Copy'}
      </span>
    </button>
  )
}

export function Hero() {
  return (
    <section className="flex flex-col items-center justify-center min-h-screen text-center px-4 pt-14">
      {/* Logo mark */}
      <div className="mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#111111] border border-[#222222]">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"/>
            <line x1="13" y1="19" x2="19" y2="13"/>
            <line x1="16" y1="16" x2="20" y2="20"/>
            <line x1="19" y1="21" x2="21" y2="19"/>
            <polyline points="14.5 6.5 18 3 21 3 21 6 17.5 9.5"/>
            <line x1="5" y1="14" x2="9" y2="18"/>
            <line x1="7" y1="21" x2="3" y2="21"/>
            <line x1="3" y1="18" x2="5" y2="21"/>
          </svg>
        </div>
      </div>

      {/* Heading */}
      <h1 className="font-bold text-[56px] sm:text-[80px] lg:text-[96px] leading-none tracking-tight text-white mb-4">
        Blue Tiers
      </h1>

      {/* Subtitle */}
      <p className="text-[#777777] text-lg sm:text-xl mb-8 max-w-lg">
        #1 Tier List for all types of Minecraft PvP players.
      </p>

      {/* Server IP */}
      <div className="mb-10">
        <CopyIPButton />
      </div>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Link
          to="/rankings"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-black text-sm font-semibold hover:bg-white/90 transition-colors duration-150"
        >
          <BarChart2 size={15} />
          View Rankings
        </Link>
        <a
          href="https://discord.gg/DmEPAb3NFU"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#111111] border border-[#222222] text-white text-sm font-semibold hover:bg-[#1a1a1a] hover:border-[#333333] transition-all duration-150"
        >
          <DiscordIcon />
          Join Discord
        </a>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-20">
        <div className="w-4 h-7 border border-white/40 rounded-full flex justify-center pt-1.5">
          <div className="w-0.5 h-1.5 bg-white/60 rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  )
}
