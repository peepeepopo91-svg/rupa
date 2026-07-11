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
      nethpot: "LT3",
      diapot: "HT4",
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
      mace: "HT5",
      axe: "LT4",
      nethpot: "HT5",
      diapot: "LT4",
    },
  },
  {
    name: "BlackTagX",
    head: "https://mc-heads.net/avatar/BlackTagX",
    region: "Asia",
    ranks: {
      sword: "LT4",
      uhc: "HT5",
      crystal: "LT5",
      mace: "NONE",
      axe: "LT4",
      nethpot: "HT4",
      diapot: "HT5",
    },
  },
  {
    name: "WyoCold",
    head: "https://mc-heads.net/avatar/WyoCold",
    region: "Asia",
    ranks: {
      sword: "HT4",
      uhc: "NONE",
      crystal: "NONE",
      mace: "NONE",
      axe: "NONE",
      nethpot: "NONE",
      diapot: "NONE",
    },
  },
  {
    name: "Not_Darsh_Mehta",
    head: "https://mc-heads.net/avatar/Not_Darsh_Mehta",
    region: "Asia",
    ranks: {
      sword: "NONE",
      uhc: "NONE",
      crystal: "NONE",
      mace: "NONE",
      axe: "HT5",
      nethpot: "NONE",
      diapot: "NONE",
    },
  },
  {
    name: "Tegress",
    head: "https://mc-heads.net/avatar/Tegress",
    region: "North America",
    ranks: {
      sword: "NONE",
      uhc: "NONE",
      crystal: "HT5",
      mace: "HT2",
      axe: "NONE",
      nethpot: "NONE",
      diapot: "NONE",
    },
  },
  {
    name: "laz_rexx",
    head: "https://mc-heads.net/avatar/laz_rexx",
    region: "North America",
    ranks: {
      sword: "NONE",
      uhc: "NONE",
      crystal: "HT5",
      mace: "NONE",
      axe: "NONE",
      nethpot: "NONE",
      diapot: "NONE",
    },
  },
  {
    name: "feet_lover420",
    head: "https://mc-heads.net/avatar/feet_lover420",
    region: "Europe",
    ranks: {
      sword: "NONE",
      uhc: "NONE",
      crystal: "NONE",
      mace: "HT3",
      axe: "LT4",
      nethpot: "NONE",
      diapot: "NONE",
    },
  },
  {
    name: "Zyr3n",
    head: "https://mc-heads.net/avatar/Zyr3n",
    region: "Europe",
    ranks: {
      sword: "HT4",
      uhc: "NONE",
      crystal: "NONE",
      mace: "LT4",
      axe: "LT4",
      nethpot: "NONE",
      diapot: "NONE",
    },
  },
  {
    name: "Letahrt",
    head: "https://mc-heads.net/avatar/Letahrt",
    region: "North America",
    ranks: {
      sword: "NONE",
      uhc: "LT4",
      crystal: "NONE",
      mace: "LT2",
      axe: "NONE",
      nethpot: "HT4",
      diapot: "NONE",
    },
  },
  {
    name: "smoretastic",
    head: "https://mc-heads.net/avatar/smoretastic",
    region: "North America",
    ranks: {
      sword: "NONE",
      uhc: "LT4",
      crystal: "NONE",
      mace: "NONE",
      axe: "NONE",
      nethpot: "NONE",
      diapot: "NONE",
    },
  },
  {
    name: "raincakecat",
    head: "https://mc-heads.net/avatar/raincakecat",
    region: "North America",
    ranks: {
      sword: "HT4",
      uhc: "LT4",
      crystal: "HT3",
      mace: "HT4",
      axe: "LT3",
      nethpot: "LT3",
      diapot: "LT3",
    },
  },
  {
    name: "adambobjh22",
    head: "https://mc-heads.net/avatar/adambobjh22",
    region: "Europe",
    ranks: {
      sword: "NONE",
      uhc: "NONE",
      crystal: "LT4",
      mace: "NONE",
      axe: "NONE",
      nethpot: "NONE",
      diapot: "NONE",
    },
  },
  {
    name: "CloudScope",
    head: "https://mc-heads.net/avatar/CloudScope",
    region: "North America",
    ranks: {
      sword: "NONE",
      uhc: "NONE",
      crystal: "LT3",
      mace: "NONE",
      axe: "NONE",
      nethpot: "NONE",
      diapot: "NONE",
    },
  },
  {
    name: "D4rkzu",
    head: "https://mc-heads.net/avatar/D4rkzu",
    region: "North America",
    ranks: {
      sword: "NONE",
      uhc: "NONE",
      crystal: "HT5",
      mace: "NONE",
      axe: "NONE",
      nethpot: "NONE",
      diapot: "NONE",
    },
  },
  {
    name: "TrionMC_",
    head: "https://mc-heads.net/avatar/TrionMC_",
    region: "Europe",
    ranks: {
      sword: "NONE",
      uhc: "NONE",
      crystal: "LT4",
      mace: "NONE",
      axe: "NONE",
      nethpot: "HT5",
      diapot: "NONE",
    },
  },
  {
    name: "TNR_HARY",
    head: "https://mc-heads.net/avatar/TNR_HARY",
    region: "North America",
    ranks: {
      sword: "NONE",
      uhc: "NONE",
      crystal: "HT4",
      mace: "NONE",
      axe: "NONE",
      nethpot: "NONE",
      diapot: "NONE",
    },
  },
  {
    name: "ClownLegPiece",
    head: "https://mc-heads.net/avatar/ClownLegPiece",
    region: "North America",
    ranks: {
      sword: "NONE",
      uhc: "NONE",
      crystal: "HT4",
      mace: "NONE",
      axe: "NONE",
      nethpot: "NONE",
      diapot: "NONE",
    },
  },
]

export default players
