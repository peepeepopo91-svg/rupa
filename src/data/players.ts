export interface PlayerRanks {
  mace?: string | null
  sword?: string | null
  crystal?: string | null
  uhc?: string | null
  axe?: string | null
  nethpot?: string | null
  diapot?: string | null
}

export const REGIONS = [
  "North America",
  "South America",
  "Europe",
  "Asia",
  "Oceania",
  "Africa",
  "Middle East",
] as const

export type Region = typeof REGIONS[number]

export interface Player {
  name: string
  head: string
  region: Region
  ranks: PlayerRanks
}

const players: Player[] = [
  {
    name: "Blue_Gaming08",
    head: "https://mc-heads.net/avatar/Blue_Gaming08",
    region: "Asia",
    ranks: {
      sword: "HT5",
      axe: "HT5",
      uhc: "LT3",
      crystal: "HT5",
      mace: "LT5",
      nethpot: "HT5",
      diapot: "HT4",
    },
  },
  {
    name: "Cyan_Gaming07",
    head: "https://mc-heads.net/avatar/Cyan_Gaming07",
    region: "Asia",
    ranks: {
      sword: "LT5",
      uhc: "LT5",
      crystal: "LT5",
      mace: "LT5",
      axe: "LT5",
      nethpot: "LT5",
      diapot: "LT5",
    },
  },
  {
    name: "D3n1s1",
    head: "https://mc-heads.net/avatar/D3n1s1",
    region: "Europe",
    ranks: {
      sword: "HT5",
      uhc: "LT5",
      crystal: "HT5",
      mace: "LT3",
      axe: "LT4",
      nethpot: "NONE",
      diapot: "NONE",
    },
  },
  {
    name: "cobwebmsater",
    head: "https://mc-heads.net/avatar/cobwebmsater",
    region: "Europe",
    ranks: {
      sword: "NONE",
      uhc: "HT4",
      crystal: "NONE",
      mace: "NONE",
      axe: "NONE",
      nethpot: "NONE",
      diapot: "NONE",
    },
  },
  {
    name: "nikkgming896",
    head: "https://mc-heads.net/avatar/nikkgming896",
    region: "Asia",
    ranks: {
      sword: "HT5",
      uhc: "HT5",
      crystal: "LT5",
      mace: "NONE",
      axe: "LT4",
      nethpot: "NONE",
      diapot: "NONE",
    },
  },
]

export default players
