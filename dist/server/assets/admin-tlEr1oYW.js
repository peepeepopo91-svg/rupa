import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { c as createSsrRpc, p as players, a as REGIONS, v as validateAllData, b as previewRepairPlayers, r as repairPlayers, l as loadAllData, d as adminLoadUsers, e as adminCreateUser, f as adminCreateMiningForPlayer, g as adminUpdateUserPlayer, h as adminUpdateUserMining, i as adminRenameMiningUser, j as adminUpdateUserCred, k as adminDeleteUser, m as adminBulkDeleteUsers, n as fetchRepoStatus, o as checkGitHubConnection, q as fetchSyncHistory, s as fetchCommitHistory, t as flushStoresToDisk, u as fixGitDivergence, w as getBackupStatusFn, x as getGitDiagnostics, y as triggerBackupNow, z as setAutoBackupEnabled, A as setBackupDebounce, B as getTokenInfo, C as testGitHubToken, D as saveGitHubToken, E as clearGitHubToken, F as restoreToCommit, G as pullRemoteFiles, H as compareLocalToRemote } from "./router-rI-2RV5_.js";
import { z } from "zod";
import { c as createServerFn } from "../server.js";
import { m as markDirty, u as useSyncState, g as getDirty, c as clearDirty, s as setLastSync } from "./syncStore-C_ozCmAO.js";
import { g as gamemodes } from "./gamemodes-jMLNKT3S.js";
import { g as getPlayerTotalPoints, t as tierColors, T as TIER_ORDER } from "./tiers-BAwtsToj.js";
import { b as getDashboardStats, c as getAllMiningUsers, d as adminRenewMining, e as adminResetRenewal, f as adminAdjustRenewal, h as adminUpdateMiningUser } from "./miningServer-CjelG6QU.js";
import { e as adminGetAllPurchases, f as adminGetShopItems, h as adminGetShopStats, S as STATUS_LABELS, b as STATUS_COLORS, d as CATEGORY_ICONS, C as CATEGORY_LABELS, i as adminUpdatePurchase, a as RARITY_COLORS, R as RARITY_NAMES, j as adminAddShopItem, k as adminUpdateShopItem, l as adminDeleteShopItem } from "./shopServer-T6ul7OKC.js";
import { R as RIG_TIERS, M as MINING_CONSTANTS, E as EXCHANGE_CONSTANTS, g as getEconomyOverrides, q as saveEconomyOverrides } from "./miningStore-vSM2TBEv.js";
import { g as getSiteContent, s as saveSiteContent, r as resetSiteContent, a as getEventConfig, b as saveEventConfig, c as resetEventConfig } from "./contentStore-DOO6P7qG.js";
import { M as MATCH_STATUS_LABEL, a as DEFAULT_PRIZES, D as DEFAULT_RULES, S as STATUS_LABEL } from "./tournament-BY9twqTI.js";
import { g as getTournamentData, u as updateTournament, c as createTournament, s as setActiveTournament, d as duplicateTournament, a as archiveTournament, b as deleteTournament, e as bulkUpdateTeamStatus, f as updateTeamStatus, h as removeTeam, i as generateBracket, j as updateBracketSlot, k as updateMatch, l as updatePrizes, m as updateRules, n as addAnnouncement, o as deleteAnnouncement, p as addTeamManually } from "./tournamentServer-BWO3KrbW.js";
import "@tanstack/react-router";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "seroval";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "@tanstack/react-router/ssr/server";
import "./event-C34uXxsB.js";
const ADMIN_SESSION_KEY = "bn_admin_session";
const ADMIN_LOGS_KEY = "bn_admin_logs";
function safeGet$2(key) {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
function safeSet$2(key, value) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
  }
}
function getAdminSession() {
  return safeGet$2(ADMIN_SESSION_KEY);
}
function setAdminSession(session) {
  if (session) safeSet$2(ADMIN_SESSION_KEY, session);
  else try {
    if (typeof window !== "undefined") localStorage.removeItem(ADMIN_SESSION_KEY);
  } catch {
  }
}
function getLogs() {
  return safeGet$2(ADMIN_LOGS_KEY) ?? [];
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
  safeSet$2(ADMIN_LOGS_KEY, updated);
  return entry;
}
function clearLogs() {
  safeSet$2(ADMIN_LOGS_KEY, []);
}
const DEFAULT_SETTINGS = {
  maxAttempts: 5,
  lockoutMinutes: 15,
  sessionHours: 8
};
z.object({
  admin: z.object({
    username: z.string(),
    password1: z.string(),
    password2: z.string(),
    // Any session token whose loginAt < sessionInvalidBefore is rejected.
    // Bumped on every credential update to force re-authentication.
    sessionInvalidBefore: z.number().optional().default(0)
  }),
  // Runtime-configurable security settings (optional — defaults apply if absent)
  settings: z.object({
    maxAttempts: z.number().int().min(1).max(50).optional().default(DEFAULT_SETTINGS.maxAttempts),
    lockoutMinutes: z.number().int().min(1).max(1440).optional().default(DEFAULT_SETTINGS.lockoutMinutes),
    sessionHours: z.number().int().min(1).max(168).optional().default(DEFAULT_SETTINGS.sessionHours)
  }).optional().default(DEFAULT_SETTINGS)
});
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
const getAdminRateLimitStatus = createServerFn({
  method: "POST"
}).inputValidator(z.object({
  token: z.string(),
  username: z.string(),
  loginAt: z.number()
})).handler(createSsrRpc("582bae66d7219feca5ea4c219bd137246a4185778085ad86bee663fa90efcf28"));
const getSecuritySettings = createServerFn({
  method: "POST"
}).inputValidator(z.object({
  token: z.string(),
  username: z.string(),
  loginAt: z.number()
})).handler(createSsrRpc("5c143bedfa44b6fe18afd1d9304214d0d1f8ad09af7bd391cc59c10d3e063669"));
const updateSecuritySettings = createServerFn({
  method: "POST"
}).inputValidator(z.object({
  currentPassword1: z.string(),
  currentPassword2: z.string(),
  settings: z.object({
    maxAttempts: z.number().int().min(1).max(50),
    lockoutMinutes: z.number().int().min(1).max(1440),
    sessionHours: z.number().int().min(1).max(168)
  })
})).handler(createSsrRpc("ea0bbd2a4a7952e60896601906054e383855e4526e3770615fef1a49e29515fe"));
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
function getPlayers() {
  const stored = safeGet$1(PLAYERS_KEY);
  return stored ?? players;
}
function savePlayers(players2, opts) {
  safeSet$1(PLAYERS_KEY, players2);
  if (!opts?.silent) markDirty("players");
}
function deletePlayer(name) {
  savePlayers(getPlayers().filter((p) => p.name !== name));
}
function importPlayers(players2) {
  savePlayers(players2);
}
function resetPlayers() {
  safeSet$1(PLAYERS_KEY, players);
  markDirty("players");
}
function exportPlayersJSON() {
  return JSON.stringify(getPlayers(), null, 2);
}
function getGamemodes() {
  const stored = safeGet$1(GAMEMODES_KEY);
  return stored ?? gamemodes;
}
function saveGamemodes(gamemodes2, opts) {
  safeSet$1(GAMEMODES_KEY, gamemodes2);
  if (!opts?.silent) markDirty("gamemodes");
}
function resetGamemodes() {
  safeSet$1(GAMEMODES_KEY, gamemodes);
  markDirty("gamemodes");
}
function fmt$1(n, dec = 0) {
  return n.toLocaleString("en-US", { maximumFractionDigits: dec });
}
function fmtShort$1(n) {
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return String(Math.floor(n));
}
function timeAgo$8(ts) {
  const s = Math.floor((Date.now() - ts) / 1e3);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}
function actionColor(action) {
  if (action.startsWith("tier")) return "bg-[#00BFFF]/15 text-[#00BFFF] border-[#00BFFF]/20";
  if (action.startsWith("mining")) return "bg-emerald-500/15 text-emerald-400 border-emerald-500/20";
  if (action.startsWith("shop")) return "bg-purple-500/15 text-purple-400 border-purple-500/20";
  if (action.startsWith("economy")) return "bg-amber-500/15 text-amber-400 border-amber-500/20";
  if (action.startsWith("event")) return "bg-pink-500/15 text-pink-400 border-pink-500/20";
  if (action.startsWith("content")) return "bg-teal-500/15 text-teal-400 border-teal-500/20";
  if (action.startsWith("user")) return "bg-orange-500/15 text-orange-400 border-orange-500/20";
  if (action.startsWith("github") || action.startsWith("sync")) return "bg-gray-500/15 text-gray-300 border-gray-500/20";
  if (action.includes("login") || action.includes("logout")) return "bg-indigo-500/15 text-indigo-400 border-indigo-500/20";
  return "bg-white/8 text-gray-400 border-white/10";
}
function BlockProgress({ community, economy }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1e3);
    return () => clearInterval(id);
  }, []);
  if (!community) return null;
  const intervalMs = economy.BLOCK_INTERVAL_MS ?? MINING_CONSTANTS.BLOCK_INTERVAL_MS;
  const elapsed = now - community.startedAt;
  const remaining = intervalMs - elapsed;
  const isOverdue = remaining <= 0;
  const pct = isOverdue ? 100 : Math.min(100, elapsed / intervalMs * 100);
  const durMs = Math.abs(remaining);
  const dS = Math.floor(durMs / 1e3);
  const dM = Math.floor(dS / 60);
  const dH = Math.floor(dM / 60);
  const timeStr = dH > 0 ? `${dH}h ${dM % 60}m` : `${dM}m ${dS % 60}s`;
  return /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs", children: [
      /* @__PURE__ */ jsxs("span", { className: "text-gray-500", children: [
        "Block #",
        community.blockNumber,
        " in progress"
      ] }),
      isOverdue ? /* @__PURE__ */ jsxs("span", { className: "text-amber-400 font-mono font-bold animate-pulse", children: [
        "Overdue by ",
        timeStr,
        " — awaiting solver"
      ] }) : /* @__PURE__ */ jsxs("span", { className: "text-[#00BFFF] font-mono font-bold", children: [
        timeStr,
        " left"
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "relative w-full h-2.5 rounded-full bg-white/5 overflow-hidden", children: [
      /* @__PURE__ */ jsx(
        "div",
        {
          className: `absolute inset-y-0 left-0 rounded-full transition-all ${isOverdue ? "bg-gradient-to-r from-amber-500/70 to-amber-400" : "bg-gradient-to-r from-[#00BFFF]/60 to-[#00BFFF]"}`,
          style: { width: `${pct}%` }
        }
      ),
      /* @__PURE__ */ jsx(
        "div",
        {
          className: "absolute inset-0 rounded-full",
          style: { background: isOverdue ? "linear-gradient(90deg,transparent 60%,rgba(251,191,36,0.15))" : "linear-gradient(90deg,transparent 60%,rgba(0,191,255,0.15))" }
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-[10px] text-gray-700", children: [
      isOverdue ? /* @__PURE__ */ jsx("span", { className: "text-amber-600", children: "Block solved when next miner activity occurs" }) : /* @__PURE__ */ jsxs("span", { children: [
        pct.toFixed(1),
        "% of ",
        Math.round(intervalMs / 6e4),
        "m interval elapsed"
      ] }),
      /* @__PURE__ */ jsxs("span", { children: [
        community.totalSolved.toLocaleString(),
        " blocks solved total"
      ] })
    ] })
  ] });
}
function LiveClock() {
  const [t, setT] = useState("");
  useEffect(() => {
    const update = () => setT((/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    update();
    const id = setInterval(update, 1e3);
    return () => clearInterval(id);
  }, []);
  return /* @__PURE__ */ jsx("span", { className: "font-mono text-[#00BFFF] text-sm font-bold tabular-nums", children: t });
}
function Skeleton({ className }) {
  return /* @__PURE__ */ jsx("div", { className: `rounded-lg bg-white/5 animate-pulse ${className}` });
}
function StatCard$3({ icon, label, value, sub, color, badge }) {
  return /* @__PURE__ */ jsxs("div", { className: "glass rounded-xl border border-white/8 p-5 hover:border-white/15 transition-all duration-200 group relative overflow-hidden", children: [
    /* @__PURE__ */ jsx(
      "div",
      {
        className: "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity",
        style: { background: "radial-gradient(ellipse at top right,rgba(0,191,255,0.03),transparent 60%)" }
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between mb-3", children: [
      /* @__PURE__ */ jsx("span", { className: "text-xl", children: icon }),
      badge && /* @__PURE__ */ jsx("span", { className: `text-[9px] font-bold px-2 py-0.5 rounded-full border ${badge.color}`, children: badge.text })
    ] }),
    /* @__PURE__ */ jsx("p", { className: `font-['Space_Grotesk'] font-black text-2xl leading-tight ${color}`, children: typeof value === "number" ? fmt$1(value) : value }),
    /* @__PURE__ */ jsx("p", { className: "text-white text-xs font-semibold mt-1", children: label }),
    sub && /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-[10px] mt-0.5", children: sub })
  ] });
}
function Dashboard({ admin, setSection }) {
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [countdown, setCountdown] = useState(60);
  const [refreshing, setRefreshing] = useState(false);
  const [users, setUsers] = useState({});
  const [community, setCommunity] = useState(null);
  const [economy, setEconomy] = useState({});
  const [purchases, setPurchases] = useState([]);
  const [players2, setPlayers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [logFilter, setLogFilter] = useState("all");
  const [topN, setTopN] = useState(8);
  const [dateLabel, setDateLabel] = useState("");
  const [sessionDuration, setSessionDuration] = useState("");
  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setRefreshing(true);
    try {
      const [server, purcs] = await Promise.all([
        getDashboardStats().catch(() => ({ users: {}, community: null, economy: {} })),
        adminGetAllPurchases().catch(() => [])
      ]);
      setUsers(server.users ?? {});
      setCommunity(server.community ?? null);
      setEconomy(server.economy ?? {});
      setPurchases(purcs);
    } finally {
      setPlayers(getPlayers());
      setLogs(getLogs());
      setLastRefresh(Date.now());
      setCountdown(60);
      setLoading(false);
      setRefreshing(false);
    }
  }, []);
  useEffect(() => {
    setDateLabel((/* @__PURE__ */ new Date()).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }));
    const session = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("bn_admin_session") ?? "null") : null;
    if (session?.loginAt) {
      const mins = Math.floor((Date.now() - session.loginAt) / 6e4);
      setSessionDuration(mins < 60 ? `${mins}m session` : `${Math.floor(mins / 60)}h ${mins % 60}m session`);
    }
    load();
  }, [load]);
  useEffect(() => {
    const id = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          load(true);
          return 60;
        }
        return prev - 1;
      });
    }, 1e3);
    return () => clearInterval(id);
  }, [load]);
  const userList = Object.values(users);
  const totalBC = userList.reduce((s, u) => s + (u.balance ?? 0), 0);
  const totalGems = userList.reduce((s, u) => s + (u.gems ?? 0), 0);
  const activeRigs = userList.reduce((s, u) => s + u.rigs.filter((r) => r.status === "mining").length, 0);
  const brokenRigs = userList.reduce((s, u) => s + u.rigs.filter((r) => r.status === "broken").length, 0);
  const totalRigs = userList.reduce((s, u) => s + u.rigs.length, 0);
  const totalHashrate = userList.reduce((s, u) => s + u.rigs.filter((r) => r.status === "mining").reduce((sr, r) => sr + (RIG_TIERS.find((t) => t.id === r.tierId)?.hashrate ?? 0), 0), 0);
  const allPts = players2.map((p) => getPlayerTotalPoints(p.ranks));
  const avgPts = allPts.length ? Math.round(allPts.reduce((a, b) => a + b, 0) / allPts.length) : 0;
  const ht1Count = players2.filter((p) => Object.values(p.ranks).some((r) => r === "HT1")).length;
  const lt1Count = players2.filter((p) => Object.values(p.ranks).some((r) => r === "LT1")).length;
  const ovCount = Object.keys(economy).filter((k) => economy[k] !== void 0).length;
  const actionsToday = logs.filter((l) => Date.now() - l.timestamp < 864e5).length;
  const actionsHour = logs.filter((l) => Date.now() - l.timestamp < 36e5).length;
  const pendingOrders = purchases.filter((p) => p.status === "pending").length;
  const processingOrders = purchases.filter((p) => p.status === "processing").length;
  const completedOrders = purchases.filter((p) => p.status === "completed").length;
  const totalRevenue = purchases.filter((p) => !p.refunded).reduce((s, p) => s + p.totalCost, 0);
  const topPlayers = [...players2].sort((a, b) => getPlayerTotalPoints(b.ranks) - getPlayerTotalPoints(a.ranks)).slice(0, topN).map((p) => ({ player: p, pts: getPlayerTotalPoints(p.ranks) }));
  const maxPts = topPlayers[0]?.pts ?? 1;
  const tierDist = {};
  TIER_ORDER.forEach((t) => {
    tierDist[t] = 0;
  });
  players2.forEach((p) => {
    Object.values(p.ranks).forEach((r) => {
      if (r && r !== "None" && r !== "NONE" && tierDist[r] !== void 0) tierDist[r]++;
    });
  });
  const maxTierCount = Math.max(1, ...Object.values(tierDist));
  const regionDist = {};
  REGIONS.forEach((r) => {
    regionDist[r] = 0;
  });
  players2.forEach((p) => {
    if (regionDist[p.region] !== void 0) regionDist[p.region]++;
  });
  const maxRegion = Math.max(1, ...Object.values(regionDist));
  const gamemodeCoverage = gamemodes.map((gm) => ({
    gm,
    count: players2.filter((p) => {
      const r = p.ranks[gm.key];
      return r && r !== "None" && r !== "NONE";
    }).length
  }));
  const maxGmCount = Math.max(1, ...gamemodeCoverage.map((g) => g.count));
  const richlist = [...userList].sort((a, b) => (b.balance ?? 0) - (a.balance ?? 0)).slice(0, 6);
  const filteredLogs = logFilter === "all" ? logs.slice(0, 20) : logs.filter((l) => l.action.startsWith(logFilter)).slice(0, 20);
  const logCategories = ["all", "tier", "mining", "shop", "economy", "event", "content", "user", "github"];
  const DEFAULTS = {
    BASE_RATE: EXCHANGE_CONSTANTS.BASE_RATE,
    MIN_RATE: EXCHANGE_CONSTANTS.MIN_RATE,
    MAX_RATE: EXCHANGE_CONSTANTS.MAX_RATE,
    DAILY_TX_LIMIT: EXCHANGE_CONSTANTS.DAILY_TX_LIMIT,
    FEE_PCT: 0,
    BLOCK_REWARD: MINING_CONSTANTS.BLOCK_REWARD,
    BLOCK_INTERVAL_MS: MINING_CONSTANTS.BLOCK_INTERVAL_MS,
    FINDER_BONUS_PCT: MINING_CONSTANTS.FINDER_BONUS_PCT,
    STARTING_BALANCE: MINING_CONSTANTS.STARTING_BALANCE
  };
  return /* @__PURE__ */ jsxs("div", { className: "space-y-7 pb-10", children: [
    /* @__PURE__ */ jsxs("div", { className: "glass rounded-2xl border border-white/8 p-6 bg-gradient-to-r from-[#00BFFF]/5 via-transparent to-transparent", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-start justify-between gap-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
          /* @__PURE__ */ jsx("div", { className: "w-12 h-12 rounded-xl bg-[#00BFFF]/10 border border-[#00BFFF]/20 flex items-center justify-center font-['Space_Grotesk'] font-black text-lg text-[#00BFFF]", children: admin[0].toUpperCase() }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("h2", { className: "font-['Space_Grotesk'] font-black text-white text-xl", children: [
              "Welcome back, ",
              /* @__PURE__ */ jsx("span", { className: "text-[#00BFFF]", children: admin })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-gray-500 text-sm", children: dateLabel }),
            sessionDuration && /* @__PURE__ */ jsxs("p", { className: "text-gray-700 text-xs mt-0.5", children: [
              "🔐 ",
              sessionDuration
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 flex-wrap", children: [
          /* @__PURE__ */ jsx(LiveClock, {}),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/3 border border-white/8 text-xs text-gray-500", children: [
            /* @__PURE__ */ jsx("span", { className: `w-1.5 h-1.5 rounded-full ${refreshing ? "bg-orange-400 animate-pulse" : "bg-green-400"}` }),
            refreshing ? "Refreshing…" : lastRefresh ? `Updated ${Math.floor((Date.now() - lastRefresh) / 1e3)}s ago` : "Loading"
          ] }),
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => load(true),
              disabled: refreshing,
              className: "flex items-center gap-2 px-4 py-2 rounded-xl text-xs text-gray-400 border border-white/10 hover:border-[#00BFFF]/30 hover:text-[#00BFFF] transition-all disabled:opacity-50",
              children: [
                /* @__PURE__ */ jsx("span", { className: refreshing ? "animate-spin" : "", children: "↻" }),
                "Refresh (",
                countdown,
                "s)"
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "mt-4 flex flex-wrap gap-2", children: [
        { id: "tier-list", icon: "📋", label: "Tier List" },
        { id: "mining-mgmt", icon: "⛏️", label: "Mining" },
        { id: "shop-mgmt", icon: "🛒", label: "Shop" },
        { id: "events", icon: "🎉", label: "Events" },
        { id: "economy", icon: "💰", label: "Economy" },
        { id: "users", icon: "👥", label: "Users" },
        { id: "content", icon: "📝", label: "Content" },
        { id: "logs", icon: "📊", label: "Logs" },
        { id: "github-sync", icon: "☁️", label: "GitHub" }
      ].map((item) => /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => setSection?.(item.id),
          className: "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] text-gray-500 border border-white/8 hover:border-[#00BFFF]/25 hover:text-[#00BFFF] hover:bg-[#00BFFF]/5 transition-all",
          children: [
            /* @__PURE__ */ jsx("span", { children: item.icon }),
            item.label
          ]
        },
        item.id
      )) })
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
        /* @__PURE__ */ jsx("span", { className: "w-0.5 h-4 rounded-full bg-[#00BFFF]" }),
        /* @__PURE__ */ jsx("h3", { className: "text-[11px] uppercase tracking-widest text-gray-500 font-semibold", children: "Platform Overview" })
      ] }),
      loading ? /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3", children: Array.from({ length: 12 }).map((_, i) => /* @__PURE__ */ jsxs("div", { className: "glass rounded-xl border border-white/8 p-5 animate-pulse space-y-3", children: [
        /* @__PURE__ */ jsx(Skeleton, { className: "h-5 w-5" }),
        /* @__PURE__ */ jsx(Skeleton, { className: "h-7 w-24" }),
        /* @__PURE__ */ jsx(Skeleton, { className: "h-3 w-28" })
      ] }, i)) }) : /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3", children: [
        /* @__PURE__ */ jsx(StatCard$3, { icon: "📋", label: "Ranked Players", value: players2.length, sub: `${ht1Count} HT1 · ${lt1Count} LT1`, color: "text-[#00BFFF]", badge: ht1Count > 0 ? { text: "Elite", color: "bg-[#00BFFF]/10 text-[#00BFFF] border-[#00BFFF]/20" } : void 0 }),
        /* @__PURE__ */ jsx(StatCard$3, { icon: "⭐", label: "Avg Score", value: `${avgPts} pts`, sub: `${allPts.filter((p) => p > 0).length} scored`, color: "text-yellow-400" }),
        /* @__PURE__ */ jsx(StatCard$3, { icon: "👥", label: "Mining Accounts", value: userList.length, sub: `${userList.filter((u) => u.rigs.length > 0).length} have rigs`, color: "text-green-400" }),
        /* @__PURE__ */ jsx(StatCard$3, { icon: "₿", label: "BC Circulating", value: fmtShort$1(totalBC), sub: `${fmt$1(totalBC)} BlueCoin total`, color: "text-amber-400" }),
        /* @__PURE__ */ jsx(StatCard$3, { icon: "💎", label: "Gems Circulating", value: fmtShort$1(totalGems), sub: `${fmt$1(totalGems)} Gems total`, color: "text-purple-400" }),
        /* @__PURE__ */ jsx(StatCard$3, { icon: "⛏️", label: "Active Rigs", value: activeRigs, sub: `${totalRigs} total · ${brokenRigs} broken`, color: "text-cyan-400", badge: brokenRigs > 0 ? { text: `${brokenRigs} broken`, color: "bg-red-500/10 text-red-400 border-red-500/20" } : void 0 }),
        /* @__PURE__ */ jsx(StatCard$3, { icon: "⚡", label: "Network Hashrate", value: `${fmt$1(totalHashrate)} GH/s`, sub: `across ${activeRigs} active rigs`, color: "text-emerald-400" }),
        /* @__PURE__ */ jsx(StatCard$3, { icon: "🧱", label: "Blocks Solved", value: community?.totalSolved ?? 0, sub: `Block #${community?.blockNumber ?? 1} active`, color: "text-teal-400" }),
        /* @__PURE__ */ jsx(StatCard$3, { icon: "🛒", label: "Pending Orders", value: pendingOrders, sub: `${processingOrders} processing`, color: "text-orange-400", badge: pendingOrders > 0 ? { text: "Action needed", color: "bg-orange-500/10 text-orange-400 border-orange-500/20" } : void 0 }),
        /* @__PURE__ */ jsx(StatCard$3, { icon: "✅", label: "Completed Orders", value: completedOrders, sub: `${fmt$1(totalRevenue)} ✦ revenue`, color: "text-lime-400" }),
        /* @__PURE__ */ jsx(StatCard$3, { icon: "⚙️", label: "Economy Overrides", value: ovCount, sub: ovCount ? "Custom values active" : "All at defaults", color: ovCount ? "text-orange-400" : "text-gray-500" }),
        /* @__PURE__ */ jsx(StatCard$3, { icon: "📊", label: "Actions Today", value: actionsToday, sub: `${actionsHour} in last hour`, color: "text-pink-400" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-5", children: [
      /* @__PURE__ */ jsxs("div", { className: "lg:col-span-2 glass rounded-2xl border border-white/8 p-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-5", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("span", { className: "text-base", children: "🧱" }),
            /* @__PURE__ */ jsx("h3", { className: "font-['Space_Grotesk'] font-bold text-white text-sm", children: "Community Block Progress" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-xs text-gray-600", children: [
            /* @__PURE__ */ jsx("span", { className: "w-2 h-2 rounded-full bg-emerald-400 animate-pulse" }),
            "Live"
          ] })
        ] }),
        loading ? /* @__PURE__ */ jsxs("div", { className: "space-y-2 animate-pulse", children: [
          /* @__PURE__ */ jsx(Skeleton, { className: "h-3 w-full" }),
          /* @__PURE__ */ jsx(Skeleton, { className: "h-3 w-3/4" })
        ] }) : /* @__PURE__ */ jsx(BlockProgress, { community, economy }),
        /* @__PURE__ */ jsx("div", { className: "mt-5 grid grid-cols-3 gap-3", children: [
          { label: "Block Reward", value: `${(economy.BLOCK_REWARD ?? MINING_CONSTANTS.BLOCK_REWARD).toLocaleString()} BC`, color: "text-amber-400" },
          { label: "Finder Bonus", value: `${((economy.FINDER_BONUS_PCT ?? MINING_CONSTANTS.FINDER_BONUS_PCT) * 100).toFixed(0)}%`, color: "text-[#00BFFF]" },
          { label: "Interval", value: `${((economy.BLOCK_INTERVAL_MS ?? MINING_CONSTANTS.BLOCK_INTERVAL_MS) / 6e4).toFixed(0)}m`, color: "text-purple-400" }
        ].map((s) => /* @__PURE__ */ jsxs("div", { className: "p-3 rounded-xl bg-white/3 border border-white/5 text-center", children: [
          /* @__PURE__ */ jsx("p", { className: `font-['Space_Grotesk'] font-black text-base ${s.color}`, children: s.value }),
          /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-[10px] mt-0.5", children: s.label })
        ] }, s.label)) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "glass rounded-2xl border border-white/8 p-6", children: [
        /* @__PURE__ */ jsx("h3", { className: "font-['Space_Grotesk'] font-bold text-white text-sm mb-4", children: "💰 BC Richlist" }),
        loading ? /* @__PURE__ */ jsx("div", { className: "space-y-2 animate-pulse", children: Array.from({ length: 5 }).map((_, i) => /* @__PURE__ */ jsx(Skeleton, { className: "h-10 w-full" }, i)) }) : richlist.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-xs text-center py-6", children: "No miners yet" }) : /* @__PURE__ */ jsx("div", { className: "space-y-2", children: richlist.map((u, i) => {
          const active = u.rigs.filter((r) => r.status === "mining").length;
          const hp = userList.reduce((m, x) => Math.max(m, x.balance ?? 0), 1);
          return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-white/3 transition-colors group", children: [
            /* @__PURE__ */ jsxs("span", { className: `text-xs font-bold w-4 tabular-nums ${i === 0 ? "text-amber-400" : i === 1 ? "text-gray-300" : i === 2 ? "text-orange-600" : "text-gray-700"}`, children: [
              "#",
              i + 1
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsx("p", { className: "text-white text-xs font-semibold truncate", children: u.username }),
              /* @__PURE__ */ jsx("div", { className: "w-full h-1 rounded-full bg-white/5 mt-1 overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: "h-1 rounded-full bg-gradient-to-r from-amber-500/60 to-amber-400", style: { width: `${(u.balance ?? 0) / hp * 100}%` } }) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "text-right shrink-0", children: [
              /* @__PURE__ */ jsx("p", { className: "text-amber-400 text-xs font-bold font-mono", children: fmtShort$1(u.balance ?? 0) }),
              /* @__PURE__ */ jsxs("p", { className: "text-gray-700 text-[9px]", children: [
                active,
                " rigs"
              ] })
            ] })
          ] }, u.username);
        }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-5 gap-5", children: [
      /* @__PURE__ */ jsxs("div", { className: "lg:col-span-3 glass rounded-2xl border border-white/8 p-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("span", { className: "text-base", children: "🏆" }),
            /* @__PURE__ */ jsx("h3", { className: "font-['Space_Grotesk'] font-bold text-white text-sm", children: "Top Players" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex gap-1", children: [5, 8, 10].map((n) => /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setTopN(n),
              className: `px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-all ${topN === n ? "bg-[#00BFFF]/12 border-[#00BFFF]/25 text-[#00BFFF]" : "border-white/10 text-gray-600 hover:text-gray-300"}`,
              children: [
                "Top ",
                n
              ]
            },
            n
          )) })
        ] }),
        loading ? /* @__PURE__ */ jsx("div", { className: "space-y-2.5 animate-pulse", children: Array.from({ length: 5 }).map((_, i) => /* @__PURE__ */ jsx(Skeleton, { className: "h-12 w-full" }, i)) }) : /* @__PURE__ */ jsx("div", { className: "space-y-1.5", children: topPlayers.map(({ player: p, pts }, i) => {
          const bestTier = Object.values(p.ranks).filter((r) => r && r !== "None" && r !== "NONE").sort((a, b) => {
            const ai = TIER_ORDER.indexOf(a);
            const bi = TIER_ORDER.indexOf(b);
            return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
          })[0];
          const tc = bestTier ? tierColors[bestTier] : null;
          const pct = pts / maxPts * 100;
          return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/3 transition-colors group", children: [
            /* @__PURE__ */ jsx("span", { className: `text-xs font-black w-5 tabular-nums ${i === 0 ? "text-amber-400" : i === 1 ? "text-gray-300" : i === 2 ? "text-orange-600" : "text-gray-700"}`, children: i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}` }),
            /* @__PURE__ */ jsx(
              "img",
              {
                src: p.head,
                alt: p.name,
                className: "w-8 h-8 rounded-lg shrink-0",
                onError: (e) => {
                  e.target.src = "";
                }
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 mb-1", children: [
                /* @__PURE__ */ jsx("span", { className: "text-white text-xs font-semibold truncate", children: p.name }),
                tc && bestTier && /* @__PURE__ */ jsx("span", { className: `text-[9px] font-bold px-1.5 py-0.5 rounded-md border ${tc.bg} ${tc.text} ${tc.border}`, children: bestTier }),
                /* @__PURE__ */ jsx("span", { className: "text-gray-700 text-[9px] ml-0.5", children: p.region })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "w-full h-1 rounded-full bg-white/5 overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: "h-1 rounded-full bg-gradient-to-r from-[#00BFFF]/50 to-[#00BFFF]", style: { width: `${pct}%` } }) })
            ] }),
            /* @__PURE__ */ jsxs("span", { className: "font-mono text-[#00BFFF] text-xs font-bold shrink-0", children: [
              pts,
              " pts"
            ] })
          ] }, p.name);
        }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "lg:col-span-2 glass rounded-2xl border border-white/8 p-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
          /* @__PURE__ */ jsx("span", { className: "text-base", children: "📊" }),
          /* @__PURE__ */ jsx("h3", { className: "font-['Space_Grotesk'] font-bold text-white text-sm", children: "Tier Distribution" })
        ] }),
        loading ? /* @__PURE__ */ jsx("div", { className: "space-y-2 animate-pulse", children: Array.from({ length: 10 }).map((_, i) => /* @__PURE__ */ jsx(Skeleton, { className: "h-6 w-full" }, i)) }) : /* @__PURE__ */ jsx("div", { className: "space-y-1.5", children: TIER_ORDER.map((tier) => {
          const count = tierDist[tier] ?? 0;
          const tc = tierColors[tier];
          const pct = count / maxTierCount * 100;
          return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2.5", children: [
            /* @__PURE__ */ jsx("span", { className: `text-[10px] font-black w-8 shrink-0 ${tc.text}`, children: tier }),
            /* @__PURE__ */ jsxs("div", { className: "flex-1 h-4 rounded-md bg-white/3 overflow-hidden relative", children: [
              /* @__PURE__ */ jsx("div", { className: `h-full rounded-md ${tc.bg} transition-all`, style: { width: `${pct}%` } }),
              count > 0 && /* @__PURE__ */ jsx("span", { className: "absolute inset-y-0 left-1.5 flex items-center text-[9px] font-bold text-white/70", children: count })
            ] }),
            /* @__PURE__ */ jsx("span", { className: "text-gray-700 text-[10px] w-5 text-right tabular-nums", children: count })
          ] }, tier);
        }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-5", children: [
      /* @__PURE__ */ jsxs("div", { className: "glass rounded-2xl border border-white/8 p-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
          /* @__PURE__ */ jsx("span", { className: "text-base", children: "🌍" }),
          /* @__PURE__ */ jsx("h3", { className: "font-['Space_Grotesk'] font-bold text-white text-sm", children: "Player Regions" })
        ] }),
        loading ? /* @__PURE__ */ jsx("div", { className: "space-y-2 animate-pulse", children: Array.from({ length: 7 }).map((_, i) => /* @__PURE__ */ jsx(Skeleton, { className: "h-5 w-full" }, i)) }) : /* @__PURE__ */ jsx("div", { className: "space-y-2", children: Object.entries(regionDist).sort((a, b) => b[1] - a[1]).map(([region, count]) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-500 text-xs truncate flex-1 min-w-0", children: region }),
          /* @__PURE__ */ jsx("div", { className: "w-20 h-2 rounded-full bg-white/5 overflow-hidden", children: /* @__PURE__ */ jsx(
            "div",
            {
              className: "h-2 rounded-full bg-gradient-to-r from-[#00BFFF]/40 to-[#00BFFF]",
              style: { width: `${count / maxRegion * 100}%` }
            }
          ) }),
          /* @__PURE__ */ jsx("span", { className: "text-white text-xs font-bold w-6 text-right tabular-nums", children: count })
        ] }, region)) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "glass rounded-2xl border border-white/8 p-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
          /* @__PURE__ */ jsx("span", { className: "text-base", children: "🎮" }),
          /* @__PURE__ */ jsx("h3", { className: "font-['Space_Grotesk'] font-bold text-white text-sm", children: "Gamemode Coverage" })
        ] }),
        loading ? /* @__PURE__ */ jsx("div", { className: "space-y-2 animate-pulse", children: Array.from({ length: 7 }).map((_, i) => /* @__PURE__ */ jsx(Skeleton, { className: "h-5 w-full" }, i)) }) : /* @__PURE__ */ jsx("div", { className: "space-y-2", children: gamemodeCoverage.sort((a, b) => b.count - a.count).map(({ gm, count }) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-sm w-5 text-center", children: gm.fallback }),
          /* @__PURE__ */ jsx("span", { className: "text-gray-500 text-xs w-14 shrink-0", children: gm.label }),
          /* @__PURE__ */ jsx("div", { className: "flex-1 h-2 rounded-full bg-white/5 overflow-hidden", children: /* @__PURE__ */ jsx(
            "div",
            {
              className: "h-2 rounded-full bg-gradient-to-r from-purple-500/40 to-purple-400",
              style: { width: `${count / maxGmCount * 100}%` }
            }
          ) }),
          /* @__PURE__ */ jsx("span", { className: "text-white text-xs font-bold w-6 text-right tabular-nums", children: count })
        ] }, gm.key)) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "glass rounded-2xl border border-white/8 p-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
          /* @__PURE__ */ jsx("span", { className: "text-base", children: "🛒" }),
          /* @__PURE__ */ jsx("h3", { className: "font-['Space_Grotesk'] font-bold text-white text-sm", children: "Shop Queue" })
        ] }),
        loading ? /* @__PURE__ */ jsx("div", { className: "space-y-3 animate-pulse", children: Array.from({ length: 4 }).map((_, i) => /* @__PURE__ */ jsx(Skeleton, { className: "h-12 w-full" }, i)) }) : /* @__PURE__ */ jsxs("div", { className: "space-y-2.5", children: [
          [
            { label: "Pending", value: pendingOrders, icon: "⏳", color: "text-orange-400", bg: "bg-orange-500/8 border-orange-500/20", urgent: pendingOrders > 0 },
            { label: "Processing", value: processingOrders, icon: "⚙️", color: "text-[#00BFFF]", bg: "bg-[#00BFFF]/8 border-[#00BFFF]/20", urgent: false },
            { label: "Completed", value: completedOrders, icon: "✅", color: "text-green-400", bg: "bg-green-500/8 border-green-500/20", urgent: false },
            { label: "Total Revenue", value: `${fmtShort$1(totalRevenue)} ✦`, icon: "💎", color: "text-purple-400", bg: "bg-purple-500/8 border-purple-500/20", urgent: false }
          ].map((s) => /* @__PURE__ */ jsxs("div", { className: `flex items-center gap-3 px-3.5 py-2.5 rounded-xl border ${s.bg} ${s.urgent ? "animate-pulse" : ""}`, children: [
            /* @__PURE__ */ jsx("span", { className: "text-sm", children: s.icon }),
            /* @__PURE__ */ jsx("span", { className: "text-gray-400 text-xs flex-1", children: s.label }),
            /* @__PURE__ */ jsx("span", { className: `font-['Space_Grotesk'] font-black text-base ${s.color}`, children: typeof s.value === "number" ? s.value : s.value })
          ] }, s.label)),
          pendingOrders > 0 && /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setSection?.("shop-mgmt"),
              className: "w-full mt-1 py-2 rounded-xl text-xs font-semibold text-orange-400 border border-orange-500/25 hover:bg-orange-500/8 transition-all",
              children: [
                "→ Review ",
                pendingOrders,
                " pending order",
                pendingOrders !== 1 ? "s" : ""
              ]
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "glass rounded-2xl border border-white/8 p-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-5", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-base", children: "⚙️" }),
          /* @__PURE__ */ jsx("h3", { className: "font-['Space_Grotesk'] font-bold text-white text-sm", children: "Economy Constants" }),
          ovCount > 0 && /* @__PURE__ */ jsxs("span", { className: "px-2 py-0.5 rounded-full text-[9px] font-bold bg-orange-500/10 border border-orange-500/20 text-orange-400", children: [
            ovCount,
            " override",
            ovCount !== 1 ? "s" : "",
            " active"
          ] })
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setSection?.("economy"),
            className: "text-xs text-gray-500 hover:text-[#00BFFF] transition-colors",
            children: "Edit →"
          }
        )
      ] }),
      loading ? /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 animate-pulse", children: Array.from({ length: 10 }).map((_, i) => /* @__PURE__ */ jsx(Skeleton, { className: "h-14 w-full" }, i)) }) : /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3", children: Object.entries(DEFAULTS).map(([key, defVal]) => {
        const curVal = economy[key];
        const isOverridden = curVal !== void 0;
        const displayVal = isOverridden ? curVal : defVal;
        const label = key.replace(/_/g, " ").replace(/MS$/, " (ms)").replace(/PCT$/, " (%)");
        return /* @__PURE__ */ jsxs("div", { className: `p-3 rounded-xl border ${isOverridden ? "bg-orange-500/5 border-orange-500/20" : "bg-white/3 border-white/5"}`, children: [
          /* @__PURE__ */ jsx("p", { className: `font-['Space_Grotesk'] font-black text-sm ${isOverridden ? "text-orange-400" : "text-white"}`, children: key.endsWith("PCT") ? `${((displayVal ?? 0) * 100).toFixed(0)}%` : key.endsWith("MS") ? `${((displayVal ?? 0) / 6e4).toFixed(0)}m` : (displayVal ?? 0).toLocaleString() }),
          /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-[9px] mt-0.5 leading-tight capitalize", children: label.toLowerCase() }),
          isOverridden && /* @__PURE__ */ jsx("p", { className: "text-orange-600 text-[9px]", children: "overridden" })
        ] }, key);
      }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "glass rounded-2xl border border-white/8 p-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3 mb-5", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-base", children: "📋" }),
          /* @__PURE__ */ jsx("h3", { className: "font-['Space_Grotesk'] font-bold text-white text-sm", children: "Activity Log" }),
          /* @__PURE__ */ jsxs("span", { className: "text-gray-600 text-xs", children: [
            "(",
            actionsToday,
            " today)"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-1 flex-wrap", children: [
          logCategories.map((cat) => /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setLogFilter(cat),
              className: `px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-all capitalize ${logFilter === cat ? "bg-[#00BFFF]/12 border-[#00BFFF]/25 text-[#00BFFF]" : "border-white/8 text-gray-600 hover:text-gray-300 hover:border-white/15"}`,
              children: cat
            },
            cat
          )),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setSection?.("logs"),
              className: "px-2.5 py-1 rounded-lg text-[10px] text-gray-600 border border-white/8 hover:text-[#00BFFF] hover:border-[#00BFFF]/20 transition-all",
              children: "Full Log →"
            }
          )
        ] })
      ] }),
      loading ? /* @__PURE__ */ jsx("div", { className: "space-y-2 animate-pulse", children: Array.from({ length: 6 }).map((_, i) => /* @__PURE__ */ jsx(Skeleton, { className: "h-10 w-full" }, i)) }) : filteredLogs.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "text-center py-8 text-gray-600 text-sm", children: [
        /* @__PURE__ */ jsx("div", { className: "text-3xl mb-2 opacity-30", children: "📋" }),
        "No activity matching this filter."
      ] }) : /* @__PURE__ */ jsx("div", { className: "space-y-1.5", children: filteredLogs.map((log) => /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-white/3 transition-colors group", children: [
        /* @__PURE__ */ jsx("span", { className: "text-[10px] font-mono text-gray-700 mt-0.5 shrink-0 w-12 tabular-nums", children: new Date(log.timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) }),
        /* @__PURE__ */ jsx("span", { className: `text-[9px] font-bold px-2 py-0.5 rounded-md border shrink-0 ${actionColor(log.action)}`, children: log.action }),
        /* @__PURE__ */ jsx("div", { className: "flex-1 min-w-0", children: log.details && /* @__PURE__ */ jsx("p", { className: "text-gray-500 text-[11px] truncate", children: log.details }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 shrink-0", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-700 text-[9px] font-mono", children: log.admin }),
          /* @__PURE__ */ jsx("span", { className: "text-gray-800 text-[9px]", children: timeAgo$8(log.timestamp) })
        ] })
      ] }, log.id)) })
    ] }),
    !loading && purchases.length > 0 && /* @__PURE__ */ jsxs("div", { className: "glass rounded-2xl border border-white/8 p-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-base", children: "🧾" }),
          /* @__PURE__ */ jsx("h3", { className: "font-['Space_Grotesk'] font-bold text-white text-sm", children: "Recent Shop Orders" })
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setSection?.("shop-mgmt"),
            className: "text-xs text-gray-500 hover:text-[#00BFFF] transition-colors",
            children: "Manage →"
          }
        )
      ] }),
      /* @__PURE__ */ jsx("div", { className: "space-y-1.5", children: purchases.slice(0, 6).map((p) => {
        const statusColor = {
          pending: "bg-orange-500/10 border-orange-500/20 text-orange-400",
          processing: "bg-[#00BFFF]/10 border-[#00BFFF]/20 text-[#00BFFF]",
          completed: "bg-green-500/10 border-green-500/20 text-green-400",
          cancelled: "bg-red-500/10 border-red-500/20 text-red-400",
          rejected: "bg-red-800/10 border-red-800/20 text-red-600"
        }[p.status] ?? "bg-white/5 border-white/10 text-gray-500";
        return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/3 transition-colors", children: [
          /* @__PURE__ */ jsx("span", { className: "font-mono text-gray-700 text-[10px] shrink-0", children: p.id }),
          /* @__PURE__ */ jsx("span", { className: "text-white text-xs font-semibold flex-1 truncate", children: p.itemName }),
          /* @__PURE__ */ jsx("span", { className: "text-gray-600 text-xs shrink-0", children: p.username }),
          /* @__PURE__ */ jsxs("span", { className: "text-purple-400 text-xs font-bold shrink-0 font-mono", children: [
            fmtShort$1(p.totalCost),
            " ✦"
          ] }),
          /* @__PURE__ */ jsx("span", { className: `text-[9px] font-bold px-2 py-0.5 rounded-md border shrink-0 ${statusColor}`, children: p.status }),
          /* @__PURE__ */ jsx("span", { className: "text-gray-700 text-[9px] shrink-0", children: timeAgo$8(p.createdAt) })
        ] }, p.id);
      }) })
    ] })
  ] });
}
const BLANK_PLAYER = {
  name: "",
  head: "",
  region: "North America",
  ranks: Object.fromEntries(gamemodes.map((gm) => [gm.key, "None"]))
};
function AdminToast$1({ msg, type }) {
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
    toast && /* @__PURE__ */ jsx(AdminToast$1, { msg: toast.msg, type: toast.type }),
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
function AdminToast({ msg, type }) {
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
    toast && /* @__PURE__ */ jsx(AdminToast, { msg: toast.msg, type: toast.type }),
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
function timeAgo$7(ms) {
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
function Toast$5({ msg, type }) {
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
    toast && /* @__PURE__ */ jsx(Toast$5, { msg: toast.msg, type: toast.type }),
    /* @__PURE__ */ jsxs("div", { className: "px-6 py-4 border-b border-white/5 flex items-center gap-4", children: [
      /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-xl bg-[#00BFFF]/10 border border-[#00BFFF]/20 flex items-center justify-center text-lg font-black text-[#00BFFF]", children: user.username[0].toUpperCase() }),
      /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsx("p", { className: "text-white font-bold text-sm leading-tight", children: user.username }),
        /* @__PURE__ */ jsxs("p", { className: "text-gray-600 text-[10px] mt-0.5", children: [
          "Joined ",
          new Date(user.createdAt).toLocaleDateString(),
          " · Last active ",
          timeAgo$7(user.lastCheckedAt)
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
    toast && /* @__PURE__ */ jsx(Toast$5, { msg: toast.msg, type: toast.type }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/2 border border-white/5 text-[11px]", children: [
      /* @__PURE__ */ jsx("span", { className: `w-2 h-2 rounded-full shrink-0 ${sseOk ? "bg-green-400 animate-pulse" : "bg-amber-400"}` }),
      /* @__PURE__ */ jsx("span", { className: sseOk ? "text-green-400" : "text-amber-400", children: sseOk ? "Live — receiving real-time updates" : "Polling (SSE reconnecting…)" }),
      /* @__PURE__ */ jsx("span", { className: "text-gray-700 ml-auto", children: lastSync ? `Synced ${timeAgo$7(lastSync)}` : "Loading…" }),
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
                    /* @__PURE__ */ jsx("p", { className: "text-gray-700 text-[10px]", children: timeAgo$7(u.lastCheckedAt) })
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
const TABS = [
  { id: "overview", label: "Overview", icon: "📊" },
  { id: "exchange", label: "Exchange", icon: "💱" },
  { id: "mining", label: "Mining", icon: "⛏️" },
  { id: "hardware", label: "Hardware", icon: "🖥️" },
  { id: "simulator", label: "Simulator", icon: "🧪" },
  { id: "history", label: "History", icon: "📋" }
];
const HISTORY_KEY = "bn_economy_history";
function fmt(n, dec = 0) {
  return n.toLocaleString("en-US", { maximumFractionDigits: dec });
}
function fmtShort(n) {
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return String(Math.floor(n));
}
function fmtMs(ms) {
  if (ms >= 36e5) return `${(ms / 36e5).toFixed(1)}h`;
  if (ms >= 6e4) return `${Math.round(ms / 6e4)}m`;
  return `${Math.round(ms / 1e3)}s`;
}
function safeGet(key) {
  try {
    const r = localStorage.getItem(key);
    return r ? JSON.parse(r) : null;
  } catch {
    return null;
  }
}
function safeSet(key, v) {
  try {
    localStorage.setItem(key, JSON.stringify(v));
  } catch {
  }
}
function computeRate(now, ov) {
  const BASE = ov.BASE_RATE ?? EXCHANGE_CONSTANTS.BASE_RATE;
  const MIN = ov.MIN_RATE ?? EXCHANGE_CONSTANTS.MIN_RATE;
  const MAX = ov.MAX_RATE ?? EXCHANGE_CONSTANTS.MAX_RATE;
  const PERIOD = EXCHANGE_CONSTANTS.FLUCTUATION_PERIOD_MS;
  const t = now % PERIOD / PERIOD;
  const wave = Math.sin(2 * Math.PI * t) * 0.65 + Math.sin(2 * Math.PI * t * 2.7 + 1.2) * 0.35;
  const amplitude = (MAX - MIN) / 2;
  return Math.round(BASE + wave * amplitude);
}
function computeRateHistory(ov, points = 96) {
  const PERIOD = EXCHANGE_CONSTANTS.FLUCTUATION_PERIOD_MS;
  const step = PERIOD / points;
  const now = Date.now();
  const amplitude = ((ov.MAX_RATE ?? EXCHANGE_CONSTANTS.MAX_RATE) - (ov.MIN_RATE ?? EXCHANGE_CONSTANTS.MIN_RATE)) / 2;
  return Array.from({ length: points }, (_, i) => {
    const tMs = now - (points - 1 - i) * step;
    const t = (tMs % PERIOD + PERIOD) % PERIOD / PERIOD;
    const wave = Math.sin(2 * Math.PI * t) * 0.65 + Math.sin(2 * Math.PI * t * 2.7 + 1.2) * 0.35;
    return Math.round((ov.BASE_RATE ?? EXCHANGE_CONSTANTS.BASE_RATE) + wave * amplitude);
  });
}
function Toast$4({ msg, type }) {
  return /* @__PURE__ */ jsxs("div", { className: `fixed top-6 right-6 z-50 px-5 py-3 rounded-xl text-sm font-semibold shadow-xl border ${type === "success" ? "bg-green-500/15 border-green-500/30 text-green-400" : "bg-red-500/15 border-red-500/30 text-red-400"}`, children: [
    type === "success" ? "✓ " : "⚠ ",
    msg
  ] });
}
function SectionHeader({ icon, title, sub }) {
  return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-6", children: [
    /* @__PURE__ */ jsx("div", { className: "w-9 h-9 rounded-xl bg-[#00BFFF]/10 border border-[#00BFFF]/20 flex items-center justify-center text-base", children: icon }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h3", { className: "font-['Space_Grotesk'] font-black text-white text-base", children: title }),
      sub && /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-xs", children: sub })
    ] })
  ] });
}
function RateChart({ points, min, max, base, current }) {
  const W = 600;
  const H = 120;
  const PAD = 8;
  const range = max - min || 1;
  const scaleY = (v) => PAD + (1 - (v - min) / range) * (H - PAD * 2);
  const scaleX = (i) => PAD + i / (points.length - 1) * (W - PAD * 2);
  const d = points.map((v, i) => `${i === 0 ? "M" : "L"}${scaleX(i).toFixed(1)},${scaleY(v).toFixed(1)}`).join(" ");
  const area = d + ` L${scaleX(points.length - 1).toFixed(1)},${H} L${PAD},${H} Z`;
  const baseY = scaleY(base);
  const curX = scaleX(points.length - 1);
  const curY = scaleY(current);
  return /* @__PURE__ */ jsxs("svg", { viewBox: `0 0 ${W} ${H}`, className: "w-full h-28", preserveAspectRatio: "none", children: [
    /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsxs("linearGradient", { id: "rateGrad", x1: "0", y1: "0", x2: "0", y2: "1", children: [
      /* @__PURE__ */ jsx("stop", { offset: "0%", stopColor: "#00BFFF", stopOpacity: "0.25" }),
      /* @__PURE__ */ jsx("stop", { offset: "100%", stopColor: "#00BFFF", stopOpacity: "0.02" })
    ] }) }),
    /* @__PURE__ */ jsx("path", { d: area, fill: "url(#rateGrad)" }),
    /* @__PURE__ */ jsx(
      "line",
      {
        x1: PAD,
        y1: baseY,
        x2: W - PAD,
        y2: baseY,
        stroke: "#ffffff",
        strokeOpacity: "0.12",
        strokeWidth: "1",
        strokeDasharray: "4 4"
      }
    ),
    /* @__PURE__ */ jsx(
      "line",
      {
        x1: PAD,
        y1: scaleY(min),
        x2: W - PAD,
        y2: scaleY(min),
        stroke: "#ef4444",
        strokeOpacity: "0.2",
        strokeWidth: "1",
        strokeDasharray: "2 4"
      }
    ),
    /* @__PURE__ */ jsx(
      "line",
      {
        x1: PAD,
        y1: scaleY(max),
        x2: W - PAD,
        y2: scaleY(max),
        stroke: "#22c55e",
        strokeOpacity: "0.2",
        strokeWidth: "1",
        strokeDasharray: "2 4"
      }
    ),
    /* @__PURE__ */ jsx("path", { d, fill: "none", stroke: "#00BFFF", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }),
    /* @__PURE__ */ jsx("circle", { cx: curX, cy: curY, r: "5", fill: "#00BFFF" }),
    /* @__PURE__ */ jsx("circle", { cx: curX, cy: curY, r: "9", fill: "#00BFFF", fillOpacity: "0.2" })
  ] });
}
function SplitDonut({ finder, equal, hashrate }) {
  const total = finder + equal + hashrate || 1;
  const f = finder / total;
  const e = equal / total;
  const h = hashrate / total;
  const R = 36;
  const cx = 44;
  const cy = 44;
  const stroke = 14;
  const circumference = 2 * Math.PI * R;
  function arc(from, pct) {
    return {
      strokeDasharray: `${(pct * circumference).toFixed(2)} ${circumference.toFixed(2)}`,
      strokeDashoffset: `${(-from * circumference).toFixed(2)}`
    };
  }
  const segments = [
    { pct: f, from: 0, color: "#f59e0b", label: "Finder" },
    { pct: e, from: f, color: "#00BFFF", label: "Equal" },
    { pct: h, from: f + e, color: "#a78bfa", label: "Hashrate" }
  ];
  return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-6", children: [
    /* @__PURE__ */ jsxs("svg", { width: "88", height: "88", children: [
      /* @__PURE__ */ jsx("circle", { cx, cy, r: R, fill: "none", stroke: "rgba(255,255,255,0.05)", strokeWidth: stroke }),
      segments.map((s) => /* @__PURE__ */ jsx(
        "circle",
        {
          cx,
          cy,
          r: R,
          fill: "none",
          stroke: s.color,
          strokeWidth: stroke,
          ...arc(s.from, s.pct),
          style: { transition: "stroke-dasharray 0.4s, stroke-dashoffset 0.4s" },
          transform: "rotate(-90, 44, 44)"
        },
        s.label
      ))
    ] }),
    /* @__PURE__ */ jsx("div", { className: "space-y-1.5", children: [
      { label: "Finder Bonus", val: finder, color: "bg-amber-400" },
      { label: "Equal Split", val: equal, color: "bg-[#00BFFF]" },
      { label: "Hashrate Share", val: hashrate, color: "bg-purple-400" }
    ].map((s) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-xs", children: [
      /* @__PURE__ */ jsx("span", { className: `w-2 h-2 rounded-full shrink-0 ${s.color}` }),
      /* @__PURE__ */ jsx("span", { className: "text-gray-500 w-24", children: s.label }),
      /* @__PURE__ */ jsxs("span", { className: "text-white font-bold font-mono", children: [
        (s.val * 100).toFixed(0),
        "%"
      ] })
    ] }, s.label)) })
  ] });
}
function Field$2({
  label,
  desc,
  value,
  defaultVal,
  min,
  max,
  step,
  unit,
  pct,
  ms,
  onChange,
  onReset
}) {
  const isOverridden = value !== defaultVal;
  const display = pct ? `${(value * 100).toFixed(1)}%` : ms ? fmtMs(value) : `${fmt(value, step < 1 ? 3 : 0)} ${unit}`;
  return /* @__PURE__ */ jsxs("div", { className: `p-5 rounded-xl border transition-all ${isOverridden ? "bg-orange-500/5 border-orange-500/20" : "bg-white/3 border-white/6"}`, children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-3 mb-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
          /* @__PURE__ */ jsx("span", { className: "text-white text-sm font-semibold", children: label }),
          isOverridden && /* @__PURE__ */ jsx("span", { className: "text-[9px] font-bold bg-orange-500/15 text-orange-400 border border-orange-500/25 px-1.5 py-0.5 rounded-full", children: "OVERRIDE" })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-xs mt-0.5", children: desc })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 shrink-0", children: [
        /* @__PURE__ */ jsx("span", { className: `font-['Space_Grotesk'] font-black text-lg ${isOverridden ? "text-orange-300" : "text-white"}`, children: display }),
        isOverridden && /* @__PURE__ */ jsx(
          "button",
          {
            onClick: onReset,
            title: "Reset to default",
            className: "text-gray-700 hover:text-gray-300 transition-colors text-sm",
            children: "✕"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsx(
      "input",
      {
        type: "range",
        min,
        max,
        step,
        value,
        onChange: (e) => onChange(parseFloat(e.target.value)),
        className: "w-full accent-[#00BFFF] cursor-pointer"
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mt-2 gap-2", children: [
      /* @__PURE__ */ jsxs("span", { className: "text-[10px] text-gray-700", children: [
        "Default: ",
        pct ? `${(defaultVal * 100).toFixed(0)}%` : ms ? fmtMs(defaultVal) : `${defaultVal} ${unit}`
      ] }),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "number",
          min,
          max,
          step,
          value,
          onChange: (e) => {
            const n = parseFloat(e.target.value);
            if (!isNaN(n)) onChange(n);
          },
          className: `w-24 text-right text-xs bg-white/5 border rounded-lg px-2 py-1 outline-none font-mono transition-colors ${isOverridden ? "border-orange-500/30 text-orange-300 focus:border-orange-500/60" : "border-white/10 text-white focus:border-[#00BFFF]/40"}`
        }
      )
    ] })
  ] });
}
function EconomyManager({ admin }) {
  const [tab, setTab] = useState("overview");
  const [overrides, setOverrides] = useState(getEconomyOverrides);
  const [toast, setToast] = useState(null);
  const [showReset, setShowReset] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [users, setUsers] = useState({});
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [history, setHistory] = useState([]);
  const [simRigTier, setSimRigTier] = useState("pro");
  const [simRigCount, setSimRigCount] = useState(3);
  const [simBlocks, setSimBlocks] = useState(24);
  const [simBcInput, setSimBcInput] = useState(100);
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1e3);
    return () => clearInterval(id);
  }, []);
  useEffect(() => {
    getDashboardStats().then((s) => {
      setUsers(s.users ?? {});
      setLoadingUsers(false);
    }).catch(() => setLoadingUsers(false));
  }, []);
  useEffect(() => {
    setHistory(safeGet(HISTORY_KEY) ?? []);
  }, []);
  function get(key, def) {
    const v = overrides[key];
    return v !== void 0 ? v : def;
  }
  const currentRate = computeRate(now, overrides);
  const rateHistory = computeRateHistory(overrides, 96);
  const minRate = get("MIN_RATE", EXCHANGE_CONSTANTS.MIN_RATE);
  const maxRate = get("MAX_RATE", EXCHANGE_CONSTANTS.MAX_RATE);
  const baseRate = get("BASE_RATE", EXCHANGE_CONSTANTS.BASE_RATE);
  const feePct = get("FEE_PCT", EXCHANGE_CONSTANTS.FEE_PCT);
  const dailyTxLimit = get("DAILY_TX_LIMIT", EXCHANGE_CONSTANTS.DAILY_TX_LIMIT);
  const blockReward = get("BLOCK_REWARD", MINING_CONSTANTS.BLOCK_REWARD);
  const blockIntervalMs = get("BLOCK_INTERVAL_MS", MINING_CONSTANTS.BLOCK_INTERVAL_MS);
  const finderPct = get("FINDER_BONUS_PCT", MINING_CONSTANTS.FINDER_BONUS_PCT);
  const equalPct = get("EQUAL_SPLIT_PCT", MINING_CONSTANTS.EQUAL_SPLIT_PCT);
  const hashratePct = get("HASHRATE_SHARE_PCT", MINING_CONSTANTS.HASHRATE_SHARE_PCT);
  const startingBal = get("STARTING_BALANCE", MINING_CONSTANTS.STARTING_BALANCE);
  const splitSum = finderPct + equalPct + hashratePct;
  const splitOk = Math.abs(splitSum - 1) < 0.011;
  const userList = Object.values(users);
  const totalBC = userList.reduce((s, u) => s + (u.balance ?? 0), 0);
  const totalGems = userList.reduce((s, u) => s + (u.gems ?? 0), 0);
  const activeRigs = userList.reduce((s, u) => s + u.rigs.filter((r) => r.status === "mining").length, 0);
  const overrideCount = Object.values(overrides).filter((v) => v !== void 0).length;
  const simTier = RIG_TIERS.find((t) => t.id === simRigTier) ?? RIG_TIERS[2];
  const userHashrate = simTier.hashrate * simRigCount;
  const blocksPerDay = 24 * 60 * 60 * 1e3 / blockIntervalMs;
  const refPoolHashrate = RIG_TIERS.reduce((s, t) => s + t.hashrate, 0);
  const refMinerCount = RIG_TIERS.length;
  const totalHashrate = userHashrate + refPoolHashrate;
  const userShare = userHashrate / totalHashrate;
  const avgPerBlock = blockReward * finderPct * userShare + blockReward * equalPct / (refMinerCount + 1) + blockReward * hashratePct * userShare;
  const simEarnings = avgPerBlock * simBlocks;
  const simDays = simBlocks / blocksPerDay;
  const rigCost = simTier.cost * simRigCount;
  const blocksToROI = rigCost / (avgPerBlock || 1);
  const calcFee = simBcInput * currentRate * feePct;
  const calcGems = simBcInput * currentRate - calcFee;
  function showMsg(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }
  function handleSave() {
    if (!splitOk) {
      showMsg(`Reward splits must sum to 1.00 (currently ${splitSum.toFixed(3)})`, "error");
      return;
    }
    saveEconomyOverrides(overrides);
    addLog(admin, "economy:save", `Saved ${overrideCount} override${overrideCount !== 1 ? "s" : ""}`);
    const entry = { ts: Date.now(), overrides: { ...overrides }, overrideCount, admin };
    const newHistory = [entry, ...history].slice(0, 15);
    setHistory(newHistory);
    safeSet(HISTORY_KEY, newHistory);
    showMsg(`Economy saved — ${overrideCount} override${overrideCount !== 1 ? "s" : ""} active.`);
  }
  function handleReset() {
    saveEconomyOverrides({});
    setOverrides({});
    setShowReset(false);
    addLog(admin, "economy:reset", "Reset all economy overrides to defaults");
    showMsg("Economy reset to coded defaults.");
  }
  function restoreHistory(entry) {
    setOverrides(entry.overrides);
    showMsg("Snapshot restored — click Save to apply.");
  }
  function setField(key, val) {
    setOverrides((prev) => ({ ...prev, [key]: val }));
  }
  function resetField(key) {
    setOverrides((prev) => {
      const n = { ...prev };
      delete n[key];
      return n;
    });
  }
  return /* @__PURE__ */ jsxs("div", { className: "space-y-0", children: [
    toast && /* @__PURE__ */ jsx(Toast$4, { msg: toast.msg, type: toast.type }),
    /* @__PURE__ */ jsxs("div", { className: "glass rounded-2xl border border-white/8 p-6 mb-6 bg-gradient-to-r from-amber-500/5 via-transparent to-transparent", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center justify-between gap-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h2", { className: "font-['Space_Grotesk'] font-black text-white text-xl flex items-center gap-2", children: "⚙️ Economy Control Panel" }),
          /* @__PURE__ */ jsx("p", { className: "text-gray-500 text-sm mt-0.5", children: "Configure exchange rates, mining rewards, and platform constants" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 flex-wrap", children: [
          overrideCount > 0 && /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-orange-500/10 border border-orange-500/25 text-orange-400", children: [
            /* @__PURE__ */ jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" }),
            overrideCount,
            " override",
            overrideCount !== 1 ? "s" : "",
            " active"
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setShowReset(true),
              className: "px-4 py-2 rounded-xl text-xs text-gray-400 border border-white/10 hover:border-white/20 hover:text-white transition-all",
              children: "↺ Reset All"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: handleSave,
              className: `px-5 py-2 rounded-xl text-sm font-bold border transition-all ${!splitOk ? "bg-red-500/10 border-red-500/30 text-red-400 cursor-not-allowed" : "btn-primary text-white"}`,
              children: "💾 Save Economy"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "mt-4 flex flex-wrap gap-2", children: [
        { label: "Current Rate", value: `${currentRate} Gems/BC`, color: "text-[#00BFFF]" },
        { label: "Block Reward", value: `${blockReward} BC`, color: "text-amber-400" },
        { label: "Block Interval", value: fmtMs(blockIntervalMs), color: "text-purple-400" },
        { label: "Daily TX Limit", value: `${dailyTxLimit}/day`, color: "text-green-400" },
        { label: "Exchange Fee", value: `${(feePct * 100).toFixed(1)}%`, color: "text-pink-400" },
        { label: "Starting BC", value: `${startingBal} BC`, color: "text-cyan-400" }
      ].map((p) => /* @__PURE__ */ jsxs("div", { className: "px-3 py-1.5 rounded-lg bg-white/3 border border-white/6 flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsx("span", { className: `font-['Space_Grotesk'] font-black text-sm ${p.color}`, children: p.value }),
        /* @__PURE__ */ jsx("span", { className: "text-gray-600 text-[10px]", children: p.label })
      ] }, p.label)) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex gap-1 mb-5 overflow-x-auto pb-1", children: TABS.map((t) => /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: () => setTab(t.id),
        className: `flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all ${tab === t.id ? "bg-[#00BFFF]/12 border-[#00BFFF]/30 text-[#00BFFF]" : "border-white/8 text-gray-500 hover:text-gray-300 hover:border-white/15"}`,
        children: [
          /* @__PURE__ */ jsx("span", { children: t.icon }),
          t.label
        ]
      },
      t.id
    )) }),
    tab === "overview" && /* @__PURE__ */ jsxs("div", { className: "space-y-5", children: [
      /* @__PURE__ */ jsxs("div", { className: "glass rounded-2xl border border-[#00BFFF]/15 p-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-start justify-between gap-4 mb-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-gray-500 text-xs uppercase tracking-widest mb-1", children: "Live Exchange Rate" }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-end gap-3", children: [
              /* @__PURE__ */ jsx("span", { className: "font-['Space_Grotesk'] font-black text-5xl text-[#00BFFF]", children: currentRate }),
              /* @__PURE__ */ jsx("span", { className: "text-gray-400 text-lg mb-1", children: "Gems / BC" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 mt-2 text-xs text-gray-600", children: [
              /* @__PURE__ */ jsxs("span", { children: [
                "↓ Min ",
                /* @__PURE__ */ jsx("strong", { className: "text-red-400", children: minRate })
              ] }),
              /* @__PURE__ */ jsxs("span", { children: [
                "◆ Base ",
                /* @__PURE__ */ jsx("strong", { className: "text-white", children: baseRate })
              ] }),
              /* @__PURE__ */ jsxs("span", { children: [
                "↑ Max ",
                /* @__PURE__ */ jsx("strong", { className: "text-green-400", children: maxRate })
              ] }),
              /* @__PURE__ */ jsxs("span", { children: [
                "📈 Amplitude ",
                /* @__PURE__ */ jsxs("strong", { className: "text-purple-400", children: [
                  "±",
                  Math.round((maxRate - minRate) / 2)
                ] })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
            /* @__PURE__ */ jsx("p", { className: "text-gray-500 text-xs mb-1", children: "4-hour wave cycle" }),
            /* @__PURE__ */ jsxs("div", { className: `px-3 py-1.5 rounded-lg text-xs font-bold border ${currentRate > baseRate ? "bg-green-500/10 border-green-500/20 text-green-400" : currentRate < baseRate ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-white/5 border-white/10 text-gray-400"}`, children: [
              currentRate > baseRate ? "▲ Above base" : currentRate < baseRate ? "▼ Below base" : "◆ At base",
              " ",
              "(",
              currentRate > baseRate ? "+" : "",
              currentRate - baseRate,
              ")"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx(RateChart, { points: rateHistory, min: minRate, max: maxRate, base: baseRate, current: currentRate }),
        /* @__PURE__ */ jsx("p", { className: "text-gray-700 text-[10px] mt-1 text-center", children: "Full 4-hour wave cycle — current position at right" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [
        { icon: "₿", label: "BC Circulating", value: fmtShort(totalBC), sub: `${fmt(totalBC)} BlueCoin`, color: "text-amber-400" },
        { icon: "💎", label: "Gems Circulating", value: fmtShort(totalGems), sub: `${fmt(totalGems)} Gems`, color: "text-purple-400" },
        { icon: "⛏️", label: "Active Rigs", value: String(activeRigs), sub: `across ${userList.length} accounts`, color: "text-cyan-400" },
        { icon: "⚙️", label: "Overrides Active", value: String(overrideCount), sub: overrideCount ? "Custom values in effect" : "All at defaults", color: overrideCount ? "text-orange-400" : "text-gray-500" }
      ].map((c) => /* @__PURE__ */ jsxs("div", { className: "glass rounded-xl border border-white/8 p-5", children: [
        /* @__PURE__ */ jsx("span", { className: "text-lg", children: c.icon }),
        /* @__PURE__ */ jsx("p", { className: `font-['Space_Grotesk'] font-black text-2xl mt-2 ${c.color}`, children: loadingUsers ? "—" : c.value }),
        /* @__PURE__ */ jsx("p", { className: "text-white text-xs font-semibold mt-1", children: c.label }),
        /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-[10px] mt-0.5", children: c.sub })
      ] }, c.label)) }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-5", children: [
        /* @__PURE__ */ jsxs("div", { className: "glass rounded-2xl border border-white/8 p-6", children: [
          /* @__PURE__ */ jsx(SectionHeader, { icon: "🎁", title: "Block Reward Distribution", sub: "How each block's BC is split among miners" }),
          /* @__PURE__ */ jsx(SplitDonut, { finder: finderPct, equal: equalPct, hashrate: hashratePct }),
          /* @__PURE__ */ jsxs("div", { className: "mt-4 p-3 rounded-xl bg-white/3 border border-white/5", children: [
            /* @__PURE__ */ jsxs("p", { className: "text-gray-500 text-xs mb-2", children: [
              "At ",
              blockReward,
              " BC per block:"
            ] }),
            /* @__PURE__ */ jsx("div", { className: "grid grid-cols-3 gap-2 text-center", children: [
              { label: "Finder Bonus", val: Math.round(blockReward * finderPct), color: "text-amber-400" },
              { label: "Equal Pool", val: Math.round(blockReward * equalPct), color: "text-[#00BFFF]" },
              { label: "Hashrate Pool", val: Math.round(blockReward * hashratePct), color: "text-purple-400" }
            ].map((s) => /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: `font-['Space_Grotesk'] font-black text-xl ${s.color}`, children: s.val }),
              /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-[9px]", children: s.label })
            ] }, s.label)) })
          ] }),
          !splitOk && /* @__PURE__ */ jsxs("p", { className: "mt-3 text-red-400 text-xs flex items-center gap-1", children: [
            /* @__PURE__ */ jsx("span", { children: "⚠" }),
            " Splits sum to ",
            splitSum.toFixed(3),
            " — must equal 1.000"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "glass rounded-2xl border border-white/8 p-6", children: [
          /* @__PURE__ */ jsx(SectionHeader, { icon: "🧱", title: "Block Economics", sub: "Mining cadence and earning potential" }),
          /* @__PURE__ */ jsx("div", { className: "space-y-3", children: [
            { label: "Block Interval", value: fmtMs(blockIntervalMs), sub: `${(blockIntervalMs / 6e4).toFixed(0)} minutes`, color: "text-purple-400" },
            { label: "Blocks per Day", value: fmt(blocksPerDay, 1), sub: "theoretical maximum", color: "text-[#00BFFF]" },
            { label: "Daily Max Payout", value: `${fmt(blockReward * blocksPerDay)} BC`, sub: "total BC distributed/day", color: "text-amber-400" },
            { label: "Session Duration", value: fmtMs(MINING_CONSTANTS.RENEWAL_DURATION_MS), sub: "per renewal", color: "text-green-400" },
            { label: "Starting Balance", value: `${startingBal} BC`, sub: "new account bonus", color: "text-cyan-400" }
          ].map((r) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between py-2 border-b border-white/5 last:border-0", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-white text-xs font-semibold", children: r.label }),
              /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-[10px]", children: r.sub })
            ] }),
            /* @__PURE__ */ jsx("span", { className: `font-['Space_Grotesk'] font-black text-base ${r.color}`, children: r.value })
          ] }, r.label)) })
        ] })
      ] })
    ] }),
    tab === "exchange" && /* @__PURE__ */ jsx("div", { className: "space-y-5", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-5", children: [
      /* @__PURE__ */ jsxs("div", { className: "lg:col-span-2 space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "glass rounded-2xl border border-white/8 p-6", children: [
          /* @__PURE__ */ jsx(SectionHeader, { icon: "📈", title: "Rate Bounds", sub: "Define the min, base, and max of the exchange rate wave" }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsx(
              Field$2,
              {
                label: "Base Rate",
                desc: "Centre of the sine wave — the long-run equilibrium",
                value: baseRate,
                defaultVal: EXCHANGE_CONSTANTS.BASE_RATE,
                min: 1,
                max: 500,
                step: 1,
                unit: "Gems/BC",
                onChange: (v) => setField("BASE_RATE", v),
                onReset: () => resetField("BASE_RATE")
              }
            ),
            /* @__PURE__ */ jsx(
              Field$2,
              {
                label: "Minimum Rate",
                desc: "Floor — rate can never fall below this value",
                value: minRate,
                defaultVal: EXCHANGE_CONSTANTS.MIN_RATE,
                min: 1,
                max: baseRate - 1,
                step: 1,
                unit: "Gems/BC",
                onChange: (v) => setField("MIN_RATE", v),
                onReset: () => resetField("MIN_RATE")
              }
            ),
            /* @__PURE__ */ jsx(
              Field$2,
              {
                label: "Maximum Rate",
                desc: "Ceiling — rate can never exceed this value",
                value: maxRate,
                defaultVal: EXCHANGE_CONSTANTS.MAX_RATE,
                min: baseRate + 1,
                max: 1e4,
                step: 1,
                unit: "Gems/BC",
                onChange: (v) => setField("MAX_RATE", v),
                onReset: () => resetField("MAX_RATE")
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "glass rounded-2xl border border-white/8 p-6", children: [
          /* @__PURE__ */ jsx(SectionHeader, { icon: "🔒", title: "Rate Chart Preview", sub: "Live wave with current settings applied" }),
          /* @__PURE__ */ jsx(RateChart, { points: computeRateHistory(overrides, 96), min: minRate, max: maxRate, base: baseRate, current: currentRate }),
          /* @__PURE__ */ jsxs("div", { className: "mt-2 flex justify-between text-[10px] text-gray-700", children: [
            /* @__PURE__ */ jsx("span", { children: "Now" }),
            /* @__PURE__ */ jsx("span", { children: "+1h" }),
            /* @__PURE__ */ jsx("span", { children: "+2h" }),
            /* @__PURE__ */ jsx("span", { children: "+3h" }),
            /* @__PURE__ */ jsx("span", { children: "+4h (full cycle)" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "glass rounded-2xl border border-white/8 p-6", children: [
          /* @__PURE__ */ jsx(SectionHeader, { icon: "⏱️", title: "Transaction Controls", sub: "Manage exchange throughput and costs" }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsx(
              Field$2,
              {
                label: "Daily Transaction Limit",
                desc: "Max exchange transactions per player per 24-hour window",
                value: dailyTxLimit,
                defaultVal: EXCHANGE_CONSTANTS.DAILY_TX_LIMIT,
                min: 1,
                max: 100,
                step: 1,
                unit: "trades/day",
                onChange: (v) => setField("DAILY_TX_LIMIT", v),
                onReset: () => resetField("DAILY_TX_LIMIT")
              }
            ),
            /* @__PURE__ */ jsx(
              Field$2,
              {
                label: "Exchange Fee",
                desc: "Percentage taken from each exchange output (0 = free)",
                value: feePct,
                defaultVal: EXCHANGE_CONSTANTS.FEE_PCT,
                min: 0,
                max: 0.5,
                step: 1e-3,
                unit: "fraction",
                pct: true,
                onChange: (v) => setField("FEE_PCT", v),
                onReset: () => resetField("FEE_PCT")
              }
            )
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "space-y-4", children: /* @__PURE__ */ jsxs("div", { className: "glass rounded-2xl border border-[#00BFFF]/15 p-6 sticky top-4", children: [
        /* @__PURE__ */ jsx(SectionHeader, { icon: "🧮", title: "Exchange Calculator", sub: "Live preview at current rate" }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "text-gray-500 text-xs mb-1.5 block", children: "BC to exchange" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "number",
                value: simBcInput,
                min: 1,
                onChange: (e) => setSimBcInput(Number(e.target.value)),
                className: "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-lg outline-none focus:border-[#00BFFF]/40"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "p-4 rounded-xl bg-[#00BFFF]/5 border border-[#00BFFF]/15 space-y-3", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs", children: [
              /* @__PURE__ */ jsx("span", { className: "text-gray-500", children: "Rate" }),
              /* @__PURE__ */ jsxs("span", { className: "text-[#00BFFF] font-bold", children: [
                currentRate,
                " Gems/BC"
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs", children: [
              /* @__PURE__ */ jsx("span", { className: "text-gray-500", children: "Gross output" }),
              /* @__PURE__ */ jsxs("span", { className: "text-white font-mono", children: [
                fmt(simBcInput * currentRate),
                " Gems"
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs", children: [
              /* @__PURE__ */ jsxs("span", { className: "text-gray-500", children: [
                "Fee (",
                (feePct * 100).toFixed(1),
                "%)"
              ] }),
              /* @__PURE__ */ jsxs("span", { className: "text-red-400 font-mono", children: [
                "−",
                fmt(calcFee, 1),
                " Gems"
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "border-t border-white/8 pt-2 flex justify-between", children: [
              /* @__PURE__ */ jsx("span", { className: "text-white text-sm font-bold", children: "Net received" }),
              /* @__PURE__ */ jsxs("span", { className: "text-purple-400 font-['Space_Grotesk'] font-black text-lg", children: [
                fmt(calcGems, 1),
                " ✦"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "p-3 rounded-xl bg-white/3 border border-white/5 text-xs space-y-1.5 text-gray-500", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsx("span", { children: "Min rate scenario" }),
              /* @__PURE__ */ jsxs("span", { className: "text-red-400", children: [
                fmt(simBcInput * minRate * (1 - feePct), 1),
                " Gems"
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsx("span", { children: "Max rate scenario" }),
              /* @__PURE__ */ jsxs("span", { className: "text-green-400", children: [
                fmt(simBcInput * maxRate * (1 - feePct), 1),
                " Gems"
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsx("span", { children: "Daily limit" }),
              /* @__PURE__ */ jsxs("span", { className: "text-white", children: [
                dailyTxLimit,
                " trades"
              ] })
            ] })
          ] })
        ] })
      ] }) })
    ] }) }),
    tab === "mining" && /* @__PURE__ */ jsx("div", { className: "space-y-5", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-5", children: [
      /* @__PURE__ */ jsxs("div", { className: "lg:col-span-2 space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "glass rounded-2xl border border-white/8 p-6", children: [
          /* @__PURE__ */ jsx(SectionHeader, { icon: "🧱", title: "Block Settings", sub: "Control block cadence and total reward per block" }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsx(
              Field$2,
              {
                label: "Block Reward",
                desc: "Total BC distributed to all active miners when a block is solved",
                value: blockReward,
                defaultVal: MINING_CONSTANTS.BLOCK_REWARD,
                min: 1,
                max: 1e5,
                step: 1,
                unit: "BC",
                onChange: (v) => setField("BLOCK_REWARD", v),
                onReset: () => resetField("BLOCK_REWARD")
              }
            ),
            /* @__PURE__ */ jsx(
              Field$2,
              {
                label: "Block Interval",
                desc: "Time between consecutive block solutions (determines earning speed)",
                value: blockIntervalMs,
                defaultVal: MINING_CONSTANTS.BLOCK_INTERVAL_MS,
                min: 6e4,
                max: 864e5,
                step: 6e4,
                unit: "ms",
                ms: true,
                onChange: (v) => setField("BLOCK_INTERVAL_MS", v),
                onReset: () => resetField("BLOCK_INTERVAL_MS")
              }
            ),
            /* @__PURE__ */ jsx(
              Field$2,
              {
                label: "Starting Balance",
                desc: "BC awarded to new mining accounts on registration",
                value: startingBal,
                defaultVal: MINING_CONSTANTS.STARTING_BALANCE,
                min: 0,
                max: 1e5,
                step: 50,
                unit: "BC",
                onChange: (v) => setField("STARTING_BALANCE", v),
                onReset: () => resetField("STARTING_BALANCE")
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "glass rounded-2xl border border-white/8 p-6", children: [
          /* @__PURE__ */ jsx(SectionHeader, { icon: "🎁", title: "Reward Distribution", sub: `Must sum to 1.000 — currently ${splitSum.toFixed(3)}` }),
          /* @__PURE__ */ jsxs("div", { className: `mb-4 flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold border ${splitOk ? "bg-green-500/8 border-green-500/20 text-green-400" : "bg-red-500/8 border-red-500/20 text-red-400"}`, children: [
            /* @__PURE__ */ jsx("span", { children: splitOk ? "✓" : "⚠" }),
            splitOk ? `Splits are valid (sum = ${splitSum.toFixed(3)})` : `Invalid: sum is ${splitSum.toFixed(3)}, needs to be 1.000`
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsx(
              Field$2,
              {
                label: "Finder Bonus",
                desc: "Extra bonus for the miner who wins the block lottery",
                value: finderPct,
                defaultVal: MINING_CONSTANTS.FINDER_BONUS_PCT,
                min: 0,
                max: 1,
                step: 0.01,
                unit: "fraction",
                pct: true,
                onChange: (v) => setField("FINDER_BONUS_PCT", v),
                onReset: () => resetField("FINDER_BONUS_PCT")
              }
            ),
            /* @__PURE__ */ jsx(
              Field$2,
              {
                label: "Equal Split",
                desc: "Fraction split evenly among all active miners regardless of hashrate",
                value: equalPct,
                defaultVal: MINING_CONSTANTS.EQUAL_SPLIT_PCT,
                min: 0,
                max: 1,
                step: 0.01,
                unit: "fraction",
                pct: true,
                onChange: (v) => setField("EQUAL_SPLIT_PCT", v),
                onReset: () => resetField("EQUAL_SPLIT_PCT")
              }
            ),
            /* @__PURE__ */ jsx(
              Field$2,
              {
                label: "Hashrate Share",
                desc: "Fraction distributed proportionally by each miner's hashrate",
                value: hashratePct,
                defaultVal: MINING_CONSTANTS.HASHRATE_SHARE_PCT,
                min: 0,
                max: 1,
                step: 0.01,
                unit: "fraction",
                pct: true,
                onChange: (v) => setField("HASHRATE_SHARE_PCT", v),
                onReset: () => resetField("HASHRATE_SHARE_PCT")
              }
            )
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "glass rounded-2xl border border-white/8 p-6", children: [
          /* @__PURE__ */ jsx(SectionHeader, { icon: "🥧", title: "Split Visualizer" }),
          /* @__PURE__ */ jsx(SplitDonut, { finder: finderPct, equal: equalPct, hashrate: hashratePct }),
          /* @__PURE__ */ jsxs("div", { className: "mt-4 p-3 rounded-xl bg-white/3 border border-white/5 text-xs space-y-2 text-gray-500", children: [
            /* @__PURE__ */ jsxs("p", { className: "text-gray-400 font-semibold text-[11px] mb-2", children: [
              "Per block (",
              blockReward,
              " BC total)"
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsx("span", { children: "🏆 Finder gets" }),
              /* @__PURE__ */ jsxs("span", { className: "text-amber-400 font-bold", children: [
                Math.round(blockReward * finderPct),
                " BC"
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsx("span", { children: "👥 Equal pool" }),
              /* @__PURE__ */ jsxs("span", { className: "text-[#00BFFF] font-bold", children: [
                Math.round(blockReward * equalPct),
                " BC"
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsx("span", { children: "⚡ Hashrate pool" }),
              /* @__PURE__ */ jsxs("span", { className: "text-purple-400 font-bold", children: [
                Math.round(blockReward * hashratePct),
                " BC"
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "glass rounded-2xl border border-white/8 p-6", children: [
          /* @__PURE__ */ jsx(SectionHeader, { icon: "🔒", title: "Fixed Constants", sub: "Hardcoded — not overrideable" }),
          /* @__PURE__ */ jsx("div", { className: "space-y-2 text-xs", children: [
            { label: "Repair Cost", value: `${(MINING_CONSTANTS.REPAIR_COST_PCT * 100).toFixed(0)}% of rig cost` },
            { label: "Max Sell-Back", value: `${(MINING_CONSTANTS.SELL_MAX_PCT * 100).toFixed(0)}% at 100% dur.` },
            { label: "UI Tick", value: fmtMs(MINING_CONSTANTS.TICK_INTERVAL_MS) },
            { label: "Session Length", value: fmtMs(MINING_CONSTANTS.RENEWAL_DURATION_MS) },
            { label: "Price Cycle", value: fmtMs(EXCHANGE_CONSTANTS.FLUCTUATION_PERIOD_MS) },
            { label: "Max Rigs/User", value: "10 rigs" }
          ].map((r) => /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-1.5 border-b border-white/5 last:border-0", children: [
            /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: r.label }),
            /* @__PURE__ */ jsx("span", { className: "text-gray-400 font-mono", children: r.value })
          ] }, r.label)) })
        ] })
      ] })
    ] }) }),
    tab === "hardware" && /* @__PURE__ */ jsxs("div", { className: "space-y-5", children: [
      /* @__PURE__ */ jsxs("div", { className: "glass rounded-2xl border border-white/8 p-6", children: [
        /* @__PURE__ */ jsx(SectionHeader, { icon: "🖥️", title: "Rig Tier Catalogue", sub: "All hardware tiers and their specifications (read-only)" }),
        /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-xs", children: [
          /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsx("tr", { className: "border-b border-white/8", children: ["Rig", "Hashrate", "Cost", "Lifespan", "Repair (full)", "Max Sell", "Blocks to ROI", "BC/day (pool est.)"].map((h) => /* @__PURE__ */ jsx("th", { className: "text-left py-3 pr-4 text-gray-500 font-semibold", children: h }, h)) }) }),
          /* @__PURE__ */ jsx("tbody", { children: RIG_TIERS.map((rig) => {
            const lifedays = rig.maxDurability / (rig.lossPerSecond * 86400);
            const repairCost = Math.ceil(rig.cost * MINING_CONSTANTS.REPAIR_COST_PCT);
            const maxSell = Math.floor(rig.cost * MINING_CONSTANTS.SELL_MAX_PCT);
            const refPoolHR = RIG_TIERS.reduce((s, t) => s + t.hashrate, 0);
            const refN = RIG_TIERS.length;
            const rigShare = rig.hashrate / refPoolHR;
            const avgBlockEarn = blockReward * finderPct * rigShare + blockReward * equalPct / refN + blockReward * hashratePct * rigShare;
            const dailyEarn = avgBlockEarn * blocksPerDay;
            const blocksROI = Math.ceil(rig.cost / (avgBlockEarn || 1));
            return /* @__PURE__ */ jsxs("tr", { className: "border-b border-white/5 hover:bg-white/2 transition-colors", children: [
              /* @__PURE__ */ jsx("td", { className: "py-3 pr-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx("span", { className: "text-base", children: rig.emoji }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("p", { className: `font-semibold ${rig.color}`, children: rig.name }),
                  /* @__PURE__ */ jsx("p", { className: "text-gray-700 text-[9px]", children: rig.id })
                ] })
              ] }) }),
              /* @__PURE__ */ jsxs("td", { className: "py-3 pr-4", children: [
                /* @__PURE__ */ jsx("span", { className: "font-['Space_Grotesk'] font-black text-[#00BFFF]", children: rig.hashrate }),
                /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: " GH/s" })
              ] }),
              /* @__PURE__ */ jsxs("td", { className: "py-3 pr-4", children: [
                /* @__PURE__ */ jsx("span", { className: "font-bold text-amber-400", children: rig.cost.toLocaleString() }),
                /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: " BC" })
              ] }),
              /* @__PURE__ */ jsx("td", { className: "py-3 pr-4", children: /* @__PURE__ */ jsxs("span", { className: "text-white", children: [
                lifedays.toFixed(1),
                "d"
              ] }) }),
              /* @__PURE__ */ jsx("td", { className: "py-3 pr-4", children: /* @__PURE__ */ jsxs("span", { className: "text-orange-400", children: [
                repairCost.toLocaleString(),
                " BC"
              ] }) }),
              /* @__PURE__ */ jsx("td", { className: "py-3 pr-4", children: /* @__PURE__ */ jsxs("span", { className: "text-green-400", children: [
                maxSell.toLocaleString(),
                " BC"
              ] }) }),
              /* @__PURE__ */ jsxs("td", { className: "py-3 pr-4", children: [
                /* @__PURE__ */ jsx("span", { className: "text-purple-400 font-bold", children: blocksROI.toLocaleString() }),
                /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: " blocks" })
              ] }),
              /* @__PURE__ */ jsxs("td", { className: "py-3", children: [
                /* @__PURE__ */ jsx("span", { className: "text-cyan-400 font-bold", children: fmt(dailyEarn, 0) }),
                /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: " BC" })
              ] })
            ] }, rig.id);
          }) })
        ] }) })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 md:grid-cols-5 gap-3", children: RIG_TIERS.map((rig) => {
        const lifedays = rig.maxDurability / (rig.lossPerSecond * 86400);
        const refPoolHR2 = RIG_TIERS.reduce((s, t) => s + t.hashrate, 0);
        const refN2 = RIG_TIERS.length;
        const rigShare2 = rig.hashrate / refPoolHR2;
        const avgBlockEarn2 = blockReward * finderPct * rigShare2 + blockReward * equalPct / refN2 + blockReward * hashratePct * rigShare2;
        const daysROI = rig.cost / (avgBlockEarn2 * blocksPerDay) || 0;
        return /* @__PURE__ */ jsxs(
          "div",
          {
            className: `glass rounded-xl p-4 border ${rig.borderColor} text-center`,
            style: { boxShadow: `0 0 20px ${rig.glowColor}20` },
            children: [
              /* @__PURE__ */ jsx("span", { className: "text-2xl", children: rig.emoji }),
              /* @__PURE__ */ jsx("p", { className: `font-semibold text-xs mt-1 ${rig.color}`, children: rig.name }),
              /* @__PURE__ */ jsxs("p", { className: "font-['Space_Grotesk'] font-black text-xl text-white mt-2", children: [
                rig.hashrate,
                " ",
                /* @__PURE__ */ jsx("span", { className: "text-gray-600 text-[10px] font-normal", children: "GH/s" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "mt-3 space-y-1 text-[10px]", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Cost" }),
                  /* @__PURE__ */ jsxs("span", { className: "text-amber-400 font-bold", children: [
                    rig.cost.toLocaleString(),
                    " BC"
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Lifespan" }),
                  /* @__PURE__ */ jsxs("span", { className: "text-white", children: [
                    lifedays.toFixed(1),
                    "d"
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "ROI" }),
                  /* @__PURE__ */ jsxs("span", { className: "text-purple-400 font-bold", children: [
                    daysROI.toFixed(1),
                    "d"
                  ] })
                ] })
              ] })
            ]
          },
          rig.id
        );
      }) })
    ] }),
    tab === "simulator" && /* @__PURE__ */ jsx("div", { className: "space-y-5", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-5 gap-5", children: [
      /* @__PURE__ */ jsx("div", { className: "lg:col-span-2 space-y-4", children: /* @__PURE__ */ jsxs("div", { className: "glass rounded-2xl border border-white/8 p-6", children: [
        /* @__PURE__ */ jsx(SectionHeader, { icon: "🧪", title: "Mining Simulator", sub: "Projected earnings with current economy settings" }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-5", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "text-gray-400 text-xs font-semibold block mb-2", children: "Rig Tier" }),
            /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-2", children: RIG_TIERS.map((t) => /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: () => setSimRigTier(t.id),
                className: `flex items-center gap-3 px-4 py-2.5 rounded-xl border text-left transition-all ${simRigTier === t.id ? `${t.borderColor} bg-white/5` : "border-white/8 hover:border-white/15"}`,
                children: [
                  /* @__PURE__ */ jsx("span", { className: "text-base", children: t.emoji }),
                  /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
                    /* @__PURE__ */ jsx("p", { className: `text-xs font-semibold ${simRigTier === t.id ? t.color : "text-gray-400"}`, children: t.name }),
                    /* @__PURE__ */ jsxs("p", { className: "text-gray-700 text-[10px]", children: [
                      t.hashrate,
                      " GH/s · ",
                      t.cost.toLocaleString(),
                      " BC"
                    ] })
                  ] }),
                  simRigTier === t.id && /* @__PURE__ */ jsx("span", { className: `text-[10px] font-bold ${t.color}`, children: "✓" })
                ]
              },
              t.id
            )) })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("label", { className: "text-gray-400 text-xs font-semibold block mb-2", children: [
              "Number of Rigs: ",
              /* @__PURE__ */ jsx("span", { className: "text-white", children: simRigCount })
            ] }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "range",
                min: 1,
                max: 10,
                step: 1,
                value: simRigCount,
                onChange: (e) => setSimRigCount(Number(e.target.value)),
                className: "w-full accent-[#00BFFF]"
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-[10px] text-gray-700 mt-1", children: [
              /* @__PURE__ */ jsx("span", { children: "1" }),
              /* @__PURE__ */ jsx("span", { children: "5" }),
              /* @__PURE__ */ jsx("span", { children: "10" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("label", { className: "text-gray-400 text-xs font-semibold block mb-2", children: [
              "Blocks to Simulate: ",
              /* @__PURE__ */ jsx("span", { className: "text-white", children: simBlocks })
            ] }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "range",
                min: 1,
                max: 500,
                step: 1,
                value: simBlocks,
                onChange: (e) => setSimBlocks(Number(e.target.value)),
                className: "w-full accent-[#00BFFF]"
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-[10px] text-gray-700 mt-1", children: [
              /* @__PURE__ */ jsx("span", { children: "1" }),
              /* @__PURE__ */ jsxs("span", { children: [
                "≈",
                fmt(blocksPerDay, 0),
                "/day"
              ] }),
              /* @__PURE__ */ jsx("span", { children: "500" })
            ] })
          ] })
        ] })
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "lg:col-span-3 space-y-4", children: /* @__PURE__ */ jsxs("div", { className: "glass rounded-2xl border border-[#00BFFF]/15 p-6", children: [
        /* @__PURE__ */ jsx(SectionHeader, { icon: "📈", title: "Projected Earnings", sub: `${simRigCount}× ${simTier.name} over ${simBlocks} blocks` }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-4 mb-5", children: [
          { label: "Total Hashrate", value: `${userHashrate} GH/s`, color: "text-[#00BFFF]", sub: `${simRigCount} × ${simTier.hashrate} GH/s` },
          { label: "Avg Per Block", value: `${fmt(avgPerBlock, 1)} BC`, color: "text-purple-400", sub: "expected per block" },
          { label: "Total Earnings", value: `${fmt(simEarnings, 0)} BC`, color: "text-amber-400", sub: `over ${simBlocks} blocks` },
          { label: "Time Elapsed", value: fmtMs(simBlocks * blockIntervalMs), color: "text-green-400", sub: `${simDays.toFixed(1)} days` }
        ].map((s) => /* @__PURE__ */ jsxs("div", { className: "p-4 rounded-xl bg-white/3 border border-white/5", children: [
          /* @__PURE__ */ jsx("p", { className: `font-['Space_Grotesk'] font-black text-2xl ${s.color}`, children: s.value }),
          /* @__PURE__ */ jsx("p", { className: "text-white text-xs font-semibold mt-1", children: s.label }),
          /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-[10px] mt-0.5", children: s.sub })
        ] }, s.label)) }),
        /* @__PURE__ */ jsxs("div", { className: "p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 text-center", children: [
          /* @__PURE__ */ jsx("p", { className: "text-gray-400 text-xs uppercase tracking-widest mb-2", children: "Projected BC Earned" }),
          /* @__PURE__ */ jsx("p", { className: "font-['Space_Grotesk'] font-black text-5xl text-amber-400", children: fmt(simEarnings) }),
          /* @__PURE__ */ jsxs("p", { className: "text-gray-500 text-sm mt-1", children: [
            "BlueCoin over ",
            simBlocks,
            " block",
            simBlocks !== 1 ? "s" : ""
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-4 grid grid-cols-3 gap-3 text-center", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-amber-300 font-bold text-sm", children: fmt(simEarnings / (simDays || 1)) }),
              /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-[10px]", children: "BC per day" })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-amber-300 font-bold text-sm", children: fmt(simEarnings / (simBlocks || 1), 1) }),
              /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-[10px]", children: "BC per block" })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-amber-300 font-bold text-sm", children: fmt(simEarnings * currentRate * (1 - feePct)) }),
              /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-[10px]", children: "Gems if exchanged" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-4 p-4 rounded-xl bg-white/3 border border-white/5", children: [
          /* @__PURE__ */ jsx("p", { className: "text-gray-400 text-xs font-semibold mb-3", children: "Return on Investment" }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("p", { className: "text-gray-500 text-xs", children: [
                "Rig cost (",
                simRigCount,
                "×)"
              ] }),
              /* @__PURE__ */ jsxs("p", { className: "font-['Space_Grotesk'] font-black text-xl text-white", children: [
                fmt(rigCost),
                " BC"
              ] })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "flex-1 text-center text-gray-700", children: "→" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-gray-500 text-xs", children: "Break-even at" }),
              /* @__PURE__ */ jsxs("p", { className: "font-['Space_Grotesk'] font-black text-xl text-green-400", children: [
                fmt(blocksToROI),
                " blocks"
              ] }),
              /* @__PURE__ */ jsxs("p", { className: "text-gray-600 text-[10px]", children: [
                "≈ ",
                fmtMs(blocksToROI * blockIntervalMs)
              ] })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "flex-1 text-center text-gray-700", children: "→" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("p", { className: "text-gray-500 text-xs", children: [
                "Net after ",
                simBlocks,
                " blocks"
              ] }),
              /* @__PURE__ */ jsxs("p", { className: `font-['Space_Grotesk'] font-black text-xl ${simEarnings - rigCost >= 0 ? "text-green-400" : "text-red-400"}`, children: [
                simEarnings - rigCost >= 0 ? "+" : "",
                fmt(simEarnings - rigCost),
                " BC"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-3", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-[10px] text-gray-600 mb-1", children: [
              /* @__PURE__ */ jsx("span", { children: "0" }),
              /* @__PURE__ */ jsxs("span", { children: [
                "ROI at ",
                fmt(blocksToROI),
                " blocks"
              ] }),
              /* @__PURE__ */ jsxs("span", { children: [
                simBlocks,
                " blocks"
              ] })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "w-full h-2 rounded-full bg-white/5 overflow-hidden", children: /* @__PURE__ */ jsx(
              "div",
              {
                className: `h-2 rounded-full transition-all ${simEarnings >= rigCost ? "bg-gradient-to-r from-green-500/60 to-green-400" : "bg-gradient-to-r from-orange-500/60 to-orange-400"}`,
                style: { width: `${Math.min(100, simBlocks / blocksToROI * 100)}%` }
              }
            ) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-4 p-4 rounded-xl bg-white/3 border border-white/5", children: [
          /* @__PURE__ */ jsx("p", { className: "text-gray-400 text-xs font-semibold mb-3", children: "Block Win Probability (Finder Bonus)" }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxs("div", { className: "relative w-16 h-16 shrink-0", children: [
              /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 56 56", className: "w-full h-full -rotate-90", children: [
                /* @__PURE__ */ jsx("circle", { cx: "28", cy: "28", r: "22", fill: "none", stroke: "rgba(255,255,255,0.05)", strokeWidth: "6" }),
                /* @__PURE__ */ jsx(
                  "circle",
                  {
                    cx: "28",
                    cy: "28",
                    r: "22",
                    fill: "none",
                    stroke: "#f59e0b",
                    strokeWidth: "6",
                    strokeDasharray: `${userShare * 2 * Math.PI * 22} ${2 * Math.PI * 22}`,
                    strokeLinecap: "round"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("span", { className: "absolute inset-0 flex items-center justify-center text-amber-400 font-['Space_Grotesk'] font-black text-xs", children: [
                (userShare * 100).toFixed(1),
                "%"
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex-1 text-xs text-gray-500 space-y-1", children: [
              /* @__PURE__ */ jsxs("p", { children: [
                "Your share of pool hashrate (",
                userHashrate,
                " GH/s of ",
                fmt(totalHashrate),
                " GH/s)"
              ] }),
              /* @__PURE__ */ jsxs("p", { children: [
                "Expected wins in ",
                simBlocks,
                " blocks: ",
                /* @__PURE__ */ jsx("span", { className: "text-amber-400 font-bold", children: (userShare * simBlocks).toFixed(1) })
              ] }),
              /* @__PURE__ */ jsxs("p", { children: [
                "Finder BC per win: ",
                /* @__PURE__ */ jsxs("span", { className: "text-amber-400 font-bold", children: [
                  Math.round(blockReward * finderPct),
                  " BC"
                ] })
              ] })
            ] })
          ] })
        ] })
      ] }) })
    ] }) }),
    tab === "history" && /* @__PURE__ */ jsx("div", { className: "space-y-4", children: /* @__PURE__ */ jsxs("div", { className: "glass rounded-2xl border border-white/8 p-6", children: [
      /* @__PURE__ */ jsx(SectionHeader, { icon: "📋", title: "Save History", sub: "Last 15 economy snapshots — click Restore to load a previous configuration" }),
      history.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "text-center py-12 text-gray-600", children: [
        /* @__PURE__ */ jsx("div", { className: "text-4xl mb-3 opacity-30", children: "📋" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm", children: "No saves yet. Changes appear here after you click Save Economy." })
      ] }) : /* @__PURE__ */ jsx("div", { className: "space-y-3", children: history.map((entry, i) => {
        const ov = entry.overrides;
        const date = new Date(entry.ts);
        return /* @__PURE__ */ jsxs("div", { className: `p-5 rounded-xl border ${i === 0 ? "bg-[#00BFFF]/4 border-[#00BFFF]/15" : "bg-white/2 border-white/6"} hover:border-white/15 transition-all`, children: [
          /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-start justify-between gap-3", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
                i === 0 && /* @__PURE__ */ jsx("span", { className: "text-[9px] font-bold bg-[#00BFFF]/15 text-[#00BFFF] border border-[#00BFFF]/20 px-1.5 py-0.5 rounded-full", children: "LATEST" }),
                /* @__PURE__ */ jsxs("span", { className: "text-white text-sm font-semibold", children: [
                  date.toLocaleDateString(),
                  " at ",
                  date.toLocaleTimeString()
                ] }),
                /* @__PURE__ */ jsxs("span", { className: "text-gray-600 text-xs", children: [
                  "by ",
                  entry.admin
                ] })
              ] }),
              /* @__PURE__ */ jsx("p", { className: "text-gray-500 text-xs mt-1", children: entry.overrideCount === 0 ? "All defaults (reset)" : `${entry.overrideCount} override${entry.overrideCount !== 1 ? "s" : ""} active` })
            ] }),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => restoreHistory(entry),
                className: "px-3 py-1.5 rounded-lg text-xs font-semibold text-[#00BFFF] border border-[#00BFFF]/25 hover:bg-[#00BFFF]/10 transition-all shrink-0",
                children: "↩ Restore"
              }
            )
          ] }),
          entry.overrideCount > 0 && /* @__PURE__ */ jsx("div", { className: "mt-3 flex flex-wrap gap-1.5", children: Object.entries(ov).map(
            ([key, val]) => val !== void 0 ? /* @__PURE__ */ jsxs("span", { className: "px-2 py-0.5 rounded-md text-[10px] bg-orange-500/10 border border-orange-500/15 text-orange-300 font-mono", children: [
              key,
              "=",
              key.endsWith("PCT") ? `${(val * 100).toFixed(0)}%` : key.endsWith("MS") ? fmtMs(val) : String(val)
            ] }, key) : null
          ) })
        ] }, entry.ts);
      }) })
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "sticky bottom-0 mt-6 pt-4 pb-1", children: /* @__PURE__ */ jsxs(
      "div",
      {
        className: "glass rounded-2xl border border-white/10 px-6 py-4 flex flex-wrap items-center justify-between gap-4",
        style: { backdropFilter: "blur(20px)" },
        children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            overrideCount > 0 ? /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5 text-xs text-orange-400", children: [
              /* @__PURE__ */ jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" }),
              overrideCount,
              " unsaved override",
              overrideCount !== 1 ? "s" : ""
            ] }) : /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-600", children: "All settings at defaults" }),
            !splitOk && /* @__PURE__ */ jsxs("span", { className: "text-xs text-red-400", children: [
              "⚠ Reward splits invalid (sum=",
              splitSum.toFixed(3),
              ")"
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => setShowReset(true),
                className: "px-4 py-2 rounded-xl text-xs text-gray-400 border border-white/10 hover:border-white/20 hover:text-white transition-all",
                children: "↺ Reset All"
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: handleSave,
                disabled: !splitOk,
                className: `px-6 py-2 rounded-xl text-sm font-bold border transition-all ${!splitOk ? "bg-red-500/10 border-red-500/30 text-red-400 cursor-not-allowed opacity-60" : "btn-primary text-white"}`,
                children: "💾 Save Economy"
              }
            )
          ] })
        ]
      }
    ) }),
    showReset && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm", children: /* @__PURE__ */ jsxs("div", { className: "glass rounded-2xl border border-orange-500/20 p-8 max-w-sm w-full text-center", children: [
      /* @__PURE__ */ jsx("div", { className: "text-5xl mb-4", children: "⚠️" }),
      /* @__PURE__ */ jsx("h3", { className: "text-white font-['Space_Grotesk'] font-black text-xl mb-2", children: "Reset Economy?" }),
      /* @__PURE__ */ jsxs("p", { className: "text-gray-500 text-sm mb-6", children: [
        "All ",
        overrideCount,
        " custom override",
        overrideCount !== 1 ? "s" : "",
        " will be cleared and every value will revert to its coded default. This takes effect immediately on save."
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setShowReset(false),
            className: "flex-1 py-3 rounded-xl text-sm text-gray-400 border border-white/10 hover:bg-white/5 transition-all",
            children: "Cancel"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: handleReset,
            className: "flex-1 py-3 rounded-xl text-sm font-bold text-orange-400 border border-orange-500/30 bg-orange-500/10 hover:bg-orange-500/20 transition-all",
            children: "Reset to Defaults"
          }
        )
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
function timeAgo$6(ts) {
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
function Toast$3({ msg, type }) {
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
  const TABS2 = [
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
    /* @__PURE__ */ jsx("div", { className: "flex border-b border-white/5 px-6 gap-1 shrink-0 bg-[#0B0F17]/50", children: TABS2.filter((t) => t.show !== false).map((t) => /* @__PURE__ */ jsxs(
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
          { label: "Last Seen", val: timeAgo$6(user.lastSeen) },
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
              { label: "Last Seen", val: timeAgo$6(user.lastSeen) }
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
    toast && /* @__PURE__ */ jsx(Toast$3, { msg: toast.msg, type: toast.type }),
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
                /* @__PURE__ */ jsx("p", { className: "text-gray-500 text-xs text-right truncate", children: timeAgo$6(u.lastSeen) }),
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
function Toast$2({ msg, type }) {
  const colours = {
    success: "bg-green-500/15 border-green-500/30 text-green-400",
    error: "bg-red-500/15 border-red-500/30 text-red-400",
    info: "bg-[#00BFFF]/10 border-[#00BFFF]/25 text-[#00BFFF]"
  };
  const icons = { success: "✓", error: "⚠", info: "ℹ" };
  return /* @__PURE__ */ jsxs("div", { className: `fixed top-6 right-6 z-50 px-5 py-3 rounded-xl text-sm font-semibold shadow-2xl border flex items-center gap-2 ${colours[type]}`, children: [
    /* @__PURE__ */ jsx("span", { children: icons[type] }),
    " ",
    msg
  ] });
}
function Field$1({
  label,
  desc,
  value,
  onChange,
  placeholder,
  multiline,
  maxLength,
  type = "text",
  monospace = false,
  prefix
}) {
  const cls = `w-full bg-white/3 border border-white/10 hover:border-white/20 focus:border-[#00BFFF]/40 rounded-xl px-4 py-3 text-white text-sm outline-none transition-all placeholder-gray-700 ${monospace ? "font-mono" : ""}`;
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-baseline justify-between mb-1", children: [
      /* @__PURE__ */ jsx("label", { className: "text-white text-sm font-semibold", children: label }),
      maxLength && /* @__PURE__ */ jsxs("span", { className: `text-[10px] ${value.length > maxLength * 0.9 ? "text-orange-400" : "text-gray-700"}`, children: [
        value.length,
        "/",
        maxLength
      ] })
    ] }),
    /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-xs mb-2", children: desc }),
    prefix ? /* @__PURE__ */ jsxs("div", { className: "flex items-center bg-white/3 border border-white/10 hover:border-white/20 rounded-xl overflow-hidden focus-within:border-[#00BFFF]/40 transition-all", children: [
      /* @__PURE__ */ jsx("span", { className: "px-3 text-gray-600 text-sm border-r border-white/10 select-none", children: prefix }),
      /* @__PURE__ */ jsx(
        "input",
        {
          type,
          value,
          onChange: (e) => onChange(e.target.value),
          placeholder,
          className: "flex-1 bg-transparent px-3 py-3 text-white text-sm outline-none placeholder-gray-700"
        }
      )
    ] }) : multiline ? /* @__PURE__ */ jsx(
      "textarea",
      {
        value,
        onChange: (e) => onChange(e.target.value),
        placeholder,
        maxLength,
        rows: 3,
        className: cls + " resize-none"
      }
    ) : /* @__PURE__ */ jsx(
      "input",
      {
        type,
        value,
        onChange: (e) => onChange(e.target.value),
        placeholder,
        maxLength,
        className: cls
      }
    )
  ] });
}
function Toggle$1({ label, desc, value, onChange }) {
  return /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4", children: [
    /* @__PURE__ */ jsx(
      "button",
      {
        onClick: () => onChange(!value),
        className: `relative mt-0.5 w-11 h-6 rounded-full border transition-all duration-300 shrink-0 ${value ? "bg-[#00BFFF]/20 border-[#00BFFF]/40" : "bg-white/5 border-white/10"}`,
        children: /* @__PURE__ */ jsx("span", { className: `absolute top-0.5 w-5 h-5 rounded-full transition-all duration-300 shadow ${value ? "left-5 bg-[#00BFFF]" : "left-0.5 bg-gray-600"}` })
      }
    ),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("p", { className: "text-white text-sm font-semibold", children: label }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-xs mt-0.5", children: desc })
    ] })
  ] });
}
const ANNOUNCEMENT_TYPES = [
  { value: "info", label: "Info", color: "text-[#00BFFF]", bg: "bg-[#00BFFF]/10 border-[#00BFFF]/20" },
  { value: "warning", label: "Warning", color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20" },
  { value: "success", label: "Success", color: "text-green-400", bg: "bg-green-500/10 border-green-500/20" },
  { value: "event", label: "Event", color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" }
];
const TAB_LIST$1 = [
  { id: "homepage", label: "Homepage", icon: "🏠" },
  { id: "announcement", label: "Announcement", icon: "📢" },
  { id: "social", label: "Social", icon: "🔗" },
  { id: "seo", label: "SEO & Meta", icon: "🔍" },
  { id: "footer", label: "Footer", icon: "🦶" },
  { id: "preview", label: "Preview", icon: "👁" },
  { id: "history", label: "History", icon: "🕓" }
];
function copyToClipboard$1(text) {
  navigator.clipboard.writeText(text).catch(() => {
  });
}
function ContentManager({ admin }) {
  const [form, setForm] = useState(getSiteContent);
  const [tab, setTab] = useState("homepage");
  const [toast, setToast] = useState(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState("");
  const [history, setHistory] = useState([]);
  const [copied, setCopied] = useState("");
  const fileRef = useRef(null);
  function set(key, val) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }
  function showMsg(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3e3);
  }
  function handleSave() {
    saveSiteContent(form);
    addLog(admin, "content:save", "Updated site content settings");
    setHistory((prev) => [{
      ts: Date.now(),
      label: `${admin} • ${(/* @__PURE__ */ new Date()).toLocaleTimeString()}`,
      data: { ...form }
    }, ...prev.slice(0, 9)]);
    showMsg("Content saved — changes will appear on next page load.");
  }
  function handleReset() {
    resetSiteContent();
    setForm(getSiteContent());
    setShowResetConfirm(false);
    addLog(admin, "content:reset", "Reset site content to defaults");
    showMsg("Content reset to defaults.");
  }
  function handleRestoreSnapshot(snap) {
    setForm({ ...snap.data });
    showMsg(`Restored snapshot from ${new Date(snap.ts).toLocaleTimeString()}`, "info");
  }
  function handleExport() {
    const blob = new Blob([JSON.stringify(form, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `blue-tiers-content-${Date.now()}.json`;
    a.click();
    showMsg("Config exported as JSON.", "info");
  }
  function handleImport() {
    try {
      const parsed = JSON.parse(importText);
      setForm((prev) => ({ ...prev, ...parsed }));
      setShowImport(false);
      setImportText("");
      showMsg("Config imported — review and save when ready.", "info");
    } catch {
      showMsg("Invalid JSON — check your file.", "error");
    }
  }
  function handleCopy(text, key) {
    copyToClipboard$1(text);
    setCopied(key);
    setTimeout(() => setCopied(""), 1800);
  }
  const announcementStyle = ANNOUNCEMENT_TYPES.find((t) => t.value === form.announcementType);
  return /* @__PURE__ */ jsxs("div", { className: "space-y-5 max-w-3xl", children: [
    toast && /* @__PURE__ */ jsx(Toast$2, { msg: toast.msg, type: toast.type }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("span", { className: "w-1 h-6 rounded-full bg-[#00BFFF] shadow-[0_0_8px_rgba(0,191,255,0.7)]" }),
        /* @__PURE__ */ jsx("h2", { className: "font-['Space_Grotesk'] font-black text-white text-lg", children: "Site Content" }),
        /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-600 ml-1", children: "Manage every piece of text & metadata across the site" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: handleExport,
            className: "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-gray-400 border border-white/10 hover:border-white/20 hover:text-white transition-all",
            children: "↓ Export"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setShowImport(true),
            className: "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-gray-400 border border-white/10 hover:border-white/20 hover:text-white transition-all",
            children: "↑ Import"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: handleSave,
            className: "btn-primary px-5 py-2 rounded-lg text-sm font-semibold text-white",
            children: "Save All"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex gap-1 overflow-x-auto pb-0.5", children: TAB_LIST$1.map((t) => /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: () => setTab(t.id),
        className: `flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${tab === t.id ? "bg-[#00BFFF]/12 border border-[#00BFFF]/25 text-[#00BFFF]" : "text-gray-500 border border-transparent hover:text-gray-300 hover:bg-white/3"}`,
        children: [
          /* @__PURE__ */ jsx("span", { children: t.icon }),
          " ",
          t.label,
          t.id === "announcement" && form.announcementEnabled && /* @__PURE__ */ jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-[#00BFFF] animate-pulse ml-0.5" })
        ]
      },
      t.id
    )) }),
    tab === "homepage" && /* @__PURE__ */ jsxs("div", { className: "glass rounded-2xl border border-white/8 p-6 space-y-5", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 pb-1 border-b border-white/5", children: [
        /* @__PURE__ */ jsx("span", { className: "text-base", children: "🏠" }),
        /* @__PURE__ */ jsx("h3", { className: "font-['Space_Grotesk'] font-bold text-white text-sm", children: "Homepage Settings" }),
        /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-xs ml-1", children: "Hero section, server IP, and Discord link" })
      ] }),
      /* @__PURE__ */ jsx(
        Field$1,
        {
          label: "Hero Title",
          desc: "Large heading displayed on the homepage hero. Usually all-caps.",
          value: form.heroTitle,
          onChange: (v) => set("heroTitle", v),
          placeholder: "BLUE TIERS",
          maxLength: 40
        }
      ),
      /* @__PURE__ */ jsx(
        Field$1,
        {
          label: "Hero Subtitle",
          desc: "Tagline shown below the title — keep it punchy and short.",
          value: form.heroSubtitle,
          onChange: (v) => set("heroSubtitle", v),
          placeholder: "#1 Tier List for all types of players.",
          maxLength: 80
        }
      ),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("div", { className: "flex items-baseline justify-between mb-1", children: /* @__PURE__ */ jsx("label", { className: "text-white text-sm font-semibold", children: "Server IP" }) }),
        /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-xs mb-2", children: "Minecraft server address shown in the hero copy pill and footer." }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              value: form.serverIP,
              onChange: (e) => set("serverIP", e.target.value),
              placeholder: "play.sennahosting.com",
              className: "flex-1 bg-white/3 border border-white/10 hover:border-white/20 focus:border-[#00BFFF]/40 rounded-xl px-4 py-3 text-white text-sm font-mono outline-none transition-all placeholder-gray-700"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => handleCopy(form.serverIP, "serverIP"),
              className: "px-4 py-2 rounded-xl text-xs border border-white/10 hover:border-white/20 text-gray-400 hover:text-white transition-all",
              children: copied === "serverIP" ? "✓ Copied" : "Copy"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-white text-sm font-semibold mb-1", children: "Discord Invite Link" }),
        /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-xs mb-2", children: 'Used for all "Join Discord" buttons throughout the site.' }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "url",
              value: form.discordLink,
              onChange: (e) => set("discordLink", e.target.value),
              placeholder: "https://discord.gg/...",
              className: "flex-1 bg-white/3 border border-white/10 hover:border-white/20 focus:border-[#00BFFF]/40 rounded-xl px-4 py-3 text-white text-sm outline-none transition-all placeholder-gray-700"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => handleCopy(form.discordLink, "discordLink"),
              className: "px-4 py-2 rounded-xl text-xs border border-white/10 hover:border-white/20 text-gray-400 hover:text-white transition-all",
              children: copied === "discordLink" ? "✓ Copied" : "Copy"
            }
          ),
          form.discordLink && /* @__PURE__ */ jsx(
            "a",
            {
              href: form.discordLink,
              target: "_blank",
              rel: "noopener noreferrer",
              className: "px-4 py-2 rounded-xl text-xs border border-white/10 hover:border-[#00BFFF]/30 text-gray-400 hover:text-[#00BFFF] transition-all",
              children: "↗ Test"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-2 p-5 rounded-xl bg-gradient-to-b from-[#070b12] to-[#09152a] border border-white/5", children: [
        /* @__PURE__ */ jsx("p", { className: "text-[9px] uppercase tracking-widest text-gray-600 mb-3", children: "Hero Preview" }),
        /* @__PURE__ */ jsx("div", { className: "font-['Space_Grotesk'] font-black text-3xl text-[#00BFFF] tracking-wider", children: form.heroTitle || "BLUE TIERS" }),
        /* @__PURE__ */ jsx("div", { className: "text-gray-400 text-sm mt-1", children: form.heroSubtitle || "#1 Tier List" }),
        /* @__PURE__ */ jsxs("div", { className: "mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10", children: [
          /* @__PURE__ */ jsx("span", { className: "text-[#00BFFF] text-xs font-mono", children: form.serverIP || "play.example.com" }),
          /* @__PURE__ */ jsx("span", { className: "text-gray-600 text-xs", children: "· Click to Copy" })
        ] })
      ] })
    ] }),
    tab === "announcement" && /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "glass rounded-2xl border border-white/8 p-6 space-y-5", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between pb-1 border-b border-white/5", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("span", { className: "text-base", children: "📢" }),
            /* @__PURE__ */ jsx("h3", { className: "font-['Space_Grotesk'] font-bold text-white text-sm", children: "Site-wide Announcement Banner" })
          ] }),
          /* @__PURE__ */ jsx("span", { className: `px-2.5 py-1 rounded-full text-[10px] font-bold border ${form.announcementEnabled ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-white/5 border-white/10 text-gray-600"}`, children: form.announcementEnabled ? "LIVE" : "OFF" })
        ] }),
        /* @__PURE__ */ jsx(
          Toggle$1,
          {
            label: "Enable Announcement Banner",
            desc: "Shows a dismissible banner at the very top of every page.",
            value: form.announcementEnabled,
            onChange: (v) => set("announcementEnabled", v)
          }
        ),
        /* @__PURE__ */ jsx(
          Field$1,
          {
            label: "Announcement Text",
            desc: "Main message displayed in the banner. Keep under 120 characters for best display.",
            value: form.announcementText,
            onChange: (v) => set("announcementText", v),
            placeholder: "Server maintenance scheduled for Friday 8PM UTC.",
            maxLength: 160
          }
        ),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-white text-sm font-semibold mb-1", children: "Banner Type" }),
          /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-xs mb-3", children: "Controls the colour and icon of the banner." }),
          /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-2", children: ANNOUNCEMENT_TYPES.map((t) => /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => set("announcementType", t.value),
              className: `px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all ${form.announcementType === t.value ? `${t.bg} ${t.color} ring-1 ring-inset ring-current/30` : "bg-white/3 border-white/10 text-gray-500 hover:text-gray-300"}`,
              children: t.label
            },
            t.value
          )) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsx(
            Field$1,
            {
              label: "Action Link URL",
              desc: "Optional — URL the 'Learn more' link opens.",
              value: form.announcementLink,
              onChange: (v) => set("announcementLink", v),
              placeholder: "https://...",
              type: "url"
            }
          ),
          /* @__PURE__ */ jsx(
            Field$1,
            {
              label: "Action Link Label",
              desc: "Text of the clickable link in the banner.",
              value: form.announcementLinkLabel,
              onChange: (v) => set("announcementLinkLabel", v),
              placeholder: "Learn more",
              maxLength: 30
            }
          )
        ] })
      ] }),
      form.announcementEnabled && /* @__PURE__ */ jsxs("div", { className: `rounded-xl border px-4 py-3 flex items-center gap-3 ${announcementStyle?.bg ?? ""}`, children: [
        /* @__PURE__ */ jsx("span", { className: `text-sm ${announcementStyle?.color ?? "text-white"}`, children: form.announcementType === "info" ? "ℹ️" : form.announcementType === "warning" ? "⚠️" : form.announcementType === "success" ? "✅" : "🎉" }),
        /* @__PURE__ */ jsxs("p", { className: `text-sm flex-1 ${announcementStyle?.color ?? "text-white"}`, children: [
          form.announcementText || "Your announcement text will appear here.",
          form.announcementLink && form.announcementLinkLabel && /* @__PURE__ */ jsx("span", { className: "ml-2 underline underline-offset-2 cursor-pointer", children: form.announcementLinkLabel })
        ] }),
        /* @__PURE__ */ jsx("span", { className: "text-gray-500 text-sm cursor-pointer", children: "✕" })
      ] }),
      !form.announcementEnabled && /* @__PURE__ */ jsx("div", { className: "rounded-xl border border-dashed border-white/10 px-4 py-4 text-center text-gray-600 text-xs", children: "Enable the banner above to see a live preview here." })
    ] }),
    tab === "social" && /* @__PURE__ */ jsxs("div", { className: "glass rounded-2xl border border-white/8 p-6 space-y-5", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 pb-1 border-b border-white/5", children: [
        /* @__PURE__ */ jsx("span", { className: "text-base", children: "🔗" }),
        /* @__PURE__ */ jsx("h3", { className: "font-['Space_Grotesk'] font-bold text-white text-sm", children: "Social Links" }),
        /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-xs ml-1", children: "Shown in the footer and share prompts" })
      ] }),
      [
        { key: "discordLink", label: "Discord", icon: "💬", placeholder: "https://discord.gg/...", prefix: "discord.gg/" },
        { key: "twitterLink", label: "Twitter/X", icon: "𝕏", placeholder: "https://x.com/...", prefix: "x.com/" },
        { key: "youtubeLink", label: "YouTube", icon: "▶", placeholder: "https://youtube.com/@...", prefix: "youtube.com/" },
        { key: "twitchLink", label: "Twitch", icon: "🎮", placeholder: "https://twitch.tv/...", prefix: "twitch.tv/" },
        { key: "githubLink", label: "GitHub", icon: "⌥", placeholder: "https://github.com/...", prefix: "github.com/" }
      ].map((s) => /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-1", children: [
          /* @__PURE__ */ jsxs("label", { className: "text-white text-sm font-semibold flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("span", { children: s.icon }),
            " ",
            s.label
          ] }),
          form[s.key] && /* @__PURE__ */ jsx(
            "a",
            {
              href: form[s.key],
              target: "_blank",
              rel: "noopener noreferrer",
              className: "text-[10px] text-[#00BFFF] hover:underline",
              children: "↗ open"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "url",
              value: form[s.key],
              onChange: (e) => set(s.key, e.target.value),
              placeholder: s.placeholder,
              className: "flex-1 bg-white/3 border border-white/10 hover:border-white/20 focus:border-[#00BFFF]/40 rounded-xl px-4 py-3 text-white text-sm outline-none transition-all placeholder-gray-700"
            }
          ),
          form[s.key] && /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => handleCopy(form[s.key], s.key),
              className: "px-3 py-2 rounded-xl text-xs border border-white/10 hover:border-white/20 text-gray-400 hover:text-white transition-all",
              children: copied === s.key ? "✓" : "⎘"
            }
          )
        ] })
      ] }, s.key)),
      /* @__PURE__ */ jsx("div", { className: "pt-2 border-t border-white/5", children: /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-xs", children: "Leave a field blank to hide that platform from the site. Discord is also used as the default invite link." }) })
    ] }),
    tab === "seo" && /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "glass rounded-2xl border border-white/8 p-6 space-y-5", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 pb-1 border-b border-white/5", children: [
          /* @__PURE__ */ jsx("span", { className: "text-base", children: "🔍" }),
          /* @__PURE__ */ jsx("h3", { className: "font-['Space_Grotesk'] font-bold text-white text-sm", children: "SEO & Open Graph" }),
          /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-xs ml-1", children: "Control how your site appears in search & social previews" })
        ] }),
        /* @__PURE__ */ jsx(
          Field$1,
          {
            label: "Page Title",
            desc: "Browser tab title and Google search result headline. Keep under 60 characters.",
            value: form.seoTitle,
            onChange: (v) => set("seoTitle", v),
            placeholder: "Blue Tiers — #1 Minecraft PvP Tier List",
            maxLength: 60
          }
        ),
        /* @__PURE__ */ jsx(
          Field$1,
          {
            label: "Meta Description",
            desc: "Shown in Google results and social shares. Aim for 140–160 characters.",
            value: form.seoDescription,
            onChange: (v) => set("seoDescription", v),
            placeholder: "The definitive tier list for Minecraft PvP players.",
            maxLength: 160,
            multiline: true
          }
        ),
        /* @__PURE__ */ jsx(
          Field$1,
          {
            label: "Keywords",
            desc: "Comma-separated keywords for meta tags (less critical for modern SEO but useful).",
            value: form.seoKeywords,
            onChange: (v) => set("seoKeywords", v),
            placeholder: "minecraft, pvp, tier list, blue tiers",
            maxLength: 200
          }
        ),
        /* @__PURE__ */ jsx(
          Field$1,
          {
            label: "OG Image URL",
            desc: "Social preview image shown when the site is shared on Discord, Twitter, etc. Recommended: 1200×630 px.",
            value: form.ogImageUrl,
            onChange: (v) => set("ogImageUrl", v),
            placeholder: "https://your-cdn.com/og-image.png",
            type: "url"
          }
        ),
        form.ogImageUrl && /* @__PURE__ */ jsx("div", { className: "rounded-xl overflow-hidden border border-white/8", children: /* @__PURE__ */ jsx("img", { src: form.ogImageUrl, alt: "OG preview", className: "w-full object-cover max-h-40", onError: (e) => e.currentTarget.style.display = "none" }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "glass rounded-2xl border border-white/8 p-5", children: [
        /* @__PURE__ */ jsx("p", { className: "text-[10px] uppercase tracking-widest text-gray-600 mb-3", children: "Google Result Preview" }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-0.5", children: [
          /* @__PURE__ */ jsx("p", { className: "text-[#00BFFF] text-base font-medium hover:underline cursor-pointer truncate", children: form.seoTitle || "Blue Tiers — #1 Minecraft PvP Tier List" }),
          /* @__PURE__ */ jsx("p", { className: "text-green-600 text-xs", children: "https://bluetiers.com" }),
          /* @__PURE__ */ jsx("p", { className: "text-gray-400 text-xs leading-relaxed line-clamp-2", children: form.seoDescription || "The definitive tier list for Minecraft PvP players." })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "glass rounded-2xl border border-white/8 p-5", children: [
        /* @__PURE__ */ jsx("p", { className: "text-[10px] uppercase tracking-widest text-gray-600 mb-3", children: "Twitter Card Preview" }),
        /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-white/10 overflow-hidden", children: [
          form.ogImageUrl ? /* @__PURE__ */ jsx("img", { src: form.ogImageUrl, alt: "OG", className: "w-full object-cover h-36", onError: (e) => e.currentTarget.style.display = "none" }) : /* @__PURE__ */ jsx("div", { className: "w-full h-36 bg-white/3 flex items-center justify-center text-gray-700 text-xs", children: "OG image will appear here" }),
          /* @__PURE__ */ jsxs("div", { className: "px-4 py-3 bg-[#070b12] border-t border-white/5", children: [
            /* @__PURE__ */ jsx("p", { className: "text-white text-sm font-semibold truncate", children: form.seoTitle || "Blue Tiers" }),
            /* @__PURE__ */ jsx("p", { className: "text-gray-500 text-xs mt-0.5 line-clamp-2", children: form.seoDescription || "No description set." }),
            /* @__PURE__ */ jsx("p", { className: "text-gray-700 text-[10px] mt-1", children: "bluetiers.com" })
          ] })
        ] })
      ] })
    ] }),
    tab === "footer" && /* @__PURE__ */ jsxs("div", { className: "glass rounded-2xl border border-white/8 p-6 space-y-5", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 pb-1 border-b border-white/5", children: [
        /* @__PURE__ */ jsx("span", { className: "text-base", children: "🦶" }),
        /* @__PURE__ */ jsx("h3", { className: "font-['Space_Grotesk'] font-bold text-white text-sm", children: "Footer Settings" }),
        /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-xs ml-1", children: "Bottom-of-page copyright, tagline, and visible elements" })
      ] }),
      /* @__PURE__ */ jsx(
        Field$1,
        {
          label: "Copyright Line",
          desc: "Legal text shown at the bottom of the footer.",
          value: form.footerCopyright,
          onChange: (v) => set("footerCopyright", v),
          placeholder: "© 2026 Blue Tiers. All rights reserved.",
          maxLength: 100
        }
      ),
      /* @__PURE__ */ jsx(
        Field$1,
        {
          label: "Footer Tagline",
          desc: "Second line under the copyright — typically a disclaimer.",
          value: form.footerTagline,
          onChange: (v) => set("footerTagline", v),
          placeholder: "Not affiliated with Mojang or Microsoft.",
          maxLength: 100
        }
      ),
      /* @__PURE__ */ jsx(
        Field$1,
        {
          label: "Extra Footer Note",
          desc: "Optional third line for announcements, credits, or additional disclaimers.",
          value: form.footerExtra,
          onChange: (v) => set("footerExtra", v),
          placeholder: "Powered by Blue Tiers v2.0",
          maxLength: 120
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "pt-2 border-t border-white/5 space-y-4", children: [
        /* @__PURE__ */ jsx("p", { className: "text-white text-sm font-semibold", children: "Visible Elements" }),
        /* @__PURE__ */ jsx(
          Toggle$1,
          {
            label: "Show Server IP",
            desc: "Displays the Minecraft server IP address in the footer.",
            value: form.footerShowServerIP,
            onChange: (v) => set("footerShowServerIP", v)
          }
        ),
        /* @__PURE__ */ jsx(
          Toggle$1,
          {
            label: "Show Discord Button",
            desc: "Shows the Discord invite link / button in the footer.",
            value: form.footerShowDiscord,
            onChange: (v) => set("footerShowDiscord", v)
          }
        ),
        /* @__PURE__ */ jsx(
          Toggle$1,
          {
            label: "Show Social Icons",
            desc: "Displays Twitter, YouTube, Twitch etc. icon links in the footer.",
            value: form.footerShowSocials,
            onChange: (v) => set("footerShowSocials", v)
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-2 p-4 rounded-xl bg-[#070b12] border border-white/5 text-center space-y-1", children: [
        /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-xs", children: form.footerCopyright || "© 2026 Blue Tiers." }),
        /* @__PURE__ */ jsx("p", { className: "text-gray-700 text-xs", children: form.footerTagline }),
        form.footerExtra && /* @__PURE__ */ jsx("p", { className: "text-gray-700 text-xs", children: form.footerExtra }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-center gap-3 pt-1", children: [
          form.footerShowServerIP && /* @__PURE__ */ jsx("span", { className: "text-[10px] text-[#00BFFF]/60 font-mono", children: form.serverIP }),
          form.footerShowDiscord && /* @__PURE__ */ jsx("span", { className: "text-[10px] text-[#00BFFF]/60", children: "Discord" }),
          form.footerShowSocials && /* @__PURE__ */ jsxs(Fragment, { children: [
            form.twitterLink && /* @__PURE__ */ jsx("span", { className: "text-[10px] text-gray-600", children: "𝕏" }),
            form.youtubeLink && /* @__PURE__ */ jsx("span", { className: "text-[10px] text-gray-600", children: "▶" }),
            form.twitchLink && /* @__PURE__ */ jsx("span", { className: "text-[10px] text-gray-600", children: "🎮" })
          ] })
        ] })
      ] })
    ] }),
    tab === "preview" && /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      form.announcementEnabled && form.announcementText && /* @__PURE__ */ jsxs("div", { className: `rounded-xl border px-4 py-2.5 flex items-center gap-2.5 ${announcementStyle?.bg ?? ""}`, children: [
        /* @__PURE__ */ jsx("span", { className: "text-sm", children: form.announcementType === "info" ? "ℹ️" : form.announcementType === "warning" ? "⚠️" : form.announcementType === "success" ? "✅" : "🎉" }),
        /* @__PURE__ */ jsx("p", { className: `text-sm flex-1 ${announcementStyle?.color ?? ""}`, children: form.announcementText })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-xl bg-[#0b0f17] border border-white/8 px-5 py-3 flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-lg", children: "✕" }),
          /* @__PURE__ */ jsxs("span", { className: "font-['Space_Grotesk'] font-bold text-sm", children: [
            /* @__PURE__ */ jsx("span", { className: "text-[#00BFFF]", children: "Blue" }),
            " Tiers"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "hidden sm:flex items-center gap-4 text-xs text-gray-400", children: [
          /* @__PURE__ */ jsx("span", { children: "Home" }),
          /* @__PURE__ */ jsx("span", { children: "Rankings" }),
          /* @__PURE__ */ jsx("span", { children: "Mining" }),
          /* @__PURE__ */ jsx("span", { children: "Shop" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "px-3 py-1.5 rounded-lg bg-[#00BFFF] text-xs font-semibold text-[#0b0f17]", children: "Join Discord" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-xl bg-gradient-to-b from-[#0b1120] to-[#070b12] border border-white/5 px-6 py-10 text-center space-y-3", children: [
        /* @__PURE__ */ jsx("div", { className: "font-['Space_Grotesk'] font-black text-4xl text-[#00BFFF] tracking-widest", children: form.heroTitle || "BLUE TIERS" }),
        /* @__PURE__ */ jsx("div", { className: "text-gray-400 text-sm", children: form.heroSubtitle }),
        /* @__PURE__ */ jsxs("div", { className: "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 mt-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-[#00BFFF] text-xs font-mono", children: form.serverIP }),
          /* @__PURE__ */ jsx("span", { className: "text-gray-700 text-xs", children: "Click to Copy" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-center gap-3 mt-3", children: [
          /* @__PURE__ */ jsx("div", { className: "px-5 py-2 rounded-lg bg-[#00BFFF] text-xs font-semibold text-[#070b12]", children: "View Rankings" }),
          /* @__PURE__ */ jsx("a", { href: form.discordLink || "#", className: "px-5 py-2 rounded-lg bg-white/8 border border-white/10 text-xs text-gray-300", children: "Join Discord" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-xl bg-[#070b12] border border-white/5 px-5 py-4 text-center space-y-1.5", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-center gap-4 text-xs text-gray-500 mb-2", children: [
          form.footerShowServerIP && /* @__PURE__ */ jsx("span", { className: "font-mono text-[#00BFFF]/60", children: form.serverIP }),
          form.footerShowDiscord && /* @__PURE__ */ jsx("span", { className: "text-[#00BFFF]/60", children: "Discord" })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-xs", children: form.footerCopyright }),
        /* @__PURE__ */ jsx("p", { className: "text-gray-700 text-xs", children: form.footerTagline }),
        form.footerExtra && /* @__PURE__ */ jsx("p", { className: "text-gray-700 text-xs", children: form.footerExtra })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "glass rounded-xl border border-white/8 p-4 space-y-1", children: [
        /* @__PURE__ */ jsx("p", { className: "text-[10px] uppercase tracking-widest text-gray-600 mb-2", children: "SEO Summary" }),
        /* @__PURE__ */ jsxs("p", { className: "text-xs", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600 w-28 inline-block", children: "Title:" }),
          /* @__PURE__ */ jsx("span", { className: "text-white", children: form.seoTitle || "—" })
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-xs", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600 w-28 inline-block", children: "Description:" }),
          /* @__PURE__ */ jsx("span", { className: "text-gray-400", children: form.seoDescription || "—" })
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-xs", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600 w-28 inline-block", children: "Keywords:" }),
          /* @__PURE__ */ jsx("span", { className: "text-gray-400", children: form.seoKeywords || "—" })
        ] })
      ] })
    ] }),
    tab === "history" && /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "glass rounded-2xl border border-white/8 p-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 pb-1 border-b border-white/5 mb-5", children: [
          /* @__PURE__ */ jsx("span", { className: "text-base", children: "🕓" }),
          /* @__PURE__ */ jsx("h3", { className: "font-['Space_Grotesk'] font-bold text-white text-sm", children: "Save History" }),
          /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-xs ml-1", children: "Restore any previous configuration from this session" })
        ] }),
        history.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "text-center py-8 text-gray-700 text-sm", children: [
          /* @__PURE__ */ jsx("div", { className: "text-3xl mb-2 opacity-30", children: "🕓" }),
          "No saves yet this session. History builds up as you save."
        ] }) : /* @__PURE__ */ jsx("div", { className: "space-y-2", children: history.map((snap, i) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-4 py-3 rounded-xl bg-white/3 border border-white/8 hover:border-white/12 transition-all", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-white text-sm font-semibold", children: i === 0 ? "Latest save" : `Save ${history.length - i}` }),
            /* @__PURE__ */ jsxs("p", { className: "text-gray-600 text-xs", children: [
              snap.label,
              " · ",
              new Date(snap.ts).toLocaleDateString()
            ] })
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => handleRestoreSnapshot(snap),
              className: "px-3 py-1.5 rounded-lg text-xs text-[#00BFFF] border border-[#00BFFF]/20 hover:bg-[#00BFFF]/10 transition-all",
              children: "Restore"
            }
          )
        ] }, snap.ts)) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "glass rounded-2xl border border-white/8 p-5", children: [
        /* @__PURE__ */ jsx("p", { className: "text-white text-sm font-semibold mb-1", children: "Export / Import Config" }),
        /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-xs mb-4", children: "Download your current settings as JSON, or paste a previously exported config to restore it." }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("button", { onClick: handleExport, className: "flex-1 py-2.5 rounded-xl text-sm text-gray-300 border border-white/10 hover:border-white/20 hover:text-white transition-all", children: "↓ Export JSON" }),
          /* @__PURE__ */ jsx("button", { onClick: () => setShowImport(true), className: "flex-1 py-2.5 rounded-xl text-sm text-gray-300 border border-white/10 hover:border-white/20 hover:text-white transition-all", children: "↑ Import JSON" })
        ] })
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setShowResetConfirm(true),
          className: "w-full py-2.5 rounded-xl text-sm text-red-400 border border-red-500/20 hover:bg-red-500/8 transition-all",
          children: "Reset All Content to Defaults"
        }
      )
    ] }),
    tab !== "preview" && tab !== "history" && /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-3 pt-2 border-t border-white/5", children: [
      /* @__PURE__ */ jsx("button", { onClick: handleSave, className: "btn-primary px-8 py-2.5 rounded-xl text-sm font-semibold text-white", children: "Save Content" }),
      /* @__PURE__ */ jsx("button", { onClick: () => setShowResetConfirm(true), className: "px-5 py-2.5 rounded-xl text-sm text-gray-500 border border-white/10 hover:border-white/20 hover:text-white transition-all", children: "Reset to Defaults" }),
      /* @__PURE__ */ jsx("button", { onClick: () => setTab("preview"), className: "px-5 py-2.5 rounded-xl text-sm text-gray-500 border border-white/10 hover:border-[#00BFFF]/20 hover:text-[#00BFFF] transition-all", children: "👁 Preview" })
    ] }),
    showResetConfirm && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm", children: /* @__PURE__ */ jsxs("div", { className: "glass rounded-2xl border border-red-500/20 p-7 max-w-sm w-full text-center shadow-2xl", children: [
      /* @__PURE__ */ jsx("div", { className: "text-4xl mb-3", children: "⚠️" }),
      /* @__PURE__ */ jsx("h3", { className: "text-white font-bold text-lg mb-2", children: "Reset All Content?" }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-500 text-sm mb-6", children: "Every field will revert to the hardcoded defaults. This cannot be undone." }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
        /* @__PURE__ */ jsx("button", { onClick: () => setShowResetConfirm(false), className: "flex-1 py-2.5 rounded-xl text-sm text-gray-400 border border-white/10 hover:text-white transition-all", children: "Cancel" }),
        /* @__PURE__ */ jsx("button", { onClick: handleReset, className: "flex-1 py-2.5 rounded-xl text-sm font-semibold text-red-400 border border-red-500/30 bg-red-500/10 hover:bg-red-500/15 transition-all", children: "Reset Everything" })
      ] })
    ] }) }),
    showImport && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm", children: /* @__PURE__ */ jsxs("div", { className: "glass rounded-2xl border border-white/12 p-6 max-w-md w-full shadow-2xl", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-white font-bold text-base mb-2", children: "Import Content Config" }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-500 text-xs mb-3", children: "Paste a previously exported JSON blob. Only valid keys will be applied." }),
      /* @__PURE__ */ jsx(
        "textarea",
        {
          value: importText,
          onChange: (e) => setImportText(e.target.value),
          rows: 8,
          placeholder: '{ "heroTitle": "...", ... }',
          className: "w-full bg-white/3 border border-white/10 focus:border-[#00BFFF]/40 rounded-xl px-4 py-3 text-white text-xs font-mono outline-none transition-all resize-none"
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-3 mt-3", children: [
        /* @__PURE__ */ jsx("button", { onClick: () => {
          setShowImport(false);
          setImportText("");
        }, className: "flex-1 py-2.5 rounded-xl text-sm text-gray-400 border border-white/10", children: "Cancel" }),
        /* @__PURE__ */ jsx("button", { onClick: handleImport, className: "flex-1 py-2.5 rounded-xl text-sm font-semibold text-[#00BFFF] border border-[#00BFFF]/30 bg-[#00BFFF]/8 hover:bg-[#00BFFF]/15 transition-all", children: "Import" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx("input", { ref: fileRef, type: "file", accept: ".json", className: "hidden", onChange: (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImportText(ev.target?.result);
        setShowImport(true);
      };
      reader.readAsText(file);
    } })
  ] });
}
function Toast$1({ msg, type }) {
  const colours = {
    success: "bg-green-500/15 border-green-500/30 text-green-400",
    error: "bg-red-500/15 border-red-500/30 text-red-400",
    info: "bg-[#00BFFF]/10 border-[#00BFFF]/25 text-[#00BFFF]"
  };
  return /* @__PURE__ */ jsxs("div", { className: `fixed top-6 right-6 z-50 px-5 py-3 rounded-xl text-sm font-semibold shadow-2xl border flex items-center gap-2 ${colours[type]}`, children: [
    type === "success" ? "✓" : type === "error" ? "⚠" : "ℹ",
    " ",
    msg
  ] });
}
function Field({
  label,
  desc,
  value,
  onChange,
  placeholder,
  multiline,
  maxLength,
  type = "text",
  monospace = false
}) {
  const cls = `w-full bg-white/3 border border-white/10 hover:border-white/20 focus:border-[#00BFFF]/40 rounded-xl px-4 py-3 text-white text-sm outline-none transition-all placeholder-gray-700 ${monospace ? "font-mono" : ""}`;
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-baseline justify-between mb-1", children: [
      /* @__PURE__ */ jsx("label", { className: "text-white text-sm font-semibold", children: label }),
      maxLength && /* @__PURE__ */ jsxs("span", { className: `text-[10px] ${String(value).length > maxLength * 0.9 ? "text-orange-400" : "text-gray-700"}`, children: [
        String(value).length,
        "/",
        maxLength
      ] })
    ] }),
    /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-xs mb-2", children: desc }),
    multiline ? /* @__PURE__ */ jsx(
      "textarea",
      {
        value: String(value),
        onChange: (e) => onChange(e.target.value),
        placeholder,
        maxLength,
        rows: 4,
        className: cls + " resize-none"
      }
    ) : /* @__PURE__ */ jsx(
      "input",
      {
        type,
        value: String(value),
        onChange: (e) => onChange(e.target.value),
        placeholder,
        maxLength,
        className: cls
      }
    )
  ] });
}
function Toggle({ label, desc, value, onChange }) {
  return /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4", children: [
    /* @__PURE__ */ jsx(
      "button",
      {
        onClick: () => onChange(!value),
        className: `relative mt-0.5 w-11 h-6 rounded-full border transition-all duration-300 shrink-0 ${value ? "bg-[#00BFFF]/20 border-[#00BFFF]/40" : "bg-white/5 border-white/10"}`,
        children: /* @__PURE__ */ jsx("span", { className: `absolute top-0.5 w-5 h-5 rounded-full transition-all duration-300 shadow ${value ? "left-5 bg-[#00BFFF]" : "left-0.5 bg-gray-600"}` })
      }
    ),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("p", { className: "text-white text-sm font-semibold", children: label }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-xs mt-0.5", children: desc })
    ] })
  ] });
}
const EVENT_TYPES = [
  { value: "pvp", label: "⚔️ PvP Tournament", color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
  { value: "community", label: "🌐 Community", color: "text-green-400", bg: "bg-green-500/10 border-green-500/20" },
  { value: "update", label: "🚀 Update Launch", color: "text-[#00BFFF]", bg: "bg-[#00BFFF]/10 border-[#00BFFF]/20" },
  { value: "seasonal", label: "🌸 Seasonal", color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
  { value: "custom", label: "✨ Custom", color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20" }
];
const BANNER_STYLES = [
  { value: "default", label: "Default", gradient: "from-[#070b12] via-[#09152a] to-[#070b12]", accent: "#00BFFF" },
  { value: "gold", label: "Gold", gradient: "from-[#120e02] via-[#1c1505] to-[#120e02]", accent: "#F5A623" },
  { value: "red", label: "Red", gradient: "from-[#120205] via-[#1c0508] to-[#120205]", accent: "#FF4D4F" },
  { value: "green", label: "Green", gradient: "from-[#021209] via-[#051c0f] to-[#021209]", accent: "#52C41A" },
  { value: "purple", label: "Purple", gradient: "from-[#09021c] via-[#120533] to-[#09021c]", accent: "#7B2FBE" },
  { value: "orange", label: "Orange", gradient: "from-[#120602] via-[#1c0e05] to-[#120602]", accent: "#FA8C16" }
];
const TAB_LIST = [
  { id: "identity", label: "Identity", icon: "🎯" },
  { id: "schedule", label: "Schedule", icon: "📅" },
  { id: "details", label: "Details", icon: "📋" },
  { id: "display", label: "Display", icon: "🎨" },
  { id: "preview", label: "Preview", icon: "👁" },
  { id: "history", label: "History", icon: "🕓" }
];
function toLocalDatetime(iso) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 16);
  } catch {
    return "";
  }
}
function fromLocalDatetime(local) {
  if (!local) return "";
  try {
    return new Date(local).toISOString();
  } catch {
    return local;
  }
}
function Countdown({ target }) {
  const [diff, setDiff] = useState(0);
  useEffect(() => {
    const update = () => setDiff(new Date(target).getTime() - Date.now());
    update();
    const id = setInterval(update, 1e3);
    return () => clearInterval(id);
  }, [target]);
  if (!target || diff <= 0) return null;
  const s = Math.floor(diff / 1e3);
  const days = Math.floor(s / 86400);
  const hrs = Math.floor(s % 86400 / 3600);
  const mins = Math.floor(s % 3600 / 60);
  const secs = s % 60;
  return /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2", children: [{ v: days, l: "D" }, { v: hrs, l: "H" }, { v: mins, l: "M" }, { v: secs, l: "S" }].map(({ v, l }) => /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
    /* @__PURE__ */ jsx("div", { className: "font-['Space_Grotesk'] font-black text-xl text-[#00BFFF] w-10 h-10 rounded-xl bg-[#00BFFF]/8 border border-[#00BFFF]/15 flex items-center justify-center", children: String(v).padStart(2, "0") }),
    /* @__PURE__ */ jsx("div", { className: "text-[9px] text-gray-600 mt-0.5", children: l })
  ] }, l)) });
}
function BannerPreview({ form }) {
  const style = BANNER_STYLES.find((s) => s.value === (form.bannerStyle ?? "default")) ?? BANNER_STYLES[0];
  const typeInfo = EVENT_TYPES.find((t) => t.value === form.eventType);
  const endDate = form.registrationEnds ? new Date(form.registrationEnds) : null;
  const isExpired = endDate ? endDate <= /* @__PURE__ */ new Date() : false;
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: `rounded-xl border bg-gradient-to-r ${style.gradient} overflow-hidden`,
      style: { borderColor: style.accent + "26" },
      children: [
        /* @__PURE__ */ jsxs("div", { className: "px-4 py-3 border-b flex items-center justify-between", style: { borderColor: style.accent + "1A" }, children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("span", { className: "w-2 h-2 rounded-full animate-pulse", style: { background: isExpired ? "#4B5563" : style.accent } }),
            /* @__PURE__ */ jsxs("span", { className: "text-xs font-bold uppercase tracking-widest", style: { color: style.accent }, children: [
              typeInfo?.label ?? "EVENT",
              " — ",
              isExpired ? "Closed" : "Open"
            ] })
          ] }),
          !isExpired && form.registrationEnds && /* @__PURE__ */ jsx(Countdown, { target: form.registrationEnds })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "px-5 py-4 flex items-center justify-between gap-4 flex-wrap", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-['Space_Grotesk'] font-black text-base text-white uppercase tracking-wide", children: form.title }),
            /* @__PURE__ */ jsx("p", { className: "text-gray-400 text-xs mt-0.5", children: isExpired ? "Registrations are now closed." : form.subtitle }),
            form.prizePool && /* @__PURE__ */ jsxs("p", { className: "text-xs mt-1", style: { color: style.accent }, children: [
              "🏆 Prize Pool: ",
              form.prizePool
            ] })
          ] }),
          /* @__PURE__ */ jsx(
            "a",
            {
              href: form.buttonLink || "#",
              target: "_blank",
              rel: "noopener noreferrer",
              className: "shrink-0 px-4 py-2 rounded-lg text-sm font-bold text-[#0b0f17] transition-all",
              style: { background: isExpired ? "#4B5563" : style.accent },
              children: isExpired ? form.closedButtonText : form.buttonText
            }
          )
        ] })
      ]
    }
  );
}
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).catch(() => {
  });
}
function EventManager({ admin }) {
  const [form, setForm] = useState(getEventConfig);
  const [tab, setTab] = useState("identity");
  const [toast, setToast] = useState(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [history, setHistory] = useState([]);
  const [copied, setCopied] = useState("");
  function set(key, val) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }
  function showMsg(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  }
  function handleSave() {
    saveEventConfig(form);
    addLog(admin, "event:save", `Updated event: "${form.title}"`);
    setHistory((prev) => [{
      ts: Date.now(),
      label: `${admin} · ${(/* @__PURE__ */ new Date()).toLocaleTimeString()}`,
      data: { ...form }
    }, ...prev.slice(0, 9)]);
    showMsg("Event saved — changes appear on next page load.");
  }
  function handleReset() {
    resetEventConfig();
    setForm(getEventConfig());
    setShowResetConfirm(false);
    addLog(admin, "event:reset", "Reset event config to defaults");
    showMsg("Event reset to defaults.");
  }
  function handleDuplicate() {
    setForm((prev) => ({ ...prev, title: prev.title + " (Copy)", visible: false }));
    showMsg("Event duplicated — edit and save.", "info");
  }
  function handleCopyShareText() {
    const endDate2 = form.registrationEnds ? new Date(form.registrationEnds).toLocaleDateString() : "TBD";
    const text = [
      `🎉 ${form.title}`,
      form.subtitle,
      form.description ? `
${form.description}` : "",
      `
📅 Registration ends: ${endDate2}`,
      form.prizePool ? `🏆 Prize pool: ${form.prizePool}` : "",
      form.maxParticipants ? `👥 Max participants: ${form.maxParticipants}` : "",
      form.streamLink ? `📺 Stream: ${form.streamLink}` : "",
      `
🔗 Register: ${form.buttonLink}`
    ].filter(Boolean).join("\n");
    copyToClipboard(text);
    setCopied("share");
    setTimeout(() => setCopied(""), 2e3);
    showMsg("Event announcement copied to clipboard!", "info");
  }
  const endDate = form.registrationEnds ? new Date(form.registrationEnds) : null;
  const startDate = form.eventStartDate ? new Date(form.eventStartDate) : null;
  const isExpired = endDate ? endDate <= /* @__PURE__ */ new Date() : false;
  let phase = "Pending";
  let phaseColor = "text-gray-400 bg-white/5 border-white/10";
  if (form.visible === false) {
    phase = "Hidden";
    phaseColor = "text-gray-500 bg-white/3 border-white/5";
  } else if (!isExpired) {
    phase = "Registration Open";
    phaseColor = "text-green-400 bg-green-500/8 border-green-500/20";
  } else if (isExpired && (!form.eventEndDate || new Date(form.eventEndDate) > /* @__PURE__ */ new Date())) {
    phase = "In Progress";
    phaseColor = "text-[#00BFFF] bg-[#00BFFF]/8 border-[#00BFFF]/20";
  } else {
    phase = "Ended";
    phaseColor = "text-red-400 bg-red-500/8 border-red-500/20";
  }
  return /* @__PURE__ */ jsxs("div", { className: "space-y-5 max-w-3xl", children: [
    toast && /* @__PURE__ */ jsx(Toast$1, { msg: toast.msg, type: toast.type }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("span", { className: "w-1 h-6 rounded-full bg-[#00BFFF] shadow-[0_0_8px_rgba(0,191,255,0.7)]" }),
        /* @__PURE__ */ jsx("h2", { className: "font-['Space_Grotesk'] font-black text-white text-lg", children: "Event Manager" }),
        /* @__PURE__ */ jsx("span", { className: `px-2.5 py-0.5 rounded-full text-[10px] font-bold border ml-1 ${phaseColor}`, children: phase })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: handleCopyShareText,
            className: "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-gray-400 border border-white/10 hover:border-white/20 hover:text-white transition-all",
            children: copied === "share" ? "✓ Copied" : "📋 Copy Announcement"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: handleDuplicate,
            className: "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-gray-400 border border-white/10 hover:border-white/20 hover:text-white transition-all",
            children: "⎘ Duplicate"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: handleSave,
            className: "btn-primary px-5 py-2 rounded-lg text-sm font-semibold text-white",
            children: "Save Event"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: `flex items-center justify-between gap-3 px-4 py-3 rounded-xl border text-sm ${phaseColor}`, children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2.5", children: [
        /* @__PURE__ */ jsx(
          "span",
          {
            className: `w-2 h-2 rounded-full ${!isExpired && form.visible !== false ? "animate-pulse" : ""}`,
            style: { background: !isExpired && form.visible !== false ? "#4ade80" : "#6B7280" }
          }
        ),
        /* @__PURE__ */ jsxs("span", { children: [
          "Phase: ",
          /* @__PURE__ */ jsx("strong", { children: phase })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 text-xs opacity-70", children: [
        endDate && !isExpired && /* @__PURE__ */ jsxs("span", { children: [
          "Reg. ends ",
          endDate.toLocaleDateString(),
          " ",
          endDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        ] }),
        form.maxParticipants ? /* @__PURE__ */ jsxs("span", { children: [
          "Cap: ",
          form.currentParticipants ?? 0,
          "/",
          form.maxParticipants
        ] }) : null
      ] })
    ] }),
    form.registrationEnds && !isExpired && /* @__PURE__ */ jsxs("div", { className: "glass rounded-2xl border border-white/8 px-5 py-4 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "text-[10px] uppercase tracking-widest text-gray-600", children: "Registration closes in" }),
        /* @__PURE__ */ jsx("p", { className: "text-gray-400 text-xs mt-0.5", children: endDate?.toLocaleString() })
      ] }),
      /* @__PURE__ */ jsx(Countdown, { target: form.registrationEnds })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex gap-1 overflow-x-auto pb-0.5", children: TAB_LIST.map((t) => /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: () => setTab(t.id),
        className: `flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${tab === t.id ? "bg-[#00BFFF]/12 border border-[#00BFFF]/25 text-[#00BFFF]" : "text-gray-500 border border-transparent hover:text-gray-300 hover:bg-white/3"}`,
        children: [
          /* @__PURE__ */ jsx("span", { children: t.icon }),
          " ",
          t.label
        ]
      },
      t.id
    )) }),
    tab === "identity" && /* @__PURE__ */ jsxs("div", { className: "glass rounded-2xl border border-white/8 p-6 space-y-5", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 pb-1 border-b border-white/5", children: [
        /* @__PURE__ */ jsx("span", { className: "text-base", children: "🎯" }),
        /* @__PURE__ */ jsx("h3", { className: "font-['Space_Grotesk'] font-bold text-white text-sm", children: "Event Identity" })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-white text-sm font-semibold mb-1", children: "Event Type" }),
        /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-xs mb-3", children: "Sets the badge and tone of the event banner." }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 gap-2", children: EVENT_TYPES.map((t) => /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => set("eventType", t.value),
            className: `px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all ${form.eventType === t.value ? `${t.bg} ${t.color} ring-1 ring-inset ring-current/20` : "bg-white/3 border-white/10 text-gray-500 hover:text-gray-300"}`,
            children: t.label
          },
          t.value
        )) })
      ] }),
      form.eventType === "custom" && /* @__PURE__ */ jsx(
        Field,
        {
          label: "Custom Type Label",
          desc: "Shown in the banner type badge when Event Type is Custom.",
          value: form.customTypeLabel ?? "",
          onChange: (v) => set("customTypeLabel", v),
          placeholder: "e.g. Build Contest",
          maxLength: 30
        }
      ),
      /* @__PURE__ */ jsx(
        Field,
        {
          label: "Event Title",
          desc: "Main event name — shown large in the banner. Usually all-caps reads well.",
          value: form.title,
          onChange: (v) => set("title", v),
          placeholder: "Blue Network PvP World Cup",
          maxLength: 60
        }
      ),
      /* @__PURE__ */ jsx(
        Field,
        {
          label: "Subtitle",
          desc: "Small text shown below the title when registrations are open.",
          value: form.subtitle,
          onChange: (v) => set("subtitle", v),
          placeholder: "Registrations are now open!",
          maxLength: 100
        }
      ),
      /* @__PURE__ */ jsx(
        Field,
        {
          label: "Description",
          desc: "Longer description shown in event detail pages and share text. Optional.",
          value: form.description ?? "",
          onChange: (v) => set("description", v),
          placeholder: "Compete against the best players on the network for prizes and glory. All skill levels welcome.",
          maxLength: 400,
          multiline: true
        }
      ),
      /* @__PURE__ */ jsx(
        Field,
        {
          label: "Organiser Name",
          desc: "Person or team running the event. Optional.",
          value: form.organizerName ?? "",
          onChange: (v) => set("organizerName", v),
          placeholder: "Blue Tiers Staff",
          maxLength: 60
        }
      )
    ] }),
    tab === "schedule" && /* @__PURE__ */ jsxs("div", { className: "glass rounded-2xl border border-white/8 p-6 space-y-5", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 pb-1 border-b border-white/5", children: [
        /* @__PURE__ */ jsx("span", { className: "text-base", children: "📅" }),
        /* @__PURE__ */ jsx("h3", { className: "font-['Space_Grotesk'] font-bold text-white text-sm", children: "Event Schedule" }),
        /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-xs ml-1", children: "All dates use your local timezone and are stored in UTC." })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("label", { className: "block text-white text-sm font-semibold mb-1", children: [
          "Registration End Date & Time ",
          /* @__PURE__ */ jsx("span", { className: "text-red-400", children: "*" })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-xs mb-2", children: 'When this passes, the banner automatically switches to the "closed" state. Required.' }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "datetime-local",
            value: toLocalDatetime(form.registrationEnds),
            onChange: (e) => set("registrationEnds", fromLocalDatetime(e.target.value)),
            className: "w-full bg-white/3 border border-white/10 hover:border-white/20 focus:border-[#00BFFF]/40 rounded-xl px-4 py-3 text-white text-sm outline-none transition-all"
          }
        ),
        endDate && /* @__PURE__ */ jsxs("p", { className: "text-gray-600 text-[10px] mt-1", children: [
          "UTC: ",
          endDate.toUTCString(),
          " · ",
          isExpired ? "⛔ Already expired" : `⏳ ${Math.ceil((endDate.getTime() - Date.now()) / 864e5)} days remaining`
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-white text-sm font-semibold mb-1", children: "Event Start Date & Time" }),
        /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-xs mb-2", children: "When the actual event begins (can differ from registration end). Optional." }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "datetime-local",
            value: toLocalDatetime(form.eventStartDate ?? ""),
            onChange: (e) => set("eventStartDate", fromLocalDatetime(e.target.value)),
            className: "w-full bg-white/3 border border-white/10 hover:border-white/20 focus:border-[#00BFFF]/40 rounded-xl px-4 py-3 text-white text-sm outline-none transition-all"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-white text-sm font-semibold mb-1", children: "Event End Date & Time" }),
        /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-xs mb-2", children: 'When the event fully wraps up. Once passed, the phase shows "Ended". Optional.' }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "datetime-local",
            value: toLocalDatetime(form.eventEndDate ?? ""),
            onChange: (e) => set("eventEndDate", fromLocalDatetime(e.target.value)),
            className: "w-full bg-white/3 border border-white/10 hover:border-white/20 focus:border-[#00BFFF]/40 rounded-xl px-4 py-3 text-white text-sm outline-none transition-all"
          }
        )
      ] }),
      (form.registrationEnds || form.eventStartDate || form.eventEndDate) && /* @__PURE__ */ jsxs("div", { className: "mt-2 p-4 rounded-xl bg-white/2 border border-white/5", children: [
        /* @__PURE__ */ jsx("p", { className: "text-[10px] uppercase tracking-widest text-gray-600 mb-3", children: "Timeline" }),
        /* @__PURE__ */ jsx("div", { className: "space-y-2", children: [
          { label: "Registration closes", date: form.registrationEnds, color: "#00BFFF" },
          { label: "Event starts", date: form.eventStartDate, color: "#52C41A" },
          { label: "Event ends", date: form.eventEndDate, color: "#FF4D4F" }
        ].filter((r) => r.date).map((row) => {
          const d = new Date(row.date);
          const past = d <= /* @__PURE__ */ new Date();
          return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsx("div", { className: "w-2.5 h-2.5 rounded-full shrink-0 border-2", style: { borderColor: row.color, background: past ? row.color : "transparent" } }),
            /* @__PURE__ */ jsx("span", { className: "text-gray-500 text-xs w-36 shrink-0", children: row.label }),
            /* @__PURE__ */ jsxs("span", { className: "text-white text-xs", children: [
              d.toLocaleDateString(),
              " ",
              d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            ] }),
            past && /* @__PURE__ */ jsx("span", { className: "text-[10px] text-gray-600", children: "· passed" })
          ] }, row.label);
        }) })
      ] })
    ] }),
    tab === "details" && /* @__PURE__ */ jsxs("div", { className: "glass rounded-2xl border border-white/8 p-6 space-y-5", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 pb-1 border-b border-white/5", children: [
        /* @__PURE__ */ jsx("span", { className: "text-base", children: "📋" }),
        /* @__PURE__ */ jsx("h3", { className: "font-['Space_Grotesk'] font-bold text-white text-sm", children: "Event Details" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsx(
          Field,
          {
            label: "CTA Button Text",
            desc: "Button label when registration is open.",
            value: form.buttonText,
            onChange: (v) => set("buttonText", v),
            placeholder: "Participate Now!",
            maxLength: 40
          }
        ),
        /* @__PURE__ */ jsx(
          Field,
          {
            label: "Closed Button Text",
            desc: "Button label after registration closes.",
            value: form.closedButtonText,
            onChange: (v) => set("closedButtonText", v),
            placeholder: "Registrations Closed",
            maxLength: 40
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-white text-sm font-semibold mb-1", children: "CTA Button Link" }),
        /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-xs mb-2", children: "URL the button opens — usually your Discord registration channel." }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "url",
              value: form.buttonLink,
              onChange: (e) => set("buttonLink", e.target.value),
              placeholder: "https://discord.gg/...",
              className: "flex-1 bg-white/3 border border-white/10 hover:border-white/20 focus:border-[#00BFFF]/40 rounded-xl px-4 py-3 text-white text-sm outline-none transition-all placeholder-gray-700"
            }
          ),
          form.buttonLink && /* @__PURE__ */ jsx(
            "a",
            {
              href: form.buttonLink,
              target: "_blank",
              rel: "noopener noreferrer",
              className: "px-4 py-2 rounded-xl text-xs border border-white/10 hover:border-[#00BFFF]/30 text-gray-400 hover:text-[#00BFFF] transition-all",
              children: "↗ Test"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsx(
          Field,
          {
            label: "Prize Pool",
            desc: "Total prizes on offer — shown in the banner & share text.",
            value: form.prizePool ?? "",
            onChange: (v) => set("prizePool", v),
            placeholder: "$500 + in-game perks",
            maxLength: 60
          }
        ),
        /* @__PURE__ */ jsx(
          Field,
          {
            label: "Stream Link",
            desc: "Twitch/YouTube stream URL for the event broadcast.",
            value: form.streamLink ?? "",
            onChange: (v) => set("streamLink", v),
            placeholder: "https://twitch.tv/...",
            type: "url"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-white text-sm font-semibold mb-1", children: "Max Participants" }),
          /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-xs mb-2", children: "Participant cap. Set to 0 for unlimited." }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              min: 0,
              value: form.maxParticipants ?? 0,
              onChange: (e) => set("maxParticipants", parseInt(e.target.value) || 0),
              className: "w-full bg-white/3 border border-white/10 hover:border-white/20 focus:border-[#00BFFF]/40 rounded-xl px-4 py-3 text-white text-sm outline-none transition-all"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-white text-sm font-semibold mb-1", children: "Current Participants" }),
          /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-xs mb-2", children: "Manually tracked sign-up count." }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              min: 0,
              value: form.currentParticipants ?? 0,
              onChange: (e) => set("currentParticipants", parseInt(e.target.value) || 0),
              className: "w-full bg-white/3 border border-white/10 hover:border-white/20 focus:border-[#00BFFF]/40 rounded-xl px-4 py-3 text-white text-sm outline-none transition-all"
            }
          )
        ] })
      ] }),
      (form.maxParticipants ?? 0) > 0 && /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs mb-1.5", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-500", children: "Participants" }),
          /* @__PURE__ */ jsxs("span", { className: "text-white font-semibold", children: [
            form.currentParticipants ?? 0,
            " / ",
            form.maxParticipants
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "w-full h-2 rounded-full bg-white/5", children: /* @__PURE__ */ jsx(
          "div",
          {
            className: "h-2 rounded-full bg-[#00BFFF] transition-all",
            style: { width: `${Math.min(100, (form.currentParticipants ?? 0) / form.maxParticipants * 100)}%` }
          }
        ) })
      ] }),
      /* @__PURE__ */ jsx(
        Field,
        {
          label: "Rules & Format",
          desc: "Event rules, bracket format, or any info players need to know. Shown in detail views.",
          value: form.rulesText ?? "",
          onChange: (v) => set("rulesText", v),
          placeholder: "1v1 elimination bracket. Best of 3. UHC rules apply...",
          maxLength: 1e3,
          multiline: true
        }
      )
    ] }),
    tab === "display" && /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "glass rounded-2xl border border-white/8 p-6 space-y-5", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 pb-1 border-b border-white/5", children: [
          /* @__PURE__ */ jsx("span", { className: "text-base", children: "🎨" }),
          /* @__PURE__ */ jsx("h3", { className: "font-['Space_Grotesk'] font-bold text-white text-sm", children: "Banner Display" })
        ] }),
        /* @__PURE__ */ jsx(
          Toggle,
          {
            label: "Show Event Banner",
            desc: "When off, the event banner is completely hidden from the site.",
            value: form.visible !== false,
            onChange: (v) => set("visible", v)
          }
        ),
        /* @__PURE__ */ jsx(
          Toggle,
          {
            label: "Pin Banner to Top",
            desc: "When pinned, the event banner appears above everything including the nav.",
            value: form.pinned === true,
            onChange: (v) => set("pinned", v)
          }
        ),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-white text-sm font-semibold mb-1", children: "Banner Style" }),
          /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-xs mb-3", children: "Colour theme of the event banner strip." }),
          /* @__PURE__ */ jsx("div", { className: "grid grid-cols-3 gap-2", children: BANNER_STYLES.map((s) => /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => set("bannerStyle", s.value),
              className: `p-3 rounded-xl border text-xs font-semibold transition-all bg-gradient-to-r ${s.gradient} ${form.bannerStyle === s.value ? "ring-2 ring-offset-1 ring-offset-[#0B0F17]" : "opacity-60 hover:opacity-90"}`,
              style: form.bannerStyle === s.value ? { ringColor: s.accent } : {},
              children: [
                /* @__PURE__ */ jsx("div", { className: "w-4 h-4 rounded-full mx-auto mb-1.5", style: { background: s.accent } }),
                /* @__PURE__ */ jsx("span", { style: { color: s.accent }, children: s.label })
              ]
            },
            s.value
          )) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "glass rounded-2xl border border-white/8 p-5 space-y-3", children: [
        /* @__PURE__ */ jsx("p", { className: "text-[10px] uppercase tracking-widest text-gray-600", children: "Live Banner Preview" }),
        /* @__PURE__ */ jsx(BannerPreview, { form })
      ] })
    ] }),
    tab === "preview" && /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "glass rounded-2xl border border-white/8 p-5 space-y-3", children: [
        /* @__PURE__ */ jsx("p", { className: "text-[10px] uppercase tracking-widest text-gray-600", children: "Full Banner Preview" }),
        form.visible !== false ? /* @__PURE__ */ jsx(BannerPreview, { form }) : /* @__PURE__ */ jsx("div", { className: "rounded-xl border border-dashed border-white/10 py-8 text-center text-gray-600 text-sm", children: "Banner is hidden. Enable it in the Display tab." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "glass rounded-2xl border border-white/8 p-5 space-y-3", children: [
        /* @__PURE__ */ jsx("p", { className: "text-[10px] uppercase tracking-widest text-gray-600 mb-3", children: "Event Summary" }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-x-6 gap-y-2 text-xs", children: [
          { l: "Title", v: form.title },
          { l: "Type", v: EVENT_TYPES.find((t) => t.value === form.eventType)?.label ?? form.eventType },
          { l: "Reg. Ends", v: endDate ? endDate.toLocaleDateString() : "—" },
          { l: "Starts", v: startDate ? startDate.toLocaleDateString() : "—" },
          { l: "Prize Pool", v: form.prizePool || "—" },
          { l: "Participants", v: (form.maxParticipants ?? 0) > 0 ? `${form.currentParticipants ?? 0}/${form.maxParticipants}` : "Unlimited" },
          { l: "Organiser", v: form.organizerName || "—" },
          { l: "Phase", v: phase }
        ].map((r) => /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxs("span", { className: "text-gray-600 w-24 shrink-0", children: [
            r.l,
            ":"
          ] }),
          /* @__PURE__ */ jsx("span", { className: "text-white", children: r.v })
        ] }, r.l)) })
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: handleCopyShareText,
          className: "w-full py-3 rounded-xl text-sm text-gray-300 border border-white/10 hover:border-[#00BFFF]/25 hover:text-[#00BFFF] transition-all",
          children: copied === "share" ? "✓ Copied to clipboard!" : "📋 Copy Event Announcement for Discord"
        }
      )
    ] }),
    tab === "history" && /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "glass rounded-2xl border border-white/8 p-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 pb-1 border-b border-white/5 mb-5", children: [
          /* @__PURE__ */ jsx("span", { className: "text-base", children: "🕓" }),
          /* @__PURE__ */ jsx("h3", { className: "font-['Space_Grotesk'] font-bold text-white text-sm", children: "Save History" }),
          /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-xs ml-1", children: "Restore any version from this session" })
        ] }),
        history.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "text-center py-8 text-gray-700 text-sm", children: [
          /* @__PURE__ */ jsx("div", { className: "text-3xl mb-2 opacity-30", children: "🕓" }),
          "No saves yet — history builds here as you save."
        ] }) : /* @__PURE__ */ jsx("div", { className: "space-y-2", children: history.map((snap, i) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-4 py-3 rounded-xl bg-white/3 border border-white/8 hover:border-white/12 transition-all", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-white text-sm font-semibold", children: snap.data.title }),
            /* @__PURE__ */ jsxs("p", { className: "text-gray-600 text-xs", children: [
              snap.label,
              " · ",
              i === 0 ? "latest" : new Date(snap.ts).toLocaleDateString()
            ] })
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => {
                setForm({ ...snap.data });
                showMsg("Snapshot restored — review and save.", "info");
              },
              className: "px-3 py-1.5 rounded-lg text-xs text-[#00BFFF] border border-[#00BFFF]/20 hover:bg-[#00BFFF]/10 transition-all",
              children: "Restore"
            }
          )
        ] }, snap.ts)) })
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setShowResetConfirm(true),
          className: "w-full py-2.5 rounded-xl text-sm text-red-400 border border-red-500/20 hover:bg-red-500/8 transition-all",
          children: "Reset Event to Defaults"
        }
      )
    ] }),
    tab !== "preview" && tab !== "history" && /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-3 pt-2 border-t border-white/5", children: [
      /* @__PURE__ */ jsx("button", { onClick: handleSave, className: "btn-primary px-8 py-2.5 rounded-xl text-sm font-semibold text-white", children: "Save Event" }),
      /* @__PURE__ */ jsx("button", { onClick: () => setShowResetConfirm(true), className: "px-5 py-2.5 rounded-xl text-sm text-gray-500 border border-white/10 hover:border-white/20 hover:text-white transition-all", children: "Reset" }),
      /* @__PURE__ */ jsx("button", { onClick: () => setTab("preview"), className: "px-5 py-2.5 rounded-xl text-sm text-gray-500 border border-white/10 hover:border-[#00BFFF]/20 hover:text-[#00BFFF] transition-all", children: "👁 Preview" }),
      /* @__PURE__ */ jsx("button", { onClick: handleCopyShareText, className: "px-5 py-2.5 rounded-xl text-sm text-gray-500 border border-white/10 hover:border-white/20 hover:text-white transition-all ml-auto", children: copied === "share" ? "✓ Copied" : "📋 Copy Announcement" })
    ] }),
    showResetConfirm && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm", children: /* @__PURE__ */ jsxs("div", { className: "glass rounded-2xl border border-red-500/20 p-7 max-w-sm w-full text-center shadow-2xl", children: [
      /* @__PURE__ */ jsx("div", { className: "text-4xl mb-3", children: "⚠️" }),
      /* @__PURE__ */ jsx("h3", { className: "text-white font-bold text-lg mb-2", children: "Reset Event Config?" }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-500 text-sm mb-6", children: "All event settings will revert to the defaults. This cannot be undone." }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
        /* @__PURE__ */ jsx("button", { onClick: () => setShowResetConfirm(false), className: "flex-1 py-2.5 rounded-xl text-sm text-gray-400 border border-white/10", children: "Cancel" }),
        /* @__PURE__ */ jsx("button", { onClick: handleReset, className: "flex-1 py-2.5 rounded-xl text-sm font-semibold text-red-400 border border-red-500/30 bg-red-500/10 hover:bg-red-500/15 transition-all", children: "Reset" })
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
function timeAgo$5(ts) {
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
      /* @__PURE__ */ jsx("span", { className: "text-gray-700 text-[10px] shrink-0", children: timeAgo$5(log.timestamp) })
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
function timeAgo$4(isoOrMs) {
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
          /* @__PURE__ */ jsx("p", { className: `text-sm font-bold ${status.lastBackupAt ? "text-green-400" : "text-gray-600"}`, children: status.lastBackupAt ? timeAgo$4(status.lastBackupAt) : "—" }),
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
          /* @__PURE__ */ jsx("span", { className: "text-[10px] text-gray-600 shrink-0 tabular-nums", children: timeAgo$4(c.date) })
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
              value: sync.lastSyncAt ? timeAgo$4(sync.lastSyncAt) : "—",
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
        repoStatus.latestCommit.date && /* @__PURE__ */ jsx("span", { className: "text-[10px] text-gray-700 tabular-nums shrink-0", children: timeAgo$4(repoStatus.latestCommit.date) })
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
function timeAgo$3(iso) {
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
        /* @__PURE__ */ jsx(InfoRow, { label: "Last commit date", value: repoInfo.lastDate ? `${formatDate$1(repoInfo.lastDate)} (${timeAgo$3(repoInfo.lastDate)})` : "—" }),
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
function timeAgo$2(ms) {
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
              /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-[10px]", children: timeAgo$2(purchase.createdAt) })
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
const HIST_KEY = "bn_cred_history";
const NOTES_KEY = "bn_cred_notes";
const AMBIG = /* @__PURE__ */ new Set(["0", "O", "l", "1", "I", "i", "o"]);
function measureStrength(pw) {
  if (!pw) return { score: 0, label: "None", color: "bg-gray-800", tips: [] };
  const tips = [];
  let score = 0;
  if (pw.length >= 8) score++;
  else tips.push("Use at least 8 characters");
  if (pw.length >= 14) score++;
  else if (pw.length >= 8) tips.push("14+ characters recommended");
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  else tips.push("Mix upper and lowercase");
  if (/\d/.test(pw)) score++;
  else tips.push("Add numbers");
  if (/[^A-Za-z0-9]/.test(pw)) {
    if (score < 4) score++;
  } else tips.push("Add symbols (!@#$…)");
  const capped = Math.min(score, 4);
  return {
    score: capped,
    label: ["None", "Weak", "Fair", "Good", "Strong"][capped],
    color: ["bg-gray-800", "bg-red-500", "bg-orange-400", "bg-yellow-400", "bg-green-400"][capped],
    tips
  };
}
function calcEntropy(pw) {
  if (!pw) return 0;
  let cs = 0;
  if (/[a-z]/.test(pw)) cs += 26;
  if (/[A-Z]/.test(pw)) cs += 26;
  if (/\d/.test(pw)) cs += 10;
  if (/[^a-zA-Z0-9]/.test(pw)) cs += 32;
  return Math.floor(pw.length * Math.log2(cs || 1));
}
function estimateCrackTime(bits) {
  const secs = Math.pow(2, bits) / 1e9;
  if (secs < 1) return "< 1 second";
  if (secs < 60) return `${Math.floor(secs)}s`;
  if (secs < 3600) return `${Math.floor(secs / 60)}min`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h`;
  if (secs < 864e3) return `${Math.floor(secs / 86400)}d`;
  if (secs < 2592e3) return `${Math.floor(secs / 86400)}d`;
  if (secs < 31536e3) return `${Math.floor(secs / 2592e3)}mo`;
  const yrs = secs / 31536e3;
  if (yrs < 1e3) return `${Math.floor(yrs)}yr`;
  if (yrs < 1e6) return `${(yrs / 1e3).toFixed(1)}k yr`;
  if (yrs < 1e9) return `${(yrs / 1e6).toFixed(1)}M yr`;
  return `${yrs.toExponential(1)} yr`;
}
function generatePassword(opts) {
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const nums = "0123456789";
  const syms = "!@#$%^&*-_=+?";
  const filterAmbig = (s) => opts.noAmbig ? s.split("").filter((c) => !AMBIG.has(c)).join("") : s;
  const pools = [];
  if (opts.lower) pools.push(filterAmbig(lower));
  if (opts.upper) pools.push(filterAmbig(upper));
  if (opts.nums) pools.push(filterAmbig(nums));
  if (opts.syms) pools.push(syms);
  if (pools.length === 0) pools.push(lower);
  const full = pools.join("");
  const arr = new Uint8Array(opts.length);
  crypto.getRandomValues(arr);
  let pw = Array.from(arr).map((b) => full[b % full.length]).join("");
  const rnd = new Uint8Array(pools.length);
  crypto.getRandomValues(rnd);
  const chars = pw.split("");
  pools.forEach((pool, i) => {
    chars[i % opts.length] = pool[rnd[i] % pool.length];
  });
  const sh = new Uint8Array(chars.length);
  crypto.getRandomValues(sh);
  for (let i = chars.length - 1; i > 0; i--) {
    const j = sh[i] % (i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
}
function calcGrade(factors) {
  let s = 0;
  s += factors.p1Score * 8;
  s += factors.p2Score * 8;
  if (factors.p1Hashed) s += 10;
  if (factors.p2Hashed) s += 10;
  if (factors.histLen > 0) s += 5;
  if (factors.daysSince !== null && factors.daysSince <= 90) s += 5;
  if (factors.daysSince !== null && factors.daysSince <= 30) s += 5;
  const pct = Math.min(100, s);
  if (pct >= 88) return { grade: "A", label: "Excellent", color: "text-green-400", bg: "bg-green-500/10 border-green-500/25", score: pct };
  if (pct >= 72) return { grade: "B", label: "Good", color: "text-[#00BFFF]", bg: "bg-[#00BFFF]/10 border-[#00BFFF]/25", score: pct };
  if (pct >= 56) return { grade: "C", label: "Fair", color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/25", score: pct };
  if (pct >= 40) return { grade: "D", label: "Weak", color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/25", score: pct };
  return { grade: "F", label: "Critical", color: "text-red-400", bg: "bg-red-500/10 border-red-500/25", score: pct };
}
function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(HIST_KEY) ?? "[]");
  } catch {
    return [];
  }
}
function pushHistory(changed) {
  try {
    const h = loadHistory();
    h.unshift({ ts: Date.now(), changed });
    localStorage.setItem(HIST_KEY, JSON.stringify(h.slice(0, 30)));
  } catch {
  }
}
function loadNotes() {
  try {
    return localStorage.getItem(NOTES_KEY) ?? "";
  } catch {
    return "";
  }
}
function saveNotes(notes) {
  try {
    localStorage.setItem(NOTES_KEY, notes);
  } catch {
  }
}
function timeAgo$1(ts) {
  const d = Date.now() - ts;
  if (d < 6e4) return `${Math.floor(d / 1e3)}s ago`;
  if (d < 36e5) return `${Math.floor(d / 6e4)}m ago`;
  if (d < 864e5) return `${Math.floor(d / 36e5)}h ago`;
  if (d < 30 * 864e5) return `${Math.floor(d / 864e5)}d ago`;
  return new Date(ts).toLocaleDateString();
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
  const ctr = useRef(0);
  const push = useCallback((msg, type = "info") => {
    const id = ++ctr.current;
    setToasts((p) => [...p, { id, msg, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4500);
  }, []);
  const remove = useCallback((id) => setToasts((p) => p.filter((t) => t.id !== id)), []);
  return { toasts, push, remove };
}
function ClipboardBtn({ text, label = "Copy", size = "sm" }) {
  const [state, setState] = useState("idle");
  const timerRef = useRef(null);
  function handleCopy() {
    if (!text) return;
    navigator.clipboard.writeText(text).catch(() => {
    });
    setState(30);
    timerRef.current = setInterval(() => {
      setState((prev) => {
        if (typeof prev === "number") {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            navigator.clipboard.writeText("").catch(() => {
            });
            return "idle";
          }
          return prev - 1;
        }
        return "idle";
      });
    }, 1e3);
  }
  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);
  const isCounting = typeof state === "number";
  const textSize = size === "xs" ? "text-[10px]" : "text-xs";
  return /* @__PURE__ */ jsx(
    "button",
    {
      type: "button",
      onClick: handleCopy,
      disabled: !text,
      className: `shrink-0 ${textSize} font-semibold px-3 py-1.5 rounded-lg border transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed ${isCounting ? "bg-orange-500/10 border-orange-500/25 text-orange-400" : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/8 hover:text-gray-200"}`,
      children: isCounting ? `🕐 ${state}s` : `📋 ${label}`
    }
  );
}
function EntropyBadge({ password }) {
  if (!password) return null;
  const bits = calcEntropy(password);
  const time = estimateCrackTime(bits);
  const color = bits >= 60 ? "text-green-400" : bits >= 40 ? "text-yellow-400" : bits >= 25 ? "text-orange-400" : "text-red-400";
  return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 text-[10px] mt-1", children: [
    /* @__PURE__ */ jsxs("span", { className: `font-mono font-bold ${color}`, children: [
      bits,
      " bits"
    ] }),
    /* @__PURE__ */ jsx("span", { className: "text-gray-700", children: "·" }),
    /* @__PURE__ */ jsxs("span", { className: "text-gray-600", children: [
      "Crack @ 1B/s: ",
      /* @__PURE__ */ jsx("span", { className: color, children: time })
    ] })
  ] });
}
function StrengthBar({ password, showEntropy }) {
  const s = measureStrength(password);
  return /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
    /* @__PURE__ */ jsx("div", { className: "flex gap-1 h-1.5", children: [1, 2, 3, 4].map((i) => /* @__PURE__ */ jsx("div", { className: `flex-1 rounded-full transition-all duration-300 ${i <= s.score ? s.color : "bg-white/10"}` }, i)) }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsx("span", { className: `text-[10px] font-semibold ${s.score === 4 ? "text-green-400" : s.score === 3 ? "text-yellow-400" : s.score === 2 ? "text-orange-400" : s.score >= 1 ? "text-red-400" : "text-gray-700"}`, children: password ? s.label : "" }),
      s.tips[0] && /* @__PURE__ */ jsxs("span", { className: "text-[10px] text-gray-600 truncate max-w-[60%]", children: [
        "Tip: ",
        s.tips[0]
      ] })
    ] }),
    showEntropy && /* @__PURE__ */ jsx(EntropyBadge, { password })
  ] });
}
function PasswordInput({
  label,
  value,
  onChange,
  placeholder,
  showStrength,
  showEntropy,
  disabled,
  autoComplete,
  onInsert
}) {
  const [show, setShow] = useState(false);
  return /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
    /* @__PURE__ */ jsx("label", { className: "block text-xs font-semibold text-gray-400 uppercase tracking-widest", children: label }),
    /* @__PURE__ */ jsxs("div", { className: "relative flex gap-1.5", children: [
      /* @__PURE__ */ jsxs("div", { className: "relative flex-1", children: [
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
      onInsert && /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: () => onInsert(value),
          title: "Use this value from the Generator",
          className: "px-2.5 rounded-xl border border-dashed border-[#00BFFF]/20 text-[#00BFFF]/50 hover:border-[#00BFFF]/50 hover:text-[#00BFFF] transition-all text-xs",
          children: "✨"
        }
      )
    ] }),
    showStrength && /* @__PURE__ */ jsx(StrengthBar, { password: value, showEntropy }),
    !showStrength && showEntropy && /* @__PURE__ */ jsx(EntropyBadge, { password: value })
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
function ConfirmModal({ state, onConfirm, onCancel }) {
  const [input, setInput] = useState("");
  const ok = input.trim().toUpperCase() === "CONFIRM";
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4", style: { background: "rgba(0,0,0,0.75)" }, children: /* @__PURE__ */ jsxs("div", { className: "bg-[#0a0e17] border border-white/12 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsx("div", { className: "w-11 h-11 rounded-xl bg-orange-500/10 border border-orange-500/25 flex items-center justify-center text-xl", children: "⚠️" }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h3", { className: "font-['Space_Grotesk'] font-bold text-white", children: state.title }),
        /* @__PURE__ */ jsx("p", { className: "text-gray-500 text-xs", children: "This action will revoke all existing sessions" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "p-4 rounded-xl bg-orange-500/5 border border-orange-500/15 space-y-2", children: [
      /* @__PURE__ */ jsx("p", { className: "text-xs font-bold text-orange-400 uppercase tracking-widest", children: "What will change" }),
      state.changes.map((c, i) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-xs text-orange-300", children: [
        /* @__PURE__ */ jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" }),
        c
      ] }, i))
    ] }),
    /* @__PURE__ */ jsx("div", { className: "p-3 rounded-xl bg-red-500/5 border border-red-500/15 text-[11px] text-red-400 leading-relaxed", children: "You will be signed out immediately. Log in with the new credentials to continue." }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxs("label", { className: "text-xs text-gray-500", children: [
        "Type ",
        /* @__PURE__ */ jsx("span", { className: "font-mono text-orange-400", children: "CONFIRM" }),
        " to proceed:"
      ] }),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "text",
          value: input,
          onChange: (e) => setInput(e.target.value),
          onKeyDown: (e) => e.key === "Enter" && ok && onConfirm(),
          placeholder: "CONFIRM",
          autoFocus: true,
          className: "w-full bg-white/3 border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-[#00BFFF]/40 transition-all font-mono"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: onCancel,
          className: "flex-1 py-2.5 rounded-xl border border-white/10 text-gray-400 hover:bg-white/5 text-sm font-semibold transition-all",
          children: "Cancel"
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: onConfirm,
          disabled: !ok,
          className: "flex-1 py-2.5 rounded-xl bg-orange-500/20 border border-orange-500/30 text-orange-300 hover:bg-orange-500/30 disabled:opacity-30 disabled:cursor-not-allowed text-sm font-bold transition-all",
          children: "Apply Changes"
        }
      )
    ] })
  ] }) });
}
function PasswordGenerator({ onInsertP1, onInsertP2 }) {
  const [opts, setOpts] = useState({
    length: 20,
    upper: true,
    lower: true,
    nums: true,
    syms: true,
    noAmbig: true
  });
  const [generated, setGenerated] = useState("");
  const [show, setShow] = useState(false);
  const [history, setHistory] = useState([]);
  function gen() {
    const pw = generatePassword(opts);
    setGenerated(pw);
    setHistory((p) => [pw, ...p].slice(0, 5));
  }
  useEffect(() => {
    gen();
  }, []);
  const bits = calcEntropy(generated);
  const crackT = estimateCrackTime(bits);
  const entropy = bits;
  const entropyColor = bits >= 60 ? "text-green-400" : bits >= 40 ? "text-yellow-400" : bits >= 25 ? "text-orange-400" : "text-red-400";
  const strength = measureStrength(generated);
  function toggle(key) {
    setOpts((p) => {
      const next = { ...p, [key]: !p[key] };
      if (!next.upper && !next.lower && !next.nums && !next.syms) return p;
      return next;
    });
  }
  useEffect(() => {
    if (generated) gen();
  }, [opts]);
  return /* @__PURE__ */ jsxs(Card, { children: [
    /* @__PURE__ */ jsx(CardHeader, { icon: "✨", title: "Password Generator", subtitle: "Cryptographically secure random passwords with configurable options" }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "relative group", children: [
        /* @__PURE__ */ jsx(
          "div",
          {
            className: `w-full bg-black/30 border border-[#00BFFF]/20 rounded-xl px-4 py-4 pr-24 font-mono text-sm break-all leading-relaxed tracking-wider ${show ? "text-white" : "text-transparent select-none"}`,
            style: show ? {} : { textShadow: "0 0 8px rgba(255,255,255,0.5)" },
            children: generated || "—"
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "absolute right-2 top-1/2 -translate-y-1/2 flex gap-1", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => setShow((v) => !v),
              className: "px-2 py-1.5 rounded-lg text-gray-500 hover:text-gray-200 transition-colors text-sm",
              children: show ? "🙈" : "👁"
            }
          ),
          /* @__PURE__ */ jsx(ClipboardBtn, { text: generated, label: "Copy" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "flex gap-1 h-1.5 flex-1", children: [1, 2, 3, 4].map((i) => /* @__PURE__ */ jsx("div", { className: `flex-1 rounded-full transition-all duration-300 ${i <= strength.score ? strength.color : "bg-white/10"}` }, i)) }),
        /* @__PURE__ */ jsxs("span", { className: `text-[10px] font-bold ${entropyColor}`, children: [
          entropy,
          " bits"
        ] }),
        /* @__PURE__ */ jsx("span", { className: "text-[10px] text-gray-600", children: "·" }),
        /* @__PURE__ */ jsxs("span", { className: "text-[10px] text-gray-500", children: [
          "crack: ",
          /* @__PURE__ */ jsx("span", { className: entropyColor, children: crackT })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsx("label", { className: "text-xs font-semibold text-gray-400 uppercase tracking-widest", children: "Length" }),
        /* @__PURE__ */ jsx("span", { className: "font-mono text-sm font-bold text-[#00BFFF]", children: opts.length })
      ] }),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "range",
          min: 8,
          max: 64,
          step: 1,
          value: opts.length,
          onChange: (e) => setOpts((p) => ({ ...p, length: Number(e.target.value) })),
          className: "w-full accent-[#00BFFF] h-1.5 rounded-full cursor-pointer"
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-[10px] text-gray-700", children: [
        /* @__PURE__ */ jsx("span", { children: "8" }),
        /* @__PURE__ */ jsx("span", { children: "16" }),
        /* @__PURE__ */ jsx("span", { children: "24" }),
        /* @__PURE__ */ jsx("span", { children: "32" }),
        /* @__PURE__ */ jsx("span", { children: "48" }),
        /* @__PURE__ */ jsx("span", { children: "64" })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 gap-2", children: [
      { key: "upper", icon: "🔠", label: "Uppercase", sub: "A-Z" },
      { key: "lower", icon: "🔡", label: "Lowercase", sub: "a-z" },
      { key: "nums", icon: "🔢", label: "Numbers", sub: "0-9" },
      { key: "syms", icon: "🔣", label: "Symbols", sub: "!@#…" },
      { key: "noAmbig", icon: "👁", label: "No Ambiguous", sub: "0/O/l/1" }
    ].map(({ key, icon, label, sub }) => {
      const active = !!opts[key];
      return /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          onClick: () => toggle(key),
          className: `flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all duration-200 ${active ? "bg-[#00BFFF]/10 border-[#00BFFF]/25 text-[#00BFFF]" : "bg-white/2 border-white/6 text-gray-600 hover:border-white/12 hover:text-gray-400"}`,
          children: [
            /* @__PURE__ */ jsx("span", { className: "text-sm", children: icon }),
            /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsx("p", { className: "text-[10px] font-bold truncate", children: label }),
              /* @__PURE__ */ jsx("p", { className: "text-[9px] opacity-60", children: sub })
            ] })
          ]
        },
        key
      );
    }) }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-2", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: gen,
          className: "col-span-3 sm:col-span-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#00BFFF]/12 border border-[#00BFFF]/25 text-[#00BFFF] text-xs font-bold hover:bg-[#00BFFF]/20 transition-all",
          children: "↺ Regenerate"
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: () => {
            onInsertP1(generated);
          },
          className: "py-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold hover:bg-purple-500/18 transition-all",
          children: "→ P1"
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: () => {
            onInsertP2(generated);
          },
          className: "py-2.5 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold hover:bg-green-500/18 transition-all",
          children: "→ P2"
        }
      )
    ] }),
    history.length > 1 && /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsx("p", { className: "text-[10px] font-bold text-gray-600 uppercase tracking-widest", children: "Recent Generations" }),
      /* @__PURE__ */ jsx("div", { className: "space-y-1 max-h-40 overflow-y-auto", children: history.slice(1).map((pw, i) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 p-2 rounded-lg bg-white/2 border border-white/5 group", children: [
        /* @__PURE__ */ jsx("span", { className: "font-mono text-[10px] text-gray-600 flex-1 truncate blur-sm group-hover:blur-none transition-all", children: pw }),
        /* @__PURE__ */ jsx(ClipboardBtn, { text: pw, label: "Copy", size: "xs" }),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => setGenerated(pw),
            className: "text-[10px] text-gray-600 hover:text-gray-300 transition-colors px-1.5 py-1 rounded border border-white/8 hover:border-white/15",
            children: "Use"
          }
        )
      ] }, i)) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "p-3 rounded-xl bg-[#00BFFF]/4 border border-[#00BFFF]/10 text-[11px] text-gray-600 leading-relaxed space-y-1", children: [
      /* @__PURE__ */ jsx("p", { className: "text-[#00BFFF]/70 font-semibold text-[10px]", children: "ℹ Generator Notes" }),
      /* @__PURE__ */ jsxs("p", { children: [
        "Uses ",
        /* @__PURE__ */ jsx("span", { className: "font-mono text-gray-400", children: "crypto.getRandomValues()" }),
        " — cryptographically secure. Each charset is guaranteed to appear at least once. Clipboard auto-clears after 30 seconds."
      ] })
    ] })
  ] });
}
function SecurityGradeCard({ p1Score, p2Score, p1Hashed, p2Hashed, history }) {
  const daysSince = history.length > 0 ? Math.floor((Date.now() - history[0].ts) / 864e5) : null;
  const g = calcGrade({ p1Score, p2Score, p1Hashed, p2Hashed, daysSince, histLen: history.length });
  const factors = [
    { label: "Password 1 strength", ok: p1Score >= 3, detail: ["—", "Weak", "Fair", "Good", "Strong"][p1Score] },
    { label: "Password 2 strength", ok: p2Score >= 3, detail: ["—", "Weak", "Fair", "Good", "Strong"][p2Score] },
    { label: "Password 1 hashed", ok: p1Hashed, detail: p1Hashed ? "scrypt" : "Plaintext!" },
    { label: "Password 2 hashed", ok: p2Hashed, detail: p2Hashed ? "scrypt" : "Plaintext!" },
    { label: "Rotation history", ok: history.length > 0, detail: history.length > 0 ? `${history.length} rotation(s)` : "None" },
    {
      label: "Rotation recency",
      ok: daysSince !== null && daysSince <= 90,
      detail: daysSince !== null ? `${daysSince}d ago` : "Never rotated"
    }
  ];
  return /* @__PURE__ */ jsxs(Card, { children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
      /* @__PURE__ */ jsx("div", { className: `w-20 h-20 rounded-2xl border-2 ${g.bg} flex flex-col items-center justify-center shrink-0`, children: /* @__PURE__ */ jsx("span", { className: `text-4xl font-black font-['Space_Grotesk'] ${g.color}`, children: g.grade }) }),
      /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsx("h3", { className: "font-['Space_Grotesk'] font-bold text-white", children: "Security Grade" }),
        /* @__PURE__ */ jsx("p", { className: `text-sm font-bold mt-0.5 ${g.color}`, children: g.label }),
        /* @__PURE__ */ jsx("div", { className: "mt-2 h-1.5 bg-white/5 rounded-full overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: `h-full rounded-full ${g.color.replace("text-", "bg-").replace("-400", "-500")} transition-all duration-700`, style: { width: `${g.score}%` } }) }),
        /* @__PURE__ */ jsxs("p", { className: "text-[10px] text-gray-600 mt-1", children: [
          g.score,
          "/100 points"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-2", children: factors.map((f) => /* @__PURE__ */ jsxs("div", { className: `flex items-center gap-2 p-2.5 rounded-xl border ${f.ok ? "bg-green-500/5 border-green-500/15" : "bg-orange-500/5 border-orange-500/15"}`, children: [
      /* @__PURE__ */ jsx("span", { className: "text-sm shrink-0", children: f.ok ? "✅" : "⚠️" }),
      /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsx("p", { className: "text-[10px] font-semibold text-gray-300 truncate", children: f.label }),
        /* @__PURE__ */ jsx("p", { className: `text-[10px] ${f.ok ? "text-gray-600" : "text-orange-400"}`, children: f.detail })
      ] })
    ] }, f.label)) }),
    daysSince !== null && daysSince > 90 && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 px-4 py-3 rounded-xl bg-orange-500/8 border border-orange-500/20 text-orange-400 text-xs", children: [
      /* @__PURE__ */ jsx("span", { children: "⚠" }),
      /* @__PURE__ */ jsxs("span", { children: [
        "Last rotated ",
        daysSince,
        " days ago — consider rotating credentials (recommended: every 90 days)."
      ] })
    ] })
  ] });
}
function RateLimitMonitor({ session }) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  async function refresh() {
    if (!session) return;
    setLoading(true);
    try {
      const res = await getAdminRateLimitStatus({ data: { token: session.token, username: session.username, loginAt: session.loginAt } });
      if (res.ok) {
        setStatus({ attempts: res.attempts, maxAttempts: res.maxAttempts, blocked: res.blocked, remainingMs: res.remainingMs, ip: res.ip });
        setCountdown(Math.ceil(res.remainingMs / 1e3));
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    refresh();
  }, []);
  useEffect(() => {
    if (!status?.blocked) return;
    const id = setInterval(() => {
      setCountdown((p) => {
        if (p <= 1) {
          refresh();
          return 0;
        }
        return p - 1;
      });
    }, 1e3);
    return () => clearInterval(id);
  }, [status?.blocked]);
  const attemptsLeft = status ? status.maxAttempts - status.attempts : null;
  const pct = status ? status.attempts / status.maxAttempts * 100 : 0;
  return /* @__PURE__ */ jsxs(Card, { children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsx(CardHeader, { icon: "🚫", title: "Rate Limit Monitor", subtitle: "Login attempt tracking for your IP" }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: refresh,
          disabled: loading,
          className: "text-[10px] text-gray-600 hover:text-gray-400 transition-colors shrink-0 disabled:opacity-40",
          children: loading ? "…" : "↺ Refresh"
        }
      )
    ] }),
    !status ? /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-xs text-gray-600", children: [
      /* @__PURE__ */ jsx("span", { className: "w-3 h-3 border-2 border-gray-700 border-t-gray-400 rounded-full animate-spin" }),
      "Loading…"
    ] }) : /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      status.blocked ? /* @__PURE__ */ jsxs("div", { className: "p-3 rounded-xl bg-red-500/8 border border-red-500/20 space-y-1", children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs font-bold text-red-400", children: "🔒 IP Locked Out" }),
        /* @__PURE__ */ jsxs("p", { className: "text-[11px] text-red-400/70", children: [
          "Unlocks in ",
          /* @__PURE__ */ jsxs("span", { className: "font-mono font-bold", children: [
            Math.floor(countdown / 60),
            ":",
            String(countdown % 60).padStart(2, "0")
          ] })
        ] })
      ] }) : /* @__PURE__ */ jsxs("div", { className: `p-3 rounded-xl border ${status.attempts === 0 ? "bg-green-500/5 border-green-500/15" : "bg-orange-500/5 border-orange-500/15"}`, children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-2", children: [
          /* @__PURE__ */ jsx("p", { className: `text-xs font-bold ${status.attempts === 0 ? "text-green-400" : "text-orange-400"}`, children: status.attempts === 0 ? "✅ No Failed Attempts" : `⚠ ${status.attempts} Failed Attempt${status.attempts > 1 ? "s" : ""}` }),
          /* @__PURE__ */ jsxs("span", { className: `text-[10px] font-mono ${status.attempts === 0 ? "text-green-400" : "text-orange-400"}`, children: [
            attemptsLeft,
            " / ",
            status.maxAttempts,
            " remaining"
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "h-1.5 bg-white/5 rounded-full overflow-hidden", children: /* @__PURE__ */ jsx(
          "div",
          {
            className: `h-full rounded-full transition-all ${pct === 0 ? "bg-green-500" : pct < 60 ? "bg-yellow-500" : "bg-red-500"}`,
            style: { width: `${pct}%` }
          }
        ) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-2 text-[10px]", children: [
        /* @__PURE__ */ jsxs("div", { className: "p-2 rounded-lg bg-white/2 border border-white/5 space-y-0.5", children: [
          /* @__PURE__ */ jsx("p", { className: "text-gray-700 uppercase tracking-widest", children: "Attempts Used" }),
          /* @__PURE__ */ jsxs("p", { className: "font-mono font-bold text-white", children: [
            status.attempts,
            " / ",
            status.maxAttempts
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "p-2 rounded-lg bg-white/2 border border-white/5 space-y-0.5", children: [
          /* @__PURE__ */ jsx("p", { className: "text-gray-700 uppercase tracking-widest", children: "Your IP" }),
          /* @__PURE__ */ jsx("p", { className: "font-mono font-bold text-gray-300 truncate", children: status.ip ?? "—" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("p", { className: "text-[10px] text-gray-700", children: [
        "Rate limit resets automatically after ",
        status.maxAttempts,
        " failed attempts trigger a lockout. Successful logins reset the counter."
      ] })
    ] })
  ] });
}
function SecuritySettingsPanel({ session, onSaved }) {
  const [current, setCurrent] = useState(null);
  const [draft, setDraft] = useState(null);
  const [curP1, setCurP1] = useState("");
  const [curP2, setCurP2] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState(false);
  useEffect(() => {
    if (!session) return;
    getSecuritySettings({ data: { token: session.token, username: session.username, loginAt: session.loginAt } }).then((res) => {
      if (res.ok) {
        setCurrent(res.settings);
        setDraft(res.settings);
      }
    }).catch(() => {
    });
  }, []);
  async function handleSave(e) {
    e.preventDefault();
    if (!draft || !curP1 || !curP2) return;
    setSaving(true);
    setErr("");
    setOk(false);
    try {
      const res = await updateSecuritySettings({ data: { currentPassword1: curP1, currentPassword2: curP2, settings: draft } });
      if (!res.ok) {
        setErr(res.error ?? "Failed");
        return;
      }
      setCurrent(res.settings);
      setDraft(res.settings);
      setOk(true);
      setCurP1("");
      setCurP2("");
      onSaved(res.settings);
      setTimeout(() => setOk(false), 3e3);
    } catch (e2) {
      setErr(e2?.message ?? "Network error");
    } finally {
      setSaving(false);
    }
  }
  const dirty = draft && current && JSON.stringify(draft) !== JSON.stringify(current);
  return /* @__PURE__ */ jsxs(Card, { children: [
    /* @__PURE__ */ jsx(CardHeader, { icon: "⚙️", title: "Security Settings", subtitle: "Tune rate limiting and session behaviour. Both passwords required to save." }),
    !draft ? /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-600", children: "Loading settings…" }) : /* @__PURE__ */ jsxs("form", { onSubmit: handleSave, className: "space-y-5", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsx("label", { className: "text-xs font-semibold text-gray-400 uppercase tracking-widest", children: "Max Login Attempts" }),
          /* @__PURE__ */ jsx("span", { className: "font-mono text-sm font-bold text-white", children: draft.maxAttempts })
        ] }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "range",
            min: 1,
            max: 20,
            step: 1,
            value: draft.maxAttempts,
            onChange: (e) => setDraft((p) => p ? { ...p, maxAttempts: Number(e.target.value) } : p),
            className: "w-full accent-[#00BFFF] h-1.5 rounded-full cursor-pointer"
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-[10px] text-gray-700", children: [
          /* @__PURE__ */ jsx("span", { children: "1 (strict)" }),
          /* @__PURE__ */ jsx("span", { children: "5 (default)" }),
          /* @__PURE__ */ jsx("span", { children: "20 (relaxed)" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsx("label", { className: "text-xs font-semibold text-gray-400 uppercase tracking-widest", children: "Lockout Duration" }),
          /* @__PURE__ */ jsx("span", { className: "font-mono text-sm font-bold text-white", children: draft.lockoutMinutes < 60 ? `${draft.lockoutMinutes}min` : `${Math.floor(draft.lockoutMinutes / 60)}h ${draft.lockoutMinutes % 60 > 0 ? draft.lockoutMinutes % 60 + "min" : ""}` })
        ] }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "range",
            min: 1,
            max: 120,
            step: 1,
            value: draft.lockoutMinutes,
            onChange: (e) => setDraft((p) => p ? { ...p, lockoutMinutes: Number(e.target.value) } : p),
            className: "w-full accent-[#00BFFF] h-1.5 rounded-full cursor-pointer"
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-[10px] text-gray-700", children: [
          /* @__PURE__ */ jsx("span", { children: "1min" }),
          /* @__PURE__ */ jsx("span", { children: "15min" }),
          /* @__PURE__ */ jsx("span", { children: "1hr" }),
          /* @__PURE__ */ jsx("span", { children: "2hr" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsx("label", { className: "text-xs font-semibold text-gray-400 uppercase tracking-widest", children: "Session TTL" }),
          /* @__PURE__ */ jsxs("span", { className: "font-mono text-sm font-bold text-white", children: [
            draft.sessionHours,
            "h"
          ] })
        ] }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "range",
            min: 1,
            max: 168,
            step: 1,
            value: draft.sessionHours,
            onChange: (e) => setDraft((p) => p ? { ...p, sessionHours: Number(e.target.value) } : p),
            className: "w-full accent-[#00BFFF] h-1.5 rounded-full cursor-pointer"
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-[10px] text-gray-700", children: [
          /* @__PURE__ */ jsx("span", { children: "1h" }),
          /* @__PURE__ */ jsx("span", { children: "8h" }),
          /* @__PURE__ */ jsx("span", { children: "24h" }),
          /* @__PURE__ */ jsx("span", { children: "72h" }),
          /* @__PURE__ */ jsx("span", { children: "168h" })
        ] })
      ] }),
      dirty && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("div", { className: "h-px bg-white/5" }),
        /* @__PURE__ */ jsx("p", { className: "text-[11px] text-gray-600", children: "Enter current passwords to authorize settings change:" }),
        /* @__PURE__ */ jsxs("div", { className: "grid sm:grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsx(PasswordInput, { label: "Current Password 1", value: curP1, onChange: setCurP1, autoComplete: "current-password" }),
          /* @__PURE__ */ jsx(PasswordInput, { label: "Current Password 2", value: curP2, onChange: setCurP2, autoComplete: "current-password" })
        ] }),
        err && /* @__PURE__ */ jsx("p", { className: "text-xs text-red-400", children: err }),
        ok && /* @__PURE__ */ jsx("p", { className: "text-xs text-green-400", children: "✓ Settings saved" }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => setDraft(current),
              className: "flex-1 py-2 rounded-xl border border-white/10 text-gray-500 text-xs font-semibold hover:bg-white/5 transition-all",
              children: "Reset"
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              type: "submit",
              disabled: saving || !curP1 || !curP2,
              className: "flex-1 py-2 rounded-xl bg-[#00BFFF]/12 border border-[#00BFFF]/25 text-[#00BFFF] text-xs font-bold hover:bg-[#00BFFF]/20 disabled:opacity-40 transition-all flex items-center justify-center gap-2",
              children: [
                saving ? /* @__PURE__ */ jsx("span", { className: "w-3 h-3 border-2 border-[#00BFFF]/30 border-t-[#00BFFF] rounded-full animate-spin" }) : null,
                "Save Settings"
              ]
            }
          )
        ] })
      ] })
    ] })
  ] });
}
function ActivityTimeline() {
  const logs = useMemo(() => {
    try {
      return getLogs().filter((l) => l.action.startsWith("credentials") || l.action === "auth:login" || l.action === "auth:logout").slice(0, 20);
    } catch {
      return [];
    }
  }, []);
  const iconFor = (action) => {
    if (action === "credentials:update") return "🔄";
    if (action === "auth:login") return "🔓";
    if (action === "auth:logout") return "🔒";
    return "📋";
  };
  return /* @__PURE__ */ jsxs(Card, { children: [
    /* @__PURE__ */ jsx(CardHeader, { icon: "📡", title: "Activity Timeline", subtitle: "Recent credential & auth events" }),
    /* @__PURE__ */ jsx("div", { className: "space-y-2 max-h-60 overflow-y-auto pr-1", children: logs.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-center text-gray-700 text-xs py-4", children: "No events recorded yet" }) : logs.map((l, i) => /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2.5 p-2.5 rounded-xl bg-white/2 border border-white/5", children: [
      /* @__PURE__ */ jsx("span", { className: "text-sm shrink-0 mt-0.5", children: iconFor(l.action) }),
      /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold text-gray-300 truncate", children: l.action.replace("credentials:", "").replace("auth:", "") }),
        l.details && /* @__PURE__ */ jsx("p", { className: "text-[10px] text-gray-600 truncate", children: l.details }),
        /* @__PURE__ */ jsx("p", { className: "text-[10px] text-gray-700 mt-0.5", children: timeAgo$1(l.timestamp) })
      ] })
    ] }, i)) })
  ] });
}
function AdminNotes() {
  const [notes, setNotes] = useState(() => loadNotes());
  const [saved, setSaved] = useState(false);
  const [editing, setEditing] = useState(false);
  function handleSave() {
    saveNotes(notes);
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 2e3);
  }
  function handleClear() {
    setNotes("");
    saveNotes("");
  }
  return /* @__PURE__ */ jsxs(Card, { children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsx(CardHeader, { icon: "📝", title: "Admin Notes", subtitle: "Private notes about this account (stored locally)" }),
      saved && /* @__PURE__ */ jsx("span", { className: "text-[10px] text-green-400 shrink-0", children: "✓ Saved" })
    ] }),
    editing ? /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsx(
        "textarea",
        {
          value: notes,
          onChange: (e) => setNotes(e.target.value),
          rows: 5,
          placeholder: "e.g. Password manager entry: BlueTiers_Admin\nLast rotated: [date]\nEmergency contact: ...",
          className: "w-full bg-white/3 border border-white/8 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-700 focus:outline-none focus:border-[#00BFFF]/40 transition-all resize-none font-mono leading-relaxed"
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => setEditing(false),
            className: "flex-1 py-2 rounded-xl border border-white/10 text-gray-500 text-xs font-semibold hover:bg-white/5 transition-all",
            children: "Cancel"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: handleClear,
            className: "py-2 px-3 rounded-xl border border-red-500/20 text-red-500/60 text-xs hover:text-red-400 hover:border-red-500/30 transition-all",
            children: "Clear"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: handleSave,
            className: "flex-1 py-2 rounded-xl bg-[#00BFFF]/12 border border-[#00BFFF]/25 text-[#00BFFF] text-xs font-bold hover:bg-[#00BFFF]/20 transition-all",
            children: "Save"
          }
        )
      ] })
    ] }) : /* @__PURE__ */ jsx(
      "div",
      {
        onClick: () => setEditing(true),
        className: "min-h-[60px] p-3 rounded-xl bg-white/2 border border-dashed border-white/8 cursor-text hover:border-white/15 transition-all",
        children: notes ? /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-400 whitespace-pre-wrap font-mono leading-relaxed", children: notes }) : /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-700 italic", children: "Click to add notes…" })
      }
    ),
    /* @__PURE__ */ jsx("p", { className: "text-[10px] text-gray-700", children: "Notes are stored in your browser's localStorage — not sent to the server." })
  ] });
}
function PasswordComparison({ p1, p2 }) {
  if (!p1 && !p2) return null;
  const s1 = measureStrength(p1);
  const s2 = measureStrength(p2);
  const e1 = calcEntropy(p1);
  const e2 = calcEntropy(p2);
  const same = p1 === p2;
  const shortLen = Math.min(p1.length, p2.length);
  let commonPfx = 0;
  for (let i = 0; i < shortLen; i++) {
    if (p1[i] === p2[i]) commonPfx++;
    else break;
  }
  const similarityPct = shortLen > 0 ? Math.floor(commonPfx / shortLen * 100) : 0;
  const tooPct = similarityPct >= 50 && shortLen >= 4;
  return /* @__PURE__ */ jsxs("div", { className: "p-4 rounded-2xl border border-white/6 bg-white/2 space-y-3", children: [
    /* @__PURE__ */ jsx("p", { className: "text-[10px] font-bold text-gray-500 uppercase tracking-widest", children: "Password Comparison" }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-3", children: [
      { label: "Password 1", pw: p1, s: s1, e: e1, color: "border-purple-500/30 bg-purple-500/4" },
      { label: "Password 2", pw: p2, s: s2, e: e2, color: "border-green-500/30 bg-green-500/4" }
    ].map((col) => /* @__PURE__ */ jsxs("div", { className: `rounded-xl border p-3 space-y-2 ${col.color}`, children: [
      /* @__PURE__ */ jsx("p", { className: "text-[10px] font-bold text-gray-400", children: col.label }),
      /* @__PURE__ */ jsx("div", { className: "flex gap-1 h-1.5", children: [1, 2, 3, 4].map((i) => /* @__PURE__ */ jsx("div", { className: `flex-1 rounded-full ${i <= col.s.score ? col.s.color : "bg-white/10"}` }, i)) }),
      /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-[10px]", children: [
        /* @__PURE__ */ jsx("span", { className: "font-semibold text-gray-400", children: col.pw ? col.s.label : "—" }),
        /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: col.e > 0 ? `${col.e} bits` : "—" })
      ] }),
      /* @__PURE__ */ jsxs("p", { className: "text-[10px] text-gray-600", children: [
        col.pw.length,
        " chars · ",
        estimateCrackTime(col.e)
      ] })
    ] }, col.label)) }),
    same && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/8 border border-red-500/20 text-red-400 text-[11px]", children: [
      /* @__PURE__ */ jsx("span", { children: "✕" }),
      " Passwords 1 and 2 are identical — they must be different."
    ] }),
    !same && tooPct && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 px-3 py-2 rounded-lg bg-orange-500/8 border border-orange-500/20 text-orange-400 text-[11px]", children: [
      /* @__PURE__ */ jsx("span", { children: "⚠" }),
      " Passwords share a ",
      similarityPct,
      "% common prefix — consider making them more distinct."
    ] }),
    !same && !tooPct && p1 && p2 && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/6 border border-green-500/15 text-green-400 text-[11px]", children: [
      /* @__PURE__ */ jsx("span", { children: "✓" }),
      " Passwords are distinct."
    ] })
  ] });
}
function SessionTimer({ loginAt, sessionHours }) {
  const [remaining, setRemaining] = useState(0);
  const TTL = sessionHours * 60 * 60 * 1e3;
  useEffect(() => {
    function tick() {
      setRemaining(Math.max(0, loginAt + TTL - Date.now()));
    }
    tick();
    const id = setInterval(tick, 1e3);
    return () => clearInterval(id);
  }, [loginAt, TTL]);
  const h = Math.floor(remaining / 36e5);
  const m = Math.floor(remaining % 36e5 / 6e4);
  const s = Math.floor(remaining % 6e4 / 1e3);
  const pct = Math.min(100, remaining / TTL * 100);
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
      timeAgo$1(loginAt),
      ". Session TTL: ",
      sessionHours,
      "h."
    ] })
  ] });
}
function SecurityPolicy({ settings }) {
  const rules = [
    { icon: "🔐", label: "Dual-password system", desc: "Two separate passwords required to log in — both must match." },
    { icon: "🔑", label: "scrypt hashing", desc: "All passwords stored as scrypt hashes (salt + 64-byte key). Never plaintext." },
    { icon: "🛡️", label: "HMAC-SHA256 sessions", desc: "Session tokens are signed with SESSION_SECRET. Tampering is detected on every page load." },
    { icon: "⏱️", label: `${settings?.sessionHours ?? 8}-hour session TTL`, desc: `Sessions expire automatically. Re-authentication required after ${settings?.sessionHours ?? 8} hours.` },
    { icon: "🚫", label: `Rate limiting: ${settings?.maxAttempts ?? 5} attempts / ${settings?.lockoutMinutes ?? 15}min`, desc: `${settings?.maxAttempts ?? 5} failed login attempts trigger a ${settings?.lockoutMinutes ?? 15}-minute IP lockout.` },
    { icon: "⚡", label: "Constant-time compare", desc: "All credential comparisons use timingSafeEqual to prevent timing attacks." },
    { icon: "📏", label: "Password minimums", desc: "Each password must be ≥ 8 characters. Passwords 1 & 2 must differ from each other." },
    { icon: "🔄", label: "Auto hash upgrade", desc: "Plaintext passwords are automatically upgraded to scrypt on first login." },
    { icon: "🕐", label: "Session revocation", desc: "Credential changes bump sessionInvalidBefore in admin.yml, rejecting all prior sessions server-side." }
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
  const [settings, setSettings] = useState(null);
  const [history, setHistory] = useState([]);
  const [tab, setTab] = useState("full-rotation");
  const [busy, setBusy] = useState(false);
  const [confirm2, setConfirm] = useState(null);
  const [showPolicy, setShowPolicy] = useState(false);
  const [showHistory, setShowHistory] = useState(true);
  const [showDanger, setShowDanger] = useState(false);
  const [frCurP1, setFrCurP1] = useState("");
  const [frCurP2, setFrCurP2] = useState("");
  const [frNewUser, setFrNewUser] = useState("");
  const [frNewP1, setFrNewP1] = useState("");
  const [frNewP1c, setFrNewP1c] = useState("");
  const [frNewP2, setFrNewP2] = useState("");
  const [frNewP2c, setFrNewP2c] = useState("");
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
  const [genP1, setGenP1] = useState("");
  const [genP2, setGenP2] = useState("");
  const p1Score = useMemo(() => measureStrength(genP1 || p1New || frNewP1).score, [genP1, p1New, frNewP1]);
  const p2Score = useMemo(() => measureStrength(genP2 || p2New || frNewP2).score, [genP2, p2New, frNewP2]);
  const grade = useMemo(() => calcGrade({ p1Score, p2Score, p1Hashed, p2Hashed, daysSince: history.length > 0 ? Math.floor((Date.now() - history[0].ts) / 864e5) : null, histLen: history.length }), [p1Score, p2Score, p1Hashed, p2Hashed, history]);
  useEffect(() => {
    setHistory(loadHistory());
    if (!session) {
      setLoadingInfo(false);
      return;
    }
    const auth = { token: session.token, username: session.username, loginAt: session.loginAt };
    Promise.all([
      getAdminInfo({ data: auth }),
      getSecuritySettings({ data: auth })
    ]).then(([info, sett]) => {
      if (info.ok) {
        setServerUsername(info.username);
        setP1Hashed(info.password1Hashed);
        setP2Hashed(info.password2Hashed);
      }
      if (sett.ok) setSettings(sett.settings);
    }).catch(() => {
    }).finally(() => setLoadingInfo(false));
  }, []);
  function prepareCall(payload, logLabel) {
    if (busy) return;
    const changes = [];
    if (payload.newUsername) changes.push(`Username → ${payload.newUsername}`);
    if (payload.newPassword1) changes.push("Password 1 updated");
    if (payload.newPassword2) changes.push("Password 2 updated");
    setConfirm({
      title: `Apply ${logLabel} Change`,
      changes,
      onConfirm: () => executeCall(payload, logLabel)
    });
  }
  async function executeCall(payload, logLabel) {
    setConfirm(null);
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
    if (frNewP1 && frNewP2 && frNewP1 === frNewP2) {
      push("Password 1 and 2 must differ", "error");
      return;
    }
    const pl = { currentPassword1: frCurP1, currentPassword2: frCurP2 };
    if (frNewUser.trim()) pl.newUsername = frNewUser.trim();
    if (frNewP1) pl.newPassword1 = frNewP1;
    if (frNewP2) pl.newPassword2 = frNewP2;
    if (!pl.newUsername && !pl.newPassword1 && !pl.newPassword2) {
      push("Fill at least one new field", "warning");
      return;
    }
    prepareCall(pl, "Credentials");
  }
  function handleChangeUsername(e) {
    e.preventDefault();
    if (!uNewUsername.trim()) {
      push("Enter a new username", "warning");
      return;
    }
    if (uNewUsername.trim().length < 3) {
      push("Username must be ≥ 3 characters", "error");
      return;
    }
    if (!uCurP1 || !uCurP2) {
      push("Enter both current passwords to confirm", "warning");
      return;
    }
    prepareCall({ currentPassword1: uCurP1, currentPassword2: uCurP2, newUsername: uNewUsername.trim() }, "Username");
  }
  function handleChangeP1(e) {
    e.preventDefault();
    if (!p1New) {
      push("Enter a new password", "warning");
      return;
    }
    if (p1New !== p1Confirm) {
      push("Passwords do not match", "error");
      return;
    }
    if (p1New.length < 8) {
      push("Password must be ≥ 8 characters", "error");
      return;
    }
    prepareCall({ currentPassword1: p1CurP1, currentPassword2: p1CurP2, newPassword1: p1New }, "Password 1");
  }
  function handleChangeP2(e) {
    e.preventDefault();
    if (!p2New) {
      push("Enter a new password", "warning");
      return;
    }
    if (p2New !== p2Confirm) {
      push("Passwords do not match", "error");
      return;
    }
    if (p2New.length < 8) {
      push("Password must be ≥ 8 characters", "error");
      return;
    }
    prepareCall({ currentPassword1: p2CurP1, currentPassword2: p2CurP2, newPassword2: p2New }, "Password 2");
  }
  function handleInsertP1(pw) {
    setGenP1(pw);
    setFrNewP1(pw);
    setFrNewP1c(pw);
    setP1New(pw);
    setP1Confirm(pw);
    push("Inserted into Password 1 fields", "info");
    setTab("full-rotation");
  }
  function handleInsertP2(pw) {
    setGenP2(pw);
    setFrNewP2(pw);
    setFrNewP2c(pw);
    setP2New(pw);
    setP2Confirm(pw);
    push("Inserted into Password 2 fields", "info");
    setTab("full-rotation");
  }
  const TABS2 = [
    { id: "full-rotation", label: "Full Rotation", icon: "🔄" },
    { id: "username", label: "Username", icon: "👤" },
    { id: "password1", label: "Password 1", icon: "🔑" },
    { id: "password2", label: "Password 2", icon: "🗝️" },
    { id: "generator", label: "Generator", icon: "✨" },
    { id: "security", label: "Security", icon: "🛡️" }
  ];
  const sessionHours = settings?.sessionHours ?? 8;
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6 max-w-6xl mx-auto", children: [
    /* @__PURE__ */ jsx(Toast, { toasts, remove }),
    confirm2 && /* @__PURE__ */ jsx(ConfirmModal, { state: confirm2, onConfirm: confirm2.onConfirm, onCancel: () => setConfirm(null) }),
    /* @__PURE__ */ jsxs("div", { className: "relative overflow-hidden rounded-2xl border border-[#00BFFF]/15 bg-gradient-to-br from-[#00BFFF]/6 via-transparent to-blue-900/10 p-6", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 pointer-events-none", children: [...Array(10)].map((_, i) => /* @__PURE__ */ jsx(
        "div",
        {
          className: "absolute w-px bg-gradient-to-b from-transparent via-[#00BFFF]/10 to-transparent",
          style: { left: `${8 + i * 9}%`, height: "100%", top: 0, opacity: 0.3 + i % 3 * 0.2 }
        },
        i
      )) }),
      /* @__PURE__ */ jsxs("div", { className: "relative flex items-center gap-4 flex-wrap", children: [
        /* @__PURE__ */ jsx("div", { className: "w-14 h-14 rounded-2xl bg-[#00BFFF]/10 border border-[#00BFFF]/25 flex items-center justify-center text-2xl shadow-[0_0_30px_rgba(0,191,255,0.12)]", children: "🔐" }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsx("h2", { className: "font-['Space_Grotesk'] font-black text-white text-xl tracking-tight", children: "Admin Credentials" }),
          /* @__PURE__ */ jsx("p", { className: "text-gray-500 text-xs mt-0.5", children: "Manage username, dual-password auth, rate limits, and session settings" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 shrink-0", children: [
          /* @__PURE__ */ jsxs("div", { className: `flex flex-col items-center px-4 py-2 rounded-xl border ${grade.bg}`, children: [
            /* @__PURE__ */ jsx("span", { className: `text-2xl font-black font-['Space_Grotesk'] ${grade.color}`, children: grade.grade }),
            /* @__PURE__ */ jsx("span", { className: `text-[10px] font-bold ${grade.color}`, children: grade.label })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex flex-col items-end gap-1.5", children: loadingInfo ? /* @__PURE__ */ jsx("div", { className: "w-24 h-6 rounded bg-white/5 animate-pulse" }) : /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx("span", { className: "px-3 py-1 rounded-full bg-[#00BFFF]/10 border border-[#00BFFF]/20 text-[#00BFFF] text-xs font-bold", children: serverUsername }),
            /* @__PURE__ */ jsx("span", { className: `px-2 py-0.5 rounded-full text-[10px] font-semibold border ${p1Hashed && p2Hashed ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-orange-500/10 border-orange-500/20 text-orange-400"}`, children: p1Hashed && p2Hashed ? "🔒 scrypt" : "⚠ Upgrade needed" })
          ] }) })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "relative grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-white/5", children: [
        { label: "Auth Mode", value: "Dual Password", icon: "🔑" },
        { label: "Hash Algorithm", value: "scrypt (64-byte)", icon: "🧮" },
        { label: "Session TTL", value: settings ? `${settings.sessionHours}h` : "8h", icon: "⏱️" },
        { label: "Rate Limit", value: settings ? `${settings.maxAttempts} att / ${settings.lockoutMinutes}min` : "5 / 15min", icon: "🚫" }
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
        /* @__PURE__ */ jsx("div", { className: "flex gap-1 p-1.5 bg-white/3 rounded-xl border border-white/6 flex-wrap sm:flex-nowrap overflow-x-auto", children: TABS2.map((t) => /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setTab(t.id),
            className: `flex-1 min-w-fit flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-[11px] font-semibold transition-all duration-200 whitespace-nowrap ${tab === t.id ? "bg-[#00BFFF]/15 border border-[#00BFFF]/25 text-[#00BFFF] shadow-sm" : "text-gray-600 hover:text-gray-400 border border-transparent"}`,
            children: [
              /* @__PURE__ */ jsx("span", { children: t.icon }),
              /* @__PURE__ */ jsx("span", { children: t.label })
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
              subtitle: "Change username and/or both passwords in one operation. Leave any new field blank to keep it unchanged.",
              badge: /* @__PURE__ */ jsx("span", { className: "px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#00BFFF]/10 border border-[#00BFFF]/20 text-[#00BFFF]", children: "Recommended" })
            }
          ),
          /* @__PURE__ */ jsxs("form", { onSubmit: handleFullRotation, className: "space-y-5", children: [
            /* @__PURE__ */ jsxs("div", { className: "p-4 rounded-xl bg-white/2 border border-white/6 space-y-3", children: [
              /* @__PURE__ */ jsxs("p", { className: "text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsx("span", { className: "w-4 h-px bg-gray-700 inline-block" }),
                " Verify Identity ",
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
                " New Values (leave blank to keep current) ",
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
                    className: "w-full bg-white/3 border border-white/8 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-[#00BFFF]/40 transition-all"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "grid sm:grid-cols-2 gap-3", children: [
                /* @__PURE__ */ jsx(PasswordInput, { label: "New Password 1", value: frNewP1, onChange: setFrNewP1, placeholder: "Leave blank to keep", showStrength: true, showEntropy: true, autoComplete: "new-password" }),
                /* @__PURE__ */ jsx(PasswordInput, { label: "Confirm Password 1", value: frNewP1c, onChange: setFrNewP1c, placeholder: "Repeat new password 1", autoComplete: "new-password" })
              ] }),
              frNewP1 && frNewP1c && frNewP1 !== frNewP1c && /* @__PURE__ */ jsx("p", { className: "text-xs text-red-400 -mt-2", children: "Passwords don't match" }),
              /* @__PURE__ */ jsxs("div", { className: "grid sm:grid-cols-2 gap-3", children: [
                /* @__PURE__ */ jsx(PasswordInput, { label: "New Password 2", value: frNewP2, onChange: setFrNewP2, placeholder: "Leave blank to keep", showStrength: true, showEntropy: true, autoComplete: "new-password" }),
                /* @__PURE__ */ jsx(PasswordInput, { label: "Confirm Password 2", value: frNewP2c, onChange: setFrNewP2c, placeholder: "Repeat new password 2", autoComplete: "new-password" })
              ] }),
              frNewP2 && frNewP2c && frNewP2 !== frNewP2c && /* @__PURE__ */ jsx("p", { className: "text-xs text-red-400 -mt-2", children: "Passwords don't match" }),
              frNewP1 && frNewP2 && frNewP1 === frNewP2 && /* @__PURE__ */ jsxs("div", { className: "px-4 py-3 rounded-xl bg-orange-500/8 border border-orange-500/20 text-orange-400 text-xs flex items-center gap-2", children: [
                /* @__PURE__ */ jsx("span", { children: "⚠" }),
                " Password 1 and Password 2 must be different."
              ] })
            ] }),
            (frNewP1 || frNewP2) && /* @__PURE__ */ jsx(PasswordComparison, { p1: frNewP1, p2: frNewP2 }),
            /* @__PURE__ */ jsxs(
              "button",
              {
                type: "submit",
                disabled: busy,
                className: "w-full py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-[#00BFFF] to-[#0066FF] text-white hover:from-[#00BFFF]/90 hover:to-[#0066FF]/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-[0_0_20px_rgba(0,191,255,0.25)] hover:shadow-[0_0_30px_rgba(0,191,255,0.35)] flex items-center justify-center gap-2",
                children: [
                  busy ? /* @__PURE__ */ jsx("span", { className: "w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" }) : "🔄",
                  busy ? "Updating…" : "Apply Credential Rotation"
                ]
              }
            )
          ] })
        ] }),
        tab === "username" && /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsx(CardHeader, { icon: "👤", title: "Change Username", subtitle: "Update the administrator login name. Both current passwords required." }),
          /* @__PURE__ */ jsxs("form", { onSubmit: handleChangeUsername, className: "space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 p-3 rounded-xl bg-white/2 border border-white/5", children: [
              /* @__PURE__ */ jsx("span", { className: "text-sm", children: "👤" }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "text-[10px] text-gray-600 uppercase tracking-widest", children: "Current Username" }),
                /* @__PURE__ */ jsx("p", { className: "text-sm font-mono font-bold text-white", children: serverUsername })
              ] })
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
                  className: "w-full bg-white/3 border border-white/8 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-[#00BFFF]/40 transition-all"
                }
              ),
              uNewUsername && uNewUsername.length < 3 && /* @__PURE__ */ jsx("p", { className: "text-[11px] text-red-400", children: "Must be ≥ 3 characters" }),
              uNewUsername && uNewUsername === serverUsername && /* @__PURE__ */ jsx("p", { className: "text-[11px] text-orange-400", children: "Same as current username" })
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
                className: "w-full py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-[#00BFFF] to-[#0066FF] text-white hover:opacity-90 disabled:opacity-40 transition-all shadow-[0_0_20px_rgba(0,191,255,0.2)] flex items-center justify-center gap-2",
                children: [
                  busy ? /* @__PURE__ */ jsx("span", { className: "w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" }) : "👤",
                  busy ? "Updating…" : "Update Username"
                ]
              }
            )
          ] })
        ] }),
        tab === "password1" && /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsx(CardHeader, { icon: "🔑", title: "Change Password 1", subtitle: "Primary login password. Both current passwords required to authorize." }),
          /* @__PURE__ */ jsxs("form", { onSubmit: handleChangeP1, className: "space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "p-3 rounded-xl bg-white/2 border border-white/5 space-y-3", children: [
              /* @__PURE__ */ jsx("p", { className: "text-[10px] text-gray-600 uppercase tracking-widest font-bold", children: "Verify identity" }),
              /* @__PURE__ */ jsxs("div", { className: "grid sm:grid-cols-2 gap-3", children: [
                /* @__PURE__ */ jsx(PasswordInput, { label: "Current Password 1", value: p1CurP1, onChange: setP1CurP1, autoComplete: "current-password" }),
                /* @__PURE__ */ jsx(PasswordInput, { label: "Current Password 2", value: p1CurP2, onChange: setP1CurP2, autoComplete: "current-password" })
              ] })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "h-px bg-white/5" }),
            /* @__PURE__ */ jsx(PasswordInput, { label: "New Password 1", value: p1New, onChange: setP1New, showStrength: true, showEntropy: true, autoComplete: "new-password" }),
            /* @__PURE__ */ jsx(PasswordInput, { label: "Confirm New Password 1", value: p1Confirm, onChange: setP1Confirm, autoComplete: "new-password" }),
            p1New && p1Confirm && p1New !== p1Confirm && /* @__PURE__ */ jsx("p", { className: "text-xs text-red-400", children: "Passwords don't match" }),
            genP1 && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 px-3 py-2 rounded-lg bg-[#00BFFF]/6 border border-[#00BFFF]/15 text-[#00BFFF] text-[11px]", children: [
              /* @__PURE__ */ jsx("span", { children: "✨" }),
              " A generated password has been pre-filled. Use the Generator tab to create more."
            ] }),
            /* @__PURE__ */ jsxs(
              "button",
              {
                type: "submit",
                disabled: busy,
                className: "w-full py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-[#00BFFF] to-[#0066FF] text-white hover:opacity-90 disabled:opacity-40 transition-all shadow-[0_0_20px_rgba(0,191,255,0.2)] flex items-center justify-center gap-2",
                children: [
                  busy ? /* @__PURE__ */ jsx("span", { className: "w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" }) : "🔑",
                  busy ? "Updating…" : "Update Password 1"
                ]
              }
            )
          ] })
        ] }),
        tab === "password2" && /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsx(CardHeader, { icon: "🗝️", title: "Change Password 2", subtitle: "Secondary login password. Both current passwords required to authorize." }),
          /* @__PURE__ */ jsxs("form", { onSubmit: handleChangeP2, className: "space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "p-3 rounded-xl bg-white/2 border border-white/5 space-y-3", children: [
              /* @__PURE__ */ jsx("p", { className: "text-[10px] text-gray-600 uppercase tracking-widest font-bold", children: "Verify identity" }),
              /* @__PURE__ */ jsxs("div", { className: "grid sm:grid-cols-2 gap-3", children: [
                /* @__PURE__ */ jsx(PasswordInput, { label: "Current Password 1", value: p2CurP1, onChange: setP2CurP1, autoComplete: "current-password" }),
                /* @__PURE__ */ jsx(PasswordInput, { label: "Current Password 2", value: p2CurP2, onChange: setP2CurP2, autoComplete: "current-password" })
              ] })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "h-px bg-white/5" }),
            /* @__PURE__ */ jsx(PasswordInput, { label: "New Password 2", value: p2New, onChange: setP2New, showStrength: true, showEntropy: true, autoComplete: "new-password" }),
            /* @__PURE__ */ jsx(PasswordInput, { label: "Confirm New Password 2", value: p2Confirm, onChange: setP2Confirm, autoComplete: "new-password" }),
            p2New && p2Confirm && p2New !== p2Confirm && /* @__PURE__ */ jsx("p", { className: "text-xs text-red-400", children: "Passwords don't match" }),
            genP2 && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 px-3 py-2 rounded-lg bg-[#00BFFF]/6 border border-[#00BFFF]/15 text-[#00BFFF] text-[11px]", children: [
              /* @__PURE__ */ jsx("span", { children: "✨" }),
              " A generated password has been pre-filled. Use the Generator tab to create more."
            ] }),
            /* @__PURE__ */ jsxs(
              "button",
              {
                type: "submit",
                disabled: busy,
                className: "w-full py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-[#00BFFF] to-[#0066FF] text-white hover:opacity-90 disabled:opacity-40 transition-all shadow-[0_0_20px_rgba(0,191,255,0.2)] flex items-center justify-center gap-2",
                children: [
                  busy ? /* @__PURE__ */ jsx("span", { className: "w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" }) : "🗝️",
                  busy ? "Updating…" : "Update Password 2"
                ]
              }
            )
          ] })
        ] }),
        tab === "generator" && /* @__PURE__ */ jsx(PasswordGenerator, { onInsertP1: handleInsertP1, onInsertP2: handleInsertP2 }),
        tab === "security" && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(
            SecurityGradeCard,
            {
              p1Score,
              p2Score,
              p1Hashed,
              p2Hashed,
              history
            }
          ),
          /* @__PURE__ */ jsx(RateLimitMonitor, { session }),
          /* @__PURE__ */ jsx(SecuritySettingsPanel, { session, onSaved: (s) => setSettings(s) })
        ] }),
        /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsx(CardHeader, { icon: "✅", title: "Security Checklist", subtitle: "Quick health check for your current credential configuration." }),
          /* @__PURE__ */ jsx("div", { className: "grid sm:grid-cols-2 gap-2", children: [
            { ok: p1Hashed, label: "Password 1 is hashed", detail: p1Hashed ? "scrypt (64-byte)" : "Plaintext — log in to upgrade" },
            { ok: p2Hashed, label: "Password 2 is hashed", detail: p2Hashed ? "scrypt (64-byte)" : "Plaintext — log in to upgrade" },
            { ok: true, label: "Dual-password auth", detail: "Both passwords required on login" },
            { ok: true, label: "HMAC-signed sessions", detail: "SESSION_SECRET env var in use" },
            { ok: history.length > 0, label: "Rotation history exists", detail: history.length > 0 ? `${history.length} rotation(s)` : "No changes recorded yet" },
            { ok: !!session, label: "Active session", detail: session ? `Logged in as ${session.username}` : "No session" },
            { ok: (settings?.maxAttempts ?? 5) <= 10, label: "Rate limit active", detail: settings ? `${settings.maxAttempts} attempts max` : "5 attempts max" },
            { ok: history.length === 0 || Date.now() - history[0].ts < 90 * 864e5, label: "Recent rotation", detail: history.length > 0 ? `Last: ${timeAgo$1(history[0].ts)}` : "Never rotated" }
          ].map((item) => /* @__PURE__ */ jsxs("div", { className: `flex items-center gap-3 p-3 rounded-xl border ${item.ok ? "bg-green-500/5 border-green-500/15" : "bg-orange-500/5 border-orange-500/15"}`, children: [
            /* @__PURE__ */ jsx("span", { className: "text-base shrink-0", children: item.ok ? "✅" : "⚠️" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold text-gray-300", children: item.label }),
              /* @__PURE__ */ jsx("p", { className: `text-[11px] ${item.ok ? "text-gray-600" : "text-orange-400"}`, children: item.detail })
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
                  /* @__PURE__ */ jsx("p", { className: "text-[11px] text-gray-600", children: "Session invalidation, emergency context, and raw session info" })
                ] }),
                /* @__PURE__ */ jsx("span", { className: `text-gray-600 text-sm transition-transform ${showDanger ? "rotate-90" : ""}`, children: "›" })
              ]
            }
          ),
          showDanger && /* @__PURE__ */ jsxs("div", { className: "px-6 pb-6 space-y-4 border-t border-red-500/10 pt-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "p-4 rounded-xl bg-white/2 border border-white/5 space-y-3", children: [
              /* @__PURE__ */ jsx("p", { className: "text-xs font-bold text-gray-400", children: "Session Revocation" }),
              /* @__PURE__ */ jsxs("p", { className: "text-[11px] text-gray-600 leading-relaxed", children: [
                "Every credential change — username or either password — bumps a",
                " ",
                /* @__PURE__ */ jsx("span", { className: "text-gray-400 font-mono", children: "sessionInvalidBefore" }),
                " timestamp written to",
                " ",
                /* @__PURE__ */ jsx("span", { className: "text-gray-400 font-mono", children: "admin.yml" }),
                ". The server checks this on every page load: any session token issued before that timestamp is rejected, regardless of whether its HMAC signature is still valid. This ensures password rotations revoke all existing sessions server-side immediately."
              ] }),
              /* @__PURE__ */ jsx("p", { className: "text-[11px] text-gray-600 leading-relaxed", children: "After a successful update this page signs you out automatically. Log in with the new credentials to continue." }),
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
                ] }),
                /* @__PURE__ */ jsxs("p", { children: [
                  "Session TTL: ",
                  /* @__PURE__ */ jsxs("span", { className: "text-gray-300", children: [
                    sessionHours,
                    "h"
                  ] })
                ] })
              ] }),
              session && /* @__PURE__ */ jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsx(ClipboardBtn, { text: `username: ${session.username}
loginAt: ${new Date(session.loginAt).toISOString()}
token: ${session.token.slice(0, 16)}...`, label: "Copy session info" }) })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-5", children: [
        session && /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsx(CardHeader, { icon: "⏱️", title: "Active Session", subtitle: "Current session countdown" }),
          /* @__PURE__ */ jsx(SessionTimer, { loginAt: session.loginAt, sessionHours })
        ] }),
        /* @__PURE__ */ jsx(AdminNotes, {}),
        /* @__PURE__ */ jsx(ActivityTimeline, {}),
        /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsx(CardHeader, { icon: "📜", title: "Rotation History", subtitle: "Last 30 credential changes" }),
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
                timeAgo$1(h.ts),
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
          showPolicy && /* @__PURE__ */ jsx(SecurityPolicy, { settings })
        ] }),
        /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsx(CardHeader, { icon: "💡", title: "Best Practices", subtitle: "Recommendations for keeping your account secure" }),
          /* @__PURE__ */ jsx("div", { className: "space-y-2.5", children: [
            { tip: "Rotate credentials every 90 days", severity: "info" },
            { tip: "Use a password manager to store complex passwords", severity: "info" },
            { tip: "Make Password 1 and Password 2 completely different", severity: "warning" },
            { tip: "Never share admin credentials", severity: "warning" },
            { tip: "Use 16+ character passwords for maximum security", severity: "info" },
            { tip: "Sign out when using shared machines", severity: "warning" },
            { tip: "After rotating, verify login before closing the tab", severity: "warning" },
            { tip: "Use the Generator tab to create strong passwords", severity: "info" },
            { tip: "Keep rotation history to track changes over time", severity: "info" }
          ].map((b, i) => /* @__PURE__ */ jsxs("div", { className: `flex items-start gap-2 text-[11px] leading-relaxed ${b.severity === "warning" ? "text-orange-400" : "text-gray-500"}`, children: [
            /* @__PURE__ */ jsx("span", { className: "shrink-0 mt-0.5", children: b.severity === "warning" ? "⚠" : "•" }),
            b.tip
          ] }, i)) })
        ] }),
        /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsx(CardHeader, { icon: "🧬", title: "Credential Anatomy", subtitle: "What each credential field does" }),
          /* @__PURE__ */ jsx("div", { className: "space-y-3", children: [
            { field: "Username", desc: "The login name. Stored in admin.yml. Changing it bumps sessionInvalidBefore, revoking all sessions.", color: "border-l-[#00BFFF]" },
            { field: "Password 1", desc: "Primary authentication factor. Stored as salted scrypt hash. Required on every login.", color: "border-l-purple-400" },
            { field: "Password 2", desc: "Secondary authentication factor. Must differ from Password 1. Both must pass to authenticate.", color: "border-l-green-400" },
            { field: "sessionInvalidBefore", desc: "Timestamp written on every credential change. Server rejects all sessions issued before this value.", color: "border-l-orange-400" }
          ].map((c) => /* @__PURE__ */ jsxs("div", { className: `pl-3 border-l-2 ${c.color}`, children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs font-bold text-gray-300 font-mono", children: c.field }),
            /* @__PURE__ */ jsx("p", { className: "text-[11px] text-gray-600 leading-relaxed", children: c.desc })
          ] }, c.field)) })
        ] })
      ] })
    ] })
  ] });
}
const TTABS = [
  { id: "overview", label: "Command Center", icon: "⚡" },
  { id: "manage", label: "Tournaments", icon: "🏆" },
  { id: "registration", label: "Registration", icon: "📋", badge: (_, a) => a ? a.teams.filter((t) => t.status === "pending").length || null : null },
  { id: "teams", label: "Teams", icon: "👥", badge: (_, a) => a ? a.teams.length || null : null },
  { id: "bracket", label: "Bracket", icon: "⚔️" },
  { id: "matches", label: "Matches", icon: "🎮", badge: (_, a) => a ? a.matches.filter((m) => m.status === "live").length || null : null },
  { id: "prizes", label: "Prizes", icon: "🎁" },
  { id: "rules", label: "Rules", icon: "📜" },
  { id: "announcements", label: "Announcements", icon: "📣" }
];
function TournamentManager({ admin }) {
  const [tab, setTab] = useState("overview");
  const [data, setData] = useState(null);
  const [loading, setLoad] = useState(true);
  const [toast, setToast] = useState(null);
  async function load() {
    try {
      setData(await getTournamentData());
    } catch {
    } finally {
      setLoad(false);
    }
  }
  useEffect(() => {
    load();
  }, []);
  function flash(text, ok = true) {
    setToast({ text, ok });
    setTimeout(() => setToast(null), 4e3);
  }
  const active = data?.activeTournamentId ? data.tournaments.find((t) => t.id === data.activeTournamentId) ?? null : null;
  if (loading) return /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center py-40", children: /* @__PURE__ */ jsxs("div", { className: "text-center space-y-4", children: [
    /* @__PURE__ */ jsx("div", { className: "w-16 h-16 border-4 border-amber-500/30 border-t-amber-400 rounded-full animate-spin mx-auto" }),
    /* @__PURE__ */ jsx("p", { className: "text-gray-500 text-sm", children: "Loading Tournament System…" })
  ] }) });
  return /* @__PURE__ */ jsxs("div", { className: "space-y-0", children: [
    toast && /* @__PURE__ */ jsxs("div", { className: `fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border text-sm font-semibold backdrop-blur-sm transition-all animate-in slide-in-from-top-2 ${toast.ok ? "bg-green-500/15 border-green-500/25 text-green-300" : "bg-red-500/15 border-red-500/25 text-red-300"}`, children: [
      /* @__PURE__ */ jsx("span", { children: toast.ok ? "✓" : "✕" }),
      toast.text
    ] }),
    /* @__PURE__ */ jsx(TournamentHeader, { active, data, flash, reload: load }),
    /* @__PURE__ */ jsx("div", { className: "flex gap-1 flex-wrap mt-6 mb-5 bg-[#0a0e18] border border-white/5 rounded-2xl p-1.5", children: TTABS.map((t) => {
      const badge = t.badge?.(data, active);
      return /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => setTab(t.id),
          className: `relative flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex-1 justify-center ${tab === t.id ? "bg-gradient-to-b from-amber-500/20 to-amber-600/10 text-amber-300 border border-amber-500/25 shadow-lg shadow-amber-500/5" : "text-gray-600 hover:text-gray-300 hover:bg-white/4 border border-transparent"}`,
          children: [
            /* @__PURE__ */ jsx("span", { className: "text-base leading-none", children: t.icon }),
            /* @__PURE__ */ jsx("span", { className: "hidden sm:inline", children: t.label }),
            badge != null && badge > 0 && /* @__PURE__ */ jsx("span", { className: "absolute -top-1.5 -right-1.5 w-4.5 h-4.5 rounded-full bg-amber-500 text-black text-[9px] font-black flex items-center justify-center min-w-[18px] px-1", children: badge })
          ]
        },
        t.id
      );
    }) }),
    /* @__PURE__ */ jsxs("div", { className: "min-h-[500px]", children: [
      tab === "overview" && /* @__PURE__ */ jsx(TOverview, { data, active, setTab, flash, reload: load }),
      tab === "manage" && /* @__PURE__ */ jsx(TTournaments, { data, active, flash, reload: load }),
      tab === "registration" && /* @__PURE__ */ jsx(TRegistration, { active, flash, reload: load }),
      tab === "teams" && /* @__PURE__ */ jsx(TTeams, { active, flash, reload: load }),
      tab === "bracket" && /* @__PURE__ */ jsx(TBracket, { active, flash, reload: load }),
      tab === "matches" && /* @__PURE__ */ jsx(TMatches, { active, flash, reload: load }),
      tab === "prizes" && /* @__PURE__ */ jsx(TPrizes, { active, flash, reload: load }),
      tab === "rules" && /* @__PURE__ */ jsx(TRules, { active, flash, reload: load }),
      tab === "announcements" && /* @__PURE__ */ jsx(TAnnouncements, { active, admin, flash, reload: load })
    ] })
  ] });
}
function TournamentHeader({ active, data, flash, reload }) {
  const [toggling, setToggling] = useState(false);
  async function quickToggleReg() {
    if (!active) return;
    setToggling(true);
    try {
      const newStatus = active.status === "registration_open" ? "registration_closed" : "registration_open";
      await updateTournament({ data: { ...active, status: newStatus } });
      flash(`Registration ${newStatus === "registration_open" ? "opened" : "closed"}`, true);
      reload();
    } catch {
      flash("Failed to toggle registration", false);
    } finally {
      setToggling(false);
    }
  }
  const regOpen = active?.status === "registration_open";
  return /* @__PURE__ */ jsxs("div", { className: "relative overflow-hidden rounded-2xl border border-amber-500/15 bg-gradient-to-br from-[#0d1117] via-[#0d1117] to-[#0f0c03]", children: [
    /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-r from-amber-500/3 via-transparent to-amber-600/3 pointer-events-none" }),
    /* @__PURE__ */ jsx("div", { className: "absolute top-0 left-0 w-64 h-32 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" }),
    /* @__PURE__ */ jsxs("div", { className: "relative px-6 py-5 flex items-center gap-5", children: [
      /* @__PURE__ */ jsx("div", { className: "w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-700/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-500/10", children: /* @__PURE__ */ jsx("span", { className: "text-2xl", children: "🏆" }) }),
      /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-0.5", children: [
          /* @__PURE__ */ jsx("p", { className: "text-[10px] uppercase tracking-[0.15em] text-amber-500/70 font-bold", children: "Tournament Control Center" }),
          active && /* @__PURE__ */ jsx(StatusPill, { status: active.status })
        ] }),
        /* @__PURE__ */ jsx("h2", { className: "font-['Space_Grotesk'] font-black text-xl text-white truncate", children: active?.name ?? "No Active Tournament" }),
        active && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 mt-1 text-xs text-gray-500", children: [
          active.gamemode && /* @__PURE__ */ jsxs("span", { children: [
            "⚔️ ",
            active.gamemode
          ] }),
          active.serverIp && /* @__PURE__ */ jsxs("span", { children: [
            "🖥 ",
            active.serverIp
          ] }),
          active.teams.length > 0 && /* @__PURE__ */ jsxs("span", { children: [
            "👥 ",
            active.teams.filter((t) => t.status === "approved").length,
            " / ",
            active.teams.length,
            " teams"
          ] }),
          data && /* @__PURE__ */ jsx("span", { className: "text-gray-700", children: "·" }),
          data && /* @__PURE__ */ jsxs("span", { children: [
            data.tournaments.length,
            " total tournament(s)"
          ] })
        ] })
      ] }),
      active && (active.status === "registration_open" || active.status === "registration_closed" || active.status === "upcoming" || active.status === "live") && /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: quickToggleReg,
          disabled: toggling,
          className: `flex-shrink-0 flex items-center gap-3 px-5 py-3 rounded-xl border font-bold text-sm transition-all disabled:opacity-60 ${regOpen ? "bg-red-500/10 border-red-500/25 text-red-300 hover:bg-red-500/20" : "bg-green-500/10 border-green-500/25 text-green-300 hover:bg-green-500/20"}`,
          children: [
            /* @__PURE__ */ jsx("span", { className: `w-2.5 h-2.5 rounded-full flex-shrink-0 ${regOpen ? "bg-red-400 animate-pulse" : "bg-green-400"}` }),
            toggling ? "Updating…" : regOpen ? "Close Registration" : "Open Registration"
          ]
        }
      )
    ] })
  ] });
}
function TOverview({ data, active, setTab, flash, reload }) {
  const all = data?.tournaments ?? [];
  const approved = active?.teams.filter((t) => t.status === "approved") ?? [];
  const pending = active?.teams.filter((t) => t.status === "pending") ?? [];
  const totalPlayers = approved.reduce((n, t) => n + t.players.length, 0);
  const liveMatches = active?.matches.filter((m) => m.status === "live") ?? [];
  const completedM = active?.matches.filter((m) => m.status === "completed").length ?? 0;
  const totalM = active?.matches.filter((m) => m.status !== "bye").length ?? 0;
  const progress = totalM > 0 ? Math.round(completedM / totalM * 100) : 0;
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    active && /* @__PURE__ */ jsx(StatusWorkflow, { tournament: active, flash, reload }),
    !active && /* @__PURE__ */ jsxs("div", { className: "relative overflow-hidden rounded-2xl border border-white/5 bg-[#0a0e18] p-10 text-center", children: [
      /* @__PURE__ */ jsx("div", { className: "text-6xl mb-4 opacity-20", children: "🏆" }),
      /* @__PURE__ */ jsx("p", { className: "text-white font-bold text-lg mb-2", children: "No Active Tournament" }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-500 text-sm mb-5", children: "Create a tournament and set it as active to get started." }),
      /* @__PURE__ */ jsx("button", { onClick: () => setTab("manage"), className: "px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold text-sm hover:from-amber-400 hover:to-amber-500 transition-all shadow-lg shadow-amber-500/20", children: "Create Tournament →" })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [
      { label: "Total Tournaments", value: all.length, icon: "🏆", sub: `${all.filter((t) => t.status === "completed" || t.status === "archived").length} completed`, color: "amber" },
      { label: "Approved Teams", value: approved.length, icon: "✅", sub: `${totalPlayers} players total`, color: "green" },
      { label: "Pending Review", value: pending.length, icon: "⏳", sub: pending.length > 0 ? "Needs attention" : "All clear", color: pending.length > 0 ? "yellow" : "gray", onClick: () => pending.length > 0 && setTab("registration") },
      { label: "Live Matches", value: liveMatches.length, icon: "🔴", sub: `${completedM}/${totalM} completed`, color: liveMatches.length > 0 ? "red" : "gray" }
    ].map((c) => /* @__PURE__ */ jsxs(
      "div",
      {
        onClick: c.onClick,
        className: `relative overflow-hidden bg-[#0a0e18] border rounded-2xl p-5 transition-all ${c.onClick ? "cursor-pointer hover:scale-[1.02]" : ""} ${c.color === "amber" ? "border-amber-500/15" : c.color === "green" ? "border-green-500/15" : c.color === "yellow" ? "border-yellow-500/25 shadow-lg shadow-yellow-500/5" : c.color === "red" ? "border-red-500/25 shadow-lg shadow-red-500/5" : "border-white/5"}`,
        children: [
          /* @__PURE__ */ jsx("div", { className: "text-2xl mb-3", children: c.icon }),
          /* @__PURE__ */ jsx("div", { className: "font-['Space_Grotesk'] font-black text-3xl text-white mb-0.5", children: c.value }),
          /* @__PURE__ */ jsx("div", { className: "text-gray-500 text-xs font-semibold", children: c.label }),
          /* @__PURE__ */ jsx("div", { className: "text-gray-700 text-[10px] mt-0.5", children: c.sub })
        ]
      },
      c.label
    )) }),
    active && totalM > 0 && /* @__PURE__ */ jsxs("div", { className: "bg-[#0a0e18] border border-white/5 rounded-2xl p-5 space-y-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsx("p", { className: "text-white font-bold text-sm", children: "Tournament Progress" }),
        /* @__PURE__ */ jsxs("p", { className: "text-amber-400 font-black text-lg", children: [
          progress,
          "%"
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "h-2 bg-white/5 rounded-full overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: "h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-700", style: { width: `${progress}%` } }) }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-6 text-xs text-gray-500", children: [
        /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsx("span", { className: "w-2 h-2 rounded-full bg-green-400" }),
          "Completed: ",
          completedM
        ] }),
        /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsx("span", { className: "w-2 h-2 rounded-full bg-red-400 animate-pulse" }),
          "Live: ",
          liveMatches.length
        ] }),
        /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsx("span", { className: "w-2 h-2 rounded-full bg-gray-600" }),
          "Remaining: ",
          totalM - completedM - liveMatches.length
        ] })
      ] })
    ] }),
    liveMatches.length > 0 && active && /* @__PURE__ */ jsxs("div", { className: "bg-[#0a0e18] border border-red-500/20 rounded-2xl p-5 space-y-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("span", { className: "w-2 h-2 rounded-full bg-red-400 animate-pulse" }),
        /* @__PURE__ */ jsx("p", { className: "text-red-400 text-xs font-bold uppercase tracking-wider", children: "Live Right Now" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "grid gap-2", children: liveMatches.slice(0, 4).map((m) => {
        const t1 = active.teams.find((t) => t.id === m.team1Id);
        const t2 = active.teams.find((t) => t.id === m.team2Id);
        return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 bg-red-500/5 border border-red-500/10 rounded-xl px-4 py-3", children: [
          /* @__PURE__ */ jsxs("span", { className: "text-xs text-gray-500 font-bold w-6", children: [
            "M",
            m.matchNumber
          ] }),
          /* @__PURE__ */ jsx("span", { className: "text-white text-sm font-semibold flex-1 truncate", children: t1?.name ?? "TBD" }),
          /* @__PURE__ */ jsxs("span", { className: "text-amber-400 font-black text-sm", children: [
            m.score1,
            " — ",
            m.score2
          ] }),
          /* @__PURE__ */ jsx("span", { className: "text-white text-sm font-semibold flex-1 truncate text-right", children: t2?.name ?? "TBD" })
        ] }, m.id);
      }) })
    ] }),
    pending.length > 0 && active && /* @__PURE__ */ jsxs("div", { className: "bg-[#0a0e18] border border-yellow-500/20 rounded-2xl p-5 space-y-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-yellow-400", children: "⚠️" }),
          /* @__PURE__ */ jsxs("p", { className: "text-yellow-400 text-xs font-bold uppercase tracking-wider", children: [
            pending.length,
            " Team(s) Awaiting Review"
          ] })
        ] }),
        /* @__PURE__ */ jsx("button", { onClick: () => setTab("registration"), className: "text-xs text-amber-400 hover:text-amber-300 font-semibold", children: "Review All →" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2", children: [
        pending.slice(0, 8).map((t) => /* @__PURE__ */ jsx("span", { className: "text-white text-xs bg-white/5 border border-white/8 px-3 py-1.5 rounded-lg", children: t.name }, t.id)),
        pending.length > 8 && /* @__PURE__ */ jsxs("span", { className: "text-gray-500 text-xs px-3 py-1.5", children: [
          "+",
          pending.length - 8,
          " more"
        ] })
      ] })
    ] }),
    active && active.announcements.length > 0 && /* @__PURE__ */ jsxs("div", { className: "bg-[#0a0e18] border border-white/5 rounded-2xl p-5 space-y-3", children: [
      /* @__PURE__ */ jsx("p", { className: "text-white font-bold text-sm", children: "Recent Announcements" }),
      /* @__PURE__ */ jsx("div", { className: "space-y-2", children: active.announcements.slice(0, 3).map((ann) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 px-4 py-3 rounded-xl bg-white/3 border border-white/5", children: [
        /* @__PURE__ */ jsx("span", { children: { info: "ℹ️", warning: "⚠️", success: "✅" }[ann.type] }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsx("p", { className: "text-white text-sm font-semibold truncate", children: ann.title }),
          /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-[10px]", children: timeAgo(ann.createdAt) })
        ] })
      ] }, ann.id)) })
    ] })
  ] });
}
function StatusWorkflow({ tournament, flash, reload }) {
  const [loading, setLoading] = useState(false);
  const steps = [
    { status: "upcoming", label: "Upcoming", icon: "📅" },
    { status: "registration_open", label: "Registration", icon: "📋" },
    { status: "registration_closed", label: "Reg. Closed", icon: "🔒" },
    { status: "live", label: "Live", icon: "🔴" },
    { status: "completed", label: "Completed", icon: "🏁" }
  ];
  const ORDER = ["upcoming", "registration_open", "registration_closed", "live", "completed", "archived"];
  const currentIdx = ORDER.indexOf(tournament.status);
  async function goTo(status) {
    setLoading(true);
    try {
      await updateTournament({ data: { ...tournament, status } });
      flash(`Status → ${STATUS_LABEL[status]}`);
      reload();
    } catch {
      flash("Update failed", false);
    } finally {
      setLoading(false);
    }
  }
  return /* @__PURE__ */ jsxs("div", { className: "bg-[#0a0e18] border border-white/5 rounded-2xl p-5 space-y-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsx("p", { className: "text-white font-bold text-sm", children: "Tournament Status Flow" }),
      /* @__PURE__ */ jsx(StatusPill, { status: tournament.status })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex items-center gap-1 overflow-x-auto pb-1", children: steps.map((step, i) => {
      const stepIdx = ORDER.indexOf(step.status);
      const done = stepIdx < currentIdx;
      const active = step.status === tournament.status;
      const reachable = !loading;
      return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 flex-shrink-0", children: [
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => reachable && goTo(step.status),
            disabled: loading || active,
            className: `flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all ${active ? "bg-amber-500/20 border-amber-500/40 text-amber-300 shadow-lg shadow-amber-500/10" : done ? "bg-green-500/10 border-green-500/20 text-green-400 hover:bg-green-500/15" : "bg-white/3 border-white/8 text-gray-500 hover:text-white hover:border-white/20 disabled:opacity-40"}`,
            children: [
              /* @__PURE__ */ jsx("span", { children: step.icon }),
              /* @__PURE__ */ jsx("span", { className: "hidden sm:inline", children: step.label }),
              done && /* @__PURE__ */ jsx("span", { className: "text-green-400", children: "✓" })
            ]
          }
        ),
        i < steps.length - 1 && /* @__PURE__ */ jsx("span", { className: "text-gray-700 text-xs px-0.5", children: "→" })
      ] }, step.status);
    }) })
  ] });
}
function TRegistration({ active, flash, reload }) {
  const [toggling, setToggling] = useState(false);
  const [deadline, setDeadline] = useState("");
  const [savingDL, setSavingDL] = useState(false);
  const [showAddTeam, setShowAddTeam] = useState(false);
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1e3);
    return () => clearInterval(t);
  }, []);
  if (!active) return /* @__PURE__ */ jsx(NoActiveTournament, {});
  const regOpen = active.status === "registration_open";
  const pending = active.teams.filter((t) => t.status === "pending");
  const approved = active.teams.filter((t) => t.status === "approved");
  const rejected = active.teams.filter((t) => t.status === "rejected");
  const totalReg = active.teams.length;
  const deadline_ = active.registrationDeadline;
  const deadlineMs = deadline_ ? deadline_ - now : null;
  const isExpired = deadlineMs != null && deadlineMs <= 0;
  async function toggleRegistration() {
    setToggling(true);
    try {
      const newStatus = regOpen ? "registration_closed" : "registration_open";
      await updateTournament({ data: { ...active, status: newStatus } });
      flash(`Registration ${newStatus === "registration_open" ? "opened ✓" : "closed"}`, true);
      reload();
    } catch {
      flash("Failed to update registration", false);
    } finally {
      setToggling(false);
    }
  }
  async function saveDeadline() {
    setSavingDL(true);
    try {
      const dl = deadline ? new Date(deadline).getTime() : null;
      await updateTournament({ data: { ...active, registrationDeadline: dl } });
      flash("Deadline saved");
      reload();
    } catch {
      flash("Error", false);
    } finally {
      setSavingDL(false);
    }
  }
  async function approveAll() {
    if (pending.length === 0) return;
    if (!confirm(`Approve all ${pending.length} pending team(s)?`)) return;
    await bulkUpdateTeamStatus({ data: { tournamentId: active.id, teamIds: pending.map((t) => t.id), status: "approved", notes: "" } });
    flash(`${pending.length} teams approved`);
    reload();
  }
  async function rejectAll() {
    if (pending.length === 0) return;
    if (!confirm(`Reject all ${pending.length} pending team(s)?`)) return;
    await bulkUpdateTeamStatus({ data: { tournamentId: active.id, teamIds: pending.map((t) => t.id), status: "rejected", notes: "" } });
    flash(`${pending.length} teams rejected`);
    reload();
  }
  function fmtCountdown2(ms) {
    if (ms <= 0) return "Expired";
    const s = Math.floor(ms / 1e3);
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    const d = Math.floor(h / 24);
    if (d > 0) return `${d}d ${h % 24}h`;
    if (h > 0) return `${h}h ${m % 60}m`;
    if (m > 0) return `${m}m ${s % 60}s`;
    return `${s}s`;
  }
  function toDatetimeLocal(ts) {
    if (!ts) return "";
    return new Date(ts - (/* @__PURE__ */ new Date()).getTimezoneOffset() * 6e4).toISOString().slice(0, 16);
  }
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: `relative overflow-hidden rounded-2xl border p-8 text-center transition-all ${regOpen ? "border-green-500/30 bg-gradient-to-b from-green-500/8 to-transparent" : "border-white/8 bg-[#0a0e18]"}`, children: [
      regOpen && /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-r from-green-500/3 via-transparent to-green-500/3 pointer-events-none" }),
      /* @__PURE__ */ jsxs("div", { className: "relative space-y-4", children: [
        /* @__PURE__ */ jsx("div", { className: `w-20 h-20 rounded-full border-4 flex items-center justify-center mx-auto text-3xl transition-all ${regOpen ? "border-green-400/50 bg-green-500/10 shadow-lg shadow-green-500/20" : "border-white/10 bg-white/3"}`, children: regOpen ? "📋" : "🔒" }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("p", { className: `font-['Space_Grotesk'] font-black text-2xl ${regOpen ? "text-green-300" : "text-gray-400"}`, children: [
            "Registration is ",
            regOpen ? "OPEN" : "CLOSED"
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-gray-500 text-sm mt-1", children: regOpen ? "Teams can register on the public tournament page." : "Teams cannot register right now." })
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: toggleRegistration,
            disabled: toggling,
            className: `inline-flex items-center gap-3 px-10 py-4 rounded-2xl font-bold text-base transition-all disabled:opacity-60 shadow-xl ${regOpen ? "bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-500 hover:to-red-600 shadow-red-500/20" : "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-400 hover:to-green-500 shadow-green-500/20"}`,
            children: toggling ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx("span", { className: "w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" }),
              " Updating…"
            ] }) : regOpen ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx("span", { children: "🔒" }),
              " Close Registration"
            ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx("span", { children: "📋" }),
              " Open Registration"
            ] })
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3", children: [
      { label: "Total Registered", value: totalReg, color: "text-white", bg: "bg-white/3 border-white/8" },
      { label: "Pending Review", value: pending.length, color: "text-yellow-300", bg: pending.length > 0 ? "bg-yellow-500/5 border-yellow-500/20" : "bg-white/3 border-white/8" },
      { label: "Approved", value: approved.length, color: "text-green-300", bg: "bg-green-500/5 border-green-500/15" },
      { label: "Rejected", value: rejected.length, color: "text-red-300", bg: rejected.length > 0 ? "bg-red-500/5 border-red-500/15" : "bg-white/3 border-white/8" }
    ].map((s) => /* @__PURE__ */ jsxs("div", { className: `${s.bg} border rounded-xl p-4 text-center`, children: [
      /* @__PURE__ */ jsx("div", { className: `font-black text-2xl ${s.color}`, children: s.value }),
      /* @__PURE__ */ jsx("div", { className: "text-gray-500 text-xs mt-0.5", children: s.label })
    ] }, s.label)) }),
    /* @__PURE__ */ jsxs("div", { className: "bg-[#0a0e18] border border-white/5 rounded-2xl p-5 space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between flex-wrap gap-3", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-white font-bold text-sm", children: "Registration Deadline" }),
          /* @__PURE__ */ jsx("p", { className: "text-gray-500 text-xs mt-0.5", children: "Set when registration automatically closes" })
        ] }),
        deadline_ && /* @__PURE__ */ jsxs("div", { className: `flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-bold ${isExpired ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-amber-500/10 border-amber-500/20 text-amber-300"}`, children: [
          "⏱ ",
          isExpired ? "Expired" : fmtCountdown2(deadlineMs)
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-3 items-end flex-wrap", children: [
        /* @__PURE__ */ jsx("div", { className: "flex-1 min-w-40", children: /* @__PURE__ */ jsx(
          "input",
          {
            type: "datetime-local",
            defaultValue: toDatetimeLocal(deadline_),
            onChange: (e) => setDeadline(e.target.value),
            className: "w-full bg-[#070b12] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500/40"
          }
        ) }),
        /* @__PURE__ */ jsx("button", { onClick: saveDeadline, disabled: savingDL, className: "px-5 py-2.5 rounded-xl bg-amber-500/15 border border-amber-500/25 text-amber-300 text-xs font-bold hover:bg-amber-500/25 transition-all disabled:opacity-50", children: savingDL ? "Saving…" : "Set Deadline" }),
        deadline_ && /* @__PURE__ */ jsx("button", { onClick: async () => {
          await updateTournament({ data: { ...active, registrationDeadline: null } });
          flash("Deadline cleared");
          reload();
        }, className: "px-5 py-2.5 rounded-xl border border-white/8 text-gray-500 text-xs font-bold hover:text-red-400 transition-all", children: "Clear" })
      ] })
    ] }),
    pending.length > 0 && /* @__PURE__ */ jsxs("div", { className: "bg-[#0a0e18] border border-yellow-500/15 rounded-2xl p-5 space-y-4", children: [
      /* @__PURE__ */ jsxs("p", { className: "text-yellow-300 font-bold text-sm", children: [
        "⚡ Bulk Actions — ",
        pending.length,
        " pending team(s)"
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-3 flex-wrap", children: [
        /* @__PURE__ */ jsxs("button", { onClick: approveAll, className: "px-5 py-2.5 rounded-xl bg-green-500/15 border border-green-500/25 text-green-300 text-xs font-bold hover:bg-green-500/25 transition-all", children: [
          "✓ Approve All ",
          pending.length
        ] }),
        /* @__PURE__ */ jsxs("button", { onClick: rejectAll, className: "px-5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold hover:bg-red-500/15 transition-all", children: [
          "✕ Reject All ",
          pending.length
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "grid gap-2", children: pending.map((team) => /* @__PURE__ */ jsx(PendingTeamRow, { team, tournamentId: active.id, requireCaptain: active.requireCaptain !== false, flash, reload }, team.id)) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-[#0a0e18] border border-white/5 rounded-2xl overflow-hidden", children: [
      /* @__PURE__ */ jsxs("button", { onClick: () => setShowAddTeam(!showAddTeam), className: "w-full px-5 py-4 flex items-center gap-3 hover:bg-white/2 transition-colors", children: [
        /* @__PURE__ */ jsx("span", { className: "text-amber-400 text-lg", children: "➕" }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 text-left", children: [
          /* @__PURE__ */ jsx("p", { className: "text-white font-bold text-sm", children: "Manually Add Team" }),
          /* @__PURE__ */ jsx("p", { className: "text-gray-500 text-xs", children: "Admin bypass — add a team regardless of registration status" })
        ] }),
        /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: showAddTeam ? "▲" : "▼" })
      ] }),
      showAddTeam && /* @__PURE__ */ jsx("div", { className: "border-t border-white/5 px-5 pb-5 pt-4", children: /* @__PURE__ */ jsx(AddTeamForm, { tournamentId: active.id, requireCaptain: active.requireCaptain !== false, flash, reload, onDone: () => setShowAddTeam(false) }) })
    ] })
  ] });
}
function PendingTeamRow({ team, tournamentId, requireCaptain, flash, reload }) {
  const [acting, setActing] = useState(false);
  async function act(status) {
    setActing(true);
    try {
      await updateTeamStatus({ data: { tournamentId, teamId: team.id, status, notes: "" } });
      flash(`${team.name} ${status}`);
      reload();
    } finally {
      setActing(false);
    }
  }
  return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 bg-yellow-500/3 border border-yellow-500/10 rounded-xl px-4 py-3", children: [
    requireCaptain && team.captain && /* @__PURE__ */ jsx("img", { src: `https://mc-heads.net/avatar/${team.captain}/32`, className: "w-8 h-8 rounded-lg flex-shrink-0", alt: "", onError: (e) => e.target.style.display = "none" }),
    /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
      /* @__PURE__ */ jsx("p", { className: "text-white font-semibold text-sm", children: team.name }),
      /* @__PURE__ */ jsxs("p", { className: "text-gray-500 text-xs", children: [
        requireCaptain && team.captain ? `Captain: ${team.captain} · ` : "",
        team.players.length,
        " player(s) · ",
        timeAgo(team.registeredAt)
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex gap-2 flex-shrink-0", children: [
      /* @__PURE__ */ jsx("button", { onClick: () => act("approved"), disabled: acting, className: "px-3 py-1.5 rounded-lg bg-green-500/15 border border-green-500/20 text-green-300 text-[10px] font-bold hover:bg-green-500/25 transition-all disabled:opacity-50", children: "Approve" }),
      /* @__PURE__ */ jsx("button", { onClick: () => act("rejected"), disabled: acting, className: "px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/15 text-red-400 text-[10px] font-bold hover:bg-red-500/15 transition-all disabled:opacity-50", children: "Reject" })
    ] })
  ] });
}
function AddTeamForm({ tournamentId, requireCaptain, flash, reload, onDone }) {
  const [name, setName] = useState("");
  const [captain, setCaptain] = useState("");
  const [players2, setPlayers] = useState([""]);
  const [status, setStatus] = useState("approved");
  const [saving, setSaving] = useState(false);
  async function save() {
    if (!name.trim()) return flash("Team name is required", false);
    if (requireCaptain && !captain.trim()) return flash("Captain name is required", false);
    setSaving(true);
    try {
      const res = await addTeamManually({ data: { tournamentId, teamName: name.trim(), captain: captain.trim(), players: players2.map((p) => p.trim()).filter(Boolean), status, notes: "Added by admin" } });
      if (res.success) {
        flash(`Team "${name}" added`);
        setName("");
        setCaptain("");
        setPlayers([""]);
        reload();
        onDone();
      } else flash(res.error ?? "Error", false);
    } finally {
      setSaving(false);
    }
  }
  return /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxs("div", { className: `grid gap-3 ${requireCaptain ? "md:grid-cols-3" : "md:grid-cols-2"}`, children: [
      /* @__PURE__ */ jsx(GField, { label: "Team Name", value: name, onChange: setName, placeholder: "e.g. Blue Dynasty" }),
      requireCaptain && /* @__PURE__ */ jsx(GField, { label: "Captain", value: captain, onChange: setCaptain, placeholder: "Minecraft username" }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-[10px] uppercase tracking-wider text-gray-500 mb-1.5 font-semibold", children: "Status" }),
        /* @__PURE__ */ jsxs("select", { value: status, onChange: (e) => setStatus(e.target.value), className: "w-full bg-[#070b12] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500/40", children: [
          /* @__PURE__ */ jsx("option", { value: "approved", children: "Approved" }),
          /* @__PURE__ */ jsx("option", { value: "pending", children: "Pending" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("label", { className: "block text-[10px] uppercase tracking-wider text-gray-500 mb-1.5 font-semibold", children: "Additional Players" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        players2.map((p, i) => /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("input", { value: p, onChange: (e) => setPlayers((ps) => ps.map((v, j) => j === i ? e.target.value : v)), placeholder: `Player ${i + 2}`, className: "flex-1 bg-[#070b12] border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500/40 placeholder-gray-700" }),
          /* @__PURE__ */ jsx("button", { onClick: () => setPlayers((ps) => ps.filter((_, j) => j !== i)), className: "px-2 text-gray-600 hover:text-red-400 transition-colors", children: "✕" })
        ] }, i)),
        /* @__PURE__ */ jsx("button", { onClick: () => setPlayers((p) => [...p, ""]), className: "text-xs text-amber-400 hover:text-amber-300", children: "+ Add Player" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
      /* @__PURE__ */ jsx("button", { onClick: save, disabled: saving, className: "px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold text-xs hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 transition-all shadow-lg shadow-amber-500/20", children: saving ? "Adding…" : "➕ Add Team" }),
      /* @__PURE__ */ jsx("button", { onClick: onDone, className: "px-6 py-2.5 rounded-xl border border-white/8 text-gray-500 text-xs font-bold hover:text-white transition-all", children: "Cancel" })
    ] })
  ] });
}
function TTournaments({ data, active, flash, reload }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const PER_PAGE = 8;
  const all = data?.tournaments ?? [];
  const sorted = [...all].sort((a, b) => b.createdAt - a.createdAt);
  const paged = sorted.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const pages = Math.ceil(all.length / PER_PAGE);
  async function save() {
    if (editing === false) return;
    if (!editing.name?.trim()) return flash("Tournament name is required", false);
    setSaving(true);
    try {
      if ("id" in editing && editing.id) {
        await updateTournament({ data: editing });
        flash("Tournament updated");
      } else {
        await createTournament({ data: editing });
        flash("Tournament created ✓");
      }
      setEditing(false);
      reload();
    } catch {
      flash("Error saving", false);
    } finally {
      setSaving(false);
    }
  }
  async function doDelete(id) {
    if (!confirm("Delete this tournament? This cannot be undone.")) return;
    await deleteTournament({ data: { id } });
    flash("Deleted");
    reload();
  }
  async function setActive(id) {
    await setActiveTournament({ data: { id } });
    flash(id ? "Set as active ✓" : "Active cleared");
    reload();
  }
  async function doArchive(id) {
    await archiveTournament({ data: { id } });
    flash("Archived");
    reload();
  }
  async function doDuplicate(id) {
    await duplicateTournament({ data: { id } });
    flash("Duplicated ✓");
    reload();
  }
  if (editing !== false) {
    return /* @__PURE__ */ jsx(TournamentForm, { editing, setEditing, save, saving });
  }
  return /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("p", { className: "text-gray-500 text-sm", children: [
        all.length,
        " tournament(s)"
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setEditing({ name: "", description: "", banner: "", status: "upcoming", gamemode: "", serverIp: "", maxTeamSize: 2, minTeamSize: 2, requireCaptain: true, registrationDeadline: null, startDate: null, prizePool: "" }),
          className: "flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold text-xs hover:from-amber-400 hover:to-amber-500 transition-all shadow-lg shadow-amber-500/15",
          children: "+ New Tournament"
        }
      )
    ] }),
    all.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "text-center py-20 text-gray-600", children: [
      /* @__PURE__ */ jsx("div", { className: "text-5xl mb-4 opacity-20", children: "🏆" }),
      /* @__PURE__ */ jsx("p", { children: "No tournaments yet. Create your first one!" })
    ] }) : /* @__PURE__ */ jsx("div", { className: "space-y-3", children: paged.map((t) => /* @__PURE__ */ jsxs("div", { className: `bg-[#0a0e18] border rounded-2xl p-5 transition-all hover:border-white/10 ${active?.id === t.id ? "border-amber-500/25 shadow-lg shadow-amber-500/5" : "border-white/5"}`, children: [
      t.banner && /* @__PURE__ */ jsx("div", { className: "h-12 rounded-xl overflow-hidden mb-4 -mx-1", children: /* @__PURE__ */ jsx("img", { src: t.banner, className: "w-full h-full object-cover", alt: "", onError: (e) => e.target.parentElement.style.display = "none" }) }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 flex-wrap mb-1.5", children: [
            /* @__PURE__ */ jsx("p", { className: "text-white font-bold", children: t.name }),
            active?.id === t.id && /* @__PURE__ */ jsx("span", { className: "text-[9px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold uppercase border border-amber-500/30", children: "Active" }),
            /* @__PURE__ */ jsx(StatusPill, { status: t.status })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-4 text-xs text-gray-600", children: [
            t.gamemode && /* @__PURE__ */ jsxs("span", { children: [
              "⚔️ ",
              t.gamemode
            ] }),
            /* @__PURE__ */ jsxs("span", { children: [
              "👥 ",
              t.teams.filter((tm) => tm.status === "approved").length,
              " teams"
            ] }),
            /* @__PURE__ */ jsxs("span", { children: [
              "🎮 ",
              t.matches.filter((m) => m.status === "completed").length,
              "/",
              t.matches.filter((m) => m.status !== "bye").length,
              " matches"
            ] }),
            /* @__PURE__ */ jsx("span", { className: "text-gray-700", children: new Date(t.createdAt).toLocaleDateString() })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1.5 flex-shrink-0 items-end", children: [
          t.status === "upcoming" && /* @__PURE__ */ jsx(QBtn, { label: "Open Reg.", onClick: async () => {
            await updateTournament({ data: { ...t, status: "registration_open" } });
            flash("Registration opened");
            reload();
          }, color: "green" }),
          t.status === "registration_open" && /* @__PURE__ */ jsx(QBtn, { label: "Close Reg.", onClick: async () => {
            await updateTournament({ data: { ...t, status: "registration_closed" } });
            flash("Registration closed");
            reload();
          }, color: "yellow" }),
          t.status === "registration_closed" && /* @__PURE__ */ jsx(QBtn, { label: "Go Live", onClick: async () => {
            await updateTournament({ data: { ...t, status: "live" } });
            flash("Tournament is LIVE");
            reload();
          }, color: "red" }),
          t.status === "live" && /* @__PURE__ */ jsx(QBtn, { label: "Complete", onClick: async () => {
            await updateTournament({ data: { ...t, status: "completed" } });
            flash("Completed");
            reload();
          }, color: "gray" }),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-1.5 flex-wrap justify-end", children: [
            /* @__PURE__ */ jsx(QBtn, { label: active?.id === t.id ? "Deactivate" : "Set Active", onClick: () => setActive(active?.id === t.id ? null : t.id), color: "blue" }),
            /* @__PURE__ */ jsx(QBtn, { label: "Edit", onClick: () => setEditing(t), color: "gray" }),
            /* @__PURE__ */ jsx(QBtn, { label: "Dup.", onClick: () => doDuplicate(t.id), color: "gray" }),
            t.status !== "archived" && /* @__PURE__ */ jsx(QBtn, { label: "Archive", onClick: () => doArchive(t.id), color: "yellow" }),
            /* @__PURE__ */ jsx(QBtn, { label: "Delete", onClick: () => doDelete(t.id), color: "red" })
          ] })
        ] })
      ] })
    ] }, t.id)) }),
    pages > 1 && /* @__PURE__ */ jsx(AdminPaginator, { page, totalPages: pages, totalItems: all.length, pageSize: PER_PAGE, onPageChange: setPage })
  ] });
}
function TournamentForm({ editing, setEditing, save, saving }) {
  const set = (k, v) => setEditing({ ...editing, [k]: v });
  const toL = (ts) => ts ? new Date(ts - (/* @__PURE__ */ new Date()).getTimezoneOffset() * 6e4).toISOString().slice(0, 16) : "";
  const frL = (s) => s ? new Date(s).getTime() : null;
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsx("button", { onClick: () => setEditing(false), className: "text-gray-500 hover:text-white text-sm", children: "← Back" }),
      /* @__PURE__ */ jsx("h3", { className: "font-['Space_Grotesk'] font-bold text-white text-lg", children: "id" in editing && editing.id ? "Edit Tournament" : "New Tournament" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid md:grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsx(GField, { label: "Tournament Name *", value: editing.name ?? "", onChange: (v) => set("name", v), placeholder: "e.g. Blue Network PvP World Cup" }),
      /* @__PURE__ */ jsx(GField, { label: "Gamemode", value: editing.gamemode ?? "", onChange: (v) => set("gamemode", v), placeholder: "e.g. Crystal PvP" }),
      /* @__PURE__ */ jsx(GField, { label: "Server IP", value: editing.serverIp ?? "", onChange: (v) => set("serverIp", v), placeholder: "play.example.com" }),
      /* @__PURE__ */ jsx(GField, { label: "Prize Pool", value: editing.prizePool ?? "", onChange: (v) => set("prizePool", v), placeholder: "e.g. 50,000 BlueCoins" }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-[10px] uppercase tracking-wider text-gray-500 mb-1.5 font-semibold", children: "Status" }),
        /* @__PURE__ */ jsx("select", { value: editing.status ?? "upcoming", onChange: (e) => set("status", e.target.value), className: "w-full bg-[#070b12] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500/40", children: ["upcoming", "registration_open", "registration_closed", "live", "completed", "archived"].map((s) => /* @__PURE__ */ jsx("option", { value: s, children: STATUS_LABEL[s] }, s)) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-[10px] uppercase tracking-wider text-gray-500 mb-1.5 font-semibold", children: "Min Team Size" }),
          /* @__PURE__ */ jsx("input", { type: "number", min: 1, max: 50, value: editing.minTeamSize ?? 2, onChange: (e) => set("minTeamSize", +e.target.value), className: "w-full bg-[#070b12] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500/40" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-[10px] uppercase tracking-wider text-gray-500 mb-1.5 font-semibold", children: "Max Team Size" }),
          /* @__PURE__ */ jsx("input", { type: "number", min: 1, max: 50, value: editing.maxTeamSize ?? 2, onChange: (e) => set("maxTeamSize", +e.target.value), className: "w-full bg-[#070b12] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500/40" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-[10px] uppercase tracking-wider text-gray-500 mb-1.5 font-semibold", children: "Registration Deadline" }),
        /* @__PURE__ */ jsx("input", { type: "datetime-local", value: toL(editing.registrationDeadline), onChange: (e) => set("registrationDeadline", frL(e.target.value)), className: "w-full bg-[#070b12] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500/40" })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-[10px] uppercase tracking-wider text-gray-500 mb-1.5 font-semibold", children: "Start Date" }),
        /* @__PURE__ */ jsx("input", { type: "datetime-local", value: toL(editing.startDate), onChange: (e) => set("startDate", frL(e.target.value)), className: "w-full bg-[#070b12] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500/40" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "md:col-span-2", children: /* @__PURE__ */ jsx(GField, { label: "Banner URL", value: editing.banner ?? "", onChange: (v) => set("banner", v), placeholder: "https://i.imgur.com/..." }) }),
      /* @__PURE__ */ jsxs("div", { className: "md:col-span-2", children: [
        /* @__PURE__ */ jsx("label", { className: "block text-[10px] uppercase tracking-wider text-gray-500 mb-1.5 font-semibold", children: "Description" }),
        /* @__PURE__ */ jsx("textarea", { value: editing.description ?? "", onChange: (e) => set("description", e.target.value), rows: 3, placeholder: "Tournament description…", className: "w-full bg-[#070b12] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm resize-none focus:outline-none focus:border-amber-500/40 placeholder-gray-700" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "md:col-span-2", children: [
        /* @__PURE__ */ jsx("label", { className: "block text-[10px] uppercase tracking-wider text-gray-500 mb-2 font-semibold", children: "Registration Options" }),
        /* @__PURE__ */ jsxs("label", { className: `inline-flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer select-none transition-all ${editing.requireCaptain !== false ? "bg-amber-500/8 border-amber-500/25" : "bg-white/3 border-white/8"}`, children: [
          /* @__PURE__ */ jsx(
            "div",
            {
              onClick: () => set("requireCaptain", !(editing.requireCaptain !== false)),
              className: `relative w-10 h-5 rounded-full transition-all flex-shrink-0 cursor-pointer ${editing.requireCaptain !== false ? "bg-amber-500" : "bg-white/15"}`,
              children: /* @__PURE__ */ jsx("span", { className: `absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${editing.requireCaptain !== false ? "left-5" : "left-0.5"}` })
            }
          ),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-white text-sm font-semibold", children: "Captain System" }),
            /* @__PURE__ */ jsx("p", { className: "text-gray-500 text-xs", children: editing.requireCaptain !== false ? "On — players must designate a captain when registering" : "Off — all team members are equal, no captain required" })
          ] })
        ] })
      ] })
    ] }),
    editing.banner && /* @__PURE__ */ jsx("div", { className: "h-24 rounded-xl overflow-hidden border border-white/5", children: /* @__PURE__ */ jsx("img", { src: editing.banner, className: "w-full h-full object-cover", alt: "", onError: (e) => e.target.parentElement.style.display = "none" }) }),
    /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
      /* @__PURE__ */ jsx("button", { onClick: save, disabled: saving, className: "px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold text-sm hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 transition-all shadow-lg shadow-amber-500/20", children: saving ? "Saving…" : "Save Tournament" }),
      /* @__PURE__ */ jsx("button", { onClick: () => setEditing(false), className: "px-6 py-3 rounded-xl border border-white/8 text-gray-500 font-bold text-sm hover:text-white transition-all", children: "Cancel" })
    ] })
  ] });
}
function TTeams({ active, flash, reload }) {
  const [filter, setFilter] = useState("approved");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(/* @__PURE__ */ new Set());
  const [page, setPage] = useState(1);
  const PER_PAGE = 12;
  if (!active) return /* @__PURE__ */ jsx(NoActiveTournament, {});
  const teams = active.teams.filter((t) => filter === "all" || t.status === filter).filter((t) => !search || t.name.toLowerCase().includes(search.toLowerCase()) || (t.captain ?? "").toLowerCase().includes(search.toLowerCase()));
  const paged = teams.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const pages = Math.ceil(teams.length / PER_PAGE);
  const statusCounts = ["all", "pending", "approved", "rejected", "eliminated", "disqualified"].reduce((acc, s) => {
    acc[s] = s === "all" ? active.teams.length : active.teams.filter((t) => t.status === s).length;
    return acc;
  }, {});
  function toggleSelect(id) {
    setSelected((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }
  function selectAll() {
    setSelected(new Set(paged.map((t) => t.id)));
  }
  function clearSel() {
    setSelected(/* @__PURE__ */ new Set());
  }
  async function bulkAction(status) {
    if (selected.size === 0) return;
    await bulkUpdateTeamStatus({ data: { tournamentId: active.id, teamIds: [...selected], status, notes: "" } });
    flash(`${selected.size} teams → ${status}`);
    setSelected(/* @__PURE__ */ new Set());
    reload();
  }
  async function doRemove(teamId) {
    if (!confirm("Remove this team?")) return;
    await removeTeam({ data: { tournamentId: active.id, teamId } });
    flash("Team removed");
    reload();
  }
  async function setStatus(teamId, status) {
    await updateTeamStatus({ data: { tournamentId: active.id, teamId, status, notes: "" } });
    flash(`Status updated`);
    reload();
  }
  return /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex gap-3 flex-wrap items-center", children: [
      /* @__PURE__ */ jsxs("div", { className: "relative flex-1 min-w-40", children: [
        /* @__PURE__ */ jsx("span", { className: "absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 text-sm", children: "🔍" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            value: search,
            onChange: (e) => {
              setSearch(e.target.value);
              setPage(1);
            },
            placeholder: "Search teams…",
            className: "w-full bg-[#0a0e18] border border-white/8 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500/40 placeholder-gray-600"
          }
        )
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex gap-1 flex-wrap", children: ["all", "pending", "approved", "rejected", "eliminated"].map((f) => /* @__PURE__ */ jsxs("button", { onClick: () => {
        setFilter(f);
        setPage(1);
        setSelected(/* @__PURE__ */ new Set());
      }, className: `px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all ${filter === f ? "bg-amber-500/15 border-amber-500/30 text-amber-300" : "border-white/8 text-gray-600 hover:text-gray-300"}`, children: [
        f,
        " ",
        statusCounts[f] > 0 ? `(${statusCounts[f]})` : ""
      ] }, f)) })
    ] }),
    selected.size > 0 && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 px-4 py-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex-wrap", children: [
      /* @__PURE__ */ jsxs("span", { className: "text-amber-300 text-xs font-bold", children: [
        selected.size,
        " selected"
      ] }),
      /* @__PURE__ */ jsx("button", { onClick: () => bulkAction("approved"), className: "px-3 py-1.5 rounded-lg bg-green-500/20 border border-green-500/30 text-green-300 text-[10px] font-bold hover:bg-green-500/30 transition-all", children: "✓ Approve All" }),
      /* @__PURE__ */ jsx("button", { onClick: () => bulkAction("rejected"), className: "px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold hover:bg-red-500/15 transition-all", children: "✕ Reject All" }),
      /* @__PURE__ */ jsx("button", { onClick: () => bulkAction("eliminated"), className: "px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-[10px] font-bold hover:bg-yellow-500/15 transition-all", children: "⚡ Eliminate All" }),
      /* @__PURE__ */ jsx("button", { onClick: clearSel, className: "ml-auto text-gray-500 text-xs hover:text-white", children: "Clear" })
    ] }),
    paged.length > 0 && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 text-xs text-gray-600", children: [
      /* @__PURE__ */ jsx("button", { onClick: selected.size === paged.length ? clearSel : selectAll, className: "hover:text-gray-300 transition-colors", children: selected.size === paged.length ? "☑ Deselect all" : "☐ Select all on page" }),
      /* @__PURE__ */ jsx("span", { children: "·" }),
      /* @__PURE__ */ jsxs("span", { children: [
        teams.length,
        " team(s) shown"
      ] })
    ] }),
    paged.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "text-center py-16 text-gray-600", children: [
      /* @__PURE__ */ jsx("div", { className: "text-4xl mb-3 opacity-20", children: "👥" }),
      /* @__PURE__ */ jsx("p", { children: "No teams match your filter." })
    ] }) : /* @__PURE__ */ jsx("div", { className: "space-y-2", children: paged.map((team) => /* @__PURE__ */ jsxs("div", { className: `bg-[#0a0e18] border rounded-xl p-4 flex items-center gap-4 transition-all hover:border-white/10 ${selected.has(team.id) ? "border-amber-500/25 bg-amber-500/3" : "border-white/5"}`, children: [
      /* @__PURE__ */ jsx("input", { type: "checkbox", checked: selected.has(team.id), onChange: () => toggleSelect(team.id), className: "w-4 h-4 rounded accent-amber-400 flex-shrink-0" }),
      active.requireCaptain !== false && team.captain && /* @__PURE__ */ jsx("img", { src: `https://mc-heads.net/avatar/${team.captain}/32`, className: "w-10 h-10 rounded-lg flex-shrink-0", alt: "", onError: (e) => e.target.style.display = "none" }),
      /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
          /* @__PURE__ */ jsx("p", { className: "text-white font-bold text-sm", children: team.name }),
          /* @__PURE__ */ jsx(TeamStatusBadge, { status: team.status })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-gray-500 text-xs mt-0.5", children: active.requireCaptain !== false && team.captain ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsxs("span", { children: [
            "👑 ",
            team.captain
          ] }),
          team.players.length > 1 && /* @__PURE__ */ jsxs("span", { className: "ml-2 text-gray-600", children: [
            "· ",
            team.players.slice(1).join(", ")
          ] })
        ] }) : /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: team.players.join(", ") }) }),
        /* @__PURE__ */ jsx("p", { className: "text-gray-700 text-[10px] mt-0.5", children: timeAgo(team.registeredAt) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-1.5 flex-shrink-0 flex-wrap justify-end", children: [
        team.status !== "approved" && /* @__PURE__ */ jsx(QBtn, { label: "✓ Approve", onClick: () => setStatus(team.id, "approved"), color: "green" }),
        team.status !== "rejected" && /* @__PURE__ */ jsx(QBtn, { label: "✕ Reject", onClick: () => setStatus(team.id, "rejected"), color: "red" }),
        team.status !== "eliminated" && /* @__PURE__ */ jsx(QBtn, { label: "⚡ Elim.", onClick: () => setStatus(team.id, "eliminated"), color: "yellow" }),
        /* @__PURE__ */ jsx(QBtn, { label: "🗑", onClick: () => doRemove(team.id), color: "red" })
      ] })
    ] }, team.id)) }),
    pages > 1 && /* @__PURE__ */ jsx(AdminPaginator, { page, totalPages: pages, totalItems: teams.length, pageSize: PER_PAGE, onPageChange: setPage })
  ] });
}
function TBracket({ active, flash, reload }) {
  const [generating, setGenerating] = useState(false);
  const [type, setType] = useState("single_elimination");
  const [shuffle, setShuffle] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  if (!active) return /* @__PURE__ */ jsx(NoActiveTournament, {});
  const approvedTeams = active.teams.filter((t) => t.status === "approved");
  const displayNums = useMemo(() => {
    const nonBye = [...active.matches].filter((m) => m.status !== "bye").sort((a, b) => a.matchNumber - b.matchNumber);
    return new Map(nonBye.map((m, i) => [m.id, i + 1]));
  }, [active.matches]);
  async function generate() {
    if (approvedTeams.length < 2) return flash("Need at least 2 approved teams", false);
    if (!confirm(`Generate a ${type.replace(/_/g, " ")} bracket with ${approvedTeams.length} teams? This will reset existing matches.`)) return;
    setGenerating(true);
    setEditMode(false);
    setEditingId(null);
    try {
      const res = await generateBracket({ data: { tournamentId: active.id, type, shuffle } });
      if (res.success) {
        flash("Bracket generated ✓");
        reload();
      } else flash(res.error ?? "Failed", false);
    } finally {
      setGenerating(false);
    }
  }
  async function saveSlot(matchId, team1Id, team2Id) {
    const res = await updateBracketSlot({ data: { tournamentId: active.id, matchId, team1Id, team2Id } });
    if (res.success) {
      flash("Matchup updated ✓");
      setEditingId(null);
      reload();
    } else flash(res.error ?? "Error updating slot", false);
  }
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "bg-[#0a0e18] border border-white/5 rounded-2xl p-6 space-y-5", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-lg flex-shrink-0", children: "⚔️" }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-white font-bold", children: "Generate Bracket" }),
          /* @__PURE__ */ jsxs("p", { className: "text-gray-500 text-xs", children: [
            approvedTeams.length,
            " approved team(s) ready"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-4 flex-wrap items-end", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-[10px] uppercase tracking-wider text-gray-500 mb-1.5 font-semibold", children: "Format" }),
          /* @__PURE__ */ jsxs("select", { value: type, onChange: (e) => setType(e.target.value), className: "bg-[#070b12] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500/40", children: [
            /* @__PURE__ */ jsx("option", { value: "single_elimination", children: "Single Elimination" }),
            /* @__PURE__ */ jsx("option", { value: "double_elimination", children: "Double Elimination" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 cursor-pointer", children: [
          /* @__PURE__ */ jsx("input", { type: "checkbox", checked: shuffle, onChange: (e) => setShuffle(e.target.checked), className: "w-4 h-4 rounded accent-amber-400" }),
          /* @__PURE__ */ jsx("span", { className: "text-gray-400 text-sm", children: "Random seed" })
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: generate,
            disabled: generating || approvedTeams.length < 2,
            className: "flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold text-sm hover:from-amber-400 hover:to-amber-500 disabled:opacity-40 transition-all shadow-lg shadow-amber-500/20",
            children: generating ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx("span", { className: "w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" }),
              "Generating…"
            ] }) : /* @__PURE__ */ jsx(Fragment, { children: "⚡ Generate Bracket" })
          }
        )
      ] })
    ] }),
    active.bracket && active.matches.length > 0 ? /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between flex-wrap gap-3", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("p", { className: "text-white font-bold text-sm", children: [
            "Bracket — ",
            active.bracket.type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "text-gray-600 text-xs mt-0.5", children: [
            active.bracket.rounds.length,
            " round(s)"
          ] })
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => {
              setEditMode((e) => !e);
              setEditingId(null);
            },
            className: `flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${editMode ? "bg-amber-500/20 border-amber-500/40 text-amber-300" : "bg-white/3 border-white/8 text-gray-400 hover:text-white hover:border-white/15"}`,
            children: editMode ? "✓ Done Editing" : "✏️ Edit Bracket"
          }
        )
      ] }),
      editMode && /* @__PURE__ */ jsxs("div", { className: "bg-amber-500/5 border border-amber-500/15 rounded-xl px-4 py-3 text-xs text-amber-300/80", children: [
        "✏️ ",
        /* @__PURE__ */ jsx("strong", { children: "Edit mode active" }),
        " — click ",
        /* @__PURE__ */ jsx("strong", { children: "Edit" }),
        " on any match card to change which teams face each other. Scores and results reset when teams change."
      ] }),
      /* @__PURE__ */ jsx("div", { className: "overflow-x-auto pb-4", children: /* @__PURE__ */ jsx("div", { className: "flex gap-4 min-w-max", children: active.bracket.rounds.map((round, ri) => {
        const roundMatches = round.matchIds.map((id) => active.matches.find((m) => m.id === id)).filter(Boolean);
        const visibleMatches = roundMatches.filter((m) => m.status !== "bye");
        return /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3 min-w-[220px]", children: [
          /* @__PURE__ */ jsxs("div", { className: "bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2 text-center", children: [
            /* @__PURE__ */ jsx("p", { className: "text-amber-300 text-xs font-bold uppercase tracking-wider", children: round.name }),
            /* @__PURE__ */ jsxs("p", { className: "text-gray-600 text-[10px]", children: [
              visibleMatches.length,
              " match(es)"
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-2 justify-around flex-1", children: visibleMatches.map((match) => {
            const t1 = active.teams.find((t) => t.id === match.team1Id);
            const t2 = active.teams.find((t) => t.id === match.team2Id);
            const dn = displayNums.get(match.id) ?? match.matchNumber;
            const isEditing = editMode && editingId === match.id;
            return /* @__PURE__ */ jsxs("div", { className: `border rounded-xl overflow-hidden text-xs transition-all ${isEditing ? "border-amber-500/40 shadow-lg shadow-amber-500/10" : match.status === "live" ? "border-red-500/40 shadow-lg shadow-red-500/10" : match.status === "completed" ? "border-green-500/20" : "border-white/8"}`, children: [
              match.status === "live" && !isEditing && /* @__PURE__ */ jsx("div", { className: "bg-red-500/20 px-2 py-0.5 text-center", children: /* @__PURE__ */ jsx("span", { className: "text-red-400 text-[9px] font-bold uppercase tracking-wider animate-pulse", children: "● LIVE" }) }),
              isEditing ? (
                /* ── Slot editor ── */
                /* @__PURE__ */ jsx(
                  BracketSlotEditor,
                  {
                    match,
                    teams: approvedTeams,
                    onSave: saveSlot,
                    onCancel: () => setEditingId(null)
                  }
                )
              ) : (
                /* ── Normal view ── */
                /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsx(BracketTeamRow, { team: t1, score: match.score1, isWinner: match.winnerId === match.team1Id }),
                  /* @__PURE__ */ jsx("div", { className: "border-t border-white/5" }),
                  /* @__PURE__ */ jsx(BracketTeamRow, { team: t2, score: match.score2, isWinner: match.winnerId === match.team2Id }),
                  /* @__PURE__ */ jsxs("div", { className: "border-t border-white/5 bg-white/2 px-2 py-1 flex items-center justify-between", children: [
                    /* @__PURE__ */ jsxs("span", { className: `text-[9px] font-bold uppercase ${match.status === "live" ? "text-red-400" : match.status === "completed" ? "text-green-400" : match.status === "scheduled" ? "text-[#00BFFF]" : "text-gray-600"}`, children: [
                      "M",
                      dn,
                      " · ",
                      MATCH_STATUS_LABEL[match.status]
                    ] }),
                    editMode && /* @__PURE__ */ jsx(
                      "button",
                      {
                        onClick: () => setEditingId(match.id),
                        className: "text-[9px] font-bold text-amber-400 hover:text-amber-300 transition-colors ml-2",
                        children: "✏️ Edit"
                      }
                    )
                  ] })
                ] })
              )
            ] }, match.id);
          }) })
        ] }, ri);
      }) }) })
    ] }) : /* @__PURE__ */ jsxs("div", { className: "text-center py-16 text-gray-600", children: [
      /* @__PURE__ */ jsx("div", { className: "text-5xl mb-4 opacity-20", children: "⚔️" }),
      /* @__PURE__ */ jsx("p", { children: "No bracket yet. Approve teams and generate one above." })
    ] })
  ] });
}
function BracketTeamRow({ team, score, isWinner }) {
  return /* @__PURE__ */ jsxs("div", { className: `flex items-center gap-2 px-3 py-2 ${isWinner ? "bg-green-500/8" : ""}`, children: [
    team?.captain ? /* @__PURE__ */ jsx("img", { src: `https://mc-heads.net/avatar/${team.captain}/16`, className: "w-5 h-5 rounded flex-shrink-0", alt: "", onError: (e) => e.target.style.display = "none" }) : /* @__PURE__ */ jsx("div", { className: "w-5 h-5 rounded bg-white/5 flex-shrink-0" }),
    /* @__PURE__ */ jsxs("span", { className: `flex-1 truncate text-[11px] font-semibold ${isWinner ? "text-green-300" : team ? "text-white" : "text-gray-600"}`, children: [
      team?.name ?? "TBD",
      isWinner && /* @__PURE__ */ jsx("span", { className: "ml-1", children: "👑" })
    ] }),
    /* @__PURE__ */ jsx("span", { className: `text-[11px] font-black flex-shrink-0 ${isWinner ? "text-green-300" : "text-gray-500"}`, children: score })
  ] });
}
function BracketSlotEditor({
  match,
  teams,
  onSave,
  onCancel
}) {
  const [t1, setT1] = useState(match.team1Id ?? "");
  const [t2, setT2] = useState(match.team2Id ?? "");
  const [saving, setSaving] = useState(false);
  async function save() {
    if (t1 && t1 === t2) {
      alert("Team 1 and Team 2 must be different.");
      return;
    }
    setSaving(true);
    await onSave(match.id, t1 || null, t2 || null);
    setSaving(false);
  }
  const sel = (val, onChange, otherVal) => /* @__PURE__ */ jsxs(
    "select",
    {
      value: val,
      onChange: (e) => onChange(e.target.value),
      className: "w-full bg-[#070b12] border border-white/15 rounded-lg px-2 py-1.5 text-white text-[11px] focus:outline-none focus:border-amber-500/50",
      children: [
        /* @__PURE__ */ jsx("option", { value: "", children: "— TBD —" }),
        teams.map((t) => /* @__PURE__ */ jsxs("option", { value: t.id, disabled: t.id === otherVal, children: [
          t.name,
          t.id === otherVal ? " (used)" : ""
        ] }, t.id))
      ]
    }
  );
  return /* @__PURE__ */ jsxs("div", { className: "p-3 space-y-2 bg-amber-500/3", children: [
    /* @__PURE__ */ jsx("p", { className: "text-amber-400 text-[9px] font-bold uppercase tracking-wider", children: "Edit Matchup" }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "text-gray-500 text-[9px] mb-1", children: "Team 1" }),
        sel(t1, setT1, t2)
      ] }),
      /* @__PURE__ */ jsx("div", { className: "text-center text-gray-700 text-[9px] font-bold", children: "VS" }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "text-gray-500 text-[9px] mb-1", children: "Team 2" }),
        sel(t2, setT2, t1)
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex gap-2 pt-1", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: save,
          disabled: saving,
          className: "flex-1 py-1.5 rounded-lg bg-amber-500 text-black text-[10px] font-bold hover:bg-amber-400 disabled:opacity-50 transition-all",
          children: saving ? "…" : "✓ Save"
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: onCancel,
          className: "px-3 py-1.5 rounded-lg border border-white/10 text-gray-500 text-[10px] hover:text-white transition-all",
          children: "✕"
        }
      )
    ] })
  ] });
}
function TMatches({ active, flash, reload }) {
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState("all");
  if (!active) return /* @__PURE__ */ jsx(NoActiveTournament, {});
  const matches = [...active.matches].filter((m) => m.status !== "bye").filter((m) => filter === "all" || m.status === filter).sort((a, b) => a.matchNumber - b.matchNumber);
  const counts = ["all", "scheduled", "live", "completed", "pending"].reduce((acc, s) => {
    acc[s] = s === "all" ? active.matches.filter((m) => m.status !== "bye").length : active.matches.filter((m) => m.status === s).length;
    return acc;
  }, {});
  const getTeam = (id) => active.teams.find((t) => t.id === id);
  async function save(m) {
    setSaving(true);
    try {
      const res = await updateMatch({ data: { tournamentId: active.id, matchId: m.id, score1: m.score1, score2: m.score2, winnerId: m.winnerId, status: m.status, scheduledAt: m.scheduledAt, arena: m.arena, gamemode: m.gamemode, referee: m.referee, notes: m.notes, replayLink: m.replayLink } });
      if (res.success) {
        flash("Match updated ✓");
        setEditing(null);
        reload();
      } else flash(res.error ?? "Error", false);
    } finally {
      setSaving(false);
    }
  }
  if (editing) {
    return /* @__PURE__ */ jsx(MatchEditor, { match: editing, teams: active.teams, onSave: save, onCancel: () => setEditing(null), saving });
  }
  const byRound = {};
  for (const m of matches) {
    if (!byRound[m.round]) byRound[m.round] = [];
    byRound[m.round].push(m);
  }
  const rounds = Object.keys(byRound).map(Number).sort((a, b) => a - b);
  return /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsx("div", { className: "flex gap-2 flex-wrap", children: ["all", "live", "scheduled", "pending", "completed"].map((f) => /* @__PURE__ */ jsxs("button", { onClick: () => setFilter(f), className: `px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all ${filter === f ? "bg-amber-500/15 border-amber-500/30 text-amber-300" : "border-white/8 text-gray-600 hover:text-gray-300"} ${f === "live" && counts[f] > 0 ? "animate-pulse" : ""}`, children: [
      f === "live" && counts[f] > 0 ? "🔴 " : "",
      f,
      " ",
      counts[f] > 0 ? `(${counts[f]})` : ""
    ] }, f)) }),
    matches.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "text-center py-16 text-gray-600", children: [
      /* @__PURE__ */ jsx("div", { className: "text-5xl mb-3 opacity-20", children: "🎮" }),
      /* @__PURE__ */ jsx("p", { children: "No matches yet. Generate a bracket first." })
    ] }) : /* @__PURE__ */ jsx("div", { className: "space-y-6", children: rounds.map((r) => {
      const roundName = active.bracket?.rounds[r]?.name ?? `Round ${r + 1}`;
      const rMatches = byRound[r] ?? [];
      return /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "h-px flex-1 bg-white/5" }),
          /* @__PURE__ */ jsx("span", { className: "text-amber-400/70 text-[10px] font-bold uppercase tracking-widest px-3 py-1 border border-amber-500/15 rounded-full bg-amber-500/5", children: roundName }),
          /* @__PURE__ */ jsx("div", { className: "h-px flex-1 bg-white/5" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "space-y-2", children: rMatches.map((m) => {
          const t1 = getTeam(m.team1Id);
          const t2 = getTeam(m.team2Id);
          return /* @__PURE__ */ jsxs("div", { className: `bg-[#0a0e18] border rounded-xl px-4 py-3.5 flex items-center gap-4 hover:border-white/10 transition-all ${m.status === "live" ? "border-red-500/30 shadow-lg shadow-red-500/5" : m.status === "completed" ? "border-green-500/15" : "border-white/5"}`, children: [
            /* @__PURE__ */ jsxs("span", { className: "text-gray-600 text-xs font-bold w-7 flex-shrink-0", children: [
              "M",
              m.matchNumber
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0 flex items-center gap-3", children: [
              /* @__PURE__ */ jsx("span", { className: `text-sm font-bold truncate flex-1 ${m.winnerId === m.team1Id ? "text-green-300" : "text-white"}`, children: t1?.name ?? "TBD" }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 flex-shrink-0", children: [
                /* @__PURE__ */ jsx("span", { className: `font-black text-sm min-w-5 text-right ${m.winnerId === m.team1Id ? "text-green-300" : "text-gray-400"}`, children: m.score1 }),
                /* @__PURE__ */ jsx("span", { className: "text-gray-700 text-xs", children: "—" }),
                /* @__PURE__ */ jsx("span", { className: `font-black text-sm min-w-5 ${m.winnerId === m.team2Id ? "text-green-300" : "text-gray-400"}`, children: m.score2 })
              ] }),
              /* @__PURE__ */ jsx("span", { className: `text-sm font-bold truncate flex-1 text-right ${m.winnerId === m.team2Id ? "text-green-300" : "text-white"}`, children: t2?.name ?? "TBD" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 flex-shrink-0", children: [
              /* @__PURE__ */ jsx("span", { className: `text-[9px] px-2 py-1 rounded-lg font-bold uppercase tracking-wider ${m.status === "live" ? "bg-red-500/15 text-red-400 animate-pulse" : m.status === "completed" ? "bg-green-500/10 text-green-400" : m.status === "scheduled" ? "bg-[#00BFFF]/10 text-[#00BFFF]" : "bg-white/5 text-gray-600"}`, children: MATCH_STATUS_LABEL[m.status] }),
              m.arena && /* @__PURE__ */ jsx("span", { className: "text-gray-700 text-xs hidden md:inline", children: m.arena }),
              /* @__PURE__ */ jsx("button", { onClick: () => setEditing(m), className: "px-3 py-1.5 rounded-lg border border-white/8 text-gray-500 text-[10px] font-bold hover:text-white hover:border-white/20 transition-all", children: "Edit" })
            ] })
          ] }, m.id);
        }) })
      ] }, r);
    }) })
  ] });
}
function MatchEditor({ match: init, teams, onSave, onCancel, saving }) {
  const [m, setM] = useState({ ...init });
  const set = (k, v) => setM((prev) => ({ ...prev, [k]: v }));
  const toL = (ts) => ts ? new Date(ts - (/* @__PURE__ */ new Date()).getTimezoneOffset() * 6e4).toISOString().slice(0, 16) : "";
  const t1 = teams.find((t) => t.id === m.team1Id);
  const t2 = teams.find((t) => t.id === m.team2Id);
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsx("button", { onClick: onCancel, className: "text-gray-500 hover:text-white text-sm", children: "← Back" }),
      /* @__PURE__ */ jsxs("h3", { className: "font-['Space_Grotesk'] font-bold text-white", children: [
        "Edit Match #",
        m.matchNumber
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "bg-[#070b12] border border-white/8 rounded-2xl p-6", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-center flex-1", children: [
        /* @__PURE__ */ jsx("p", { className: "text-gray-500 text-xs mb-2", children: t1?.name ?? "Team 1" }),
        /* @__PURE__ */ jsx("input", { type: "number", min: 0, value: m.score1, onChange: (e) => set("score1", +e.target.value), className: "w-24 bg-[#0a0e18] border border-white/10 rounded-xl px-3 py-3 text-white text-2xl font-black text-center focus:outline-none focus:border-amber-500/40" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "text-gray-600 font-black text-2xl", children: "VS" }),
      /* @__PURE__ */ jsxs("div", { className: "text-center flex-1", children: [
        /* @__PURE__ */ jsx("p", { className: "text-gray-500 text-xs mb-2", children: t2?.name ?? "Team 2" }),
        /* @__PURE__ */ jsx("input", { type: "number", min: 0, value: m.score2, onChange: (e) => set("score2", +e.target.value), className: "w-24 bg-[#0a0e18] border border-white/10 rounded-xl px-3 py-3 text-white text-2xl font-black text-center focus:outline-none focus:border-amber-500/40" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "grid md:grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-[10px] uppercase tracking-wider text-gray-500 mb-1.5 font-semibold", children: "Status" }),
        /* @__PURE__ */ jsx("select", { value: m.status, onChange: (e) => set("status", e.target.value), className: "w-full bg-[#070b12] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500/40", children: ["pending", "scheduled", "live", "completed"].map((s) => /* @__PURE__ */ jsx("option", { value: s, children: MATCH_STATUS_LABEL[s] }, s)) })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-[10px] uppercase tracking-wider text-gray-500 mb-1.5 font-semibold", children: "Winner" }),
        /* @__PURE__ */ jsxs("select", { value: m.winnerId ?? "", onChange: (e) => set("winnerId", e.target.value || null), className: "w-full bg-[#070b12] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500/40", children: [
          /* @__PURE__ */ jsx("option", { value: "", children: "No winner yet" }),
          t1 && /* @__PURE__ */ jsx("option", { value: t1.id, children: t1.name }),
          t2 && /* @__PURE__ */ jsx("option", { value: t2.id, children: t2.name })
        ] })
      ] }),
      /* @__PURE__ */ jsx(GField, { label: "Arena", value: m.arena, onChange: (v) => set("arena", v), placeholder: "Arena name" }),
      /* @__PURE__ */ jsx(GField, { label: "Gamemode", value: m.gamemode, onChange: (v) => set("gamemode", v), placeholder: "e.g. Crystal PvP" }),
      /* @__PURE__ */ jsx(GField, { label: "Referee", value: m.referee, onChange: (v) => set("referee", v), placeholder: "Staff username" }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-[10px] uppercase tracking-wider text-gray-500 mb-1.5 font-semibold", children: "Scheduled At" }),
        /* @__PURE__ */ jsx("input", { type: "datetime-local", value: toL(m.scheduledAt), onChange: (e) => set("scheduledAt", e.target.value ? new Date(e.target.value).getTime() : null), className: "w-full bg-[#070b12] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500/40" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "md:col-span-2", children: /* @__PURE__ */ jsx(GField, { label: "Replay Link", value: m.replayLink, onChange: (v) => set("replayLink", v), placeholder: "https://…" }) }),
      /* @__PURE__ */ jsxs("div", { className: "md:col-span-2", children: [
        /* @__PURE__ */ jsx("label", { className: "block text-[10px] uppercase tracking-wider text-gray-500 mb-1.5 font-semibold", children: "Notes" }),
        /* @__PURE__ */ jsx("textarea", { value: m.notes, onChange: (e) => set("notes", e.target.value), rows: 2, className: "w-full bg-[#070b12] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm resize-none focus:outline-none focus:border-amber-500/40" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
      /* @__PURE__ */ jsx("button", { onClick: () => onSave(m), disabled: saving, className: "px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold text-sm hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 transition-all shadow-lg shadow-amber-500/20", children: saving ? "Saving…" : "Save Match" }),
      /* @__PURE__ */ jsx("button", { onClick: onCancel, className: "px-6 py-3 rounded-xl border border-white/8 text-gray-500 font-bold text-sm hover:text-white transition-all", children: "Cancel" })
    ] })
  ] });
}
function TPrizes({ active, flash, reload }) {
  const [prizes, setPrizes] = useState(active?.prizes ?? DEFAULT_PRIZES);
  const [saving, setSaving] = useState(false);
  const REWARD_TYPES = ["coins", "gems", "rank", "crate_keys", "custom"];
  const ICONS = ["🥇", "🥈", "🥉", "🏅", "🎖"];
  if (!active) return /* @__PURE__ */ jsx(NoActiveTournament, {});
  function addPlacement() {
    const n = prizes.length + 1;
    setPrizes((p) => [...p, { placement: n, label: `${ICONS[n - 1] ?? "🎖"} ${ordinal(n)} Place`, rewards: [{ type: "coins", label: "BlueCoin", amount: "" }] }]);
  }
  const setReward = (pi, ri, k, v) => setPrizes((p) => p.map((pr, i) => i === pi ? { ...pr, rewards: pr.rewards.map((r, j) => j === ri ? { ...r, [k]: v } : r) } : pr));
  const setPrize = (pi, k, v) => setPrizes((p) => p.map((pr, i) => i === pi ? { ...pr, [k]: v } : pr));
  async function save() {
    setSaving(true);
    try {
      await updatePrizes({ data: { tournamentId: active.id, prizes } });
      flash("Prizes saved ✓");
      reload();
    } catch {
      flash("Error", false);
    } finally {
      setSaving(false);
    }
  }
  const REWARD_ICONS = { coins: "💰", gems: "💎", rank: "🏅", crate_keys: "🗝", custom: "✨" };
  return /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("p", { className: "text-gray-500 text-sm", children: [
        prizes.length,
        " placement(s)"
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
        /* @__PURE__ */ jsx("button", { onClick: addPlacement, className: "px-4 py-2 rounded-xl border border-white/8 text-gray-400 text-xs font-bold hover:text-white transition-all", children: "+ Add Placement" }),
        /* @__PURE__ */ jsx("button", { onClick: save, disabled: saving, className: "px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black text-xs font-bold hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 transition-all shadow-lg shadow-amber-500/15", children: saving ? "Saving…" : "💾 Save Prizes" })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "space-y-4", children: prizes.map((prize, pi) => /* @__PURE__ */ jsxs("div", { className: `bg-[#0a0e18] border rounded-2xl p-5 space-y-4 ${pi === 0 ? "border-amber-500/20" : pi === 1 ? "border-gray-400/15" : pi === 2 ? "border-amber-700/15" : "border-white/5"}`, children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("span", { className: "text-2xl", children: ICONS[pi] ?? "🎖" }),
        /* @__PURE__ */ jsx("input", { value: prize.label, onChange: (e) => setPrize(pi, "label", e.target.value), placeholder: "e.g. 🥇 First Place", className: "flex-1 bg-[#070b12] border border-white/8 rounded-xl px-3 py-2 text-white font-bold text-sm focus:outline-none focus:border-amber-500/40" }),
        /* @__PURE__ */ jsx("button", { onClick: () => setPrizes((p) => p.filter((_, i) => i !== pi)), className: "text-gray-600 hover:text-red-400 transition-colors text-xs px-2", children: "✕ Remove" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        prize.rewards.map((r, ri) => /* @__PURE__ */ jsxs("div", { className: "flex gap-2 items-end flex-wrap bg-white/2 border border-white/5 rounded-xl p-3", children: [
          /* @__PURE__ */ jsx("span", { className: "text-lg", children: REWARD_ICONS[r.type] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-[9px] text-gray-600 mb-1", children: "Type" }),
            /* @__PURE__ */ jsx("select", { value: r.type, onChange: (e) => setReward(pi, ri, "type", e.target.value), className: "bg-[#070b12] border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none", children: REWARD_TYPES.map((t) => /* @__PURE__ */ jsx("option", { value: t, children: t }, t)) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-24", children: [
            /* @__PURE__ */ jsx("label", { className: "block text-[9px] text-gray-600 mb-1", children: "Label" }),
            /* @__PURE__ */ jsx("input", { value: r.label, onChange: (e) => setReward(pi, ri, "label", e.target.value), placeholder: "BlueCoin", className: "w-full bg-[#070b12] border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-24", children: [
            /* @__PURE__ */ jsx("label", { className: "block text-[9px] text-gray-600 mb-1", children: "Amount" }),
            /* @__PURE__ */ jsx("input", { value: r.amount, onChange: (e) => setReward(pi, ri, "amount", e.target.value), placeholder: "10,000", className: "w-full bg-[#070b12] border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none" })
          ] }),
          /* @__PURE__ */ jsx("button", { onClick: () => setPrizes((p) => p.map((pr, i) => i === pi ? { ...pr, rewards: pr.rewards.filter((_, j) => j !== ri) } : pr)), className: "text-gray-600 hover:text-red-400 text-xs pb-0.5", children: "✕" })
        ] }, ri)),
        /* @__PURE__ */ jsx("button", { onClick: () => setPrizes((p) => p.map((pr, i) => i === pi ? { ...pr, rewards: [...pr.rewards, { type: "coins", label: "", amount: "" }] } : pr)), className: "text-xs text-amber-400 hover:text-amber-300", children: "+ Add Reward" })
      ] })
    ] }, pi)) })
  ] });
}
function TRules({ active, flash, reload }) {
  const [rules, setRules] = useState(active?.rules ?? DEFAULT_RULES);
  const [saving, setSaving] = useState(false);
  if (!active) return /* @__PURE__ */ jsx(NoActiveTournament, {});
  const setField = (k, v) => setRules((r) => ({ ...r, [k]: v }));
  const setList = (k, idx, v) => setRules((r) => ({ ...r, [k]: r[k].map((x, i) => i === idx ? v : x) }));
  const addItem = (k) => setRules((r) => ({ ...r, [k]: [...r[k], ""] }));
  const remItem = (k, idx) => setRules((r) => ({ ...r, [k]: r[k].filter((_, i) => i !== idx) }));
  async function save() {
    setSaving(true);
    try {
      await updateRules({ data: { tournamentId: active.id, ...rules } });
      flash("Rules saved ✓");
      reload();
    } catch {
      flash("Error", false);
    } finally {
      setSaving(false);
    }
  }
  const ListField = ({ label, field, icon }) => /* @__PURE__ */ jsxs("div", { className: "bg-[#0a0e18] border border-white/5 rounded-2xl p-5 space-y-3", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsx("span", { className: "text-lg", children: icon }),
      /* @__PURE__ */ jsx("p", { className: "text-white font-bold text-sm", children: label })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
      rules[field].map((item, i) => /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsx("input", { value: item, onChange: (e) => setList(field, i, e.target.value), className: "flex-1 bg-[#070b12] border border-white/8 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500/40" }),
        /* @__PURE__ */ jsx("button", { onClick: () => remItem(field, i), className: "px-2 text-gray-600 hover:text-red-400 transition-colors", children: "✕" })
      ] }, i)),
      /* @__PURE__ */ jsx("button", { onClick: () => addItem(field), className: "text-xs text-amber-400 hover:text-amber-300", children: "+ Add" })
    ] })
  ] });
  const TextareaF = ({ label, field, icon }) => /* @__PURE__ */ jsxs("div", { className: "bg-[#0a0e18] border border-white/5 rounded-2xl p-5 space-y-3", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsx("span", { className: "text-lg", children: icon }),
      /* @__PURE__ */ jsx("p", { className: "text-white font-bold text-sm", children: label })
    ] }),
    /* @__PURE__ */ jsx("textarea", { value: rules[field], onChange: (e) => setField(field, e.target.value), rows: 3, className: "w-full bg-[#070b12] border border-white/8 rounded-xl px-3 py-2.5 text-white text-sm resize-none focus:outline-none focus:border-amber-500/40" })
  ] });
  return /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "grid md:grid-cols-3 gap-4", children: [
      /* @__PURE__ */ jsx(ListField, { label: "Allowed Mods", field: "allowedMods", icon: "✅" }),
      /* @__PURE__ */ jsx(ListField, { label: "Allowed Clients", field: "allowedClients", icon: "🖥" }),
      /* @__PURE__ */ jsx(ListField, { label: "Banned Modifications", field: "bannedMods", icon: "🚫" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid md:grid-cols-3 gap-4", children: [
      /* @__PURE__ */ jsx(TextareaF, { label: "Replay Requirements", field: "replayRequirements", icon: "🎬" }),
      /* @__PURE__ */ jsx(TextareaF, { label: "Disconnect Rules", field: "disconnectRules", icon: "⚡" }),
      /* @__PURE__ */ jsx(TextareaF, { label: "Staff Decisions", field: "staffDecisions", icon: "⚖️" })
    ] }),
    /* @__PURE__ */ jsx(ListField, { label: "Custom Rules", field: "custom", icon: "📝" }),
    /* @__PURE__ */ jsx("button", { onClick: save, disabled: saving, className: "px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold text-sm hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 transition-all shadow-lg shadow-amber-500/20", children: saving ? "Saving…" : "💾 Save Rules" })
  ] });
}
function TAnnouncements({ active, flash, reload }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [type, setType] = useState("info");
  const [posting, setPost] = useState(false);
  const [page, setPage] = useState(1);
  const PER_PAGE = 8;
  if (!active) return /* @__PURE__ */ jsx(NoActiveTournament, {});
  const anns = active.announcements;
  const paged = anns.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const pages = Math.ceil(anns.length / PER_PAGE);
  async function post() {
    if (!title.trim()) return flash("Title is required", false);
    setPost(true);
    try {
      await addAnnouncement({ data: { tournamentId: active.id, title: title.trim(), body: body.trim(), type } });
      flash("Announcement posted ✓");
      setTitle("");
      setBody("");
      reload();
    } catch {
      flash("Error", false);
    } finally {
      setPost(false);
    }
  }
  async function doDelete(annId) {
    await deleteAnnouncement({ data: { tournamentId: active.id, announcementId: annId } });
    flash("Deleted");
    reload();
  }
  const TYPE_CONFIG = {
    info: { icon: "ℹ️", bg: "bg-[#00BFFF]/5 border-[#00BFFF]/15", text: "text-[#00BFFF]" },
    warning: { icon: "⚠️", bg: "bg-yellow-500/5 border-yellow-500/15", text: "text-yellow-400" },
    success: { icon: "✅", bg: "bg-green-500/5 border-green-500/15", text: "text-green-400" }
  };
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "bg-[#0a0e18] border border-white/5 rounded-2xl p-6 space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-base", children: "📣" }),
        /* @__PURE__ */ jsx("p", { className: "text-white font-bold", children: "Post Announcement" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid md:grid-cols-4 gap-4", children: [
        /* @__PURE__ */ jsx("div", { className: "md:col-span-3", children: /* @__PURE__ */ jsx(GField, { label: "Title *", value: title, onChange: setTitle, placeholder: "e.g. Brackets Released! Get ready to compete." }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-[10px] uppercase tracking-wider text-gray-500 mb-1.5 font-semibold", children: "Type" }),
          /* @__PURE__ */ jsxs("select", { value: type, onChange: (e) => setType(e.target.value), className: "w-full bg-[#070b12] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500/40", children: [
            /* @__PURE__ */ jsx("option", { value: "info", children: "ℹ️ Info" }),
            /* @__PURE__ */ jsx("option", { value: "warning", children: "⚠️ Warning" }),
            /* @__PURE__ */ jsx("option", { value: "success", children: "✅ Success" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-[10px] uppercase tracking-wider text-gray-500 mb-1.5 font-semibold", children: "Body (optional)" }),
        /* @__PURE__ */ jsx("textarea", { value: body, onChange: (e) => setBody(e.target.value), rows: 3, placeholder: "Additional details…", className: "w-full bg-[#070b12] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm resize-none focus:outline-none focus:border-amber-500/40 placeholder-gray-700" })
      ] }),
      /* @__PURE__ */ jsx("button", { onClick: post, disabled: posting, className: "flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold text-sm hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 transition-all shadow-lg shadow-amber-500/15", children: posting ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("span", { className: "w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" }),
        "Posting…"
      ] }) : /* @__PURE__ */ jsx(Fragment, { children: "📣 Post Announcement" }) })
    ] }),
    anns.length === 0 ? /* @__PURE__ */ jsx("div", { className: "text-center py-12 text-gray-600", children: "No announcements yet." }) : /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxs("p", { className: "text-gray-500 text-xs", children: [
        anns.length,
        " announcement(s)"
      ] }),
      paged.map((ann) => {
        const cfg = TYPE_CONFIG[ann.type];
        return /* @__PURE__ */ jsxs("div", { className: `flex items-start gap-4 ${cfg.bg} border rounded-2xl px-5 py-4`, children: [
          /* @__PURE__ */ jsx("span", { className: "text-xl flex-shrink-0 mt-0.5", children: cfg.icon }),
          /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsx("p", { className: `font-bold text-sm ${cfg.text}`, children: ann.title }),
            ann.body && /* @__PURE__ */ jsx("p", { className: "text-gray-400 text-xs mt-1 leading-relaxed", children: ann.body }),
            /* @__PURE__ */ jsx("p", { className: "text-gray-700 text-[10px] mt-2", children: timeAgo(ann.createdAt) })
          ] }),
          /* @__PURE__ */ jsx("button", { onClick: () => doDelete(ann.id), className: "text-gray-600 hover:text-red-400 transition-colors text-xs flex-shrink-0 mt-0.5 px-2 py-1 rounded-lg hover:bg-red-500/10 border border-transparent hover:border-red-500/15", children: "Delete" })
        ] }, ann.id);
      }),
      pages > 1 && /* @__PURE__ */ jsx(AdminPaginator, { page, totalPages: pages, totalItems: anns.length, pageSize: PER_PAGE, onPageChange: setPage })
    ] })
  ] });
}
function GField({ label, value, onChange, placeholder }) {
  return /* @__PURE__ */ jsxs("div", { children: [
    label && /* @__PURE__ */ jsx("label", { className: "block text-[10px] uppercase tracking-wider text-gray-500 mb-1.5 font-semibold", children: label }),
    /* @__PURE__ */ jsx("input", { value, onChange: (e) => onChange(e.target.value), placeholder, className: "w-full bg-[#070b12] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm placeholder-gray-700 focus:outline-none focus:border-amber-500/40 transition-colors" })
  ] });
}
function QBtn({ label, onClick, color }) {
  const c = {
    green: "text-green-300 border-green-500/25 hover:bg-green-500/15",
    red: "text-red-400 border-red-500/20 hover:bg-red-500/10",
    yellow: "text-yellow-300 border-yellow-500/20 hover:bg-yellow-500/10",
    blue: "text-[#00BFFF] border-[#00BFFF]/20 hover:bg-[#00BFFF]/10",
    gray: "text-gray-500 border-white/8 hover:text-white hover:border-white/20"
  }[color];
  return /* @__PURE__ */ jsx("button", { onClick, className: `px-2.5 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${c}`, children: label });
}
function StatusPill({ status }) {
  const cfg = {
    upcoming: { label: "Upcoming", cls: "bg-blue-500/10 border-blue-500/25 text-blue-400" },
    registration_open: { label: "Reg. Open", cls: "bg-green-500/10 border-green-500/25 text-green-400" },
    registration_closed: { label: "Reg. Closed", cls: "bg-yellow-500/10 border-yellow-500/25 text-yellow-400" },
    live: { label: "LIVE", cls: "bg-red-500/10 border-red-500/25 text-red-400" },
    completed: { label: "Completed", cls: "bg-gray-500/10 border-gray-500/20 text-gray-400" },
    archived: { label: "Archived", cls: "bg-gray-700/10 border-gray-700/20 text-gray-600" }
  };
  const { label, cls } = cfg[status];
  return /* @__PURE__ */ jsx("span", { className: `text-[9px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-wider ${cls} ${status === "live" ? "animate-pulse" : ""}`, children: label });
}
function TeamStatusBadge({ status }) {
  const colors = {
    approved: "text-green-300 bg-green-500/10 border-green-500/20",
    pending: "text-yellow-300 bg-yellow-500/10 border-yellow-500/20",
    rejected: "text-red-400 bg-red-500/10 border-red-500/15",
    eliminated: "text-gray-400 bg-gray-500/10 border-gray-500/15",
    disqualified: "text-orange-400 bg-orange-500/10 border-orange-500/15"
  };
  return /* @__PURE__ */ jsx("span", { className: `text-[9px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-wider ${colors[status] ?? ""}`, children: status });
}
function NoActiveTournament() {
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center py-28 text-center", children: [
    /* @__PURE__ */ jsx("div", { className: "text-6xl mb-5 opacity-15", children: "🏆" }),
    /* @__PURE__ */ jsx("p", { className: "text-gray-400 font-semibold text-base mb-2", children: "No Active Tournament" }),
    /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-sm", children: "Go to the Tournaments tab and set one as active first." })
  ] });
}
function timeAgo(ts) {
  const s = Math.floor((Date.now() - ts) / 1e3);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
function ordinal(n) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
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
  { id: "tournament-mgmt", label: "Tournaments", icon: "🏆", desc: "Manage tournaments" },
  { id: "logs", label: "Activity Logs", icon: "📊", desc: "Audit trail" },
  { id: "repo-history", label: "Repo History", icon: "🕓", desc: "Reset history" },
  { id: "credentials", label: "Credentials", icon: "🔐", desc: "Manage admin auth" },
  { id: "github-sync", label: "GitHub Sync", icon: "☁️", desc: "Sync Center" }
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
  "tournament-mgmt": { title: "Tournament Management", subtitle: "Create tournaments, manage teams, brackets, matches, prizes and announcements" },
  "logs": { title: "Activity Logs", subtitle: "Full audit trail of all admin actions" },
  "github-sync": { title: "GitHub Sync Center", subtitle: "Professional synchronization dashboard — push, validate, rollback" },
  "repo-history": { title: "Repository History Management", subtitle: "Reset commit history while preserving all project files" },
  "credentials": { title: "Credentials Manager", subtitle: "Manage admin username and dual-password authentication" }
};
function SectionContent({ section, admin, setSection }) {
  switch (section) {
    case "dashboard":
      return /* @__PURE__ */ jsx(Dashboard, { admin, setSection });
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
    case "tournament-mgmt":
      return /* @__PURE__ */ jsx(TournamentManager, { admin });
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
      /* @__PURE__ */ jsx("main", { className: "flex-1 p-6 overflow-y-auto", children: /* @__PURE__ */ jsx(SectionContent, { section, admin: session.username, setSection }) })
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
