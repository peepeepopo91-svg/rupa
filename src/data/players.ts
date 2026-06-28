export interface PlayerRanks {
  mace?: string | null
  sword?: string | null
  crystal?: string | null
  uhc?: string | null
  axe?: string | null
  nethpot?: string | null
  diapot?: string | null
}

export interface Player {
  name: string
  head: string
  ranks: PlayerRanks
}

const players: Player[] = [
  {
    name: "Technoblade",
    head: "https://mc-heads.net/avatar/Technoblade",
    ranks: {
      sword: "HT1",
      axe: "HT1",
      uhc: "HT1",
      crystal: "HT2",
      mace: "LT1",
      nethpot: null,
      diapot: null,
    },
  },
  {
    name: "Dream",
    head: "https://mc-heads.net/avatar/Dream",
    ranks: {
      sword: "HT2",
      uhc: "HT2",
      crystal: "LT1",
      mace: "HT3",
      axe: null,
      nethpot: null,
      diapot: null,
    },
  },
  {
    name: "Grian",
    head: "https://mc-heads.net/avatar/Grian",
    ranks: {
      mace: "HT1",
      crystal: "HT3",
      sword: "LT2",
      axe: "LT1",
      uhc: null,
      nethpot: null,
      diapot: null,
    },
  },
  {
    name: "xNestorio",
    head: "https://mc-heads.net/avatar/xNestorio",
    ranks: {
      uhc: "HT1",
      sword: "HT3",
      crystal: "LT2",
      mace: null,
      axe: null,
      nethpot: "HT2",
      diapot: null,
    },
  },
  {
    name: "Fruitberries",
    head: "https://mc-heads.net/avatar/Fruitberries",
    ranks: {
      uhc: "HT2",
      axe: "HT2",
      sword: "HT3",
      crystal: "LT1",
      mace: null,
      nethpot: null,
      diapot: "HT3",
    },
  },
  {
    name: "Sapnap",
    head: "https://mc-heads.net/avatar/Sapnap",
    ranks: {
      crystal: "HT1",
      sword: "HT2",
      nethpot: "HT3",
      mace: "LT2",
      uhc: null,
      axe: null,
      diapot: null,
    },
  },
  {
    name: "BadBoyHalo",
    head: "https://mc-heads.net/avatar/BadBoyHalo",
    ranks: {
      diapot: "HT1",
      nethpot: "HT2",
      crystal: "LT3",
      mace: null,
      sword: null,
      uhc: null,
      axe: null,
    },
  },
  {
    name: "Quig",
    head: "https://mc-heads.net/avatar/Quig",
    ranks: {
      axe: "HT1",
      mace: "HT2",
      sword: "LT1",
      crystal: null,
      uhc: null,
      nethpot: null,
      diapot: null,
    },
  },
]

export default players
