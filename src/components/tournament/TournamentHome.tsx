import { useState, useEffect } from 'react'
import type { Tournament } from '../../data/tournament'
import { STATUS_LABEL, STATUS_COLOR } from '../../data/tournament'

interface Props {
  active: Tournament | null
  onRegisterClick?: () => void
}

function Countdown({ target }: { target: number }) {
  const [diff, setDiff] = useState(target - Date.now())
  useEffect(() => {
    const id = setInterval(() => setDiff(target - Date.now()), 1000)
    return () => clearInterval(id)
  }, [target])
  if (diff <= 0) return <span className="text-red-400 font-bold text-sm">Expired</span>
  const d = Math.floor(diff / 86400000)
  const h = Math.floor((diff % 86400000) / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  const s = Math.floor((diff % 60000) / 1000)
  return (
    <div className="flex gap-3 justify-center">
      {([['D', d], ['H', h], ['M', m], ['S', s]] as [string, number][]).map(([label, val]) => (
        <div key={label} className="text-center">
          <div className="text-2xl md:text-3xl font-black text-[#00BFFF] font-['Space_Grotesk'] tabular-nums w-14 h-14 flex items-center justify-center bg-[#00BFFF]/10 border border-[#00BFFF]/20 rounded-xl">
            {String(val).padStart(2, '0')}
          </div>
          <div className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest">{label}</div>
        </div>
      ))}
    </div>
  )
}

export function TournamentHome({ active, onRegisterClick }: Props) {
  if (!active) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="text-7xl mb-6 opacity-20">🏆</div>
        <h2 className="font-['Space_Grotesk'] font-bold text-2xl text-white mb-3">No Active Tournament</h2>
        <p className="text-gray-500 max-w-md text-sm">
          There are currently no active tournaments. Check the Announcements tab or come back soon.
        </p>
      </div>
    )
  }

  const approvedTeams = active.teams.filter(t => t.status === 'approved')
  const totalPlayers  = approvedTeams.reduce((n, t) => n + t.players.length, 0)
  const canRegister   = active.status === 'registration_open'
  const deadline      = active.registrationDeadline
  const start         = active.startDate

  const statCards = [
    { label: 'Registered Teams', value: approvedTeams.length,  icon: '👥' },
    { label: 'Total Players',    value: totalPlayers,          icon: '⚔️' },
    { label: 'Gamemode',         value: active.gamemode || '—', icon: '🎮' },
    {
      label: 'Team Size',
      value: active.maxTeamSize === active.minTeamSize
        ? `${active.maxTeamSize}v${active.maxTeamSize}`
        : `${active.minTeamSize}–${active.maxTeamSize}`,
      icon: '🧩',
    },
  ]

  return (
    <div className="space-y-6">

      {/* Hero card */}
      <div className="relative rounded-2xl overflow-hidden border border-white/8 bg-gradient-to-br from-[#0D1320] to-[#111827]">
        {active.banner && (
          <div
            className="absolute inset-0 opacity-15 bg-cover bg-center"
            style={{ backgroundImage: `url(${active.banner})` }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0D1320] via-[#0D1320]/60 to-transparent" />

        <div className="relative px-8 md:px-12 py-10 text-center space-y-5">
          {/* Status */}
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-bold uppercase tracking-wider ${STATUS_COLOR[active.status]}`}>
            {active.status === 'live' && <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />}
            {STATUS_LABEL[active.status]}
          </div>

          <h2 className="font-['Space_Grotesk'] font-black text-2xl md:text-4xl text-white">{active.name}</h2>

          {active.description && (
            <p className="text-gray-400 max-w-xl mx-auto text-sm leading-relaxed">{active.description}</p>
          )}

          {/* Countdown */}
          {deadline && canRegister && (
            <div className="space-y-2 pt-1">
              <p className="text-gray-500 text-[11px] uppercase tracking-widest">Registration closes in</p>
              <Countdown target={deadline} />
            </div>
          )}
          {start && (active.status === 'upcoming' || canRegister || active.status === 'registration_closed') && (
            <div className="space-y-2 pt-1">
              <p className="text-gray-500 text-[11px] uppercase tracking-widest">Tournament starts in</p>
              <Countdown target={start} />
            </div>
          )}

          {/* CTAs */}
          <div className="flex flex-wrap gap-3 justify-center pt-2">
            {canRegister && onRegisterClick && (
              <button
                onClick={onRegisterClick}
                className="px-8 py-3 rounded-xl bg-[#00BFFF] hover:bg-[#00BFFF]/85 text-black font-bold text-sm transition-all shadow-lg shadow-[#00BFFF]/20 hover:scale-105"
              >
                ⚔️ Register Your Team →
              </button>
            )}
            {active.serverIp && (
              <button
                onClick={() => navigator.clipboard.writeText(active.serverIp)}
                className="px-5 py-3 rounded-xl bg-white/5 hover:bg-white/8 border border-white/10 text-white text-sm font-medium transition-all font-mono"
              >
                📋 {active.serverIp}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statCards.map(c => (
          <div key={c.label} className="glass border border-white/5 rounded-xl p-5 text-center">
            <div className="text-2xl mb-2">{c.icon}</div>
            <div className="font-['Space_Grotesk'] font-bold text-xl text-white">{c.value}</div>
            <div className="text-gray-500 text-xs mt-1">{c.label}</div>
          </div>
        ))}
      </div>

      {/* Info grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Details */}
        <div className="glass border border-white/5 rounded-xl p-6 space-y-4">
          <h3 className="font-['Space_Grotesk'] font-bold text-white text-sm">Tournament Details</h3>
          <div className="space-y-3">
            {[
              { label: 'Status',         value: STATUS_LABEL[active.status] },
              { label: 'Gamemode',       value: active.gamemode  || '—' },
              { label: 'Server IP',      value: active.serverIp  || '—' },
              {
                label: 'Team Size',
                value: active.maxTeamSize === active.minTeamSize
                  ? `${active.maxTeamSize} players`
                  : `${active.minTeamSize}–${active.maxTeamSize} players`,
              },
              { label: 'Prize Pool',     value: active.prizePool || '—' },
              ...(deadline ? [{ label: 'Reg. Deadline', value: new Date(deadline).toLocaleString() }] : []),
              ...(start    ? [{ label: 'Start Date',    value: new Date(start).toLocaleString()    }] : []),
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between text-xs">
                <span className="text-gray-500">{label}</span>
                <span className="text-white font-medium">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Prize preview */}
        <div className="glass border border-white/5 rounded-xl p-6 space-y-4">
          <h3 className="font-['Space_Grotesk'] font-bold text-white text-sm">Top Prizes</h3>
          {active.prizes.length === 0 ? (
            <p className="text-gray-600 text-xs">Prizes will be announced soon.</p>
          ) : (
            <div className="space-y-2">
              {active.prizes.slice(0, 3).map(prize => (
                <div key={prize.placement} className="flex items-center gap-3 p-3 rounded-lg bg-white/3 border border-white/5">
                  <span className="text-xl">{prize.label.split(' ')[0]}</span>
                  <div>
                    <p className="text-white text-xs font-semibold">{prize.label.split(' ').slice(1).join(' ')}</p>
                    <p className="text-gray-500 text-[11px]">{prize.rewards.map(r => `${r.amount} ${r.label}`).join(' + ')}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Approved teams preview */}
      {approvedTeams.length > 0 && (
        <div className="glass border border-white/5 rounded-xl p-6 space-y-4">
          <h3 className="font-['Space_Grotesk'] font-bold text-white text-sm">Competing Teams <span className="text-gray-500 font-normal">({approvedTeams.length})</span></h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {approvedTeams.map(team => (
              <div key={team.id} className="flex items-center gap-2 p-3 rounded-lg bg-white/3 border border-white/5">
                <span className="w-7 h-7 rounded-full bg-[#00BFFF]/15 border border-[#00BFFF]/20 flex items-center justify-center text-[10px] font-bold text-[#00BFFF]">
                  {team.name.slice(0, 2).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="text-white text-xs font-semibold truncate">{team.name}</p>
                  <p className="text-gray-500 text-[10px]">{team.players.length}p</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
