import { useState, useMemo } from 'react'
import type { Tournament, Match, Team, MatchStatus } from '../../data/tournament'
import { MATCH_STATUS_LABEL } from '../../data/tournament'
import { generateBracket, updateMatch, updateBracketSlot } from '../../server/tournamentServer'

// ─── Types ────────────────────────────────────────────────────────────────────
type F = (msg: string, ok?: boolean) => void
type R = () => void

interface Props { active: Tournament | null; flash: F; reload: R }

// ─── Layout (mirror the public bracket exactly) ───────────────────────────────
const CARD_W  = 162
const CARD_H  = 72
const CONN_W  = 32
const SLOT_H  = 88
const LABEL_H = 22
const LABEL_MB = 6

const colHeight   = (n: number) => n * SLOT_H
const matchCY     = (i: number, total: number, colH: number) => (colH / total) * i + (colH / total) / 2
const matchTop    = (i: number, total: number, colH: number) => (colH / total) * i + ((colH / total) - CARD_H) / 2

// ─── Admin match card ─────────────────────────────────────────────────────────
function AdminCard({ match, teams, selected, onClick, rtl = false }: {
  match: Match; teams: Team[]; selected: boolean; onClick: () => void; rtl?: boolean
}) {
  const t1 = teams.find(t => t.id === match.team1Id)
  const t2 = teams.find(t => t.id === match.team2Id)
  const live = match.status === 'live'
  const done = match.status === 'completed'

  const borderColor = selected
    ? 'rgba(245,158,11,0.7)'
    : live ? 'rgba(239,68,68,.4)'
    : done ? 'rgba(34,197,94,.22)'
    : 'rgba(255,255,255,.08)'

  const shadow = selected
    ? '0 0 20px rgba(245,158,11,.25), inset 0 1px 0 rgba(255,255,255,.06)'
    : live ? '0 0 16px rgba(239,68,68,.15)'
    : 'inset 0 1px 0 rgba(255,255,255,.03)'

  return (
    <button onClick={onClick} title="Click to edit" style={{
      width: CARD_W, display: 'block', textAlign: 'left', cursor: 'pointer',
      background: selected
        ? 'linear-gradient(135deg,rgba(24,18,8,.98),rgba(18,13,4,.99))'
        : live
        ? 'linear-gradient(135deg,rgba(28,8,8,.97),rgba(18,6,6,.99))'
        : 'linear-gradient(135deg,rgba(14,21,34,.97),rgba(9,13,21,.99))',
      border: `1.5px solid ${borderColor}`,
      borderRadius: 9, padding: '6px 8px',
      boxShadow: shadow, transition: 'all .15s', position: 'relative', overflow: 'hidden',
    }}>
      {selected && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2,
          background: 'linear-gradient(90deg,transparent,rgba(245,158,11,.8),transparent)' }} />
      )}
      {live && !selected && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2,
          background: 'linear-gradient(90deg,transparent,#ef4444,transparent)',
          animation: 'ab-pbar 2s ease-in-out infinite' }} />
      )}
      <AdminTeamRow team={t1} score={match.score1} winner={match.winnerId === match.team1Id} rtl={rtl} />
      <div style={{ height: 1, background: 'rgba(255,255,255,.05)', margin: '4px 0' }} />
      <AdminTeamRow team={t2} score={match.score2} winner={match.winnerId === match.team2Id} rtl={rtl} />
      <div style={{ marginTop: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.07em',
          color: live ? '#ef4444' : done ? 'rgba(34,197,94,.7)' : 'rgba(255,255,255,.2)' }}>
          {live ? '● LIVE' : MATCH_STATUS_LABEL[match.status]}
        </span>
        <span style={{ fontSize: 8, color: 'rgba(245,158,11,.55)', fontWeight: 600 }}>
          {selected ? '✕ editing' : '✏️'}
        </span>
      </div>
    </button>
  )
}

