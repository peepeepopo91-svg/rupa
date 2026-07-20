import { createRootRoute, HeadContent, Scripts, createFileRoute, lazyRouteComponent, createRouter } from "@tanstack/react-router";
import { jsxs, jsx } from "react/jsx-runtime";
import { T as TSS_SERVER_FUNCTION, g as getServerFnById, c as createServerFn } from "../server.js";
import { z } from "zod";
const Route$7 = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Blue Tiers | #1 Minecraft PvP Tier List" },
      { name: "description", content: "#1 Tier List for all types of Minecraft PvP players." },
      { name: "theme-color", content: "#00BFFF" },
      { name: "og:url", content: "https://bluetiers.bolt.host" },
      { name: "og:type", content: "website" },
      { name: "og:title", content: "Blue Tiers | #1 Minecraft PvP Tier List" },
      { name: "og:description", content: "#1 Tier List for all types of Minecraft PvP players." }
    ],
    links: [
      { rel: "canonical", href: "https://bluetiers.bolt.host" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous"
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700;800&family=Outfit:wght@300;400;500;600;700;800&display=swap"
      }
    ]
  }),
  shellComponent: RootDocument
});
function RootDocument({ children }) {
  return /* @__PURE__ */ jsxs("html", { lang: "en", children: [
    /* @__PURE__ */ jsx("head", { children: /* @__PURE__ */ jsx(HeadContent, {}) }),
    /* @__PURE__ */ jsxs("body", { className: "bg-[#0B0F17] text-white font-['Inter'] antialiased", children: [
      children,
      /* @__PURE__ */ jsx(Scripts, {})
    ] })
  ] });
}
const $$splitComponentImporter$6 = () => import("./tournament-DciRZQXZ.js");
const Route$6 = createFileRoute("/tournament")({
  component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
const $$splitComponentImporter$5 = () => import("./shop-CECyxk3N.js");
const Route$5 = createFileRoute("/shop")({
  component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
const REGIONS = [
  "North America",
  "South America",
  "Europe",
  "Asia",
  "Oceania",
  "Africa",
  "Middle East"
];
const players = [
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
      diapot: "HT4"
    }
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
      diapot: "LT5"
    }
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
      diapot: "HT4"
    }
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
      diapot: "NONE"
    }
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
      diapot: "LT4"
    }
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
      diapot: "HT5"
    }
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
      diapot: "NONE"
    }
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
      diapot: "NONE"
    }
  },
  {
    name: "Tegress",
    head: "https://mc-heads.net/avatar/Tegress",
    region: "North America",
    ranks: {
      sword: "LT4",
      uhc: "NONE",
      crystal: "HT5",
      mace: "HT2",
      axe: "NONE",
      nethpot: "NONE",
      diapot: "NONE"
    }
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
      diapot: "NONE"
    }
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
      diapot: "NONE"
    }
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
      diapot: "NONE"
    }
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
      diapot: "LT4"
    }
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
      diapot: "NONE"
    }
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
      diapot: "LT3"
    }
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
      diapot: "NONE"
    }
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
      diapot: "HT3"
    }
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
      diapot: "NONE"
    }
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
      diapot: "NONE"
    }
  },
  {
    name: "TNR_Harry",
    head: "https://mc-heads.net/avatar/TNR_HARY",
    region: "North America",
    ranks: {
      sword: "LT3",
      uhc: "NONE",
      crystal: "HT4",
      mace: "NONE",
      axe: "NONE",
      nethpot: "NONE",
      diapot: "NONE"
    }
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
      diapot: "NONE"
    }
  },
  {
    name: "SomeRandomDude54",
    head: "https://mc-heads.net/avatar/SomeRandomDude54",
    region: "Europe",
    ranks: {
      sword: "LT4",
      uhc: "NONE",
      crystal: "NONE",
      mace: "HT4",
      axe: "LT4",
      nethpot: "LT3",
      diapot: "NONE"
    }
  },
  {
    name: "nike_kz",
    head: "https://mc-heads.net/avatar/nike_kz",
    region: "Europe",
    ranks: {
      sword: "LT3",
      uhc: "LT4",
      crystal: "LT5",
      mace: "HT5",
      axe: "HT4",
      nethpot: "LT3",
      diapot: "LT3"
    }
  },
  {
    name: "mondoster",
    head: "https://mc-heads.net/avatar/mondoster",
    region: "Europe",
    ranks: {
      sword: "NONE",
      uhc: "NONE",
      crystal: "NONE",
      mace: "LT4",
      axe: "NONE",
      nethpot: "NONE",
      diapot: "NONE"
    }
  },
  {
    name: "Die_Melone1",
    head: "https://mc-heads.net/avatar/Die_Melone1",
    region: "Europe",
    ranks: {
      sword: "HT5",
      uhc: "NONE",
      crystal: "NONE",
      mace: "NONE",
      axe: "NONE",
      nethpot: "NONE",
      diapot: "NONE"
    }
  },
  {
    name: "quiezer",
    head: "https://mc-heads.net/avatar/quiezer",
    region: "North America",
    ranks: {
      sword: "LT3",
      uhc: "NONE",
      crystal: "NONE",
      mace: "NONE",
      axe: "NONE",
      nethpot: "NONE",
      diapot: "NONE"
    }
  },
  {
    name: "bananastylze",
    head: "https://mc-heads.net/avatar/bananastylze",
    region: "North America",
    ranks: {
      sword: "HT4",
      uhc: "NONE",
      crystal: "NONE",
      mace: "NONE",
      axe: "NONE",
      nethpot: "NONE",
      diapot: "NONE"
    }
  },
  {
    name: "Nyxveil7",
    head: "https://mc-heads.net/avatar/Nyxveil7",
    region: "Oceania",
    ranks: {
      sword: "LT4",
      uhc: "HT5",
      crystal: "LT5",
      mace: "HT5",
      axe: "HT4",
      nethpot: "HT4",
      diapot: "HT4"
    }
  },
  {
    name: "ItzMarlowww",
    head: "https://mc-heads.net/avatar/ItzMarlowww",
    region: "Europe",
    ranks: {
      sword: "NONE",
      uhc: "LT4",
      crystal: "HT4",
      mace: "NONE",
      axe: "HT4",
      nethpot: "LT4",
      diapot: "NONE"
    }
  },
  {
    name: "ItzV0id_MC",
    head: "https://mc-heads.net/avatar/ItzV0id_MC",
    region: "Europe",
    ranks: {
      sword: "NONE",
      uhc: "NONE",
      crystal: "LT3",
      mace: "NONE",
      axe: "NONE",
      nethpot: "NONE",
      diapot: "NONE"
    }
  },
  {
    name: "DarknzGamerz0101",
    head: "https://mc-heads.net/avatar/DarknzGamerz0101",
    region: "Asia",
    ranks: {
      sword: "HT4",
      uhc: "HT5",
      crystal: "LT5",
      mace: "LT4",
      axe: "LT4",
      nethpot: "HT4",
      diapot: "HT4"
    }
  }
];
var createSsrRpc = (functionId) => {
  const url = "/_serverFn/" + functionId;
  const serverFnMeta = { id: functionId };
  const fn = async (...args) => {
    return (await getServerFnById(functionId))(...args);
  };
  return Object.assign(fn, {
    url,
    serverFnMeta,
    [TSS_SERVER_FUNCTION]: true
  });
};
const loadAllData = createServerFn({
  method: "GET"
}).handler(createSsrRpc("fb2978d20fe1134bdea5fda77c3454ab7fe06d6f8f25ce5810087b934cbf6d9d"));
const flushStoresToDisk = createServerFn({
  method: "POST"
}).inputValidator(z.object({
  sections: z.array(z.object({
    section: z.enum(["players", "gamemodes", "content", "event", "economy"]),
    jsonData: z.string()
  }))
})).handler(createSsrRpc("122baba04c16401cfafde375ba7ad6643336700c3ea9139163e16817a4f8ac87"));
const fetchRepoStatus = createServerFn({
  method: "GET"
}).handler(createSsrRpc("0f21d5fdd8f8b02ab92db2f5563ffd9b0553c088bf6063ab1d5342805db5aa83"));
const validateAllData = createServerFn({
  method: "GET"
}).handler(createSsrRpc("f091b0a50c4636f6d4743812dc2225adc39a83cc84df7f264588bcf750d92a5b"));
const checkGitHubConnection = createServerFn({
  method: "GET"
}).handler(createSsrRpc("d84fa3675279ea0e17dad40462b2750bb2e4b616c1839fd9e9bb25478a5244e2"));
const getTokenInfo = createServerFn({
  method: "GET"
}).handler(createSsrRpc("0968b9e500194cfc5a1fddeda76061dfcfe12f83a9d08509cdd9df86c7aca7c9"));
const testGitHubToken = createServerFn({
  method: "POST"
}).inputValidator(z.object({
  token: z.string().min(1)
})).handler(createSsrRpc("2abf3e9a8c1b7b7a11f8de5823636e8c40964237c69abf25ad72f518545fdcdd"));
const saveGitHubToken = createServerFn({
  method: "POST"
}).inputValidator(z.object({
  token: z.string().min(1)
})).handler(createSsrRpc("1f7579febd4fab86592a3e93539f3f565f9671b1c540b25d737c8e8bff462a95"));
const clearGitHubToken = createServerFn({
  method: "POST"
}).handler(createSsrRpc("10ecc1d9c6f957038b8e29917d4a89402354e0da002cf941902f2aaad6df7a58"));
const fetchCommitHistory = createServerFn({
  method: "GET"
}).handler(createSsrRpc("73ea4a3c38df80c388f7c8b4ef3cad8833eefa1ea9accb2cd6242733cab06d2f"));
const restoreToCommit = createServerFn({
  method: "POST"
}).inputValidator(z.object({
  sha: z.string().min(7),
  message: z.string().optional()
})).handler(createSsrRpc("791f5fb5291d52d6022c2fdeba15d0eb794ed38b4d702cfc3068a4ed7403776c"));
const getGitDiagnostics = createServerFn({
  method: "GET"
}).handler(createSsrRpc("336f16e34d562f78275aa7a3cc022fe8ca0edac416f1900768a9c6ffb285a4af"));
const fixGitDivergence = createServerFn({
  method: "POST"
}).handler(createSsrRpc("caaa9e2b5c5ad43cde33788c51c45fa7f3c1baa017e74bc1d8e096b2dd152807"));
createServerFn({
  method: "POST"
}).handler(createSsrRpc("d100192c84dbdf2c323ec92fe16f12f83d269027f1a297e59ca03eef4c8e8d09"));
const fetchSyncHistory = createServerFn({
  method: "GET"
}).handler(createSsrRpc("2e6f0c521503f8024b01a97c2dd6e90b2082c3432492d548bb47ca64a739e11c"));
createServerFn({
  method: "POST"
}).inputValidator(z.object({
  commitHash: z.string(),
  commitMessage: z.string(),
  filesChanged: z.array(z.string()),
  status: z.enum(["success", "failed"]),
  durationMs: z.number()
})).handler(createSsrRpc("ab83cb7f457836d6f74c694d5cfeadda8b1f3d4efb517cdda82dc99dd72f810d"));
const compareLocalToRemote = createServerFn({
  method: "GET"
}).handler(createSsrRpc("56cb769110f118349cdf266ed2c7834cb8154bfed52328cd3c8ed51d80b5ab91"));
const pullRemoteFiles = createServerFn({
  method: "POST"
}).handler(createSsrRpc("e821b6439e82f7d8bfbe6b1b0d983c1f3e9be135a8c03517106cd7d1e6087322"));
const previewRepairPlayers = createServerFn({
  method: "GET"
}).handler(createSsrRpc("0a0026775ec41c07ff6fce56a504939f56b9fff933b5e8375d7e1697dbb34629"));
const repairPlayers = createServerFn({
  method: "POST"
}).handler(createSsrRpc("20254cac3591853b5c6524a2d69bd49a61d924ce0dff10ed2eb00eafd3a0e653"));
const adminLoadUsers = createServerFn({
  method: "GET"
}).handler(createSsrRpc("de6707771acf05f33f3f80de52b00b542ba882a03e38764710467ce74988f0e7"));
const adminCreateUser = createServerFn({
  method: "POST"
}).inputValidator(z.object({
  username: z.string().min(1).max(32),
  password: z.string().min(1),
  role: z.string().default("user"),
  addCred: z.boolean(),
  addPlayer: z.boolean(),
  addMining: z.boolean(),
  region: z.string().optional(),
  startingBC: z.number().min(0).optional(),
  startingGems: z.number().min(0).optional()
})).handler(createSsrRpc("c58b9d75bcc21687bdb01aa8732acbf31ba9ba509383e0b562d75dd5664ce9f3"));
const adminUpdateUserPlayer = createServerFn({
  method: "POST"
}).inputValidator(z.object({
  username: z.string(),
  region: z.string().optional(),
  head: z.string().optional(),
  ranks: z.record(z.string(), z.string()).optional(),
  create: z.boolean().optional()
})).handler(createSsrRpc("6d81718f1d6afbe57ef5e2a5807d8f527818d2b133218776c76788af33e21e3a"));
const adminUpdateUserCred = createServerFn({
  method: "POST"
}).inputValidator(z.object({
  username: z.string(),
  newPassword: z.string().min(1).optional(),
  role: z.string().optional(),
  enabled: z.boolean().optional()
})).handler(createSsrRpc("1e2c7ac3337193608c8b38cf66939454d885804b0cc0371e0dbe7f26e4c25c3d"));
const adminUpdateUserMining = createServerFn({
  method: "POST"
}).inputValidator(z.object({
  username: z.string(),
  balance: z.number().min(0).optional(),
  gems: z.number().min(0).optional(),
  create: z.boolean().optional(),
  startingBC: z.number().min(0).optional(),
  startingGems: z.number().min(0).optional()
})).handler(createSsrRpc("9a7797558969ec6ab39b9a0a106453ff24fd40e5d8dfb39d46da89655e270655"));
const adminCreateMiningForPlayer = createServerFn({
  method: "POST"
}).inputValidator(z.object({
  playerName: z.string().min(1),
  // existing name in players.json — becomes the mining/login username
  password: z.string().min(1),
  startingBC: z.number().min(0).optional(),
  startingGems: z.number().min(0).optional()
})).handler(createSsrRpc("a3482b5d0e0b8bbb058a12f6893630a221cea2ebe0c186f48ef2b6917f1280fd"));
const adminRenameMiningUser = createServerFn({
  method: "POST"
}).inputValidator(z.object({
  currentUsername: z.string().min(1),
  newUsername: z.string().min(1).max(32)
})).handler(createSsrRpc("36c54b2f321d22e3b47f5348ed255687dce04bd1f85a6b0eefe85e5c44a93110"));
const adminDeleteUser = createServerFn({
  method: "POST"
}).inputValidator(z.object({
  username: z.string(),
  deleteCred: z.boolean(),
  deletePlayer: z.boolean(),
  deleteMining: z.boolean()
})).handler(createSsrRpc("8b1f9c1b45467a38c696fe005b4d5b65163dc553d2104f6804f0494aa848fdbf"));
const adminBulkDeleteUsers = createServerFn({
  method: "POST"
}).inputValidator(z.object({
  usernames: z.array(z.string()),
  deleteCred: z.boolean(),
  deletePlayer: z.boolean(),
  deleteMining: z.boolean()
})).handler(createSsrRpc("fd27b53ba645f057b63ba6c3fc845d86f9fc2e67ee93bfe4e2467486c46afc01"));
const getBackupStatusFn = createServerFn({
  method: "GET"
}).handler(createSsrRpc("8a8b336fe65eb1a2e8629b73f2badc985dd6ab823a0e411b3e9c3d6120c51a0f"));
const setAutoBackupEnabled = createServerFn({
  method: "POST"
}).inputValidator(z.object({
  enabled: z.boolean()
})).handler(createSsrRpc("ea6082cc957e00016cbedcb2b7376e9e76f2cdc47857ea2b79a07a6f695a1a9e"));
const setBackupDebounce = createServerFn({
  method: "POST"
}).inputValidator(z.object({
  ms: z.number().int().min(5e3).max(18e5)
})).handler(createSsrRpc("2deb2e018fcfe19b7588e8378bbb22d97eeae36e030c9b7892bfd951502a31a3"));
const triggerBackupNow = createServerFn({
  method: "POST"
}).handler(createSsrRpc("2e5a86306780c713e09960b6674d29e921669e575d347e82484fd839a21fa174"));
const $$splitComponentImporter$4 = () => import("./rankings-DviJZjt-.js");
const Route$4 = createFileRoute("/rankings")({
  loader: async () => {
    try {
      const data = await loadAllData();
      return {
        players: data.players ?? players
      };
    } catch {
      return {
        players
      };
    }
  },
  component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
const $$splitComponentImporter$3 = () => import("./mining-BukE6fNy.js");
const Route$3 = createFileRoute("/mining")({
  component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
const $$splitComponentImporter$2 = () => import("./exchange-DJTz_SBw.js");
const Route$2 = createFileRoute("/exchange")({
  component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
const $$splitComponentImporter$1 = () => import("./admin-tlEr1oYW.js");
const Route$1 = createFileRoute("/admin")({
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const $$splitComponentImporter = () => import("./index-Caxm7o01.js");
const Route = createFileRoute("/")({
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
const TournamentRoute = Route$6.update({
  id: "/tournament",
  path: "/tournament",
  getParentRoute: () => Route$7
});
const ShopRoute = Route$5.update({
  id: "/shop",
  path: "/shop",
  getParentRoute: () => Route$7
});
const RankingsRoute = Route$4.update({
  id: "/rankings",
  path: "/rankings",
  getParentRoute: () => Route$7
});
const MiningRoute = Route$3.update({
  id: "/mining",
  path: "/mining",
  getParentRoute: () => Route$7
});
const ExchangeRoute = Route$2.update({
  id: "/exchange",
  path: "/exchange",
  getParentRoute: () => Route$7
});
const AdminRoute = Route$1.update({
  id: "/admin",
  path: "/admin",
  getParentRoute: () => Route$7
});
const IndexRoute = Route.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$7
});
const rootRouteChildren = {
  IndexRoute,
  AdminRoute,
  ExchangeRoute,
  MiningRoute,
  RankingsRoute,
  ShopRoute,
  TournamentRoute
};
const routeTree = Route$7._addFileChildren(rootRouteChildren)._addFileTypes();
const getRouter = () => {
  const router2 = createRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreloadStaleTime: 0
  });
  return router2;
};
const router = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getRouter
}, Symbol.toStringTag, { value: "Module" }));
export {
  setBackupDebounce as A,
  getTokenInfo as B,
  testGitHubToken as C,
  saveGitHubToken as D,
  clearGitHubToken as E,
  restoreToCommit as F,
  pullRemoteFiles as G,
  compareLocalToRemote as H,
  router as I,
  Route$4 as R,
  REGIONS as a,
  previewRepairPlayers as b,
  createSsrRpc as c,
  adminLoadUsers as d,
  adminCreateUser as e,
  adminCreateMiningForPlayer as f,
  adminUpdateUserPlayer as g,
  adminUpdateUserMining as h,
  adminRenameMiningUser as i,
  adminUpdateUserCred as j,
  adminDeleteUser as k,
  loadAllData as l,
  adminBulkDeleteUsers as m,
  fetchRepoStatus as n,
  checkGitHubConnection as o,
  players as p,
  fetchSyncHistory as q,
  repairPlayers as r,
  fetchCommitHistory as s,
  flushStoresToDisk as t,
  fixGitDivergence as u,
  validateAllData as v,
  getBackupStatusFn as w,
  getGitDiagnostics as x,
  triggerBackupNow as y,
  setAutoBackupEnabled as z
};
