import type { PlayerRanks } from './players'

export interface Gamemode {
  key: keyof PlayerRanks
  label: string
  /** Path to a PNG icon under /public/icons — swap the file to re-brand, no component changes needed. */
  icon: string
  /** Shown if the PNG fails to load. */
  fallback: string
}

export const gamemodes: Gamemode[] = [
  { key: 'mace',    label: 'Mace',    icon: '/icons/mace.png',    fallback: '🔨' },
  { key: 'sword',   label: 'Sword',   icon: '/icons/sword.png',   fallback: '⚔' },
  { key: 'axe',     label: 'Axe',     icon: '/icons/axe.png',     fallback: '🪓' },
  { key: 'crystal', label: 'Crystal', icon: '/icons/crystal.png', fallback: '💎' },
  { key: 'uhc',     label: 'UHC',     icon: '/icons/uhc.png',     fallback: '🏆' },
  { key: 'nethpot', label: 'Nethpot', icon: '/icons/nethpot.png', fallback: '🧪' },
  { key: 'diapot',  label: 'Diapot',  icon: '/icons/diapot.png',  fallback: '⚗' },
]
