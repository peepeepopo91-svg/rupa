import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'
import { getTournamentData } from '../server/tournamentServer'
import type { TournamentsFile, Tournament } from '../data/tournament'
import { TournamentHome }          from '../components/tournament/TournamentHome'
import { TournamentBracket }       from '../components/tournament/TournamentBracket'
import { TournamentSchedule }      from '../components/tournament/TournamentSchedule'
import { TournamentRules }         from '../components/tournament/TournamentRules'
import { TournamentPrizes }        from '../components/tournament/TournamentPrizes'
import { TournamentStats }         from '../components/tournament/TournamentStats'
import { TournamentArchive }       from '../components/tournament/TournamentArchive'
import { TournamentAnnouncements } from '../components/tournament/TournamentAnnouncements'
import { LiveTournament }          from '../components/tournament/LiveTournament'
import { Navbar }                  from '../components/Navbar'

export const Route = createFileRoute('/tournament')({
  component: TournamentPage,
})

type Tab = 'home' | 'bracket' | 'schedule' | 'live' | 'prizes' | 'rules' | 'stats' | 'archive' | 'announcements'

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'home',          label: 'Home',          icon: '🏆' },
  { id: 'bracket',       label: 'Bracket',       icon: '⚔️' },
  { id: 'schedule',      label: 'Schedule',      icon: '📅' },
  { id: 'live',          label: 'Live',          icon: '🔴' },
  { id: 'prizes',        label: 'Prizes',        icon: '🎁' },
  { id: 'rules',         label: 'Rules',         icon: '📜' },
  { id: 'stats',         label: 'Statistics',    icon: '📊' },
  { id: 'announcements', label: 'Announcements', icon: '📣' },
  { id: 'archive',       label: 'Archive',       icon: '🗃️' },
]

function TournamentPage() {
  const [tab, setTab]             = useState<Tab>('home')
  const [data, setData]           = useState<TournamentsFile | null>(null)
  const [loading, setLoading]     = useState(true)
  const esRef                     = useRef<EventSource | null>(null)

  async function load() {
    try {
      const d = await getTournamentData()
      setData(d)
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }

  useEffect(() => {
    load()
    const es = new EventSource('/api/tournament-events')
    esRef.current = es
    es.addEventListener('tournament_updated', () => load())
    return () => es.close()
  }, [])

  const active: Tournament | null =
    data?.activeTournamentId
      ? (data.tournaments.find(t => t.id === data.activeTournamentId) ?? null)
      : null

  const archives = data?.tournaments.filter(t => t.status === 'archived' || t.status === 'completed') ?? []

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F17] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="text-4xl animate-spin">⟳</div>
          <p className="text-gray-500 text-sm">Loading tournament data…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0B0F17] text-white">
      <Navbar />

      {/* Page hero */}
      <div className="pt-28 pb-8 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#00BFFF]/5 to-transparent pointer-events-none" />
        <div className="relative max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00BFFF]/10 border border-[#00BFFF]/20 text-[#00BFFF] text-xs font-semibold tracking-widest uppercase mb-4">
            🏆 Tournament Hub
          </div>
          <h1 className="font-['Space_Grotesk'] font-black text-4xl md:text-6xl text-white mb-3">
            Blue Network <span className="text-[#00BFFF]">Tournaments</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Professional PvP tournaments — register your team, track live brackets, and claim glory.
          </p>
        </div>
      </div>

      {/* Tab bar */}
      <div className="sticky top-16 z-30 bg-[#0B0F17]/95 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide py-2">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  tab === t.id
                    ? 'bg-[#00BFFF]/15 text-[#00BFFF] border border-[#00BFFF]/30'
                    : 'text-gray-500 hover:text-gray-300 hover:bg-white/5 border border-transparent'
                }`}
              >
                <span>{t.icon}</span>
                {t.label}
                {t.id === 'live' && active?.status === 'live' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {tab === 'home'          && <TournamentHome          active={active} />}
        {tab === 'bracket'       && <TournamentBracket       tournament={active} />}
        {tab === 'schedule'      && <TournamentSchedule      tournament={active} />}
        {tab === 'live'          && <LiveTournament          tournament={active} />}
        {tab === 'prizes'        && <TournamentPrizes        tournament={active} />}
        {tab === 'rules'         && <TournamentRules         tournament={active} />}
        {tab === 'stats'         && <TournamentStats         tournament={active} />}
        {tab === 'announcements' && <TournamentAnnouncements tournament={active} />}
        {tab === 'archive'       && <TournamentArchive       archives={archives} />}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 text-center text-gray-600 text-sm">
        Blue Tiers · Tournament Hub · All results are final
      </footer>
    </div>
  )
}
