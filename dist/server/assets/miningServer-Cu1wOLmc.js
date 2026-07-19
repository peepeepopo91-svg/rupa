import { c as createServerRpc } from "./createServerRpc-D_-6bKnO.js";
import { z } from "zod";
import { readFileSync as readFileSync$1, mkdirSync, writeFileSync, renameSync } from "fs";
import { resolve as resolve$1 } from "path";
import { c as catchUpUser, R as RIG_TIERS, M as MINING_CONSTANTS } from "./miningStore-B8AuPTlT.js";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { c as commitFiles } from "./github-D233YMfU.js";
import { c as createServerFn } from "../server.js";
import "./syncStore-C_ozCmAO.js";
import "react";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "seroval";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "@tanstack/react-router";
import "react/jsx-runtime";
import "@tanstack/react-router/ssr/server";
function getClients() {
  if (!globalThis.__miningSSEClients) {
    globalThis.__miningSSEClients = /* @__PURE__ */ new Set();
  }
  return globalThis.__miningSSEClients;
}
function broadcastMiningUpdate() {
  const msg = "event: mining_updated\ndata: 1\n\n";
  const clients = getClients();
  for (const write of clients) {
    try {
      write(msg);
    } catch {
      clients.delete(write);
    }
  }
}
const DATA_DIR$1 = resolve("data");
const DEBOUNCE_MS = 45e3;
const MAX_RETRIES = 5;
const MINING_FILES = [
  { local: "mining-users.json", repo: "data/mining-users.json" },
  { local: "mining-community.json", repo: "data/mining-community.json" }
];
let debounceTimer = null;
let lastCommittedHash = null;
let retryCount = 0;
let pendingRetryTimer = null;
function readFile(name) {
  try {
    return readFileSync(resolve(DATA_DIR$1, name), "utf8");
  } catch {
    return "";
  }
}
function syncLocalHead() {
  const cwd = process.cwd();
  const opts = { cwd, encoding: "utf8", timeout: 15e3 };
  spawnSync("git", ["fetch", "origin", "--quiet"], opts);
  spawnSync("git", ["reset", "--mixed", "origin/main"], opts);
}
function contentHash() {
  return createHash("sha256").update(MINING_FILES.map((f) => readFile(f.local)).join("\0")).digest("hex");
}
async function runBackup() {
  const hash = contentHash();
  if (hash === lastCommittedHash) return;
  const files = MINING_FILES.map((f) => ({ path: f.repo, content: readFile(f.local) })).filter((f) => f.content.length > 0);
  if (files.length === 0) return;
  try {
    await commitFiles(
      files,
      `[auto] Mining data backup ${(/* @__PURE__ */ new Date()).toISOString().slice(0, 16).replace("T", " ")} UTC`
    );
    lastCommittedHash = hash;
    retryCount = 0;
    syncLocalHead();
  } catch {
    retryCount = Math.min(retryCount + 1, MAX_RETRIES);
    if (retryCount <= MAX_RETRIES) {
      const delay = Math.min(3e4 * retryCount, 3e5);
      if (pendingRetryTimer) clearTimeout(pendingRetryTimer);
      pendingRetryTimer = setTimeout(async () => {
        pendingRetryTimer = null;
        await runBackup();
      }, delay);
    }
  }
}
function scheduleBackup() {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(async () => {
    debounceTimer = null;
    await runBackup();
  }, DEBOUNCE_MS);
}
async function flushBackupNow() {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
  if (pendingRetryTimer) {
    clearTimeout(pendingRetryTimer);
    pendingRetryTimer = null;
  }
  await runBackup();
}
if (typeof process !== "undefined") {
  const shutdown = async (signal) => {
    try {
      await flushBackupNow();
    } catch {
    }
    process.exit(signal === "SIGINT" ? 130 : 0);
  };
  process.once("SIGTERM", () => shutdown("SIGTERM"));
  process.once("SIGINT", () => shutdown("SIGINT"));
}
const DATA_DIR = resolve$1("data");
function readJson(file) {
  try {
    return JSON.parse(readFileSync$1(resolve$1(DATA_DIR, file), "utf8"));
  } catch {
    return null;
  }
}
function atomicWrite(file, data) {
  mkdirSync(DATA_DIR, {
    recursive: true
  });
  const content = JSON.stringify(data, null, 2);
  const target = resolve$1(DATA_DIR, file);
  const tmp = `${target}.tmp`;
  writeFileSync(tmp, content, "utf8");
  renameSync(tmp, target);
}
function loadMiningUsers() {
  return readJson("mining-users.json") ?? {};
}
function loadCommunityState() {
  const saved = readJson("mining-community.json");
  if (saved) return saved;
  const initial = {
    blockNumber: 1,
    startedAt: Date.now(),
    lastSolvedAt: Date.now() - MINING_CONSTANTS.BLOCK_INTERVAL_MS,
    totalSolved: 0
  };
  atomicWrite("mining-community.json", initial);
  return initial;
}
const getServerNow_createServerFn_handler = createServerRpc({
  id: "9c403a0b1baaa9eb01522526a02467b0bbe7366ce94755351c706515263f9ab1",
  name: "getServerNow",
  filename: "src/server/miningServer.ts"
}, (opts) => getServerNow.__executeServer(opts));
const getServerNow = createServerFn({
  method: "GET"
}).handler(getServerNow_createServerFn_handler, () => ({
  now: Date.now()
}));
const serverCatchUp_createServerFn_handler = createServerRpc({
  id: "ccdb6274a919b4e64faac8870a35fdd9f2379e43902fbc073e763702f8e0edb1",
  name: "serverCatchUp",
  filename: "src/server/miningServer.ts"
}, (opts) => serverCatchUp.__executeServer(opts));
const serverCatchUp = createServerFn({
  method: "POST"
}).inputValidator(z.object({
  username: z.string(),
  seedUser: z.any().optional()
})).handler(serverCatchUp_createServerFn_handler, async ({
  data
}) => {
  const serverNow = Date.now();
  const key = data.username.toLowerCase();
  const users = loadMiningUsers();
  const community = loadCommunityState();
  const economy = readJson("economy.json") ?? {};
  const stored = users[key] ?? data.seedUser ?? null;
  if (!stored) return {
    user: null,
    community,
    serverNow
  };
  const {
    user: updatedUser,
    community: updatedCommunity
  } = catchUpUser(stored, serverNow, {
    community,
    overrides: economy
  });
  users[key] = updatedUser;
  atomicWrite("mining-users.json", users);
  atomicWrite("mining-community.json", updatedCommunity);
  broadcastMiningUpdate();
  scheduleBackup();
  return {
    user: updatedUser,
    community: updatedCommunity,
    serverNow
  };
});
const saveMiningUser_createServerFn_handler = createServerRpc({
  id: "8de7a5ffa64cbe7de66496bd09cd405c8c5bbd016fc0db22792f19363f0ae2c2",
  name: "saveMiningUser",
  filename: "src/server/miningServer.ts"
}, (opts) => saveMiningUser.__executeServer(opts));
const saveMiningUser = createServerFn({
  method: "POST"
}).inputValidator(z.object({
  user: z.any()
})).handler(saveMiningUser_createServerFn_handler, async ({
  data
}) => {
  const user = data.user;
  const users = loadMiningUsers();
  users[user.username.toLowerCase()] = user;
  atomicWrite("mining-users.json", users);
  broadcastMiningUpdate();
  scheduleBackup();
  return {
    ok: true
  };
});
const getAllMiningUsers_createServerFn_handler = createServerRpc({
  id: "450e0a26a740dcd825927e9bc6d268f76e8a10fd98c7ba9b681fe818d0b5015b",
  name: "getAllMiningUsers",
  filename: "src/server/miningServer.ts"
}, (opts) => getAllMiningUsers.__executeServer(opts));
const getAllMiningUsers = createServerFn({
  method: "GET"
}).handler(getAllMiningUsers_createServerFn_handler, async () => {
  return loadMiningUsers();
});
const adminUpdateMiningUser_createServerFn_handler = createServerRpc({
  id: "8e3d970b0a3780ca5ee670f87b0ba84cb45748760c3b1b1be58131158580b660",
  name: "adminUpdateMiningUser",
  filename: "src/server/miningServer.ts"
}, (opts) => adminUpdateMiningUser.__executeServer(opts));
const adminUpdateMiningUser = createServerFn({
  method: "POST"
}).inputValidator(z.object({
  user: z.any()
})).handler(adminUpdateMiningUser_createServerFn_handler, async ({
  data
}) => {
  const user = data.user;
  const users = loadMiningUsers();
  users[user.username.toLowerCase()] = user;
  atomicWrite("mining-users.json", users);
  broadcastMiningUpdate();
  scheduleBackup();
  return {
    ok: true
  };
});
const getLeaderboard_createServerFn_handler = createServerRpc({
  id: "7fa8b3cbd5fc8f402a586f9817e3556e666bae0870bfdf16a35ee35117771bb1",
  name: "getLeaderboard",
  filename: "src/server/miningServer.ts"
}, (opts) => getLeaderboard.__executeServer(opts));
const getLeaderboard = createServerFn({
  method: "GET"
}).handler(getLeaderboard_createServerFn_handler, async () => {
  const users = loadMiningUsers();
  const entries = Object.values(users).map((user) => {
    const activeRigs = user.rigs.filter((r) => r.status === "mining");
    const miningPower = activeRigs.reduce((sum, r) => {
      const tier = RIG_TIERS.find((t) => t.id === r.tierId);
      return sum + (tier?.hashrate ?? 0);
    }, 0);
    const blockRewards = user.rewardHistory.reduce((sum, r) => sum + r.amount, 0);
    return {
      rank: 0,
      // filled below
      username: user.username,
      balance: Math.floor(user.balance),
      gems: Math.floor(user.gems ?? 0),
      totalRigs: user.rigs.length,
      activeRigs: activeRigs.length,
      miningPower,
      blockRewards
    };
  });
  entries.sort((a, b) => b.balance - a.balance || b.blockRewards - a.blockRewards);
  entries.forEach((e, i) => {
    e.rank = i + 1;
  });
  return entries;
});
const adminDeleteMiningUser_createServerFn_handler = createServerRpc({
  id: "2a08d77084734e5724f0b7c889d954a908a3bb05d5c0b96eecc2c94776f3daa7",
  name: "adminDeleteMiningUser",
  filename: "src/server/miningServer.ts"
}, (opts) => adminDeleteMiningUser.__executeServer(opts));
const adminDeleteMiningUser = createServerFn({
  method: "POST"
}).inputValidator(z.object({
  username: z.string()
})).handler(adminDeleteMiningUser_createServerFn_handler, async ({
  data
}) => {
  const users = loadMiningUsers();
  delete users[data.username.toLowerCase()];
  atomicWrite("mining-users.json", users);
  broadcastMiningUpdate();
  scheduleBackup();
  return {
    ok: true
  };
});
export {
  adminDeleteMiningUser_createServerFn_handler,
  adminUpdateMiningUser_createServerFn_handler,
  getAllMiningUsers_createServerFn_handler,
  getLeaderboard_createServerFn_handler,
  getServerNow_createServerFn_handler,
  saveMiningUser_createServerFn_handler,
  serverCatchUp_createServerFn_handler
};
