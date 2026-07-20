import { useState } from 'react'
import type { Tournament, Match, Team } from '../../data/tournament'
import { MATCH_STATUS_LABEL } from '../../data/tournament'
import { MatchDetailModal } from './MatchDetailModal'

interface Props { tournament: Tournament | null }

// ─── Layout constants ─────────────────────────────────────────────────────────
const CARD_W   = 162
const CARD_H   = 72
const CONN_W   = 32    // connector SVG width
const SLOT_H   = 88    // px per match slot (card + gap).  COL_H = maxMatches × SLOT_H
const LABEL_H  = 22    // pill label height
const LABEL_MB = 6     // gap between label and first card

// Derived from slot layout — all columns share the same COL_H so connector maths align.
const colHeight = (maxMatches: number) => maxMatches * SLOT_H

// Y-centre of match i within COL_H (used by connectors)
const matchCY = (i: number, total: number, colH: number) =>
  (colH / total) * i + (colH / total) / 2

// Y-top of card i within COL_H
const matchTop = (i: number, total: number, colH: number) =>
  (colH / total) * i + ((colH / total) - CARD_H) / 2

// ─── Team row ─────────────────────────────────────────────────────────────────
function TeamSlot({ team, score, winner, rtl }: {
  team?: Team; score: number; winner: boolean; rtl: boolean
}) {
  const has = !!team
  return (
    <div style={{ display:'flex', alignItems:'center', gap:5,
      flexDirection: rtl ? 'row-reverse' : 'row', justifyContent:'space-between' }}>
      <div style={{ display:'flex', alignItems:'center', gap:5, minWidth:0, flex:1,
        flexDirection: rtl ? 'row-reverse' : 'row' }}>
        <img
          src={`https://mc-heads.net/avatar/${team?.captain ?? 'Steve'}/16`}
          onError={e => { (e.target as HTMLImageElement).style.opacity = '0.2' }}
          style={{ width:14, height:14, borderRadius:3, flexShrink:0,
            filter: winner ? 'drop-shadow(0 0 4px rgba(0,191,255,.8))' : 'grayscale(1) opacity(.45)' }}
          alt=""
        />
        <span style={{
          fontSize:10.5, fontWeight: winner ? 700 : 500,
          color: winner ? '#dff6ff' : has ? 'rgba(255,255,255,.42)' : 'rgba(255,255,255,.22)',
          textShadow: winner ? '0 0 10px rgba(0,191,255,.55)' : 'none',
          // Give enough room so "TBD" never clips — no hard max-width on TBD items
          maxWidth: has ? 90 : 120,
          overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
          fontStyle: !has ? 'italic' : 'normal',
          fontFamily:"'Space Grotesk',sans-serif",
        }}>
          {team?.name ?? 'TBD'}
        </span>
      </div>
      <span style={{ fontSize:13, fontWeight:900,
        color: winner ? '#00BFFF' : 'rgba(255,255,255,.2)',
        fontFamily:"'Space Grotesk',sans-serif",
        textShadow: winner ? '0 0 12px rgba(0,191,255,.9)' : 'none', flexShrink:0 }}>
        {score}
      </span>
    </div>
  )
}

