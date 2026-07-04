import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import type { Player } from '../data/players'
import { gamemodes } from '../data/gamemodes'
import {
  tierColors,
  getPlayerTotalPoints,
  getAverageTier,
  getAveragePoints,
  getHighestTier,
  getLowestTier,
} from '../data/tiers'

interface PlayerProfileModalProps {
  player: Player
  overallRank?: number
  totalPoints?: number
  overallTier?: string | null
  onClose: () => void
}

function GamemodeTile({ gm, tier }: { gm: (typeof gamemodes)[number]; tier?: string | null }) {
  const [imgError, setImgError] = useState(false)
  const colors = tier ? tierColors[tier] : null

  return (
    <div className="group/tile relative flex flex-col items-center gap-2">
      <div
        className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center border transition-all duration-300
          ${tier && colors
            ? `${colors.bg} ${colors.border} group-hover/tile:scale-110 group-hover/tile:border-[#00BFFF]/60 group-hover/tile:shadow-[0_0_20px_rgba(0,191,255,0.35)]`
            : 'bg-white/3 border-white/10 opacity-30'
          }`}
      >
        {!imgError ? (
          <img
            src={gm.icon}
            alt={gm.label}
            width={28}
            height={28}
            className="w-7 h-7 object-contain drop-shadow-[0_0_6px_rgba(0,191,255,0.25)]"
            onError={() => setImgError(true)}
          />
        ) : (
          <span className="text-xl">{gm.fallback}</span>
        )}
      </div>

      <span className={`text-[11px] font-bold tracking-wide ${colors ? colors.text : 'text-gray-700'}`}>
        {tier ?? '—'}
      </span>

      {/* Tooltip */}
      <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-10 opacity-0 scale-95 translate-y-1 transition-all duration-200 group-hover/tile:opacity-100 group-hover/tile:scale-100 group-hover/tile:translate-y-0">
        <div className="glass border border-[#00BFFF]/20 rounded-lg px-3 py-1.5 text-center whitespace-nowrap shadow-xl shadow-black/40">
          <div className="text-white text-xs font-semibold">{gm.label}</div>
          {tier && colors && <div className={`text-[11px] font-bold ${colors.text}`}>{tier}</div>}
        </div>
        <div className="w-2 h-2 bg-[#161B22] border-r border-b border-[#00BFFF]/20 rotate-45 mx-auto -mt-1" />
      </div>
    </div>
  )
}

export function PlayerProfileModal({ player, overallRank, totalPoints, overallTier, onClose }: PlayerProfileModalProps) {
  const [closing, setClosing] = useState(false)
  const [imgError, setImgError] = useState(false)

  const handleClose = useCallback(() => {
    setClosing(true)
    setTimeout(onClose, 180)
  }, [onClose])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }
    document.addEventListener('keydown', onKeyDown)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = prevOverflow
    }
  }, [handleClose])

  const points = totalPoints ?? getPlayerTotalPoints(player.ranks)
  const avgTier = overallTier ?? getAverageTier(player.ranks)
  const avgColors = avgTier ? tierColors[avgTier] : null
  const avgPoints = getAveragePoints(player.ranks)
  const highestTier = getHighestTier(player.ranks)
  const lowestTier = getLowestTier(player.ranks)
  const nameMcUrl = `https://namemc.com/profile/${encodeURIComponent(player.name)}`

  return createPortal(
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-[#05070c]/75 backdrop-blur-sm ${
        closing ? 'modal-backdrop-out' : 'modal-backdrop-in'
      }`}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${player.name} player profile`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-2xl max-h-[92vh] sm:max-h-[88vh] overflow-y-auto glass rounded-2xl sm:rounded-3xl border border-[#00BFFF]/20 shadow-2xl shadow-[#00BFFF]/10 ${
          closing ? 'modal-panel-out' : 'modal-panel-in'
        }`}
      >
        {/* Ambient glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[420px] h-56 bg-[#0066FF]/20 blur-[100px] pointer-events-none" />

        <button
          onClick={handleClose}
          aria-label="Close profile"
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full flex items-center justify-center bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-[#00BFFF]/40 hover:bg-[#00BFFF]/10 transition-all duration-200"
        >
          ✕
        </button>

        <div className="relative px-6 sm:px-10 pt-10 sm:pt-12 pb-8">
          {/* Header */}
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-4">
              <div className="absolute inset-0 rounded-full bg-[#00BFFF]/40 blur-xl scale-110" />
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1 bg-gradient-to-br from-[#00BFFF] via-[#0099FF] to-[#0066FF] shadow-[0_0_30px_rgba(0,191,255,0.45)]">
                <div className="w-full h-full rounded-full overflow-hidden bg-[#0B0F17] flex items-center justify-center">
                  {!imgError ? (
                    <img
                      src={player.head}
                      alt={player.name}
                      width={112}
                      height={112}
                      className="w-full h-full object-cover"
                      onError={() => setImgError(true)}
                    />
                  ) : (
                    <span className="text-4xl">👤</span>
                  )}
                </div>
              </div>
            </div>

            <h2 className="font-['Space_Grotesk'] font-black text-2xl sm:text-3xl text-white leading-tight">
              {player.name}
            </h2>

            {avgTier && avgColors && (
              <div
                className={`mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${avgColors.bg} ${avgColors.text} ${avgColors.border}`}
              >
                Average Tier: {avgTier}
              </div>
            )}

            <div className="mt-2 text-gray-500 text-sm font-medium">{player.region}</div>

            <a
              href={nameMcUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-[#00BFFF]/40 hover:bg-[#00BFFF]/10 text-gray-300 hover:text-[#00BFFF] text-xs font-semibold transition-all duration-200"
            >
              NameMC
              <span aria-hidden="true">↗</span>
            </a>
          </div>

          {/* Position section */}
          <div className="mt-8">
            <div className="flex items-center gap-2 mb-3">
              <span aria-hidden="true">🏆</span>
              <span className="text-gray-500 text-xs font-bold tracking-widest uppercase">Position</span>
              <div className="h-px flex-1 bg-white/8" />
            </div>

            <div className="glass rounded-xl border border-white/8 px-5 py-4 flex items-center justify-between">
              <div>
                <div className="text-white font-['Space_Grotesk'] font-bold text-lg">
                  {overallRank ? `#${overallRank} Overall` : 'Unranked'}
                </div>
                <div className="text-gray-500 text-xs mt-0.5">
                  {highestTier && lowestTier
                    ? `Best ${highestTier} · Worst ${lowestTier}`
                    : 'No gamemode placements yet'}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[#00BFFF] font-['Space_Grotesk'] font-black text-xl">
                  {points} pts
                </div>
                <div className="text-gray-600 text-[11px]">{avgPoints.toFixed(1)} avg / gamemode</div>
              </div>
            </div>
          </div>

          {/* Tier section */}
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-4">
              <span aria-hidden="true">⚔</span>
              <span className="text-gray-500 text-xs font-bold tracking-widest uppercase">Tier Placements</span>
              <div className="h-px flex-1 bg-white/8" />
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-7 gap-4 sm:gap-3 justify-items-center">
              {gamemodes.map((gm) => (
                <GamemodeTile key={gm.key} gm={gm} tier={player.ranks[gm.key]} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
