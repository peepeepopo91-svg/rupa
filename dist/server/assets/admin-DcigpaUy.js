import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { c as createSsrRpc, p as players, a as REGIONS, v as validateAllData, b as previewRepairPlayers, r as repairPlayers, l as loadAllData, d as adminLoadUsers, e as adminCreateUser, f as adminCreateMiningForPlayer, g as adminUpdateUserPlayer, h as adminUpdateUserMining, i as adminRenameMiningUser, j as adminUpdateUserCred, k as adminDeleteUser, m as adminBulkDeleteUsers, n as fetchRepoStatus, o as checkGitHubConnection, q as fetchSyncHistory, s as fetchCommitHistory, t as flushStoresToDisk, u as fixGitDivergence, w as getBackupStatusFn, x as getGitDiagnostics, y as triggerBackupNow, z as setAutoBackupEnabled, A as setBackupDebounce, B as getTokenInfo, C as testGitHubToken, D as saveGitHubToken, E as clearGitHubToken, F as restoreToCommit, G as pullRemoteFiles, H as compareLocalToRemote } from "./router-C0zKgy4X.js";
import { z } from "zod";
import { c as createServerFn } from "../server.js";
import { m as markDirty, u as useSyncState, g as getDirty, c as clearDirty, s as setLastSync } from "./syncStore-C_ozCmAO.js";
import { g as gamemodes } from "./gamemodes-jMLNKT3S.js";
import { g as getPlayerTotalPoints, t as tierColors, T as TIER_ORDER } from "./tiers-BAwtsToj.js";
import { b as getDashboardStats, c as getAllMiningUsers, d as adminRenewMining, e as adminResetRenewal, f as adminAdjustRenewal, h as adminUpdateMiningUser } from "./miningServer-C63Kwilz.js";
import { R as RIG_TIERS, q as getEconomyOverrides, E as EXCHANGE_CONSTANTS, M as MINING_CONSTANTS, t as saveEconomyOverrides } from "./miningStore-BH0mJpub.js";
import { g as getSiteContent, s as saveSiteContent, r as resetSiteContent, a as getEventConfig, b as saveEventConfig, c as resetEventConfig } from "./contentStore-BHVkzjvQ.js";
import { e as adminGetAllPurchases, f as adminGetShopItems, h as adminGetShopStats, S as STATUS_LABELS, b as STATUS_COLORS, d as CATEGORY_ICONS, C as CATEGORY_LABELS, i as adminUpdatePurchase, a as RARITY_COLORS, R as RARITY_NAMES, j as adminAddShopItem, k as adminUpdateShopItem, l as adminDeleteShopItem } from "./shopServer-J2xkMrlc.js";
import "@tanstack/react-router";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "seroval";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "@tanstack/react-router/ssr/server";
const ADMIN_SESSION_KEY = "bn_admin_session";
const ADMIN_LOGS_KEY = "bn_admin_logs";
function safeGet$1(key) {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
function safeSet$1(key, value) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
  }
}
function getAdminSession() {
  return safeGet$1(ADMIN_SESSION_KEY);
}
function setAdminSession(session) {
  if (session) safeSet$1(ADMIN_SESSION_KEY, session);
  else try {
    if (typeof window !== "undefined") localStorage.removeItem(ADMIN_SESSION_KEY);
  } catch {
  }
}
function getLogs() {
  return safeGet$1(ADMIN_LOGS_KEY) ?? [];
}
function addLog(admin, action, details) {
  const logs = getLogs();
  const entry = {
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    timestamp: Date.now(),
    admin,
    action,
    details
  };
  const updated = [entry, ...logs].slice(0, 500);
  safeSet$1(ADMIN_LOGS_KEY, updated);
  return entry;
}
function clearLogs() {
  safeSet$1(ADMIN_LOGS_KEY, []);
}
const validateAdminCredentials = createServerFn({
  method: "POST"
}).inputValidator(z.object({
  username: z.string(),
  password1: z.string(),
  password2: z.string()
})).handler(createSsrRpc("1cd5592b008228410e370e8fdc87f51b9cbd66cb105cb8bbc964ab8ddb0ce73d"));
const updateAdminCredentials = createServerFn({
  method: "POST"
}).inputValidator(z.object({
  // Caller must supply current password1 to authorize any change
  currentPassword1: z.string(),
  currentPassword2: z.string(),
  // What to change — all optional
  newUsername: z.string().optional(),
  newPassword1: z.string().optional(),
  newPassword2: z.string().optional()
})).handler(createSsrRpc("b2b86fe6fd8b463e98d6022be0964a22100e08fd0fa5abddcd5b4d4a2073f07b"));
const getAdminInfo = createServerFn({
  method: "POST"
}).inputValidator(z.object({
  token: z.string(),
  username: z.string(),
  loginAt: z.number()
})).handler(createSsrRpc("8f49f79f5fe4a79ccddd2d4dd7efef06292b39379b7852b6f90ae7e540a52fee"));
const checkAdminToken = createServerFn({
  method: "POST"
}).inputValidator(z.object({
  username: z.string(),
  loginAt: z.number(),
  token: z.string()
})).handler(createSsrRpc("53c321d975df4a591bbd4a2e7e8381e368580bccea0f3accc62ac1e31636fb4e"));
function AdminLogin({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password1, setPassword1] = useState("");
  const [password2, setPassword2] = useState("");
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function handleSubmit(e) {
    e.preventDefault();
    if (!username || !password1 || !password2) {
      setError("All three fields are required.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const result = await validateAdminCredentials({ data: { username, password1, password2 } });
      if (!result?.valid) {
        setError(result?.error ?? "Invalid credentials");
      } else {
        onLogin({ username: result.username, loginAt: result.loginAt, token: result.token });
      }
    } catch {
      setError("Authentication service unavailable");
    }
    setLoading(false);
  }
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-[#0B0F17] flex items-center justify-center px-4", children: [
    /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex items-center justify-center pointer-events-none", children: /* @__PURE__ */ jsx("div", { className: "w-[500px] h-[500px] rounded-full bg-[#0066FF]/8 blur-[120px]" }) }),
    /* @__PURE__ */ jsxs("div", { className: "relative w-full max-w-md", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-center mb-8", children: [
        /* @__PURE__ */ jsx("div", { className: "inline-flex w-16 h-16 rounded-2xl bg-[#00BFFF]/10 border border-[#00BFFF]/20 items-center justify-center text-3xl mb-4 shadow-[0_0_30px_rgba(0,191,255,0.1)]", children: "🛡️" }),
        /* @__PURE__ */ jsx("h1", { className: "font-['Space_Grotesk'] font-black text-2xl text-white mb-1", children: "Admin Panel" }),
        /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-sm", children: "Blue Tiers Management System" })
      ] }),
      /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "glass rounded-2xl border border-white/8 p-7 space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-[10px] text-gray-500 uppercase tracking-widest mb-2", children: "Username" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              value: username,
              onChange: (e) => setUsername(e.target.value),
              placeholder: "Admin username",
              autoComplete: "username",
              className: "w-full bg-white/3 border border-white/10 hover:border-white/20 focus:border-[#00BFFF]/50 rounded-xl px-4 py-3 text-white text-sm outline-none transition-all placeholder-gray-700"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-[10px] text-gray-500 uppercase tracking-widest mb-2", children: "Password 1" }),
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: show1 ? "text" : "password",
                value: password1,
                onChange: (e) => setPassword1(e.target.value),
                placeholder: "First password",
                autoComplete: "current-password",
                className: "w-full bg-white/3 border border-white/10 hover:border-white/20 focus:border-[#00BFFF]/50 rounded-xl px-4 py-3 pr-10 text-white text-sm outline-none transition-all placeholder-gray-700"
              }
            ),
            /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setShow1((v) => !v), className: "absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 text-xs", children: show1 ? "🙈" : "👁" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-[10px] text-gray-500 uppercase tracking-widest mb-2", children: "Password 2" }),
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: show2 ? "text" : "password",
                value: password2,
                onChange: (e) => setPassword2(e.target.value),
                placeholder: "Second password",
                autoComplete: "current-password",
                className: "w-full bg-white/3 border border-white/10 hover:border-white/20 focus:border-[#00BFFF]/50 rounded-xl px-4 py-3 pr-10 text-white text-sm outline-none transition-all placeholder-gray-700"
              }
            ),
            /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setShow2((v) => !v), className: "absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 text-xs", children: show2 ? "🙈" : "👁" })
          ] })
        ] }),
        error && /* @__PURE__ */ jsxs("div", { className: "p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs", children: [
          "⚠ ",
          error
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "submit",
            disabled: loading,
            className: "btn-primary w-full py-3 rounded-xl font-semibold text-sm text-white transition-all disabled:opacity-50 disabled:pointer-events-none",
            children: loading ? /* @__PURE__ */ jsxs("span", { className: "flex items-center justify-center gap-2", children: [
              /* @__PURE__ */ jsx("span", { className: "w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" }),
              "Authenticating…"
            ] }) : "Access Admin Panel"
          }
        )
      ] })
    ] })
  ] });
}
const PLAYERS_KEY = "bn_admin_players";
const GAMEMODES_KEY = "bn_admin_gamemodes";
function safeGet(key) {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
function safeSet(key, value) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
  }
}
function getPlayers() {
  const stored = safeGet(PLAYERS_KEY);
  return stored ?? players;
}
function savePlayers(players2, opts) {
  safeSet(PLAYERS_KEY, players2);
  if (!opts?.silent) markDirty("players");
}
function deletePlayer(name) {
  savePlayers(getPlayers().filter((p) => p.name !== name));
}
function importPlayers(players2) {
  savePlayers(players2);
}
function resetPlayers() {
  safeSet(PLAYERS_KEY, players);
  markDirty("players");
}
function exportPlayersJSON() {
  return JSON.stringify(getPlayers(), null, 2);
}
function getGamemodes() {
  const stored = safeGet(GAMEMODES_KEY);
  return stored ?? gamemodes;
}
function saveGamemodes(gamemodes2, opts) {
  safeSet(GAMEMODES_KEY, gamemodes2);
  if (!opts?.silent) markDirty("gamemodes");
}
function resetGamemodes() {
  safeSet(GAMEMODES_KEY, gamemodes);
  markDirty("gamemodes");
}
function Dashboard({ admin }) {
  const [data, setData] = useState(null);
  useEffect(() => {
    getDashboardStats().catch(() => ({ users: {}, community: null, economy: {} })).then((server) => {
      const players2 = getPlayers();
      const logs = getLogs();
      const allPoints = players2.map((p) => getPlayerTotalPoints(p.ranks));
      const avgPts = allPoints.length ? Math.round(allPoints.reduce((a, b) => a + b, 0) / allPoints.length) : 0;
      const ht1Count = players2.filter((p) => Object.values(p.ranks).some((r) => r === "HT1")).length;
      const recentLogs = logs.filter((l) => Date.now() - l.timestamp < 864e5).length;
      const userList = Object.values(server.users);
      const community = server.community;
      const economy = server.economy ?? {};
      const totalBC = userList.reduce((s, u) => s + (u.balance ?? 0), 0);
      const totalGems = userList.reduce((s, u) => s + (u.gems ?? 0), 0);
      const activeRigs = userList.reduce((s, u) => s + u.rigs.filter((r) => r.status === "mining").length, 0);
      const totalRigs = userList.reduce((s, u) => s + u.rigs.length, 0);
      const ovCount = Object.keys(economy).filter((k) => economy[k] !== void 0).length;
      setData({
        stats: [
          { icon: "📋", label: "Ranked Players", value: players2.length, sub: `${ht1Count} in HT1`, color: "text-[#00BFFF]" },
          { icon: "⭐", label: "Avg Player Score", value: avgPts + " pts", sub: `${allPoints.filter((p) => p > 0).length} scored`, color: "text-yellow-400" },
          { icon: "👥", label: "Mining Accounts", value: userList.length, sub: `${activeRigs} active rigs`, color: "text-green-400" },
          { icon: "₿", label: "Total BC in Circ", value: Math.floor(totalBC).toLocaleString(), sub: "BlueCoin", color: "text-amber-400" },
          { icon: "💎", label: "Total Gems in Circ", value: Math.floor(totalGems).toLocaleString(), sub: "Gems", color: "text-purple-400" },
          { icon: "⛏️", label: "Total Mining Rigs", value: totalRigs, sub: `${activeRigs} running`, color: "text-cyan-400" },
          { icon: "🧱", label: "Blocks Solved", value: community?.totalSolved?.toLocaleString() ?? "0", sub: community ? `Block #${community.blockNumber}` : "", color: "text-emerald-400" },
          { icon: "⚙️", label: "Economy Overrides", value: ovCount, sub: ovCount ? "Active" : "Defaults", color: ovCount ? "text-orange-400" : "text-gray-500" },
          { icon: "📊", label: "Actions Today", value: recentLogs, sub: "in logs", color: "text-pink-400" }
        ],
        topPlayers: [...players2].sort((a, b) => getPlayerTotalPoints(b.ranks) - getPlayerTotalPoints(a.ranks)).slice(0, 5).map((p) => ({ player: p, pts: getPlayerTotalPoints(p.ranks) })),
        recentActions: logs.slice(0, 8),
        dateLabel: (/* @__PURE__ */ new Date()).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
      });
    });
  }, []);
  return /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
    /* @__PURE__ */ jsx("div", { className: "glass rounded-2xl border border-white/8 p-6 bg-gradient-to-r from-[#00BFFF]/5 to-transparent", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsx("div", { className: "text-3xl", children: "👋" }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("h2", { className: "font-['Space_Grotesk'] font-black text-white text-xl", children: [
          "Welcome back, ",
          admin
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-gray-500 text-sm", children: data?.dateLabel ?? "" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h3", { className: "text-gray-500 text-xs uppercase tracking-widest mb-4", children: "Overview" }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-4", children: data ? data.stats.map((card) => /* @__PURE__ */ jsxs("div", { className: "glass rounded-xl border border-white/8 p-5 hover:border-white/15 transition-colors", children: [
        /* @__PURE__ */ jsx("div", { className: "flex items-start justify-between mb-3", children: /* @__PURE__ */ jsx("span", { className: "text-2xl", children: card.icon }) }),
        /* @__PURE__ */ jsx("p", { className: `font-['Space_Grotesk'] font-black text-2xl ${card.color} leading-tight`, children: card.value }),
        /* @__PURE__ */ jsx("p", { className: "text-white text-xs font-semibold mt-1", children: card.label }),
        card.sub && /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-[10px] mt-0.5", children: card.sub })
      ] }, card.label)) : (
        // Skeleton — identical on SSR and initial client render
        Array.from({ length: 9 }).map((_, i) => /* @__PURE__ */ jsxs("div", { className: "glass rounded-xl border border-white/8 p-5 animate-pulse", children: [
          /* @__PURE__ */ jsx("div", { className: "h-6 w-6 rounded bg-white/5 mb-3" }),
          /* @__PURE__ */ jsx("div", { className: "h-7 w-20 rounded bg-white/5 mb-2" }),
          /* @__PURE__ */ jsx("div", { className: "h-3 w-28 rounded bg-white/5" })
        ] }, i))
      ) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "glass rounded-2xl border border-white/8 p-5", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-white font-bold text-sm mb-4", children: "🏆 Top 5 Players" }),
        data ? /* @__PURE__ */ jsx("div", { className: "space-y-2.5", children: data.topPlayers.map(({ player: p, pts }, i) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxs("span", { className: "text-gray-700 text-xs w-4 font-mono", children: [
            "#",
            i + 1
          ] }),
          /* @__PURE__ */ jsx("img", { src: p.head, alt: p.name, className: "w-7 h-7 rounded-lg", onError: (e) => {
            e.target.src = "";
          } }),
          /* @__PURE__ */ jsx("span", { className: "text-white text-sm font-semibold flex-1 truncate", children: p.name }),
          /* @__PURE__ */ jsx("span", { className: "text-gray-500 text-xs", children: p.region }),
          /* @__PURE__ */ jsxs("span", { className: "font-mono text-[#00BFFF] text-xs font-bold", children: [
            pts,
            " pts"
          ] })
        ] }, p.name)) }) : /* @__PURE__ */ jsx("div", { className: "space-y-2.5", children: Array.from({ length: 5 }).map((_, i) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 animate-pulse", children: [
          /* @__PURE__ */ jsx("div", { className: "w-4 h-3 rounded bg-white/5" }),
          /* @__PURE__ */ jsx("div", { className: "w-7 h-7 rounded-lg bg-white/5" }),
          /* @__PURE__ */ jsx("div", { className: "flex-1 h-3 rounded bg-white/5" }),
          /* @__PURE__ */ jsx("div", { className: "w-16 h-3 rounded bg-white/5" })
        ] }, i)) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "glass rounded-2xl border border-white/8 p-5", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-white font-bold text-sm mb-4", children: "🕐 Recent Activity" }),
        !data ? /* @__PURE__ */ jsx("div", { className: "space-y-2.5", children: Array.from({ length: 5 }).map((_, i) => /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2.5 animate-pulse", children: [
          /* @__PURE__ */ jsx("div", { className: "w-14 h-3 rounded bg-white/5 mt-0.5" }),
          /* @__PURE__ */ jsx("div", { className: "flex-1 h-3 rounded bg-white/5" })
        ] }, i)) }) : data.recentActions.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-sm text-center py-6", children: "No recent activity" }) : /* @__PURE__ */ jsx("div", { className: "space-y-2.5", children: data.recentActions.map((log) => /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2.5", children: [
          /* @__PURE__ */ jsx("span", { className: "text-[10px] font-mono text-gray-700 mt-0.5 shrink-0 w-14", children: new Date(log.timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) }),
          /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsx("span", { className: "text-[10px] bg-white/5 text-gray-400 px-1.5 py-0.5 rounded-md font-mono", children: log.action }),
            log.details && /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-[10px] mt-0.5 truncate", children: log.details })
          ] })
        ] }, log.id)) })
      ] })
    ] })
  ] });
}
const BLANK_PLAYER = {
  name: "",
  head: "",
  region: "North America",
  ranks: Object.fromEntries(gamemodes.map((gm) => [gm.key, "None"]))
};
function AdminToast$4({ msg, type }) {
  return /* @__PURE__ */ jsxs("div", { className: `fixed top-6 right-6 z-50 px-5 py-3 rounded-xl text-sm font-semibold shadow-xl border max-w-sm ${type === "success" ? "bg-green-500/15 border-green-500/30 text-green-400" : "bg-red-500/15 border-red-500/30 text-red-400"}`, children: [
    type === "success" ? "✓ " : "⚠ ",
    msg
  ] });
}
function ValidationPanel({
  report,
  onClose
}) {
  const playersFile = report.files.find((f) => f.section === "players");
  const otherFiles = report.files.filter((f) => f.section !== "players");
  function IssueRow({ ok, label, detail }) {
    return /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2", children: [
      /* @__PURE__ */ jsx("span", { className: `shrink-0 mt-0.5 text-xs font-bold ${ok ? "text-green-400" : "text-red-400"}`, children: ok ? "✓" : "✗" }),
      /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsx("span", { className: `text-xs ${ok ? "text-gray-400" : "text-red-300"}`, children: label }),
        detail && /* @__PURE__ */ jsx("p", { className: "text-[10px] text-gray-600 font-mono mt-0.5 break-all", children: detail })
      ] })
    ] });
  }
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md", children: /* @__PURE__ */ jsx("div", { className: "w-full max-w-xl max-h-[90vh] overflow-y-auto", children: /* @__PURE__ */ jsxs("div", { className: "relative rounded-2xl border border-white/10 bg-[#070B12]/96 backdrop-blur-xl shadow-[0_32px_64px_rgba(0,0,0,0.6)]", children: [
    /* @__PURE__ */ jsx("div", { className: "absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#00BFFF]/50 to-transparent" }),
    /* @__PURE__ */ jsxs("div", { className: "px-6 pt-6 pb-4 border-b border-white/5 flex items-center gap-3", children: [
      /* @__PURE__ */ jsx("div", { className: "w-9 h-9 rounded-xl bg-[#00BFFF]/10 border border-[#00BFFF]/20 flex items-center justify-center text-base", children: "🔍" }),
      /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsx("h2", { className: "font-['Space_Grotesk'] font-bold text-white text-base", children: "Data Validation Report" }),
        /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-[11px] mt-0.5", children: report.totalIssues === 0 ? "All checks passed — data is clean" : `${report.totalIssues} issue${report.totalIssues !== 1 ? "s" : ""} found` })
      ] }),
      /* @__PURE__ */ jsx("div", { className: `shrink-0 px-3 py-1 rounded-full text-xs font-bold border ${report.totalIssues === 0 ? "bg-green-500/12 border-green-500/25 text-green-400" : "bg-red-500/12 border-red-500/25 text-red-400"}`, children: report.totalIssues === 0 ? "✓ Clean" : `✗ ${report.totalIssues} issues` })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "px-6 py-5 space-y-5", children: [
      playersFile && /* @__PURE__ */ jsxs("section", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-[10px] text-gray-500 uppercase tracking-widest font-semibold", children: "players.json" }),
        /* @__PURE__ */ jsxs("div", { className: "glass rounded-xl border border-white/8 p-4 space-y-2", children: [
          /* @__PURE__ */ jsx(IssueRow, { ok: playersFile.jsonValid, label: "Valid JSON", detail: playersFile.error }),
          /* @__PURE__ */ jsx(IssueRow, { ok: !playersFile.hasMergeConflicts, label: "No merge conflict markers" }),
          /* @__PURE__ */ jsx(
            IssueRow,
            {
              ok: !playersFile.duplicates?.length,
              label: "No duplicate players",
              detail: playersFile.duplicates?.length ? `Duplicates: ${playersFile.duplicates.join(", ")}` : void 0
            }
          ),
          /* @__PURE__ */ jsx(
            IssueRow,
            {
              ok: !playersFile.missingFields?.length,
              label: "All players have required fields",
              detail: playersFile.missingFields?.length ? `Missing: ${playersFile.missingFields.join(", ")}` : void 0
            }
          ),
          /* @__PURE__ */ jsx(
            IssueRow,
            {
              ok: !playersFile.missingRegions?.length,
              label: "All players have valid region",
              detail: playersFile.missingRegions?.length ? `Invalid region: ${playersFile.missingRegions.join(", ")}` : void 0
            }
          ),
          /* @__PURE__ */ jsx(
            IssueRow,
            {
              ok: !playersFile.invalidRanks?.length,
              label: "All rank values are valid",
              detail: playersFile.invalidRanks?.length ? `Invalid ranks: ${playersFile.invalidRanks.join(", ")}` : void 0
            }
          ),
          playersFile.playerCount !== void 0 && /* @__PURE__ */ jsxs("p", { className: "text-[10px] text-gray-600 pt-1", children: [
            playersFile.playerCount,
            " player",
            playersFile.playerCount !== 1 ? "s" : "",
            " total"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("section", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-[10px] text-gray-500 uppercase tracking-widest font-semibold", children: "Other Data Files" }),
        /* @__PURE__ */ jsx("div", { className: "glass rounded-xl border border-white/8 p-4 space-y-2", children: otherFiles.map((f) => /* @__PURE__ */ jsx(
          IssueRow,
          {
            ok: f.jsonValid && !f.hasMergeConflicts,
            label: f.file,
            detail: f.error
          },
          f.file
        )) })
      ] }),
      /* @__PURE__ */ jsxs("section", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-[10px] text-gray-500 uppercase tracking-widest font-semibold", children: "GitHub Connection" }),
        /* @__PURE__ */ jsxs("div", { className: "glass rounded-xl border border-white/8 p-4 space-y-2", children: [
          /* @__PURE__ */ jsx(IssueRow, { ok: report.hasGitHubToken, label: "GitHub token configured" }),
          /* @__PURE__ */ jsx(IssueRow, { ok: report.repoReachable, label: "Repository reachable" }),
          /* @__PURE__ */ jsx(IssueRow, { ok: report.branchExists, label: 'Branch "main" exists' })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "px-6 pb-6 border-t border-white/5 pt-4", children: /* @__PURE__ */ jsx(
      "button",
      {
        onClick: onClose,
        className: "w-full py-3 rounded-xl text-sm font-semibold text-gray-400 border border-white/10 hover:bg-white/5 transition-all",
        children: "Close"
      }
    ) })
  ] }) }) });
}
function RepairPreviewModal({
  preview,
  applying,
  onApply,
  onCancel
}) {
  const hasIssues = preview.conflictBlocks > 0 || preview.missingCommas > 0 || preview.duplicatePlayers.length > 0;
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md", children: /* @__PURE__ */ jsx("div", { className: "w-full max-w-lg max-h-[90vh] overflow-y-auto", children: /* @__PURE__ */ jsxs("div", { className: "relative rounded-2xl border border-amber-500/20 bg-[#070B12]/97 backdrop-blur-xl shadow-[0_32px_64px_rgba(0,0,0,0.7)]", children: [
    /* @__PURE__ */ jsx("div", { className: "absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" }),
    /* @__PURE__ */ jsxs("div", { className: "px-6 pt-6 pb-4 border-b border-white/5 flex items-center gap-3", children: [
      /* @__PURE__ */ jsx("div", { className: "w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-base", children: "🔍" }),
      /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsx("h2", { className: "font-['Space_Grotesk'] font-bold text-white text-base", children: "Repair Preview" }),
        /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-[11px] mt-0.5", children: preview.canAutoRepair ? `${preview.playerCountBefore} players found → ${preview.playerCountAfter} after repair` : "Analysis complete — see issues below" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: `shrink-0 px-3 py-1 rounded-full text-xs font-bold border ${preview.canAutoRepair ? "bg-green-500/12 border-green-500/25 text-green-400" : "bg-red-500/12 border-red-500/25 text-red-400"}`, children: preview.canAutoRepair ? "✓ Auto-repairable" : "✗ Manual fix needed" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "px-6 py-5 space-y-4", children: [
      /* @__PURE__ */ jsxs("section", { children: [
        /* @__PURE__ */ jsx("h3", { className: "text-[10px] text-gray-500 uppercase tracking-widest font-semibold mb-2", children: "Detected Issues" }),
        /* @__PURE__ */ jsx("div", { className: "space-y-2", children: [
          {
            ok: preview.conflictBlocks === 0,
            label: preview.conflictBlocks > 0 ? `${preview.conflictBlocks} Git conflict block(s) (<<<<<<< / ======= / >>>>>>>)` : "No Git conflict markers"
          },
          {
            ok: preview.missingCommas === 0,
            label: preview.missingCommas > 0 ? `${preview.missingCommas} missing comma(s) in JSON` : "No missing commas"
          },
          {
            ok: preview.duplicatePlayers.length === 0,
            label: preview.duplicatePlayers.length > 0 ? `${preview.duplicatePlayers.length} duplicate player(s): ${preview.duplicatePlayers.slice(0, 4).join(", ")}${preview.duplicatePlayers.length > 4 ? "…" : ""}` : "No duplicate players"
          }
        ].map((item, i) => /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2", children: [
          /* @__PURE__ */ jsx("span", { className: `shrink-0 mt-0.5 text-xs font-bold ${item.ok ? "text-green-400" : "text-red-400"}`, children: item.ok ? "✓" : "✗" }),
          /* @__PURE__ */ jsx("span", { className: `text-xs ${item.ok ? "text-gray-500" : "text-gray-200"}`, children: item.label })
        ] }, i)) })
      ] }),
      preview.canAutoRepair && preview.repairs.length > 0 && /* @__PURE__ */ jsxs("section", { children: [
        /* @__PURE__ */ jsx("h3", { className: "text-[10px] text-gray-500 uppercase tracking-widest font-semibold mb-2", children: "Recovery Plan" }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-1.5 bg-green-500/4 border border-green-500/15 rounded-xl px-4 py-3", children: [
          preview.repairs.map((r, i) => /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2", children: [
            /* @__PURE__ */ jsx("span", { className: "shrink-0 mt-0.5 text-green-400 text-[10px] font-bold", children: "✓" }),
            /* @__PURE__ */ jsx("span", { className: "text-green-300/80 text-xs", children: r })
          ] }, i)),
          preview.duplicatePlayers.length > 0 && /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2", children: [
            /* @__PURE__ */ jsx("span", { className: "shrink-0 mt-0.5 text-green-400 text-[10px] font-bold", children: "✓" }),
            /* @__PURE__ */ jsx("span", { className: "text-green-300/80 text-xs", children: "Merge duplicate players (ranks combined, not lost)" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2", children: [
            /* @__PURE__ */ jsx("span", { className: "shrink-0 mt-0.5 text-green-400 text-[10px] font-bold", children: "✓" }),
            /* @__PURE__ */ jsx("span", { className: "text-green-300/80 text-xs", children: "Backup created before any changes" })
          ] })
        ] })
      ] }),
      preview.canAutoRepair && /* @__PURE__ */ jsxs("section", { children: [
        /* @__PURE__ */ jsx("h3", { className: "text-[10px] text-gray-500 uppercase tracking-widest font-semibold mb-2", children: "Result" }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-3 gap-2", children: [
          { label: "Players before", value: preview.playerCountBefore.toString(), color: "text-gray-300" },
          { label: "Players after", value: preview.playerCountAfter.toString(), color: "text-green-400" },
          { label: "Removed dupes", value: (preview.playerCountBefore - preview.playerCountAfter).toString(), color: "text-amber-400" }
        ].map((stat) => /* @__PURE__ */ jsxs("div", { className: "bg-white/2 border border-white/5 rounded-xl px-3 py-2.5 text-center", children: [
          /* @__PURE__ */ jsx("p", { className: "text-[9px] text-gray-600 uppercase tracking-widest mb-1", children: stat.label }),
          /* @__PURE__ */ jsx("p", { className: `text-lg font-bold font-mono ${stat.color}`, children: stat.value })
        ] }, stat.label)) })
      ] }),
      !preview.canAutoRepair && preview.parseError && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-red-500/20 bg-red-500/4 px-4 py-3", children: [
        /* @__PURE__ */ jsx("p", { className: "text-red-400 text-xs font-bold mb-1", children: "Auto-repair failed" }),
        /* @__PURE__ */ jsx("p", { className: "text-red-300/70 text-[11px] font-mono leading-relaxed break-all", children: preview.parseError }),
        /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-[10px] mt-2", children: 'The JSON corruption is too severe for automatic repair. You can try pulling the remote version using "Advanced Git → Pull" in the GitHub Sync Center, or manually fix the file.' })
      ] }),
      !hasIssues && /* @__PURE__ */ jsx("p", { className: "text-green-400 text-sm text-center py-2", children: "✓ No issues found — players.json is clean" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "px-6 pb-6 border-t border-white/5 pt-4 flex gap-3", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: onCancel,
          disabled: applying,
          className: "flex-1 py-3 rounded-xl text-sm text-gray-400 border border-white/10 hover:bg-white/5 transition-all disabled:opacity-40",
          children: "Cancel"
        }
      ),
      preview.canAutoRepair && /* @__PURE__ */ jsx(
        "button",
        {
          onClick: onApply,
          disabled: applying,
          className: "flex-1 py-3 rounded-xl text-sm font-semibold text-amber-400 border border-amber-500/25 bg-amber-500/8 hover:bg-amber-500/15 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2",
          children: applying ? /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx("span", { className: "w-4 h-4 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" }),
            "Applying Repair…"
          ] }) : "🔧 Apply Repair"
        }
      )
    ] })
  ] }) }) });
}
function RepairResultModal({
  repairs,
  playerCount,
  backupFile,
  onClose,
  onRefresh
}) {
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md", children: /* @__PURE__ */ jsx("div", { className: "w-full max-w-md max-h-[90vh] overflow-y-auto", children: /* @__PURE__ */ jsxs("div", { className: "relative rounded-2xl border border-green-500/20 bg-[#070B12]/96 backdrop-blur-xl shadow-[0_32px_64px_rgba(0,0,0,0.6)]", children: [
    /* @__PURE__ */ jsxs("div", { className: "px-6 pt-6 pb-4 border-b border-white/5 flex items-center gap-3", children: [
      /* @__PURE__ */ jsx("div", { className: "w-9 h-9 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-base", children: "🔧" }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h2", { className: "font-['Space_Grotesk'] font-bold text-white text-base", children: "Repair Complete" }),
        /* @__PURE__ */ jsxs("p", { className: "text-gray-600 text-[11px] mt-0.5", children: [
          playerCount,
          " players after repair"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "px-6 py-5 space-y-2", children: [
      repairs.map((r, i) => /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2", children: [
        /* @__PURE__ */ jsx("span", { className: "shrink-0 mt-0.5 text-green-400 text-xs font-bold", children: "✓" }),
        /* @__PURE__ */ jsx("span", { className: "text-gray-300 text-xs", children: r })
      ] }, i)),
      backupFile && /* @__PURE__ */ jsx("div", { className: "mt-3 pt-3 border-t border-white/5", children: /* @__PURE__ */ jsxs("p", { className: "text-gray-600 text-[10px] font-mono", children: [
        "💾 Backup: ",
        backupFile
      ] }) }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-500 text-xs pt-3 border-t border-white/5 mt-3", children: 'The local file has been repaired. Use "GitHub Sync" in the sidebar to commit the fixed data.' })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "px-6 pb-6 flex gap-3", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => {
            onRefresh();
            onClose();
          },
          className: "flex-1 py-3 rounded-xl text-sm font-semibold btn-primary text-white",
          children: "Refresh Player List"
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: onClose,
          className: "px-5 py-3 rounded-xl text-sm text-gray-400 border border-white/10 hover:bg-white/5",
          children: "Close"
        }
      )
    ] })
  ] }) }) });
}
function TierListManager({ admin }) {
  const [players2, setPlayers] = useState(getPlayers);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(BLANK_PLAYER);
  const [originalName, setOriginalName] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [toast, setToast] = useState(null);
  const [validating, setValidating] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [applyingRepair, setApplyingRepair] = useState(false);
  const [validationReport, setValidationReport] = useState(null);
  const [repairPreview, setRepairPreview] = useState(null);
  const [repairResult, setRepairResult] = useState(null);
  const fileInputRef = useRef(null);
  function showToastMsg(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }
  function persist(updated) {
    setPlayers(updated);
    savePlayers(updated);
  }
  const sorted = useMemo(() => {
    const q = search.toLowerCase();
    return [...players2].filter((p) => !q || p.name.toLowerCase().includes(q) || p.region.toLowerCase().includes(q)).sort((a, b) => getPlayerTotalPoints(b.ranks) - getPlayerTotalPoints(a.ranks));
  }, [players2, search]);
  function openAdd() {
    setForm({ ...BLANK_PLAYER, ranks: {} });
    setOriginalName("");
    setModal("add");
  }
  function openEdit(p) {
    setForm({ ...p, ranks: { ...p.ranks } });
    setOriginalName(p.name);
    setModal("edit");
  }
  function handleSave() {
    if (!form.name.trim()) {
      showToastMsg("Name is required.", "error");
      return;
    }
    if (modal === "add" && players2.find((p) => p.name.toLowerCase() === form.name.trim().toLowerCase())) {
      showToastMsg("A player with this name already exists.", "error");
      return;
    }
    const withHead = {
      ...form,
      name: form.name.trim(),
      head: form.head.trim() || `https://mc-heads.net/avatar/${encodeURIComponent(form.name.trim())}`
    };
    if (modal === "add") {
      persist([...players2, withHead]);
      addLog(admin, "player:add", `Added player: ${withHead.name}`);
      showToastMsg(`${withHead.name} added to tier list`);
    } else {
      persist(players2.map((p) => p.name === originalName ? withHead : p));
      addLog(admin, "player:edit", `Edited player: ${withHead.name}`);
      showToastMsg(`${withHead.name} updated`);
    }
    setModal(null);
  }
  function handleDelete() {
    if (!deleteTarget) return;
    const updated = players2.filter((p) => p.name !== deleteTarget.name);
    persist(updated);
    deletePlayer(deleteTarget.name);
    addLog(admin, "player:delete", `Deleted player: ${deleteTarget.name}`);
    showToastMsg(`${deleteTarget.name} removed`);
    setDeleteTarget(null);
  }
  function handleReset() {
    resetPlayers();
    setPlayers(getPlayers());
    setShowResetConfirm(false);
    addLog(admin, "player:reset", "Reset all players to default data");
    showToastMsg("Players reset to defaults");
  }
  function handleExport() {
    const json = exportPlayersJSON();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bluetiers-players-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addLog(admin, "player:export", `Exported ${players2.length} players`);
  }
  function handleImportFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result);
        if (!Array.isArray(data)) throw new Error("Expected array");
        importPlayers(data);
        setPlayers(getPlayers());
        addLog(admin, "player:import", `Imported ${data.length} players`);
        showToastMsg(`Imported ${data.length} players`);
      } catch {
        showToastMsg("Import failed: invalid JSON format", "error");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }
  async function handleValidate() {
    setValidating(true);
    try {
      const report = await validateAllData();
      setValidationReport(report);
    } catch (e) {
      showToastMsg(`Validation error: ${e instanceof Error ? e.message : String(e)}`, "error");
    } finally {
      setValidating(false);
    }
  }
  async function handleRepair() {
    setPreviewing(true);
    addLog(admin, "player:repair", "Analysing players.json for repair…");
    try {
      const preview = await previewRepairPlayers();
      setRepairPreview(preview);
    } catch (e) {
      const msg = e instanceof Error ? e.message.replace(/^REPAIR_ERROR:\s*/, "") : String(e);
      showToastMsg(`Repair analysis failed: ${msg}`, "error");
      addLog(admin, "player:repair", `Repair analysis failed: ${msg}`);
    } finally {
      setPreviewing(false);
    }
  }
  async function handleApplyRepair() {
    setApplyingRepair(true);
    addLog(admin, "player:repair", "Applying repair to players.json…");
    try {
      const result = await repairPlayers();
      addLog(admin, "player:repair", `Repair complete: ${result.repairs.join("; ")}`);
      setRepairPreview(null);
      setRepairResult({ repairs: result.repairs, playerCount: result.playerCount, backupFile: result.backupFile });
    } catch (e) {
      const msg = e instanceof Error ? e.message.replace(/^REPAIR_ERROR:\s*/, "") : String(e);
      showToastMsg(`Repair failed: ${msg}`, "error");
      addLog(admin, "player:repair", `Repair failed: ${msg}`);
      setRepairPreview(null);
    } finally {
      setApplyingRepair(false);
    }
  }
  async function handleRefreshFromDisk() {
    try {
      const data = await loadAllData();
      if (data.players) {
        savePlayers(data.players, { silent: true });
        setPlayers(data.players);
        showToastMsg("Player list refreshed from disk");
      }
    } catch {
      setPlayers(getPlayers());
    }
  }
  function setRank(key, val) {
    setForm((prev) => ({ ...prev, ranks: { ...prev.ranks, [key]: val || "None" } }));
  }
  const pts = getPlayerTotalPoints(form.ranks);
  return /* @__PURE__ */ jsxs("div", { className: "space-y-5", children: [
    toast && /* @__PURE__ */ jsx(AdminToast$4, { msg: toast.msg, type: toast.type }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-3", children: [
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "text",
          placeholder: "Search players…",
          value: search,
          onChange: (e) => setSearch(e.target.value),
          className: "flex-1 min-w-48 bg-white/3 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-700 outline-none focus:border-[#00BFFF]/40 transition-all"
        }
      ),
      /* @__PURE__ */ jsx("button", { onClick: openAdd, className: "btn-primary px-5 py-2.5 rounded-xl text-sm font-semibold text-white", children: "+ Add Player" }),
      /* @__PURE__ */ jsx("button", { onClick: handleExport, className: "px-5 py-2.5 rounded-xl text-sm text-[#00BFFF] border border-[#00BFFF]/20 hover:bg-[#00BFFF]/8 transition-all", children: "↓ Export JSON" }),
      /* @__PURE__ */ jsx("button", { onClick: () => fileInputRef.current?.click(), className: "px-5 py-2.5 rounded-xl text-sm text-gray-400 border border-white/10 hover:border-white/20 hover:text-white transition-all", children: "↑ Import JSON" }),
      /* @__PURE__ */ jsx("button", { onClick: () => setShowResetConfirm(true), className: "px-5 py-2.5 rounded-xl text-sm text-orange-400 border border-orange-500/20 hover:bg-orange-500/8 transition-all", children: "Reset" }),
      /* @__PURE__ */ jsx("input", { ref: fileInputRef, type: "file", accept: ".json", onChange: handleImportFile, className: "hidden" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2 px-4 py-3 rounded-xl border border-white/5 bg-white/1", children: [
      /* @__PURE__ */ jsx("span", { className: "text-gray-600 text-xs self-center mr-1", children: "Data Integrity:" }),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: handleValidate,
          disabled: validating,
          className: "flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-purple-400 border border-purple-500/20 hover:bg-purple-500/8 disabled:opacity-50 disabled:cursor-not-allowed transition-all",
          children: [
            validating ? /* @__PURE__ */ jsx("span", { className: "w-3 h-3 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" }) : "🔍",
            validating ? "Validating…" : "Validate Data"
          ]
        }
      ),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: handleRepair,
          disabled: previewing || applyingRepair,
          className: "flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-amber-400 border border-amber-500/20 hover:bg-amber-500/8 disabled:opacity-50 disabled:cursor-not-allowed transition-all",
          children: [
            previewing ? /* @__PURE__ */ jsx("span", { className: "w-3 h-3 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" }) : "🔧",
            previewing ? "Analysing…" : "Repair Data"
          ]
        }
      ),
      /* @__PURE__ */ jsx("span", { className: "text-gray-700 text-[10px] self-center ml-auto hidden sm:block", children: "Repair removes conflicts, fills missing fields, deduplicates, and sorts" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "text-gray-600 text-xs", children: [
      sorted.length,
      " player",
      sorted.length !== 1 ? "s" : "",
      " shown · ",
      players2.length,
      " total"
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "glass rounded-2xl border border-white/8 overflow-hidden", children: [
      /* @__PURE__ */ jsxs("div", { className: "hidden md:grid grid-cols-[40px_2fr_1fr_60px_repeat(7,_1fr)_100px] gap-2 px-4 py-3 border-b border-white/5 text-[9px] text-gray-600 uppercase tracking-widest", children: [
        /* @__PURE__ */ jsx("span", { children: "#" }),
        /* @__PURE__ */ jsx("span", { children: "Player" }),
        /* @__PURE__ */ jsx("span", { children: "Region" }),
        /* @__PURE__ */ jsx("span", { className: "text-center", children: "Pts" }),
        gamemodes.map((gm) => /* @__PURE__ */ jsx("span", { className: "text-center", children: gm.label }, gm.key)),
        /* @__PURE__ */ jsx("span", { className: "text-right", children: "Actions" })
      ] }),
      sorted.length === 0 && /* @__PURE__ */ jsx("div", { className: "py-16 text-center text-gray-600 text-sm", children: "No players found." }),
      /* @__PURE__ */ jsx("div", { className: "divide-y divide-white/5", children: sorted.map((p, i) => {
        const total = getPlayerTotalPoints(p.ranks);
        return /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-[40px_2fr_1fr_60px_repeat(7,_1fr)_100px] gap-2 px-4 py-3 items-center hover:bg-white/2 transition-colors", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-700 text-xs font-mono", children: i + 1 }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2.5 min-w-0", children: [
            /* @__PURE__ */ jsx(
              "img",
              {
                src: p.head,
                alt: p.name,
                className: "w-7 h-7 rounded-lg shrink-0",
                onError: (e) => {
                  e.target.src = "";
                }
              }
            ),
            /* @__PURE__ */ jsx("span", { className: "text-white text-sm font-semibold truncate", children: p.name })
          ] }),
          /* @__PURE__ */ jsx("span", { className: "text-gray-500 text-xs truncate", children: p.region }),
          /* @__PURE__ */ jsx("span", { className: "text-[#00BFFF] text-xs font-bold text-center font-mono", children: total }),
          gamemodes.map((gm) => {
            const t = p.ranks[gm.key];
            if (!t || t === "None" || t === "NONE") return /* @__PURE__ */ jsx("span", { className: "text-center text-gray-700 text-[10px]", children: "None" }, gm.key);
            const colors = tierColors[t];
            return /* @__PURE__ */ jsx(
              "span",
              {
                className: `text-center text-[9px] font-bold px-1 py-0.5 rounded ${colors?.bg ?? "bg-white/5"} ${colors?.text ?? "text-gray-400"}`,
                children: t
              },
              gm.key
            );
          }),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-1.5 justify-end", children: [
            /* @__PURE__ */ jsx("button", { onClick: () => openEdit(p), className: "px-2.5 py-1 rounded-lg text-[10px] text-[#00BFFF] border border-[#00BFFF]/20 hover:bg-[#00BFFF]/10 transition-all", children: "Edit" }),
            /* @__PURE__ */ jsx("button", { onClick: () => setDeleteTarget(p), className: "px-2.5 py-1 rounded-lg text-[10px] text-red-400 border border-red-500/20 hover:bg-red-500/10 transition-all", children: "Del" })
          ] })
        ] }, p.name);
      }) })
    ] }),
    modal && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm", children: /* @__PURE__ */ jsxs("div", { className: "glass rounded-2xl border border-white/10 p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto space-y-5", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-['Space_Grotesk'] font-black text-white text-xl", children: modal === "add" ? "+ Add Player" : `Edit: ${originalName}` }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "text-xs text-gray-500 uppercase tracking-widest block mb-1.5", children: "Username *" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              value: form.name,
              onChange: (e) => setForm((p) => ({ ...p, name: e.target.value })),
              placeholder: "Minecraft username",
              className: "w-full bg-white/3 border border-white/10 hover:border-white/20 focus:border-[#00BFFF]/40 rounded-xl px-4 py-2.5 text-white text-sm outline-none transition-all placeholder-gray-700"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "text-xs text-gray-500 uppercase tracking-widest block mb-1.5", children: "Region" }),
          /* @__PURE__ */ jsx(
            "select",
            {
              value: form.region,
              onChange: (e) => setForm((p) => ({ ...p, region: e.target.value })),
              className: "w-full bg-white/3 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#00BFFF]/40",
              children: REGIONS.map((r) => /* @__PURE__ */ jsx("option", { value: r, className: "bg-[#0B0F17]", children: r }, r))
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "sm:col-span-2", children: [
          /* @__PURE__ */ jsxs("label", { className: "text-xs text-gray-500 uppercase tracking-widest block mb-1.5", children: [
            "Head URL ",
            /* @__PURE__ */ jsx("span", { className: "normal-case text-gray-700", children: "(leave blank to auto-generate from username)" })
          ] }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              value: form.head,
              onChange: (e) => setForm((p) => ({ ...p, head: e.target.value })),
              placeholder: `https://mc-heads.net/avatar/${form.name || "Username"}`,
              className: "w-full bg-white/3 border border-white/10 hover:border-white/20 focus:border-[#00BFFF]/40 rounded-xl px-4 py-2.5 text-white text-sm outline-none transition-all placeholder-gray-700"
            }
          )
        ] })
      ] }),
      (form.head || form.name) && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx(
          "img",
          {
            src: form.head || `https://mc-heads.net/avatar/${encodeURIComponent(form.name)}`,
            alt: "preview",
            className: "w-12 h-12 rounded-xl border border-white/10",
            onError: (e) => {
              e.target.style.opacity = "0.2";
            }
          }
        ),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-white text-sm font-bold", children: form.name || "—" }),
          /* @__PURE__ */ jsxs("p", { className: "text-gray-600 text-xs", children: [
            form.region,
            " · ",
            pts,
            " pts"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "text-xs text-gray-500 uppercase tracking-widest block mb-3", children: "Tier Ranks" }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3", children: gamemodes.map((gm) => /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("p", { className: "text-gray-400 text-xs mb-1.5 flex items-center gap-1.5", children: [
            gm.icon ? /* @__PURE__ */ jsx(
              "img",
              {
                src: gm.icon,
                alt: gm.label,
                className: "w-4 h-4 object-contain",
                onError: (e) => {
                  e.target.style.display = "none";
                }
              }
            ) : /* @__PURE__ */ jsx("span", { children: gm.fallback }),
            gm.label
          ] }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              value: form.ranks[gm.key] ?? "",
              onChange: (e) => setRank(gm.key, e.target.value),
              className: "w-full bg-white/3 border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs outline-none focus:border-[#00BFFF]/40",
              children: [
                /* @__PURE__ */ jsx("option", { value: "", className: "bg-[#0B0F17]", children: "None" }),
                TIER_ORDER.map((t) => /* @__PURE__ */ jsx("option", { value: t, className: "bg-[#0B0F17]", children: t }, t))
              ]
            }
          )
        ] }, gm.key)) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-3 pt-2", children: [
        /* @__PURE__ */ jsx("button", { onClick: () => setModal(null), className: "flex-1 py-3 rounded-xl text-sm text-gray-400 border border-white/10 hover:bg-white/5 transition-all", children: "Cancel" }),
        /* @__PURE__ */ jsx("button", { onClick: handleSave, className: "flex-1 py-3 rounded-xl text-sm font-semibold btn-primary text-white", children: modal === "add" ? "+ Add Player" : "Save Changes" })
      ] })
    ] }) }),
    deleteTarget && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm", children: /* @__PURE__ */ jsxs("div", { className: "glass rounded-2xl border border-red-500/20 p-6 max-w-sm w-full text-center", children: [
      /* @__PURE__ */ jsx("img", { src: deleteTarget.head, alt: deleteTarget.name, className: "w-14 h-14 rounded-xl mx-auto mb-3 border border-white/10" }),
      /* @__PURE__ */ jsx("h3", { className: "text-white font-bold text-lg mb-2", children: "Remove Player?" }),
      /* @__PURE__ */ jsxs("p", { className: "text-gray-500 text-sm mb-6", children: [
        /* @__PURE__ */ jsx("strong", { className: "text-white", children: deleteTarget.name }),
        " will be permanently removed from the tier list."
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
        /* @__PURE__ */ jsx("button", { onClick: () => setDeleteTarget(null), className: "flex-1 py-2.5 rounded-xl text-sm text-gray-400 border border-white/10 hover:bg-white/5", children: "Cancel" }),
        /* @__PURE__ */ jsx("button", { onClick: handleDelete, className: "flex-1 py-2.5 rounded-xl text-sm font-semibold text-red-400 border border-red-500/30 bg-red-500/10 hover:bg-red-500/20", children: "Remove" })
      ] })
    ] }) }),
    showResetConfirm && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm", children: /* @__PURE__ */ jsxs("div", { className: "glass rounded-2xl border border-orange-500/20 p-6 max-w-sm w-full text-center", children: [
      /* @__PURE__ */ jsx("div", { className: "text-4xl mb-3", children: "⚠️" }),
      /* @__PURE__ */ jsx("h3", { className: "text-white font-bold text-lg mb-2", children: "Reset All Players?" }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-500 text-sm mb-6", children: "All custom player data will be discarded and replaced with the default players from the codebase." }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
        /* @__PURE__ */ jsx("button", { onClick: () => setShowResetConfirm(false), className: "flex-1 py-2.5 rounded-xl text-sm text-gray-400 border border-white/10", children: "Cancel" }),
        /* @__PURE__ */ jsx("button", { onClick: handleReset, className: "flex-1 py-2.5 rounded-xl text-sm font-semibold text-orange-400 border border-orange-500/30 bg-orange-500/10", children: "Reset All" })
      ] })
    ] }) }),
    validationReport && /* @__PURE__ */ jsx(
      ValidationPanel,
      {
        report: validationReport,
        onClose: () => setValidationReport(null)
      }
    ),
    repairPreview && /* @__PURE__ */ jsx(
      RepairPreviewModal,
      {
        preview: repairPreview,
        applying: applyingRepair,
        onApply: handleApplyRepair,
        onCancel: () => setRepairPreview(null)
      }
    ),
    repairResult && /* @__PURE__ */ jsx(
      RepairResultModal,
      {
        repairs: repairResult.repairs,
        playerCount: repairResult.playerCount,
        backupFile: repairResult.backupFile,
        onClose: () => setRepairResult(null),
        onRefresh: handleRefreshFromDisk
      }
    )
  ] });
}
const GAMEMODE_KEYS = ["mace", "sword", "axe", "crystal", "uhc", "nethpot", "diapot"];
function AdminToast$3({ msg, type }) {
  return /* @__PURE__ */ jsxs("div", { className: `fixed top-6 right-6 z-50 px-5 py-3 rounded-xl text-sm font-semibold shadow-xl border ${type === "success" ? "bg-green-500/15 border-green-500/30 text-green-400" : "bg-red-500/15 border-red-500/30 text-red-400"}`, children: [
    type === "success" ? "✓ " : "⚠ ",
    msg
  ] });
}
const BLANK_GAMEMODE = {
  key: "",
  label: "",
  icon: "",
  fallback: "🎮"
};
function GamemodeManager({ admin }) {
  const [modes, setModes] = useState(getGamemodes);
  const [editing, setEditing] = useState(null);
  const [isNew, setIsNew] = useState(false);
  const [toast, setToast] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  function showToastMsg(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3e3);
  }
  function persist(updated) {
    setModes(updated);
    saveGamemodes(updated);
  }
  function handleSaveEdit() {
    if (!editing) return;
    if (!editing.key || !editing.label) {
      showToastMsg("Key and label are required.", "error");
      return;
    }
    if (isNew && modes.find((m) => m.key === editing.key)) {
      showToastMsg("A gamemode with this key already exists.", "error");
      return;
    }
    const updated = isNew ? [...modes, editing] : modes.map((m) => m.key === editing.key ? editing : m);
    persist(updated);
    addLog(admin, isNew ? "gamemode:add" : "gamemode:edit", `${editing.label} (${editing.key})`);
    setEditing(null);
    showToastMsg(`Gamemode "${editing.label}" ${isNew ? "added" : "updated"}.`);
  }
  function handleDelete(key) {
    const gm = modes.find((m) => m.key === key);
    persist(modes.filter((m) => m.key !== key));
    setDeleteTarget(null);
    addLog(admin, "gamemode:delete", `Deleted ${gm?.label ?? key}`);
    showToastMsg(`Gamemode deleted.`);
  }
  function moveUp(key) {
    const idx = modes.findIndex((m) => m.key === key);
    if (idx === 0) return;
    const updated = [...modes];
    [updated[idx - 1], updated[idx]] = [updated[idx], updated[idx - 1]];
    persist(updated);
  }
  function moveDown(key) {
    const idx = modes.findIndex((m) => m.key === key);
    if (idx === modes.length - 1) return;
    const updated = [...modes];
    [updated[idx], updated[idx + 1]] = [updated[idx + 1], updated[idx]];
    persist(updated);
  }
  function handleReset() {
    resetGamemodes();
    setModes(getGamemodes());
    setShowConfirmReset(false);
    addLog(admin, "gamemode:edit", "Reset gamemodes to defaults");
    showToastMsg("Gamemodes reset to defaults.");
  }
  GAMEMODE_KEYS.filter((k) => !modes.find((m) => m.key === k));
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6 max-w-2xl", children: [
    toast && /* @__PURE__ */ jsx(AdminToast$3, { msg: toast.msg, type: toast.type }),
    /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => {
            setEditing({ ...BLANK_GAMEMODE });
            setIsNew(true);
          },
          className: "btn-primary px-5 py-2.5 rounded-xl text-sm font-semibold text-white",
          children: "+ Add Gamemode"
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setShowConfirmReset(true),
          className: "px-5 py-2.5 rounded-xl text-sm text-gray-400 border border-white/10 hover:border-white/20 hover:text-white transition-all",
          children: "Reset to Defaults"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "glass rounded-2xl border border-white/8 divide-y divide-white/5 overflow-hidden", children: [
      modes.length === 0 && /* @__PURE__ */ jsx("div", { className: "py-12 text-center text-gray-600 text-sm", children: "No gamemodes configured." }),
      modes.map((gm, i) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 px-5 py-3.5 hover:bg-white/2 transition-colors", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-0.5", children: [
          /* @__PURE__ */ jsx("button", { onClick: () => moveUp(gm.key), disabled: i === 0, className: "text-gray-700 hover:text-white disabled:opacity-20 text-xs leading-none px-0.5", children: "▲" }),
          /* @__PURE__ */ jsx("button", { onClick: () => moveDown(gm.key), disabled: i === modes.length - 1, className: "text-gray-700 hover:text-white disabled:opacity-20 text-xs leading-none px-0.5", children: "▼" })
        ] }),
        gm.icon ? /* @__PURE__ */ jsx("img", { src: gm.icon, alt: gm.label, className: "w-7 h-7 rounded-md object-contain", onError: (e) => {
          e.target.style.display = "none";
        } }) : /* @__PURE__ */ jsx("span", { className: "text-xl w-7 text-center", children: gm.fallback }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsx("p", { className: "text-white text-sm font-semibold", children: gm.label }),
          /* @__PURE__ */ jsxs("p", { className: "text-gray-600 text-xs font-mono", children: [
            "key: ",
            gm.key,
            " · ",
            gm.icon
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => {
                setEditing({ ...gm });
                setIsNew(false);
              },
              className: "px-3 py-1.5 rounded-lg text-xs text-[#00BFFF] border border-[#00BFFF]/20 hover:bg-[#00BFFF]/10 transition-all",
              children: "Edit"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setDeleteTarget(gm.key),
              className: "px-3 py-1.5 rounded-lg text-xs text-red-400 border border-red-500/20 hover:bg-red-500/10 transition-all",
              children: "Delete"
            }
          )
        ] })
      ] }, gm.key))
    ] }),
    editing && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm", children: /* @__PURE__ */ jsxs("div", { className: "glass rounded-2xl border border-white/10 p-6 w-full max-w-md space-y-4", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-white font-bold text-lg", children: isNew ? "Add Gamemode" : `Edit: ${editing.label}` }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "text-xs text-gray-500 uppercase tracking-widest block mb-1.5", children: "Data Key" }),
        isNew ? /* @__PURE__ */ jsxs(
          "select",
          {
            value: editing.key,
            onChange: (e) => setEditing((prev) => prev ? { ...prev, key: e.target.value } : prev),
            className: "w-full bg-white/3 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#00BFFF]/40",
            children: [
              /* @__PURE__ */ jsx("option", { value: "", className: "bg-[#0B0F17]", children: "— select key —" }),
              GAMEMODE_KEYS.map((k) => /* @__PURE__ */ jsx("option", { value: k, disabled: !!modes.find((m) => m.key === k), className: "bg-[#0B0F17]", children: k }, k))
            ]
          }
        ) : /* @__PURE__ */ jsx("input", { value: editing.key, readOnly: true, className: "w-full bg-white/5 border border-white/8 rounded-xl px-4 py-2.5 text-gray-400 text-sm" })
      ] }),
      [
        { key: "label", label: "Display Label", placeholder: "Sword" },
        { key: "icon", label: "Icon Path", placeholder: "/icons/Sword.png" },
        { key: "fallback", label: "Fallback Emoji", placeholder: "⚔" }
      ].map((f) => /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "text-xs text-gray-500 uppercase tracking-widest block mb-1.5", children: f.label }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            value: editing[f.key],
            onChange: (e) => setEditing((prev) => prev ? { ...prev, [f.key]: e.target.value } : prev),
            placeholder: f.placeholder,
            className: "w-full bg-white/3 border border-white/10 hover:border-white/20 focus:border-[#00BFFF]/40 rounded-xl px-4 py-2.5 text-white text-sm outline-none transition-all placeholder-gray-700"
          }
        )
      ] }, f.key)),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-3 pt-2", children: [
        /* @__PURE__ */ jsx("button", { onClick: () => setEditing(null), className: "flex-1 py-2.5 rounded-xl text-sm text-gray-400 border border-white/10 hover:bg-white/5", children: "Cancel" }),
        /* @__PURE__ */ jsx("button", { onClick: handleSaveEdit, className: "flex-1 py-2.5 rounded-xl text-sm font-semibold btn-primary text-white", children: isNew ? "Add Gamemode" : "Save Changes" })
      ] })
    ] }) }),
    deleteTarget && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm", children: /* @__PURE__ */ jsxs("div", { className: "glass rounded-2xl border border-red-500/20 p-6 max-w-sm w-full text-center", children: [
      /* @__PURE__ */ jsx("div", { className: "text-4xl mb-3", children: "🎮" }),
      /* @__PURE__ */ jsx("h3", { className: "text-white font-bold text-lg mb-2", children: "Delete Gamemode?" }),
      /* @__PURE__ */ jsxs("p", { className: "text-gray-500 text-sm mb-6", children: [
        "This removes ",
        /* @__PURE__ */ jsxs("strong", { className: "text-white", children: [
          '"',
          modes.find((m) => m.key === deleteTarget)?.label,
          '"'
        ] }),
        " from the list. Player ranks for this gamemode remain in the data."
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
        /* @__PURE__ */ jsx("button", { onClick: () => setDeleteTarget(null), className: "flex-1 py-2.5 rounded-xl text-sm text-gray-400 border border-white/10", children: "Cancel" }),
        /* @__PURE__ */ jsx("button", { onClick: () => handleDelete(deleteTarget), className: "flex-1 py-2.5 rounded-xl text-sm font-semibold text-red-400 border border-red-500/30 bg-red-500/10", children: "Delete" })
      ] })
    ] }) }),
    showConfirmReset && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm", children: /* @__PURE__ */ jsxs("div", { className: "glass rounded-2xl border border-orange-500/20 p-6 max-w-sm w-full text-center", children: [
      /* @__PURE__ */ jsx("div", { className: "text-4xl mb-3", children: "🎮" }),
      /* @__PURE__ */ jsx("h3", { className: "text-white font-bold text-lg mb-2", children: "Reset Gamemodes?" }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-500 text-sm mb-6", children: "All custom gamemode configuration will revert to the defaults in gamemodes.ts." }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
        /* @__PURE__ */ jsx("button", { onClick: () => setShowConfirmReset(false), className: "flex-1 py-2.5 rounded-xl text-sm text-gray-400 border border-white/10", children: "Cancel" }),
        /* @__PURE__ */ jsx("button", { onClick: handleReset, className: "flex-1 py-2.5 rounded-xl text-sm font-semibold text-orange-400 border border-orange-500/30 bg-orange-500/10", children: "Reset" })
      ] })
    ] }) })
  ] });
}
function AdminPaginator({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange
}) {
  if (totalPages <= 1 && totalItems <= pageSize) return null;
  const from = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalItems);
  function pageRange() {
    const delta = 2;
    const range2 = [];
    for (let i = Math.max(1, page - delta); i <= Math.min(totalPages, page + delta); i++) {
      range2.push(i);
    }
    return range2;
  }
  const base = "rounded-lg border text-xs font-semibold transition-all disabled:opacity-30 disabled:pointer-events-none";
  const inactive = `${base} px-3 py-1.5 border-white/8 text-gray-500 hover:text-white hover:border-white/20`;
  const active = `${base} w-8 h-8 flex items-center justify-center bg-[#00BFFF]/15 border-[#00BFFF]/30 text-[#00BFFF]`;
  const num = `${base} w-8 h-8 flex items-center justify-center border-white/8 text-gray-500 hover:text-white hover:border-white/20`;
  const range = pageRange();
  const showLeadingEllipsis = range[0] > 2;
  const showTrailingEllipsis = range[range.length - 1] < totalPages - 1;
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-2 pt-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 flex-wrap justify-center", children: [
      /* @__PURE__ */ jsx("button", { onClick: () => onPageChange(1), disabled: page === 1, className: inactive, "aria-label": "First page", children: "«" }),
      /* @__PURE__ */ jsx("button", { onClick: () => onPageChange(page - 1), disabled: page === 1, className: inactive, "aria-label": "Previous page", children: "← Prev" }),
      showLeadingEllipsis && /* @__PURE__ */ jsx("span", { className: "text-gray-700 text-xs px-1", children: "…" }),
      range.map((p) => /* @__PURE__ */ jsx("button", { onClick: () => onPageChange(p), className: p === page ? active : num, children: p }, p)),
      showTrailingEllipsis && /* @__PURE__ */ jsx("span", { className: "text-gray-700 text-xs px-1", children: "…" }),
      /* @__PURE__ */ jsx("button", { onClick: () => onPageChange(page + 1), disabled: page === totalPages, className: inactive, "aria-label": "Next page", children: "Next →" }),
      /* @__PURE__ */ jsx("button", { onClick: () => onPageChange(totalPages), disabled: page === totalPages, className: inactive, "aria-label": "Last page", children: "»" })
    ] }),
    /* @__PURE__ */ jsx("p", { className: "text-gray-700 text-[10px]", children: totalItems === 0 ? "No records" : `Showing ${from}–${to} of ${totalItems.toLocaleString()} records · Page ${page} of ${totalPages}` })
  ] });
}
const PAGE_SIZE$2 = 10;
function timeAgo$6(ms) {
  const s = Math.floor((Date.now() - ms) / 1e3);
  if (s < 5) return "just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
function activeHashrate(user) {
  return user.rigs.filter((r) => r.status === "mining").reduce((sum, r) => {
    const tier = RIG_TIERS.find((t) => t.id === r.tierId);
    return sum + (tier?.hashrate ?? 0);
  }, 0);
}
function userStatus(user) {
  if (user.rigs.some((r) => r.status === "mining")) return "mining";
  if (user.rigs.some((r) => r.status === "broken")) return "broken";
  if (user.rigs.length > 0) return "idle";
  return "inactive";
}
const STATUS_STYLE = {
  mining: "text-green-400 bg-green-500/10 border-green-500/25",
  idle: "text-gray-400 bg-white/5 border-white/10",
  broken: "text-red-400 bg-red-500/10 border-red-500/25",
  inactive: "text-gray-600 bg-white/3 border-white/5"
};
function StatusBadge$1({ status }) {
  const labels = { mining: "⛏ Mining", idle: "— Idle", broken: "✕ Broken", inactive: "· No rigs" };
  return /* @__PURE__ */ jsx("span", { className: `px-2 py-0.5 rounded-md text-[10px] font-bold border ${STATUS_STYLE[status]}`, children: labels[status] });
}
function Toast$2({ msg, type }) {
  return /* @__PURE__ */ jsxs("div", { className: `fixed top-6 right-6 z-50 px-5 py-3 rounded-xl text-sm font-semibold shadow-xl border ${type === "success" ? "bg-green-500/15 border-green-500/30 text-green-400" : "bg-red-500/15 border-red-500/30 text-red-400"}`, children: [
    type === "success" ? "✓ " : "⚠ ",
    msg
  ] });
}
function StatCard$2({
  label,
  value,
  sub,
  color = "text-white"
}) {
  return /* @__PURE__ */ jsxs("div", { className: "glass rounded-xl border border-white/8 px-4 py-3", children: [
    /* @__PURE__ */ jsx("p", { className: "text-[9px] uppercase tracking-widest text-gray-600 mb-1", children: label }),
    /* @__PURE__ */ jsx("p", { className: `font-['Space_Grotesk'] font-black text-xl ${color}`, children: value }),
    sub && /* @__PURE__ */ jsx("p", { className: "text-gray-700 text-[10px] mt-0.5", children: sub })
  ] });
}
function UserDetailPanel({
  user,
  admin,
  onUpdate,
  onClose
}) {
  const [tab, setTab] = useState("balance");
  const [bcAmt, setBcAmt] = useState("");
  const [gemAmt, setGemAmt] = useState("");
  const [giveTier, setGiveTier] = useState(RIG_TIERS[0]?.id ?? "");
  const [adjustMin, setAdjustMin] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  function showMsg(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3e3);
  }
  async function persist(updated, logAction, logMsg) {
    setSaving(true);
    try {
      await adminUpdateMiningUser({ data: { user: updated } });
      addLog(admin, logAction, logMsg);
      onUpdate(updated);
      showMsg(logMsg);
    } catch {
      showMsg("Save failed — server error", "error");
    } finally {
      setSaving(false);
    }
  }
  async function handleBC(dir) {
    const amt = parseFloat(bcAmt);
    if (isNaN(amt) || amt <= 0) {
      showMsg("Enter a valid positive amount.", "error");
      return;
    }
    const newBalance = dir === "give" ? user.balance + amt : Math.max(0, user.balance - amt);
    const updated = { ...user, balance: newBalance };
    await persist(updated, `mining:${dir}`, `${dir === "give" ? "+" : "-"}${amt} BC ${dir === "give" ? "to" : "from"} ${user.username}`);
    setBcAmt("");
  }
  async function handleGems(dir) {
    const amt = parseFloat(gemAmt);
    if (isNaN(amt) || amt <= 0) {
      showMsg("Enter a valid positive amount.", "error");
      return;
    }
    const newGems = dir === "give" ? (user.gems ?? 0) + amt : Math.max(0, (user.gems ?? 0) - amt);
    const updated = { ...user, gems: newGems };
    await persist(updated, `mining:${dir}`, `${dir === "give" ? "+" : "-"}${amt} Gems ${dir === "give" ? "to" : "from"} ${user.username}`);
    setGemAmt("");
  }
  async function handleGiveRig() {
    const tier = RIG_TIERS.find((t) => t.id === giveTier);
    if (!tier) return;
    const rig = {
      id: `${tier.id}_admin_${Date.now().toString(36)}`,
      tierId: tier.id,
      name: tier.name,
      durability: tier.maxDurability,
      status: "idle",
      miningSince: null,
      purchasedAt: Date.now()
    };
    const updated = { ...user, rigs: [...user.rigs, rig] };
    await persist(updated, "mining:give", `Gave ${tier.name} rig to ${user.username}`);
  }
  async function handleRepairRig(rigId) {
    const rig = user.rigs.find((r) => r.id === rigId);
    if (!rig) return;
    const tier = RIG_TIERS.find((t) => t.id === rig.tierId);
    const updated = {
      ...user,
      rigs: user.rigs.map(
        (r) => r.id === rigId ? { ...r, durability: tier.maxDurability, status: "idle", miningSince: null } : r
      )
    };
    await persist(updated, "mining:give", `Repaired ${rig.name} for ${user.username}`);
  }
  async function handleBreakRig(rigId) {
    const rig = user.rigs.find((r) => r.id === rigId);
    if (!rig) return;
    const updated = {
      ...user,
      rigs: user.rigs.map(
        (r) => r.id === rigId ? { ...r, durability: 0, status: "broken", miningSince: null } : r
      )
    };
    await persist(updated, "mining:take", `Broke ${rig.name} for ${user.username}`);
  }
  async function handleDeleteRig(rigId) {
    const rig = user.rigs.find((r) => r.id === rigId);
    if (!rig) return;
    const updated = { ...user, rigs: user.rigs.filter((r) => r.id !== rigId) };
    await persist(updated, "mining:take", `Removed ${rig.name} from ${user.username}`);
  }
  const status = userStatus(user);
  const mhRate = activeHashrate(user);
  const durPctOf = (rig) => {
    const tier = RIG_TIERS.find((t) => t.id === rig.tierId);
    return Math.round(rig.durability / tier.maxDurability * 100);
  };
  return /* @__PURE__ */ jsxs("div", { className: "glass rounded-2xl border border-[#00BFFF]/20 overflow-hidden", children: [
    toast && /* @__PURE__ */ jsx(Toast$2, { msg: toast.msg, type: toast.type }),
    /* @__PURE__ */ jsxs("div", { className: "px-6 py-4 border-b border-white/5 flex items-center gap-4", children: [
      /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-xl bg-[#00BFFF]/10 border border-[#00BFFF]/20 flex items-center justify-center text-lg font-black text-[#00BFFF]", children: user.username[0].toUpperCase() }),
      /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsx("p", { className: "text-white font-bold text-sm leading-tight", children: user.username }),
        /* @__PURE__ */ jsxs("p", { className: "text-gray-600 text-[10px] mt-0.5", children: [
          "Joined ",
          new Date(user.createdAt).toLocaleDateString(),
          " · Last active ",
          timeAgo$6(user.lastCheckedAt)
        ] })
      ] }),
      /* @__PURE__ */ jsx(StatusBadge$1, { status }),
      /* @__PURE__ */ jsx("button", { onClick: onClose, className: "text-gray-600 hover:text-white text-lg transition-colors", children: "✕" })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-4 divide-x divide-white/5 border-b border-white/5", children: [
      { label: "BlueCoin", value: Math.floor(user.balance).toLocaleString() + " BC", color: "text-amber-400" },
      { label: "Gems", value: Math.floor(user.gems ?? 0).toLocaleString() + " 💎", color: "text-purple-400" },
      { label: "Rigs", value: `${user.rigs.filter((r) => r.status === "mining").length} / ${user.rigs.length}`, color: "text-[#00BFFF]" },
      { label: "Hashrate", value: mhRate > 0 ? `${mhRate} MH/s` : "—", color: mhRate > 0 ? "text-green-400" : "text-gray-600" }
    ].map((s) => /* @__PURE__ */ jsxs("div", { className: "px-4 py-3 text-center", children: [
      /* @__PURE__ */ jsx("p", { className: "text-[9px] uppercase tracking-widest text-gray-600 mb-0.5", children: s.label }),
      /* @__PURE__ */ jsx("p", { className: `font-['Space_Grotesk'] font-black text-base ${s.color}`, children: s.value })
    ] }, s.label)) }),
    /* @__PURE__ */ jsx("div", { className: "flex border-b border-white/5", children: ["balance", "rigs", "history", "renewal"].map((t) => /* @__PURE__ */ jsx(
      "button",
      {
        onClick: () => setTab(t),
        className: `flex-1 py-2.5 text-xs font-semibold capitalize transition-all ${tab === t ? "text-[#00BFFF] border-b-2 border-[#00BFFF]" : "text-gray-600 hover:text-gray-400"}`,
        children: t === "balance" ? "💰 Balance" : t === "rigs" ? "⛏️ Rigs" : t === "history" ? "📜 History" : "⏱ Renewal"
      },
      t
    )) }),
    /* @__PURE__ */ jsxs("div", { className: "p-5 space-y-4", children: [
      tab === "balance" && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx("p", { className: "text-white text-xs font-bold", children: "💰 BlueCoin Operations" }),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "number",
                min: "0",
                step: "any",
                value: bcAmt,
                onChange: (e) => setBcAmt(e.target.value),
                placeholder: "Amount (BC)",
                className: "flex-1 bg-white/3 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#00BFFF]/40 placeholder-gray-700"
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                disabled: saving,
                onClick: () => handleBC("give"),
                className: "px-4 py-2.5 rounded-xl text-sm font-semibold text-green-400 border border-green-500/20 bg-green-500/8 hover:bg-green-500/15 transition-all disabled:opacity-40",
                children: "+ Give"
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                disabled: saving,
                onClick: () => handleBC("take"),
                className: "px-4 py-2.5 rounded-xl text-sm font-semibold text-red-400 border border-red-500/20 bg-red-500/8 hover:bg-red-500/15 transition-all disabled:opacity-40",
                children: "− Take"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx("p", { className: "text-white text-xs font-bold", children: "💎 Gems Operations" }),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "number",
                min: "0",
                step: "any",
                value: gemAmt,
                onChange: (e) => setGemAmt(e.target.value),
                placeholder: "Amount (Gems)",
                className: "flex-1 bg-white/3 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#00BFFF]/40 placeholder-gray-700"
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                disabled: saving,
                onClick: () => handleGems("give"),
                className: "px-4 py-2.5 rounded-xl text-sm font-semibold text-green-400 border border-green-500/20 bg-green-500/8 hover:bg-green-500/15 transition-all disabled:opacity-40",
                children: "+ Give"
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                disabled: saving,
                onClick: () => handleGems("take"),
                className: "px-4 py-2.5 rounded-xl text-sm font-semibold text-red-400 border border-red-500/20 bg-red-500/8 hover:bg-red-500/15 transition-all disabled:opacity-40",
                children: "− Take"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-white/5 bg-white/2 px-4 py-3 text-[11px] text-gray-500 leading-relaxed", children: [
          "Exchange used today: ",
          /* @__PURE__ */ jsx("span", { className: "text-gray-300 font-semibold", children: user.exchangeUsedToday }),
          " transactions",
          " · ",
          "Resets: ",
          /* @__PURE__ */ jsx("span", { className: "text-gray-300 font-semibold", children: new Date(user.exchangeResetAt).toLocaleString() })
        ] })
      ] }),
      tab === "rigs" && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx("p", { className: "text-white text-xs font-bold", children: "⛏️ Give Rig" }),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsx(
              "select",
              {
                value: giveTier,
                onChange: (e) => setGiveTier(e.target.value),
                className: "flex-1 bg-white/3 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#00BFFF]/40",
                children: RIG_TIERS.map((t) => /* @__PURE__ */ jsxs("option", { value: t.id, className: "bg-[#0B0F17]", children: [
                  t.emoji,
                  " ",
                  t.name,
                  " — ",
                  t.hashrate,
                  " MH/s · ",
                  t.cost,
                  " BC"
                ] }, t.id))
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                disabled: saving,
                onClick: handleGiveRig,
                className: "px-4 py-2.5 rounded-xl text-sm font-semibold text-[#00BFFF] border border-[#00BFFF]/20 bg-[#00BFFF]/8 hover:bg-[#00BFFF]/15 transition-all disabled:opacity-40",
                children: "Give Rig"
              }
            )
          ] })
        ] }),
        user.rigs.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-gray-700 text-sm text-center py-4", children: "No rigs owned." }) : /* @__PURE__ */ jsx("div", { className: "rounded-xl border border-white/8 overflow-hidden divide-y divide-white/5", children: user.rigs.map((rig) => {
          const tier = RIG_TIERS.find((t) => t.id === rig.tierId);
          const durPct = durPctOf(rig);
          return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 px-4 py-3 hover:bg-white/2 transition-colors", children: [
            /* @__PURE__ */ jsx("span", { className: "text-lg", children: tier?.emoji ?? "⛏" }),
            /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsx("p", { className: "text-white text-xs font-semibold", children: rig.name }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mt-0.5", children: [
                /* @__PURE__ */ jsx("div", { className: "flex-1 h-1 bg-white/5 rounded-full max-w-[80px]", children: /* @__PURE__ */ jsx(
                  "div",
                  {
                    className: `h-1 rounded-full transition-all ${durPct > 60 ? "bg-green-400" : durPct > 25 ? "bg-amber-400" : "bg-red-400"}`,
                    style: { width: `${durPct}%` }
                  }
                ) }),
                /* @__PURE__ */ jsxs("span", { className: "text-gray-600 text-[10px]", children: [
                  durPct,
                  "%"
                ] }),
                /* @__PURE__ */ jsx("span", { className: `text-[10px] font-semibold ${rig.status === "mining" ? "text-green-400" : rig.status === "broken" ? "text-red-400" : "text-gray-500"}`, children: rig.status })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex gap-1.5", children: [
              rig.status !== "broken" && /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => handleBreakRig(rig.id),
                  disabled: saving,
                  className: "px-2 py-1 rounded-lg text-[10px] text-red-400 border border-red-500/20 hover:bg-red-500/10 disabled:opacity-40 transition-all",
                  children: "Break"
                }
              ),
              (rig.status === "broken" || durPct < 100) && /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => handleRepairRig(rig.id),
                  disabled: saving,
                  className: "px-2 py-1 rounded-lg text-[10px] text-green-400 border border-green-500/20 hover:bg-green-500/10 disabled:opacity-40 transition-all",
                  children: "Repair"
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => handleDeleteRig(rig.id),
                  disabled: saving,
                  className: "px-2 py-1 rounded-lg text-[10px] text-gray-500 border border-white/10 hover:text-red-400 hover:border-red-500/20 disabled:opacity-40 transition-all",
                  children: "Remove"
                }
              )
            ] })
          ] }, rig.id);
        }) })
      ] }),
      tab === "history" && /* @__PURE__ */ jsxs(Fragment, { children: [
        user.rewardHistory.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-gray-700 text-sm text-center py-4", children: "No block rewards yet." }) : /* @__PURE__ */ jsx("div", { className: "space-y-1 max-h-72 overflow-y-auto pr-1", children: user.rewardHistory.slice(0, 50).map((r, i) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-3 py-2 rounded-lg bg-white/2 border border-white/5", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("span", { className: "text-white text-xs font-semibold", children: [
              "Block #",
              r.blockNumber
            ] }),
            /* @__PURE__ */ jsx("span", { className: "text-gray-600 text-[10px] ml-2", children: r.type.replace("_", " ") })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
            /* @__PURE__ */ jsxs("span", { className: "text-amber-400 text-xs font-bold", children: [
              "+",
              r.amount,
              " BC"
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-gray-700 text-[10px]", children: new Date(r.solvedAt).toLocaleTimeString() })
          ] })
        ] }, i)) }),
        /* @__PURE__ */ jsxs("div", { className: "text-gray-700 text-[10px] text-center", children: [
          "Total earned: ",
          /* @__PURE__ */ jsxs("span", { className: "text-amber-400 font-semibold", children: [
            user.rewardHistory.reduce((s, r) => s + r.amount, 0).toLocaleString(),
            " BC"
          ] }),
          " across ",
          user.rewardHistory.length,
          " blocks (last 50)"
        ] })
      ] }),
      tab === "renewal" && (() => {
        const now = Date.now();
        const expiresAt = user.miningExpiresAt;
        const isActive = expiresAt !== null && expiresAt > now;
        const msLeft = expiresAt ? Math.max(0, expiresAt - now) : 0;
        const hLeft = Math.floor(msLeft / 36e5);
        const mLeft = Math.floor(msLeft % 36e5 / 6e4);
        async function handleAdminRenew() {
          setSaving(true);
          try {
            await adminRenewMining({ data: { username: user.username } });
            addLog(admin, "mining:renewal", `Renewed mining session for ${user.username}`);
            onUpdate({ ...user, miningExpiresAt: now + 12 * 36e5, miningRenewedAt: now });
            showMsg(`Mining renewed for ${user.username}`);
          } catch {
            showMsg("Save failed", "error");
          } finally {
            setSaving(false);
          }
        }
        async function handleAdjust(sign) {
          const mins = parseFloat(adjustMin);
          if (isNaN(mins) || mins <= 0) {
            showMsg("Enter a valid number of minutes.", "error");
            return;
          }
          const deltaMs = sign * mins * 6e4;
          setSaving(true);
          try {
            await adminAdjustRenewal({ data: { username: user.username, deltaMs } });
            addLog(admin, "mining:renewal", `${sign > 0 ? "Extended" : "Reduced"} renewal by ${mins}m for ${user.username}`);
            const newExpiry = Math.max(now, (user.miningExpiresAt ?? now) + deltaMs);
            onUpdate({ ...user, miningExpiresAt: newExpiry });
            showMsg(`Timer ${sign > 0 ? "extended" : "reduced"} by ${mins}m`);
            setAdjustMin("");
          } catch {
            showMsg("Save failed", "error");
          } finally {
            setSaving(false);
          }
        }
        async function handleReset() {
          setSaving(true);
          try {
            await adminResetRenewal({ data: { username: user.username } });
            addLog(admin, "mining:renewal", `Reset mining session for ${user.username}`);
            onUpdate({ ...user, miningExpiresAt: null, miningRenewedAt: null });
            showMsg(`Mining session reset for ${user.username}`);
          } catch {
            showMsg("Save failed", "error");
          } finally {
            setSaving(false);
          }
        }
        return /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("div", { className: "rounded-xl border border-white/8 bg-white/2 divide-y divide-white/5", children: [
            {
              label: "Mining Status",
              value: isActive ? "✅ Active" : "❌ Expired",
              color: isActive ? "text-green-400" : "text-red-400"
            },
            {
              label: "Time Remaining",
              value: isActive ? `${hLeft}h ${mLeft}m` : "—",
              color: isActive ? "text-[#00BFFF]" : "text-gray-600"
            },
            {
              label: "Expiration Time",
              value: expiresAt ? new Date(expiresAt).toLocaleString() : "Never set",
              color: "text-gray-300"
            },
            {
              label: "Last Renewal",
              value: user.miningRenewedAt ? new Date(user.miningRenewedAt).toLocaleString() : "Never",
              color: "text-gray-300"
            }
          ].map((row) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-4 py-2.5", children: [
            /* @__PURE__ */ jsx("span", { className: "text-gray-600 text-[11px]", children: row.label }),
            /* @__PURE__ */ jsx("span", { className: `text-[11px] font-semibold ${row.color}`, children: row.value })
          ] }, row.label)) }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx("p", { className: "text-white text-xs font-bold", children: "⏱ Session Control" }),
            /* @__PURE__ */ jsx(
              "button",
              {
                disabled: saving,
                onClick: handleAdminRenew,
                className: "w-full px-4 py-2.5 rounded-xl text-sm font-semibold text-[#00BFFF] border border-[#00BFFF]/20 bg-[#00BFFF]/8 hover:bg-[#00BFFF]/15 transition-all disabled:opacity-40",
                children: "⟳ Renew (Full 12 h)"
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                disabled: saving,
                onClick: handleReset,
                className: "w-full px-4 py-2.5 rounded-xl text-sm font-semibold text-red-400 border border-red-500/20 bg-red-500/8 hover:bg-red-500/15 transition-all disabled:opacity-40",
                children: "✕ Reset / Expire Now"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx("p", { className: "text-white text-xs font-bold", children: "⏩ Adjust Time" }),
            /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "number",
                  min: "1",
                  step: "any",
                  value: adjustMin,
                  onChange: (e) => setAdjustMin(e.target.value),
                  placeholder: "Minutes",
                  className: "flex-1 bg-white/3 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#00BFFF]/40 placeholder-gray-700"
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  disabled: saving,
                  onClick: () => handleAdjust(1),
                  className: "px-4 py-2.5 rounded-xl text-sm font-semibold text-green-400 border border-green-500/20 bg-green-500/8 hover:bg-green-500/15 transition-all disabled:opacity-40",
                  children: "+ Extend"
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  disabled: saving,
                  onClick: () => handleAdjust(-1),
                  className: "px-4 py-2.5 rounded-xl text-sm font-semibold text-red-400 border border-red-500/20 bg-red-500/8 hover:bg-red-500/15 transition-all disabled:opacity-40",
                  children: "− Reduce"
                }
              )
            ] })
          ] })
        ] });
      })()
    ] })
  ] });
}
function MiningManager({ admin }) {
  const [users, setUsers] = useState({});
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("balance");
  const [loading, setLoading] = useState(true);
  const [sseOk, setSseOk] = useState(false);
  const [lastSync, setLastSync2] = useState(null);
  const [toast, setToast] = useState(null);
  const [page, setPage] = useState(1);
  const pollRef = useRef(null);
  function showMsg(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3e3);
  }
  const fetchUsers = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    try {
      const data = await getAllMiningUsers();
      setUsers(data);
      setLastSync2(Date.now());
    } catch {
      if (!quiet) showMsg("Failed to load mining data from server", "error");
    } finally {
      if (!quiet) setLoading(false);
    }
  }, []);
  useEffect(() => {
    let es = null;
    let reconnectTimer = null;
    let active = true;
    function connect() {
      if (!active) return;
      es = new EventSource("/api/mining-events");
      es.addEventListener("mining_updated", () => {
        fetchUsers(true);
      });
      es.onopen = () => setSseOk(true);
      es.onerror = () => {
        setSseOk(false);
        es?.close();
        es = null;
        if (active) reconnectTimer = setTimeout(connect, 5e3);
      };
    }
    connect();
    return () => {
      active = false;
      setSseOk(false);
      if (reconnectTimer) clearTimeout(reconnectTimer);
      es?.close();
    };
  }, [fetchUsers]);
  useEffect(() => {
    fetchUsers();
    pollRef.current = setInterval(() => fetchUsers(true), 5e3);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [fetchUsers]);
  const selectedUser = selected ? users[selected] ?? null : null;
  function handleUpdate(updated) {
    setUsers((prev) => ({ ...prev, [updated.username.toLowerCase()]: updated }));
    showMsg(`${updated.username} updated`);
  }
  const userList = useMemo(() => Object.values(users), [users]);
  const stats = useMemo(() => {
    const totalBC = userList.reduce((s, u) => s + u.balance, 0);
    const totalGems = userList.reduce((s, u) => s + (u.gems ?? 0), 0);
    const activeMiners = userList.filter((u) => u.rigs.some((r) => r.status === "mining")).length;
    const totalRigs = userList.reduce((s, u) => s + u.rigs.length, 0);
    const activeRigs = userList.reduce((s, u) => s + u.rigs.filter((r) => r.status === "mining").length, 0);
    const totalRate = userList.reduce((s, u) => s + activeHashrate(u), 0);
    const tierCounts = {};
    for (const u of userList) {
      for (const r of u.rigs) {
        tierCounts[r.tierId] = (tierCounts[r.tierId] ?? 0) + 1;
      }
    }
    return { totalBC, totalGems, activeMiners, totalRigs, activeRigs, totalRate, tierCounts };
  }, [userList]);
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return userList.filter((u) => !q || u.username.toLowerCase().includes(q)).sort((a, b) => {
      if (sortBy === "balance") return b.balance - a.balance;
      if (sortBy === "gems") return (b.gems ?? 0) - (a.gems ?? 0);
      if (sortBy === "rigs") return b.rigs.length - a.rigs.length;
      if (sortBy === "rate") return activeHashrate(b) - activeHashrate(a);
      if (sortBy === "active") return b.lastCheckedAt - a.lastCheckedAt;
      return 0;
    });
  }, [userList, search, sortBy]);
  useEffect(() => {
    setPage(1);
  }, [search, sortBy]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE$2));
  const safePage = Math.min(page, totalPages);
  const pagedFiltered = filtered.slice((safePage - 1) * PAGE_SIZE$2, safePage * PAGE_SIZE$2);
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    toast && /* @__PURE__ */ jsx(Toast$2, { msg: toast.msg, type: toast.type }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/2 border border-white/5 text-[11px]", children: [
      /* @__PURE__ */ jsx("span", { className: `w-2 h-2 rounded-full shrink-0 ${sseOk ? "bg-green-400 animate-pulse" : "bg-amber-400"}` }),
      /* @__PURE__ */ jsx("span", { className: sseOk ? "text-green-400" : "text-amber-400", children: sseOk ? "Live — receiving real-time updates" : "Polling (SSE reconnecting…)" }),
      /* @__PURE__ */ jsx("span", { className: "text-gray-700 ml-auto", children: lastSync ? `Synced ${timeAgo$6(lastSync)}` : "Loading…" }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => fetchUsers(),
          className: "px-2.5 py-1 rounded-lg text-gray-500 border border-white/8 hover:border-white/15 hover:text-gray-300 transition-all",
          children: "↻ Refresh"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3", children: [
      /* @__PURE__ */ jsx(StatCard$2, { label: "Total Players", value: userList.length.toString(), color: "text-white" }),
      /* @__PURE__ */ jsx(
        StatCard$2,
        {
          label: "Active Miners",
          value: stats.activeMiners.toString(),
          color: "text-green-400",
          sub: `of ${userList.length} players`
        }
      ),
      /* @__PURE__ */ jsx(
        StatCard$2,
        {
          label: "Total BlueCoin",
          value: Math.floor(stats.totalBC).toLocaleString(),
          color: "text-amber-400",
          sub: "BC in circulation"
        }
      ),
      /* @__PURE__ */ jsx(
        StatCard$2,
        {
          label: "Total Gems",
          value: Math.floor(stats.totalGems).toLocaleString(),
          color: "text-purple-400",
          sub: "gems in circulation"
        }
      ),
      /* @__PURE__ */ jsx(
        StatCard$2,
        {
          label: "Network Rate",
          value: stats.totalRate > 0 ? `${stats.totalRate} MH/s` : "—",
          color: "text-[#00BFFF]",
          sub: `${stats.activeRigs} rigs active`
        }
      ),
      /* @__PURE__ */ jsx(
        StatCard$2,
        {
          label: "Total Rigs",
          value: stats.totalRigs.toString(),
          color: "text-white",
          sub: `${stats.activeRigs} mining`
        }
      )
    ] }),
    stats.totalRigs > 0 && /* @__PURE__ */ jsxs("div", { className: "glass rounded-xl border border-white/8 px-5 py-4", children: [
      /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-[10px] uppercase tracking-widest mb-3", children: "Rig Tier Distribution" }),
      /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-3", children: RIG_TIERS.map((t) => {
        const count = stats.tierCounts[t.id] ?? 0;
        if (count === 0) return null;
        return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-base", children: t.emoji }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-white text-xs font-semibold", children: t.name }),
            /* @__PURE__ */ jsxs("p", { className: "text-gray-600 text-[10px]", children: [
              count,
              " owned · ",
              t.hashrate,
              " MH/s each"
            ] })
          ] })
        ] }, t.id);
      }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "glass rounded-2xl border border-white/8 overflow-hidden", children: [
      /* @__PURE__ */ jsxs("div", { className: "px-5 py-4 border-b border-white/5 flex items-center gap-3 flex-wrap", children: [
        /* @__PURE__ */ jsxs("h3", { className: "font-['Space_Grotesk'] font-bold text-white text-sm", children: [
          "Players (",
          filtered.length,
          search ? ` of ${userList.length}` : "",
          ")"
        ] }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            value: search,
            onChange: (e) => setSearch(e.target.value),
            placeholder: "Search players…",
            className: "ml-auto bg-white/3 border border-white/10 rounded-xl px-3 py-1.5 text-white text-xs outline-none focus:border-[#00BFFF]/40 placeholder-gray-700 w-44"
          }
        ),
        /* @__PURE__ */ jsxs(
          "select",
          {
            value: sortBy,
            onChange: (e) => setSortBy(e.target.value),
            className: "bg-white/3 border border-white/10 rounded-xl px-3 py-1.5 text-white text-xs outline-none focus:border-[#00BFFF]/40",
            children: [
              /* @__PURE__ */ jsx("option", { value: "balance", className: "bg-[#0B0F17]", children: "Sort: BlueCoin" }),
              /* @__PURE__ */ jsx("option", { value: "gems", className: "bg-[#0B0F17]", children: "Sort: Gems" }),
              /* @__PURE__ */ jsx("option", { value: "rigs", className: "bg-[#0B0F17]", children: "Sort: Rigs" }),
              /* @__PURE__ */ jsx("option", { value: "rate", className: "bg-[#0B0F17]", children: "Sort: Hashrate" }),
              /* @__PURE__ */ jsx("option", { value: "active", className: "bg-[#0B0F17]", children: "Sort: Last Active" })
            ]
          }
        )
      ] }),
      loading ? /* @__PURE__ */ jsx("div", { className: "py-16 text-center text-gray-600 text-sm animate-pulse", children: "Loading mining data…" }) : filtered.length === 0 ? /* @__PURE__ */ jsx("div", { className: "py-16 text-center text-gray-700 text-sm", children: search ? "No players match your search." : "No mining players registered yet." }) : /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-x-4 px-5 py-2 text-[9px] uppercase tracking-widest text-gray-700 border-b border-white/3", children: [
          /* @__PURE__ */ jsx("span", { children: "Player" }),
          /* @__PURE__ */ jsx("span", { className: "text-right", children: "BlueCoin" }),
          /* @__PURE__ */ jsx("span", { className: "text-right", children: "Gems" }),
          /* @__PURE__ */ jsx("span", { className: "text-right", children: "Rigs" }),
          /* @__PURE__ */ jsx("span", { className: "text-right hidden sm:block", children: "Rate" }),
          /* @__PURE__ */ jsx("span", { className: "text-right", children: "Status" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "divide-y divide-white/3", children: pagedFiltered.map((u) => {
          const st = userStatus(u);
          const rate = activeHashrate(u);
          const isSelected = selected === u.username.toLowerCase();
          return /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setSelected(isSelected ? null : u.username.toLowerCase()),
              className: `w-full grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-x-4 px-5 py-3 text-left hover:bg-white/2 transition-colors items-center ${isSelected ? "bg-[#00BFFF]/5 border-l-2 border-[#00BFFF]" : ""}`,
              children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2.5 min-w-0", children: [
                  /* @__PURE__ */ jsx("div", { className: "w-7 h-7 rounded-lg bg-[#00BFFF]/10 border border-[#00BFFF]/20 flex items-center justify-center text-xs font-black text-[#00BFFF] shrink-0", children: u.username[0].toUpperCase() }),
                  /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
                    /* @__PURE__ */ jsx("p", { className: "text-white text-xs font-semibold truncate", children: u.username }),
                    /* @__PURE__ */ jsx("p", { className: "text-gray-700 text-[10px]", children: timeAgo$6(u.lastCheckedAt) })
                  ] })
                ] }),
                /* @__PURE__ */ jsx("span", { className: "text-amber-400 text-xs font-bold text-right tabular-nums", children: Math.floor(u.balance).toLocaleString() }),
                /* @__PURE__ */ jsx("span", { className: "text-purple-400 text-xs font-bold text-right tabular-nums", children: Math.floor(u.gems ?? 0).toLocaleString() }),
                /* @__PURE__ */ jsxs("span", { className: "text-[#00BFFF] text-xs font-bold text-right tabular-nums", children: [
                  u.rigs.filter((r) => r.status === "mining").length,
                  "/",
                  u.rigs.length
                ] }),
                /* @__PURE__ */ jsx("span", { className: "text-green-400 text-xs font-bold text-right tabular-nums hidden sm:block", children: rate > 0 ? `${rate}` : "—" }),
                /* @__PURE__ */ jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsx(StatusBadge$1, { status: st }) })
              ]
            },
            u.username
          );
        }) })
      ] })
    ] }),
    /* @__PURE__ */ jsx(
      AdminPaginator,
      {
        page: safePage,
        totalPages,
        totalItems: filtered.length,
        pageSize: PAGE_SIZE$2,
        onPageChange: setPage
      }
    ),
    selectedUser && /* @__PURE__ */ jsx(
      UserDetailPanel,
      {
        user: selectedUser,
        admin,
        onUpdate: handleUpdate,
        onClose: () => setSelected(null)
      }
    )
  ] });
}
const FIELDS = [
  // Exchange
  { key: "BASE_RATE", label: "Base Rate", defaultVal: EXCHANGE_CONSTANTS.BASE_RATE, min: 1, max: 1e4, step: 1, unit: "Gems/BC", desc: "Centre-point of the exchange rate wave", section: "exchange" },
  { key: "MIN_RATE", label: "Min Rate", defaultVal: EXCHANGE_CONSTANTS.MIN_RATE, min: 1, max: 9999, step: 1, unit: "Gems/BC", desc: "Minimum rate the wave can reach", section: "exchange" },
  { key: "MAX_RATE", label: "Max Rate", defaultVal: EXCHANGE_CONSTANTS.MAX_RATE, min: 2, max: 1e4, step: 1, unit: "Gems/BC", desc: "Maximum rate the wave can reach", section: "exchange" },
  { key: "DAILY_TX_LIMIT", label: "Daily TX Limit", defaultVal: EXCHANGE_CONSTANTS.DAILY_TX_LIMIT, min: 1, max: 100, step: 1, unit: "trades/day", desc: "Exchange transactions allowed per day", section: "exchange" },
  { key: "FEE_PCT", label: "Exchange Fee", defaultVal: EXCHANGE_CONSTANTS.FEE_PCT, min: 0, max: 0.5, step: 1e-3, unit: "% (0-1)", desc: "Fee taken from each exchange output", section: "exchange" },
  // Mining
  { key: "BLOCK_REWARD", label: "Block Reward", defaultVal: MINING_CONSTANTS.BLOCK_REWARD, min: 1, max: 1e5, step: 1, unit: "BC", desc: "BC distributed when a block is solved", section: "mining" },
  { key: "BLOCK_INTERVAL_MS", label: "Block Interval", defaultVal: MINING_CONSTANTS.BLOCK_INTERVAL_MS, min: 5e3, max: 36e5, step: 1e3, unit: "ms", desc: "Time between block solutions", section: "mining" },
  { key: "FINDER_BONUS_PCT", label: "Finder Bonus", defaultVal: MINING_CONSTANTS.FINDER_BONUS_PCT, min: 0, max: 1, step: 0.01, unit: "% (0-1)", desc: "Fraction of reward for block finder", section: "mining" },
  { key: "EQUAL_SPLIT_PCT", label: "Equal Split", defaultVal: MINING_CONSTANTS.EQUAL_SPLIT_PCT, min: 0, max: 1, step: 0.01, unit: "% (0-1)", desc: "Fraction split equally among miners", section: "mining" },
  { key: "HASHRATE_SHARE_PCT", label: "Hashrate Share", defaultVal: MINING_CONSTANTS.HASHRATE_SHARE_PCT, min: 0, max: 1, step: 0.01, unit: "% (0-1)", desc: "Fraction distributed by hashrate", section: "mining" },
  { key: "STARTING_BALANCE", label: "Starting Balance", defaultVal: MINING_CONSTANTS.STARTING_BALANCE, min: 0, max: 1e5, step: 1, unit: "BC", desc: "BC given to new users on signup", section: "mining" }
];
function AdminToast$2({ msg, type }) {
  return /* @__PURE__ */ jsxs("div", { className: `fixed top-6 right-6 z-50 px-5 py-3 rounded-xl text-sm font-semibold shadow-xl border ${type === "success" ? "bg-green-500/15 border-green-500/30 text-green-400" : "bg-red-500/15 border-red-500/30 text-red-400"}`, children: [
    type === "success" ? "✓ " : "⚠ ",
    msg
  ] });
}
function EconomyManager({ admin }) {
  const [overrides, setOverrides] = useState(getEconomyOverrides);
  const [toast, setToast] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  function showToastMsg(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3e3);
  }
  function getValue(key, def) {
    const v = overrides[key];
    return v !== void 0 ? v : def;
  }
  function handleChange(key, val) {
    const num = parseFloat(val);
    setOverrides((prev) => ({ ...prev, [key]: isNaN(num) ? void 0 : num }));
  }
  function handleSave() {
    const fin = overrides.FINDER_BONUS_PCT ?? MINING_CONSTANTS.FINDER_BONUS_PCT;
    const eq = overrides.EQUAL_SPLIT_PCT ?? MINING_CONSTANTS.EQUAL_SPLIT_PCT;
    const hr = overrides.HASHRATE_SHARE_PCT ?? MINING_CONSTANTS.HASHRATE_SHARE_PCT;
    const sum = fin + eq + hr;
    if (Math.abs(sum - 1) > 0.01) {
      showToastMsg(`Finder + Equal + Hashrate must sum to ~1.0 (currently ${sum.toFixed(2)})`, "error");
      return;
    }
    saveEconomyOverrides(overrides);
    addLog(admin, "economy:save", `Saved ${Object.keys(overrides).filter((k) => overrides[k] !== void 0).length} overrides`);
    showToastMsg("Economy settings saved. Takes effect immediately.");
  }
  function handleReset() {
    saveEconomyOverrides({});
    setOverrides({});
    setShowConfirm(false);
    addLog(admin, "economy:reset", "Reset all economy overrides to defaults");
    showToastMsg("Economy reset to defaults.");
  }
  const sections = ["exchange", "mining"];
  const hasOverrides = Object.values(overrides).some((v) => v !== void 0);
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6 max-w-3xl", children: [
    toast && /* @__PURE__ */ jsx(AdminToast$2, { msg: toast.msg, type: toast.type }),
    hasOverrides && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 px-4 py-3 rounded-xl bg-orange-500/8 border border-orange-500/20 text-orange-400 text-sm", children: [
      /* @__PURE__ */ jsx("span", { children: "⚠" }),
      /* @__PURE__ */ jsx("span", { children: "Economy overrides are active. Default values are shown in grey." })
    ] }),
    sections.map((sec) => /* @__PURE__ */ jsxs("div", { className: "glass rounded-2xl border border-white/8 p-6 space-y-5", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-['Space_Grotesk'] font-bold text-white text-base capitalize", children: sec === "exchange" ? "💱 Exchange Settings" : "⛏️ Mining Settings" }),
      /* @__PURE__ */ jsx("div", { className: "grid gap-5", children: FIELDS.filter((f) => f.section === sec).map((field) => {
        const isOverridden = overrides[field.key] !== void 0;
        const current = getValue(field.key, field.defaultVal);
        return /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-[1fr_180px] gap-2 items-start", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx("label", { className: "text-white text-sm font-semibold", children: field.label }),
              isOverridden && /* @__PURE__ */ jsx("span", { className: "text-[10px] bg-orange-500/15 text-orange-400 border border-orange-500/20 px-1.5 py-0.5 rounded-full", children: "override" })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-xs mt-0.5", children: field.desc }),
            /* @__PURE__ */ jsxs("p", { className: "text-gray-700 text-[10px] mt-0.5", children: [
              "Default: ",
              field.defaultVal,
              " ",
              field.unit
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "number",
                value: current,
                min: field.min,
                max: field.max,
                step: field.step,
                onChange: (e) => handleChange(field.key, e.target.value),
                className: `flex-1 bg-white/3 border rounded-xl px-3 py-2 text-sm outline-none transition-all ${isOverridden ? "border-orange-500/30 text-orange-300 focus:border-orange-500/60" : "border-white/10 text-white focus:border-[#00BFFF]/40"}`
              }
            ),
            /* @__PURE__ */ jsx("span", { className: "text-gray-600 text-xs shrink-0 w-12", children: field.unit })
          ] })
        ] }, field.key);
      }) })
    ] }, sec)),
    /* @__PURE__ */ jsxs("div", { className: "px-4 py-3 rounded-xl bg-blue-500/5 border border-blue-500/15 text-xs text-gray-500", children: [
      /* @__PURE__ */ jsx("strong", { className: "text-gray-400", children: "Note:" }),
      " Finder Bonus + Equal Split + Hashrate Share must sum to 1.0. Current sum: ",
      /* @__PURE__ */ jsx("strong", { className: Math.abs(
        (overrides.FINDER_BONUS_PCT ?? MINING_CONSTANTS.FINDER_BONUS_PCT) + (overrides.EQUAL_SPLIT_PCT ?? MINING_CONSTANTS.EQUAL_SPLIT_PCT) + (overrides.HASHRATE_SHARE_PCT ?? MINING_CONSTANTS.HASHRATE_SHARE_PCT) - 1
      ) < 0.01 ? "text-green-400" : "text-red-400", children: ((overrides.FINDER_BONUS_PCT ?? MINING_CONSTANTS.FINDER_BONUS_PCT) + (overrides.EQUAL_SPLIT_PCT ?? MINING_CONSTANTS.EQUAL_SPLIT_PCT) + (overrides.HASHRATE_SHARE_PCT ?? MINING_CONSTANTS.HASHRATE_SHARE_PCT)).toFixed(2) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-3", children: [
      /* @__PURE__ */ jsx("button", { onClick: handleSave, className: "btn-primary px-6 py-2.5 rounded-xl text-sm font-semibold text-white", children: "Save Changes" }),
      /* @__PURE__ */ jsx("button", { onClick: () => setShowConfirm(true), className: "px-6 py-2.5 rounded-xl text-sm text-gray-400 border border-white/10 hover:border-white/20 hover:text-white transition-all", children: "Reset to Defaults" })
    ] }),
    showConfirm && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm", children: /* @__PURE__ */ jsxs("div", { className: "glass rounded-2xl border border-orange-500/20 p-6 max-w-sm w-full text-center", children: [
      /* @__PURE__ */ jsx("div", { className: "text-4xl mb-3", children: "⚙️" }),
      /* @__PURE__ */ jsx("h3", { className: "text-white font-bold text-lg mb-2", children: "Reset Economy?" }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-500 text-sm mb-6", children: "All custom economy values will revert to their coded defaults." }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
        /* @__PURE__ */ jsx("button", { onClick: () => setShowConfirm(false), className: "flex-1 py-2.5 rounded-xl text-sm text-gray-400 border border-white/10 hover:bg-white/5", children: "Cancel" }),
        /* @__PURE__ */ jsx("button", { onClick: handleReset, className: "flex-1 py-2.5 rounded-xl text-sm font-semibold text-orange-400 border border-orange-500/30 bg-orange-500/10 hover:bg-orange-500/20", children: "Reset" })
      ] })
    ] }) })
  ] });
}
const PAGE_SIZE$1 = 10;
const RANK_KEYS = ["mace", "sword", "axe", "uhc", "nethpot", "diapot", "crystal"];
const RANK_VALUES = ["HT5", "LT5", "HT4", "LT4", "HT3", "LT3", "HT2", "LT2", "HT1", "LT1", "NONE"];
const REGION_LIST = [...REGIONS];
const REGION_SHORT = {
  "North America": "NA",
  "South America": "SA",
  Europe: "EU",
  Asia: "AS",
  Oceania: "OC",
  Africa: "AF",
  "Middle East": "ME"
};
function timeAgo$5(ts) {
  if (!ts) return "—";
  const d = Date.now() - ts;
  if (d < 6e4) return "Just now";
  if (d < 36e5) return `${Math.floor(d / 6e4)}m ago`;
  if (d < 864e5) return `${Math.floor(d / 36e5)}h ago`;
  if (d < 30 * 864e5) return `${Math.floor(d / 864e5)}d ago`;
  return new Date(ts).toLocaleDateString();
}
function rankColor(rank) {
  if (!rank || rank === "NONE") return "";
  if (rank.includes("5")) return "text-amber-400 border-amber-500/30 bg-amber-500/8";
  if (rank.includes("4")) return "text-[#00BFFF] border-[#00BFFF]/30 bg-[#00BFFF]/8";
  if (rank.includes("3")) return "text-green-400 border-green-500/30 bg-green-500/8";
  if (rank.includes("2")) return "text-purple-400 border-purple-500/30 bg-purple-500/8";
  return "text-gray-400 border-white/10 bg-white/5";
}
function sortUsers(users, key, asc) {
  return [...users].sort((a, b) => {
    let cmp = 0;
    switch (key) {
      case "username":
        cmp = a.username.localeCompare(b.username);
        break;
      case "balance":
        cmp = a.balance - b.balance;
        break;
      case "gems":
        cmp = a.gems - b.gems;
        break;
      case "rigs":
        cmp = a.activeRigs - b.activeRigs;
        break;
      case "joinDate":
        cmp = (a.joinDate ?? 0) - (b.joinDate ?? 0);
        break;
      case "lastSeen":
        cmp = (a.lastSeen ?? 0) - (b.lastSeen ?? 0);
        break;
      case "topRank": {
        const ORDER = ["HT5", "LT5", "HT4", "LT4", "HT3", "LT3", "HT2", "LT2", "HT1", "LT1"];
        const ai = a.topRank ? ORDER.indexOf(a.topRank) : 99;
        const bi = b.topRank ? ORDER.indexOf(b.topRank) : 99;
        cmp = ai - bi;
        break;
      }
    }
    return asc ? cmp : -cmp;
  });
}
function RankBadge({ rank }) {
  if (!rank || rank === "NONE") return /* @__PURE__ */ jsx("span", { className: "text-gray-700 text-xs", children: "—" });
  return /* @__PURE__ */ jsx("span", { className: `px-1.5 py-0.5 rounded text-[10px] font-bold border ${rankColor(rank)}`, children: rank });
}
function SourcePips({ hasCred, hasPlayer, hasMining }) {
  return /* @__PURE__ */ jsxs("div", { className: "flex gap-1", title: `Login:${hasCred} Profile:${hasPlayer} Mining:${hasMining}`, children: [
    /* @__PURE__ */ jsx("span", { className: `text-[11px] leading-none transition-opacity ${hasCred ? "opacity-100" : "opacity-15"}`, title: "Login account", children: "🔑" }),
    /* @__PURE__ */ jsx("span", { className: `text-[11px] leading-none transition-opacity ${hasPlayer ? "opacity-100" : "opacity-15"}`, title: "Player profile", children: "📋" }),
    /* @__PURE__ */ jsx("span", { className: `text-[11px] leading-none transition-opacity ${hasMining ? "opacity-100" : "opacity-15"}`, title: "Mining account", children: "⛏" })
  ] });
}
function Avatar({ username, avatar, size = 32 }) {
  const [err, setErr] = useState(false);
  const url = !err && avatar ? avatar : null;
  if (url) {
    return /* @__PURE__ */ jsx(
      "img",
      {
        src: url,
        alt: username,
        onError: () => setErr(true),
        className: "rounded-lg object-cover shrink-0",
        style: { width: size, height: size }
      }
    );
  }
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: "rounded-lg bg-[#00BFFF]/10 border border-[#00BFFF]/20 flex items-center justify-center shrink-0 font-bold text-[#00BFFF]",
      style: { width: size, height: size, fontSize: size * 0.38 },
      children: username[0]?.toUpperCase() ?? "?"
    }
  );
}
function Toast$1({ msg, type }) {
  const cls = type === "success" ? "bg-green-500/15 border-green-500/30 text-green-400" : type === "error" ? "bg-red-500/15 border-red-500/30 text-red-400" : "bg-[#00BFFF]/12 border-[#00BFFF]/30 text-[#00BFFF]";
  return /* @__PURE__ */ jsxs("div", { className: `fixed top-6 right-6 z-50 px-5 py-3 rounded-xl text-sm font-semibold shadow-xl border ${cls} max-w-xs`, children: [
    type === "success" ? "✓ " : type === "error" ? "⚠ " : "ℹ ",
    msg
  ] });
}
function SortBtn({ label, k, cur, asc, onClick }) {
  const active = cur === k;
  return /* @__PURE__ */ jsxs("button", { onClick, className: `text-left hover:text-gray-300 transition-colors uppercase tracking-widest text-[10px] flex items-center gap-1 ${active ? "text-[#00BFFF]" : "text-gray-600"}`, children: [
    label,
    active ? /* @__PURE__ */ jsx("span", { children: asc ? "↑" : "↓" }) : /* @__PURE__ */ jsx("span", { className: "text-gray-800", children: "↕" })
  ] });
}
function Spinner() {
  return /* @__PURE__ */ jsx("div", { className: "w-4 h-4 border-2 border-white/10 border-t-[#00BFFF] rounded-full animate-spin" });
}
function StatCard$1({ icon, value, label, sub }) {
  return /* @__PURE__ */ jsxs("div", { className: "glass rounded-xl border border-white/8 px-5 py-4 flex items-center gap-4", children: [
    /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-xl bg-[#00BFFF]/8 border border-[#00BFFF]/15 flex items-center justify-center text-xl shrink-0", children: icon }),
    /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
      /* @__PURE__ */ jsx("p", { className: "text-white font-['Space_Grotesk'] font-bold text-xl leading-tight", children: typeof value === "number" ? value.toLocaleString() : value }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-500 text-xs", children: label }),
      sub && /* @__PURE__ */ jsx("p", { className: "text-gray-700 text-[10px] mt-0.5", children: sub })
    ] })
  ] });
}
function CreateModal({ onClose, onCreated, admin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [region, setRegion] = useState("North America");
  const [startingBC, setStartingBC] = useState("0");
  const [startingGems, setStartingGems] = useState("0");
  const [addCred, setAddCred] = useState(true);
  const [addPlayer, setAddPlayer] = useState(false);
  const [addMining, setAddMining] = useState(false);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState(null);
  async function handleCreate() {
    const u = username.trim();
    if (!u) {
      setError("Username is required");
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(u)) {
      setError("Only letters, numbers, and underscores");
      return;
    }
    if (addCred && !password.trim()) {
      setError("Password is required for login accounts");
      return;
    }
    if (!addCred && !addPlayer && !addMining) {
      setError("Select at least one system to add the user to");
      return;
    }
    setWorking(true);
    setError(null);
    try {
      await adminCreateUser({
        data: {
          username: u,
          password: password.trim() || "changeme",
          role,
          addCred,
          addPlayer,
          addMining,
          region: addPlayer ? region : void 0,
          startingBC: addMining ? parseFloat(startingBC) || 0 : void 0,
          startingGems: addMining ? parseFloat(startingGems) || 0 : void 0
        }
      });
      addLog(admin, "user:create", `Created user "${u}" — cred:${addCred} player:${addPlayer} mining:${addMining}`);
      onCreated();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg.replace(/^DUPLICATE: /, "").replace(/^Error: /, ""));
    } finally {
      setWorking(false);
    }
  }
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm", onClick: (e) => e.target === e.currentTarget && onClose(), children: /* @__PURE__ */ jsxs("div", { className: "glass rounded-2xl border border-white/10 w-full max-w-lg overflow-hidden", children: [
    /* @__PURE__ */ jsxs("div", { className: "px-6 py-5 border-b border-white/5 flex items-center gap-3", children: [
      /* @__PURE__ */ jsx("div", { className: "w-9 h-9 rounded-xl bg-[#00BFFF]/10 border border-[#00BFFF]/20 flex items-center justify-center text-lg", children: "➕" }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h2", { className: "font-['Space_Grotesk'] font-bold text-white text-base", children: "Create New User" }),
        /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-xs", children: "Add a player to one or more systems" })
      ] }),
      /* @__PURE__ */ jsx("button", { onClick: onClose, className: "ml-auto text-gray-600 hover:text-white transition-colors text-xl leading-none", children: "×" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "p-6 space-y-5 overflow-y-auto max-h-[70vh]", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "text-xs text-gray-500 uppercase tracking-widest block mb-2", children: "Minecraft Username *" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            value: username,
            onChange: (e) => {
              setUsername(e.target.value);
              setError(null);
            },
            placeholder: "e.g. CoolPlayer123",
            className: "w-full bg-white/3 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#00BFFF]/40 placeholder-gray-700 transition-all"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "text-xs text-gray-500 uppercase tracking-widest block mb-3", children: "Add to Systems" }),
        /* @__PURE__ */ jsx("div", { className: "space-y-2", children: [
          { key: "cred", state: addCred, set: setAddCred, icon: "🔑", label: "Login Account", desc: "Can sign in to mine BlueCoin" },
          { key: "player", state: addPlayer, set: setAddPlayer, icon: "📋", label: "Player Profile", desc: "Appears on the public Tier List" },
          { key: "mining", state: addMining, set: setAddMining, icon: "⛏", label: "Mining Account", desc: "Has BC balance, gems, and rigs" }
        ].map((item) => /* @__PURE__ */ jsxs("label", { className: `flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all ${item.state ? "border-[#00BFFF]/30 bg-[#00BFFF]/5" : "border-white/8 hover:border-white/15"}`, children: [
          /* @__PURE__ */ jsx("input", { type: "checkbox", checked: item.state, onChange: (e) => item.set(e.target.checked), className: "sr-only" }),
          /* @__PURE__ */ jsx("div", { className: `w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${item.state ? "border-[#00BFFF] bg-[#00BFFF]" : "border-white/20"}`, children: item.state && /* @__PURE__ */ jsx("span", { className: "text-black text-xs font-black", children: "✓" }) }),
          /* @__PURE__ */ jsx("span", { className: "text-base", children: item.icon }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: `text-sm font-semibold ${item.state ? "text-white" : "text-gray-400"}`, children: item.label }),
            /* @__PURE__ */ jsx("p", { className: "text-gray-700 text-[10px]", children: item.desc })
          ] })
        ] }, item.key)) })
      ] }),
      (addCred || addPlayer || addMining) && /* @__PURE__ */ jsxs("div", { className: "space-y-4 pt-1", children: [
        addCred && /* @__PURE__ */ jsxs("div", { className: "glass rounded-xl border border-white/5 p-4 space-y-3", children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 uppercase tracking-widest", children: "🔑 Login Account Settings" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "text-xs text-gray-600 block mb-1.5", children: "Password" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                value: password,
                onChange: (e) => setPassword(e.target.value),
                placeholder: "Set a password",
                className: "w-full bg-white/3 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#00BFFF]/40 placeholder-gray-700 transition-all"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "text-xs text-gray-600 block mb-1.5", children: "Role" }),
            /* @__PURE__ */ jsxs(
              "select",
              {
                value: role,
                onChange: (e) => setRole(e.target.value),
                className: "w-full bg-[#0B0F17] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#00BFFF]/40 transition-all",
                children: [
                  /* @__PURE__ */ jsx("option", { value: "user", children: "User" }),
                  /* @__PURE__ */ jsx("option", { value: "admin", children: "Admin" })
                ]
              }
            )
          ] })
        ] }),
        addPlayer && /* @__PURE__ */ jsxs("div", { className: "glass rounded-xl border border-white/5 p-4 space-y-3", children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 uppercase tracking-widest", children: "📋 Player Profile Settings" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "text-xs text-gray-600 block mb-1.5", children: "Region" }),
            /* @__PURE__ */ jsx(
              "select",
              {
                value: region,
                onChange: (e) => setRegion(e.target.value),
                className: "w-full bg-[#0B0F17] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#00BFFF]/40 transition-all",
                children: REGION_LIST.map((r) => /* @__PURE__ */ jsx("option", { value: r, children: r }, r))
              }
            )
          ] })
        ] }),
        addMining && /* @__PURE__ */ jsxs("div", { className: "glass rounded-xl border border-white/5 p-4 space-y-3", children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 uppercase tracking-widest", children: "⛏ Mining Account Settings" }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "text-xs text-gray-600 block mb-1.5", children: "Starting BC" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "number",
                  min: "0",
                  step: "any",
                  value: startingBC,
                  onChange: (e) => setStartingBC(e.target.value),
                  className: "w-full bg-white/3 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#00BFFF]/40 transition-all"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "text-xs text-gray-600 block mb-1.5", children: "Starting Gems" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "number",
                  min: "0",
                  step: "any",
                  value: startingGems,
                  onChange: (e) => setStartingGems(e.target.value),
                  className: "w-full bg-white/3 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#00BFFF]/40 transition-all"
                }
              )
            ] })
          ] })
        ] })
      ] }),
      error && /* @__PURE__ */ jsx("p", { className: "text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3", children: error })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "px-6 py-4 border-t border-white/5 flex gap-3", children: [
      /* @__PURE__ */ jsx("button", { onClick: onClose, className: "flex-1 py-2.5 rounded-xl text-sm text-gray-400 border border-white/10 hover:bg-white/5 transition-all", children: "Cancel" }),
      /* @__PURE__ */ jsx("button", { onClick: handleCreate, disabled: working, className: "flex-1 py-2.5 rounded-xl text-sm font-semibold btn-primary text-white flex items-center justify-center gap-2 disabled:opacity-50", children: working ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(Spinner, {}),
        " Creating…"
      ] }) : "+ Create User" })
    ] })
  ] }) });
}
function CreateMiningModal({ player, onClose, onCreated, admin }) {
  const [password, setPassword] = useState("");
  const [startingBC, setStartingBC] = useState("0");
  const [startingGems, setStartingGems] = useState("0");
  const [working, setWorking] = useState(false);
  const [error, setError] = useState(null);
  async function handleCreate() {
    if (!password.trim()) {
      setError("Password is required");
      return;
    }
    setWorking(true);
    setError(null);
    try {
      await adminCreateMiningForPlayer({
        data: {
          playerName: player.username,
          password: password.trim(),
          startingBC: parseFloat(startingBC) || 0,
          startingGems: parseFloat(startingGems) || 0
        }
      });
      addLog(admin, "user:create-mining", `Created mining account for tier player "${player.username}"`);
      onCreated();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg.replace(/^DUPLICATE:\s*/, "").replace(/^Error:\s*/, ""));
    } finally {
      setWorking(false);
    }
  }
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm", onClick: (e) => e.target === e.currentTarget && onClose(), children: /* @__PURE__ */ jsxs("div", { className: "glass rounded-2xl border border-white/10 w-full max-w-md overflow-hidden", children: [
    /* @__PURE__ */ jsxs("div", { className: "px-6 py-5 border-b border-white/5 flex items-center gap-3", children: [
      /* @__PURE__ */ jsx("div", { className: "w-9 h-9 rounded-xl bg-[#00BFFF]/10 border border-[#00BFFF]/20 flex items-center justify-center text-lg", children: "⛏" }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h2", { className: "font['Space_Grotesk'] font-bold text-white text-base", children: "Create Mining Account" }),
        /* @__PURE__ */ jsxs("p", { className: "text-gray-600 text-xs", children: [
          "For tier list player ",
          /* @__PURE__ */ jsx("span", { className: "text-[#00BFFF]", children: player.username })
        ] })
      ] }),
      /* @__PURE__ */ jsx("button", { onClick: onClose, className: "ml-auto text-gray-600 hover:text-white transition-colors text-xl leading-none", children: "×" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "p-6 space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "glass rounded-xl border border-white/5 px-4 py-3 flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-[10px] uppercase tracking-widest mb-0.5", children: "Login Username" }),
          /* @__PURE__ */ jsx("p", { className: "text-white text-sm font-mono font-semibold", children: player.username })
        ] }),
        /* @__PURE__ */ jsx("span", { className: "text-[10px] text-gray-600 border border-white/8 rounded-lg px-2 py-1", children: "Fixed — matches player name" })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "text-xs text-gray-500 uppercase tracking-widest block mb-2", children: "Password *" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            value: password,
            onChange: (e) => {
              setPassword(e.target.value);
              setError(null);
            },
            placeholder: "Set a login password",
            className: "w-full bg-white/3 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#00BFFF]/40 placeholder-gray-700 transition-all"
          }
        ),
        /* @__PURE__ */ jsx("p", { className: "text-gray-700 text-[10px] mt-1", children: "The player will use this with their username to log in and mine BlueCoin. You can rename the account later from the Mining tab." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "text-xs text-gray-500 uppercase tracking-widest block mb-2", children: "Starting BC" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              min: "0",
              step: "any",
              value: startingBC,
              onChange: (e) => setStartingBC(e.target.value),
              className: "w-full bg-white/3 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#00BFFF]/40 transition-all"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "text-xs text-gray-500 uppercase tracking-widest block mb-2", children: "Starting Gems" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              min: "0",
              step: "any",
              value: startingGems,
              onChange: (e) => setStartingGems(e.target.value),
              className: "w-full bg-white/3 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#00BFFF]/40 transition-all"
            }
          )
        ] })
      ] }),
      error && /* @__PURE__ */ jsx("p", { className: "text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3", children: error })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "px-6 py-4 border-t border-white/5 flex gap-3", children: [
      /* @__PURE__ */ jsx("button", { onClick: onClose, className: "flex-1 py-2.5 rounded-xl text-sm text-gray-400 border border-white/10 hover:bg-white/5 transition-all", children: "Cancel" }),
      /* @__PURE__ */ jsx("button", { onClick: handleCreate, disabled: working, className: "flex-1 py-2.5 rounded-xl text-sm font-semibold btn-primary text-white flex items-center justify-center gap-2 disabled:opacity-50", children: working ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(Spinner, {}),
        " Creating…"
      ] }) : "⛏ Create Account" })
    ] })
  ] }) });
}
function EditModal({ user, onClose, onSaved, admin }) {
  const [tab, setTab] = useState("overview");
  const [working, setWorking] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [region, setRegion] = useState(user.region ?? "North America");
  const [head, setHead] = useState(user.avatar ?? `https://mc-heads.net/avatar/${user.username}`);
  const [ranks, setRanks] = useState(
    user.ranks ?? Object.fromEntries(RANK_KEYS.map((k) => [k, "NONE"]))
  );
  const [balance, setBalance] = useState(Math.floor(user.balance).toString());
  const [gems, setGems] = useState(Math.floor(user.gems).toString());
  const [miningUsername, setMiningUsername] = useState(user.miningKey ?? user.username);
  const [miningNewPassword, setMiningNewPassword] = useState("");
  const [credEnabled, setCredEnabled] = useState(user.credEnabled !== false);
  const [newPassword, setNewPassword] = useState("");
  const [role, setRole] = useState(user.role ?? "user");
  const [addPlayerNow, setAddPlayerNow] = useState(false);
  function showOk(msg) {
    setSuccessMsg(msg);
    setError(null);
    setTimeout(() => setSuccessMsg(null), 3e3);
  }
  async function savePlayer() {
    setWorking(true);
    setError(null);
    try {
      if (!user.hasPlayer && !addPlayerNow) {
        setAddPlayerNow(true);
        setWorking(false);
        return;
      }
      await adminUpdateUserPlayer({ data: { username: user.username, region, head, ranks, create: true } });
      addLog(admin, "user:edit", `Updated player profile for ${user.username}`);
      showOk("Player profile saved");
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setWorking(false);
    }
  }
  async function saveMining() {
    if (!user.hasMining) return;
    setWorking(true);
    setError(null);
    const miningLookup = user.miningKey ?? user.username;
    try {
      const bc = parseFloat(balance);
      const gms = parseFloat(gems);
      if (isNaN(bc) || isNaN(gms) || bc < 0 || gms < 0) throw new Error("Values must be non-negative numbers");
      await adminUpdateUserMining({ data: { username: miningLookup, balance: bc, gems: gms } });
      addLog(admin, "user:edit", `Updated mining for ${user.username}: BC=${bc}, Gems=${gms}`);
      showOk("Mining data saved");
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setWorking(false);
    }
  }
  async function saveCred() {
    setWorking(true);
    setError(null);
    try {
      if (!newPassword && role === (user.role ?? "user") && credEnabled === (user.credEnabled !== false)) {
        showOk("No changes to save");
        setWorking(false);
        return;
      }
      await adminUpdateUserCred({
        data: {
          username: user.username,
          newPassword: newPassword.trim() || void 0,
          role,
          enabled: credEnabled
        }
      });
      addLog(admin, "user:edit", `Updated credentials for ${user.username}${credEnabled !== (user.credEnabled !== false) ? ` (${credEnabled ? "enabled" : "disabled"})` : ""}`);
      showOk("Login account updated");
      setNewPassword("");
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setWorking(false);
    }
  }
  async function saveMiningUsername() {
    const newName = miningUsername.trim();
    if (!newName) {
      setError("Username cannot be empty");
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(newName)) {
      setError("Only letters, numbers, and underscores");
      return;
    }
    const currentKey = user.miningKey ?? user.username;
    if (newName.toLowerCase() === currentKey.toLowerCase()) {
      showOk("No change");
      return;
    }
    setWorking(true);
    setError(null);
    try {
      await adminRenameMiningUser({ data: { currentUsername: currentKey, newUsername: newName } });
      addLog(admin, "user:edit", `Renamed mining user "${currentKey}" → "${newName}"`);
      showOk("Username updated — player profile renamed too if one existed");
      onSaved();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg.replace(/^DUPLICATE:\s*/, "").replace(/^Error:\s*/, ""));
    } finally {
      setWorking(false);
    }
  }
  async function saveMiningPassword() {
    const pw = miningNewPassword.trim();
    if (!pw) {
      setError("Password cannot be empty");
      return;
    }
    setWorking(true);
    setError(null);
    const credLookup = user.miningKey ?? user.username;
    try {
      await adminUpdateUserCred({ data: { username: credLookup, newPassword: pw } });
      addLog(admin, "user:edit", `Reset password for mining account ${user.username}`);
      showOk("Password updated");
      setMiningNewPassword("");
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setWorking(false);
    }
  }
  async function toggleMiningEnabled() {
    const newState = !credEnabled;
    const credLookup = user.miningKey ?? user.username;
    setWorking(true);
    setError(null);
    try {
      await adminUpdateUserCred({ data: { username: credLookup, enabled: newState } });
      setCredEnabled(newState);
      addLog(admin, "user:edit", `${newState ? "Enabled" : "Disabled"} mining account for ${user.username}`);
      showOk(newState ? "Account enabled" : "Account disabled");
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setWorking(false);
    }
  }
  const TABS = [
    { id: "overview", icon: "👤", label: "Overview" },
    { id: "player", icon: "📋", label: "Profile" },
    { id: "mining", icon: "⛏", label: "Mining" },
    { id: "login", icon: "🔑", label: "Login", show: user.hasCred }
  ];
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm", onClick: (e) => e.target === e.currentTarget && onClose(), children: /* @__PURE__ */ jsxs("div", { className: "glass rounded-2xl border border-white/10 w-full max-w-2xl overflow-hidden flex flex-col", style: { maxHeight: "85vh" }, children: [
    /* @__PURE__ */ jsxs("div", { className: "px-6 py-4 border-b border-white/5 flex items-center gap-3 shrink-0", children: [
      /* @__PURE__ */ jsx(Avatar, { username: user.username, avatar: user.avatar, size: 40 }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h2", { className: "font-['Space_Grotesk'] font-bold text-white text-base", children: user.username }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mt-0.5", children: [
          /* @__PURE__ */ jsx(SourcePips, { hasCred: user.hasCred, hasPlayer: user.hasPlayer, hasMining: user.hasMining }),
          user.uuid && /* @__PURE__ */ jsxs("span", { className: "text-gray-700 text-[10px] font-mono", children: [
            user.uuid.slice(0, 8),
            "…"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("button", { onClick: onClose, className: "ml-auto text-gray-600 hover:text-white transition-colors text-xl leading-none", children: "×" })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex border-b border-white/5 px-6 gap-1 shrink-0 bg-[#0B0F17]/50", children: TABS.filter((t) => t.show !== false).map((t) => /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: () => {
          setTab(t.id);
          setError(null);
          setSuccessMsg(null);
        },
        className: `px-4 py-3 text-xs font-semibold transition-all border-b-2 ${tab === t.id ? "text-[#00BFFF] border-[#00BFFF]" : "text-gray-500 border-transparent hover:text-gray-300"}`,
        children: [
          t.icon,
          " ",
          t.label
        ]
      },
      t.id
    )) }),
    /* @__PURE__ */ jsxs("div", { className: "flex-1 overflow-y-auto p-6", children: [
      successMsg && /* @__PURE__ */ jsxs("p", { className: "text-green-400 text-sm bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 mb-4", children: [
        "✓ ",
        successMsg
      ] }),
      error && /* @__PURE__ */ jsx("p", { className: "text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-4", children: error }),
      tab === "overview" && /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 gap-3", children: [
          { label: "Username", val: user.username },
          { label: "Role", val: user.role ?? "user" },
          { label: "Region", val: user.region ?? "—" },
          { label: "Top Rank", val: user.topRank ?? "—" },
          { label: "BC Balance", val: user.hasMining ? Math.floor(user.balance).toLocaleString() : "—" },
          { label: "Gems", val: user.hasMining ? Math.floor(user.gems).toLocaleString() : "—" },
          { label: "Rigs", val: user.hasMining ? `${user.activeRigs}/${user.totalRigs} active` : "—" },
          { label: "Block Rewards", val: user.hasMining ? `${user.rewardCount} blocks` : "—" },
          { label: "Joined", val: user.joinDate ? new Date(user.joinDate).toLocaleDateString() : "—" },
          { label: "Last Seen", val: timeAgo$5(user.lastSeen) },
          { label: "UUID", val: user.uuid ? user.uuid.slice(0, 18) + "…" : "—" }
        ].map((item) => /* @__PURE__ */ jsxs("div", { className: "glass rounded-xl border border-white/5 p-3", children: [
          /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-[10px] uppercase tracking-widest mb-0.5", children: item.label }),
          /* @__PURE__ */ jsx("p", { className: "text-white text-sm font-semibold break-all", children: item.val })
        ] }, item.label)) }),
        user.hasPlayer && user.ranks && /* @__PURE__ */ jsxs("div", { className: "glass rounded-xl border border-white/5 p-4", children: [
          /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-[10px] uppercase tracking-widest mb-3", children: "Tier Ranks" }),
          /* @__PURE__ */ jsx("div", { className: "grid grid-cols-3 sm:grid-cols-7 gap-2", children: RANK_KEYS.map((k) => /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
            /* @__PURE__ */ jsx("p", { className: "text-gray-700 text-[9px] uppercase mb-1", children: k }),
            /* @__PURE__ */ jsx(RankBadge, { rank: user.ranks?.[k] ?? "NONE" })
          ] }, k)) })
        ] })
      ] }),
      tab === "player" && /* @__PURE__ */ jsxs("div", { className: "space-y-5", children: [
        !user.hasPlayer && !addPlayerNow && /* @__PURE__ */ jsxs("div", { className: "text-center py-6", children: [
          /* @__PURE__ */ jsx("p", { className: "text-4xl mb-3", children: "📋" }),
          /* @__PURE__ */ jsx("p", { className: "text-white font-semibold mb-1", children: "No player profile yet" }),
          /* @__PURE__ */ jsx("p", { className: "text-gray-500 text-sm mb-4", children: "Create one to add this user to the Tier List" }),
          /* @__PURE__ */ jsx("button", { onClick: () => setAddPlayerNow(true), className: "px-5 py-2.5 rounded-xl text-sm font-semibold btn-primary text-white", children: "Create Player Profile" })
        ] }),
        (user.hasPlayer || addPlayerNow) && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "text-xs text-gray-500 uppercase tracking-widest block mb-2", children: "Head / Avatar URL" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                value: head,
                onChange: (e) => setHead(e.target.value),
                className: "w-full bg-white/3 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#00BFFF]/40 transition-all font-mono text-xs"
              }
            ),
            head && /* @__PURE__ */ jsxs("div", { className: "mt-2 flex items-center gap-2", children: [
              /* @__PURE__ */ jsx("img", { src: head, alt: "", className: "w-8 h-8 rounded-md", onError: (e) => e.currentTarget.style.display = "none" }),
              /* @__PURE__ */ jsx("span", { className: "text-gray-600 text-xs", children: "Preview" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "text-xs text-gray-500 uppercase tracking-widest block mb-2", children: "Region" }),
            /* @__PURE__ */ jsx(
              "select",
              {
                value: region,
                onChange: (e) => setRegion(e.target.value),
                className: "w-full bg-[#0B0F17] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#00BFFF]/40 transition-all",
                children: REGION_LIST.map((r) => /* @__PURE__ */ jsx("option", { value: r, children: r }, r))
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "text-xs text-gray-500 uppercase tracking-widest block mb-3", children: "Tier Ranks" }),
            /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 gap-3", children: RANK_KEYS.map((k) => /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "text-gray-600 text-xs capitalize block mb-1", children: k }),
              /* @__PURE__ */ jsx(
                "select",
                {
                  value: ranks[k] ?? "NONE",
                  onChange: (e) => setRanks((r) => ({ ...r, [k]: e.target.value })),
                  className: `w-full bg-[#0B0F17] border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#00BFFF]/40 transition-all ${rankColor(ranks[k] ?? "NONE").split(" ")[0] || "text-gray-400"}`,
                  children: RANK_VALUES.map((v) => /* @__PURE__ */ jsx("option", { value: v, children: v }, v))
                }
              )
            ] }, k)) })
          ] }),
          /* @__PURE__ */ jsx("button", { onClick: savePlayer, disabled: working, className: "w-full py-2.5 rounded-xl text-sm font-semibold btn-primary text-white flex items-center justify-center gap-2 disabled:opacity-50", children: working ? /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(Spinner, {}),
            " Saving…"
          ] }) : user.hasPlayer ? "Save Player Profile" : "Create Player Profile" })
        ] })
      ] }),
      tab === "mining" && /* @__PURE__ */ jsxs("div", { className: "space-y-5", children: [
        !user.hasMining && /* @__PURE__ */ jsxs("div", { className: "text-center py-6", children: [
          /* @__PURE__ */ jsx("p", { className: "text-4xl mb-3", children: "⛏" }),
          /* @__PURE__ */ jsx("p", { className: "text-white font-semibold mb-1", children: "No mining account yet" }),
          /* @__PURE__ */ jsx("p", { className: "text-gray-500 text-sm", children: "Use the ⛏+ button on the user row to create one." })
        ] }),
        user.hasMining && /* @__PURE__ */ jsxs(Fragment, { children: [
          user.hasMining && /* @__PURE__ */ jsxs("div", { className: "glass rounded-xl border border-white/5 p-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-3", children: [
              /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-[10px] uppercase tracking-widest", children: "Account Status" }),
              user.hasCred && /* @__PURE__ */ jsx("span", { className: `text-[11px] px-2.5 py-1 rounded-full font-semibold border ${credEnabled ? "text-green-400 border-green-500/30 bg-green-500/8" : "text-red-400 border-red-500/30 bg-red-500/8"}`, children: credEnabled ? "● Active" : "● Disabled" }),
              !user.hasCred && /* @__PURE__ */ jsx("span", { className: "text-[11px] px-2.5 py-1 rounded-full font-semibold border text-gray-500 border-white/10", children: "No Login Account" })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3", children: [
              { label: "Total Rigs", val: user.totalRigs },
              { label: "Active Rigs", val: user.activeRigs },
              { label: "Rewards", val: user.rewardCount },
              { label: "Last Seen", val: timeAgo$5(user.lastSeen) }
            ].map((s) => /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
              /* @__PURE__ */ jsx("p", { className: "text-white font-bold text-lg", children: s.val }),
              /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-[10px]", children: s.label })
            ] }, s.label)) })
          ] }),
          user.hasMining && /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "text-xs text-gray-500 uppercase tracking-widest block mb-2", children: "BlueCoin Balance" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "number",
                  min: "0",
                  step: "any",
                  value: balance,
                  onChange: (e) => setBalance(e.target.value),
                  className: "w-full bg-white/3 border border-white/10 rounded-xl px-4 py-2.5 text-amber-400 text-sm font-mono outline-none focus:border-[#00BFFF]/40 transition-all"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "text-xs text-gray-500 uppercase tracking-widest block mb-2", children: "Gems" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "number",
                  min: "0",
                  step: "any",
                  value: gems,
                  onChange: (e) => setGems(e.target.value),
                  className: "w-full bg-white/3 border border-white/10 rounded-xl px-4 py-2.5 text-purple-400 text-sm font-mono outline-none focus:border-[#00BFFF]/40 transition-all"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsx("button", { onClick: saveMining, disabled: working, className: "w-full py-2.5 rounded-xl text-sm font-semibold btn-primary text-white flex items-center justify-center gap-2 disabled:opacity-50", children: working ? /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(Spinner, {}),
            " Saving…"
          ] }) : user.hasMining ? "Save Balance & Gems" : "Create Mining Account" }),
          user.hasMining && /* @__PURE__ */ jsxs("div", { className: "border-t border-white/5 pt-5 space-y-4", children: [
            /* @__PURE__ */ jsx("p", { className: "text-gray-500 text-[10px] uppercase tracking-widest", children: "⚙ Account Management" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("label", { className: "text-xs text-gray-500 uppercase tracking-widest block mb-2", children: [
                "Mining Username",
                /* @__PURE__ */ jsx("span", { className: "ml-2 text-gray-700 normal-case tracking-normal", children: "(changes login username)" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "text",
                    value: miningUsername,
                    onChange: (e) => setMiningUsername(e.target.value),
                    className: "flex-1 bg-white/3 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#00BFFF]/40 transition-all font-mono"
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: saveMiningUsername,
                    disabled: working || miningUsername.trim().toLowerCase() === user.username.toLowerCase(),
                    className: "px-4 py-2.5 rounded-xl text-sm font-semibold text-[#00BFFF] border border-[#00BFFF]/20 hover:bg-[#00BFFF]/10 transition-all disabled:opacity-30 whitespace-nowrap",
                    children: "Rename"
                  }
                )
              ] })
            ] }),
            user.hasCred && /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "text-xs text-gray-500 uppercase tracking-widest block mb-2", children: "Reset Password" }),
              /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "text",
                    value: miningNewPassword,
                    onChange: (e) => setMiningNewPassword(e.target.value),
                    placeholder: "Enter new password…",
                    className: "flex-1 bg-white/3 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#00BFFF]/40 placeholder-gray-700 transition-all"
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: saveMiningPassword,
                    disabled: working || !miningNewPassword.trim(),
                    className: "px-4 py-2.5 rounded-xl text-sm font-semibold text-[#00BFFF] border border-[#00BFFF]/20 hover:bg-[#00BFFF]/10 transition-all disabled:opacity-30 whitespace-nowrap",
                    children: "Set"
                  }
                )
              ] })
            ] }),
            user.hasCred && /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-4 rounded-xl border border-white/8 bg-white/2", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "text-white text-sm font-semibold", children: "Account Access" }),
                /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-xs mt-0.5", children: credEnabled ? "Player can log in and mine BlueCoin." : "Login is blocked — player cannot mine." })
              ] }),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: toggleMiningEnabled,
                  disabled: working,
                  className: `px-4 py-2 rounded-xl text-sm font-semibold border transition-all disabled:opacity-50 ${credEnabled ? "text-red-400 border-red-500/30 bg-red-500/8 hover:bg-red-500/15" : "text-green-400 border-green-500/30 bg-green-500/8 hover:bg-green-500/15"}`,
                  children: working ? /* @__PURE__ */ jsx(Spinner, {}) : credEnabled ? "Disable Account" : "Enable Account"
                }
              )
            ] })
          ] })
        ] })
      ] }),
      tab === "login" && user.hasCred && /* @__PURE__ */ jsxs("div", { className: "space-y-5", children: [
        /* @__PURE__ */ jsxs("div", { className: "glass rounded-xl border border-white/5 p-4", children: [
          /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-[10px] uppercase tracking-widest mb-3", children: "Current Account Info" }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
              /* @__PURE__ */ jsx("span", { className: "text-gray-500 text-sm", children: "Username" }),
              /* @__PURE__ */ jsx("span", { className: "text-white text-sm font-mono", children: user.username })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
              /* @__PURE__ */ jsx("span", { className: "text-gray-500 text-sm", children: "Role" }),
              /* @__PURE__ */ jsx("span", { className: `text-xs px-2 py-0.5 rounded-full border ${user.role === "admin" ? "text-amber-400 border-amber-500/30 bg-amber-500/8" : "text-gray-400 border-white/10"}`, children: user.role ?? "user" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
              /* @__PURE__ */ jsx("span", { className: "text-gray-500 text-sm", children: "Status" }),
              /* @__PURE__ */ jsx("span", { className: `text-xs px-2 py-0.5 rounded-full border font-semibold ${credEnabled ? "text-green-400 border-green-500/30 bg-green-500/8" : "text-red-400 border-red-500/30 bg-red-500/8"}`, children: credEnabled ? "Active" : "Disabled" })
            ] }),
            user.uuid && /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
              /* @__PURE__ */ jsx("span", { className: "text-gray-500 text-sm", children: "UUID" }),
              /* @__PURE__ */ jsx("span", { className: "text-gray-400 text-xs font-mono", children: user.uuid })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("label", { className: "text-xs text-gray-500 uppercase tracking-widest block mb-2", children: [
            "New Password ",
            /* @__PURE__ */ jsx("span", { className: "text-gray-700", children: "(leave blank to keep current)" })
          ] }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              value: newPassword,
              onChange: (e) => setNewPassword(e.target.value),
              placeholder: "Enter new password…",
              className: "w-full bg-white/3 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#00BFFF]/40 placeholder-gray-700 transition-all"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "text-xs text-gray-500 uppercase tracking-widest block mb-2", children: "Role" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              value: role,
              onChange: (e) => setRole(e.target.value),
              className: "w-full bg-[#0B0F17] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#00BFFF]/40 transition-all",
              children: [
                /* @__PURE__ */ jsx("option", { value: "user", children: "User" }),
                /* @__PURE__ */ jsx("option", { value: "admin", children: "Admin" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-4 rounded-xl border border-white/8 bg-white/2", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-white text-sm font-semibold", children: "Account Access" }),
            /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-xs mt-0.5", children: credEnabled ? "Player can log in." : "Login is blocked for this account." })
          ] }),
          /* @__PURE__ */ jsxs("label", { className: "relative inline-flex items-center cursor-pointer", children: [
            /* @__PURE__ */ jsx("input", { type: "checkbox", checked: credEnabled, onChange: (e) => setCredEnabled(e.target.checked), className: "sr-only peer" }),
            /* @__PURE__ */ jsx("div", { className: "w-10 h-5 rounded-full border border-white/20 bg-white/5 peer-checked:bg-green-500/80 peer-checked:border-green-500/50 transition-all relative after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5" })
          ] })
        ] }),
        /* @__PURE__ */ jsx("button", { onClick: saveCred, disabled: working, className: "w-full py-2.5 rounded-xl text-sm font-semibold btn-primary text-white flex items-center justify-center gap-2 disabled:opacity-50", children: working ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(Spinner, {}),
          " Saving…"
        ] }) : "Update Login Account" })
      ] })
    ] })
  ] }) });
}
function DeleteModal({ user, onClose, onDeleted, admin }) {
  const [deleteCred, setDeleteCred] = useState(user.hasCred);
  const [deletePlayer2, setDeletePlayer] = useState(user.hasPlayer);
  const [deleteMining, setDeleteMining] = useState(user.hasMining);
  const [working, setWorking] = useState(false);
  const nothingSelected = !deleteCred && !deletePlayer2 && !deleteMining;
  async function handleDelete() {
    setWorking(true);
    try {
      const result = await adminDeleteUser({ data: { username: user.username, deleteCred, deletePlayer: deletePlayer2, deleteMining } });
      addLog(admin, "user:delete", `Deleted ${user.username}: ${result.removed.join(", ")}`);
      onDeleted();
    } catch {
    } finally {
      setWorking(false);
    }
  }
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm", onClick: (e) => e.target === e.currentTarget && onClose(), children: /* @__PURE__ */ jsxs("div", { className: "glass rounded-2xl border border-red-500/20 p-6 w-full max-w-md", children: [
    /* @__PURE__ */ jsxs("div", { className: "text-center mb-5", children: [
      /* @__PURE__ */ jsx("p", { className: "text-4xl mb-3", children: "🗑️" }),
      /* @__PURE__ */ jsxs("h3", { className: "text-white font-bold text-lg", children: [
        "Delete ",
        user.username,
        "?"
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-500 text-sm mt-1", children: "Choose which data to remove. This cannot be undone." })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "space-y-2 mb-5", children: [
      { check: deleteCred, set: setDeleteCred, has: user.hasCred, icon: "🔑", label: "Login account", desc: "Remove from credentials.yml" },
      { check: deletePlayer2, set: setDeletePlayer, has: user.hasPlayer, icon: "📋", label: "Player profile", desc: "Remove from tier list" },
      { check: deleteMining, set: setDeleteMining, has: user.hasMining, icon: "⛏", label: "Mining account", desc: "Permanently lose BC, gems & rigs" }
    ].map((item) => /* @__PURE__ */ jsxs("label", { className: `flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all ${!item.has ? "opacity-30 cursor-not-allowed" : item.check ? "border-red-500/30 bg-red-500/5" : "border-white/8 hover:border-white/15"}`, children: [
      /* @__PURE__ */ jsx("input", { type: "checkbox", checked: item.check, disabled: !item.has, onChange: (e) => item.set(e.target.checked), className: "sr-only" }),
      /* @__PURE__ */ jsx("div", { className: `w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${item.check && item.has ? "border-red-400 bg-red-400" : "border-white/20"}`, children: item.check && item.has && /* @__PURE__ */ jsx("span", { className: "text-black text-xs font-black", children: "✓" }) }),
      /* @__PURE__ */ jsx("span", { className: "text-base", children: item.icon }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: `text-sm font-semibold ${item.check ? "text-red-300" : "text-gray-400"}`, children: item.label }),
        /* @__PURE__ */ jsx("p", { className: "text-gray-700 text-[10px]", children: item.desc })
      ] })
    ] }, item.label)) }),
    /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
      /* @__PURE__ */ jsx("button", { onClick: onClose, className: "flex-1 py-2.5 rounded-xl text-sm text-gray-400 border border-white/10 hover:bg-white/5 transition-all", children: "Cancel" }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: handleDelete,
          disabled: working || nothingSelected,
          className: "flex-1 py-2.5 rounded-xl text-sm font-semibold text-red-400 border border-red-500/30 bg-red-500/10 hover:bg-red-500/15 transition-all disabled:opacity-40 flex items-center justify-center gap-2",
          children: working ? /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(Spinner, {}),
            " Deleting…"
          ] }) : "Delete Selected"
        }
      )
    ] })
  ] }) });
}
function BulkDeleteModal({ usernames, onClose, onDeleted, admin }) {
  const [deleteCred, setDeleteCred] = useState(true);
  const [deletePlayer2, setDeletePlayer] = useState(true);
  const [deleteMining, setDeleteMining] = useState(true);
  const [working, setWorking] = useState(false);
  async function handleBulkDelete() {
    setWorking(true);
    try {
      await adminBulkDeleteUsers({ data: { usernames, deleteCred, deletePlayer: deletePlayer2, deleteMining } });
      addLog(admin, "user:bulk-delete", `Bulk deleted ${usernames.length} users`);
      onDeleted();
    } catch {
    } finally {
      setWorking(false);
    }
  }
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm", onClick: (e) => e.target === e.currentTarget && onClose(), children: /* @__PURE__ */ jsxs("div", { className: "glass rounded-2xl border border-red-500/20 p-6 w-full max-w-sm", children: [
    /* @__PURE__ */ jsxs("div", { className: "text-center mb-5", children: [
      /* @__PURE__ */ jsx("p", { className: "text-4xl mb-3", children: "⚡" }),
      /* @__PURE__ */ jsxs("h3", { className: "text-white font-bold text-lg", children: [
        "Bulk Delete ",
        usernames.length,
        " Users?"
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-500 text-sm mt-1", children: "Select which data to remove from all selected users." })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "space-y-2 mb-5", children: [
      { check: deleteCred, set: setDeleteCred, icon: "🔑", label: "Login accounts" },
      { check: deletePlayer2, set: setDeletePlayer, icon: "📋", label: "Player profiles" },
      { check: deleteMining, set: setDeleteMining, icon: "⛏", label: "Mining accounts" }
    ].map((item) => /* @__PURE__ */ jsxs("label", { className: `flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer ${item.check ? "border-red-500/30 bg-red-500/5" : "border-white/8 hover:border-white/15"}`, children: [
      /* @__PURE__ */ jsx("input", { type: "checkbox", checked: item.check, onChange: (e) => item.set(e.target.checked), className: "sr-only" }),
      /* @__PURE__ */ jsx("div", { className: `w-5 h-5 rounded-md border-2 flex items-center justify-center ${item.check ? "border-red-400 bg-red-400" : "border-white/20"}`, children: item.check && /* @__PURE__ */ jsx("span", { className: "text-black text-xs font-black", children: "✓" }) }),
      /* @__PURE__ */ jsx("span", { className: "text-base", children: item.icon }),
      /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-gray-300", children: item.label })
    ] }, item.label)) }),
    /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
      /* @__PURE__ */ jsx("button", { onClick: onClose, className: "flex-1 py-2.5 rounded-xl text-sm text-gray-400 border border-white/10", children: "Cancel" }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: handleBulkDelete,
          disabled: working,
          className: "flex-1 py-2.5 rounded-xl text-sm font-semibold text-red-400 border border-red-500/30 bg-red-500/10 hover:bg-red-500/15 transition-all disabled:opacity-40 flex items-center justify-center gap-2",
          children: working ? /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(Spinner, {}),
            " Deleting…"
          ] }) : `Delete ${usernames.length} Users`
        }
      )
    ] })
  ] }) });
}
function UserManager({ admin }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sortKey, setSortKey] = useState("username");
  const [sortAsc, setSortAsc] = useState(true);
  const [selected, setSelected] = useState(/* @__PURE__ */ new Set());
  const [expanded, setExpanded] = useState(null);
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [createMiningTarget, setCreateMiningTarget] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [toast, setToast] = useState(null);
  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await adminLoadUsers();
      setUsers(list);
    } catch (e) {
      showToast("Failed to load users", "error");
    } finally {
      setLoading(false);
    }
  }, []);
  const syncPlayersStore = useCallback(async () => {
    try {
      const fresh = await loadAllData();
      if (fresh.players) savePlayers(fresh.players, { silent: true });
    } catch {
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);
  function toggleSort(key) {
    if (sortKey === key) setSortAsc((a) => !a);
    else {
      setSortKey(key);
      setSortAsc(key === "username");
    }
  }
  const displayList = useMemo(() => {
    const q = search.toLowerCase();
    let list = users.filter((u) => {
      if (q && !u.username.toLowerCase().includes(q)) return false;
      if (filter === "has-cred") return u.hasCred;
      if (filter === "has-player") return u.hasPlayer;
      if (filter === "has-mining") return u.hasMining;
      if (filter === "admin") return u.role === "admin";
      if (filter === "incomplete") return !u.hasCred || !u.hasPlayer || !u.hasMining;
      return true;
    });
    return sortUsers(list, sortKey, sortAsc);
  }, [users, search, filter, sortKey, sortAsc]);
  useEffect(() => {
    setPage(1);
  }, [search, filter, sortKey, sortAsc]);
  const totalPages = Math.max(1, Math.ceil(displayList.length / PAGE_SIZE$1));
  const safePage = Math.min(page, totalPages);
  const pagedList = displayList.slice((safePage - 1) * PAGE_SIZE$1, safePage * PAGE_SIZE$1);
  const allSelected = pagedList.length > 0 && pagedList.every((u) => selected.has(u.key));
  const someSelected = displayList.some((u) => selected.has(u.key));
  function toggleAll() {
    if (allSelected) setSelected(/* @__PURE__ */ new Set());
    else setSelected(new Set(pagedList.map((u) => u.key)));
  }
  function toggleOne(key) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }
  async function handleCreated() {
    setCreateOpen(false);
    await load();
    await syncPlayersStore();
    showToast("User created successfully");
  }
  async function handleMiningCreated() {
    setCreateMiningTarget(null);
    await load();
    await syncPlayersStore();
    showToast("Mining account created successfully");
  }
  async function handleSaved() {
    await load();
    await syncPlayersStore();
  }
  async function handleDeleted() {
    setDeleteTarget(null);
    setEditTarget(null);
    await load();
    await syncPlayersStore();
    showToast("User data removed");
  }
  async function handleBulkDeleted() {
    setBulkDeleteOpen(false);
    setSelected(/* @__PURE__ */ new Set());
    await load();
    await syncPlayersStore();
    showToast(`${selected.size} users removed`);
  }
  const totalUsers = users.length;
  const totalCreds = users.filter((u) => u.hasCred).length;
  const totalPlayers = users.filter((u) => u.hasPlayer).length;
  const totalMiners = users.filter((u) => u.hasMining).length;
  const totalBC = users.reduce((s, u) => s + u.balance, 0);
  const selectedKeys = [...selected];
  const FILTERS = [
    { key: "all", label: "All", count: users.length },
    { key: "has-cred", label: "🔑 Login", count: totalCreds },
    { key: "has-player", label: "📋 Profile", count: totalPlayers },
    { key: "has-mining", label: "⛏ Mining", count: totalMiners },
    { key: "admin", label: "👑 Admin", count: users.filter((u) => u.role === "admin").length },
    { key: "incomplete", label: "⚠ Incomplete", count: users.filter((u) => !u.hasCred || !u.hasPlayer || !u.hasMining).length }
  ];
  const COL = "grid-cols-[20px_36px_1fr_80px_80px_100px_70px_68px_88px_80px]";
  return /* @__PURE__ */ jsxs("div", { className: "space-y-5", children: [
    toast && /* @__PURE__ */ jsx(Toast$1, { msg: toast.msg, type: toast.type }),
    createOpen && /* @__PURE__ */ jsx(CreateModal, { onClose: () => setCreateOpen(false), onCreated: handleCreated, admin }),
    createMiningTarget && /* @__PURE__ */ jsx(CreateMiningModal, { player: createMiningTarget, onClose: () => setCreateMiningTarget(null), onCreated: handleMiningCreated, admin }),
    editTarget && /* @__PURE__ */ jsx(EditModal, { user: editTarget, onClose: () => setEditTarget(null), onSaved: handleSaved, admin }),
    deleteTarget && /* @__PURE__ */ jsx(DeleteModal, { user: deleteTarget, onClose: () => setDeleteTarget(null), onDeleted: handleDeleted, admin }),
    bulkDeleteOpen && /* @__PURE__ */ jsx(BulkDeleteModal, { usernames: selectedKeys, onClose: () => setBulkDeleteOpen(false), onDeleted: handleBulkDeleted, admin }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-3", children: [
      /* @__PURE__ */ jsx(StatCard$1, { icon: "👥", value: totalUsers, label: "Total Users", sub: `${totalCreds} can log in` }),
      /* @__PURE__ */ jsx(StatCard$1, { icon: "📋", value: totalPlayers, label: "Player Profiles", sub: "On the tier list" }),
      /* @__PURE__ */ jsx(StatCard$1, { icon: "⛏", value: totalMiners, label: "Mining Accounts", sub: `${Math.floor(totalBC).toLocaleString()} BC in circulation` }),
      /* @__PURE__ */ jsx(StatCard$1, { icon: "🔑", value: totalCreds, label: "Login Accounts", sub: `${users.filter((u) => u.role === "admin").length} admin(s)` })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-3 items-center", children: [
      /* @__PURE__ */ jsxs("div", { className: "relative flex-1 min-w-48", children: [
        /* @__PURE__ */ jsx("span", { className: "absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 text-sm pointer-events-none", children: "🔍" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            value: search,
            onChange: (e) => setSearch(e.target.value),
            placeholder: "Search by username…",
            className: "w-full bg-white/3 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-700 outline-none focus:border-[#00BFFF]/40 transition-all"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: load,
          disabled: loading,
          className: "px-3 py-2.5 rounded-xl text-sm text-gray-400 border border-white/10 hover:border-white/20 hover:text-white transition-all disabled:opacity-40 flex items-center gap-1.5",
          children: [
            loading ? /* @__PURE__ */ jsx(Spinner, {}) : "↻",
            " Refresh"
          ]
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setCreateOpen(true),
          className: "px-4 py-2.5 rounded-xl text-sm font-semibold btn-primary text-white flex items-center gap-2",
          children: "+ New User"
        }
      )
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: FILTERS.map((f) => /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: () => setFilter(f.key),
        className: `px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-all flex items-center gap-1.5 ${filter === f.key ? "bg-[#00BFFF]/12 border-[#00BFFF]/30 text-[#00BFFF]" : "border-white/8 text-gray-500 hover:border-white/15 hover:text-gray-300"}`,
        children: [
          f.label,
          /* @__PURE__ */ jsx("span", { className: `text-[10px] px-1.5 py-0.5 rounded-full ${filter === f.key ? "bg-[#00BFFF]/20 text-[#00BFFF]" : "bg-white/5 text-gray-600"}`, children: f.count })
        ]
      },
      f.key
    )) }),
    someSelected && /* @__PURE__ */ jsxs("div", { className: "glass rounded-xl border border-[#00BFFF]/20 bg-[#00BFFF]/5 px-5 py-3 flex items-center gap-4 flex-wrap", children: [
      /* @__PURE__ */ jsxs("span", { className: "text-[#00BFFF] text-sm font-semibold", children: [
        selected.size,
        " selected"
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-2 ml-auto", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setBulkDeleteOpen(true),
            className: "px-3 py-1.5 rounded-lg text-xs font-semibold text-red-400 border border-red-500/20 bg-red-500/8 hover:bg-red-500/15 transition-all flex items-center gap-1.5",
            children: "🗑 Delete Selected"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setSelected(/* @__PURE__ */ new Set()),
            className: "px-3 py-1.5 rounded-lg text-xs text-gray-500 border border-white/10 hover:text-white transition-all",
            children: "Clear"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "glass rounded-2xl border border-white/8 overflow-hidden", children: [
      /* @__PURE__ */ jsxs("div", { className: `grid ${COL} gap-2 px-4 py-3 border-b border-white/5 items-center`, children: [
        /* @__PURE__ */ jsxs("button", { onClick: toggleAll, className: `w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${allSelected ? "border-[#00BFFF] bg-[#00BFFF]" : "border-white/20 hover:border-white/40"}`, children: [
          allSelected && /* @__PURE__ */ jsx("span", { className: "text-black text-[8px] font-black leading-none", children: "✓" }),
          someSelected && !allSelected && /* @__PURE__ */ jsx("span", { className: "w-1.5 h-1.5 rounded-sm bg-[#00BFFF] block" })
        ] }),
        /* @__PURE__ */ jsx("div", {}),
        /* @__PURE__ */ jsx(SortBtn, { label: "Player", k: "username", cur: sortKey, asc: sortAsc, onClick: () => toggleSort("username") }),
        /* @__PURE__ */ jsx("span", { className: "text-gray-600 text-[10px] uppercase tracking-widest", children: "Sources" }),
        /* @__PURE__ */ jsx(SortBtn, { label: "Top Rank", k: "topRank", cur: sortKey, asc: sortAsc, onClick: () => toggleSort("topRank") }),
        /* @__PURE__ */ jsx(SortBtn, { label: "BC", k: "balance", cur: sortKey, asc: sortAsc, onClick: () => toggleSort("balance") }),
        /* @__PURE__ */ jsx(SortBtn, { label: "Gems", k: "gems", cur: sortKey, asc: sortAsc, onClick: () => toggleSort("gems") }),
        /* @__PURE__ */ jsx(SortBtn, { label: "Rigs", k: "rigs", cur: sortKey, asc: sortAsc, onClick: () => toggleSort("rigs") }),
        /* @__PURE__ */ jsx(SortBtn, { label: "Last Seen", k: "lastSeen", cur: sortKey, asc: sortAsc, onClick: () => toggleSort("lastSeen") }),
        /* @__PURE__ */ jsx("span", { className: "text-gray-600 text-[10px] uppercase tracking-widest text-right", children: "Actions" })
      ] }),
      loading && /* @__PURE__ */ jsxs("div", { className: "py-16 flex items-center justify-center gap-3 text-gray-600", children: [
        /* @__PURE__ */ jsx(Spinner, {}),
        " ",
        /* @__PURE__ */ jsx("span", { className: "text-sm", children: "Loading users…" })
      ] }),
      !loading && displayList.length === 0 && /* @__PURE__ */ jsxs("div", { className: "py-16 text-center", children: [
        /* @__PURE__ */ jsx("p", { className: "text-4xl mb-3", children: "🔍" }),
        /* @__PURE__ */ jsx("p", { className: "text-gray-500 text-sm", children: search || filter !== "all" ? "No users match your search." : "No users yet — create the first one." })
      ] }),
      !loading && /* @__PURE__ */ jsx("div", { className: "divide-y divide-white/4", children: pagedList.map((u) => {
        const isSelected = selected.has(u.key);
        const isExpanded = expanded === u.key;
        return /* @__PURE__ */ jsxs("div", { className: isSelected ? "bg-[#00BFFF]/4" : "", children: [
          /* @__PURE__ */ jsxs(
            "div",
            {
              className: `grid ${COL} gap-2 px-4 py-3 items-center hover:bg-white/2 transition-colors cursor-pointer`,
              onClick: () => setExpanded((prev) => prev === u.key ? null : u.key),
              children: [
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: (e) => {
                      e.stopPropagation();
                      toggleOne(u.key);
                    },
                    className: `w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all ${isSelected ? "border-[#00BFFF] bg-[#00BFFF]" : "border-white/20 hover:border-white/40"}`,
                    children: isSelected && /* @__PURE__ */ jsx("span", { className: "text-black text-[8px] font-black leading-none", children: "✓" })
                  }
                ),
                /* @__PURE__ */ jsx(Avatar, { username: u.username, avatar: u.avatar, size: 28 }),
                /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 min-w-0", children: [
                    /* @__PURE__ */ jsx("p", { className: "text-white text-sm font-semibold truncate", children: u.username }),
                    u.credEnabled === false && /* @__PURE__ */ jsx("span", { className: "shrink-0 text-[9px] px-1.5 py-0.5 rounded-full bg-red-500/15 border border-red-500/25 text-red-400 font-semibold", children: "Disabled" })
                  ] }),
                  /* @__PURE__ */ jsxs("p", { className: "text-gray-700 text-[10px] truncate", children: [
                    u.region ? REGION_SHORT[u.region] ?? u.region : "",
                    u.role === "admin" && /* @__PURE__ */ jsx("span", { className: "ml-1 text-amber-500", children: "★ admin" })
                  ] })
                ] }),
                /* @__PURE__ */ jsx(SourcePips, { hasCred: u.hasCred, hasPlayer: u.hasPlayer, hasMining: u.hasMining }),
                /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx(RankBadge, { rank: u.topRank }) }),
                u.hasMining ? /* @__PURE__ */ jsx("p", { className: "text-amber-400 text-sm font-mono text-right", children: Math.floor(u.balance).toLocaleString() }) : /* @__PURE__ */ jsx("p", { className: "text-gray-700 text-xs text-right", children: "—" }),
                u.hasMining ? /* @__PURE__ */ jsx("p", { className: "text-purple-400 text-sm font-mono text-right", children: Math.floor(u.gems).toLocaleString() }) : /* @__PURE__ */ jsx("p", { className: "text-gray-700 text-xs text-right", children: "—" }),
                u.hasMining ? /* @__PURE__ */ jsxs("p", { className: "text-[#00BFFF] text-sm text-right", children: [
                  u.activeRigs,
                  /* @__PURE__ */ jsxs("span", { className: "text-gray-600 text-xs", children: [
                    "/",
                    u.totalRigs
                  ] })
                ] }) : /* @__PURE__ */ jsx("p", { className: "text-gray-700 text-xs text-right", children: "—" }),
                /* @__PURE__ */ jsx("p", { className: "text-gray-500 text-xs text-right truncate", children: timeAgo$5(u.lastSeen) }),
                /* @__PURE__ */ jsxs("div", { className: "flex gap-1 justify-end", onClick: (e) => e.stopPropagation(), children: [
                  u.hasPlayer && !u.hasMining && /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: () => setCreateMiningTarget(u),
                      className: "p-1.5 rounded-lg text-[#00BFFF] border border-[#00BFFF]/20 hover:bg-[#00BFFF]/10 transition-all text-[10px] leading-none",
                      title: "Create Mining Account",
                      children: "⛏+"
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: () => setEditTarget(u),
                      className: "p-1.5 rounded-lg text-[#00BFFF] border border-[#00BFFF]/20 hover:bg-[#00BFFF]/10 transition-all text-xs",
                      title: "Edit",
                      children: "✎"
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: () => setDeleteTarget(u),
                      className: "p-1.5 rounded-lg text-red-400 border border-red-500/20 hover:bg-red-500/10 transition-all text-xs",
                      title: "Delete",
                      children: "🗑"
                    }
                  )
                ] })
              ]
            }
          ),
          isExpanded && /* @__PURE__ */ jsxs("div", { className: "px-16 pb-4 bg-white/[0.01] border-t border-white/4", children: [
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-2 py-3", children: [
              /* @__PURE__ */ jsxs("div", { className: "glass rounded-lg border border-white/5 p-3", children: [
                /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-[9px] uppercase tracking-widest", children: "Joined" }),
                /* @__PURE__ */ jsx("p", { className: "text-white text-xs font-semibold mt-1", children: u.joinDate ? new Date(u.joinDate).toLocaleDateString() : "—" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "glass rounded-lg border border-white/5 p-3", children: [
                /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-[9px] uppercase tracking-widest", children: "Block Rewards" }),
                /* @__PURE__ */ jsx("p", { className: "text-white text-xs font-semibold mt-1", children: u.hasMining ? `${u.rewardCount} blocks` : "—" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "glass rounded-lg border border-white/5 p-3", children: [
                /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-[9px] uppercase tracking-widest", children: "UUID" }),
                /* @__PURE__ */ jsx("p", { className: "text-gray-400 text-[10px] font-mono mt-1 truncate", children: u.uuid ?? "—" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "glass rounded-lg border border-white/5 p-3", children: [
                /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-[9px] uppercase tracking-widest", children: "Region" }),
                /* @__PURE__ */ jsx("p", { className: "text-white text-xs font-semibold mt-1", children: u.region ?? "—" })
              ] })
            ] }),
            u.hasPlayer && u.ranks && /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2", children: [
              RANK_KEYS.filter((k) => u.ranks[k] && u.ranks[k] !== "NONE").map((k) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsxs("span", { className: "text-gray-600 text-[10px] capitalize", children: [
                  k,
                  ":"
                ] }),
                /* @__PURE__ */ jsx(RankBadge, { rank: u.ranks[k] })
              ] }, k)),
              RANK_KEYS.every((k) => !u.ranks[k] || u.ranks[k] === "NONE") && /* @__PURE__ */ jsx("span", { className: "text-gray-700 text-xs", children: "No tier ranks assigned" })
            ] })
          ] })
        ] }, u.key);
      }) }),
      !loading && displayList.length > 0 && /* @__PURE__ */ jsxs("div", { className: "px-5 py-3 border-t border-white/5 flex items-center justify-between text-gray-700 text-[10px]", children: [
        /* @__PURE__ */ jsxs("span", { children: [
          displayList.length,
          " of ",
          users.length,
          " users shown"
        ] }),
        /* @__PURE__ */ jsxs("span", { children: [
          Math.floor(users.reduce((s, u) => s + u.balance, 0)).toLocaleString(),
          " BC total ·",
          " ",
          users.reduce((s, u) => s + u.totalRigs, 0),
          " rigs total"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx(
      AdminPaginator,
      {
        page: safePage,
        totalPages,
        totalItems: displayList.length,
        pageSize: PAGE_SIZE$1,
        onPageChange: setPage
      }
    )
  ] });
}
function AdminToast$1({ msg, type }) {
  return /* @__PURE__ */ jsxs("div", { className: `fixed top-6 right-6 z-50 px-5 py-3 rounded-xl text-sm font-semibold shadow-xl border ${type === "success" ? "bg-green-500/15 border-green-500/30 text-green-400" : "bg-red-500/15 border-red-500/30 text-red-400"}`, children: [
    type === "success" ? "✓ " : "⚠ ",
    msg
  ] });
}
function ContentManager({ admin }) {
  const defaults = getSiteContent();
  const [form, setForm] = useState(defaults);
  const [toast, setToast] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  function showToastMsg(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3e3);
  }
  function handleSave() {
    saveSiteContent(form);
    addLog(admin, "content:save", "Updated site content settings");
    showToastMsg("Content saved. Navigate to the page to see changes.");
  }
  function handleReset() {
    resetSiteContent();
    setForm(getSiteContent());
    setShowConfirm(false);
    addLog(admin, "content:reset", "Reset site content to defaults");
    showToastMsg("Content reset to defaults.");
  }
  const fields = [
    { key: "heroTitle", label: "Hero Title", desc: "Large heading on the homepage hero", placeholder: "BLUE TIERS" },
    { key: "heroSubtitle", label: "Hero Subtitle", desc: "Tagline below the hero title", placeholder: "#1 Tier List for all types of players." },
    { key: "serverIP", label: "Server IP", desc: "Minecraft server IP shown in hero + footer", placeholder: "play.sennahosting.com" },
    { key: "discordLink", label: "Discord Link", desc: "Discord invite URL (buttons + footer)", placeholder: "https://discord.gg/..." },
    { key: "footerCopyright", label: "Footer Copyright", desc: "Copyright line at bottom of footer", placeholder: "© 2024 Blue Tiers. All rights reserved." },
    { key: "footerTagline", label: "Footer Tagline", desc: "Second line at bottom of footer", placeholder: "Not affiliated with Mojang or Microsoft." }
  ];
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6 max-w-2xl", children: [
    toast && /* @__PURE__ */ jsx(AdminToast$1, { msg: toast.msg, type: toast.type }),
    /* @__PURE__ */ jsxs("div", { className: "glass rounded-2xl border border-white/8 p-6 space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h3", { className: "font-['Space_Grotesk'] font-bold text-white text-base mb-0.5", children: "🏠 Homepage & Footer" }),
        /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-xs", children: "Changes take effect when users navigate to the page." })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "space-y-4", children: fields.map((f) => /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-white text-sm font-semibold mb-1", children: f.label }),
        /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-xs mb-2", children: f.desc }),
        f.multiline ? /* @__PURE__ */ jsx(
          "textarea",
          {
            value: form[f.key],
            onChange: (e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value })),
            placeholder: f.placeholder,
            rows: 3,
            className: "w-full bg-white/3 border border-white/10 hover:border-white/20 focus:border-[#00BFFF]/40 rounded-xl px-4 py-3 text-white text-sm outline-none transition-all placeholder-gray-700 resize-none"
          }
        ) : /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            value: form[f.key],
            onChange: (e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value })),
            placeholder: f.placeholder,
            className: "w-full bg-white/3 border border-white/10 hover:border-white/20 focus:border-[#00BFFF]/40 rounded-xl px-4 py-3 text-white text-sm outline-none transition-all placeholder-gray-700"
          }
        )
      ] }, f.key)) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "glass rounded-2xl border border-white/8 p-5", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-white font-semibold text-sm mb-3", children: "👁 Preview" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2 text-sm", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600 w-24 shrink-0", children: "Hero title:" }),
          /* @__PURE__ */ jsx("span", { className: "text-[#00BFFF] font-black font-['Space_Grotesk']", children: form.heroTitle })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600 w-24 shrink-0", children: "Tagline:" }),
          /* @__PURE__ */ jsx("span", { className: "text-gray-400", children: form.heroSubtitle })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600 w-24 shrink-0", children: "Server IP:" }),
          /* @__PURE__ */ jsx("span", { className: "font-mono text-[#00BFFF]", children: form.serverIP })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600 w-24 shrink-0", children: "Discord:" }),
          /* @__PURE__ */ jsx("span", { className: "text-gray-400 truncate", children: form.discordLink })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-3", children: [
      /* @__PURE__ */ jsx("button", { onClick: handleSave, className: "btn-primary px-6 py-2.5 rounded-xl text-sm font-semibold text-white", children: "Save Content" }),
      /* @__PURE__ */ jsx("button", { onClick: () => setShowConfirm(true), className: "px-6 py-2.5 rounded-xl text-sm text-gray-400 border border-white/10 hover:border-white/20 hover:text-white transition-all", children: "Reset to Defaults" })
    ] }),
    showConfirm && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm", children: /* @__PURE__ */ jsxs("div", { className: "glass rounded-2xl border border-orange-500/20 p-6 max-w-sm w-full text-center", children: [
      /* @__PURE__ */ jsx("div", { className: "text-4xl mb-3", children: "📝" }),
      /* @__PURE__ */ jsx("h3", { className: "text-white font-bold text-lg mb-2", children: "Reset Content?" }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-500 text-sm mb-6", children: "Site content will revert to hardcoded defaults." }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
        /* @__PURE__ */ jsx("button", { onClick: () => setShowConfirm(false), className: "flex-1 py-2.5 rounded-xl text-sm text-gray-400 border border-white/10", children: "Cancel" }),
        /* @__PURE__ */ jsx("button", { onClick: handleReset, className: "flex-1 py-2.5 rounded-xl text-sm font-semibold text-orange-400 border border-orange-500/30 bg-orange-500/10", children: "Reset" })
      ] })
    ] }) })
  ] });
}
function AdminToast({ msg, type }) {
  return /* @__PURE__ */ jsxs("div", { className: `fixed top-6 right-6 z-50 px-5 py-3 rounded-xl text-sm font-semibold shadow-xl border ${type === "success" ? "bg-green-500/15 border-green-500/30 text-green-400" : "bg-red-500/15 border-red-500/30 text-red-400"}`, children: [
    type === "success" ? "✓ " : "⚠ ",
    msg
  ] });
}
function EventManager({ admin }) {
  const [form, setForm] = useState(getEventConfig);
  const [toast, setToast] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  function showToastMsg(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3e3);
  }
  function set(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }
  function handleSave() {
    saveEventConfig(form);
    addLog(admin, "event:save", `Updated event: "${form.title}"`);
    showToastMsg("Event config saved. Navigate to homepage to see changes.");
  }
  function handleReset() {
    resetEventConfig();
    setForm(getEventConfig());
    setShowConfirm(false);
    addLog(admin, "event:reset", "Reset event config to defaults");
    showToastMsg("Event config reset to defaults.");
  }
  const endDate = form.registrationEnds ? new Date(form.registrationEnds) : null;
  const isExpired = endDate ? endDate <= /* @__PURE__ */ new Date() : false;
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6 max-w-2xl", children: [
    toast && /* @__PURE__ */ jsx(AdminToast, { msg: toast.msg, type: toast.type }),
    /* @__PURE__ */ jsxs("div", { className: `flex items-center gap-3 px-4 py-3 rounded-xl text-sm border ${isExpired ? "bg-red-500/8 border-red-500/20 text-red-400" : "bg-green-500/8 border-green-500/20 text-green-400"}`, children: [
      /* @__PURE__ */ jsx("span", { className: `w-2 h-2 rounded-full ${isExpired ? "bg-red-400" : "bg-green-400 animate-pulse"}` }),
      /* @__PURE__ */ jsxs("span", { children: [
        "Event is currently ",
        /* @__PURE__ */ jsx("strong", { children: isExpired ? "expired / closed" : "active" })
      ] }),
      !isExpired && endDate && /* @__PURE__ */ jsxs("span", { className: "text-gray-600 text-xs ml-auto", children: [
        "Ends ",
        endDate.toLocaleDateString()
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "glass rounded-2xl border border-white/8 p-6 space-y-5", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-['Space_Grotesk'] font-bold text-white text-base", children: "🎉 Event Banner Settings" }),
      [
        { key: "title", label: "Banner Title", desc: "Large event name shown in the banner", type: "text", placeholder: "Blue Network PvP World Cup" },
        { key: "subtitle", label: "Subtitle", desc: "Small text below the title (open phase)", type: "text", placeholder: "Registrations are now open!" },
        { key: "registrationEnds", label: "Registration End Date", desc: "ISO 8601 date-time (UTC). When this passes, the banner shows closed state.", type: "datetime-local", placeholder: "" },
        { key: "buttonText", label: "CTA Button Text", desc: "Text on the action button when open", type: "text", placeholder: "Participate Now!" },
        { key: "buttonLink", label: "CTA Button Link", desc: "URL the button opens (usually Discord)", type: "url", placeholder: "https://discord.gg/..." },
        { key: "closedButtonText", label: "Closed Button Text", desc: "Button label shown after event closes", type: "text", placeholder: "Registrations Closed" }
      ].map((f) => {
        let inputValue = form[f.key];
        if (f.type === "datetime-local" && inputValue) {
          try {
            const d = new Date(inputValue);
            inputValue = new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 16);
          } catch {
          }
        }
        return /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-white text-sm font-semibold mb-1", children: f.label }),
          /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-xs mb-2", children: f.desc }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: f.type,
              value: inputValue,
              onChange: (e) => {
                let val = e.target.value;
                if (f.type === "datetime-local" && val) {
                  val = new Date(val).toISOString();
                }
                set(f.key, val);
              },
              placeholder: f.placeholder,
              className: "w-full bg-white/3 border border-white/10 hover:border-white/20 focus:border-[#00BFFF]/40 rounded-xl px-4 py-3 text-white text-sm outline-none transition-all placeholder-gray-700"
            }
          )
        ] }, f.key);
      })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "glass rounded-2xl border border-white/8 p-5", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-white font-semibold text-sm mb-3", children: "👁 Preview" }),
      /* @__PURE__ */ jsxs("div", { className: "p-4 rounded-xl bg-gradient-to-r from-[#070b12] via-[#09152a] to-[#070b12] border border-[#00BFFF]/15", children: [
        /* @__PURE__ */ jsxs("p", { className: "font-['Space_Grotesk'] font-black text-sm text-white uppercase tracking-widest", children: [
          /* @__PURE__ */ jsx("span", { className: "text-[#00BFFF]", children: form.title.startsWith("Blue") ? "Blue" : "" }),
          form.title.startsWith("Blue") ? form.title.slice(4) : form.title
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-gray-400 text-xs mt-0.5", children: isExpired ? "Registrations are now closed." : form.subtitle })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-3", children: [
      /* @__PURE__ */ jsx("button", { onClick: handleSave, className: "btn-primary px-6 py-2.5 rounded-xl text-sm font-semibold text-white", children: "Save Event Config" }),
      /* @__PURE__ */ jsx("button", { onClick: () => setShowConfirm(true), className: "px-6 py-2.5 rounded-xl text-sm text-gray-400 border border-white/10 hover:border-white/20 hover:text-white transition-all", children: "Reset to Defaults" })
    ] }),
    showConfirm && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm", children: /* @__PURE__ */ jsxs("div", { className: "glass rounded-2xl border border-orange-500/20 p-6 max-w-sm w-full text-center", children: [
      /* @__PURE__ */ jsx("div", { className: "text-4xl mb-3", children: "🎉" }),
      /* @__PURE__ */ jsx("h3", { className: "text-white font-bold text-lg mb-2", children: "Reset Event Config?" }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-500 text-sm mb-6", children: "Event settings will revert to the defaults from event.ts." }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
        /* @__PURE__ */ jsx("button", { onClick: () => setShowConfirm(false), className: "flex-1 py-2.5 rounded-xl text-sm text-gray-400 border border-white/10", children: "Cancel" }),
        /* @__PURE__ */ jsx("button", { onClick: handleReset, className: "flex-1 py-2.5 rounded-xl text-sm font-semibold text-orange-400 border border-orange-500/30 bg-orange-500/10", children: "Reset" })
      ] })
    ] }) })
  ] });
}
const PAGE_SIZE = 10;
const ACTION_COLORS = {
  "player:add": "bg-green-500/10 text-green-400 border-green-500/20",
  "player:edit": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "player:delete": "bg-red-500/10 text-red-400 border-red-500/20",
  "player:import": "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  "player:reset": "bg-orange-500/10 text-orange-400 border-orange-500/20",
  "economy:save": "bg-purple-500/10 text-purple-400 border-purple-500/20",
  "economy:reset": "bg-orange-500/10 text-orange-400 border-orange-500/20",
  "user:delete": "bg-red-500/10 text-red-400 border-red-500/20",
  "user:edit": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "mining:give": "bg-green-500/10 text-green-400 border-green-500/20",
  "mining:take": "bg-red-500/10 text-red-400 border-red-500/20",
  "content:save": "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  "content:reset": "bg-orange-500/10 text-orange-400 border-orange-500/20",
  "event:save": "bg-pink-500/10 text-pink-400 border-pink-500/20",
  "event:reset": "bg-orange-500/10 text-orange-400 border-orange-500/20",
  "gamemode:add": "bg-green-500/10 text-green-400 border-green-500/20",
  "gamemode:edit": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "gamemode:delete": "bg-red-500/10 text-red-400 border-red-500/20",
  "logs:clear": "bg-gray-500/10 text-gray-400 border-gray-500/20"
};
function getColor(action) {
  return ACTION_COLORS[action] ?? "bg-white/5 text-gray-400 border-white/10";
}
function timeAgo$4(ts) {
  const diff = Date.now() - ts;
  if (diff < 6e4) return `${Math.floor(diff / 1e3)}s ago`;
  if (diff < 36e5) return `${Math.floor(diff / 6e4)}m ago`;
  if (diff < 864e5) return `${Math.floor(diff / 36e5)}h ago`;
  return new Date(ts).toLocaleDateString();
}
function ActivityLogs({ admin }) {
  const [logs, setLogs] = useState(getLogs);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [showConfirm, setShowConfirm] = useState(false);
  const [page, setPage] = useState(1);
  const refresh = () => setLogs(getLogs());
  useEffect(() => {
    setPage(1);
  }, [search, filter]);
  const actionTypes = ["all", ...Array.from(new Set(logs.map((l) => l.action)))];
  const filtered = logs.filter((l) => {
    const matchFilter = filter === "all" || l.action === filter;
    const q = search.toLowerCase();
    const matchSearch = !q || l.action.includes(q) || l.admin.includes(q) || (l.details ?? "").toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedLogs = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  function handleClear() {
    clearLogs();
    addLog(admin, "logs:clear", "Cleared all activity logs");
    setShowConfirm(false);
    refresh();
  }
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [
      { label: "Total Logs", value: logs.length },
      { label: "Today", value: logs.filter((l) => Date.now() - l.timestamp < 864e5).length },
      { label: "This Hour", value: logs.filter((l) => Date.now() - l.timestamp < 36e5).length },
      { label: "Action Types", value: actionTypes.length - 1 }
    ].map((stat) => /* @__PURE__ */ jsxs("div", { className: "glass rounded-xl border border-white/8 p-4 text-center", children: [
      /* @__PURE__ */ jsx("p", { className: "font-['Space_Grotesk'] font-black text-2xl text-white", children: stat.value }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-xs mt-0.5", children: stat.label })
    ] }, stat.label)) }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row gap-3", children: [
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "text",
          placeholder: "Search logs…",
          value: search,
          onChange: (e) => setSearch(e.target.value),
          className: "flex-1 bg-white/3 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-700 outline-none focus:border-[#00BFFF]/40 transition-all"
        }
      ),
      /* @__PURE__ */ jsx(
        "select",
        {
          value: filter,
          onChange: (e) => setFilter(e.target.value),
          className: "bg-white/3 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#00BFFF]/40",
          children: actionTypes.map((a) => /* @__PURE__ */ jsx("option", { value: a, className: "bg-[#0B0F17]", children: a === "all" ? "All Actions" : a }, a))
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: refresh,
          className: "px-4 py-2.5 rounded-xl text-sm text-gray-400 border border-white/8 hover:border-white/20 hover:text-white transition-all",
          children: "↻ Refresh"
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setShowConfirm(true),
          className: "px-4 py-2.5 rounded-xl text-sm text-red-400 border border-red-500/20 hover:bg-red-500/10 transition-all",
          children: "🗑 Clear All"
        }
      )
    ] }),
    /* @__PURE__ */ jsx("div", { className: "glass rounded-2xl border border-white/8 overflow-hidden", children: filtered.length === 0 ? /* @__PURE__ */ jsx("div", { className: "py-16 text-center text-gray-600 text-sm", children: "No logs found." }) : /* @__PURE__ */ jsx("div", { className: "divide-y divide-white/5", children: pagedLogs.map((log) => /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4 px-5 py-3.5 hover:bg-white/2 transition-colors", children: [
      /* @__PURE__ */ jsx("span", { className: `mt-0.5 px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold border shrink-0 ${getColor(log.action)}`, children: log.action }),
      /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
        log.details && /* @__PURE__ */ jsx("p", { className: "text-gray-400 text-xs truncate", children: log.details }),
        /* @__PURE__ */ jsxs("p", { className: "text-gray-700 text-[10px] mt-0.5", children: [
          "by ",
          log.admin
        ] })
      ] }),
      /* @__PURE__ */ jsx("span", { className: "text-gray-700 text-[10px] shrink-0", children: timeAgo$4(log.timestamp) })
    ] }, log.id)) }) }),
    /* @__PURE__ */ jsx(
      AdminPaginator,
      {
        page: safePage,
        totalPages,
        totalItems: filtered.length,
        pageSize: PAGE_SIZE,
        onPageChange: setPage
      }
    ),
    showConfirm && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm", children: /* @__PURE__ */ jsxs("div", { className: "glass rounded-2xl border border-red-500/20 p-6 max-w-sm w-full text-center", children: [
      /* @__PURE__ */ jsx("div", { className: "text-4xl mb-3", children: "🗑️" }),
      /* @__PURE__ */ jsx("h3", { className: "text-white font-bold text-lg mb-2", children: "Clear All Logs?" }),
      /* @__PURE__ */ jsxs("p", { className: "text-gray-500 text-sm mb-6", children: [
        "This will permanently delete all ",
        logs.length,
        " activity log entries."
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
        /* @__PURE__ */ jsx("button", { onClick: () => setShowConfirm(false), className: "flex-1 py-2.5 rounded-xl text-sm text-gray-400 border border-white/10 hover:bg-white/5", children: "Cancel" }),
        /* @__PURE__ */ jsx("button", { onClick: handleClear, className: "flex-1 py-2.5 rounded-xl text-sm font-semibold text-red-400 border border-red-500/30 bg-red-500/10 hover:bg-red-500/20", children: "Clear All" })
      ] })
    ] }) })
  ] });
}
const SYNC_HISTORY_PAGE_SIZE = 10;
function timeAgo$3(isoOrMs) {
  const ms = typeof isoOrMs === "number" ? isoOrMs : new Date(isoOrMs).getTime();
  const secs = Math.floor((Date.now() - ms) / 1e3);
  if (secs < 10) return "just now";
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
function hms() {
  return (/* @__PURE__ */ new Date()).toTimeString().slice(0, 8);
}
function fmtDate(iso) {
  const d = new Date(iso);
  return d.toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}
const SECTION_LABELS = {
  players: "Tier List (players.json)",
  gamemodes: "Gamemodes (gamemodes.json)",
  content: "Homepage Content (content.json)",
  event: "Event Config (event.json)",
  economy: "Economy Settings (economy.json)"
};
function LogEntry({ line }) {
  const color = {
    info: "text-gray-400",
    ok: "text-green-400",
    warn: "text-amber-400",
    error: "text-red-400",
    step: "text-[#00BFFF] font-semibold",
    dim: "text-gray-700"
  }[line.kind];
  return /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2 font-mono text-[11px] leading-5", children: [
    /* @__PURE__ */ jsxs("span", { className: "text-gray-700 shrink-0", children: [
      "[",
      line.ts,
      "]"
    ] }),
    /* @__PURE__ */ jsx("span", { className: color, children: line.msg })
  ] });
}
const DEBOUNCE_PRESETS = [
  { label: "15 s", ms: 15e3 },
  { label: "30 s", ms: 3e4 },
  { label: "45 s", ms: 45e3 },
  { label: "2 min", ms: 12e4 },
  { label: "5 min", ms: 3e5 },
  { label: "10 min", ms: 6e5 }
];
function fmtDebounce(ms) {
  if (ms < 6e4) return `${ms / 1e3} s`;
  return `${ms / 6e4} min`;
}
function fmtBytes(n) {
  if (n >= 1048576) return `${(n / 1048576).toFixed(1)} MB`;
  if (n >= 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${n} B`;
}
function fmtCountdown(ms) {
  const s = Math.ceil(ms / 1e3);
  if (s <= 0) return "firing…";
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60), r = s % 60;
  return r > 0 ? `${m}m ${r}s` : `${m}m`;
}
function AutoBackupPanel() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [backing, setBacking] = useState(false);
  const [backupLog, setBackupLog] = useState(null);
  const [backupOk, setBackupOk] = useState(null);
  const [setDebouncing, setSetDebouncing] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [recentBackups, setRecentBackups] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const [customSecs, setCustomSecs] = useState("");
  const statusRef = useRef(null);
  statusRef.current = status;
  const refresh = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    try {
      const s = await getBackupStatusFn();
      setStatus(s);
    } catch {
    } finally {
      if (!quiet) setLoading(false);
    }
  }, []);
  const loadHistory2 = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const commits = await fetchCommitHistory();
      setRecentBackups(commits.filter((c) => c.message.startsWith("[auto]")).slice(0, 5));
    } catch {
    } finally {
      setHistoryLoading(false);
    }
  }, []);
  useEffect(() => {
    refresh();
    loadHistory2();
    const poll = setInterval(() => refresh(true), 1e4);
    return () => clearInterval(poll);
  }, [refresh, loadHistory2]);
  useEffect(() => {
    const tick = setInterval(() => {
      const s = statusRef.current;
      if (s?.timerFiresAt) {
        setCountdown(Math.max(0, s.timerFiresAt - Date.now()));
      } else {
        setCountdown(null);
      }
    }, 500);
    return () => clearInterval(tick);
  }, []);
  async function toggleEnabled() {
    if (!status) return;
    setToggling(true);
    try {
      const s = await setAutoBackupEnabled({ data: { enabled: !status.enabled } });
      setStatus(s);
    } catch {
    } finally {
      setToggling(false);
    }
  }
  async function backupNow() {
    setBacking(true);
    setBackupLog(null);
    setBackupOk(null);
    try {
      const result = await triggerBackupNow();
      setStatus(result.status);
      setBackupLog(result.message);
      setBackupOk(result.ok);
      if (result.ok) loadHistory2();
    } catch (e) {
      setBackupLog(e instanceof Error ? e.message : "Unknown error");
      setBackupOk(false);
    } finally {
      setBacking(false);
    }
  }
  async function changeDebounce(ms) {
    setSetDebouncing(true);
    try {
      const s = await setBackupDebounce({ data: { ms } });
      setStatus(s);
      setShowCustom(false);
      setCustomSecs("");
    } catch {
    } finally {
      setSetDebouncing(false);
    }
  }
  const on = status?.enabled === true;
  const pending = status?.hasPendingTimer === true;
  const progress = status?.timerFiresAt && status?.debounceMs && countdown !== null ? Math.max(0, Math.min(100, (1 - countdown / status.debounceMs) * 100)) : null;
  return /* @__PURE__ */ jsxs("div", { className: `glass rounded-2xl border overflow-hidden transition-colors ${status?.lastBackupError ? "border-red-500/20" : on ? "border-white/8" : "border-white/5"}`, children: [
    /* @__PURE__ */ jsxs("div", { className: "px-6 py-4 border-b border-white/5 flex items-center gap-3 flex-wrap", children: [
      /* @__PURE__ */ jsx("div", { className: `w-2 h-2 rounded-full shrink-0 ${loading ? "bg-gray-600 animate-pulse" : status?.isRunning ? "bg-blue-400 animate-pulse" : status?.lastBackupError ? "bg-red-400 animate-pulse" : on && pending ? "bg-amber-400 animate-pulse" : on ? "bg-green-400" : "bg-gray-600"}` }),
      /* @__PURE__ */ jsx("h3", { className: "font-['Space_Grotesk'] font-bold text-white text-sm", children: "Mining Auto-Backup" }),
      /* @__PURE__ */ jsx("span", { className: "text-gray-600 text-[10px]", children: loading && !status ? "— loading…" : status ? `debounce: ${fmtDebounce(status.debounceMs)} · ${status.files.length} files` : "" }),
      /* @__PURE__ */ jsxs("div", { className: "ml-auto flex items-center gap-3", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: backupNow,
            disabled: backing || loading || !status,
            className: "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold text-[#00BFFF] border border-[#00BFFF]/25 bg-[#00BFFF]/8 hover:bg-[#00BFFF]/15 transition-all disabled:opacity-40 disabled:cursor-not-allowed",
            children: backing ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx("span", { className: "w-2.5 h-2.5 border-2 border-[#00BFFF]/30 border-t-[#00BFFF] rounded-full animate-spin" }),
              "Pushing…"
            ] }) : "⚡ Backup Now"
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx("span", { className: `text-[10px] font-mono font-bold ${on ? "text-green-400" : "text-gray-600"}`, children: toggling ? "…" : on ? "ON" : "OFF" }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: toggleEnabled,
              disabled: toggling || !status,
              "aria-label": on ? "Disable auto-backup" : "Enable auto-backup",
              className: `relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 transition-colors duration-200 focus:outline-none disabled:opacity-40 ${on ? "border-green-500 bg-green-500/20" : "border-white/15 bg-white/5"}`,
              children: /* @__PURE__ */ jsx("span", { className: `inline-block h-3 w-3 transform rounded-full shadow transition-transform duration-200 mt-px ${on ? "translate-x-4 bg-green-400" : "translate-x-0.5 bg-gray-500"}` })
            }
          )
        ] })
      ] })
    ] }),
    status && /* @__PURE__ */ jsxs("div", { className: "px-6 py-5 space-y-5", children: [
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-white/2 border border-white/5 rounded-xl px-4 py-3", children: [
          /* @__PURE__ */ jsx("p", { className: "text-[9px] uppercase tracking-widest text-gray-600 mb-1", children: "Last Backup" }),
          /* @__PURE__ */ jsx("p", { className: `text-sm font-bold ${status.lastBackupAt ? "text-green-400" : "text-gray-600"}`, children: status.lastBackupAt ? timeAgo$3(status.lastBackupAt) : "—" }),
          /* @__PURE__ */ jsx("p", { className: "text-[10px] text-gray-700 mt-0.5 truncate", children: status.lastBackupAt ? new Date(status.lastBackupAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "None this session" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white/2 border border-white/5 rounded-xl px-4 py-3", children: [
          /* @__PURE__ */ jsx("p", { className: "text-[9px] uppercase tracking-widest text-gray-600 mb-1", children: "Next Backup" }),
          /* @__PURE__ */ jsx("p", { className: `text-sm font-bold font-mono ${pending ? "text-amber-400" : "text-gray-600"}`, children: pending && countdown !== null ? fmtCountdown(countdown) : "—" }),
          /* @__PURE__ */ jsx("p", { className: "text-[10px] text-gray-700 mt-0.5", children: pending ? "timer running" : on ? "idle — waiting for write" : "disabled" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white/2 border border-white/5 rounded-xl px-4 py-3", children: [
          /* @__PURE__ */ jsx("p", { className: "text-[9px] uppercase tracking-widest text-gray-600 mb-1", children: "Session Commits" }),
          /* @__PURE__ */ jsx("p", { className: `text-sm font-bold ${status.totalBackups > 0 ? "text-[#00BFFF]" : "text-gray-600"}`, children: status.totalBackups }),
          /* @__PURE__ */ jsx("p", { className: "text-[10px] text-gray-700 mt-0.5", children: "since last restart" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white/2 border border-white/5 rounded-xl px-4 py-3", children: [
          /* @__PURE__ */ jsx("p", { className: "text-[9px] uppercase tracking-widest text-gray-600 mb-1", children: "Retry Queue" }),
          /* @__PURE__ */ jsx("p", { className: `text-sm font-bold ${status.retryCount > 0 ? "text-amber-400" : status.hasRetryPending ? "text-amber-400" : "text-green-400"}`, children: status.retryCount > 0 ? `${status.retryCount} / 5` : "0" }),
          /* @__PURE__ */ jsx("p", { className: "text-[10px] text-gray-700 mt-0.5", children: status.hasRetryPending ? "retry pending…" : status.retryCount > 0 ? "retrying" : "clear" })
        ] })
      ] }),
      pending && progress !== null && /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-[10px]", children: [
          /* @__PURE__ */ jsxs("span", { className: "text-gray-500", children: [
            "Debounce timer — fires in ",
            countdown !== null ? fmtCountdown(countdown) : "…"
          ] }),
          /* @__PURE__ */ jsxs("span", { className: "text-amber-400 font-mono", children: [
            Math.round(progress),
            "%"
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "h-1.5 rounded-full bg-white/5 overflow-hidden", children: /* @__PURE__ */ jsx(
          "div",
          {
            className: "h-full rounded-full bg-amber-400 transition-all duration-500",
            style: { width: `${progress}%` }
          }
        ) }),
        /* @__PURE__ */ jsxs("p", { className: "text-[10px] text-gray-700", children: [
          "Timer resets on every mining write. Commit fires ",
          fmtDebounce(status.debounceMs),
          " after the ",
          /* @__PURE__ */ jsx("em", { children: "last" }),
          " change."
        ] })
      ] }),
      status.isRunning && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 px-4 py-2.5 rounded-xl border border-blue-500/20 bg-blue-500/5", children: [
        /* @__PURE__ */ jsx("span", { className: "w-3 h-3 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin shrink-0" }),
        /* @__PURE__ */ jsx("span", { className: "text-blue-400 text-[11px] font-medium", children: "Backup in progress — committing to GitHub…" })
      ] }),
      status.lastBackupError && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 space-y-1", children: [
        /* @__PURE__ */ jsx("p", { className: "text-red-400 text-xs font-bold", children: "✗ Last backup failed" }),
        /* @__PURE__ */ jsx("p", { className: "text-red-400/80 text-[11px] font-mono break-all", children: status.lastBackupError }),
        status.retryCount > 0 && /* @__PURE__ */ jsxs("p", { className: "text-gray-600 text-[10px]", children: [
          "Auto-retrying (",
          status.retryCount,
          "/5) with exponential backoff (30 s → 5 min)."
        ] })
      ] }),
      backupLog && /* @__PURE__ */ jsxs("div", { className: `rounded-xl border px-4 py-3 flex items-start gap-2 ${backupOk === true ? "border-green-500/20 bg-green-500/5" : backupOk === false ? "border-red-500/20   bg-red-500/5" : "border-white/8      bg-black/20"}`, children: [
        /* @__PURE__ */ jsx("span", { className: backupOk === true ? "text-green-400" : backupOk === false ? "text-red-400" : "text-gray-400", children: backupOk === true ? "✓" : backupOk === false ? "✗" : "·" }),
        /* @__PURE__ */ jsx("span", { className: `text-[11px] font-mono break-all ${backupOk === true ? "text-green-400" : backupOk === false ? "text-red-400" : "text-gray-400"}`, children: backupLog })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsx("p", { className: "text-[9px] uppercase tracking-widest text-gray-600", children: "Debounce Interval" }),
          /* @__PURE__ */ jsxs("p", { className: "text-[10px] text-gray-700", children: [
            "current: ",
            /* @__PURE__ */ jsx("span", { className: "text-gray-400 font-mono", children: fmtDebounce(status.debounceMs) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-1.5", children: [
          DEBOUNCE_PRESETS.map((p) => /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => changeDebounce(p.ms),
              disabled: setDebouncing,
              className: `px-3 py-1.5 rounded-lg text-[11px] font-mono font-bold transition-all disabled:opacity-40 ${status.debounceMs === p.ms ? "bg-[#00BFFF]/15 border border-[#00BFFF]/40 text-[#00BFFF]" : "bg-white/3 border border-white/8 text-gray-400 hover:border-white/20 hover:text-gray-200"}`,
              children: p.label
            },
            p.ms
          )),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setShowCustom((v) => !v),
              className: `px-3 py-1.5 rounded-lg text-[11px] font-mono font-bold transition-all ${showCustom ? "bg-white/8 border border-white/20 text-gray-200" : "bg-white/3 border border-white/8 text-gray-500 hover:border-white/20 hover:text-gray-300"}`,
              children: "custom…"
            }
          )
        ] }),
        showCustom && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              min: 5,
              max: 1800,
              placeholder: "seconds  (5 – 1800)",
              value: customSecs,
              onChange: (e) => setCustomSecs(e.target.value),
              className: "flex-1 bg-black/30 border border-white/10 rounded-lg px-3 py-1.5 text-[11px] font-mono text-gray-300 placeholder-gray-700 focus:outline-none focus:border-white/25"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => {
                const s = parseInt(customSecs, 10);
                if (!isNaN(s) && s >= 5 && s <= 1800) changeDebounce(s * 1e3);
              },
              disabled: setDebouncing || !customSecs,
              className: "px-3 py-1.5 rounded-lg text-[11px] font-bold text-[#00BFFF] border border-[#00BFFF]/25 bg-[#00BFFF]/8 hover:bg-[#00BFFF]/15 transition-all disabled:opacity-40",
              children: "Set"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx("p", { className: "text-[9px] uppercase tracking-widest text-gray-600", children: "Tracked Files" }),
        /* @__PURE__ */ jsx("div", { className: "rounded-xl border border-white/5 bg-black/20 divide-y divide-white/4", children: status.files.map((f) => /* @__PURE__ */ jsxs("div", { className: "px-4 py-2.5 flex items-center gap-3 min-w-0", children: [
          /* @__PURE__ */ jsx("span", { className: `w-1.5 h-1.5 rounded-full shrink-0 ${f.exists ? "bg-green-400" : "bg-red-400"}` }),
          /* @__PURE__ */ jsx("span", { className: "font-mono text-[11px] text-gray-300 flex-1 truncate", children: f.name }),
          /* @__PURE__ */ jsx("span", { className: "font-mono text-[10px] text-gray-600 shrink-0 tabular-nums", children: fmtBytes(f.bytes) }),
          /* @__PURE__ */ jsx("span", { className: "font-mono text-[10px] text-gray-700 shrink-0 hidden sm:block", children: f.hash }),
          /* @__PURE__ */ jsxs("span", { className: "font-mono text-[10px] text-[#00BFFF]/40 shrink-0 truncate hidden md:block max-w-[180px]", children: [
            "→ ",
            f.repo
          ] })
        ] }, f.name)) })
      ] }),
      status.lastBackupMessage && /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2 px-4 py-2.5 rounded-xl border border-white/5 bg-black/20", children: [
        /* @__PURE__ */ jsx("span", { className: "text-green-400 text-[10px] shrink-0 font-bold mt-px", children: "✓" }),
        /* @__PURE__ */ jsx("span", { className: "text-[10px] font-mono text-gray-500 break-all", children: status.lastBackupMessage })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsx("p", { className: "text-[9px] uppercase tracking-widest text-gray-600", children: "Recent Auto-Backup Commits" }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: loadHistory2,
              disabled: historyLoading,
              className: "text-[10px] text-gray-600 hover:text-gray-400 transition-colors disabled:opacity-40",
              children: historyLoading ? "↻ loading…" : "↻ refresh"
            }
          )
        ] }),
        recentBackups.length > 0 ? /* @__PURE__ */ jsx("div", { className: "rounded-xl border border-white/5 bg-black/20 divide-y divide-white/4", children: recentBackups.map((c) => /* @__PURE__ */ jsxs("div", { className: "px-4 py-2.5 flex items-center gap-3 min-w-0", children: [
          /* @__PURE__ */ jsx("span", { className: "font-mono text-[10px] text-[#00BFFF] shrink-0", children: c.shortSha }),
          /* @__PURE__ */ jsx("span", { className: "text-[11px] text-gray-400 flex-1 truncate", children: c.message.replace("[auto] ", "") }),
          /* @__PURE__ */ jsx("span", { className: "text-[10px] text-gray-600 shrink-0 tabular-nums", children: timeAgo$3(c.date) })
        ] }, c.shortSha)) }) : historyLoading ? /* @__PURE__ */ jsx("div", { className: "px-4 py-4 text-center text-gray-700 text-[11px] animate-pulse", children: "Loading commit history…" }) : /* @__PURE__ */ jsx("div", { className: "px-4 py-4 rounded-xl border border-white/5 bg-black/20 text-center text-gray-700 text-[11px]", children: "No auto-backup commits found in recent history." })
      ] })
    ] }),
    loading && !status && /* @__PURE__ */ jsx("div", { className: "px-6 py-8 text-center text-gray-600 text-sm animate-pulse", children: "Loading backup status…" })
  ] });
}
function GitDiagnosticsPanel() {
  const [diag, setDiag] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fixing, setFixing] = useState(false);
  const [fixLog, setFixLog] = useState([]);
  const [fixOk, setFixOk] = useState(null);
  const logRef = useRef(null);
  async function refresh() {
    setLoading(true);
    try {
      const d = await getGitDiagnostics();
      setDiag(d);
    } catch (e) {
      setDiag(null);
    } finally {
      setLoading(false);
    }
  }
  async function runFix() {
    setFixing(true);
    setFixLog([]);
    setFixOk(null);
    try {
      const dirty = getDirty();
      if (dirty.size > 0) {
        const sectionData = {
          players: getPlayers,
          gamemodes: getGamemodes,
          content: getSiteContent,
          event: getEventConfig,
          economy: getEconomyOverrides
        };
        setFixLog([
          `→ Flushing ${dirty.size} in-memory section(s) to disk…`,
          ...[...dirty].map((s) => `  · ${SECTION_LABELS[s] ?? s}`)
        ]);
        const sections = [...dirty].map((section) => ({
          section,
          jsonData: JSON.stringify(sectionData[section](), null, 2)
        }));
        const flushResult = await flushStoresToDisk({ data: { sections } });
        setFixLog((prev) => [...prev, `✓ Wrote ${flushResult.written.length} file(s) to disk`]);
      }
      setFixLog((prev) => [...prev, "→ Running git sync (fetch → commit → rebase → push)…"]);
      const result = await fixGitDivergence();
      setFixLog((prev) => [...prev, ...result.logs]);
      setFixOk(result.success);
      if (result.success) {
        clearDirty();
        setLastSync(Date.now(), `Git sync · ${(/* @__PURE__ */ new Date()).toLocaleDateString()}`);
        await refresh();
      }
    } catch (e) {
      const raw = e instanceof Error ? e.message : String(e);
      const isNetwork = raw.toLowerCase().includes("networkerror") || raw.toLowerCase().includes("fetch");
      setFixLog((prev) => [
        ...prev,
        isNetwork ? "✗ Network error: The server function request failed." : `✗ Error: ${raw}`,
        isNetwork ? "  This usually means the server took too long and the connection was dropped." : "",
        isNetwork ? "  Try clicking Refresh first, then retry the push." : "",
        `  Raw: ${raw}`
      ].filter(Boolean));
      setFixOk(false);
    } finally {
      setFixing(false);
      setTimeout(() => logRef.current?.scrollTo({ top: 99999, behavior: "smooth" }), 50);
    }
  }
  useEffect(() => {
    refresh();
  }, []);
  if (!diag && !loading) return null;
  const hasIssue = diag && (diag.isDiverged || diag.behind > 0 || diag.ahead > 0 || diag.totalPending > 0);
  const jsonAllOk = diag?.jsonChecks.every((j) => j.ok) ?? true;
  const conflictFiles = diag?.jsonChecks.filter((j) => !j.ok) ?? [];
  return /* @__PURE__ */ jsxs("div", { className: `glass rounded-2xl border overflow-hidden ${!jsonAllOk ? "border-red-500/25" : hasIssue ? "border-amber-500/20" : "border-white/8"}`, children: [
    /* @__PURE__ */ jsxs("div", { className: "px-6 py-4 border-b border-white/5 flex items-center gap-3", children: [
      /* @__PURE__ */ jsx("div", { className: `w-2 h-2 rounded-full shrink-0 ${!jsonAllOk ? "bg-red-400 animate-pulse" : hasIssue ? "bg-amber-400 animate-pulse" : diag ? "bg-green-400" : "bg-gray-600"}` }),
      /* @__PURE__ */ jsx("h3", { className: "font-['Space_Grotesk'] font-bold text-white text-sm", children: "Git Diagnostics" }),
      /* @__PURE__ */ jsx("span", { className: "text-gray-600 text-[10px] ml-0.5", children: loading ? "— refreshing…" : diag ? `branch: ${diag.branch} · ${diag.headSha}` : "" }),
      /* @__PURE__ */ jsxs("div", { className: "ml-auto flex items-center gap-2", children: [
        loading && /* @__PURE__ */ jsx("span", { className: "text-gray-600 text-xs animate-pulse", children: "Fetching…" }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: refresh,
            disabled: loading || fixing,
            className: "px-3 py-1.5 rounded-lg text-[10px] text-gray-500 border border-white/8 hover:border-white/15 hover:text-gray-300 transition-all disabled:opacity-40",
            children: "↻ Refresh"
          }
        )
      ] })
    ] }),
    diag && /* @__PURE__ */ jsxs("div", { className: "px-6 py-4 space-y-4", children: [
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-2", children: [
        {
          label: "Commits ahead",
          value: diag.ahead.toString(),
          color: diag.ahead > 0 ? "text-amber-400" : "text-green-400",
          hint: diag.ahead > 0 ? "local commits not pushed" : "synced"
        },
        {
          label: "Commits behind",
          value: diag.behind.toString(),
          color: diag.behind > 0 ? "text-red-400" : "text-green-400",
          hint: diag.behind > 0 ? "remote commits not in local" : "synced"
        },
        {
          label: "Pending files",
          value: diag.totalPending.toString(),
          color: diag.totalPending > 0 ? "text-amber-400" : "text-green-400",
          hint: `${diag.modified}M · ${diag.deleted}D · ${diag.untracked}U`
        },
        {
          label: "JSON health",
          value: jsonAllOk ? "✓ All valid" : `✗ ${conflictFiles.length} issue(s)`,
          color: jsonAllOk ? "text-green-400" : "text-red-400",
          hint: jsonAllOk ? "5 data files OK" : conflictFiles.map((f) => f.file).join(", ")
        }
      ].map((stat) => /* @__PURE__ */ jsxs("div", { className: "bg-white/2 border border-white/5 rounded-xl px-4 py-3", children: [
        /* @__PURE__ */ jsx("p", { className: "text-[9px] uppercase tracking-widest text-gray-600 mb-1", children: stat.label }),
        /* @__PURE__ */ jsx("p", { className: `text-sm font-bold ${stat.color}`, children: stat.value }),
        /* @__PURE__ */ jsx("p", { className: "text-[10px] text-gray-700 mt-0.5 truncate", children: stat.hint })
      ] }, stat.label)) }),
      !jsonAllOk && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-red-500/20 bg-red-500/4 px-4 py-3 space-y-1.5", children: [
        /* @__PURE__ */ jsx("p", { className: "text-red-400 text-xs font-bold mb-2", children: "⚠ Data file issues detected — push blocked until resolved" }),
        conflictFiles.map((f) => /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-red-400 text-[10px] font-bold shrink-0", children: "✗" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("span", { className: "text-gray-300 text-[11px] font-mono", children: f.file }),
            f.error && /* @__PURE__ */ jsx("span", { className: "text-red-400/70 text-[10px] ml-2", children: f.error })
          ] })
        ] }, f.file)),
        /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-[10px] mt-1", children: 'Use the "Repair Data" button in the Tier List section, then push again.' })
      ] }),
      diag.statusLines.length > 0 && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-white/5 bg-black/30 px-4 py-3", children: [
        /* @__PURE__ */ jsxs("p", { className: "text-[9px] uppercase tracking-widest text-gray-600 mb-2", children: [
          "Working tree — ",
          diag.statusLines.length,
          " file(s)"
        ] }),
        /* @__PURE__ */ jsx("div", { className: "space-y-0.5 max-h-28 overflow-y-auto", children: diag.statusLines.map((line, i) => {
          const code = line.slice(0, 2);
          const file = line.slice(3);
          const color = code.includes("M") ? "text-amber-400" : code.includes("D") ? "text-red-400" : code.startsWith("?") ? "text-gray-500" : "text-green-400";
          return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 font-mono text-[10px]", children: [
            /* @__PURE__ */ jsx("span", { className: `shrink-0 font-bold ${color}`, children: code }),
            /* @__PURE__ */ jsx("span", { className: "text-gray-400 truncate", children: file })
          ] }, i);
        }) })
      ] }),
      (diag.isDiverged || diag.behind > 0) && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-amber-500/20 bg-amber-500/4 px-4 py-3", children: [
        /* @__PURE__ */ jsx("p", { className: "text-amber-400 text-xs font-bold mb-1", children: diag.isDiverged ? `⚠ Diverged — ${diag.ahead} local commit(s) + ${diag.behind} remote commit(s) not integrated` : `⚠ ${diag.behind} remote commit(s) not in local history` }),
        /* @__PURE__ */ jsx("p", { className: "text-gray-500 text-[11px] mb-3 leading-relaxed", children: diag.isDiverged ? 'Local and remote have diverged. Click "Fix Divergence" to auto-rebase local onto remote, resolve data file conflicts (remote version wins), and push.' : `Remote has commits your local git doesn't have. Click "Fix" to rebase and sync.` }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: runFix,
            disabled: fixing || loading,
            className: "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-amber-400 border border-amber-500/25 bg-amber-500/8 hover:bg-amber-500/15 transition-all disabled:opacity-40 disabled:cursor-not-allowed",
            children: fixing ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx("span", { className: "w-3 h-3 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" }),
              " Fixing…"
            ] }) : "⚡ Fix Divergence (auto-rebase + push)"
          }
        )
      ] }),
      diag.ahead > 0 && diag.behind === 0 && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-blue-500/20 bg-blue-500/4 px-4 py-3 space-y-3", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("p", { className: "text-[#00BFFF] text-xs font-bold mb-1", children: [
            "↑ ",
            diag.ahead,
            " local commit(s) ready to push"
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-gray-500 text-[11px]", children: "Local is ahead of remote — no divergence, push is safe." })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-2", children: [
          { label: "Commits to push", value: diag.ahead.toString(), color: "text-[#00BFFF]" },
          { label: "Commits behind", value: "0", color: "text-green-400" },
          { label: "Modified files", value: diag.modified.toString(), color: diag.modified > 0 ? "text-amber-400" : "text-green-400" },
          { label: "Untracked files", value: diag.untracked.toString(), color: diag.untracked > 0 ? "text-gray-400" : "text-green-400" }
        ].map((s) => /* @__PURE__ */ jsxs("div", { className: "bg-black/20 border border-white/5 rounded-lg px-3 py-2 text-center", children: [
          /* @__PURE__ */ jsx("p", { className: "text-[9px] uppercase tracking-widest text-gray-600 mb-0.5", children: s.label }),
          /* @__PURE__ */ jsx("p", { className: `text-base font-bold font-mono ${s.color}`, children: s.value })
        ] }, s.label)) }),
        diag.totalPending > 0 && /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-amber-500/20 bg-amber-500/6 px-3 py-2 space-y-1", children: [
          /* @__PURE__ */ jsxs("p", { className: "text-amber-400 text-[11px] font-semibold", children: [
            "⚠ ",
            diag.totalPending,
            " uncommitted file(s) detected"
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "text-gray-500 text-[10px] leading-relaxed", children: [
            "These will be ",
            /* @__PURE__ */ jsx("strong", { className: "text-gray-300", children: "auto-committed" }),
            " before pushing. Untracked files in ",
            /* @__PURE__ */ jsx("code", { className: "text-gray-400", children: "data/backups/" }),
            " are ignored via .gitignore."
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-x-4 gap-y-0.5 pt-0.5", children: [
            diag.modified > 0 && /* @__PURE__ */ jsxs("span", { className: "text-amber-400/80 text-[10px] font-mono", children: [
              "M ×",
              diag.modified,
              " modified"
            ] }),
            diag.untracked > 0 && /* @__PURE__ */ jsxs("span", { className: "text-gray-500    text-[10px] font-mono", children: [
              "? ×",
              diag.untracked,
              " untracked (will be added)"
            ] }),
            diag.deleted > 0 && /* @__PURE__ */ jsxs("span", { className: "text-red-400/80  text-[10px] font-mono", children: [
              "D ×",
              diag.deleted,
              " deleted"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-[10px] text-gray-600", children: [
          /* @__PURE__ */ jsx("span", { className: "text-green-400 font-bold", children: "✓" }),
          /* @__PURE__ */ jsx("span", { children: "GitHub token configured" }),
          /* @__PURE__ */ jsx("span", { className: "mx-1 text-gray-700", children: "·" }),
          /* @__PURE__ */ jsx("span", { className: "text-green-400 font-bold", children: "✓" }),
          /* @__PURE__ */ jsx("span", { children: "Repository: peepeepopo91-svg/rupa" }),
          /* @__PURE__ */ jsx("span", { className: "mx-1 text-gray-700", children: "·" }),
          /* @__PURE__ */ jsx("span", { className: "text-green-400 font-bold", children: "✓" }),
          /* @__PURE__ */ jsxs("span", { children: [
            "Branch: ",
            diag.branch
          ] })
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: runFix,
            disabled: fixing || loading,
            className: "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-[#00BFFF] border border-[#00BFFF]/25 bg-[#00BFFF]/8 hover:bg-[#00BFFF]/15 transition-all disabled:opacity-40 disabled:cursor-not-allowed",
            children: fixing ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx("span", { className: "w-3 h-3 border-2 border-[#00BFFF]/30 border-t-[#00BFFF] rounded-full animate-spin" }),
              " Pushing…"
            ] }) : `↑ Push ${diag.ahead} Commit${diag.ahead !== 1 ? "s" : ""} to GitHub`
          }
        )
      ] }),
      diag.totalPending > 0 && diag.ahead === 0 && diag.behind === 0 && !diag.isDiverged && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-amber-500/20 bg-amber-500/4 px-4 py-3 space-y-3", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("p", { className: "text-amber-400 text-xs font-bold mb-1", children: [
            "⚠ ",
            diag.totalPending,
            " uncommitted file(s) in working tree"
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-gray-500 text-[11px] leading-relaxed", children: "These files were written to disk (e.g. credentials.yml, mining-users.json) but not yet committed. Click below to commit and push them to GitHub." })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "space-y-0.5", children: diag.statusLines.map((line, i) => {
          const code = line.slice(0, 2);
          const file = line.slice(3);
          const color = code.includes("M") ? "text-amber-400" : code.includes("D") ? "text-red-400" : code.startsWith("?") ? "text-gray-500" : "text-green-400";
          return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 font-mono text-[10px]", children: [
            /* @__PURE__ */ jsx("span", { className: `shrink-0 font-bold ${color}`, children: code }),
            /* @__PURE__ */ jsx("span", { className: "text-gray-400 truncate", children: file })
          ] }, i);
        }) }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: runFix,
            disabled: fixing || loading,
            className: "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-amber-400 border border-amber-500/25 bg-amber-500/8 hover:bg-amber-500/15 transition-all disabled:opacity-40 disabled:cursor-not-allowed",
            children: fixing ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx("span", { className: "w-3 h-3 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" }),
              " Committing & pushing…"
            ] }) : "↑ Commit & Push to GitHub"
          }
        )
      ] }),
      fixLog.length > 0 && /* @__PURE__ */ jsxs(
        "div",
        {
          ref: logRef,
          className: `rounded-xl border px-4 py-3 space-y-1 max-h-48 overflow-y-auto ${fixOk === false ? "border-red-500/20 bg-red-500/4" : fixOk === true ? "border-green-500/20 bg-green-500/4" : "border-white/8 bg-black/30"}`,
          children: [
            /* @__PURE__ */ jsx("p", { className: `text-[9px] uppercase tracking-widest mb-2 ${fixOk === false ? "text-red-500" : fixOk === true ? "text-green-500" : "text-gray-600"}`, children: fixOk === true ? "✓ Fix completed" : fixOk === false ? "✗ Fix failed" : "Fix output" }),
            fixLog.map((line, i) => {
              const color = line.startsWith("✓") ? "text-green-400" : line.startsWith("✗") ? "text-red-400" : line.startsWith("→") ? "text-[#00BFFF]" : line.startsWith("  ") ? "text-gray-600" : "text-gray-400";
              return /* @__PURE__ */ jsx("div", { className: `font-mono text-[10px] leading-5 ${color}`, children: line }, i);
            })
          ]
        }
      ),
      !hasIssue && jsonAllOk && diag.totalPending === 0 && /* @__PURE__ */ jsx("p", { className: "text-green-400 text-sm text-center py-1", children: "✓ Local git is fully synchronized with origin/main" }),
      diag.fetchError && /* @__PURE__ */ jsxs("p", { className: "text-amber-400/60 text-[10px] font-mono", children: [
        "Fetch warning: ",
        diag.fetchError
      ] })
    ] }),
    loading && !diag && /* @__PURE__ */ jsx("div", { className: "px-6 py-8 text-center text-gray-600 text-sm animate-pulse", children: "Running git fetch + status…" })
  ] });
}
function AdvancedGitPanel() {
  const [log, setLog] = useState([]);
  const [running, setRunning] = useState(null);
  const [showConfirm, setShowConfirm] = useState(null);
  const logRef = useRef(null);
  function push(msg, kind = "info") {
    const line = { ts: hms(), msg, kind };
    setLog((prev) => [...prev, line]);
    setTimeout(() => logRef.current?.scrollTo({ top: 99999, behavior: "smooth" }), 30);
  }
  async function runOp(op, fn) {
    setRunning(op);
    setLog([]);
    try {
      await fn();
    } finally {
      setRunning(null);
    }
  }
  const ops = [
    {
      label: "Fetch",
      icon: "⬇",
      id: "fetch",
      description: "Check for new remote commits",
      action: () => runOp("fetch", async () => {
        push("Fetching origin…", "step");
        const commits = await fetchCommitHistory();
        const top = commits[0];
        push(`Remote HEAD: ${top.shortSha} — "${top.message}"`, "ok");
        push(`Author: ${top.author} · ${fmtDate(top.date)}`, "dim");
        push(`${commits.length} commits total on branch main`, "info");
      })
    },
    {
      label: "Pull",
      icon: "⬇⬇",
      id: "pull",
      description: "Download remote files to disk",
      action: () => runOp("pull", async () => {
        push("Pulling remote files to local disk…", "step");
        const result = await pullRemoteFiles();
        result.pulled.forEach((f) => push(`  ✓ Pulled ${f}`, "ok"));
        push(`Pull complete — ${result.pulled.length} file(s) updated`, "ok");
      })
    },
    {
      label: "Status",
      icon: "📊",
      id: "status",
      description: "Compare local files to remote",
      action: () => runOp("status", async () => {
        push("Checking repository status…", "step");
        const cmp = await compareLocalToRemote();
        push(`Branch: main  Repository: peepeepopo91-svg/rupa`, "info");
        push("", "dim");
        cmp.forEach((c) => {
          if (c.isSame) push(`  = ${c.file} (up to date)`, "dim");
          else push(`  M ${c.file} (modified — local differs from remote)`, "warn");
        });
        const dirty = cmp.filter((c) => !c.isSame);
        push("", "dim");
        push(
          dirty.length === 0 ? "Working tree clean. Nothing to push." : `${dirty.length} file(s) modified — use "Push Changes" to sync.`,
          dirty.length === 0 ? "ok" : "warn"
        );
      })
    },
    {
      label: "View Log",
      icon: "📜",
      id: "log",
      description: "Show last 10 commits",
      action: () => runOp("log", async () => {
        push("Fetching commit log…", "step");
        const commits = await fetchCommitHistory();
        push(`Commit log for peepeepopo91-svg/rupa@main:`, "info");
        push("", "dim");
        commits.slice(0, 10).forEach((c) => {
          push(`${c.shortSha}  ${c.message.slice(0, 55).padEnd(55)}  ${fmtDate(c.date)}`, "info");
        });
      })
    },
    {
      label: "View Diff",
      icon: "🔀",
      id: "diff",
      description: "Show local vs remote differences",
      action: () => runOp("diff", async () => {
        push("Comparing local to remote…", "step");
        const cmp = await compareLocalToRemote();
        const changed = cmp.filter((c) => !c.isSame);
        if (changed.length === 0) {
          push("No differences — local matches remote exactly.", "ok");
          return;
        }
        changed.forEach((c) => {
          push(`--- remote/${c.repoPath}  (${c.remoteBytes} bytes)`, "dim");
          push(`+++ local/${c.file}  (${c.localBytes} bytes)`, "ok");
          const delta = c.localBytes - c.remoteBytes;
          push(`  Size delta: ${delta > 0 ? "+" : ""}${delta} bytes`, "info");
        });
        push(`${changed.length} file(s) differ from remote.`, "warn");
      })
    },
    {
      label: "Reset (soft)",
      icon: "↺",
      id: "reset-soft",
      description: "Pull remote files to disk (keeps local changes flagged as dirty)",
      confirm: "This will overwrite your local data files with the remote versions. Your localStorage edits may differ. Proceed?",
      action: () => runOp("reset-soft", async () => {
        push("Soft reset: pulling remote files to disk…", "step");
        const result = await pullRemoteFiles();
        result.pulled.forEach((f) => push(`  ✓ Restored ${f} from remote`, "ok"));
        push("Soft reset complete. Local files now match remote.", "ok");
        push("Reload the admin panel to re-sync UI state.", "info");
      })
    },
    {
      label: "Reset (mixed)",
      icon: "↺↺",
      id: "reset-mixed",
      description: "Pull remote + clear all pending changes",
      confirm: "This will overwrite local data files with remote content AND clear all pending (dirty) changes. Any unsaved local edits will be lost. Proceed?",
      action: () => runOp("reset-mixed", async () => {
        push("Mixed reset: pulling remote files and clearing pending changes…", "step");
        const result = await pullRemoteFiles();
        result.pulled.forEach((f) => push(`  ✓ Restored ${f} from remote`, "ok"));
        clearDirty();
        push("All pending changes cleared.", "ok");
        push("Mixed reset complete. Reload the page to refresh UI state.", "ok");
      })
    }
  ];
  return /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2", children: ops.map((op) => /* @__PURE__ */ jsxs(
      "button",
      {
        disabled: running !== null,
        onClick: () => {
          if (op.confirm) {
            setShowConfirm(op.id);
            return;
          }
          op.action();
        },
        className: `flex flex-col items-start gap-1 p-3 rounded-xl border text-left transition-all disabled:opacity-40 disabled:cursor-not-allowed ${running === op.id ? "border-[#00BFFF]/30 bg-[#00BFFF]/5 text-[#00BFFF]" : "border-white/8 bg-white/1 hover:border-white/15 hover:bg-white/3 text-gray-300"}`,
        children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("span", { className: "text-sm", children: op.icon }),
            running === op.id && /* @__PURE__ */ jsx("span", { className: "w-3 h-3 border-2 border-[#00BFFF]/30 border-t-[#00BFFF] rounded-full animate-spin" })
          ] }),
          /* @__PURE__ */ jsx("span", { className: "text-xs font-bold", children: op.label }),
          /* @__PURE__ */ jsx("span", { className: "text-[10px] text-gray-600 leading-tight", children: op.description })
        ]
      },
      op.id
    )) }),
    log.length > 0 && /* @__PURE__ */ jsxs(
      "div",
      {
        ref: logRef,
        className: "h-48 overflow-y-auto bg-black/50 border border-white/6 rounded-xl p-3 space-y-0.5",
        children: [
          log.map((l, i) => /* @__PURE__ */ jsx(LogEntry, { line: l }, i)),
          running && /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2 font-mono text-[11px] text-gray-600", children: /* @__PURE__ */ jsx("span", { className: "animate-pulse", children: "▌" }) })
        ]
      }
    ),
    showConfirm && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm", children: /* @__PURE__ */ jsxs("div", { className: "glass rounded-2xl border border-amber-500/20 p-6 max-w-sm w-full", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-amber-400 font-bold mb-3", children: "⚠ Confirm Operation" }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-300 text-sm mb-5 leading-relaxed", children: ops.find((o) => o.id === showConfirm)?.confirm }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
        /* @__PURE__ */ jsx("button", { onClick: () => setShowConfirm(null), className: "flex-1 py-2.5 rounded-xl text-sm text-gray-400 border border-white/10 hover:bg-white/5", children: "Cancel" }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => {
              const op = ops.find((o) => o.id === showConfirm);
              setShowConfirm(null);
              op?.action();
            },
            className: "flex-1 py-2.5 rounded-xl text-sm font-semibold text-amber-400 border border-amber-500/25 bg-amber-500/8 hover:bg-amber-500/15",
            children: "Proceed"
          }
        )
      ] })
    ] }) })
  ] });
}
function RollbackPanel({ commits }) {
  const [restoring, setRestoring] = useState(null);
  const [preview, setPreview] = useState(null);
  const [done, setDone] = useState(null);
  const [error, setError] = useState(null);
  async function handleRestore(sha) {
    setRestoring(sha);
    setError(null);
    try {
      const result = await restoreToCommit({ data: { sha } });
      setDone(result.shortSha);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setRestoring(null);
    }
  }
  return /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
    done && /* @__PURE__ */ jsxs("div", { className: "px-4 py-3 rounded-xl bg-green-500/8 border border-green-500/20 text-green-400 text-sm", children: [
      "✓ Restored — new commit ",
      /* @__PURE__ */ jsx("span", { className: "font-mono font-bold", children: done }),
      " created on main. Pull the latest changes to update local files."
    ] }),
    error && /* @__PURE__ */ jsxs("div", { className: "px-4 py-3 rounded-xl bg-red-500/8 border border-red-500/20 text-red-400 text-sm", children: [
      "✗ Restore failed: ",
      error
    ] }),
    /* @__PURE__ */ jsx("div", { className: "divide-y divide-white/5 rounded-xl border border-white/8 overflow-hidden", children: commits.slice(0, 20).map((c) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 px-4 py-3 hover:bg-white/2 transition-colors", children: [
      /* @__PURE__ */ jsx("span", { className: "font-mono text-[#00BFFF] text-xs shrink-0", children: c.shortSha }),
      /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsx("p", { className: "text-white text-xs font-medium truncate", children: c.message }),
        /* @__PURE__ */ jsxs("p", { className: "text-gray-600 text-[10px] mt-0.5", children: [
          c.author,
          " · ",
          fmtDate(c.date)
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-1.5 shrink-0", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setPreview(preview === c.sha ? null : c.sha),
            className: "px-2.5 py-1 rounded-lg text-[10px] text-gray-400 border border-white/10 hover:bg-white/5 transition-all",
            children: "Preview"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            disabled: !!restoring,
            onClick: () => handleRestore(c.sha),
            className: "px-2.5 py-1 rounded-lg text-[10px] text-amber-400 border border-amber-500/20 hover:bg-amber-500/8 disabled:opacity-40 transition-all",
            children: restoring === c.sha ? "…" : "Restore"
          }
        )
      ] })
    ] }, c.sha)) }),
    preview && /* @__PURE__ */ jsxs("div", { className: "px-4 py-3 rounded-xl bg-white/2 border border-white/8 text-xs font-mono text-gray-400", children: [
      /* @__PURE__ */ jsxs("p", { className: "text-gray-600 mb-1 uppercase tracking-widest text-[9px]", children: [
        "Preview: ",
        preview.slice(0, 7)
      ] }),
      /* @__PURE__ */ jsxs("p", { children: [
        "Restore will create a ",
        /* @__PURE__ */ jsx("strong", { className: "text-white", children: "new commit" }),
        " on branch main that points to"
      ] }),
      /* @__PURE__ */ jsxs("p", { children: [
        "the file tree of commit ",
        /* @__PURE__ */ jsx("span", { className: "text-[#00BFFF]", children: preview.slice(0, 7) }),
        "."
      ] }),
      /* @__PURE__ */ jsx("p", { children: "This does not rewrite history — it is safe to do at any time." }),
      /* @__PURE__ */ jsx("button", { onClick: () => setPreview(null), className: "mt-2 text-gray-600 hover:text-gray-400", children: "✕ Close" })
    ] })
  ] });
}
function SyncHistoryPanel({ history }) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(history.length / SYNC_HISTORY_PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedHistory = history.slice((safePage - 1) * SYNC_HISTORY_PAGE_SIZE, safePage * SYNC_HISTORY_PAGE_SIZE);
  if (history.length === 0) {
    return /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-sm py-4 text-center", children: "No sync history yet. Push to GitHub to create your first entry." });
  }
  return /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-white/8 overflow-hidden", children: [
      /* @__PURE__ */ jsxs("div", { className: "hidden sm:grid grid-cols-[110px_80px_1fr_140px_70px_80px] gap-2 px-4 py-2 border-b border-white/5 text-[9px] text-gray-600 uppercase tracking-widest", children: [
        /* @__PURE__ */ jsx("span", { children: "Date" }),
        /* @__PURE__ */ jsx("span", { children: "Commit" }),
        /* @__PURE__ */ jsx("span", { children: "Message" }),
        /* @__PURE__ */ jsx("span", { children: "Files" }),
        /* @__PURE__ */ jsx("span", { children: "Status" }),
        /* @__PURE__ */ jsx("span", { children: "Duration" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "divide-y divide-white/5", children: pagedHistory.map((h) => /* @__PURE__ */ jsxs("div", { className: "grid sm:grid-cols-[110px_80px_1fr_140px_70px_80px] gap-2 px-4 py-3 items-center", children: [
        /* @__PURE__ */ jsx("span", { className: "text-[10px] text-gray-500", children: fmtDate(h.date) }),
        /* @__PURE__ */ jsx("span", { className: "font-mono text-[#00BFFF] text-[10px]", children: h.commitHash.slice(0, 7) }),
        /* @__PURE__ */ jsx("span", { className: "text-gray-300 text-[11px] truncate", children: h.commitMessage }),
        /* @__PURE__ */ jsx("span", { className: "text-gray-600 text-[10px] truncate", children: h.filesChanged.join(", ") }),
        /* @__PURE__ */ jsx("span", { className: `text-[10px] font-bold ${h.status === "success" ? "text-green-400" : "text-red-400"}`, children: h.status === "success" ? "✓ OK" : "✗ Fail" }),
        /* @__PURE__ */ jsxs("span", { className: "text-gray-600 text-[10px]", children: [
          (h.durationMs / 1e3).toFixed(1),
          "s"
        ] })
      ] }, h.id)) })
    ] }),
    /* @__PURE__ */ jsx(
      AdminPaginator,
      {
        page: safePage,
        totalPages,
        totalItems: history.length,
        pageSize: SYNC_HISTORY_PAGE_SIZE,
        onPageChange: setPage
      }
    )
  ] });
}
function TokenManagerPanel() {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [show, setShow] = useState(false);
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [saveMsg, setSaveMsg] = useState(null);
  const [clearMsg, setClearMsg] = useState(null);
  const [confirmClear, setConfirmClear] = useState(false);
  async function refresh() {
    setLoading(true);
    try {
      setInfo(await getTokenInfo());
    } catch {
      setInfo(null);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    refresh();
  }, []);
  function handleInput(v) {
    setInput(v);
    setTestResult(null);
    setSaveMsg(null);
    setClearMsg(null);
  }
  async function handleTest() {
    if (!input.trim()) return;
    setTesting(true);
    setTestResult(null);
    try {
      setTestResult(await testGitHubToken({ data: { token: input.trim() } }));
    } catch (e) {
      setTestResult({ valid: false, error: e instanceof Error ? e.message : "Error", username: null, avatarUrl: null, name: null, scopes: null, hasRepoScope: false, rateLimit: null });
    } finally {
      setTesting(false);
    }
  }
  async function handleSave() {
    if (!input.trim()) return;
    setSaving(true);
    setSaveMsg(null);
    try {
      await saveGitHubToken({ data: { token: input.trim() } });
      setSaveMsg("✓ Token saved — active immediately and persists across restarts.");
      setInput("");
      setTestResult(null);
      await refresh();
    } catch (e) {
      setSaveMsg(`✗ Save failed: ${e instanceof Error ? e.message : "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  }
  async function handleClear() {
    setClearing(true);
    setClearMsg(null);
    setConfirmClear(false);
    try {
      const r = await clearGitHubToken();
      if (r.wasInFile) {
        setClearMsg("✓ Token removed from credentials.yml.");
      } else {
        setClearMsg("ℹ Token was set via Replit Secret (environment variable) — it cannot be removed here. Remove it from the Replit Secrets panel instead.");
      }
      await refresh();
    } catch (e) {
      setClearMsg(`✗ Clear failed: ${e instanceof Error ? e.message : "Unknown error"}`);
    } finally {
      setClearing(false);
    }
  }
  const canSave = !!input.trim() && testResult?.valid === true;
  const canTest = !!input.trim() && !testing;
  return /* @__PURE__ */ jsxs("div", { className: "glass rounded-2xl border border-white/8 overflow-hidden", children: [
    /* @__PURE__ */ jsxs("div", { className: "px-6 py-4 border-b border-white/5 flex items-center gap-3", children: [
      /* @__PURE__ */ jsx("span", { className: "text-base", children: "🔑" }),
      /* @__PURE__ */ jsx("h3", { className: "font-['Space_Grotesk'] font-bold text-white text-sm", children: "Token Management" }),
      /* @__PURE__ */ jsx("span", { className: "text-gray-600 text-[10px] ml-0.5", children: "Manage your GitHub Personal Access Token" }),
      /* @__PURE__ */ jsxs("div", { className: "ml-auto flex items-center gap-2", children: [
        loading && /* @__PURE__ */ jsx("span", { className: "text-gray-600 text-xs animate-pulse", children: "Loading…" }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: refresh,
            disabled: loading,
            className: "px-3 py-1.5 rounded-lg text-[10px] text-gray-500 border border-white/8 hover:border-white/15 hover:text-gray-300 transition-all disabled:opacity-40",
            children: "↻ Refresh"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "px-6 py-5 space-y-5", children: [
      /* @__PURE__ */ jsxs("div", { className: `rounded-xl border px-4 py-4 space-y-3 ${!info || !info.configured ? "border-red-500/20 bg-red-500/4" : info.invalid ? "border-amber-500/20 bg-amber-500/4" : "border-green-500/15 bg-green-500/3"}`, children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 flex-wrap", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("span", { className: `w-2 h-2 rounded-full shrink-0 ${!info || !info.configured ? "bg-red-400 animate-pulse" : info.invalid ? "bg-amber-400 animate-pulse" : "bg-green-400"}` }),
            /* @__PURE__ */ jsx("span", { className: `text-sm font-bold ${!info || !info.configured ? "text-red-400" : info.invalid ? "text-amber-400" : "text-green-400"}`, children: loading ? "…" : !info || !info.configured ? "Not configured" : info.invalid ? "Token invalid" : "Configured ✓" })
          ] }),
          info?.source && /* @__PURE__ */ jsx("span", { className: `px-2 py-0.5 rounded-full text-[10px] font-bold border ${info.source === "env" ? "text-purple-400 border-purple-500/25 bg-purple-500/8" : "text-[#00BFFF] border-[#00BFFF]/25 bg-[#00BFFF]/8"}`, children: info.source === "env" ? "⚙ Replit Secret" : "📄 Panel (credentials.yml)" }),
          info?.maskedToken && /* @__PURE__ */ jsx("span", { className: "font-mono text-[11px] text-gray-500 bg-white/3 border border-white/8 rounded px-2 py-0.5", children: info.maskedToken })
        ] }),
        info?.valid && info.username && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 flex-wrap", children: [
          info.avatarUrl && /* @__PURE__ */ jsx("img", { src: info.avatarUrl, alt: "", className: "w-7 h-7 rounded-full border border-white/10" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("span", { className: "text-white text-sm font-semibold", children: [
              "@",
              info.username
            ] }),
            info.name && /* @__PURE__ */ jsx("span", { className: "text-gray-500 text-xs ml-2", children: info.name })
          ] }),
          info.rateLimit && /* @__PURE__ */ jsxs("span", { className: "text-gray-500 text-[10px] ml-auto", children: [
            "API: ",
            info.rateLimit.remaining.toLocaleString(),
            " / ",
            info.rateLimit.limit.toLocaleString(),
            " calls left"
          ] })
        ] }),
        info?.valid && info.scopes && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600 text-[10px] uppercase tracking-widest", children: "Scopes" }),
          info.scopes.split(",").map((s) => s.trim()).filter(Boolean).map((s) => /* @__PURE__ */ jsx("span", { className: `px-1.5 py-0.5 rounded text-[10px] font-mono border ${s === "repo" ? "text-green-400 border-green-500/25 bg-green-500/8" : "text-gray-400 border-white/8 bg-white/3"}`, children: s }, s)),
          !info.hasRepoScope && /* @__PURE__ */ jsxs("span", { className: "text-amber-400 text-[10px]", children: [
            "⚠ Missing ",
            /* @__PURE__ */ jsx("code", { className: "font-mono", children: "repo" }),
            " scope — push will fail"
          ] })
        ] }),
        info?.invalid && /* @__PURE__ */ jsx("p", { className: "text-amber-400 text-xs", children: "Token is set but GitHub rejected it — it may be expired or revoked. Enter a new token below." }),
        !loading && info && !info.configured && /* @__PURE__ */ jsx("p", { className: "text-gray-500 text-xs", children: "No token found. Enter your GitHub Personal Access Token below to enable sync." })
      ] }),
      (!info?.configured || info?.invalid) && !loading && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-white/6 bg-white/1 px-4 py-3 space-y-1.5", children: [
        /* @__PURE__ */ jsx("p", { className: "text-gray-400 text-xs font-semibold", children: "How to get a token" }),
        /* @__PURE__ */ jsxs("ol", { className: "text-gray-500 text-[11px] leading-relaxed list-decimal list-inside space-y-0.5", children: [
          /* @__PURE__ */ jsxs("li", { children: [
            "Go to ",
            /* @__PURE__ */ jsx("span", { className: "text-[#00BFFF] font-mono", children: "github.com → Settings → Developer settings → Personal access tokens → Tokens (classic)" })
          ] }),
          /* @__PURE__ */ jsxs("li", { children: [
            "Click ",
            /* @__PURE__ */ jsx("span", { className: "text-white font-semibold", children: "Generate new token (classic)" })
          ] }),
          /* @__PURE__ */ jsxs("li", { children: [
            "Check the ",
            /* @__PURE__ */ jsx("span", { className: "text-green-400 font-mono font-bold", children: "repo" }),
            " scope (required for push)"
          ] }),
          /* @__PURE__ */ jsx("li", { children: "Copy the token and paste it below" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsx("p", { className: "text-gray-400 text-xs font-semibold uppercase tracking-widest", children: info?.configured ? "Replace Token" : "Set Token" }),
        /* @__PURE__ */ jsx("div", { className: "flex gap-2", children: /* @__PURE__ */ jsxs("div", { className: "flex-1 relative", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: show ? "text" : "password",
              value: input,
              onChange: (e) => handleInput(e.target.value),
              onKeyDown: (e) => {
                if (e.key === "Enter" && canTest) handleTest();
              },
              placeholder: "ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
              className: "w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-mono text-white placeholder-gray-700 focus:outline-none focus:border-[#00BFFF]/40 transition-colors pr-16",
              spellCheck: false,
              autoComplete: "off"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setShow((v) => !v),
              className: "absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-500 hover:text-gray-300 transition-colors px-1",
              children: show ? "Hide" : "Show"
            }
          )
        ] }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: handleTest,
              disabled: !canTest,
              className: "flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-gray-300 border border-white/12 bg-white/3 hover:bg-white/6 hover:border-white/20 transition-all disabled:opacity-35 disabled:cursor-not-allowed",
              children: testing ? /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx("span", { className: "w-3 h-3 border-2 border-gray-400/30 border-t-gray-300 rounded-full animate-spin" }),
                "Testing…"
              ] }) : "🔍 Test Token"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: handleSave,
              disabled: !canSave || saving,
              title: !testResult?.valid ? "Test the token first" : "",
              className: "flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white border border-[#00BFFF]/30 bg-[#00BFFF]/10 hover:bg-[#00BFFF]/18 transition-all disabled:opacity-35 disabled:cursor-not-allowed",
              children: saving ? /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx("span", { className: "w-3 h-3 border-2 border-[#00BFFF]/30 border-t-[#00BFFF] rounded-full animate-spin" }),
                "Saving…"
              ] }) : "💾 Save Token"
            }
          ),
          info?.configured && /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setConfirmClear(true),
              disabled: clearing,
              className: "flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-red-400 border border-red-500/20 bg-red-500/5 hover:bg-red-500/12 transition-all disabled:opacity-35 disabled:cursor-not-allowed ml-auto",
              children: clearing ? /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx("span", { className: "w-3 h-3 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" }),
                "Clearing…"
              ] }) : "🗑 Clear Token"
            }
          )
        ] }),
        input.trim() && !testResult && /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-[10px]", children: "Test the token first — Save unlocks after a successful test." })
      ] }),
      testResult && /* @__PURE__ */ jsx("div", { className: `rounded-xl border px-4 py-3 space-y-2 ${testResult.valid ? "border-green-500/20 bg-green-500/4" : "border-red-500/20 bg-red-500/4"}`, children: testResult.valid ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          testResult.avatarUrl && /* @__PURE__ */ jsx("img", { src: testResult.avatarUrl, alt: "", className: "w-6 h-6 rounded-full border border-white/10" }),
          /* @__PURE__ */ jsx("span", { className: "text-green-400 text-sm font-bold", children: "✓ Token valid" }),
          /* @__PURE__ */ jsxs("span", { className: "text-gray-300 text-xs", children: [
            "@",
            testResult.username
          ] }),
          testResult.name && /* @__PURE__ */ jsx("span", { className: "text-gray-500 text-xs", children: testResult.name })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
          testResult.rateLimit && /* @__PURE__ */ jsxs("span", { className: "text-gray-500 text-[10px]", children: [
            testResult.rateLimit.remaining.toLocaleString(),
            " / ",
            testResult.rateLimit.limit.toLocaleString(),
            " API calls remaining"
          ] }),
          testResult.scopes && /* @__PURE__ */ jsxs("span", { className: "text-gray-600 text-[10px]", children: [
            "Scopes: ",
            /* @__PURE__ */ jsx("span", { className: "text-gray-400 font-mono", children: testResult.scopes || "(none)" })
          ] })
        ] }),
        !testResult.hasRepoScope && /* @__PURE__ */ jsxs("p", { className: "text-amber-400 text-[11px] font-semibold", children: [
          "⚠ This token is missing the ",
          /* @__PURE__ */ jsx("code", { className: "font-mono", children: "repo" }),
          " scope — it won't be able to push commits. Regenerate with the ",
          /* @__PURE__ */ jsx("code", { className: "font-mono", children: "repo" }),
          " checkbox enabled."
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-green-400/70 text-[10px]", children: "↑ Click Save Token to apply." })
      ] }) : /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "text-red-400 text-sm font-bold", children: "✗ Token invalid" }),
        testResult.error && /* @__PURE__ */ jsx("p", { className: "text-red-400/70 text-[11px] mt-1", children: testResult.error })
      ] }) }),
      saveMsg && /* @__PURE__ */ jsx("div", { className: `rounded-xl border px-4 py-2.5 text-[11px] ${saveMsg.startsWith("✓") ? "border-green-500/20 bg-green-500/4 text-green-400" : "border-red-500/20 bg-red-500/4 text-red-400"}`, children: saveMsg }),
      clearMsg && /* @__PURE__ */ jsx("div", { className: `rounded-xl border px-4 py-2.5 text-[11px] ${clearMsg.startsWith("✓") ? "border-green-500/20 bg-green-500/4 text-green-400" : clearMsg.startsWith("ℹ") ? "border-blue-500/20 bg-blue-500/4 text-blue-300" : "border-red-500/20 bg-red-500/4 text-red-400"}`, children: clearMsg }),
      /* @__PURE__ */ jsx("div", { className: "rounded-xl border border-white/5 bg-white/1 px-4 py-3", children: /* @__PURE__ */ jsxs("p", { className: "text-gray-600 text-[10px] leading-relaxed", children: [
        /* @__PURE__ */ jsx("span", { className: "text-gray-500 font-semibold", children: "Security: " }),
        "Tokens saved here are stored in ",
        /* @__PURE__ */ jsx("span", { className: "font-mono text-gray-400", children: "credentials.yml" }),
        " on the server filesystem and never sent to the browser. For maximum security, set ",
        /* @__PURE__ */ jsx("span", { className: "font-mono text-gray-400", children: "GITHUB_TOKEN" }),
        " as a Replit Secret instead — environment variables always take precedence over the panel-saved token."
      ] }) })
    ] }),
    confirmClear && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm", children: /* @__PURE__ */ jsxs("div", { className: "glass rounded-2xl border border-red-500/20 p-6 max-w-sm w-full", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-red-400 font-bold mb-3", children: "Remove GitHub Token?" }),
      /* @__PURE__ */ jsxs("p", { className: "text-gray-300 text-sm mb-5 leading-relaxed", children: [
        "This will remove the token from ",
        /* @__PURE__ */ jsx("span", { className: "font-mono text-gray-200", children: "credentials.yml" }),
        ". GitHub sync features will stop working until a new token is set."
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
        /* @__PURE__ */ jsx("button", { onClick: () => setConfirmClear(false), className: "flex-1 py-2.5 rounded-xl text-sm text-gray-400 border border-white/10 hover:bg-white/5", children: "Cancel" }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: handleClear,
            className: "flex-1 py-2.5 rounded-xl text-sm font-semibold text-red-400 border border-red-500/25 bg-red-500/8 hover:bg-red-500/15",
            children: "Remove Token"
          }
        )
      ] })
    ] }) })
  ] });
}
function GitHubSyncCenter({ admin: _admin }) {
  const sync = useSyncState();
  const [repoStatus, setRepoStatus] = useState(null);
  const [connChecks, setConnChecks] = useState(null);
  const [commits, setCommits] = useState([]);
  const [syncHistory, setSyncHistory] = useState([]);
  const [, setTick] = useState(0);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [rollbackOpen, setRollbackOpen] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncLog, setSyncLog] = useState([]);
  const [syncOk, setSyncOk] = useState(null);
  const syncLogRef = useRef(null);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 3e4);
    return () => clearInterval(id);
  }, []);
  const refresh = useCallback(async () => {
    setLoadingStatus(true);
    try {
      const [status, conn, hist] = await Promise.all([
        fetchRepoStatus(),
        checkGitHubConnection(),
        fetchSyncHistory()
      ]);
      setRepoStatus(status);
      setConnChecks(conn);
      setSyncHistory(hist);
    } catch {
    } finally {
      setLoadingStatus(false);
    }
  }, []);
  useEffect(() => {
    refresh();
  }, [refresh]);
  async function loadCommits() {
    try {
      const c = await fetchCommitHistory();
      setCommits(c);
    } catch {
    }
  }
  useEffect(() => {
    if (rollbackOpen && commits.length === 0) loadCommits();
  }, [rollbackOpen]);
  async function runSync() {
    setSyncing(true);
    setSyncLog([]);
    setSyncOk(null);
    try {
      const dirty = getDirty();
      if (dirty.size > 0) {
        const sectionData = {
          players: getPlayers,
          gamemodes: getGamemodes,
          content: getSiteContent,
          event: getEventConfig,
          economy: getEconomyOverrides
        };
        setSyncLog([
          `→ Flushing ${dirty.size} section(s) to disk…`,
          ...[...dirty].map((s) => `  · ${SECTION_LABELS[s] ?? s}`)
        ]);
        const sections = [...dirty].map((section) => ({
          section,
          jsonData: JSON.stringify(sectionData[section](), null, 2)
        }));
        const flushResult = await flushStoresToDisk({ data: { sections } });
        setSyncLog((prev) => [...prev, `✓ Wrote ${flushResult.written.length} file(s) to disk`]);
      }
      setSyncLog((prev) => [...prev, "→ Running git sync (fetch → commit → rebase → push)…"]);
      const result = await fixGitDivergence();
      setSyncLog((prev) => [...prev, ...result.logs]);
      setSyncOk(result.success);
      if (result.success) {
        clearDirty();
        setLastSync(Date.now(), `Git sync · ${(/* @__PURE__ */ new Date()).toLocaleDateString()}`);
        await refresh();
      }
    } catch (e) {
      const raw = e instanceof Error ? e.message : String(e);
      setSyncLog((prev) => [...prev, `✗ Error: ${raw}`]);
      setSyncOk(false);
    } finally {
      setSyncing(false);
      setTimeout(() => syncLogRef.current?.scrollTo({ top: 99999, behavior: "smooth" }), 50);
    }
  }
  const dirtyList = [...sync.dirty];
  const isDirty = sync.isDirty;
  const healthOk = connChecks ? connChecks.tokenExists && connChecks.repoExists && connChecks.branchExists && !isDirty : null;
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6 max-w-4xl", children: [
    /* @__PURE__ */ jsxs("div", { className: "relative glass rounded-2xl border border-white/8 overflow-hidden", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00BFFF] to-[#7C3AED]/60 pointer-events-none" }),
      /* @__PURE__ */ jsx("div", { className: "absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#00BFFF]/3 to-transparent pointer-events-none" }),
      /* @__PURE__ */ jsxs("div", { className: "relative px-6 pt-6 pb-5 flex items-start gap-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "relative shrink-0", children: [
          /* @__PURE__ */ jsx("div", { className: "w-11 h-11 rounded-xl bg-gradient-to-br from-[#00BFFF]/15 to-[#7C3AED]/10 border border-[#00BFFF]/25 flex items-center justify-center shadow-lg shadow-[#00BFFF]/5", children: /* @__PURE__ */ jsx("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "currentColor", className: "text-[#00BFFF]", children: /* @__PURE__ */ jsx("path", { d: "M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.742 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" }) }) }),
          /* @__PURE__ */ jsx("div", { className: `absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-[#0B0F17] ${loadingStatus ? "bg-gray-600" : healthOk === true ? "bg-green-400" : healthOk === false ? "bg-amber-400 animate-pulse" : "bg-gray-600"}` })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsx("h3", { className: "font-['Space_Grotesk'] font-bold text-white text-lg leading-tight tracking-tight", children: "Sync Dashboard" }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mt-1.5 flex-wrap", children: [
            /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/4 border border-white/8 text-[10px] font-mono text-gray-400", children: [
              /* @__PURE__ */ jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-[#00BFFF]/60" }),
              "peepeepopo91-svg/rupa"
            ] }),
            /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-purple-500/8 border border-purple-500/15 text-[10px] font-mono text-purple-400", children: [
              /* @__PURE__ */ jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-purple-400/60" }),
              repoStatus?.branch ?? "main"
            ] }),
            !loadingStatus && healthOk === true && /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-green-500/8 border border-green-500/15 text-[10px] text-green-400 font-medium", children: [
              /* @__PURE__ */ jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" }),
              "Healthy"
            ] }),
            !loadingStatus && healthOk === false && /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/8 border border-amber-500/15 text-[10px] text-amber-400 font-medium", children: [
              /* @__PURE__ */ jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" }),
              "Attention needed"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 shrink-0", children: [
          loadingStatus && /* @__PURE__ */ jsx("span", { className: "text-gray-600 text-[10px] animate-pulse", children: "Refreshing…" }),
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: refresh,
              disabled: loadingStatus,
              className: "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-medium text-gray-500 border border-white/8 hover:border-[#00BFFF]/30 hover:text-[#00BFFF] hover:bg-[#00BFFF]/5 transition-all disabled:opacity-40",
              children: [
                /* @__PURE__ */ jsx("svg", { width: "10", height: "10", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round", className: loadingStatus ? "animate-spin" : "", children: /* @__PURE__ */ jsx("path", { d: "M21 12a9 9 0 1 1-6.219-8.56" }) }),
                "Refresh"
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "border-t border-white/5", children: [
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 divide-y divide-white/4 sm:divide-y-0 sm:divide-x sm:divide-white/4", children: [
          /* @__PURE__ */ jsx(
            SyncStatCell,
            {
              label: "Repository",
              value: "peepeepopo91-svg/rupa",
              valueClass: "text-gray-200 text-[11px]",
              icon: /* @__PURE__ */ jsx("svg", { width: "13", height: "13", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "text-[#00BFFF]", children: /* @__PURE__ */ jsx("path", { d: "M3 3h6l2 4-3 2a12 12 0 0 0 7 7l2-3 4 2v6a1 1 0 0 1-1 1C9.716 21.5 2.5 14.284 2 4a1 1 0 0 1 1-1z" }) }),
              iconBg: "bg-[#00BFFF]/8 border-[#00BFFF]/15"
            }
          ),
          /* @__PURE__ */ jsx(
            SyncStatCell,
            {
              label: "Branch",
              value: repoStatus?.branch ?? "main",
              valueClass: "text-purple-400 font-mono",
              icon: /* @__PURE__ */ jsxs("svg", { width: "13", height: "13", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "text-purple-400", children: [
                /* @__PURE__ */ jsx("line", { x1: "6", y1: "3", x2: "6", y2: "15" }),
                /* @__PURE__ */ jsx("circle", { cx: "18", cy: "6", r: "3" }),
                /* @__PURE__ */ jsx("circle", { cx: "6", cy: "18", r: "3" }),
                /* @__PURE__ */ jsx("path", { d: "M18 9a9 9 0 0 1-9 9" })
              ] }),
              iconBg: "bg-purple-500/8 border-purple-500/15"
            }
          ),
          /* @__PURE__ */ jsx(
            SyncStatCell,
            {
              label: "Latest Commit",
              value: loadingStatus ? "…" : repoStatus?.latestCommit?.sha ?? "—",
              valueClass: "text-[#00BFFF] font-mono text-[11px]",
              icon: /* @__PURE__ */ jsxs("svg", { width: "13", height: "13", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "text-[#00BFFF]", children: [
                /* @__PURE__ */ jsx("circle", { cx: "12", cy: "12", r: "3" }),
                /* @__PURE__ */ jsx("line", { x1: "3", y1: "12", x2: "9", y2: "12" }),
                /* @__PURE__ */ jsx("line", { x1: "15", y1: "12", x2: "21", y2: "12" })
              ] }),
              iconBg: "bg-[#00BFFF]/8 border-[#00BFFF]/15"
            }
          ),
          /* @__PURE__ */ jsx(
            SyncStatCell,
            {
              label: "Last Sync",
              value: sync.lastSyncAt ? timeAgo$3(sync.lastSyncAt) : "—",
              valueClass: sync.lastSyncAt ? "text-[#00BFFF]" : "text-gray-600",
              icon: /* @__PURE__ */ jsxs("svg", { width: "13", height: "13", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "text-sky-400", children: [
                /* @__PURE__ */ jsx("circle", { cx: "12", cy: "12", r: "10" }),
                /* @__PURE__ */ jsx("polyline", { points: "12 6 12 12 16 14" })
              ] }),
              iconBg: "bg-sky-500/8 border-sky-500/15"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 divide-y divide-white/4 sm:divide-y-0 sm:divide-x sm:divide-white/4 border-t border-white/4", children: [
          /* @__PURE__ */ jsx(
            SyncStatCell,
            {
              label: "GitHub User",
              value: loadingStatus ? "…" : connChecks?.username ? `@${connChecks.username}` : "—",
              valueClass: "text-gray-300 text-[11px]",
              icon: /* @__PURE__ */ jsxs("svg", { width: "13", height: "13", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "text-gray-400", children: [
                /* @__PURE__ */ jsx("path", { d: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" }),
                /* @__PURE__ */ jsx("circle", { cx: "12", cy: "7", r: "4" })
              ] }),
              iconBg: "bg-white/5 border-white/10"
            }
          ),
          /* @__PURE__ */ jsx(
            SyncStatCell,
            {
              label: "Token Status",
              value: loadingStatus ? "…" : connChecks?.tokenExists ? "Configured ✓" : "Missing ✗",
              valueClass: connChecks?.tokenExists ? "text-green-400" : "text-red-400",
              icon: /* @__PURE__ */ jsxs("svg", { width: "13", height: "13", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: connChecks?.tokenExists ? "text-green-400" : "text-red-400", children: [
                /* @__PURE__ */ jsx("rect", { x: "3", y: "11", width: "18", height: "11", rx: "2", ry: "2" }),
                /* @__PURE__ */ jsx("path", { d: "M7 11V7a5 5 0 0 1 10 0v4" })
              ] }),
              iconBg: connChecks?.tokenExists ? "bg-green-500/8 border-green-500/20" : "bg-red-500/8 border-red-500/20",
              statusDot: connChecks?.tokenExists ? "green" : connChecks?.tokenExists === false ? "red" : void 0
            }
          ),
          /* @__PURE__ */ jsx(
            SyncStatCell,
            {
              label: "Remote Status",
              value: loadingStatus ? "…" : repoStatus?.connected ? "Reachable ✓" : "Unreachable ✗",
              valueClass: repoStatus?.connected ? "text-green-400" : "text-red-400",
              icon: /* @__PURE__ */ jsxs("svg", { width: "13", height: "13", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: repoStatus?.connected ? "text-green-400" : "text-red-400", children: [
                /* @__PURE__ */ jsx("circle", { cx: "12", cy: "12", r: "10" }),
                /* @__PURE__ */ jsx("line", { x1: "2", y1: "12", x2: "22", y2: "12" }),
                /* @__PURE__ */ jsx("path", { d: "M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" })
              ] }),
              iconBg: repoStatus?.connected ? "bg-green-500/8 border-green-500/20" : "bg-red-500/8 border-red-500/20",
              statusDot: repoStatus?.connected ? "green" : repoStatus?.connected === false ? "red" : void 0
            }
          ),
          /* @__PURE__ */ jsx(
            SyncStatCell,
            {
              label: "Sync Health",
              value: loadingStatus ? "…" : healthOk === true ? "Healthy ✓" : healthOk === false ? "Attention" : "—",
              valueClass: healthOk === true ? "text-green-400" : healthOk === false ? "text-amber-400" : "text-gray-600",
              icon: /* @__PURE__ */ jsx("svg", { width: "13", height: "13", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: healthOk === true ? "text-green-400" : healthOk === false ? "text-amber-400" : "text-gray-500", children: /* @__PURE__ */ jsx("polyline", { points: "22 12 18 12 15 21 9 3 6 12 2 12" }) }),
              iconBg: healthOk === true ? "bg-green-500/8 border-green-500/20" : healthOk === false ? "bg-amber-500/8 border-amber-500/20" : "bg-white/5 border-white/10",
              statusDot: healthOk === true ? "green" : healthOk === false ? "amber" : void 0,
              pulse: healthOk === false
            }
          )
        ] })
      ] }),
      repoStatus?.latestCommit?.message && /* @__PURE__ */ jsxs("div", { className: "border-t border-white/5 bg-black/25 px-6 py-3 flex items-center gap-3 min-w-0", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 shrink-0", children: [
          /* @__PURE__ */ jsxs("svg", { width: "11", height: "11", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "text-[#00BFFF]/60", children: [
            /* @__PURE__ */ jsx("circle", { cx: "12", cy: "12", r: "3" }),
            /* @__PURE__ */ jsx("line", { x1: "3", y1: "12", x2: "9", y2: "12" }),
            /* @__PURE__ */ jsx("line", { x1: "15", y1: "12", x2: "21", y2: "12" })
          ] }),
          /* @__PURE__ */ jsx("span", { className: "text-[9px] uppercase tracking-widest text-gray-600 font-medium", children: "Latest commit" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "w-px h-3 bg-white/8 shrink-0" }),
        /* @__PURE__ */ jsx("span", { className: "text-[11px] font-mono text-gray-400 truncate flex-1", children: repoStatus.latestCommit.message }),
        repoStatus.latestCommit.date && /* @__PURE__ */ jsx("span", { className: "text-[10px] text-gray-700 tabular-nums shrink-0", children: timeAgo$3(repoStatus.latestCommit.date) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: `glass rounded-2xl border overflow-hidden ${isDirty ? "border-amber-500/20" : "border-white/8"}`, children: [
      /* @__PURE__ */ jsxs("div", { className: "px-6 py-4 border-b border-white/5 flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: `w-2 h-2 rounded-full ${isDirty ? "bg-amber-400 animate-pulse" : "bg-green-400"}` }),
        /* @__PURE__ */ jsx("h3", { className: "font-['Space_Grotesk'] font-semibold text-white text-sm", children: "Local Changes" }),
        /* @__PURE__ */ jsx("span", { className: `ml-auto text-xs font-bold ${isDirty ? "text-amber-400" : "text-green-400"}`, children: isDirty ? `${dirtyList.length} section${dirtyList.length !== 1 ? "s" : ""} modified` : "All sections committed" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "px-6 py-4 space-y-4", children: isDirty ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("div", { className: "space-y-1.5", children: dirtyList.map((s) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2.5", children: [
          /* @__PURE__ */ jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-amber-400/70 shrink-0" }),
          /* @__PURE__ */ jsx("span", { className: "text-gray-300 text-sm", children: SECTION_LABELS[s] ?? s }),
          /* @__PURE__ */ jsx("span", { className: "text-amber-500/60 text-[10px] uppercase tracking-widest ml-auto", children: "modified" })
        ] }, s)) }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: runSync,
            disabled: syncing,
            className: "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-amber-500/20 to-amber-600/20 border border-amber-500/35 hover:from-amber-500/30 hover:to-amber-600/30 hover:border-amber-500/55 transition-all disabled:opacity-40 disabled:cursor-not-allowed",
            children: syncing ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx("span", { className: "w-3.5 h-3.5 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" }),
              " Syncing to GitHub…"
            ] }) : "↑ Commit & Push to GitHub"
          }
        ),
        syncLog.length > 0 && /* @__PURE__ */ jsxs(
          "div",
          {
            ref: syncLogRef,
            className: `rounded-xl border px-4 py-3 space-y-1 max-h-48 overflow-y-auto ${syncOk === false ? "border-red-500/20 bg-red-500/4" : syncOk === true ? "border-green-500/20 bg-green-500/4" : "border-white/8 bg-black/30"}`,
            children: [
              /* @__PURE__ */ jsx("p", { className: `text-[9px] uppercase tracking-widest mb-2 ${syncOk === false ? "text-red-500" : syncOk === true ? "text-green-500" : "text-gray-600"}`, children: syncOk === true ? "✓ Sync complete" : syncOk === false ? "✗ Sync failed" : "Sync output" }),
              syncLog.map((line, i) => {
                const color = line.startsWith("✓") ? "text-green-400" : line.startsWith("✗") ? "text-red-400" : line.startsWith("→") ? "text-[#00BFFF]" : line.startsWith("  ") ? "text-gray-600" : "text-gray-400";
                return /* @__PURE__ */ jsx("div", { className: `font-mono text-[10px] leading-5 ${color}`, children: line }, i);
              })
            ]
          }
        )
      ] }) : /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-sm", children: "No pending changes. Repository is synchronized." }) })
    ] }),
    /* @__PURE__ */ jsx(GitDiagnosticsPanel, {}),
    /* @__PURE__ */ jsx(AutoBackupPanel, {}),
    /* @__PURE__ */ jsx(TokenManagerPanel, {}),
    /* @__PURE__ */ jsx(
      CollapsibleSection,
      {
        title: "Sync History",
        subtitle: `${syncHistory.length} sync${syncHistory.length !== 1 ? "s" : ""} recorded`,
        icon: "📋",
        open: historyOpen,
        onToggle: () => setHistoryOpen((v) => !v),
        children: /* @__PURE__ */ jsx(SyncHistoryPanel, { history: syncHistory })
      }
    ),
    /* @__PURE__ */ jsx(
      CollapsibleSection,
      {
        title: "Rollback",
        subtitle: "Restore any previous commit (creates a new commit — history is preserved)",
        icon: "↺",
        open: rollbackOpen,
        onToggle: () => setRollbackOpen((v) => !v),
        accent: "amber",
        children: commits.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-sm py-2", children: "Loading commit history…" }) : /* @__PURE__ */ jsx(RollbackPanel, { commits })
      }
    ),
    /* @__PURE__ */ jsx(
      CollapsibleSection,
      {
        title: "Advanced Git",
        subtitle: "Manual fetch, pull, status, log, diff, and reset operations",
        icon: "⚙",
        open: advancedOpen,
        onToggle: () => setAdvancedOpen((v) => !v),
        children: /* @__PURE__ */ jsx(AdvancedGitPanel, {})
      }
    )
  ] });
}
function SyncStatCell({ label, value, valueClass, icon, iconBg, statusDot, pulse }) {
  return /* @__PURE__ */ jsxs("div", { className: "group relative bg-[#070B12] hover:bg-[#0A0F18] transition-colors px-5 py-4", children: [
    /* @__PURE__ */ jsx("div", { className: "absolute left-0 top-3 bottom-3 w-0.5 rounded-full bg-[#00BFFF] opacity-0 group-hover:opacity-100 transition-opacity" }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
      /* @__PURE__ */ jsx("div", { className: `w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 ${iconBg}`, children: icon }),
      /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
        /* @__PURE__ */ jsx("p", { className: "text-[9px] uppercase tracking-widest text-gray-600 mb-1", children: label }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
          statusDot && /* @__PURE__ */ jsx("span", { className: `w-1.5 h-1.5 rounded-full shrink-0 ${statusDot === "green" ? "bg-green-400" : statusDot === "amber" ? "bg-amber-400" : "bg-red-400"} ${pulse ? "animate-pulse" : ""}` }),
          /* @__PURE__ */ jsx("p", { className: `text-sm font-bold truncate ${valueClass}`, children: value })
        ] })
      ] })
    ] })
  ] });
}
function CollapsibleSection({
  title,
  subtitle,
  icon,
  open,
  onToggle,
  accent = "blue",
  children
}) {
  const accentClass = accent === "amber" ? "border-amber-500/15" : "border-white/8";
  return /* @__PURE__ */ jsxs("div", { className: `glass rounded-2xl border ${accentClass} overflow-hidden`, children: [
    /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: onToggle,
        className: "w-full px-6 py-4 flex items-center gap-3 hover:bg-white/2 transition-colors",
        children: [
          /* @__PURE__ */ jsx("span", { className: "text-base", children: icon }),
          /* @__PURE__ */ jsxs("div", { className: "flex-1 text-left", children: [
            /* @__PURE__ */ jsx("p", { className: "font-['Space_Grotesk'] font-bold text-white text-sm", children: title }),
            /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-[11px] mt-0.5", children: subtitle })
          ] }),
          /* @__PURE__ */ jsx("span", { className: "text-gray-600 text-sm", children: open ? "▲" : "▼" })
        ]
      }
    ),
    open && /* @__PURE__ */ jsx("div", { className: "px-6 pb-6 border-t border-white/5 pt-4", children })
  ] });
}
const getRepoInfo = createServerFn({
  method: "GET"
}).handler(createSsrRpc("c6db069f27f7f8f7aa788b0f630ee3e9cdc9b10047ec1783d1514b41bdd96316"));
const createBackupBranch = createServerFn({
  method: "POST"
}).inputValidator((data) => data).handler(createSsrRpc("e55b1235fdf46314858d060881339fac7151dce5d684eb9dbf8f96d7646daaab"));
const performHistoryReset = createServerFn({
  method: "POST"
}).inputValidator((data) => data).handler(createSsrRpc("33c01341ce43cf38613dc6607b963376084f7df1160b49db15f8398db1d1b1d5"));
function formatDate$1(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch {
    return iso;
  }
}
function timeAgo$2(iso) {
  if (!iso) return "";
  const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1e3);
  if (secs < 60) return "just now";
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
}
function makeTimestamp() {
  const now = /* @__PURE__ */ new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}`;
}
function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
function InfoRow({ label, value, mono = false, dim = false }) {
  return /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-4 py-2.5 border-b border-white/4 last:border-0", children: [
    /* @__PURE__ */ jsx("span", { className: "text-gray-500 text-xs shrink-0 w-36", children: label }),
    /* @__PURE__ */ jsx("span", { className: `text-xs text-right leading-relaxed ${mono ? "font-mono text-[#00BFFF]" : dim ? "text-gray-600" : "text-gray-300"}`, children: value || "—" })
  ] });
}
function CheckRow({ check }) {
  return /* @__PURE__ */ jsxs("div", { className: `flex items-start gap-3 px-4 py-3 rounded-xl border transition-all ${check.loading ? "bg-white/2 border-white/5" : check.ok ? "bg-green-500/5 border-green-500/15" : "bg-red-500/5 border-red-500/20"}`, children: [
    /* @__PURE__ */ jsx("div", { className: `mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold ${check.loading ? "bg-white/5 text-gray-600" : check.ok ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`, children: check.loading ? "·" : check.ok ? "✓" : "✗" }),
    /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
      /* @__PURE__ */ jsx("p", { className: `text-xs font-semibold ${check.loading ? "text-gray-500" : check.ok ? "text-green-300" : "text-red-300"}`, children: check.label }),
      !check.loading && /* @__PURE__ */ jsx("p", { className: "text-[10px] text-gray-600 mt-0.5 leading-snug", children: check.description })
    ] })
  ] });
}
function StepRow({ step, index }) {
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: "flex items-start gap-3 animate-[fadeInUp_0.3s_ease_both]",
      style: { animationDelay: `${index * 80}ms` },
      children: [
        /* @__PURE__ */ jsx("div", { className: `mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold transition-all ${step.status === "pending" ? "bg-white/5 text-gray-700" : step.status === "running" ? "bg-[#00BFFF]/15 text-[#00BFFF] animate-pulse" : step.status === "ok" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`, children: step.status === "pending" ? "·" : step.status === "running" ? "○" : step.status === "ok" ? "✓" : "✗" }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsx("span", { className: `text-xs font-medium ${step.status === "pending" ? "text-gray-600" : step.status === "running" ? "text-[#00BFFF]" : step.status === "ok" ? "text-green-300" : "text-red-300"}`, children: step.label }),
          step.detail && step.status !== "pending" && /* @__PURE__ */ jsx("span", { className: "text-[10px] text-gray-600 font-mono ml-2", children: step.detail })
        ] })
      ]
    }
  );
}
function RepoHistoryManager({ admin: _admin }) {
  const sync = useSyncState();
  const [repoInfo, setRepoInfo] = useState(null);
  const [loadingInfo, setLoadingInfo] = useState(true);
  const [createBackup, setCreateBackup] = useState(true);
  const [commitMsg, setCommitMsg] = useState("Initial commit");
  const [phase, setPhase] = useState("idle");
  const [steps, setSteps] = useState([]);
  const [result, setResult] = useState(null);
  const [runError, setRunError] = useState(null);
  useEffect(() => {
    loadInfo();
  }, []);
  async function loadInfo() {
    setLoadingInfo(true);
    try {
      const info = await getRepoInfo();
      setRepoInfo(info);
    } catch {
      setRepoInfo(null);
    } finally {
      setLoadingInfo(false);
    }
  }
  const safetyChecks = useMemo(() => {
    const loading = loadingInfo;
    const info = repoInfo;
    return [
      {
        id: "auth",
        label: "GitHub authentication available",
        description: info?.authAvailable ? "GITHUB_TOKEN is configured and ready" : "GITHUB_TOKEN is not configured — set it in the GitHub Sync page",
        ok: !!info?.authAvailable,
        loading
      },
      {
        id: "repo",
        label: "Repository accessible",
        description: info?.repoAccessible ? `Connected to ${info.owner}/${info.repo}` : info?.errorMessage ?? "Cannot reach the repository — check your token permissions",
        ok: !!info?.repoAccessible,
        loading
      },
      {
        id: "branch",
        label: "Branch is valid",
        description: info?.repoAccessible ? `Working on branch: ${info?.branch ?? "main"}` : "Could not verify branch — repository must be accessible first",
        ok: !!info?.repoAccessible && !!info?.branch,
        loading
      },
      {
        id: "dirty",
        label: "No unsaved changes",
        description: sync.isDirty ? "You have unsaved changes — push them via GitHub Sync before resetting history" : "All changes are saved and committed to GitHub",
        ok: !sync.isDirty,
        loading: false
      },
      {
        id: "head",
        label: "HEAD commit is present",
        description: info?.headShort ? `Current HEAD: ${info.headShort} — "${info.lastMessage}"` : "Could not resolve HEAD commit",
        ok: !!info?.headShort,
        loading
      }
    ];
  }, [repoInfo, loadingInfo, sync.isDirty]);
  const allChecksPassed = !loadingInfo && safetyChecks.every((c) => c.ok);
  async function runReset() {
    setPhase("running");
    setRunError(null);
    setResult(null);
    const allSteps = [
      { id: "check", label: "Checking repository", status: "pending" },
      { id: "backup", label: "Creating backup branch", status: "pending" },
      { id: "verify", label: "Repository state verified", status: "pending" },
      { id: "tree", label: "Current file tree captured", status: "pending" },
      { id: "commit", label: "Creating new initial commit", status: "pending" },
      { id: "push", label: "Force pushing to GitHub", status: "pending" },
      { id: "verify2", label: "Verifying synchronization", status: "pending" }
    ];
    const withoutBackup = allSteps.filter((s) => s.id !== "backup");
    const initialSteps = createBackup ? allSteps : withoutBackup;
    setSteps(initialSteps);
    function updateStep(id, patch) {
      setSteps((prev) => prev.map((s) => s.id === id ? { ...s, ...patch } : s));
    }
    const timestamp = makeTimestamp();
    const oldCommitCount = repoInfo?.commitCount ?? 0;
    let backupBranchName;
    try {
      updateStep("check", { status: "running" });
      await sleep(300);
      const freshInfo = await getRepoInfo();
      if (!freshInfo.repoAccessible) throw new Error("Repository is not accessible");
      updateStep("check", { status: "ok", detail: `HEAD: ${freshInfo.headShort}` });
      await sleep(200);
      if (createBackup) {
        updateStep("backup", { status: "running" });
        await sleep(300);
        const backupRes = await createBackupBranch({ data: { timestamp } });
        if (!backupRes.success) throw new Error(`Backup failed: ${backupRes.error}`);
        backupBranchName = backupRes.branchName;
        updateStep("backup", { status: "ok", detail: backupRes.branchName });
        await sleep(200);
      }
      const resetStepIds = ["verify", "tree", "commit", "push", "verify2"];
      resetStepIds.forEach((id) => updateStep(id, { status: "pending" }));
      updateStep("verify", { status: "running" });
      const res = await performHistoryReset({
        data: {
          commitMessage: commitMsg.trim() || "Initial commit",
          oldCommitCount,
          backupBranchName
        }
      });
      for (const serverStep of res.steps) {
        const clientId = serverStep.id === "push" ? "push" : serverStep.id === "commit" ? "commit" : serverStep.id === "verify2" ? "verify2" : serverStep.id === "tree" ? "tree" : "verify";
        if (serverStep.status === "ok") {
          updateStep(clientId, { status: "ok", detail: serverStep.detail });
        } else {
          updateStep(clientId, { status: "error", detail: serverStep.detail });
        }
        await sleep(350);
        const idx = resetStepIds.indexOf(clientId);
        if (idx >= 0 && idx < resetStepIds.length - 1) {
          updateStep(resetStepIds[idx + 1], { status: "running" });
          await sleep(150);
        }
      }
      if (!res.success) throw new Error(res.error ?? "Reset failed");
      setResult(res);
      setPhase("done");
    } catch (e) {
      setRunError(e.message);
      setPhase("done");
    }
  }
  return /* @__PURE__ */ jsxs("div", { className: "max-w-3xl mx-auto space-y-6 pb-10", children: [
    phase === "idle" && /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 px-4 py-3.5 rounded-xl bg-amber-500/8 border border-amber-500/25", children: [
      /* @__PURE__ */ jsx("span", { className: "text-amber-400 text-base shrink-0 mt-0.5", children: "⚠" }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "text-amber-300 text-xs font-semibold", children: "Destructive operation" }),
        /* @__PURE__ */ jsx("p", { className: "text-amber-500/80 text-[11px] mt-0.5 leading-relaxed", children: "This permanently removes all previous commit history from the repository. Current project files are preserved exactly — only the Git history is reset. Anyone who has cloned the repository will need to re-clone or re-sync." })
      ] })
    ] }),
    phase === "idle" && /* @__PURE__ */ jsxs("div", { className: "rounded-2xl bg-[#0D1117] border border-white/6 overflow-hidden", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-5 py-4 border-b border-white/5", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2.5", children: [
          /* @__PURE__ */ jsx("div", { className: "w-7 h-7 rounded-lg bg-[#00BFFF]/10 border border-[#00BFFF]/20 flex items-center justify-center text-sm", children: "🗂" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-white text-sm font-semibold font-['Space_Grotesk']", children: "Repository Information" }),
            /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-[10px]", children: "Current state from GitHub" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: loadInfo,
            disabled: loadingInfo,
            className: "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] text-gray-500 hover:text-gray-300 border border-white/5 hover:border-white/10 hover:bg-white/3 transition-all disabled:opacity-40",
            children: [
              /* @__PURE__ */ jsx("span", { className: loadingInfo ? "animate-spin" : "", children: "↻" }),
              "Refresh"
            ]
          }
        )
      ] }),
      loadingInfo ? /* @__PURE__ */ jsxs("div", { className: "px-5 py-8 flex items-center justify-center gap-3", children: [
        /* @__PURE__ */ jsx("span", { className: "text-2xl animate-spin", children: "⟳" }),
        /* @__PURE__ */ jsx("span", { className: "text-gray-600 text-xs", children: "Loading repository data…" })
      ] }) : repoInfo ? /* @__PURE__ */ jsxs("div", { className: "px-5 py-1", children: [
        /* @__PURE__ */ jsx(InfoRow, { label: "Remote repository", value: repoInfo.remoteUrl }),
        /* @__PURE__ */ jsx(InfoRow, { label: "Current branch", value: repoInfo.branch, mono: true }),
        /* @__PURE__ */ jsx(InfoRow, { label: "Total commits", value: repoInfo.commitCount > 0 ? repoInfo.commitCount.toLocaleString() : "—", mono: true }),
        /* @__PURE__ */ jsx(InfoRow, { label: "HEAD commit", value: repoInfo.headShort, mono: true }),
        /* @__PURE__ */ jsx(InfoRow, { label: "Last commit message", value: repoInfo.lastMessage }),
        /* @__PURE__ */ jsx(InfoRow, { label: "Last commit date", value: repoInfo.lastDate ? `${formatDate$1(repoInfo.lastDate)} (${timeAgo$2(repoInfo.lastDate)})` : "—" }),
        /* @__PURE__ */ jsx(InfoRow, { label: "Last commit author", value: repoInfo.lastAuthor }),
        /* @__PURE__ */ jsx(InfoRow, { label: "Repository", value: `${repoInfo.owner}/${repoInfo.repo}`, mono: true })
      ] }) : /* @__PURE__ */ jsx("div", { className: "px-5 py-6 text-center text-gray-600 text-xs", children: "Could not load repository information" })
    ] }),
    phase === "idle" && /* @__PURE__ */ jsxs("div", { className: "rounded-2xl bg-[#0D1117] border border-white/6 overflow-hidden", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2.5 px-5 py-4 border-b border-white/5", children: [
        /* @__PURE__ */ jsx("div", { className: "w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-sm", children: "🔒" }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-white text-sm font-semibold font-['Space_Grotesk']", children: "Safety Checks" }),
          /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-[10px]", children: "All must pass before reset is allowed" })
        ] }),
        !loadingInfo && /* @__PURE__ */ jsx("span", { className: `ml-auto text-[10px] font-semibold px-2.5 py-1 rounded-full border ${allChecksPassed ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`, children: allChecksPassed ? "All passed" : `${safetyChecks.filter((c) => !c.ok).length} failed` })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "p-4 space-y-2", children: safetyChecks.map((check) => /* @__PURE__ */ jsx(CheckRow, { check }, check.id)) })
    ] }),
    phase === "idle" && /* @__PURE__ */ jsxs("div", { className: "rounded-2xl bg-[#0D1117] border border-white/6 overflow-hidden", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2.5 px-5 py-4 border-b border-white/5", children: [
        /* @__PURE__ */ jsx("div", { className: "w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-sm", children: "🔄" }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-white text-sm font-semibold font-['Space_Grotesk']", children: "Reset History" }),
          /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-[10px]", children: "Configure and initiate the history reset" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "p-5 space-y-5", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx("label", { className: "text-gray-400 text-xs font-medium", children: "Initial commit message" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              value: commitMsg,
              onChange: (e) => setCommitMsg(e.target.value),
              placeholder: "Initial commit",
              className: "w-full px-3 py-2.5 rounded-xl bg-white/3 border border-white/8 text-white text-xs font-mono focus:outline-none focus:border-[#00BFFF]/40 focus:bg-white/5 transition-all placeholder-gray-700"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("label", { className: "flex items-start gap-3 cursor-pointer group", children: [
          /* @__PURE__ */ jsx(
            "div",
            {
              className: `mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all ${createBackup ? "bg-[#00BFFF]/15 border-[#00BFFF]/40 text-[#00BFFF]" : "bg-white/3 border-white/10 text-transparent"}`,
              onClick: () => setCreateBackup((v) => !v),
              children: /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold", children: "✓" })
            }
          ),
          /* @__PURE__ */ jsxs("div", { onClick: () => setCreateBackup((v) => !v), children: [
            /* @__PURE__ */ jsx("p", { className: "text-white text-xs font-medium", children: "Create backup branch before reset" }),
            /* @__PURE__ */ jsxs("p", { className: "text-gray-600 text-[10px] mt-0.5 leading-relaxed", children: [
              "Pushes a branch named",
              " ",
              /* @__PURE__ */ jsxs("span", { className: "font-mono text-gray-500", children: [
                "backup-history-",
                makeTimestamp()
              ] }),
              " ",
              "to GitHub before erasing history. Recommended."
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "pt-1", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setPhase("confirming"),
              disabled: !allChecksPassed,
              className: `w-full py-3 rounded-xl text-sm font-bold font-['Space_Grotesk'] transition-all ${allChecksPassed ? "bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25 hover:border-red-500/50 hover:text-red-300" : "bg-white/3 border border-white/5 text-gray-700 cursor-not-allowed"}`,
              children: allChecksPassed ? "⚠ Reset Repository History" : "Complete safety checks to continue"
            }
          ),
          !allChecksPassed && !loadingInfo && /* @__PURE__ */ jsx("p", { className: "text-center text-gray-700 text-[10px] mt-2", children: safetyChecks.filter((c) => !c.ok).map((c) => c.label).join(" · ") })
        ] })
      ] })
    ] }),
    (phase === "running" || phase === "done") && /* @__PURE__ */ jsxs("div", { className: "rounded-2xl bg-[#0D1117] border border-white/6 overflow-hidden", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2.5 px-5 py-4 border-b border-white/5", children: [
        /* @__PURE__ */ jsx("div", { className: `w-7 h-7 rounded-lg flex items-center justify-center text-sm ${phase === "running" ? "bg-[#00BFFF]/10 border border-[#00BFFF]/20" : result?.success ? "bg-green-500/10 border border-green-500/20" : "bg-red-500/10 border border-red-500/20"}`, children: phase === "running" ? "⟳" : result?.success ? "✓" : "✗" }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-white text-sm font-semibold font-['Space_Grotesk']", children: phase === "running" ? "Resetting History…" : result?.success ? "Reset Complete" : "Reset Failed" }),
          /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-[10px]", children: phase === "running" ? "Do not close this page" : "Operation finished" })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "p-5 space-y-3", children: steps.map((step, i) => /* @__PURE__ */ jsx(StepRow, { step, index: i }, step.id)) }),
      phase === "done" && runError && /* @__PURE__ */ jsxs("div", { className: "mx-5 mb-5 p-4 rounded-xl bg-red-500/8 border border-red-500/20", children: [
        /* @__PURE__ */ jsx("p", { className: "text-red-400 text-xs font-semibold mb-1", children: "Error" }),
        /* @__PURE__ */ jsx("p", { className: "text-red-500/80 text-[11px] font-mono leading-relaxed", children: runError })
      ] })
    ] }),
    phase === "done" && result?.success && /* @__PURE__ */ jsxs("div", { className: "rounded-2xl bg-[#0D1117] border border-green-500/20 overflow-hidden", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2.5 px-5 py-4 border-b border-white/5", children: [
        /* @__PURE__ */ jsx("div", { className: "w-7 h-7 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center text-sm", children: "📊" }),
        /* @__PURE__ */ jsx("p", { className: "text-white text-sm font-semibold font-['Space_Grotesk']", children: "Reset Summary" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "px-5 py-1", children: [
        /* @__PURE__ */ jsx(InfoRow, { label: "Old commit count", value: result.oldCommitCount.toLocaleString(), mono: true }),
        /* @__PURE__ */ jsx(InfoRow, { label: "New commit count", value: "1", mono: true }),
        /* @__PURE__ */ jsx(InfoRow, { label: "New HEAD commit", value: result.newCommitShort, mono: true }),
        /* @__PURE__ */ jsx(InfoRow, { label: "Branch", value: result.branch, mono: true }),
        result.backupBranch && /* @__PURE__ */ jsx(InfoRow, { label: "Backup branch", value: result.backupBranch, mono: true }),
        /* @__PURE__ */ jsx(InfoRow, { label: "Push status", value: "Force-pushed successfully" }),
        /* @__PURE__ */ jsx(InfoRow, { label: "Synchronization", value: "GitHub remote matches local" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "px-5 pb-5 pt-3", children: /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => {
            setPhase("idle");
            setResult(null);
            setRunError(null);
            loadInfo();
          },
          className: "w-full py-2.5 rounded-xl text-xs text-gray-400 border border-white/8 hover:text-white hover:border-white/15 hover:bg-white/3 transition-all",
          children: "← Back to Repository Management"
        }
      ) })
    ] }),
    phase === "done" && !result?.success && /* @__PURE__ */ jsx("div", { className: "flex justify-center pt-2", children: /* @__PURE__ */ jsx(
      "button",
      {
        onClick: () => {
          setPhase("idle");
          setRunError(null);
        },
        className: "px-6 py-2.5 rounded-xl text-xs text-gray-400 border border-white/8 hover:text-white hover:border-white/15 hover:bg-white/3 transition-all",
        children: "← Back to Repository Management"
      }
    ) }),
    phase === "confirming" && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm", children: /* @__PURE__ */ jsxs("div", { className: "w-full max-w-md rounded-2xl bg-[#0D1117] border border-white/10 shadow-2xl overflow-hidden animate-[fadeInUp_0.2s_ease_both]", children: [
      /* @__PURE__ */ jsx("div", { className: "px-6 py-5 border-b border-white/5", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "w-9 h-9 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-lg", children: "⚠" }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h2", { className: "text-white font-['Space_Grotesk'] font-bold text-base", children: "Confirm History Reset" }),
          /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-[10px] mt-0.5", children: "This action cannot be undone" })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "px-6 py-5 space-y-2.5", children: [
        [
          "All previous commit history will be permanently removed from the selected branch",
          "Current project files will remain exactly as they are",
          "Repository size and commit history will be reset to a single commit",
          "This operation force-pushes the branch to GitHub",
          "Anyone who has cloned the repository will need to re-clone or re-sync"
        ].map((line, i) => /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2.5", children: [
          /* @__PURE__ */ jsx("span", { className: "text-red-500 text-xs shrink-0 mt-0.5", children: "•" }),
          /* @__PURE__ */ jsx("p", { className: "text-gray-400 text-[11px] leading-relaxed", children: line })
        ] }, i)),
        createBackup && /* @__PURE__ */ jsxs("div", { className: "mt-4 flex items-start gap-2.5 p-3 rounded-xl bg-green-500/5 border border-green-500/15", children: [
          /* @__PURE__ */ jsx("span", { className: "text-green-400 text-xs shrink-0 mt-0.5", children: "✓" }),
          /* @__PURE__ */ jsx("p", { className: "text-green-400/80 text-[11px] leading-relaxed", children: "A backup branch will be created before the reset so you can restore if needed." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "pt-1", children: [
          /* @__PURE__ */ jsxs("p", { className: "text-gray-500 text-[10px]", children: [
            "Commit message: ",
            /* @__PURE__ */ jsxs("span", { className: "font-mono text-gray-400", children: [
              '"',
              commitMsg || "Initial commit",
              '"'
            ] })
          ] }),
          repoInfo && /* @__PURE__ */ jsxs("p", { className: "text-gray-500 text-[10px] mt-0.5", children: [
            "Removing ",
            /* @__PURE__ */ jsxs("span", { className: "text-amber-400 font-semibold", children: [
              repoInfo.commitCount.toLocaleString(),
              " commits"
            ] }),
            " from ",
            /* @__PURE__ */ jsx("span", { className: "font-mono", children: repoInfo.branch })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "px-6 pb-6 flex gap-3", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setPhase("idle"),
            className: "flex-1 py-2.5 rounded-xl text-xs text-gray-400 border border-white/8 hover:text-white hover:border-white/15 hover:bg-white/3 transition-all",
            children: "Cancel"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: runReset,
            className: "flex-1 py-2.5 rounded-xl text-xs font-bold bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25 hover:border-red-500/50 hover:text-red-300 transition-all",
            children: "Yes, Reset History"
          }
        )
      ] })
    ] }) })
  ] });
}
const ITEMS_PAGE_SIZE = 10;
function formatGems(n) {
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return n.toLocaleString();
}
function timeAgo$1(ms) {
  const diff = Date.now() - ms;
  const s = Math.floor(diff / 1e3);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
function formatDate(ms) {
  return new Date(ms).toLocaleString(void 0, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}
function StatusBadge({ status }) {
  const color = STATUS_COLORS[status];
  return /* @__PURE__ */ jsxs(
    "span",
    {
      className: "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
      style: { background: `${color}15`, color, border: `1px solid ${color}30` },
      children: [
        (status === "pending" || status === "processing") && /* @__PURE__ */ jsx("span", { className: "w-1.5 h-1.5 rounded-full animate-pulse", style: { background: color } }),
        STATUS_LABELS[status]
      ]
    }
  );
}
function RarityBadge({ rarity }) {
  const color = RARITY_COLORS[rarity] ?? "#9ca3af";
  return /* @__PURE__ */ jsx(
    "span",
    {
      className: "text-[10px] font-bold px-1.5 py-0.5 rounded",
      style: { background: `${color}15`, color, border: `1px solid ${color}25` },
      children: RARITY_NAMES[rarity] ?? `R${rarity}`
    }
  );
}
function StatCard({ label, value, color, sub }) {
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: "rounded-xl border p-4",
      style: { borderColor: `${color}20`, background: `${color}06` },
      children: [
        /* @__PURE__ */ jsx("p", { className: "font-black text-2xl", style: { color }, children: typeof value === "number" ? value.toLocaleString() : value }),
        sub && /* @__PURE__ */ jsx("p", { className: "text-[10px] mt-0.5", style: { color: `${color}80` }, children: sub }),
        /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-[10px] mt-1", children: label })
      ]
    }
  );
}
function PurchaseRow({ purchase, selected, onSelect, onUpdate }) {
  const [expanded, setExpanded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [staffNotes, setStaffNotes] = useState(purchase.staffNotes ?? "");
  const [playerNotes, setPlayerNotes] = useState(purchase.playerNotes ?? "");
  const [message, setMessage] = useState("");
  async function updateStatus(status) {
    setSaving(true);
    setMessage("");
    try {
      const result = await adminUpdatePurchase({
        data: { purchaseId: purchase.id, status, staffNotes: staffNotes || null, playerNotes: playerNotes || null }
      });
      if (result.success) {
        setMessage(status === "cancelled" || status === "rejected" ? "✅ Status updated — Gems refunded" : "✅ Status updated");
        onUpdate();
      } else {
        setMessage(`❌ ${result.error}`);
      }
    } catch {
      setMessage("❌ Error updating status");
    } finally {
      setSaving(false);
    }
  }
  return /* @__PURE__ */ jsxs("div", { className: `rounded-xl border overflow-hidden transition-all duration-200 ${selected ? "border-[#00BFFF]/30 bg-[#00BFFF]/3" : "border-white/8 bg-[#0B0F17]"}`, children: [
    /* @__PURE__ */ jsxs("div", { className: "p-4 flex items-center gap-3", children: [
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "checkbox",
          checked: selected,
          onChange: () => onSelect(purchase.id),
          onClick: (e) => e.stopPropagation(),
          className: "rounded border-white/20 bg-white/5 cursor-pointer shrink-0"
        }
      ),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => setExpanded((v) => !v),
          className: "flex-1 text-left grid grid-cols-1 sm:grid-cols-4 gap-2 items-center min-w-0",
          children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-[#00BFFF] text-xs font-mono font-bold", children: purchase.id }),
              /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-[10px]", children: timeAgo$1(purchase.createdAt) })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-white text-xs font-semibold truncate", children: purchase.username }),
              /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-[10px]", children: CATEGORY_LABELS[purchase.category] })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-white text-xs font-semibold truncate", children: purchase.itemName }),
              purchase.quantity > 1 && /* @__PURE__ */ jsxs("p", { className: "text-gray-600 text-[10px]", children: [
                "×",
                purchase.quantity
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
              /* @__PURE__ */ jsxs("span", { className: "text-purple-400 text-xs font-bold", children: [
                "✨ ",
                formatGems(purchase.totalCost)
              ] }),
              /* @__PURE__ */ jsx(StatusBadge, { status: purchase.status })
            ] })
          ]
        }
      ),
      /* @__PURE__ */ jsx(
        "span",
        {
          onClick: () => setExpanded((v) => !v),
          className: `text-gray-600 text-xs cursor-pointer transition-transform duration-200 shrink-0 ${expanded ? "rotate-180" : ""}`,
          children: "▼"
        }
      )
    ] }),
    expanded && /* @__PURE__ */ jsxs("div", { className: "border-t border-white/5 p-4 space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-gray-500", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-700 block text-[10px]", children: "Created" }),
          formatDate(purchase.createdAt)
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-700 block text-[10px]", children: "Updated" }),
          formatDate(purchase.updatedAt)
        ] }),
        purchase.completedAt && /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-700 block text-[10px]", children: "Completed" }),
          formatDate(purchase.completedAt)
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-700 block text-[10px]", children: "Unit Price" }),
          "✨ ",
          purchase.price.toLocaleString()
        ] })
      ] }),
      purchase.refunded && /* @__PURE__ */ jsxs("div", { className: "flex gap-2 bg-amber-500/5 border border-amber-500/20 rounded-lg px-3 py-2 text-xs text-amber-400", children: [
        "♻️ Refunded ✨ ",
        purchase.totalCost.toLocaleString(),
        " Gems",
        purchase.refundedAt ? ` • ${formatDate(purchase.refundedAt)}` : ""
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "text-gray-600 text-[10px] uppercase tracking-wide mb-1 block", children: "Staff Notes (internal only)" }),
          /* @__PURE__ */ jsx(
            "textarea",
            {
              value: staffNotes,
              onChange: (e) => setStaffNotes(e.target.value),
              rows: 2,
              placeholder: "Internal notes for staff…",
              className: "w-full px-3 py-2 rounded-lg border border-white/8 bg-white/3 text-white text-xs placeholder-gray-700 outline-none focus:border-white/20 resize-none transition-all"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "text-gray-600 text-[10px] uppercase tracking-wide mb-1 block", children: "Player Notes (visible to player)" }),
          /* @__PURE__ */ jsx(
            "textarea",
            {
              value: playerNotes,
              onChange: (e) => setPlayerNotes(e.target.value),
              rows: 2,
              placeholder: "Message shown to the player…",
              className: "w-full px-3 py-2 rounded-lg border border-white/8 bg-white/3 text-white text-xs placeholder-gray-700 outline-none focus:border-white/20 resize-none transition-all"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2 items-center", children: [
        ["pending", "processing", "completed", "cancelled", "rejected"].map((s) => {
          const color = STATUS_COLORS[s];
          const isActive = purchase.status === s;
          return /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => updateStatus(s),
              disabled: saving || isActive,
              className: `px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${isActive ? "opacity-40 cursor-default" : "hover:opacity-90 active:scale-95"}`,
              style: { background: `${color}15`, border: `1px solid ${color}30`, color, opacity: saving ? 0.5 : void 0 },
              children: saving ? "…" : STATUS_LABELS[s]
            },
            s
          );
        }),
        message && /* @__PURE__ */ jsx("p", { className: `text-xs font-medium ml-1 ${message.startsWith("✅") ? "text-green-400" : "text-red-400"}`, children: message })
      ] })
    ] })
  ] });
}
function ItemEditor({ item, onSave, onDelete }) {
  const [form, setForm] = useState({ ...item });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDel, setConfirm] = useState(false);
  const [message, setMsg] = useState("");
  const [expanded, setExpanded] = useState(false);
  const rarityColor = RARITY_COLORS[form.rarity] ?? "#9ca3af";
  async function save() {
    setSaving(true);
    setMsg("");
    try {
      const result = await adminUpdateShopItem({ data: {
        id: form.id,
        name: form.name,
        description: form.description,
        price: form.price,
        icon: form.icon,
        enabled: form.enabled,
        featured: form.featured,
        rarity: form.rarity,
        purchaseLimit: form.purchaseLimit,
        stock: form.stock
      } });
      if (result.success) {
        setMsg("✅ Saved");
        onSave();
      } else setMsg(`❌ ${result.error}`);
    } catch {
      setMsg("❌ Save failed");
    } finally {
      setSaving(false);
    }
  }
  async function deleteItem() {
    setDeleting(true);
    try {
      const result = await adminDeleteShopItem({ data: { id: item.id } });
      if (result.success) onDelete();
      else setMsg(`❌ ${result.error}`);
    } catch {
      setMsg("❌ Delete failed");
    } finally {
      setDeleting(false);
      setConfirm(false);
    }
  }
  return /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-white/8 bg-[#0B0F17] overflow-hidden", children: [
    /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: () => setExpanded((v) => !v),
        className: "w-full text-left p-4 flex items-center gap-3 hover:bg-white/2 transition-colors",
        children: [
          /* @__PURE__ */ jsx(
            "div",
            {
              className: "w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0",
              style: { background: `${rarityColor}15`, border: `1px solid ${rarityColor}25` },
              children: form.icon
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
              /* @__PURE__ */ jsx("p", { className: "text-white text-sm font-bold", children: form.name }),
              /* @__PURE__ */ jsx(RarityBadge, { rarity: form.rarity }),
              !form.enabled && /* @__PURE__ */ jsx("span", { className: "text-[10px] text-gray-600 bg-white/5 px-1.5 py-0.5 rounded", children: "Disabled" }),
              form.featured && /* @__PURE__ */ jsx("span", { className: "text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded", children: "★ Featured" })
            ] }),
            /* @__PURE__ */ jsxs("p", { className: "text-gray-600 text-[10px] mt-0.5", children: [
              CATEGORY_LABELS[form.category],
              " · ✨ ",
              formatGems(form.price),
              " · ",
              form.id
            ] })
          ] }),
          /* @__PURE__ */ jsx("span", { className: `text-gray-600 text-xs shrink-0 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`, children: "▼" })
        ]
      }
    ),
    expanded && /* @__PURE__ */ jsxs("div", { className: "border-t border-white/5 p-4 space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 flex-wrap", children: [
        /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 text-xs text-gray-400 cursor-pointer", children: [
          /* @__PURE__ */ jsx("input", { type: "checkbox", checked: form.enabled, onChange: (e) => setForm((f) => ({ ...f, enabled: e.target.checked })), className: "rounded" }),
          "Enabled"
        ] }),
        /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 text-xs text-gray-400 cursor-pointer", children: [
          /* @__PURE__ */ jsx("input", { type: "checkbox", checked: form.featured, onChange: (e) => setForm((f) => ({ ...f, featured: e.target.checked })), className: "rounded" }),
          "Featured (shows in hero section)"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "text-gray-600 text-[10px] uppercase tracking-wide mb-1 block", children: "Name" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              value: form.name,
              onChange: (e) => setForm((f) => ({ ...f, name: e.target.value })),
              className: "w-full px-3 py-2 rounded-lg border border-white/8 bg-white/3 text-white text-xs outline-none focus:border-[#00BFFF]/30 transition-all"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "text-gray-600 text-[10px] uppercase tracking-wide mb-1 block", children: "Category" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              value: form.category,
              onChange: (e) => setForm((f) => ({ ...f, category: e.target.value })),
              className: "w-full px-3 py-2 rounded-lg border border-white/8 bg-[#0B0F17] text-white text-xs outline-none focus:border-[#00BFFF]/30 transition-all",
              children: [
                /* @__PURE__ */ jsx("option", { value: "ranks", children: "Ranks" }),
                /* @__PURE__ */ jsx("option", { value: "crate-keys", children: "Crate Keys" }),
                /* @__PURE__ */ jsx("option", { value: "amethyst-tools", children: "Amethyst Tools" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "text-gray-600 text-[10px] uppercase tracking-wide mb-1 block", children: "Rarity" }),
          /* @__PURE__ */ jsx(
            "select",
            {
              value: form.rarity,
              onChange: (e) => setForm((f) => ({ ...f, rarity: parseInt(e.target.value) })),
              className: "w-full px-3 py-2 rounded-lg border border-white/8 bg-[#0B0F17] text-white text-xs outline-none focus:border-[#00BFFF]/30 transition-all",
              children: [1, 2, 3, 4, 5, 6].map((r) => /* @__PURE__ */ jsxs("option", { value: r, children: [
                RARITY_NAMES[r],
                " (R",
                r,
                ")"
              ] }, r))
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "text-gray-600 text-[10px] uppercase tracking-wide mb-1 block", children: "Price (Gems ✨)" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              min: 1,
              value: form.price,
              onChange: (e) => setForm((f) => ({ ...f, price: Math.max(1, parseInt(e.target.value) || 1) })),
              className: "w-full px-3 py-2 rounded-lg border border-white/8 bg-white/3 text-white text-xs outline-none focus:border-[#00BFFF]/30 transition-all"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "text-gray-600 text-[10px] uppercase tracking-wide mb-1 block", children: "Icon (emoji)" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              value: form.icon,
              onChange: (e) => setForm((f) => ({ ...f, icon: e.target.value })),
              className: "w-full px-3 py-2 rounded-lg border border-white/8 bg-white/3 text-white text-xs outline-none focus:border-[#00BFFF]/30 transition-all"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "text-gray-600 text-[10px] uppercase tracking-wide mb-1 block", children: "Purchase Limit (blank = unlimited)" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              min: 1,
              value: form.purchaseLimit ?? "",
              placeholder: "Unlimited",
              onChange: (e) => setForm((f) => ({ ...f, purchaseLimit: e.target.value ? Math.max(1, parseInt(e.target.value)) : null })),
              className: "w-full px-3 py-2 rounded-lg border border-white/8 bg-white/3 text-white text-xs outline-none focus:border-[#00BFFF]/30 transition-all placeholder-gray-700"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "text-gray-600 text-[10px] uppercase tracking-wide mb-1 block", children: "Stock (blank = unlimited)" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              min: 0,
              value: form.stock ?? "",
              placeholder: "Unlimited",
              onChange: (e) => setForm((f) => ({ ...f, stock: e.target.value ? Math.max(0, parseInt(e.target.value)) : null })),
              className: "w-full px-3 py-2 rounded-lg border border-white/8 bg-white/3 text-white text-xs outline-none focus:border-[#00BFFF]/30 transition-all placeholder-gray-700"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "text-gray-600 text-[10px] uppercase tracking-wide mb-1 block", children: "Description" }),
        /* @__PURE__ */ jsx(
          "textarea",
          {
            value: form.description,
            onChange: (e) => setForm((f) => ({ ...f, description: e.target.value })),
            rows: 2,
            className: "w-full px-3 py-2 rounded-lg border border-white/8 bg-white/3 text-white text-xs outline-none focus:border-[#00BFFF]/30 resize-none transition-all"
          }
        )
      ] }),
      message && /* @__PURE__ */ jsx("p", { className: `text-xs font-medium ${message.startsWith("✅") ? "text-green-400" : "text-red-400"}`, children: message }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 flex-wrap", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: save,
            disabled: saving,
            className: "px-4 py-2 rounded-lg bg-[#00BFFF]/15 border border-[#00BFFF]/25 text-[#00BFFF] text-xs font-semibold hover:bg-[#00BFFF]/25 transition-all disabled:opacity-50",
            children: saving ? "⏳ Saving…" : "💾 Save Changes"
          }
        ),
        !confirmDel ? /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setConfirm(true),
            className: "px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold hover:bg-red-500/20 transition-all",
            children: "🗑 Delete Item"
          }
        ) : /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-red-400 text-xs", children: "Confirm delete?" }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: deleteItem,
              disabled: deleting,
              className: "px-3 py-1.5 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-bold hover:bg-red-500/30 transition-all disabled:opacity-50",
              children: deleting ? "…" : "Yes, Delete"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setConfirm(false),
              className: "px-3 py-1.5 rounded-lg border border-white/10 text-gray-500 text-xs hover:text-gray-300 transition-all",
              children: "Cancel"
            }
          )
        ] })
      ] })
    ] })
  ] });
}
const BLANK_ITEM = {
  category: "ranks",
  name: "",
  description: "",
  price: 5e4,
  rarity: 1,
  icon: "⭐",
  enabled: true,
  featured: false,
  purchaseLimit: null,
  stock: null
};
function AddItemForm({ onAdded }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ id: "", ...BLANK_ITEM });
  const [saving, setSaving] = useState(false);
  const [message, setMsg] = useState("");
  const rarityColor = RARITY_COLORS[form.rarity] ?? "#9ca3af";
  async function submit() {
    if (!form.id.trim()) {
      setMsg("❌ Item ID is required");
      return;
    }
    if (!form.name.trim()) {
      setMsg("❌ Name is required");
      return;
    }
    setSaving(true);
    setMsg("");
    try {
      const result = await adminAddShopItem({ data: { ...form, id: form.id.trim().toLowerCase().replace(/\s+/g, "-") } });
      if (result.success) {
        setMsg("✅ Item added!");
        setForm({ id: "", ...BLANK_ITEM });
        onAdded();
        setTimeout(() => {
          setOpen(false);
          setMsg("");
        }, 1200);
      } else {
        setMsg(`❌ ${result.error}`);
      }
    } catch {
      setMsg("❌ Error adding item");
    } finally {
      setSaving(false);
    }
  }
  return /* @__PURE__ */ jsxs("div", { className: "rounded-xl border-2 border-dashed border-white/10 bg-[#080B11] overflow-hidden", children: [
    /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: () => setOpen((v) => !v),
        className: "w-full p-4 flex items-center gap-3 text-left hover:bg-white/2 transition-colors group",
        children: [
          /* @__PURE__ */ jsx("div", { className: "w-9 h-9 rounded-lg border border-white/15 flex items-center justify-center text-gray-500 group-hover:text-white group-hover:border-[#00BFFF]/30 transition-all", children: "+" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-gray-400 text-sm font-semibold group-hover:text-white transition-colors", children: "Add New Item" }),
            /* @__PURE__ */ jsx("p", { className: "text-gray-700 text-[10px]", children: "Create a custom shop item with full control" })
          ] }),
          /* @__PURE__ */ jsx("span", { className: `ml-auto text-gray-600 text-xs shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`, children: "▼" })
        ]
      }
    ),
    open && /* @__PURE__ */ jsxs("div", { className: "border-t border-white/5 p-4 space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4 p-3 rounded-xl border border-white/8 bg-[#0B0F17]", children: [
        /* @__PURE__ */ jsx(
          "div",
          {
            className: "w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0",
            style: { background: `${rarityColor}15`, border: `1px solid ${rarityColor}30` },
            children: form.icon || "?"
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
            /* @__PURE__ */ jsx("p", { className: "text-white font-bold text-sm", children: form.name || "Item Name" }),
            /* @__PURE__ */ jsx(RarityBadge, { rarity: form.rarity }),
            form.featured && /* @__PURE__ */ jsx("span", { className: "text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded", children: "★ Featured" })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-xs mt-0.5 line-clamp-1", children: form.description || "Description…" }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mt-1", children: [
            /* @__PURE__ */ jsxs("span", { className: "text-purple-400 text-xs font-bold", children: [
              "✨ ",
              formatGems(form.price)
            ] }),
            /* @__PURE__ */ jsxs("span", { className: "text-gray-700 text-[10px]", children: [
              "· ",
              CATEGORY_LABELS[form.category]
            ] }),
            form.purchaseLimit && /* @__PURE__ */ jsxs("span", { className: "text-gray-700 text-[10px]", children: [
              "· Limit: ×",
              form.purchaseLimit
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("label", { className: "text-gray-600 text-[10px] uppercase tracking-wide mb-1 block", children: [
            "Item ID ",
            /* @__PURE__ */ jsx("span", { className: "text-red-400", children: "*" })
          ] }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              value: form.id,
              placeholder: "e.g. vip-rank-v2",
              onChange: (e) => setForm((f) => ({ ...f, id: e.target.value })),
              className: "w-full px-3 py-2 rounded-lg border border-white/8 bg-white/3 text-white text-xs outline-none focus:border-[#00BFFF]/30 transition-all placeholder-gray-700"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("label", { className: "text-gray-600 text-[10px] uppercase tracking-wide mb-1 block", children: [
            "Name ",
            /* @__PURE__ */ jsx("span", { className: "text-red-400", children: "*" })
          ] }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              value: form.name,
              placeholder: "Display name…",
              onChange: (e) => setForm((f) => ({ ...f, name: e.target.value })),
              className: "w-full px-3 py-2 rounded-lg border border-white/8 bg-white/3 text-white text-xs outline-none focus:border-[#00BFFF]/30 transition-all placeholder-gray-700"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "text-gray-600 text-[10px] uppercase tracking-wide mb-1 block", children: "Category" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              value: form.category,
              onChange: (e) => setForm((f) => ({ ...f, category: e.target.value })),
              className: "w-full px-3 py-2 rounded-lg border border-white/8 bg-[#0B0F17] text-white text-xs outline-none focus:border-[#00BFFF]/30 transition-all",
              children: [
                /* @__PURE__ */ jsx("option", { value: "ranks", children: "Ranks" }),
                /* @__PURE__ */ jsx("option", { value: "crate-keys", children: "Crate Keys" }),
                /* @__PURE__ */ jsx("option", { value: "amethyst-tools", children: "Amethyst Tools" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "text-gray-600 text-[10px] uppercase tracking-wide mb-1 block", children: "Price (Gems ✨)" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              min: 1,
              value: form.price,
              onChange: (e) => setForm((f) => ({ ...f, price: Math.max(1, parseInt(e.target.value) || 1) })),
              className: "w-full px-3 py-2 rounded-lg border border-white/8 bg-white/3 text-white text-xs outline-none focus:border-[#00BFFF]/30 transition-all"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "text-gray-600 text-[10px] uppercase tracking-wide mb-1 block", children: "Rarity" }),
          /* @__PURE__ */ jsx(
            "select",
            {
              value: form.rarity,
              onChange: (e) => setForm((f) => ({ ...f, rarity: parseInt(e.target.value) })),
              className: "w-full px-3 py-2 rounded-lg border border-white/8 bg-[#0B0F17] text-white text-xs outline-none focus:border-[#00BFFF]/30 transition-all",
              children: [1, 2, 3, 4, 5, 6].map((r) => /* @__PURE__ */ jsxs("option", { value: r, children: [
                RARITY_NAMES[r],
                " (Tier ",
                r,
                ")"
              ] }, r))
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "text-gray-600 text-[10px] uppercase tracking-wide mb-1 block", children: "Icon (emoji)" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              value: form.icon,
              onChange: (e) => setForm((f) => ({ ...f, icon: e.target.value })),
              className: "w-full px-3 py-2 rounded-lg border border-white/8 bg-white/3 text-white text-xs outline-none focus:border-[#00BFFF]/30 transition-all"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "text-gray-600 text-[10px] uppercase tracking-wide mb-1 block", children: "Purchase Limit (blank = unlimited)" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              min: 1,
              value: form.purchaseLimit ?? "",
              placeholder: "Unlimited",
              onChange: (e) => setForm((f) => ({ ...f, purchaseLimit: e.target.value ? Math.max(1, parseInt(e.target.value)) : null })),
              className: "w-full px-3 py-2 rounded-lg border border-white/8 bg-white/3 text-white text-xs outline-none focus:border-[#00BFFF]/30 transition-all placeholder-gray-700"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "text-gray-600 text-[10px] uppercase tracking-wide mb-1 block", children: "Stock (blank = unlimited)" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              min: 0,
              value: form.stock ?? "",
              placeholder: "Unlimited",
              onChange: (e) => setForm((f) => ({ ...f, stock: e.target.value ? Math.max(0, parseInt(e.target.value)) : null })),
              className: "w-full px-3 py-2 rounded-lg border border-white/8 bg-white/3 text-white text-xs outline-none focus:border-[#00BFFF]/30 transition-all placeholder-gray-700"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "text-gray-600 text-[10px] uppercase tracking-wide mb-1 block", children: "Description" }),
        /* @__PURE__ */ jsx(
          "textarea",
          {
            value: form.description,
            placeholder: "What does this item do? What does the player get?",
            onChange: (e) => setForm((f) => ({ ...f, description: e.target.value })),
            rows: 2,
            className: "w-full px-3 py-2 rounded-lg border border-white/8 bg-white/3 text-white text-xs outline-none focus:border-[#00BFFF]/30 resize-none transition-all placeholder-gray-700"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 flex-wrap", children: [
        /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 text-xs text-gray-400 cursor-pointer", children: [
          /* @__PURE__ */ jsx("input", { type: "checkbox", checked: form.enabled, onChange: (e) => setForm((f) => ({ ...f, enabled: e.target.checked })), className: "rounded" }),
          "Enabled immediately"
        ] }),
        /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 text-xs text-gray-400 cursor-pointer", children: [
          /* @__PURE__ */ jsx("input", { type: "checkbox", checked: form.featured, onChange: (e) => setForm((f) => ({ ...f, featured: e.target.checked })), className: "rounded" }),
          "Featured (hero section)"
        ] })
      ] }),
      message && /* @__PURE__ */ jsx("p", { className: `text-xs font-medium ${message.startsWith("✅") ? "text-green-400" : "text-red-400"}`, children: message }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: submit,
            disabled: saving,
            className: "px-5 py-2 rounded-lg bg-[#00BFFF]/15 border border-[#00BFFF]/30 text-[#00BFFF] text-sm font-bold hover:bg-[#00BFFF]/25 active:scale-95 transition-all disabled:opacity-50",
            children: saving ? "⏳ Adding…" : "✨ Add Item to Shop"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => {
              setOpen(false);
              setMsg("");
              setForm({ id: "", ...BLANK_ITEM });
            },
            className: "px-4 py-2 rounded-lg border border-white/10 text-gray-500 text-xs hover:text-gray-300 transition-all",
            children: "Cancel"
          }
        )
      ] })
    ] })
  ] });
}
function BarRow({ label, value, max, color }) {
  const pct = max > 0 ? value / max * 100 : 0;
  return /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-xs", children: [
      /* @__PURE__ */ jsx("span", { className: "text-gray-400", children: label }),
      /* @__PURE__ */ jsxs("span", { className: "font-bold", style: { color }, children: [
        "✨ ",
        formatGems(value)
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "h-2 rounded-full bg-white/5", children: /* @__PURE__ */ jsx(
      "div",
      {
        className: "h-full rounded-full transition-all duration-700",
        style: { width: `${pct}%`, background: color }
      }
    ) })
  ] });
}
function AnalyticsTab({ purchases, items, stats }) {
  const catRevenue = {};
  const catCount = {};
  for (const p of purchases.filter((x) => !x.refunded)) {
    catRevenue[p.category] = (catRevenue[p.category] ?? 0) + p.totalCost;
    catCount[p.category] = (catCount[p.category] ?? 0) + 1;
  }
  const maxCatRev = Math.max(...Object.values(catRevenue), 1);
  const total = purchases.length;
  const pending = purchases.filter((p) => p.status === "pending").length;
  const processing = purchases.filter((p) => p.status === "processing").length;
  const completed = purchases.filter((p) => p.status === "completed").length;
  const refunds = purchases.filter((p) => p.refunded).length;
  const completionRate = total > 0 ? Math.round(completed / total * 100) : 0;
  const refundRate = total > 0 ? Math.round(refunds / total * 100) : 0;
  const now = Date.now();
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dailyBuckets = new Array(7).fill(0).map((_, i) => {
    const start = now - (6 - i) * 864e5;
    const end = start + 864e5;
    const count = purchases.filter((p) => p.createdAt >= start && p.createdAt < end).length;
    const gems = purchases.filter((p) => p.createdAt >= start && p.createdAt < end && !p.refunded).reduce((s, p) => s + p.totalCost, 0);
    const dayName = days[new Date(start).getDay()];
    return { dayName, count, gems };
  });
  const maxDaily = Math.max(...dailyBuckets.map((d) => d.count), 1);
  const enabledCount = items.filter((i) => i.enabled).length;
  const disabledCount = items.filter((i) => !i.enabled).length;
  const featuredCount = items.filter((i) => i.featured).length;
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3", children: [
      /* @__PURE__ */ jsx(StatCard, { label: "Completion Rate", value: `${completionRate}%`, color: "#22c55e", sub: `${completed} completed` }),
      /* @__PURE__ */ jsx(StatCard, { label: "Refund Rate", value: `${refundRate}%`, color: "#f59e0b", sub: `${refunds} refunded` }),
      /* @__PURE__ */ jsx(StatCard, { label: "Pending + Active", value: pending + processing, color: "#3b82f6", sub: "awaiting action" }),
      /* @__PURE__ */ jsx(StatCard, { label: "Avg Order Value", value: total > 0 ? `✨ ${formatGems(Math.round(purchases.reduce((s, p) => s + p.totalCost, 0) / total))}` : "—", color: "#a855f7", sub: "per purchase" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-white/8 bg-[#0B0F17] p-4", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-white font-bold text-sm mb-4", children: "📅 Last 7 Days — Order Activity" }),
      dailyBuckets.every((d) => d.count === 0) ? /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-xs", children: "No orders in the last 7 days" }) : /* @__PURE__ */ jsx("div", { className: "flex items-end gap-2 h-24", children: dailyBuckets.map((d, i) => {
        const pct = d.count / maxDaily * 100;
        return /* @__PURE__ */ jsxs("div", { className: "flex-1 flex flex-col items-center gap-1", children: [
          /* @__PURE__ */ jsx("span", { className: "text-[9px] text-gray-600", children: d.count > 0 ? d.count : "" }),
          /* @__PURE__ */ jsx("div", { className: "w-full rounded-t-sm flex-1 flex items-end", children: /* @__PURE__ */ jsx(
            "div",
            {
              className: "w-full rounded-t-md transition-all duration-700",
              style: {
                height: `${Math.max(pct, d.count > 0 ? 8 : 0)}%`,
                background: d.count > 0 ? "#00BFFF" : "#ffffff08"
              }
            }
          ) }),
          /* @__PURE__ */ jsx("span", { className: "text-[9px] text-gray-600", children: d.dayName })
        ] }, i);
      }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-white/8 bg-[#0B0F17] p-4", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-white font-bold text-sm mb-4", children: "💰 Revenue by Category" }),
        Object.keys(catRevenue).length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-xs", children: "No sales yet" }) : /* @__PURE__ */ jsx("div", { className: "space-y-3", children: ["ranks", "crate-keys", "amethyst-tools"].map((cat, i) => {
          const colors = ["#f59e0b", "#3b82f6", "#a855f7"];
          return /* @__PURE__ */ jsx(
            BarRow,
            {
              label: `${CATEGORY_ICONS[cat]} ${CATEGORY_LABELS[cat]} (${catCount[cat] ?? 0} orders)`,
              value: catRevenue[cat] ?? 0,
              max: maxCatRev,
              color: colors[i]
            },
            cat
          );
        }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-white/8 bg-[#0B0F17] p-4", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-white font-bold text-sm mb-4", children: "🏪 Catalog Health" }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-xs", children: [
            /* @__PURE__ */ jsx("span", { className: "text-gray-400", children: "Total Items" }),
            /* @__PURE__ */ jsx("span", { className: "text-white font-bold", children: items.length })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-xs", children: [
            /* @__PURE__ */ jsx("span", { className: "text-gray-400", children: "Enabled" }),
            /* @__PURE__ */ jsx("span", { className: "text-green-400 font-bold", children: enabledCount })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-xs", children: [
            /* @__PURE__ */ jsx("span", { className: "text-gray-400", children: "Disabled / Hidden" }),
            /* @__PURE__ */ jsx("span", { className: "text-gray-500 font-bold", children: disabledCount })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-xs", children: [
            /* @__PURE__ */ jsx("span", { className: "text-gray-400", children: "Featured" }),
            /* @__PURE__ */ jsxs("span", { className: "text-amber-400 font-bold", children: [
              "★ ",
              featuredCount
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "border-t border-white/5 pt-3", children: [
            /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between text-xs", children: /* @__PURE__ */ jsx("span", { className: "text-gray-400", children: "By Rarity" }) }),
            /* @__PURE__ */ jsx("div", { className: "mt-2 flex flex-wrap gap-1.5", children: [1, 2, 3, 4, 5, 6].map((r) => {
              const cnt = items.filter((i) => i.rarity === r).length;
              if (!cnt) return null;
              const col = RARITY_COLORS[r];
              return /* @__PURE__ */ jsxs("span", { className: "text-[10px] px-2 py-0.5 rounded font-bold", style: { background: `${col}15`, color: col, border: `1px solid ${col}25` }, children: [
                RARITY_NAMES[r],
                ": ",
                cnt
              ] }, r);
            }) })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-white/8 bg-[#0B0F17] p-4", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-white font-bold text-sm mb-3", children: "🏆 Top Selling Items" }),
        (stats?.topItems ?? []).length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-xs", children: "No data yet" }) : /* @__PURE__ */ jsx("div", { className: "space-y-2", children: stats.topItems.map((item, i) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxs("span", { className: "text-gray-600 text-xs w-5 shrink-0", children: [
            i + 1,
            "."
          ] }),
          /* @__PURE__ */ jsx("span", { className: "text-white text-xs flex-1 truncate", children: item.itemName }),
          /* @__PURE__ */ jsxs("span", { className: "text-purple-400 text-xs font-bold shrink-0", children: [
            "✨ ",
            formatGems(item.gemsSpent)
          ] }),
          /* @__PURE__ */ jsxs("span", { className: "text-gray-600 text-[10px] shrink-0", children: [
            "×",
            item.count
          ] })
        ] }, item.itemName)) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-white/8 bg-[#0B0F17] p-4", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-white font-bold text-sm mb-3", children: "💎 Highest Spenders" }),
        (stats?.topBuyers ?? []).length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-xs", children: "No data yet" }) : /* @__PURE__ */ jsx("div", { className: "space-y-2", children: stats.topBuyers.map((buyer, i) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxs("span", { className: "text-gray-600 text-xs w-5 shrink-0", children: [
            i + 1,
            "."
          ] }),
          /* @__PURE__ */ jsx("span", { className: "text-white text-xs flex-1 truncate", children: buyer.username }),
          /* @__PURE__ */ jsxs("span", { className: "text-purple-400 text-xs font-bold shrink-0", children: [
            "✨ ",
            formatGems(buyer.gemsSpent)
          ] }),
          /* @__PURE__ */ jsxs("span", { className: "text-gray-600 text-[10px] shrink-0", children: [
            buyer.count,
            " orders"
          ] })
        ] }, buyer.username)) })
      ] })
    ] })
  ] });
}
const QUEUE_PAGE_SIZE = 20;
function ShopManager({ admin: _admin }) {
  const [tab, setTab] = useState("dashboard");
  const [purchases, setPurchases] = useState([]);
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [selected, setSelected] = useState(/* @__PURE__ */ new Set());
  const [bulkSaving, setBulkSaving] = useState(false);
  const [bulkMsg, setBulkMsg] = useState("");
  const [queuePage, setQueuePage] = useState(1);
  const [itemFilter, setItemFilter] = useState("all");
  const [itemSearch, setItemSearch] = useState("");
  const [itemPage, setItemPage] = useState(1);
  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [p, i, s] = await Promise.all([adminGetAllPurchases(), adminGetShopItems(), adminGetShopStats()]);
      setPurchases(p);
      setItems(i);
      setStats(s);
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    loadAll();
  }, [loadAll]);
  useEffect(() => {
    function onUpdate() {
      loadAll();
    }
    window.addEventListener("shop_updated", onUpdate);
    return () => window.removeEventListener("shop_updated", onUpdate);
  }, [loadAll]);
  useEffect(() => {
    setQueuePage(1);
    setSelected(/* @__PURE__ */ new Set());
  }, [search, statusFilter, sortBy]);
  useEffect(() => {
    setItemPage(1);
  }, [itemFilter, itemSearch]);
  const filteredPurchases = purchases.filter((p) => {
    if (statusFilter !== "all" && p.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!p.username.toLowerCase().includes(q) && !p.itemName.toLowerCase().includes(q) && !p.id.toLowerCase().includes(q)) return false;
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === "newest") return b.createdAt - a.createdAt;
    if (sortBy === "oldest") return a.createdAt - b.createdAt;
    if (sortBy === "cost-desc") return b.totalCost - a.totalCost;
    return a.totalCost - b.totalCost;
  });
  const totalQueuePages = Math.max(1, Math.ceil(filteredPurchases.length / QUEUE_PAGE_SIZE));
  const safePage = Math.min(queuePage, totalQueuePages);
  const pagedPurchases = filteredPurchases.slice((safePage - 1) * QUEUE_PAGE_SIZE, safePage * QUEUE_PAGE_SIZE);
  const filteredItems = items.filter((item) => {
    if (itemFilter !== "all" && item.category !== itemFilter) return false;
    if (itemSearch) {
      const q = itemSearch.toLowerCase();
      if (!item.name.toLowerCase().includes(q) && !item.id.toLowerCase().includes(q)) return false;
    }
    return true;
  });
  const totalItemPages = Math.max(1, Math.ceil(filteredItems.length / ITEMS_PAGE_SIZE));
  const safeItemPage = Math.min(itemPage, totalItemPages);
  const pagedItems = filteredItems.slice((safeItemPage - 1) * ITEMS_PAGE_SIZE, safeItemPage * ITEMS_PAGE_SIZE);
  function toggleSelect(id) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
  function selectAll() {
    setSelected(new Set(pagedPurchases.map((p) => p.id)));
  }
  function clearSelection() {
    setSelected(/* @__PURE__ */ new Set());
  }
  async function bulkUpdate(status) {
    if (selected.size === 0) return;
    setBulkSaving(true);
    setBulkMsg("");
    let ok = 0;
    let fail = 0;
    for (const id of selected) {
      try {
        const r = await adminUpdatePurchase({ data: { purchaseId: id, status } });
        r.success ? ok++ : fail++;
      } catch {
        fail++;
      }
    }
    await loadAll();
    setBulkMsg(`✅ Updated ${ok} order${ok !== 1 ? "s" : ""}${fail ? ` — ${fail} failed` : ""}`);
    setSelected(/* @__PURE__ */ new Set());
    setBulkSaving(false);
    setTimeout(() => setBulkMsg(""), 3e3);
  }
  if (loading && !stats) {
    return /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center py-24", children: /* @__PURE__ */ jsxs("div", { className: "text-center space-y-3", children: [
      /* @__PURE__ */ jsx("div", { className: "w-8 h-8 rounded-full border-2 border-[#00BFFF]/40 border-t-[#00BFFF] animate-spin mx-auto" }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-500 text-sm", children: "Loading shop data…" })
    ] }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex gap-1 p-1 rounded-xl bg-white/4 border border-white/8 w-fit flex-wrap", children: [
      [
        ["dashboard", "📊", "Dashboard"],
        ["queue", "📋", "Purchase Queue"],
        ["items", "🛒", "Item Management"],
        ["analytics", "📈", "Analytics"]
      ].map(([t, icon, label]) => /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => setTab(t),
          className: `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${tab === t ? "bg-[#00BFFF]/15 border border-[#00BFFF]/25 text-[#00BFFF]" : "text-gray-500 hover:text-gray-300"}`,
          children: [
            /* @__PURE__ */ jsx("span", { children: icon }),
            label,
            t === "queue" && (stats?.pending ?? 0) > 0 && /* @__PURE__ */ jsx("span", { className: "px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold", children: stats.pending })
          ]
        },
        t
      )),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: loadAll,
          disabled: loading,
          className: "px-3 py-2 rounded-lg text-gray-500 hover:text-gray-300 text-sm border border-white/8 hover:border-white/15 transition-all ml-1 disabled:opacity-40",
          title: "Refresh",
          children: loading ? "⏳" : "↻"
        }
      )
    ] }),
    tab === "dashboard" && stats && /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3", children: [
        /* @__PURE__ */ jsx(StatCard, { label: "Total Orders", value: stats.total, color: "#00BFFF" }),
        /* @__PURE__ */ jsx(StatCard, { label: "Pending", value: stats.pending, color: "#f59e0b", sub: "awaiting action" }),
        /* @__PURE__ */ jsx(StatCard, { label: "Processing", value: stats.processing, color: "#3b82f6" }),
        /* @__PURE__ */ jsx(StatCard, { label: "Completed", value: stats.completed, color: "#22c55e" }),
        /* @__PURE__ */ jsx(StatCard, { label: "Cancelled", value: stats.cancelled, color: "#6b7280" }),
        /* @__PURE__ */ jsx(
          StatCard,
          {
            label: "Gems Circulated",
            value: `✨ ${formatGems(stats.totalGemsSpent)}`,
            color: "#a855f7"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-white/8 bg-[#0B0F17] p-4", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-white font-bold text-sm mb-3", children: "🏆 Top Items" }),
          stats.topItems.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-xs", children: "No purchases yet" }) : /* @__PURE__ */ jsx("div", { className: "space-y-2", children: stats.topItems.slice(0, 5).map((item, i) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxs("span", { className: "text-gray-600 text-xs w-5 shrink-0", children: [
              i + 1,
              "."
            ] }),
            /* @__PURE__ */ jsx("span", { className: "text-white text-xs flex-1 truncate", children: item.itemName }),
            /* @__PURE__ */ jsxs("span", { className: "text-purple-400 text-xs font-bold shrink-0", children: [
              "✨ ",
              formatGems(item.gemsSpent)
            ] }),
            /* @__PURE__ */ jsxs("span", { className: "text-gray-600 text-[10px] shrink-0", children: [
              "×",
              item.count
            ] })
          ] }, item.itemName)) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-white/8 bg-[#0B0F17] p-4", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-white font-bold text-sm mb-3", children: "💎 Top Buyers" }),
          stats.topBuyers.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-xs", children: "No buyers yet" }) : /* @__PURE__ */ jsx("div", { className: "space-y-2", children: stats.topBuyers.slice(0, 5).map((buyer, i) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxs("span", { className: "text-gray-600 text-xs w-5 shrink-0", children: [
              i + 1,
              "."
            ] }),
            /* @__PURE__ */ jsx("span", { className: "text-white text-xs flex-1 truncate", children: buyer.username }),
            /* @__PURE__ */ jsxs("span", { className: "text-purple-400 text-xs font-bold shrink-0", children: [
              "✨ ",
              formatGems(buyer.gemsSpent)
            ] }),
            /* @__PURE__ */ jsxs("span", { className: "text-gray-600 text-[10px] shrink-0", children: [
              buyer.count,
              " order",
              buyer.count !== 1 ? "s" : ""
            ] })
          ] }, buyer.username)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-white/8 bg-[#0B0F17] p-4", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-white font-bold text-sm mb-3", children: "🕐 Recent Orders" }),
        stats.recentPurchases.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-xs", children: "No orders yet" }) : /* @__PURE__ */ jsx("div", { className: "space-y-2", children: stats.recentPurchases.map((p) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 text-xs", children: [
          /* @__PURE__ */ jsx("span", { className: "text-[#00BFFF] font-mono font-bold shrink-0", children: p.id }),
          /* @__PURE__ */ jsx("span", { className: "text-gray-400 shrink-0", children: p.username }),
          /* @__PURE__ */ jsx("span", { className: "text-white flex-1 truncate", children: p.itemName }),
          /* @__PURE__ */ jsxs("span", { className: "text-purple-400 shrink-0", children: [
            "✨ ",
            formatGems(p.totalCost)
          ] }),
          /* @__PURE__ */ jsx(StatusBadge, { status: p.status })
        ] }, p.id)) })
      ] })
    ] }),
    tab === "queue" && /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-3 items-center", children: [
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx("span", { className: "absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs", children: "🔍" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              value: search,
              onChange: (e) => setSearch(e.target.value),
              placeholder: "Search player, item, ID…",
              className: "pl-8 pr-4 py-2 rounded-lg border border-white/8 bg-white/3 text-white text-xs placeholder-gray-600 outline-none focus:border-[#00BFFF]/30 w-56 transition-all"
            }
          )
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex gap-1.5 flex-wrap", children: ["all", "pending", "processing", "completed", "cancelled", "rejected"].map((s) => {
          const color = s === "all" ? "#00BFFF" : STATUS_COLORS[s];
          const label = s === "all" ? "All" : STATUS_LABELS[s];
          const cnt = s === "all" ? purchases.length : purchases.filter((p) => p.status === s).length;
          return /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setStatusFilter(s),
              className: `flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${statusFilter === s ? "opacity-100" : "opacity-40 hover:opacity-70"}`,
              style: { background: `${color}15`, color, border: `1px solid ${color}25` },
              children: [
                label,
                /* @__PURE__ */ jsxs("span", { className: "opacity-60", children: [
                  "(",
                  cnt,
                  ")"
                ] })
              ]
            },
            s
          );
        }) }),
        /* @__PURE__ */ jsxs(
          "select",
          {
            value: sortBy,
            onChange: (e) => setSortBy(e.target.value),
            className: "px-2 py-1.5 rounded-lg border border-white/8 bg-[#0B0F17] text-gray-400 text-xs outline-none focus:border-white/15 transition-all",
            children: [
              /* @__PURE__ */ jsx("option", { value: "newest", children: "Newest first" }),
              /* @__PURE__ */ jsx("option", { value: "oldest", children: "Oldest first" }),
              /* @__PURE__ */ jsx("option", { value: "cost-desc", children: "Highest cost" }),
              /* @__PURE__ */ jsx("option", { value: "cost-asc", children: "Lowest cost" })
            ]
          }
        )
      ] }),
      selected.size > 0 && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 p-3 rounded-xl bg-[#00BFFF]/5 border border-[#00BFFF]/20 flex-wrap", children: [
        /* @__PURE__ */ jsxs("span", { className: "text-[#00BFFF] text-xs font-bold", children: [
          selected.size,
          " selected"
        ] }),
        /* @__PURE__ */ jsx("span", { className: "text-gray-600 text-xs", children: "Bulk set status:" }),
        ["pending", "processing", "completed", "cancelled", "rejected"].map((s) => {
          const color = STATUS_COLORS[s];
          return /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => bulkUpdate(s),
              disabled: bulkSaving,
              className: "px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all hover:opacity-90 disabled:opacity-40",
              style: { background: `${color}15`, border: `1px solid ${color}25`, color },
              children: [
                "→ ",
                STATUS_LABELS[s]
              ]
            },
            s
          );
        }),
        /* @__PURE__ */ jsx("button", { onClick: clearSelection, className: "ml-auto text-gray-600 text-[10px] hover:text-gray-400 transition-colors", children: "✕ Clear" }),
        bulkMsg && /* @__PURE__ */ jsx("p", { className: "w-full text-xs font-medium text-green-400", children: bulkMsg })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("p", { className: "text-gray-600 text-xs", children: [
          filteredPurchases.length,
          " purchase",
          filteredPurchases.length !== 1 ? "s" : "",
          totalQueuePages > 1 && ` · Page ${safePage}/${totalQueuePages}`
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2", children: filteredPurchases.length > 0 && selected.size < pagedPurchases.length && /* @__PURE__ */ jsx("button", { onClick: selectAll, className: "text-[#00BFFF] text-[10px] hover:underline", children: "Select page" }) })
      ] }),
      filteredPurchases.length === 0 ? /* @__PURE__ */ jsx("div", { className: "text-center py-12 text-gray-600 text-sm", children: "No purchases found" }) : /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("div", { className: "space-y-2", children: pagedPurchases.map((p) => /* @__PURE__ */ jsx(
          PurchaseRow,
          {
            purchase: p,
            selected: selected.has(p.id),
            onSelect: toggleSelect,
            onUpdate: loadAll
          },
          p.id
        )) }),
        totalQueuePages > 1 && /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-2 pt-2", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setQueuePage((p) => Math.max(1, p - 1)),
              disabled: safePage === 1,
              className: "px-3 py-1.5 rounded-lg border border-white/10 text-gray-400 text-xs hover:text-white hover:border-white/20 disabled:opacity-30 transition-all",
              children: "← Prev"
            }
          ),
          Array.from({ length: totalQueuePages }, (_, i) => i + 1).map((p) => /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setQueuePage(p),
              className: `w-8 h-8 rounded-lg text-xs font-semibold transition-all ${p === safePage ? "bg-[#00BFFF]/15 border border-[#00BFFF]/30 text-[#00BFFF]" : "border border-white/8 text-gray-500 hover:text-white hover:border-white/15"}`,
              children: p
            },
            p
          )),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setQueuePage((p) => Math.min(totalQueuePages, p + 1)),
              disabled: safePage === totalQueuePages,
              className: "px-3 py-1.5 rounded-lg border border-white/10 text-gray-400 text-xs hover:text-white hover:border-white/20 disabled:opacity-30 transition-all",
              children: "Next →"
            }
          )
        ] })
      ] })
    ] }),
    tab === "items" && /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsx(AddItemForm, { onAdded: loadAll }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-3 items-center", children: [
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx("span", { className: "absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs", children: "🔍" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              value: itemSearch,
              onChange: (e) => setItemSearch(e.target.value),
              placeholder: "Search items…",
              className: "pl-8 pr-4 py-2 rounded-lg border border-white/8 bg-white/3 text-white text-xs placeholder-gray-600 outline-none focus:border-[#00BFFF]/30 w-48 transition-all"
            }
          )
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex gap-1.5 flex-wrap", children: ["all", "ranks", "crate-keys", "amethyst-tools"].map((cat) => {
          const colors = { all: "#00BFFF", ranks: "#f59e0b", "crate-keys": "#3b82f6", "amethyst-tools": "#a855f7" };
          const col = colors[cat];
          return /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setItemFilter(cat),
              className: `px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${itemFilter === cat ? "opacity-100" : "opacity-40 hover:opacity-70"}`,
              style: { background: `${col}15`, color: col, border: `1px solid ${col}25` },
              children: [
                CATEGORY_ICONS[cat],
                " ",
                cat === "all" ? "All" : CATEGORY_LABELS[cat]
              ]
            },
            cat
          );
        }) }),
        /* @__PURE__ */ jsxs("p", { className: "text-gray-600 text-xs ml-auto", children: [
          filteredItems.length,
          " of ",
          items.length,
          " items"
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-2", children: filteredItems.length === 0 ? /* @__PURE__ */ jsx("div", { className: "text-center py-12 text-gray-600 text-sm", children: "No items found" }) : pagedItems.map((item) => /* @__PURE__ */ jsx(ItemEditor, { item, onSave: loadAll, onDelete: loadAll }, item.id)) }),
      /* @__PURE__ */ jsx(
        AdminPaginator,
        {
          page: safeItemPage,
          totalPages: totalItemPages,
          totalItems: filteredItems.length,
          pageSize: ITEMS_PAGE_SIZE,
          onPageChange: setItemPage
        }
      )
    ] }),
    tab === "analytics" && /* @__PURE__ */ jsx(AnalyticsTab, { purchases, items, stats })
  ] });
}
function measureStrength(pw) {
  if (!pw) return { score: 0, label: "None", color: "bg-gray-800", tips: [] };
  const tips = [];
  let score = 0;
  if (pw.length >= 8) score++;
  else tips.push("Use at least 8 characters");
  if (pw.length >= 14) score++;
  else if (pw.length >= 8) tips.push("Longer passwords are stronger (14+ recommended)");
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  else tips.push("Mix uppercase and lowercase letters");
  if (/\d/.test(pw)) score++;
  else tips.push("Add numbers");
  if (/[^A-Za-z0-9]/.test(pw)) {
    if (score < 4) score++;
  } else {
    tips.push("Add symbols (!@#$%…)");
  }
  const capped = Math.min(score, 4);
  const labels = ["None", "Weak", "Fair", "Good", "Strong"];
  const colors = ["bg-gray-800", "bg-red-500", "bg-orange-400", "bg-yellow-400", "bg-green-400"];
  return { score: capped, label: labels[capped], color: colors[capped], tips };
}
function StrengthBar({ password }) {
  const s = measureStrength(password);
  return /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
    /* @__PURE__ */ jsx("div", { className: "flex gap-1 h-1.5", children: [1, 2, 3, 4].map((i) => /* @__PURE__ */ jsx("div", { className: `flex-1 rounded-full transition-all duration-300 ${i <= s.score ? s.color : "bg-white/10"}` }, i)) }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsx("span", { className: `text-[10px] font-semibold ${s.score === 4 ? "text-green-400" : s.score === 3 ? "text-yellow-400" : s.score === 2 ? "text-orange-400" : s.score >= 1 ? "text-red-400" : "text-gray-700"}`, children: password ? s.label : "" }),
      s.tips[0] && /* @__PURE__ */ jsxs("span", { className: "text-[10px] text-gray-600 truncate max-w-[60%]", children: [
        "Tip: ",
        s.tips[0]
      ] })
    ] })
  ] });
}
function Toast({ toasts, remove }) {
  return /* @__PURE__ */ jsx("div", { className: "fixed top-6 right-6 z-50 flex flex-col gap-2 pointer-events-none", children: toasts.map((t) => /* @__PURE__ */ jsxs(
    "div",
    {
      onClick: () => remove(t.id),
      className: `pointer-events-auto px-5 py-3 rounded-xl text-sm font-semibold shadow-2xl border backdrop-blur-sm cursor-pointer transition-all duration-200 max-w-sm ${t.type === "success" ? "bg-green-500/15 border-green-500/30 text-green-300" : t.type === "error" ? "bg-red-500/15 border-red-500/30 text-red-300" : t.type === "warning" ? "bg-orange-500/15 border-orange-500/30 text-orange-300" : "bg-[#00BFFF]/12 border-[#00BFFF]/30 text-[#00BFFF]"}`,
      children: [
        /* @__PURE__ */ jsx("span", { className: "mr-2", children: t.type === "success" ? "✓" : t.type === "error" ? "✕" : t.type === "warning" ? "⚠" : "ℹ" }),
        t.msg
      ]
    },
    t.id
  )) });
}
function useToasts() {
  const [toasts, setToasts] = useState([]);
  const counterRef = useRef(0);
  const push = useCallback((msg, type = "info") => {
    const id = ++counterRef.current;
    setToasts((p) => [...p, { id, msg, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4500);
  }, []);
  const remove = useCallback((id) => setToasts((p) => p.filter((t) => t.id !== id)), []);
  return { toasts, push, remove };
}
function PasswordInput({
  label,
  value,
  onChange,
  placeholder,
  showStrength,
  disabled,
  autoComplete
}) {
  const [show, setShow] = useState(false);
  return /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
    /* @__PURE__ */ jsx("label", { className: "block text-xs font-semibold text-gray-400 uppercase tracking-widest", children: label }),
    /* @__PURE__ */ jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsx(
        "input",
        {
          type: show ? "text" : "password",
          value,
          onChange: (e) => onChange(e.target.value),
          placeholder: placeholder ?? "••••••••••",
          disabled,
          autoComplete,
          className: "w-full bg-white/3 border border-white/8 rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-[#00BFFF]/40 focus:bg-white/5 transition-all disabled:opacity-40 disabled:cursor-not-allowed font-mono"
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: () => setShow((v) => !v),
          className: "absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-300 transition-colors text-base",
          children: show ? "🙈" : "👁"
        }
      )
    ] }),
    showStrength && /* @__PURE__ */ jsx(StrengthBar, { password: value })
  ] });
}
function Card({ children, className = "" }) {
  return /* @__PURE__ */ jsx("div", { className: `bg-white/2 border border-white/6 rounded-2xl p-6 space-y-5 ${className}`, children });
}
function CardHeader({ icon, title, subtitle, badge }) {
  return /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
    /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-xl bg-[#00BFFF]/8 border border-[#00BFFF]/15 flex items-center justify-center text-lg shrink-0", children: icon }),
    /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
        /* @__PURE__ */ jsx("h3", { className: "font-['Space_Grotesk'] font-bold text-white text-sm", children: title }),
        badge
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-xs mt-0.5", children: subtitle })
    ] })
  ] });
}
const HISTORY_KEY = "bn_cred_history";
function loadHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
function pushHistory(changed) {
  try {
    const h = loadHistory();
    h.unshift({ ts: Date.now(), changed });
    localStorage.setItem(HISTORY_KEY, JSON.stringify(h.slice(0, 20)));
  } catch {
  }
}
function timeAgo(ts) {
  const d = Date.now() - ts;
  if (d < 6e4) return `${Math.floor(d / 1e3)}s ago`;
  if (d < 36e5) return `${Math.floor(d / 6e4)}m ago`;
  if (d < 864e5) return `${Math.floor(d / 36e5)}h ago`;
  if (d < 30 * 864e5) return `${Math.floor(d / 864e5)}d ago`;
  return new Date(ts).toLocaleDateString();
}
function SessionTimer({ loginAt }) {
  const [remaining, setRemaining] = useState(0);
  useEffect(() => {
    const TTL = 8 * 60 * 60 * 1e3;
    function tick() {
      const rem = Math.max(0, loginAt + TTL - Date.now());
      setRemaining(rem);
    }
    tick();
    const id = setInterval(tick, 1e3);
    return () => clearInterval(id);
  }, [loginAt]);
  const h = Math.floor(remaining / 36e5);
  const m = Math.floor(remaining % 36e5 / 6e4);
  const s = Math.floor(remaining % 6e4 / 1e3);
  const pct = Math.min(100, remaining / (8 * 60 * 60 * 1e3) * 100);
  const urgent = pct < 10;
  return /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-xs", children: [
      /* @__PURE__ */ jsx("span", { className: "text-gray-500", children: "Session expires in" }),
      /* @__PURE__ */ jsxs("span", { className: `font-mono font-bold ${urgent ? "text-red-400 animate-pulse" : "text-[#00BFFF]"}`, children: [
        String(h).padStart(2, "0"),
        ":",
        String(m).padStart(2, "0"),
        ":",
        String(s).padStart(2, "0")
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "h-1.5 bg-white/5 rounded-full overflow-hidden", children: /* @__PURE__ */ jsx(
      "div",
      {
        className: `h-full rounded-full transition-all duration-1000 ${urgent ? "bg-red-500" : pct < 30 ? "bg-orange-400" : "bg-[#00BFFF]"}`,
        style: { width: `${pct}%` }
      }
    ) }),
    /* @__PURE__ */ jsxs("p", { className: "text-[10px] text-gray-700", children: [
      "Logged in ",
      timeAgo(loginAt),
      ". Session TTL: 8 hours."
    ] })
  ] });
}
function SecurityPolicy() {
  const rules = [
    { icon: "🔐", label: "Dual-password system", desc: "Two separate passwords required to log in — both must match." },
    { icon: "🔑", label: "scrypt hashing", desc: "All passwords stored as scrypt hashes (salt + 64-byte key). Never plaintext." },
    { icon: "🛡️", label: "HMAC-SHA256 sessions", desc: "Session tokens are signed with SESSION_SECRET. Tampering is detected on every page load." },
    { icon: "⏱️", label: "8-hour session TTL", desc: "Sessions expire automatically. Re-authentication required after expiry." },
    { icon: "🚫", label: "IP rate limiting", desc: "5 failed login attempts trigger a 15-minute IP lockout." },
    { icon: "⚡", label: "Constant-time compare", desc: "All credential comparisons use timingSafeEqual to prevent timing attacks." },
    { icon: "📏", label: "Password minimums", desc: "Each password must be ≥ 8 characters. Passwords 1 & 2 must differ from each other." },
    { icon: "🔄", label: "Auto hash upgrade", desc: "Plaintext passwords are automatically upgraded to scrypt on first login." }
  ];
  return /* @__PURE__ */ jsx("div", { className: "grid gap-2", children: rules.map((r) => /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 rounded-xl bg-white/2 border border-white/5", children: [
    /* @__PURE__ */ jsx("span", { className: "text-base shrink-0 mt-0.5", children: r.icon }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold text-gray-300", children: r.label }),
      /* @__PURE__ */ jsx("p", { className: "text-[11px] text-gray-600 leading-relaxed", children: r.desc })
    ] })
  ] }, r.label)) });
}
function CredentialsManager({ admin }) {
  const { toasts, push, remove } = useToasts();
  const session = getAdminSession();
  const [serverUsername, setServerUsername] = useState(admin);
  const [p1Hashed, setP1Hashed] = useState(true);
  const [p2Hashed, setP2Hashed] = useState(true);
  const [loadingInfo, setLoadingInfo] = useState(true);
  const [history, setHistory] = useState([]);
  const [tab, setTab] = useState("full-rotation");
  const [busy, setBusy] = useState(false);
  const [showPolicy, setShowPolicy] = useState(false);
  const [showHistory, setShowHistory] = useState(true);
  const [uNewUsername, setUNewUsername] = useState("");
  const [uCurP1, setUCurP1] = useState("");
  const [uCurP2, setUCurP2] = useState("");
  const [p1CurP1, setP1CurP1] = useState("");
  const [p1CurP2, setP1CurP2] = useState("");
  const [p1New, setP1New] = useState("");
  const [p1Confirm, setP1Confirm] = useState("");
  const [p2CurP1, setP2CurP1] = useState("");
  const [p2CurP2, setP2CurP2] = useState("");
  const [p2New, setP2New] = useState("");
  const [p2Confirm, setP2Confirm] = useState("");
  const [frCurP1, setFrCurP1] = useState("");
  const [frCurP2, setFrCurP2] = useState("");
  const [frNewUser, setFrNewUser] = useState("");
  const [frNewP1, setFrNewP1] = useState("");
  const [frNewP1c, setFrNewP1c] = useState("");
  const [frNewP2, setFrNewP2] = useState("");
  const [frNewP2c, setFrNewP2c] = useState("");
  const [showDanger, setShowDanger] = useState(false);
  useEffect(() => {
    setHistory(loadHistory());
    if (!session) {
      setLoadingInfo(false);
      return;
    }
    getAdminInfo({ data: { token: session.token, username: session.username, loginAt: session.loginAt } }).then((res) => {
      if (res.ok) {
        setServerUsername(res.username);
        setP1Hashed(res.password1Hashed);
        setP2Hashed(res.password2Hashed);
      }
    }).catch(() => {
    }).finally(() => setLoadingInfo(false));
  }, []);
  async function call(payload, logLabel) {
    if (busy) return;
    setBusy(true);
    try {
      const res = await updateAdminCredentials({ data: payload });
      if (!res.ok) {
        push(res.error, "error");
        return;
      }
      const changed = res.changed ?? [];
      pushHistory(changed);
      setHistory(loadHistory());
      addLog(admin, "credentials:update", `Changed: ${changed.join(", ")}`);
      push(`${logLabel} updated — signing you out now…`, "success");
      setTimeout(() => {
        setAdminSession(null);
        window.location.href = "/admin";
      }, 1800);
    } catch (e) {
      push(e?.message ?? "Network error", "error");
    } finally {
      setBusy(false);
    }
  }
  function handleChangeUsername(e) {
    e.preventDefault();
    if (!uNewUsername.trim()) {
      push("Enter a new username", "warning");
      return;
    }
    if (!uCurP1 || !uCurP2) {
      push("Enter both current passwords to confirm", "warning");
      return;
    }
    call({ currentPassword1: uCurP1, currentPassword2: uCurP2, newUsername: uNewUsername }, "Username");
  }
  function handleChangeP1(e) {
    e.preventDefault();
    if (!p1New) {
      push("Enter a new password", "warning");
      return;
    }
    if (p1New !== p1Confirm) {
      push("New passwords do not match", "error");
      return;
    }
    if (p1New.length < 8) {
      push("Password must be ≥ 8 characters", "error");
      return;
    }
    call({ currentPassword1: p1CurP1, currentPassword2: p1CurP2, newPassword1: p1New }, "Password 1");
  }
  function handleChangeP2(e) {
    e.preventDefault();
    if (!p2New) {
      push("Enter a new password", "warning");
      return;
    }
    if (p2New !== p2Confirm) {
      push("New passwords do not match", "error");
      return;
    }
    if (p2New.length < 8) {
      push("Password must be ≥ 8 characters", "error");
      return;
    }
    call({ currentPassword1: p2CurP1, currentPassword2: p2CurP2, newPassword2: p2New }, "Password 2");
  }
  function handleFullRotation(e) {
    e.preventDefault();
    if (!frCurP1 || !frCurP2) {
      push("Enter both current passwords", "warning");
      return;
    }
    if (frNewP1 && frNewP1 !== frNewP1c) {
      push("New Password 1 confirmation does not match", "error");
      return;
    }
    if (frNewP2 && frNewP2 !== frNewP2c) {
      push("New Password 2 confirmation does not match", "error");
      return;
    }
    if (frNewP1 && frNewP1.length < 8) {
      push("Password 1 must be ≥ 8 characters", "error");
      return;
    }
    if (frNewP2 && frNewP2.length < 8) {
      push("Password 2 must be ≥ 8 characters", "error");
      return;
    }
    const payload = { currentPassword1: frCurP1, currentPassword2: frCurP2 };
    if (frNewUser.trim()) payload.newUsername = frNewUser.trim();
    if (frNewP1) payload.newPassword1 = frNewP1;
    if (frNewP2) payload.newPassword2 = frNewP2;
    if (!payload.newUsername && !payload.newPassword1 && !payload.newPassword2) {
      push("Nothing to change — fill at least one new field", "warning");
      return;
    }
    call(payload, "Credentials");
  }
  const TABS = [
    { id: "full-rotation", label: "Full Rotation", icon: "🔄" },
    { id: "username", label: "Username Only", icon: "👤" },
    { id: "password1", label: "Password 1", icon: "🔑" },
    { id: "password2", label: "Password 2", icon: "🗝️" }
  ];
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6 max-w-5xl mx-auto", children: [
    /* @__PURE__ */ jsx(Toast, { toasts, remove }),
    /* @__PURE__ */ jsxs("div", { className: "relative overflow-hidden rounded-2xl border border-[#00BFFF]/15 bg-gradient-to-br from-[#00BFFF]/6 via-transparent to-blue-900/10 p-6", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 pointer-events-none", children: [...Array(8)].map((_, i) => /* @__PURE__ */ jsx(
        "div",
        {
          className: "absolute w-px bg-gradient-to-b from-transparent via-[#00BFFF]/10 to-transparent",
          style: { left: `${12 + i * 12}%`, height: "100%", top: 0, opacity: 0.4 + i % 3 * 0.2 }
        },
        i
      )) }),
      /* @__PURE__ */ jsxs("div", { className: "relative flex items-center gap-4", children: [
        /* @__PURE__ */ jsx("div", { className: "w-14 h-14 rounded-2xl bg-[#00BFFF]/10 border border-[#00BFFF]/25 flex items-center justify-center text-2xl shadow-[0_0_30px_rgba(0,191,255,0.12)]", children: "🔐" }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsx("h2", { className: "font-['Space_Grotesk'] font-black text-white text-xl tracking-tight", children: "Admin Credentials" }),
          /* @__PURE__ */ jsx("p", { className: "text-gray-500 text-xs mt-0.5", children: "Manage administrator username and dual-password authentication system" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex flex-col items-end gap-1.5 shrink-0", children: loadingInfo ? /* @__PURE__ */ jsx("div", { className: "w-24 h-6 rounded bg-white/5 animate-pulse" }) : /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("span", { className: "px-3 py-1 rounded-full bg-[#00BFFF]/10 border border-[#00BFFF]/20 text-[#00BFFF] text-xs font-bold", children: serverUsername }),
          /* @__PURE__ */ jsx("span", { className: `px-2 py-0.5 rounded-full text-[10px] font-semibold border ${p1Hashed && p2Hashed ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-orange-500/10 border-orange-500/20 text-orange-400"}`, children: p1Hashed && p2Hashed ? "🔒 scrypt hashed" : "⚠ Upgrade needed" })
        ] }) })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "relative grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-white/5", children: [
        { label: "Auth Mode", value: "Dual Password", icon: "🔑" },
        { label: "Hash Algorithm", value: "scrypt (64-byte)", icon: "🧮" },
        { label: "Session TTL", value: "8 hours", icon: "⏱️" },
        { label: "Rate Limit", value: "5 attempts / 15 min", icon: "🚫" }
      ].map((s) => /* @__PURE__ */ jsxs("div", { className: "bg-white/3 border border-white/5 rounded-xl px-3 py-2.5", children: [
        /* @__PURE__ */ jsxs("p", { className: "text-gray-700 text-[10px] uppercase tracking-widest", children: [
          s.icon,
          " ",
          s.label
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-white text-xs font-bold mt-0.5 truncate", children: s.value })
      ] }, s.label)) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid lg:grid-cols-3 gap-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "lg:col-span-2 space-y-5", children: [
        /* @__PURE__ */ jsx("div", { className: "flex gap-1.5 p-1.5 bg-white/3 rounded-xl border border-white/6", children: TABS.map((t) => /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setTab(t.id),
            className: `flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${tab === t.id ? "bg-[#00BFFF]/15 border border-[#00BFFF]/25 text-[#00BFFF] shadow-sm" : "text-gray-600 hover:text-gray-400 border border-transparent"}`,
            children: [
              /* @__PURE__ */ jsx("span", { children: t.icon }),
              /* @__PURE__ */ jsx("span", { className: "hidden sm:inline", children: t.label })
            ]
          },
          t.id
        )) }),
        tab === "full-rotation" && /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsx(
            CardHeader,
            {
              icon: "🔄",
              title: "Full Credential Rotation",
              subtitle: "Change username and/or both passwords in one secured operation. Leave any new field blank to keep it unchanged.",
              badge: /* @__PURE__ */ jsx("span", { className: "px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#00BFFF]/10 border border-[#00BFFF]/20 text-[#00BFFF]", children: "Recommended" })
            }
          ),
          /* @__PURE__ */ jsxs("form", { onSubmit: handleFullRotation, className: "space-y-5", children: [
            /* @__PURE__ */ jsxs("div", { className: "p-4 rounded-xl bg-white/2 border border-white/6 space-y-3", children: [
              /* @__PURE__ */ jsxs("p", { className: "text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsx("span", { className: "w-4 h-px bg-gray-700 inline-block" }),
                "Verify Identity",
                /* @__PURE__ */ jsx("span", { className: "w-4 h-px bg-gray-700 inline-block" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "grid sm:grid-cols-2 gap-3", children: [
                /* @__PURE__ */ jsx(PasswordInput, { label: "Current Password 1", value: frCurP1, onChange: setFrCurP1, autoComplete: "current-password" }),
                /* @__PURE__ */ jsx(PasswordInput, { label: "Current Password 2", value: frCurP2, onChange: setFrCurP2, autoComplete: "current-password" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "p-4 rounded-xl bg-white/2 border border-white/6 space-y-4", children: [
              /* @__PURE__ */ jsxs("p", { className: "text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsx("span", { className: "w-4 h-px bg-gray-700 inline-block" }),
                "New Values (leave blank to keep current)",
                /* @__PURE__ */ jsx("span", { className: "w-4 h-px bg-gray-700 inline-block" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsx("label", { className: "block text-xs font-semibold text-gray-400 uppercase tracking-widest", children: "New Username" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "text",
                    value: frNewUser,
                    onChange: (e) => setFrNewUser(e.target.value),
                    placeholder: `Keep current: ${serverUsername}`,
                    autoComplete: "username",
                    className: "w-full bg-white/3 border border-white/8 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-[#00BFFF]/40 focus:bg-white/5 transition-all"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "grid sm:grid-cols-2 gap-3", children: [
                /* @__PURE__ */ jsx(PasswordInput, { label: "New Password 1", value: frNewP1, onChange: setFrNewP1, placeholder: "Leave blank to keep", showStrength: true, autoComplete: "new-password" }),
                /* @__PURE__ */ jsx(PasswordInput, { label: "Confirm Password 1", value: frNewP1c, onChange: setFrNewP1c, placeholder: "Repeat new password 1", autoComplete: "new-password" })
              ] }),
              frNewP1 && frNewP1c && frNewP1 !== frNewP1c && /* @__PURE__ */ jsx("p", { className: "text-xs text-red-400 -mt-2", children: "Password 1 entries don't match" }),
              /* @__PURE__ */ jsxs("div", { className: "grid sm:grid-cols-2 gap-3", children: [
                /* @__PURE__ */ jsx(PasswordInput, { label: "New Password 2", value: frNewP2, onChange: setFrNewP2, placeholder: "Leave blank to keep", showStrength: true, autoComplete: "new-password" }),
                /* @__PURE__ */ jsx(PasswordInput, { label: "Confirm Password 2", value: frNewP2c, onChange: setFrNewP2c, placeholder: "Repeat new password 2", autoComplete: "new-password" })
              ] }),
              frNewP2 && frNewP2c && frNewP2 !== frNewP2c && /* @__PURE__ */ jsx("p", { className: "text-xs text-red-400 -mt-2", children: "Password 2 entries don't match" }),
              frNewP1 && frNewP2 && frNewP1 === frNewP2 && /* @__PURE__ */ jsxs("div", { className: "px-4 py-3 rounded-xl bg-orange-500/8 border border-orange-500/20 text-orange-400 text-xs flex items-center gap-2", children: [
                /* @__PURE__ */ jsx("span", { children: "⚠" }),
                " Password 1 and Password 2 must be different from each other."
              ] })
            ] }),
            /* @__PURE__ */ jsxs(
              "button",
              {
                type: "submit",
                disabled: busy,
                className: "w-full py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-[#00BFFF] to-[#0066FF] text-white hover:from-[#00BFFF]/90 hover:to-[#0066FF]/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-[0_0_20px_rgba(0,191,255,0.25)] hover:shadow-[0_0_30px_rgba(0,191,255,0.35)] flex items-center justify-center gap-2",
                children: [
                  busy ? /* @__PURE__ */ jsx("span", { className: "w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" }) : "🔄",
                  busy ? "Updating…" : "Apply Credential Rotation"
                ]
              }
            )
          ] })
        ] }),
        tab === "username" && /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsx(
            CardHeader,
            {
              icon: "👤",
              title: "Change Username",
              subtitle: "Update the administrator login name. Both current passwords required to confirm the change."
            }
          ),
          /* @__PURE__ */ jsxs("form", { onSubmit: handleChangeUsername, className: "space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsx("label", { className: "block text-xs font-semibold text-gray-400 uppercase tracking-widest", children: "Current Username" }),
              /* @__PURE__ */ jsx("div", { className: "px-4 py-3 rounded-xl bg-white/2 border border-white/6 text-sm font-mono text-gray-300", children: serverUsername })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsx("label", { className: "block text-xs font-semibold text-gray-400 uppercase tracking-widest", children: "New Username" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "text",
                  value: uNewUsername,
                  onChange: (e) => setUNewUsername(e.target.value),
                  placeholder: "e.g. superadmin",
                  autoComplete: "username",
                  minLength: 3,
                  className: "w-full bg-white/3 border border-white/8 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-[#00BFFF]/40 focus:bg-white/5 transition-all"
                }
              ),
              uNewUsername && uNewUsername.length < 3 && /* @__PURE__ */ jsx("p", { className: "text-[11px] text-red-400", children: "Must be at least 3 characters" })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "h-px bg-white/5" }),
            /* @__PURE__ */ jsx("p", { className: "text-[11px] text-gray-600", children: "Confirm identity — both current passwords required:" }),
            /* @__PURE__ */ jsxs("div", { className: "grid sm:grid-cols-2 gap-3", children: [
              /* @__PURE__ */ jsx(PasswordInput, { label: "Current Password 1", value: uCurP1, onChange: setUCurP1, autoComplete: "current-password" }),
              /* @__PURE__ */ jsx(PasswordInput, { label: "Current Password 2", value: uCurP2, onChange: setUCurP2, autoComplete: "current-password" })
            ] }),
            /* @__PURE__ */ jsxs(
              "button",
              {
                type: "submit",
                disabled: busy,
                className: "w-full py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-[#00BFFF] to-[#0066FF] text-white hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-[0_0_20px_rgba(0,191,255,0.2)] flex items-center justify-center gap-2",
                children: [
                  busy ? /* @__PURE__ */ jsx("span", { className: "w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" }) : "👤",
                  busy ? "Updating…" : "Update Username"
                ]
              }
            )
          ] })
        ] }),
        tab === "password1" && /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsx(
            CardHeader,
            {
              icon: "🔑",
              title: "Change Password 1",
              subtitle: "The primary login password. Both current passwords required to authorize the change."
            }
          ),
          /* @__PURE__ */ jsxs("form", { onSubmit: handleChangeP1, className: "space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "p-3 rounded-xl bg-white/2 border border-white/5 space-y-3", children: [
              /* @__PURE__ */ jsx("p", { className: "text-[10px] text-gray-600 uppercase tracking-widest font-bold", children: "Verify identity" }),
              /* @__PURE__ */ jsxs("div", { className: "grid sm:grid-cols-2 gap-3", children: [
                /* @__PURE__ */ jsx(PasswordInput, { label: "Current Password 1", value: p1CurP1, onChange: setP1CurP1, autoComplete: "current-password" }),
                /* @__PURE__ */ jsx(PasswordInput, { label: "Current Password 2", value: p1CurP2, onChange: setP1CurP2, autoComplete: "current-password" })
              ] })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "h-px bg-white/5" }),
            /* @__PURE__ */ jsx(PasswordInput, { label: "New Password 1", value: p1New, onChange: setP1New, showStrength: true, autoComplete: "new-password" }),
            /* @__PURE__ */ jsx(PasswordInput, { label: "Confirm New Password 1", value: p1Confirm, onChange: setP1Confirm, autoComplete: "new-password" }),
            p1New && p1Confirm && p1New !== p1Confirm && /* @__PURE__ */ jsx("p", { className: "text-xs text-red-400", children: "Passwords don't match" }),
            /* @__PURE__ */ jsxs(
              "button",
              {
                type: "submit",
                disabled: busy,
                className: "w-full py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-[#00BFFF] to-[#0066FF] text-white hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-[0_0_20px_rgba(0,191,255,0.2)] flex items-center justify-center gap-2",
                children: [
                  busy ? /* @__PURE__ */ jsx("span", { className: "w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" }) : "🔑",
                  busy ? "Updating…" : "Update Password 1"
                ]
              }
            )
          ] })
        ] }),
        tab === "password2" && /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsx(
            CardHeader,
            {
              icon: "🗝️",
              title: "Change Password 2",
              subtitle: "The secondary login password. Both current passwords required to authorize the change."
            }
          ),
          /* @__PURE__ */ jsxs("form", { onSubmit: handleChangeP2, className: "space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "p-3 rounded-xl bg-white/2 border border-white/5 space-y-3", children: [
              /* @__PURE__ */ jsx("p", { className: "text-[10px] text-gray-600 uppercase tracking-widest font-bold", children: "Verify identity" }),
              /* @__PURE__ */ jsxs("div", { className: "grid sm:grid-cols-2 gap-3", children: [
                /* @__PURE__ */ jsx(PasswordInput, { label: "Current Password 1", value: p2CurP1, onChange: setP2CurP1, autoComplete: "current-password" }),
                /* @__PURE__ */ jsx(PasswordInput, { label: "Current Password 2", value: p2CurP2, onChange: setP2CurP2, autoComplete: "current-password" })
              ] })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "h-px bg-white/5" }),
            /* @__PURE__ */ jsx(PasswordInput, { label: "New Password 2", value: p2New, onChange: setP2New, showStrength: true, autoComplete: "new-password" }),
            /* @__PURE__ */ jsx(PasswordInput, { label: "Confirm New Password 2", value: p2Confirm, onChange: setP2Confirm, autoComplete: "new-password" }),
            p2New && p2Confirm && p2New !== p2Confirm && /* @__PURE__ */ jsx("p", { className: "text-xs text-red-400", children: "Passwords don't match" }),
            /* @__PURE__ */ jsxs(
              "button",
              {
                type: "submit",
                disabled: busy,
                className: "w-full py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-[#00BFFF] to-[#0066FF] text-white hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-[0_0_20px_rgba(0,191,255,0.2)] flex items-center justify-center gap-2",
                children: [
                  busy ? /* @__PURE__ */ jsx("span", { className: "w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" }) : "🗝️",
                  busy ? "Updating…" : "Update Password 2"
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsx(CardHeader, { icon: "✅", title: "Security Checklist", subtitle: "Quick health check for your current credential configuration." }),
          /* @__PURE__ */ jsx("div", { className: "grid sm:grid-cols-2 gap-2", children: [
            { ok: p1Hashed, label: "Password 1 is hashed", detail: p1Hashed ? "scrypt" : "Plaintext — upgrade on next login" },
            { ok: p2Hashed, label: "Password 2 is hashed", detail: p2Hashed ? "scrypt" : "Plaintext — upgrade on next login" },
            { ok: true, label: "Dual-password auth", detail: "Both passwords required" },
            { ok: true, label: "HMAC sessions active", detail: "SESSION_SECRET is set" },
            { ok: history.length > 0, label: "Rotation history exists", detail: history.length > 0 ? `${history.length} rotation(s) recorded` : "No changes yet" },
            { ok: !!session, label: "Active session", detail: session ? `Logged in as ${session.username}` : "No session" }
          ].map((item) => /* @__PURE__ */ jsxs("div", { className: `flex items-center gap-3 p-3 rounded-xl border ${item.ok ? "bg-green-500/5 border-green-500/15" : "bg-orange-500/5 border-orange-500/15"}`, children: [
            /* @__PURE__ */ jsx("span", { className: "text-base shrink-0", children: item.ok ? "✅" : "⚠️" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold text-gray-300", children: item.label }),
              /* @__PURE__ */ jsx("p", { className: `text-[11px] ${item.ok ? "text-gray-600" : "text-orange-500"}`, children: item.detail })
            ] })
          ] }, item.label)) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-red-500/20 bg-red-500/3 overflow-hidden", children: [
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setShowDanger((v) => !v),
              className: "w-full flex items-center gap-3 px-6 py-4 text-left hover:bg-red-500/5 transition-colors",
              children: [
                /* @__PURE__ */ jsx("span", { className: "text-xl", children: "☠️" }),
                /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
                  /* @__PURE__ */ jsx("p", { className: "text-sm font-bold text-red-400", children: "Danger Zone" }),
                  /* @__PURE__ */ jsx("p", { className: "text-[11px] text-gray-600", children: "Session invalidation and emergency actions" })
                ] }),
                /* @__PURE__ */ jsx("span", { className: `text-gray-600 text-sm transition-transform ${showDanger ? "rotate-90" : ""}`, children: "›" })
              ]
            }
          ),
          showDanger && /* @__PURE__ */ jsxs("div", { className: "px-6 pb-6 space-y-4 border-t border-red-500/10 pt-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "p-4 rounded-xl bg-white/2 border border-white/5 space-y-3", children: [
              /* @__PURE__ */ jsx("p", { className: "text-xs font-bold text-gray-400", children: "Session Revocation" }),
              /* @__PURE__ */ jsxs("p", { className: "text-[11px] text-gray-600 leading-relaxed", children: [
                "Every credential change — username or either password — bumps a ",
                /* @__PURE__ */ jsx("span", { className: "text-gray-400 font-mono", children: "sessionInvalidBefore" }),
                " timestamp written to ",
                /* @__PURE__ */ jsx("span", { className: "text-gray-400 font-mono", children: "admin.yml" }),
                ". The server checks this on every page load: any session token issued before that timestamp is rejected, regardless of whether its HMAC signature is valid. This ensures that password rotations revoke all existing sessions immediately — not just the current one."
              ] }),
              /* @__PURE__ */ jsx("p", { className: "text-[11px] text-gray-600 leading-relaxed", children: "After a successful update this page will sign you out automatically. Log in with the new credentials to continue." }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 px-3 py-2 rounded-lg bg-[#00BFFF]/6 border border-[#00BFFF]/15 text-[#00BFFF] text-[11px]", children: [
                /* @__PURE__ */ jsx("span", { children: "ℹ" }),
                /* @__PURE__ */ jsx("span", { children: "To force a sign-out of all sessions, rotate any credential via the forms above." })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "p-4 rounded-xl bg-white/2 border border-white/5 space-y-2", children: [
              /* @__PURE__ */ jsx("p", { className: "text-xs font-bold text-gray-400", children: "Current Session Info" }),
              /* @__PURE__ */ jsxs("div", { className: "font-mono text-[11px] text-gray-500 space-y-1 break-all", children: [
                /* @__PURE__ */ jsxs("p", { children: [
                  "Username: ",
                  /* @__PURE__ */ jsx("span", { className: "text-gray-300", children: session?.username ?? "—" })
                ] }),
                /* @__PURE__ */ jsxs("p", { children: [
                  "Login at: ",
                  /* @__PURE__ */ jsx("span", { className: "text-gray-300", children: session ? new Date(session.loginAt).toLocaleString() : "—" })
                ] }),
                /* @__PURE__ */ jsxs("p", { children: [
                  "Token: ",
                  /* @__PURE__ */ jsx("span", { className: "text-gray-500", children: session ? `${session.token.slice(0, 16)}…` : "—" })
                ] })
              ] })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-5", children: [
        session && /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsx(CardHeader, { icon: "⏱️", title: "Active Session", subtitle: "Current session countdown" }),
          /* @__PURE__ */ jsx(SessionTimer, { loginAt: session.loginAt })
        ] }),
        /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsx(CardHeader, { icon: "📜", title: "Rotation History", subtitle: "Last 20 credential changes" }),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => setShowHistory((v) => !v),
                className: "text-[10px] text-gray-600 hover:text-gray-400 transition-colors shrink-0",
                children: showHistory ? "Collapse" : "Expand"
              }
            )
          ] }),
          showHistory && /* @__PURE__ */ jsx("div", { className: "space-y-2 max-h-64 overflow-y-auto pr-1", children: history.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-center text-gray-700 text-xs py-6", children: "No rotations recorded yet" }) : history.map((h, i) => /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2.5 p-2.5 rounded-xl bg-white/2 border border-white/5", children: [
            /* @__PURE__ */ jsx("span", { className: "text-sm shrink-0 mt-0.5", children: "🔄" }),
            /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxs("p", { className: "text-xs font-semibold text-gray-300 truncate", children: [
                "Changed: ",
                h.changed.join(", ")
              ] }),
              /* @__PURE__ */ jsxs("p", { className: "text-[10px] text-gray-600", children: [
                timeAgo(h.ts),
                " · ",
                new Date(h.ts).toLocaleString()
              ] })
            ] })
          ] }, i)) })
        ] }),
        /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsx(CardHeader, { icon: "🛡️", title: "Security Policy", subtitle: "How credentials are protected" }),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => setShowPolicy((v) => !v),
                className: "text-[10px] text-gray-600 hover:text-gray-400 transition-colors shrink-0",
                children: showPolicy ? "Collapse" : "Expand"
              }
            )
          ] }),
          showPolicy && /* @__PURE__ */ jsx(SecurityPolicy, {})
        ] }),
        /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsx(CardHeader, { icon: "💡", title: "Best Practices", subtitle: "Recommendations for keeping your account secure" }),
          /* @__PURE__ */ jsx("div", { className: "space-y-2.5", children: [
            { tip: "Rotate credentials every 90 days", severity: "info" },
            { tip: "Use a password manager to store complex passwords", severity: "info" },
            { tip: "Make Password 1 and Password 2 completely different", severity: "warning" },
            { tip: "Never share your admin credentials", severity: "warning" },
            { tip: "Use 14+ character passwords for maximum security", severity: "info" },
            { tip: "Sign out when using shared machines", severity: "warning" },
            { tip: "After rotating, verify you can log in before closing the tab", severity: "warning" }
          ].map((b, i) => /* @__PURE__ */ jsxs("div", { className: `flex items-start gap-2 text-[11px] leading-relaxed ${b.severity === "warning" ? "text-orange-400" : "text-gray-500"}`, children: [
            /* @__PURE__ */ jsx("span", { className: "shrink-0 mt-0.5", children: b.severity === "warning" ? "⚠" : "•" }),
            b.tip
          ] }, i)) })
        ] }),
        /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsx(CardHeader, { icon: "🧬", title: "Credential Anatomy", subtitle: "What each field does" }),
          /* @__PURE__ */ jsx("div", { className: "space-y-3", children: [
            {
              field: "Username",
              desc: "The login name shown on the admin panel. Does not affect session signing — changing it invalidates the current token.",
              color: "border-l-[#00BFFF]"
            },
            {
              field: "Password 1",
              desc: "Primary authentication factor. Stored as a salted scrypt hash. Required on every login.",
              color: "border-l-purple-400"
            },
            {
              field: "Password 2",
              desc: "Secondary authentication factor. Must differ from Password 1. Adds a second layer — both must pass to authenticate.",
              color: "border-l-green-400"
            }
          ].map((c) => /* @__PURE__ */ jsxs("div", { className: `pl-3 border-l-2 ${c.color}`, children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs font-bold text-gray-300", children: c.field }),
            /* @__PURE__ */ jsx("p", { className: "text-[11px] text-gray-600 leading-relaxed", children: c.desc })
          ] }, c.field)) })
        ] })
      ] })
    ] })
  ] });
}
const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: "🏠", desc: "Overview & stats" },
  { id: "tier-list", label: "Tier List", icon: "📋", desc: "Manage players" },
  { id: "gamemodes", label: "Gamemodes", icon: "🎮", desc: "Edit gamemodes" },
  { id: "mining-mgmt", label: "Mining", icon: "⛏️", desc: "Manage miners" },
  { id: "economy", label: "Economy", icon: "💰", desc: "Edit constants" },
  { id: "users", label: "Users", icon: "👥", desc: "Manage accounts" },
  { id: "content", label: "Content", icon: "📝", desc: "Edit site text" },
  { id: "events", label: "Events", icon: "🎉", desc: "Manage events" },
  { id: "shop-mgmt", label: "Shop", icon: "🛒", desc: "Manage purchases" },
  { id: "logs", label: "Activity Logs", icon: "📊", desc: "Audit trail" },
  { id: "repo-history", label: "Repo History", icon: "🕓", desc: "Reset history" },
  { id: "github-sync", label: "GitHub Sync", icon: "☁️", desc: "Sync Center" },
  { id: "credentials", label: "Credentials", icon: "🔐", desc: "Manage admin auth" }
];
const SECTION_TITLES = {
  "dashboard": { title: "Dashboard", subtitle: "Overview of Blue Tiers activity" },
  "tier-list": { title: "Tier List Manager", subtitle: "Add, edit, and remove ranked players" },
  "gamemodes": { title: "Gamemode Manager", subtitle: "Configure PvP gamemodes and icons" },
  "mining-mgmt": { title: "Mining Manager", subtitle: "Manage user rigs and balances" },
  "economy": { title: "Economy Settings", subtitle: "Adjust exchange rates and mining rewards" },
  "users": { title: "User Manager", subtitle: "Full player management — accounts, profiles, and mining data" },
  "content": { title: "Content Manager", subtitle: "Edit homepage, footer, and site text" },
  "events": { title: "Event Manager", subtitle: "Configure event banners and countdowns" },
  "shop-mgmt": { title: "Shop Management", subtitle: "Manage purchases, prices, refunds, and delivery" },
  "logs": { title: "Activity Logs", subtitle: "Full audit trail of all admin actions" },
  "github-sync": { title: "GitHub Sync Center", subtitle: "Professional synchronization dashboard — push, validate, rollback" },
  "repo-history": { title: "Repository History Management", subtitle: "Reset commit history while preserving all project files" },
  "credentials": { title: "Credentials Manager", subtitle: "Manage admin username and dual-password authentication" }
};
function SectionContent({ section, admin }) {
  switch (section) {
    case "dashboard":
      return /* @__PURE__ */ jsx(Dashboard, { admin });
    case "tier-list":
      return /* @__PURE__ */ jsx(TierListManager, { admin });
    case "gamemodes":
      return /* @__PURE__ */ jsx(GamemodeManager, { admin });
    case "mining-mgmt":
      return /* @__PURE__ */ jsx(MiningManager, { admin });
    case "economy":
      return /* @__PURE__ */ jsx(EconomyManager, { admin });
    case "users":
      return /* @__PURE__ */ jsx(UserManager, { admin });
    case "content":
      return /* @__PURE__ */ jsx(ContentManager, { admin });
    case "events":
      return /* @__PURE__ */ jsx(EventManager, { admin });
    case "shop-mgmt":
      return /* @__PURE__ */ jsx(ShopManager, { admin });
    case "logs":
      return /* @__PURE__ */ jsx(ActivityLogs, { admin });
    case "github-sync":
      return /* @__PURE__ */ jsx(GitHubSyncCenter, { admin });
    case "repo-history":
      return /* @__PURE__ */ jsx(RepoHistoryManager, { admin });
    case "credentials":
      return /* @__PURE__ */ jsx(CredentialsManager, { admin });
  }
}
function AdminLayout({ session, section, setSection, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sync = useSyncState();
  const { title, subtitle } = SECTION_TITLES[section];
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-[#0B0F17] flex", children: [
    /* @__PURE__ */ jsxs(
      "aside",
      {
        className: `fixed lg:static inset-y-0 left-0 z-40 w-60 bg-[#070B12] border-r border-white/5 flex flex-col transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`,
        children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2.5 px-5 py-5 border-b border-white/5", children: [
            /* @__PURE__ */ jsx("div", { className: "w-8 h-8 rounded-lg bg-[#00BFFF]/10 border border-[#00BFFF]/20 flex items-center justify-center text-sm", children: "🛡️" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-['Space_Grotesk'] font-bold text-sm text-white", children: "Blue Tiers" }),
              /* @__PURE__ */ jsx("p", { className: "text-[9px] text-gray-600 uppercase tracking-widest", children: "Admin Panel" })
            ] })
          ] }),
          /* @__PURE__ */ jsx("nav", { className: "flex-1 overflow-y-auto py-3 px-2 space-y-0.5", children: NAV_ITEMS.map((item) => /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => {
                setSection(item.id);
                setSidebarOpen(false);
              },
              className: `w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 group ${section === item.id ? "bg-[#00BFFF]/12 border border-[#00BFFF]/20 text-[#00BFFF]" : "text-gray-500 hover:text-gray-300 hover:bg-white/3 border border-transparent"}`,
              children: [
                /* @__PURE__ */ jsx("span", { className: "text-base leading-none", children: item.icon }),
                /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
                  /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold leading-tight", children: item.label }),
                  /* @__PURE__ */ jsx("p", { className: "text-[9px] text-gray-700 leading-tight mt-0.5", children: item.desc })
                ] }),
                item.id === "github-sync" && sync.isDirty && section !== "github-sync" && /* @__PURE__ */ jsx("span", { className: "w-2 h-2 rounded-full bg-orange-400 shrink-0 animate-pulse" }),
                section === item.id && /* @__PURE__ */ jsx("div", { className: "w-1 h-4 rounded-full bg-[#00BFFF] shadow-[0_0_6px_rgba(0,191,255,0.8)] shrink-0" })
              ]
            },
            item.id
          )) }),
          /* @__PURE__ */ jsxs("div", { className: "p-4 border-t border-white/5 space-y-2", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2.5 px-1", children: [
              /* @__PURE__ */ jsx("div", { className: "w-7 h-7 rounded-lg bg-[#00BFFF]/10 border border-[#00BFFF]/20 flex items-center justify-center text-xs font-black text-[#00BFFF]", children: session.username[0].toUpperCase() }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "text-white text-xs font-bold", children: session.username }),
                /* @__PURE__ */ jsx("p", { className: "text-gray-700 text-[9px]", children: "Administrator" })
              ] })
            ] }),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: onLogout,
                className: "w-full py-2 rounded-lg text-xs text-gray-500 hover:text-red-400 border border-white/5 hover:border-red-500/20 hover:bg-red-500/5 transition-all",
                children: "Sign Out"
              }
            )
          ] })
        ]
      }
    ),
    sidebarOpen && /* @__PURE__ */ jsx(
      "div",
      {
        className: "fixed inset-0 z-30 bg-black/60 lg:hidden",
        onClick: () => setSidebarOpen(false)
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "flex-1 flex flex-col min-h-screen min-w-0", children: [
      /* @__PURE__ */ jsxs("header", { className: "sticky top-0 z-20 bg-[#0B0F17]/90 backdrop-blur-md border-b border-white/5 px-6 py-4 flex items-center gap-4", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setSidebarOpen((v) => !v),
            className: "lg:hidden p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-all",
            children: "☰"
          }
        ),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "font-['Space_Grotesk'] font-bold text-white text-lg leading-tight", children: title }),
          /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-xs", children: subtitle })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "ml-auto flex items-center gap-2", children: [
          sync.isDirty && /* @__PURE__ */ jsxs("span", { className: "hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[10px] font-semibold", children: [
            /* @__PURE__ */ jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" }),
            "Unsaved Changes"
          ] }),
          !sync.isDirty && /* @__PURE__ */ jsxs("span", { className: "hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-semibold", children: [
            /* @__PURE__ */ jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" }),
            "All Saved"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("main", { className: "flex-1 p-6 overflow-y-auto", children: /* @__PURE__ */ jsx(SectionContent, { section, admin: session.username }) })
    ] })
  ] });
}
function AdminPage() {
  const [session, setSession] = useState(null);
  const [section, setSection] = useState("dashboard");
  const [dataReady, setDataReady] = useState(false);
  useEffect(() => {
    const stored = getAdminSession();
    const dataPromise = loadAllData().then((d) => {
      if (d.players) savePlayers(d.players, {
        silent: true
      });
      if (d.gamemodes) saveGamemodes(d.gamemodes, {
        silent: true
      });
      if (d.content) saveSiteContent(d.content, {
        silent: true
      });
      if (d.event) saveEventConfig(d.event, {
        silent: true
      });
      if (d.economy) saveEconomyOverrides(d.economy, {
        silent: true
      });
    }).catch(() => {
    });
    if (!stored) {
      dataPromise.finally(() => setDataReady(true));
      return;
    }
    checkAdminToken({
      data: {
        username: stored.username,
        loginAt: stored.loginAt,
        token: stored.token
      }
    }).then((result) => {
      if (result.valid) {
        setSession(stored);
      } else {
        setAdminSession(null);
      }
    }).catch(() => {
      setSession(stored);
    }).finally(() => dataPromise.finally(() => setDataReady(true)));
  }, []);
  function handleLogin(s) {
    setAdminSession(s);
    setSession(s);
  }
  function handleLogout() {
    setAdminSession(null);
    setSession(null);
  }
  if (!session) {
    return /* @__PURE__ */ jsx(AdminLogin, { onLogin: handleLogin });
  }
  if (!dataReady) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-[#0B0F17] flex items-center justify-center", children: /* @__PURE__ */ jsxs("div", { className: "text-center space-y-3", children: [
      /* @__PURE__ */ jsx("div", { className: "text-3xl animate-spin", children: "⟳" }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-500 text-sm", children: "Loading data from GitHub…" })
    ] }) });
  }
  return /* @__PURE__ */ jsx(AdminLayout, { session, section, setSection, onLogout: handleLogout });
}
export {
  AdminPage as component
};
