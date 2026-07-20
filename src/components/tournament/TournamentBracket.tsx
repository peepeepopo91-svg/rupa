import { useState } from 'react'
import type { Tournament, Match, Team } from '../../data/tournament'
import { MATCH_STATUS_LABEL } from '../../data/tournament'
import { MatchDetailModal } from './MatchDetailModal'

interface Props { tournament: Tournament | null }

// ─── Layout constants (identical to AdminBracketEditor) ───────────────────────
const CARD_W   = 162
const CARD_H   = 72
const CONN_W   = 32
const SLOT_H   = 88
const LABEL_H  = 22
const LABEL_MB = 6

const colHeight = (n: number) => n * SLOT_H
const matchCY   = (i: number, total: number, colH: number) => (colH / total) * i + (colH / total) / 2
const matchTop  = (i: number, total: number, colH: number) => (colH / total) * i + ((colH / total) - CARD_H) / 2

// ─── Team row (identical to AdminTeamRow) ────────────────────────────────────
function TeamRow({ team, score, winner, rtl }: { team?: Team; score: number; winner: boolean; rtl: boolean }) {
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

// ─── Match card (identical to AdminCard, without edit indicators) ─────────────
function MatchCard({ match, teams, onClick, rtl = false }: {
  match: Match; teams: Team[]; onClick: () => void; rtl?: boolean
}) {
  const t1   = teams.find(t => t.id === match.team1Id)
  const t2   = teams.find(t => t.id === match.team2Id)
  const live = match.status === 'live'
  const done = match.status === 'completed'

  const borderColor = live ? 'rgba(239,68,68,.4)' : done ? 'rgba(34,197,94,.22)' : 'rgba(255,255,255,.08)'
  const shadow      = live ? '0 0 16px rgba(239,68,68,.15)' : 'inset 0 1px 0 rgba(255,255,255,.03)'

  return (
    <button onClick={onClick} style={{
      width: CARD_W, display: 'block', textAlign: 'left', cursor: 'pointer',
      background: live
        ? 'linear-gradient(135deg,rgba(28,8,8,.97),rgba(18,6,6,.99))'
        : 'linear-gradient(135deg,rgba(14,21,34,.97),rgba(9,13,21,.99))',
      border: `1.5px solid ${borderColor}`,
      borderRadius: 9, padding: '6px 8px',
      boxShadow: shadow, transition: 'all .15s', position: 'relative', overflow: 'hidden',
    }}>
      {live && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2,
          background: 'linear-gradient(90deg,transparent,#ef4444,transparent)',
          animation: 'ab-pbar 2s ease-in-out infinite' }} />
      )}
      <TeamRow team={t1} score={match.score1} winner={match.winnerId === match.team1Id} rtl={rtl} />
      <div style={{ height: 1, background: 'rgba(255,255,255,.05)', margin: '4px 0' }} />
      <TeamRow team={t2} score={match.score2} winner={match.winnerId === match.team2Id} rtl={rtl} />
      <div style={{ marginTop: 3, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
        <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.07em',
          color: live ? '#ef4444' : done ? 'rgba(34,197,94,.7)' : 'rgba(255,255,255,.2)' }}>
          {live ? '● LIVE' : MATCH_STATUS_LABEL[match.status]}
        </span>
      </div>
    </button>
  )
}

