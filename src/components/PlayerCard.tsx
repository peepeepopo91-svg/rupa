import { useState } from 'react'
import type { Player, PlayerRanks } from '../data/players'
import { tierColors, TIER_ORDER } from '../data/tiers'

export { tierColors }

export const gamemodes: { key: keyof PlayerRanks; label: string; icon: string }[] = [
  { key: 'mace',    label: 'Mace',    icon: '🔨' },
  { key: 'sword',   label: 'Sword',   icon: '⚔' },
  { key: 'axe',     label: 'Axe',     icon: '🪓' },
  { key: 'crystal', label: 'Crystal', icon: '💎' },
  { key: 'uhc',     label: 'UHC',     icon: '🏆' },
  { key: 'nethpot', label: 'Nethpot', icon: '🧪' },
  { key: 'diapot',  label: 'Diapot',  icon: '⚗' },
]

export { TIER_ORDER }

function TierBadge({ tier }: { tier: string }) {
  const colors = tierColors[tier]
  if (!colors) return null
  return (
    <span className={`text-xs font-bold px-1.5 py-0.5 rounded-md border ${colors.bg} ${colors.text} ${colors.border}`}>
      {tier}
    </span>
  )
}

function GamemodeIcon({ gm, tier }: { gm: typeof gamemodes[0]; tier?: string | null }) {
  const [hovered, setHovered] = useState(false)
  const colors = tier ? tierColors[tier] : null

  return (
    <div
      className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg border transition-all duration-200 cursor-default
          ${tier && colors
            ? `${colors.bg} ${colors.border} hover:shadow-lg hover:${colors.glow} hover:scale-110`
            : 'bg-white/3 border-white/10 opacity-30'
          }`}
      >
        {gm.icon}
      </div>

      {hovered && tier && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-none">
          <div className="glass border border-white/10 rounded-lg px-3 py-2 text-center whitespace-nowrap shadow-xl">
            <div className="text-white text-xs font-semibold mb-1">{gm.label}</div>
            <TierBadge tier={tier} />
          </div>
          <div className="w-2 h-2 bg-[#161B22] border-r border-b border-white/10 rotate-45 mx-auto -mt-1" />
        </div>
      )}
    </div>
  )
}

interface PlayerCardProps {
  player: Player
  totalPoints?: number
  overallRank?: number
  overallTier?: string | null
}

export function PlayerCard({ player, totalPoints, overallRank, overallTier }: PlayerCardProps) {
  const [imgError, setImgError] = useState(false)
  const overallColors = overallTier ? tierColors[overallTier] : null

  return (
    <div className="player-card glass rounded-2xl border border-white/5 hover:border-[#00BFFF]/30 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#00BFFF]/5 group">
      {/* Header: avatar + name + score badge */}
      <div className="flex items-start gap-3 mb-3">
        <div className="relative flex-shrink-0">
          {!imgError ? (
            <img
              src={player.head}
              alt={player.name}
              width={44}
              height={44}
              className="rounded-lg ring-2 ring-white/10 group-hover:ring-[#00BFFF]/30 transition-all duration-300"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-11 h-11 rounded-lg bg-[#00BFFF]/10 border border-[#00BFFF]/20 flex items-center justify-center text-lg">
              👤
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-1">
            <div className="font-['Space_Grotesk'] font-semibold text-white text-sm leading-tight truncate">
              {player.name}
            </div>
            {totalPoints !== undefined && (
              <span className="flex-shrink-0 text-xs font-bold px-1.5 py-0.5 rounded-md bg-[#00BFFF]/10 text-[#00BFFF] border border-[#00BFFF]/20">
                {totalPoints} pts
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mt-0.5">
            {overallRank !== undefined && (
              <span className="text-gray-400 text-xs font-semibold">
                #{overallRank} Overall
              </span>
            )}
            {overallTier && overallColors && overallRank !== undefined && (
              <span className="text-gray-700 text-xs">·</span>
            )}
            {overallTier && overallColors && (
              <span className={`text-xs font-semibold ${overallColors.text}`}>
                {overallTier} Avg
              </span>
            )}
          </div>

          {overallRank === undefined && (
            <div className="text-gray-600 text-xs mt-0.5">
              {Object.values(player.ranks).filter(Boolean).length} gamemodes
            </div>
          )}
        </div>
      </div>

      {/* Gamemode icons */}
      <div className="flex flex-wrap gap-1.5">
        {gamemodes.map((gm) => (
          <GamemodeIcon
            key={gm.key}
            gm={gm}
            tier={player.ranks[gm.key]}
          />
        ))}
      </div>
    </div>
  )
}