// ─── Match card ───────────────────────────────────────────────────────────────
function MatchCard({ match, teams, onClick, rtl = false }: {
  match: Match; teams: Team[]; onClick: () => void; rtl?: boolean
}) {
  const t1 = teams.find(t => t.id === match.team1Id)
  const t2 = teams.find(t => t.id === match.team2Id)
  const live = match.status === 'live'
  const done = match.status === 'completed'

  const baseShadow = live
    ? '0 0 18px rgba(239,68,68,.18),inset 0 1px 0 rgba(255,255,255,.05)'
    : done
    ? '0 0 14px rgba(0,191,255,.07),inset 0 1px 0 rgba(255,255,255,.04)'
    : 'inset 0 1px 0 rgba(255,255,255,.03)'
  const baseBorder = live ? 'rgba(239,68,68,.4)' : done ? 'rgba(0,191,255,.22)' : 'rgba(255,255,255,.06)'

  return (
    <button onClick={onClick} style={{
      width: CARD_W, display:'block', textAlign:'left', cursor:'pointer',
      background: live
        ? 'linear-gradient(135deg,rgba(28,8,8,.97),rgba(18,6,6,.99))'
        : 'linear-gradient(135deg,rgba(14,21,34,.97),rgba(9,13,21,.99))',
      border:`1px solid ${baseBorder}`,
      borderRadius:9, padding:'6px 8px',
      backdropFilter:'blur(14px)', boxShadow: baseShadow,
      transition:'box-shadow .18s,border-color .18s',
      position:'relative', overflow:'hidden',
    }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement
        el.style.boxShadow = '0 0 24px rgba(0,191,255,.22),inset 0 1px 0 rgba(255,255,255,.08)'
        el.style.borderColor = 'rgba(0,191,255,.45)'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement
        el.style.boxShadow = baseShadow
        el.style.borderColor = baseBorder
      }}
    >
      {done && match.winnerId && (
        <div style={{ position:'absolute', top:0, left:0, width:2, height:'100%',
          background:'linear-gradient(180deg,transparent,rgba(0,191,255,.65),transparent)',
          borderRadius:'9px 0 0 9px' }} />
      )}
      {live && (
        <div style={{ position:'absolute', top:0, left:0, right:0, height:2,
          background:'linear-gradient(90deg,transparent,#ef4444,transparent)',
          animation:'pbar 2s ease-in-out infinite' }} />
      )}
      <TeamSlot team={t1} score={match.score1} winner={match.winnerId === match.team1Id} rtl={rtl} />
      <div style={{ height:1, background:'rgba(255,255,255,.04)', margin:'4px 0' }} />
      <TeamSlot team={t2} score={match.score2} winner={match.winnerId === match.team2Id} rtl={rtl} />
      <div style={{ marginTop:3, display:'flex', justifyContent: rtl ? 'flex-start' : 'flex-end' }}>
        {live
          ? <span style={{ display:'flex',alignItems:'center',gap:3,fontSize:8,fontWeight:700,
              letterSpacing:'0.1em',color:'#ef4444',background:'rgba(239,68,68,.1)',borderRadius:4,padding:'1px 5px' }}>
              <span style={{ width:4,height:4,borderRadius:'50%',background:'#ef4444',
                animation:'ldot 1.2s ease-in-out infinite',display:'inline-block' }} />
              LIVE
            </span>
          : <span style={{ fontSize:8,fontWeight:600,letterSpacing:'0.07em',
              color: done ? 'rgba(0,191,255,.55)' : 'rgba(255,255,255,.18)' }}>
              {MATCH_STATUS_LABEL[match.status]}
            </span>
        }
      </div>
    </button>
  )
}

