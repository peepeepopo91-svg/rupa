# Blue Tiers

A TanStack Start (React + Vite) marketing/community site for a Minecraft PvP network. Features a tier list, player rankings, BlueCoin mining system, shop, exchange, and an admin panel.

## Stack
- **Framework**: TanStack Start / React 19
- **Bundler**: Vite 7
- **Styling**: Tailwind CSS 4
- **Routing**: TanStack Router
- **Data**: JSON files in `data/` (content, players, economy, shop, mining, etc.)
- **Auth**: `credentials.yml` (username/password store)

## How to run
```
npm install
npm run dev
```
The dev server starts on port 5000.

## Key directories
- `src/` — app source (components, routes, store, server functions)
- `data/` — JSON data files persisted to disk
- `credentials.yml` — user accounts
- `admin.yml` — admin config
- `server.mjs` — production server entry

## User preferences
