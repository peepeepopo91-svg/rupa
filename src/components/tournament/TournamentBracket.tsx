import { useState } from 'react'
import type { Tournament, Match, Team } from '../../data/tournament'
import { MATCH_STATUS_LABEL } from '../../data/tournament'
import { MatchDetailModal } from './MatchDetailModal'

interface Props {
  tournament: Tournament | null
}

function MatchCard({
  match, teams, onClick,
}: {
  match: Match
  teams: Team[]
  onClick: () => void
}) {
  const t1 = teams.find(t => t.id === match.team1Id)
  const t2 = teams.find(t => t.id === match.team2Id)

  const statusColor: Record<string, string> = {
    live:      'border-red-500/40 bg-red-500/5',
    completed: 'border-white/10 bg-white/2',
    pending:   'border-white/5 bg-white/2 opacity-60',
    scheduled: 'border-[#00BFFF]/20 bg-[#00BFFF]/3',
    bye:       'border-white/5 bg-white/2 opacity-40',
  }

  return (
    <button
      onClick={onClick}
      className={`w-52 rounded-xl border p-3 text-left transition-all hover:scale-105 hover:shadow-lg ${statusColor[match.status] || 'border-white/5'}`}
    >
      <div className="space-y-1.5">
        <TeamRow team={t1} score={match.score1} winner={match.winnerId === match.team1Id} />
        <div className="border-t border-white/5" />
        <TeamRow team={t2} score={match.score2} winner={match.winnerId === match.team2Id} />
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span className={`text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded ${
          match.status === 'live' ? 'text-red-400 bg-red-400/10' : 'text-gray-600'
        }`}>
          {match.status === 'live' && '🔴 '}{MATCH_STATUS_LABEL[match.status]}
        </span>
        <span className="text-gray-700 text-[9px]">M{match.matchNumber}</span>
      </div>
    </button>
  )
}

function TeamRow({ team, score, winner }: { team?: Team; score: number; winner: boolean }) {
  return (
    <div className={`flex items-center justify-between gap-2 ${winner ? 'text-[#00BFFF]' : 'text-gray-400'}`}>
      <div className="flex items-center gap-2 min-w-0">
        <img
          src={`https://mc-heads.net/avatar/${team?.captain ?? 'Steve'}/16`}
          onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
          className="w-4 h-4 rounded-sm flex-shrink-0"
          alt=""
        />
        <span className={`text-xs font-semibold truncate max-w-[100px] ${winner ? 'text-white' : ''}`}>
          {team?.name ?? <span className="text-gray-700 italic">TBD</span>}
        </span>
      </div>
      <span className={`text-sm font-black font-['Space_Grotesk'] ${winner ? 'text-[#00BFFF]' : ''}`}>{score}</span>
    </div>
  )
}

export function TournamentBracket({ tournament }: Props) {
  const [selected, setSelected] = useState<Match | null>(null)

  if (!tournament) {
    return <EmptyState message="No active tournament." />
  }
  if (!tournament.bracket) {
    return <EmptyState message="Bracket has not been generated yet." />
  }

  const { bracket, matches, teams } = tournament

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-['Space_Grotesk'] font-bold text-white text-xl">{tournament.name} — Bracket</h2>
          <p className="text-gray-500 text-sm mt-0.5 capitalize">{bracket.type.replace('_', ' ')}</p>
        </div>
        <div className="text-xs text-gray-600 flex items-center gap-3">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-400" />Live</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#00BFFF]" />Scheduled</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-gray-700" />Pending</span>
        </div>
      </div>

      {/* Scrollable bracket */}
      <div className="overflow-x-auto pb-6">
        <div className="flex gap-8 items-start min-w-max py-4 px-2">
          {bracket.rounds.map((round, ri) => {
            const roundMatches = round.matchIds
              .map(id => matches.find(m => m.id === id))
              .filter(Boolean) as Match[]

            return (
              <div key={ri} className="flex flex-col gap-2">
                {/* Round header */}
                <div className="text-center mb-4">
                  <span className="text-xs font-bold text-[#00BFFF] uppercase tracking-wider px-3 py-1 bg-[#00BFFF]/10 border border-[#00BFFF]/20 rounded-full">
                    {round.name}
                  </span>
                </div>

                {/* Matches for this round, vertically centered relative to their eventual position */}
                <div
                  className="flex flex-col justify-around"
                  style={{ gap: `${Math.pow(2, ri) * 16}px`, minHeight: `${Math.pow(2, bracket.rounds.length - 1) * 120}px` }}
                >
                  {roundMatches.map(match => (
                    <MatchCard
                      key={match.id}
                      match={match}
                      teams={teams}
                      onClick={() => setSelected(match)}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {selected && (
        <MatchDetailModal
          match={selected}
          teams={tournament.teams}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <div className="text-6xl mb-4 opacity-20">⚔️</div>
      <p className="text-gray-500">{message}</p>
    </div>
  )
}