// ─── Round column ─────────────────────────────────────────────────────────────
// Label pill sits INSIDE the column div, absolutely positioned just above the first card,
// so it's always close to its boxes regardless of how many matches the column has.
function RoundColumn({ name, matches, teams, onSelect, rtl = false, colH }: {
  name: string; matches: Match[]; teams: Team[]; onSelect: (m: Match) => void; rtl?: boolean; colH: number
}) {
  return (
    <div style={{ flexShrink:0 }}>
      <div style={{ position:'relative', width:CARD_W, height: colH + LABEL_H + LABEL_MB, marginTop:0 }}>
        {/* Round label — pinned to top of column; hidden for "Round of X" rounds */}
        {!name.toLowerCase().includes('round of') && (
          <div style={{
            position:'absolute',
            top: 0,
            left:0, right:0,
            display:'flex', justifyContent:'center',
          }}>
            <div style={{
              padding:'2px 10px', height:LABEL_H,
              display:'flex', alignItems:'center',
              background:'rgba(0,191,255,.07)', border:'1px solid rgba(0,191,255,.18)',
              borderRadius:20, fontSize:8, fontWeight:700, letterSpacing:'0.13em',
              color:'#00BFFF', textTransform:'uppercase', whiteSpace:'nowrap',
            }}>
              {name}
            </div>
          </div>
        )}

        {/* Match cards */}
        {matches.map((m, i) => (
          <div key={m.id} style={{
            position:'absolute',
            top: matchTop(i, matches.length, colH) + LABEL_H + LABEL_MB,
            left:0,
          }}>
            <MatchCard match={m} teams={teams} onClick={() => onSelect(m)} rtl={rtl} />
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Connector SVG ────────────────────────────────────────────────────────────
// leftCount  = match count of the column to the LEFT
// rightCount = match count of the column to the RIGHT
// colH       = shared column height (must match RoundColumn's colH)
// offsetTop  = vertical offset to align SVG with the card area (LABEL_H + LABEL_MB)
function Connector({ leftCount, rightCount, colH, offsetTop }: {
  leftCount: number; rightCount: number; colH: number; offsetTop: number
}) {
  if (!leftCount || !rightCount) return null

  const W   = CONN_W
  const lCY = (i: number) => matchCY(i, leftCount, colH)
  const rCY = (i: number) => matchCY(i, rightCount, colH)
  const segs: React.ReactNode[] = []

  if (leftCount === rightCount) {
    for (let i = 0; i < leftCount; i++) {
      segs.push(
        <g key={i} filter="url(#cg)">
          <line x1={0} y1={lCY(i)} x2={W} y2={rCY(i)} stroke="#00BFFF" strokeOpacity=".45" strokeWidth="1.4" />
          <circle cx={0} cy={lCY(i)} r={1.8} fill="#00BFFF" fillOpacity=".45" />
          <circle cx={W} cy={rCY(i)} r={1.8} fill="#00BFFF" fillOpacity=".45" />
        </g>
      )
    }
  } else if (leftCount > rightCount) {
    // left pairs converge rightward
    for (let ri = 0; ri < rightCount; ri++) {
      const li1 = ri * 2, li2 = ri * 2 + 1
      if (li2 >= leftCount) {
        segs.push(<line key={`s${ri}`} x1={0} y1={lCY(li1)} x2={W} y2={rCY(ri)} stroke="#00BFFF" strokeOpacity=".35" strokeWidth="1.4" />)
        continue
      }
      const midX = W / 2
      const midY = (lCY(li1) + lCY(li2)) / 2
      segs.push(
        <g key={ri} filter="url(#cg)">
          <line x1={0}    y1={lCY(li1)} x2={midX} y2={lCY(li1)} stroke="#00BFFF" strokeOpacity=".45" strokeWidth="1.4" />
          <line x1={0}    y1={lCY(li2)} x2={midX} y2={lCY(li2)} stroke="#00BFFF" strokeOpacity=".45" strokeWidth="1.4" />
          <line x1={midX} y1={lCY(li1)} x2={midX} y2={lCY(li2)} stroke="#00BFFF" strokeOpacity=".26" strokeWidth="1.4" />
          <line x1={midX} y1={midY}     x2={W}    y2={rCY(ri)}  stroke="#00BFFF" strokeOpacity=".45" strokeWidth="1.4" />
          <circle cx={midX} cy={midY}   r={2.3} fill="#00BFFF" fillOpacity=".65" />
          <circle cx={0}    cy={lCY(li1)} r={1.5} fill="#00BFFF" fillOpacity=".38" />
          <circle cx={0}    cy={lCY(li2)} r={1.5} fill="#00BFFF" fillOpacity=".38" />
        </g>
      )
    }
  } else {
    // right pairs converge leftward
    for (let li = 0; li < leftCount; li++) {
      const ri1 = li * 2, ri2 = li * 2 + 1
      if (ri2 >= rightCount) {
        segs.push(<line key={`s${li}`} x1={0} y1={lCY(li)} x2={W} y2={rCY(ri1)} stroke="#00BFFF" strokeOpacity=".35" strokeWidth="1.4" />)
        continue
      }
      const midX = W / 2
      const midY = (rCY(ri1) + rCY(ri2)) / 2
      segs.push(
        <g key={li} filter="url(#cg)">
          <line x1={W}    y1={rCY(ri1)} x2={midX} y2={rCY(ri1)} stroke="#00BFFF" strokeOpacity=".45" strokeWidth="1.4" />
          <line x1={W}    y1={rCY(ri2)} x2={midX} y2={rCY(ri2)} stroke="#00BFFF" strokeOpacity=".45" strokeWidth="1.4" />
          <line x1={midX} y1={rCY(ri1)} x2={midX} y2={rCY(ri2)} stroke="#00BFFF" strokeOpacity=".26" strokeWidth="1.4" />
          <line x1={midX} y1={midY}     x2={0}    y2={lCY(li)}  stroke="#00BFFF" strokeOpacity=".45" strokeWidth="1.4" />
          <circle cx={midX} cy={midY}   r={2.3} fill="#00BFFF" fillOpacity=".65" />
          <circle cx={W}    cy={rCY(ri1)} r={1.5} fill="#00BFFF" fillOpacity=".38" />
          <circle cx={W}    cy={rCY(ri2)} r={1.5} fill="#00BFFF" fillOpacity=".38" />
        </g>
      )
    }
  }

  return (
    <svg width={W} height={colH} style={{ flexShrink:0, overflow:'visible', marginTop: offsetTop }}>
      <defs>
        <filter id="cg" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.6" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      {segs}
    </svg>
  )
}

// ─── Finals centre column ─────────────────────────────────────────────────────
// The card is absolutely positioned at matchTop(0,1,colH) so its vertical centre
// equals matchCY(0,1,colH) = colH/2 — exactly where the connector lines aim.
// The emblem + label float above the card.
function FinalsColumn({ match, teams, onSelect, colH }: {
  match: Match; teams: Team[]; onSelect: () => void; colH: number
}) {
  const cardTop  = matchTop(0, 1, colH)   // (colH - CARD_H) / 2
  const emblH    = 48
  const emblMb   = 6
  const finLblH  = LABEL_H
  const finLblMb = LABEL_MB

  // top of emblem: just above the label which is just above the card
  const lblTop  = cardTop - finLblH - finLblMb
  const emblTop = lblTop  - emblH   - emblMb

  // total height the wrapper needs: colH (+ LABEL_H + LABEL_MB at top like other cols)
  const wrapH = colH + LABEL_H + LABEL_MB

  return (
    <div style={{ flexShrink:0 }}>
      <div style={{ position:'relative', width: CARD_W + 16, height: wrapH }}>
        {/* Ambient glow behind card */}
        <div style={{ position:'absolute',
          top: cardTop + LABEL_H + LABEL_MB + CARD_H/2 - 75,
          left:'50%', transform:'translateX(-50%)',
          width:150, height:150, borderRadius:'50%',
          background:'radial-gradient(circle,rgba(0,191,255,.07) 0%,transparent 70%)',
          pointerEvents:'none', animation:'orb 4s ease-in-out infinite' }} />

        {/* Emblem */}
        <div style={{ position:'absolute',
          top: emblTop + LABEL_H + LABEL_MB,
          left:'50%', transform:'translateX(-50%)',
          width:emblH, height:emblH, borderRadius:'50%',
          background:'radial-gradient(circle,rgba(0,191,255,.14) 0%,rgba(0,102,255,.05) 60%,transparent 100%)',
          border:'1px solid rgba(0,191,255,.28)',
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:22, flexShrink:0,
          boxShadow:'0 0 24px rgba(0,191,255,.18),0 0 50px rgba(0,102,255,.09)',
          animation:'trophy 3s ease-in-out infinite' }}>⚔️</div>

        {/* Finals label — same style as round labels, same distance above card */}
        <div style={{ position:'absolute',
          top: lblTop + LABEL_H + LABEL_MB,
          left:0, right:0, display:'flex', justifyContent:'center' }}>
          <div style={{
            padding:'2px 10px', height:LABEL_H,
            display:'flex', alignItems:'center',
            background:'rgba(0,191,255,.07)', border:'1px solid rgba(0,191,255,.18)',
            borderRadius:20, fontSize:8, fontWeight:700, letterSpacing:'0.13em',
            color:'#00BFFF', textTransform:'uppercase', whiteSpace:'nowrap',
          }}>Finals</div>
        </div>

        {/* Card — at the same vertical offset as other columns' first card */}
        <div style={{ position:'absolute',
          top: cardTop + LABEL_H + LABEL_MB,
          left: 8 /* centre within CARD_W+16 wrapper */ }}>
          <MatchCard match={match} teams={teams} onClick={onSelect} />
        </div>
      </div>
    </div>
  )
}

// ─── Main bracket ─────────────────────────────────────────────────────────────
export function TournamentBracket({ tournament }: Props) {
  const [selected, setSelected] = useState<Match | null>(null)

  if (!tournament)         return <EmptyState msg="No active tournament." />
  if (!tournament.bracket) return <EmptyState msg="Bracket has not been generated yet." />

  const { bracket, matches, teams } = tournament
  const rounds = bracket.rounds
  if (!rounds.length)      return <EmptyState msg="Bracket has no rounds yet." />

  const getMs = (ids: string[]) =>
    ids.map(id => matches.find(m => m.id === id)).filter(Boolean) as Match[]

  // ── Split rounds ──────────────────────────────────────────────────────────
  const finalsRound   = rounds[rounds.length - 1]
  const bracketRounds = rounds.slice(0, rounds.length - 1)
  const finalsMatch   = getMs(finalsRound.matchIds)[0]

  // each round → split matches in half: left = first half, right = second half
  const leftCols = bracketRounds.map(r => {
    const ms = getMs(r.matchIds)
    return { name: r.name, matches: ms.slice(0, Math.ceil(ms.length / 2)) }
  })
  const rightColsOuter = bracketRounds.map(r => {
    const ms = getMs(r.matchIds)
    return { name: r.name, matches: ms.slice(Math.ceil(ms.length / 2)) }
  })
  // Right side renders innermost (SF) → outermost (R16)
  const rightCols = [...rightColsOuter].reverse()

  // ── Dynamic column height ─────────────────────────────────────────────────
  // Use the maximum match count across all non-finals columns to set COL_H.
  // All columns share the same COL_H so connector Y-coordinates stay consistent.
  const maxMatches = Math.max(
    ...leftCols.map(c => c.matches.length),
    ...rightCols.map(c => c.matches.length),
    1
  )
  const colH = colHeight(maxMatches)

  // Connector SVG starts at the same top as the card area (skip the label strip)
  const connOffsetTop = LABEL_H + LABEL_MB

  return (
    <>
      <style>{KEYFRAMES}</style>

      {/* ── Header ── */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
        flexWrap:'wrap', gap:8, marginBottom:14 }}>
        <div>
          <h2 style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700,
            color:'#fff', fontSize:20, margin:0 }}>
            {tournament.name} — Bracket
          </h2>
          <p style={{ color:'rgba(255,255,255,.28)', fontSize:12, margin:'2px 0 0',
            textTransform:'capitalize' }}>
            {bracket.type.replace('_',' ')}
          </p>
        </div>
        <div style={{ display:'flex', gap:12, alignItems:'center' }}>
          {[['#ef4444','Live'],['#00BFFF','Scheduled'],['rgba(255,255,255,.22)','Pending']].map(([c,l]) => (
            <span key={l} style={{ display:'flex', alignItems:'center', gap:5,
              fontSize:11, color:'rgba(255,255,255,.35)' }}>
              <span style={{ width:6, height:6, borderRadius:'50%', background:c, flexShrink:0 }} />{l}
            </span>
          ))}
        </div>
      </div>

      {/* ── Arena ── */}
      <div style={{ position:'relative', borderRadius:16, padding:'16px 14px',
        background:'radial-gradient(ellipse 70% 55% at 50% 50%,rgba(0,102,255,.06) 0%,rgba(0,191,255,.02) 40%,transparent 70%),linear-gradient(135deg,rgba(14,21,34,.72) 0%,rgba(9,13,21,.88) 100%)',
        border:'1px solid rgba(0,191,255,.09)', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)',
          width:200, height:200, borderRadius:'50%',
          background:'radial-gradient(circle,rgba(0,191,255,.04) 0%,transparent 70%)',
          pointerEvents:'none', animation:'orb 6s ease-in-out infinite' }} />

        <div style={{ overflowX:'auto', overflowY:'hidden' }}>
          <div style={{ display:'inline-flex', alignItems:'flex-start', gap:0, minWidth:'max-content' }}>

            {/* ════ LEFT SIDE — outer → inner ════ */}
            {leftCols.map((col, ci) => {
              const nextCount = ci < leftCols.length - 1
                ? leftCols[ci + 1].matches.length
                : 1 // Finals
              return (
                <div key={`l${ci}`} style={{ display:'flex', alignItems:'flex-start' }}>
                  <RoundColumn name={col.name} matches={col.matches} teams={teams}
                    onSelect={setSelected} rtl={false} colH={colH} />
                  <Connector leftCount={col.matches.length} rightCount={nextCount}
                    colH={colH} offsetTop={connOffsetTop} />
                </div>
              )
            })}

            {/* ════ FINALS ════ */}
            {finalsMatch
              ? <FinalsColumn match={finalsMatch} teams={teams}
                  onSelect={() => setSelected(finalsMatch)} colH={colH} />
              : <div style={{ width:CARD_W+16, display:'flex', alignItems:'center',
                  justifyContent:'center', color:'rgba(255,255,255,.2)', fontSize:11,
                  height: colH + LABEL_H + LABEL_MB }}>Finals TBD</div>
            }

            {/* ════ RIGHT SIDE — inner → outer ════ */}
            {rightCols.map((col, ci) => {
              const leftCount = ci === 0 ? 1 : rightCols[ci - 1].matches.length
              return (
                <div key={`r${ci}`} style={{ display:'flex', alignItems:'flex-start' }}>
                  <Connector leftCount={leftCount} rightCount={col.matches.length}
                    colH={colH} offsetTop={connOffsetTop} />
                  <RoundColumn name={col.name} matches={col.matches} teams={teams}
                    onSelect={setSelected} rtl={true} colH={colH} />
                </div>
              )
            })}

          </div>
        </div>
      </div>

      {selected && (
        <MatchDetailModal match={selected} teams={tournament.teams}
          onClose={() => setSelected(null)} />
      )}
    </>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({ msg }: { msg: string }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center',
      justifyContent:'center', padding:'60px 0', textAlign:'center' }}>
      <div style={{ fontSize:48, marginBottom:12, opacity:.15 }}>⚔️</div>
      <p style={{ color:'rgba(255,255,255,.3)', margin:0 }}>{msg}</p>
    </div>
  )
}

// ─── Keyframes ────────────────────────────────────────────────────────────────
const KEYFRAMES = `
@keyframes pbar   { 0%,100%{opacity:.4}  50%{opacity:1} }
@keyframes ldot   { 0%,100%{opacity:1;transform:scale(1)}  50%{opacity:.4;transform:scale(.7)} }
@keyframes orb    { 0%,100%{opacity:.5}  50%{opacity:.9} }
@keyframes trophy { 0%,100%{box-shadow:0 0 24px rgba(0,191,255,.18),0 0 50px rgba(0,102,255,.09)}
                    50%{box-shadow:0 0 38px rgba(0,191,255,.3),0 0 75px rgba(0,102,255,.17)} }
`