function AdminTeamRow({ team, score, winner, rtl }: { team?: Team; score: number; winner: boolean; rtl: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5,
      flexDirection: rtl ? 'row-reverse' : 'row', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, flex: 1, minWidth: 0,
        flexDirection: rtl ? 'row-reverse' : 'row' }}>
        <img src={`https://mc-heads.net/avatar/${team?.captain ?? 'Steve'}/14`} alt=""
          onError={e => { (e.target as HTMLImageElement).style.opacity = '0.15' }}
          style={{ width: 13, height: 13, borderRadius: 3, flexShrink: 0,
            filter: winner ? 'drop-shadow(0 0 3px rgba(34,197,94,.7))' : 'grayscale(1) opacity(.4)' }} />
        <span style={{ fontSize: 10.5, fontWeight: winner ? 700 : 500, whiteSpace: 'nowrap',
          overflow: 'hidden', textOverflow: 'ellipsis',
          maxWidth: team ? 82 : 110,
          color: winner ? '#86efac' : team ? 'rgba(255,255,255,.5)' : 'rgba(255,255,255,.22)',
          fontStyle: !team ? 'italic' : 'normal',
          fontFamily: "'Space Grotesk',sans-serif" }}>
          {winner ? '👑 ' : ''}{team?.name ?? 'TBD'}
        </span>
      </div>
      <span style={{ fontSize: 13, fontWeight: 900, flexShrink: 0,
        color: winner ? '#4ade80' : 'rgba(255,255,255,.2)',
        fontFamily: "'Space Grotesk',sans-serif" }}>{score}</span>
    </div>
  )
}

