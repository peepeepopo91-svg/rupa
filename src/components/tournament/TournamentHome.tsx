import { useState, useEffect } from 'react'
import type { Tournament } from '../../data/tournament'
import { STATUS_LABEL, STATUS_COLOR } from '../../data/tournament'
import { TeamRegistration } from './TeamRegistration'

interface Props {
  active: Tournament | null
}

function Countdown({ target }: { target: number }) {
  const [diff, setDiff] = useState(target - Date.now())
  useEffect(() => {
    const id = setInterval(() => setDiff(target - Date.now()), 1000)
    return () => clearInterval(id)
  }, [target])
  if (diff <= 0) return <span className="text-red-400 font-bold">Expired</span>
  const d = Math.floor(diff / 86400000)
  const h = Math.floor((diff % 86400000) / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  const s = Math.floor((diff % 60000) / 1000)
  return (
    <div className="flex gap-3 justify-center">
      {[['D', d], ['H', h], ['M', m], ['S', s]].map(([label, val]) => (
        <div key={label as string} className="text-center">
          <div className="text-2xl md:text-4xl font-black text-[#00BFFF] font-['Space_Grotesk'] tabular-nums w-16 h-16 flex items-center justify-center bg-[#00BFFF]/10 border border-[#00BFFF]/20 rounded-xl">
            {String(val).padStart(2, '0')}
          </div>
          <div className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest">{label}</div>
        </div>
      ))}
    </div>
  )
}

export function TournamentHome({ active }: Props) {
  const [showReg, setShowReg] = useState(false)

  if (!active) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="text-7xl mb-6 opacity-30">🏆</div>
        <h2 className="font-['Space_Grotesk'] font-bold text-2xl text-white mb-3">No Active Tournament</h2>
        <p className="text-gray-500 max-w-md">
          There are currently no active tournaments. Check back soon or watch the announcements for upcoming events.
        </p>
      </div>
    )
  }

  const approvedTeams  = active.teams.filter(t => t.status === 'approved')
  const totalPlayers   = approvedTeams.reduce((n, t) => n + t.players.length, 0)
  const canRegister    = active.status === 'registration_open'
  const deadline       = active.registrationDeadline
  const start          = active.startDate

  const statCards = [
    { label: 'Registered Teams',   value: approvedTeams.length, icon: '👥' },
    { label: 'Total Players',      value: totalPlayers,         icon: '⚔️' },
    { label: 'Gamemode',           value: active.gamemode || '—', icon: '🎮' },
    { label: 'Team Size',          value: active.maxTeamSize === active.minTeamSize ? `${active.maxTeamSize}v${active.maxTeamSize}` : `${active.minTeamSize}–${active.maxTeamSize}`, icon: '🧩' },
  ]

  return (
    <div className="space-y-8">
      {/* Hero card */}
      <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-br from-[#0D1320] to-[#111827]">
        {active.banner && (
          <div
            className="absolute inset-0 opacity-20 bg-cover bg-center"
            style={{ backgroundImage: `url(${active.banner})` }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0D1320] via-transparent to-transparent" />
        <div className="relative p-8 md:p-12 text-center space-y-6">
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-bold uppercase tracking-wider ${STATUS_COLOR[active.status]}`}>
            {active.status === 'live' && <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />}
            {STATUS_LABEL[active.status]}
          </div>
          <h2 className="font-['Space_Grotesk'] font-black text-3xl md:text-5xl text-white">{active.name}</h2>
          {active.description && (
            <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">{active.description}</p>
          )}

          {/* Countdown */}
          {deadline && active.status === 'registration_open' && (
            <div className="space-y-2">
              <p className="text-gray-500 text-sm uppercase tracking-widest">Registration closes in</p>
              <Countdown target={deadline} />
            </div>
          )}
          {start && (active.status === 'upcoming' || active.status === 'registration_open' || active.status === 'registration_closed') && (
            <div className="space-y-2">
              <p className="text-gray-500 text-sm uppercase tracking-widest">Tournament starts in</p>
              <Countdown target={start} />
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3 justify-center pt-2">
            {canRegister && (
              <button
                onClick={() => setShowReg(true)}
                className="px-8 py-3 rounded-xl bg-[#00BFFF] hover:bg-[#00BFFF]/80 text-black font-bold text-sm transition-all shadow-lg shadow-[#00BFFF]/20 hover:scale-105"
              >
                Register Your Team →
              </button>
            )}
            {active.serverIp && (
              <button
                onClick={() => navigator.clipboard.writeText(active.serverIp)}
                className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-medium transition-all"
              >
                📋 {active.serverIp}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map(c => (
          <div key={c.label} className="bg-[#111827] border border-white/5 rounded-xl p-5 text-center">
            <div className="text-2xl mb-2">{c.icon}</div>
            <div className="font-['Space_Grotesk'] font-bold text-xl text-white">{c.value}</div>
            <div className="text-gray-500 text-xs mt-1">{c.label}</div>
          </div>
        ))}
      </div>

      {/* Info grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Details */}
        <div className="bg-[#111827] border border-white/5 rounded-xl p-6 space-y-4">
          <h3 className="font-['Space_Grotesk'] font-bold text-white">Tournament Details</h3>
          <div className="space-y-3">
            {[
              { label: 'Status',       value: STATUS_LABEL[active.status] },
              { label: 'Gamemode',     value: active.gamemode || '—' },
              { label: 'Server IP',    value: active.serverIp || '—' },
              { label: 'Team Size',    value: active.maxTeamSize === active.minTeamSize ? `${active.maxTeamSize} players` : `${active.minTeamSize}–${active.maxTeamSize} players` },
              { label: 'Prize Pool',   value: active.prizePool || '—' },
              ...(deadline ? [{ label: 'Reg. Deadline', value: new Date(deadline).toLocaleString() }] : []),
              ...(start    ? [{ label: 'Start Date',    value: new Date(start).toLocaleString() }]    : []),
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between text-sm">
                <span className="text-gray-500">{label}</span>
                <span className="text-white font-medium">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Prize preview */}
        <div className="bg-[#111827] border border-white/5 rounded-xl p-6 space-y-4">
          <h3 className="font-['Space_Grotesk'] font-bold text-white">Top Prizes</h3>
          <div className="space-y-3">
            {active.prizes.slice(0, 3).map(prize => (
              <div key={prize.placement} className="flex items-center gap-3 p-3 rounded-lg bg-white/3 border border-white/5">
                <span className="text-xl">{prize.label.split(' ')[0]}</span>
                <div>
                  <p className="text-white text-sm font-semibold">{prize.label.split(' ').slice(1).join(' ')}</p>
                  <p className="text-gray-500 text-xs">{prize.rewards.map(r => `${r.amount} ${r.label}`).join(' + ')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Registration modal */}
      {showReg && (
        <TeamRegistration tournament={active} onClose={() => setShowReg(false)} />
      )}
    </div>
  )
}
