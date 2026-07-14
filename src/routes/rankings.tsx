import { useState, useMemo } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Navbar } from '../components/Navbar'
import { EventBanner } from '../components/EventBanner'
import { Footer } from '../components/Footer'
import { PlayerCard, gamemodes, tierColors, TIER_ORDER } from '../components/PlayerCard'
import type { PlayerRanks } from '../data/players'
import players from '../data/players'
import { computeRankings, tierSortValue, TIER_POINTS } from '../data/tiers'

export const Route = createFileRoute('/rankings')({
  component: RankingsPage,
})

type SortMode = 'points-desc' | 'points-asc' | 'name-asc' | 'name-desc'

function RankingsPage() {
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState<keyof PlayerRanks | 'all'>('all')
  const [sortMode, setSortMode] = useState<SortMode>('points-desc')
  const [minTier, setMinTier] = useState<string>('all')

  // Compute global rankings once — these never change with filter/sort
  const globalRankings = useMemo(() => computeRankings(players), [])

  const filtered = useMemo(() => {
    return players
      .filter((p) => {
        if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false
        if (activeFilter !== 'all' && !p.ranks[activeFilter]) return false
        if (minTier !== 'all') {
          const minVal = tierSortValue(minTier)
          const bestVal = activeFilter !== 'all'
            ? tierSortValue(p.ranks[activeFilter])
            : Math.min(
                ...Object.values(p.ranks)
                  .filter(Boolean)
                  .map((t) => tierSortValue(t as string))
              )
          if (bestVal > minVal) return false
        }
        return true
      })
      .sort((a, b) => {
        const aInfo = globalRankings.get(a.name)!
        const bInfo = globalRankings.get(b.name)!

        if (sortMode === 'points-desc') {
          if (activeFilter !== 'all') {
            return tierSortValue(a.ranks[activeFilter]) - tierSortValue(b.ranks[activeFilter])
          }
          return bInfo.totalPoints - aInfo.totalPoints
        }
        if (sortMode === 'points-asc') {
          if (activeFilter !== 'all') {
            return tierSortValue(b.ranks[activeFilter]) - tierSortValue(a.ranks[activeFilter])
          }
          return aInfo.totalPoints - bInfo.totalPoints
        }
        if (sortMode === 'name-asc') return a.name.localeCompare(b.name)
        if (sortMode === 'name-desc') return b.name.localeCompare(a.name)
        return 0
      })
  }, [search, activeFilter, sortMode, minTier, globalRankings])

  const sortOptions: { value: SortMode; label: string }[] = [
    { value: 'points-desc', label: 'Points (High → Low)' },
    { value: 'points-asc',  label: 'Points (Low → High)' },
    { value: 'name-asc',    label: 'Name (A → Z)' },
    { value: 'name-desc',   label: 'Name (Z → A)' },
  ]

  return (
    <div className="min-h-screen bg-[#0B0F17]">
      <EventBanner />
      <Navbar />

      {/* Page header */}
      <section className="relative pt-12 pb-12 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#00BFFF]/5 to-transparent pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-64 bg-[#0066FF]/10 blur-[100px] pointer-events-none" />
        <div className="max-w-6xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#00BFFF]/20 bg-[#00BFFF]/5 text-[#00BFFF] text-xs font-semibold mb-6 tracking-wide uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00BFFF] animate-pulse" />
            Live Rankings
          </div>
          <h1 className="font-['Space_Grotesk'] font-black text-4xl sm:text-5xl text-white mb-4">
            Player <span className="text-gradient">Rankings</span>
          </h1>
          <p className="text-gray-500 max-w-md mx-auto">
            Official tier placements for the Blue Tiers network.
          </p>
        </div>
      </section>

      {/* Tier legend */}
      <section className="px-4 pb-6">
        <div className="max-w-6xl mx-auto">
          <div className="glass rounded-xl border border-white/5 p-4">
            <div className="flex flex-wrap items-center gap-2 justify-center">
              <span className="text-gray-600 text-xs font-semibold uppercase tracking-wide mr-2">Tiers:</span>
              {TIER_ORDER.map((tier) => {
                const colors = tierColors[tier]
                return (
                  <span
                    key={tier}
                    className={`px-3 py-1 rounded-lg text-xs font-bold border ${colors.bg} ${colors.text} ${colors.border}`}
                  >
                    {tier}
                    <span className="ml-1 opacity-60 font-normal">{TIER_POINTS[tier]}pt</span>
                  </span>
                )
              })}
              <span className="px-3 py-1 rounded-lg text-xs font-bold border bg-white/3 text-gray-600 border-white/10">
                Unranked
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Search + Filters */}
      <section className="px-4 pb-8">
        <div className="max-w-6xl mx-auto space-y-4">
          {/* Search */}
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search player..."
              className="w-full bg-white/3 border border-white/8 hover:border-white/15 focus:border-[#00BFFF]/50 rounded-xl pl-11 pr-4 py-3 text-white text-sm placeholder-gray-600 outline-none transition-all duration-200"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
              >
                ✕
              </button>
            )}
          </div>

          {/* Controls row: sort + min tier filter */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Sort */}
            <div className="flex items-center gap-2">
              <span className="text-gray-600 text-xs font-semibold uppercase tracking-wide">Sort:</span>
              <div className="flex flex-wrap gap-1.5">
                {sortOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setSortMode(opt.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                      sortMode === opt.value
                        ? 'bg-[#00BFFF]/15 text-[#00BFFF] border border-[#00BFFF]/30'
                        : 'bg-white/3 text-gray-500 border border-white/8 hover:text-white hover:border-white/20'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Min tier filter */}
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-gray-600 text-xs font-semibold uppercase tracking-wide">Min Tier:</span>
              <select
                value={minTier}
                onChange={(e) => setMinTier(e.target.value)}
                className="bg-white/3 border border-white/8 hover:border-white/15 focus:border-[#00BFFF]/50 rounded-lg px-3 py-1.5 text-xs text-white outline-none transition-all duration-200 cursor-pointer"
              >
                <option value="all" className="bg-[#111827]">All Tiers</option>
                {TIER_ORDER.map((t) => (
                  <option key={t} value={t} className="bg-[#111827]">{t}+</option>
                ))}
              </select>
            </div>
          </div>

          {/* Gamemode filters */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                activeFilter === 'all'
                  ? 'bg-[#00BFFF]/15 text-[#00BFFF] border border-[#00BFFF]/30'
                  : 'bg-white/3 text-gray-500 border border-white/8 hover:text-white hover:border-white/20'
              }`}
            >
              All
            </button>
            {gamemodes.map((gm) => (
              <button
                key={gm.key}
                onClick={() => setActiveFilter(gm.key)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  activeFilter === gm.key
                    ? 'bg-[#00BFFF]/15 text-[#00BFFF] border border-[#00BFFF]/30'
                    : 'bg-white/3 text-gray-500 border border-white/8 hover:text-white hover:border-white/20'
                }`}
              >
                <span>{gm.fallback}</span>
                {gm.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Player grid */}
      <section className="px-4 pb-16">
        <div className="max-w-6xl mx-auto">
          {filtered.length > 0 ? (
            <>
              <div className="text-gray-600 text-xs mb-4">
                {filtered.length} player{filtered.length !== 1 ? 's' : ''} found
                {activeFilter !== 'all' && ` in ${gamemodes.find(g => g.key === activeFilter)?.label}`}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 stagger">
                {filtered.map((player) => {
                  const info = globalRankings.get(player.name)
                  return (
                    <PlayerCard
                      key={player.name}
                      player={player}
                      totalPoints={info?.totalPoints}
                      overallRank={info?.rank}
                      overallTier={info?.overallTier}
                    />
                  )
                })}
              </div>
            </>
          ) : (
            <div className="text-center py-24">
              <div className="text-5xl mb-4">🔍</div>
              <p className="text-gray-500 text-lg font-semibold">No players found</p>
              <p className="text-gray-700 text-sm mt-1">Try a different search or filter</p>
              <button
                onClick={() => { setSearch(''); setActiveFilter('all'); setMinTier('all') }}
                className="mt-4 px-5 py-2 rounded-lg bg-[#00BFFF]/10 text-[#00BFFF] text-sm hover:bg-[#00BFFF]/20 transition-colors border border-[#00BFFF]/20"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}