// ─── Round column ─────────────────────────────────────────────────────────────
function RoundCol({ name, matches, teams, selectedId, onSelect, rtl = false, colH }: {
  name: string; matches: Match[]; teams: Team[]; selectedId: string | null
  onSelect: (m: Match) => void; rtl?: boolean; colH: number
}) {
  return (
    <div style={{ flexShrink: 0 }}>
      <div style={{ position: 'relative', width: CARD_W, height: colH + LABEL_H + LABEL_MB }}>
        {!name.toLowerCase().includes('round of') && (
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
            <div style={{ padding: '2px 10px', height: LABEL_H, display: 'flex', alignItems: 'center',
              background: 'rgba(245,158,11,.08)', border: '1px solid rgba(245,158,11,.2)',
              borderRadius: 20, fontSize: 8, fontWeight: 700, letterSpacing: '0.13em',
              color: 'rgba(245,158,11,.8)', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
              {name}
            </div>
          </div>
        )}
        {matches.map((m, i) => (
          <div key={m.id} style={{ position: 'absolute', top: matchTop(i, matches.length, colH) + LABEL_H + LABEL_MB, left: 0 }}>
            <AdminCard match={m} teams={teams} selected={selectedId === m.id} onClick={() => onSelect(m)} rtl={rtl} />
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Finals column ────────────────────────────────────────────────────────────
function FinalsCol({ match, teams, selectedId, onSelect, colH }: {
  match: Match; teams: Team[]; selectedId: string | null; onSelect: (m: Match) => void; colH: number
}) {
  const cardTop = matchTop(0, 1, colH)
  const lblTop  = cardTop - LABEL_H - LABEL_MB
  const emblTop = lblTop - 48 - 6
  const wrapH   = colH + LABEL_H + LABEL_MB
  return (
    <div style={{ flexShrink: 0 }}>
      <div style={{ position: 'relative', width: CARD_W + 16, height: wrapH }}>
        <div style={{ position: 'absolute', top: emblTop + LABEL_H + LABEL_MB,
          left: '50%', transform: 'translateX(-50%)',
          width: 44, height: 44, borderRadius: '50%',
          background: 'radial-gradient(circle,rgba(245,158,11,.14) 0%,transparent 100%)',
          border: '1px solid rgba(245,158,11,.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>⚔️</div>
        <div style={{ position: 'absolute', top: lblTop + LABEL_H + LABEL_MB, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
          <div style={{ padding: '2px 10px', height: LABEL_H, display: 'flex', alignItems: 'center',
            background: 'rgba(245,158,11,.08)', border: '1px solid rgba(245,158,11,.2)',
            borderRadius: 20, fontSize: 8, fontWeight: 700, letterSpacing: '0.13em',
            color: 'rgba(245,158,11,.8)', textTransform: 'uppercase' }}>Finals</div>
        </div>
        <div style={{ position: 'absolute', top: cardTop + LABEL_H + LABEL_MB, left: 8 }}>
          <AdminCard match={match} teams={teams} selected={selectedId === match.id} onClick={() => onSelect(match)} />
        </div>
      </div>
    </div>
  )
}

// ─── Connector ────────────────────────────────────────────────────────────────
function Connector({ leftCount, rightCount, colH, offsetTop }: {
  leftCount: number; rightCount: number; colH: number; offsetTop: number
}) {
  if (!leftCount || !rightCount) return null
  const W   = CONN_W
  const lCY = (i: number) => matchCY(i, leftCount, colH)
  const rCY = (i: number) => matchCY(i, rightCount, colH)
  const segs: React.ReactNode[] = []

  if (leftCount === rightCount) {
    for (let i = 0; i < leftCount; i++) segs.push(
      <g key={i} filter="url(#acg)">
        <line x1={0} y1={lCY(i)} x2={W} y2={rCY(i)} stroke="rgba(245,158,11,.35)" strokeWidth="1.3" />
        <circle cx={0} cy={lCY(i)} r={1.6} fill="rgba(245,158,11,.4)" />
        <circle cx={W} cy={rCY(i)} r={1.6} fill="rgba(245,158,11,.4)" />
      </g>
    )
  } else if (leftCount > rightCount) {
    for (let ri = 0; ri < rightCount; ri++) {
      const li1 = ri * 2, li2 = ri * 2 + 1
      if (li2 >= leftCount) { segs.push(<line key={`s${ri}`} x1={0} y1={lCY(li1)} x2={W} y2={rCY(ri)} stroke="rgba(245,158,11,.3)" strokeWidth="1.3" />); continue }
      const midX = W / 2, midY = (lCY(li1) + lCY(li2)) / 2
      segs.push(
        <g key={ri} filter="url(#acg)">
          <line x1={0}    y1={lCY(li1)} x2={midX} y2={lCY(li1)} stroke="rgba(245,158,11,.35)" strokeWidth="1.3" />
          <line x1={0}    y1={lCY(li2)} x2={midX} y2={lCY(li2)} stroke="rgba(245,158,11,.35)" strokeWidth="1.3" />
          <line x1={midX} y1={lCY(li1)} x2={midX} y2={lCY(li2)} stroke="rgba(245,158,11,.2)"  strokeWidth="1.3" />
          <line x1={midX} y1={midY}     x2={W}    y2={rCY(ri)}  stroke="rgba(245,158,11,.35)" strokeWidth="1.3" />
          <circle cx={midX} cy={midY}   r={2.1} fill="rgba(245,158,11,.55)" />
          <circle cx={0}    cy={lCY(li1)} r={1.4} fill="rgba(245,158,11,.35)" />
          <circle cx={0}    cy={lCY(li2)} r={1.4} fill="rgba(245,158,11,.35)" />
        </g>
      )
    }
  } else {
    for (let li = 0; li < leftCount; li++) {
      const ri1 = li * 2, ri2 = li * 2 + 1
      if (ri2 >= rightCount) { segs.push(<line key={`s${li}`} x1={0} y1={lCY(li)} x2={W} y2={rCY(ri1)} stroke="rgba(245,158,11,.3)" strokeWidth="1.3" />); continue }
      const midX = W / 2, midY = (rCY(ri1) + rCY(ri2)) / 2
      segs.push(
        <g key={li} filter="url(#acg)">
          <line x1={W}    y1={rCY(ri1)} x2={midX} y2={rCY(ri1)} stroke="rgba(245,158,11,.35)" strokeWidth="1.3" />
          <line x1={W}    y1={rCY(ri2)} x2={midX} y2={rCY(ri2)} stroke="rgba(245,158,11,.35)" strokeWidth="1.3" />
          <line x1={midX} y1={rCY(ri1)} x2={midX} y2={rCY(ri2)} stroke="rgba(245,158,11,.2)"  strokeWidth="1.3" />
          <line x1={midX} y1={midY}     x2={0}    y2={lCY(li)}  stroke="rgba(245,158,11,.35)" strokeWidth="1.3" />
          <circle cx={midX} cy={midY}   r={2.1} fill="rgba(245,158,11,.55)" />
          <circle cx={W}    cy={rCY(ri1)} r={1.4} fill="rgba(245,158,11,.35)" />
          <circle cx={W}    cy={rCY(ri2)} r={1.4} fill="rgba(245,158,11,.35)" />
        </g>
      )
    }
  }

  return (
    <svg width={W} height={colH} style={{ flexShrink: 0, overflow: 'visible', marginTop: offsetTop }}>
      <defs>
        <filter id="acg" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.4" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      {segs}
    </svg>
  )
}

// ─── Match editor panel ───────────────────────────────────────────────────────
function MatchEditor({ match, teams, roundName, onSave, onSaveSlot, onClose, saving }: {
  match: Match
  teams: Team[]
  roundName: string
  onSave: (draft: Match) => Promise<void>
  onSaveSlot: (matchId: string, t1: string | null, t2: string | null) => Promise<void>
  onClose: () => void
  saving: boolean
}) {
  const [draft, setDraft] = useState<Match>({ ...match })
  const [slotSaving, setSlotSaving] = useState(false)

  // Reset draft when match prop changes
  const matchKey = match.id + match.team1Id + match.team2Id + match.score1 + match.score2 + match.status + match.winnerId
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useMemo(() => { setDraft({ ...match }) }, [matchKey])

  const approved = teams.filter(t => t.status === 'approved' || t.id === match.team1Id || t.id === match.team2Id)

  const t1 = teams.find(t => t.id === draft.team1Id)
  const t2 = teams.find(t => t.id === draft.team2Id)

  const upd = (k: keyof Match, v: any) => setDraft(d => ({ ...d, [k]: v }))

  const status_opts: MatchStatus[] = ['pending', 'scheduled', 'live', 'completed']
  const statusColors: Record<string, string> = {
    pending: 'text-gray-400 border-gray-400/30 bg-gray-400/10',
    scheduled: 'text-blue-400 border-blue-400/30 bg-blue-400/10',
    live: 'text-red-400 border-red-400/30 bg-red-400/10',
    completed: 'text-green-400 border-green-400/30 bg-green-400/10',
  }

  async function handleSaveSlot() {
    if (draft.team1Id && draft.team1Id === draft.team2Id) { alert('Team 1 and Team 2 must be different'); return }
    setSlotSaving(true)
    await onSaveSlot(draft.id, draft.team1Id, draft.team2Id)
    setSlotSaving(false)
  }

  const teamDirty = draft.team1Id !== match.team1Id || draft.team2Id !== match.team2Id

  const scheduledValue = draft.scheduledAt
    ? new Date(draft.scheduledAt).toISOString().slice(0, 16)
    : ''

  return (
    <div className="border border-amber-500/20 rounded-2xl overflow-hidden bg-[#0a0e18]">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/5 bg-amber-500/5">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-sm">✏️</div>
          <div>
            <p className="text-white font-bold text-sm">{roundName} — Match Editor</p>
            <p className="text-gray-500 text-[10px]">M{match.matchNumber} · ID: {match.id.slice(0, 8)}…</p>
          </div>
        </div>
        <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors text-lg leading-none px-2">✕</button>
      </div>

      <div className="p-5 grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* ── Column 1: Teams ── */}
        <div className="space-y-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Teams / Matchup</p>

          <div className="space-y-3">
            {/* Team 1 */}
            <div>
              <label className="block text-[10px] text-gray-500 mb-1 font-semibold">Team 1</label>
              <select value={draft.team1Id ?? ''} onChange={e => upd('team1Id', e.target.value || null)}
                className="w-full bg-[#070b12] border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500/40">
                <option value="">— TBD —</option>
                {approved.map(t => <option key={t.id} value={t.id} disabled={t.id === draft.team2Id}>{t.name}{t.id === draft.team2Id ? ' (used)' : ''}</option>)}
              </select>
            </div>

            <div className="text-center text-gray-700 text-xs font-black">VS</div>

            {/* Team 2 */}
            <div>
              <label className="block text-[10px] text-gray-500 mb-1 font-semibold">Team 2</label>
              <select value={draft.team2Id ?? ''} onChange={e => upd('team2Id', e.target.value || null)}
                className="w-full bg-[#070b12] border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500/40">
                <option value="">— TBD —</option>
                {approved.map(t => <option key={t.id} value={t.id} disabled={t.id === draft.team1Id}>{t.name}{t.id === draft.team1Id ? ' (used)' : ''}</option>)}
              </select>
            </div>

            <button onClick={handleSaveSlot} disabled={slotSaving || !teamDirty}
              className="w-full py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black text-xs font-bold hover:from-amber-400 hover:to-amber-500 disabled:opacity-40 transition-all">
              {slotSaving ? 'Saving…' : teamDirty ? '✓ Save Matchup' : 'Matchup saved'}
            </button>
          </div>

          {/* Winner quick-pick */}
          {(draft.team1Id || draft.team2Id) && (
            <div>
              <p className="text-[10px] text-gray-500 mb-2 font-semibold">Set Winner</p>
              <div className="flex flex-col gap-1.5">
                {[{id: draft.team1Id, team: t1}, {id: draft.team2Id, team: t2}].map(({id, team}) =>
                  id ? (
                    <button key={id} onClick={() => { upd('winnerId', draft.winnerId === id ? null : id); if (draft.winnerId !== id) upd('status', 'completed') }}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-left transition-all text-xs ${
                        draft.winnerId === id
                          ? 'border-green-500/40 bg-green-500/10 text-green-300'
                          : 'border-white/8 text-gray-400 hover:border-white/15 hover:text-white'
                      }`}>
                      <img src={`https://mc-heads.net/avatar/${team?.captain ?? 'Steve'}/14`} alt="" className="w-4 h-4 rounded flex-shrink-0" onError={e => (e.target as HTMLImageElement).style.opacity = '0'} />
                      <span className="flex-1 truncate font-semibold">{team?.name ?? 'TBD'}</span>
                      {draft.winnerId === id && <span>👑</span>}
                    </button>
                  ) : null
                )}
              </div>
              {draft.winnerId && (
                <button onClick={() => upd('winnerId', null)} className="mt-1.5 text-[9px] text-gray-600 hover:text-gray-400 transition-colors">
                  ✕ Clear winner
                </button>
              )}
            </div>
          )}
        </div>

        {/* ── Column 2: Result ── */}
        <div className="space-y-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Result & Status</p>

          {/* Scores */}
          <div>
            <p className="text-[10px] text-gray-500 mb-2 font-semibold">Scores</p>
            <div className="flex items-center gap-3">
              {/* Score 1 */}
              <div className="flex-1 text-center">
                {t1 && <p className="text-[9px] text-gray-600 mb-1 truncate">{t1.name}</p>}
                <div className="flex items-center justify-center gap-1.5">
                  <button onClick={() => upd('score1', Math.max(0, draft.score1 - 1))} className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white text-sm font-bold flex items-center justify-center transition-all">−</button>
                  <input type="number" min={0} value={draft.score1} onChange={e => upd('score1', Math.max(0, Number(e.target.value)))}
                    className="w-10 text-center bg-[#070b12] border border-white/10 rounded-lg py-1 text-white text-sm font-black focus:outline-none focus:border-amber-500/40" />
                  <button onClick={() => upd('score1', draft.score1 + 1)} className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white text-sm font-bold flex items-center justify-center transition-all">+</button>
                </div>
              </div>
              <div className="text-gray-700 font-black text-sm">:</div>
              {/* Score 2 */}
              <div className="flex-1 text-center">
                {t2 && <p className="text-[9px] text-gray-600 mb-1 truncate">{t2.name}</p>}
                <div className="flex items-center justify-center gap-1.5">
                  <button onClick={() => upd('score2', Math.max(0, draft.score2 - 1))} className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white text-sm font-bold flex items-center justify-center transition-all">−</button>
                  <input type="number" min={0} value={draft.score2} onChange={e => upd('score2', Math.max(0, Number(e.target.value)))}
                    className="w-10 text-center bg-[#070b12] border border-white/10 rounded-lg py-1 text-white text-sm font-black focus:outline-none focus:border-amber-500/40" />
                  <button onClick={() => upd('score2', draft.score2 + 1)} className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white text-sm font-bold flex items-center justify-center transition-all">+</button>
                </div>
              </div>
            </div>
          </div>

          {/* Status */}
          <div>
            <p className="text-[10px] text-gray-500 mb-2 font-semibold">Status</p>
            <div className="grid grid-cols-2 gap-1.5">
              {status_opts.map(s => (
                <button key={s} onClick={() => upd('status', s)}
                  className={`py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-wider transition-all ${
                    draft.status === s ? statusColors[s] : 'border-white/8 text-gray-600 hover:text-gray-300'
                  }`}>
                  {s === 'live' ? '🔴 ' : s === 'completed' ? '✅ ' : ''}{s}
                </button>
              ))}
            </div>
          </div>

          {/* Schedule */}
          <div>
            <label className="block text-[10px] text-gray-500 mb-1 font-semibold">Scheduled At</label>
            <input type="datetime-local" value={scheduledValue}
              onChange={e => upd('scheduledAt', e.target.value ? new Date(e.target.value).getTime() : null)}
              className="w-full bg-[#070b12] border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500/40" />
          </div>

          {/* Quick actions */}
          <div className="flex gap-2">
            <button onClick={() => { upd('status', 'live'); upd('winnerId', null) }}
              className="flex-1 py-2 rounded-xl border border-red-500/30 bg-red-500/8 text-red-400 text-[10px] font-bold uppercase tracking-wider hover:bg-red-500/15 transition-all">
              🔴 Go Live
            </button>
            <button onClick={() => {
              if (!draft.winnerId && draft.score1 !== draft.score2) {
                upd('winnerId', draft.score1 > draft.score2 ? draft.team1Id : draft.team2Id)
              }
              upd('status', 'completed')
            }}
              className="flex-1 py-2 rounded-xl border border-green-500/25 bg-green-500/6 text-green-400 text-[10px] font-bold uppercase tracking-wider hover:bg-green-500/12 transition-all">
              ✅ Complete
            </button>
          </div>
        </div>

        {/* ── Column 3: Details ── */}
        <div className="space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Match Details</p>

          {[
            { label: 'Arena', key: 'arena' as keyof Match, placeholder: 'e.g. Arena 1' },
            { label: 'Gamemode', key: 'gamemode' as keyof Match, placeholder: 'e.g. 1v1 UHC' },
            { label: 'Referee', key: 'referee' as keyof Match, placeholder: 'Staff IGN' },
            { label: 'Replay Link', key: 'replayLink' as keyof Match, placeholder: 'https://…' },
          ].map(({ label, key, placeholder }) => (
            <div key={key}>
              <label className="block text-[10px] text-gray-500 mb-1 font-semibold">{label}</label>
              <input type="text" value={(draft[key] as string) ?? ''} placeholder={placeholder}
                onChange={e => upd(key, e.target.value)}
                className="w-full bg-[#070b12] border border-white/10 rounded-xl px-3 py-2 text-white text-xs placeholder-gray-700 focus:outline-none focus:border-amber-500/40" />
            </div>
          ))}

          <div>
            <label className="block text-[10px] text-gray-500 mb-1 font-semibold">Notes</label>
            <textarea value={draft.notes ?? ''} onChange={e => upd('notes', e.target.value)} rows={3}
              placeholder="Internal notes…"
              className="w-full bg-[#070b12] border border-white/10 rounded-xl px-3 py-2 text-white text-xs placeholder-gray-700 focus:outline-none focus:border-amber-500/40 resize-none" />
          </div>

          {/* Save */}
          <button onClick={() => onSave(draft)} disabled={saving}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold text-sm hover:from-amber-400 hover:to-amber-500 disabled:opacity-40 transition-all flex items-center justify-center gap-2">
            {saving ? <><span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />Saving…</> : '✓ Save Match'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────
export function AdminBracketEditor({ active, flash, reload }: Props) {
  const [generating, setGenerating] = useState(false)
  const [genType, setGenType]       = useState<'single_elimination' | 'double_elimination'>('single_elimination')
  const [shuffle, setShuffle]       = useState(true)
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
  const [saving, setSaving]         = useState(false)

  if (!active) return (
    <div className="text-center py-16 text-gray-600">
      <div className="text-5xl mb-4 opacity-20">⚔️</div>
      <p>No active tournament. Set one active in the Tournaments tab.</p>
    </div>
  )

  const approvedTeams = active.teams.filter(t => t.status === 'approved')

  // ── Generate ──
  async function generate() {
    if (approvedTeams.length < 2) return flash('Need at least 2 approved teams', false)
    if (!confirm(`Generate a ${genType.replace(/_/g, ' ')} bracket with ${approvedTeams.length} teams? This will reset existing matches.`)) return
    setGenerating(true); setSelectedMatch(null)
    try {
      const res = await generateBracket({ data: { tournamentId: active!.id, type: genType, shuffle } })
      if (res.success) { flash('Bracket generated ✓'); reload() }
      else flash(res.error ?? 'Failed', false)
    } finally { setGenerating(false) }
  }

  // ── Save match (scores / status / details) ──
  async function saveMatch(draft: Match) {
    setSaving(true)
    try {
      const res = await updateMatch({ data: {
        tournamentId: active!.id, matchId: draft.id,
        score1: draft.score1, score2: draft.score2,
        winnerId: draft.winnerId, status: draft.status,
        scheduledAt: draft.scheduledAt, arena: draft.arena,
        gamemode: draft.gamemode, referee: draft.referee,
        notes: draft.notes, replayLink: draft.replayLink,
      }})
      if (res.success) { flash('Match updated ✓'); reload() }
      else flash(res.error ?? 'Error', false)
    } finally { setSaving(false) }
  }

  // ── Save slot (team swap) ──
  async function saveSlot(matchId: string, t1: string | null, t2: string | null) {
    const res = await updateBracketSlot({ data: { tournamentId: active!.id, matchId, team1Id: t1, team2Id: t2 } })
    if (res.success) { flash('Matchup updated ✓'); reload() }
    else flash(res.error ?? 'Error updating slot', false)
  }

  // ── Build columns (same algorithm as public bracket) ──
  const hasBracket = active.bracket && active.matches.length > 0
  const rounds = active.bracket?.rounds ?? []
  const finalsRound   = rounds[rounds.length - 1]
  const bracketRounds = rounds.slice(0, rounds.length - 1)

  const getMs = (ids: string[]) =>
    ids.map(id => active.matches.find(m => m.id === id)).filter((m): m is Match => !!m && m.status !== 'bye')

  const leftCols = bracketRounds.map(r => ({ name: r.name, matches: getMs(r.matchIds).slice(0, Math.ceil(getMs(r.matchIds).length / 2)) }))
  const rightColsOuter = bracketRounds.map(r => ({ name: r.name, matches: getMs(r.matchIds).slice(Math.ceil(getMs(r.matchIds).length / 2)) }))
  const rightCols = [...rightColsOuter].reverse()
  const finalsMatch = finalsRound ? getMs(finalsRound.matchIds)[0] : undefined

  const maxMatches = Math.max(...leftCols.map(c => c.matches.length), ...rightCols.map(c => c.matches.length), 1)
  const colH = colHeight(maxMatches)
  const connOffsetTop = LABEL_H + LABEL_MB

  // Keep selectedMatch fresh after reload
  const freshSelected = selectedMatch ? active.matches.find(m => m.id === selectedMatch.id) ?? null : null

  // Find round name for selected match
  const selectedRoundName = freshSelected
    ? rounds.find(r => r.matchIds.includes(freshSelected.id))?.name ?? 'Match'
    : ''

  function selectMatch(m: Match) {
    setSelectedMatch(prev => prev?.id === m.id ? null : m)
  }

  return (
    <div className="space-y-5">
      <style>{`@keyframes ab-pbar{0%,100%{opacity:.4}50%{opacity:1}}`}</style>

      {/* ── Generator panel ── */}
      <div className="bg-[#0a0e18] border border-white/5 rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-base flex-shrink-0">⚔️</div>
          <div>
            <p className="text-white font-bold text-sm">Generate Bracket</p>
            <p className="text-gray-500 text-xs">{approvedTeams.length} approved team(s) · Existing bracket will be reset</p>
          </div>
        </div>
        <div className="flex gap-4 flex-wrap items-end">
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1.5 font-semibold">Format</label>
            <select value={genType} onChange={e => setGenType(e.target.value as any)}
              className="bg-[#070b12] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500/40">
              <option value="single_elimination">Single Elimination</option>
              <option value="double_elimination">Double Elimination</option>
            </select>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={shuffle} onChange={e => setShuffle(e.target.checked)} className="w-4 h-4 rounded accent-amber-400" />
            <span className="text-gray-400 text-sm">Random seed</span>
          </label>
          <button onClick={generate} disabled={generating || approvedTeams.length < 2}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold text-sm hover:from-amber-400 hover:to-amber-500 disabled:opacity-40 transition-all shadow-lg shadow-amber-500/20">
            {generating ? <><span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />Generating…</> : <>⚡ Generate Bracket</>}
          </button>
        </div>
      </div>

      {/* ── Bracket visual ── */}
      {hasBracket ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-bold text-sm">
                {active.bracket!.type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
              </p>
              <p className="text-gray-500 text-xs mt-0.5">{active.matches.filter(m => m.status !== 'bye').length} matches · Click any card to edit</p>
            </div>
            <div className="flex gap-2 text-[10px] text-gray-600">
              {[['rgba(245,158,11,.7)', 'Selected'], ['rgba(239,68,68,.4)', 'Live'], ['rgba(34,197,94,.3)', 'Completed']].map(([c, l]) => (
                <span key={l} className="flex items-center gap-1.5">
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: c, display: 'inline-block' }} />{l}
                </span>
              ))}
            </div>
          </div>

          {/* The bracket */}
          <div style={{ borderRadius: 14, padding: '14px 12px',
            background: 'radial-gradient(ellipse 70% 55% at 50% 50%,rgba(245,158,11,.04) 0%,rgba(14,21,34,.9) 60%,rgba(9,13,21,.95) 100%)',
            border: '1px solid rgba(245,158,11,.07)', overflowX: 'auto', overflowY: 'hidden' }}>
            <div style={{ display: 'inline-flex', alignItems: 'flex-start', gap: 0, minWidth: 'max-content' }}>

              {/* LEFT */}
              {leftCols.map((col, ci) => {
                const nextCount = ci < leftCols.length - 1 ? leftCols[ci + 1].matches.length : 1
                return (
                  <div key={`l${ci}`} style={{ display: 'flex', alignItems: 'flex-start' }}>
                    <RoundCol name={col.name} matches={col.matches} teams={active.teams}
                      selectedId={freshSelected?.id ?? null} onSelect={selectMatch}
                      rtl={false} colH={colH} />
                    <Connector leftCount={col.matches.length} rightCount={nextCount} colH={colH} offsetTop={connOffsetTop} />
                  </div>
                )
              })}

              {/* FINALS */}
              {finalsMatch
                ? <FinalsCol match={finalsMatch} teams={active.teams}
                    selectedId={freshSelected?.id ?? null} onSelect={selectMatch} colH={colH} />
                : <div style={{ width: CARD_W + 16, height: colH + LABEL_H + LABEL_MB,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'rgba(255,255,255,.15)', fontSize: 11 }}>Finals TBD</div>
              }

              {/* RIGHT */}
              {rightCols.map((col, ci) => {
                const leftCount = ci === 0 ? 1 : rightCols[ci - 1].matches.length
                return (
                  <div key={`r${ci}`} style={{ display: 'flex', alignItems: 'flex-start' }}>
                    <Connector leftCount={leftCount} rightCount={col.matches.length} colH={colH} offsetTop={connOffsetTop} />
                    <RoundCol name={col.name} matches={col.matches} teams={active.teams}
                      selectedId={freshSelected?.id ?? null} onSelect={selectMatch}
                      rtl={true} colH={colH} />
                  </div>
                )
              })}

            </div>
          </div>

          {/* ── Match editor (appears when a card is selected) ── */}
          {freshSelected && (
            <MatchEditor
              match={freshSelected}
              teams={active.teams}
              roundName={selectedRoundName}
              onSave={saveMatch}
              onSaveSlot={saveSlot}
              onClose={() => setSelectedMatch(null)}
              saving={saving}
            />
          )}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-600 bg-[#0a0e18] border border-white/5 rounded-2xl">
          <div className="text-5xl mb-4 opacity-20">⚔️</div>
          <p>No bracket yet. Approve teams and generate one above.</p>
        </div>
      )}
    </div>
  )
}
