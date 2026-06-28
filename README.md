# Blue Tiers

**Blue Tiers** is a production-ready Minecraft PvP tier list website — the #1 ranking network for competitive players across all gamemodes. Inspired by MCTiers, it features a dark esports aesthetic with blue accents, glassmorphism, and smooth animations.

## Key Technologies

- **TanStack Start** (React SSR framework)
- **TanStack Router** (file-based routing)
- **Tailwind CSS v4** (utility styling)
- **TypeScript**
- **Netlify** (hosting & deployment)

## Features

- Hero section with animated canvas particles and a copy-to-clipboard server IP
- Animated statistics counters (intersection observer triggered)
- Full rankings page with real-time search and gamemode filtering
- Player cards with Minecraft head avatars and gamemode tier badges with tooltips
- Tier color system: HT1–HT3 (blue → green), LT1–LT3 (yellow → red)
- Sticky responsive navbar with mobile menu
- Discord integration

## Running Locally

```bash
npm install
npm run dev
```

The dev server starts on `http://localhost:3000`.

## Adding Players

Edit `src/data/players.ts` — add a new object to the `players` array:

```typescript
{
  name: "YourPlayer",
  head: "https://mc-heads.net/avatar/YourPlayer",
  ranks: {
    sword: "HT1",
    crystal: "LT2",
    // null or omit for unranked
  }
}
```

Available tiers: `HT1`, `HT2`, `HT3`, `LT1`, `LT2`, `LT3`  
Available gamemodes: `mace`, `sword`, `axe`, `crystal`, `uhc`, `nethpot`, `diapot`