// ─── Round column (identical to admin RoundCol) ───────────────────────────────
function RoundColumn({ name, matches, teams, onSelect, rtl = false, colH }: {
  name: string; matches: Match[]; teams: Team[]; onSelect: (m: Match) => void; rtl?: boolean; colH: number
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
            <MatchCard match={m} teams={teams} onClick={() => onSelect(m)} rtl={rtl} />
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Connector SVG (identical to admin Connector) ─────────────────────────────
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

// ─── Finals column (identical to admin FinalsCol) ─────────────────────────────
function FinalsColumn({ match, teams, onSelect, colH }: {
  match: Match; teams: Team[]; onSelect: () => void; colH: number
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
          <MatchCard match={match} teams={teams} onClick={onSelect} />
        </div>
      </div>
    </div>
  )
}

// ─── Main bracket ─────────────────────────────────────────────────────────────
export function TournamentBracket({ tournament }: Props) {
  const [selected, setSelected] = useState<Match | null>(null)

  if (!tournament)          return <EmptyState msg="No active tournament." />
  if (!tournament.bracket)  return <EmptyState msg="Bracket has not been generated yet." />

  const { bracket, matches, teams } = tournament
  const rounds = bracket.rounds
  if (!rounds.length) return <EmptyState msg="Bracket has no rounds yet." />

  const getMs = (ids: string[]) =>
    ids.map(id => matches.find(m => m.id === id)).filter((m): m is Match => !!m && m.status !== 'bye')

  const finalsRound   = rounds[rounds.length - 1]
  const bracketRounds = rounds.slice(0, rounds.length - 1)
  const finalsMatch   = getMs(finalsRound.matchIds)[0]

  const leftCols = bracketRounds.map(r => {
    const ms = getMs(r.matchIds)
    return { name: r.name, matches: ms.slice(0, Math.ceil(ms.length / 2)) }
  })
  const rightColsOuter = bracketRounds.map(r => {
    const ms = getMs(r.matchIds)
    return { name: r.name, matches: ms.slice(Math.ceil(ms.length / 2)) }
  })
  const rightCols = [...rightColsOuter].reverse()

  const maxMatches = Math.max(
    ...leftCols.map(c => c.matches.length),
    ...rightCols.map(c => c.matches.length),
    1
  )
  const colH          = colHeight(maxMatches)
  const connOffsetTop = LABEL_H + LABEL_MB

  return (
    <>
      <style>{KEYFRAMES}</style>

      {/* ── Bracket arena (identical background to admin) ── */}
      <div style={{ borderRadius: 14, padding: '14px 12px',
        background: 'radial-gradient(ellipse 70% 55% at 50% 50%,rgba(245,158,11,.04) 0%,rgba(14,21,34,.9) 60%,rgba(9,13,21,.95) 100%)',
        border: '1px solid rgba(245,158,11,.07)', overflowX: 'auto', overflowY: 'hidden' }}>
        <div style={{ display: 'inline-flex', alignItems: 'flex-start', gap: 0, minWidth: 'max-content' }}>

          {/* LEFT */}
          {leftCols.map((col, ci) => {
            const nextCount = ci < leftCols.length - 1 ? leftCols[ci + 1].matches.length : 1
            return (
              <div key={`l${ci}`} style={{ display: 'flex', alignItems: 'flex-start' }}>
                <RoundColumn name={col.name} matches={col.matches} teams={teams}
                  onSelect={setSelected} rtl={false} colH={colH} />
                <Connector leftCount={col.matches.length} rightCount={nextCount} colH={colH} offsetTop={connOffsetTop} />
              </div>
            )
          })}

          {/* FINALS */}
          {finalsMatch
            ? <FinalsColumn match={finalsMatch} teams={teams} onSelect={() => setSelected(finalsMatch)} colH={colH} />
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
                <RoundColumn name={col.name} matches={col.matches} teams={teams}
                  onSelect={setSelected} rtl={true} colH={colH} />
              </div>
            )
          })}

        </div>
      </div>

      {selected && (
        <MatchDetailModal match={selected} teams={tournament.teams} onClose={() => setSelected(null)} />
      )}
    </>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({ msg }: { msg: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '60px 0', textAlign: 'center' }}>
      <div style={{ fontSize: 48, marginBottom: 12, opacity: .15 }}>⚔️</div>
      <p style={{ color: 'rgba(255,255,255,.3)', margin: 0 }}>{msg}</p>
    </div>
  )
}

// ─── Keyframes (identical to admin) ──────────────────────────────────────────
const KEYFRAMES = `
@keyframes ab-pbar { 0%,100%{opacity:.4} 50%{opacity:1} }
`
