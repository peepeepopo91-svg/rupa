import { useState, useEffect } from 'react'
import { Link, useLocation } from '@tanstack/react-router'
import { BarChart2, Trophy, Pickaxe, ArrowLeftRight, ShoppingBag, Search, User } from 'lucide-react'

const DiscordIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057.1 18.08.114 18.1.12 18.12a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
  </svg>
)

const SwordsLogo = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"/>
    <line x1="13" y1="19" x2="19" y2="13"/>
    <line x1="16" y1="16" x2="20" y2="20"/>
    <line x1="19" y1="21" x2="21" y2="19"/>
    <polyline points="14.5 6.5 18 3 21 3 21 6 17.5 9.5"/>
    <line x1="5" y1="14" x2="9" y2="18"/>
    <line x1="7" y1="21" x2="3" y2="21"/>
    <line x1="3" y1="18" x2="5" y2="21"/>
  </svg>
)

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  const navLinks = [
    { to: '/rankings',   label: 'Rankings',   icon: BarChart2 },
    { to: '/tournament', label: 'Tournament',  icon: Trophy },
    { to: '/mining',     label: 'Mining',      icon: Pickaxe },
    { to: '/exchange',   label: 'Exchange',    icon: ArrowLeftRight },
    { to: '/shop',       label: 'Shop',        icon: ShoppingBag },
  ]

  const isActive = (to: string) => location.pathname === to

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full bg-black border-b border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-white hover:opacity-80 transition-opacity flex-shrink-0">
            <SwordsLogo />
            <span className="font-bold text-[15px] tracking-tight">
              <span className="text-[#00BFFF]">Blue</span>
              <span className="text-white">Tiers</span>
            </span>
          </Link>

          {/* Center nav */}
          <nav className="hidden md:flex items-center bg-[#111111] border border-[#222222] rounded-xl px-1 py-1 gap-0.5">
            {navLinks.map((link) => {
              const Icon = link.icon
              const active = isActive(link.to)
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-150 ${
                    active
                      ? 'bg-[#222222] text-white'
                      : 'text-[#888888] hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon size={13} strokeWidth={2} />
                  {link.label}
                </Link>
              )
            })}
            <a
              href="https://discord.gg/DmEPAb3NFU"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[13px] font-medium text-[#888888] hover:text-white hover:bg-white/5 transition-all duration-150"
            >
              <DiscordIcon />
              Discord
            </a>
          </nav>

          {/* Right: search + user */}
          <div className="hidden md:flex items-center gap-2">
            {/* Search */}
            <div className="flex items-center gap-2 bg-[#111111] border border-[#222222] rounded-xl px-3 py-1.5 min-w-[190px] cursor-pointer hover:border-[#333333] transition-colors group">
              <Search size={13} className="text-[#555555] group-hover:text-[#777777] transition-colors flex-shrink-0" />
              <span className="text-[13px] text-[#555555] flex-1">Search Player</span>
              <div className="flex items-center gap-0.5">
                <kbd className="text-[10px] text-[#444444] bg-[#1a1a1a] border border-[#2a2a2a] rounded px-1 py-0.5 font-mono leading-none">Ctrl</kbd>
                <kbd className="text-[10px] text-[#444444] bg-[#1a1a1a] border border-[#2a2a2a] rounded px-1 py-0.5 font-mono leading-none">K</kbd>
              </div>
            </div>
            {/* User icon */}
            <button className="w-8 h-8 rounded-full bg-[#111111] border border-[#222222] flex items-center justify-center text-[#666666] hover:text-white hover:border-[#333333] transition-all">
              <User size={14} />
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-[#666666] hover:text-white hover:bg-white/5 transition-colors"
          >
            <div className="w-5 h-3.5 flex flex-col justify-between">
              <span className={`block h-0.5 bg-current transition-all duration-300 ${mobileOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
              <span className={`block h-0.5 bg-current transition-all duration-300 ${mobileOpen ? 'opacity-0' : ''}`} />
              <span className={`block h-0.5 bg-current transition-all duration-300 ${mobileOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </div>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 border-t border-[#1a1a1a] mt-1 pt-3 space-y-0.5">
            {navLinks.map((link) => {
              const Icon = link.icon
              const active = isActive(link.to)
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    active ? 'text-white bg-[#1a1a1a]' : 'text-[#888888] hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon size={14} />
                  {link.label}
                </Link>
              )
            })}
            <a
              href="https://discord.gg/DmEPAb3NFU"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-[#888888] hover:text-white hover:bg-white/5 transition-all"
            >
              <DiscordIcon />
              Discord
            </a>
          </div>
        )}
      </div>
    </header>
  )
}
