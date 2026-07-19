import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { N as Navbar, F as Footer } from "./Footer-CVsQY5Et.js";
import { useState, useRef, useCallback, useEffect } from "react";
import { u as useMining, M as MiningProvider, a as MiningToast } from "./MiningToast-Celn-pZ8.js";
import { R as RIG_TIERS, M as MINING_CONSTANTS } from "./miningStore-BH0mJpub.js";
import { g as getLeaderboard } from "./miningServer-CngrlAXe.js";
import "@tanstack/react-router";
import "./contentStore-BHVkzjvQ.js";
import "./syncStore-C_ozCmAO.js";
import "./router-Drx0aV7R.js";
import "../server.js";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "seroval";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "@tanstack/react-router/ssr/server";
import "zod";
function LoginPanel() {
  const { login } = useMining();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const handle = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await login(username, password);
    if (result.error) setError(result.error);
    setLoading(false);
  };
  return /* @__PURE__ */ jsx("div", { className: "flex flex-col items-center justify-center min-h-[60vh] px-4", children: /* @__PURE__ */ jsxs("div", { className: "w-full max-w-md", children: [
    /* @__PURE__ */ jsx("div", { className: "absolute left-1/2 -translate-x-1/2 w-72 h-72 bg-[#0066FF]/15 blur-[80px] rounded-full pointer-events-none" }),
    /* @__PURE__ */ jsxs("div", { className: "relative glass rounded-2xl border border-white/8 p-8 shadow-2xl shadow-black/60", children: [
      /* @__PURE__ */ jsx(
        "div",
        {
          className: "w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-6 mx-auto",
          style: { background: "linear-gradient(135deg,#0099FF22,#0066FF33)", boxShadow: "0 0 30px rgba(0,102,255,0.2)" },
          children: "⛏️"
        }
      ),
      /* @__PURE__ */ jsxs("h2", { className: "font-['Space_Grotesk'] font-black text-2xl text-white text-center mb-1", children: [
        "BlueCoin ",
        /* @__PURE__ */ jsx("span", { className: "text-gradient", children: "Mining" })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-500 text-sm text-center mb-8", children: "Enter your credentials to access the mining network" }),
      /* @__PURE__ */ jsxs("form", { onSubmit: handle, className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2", children: "Username" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              value: username,
              onChange: (e) => {
                setUsername(e.target.value);
                setError("");
              },
              placeholder: "Your username",
              autoComplete: "username",
              autoFocus: true,
              className: "w-full bg-white/3 border border-white/10 hover:border-white/20 focus:border-[#00BFFF]/50 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none transition-all duration-200 text-sm"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2", children: "Password" }),
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: showPass ? "text" : "password",
                value: password,
                onChange: (e) => {
                  setPassword(e.target.value);
                  setError("");
                },
                placeholder: "Your password",
                autoComplete: "current-password",
                className: "w-full bg-white/3 border border-white/10 hover:border-white/20 focus:border-[#00BFFF]/50 rounded-xl px-4 py-3 pr-11 text-white placeholder-gray-600 outline-none transition-all duration-200 text-sm"
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: () => setShowPass((v) => !v),
                className: "absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors text-sm",
                tabIndex: -1,
                "aria-label": showPass ? "Hide password" : "Show password",
                children: showPass ? "🙈" : "👁️"
              }
            )
          ] })
        ] }),
        error && /* @__PURE__ */ jsxs("p", { className: "text-red-400 text-xs font-medium flex items-center gap-1 -mt-1", children: [
          /* @__PURE__ */ jsx("span", { children: "⚠" }),
          " ",
          error
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "submit",
            disabled: !username.trim() || !password || loading,
            className: "btn-primary w-full py-3 rounded-xl font-semibold text-sm text-white transition-all duration-300 disabled:opacity-40 disabled:pointer-events-none relative overflow-hidden",
            children: loading ? /* @__PURE__ */ jsxs("span", { className: "flex items-center justify-center gap-2", children: [
              /* @__PURE__ */ jsx("span", { className: "w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" }),
              "Verifying…"
            ] }) : "Enter Mining Network →"
          }
        )
      ] }),
      /* @__PURE__ */ jsx("div", { className: "mt-6 pt-5 border-t border-white/5 space-y-2", children: [
        "🔒 Access is restricted to authorised accounts",
        "🔄 Your mining progress is saved automatically"
      ].map((txt) => /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-xs flex items-start gap-2", children: txt }, txt)) })
    ] })
  ] }) });
}
function UserStatsBar() {
  const { user, logout } = useMining();
  if (!user) return null;
  const activeRigs = user.rigs.filter((r) => r.status === "mining");
  const totalHashrate = activeRigs.reduce((sum, r) => {
    const tier = RIG_TIERS.find((t) => t.id === r.tierId);
    return sum + tier.hashrate;
  }, 0);
  const stats = [
    { label: "BlueCoin", value: Math.floor(user.balance).toLocaleString(), suffix: "BC", icon: "💎", glow: "rgba(0,191,255,0.3)" },
    { label: "Gems", value: Math.floor(user.gems ?? 0).toLocaleString(), suffix: "💎", icon: "✨", glow: "rgba(167,139,250,0.3)" },
    { label: "Hashrate", value: totalHashrate.toString(), suffix: "GH/s", icon: "⚡", glow: "rgba(250,204,21,0.3)" },
    { label: "Active Rigs", value: activeRigs.length.toString(), suffix: `/${user.rigs.length}`, icon: "⛏️", glow: "rgba(0,191,255,0.2)" }
  ];
  return /* @__PURE__ */ jsx("div", { className: "px-4 pb-6", children: /* @__PURE__ */ jsx("div", { className: "max-w-6xl mx-auto", children: /* @__PURE__ */ jsx("div", { className: "glass rounded-2xl border border-white/8 p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center gap-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 sm:border-r sm:border-white/8 sm:pr-6", children: [
      /* @__PURE__ */ jsx("div", { className: "w-9 h-9 rounded-xl bg-[#00BFFF]/10 border border-[#00BFFF]/20 flex items-center justify-center text-sm font-black text-[#00BFFF]", children: user.username[0].toUpperCase() }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "text-white text-sm font-bold", children: user.username }),
        /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-[10px] uppercase tracking-wide", children: "Miner" })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1", children: stats.map((s) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsx("span", { className: "text-lg", children: s.icon }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "text-[10px] text-gray-600 uppercase tracking-wide", children: s.label }),
        /* @__PURE__ */ jsxs("p", { className: "text-white text-sm font-bold leading-none", children: [
          s.value,
          /* @__PURE__ */ jsx("span", { className: "text-gray-500 text-[10px] font-normal ml-1", children: s.suffix })
        ] })
      ] })
    ] }, s.label)) }),
    /* @__PURE__ */ jsx(
      "button",
      {
        onClick: logout,
        className: "sm:ml-auto px-3 py-1.5 rounded-lg text-xs text-gray-500 hover:text-white hover:bg-white/5 border border-white/8 hover:border-white/20 transition-all duration-200",
        children: "Log out"
      }
    )
  ] }) }) }) });
}
function fmt(ms) {
  const s = Math.floor(ms / 1e3);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}h ${m % 60}m`;
  return `${String(m).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}
const DISTRIBUTION = [
  { label: "Finder's Bonus", pct: 25, color: "#F59E0B", textColor: "text-yellow-400", desc: "Block solver" },
  { label: "Equal Split", pct: 25, color: "#60A5FA", textColor: "text-blue-400", desc: "All miners" },
  { label: "Hashrate Share", pct: 50, color: "#00BFFF", textColor: "text-[#00BFFF]", desc: "By GH/s power" }
];
function BlockProgress() {
  const { community, nextBlockIn } = useMining();
  if (!community) return null;
  const progress = 1 - nextBlockIn / MINING_CONSTANTS.BLOCK_INTERVAL_MS;
  const R = 54;
  const C = 2 * Math.PI * R;
  const dash = C * (1 - progress);
  return /* @__PURE__ */ jsx("section", { className: "px-4 pb-8", children: /* @__PURE__ */ jsx("div", { className: "max-w-6xl mx-auto", children: /* @__PURE__ */ jsx("div", { className: "glass rounded-2xl border border-white/8 overflow-hidden", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col lg:flex-row", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center p-8 lg:w-72 border-b lg:border-b-0 lg:border-r border-white/5", children: [
      /* @__PURE__ */ jsx("p", { className: "text-[10px] text-gray-600 uppercase tracking-widest mb-4", children: "Next Block" }),
      /* @__PURE__ */ jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsxs("svg", { width: "128", height: "128", viewBox: "0 0 128 128", className: "-rotate-90", children: [
          /* @__PURE__ */ jsx("circle", { cx: "64", cy: "64", r: R, fill: "none", stroke: "rgba(255,255,255,0.05)", strokeWidth: "8" }),
          /* @__PURE__ */ jsx(
            "circle",
            {
              cx: "64",
              cy: "64",
              r: R,
              fill: "none",
              stroke: "url(#ringGrad)",
              strokeWidth: "8",
              strokeLinecap: "round",
              strokeDasharray: C,
              strokeDashoffset: dash,
              style: { transition: "stroke-dashoffset 1s linear" }
            }
          ),
          /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsxs("linearGradient", { id: "ringGrad", x1: "0%", y1: "0%", x2: "100%", y2: "0%", children: [
            /* @__PURE__ */ jsx("stop", { offset: "0%", stopColor: "#00BFFF" }),
            /* @__PURE__ */ jsx("stop", { offset: "100%", stopColor: "#0066FF" })
          ] }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "absolute inset-0 flex flex-col items-center justify-center", children: [
          /* @__PURE__ */ jsx("span", { className: "font-['Space_Grotesk'] font-black text-2xl text-white tabular-nums", children: fmt(nextBlockIn) }),
          /* @__PURE__ */ jsx("span", { className: "text-[9px] text-gray-600 uppercase tracking-wide mt-0.5", children: "remaining" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-4 text-center", children: [
        /* @__PURE__ */ jsxs("p", { className: "text-[#00BFFF] font-bold text-sm", children: [
          "Block #",
          community.blockNumber
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-gray-600 text-[10px] mt-0.5", children: [
          community.totalSolved,
          " solved total"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-3 px-4 py-2 rounded-lg bg-[#00BFFF]/8 border border-[#00BFFF]/15 text-center", children: [
        /* @__PURE__ */ jsx("p", { className: "text-[10px] text-gray-500 uppercase tracking-wide", children: "Block Reward" }),
        /* @__PURE__ */ jsxs("p", { className: "text-[#00BFFF] font-bold text-lg", children: [
          MINING_CONSTANTS.BLOCK_REWARD,
          " ",
          /* @__PURE__ */ jsx("span", { className: "text-xs font-normal", children: "BC" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex-1 flex flex-col justify-center px-8 py-7", children: [
      /* @__PURE__ */ jsx("p", { className: "text-[10px] text-gray-600 uppercase tracking-widest mb-5", children: "Reward Distribution" }),
      /* @__PURE__ */ jsx("div", { className: "space-y-4", children: DISTRIBUTION.map((d) => /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-1.5", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(
              "span",
              {
                className: "w-2 h-2 rounded-full flex-shrink-0",
                style: { background: d.color, boxShadow: `0 0 6px ${d.color}80` }
              }
            ),
            /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-300 font-medium", children: d.label }),
            /* @__PURE__ */ jsxs("span", { className: "text-[10px] text-gray-600 hidden sm:inline", children: [
              "— ",
              d.desc
            ] })
          ] }),
          /* @__PURE__ */ jsxs("span", { className: `text-xs font-bold tabular-nums ${d.textColor}`, children: [
            d.pct,
            "%"
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "h-1.5 rounded-full bg-white/5 overflow-hidden", children: /* @__PURE__ */ jsx(
          "div",
          {
            className: "h-full rounded-full transition-all duration-700",
            style: { width: `${d.pct}%`, background: `linear-gradient(90deg, ${d.color}cc, ${d.color})` }
          }
        ) })
      ] }, d.label)) }),
      /* @__PURE__ */ jsx("p", { className: "text-[10px] text-gray-700 mt-5 leading-relaxed", children: "Each block reward is split between the solver, all active miners equally, and miners weighted by hashrate." })
    ] })
  ] }) }) }) });
}
function DurabilityBar({ durability, max }) {
  const pct = durability / max * 100;
  const color = pct > 50 ? "#00BFFF" : pct > 20 ? "#f59e0b" : "#ef4444";
  return /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
      /* @__PURE__ */ jsx("span", { className: "text-[10px] text-gray-600 uppercase tracking-wide", children: "Durability" }),
      /* @__PURE__ */ jsxs("span", { className: "text-[11px] font-semibold", style: { color }, children: [
        pct.toFixed(1),
        "%"
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "h-1.5 rounded-full bg-white/5 overflow-hidden", children: /* @__PURE__ */ jsx(
      "div",
      {
        className: "h-full rounded-full transition-all duration-700",
        style: { width: `${pct}%`, background: color, boxShadow: `0 0 6px ${color}80` }
      }
    ) })
  ] });
}
function RigCard({ rig }) {
  const { startRig, stopRig, repairUserRig, sellUserRig, user } = useMining();
  const [confirmSell, setConfirmSell] = useState(false);
  const [err, setErr] = useState("");
  const tier = RIG_TIERS.find((t) => t.id === rig.tierId);
  rig.durability / tier.maxDurability * 100;
  const damage = tier.maxDurability - rig.durability;
  const repairCost = Math.ceil(damage / tier.maxDurability * tier.cost * MINING_CONSTANTS.REPAIR_COST_PCT);
  const salePrice = Math.floor(tier.cost * MINING_CONSTANTS.SELL_MAX_PCT * (rig.durability / tier.maxDurability));
  const isBroken = rig.status === "broken";
  const isMining = rig.status === "mining";
  const canAffordRepair = (user?.balance ?? 0) >= repairCost;
  function doRepair() {
    const result = repairUserRig(rig.id);
    if (result.error) setErr(result.error);
    else setErr("");
  }
  function doSell() {
    if (!confirmSell) {
      setConfirmSell(true);
      return;
    }
    sellUserRig(rig.id);
  }
  const statusConfig = {
    idle: { label: "Idle", dot: "bg-gray-500", badge: "bg-gray-500/10 text-gray-400 border-gray-500/20" },
    mining: { label: "Mining", dot: "bg-[#00BFFF] animate-pulse", badge: "bg-[#00BFFF]/10 text-[#00BFFF] border-[#00BFFF]/20" },
    broken: { label: "Broken", dot: "bg-red-500", badge: "bg-red-500/10 text-red-400 border-red-500/20" }
  }[rig.status];
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: `relative glass rounded-2xl border transition-all duration-300 p-5 flex flex-col gap-4 ${isBroken ? "border-red-500/20" : isMining ? "border-[#00BFFF]/20" : "border-white/8"}`,
      style: isMining ? { boxShadow: `0 0 20px ${tier.glowColor}` } : void 0,
      children: [
        isMining && /* @__PURE__ */ jsx(
          "div",
          {
            className: "absolute inset-0 rounded-2xl pointer-events-none",
            style: { background: `radial-gradient(ellipse at top, ${tier.glowColor} 0%, transparent 70%)`, opacity: 0.15 }
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2.5", children: [
            /* @__PURE__ */ jsx("span", { className: "text-2xl", children: tier.emoji }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: `font-bold text-sm leading-tight ${tier.color}`, children: tier.name }),
              /* @__PURE__ */ jsxs("p", { className: "text-[10px] text-gray-600 mt-0.5", children: [
                tier.hashrate,
                " GH/s"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("span", { className: `flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[10px] font-semibold ${statusConfig.badge}`, children: [
            /* @__PURE__ */ jsx("span", { className: `w-1.5 h-1.5 rounded-full ${statusConfig.dot}` }),
            statusConfig.label
          ] })
        ] }),
        /* @__PURE__ */ jsx(DurabilityBar, { durability: rig.durability, max: tier.maxDurability }),
        err && /* @__PURE__ */ jsxs("p", { className: "text-red-400 text-[11px] bg-red-500/10 rounded-lg px-3 py-2 border border-red-500/20", children: [
          "⚠ ",
          err
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2 mt-auto", children: [
          isBroken ? /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: doRepair,
              disabled: !canAffordRepair,
              className: "btn-primary w-full py-2 rounded-xl text-xs font-semibold text-white transition-all disabled:opacity-40 disabled:pointer-events-none",
              children: [
                "🔧 Repair (",
                repairCost,
                " BC)"
              ]
            }
          ) : isMining ? /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => stopRig(rig.id),
              className: "w-full py-2 rounded-xl text-xs font-semibold bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10 hover:text-white transition-all",
              children: "⏸ Stop Mining"
            }
          ) : /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => startRig(rig.id),
              className: "btn-primary w-full py-2 rounded-xl text-xs font-semibold text-white transition-all",
              children: "▶ Start Mining"
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
            !isBroken && damage > 0 && /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: doRepair,
                disabled: !canAffordRepair,
                title: `Repair for ${repairCost} BC`,
                className: "flex-1 py-1.5 rounded-lg text-[10px] font-semibold bg-white/3 text-gray-500 border border-white/8 hover:text-white hover:border-white/20 transition-all disabled:opacity-30 disabled:pointer-events-none",
                children: [
                  "🔧 ",
                  repairCost,
                  " BC"
                ]
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: doSell,
                onBlur: () => setTimeout(() => setConfirmSell(false), 200),
                className: `flex-1 py-1.5 rounded-lg text-[10px] font-semibold border transition-all ${confirmSell ? "bg-red-500/15 text-red-400 border-red-500/30 hover:bg-red-500/25" : "bg-white/3 text-gray-500 border-white/8 hover:text-white hover:border-white/20"}`,
                children: confirmSell ? "⚠ Confirm Sell" : `💰 Sell (${salePrice} BC)`
              }
            )
          ] })
        ] })
      ]
    }
  );
}
function RigShop() {
  const { user, purchaseRig } = useMining();
  const [buying, setBuying] = useState(null);
  const [errors, setErrors] = useState({});
  async function handleBuy(tierId) {
    setBuying(tierId);
    setErrors((e) => ({ ...e, [tierId]: "" }));
    const result = await purchaseRig(tierId);
    if (result.error) setErrors((e) => ({ ...e, [tierId]: result.error }));
    setBuying(null);
  }
  const MAX_RIGS = 10;
  const totalRigs = user?.rigs.length ?? 0;
  const atLimit = totalRigs >= MAX_RIGS;
  const ownedCounts = RIG_TIERS.reduce((acc, t) => {
    acc[t.id] = user?.rigs.filter((r) => r.tierId === t.id).length ?? 0;
    return acc;
  }, {});
  return /* @__PURE__ */ jsx("section", { className: "px-4 pb-16", children: /* @__PURE__ */ jsxs("div", { className: "max-w-6xl mx-auto", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-5", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("h2", { className: "font-['Space_Grotesk'] font-bold text-xl text-white", children: [
          "Rig ",
          /* @__PURE__ */ jsx("span", { className: "text-gradient", children: "Shop" })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-xs mt-0.5", children: "Purchase mining hardware to grow your hashrate" })
      ] }),
      user && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#00BFFF]/8 border border-[#00BFFF]/15", children: [
          /* @__PURE__ */ jsx("span", { className: "text-[#00BFFF] text-sm font-bold", children: Math.floor(user.balance).toLocaleString() }),
          /* @__PURE__ */ jsx("span", { className: "text-gray-500 text-xs", children: "BC available" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: `flex items-center gap-2 px-3 py-1.5 rounded-lg border ${atLimit ? "bg-red-500/8 border-red-500/25" : "bg-white/3 border-white/8"}`, children: [
          /* @__PURE__ */ jsx("span", { className: `text-sm font-bold tabular-nums ${atLimit ? "text-red-400" : "text-gray-300"}`, children: totalRigs }),
          /* @__PURE__ */ jsxs("span", { className: "text-gray-500 text-xs", children: [
            "/ ",
            MAX_RIGS,
            " rigs"
          ] })
        ] })
      ] })
    ] }),
    atLimit && user && /* @__PURE__ */ jsxs("div", { className: "mb-5 flex items-center gap-3 px-4 py-3 rounded-xl border border-red-500/20 bg-red-500/6", children: [
      /* @__PURE__ */ jsx("span", { className: "text-red-400 text-lg shrink-0", children: "⛔" }),
      /* @__PURE__ */ jsxs("p", { className: "text-red-400 text-sm font-semibold", children: [
        "You have reached the maximum limit of ",
        MAX_RIGS,
        " mining rigs.",
        /* @__PURE__ */ jsx("span", { className: "block text-red-400/60 text-xs font-normal mt-0.5", children: "Sell an existing rig to purchase a new one." })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4", children: RIG_TIERS.map((tier) => {
      const canAfford = (user?.balance ?? 0) >= tier.cost;
      const owned = ownedCounts[tier.id];
      const isBuying = buying === tier.id;
      const errMsg = errors[tier.id];
      const daysEstimate = (tier.maxDurability / tier.lossPerSecond / 86400).toFixed(1);
      return /* @__PURE__ */ jsxs(
        "div",
        {
          className: `relative glass rounded-2xl border p-5 flex flex-col gap-3 transition-all duration-300 group ${tier.borderColor}`,
          style: canAfford && user ? { boxShadow: `0 0 20px ${tier.glowColor}` } : void 0,
          children: [
            /* @__PURE__ */ jsx(
              "div",
              {
                className: "absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                style: { background: `radial-gradient(ellipse at top, ${tier.glowColor} 0%, transparent 70%)`, opacity: 0.08 }
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsx("span", { className: "text-3xl", children: tier.emoji }),
              owned > 0 && /* @__PURE__ */ jsxs("span", { className: "px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#00BFFF]/10 text-[#00BFFF] border border-[#00BFFF]/20", children: [
                "Owned: ",
                owned
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: `font-bold text-sm ${tier.color}`, children: tier.name }),
              /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-[10px] mt-1 leading-relaxed", children: tier.description })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "space-y-1.5 py-3 border-t border-b border-white/5", children: [
              { label: "Hashrate", value: `${tier.hashrate} GH/s` },
              { label: "Lifespan", value: `~${daysEstimate} days` },
              { label: "Repair", value: `${Math.round(tier.cost * 0.35)} BC full` }
            ].map((s) => /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
              /* @__PURE__ */ jsx("span", { className: "text-[10px] text-gray-600", children: s.label }),
              /* @__PURE__ */ jsx("span", { className: "text-[11px] text-gray-300 font-medium", children: s.value })
            ] }, s.label)) }),
            /* @__PURE__ */ jsxs("div", { className: "mt-auto", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-baseline gap-1 mb-2.5", children: [
                /* @__PURE__ */ jsx("span", { className: `text-xl font-black ${tier.color}`, children: tier.cost.toLocaleString() }),
                /* @__PURE__ */ jsx("span", { className: "text-gray-500 text-xs", children: "BC" })
              ] }),
              errMsg && /* @__PURE__ */ jsxs("p", { className: "text-red-400 text-[10px] mb-2", children: [
                "⚠ ",
                errMsg
              ] }),
              !user ? /* @__PURE__ */ jsx("div", { className: "w-full py-2 rounded-xl text-[11px] text-center text-gray-600 border border-white/8", children: "Login to purchase" }) : atLimit ? /* @__PURE__ */ jsx("div", { className: "w-full py-2 rounded-xl text-[11px] text-center text-red-400/60 border border-red-500/15 bg-red-500/4 cursor-not-allowed", children: "Rig limit reached" }) : /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => handleBuy(tier.id),
                  disabled: !canAfford || isBuying,
                  className: `w-full py-2 rounded-xl text-[11px] font-semibold transition-all duration-200 ${canAfford ? "btn-primary text-white" : "bg-white/3 text-gray-600 border border-white/8 cursor-not-allowed"}`,
                  children: isBuying ? /* @__PURE__ */ jsxs("span", { className: "flex items-center justify-center gap-1.5", children: [
                    /* @__PURE__ */ jsx("span", { className: "w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" }),
                    "Buying…"
                  ] }) : canAfford ? "Buy Now" : `Need ${(tier.cost - Math.floor(user.balance)).toLocaleString()} more BC`
                }
              )
            ] })
          ]
        },
        tier.id
      );
    }) })
  ] }) });
}
const MEDAL = {
  1: { emoji: "🥇", color: "text-yellow-400", bg: "bg-yellow-500/8", border: "border-yellow-500/20" },
  2: { emoji: "🥈", color: "text-gray-300", bg: "bg-gray-500/8", border: "border-gray-500/20" },
  3: { emoji: "🥉", color: "text-orange-400", bg: "bg-orange-500/8", border: "border-orange-500/20" }
};
function RankBadge({ rank }) {
  const m = MEDAL[rank];
  if (m) {
    return /* @__PURE__ */ jsx("span", { className: `inline-flex items-center justify-center w-7 h-7 rounded-lg text-base ${m.bg} border ${m.border}`, children: m.emoji });
  }
  return /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center justify-center w-7 h-7 rounded-lg bg-white/3 border border-white/8 text-[11px] font-mono text-gray-500", children: [
    "#",
    rank
  ] });
}
function PowerBar({ power, max }) {
  const pct = max > 0 ? power / max * 100 : 0;
  return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
    /* @__PURE__ */ jsx("div", { className: "w-16 h-1.5 rounded-full bg-white/5 overflow-hidden", children: /* @__PURE__ */ jsx(
      "div",
      {
        className: "h-full rounded-full transition-all duration-700",
        style: {
          width: `${pct}%`,
          background: power > 0 ? "linear-gradient(90deg, #00BFFF, #0066FF)" : "transparent"
        }
      }
    ) }),
    /* @__PURE__ */ jsx("span", { className: "text-[11px] text-gray-500 tabular-nums w-14 text-right", children: power > 0 ? `${power} GH/s` : "—" })
  ] });
}
function TopRigBadge({ entry }) {
  if (entry.totalRigs === 0) return /* @__PURE__ */ jsx("span", { className: "text-gray-700 text-xs", children: "—" });
  return /* @__PURE__ */ jsxs("span", { className: "text-xs text-gray-400 tabular-nums", children: [
    /* @__PURE__ */ jsx("span", { className: "text-white font-semibold", children: entry.activeRigs }),
    /* @__PURE__ */ jsxs("span", { className: "text-gray-600", children: [
      "/",
      entry.totalRigs
    ] })
  ] });
}
function MiningLeaderboard({ currentUsername }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [flashTs, setFlashTs] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(null);
  const debounceRef = useRef(null);
  const fetchLeaderboard = useCallback(async (animate = false) => {
    try {
      const data = await getLeaderboard();
      setEntries(data);
      setLastUpdated(/* @__PURE__ */ new Date());
      if (animate) setFlashTs(Date.now());
    } catch {
    }
  }, []);
  useEffect(() => {
    fetchLeaderboard().finally(() => setLoading(false));
  }, [fetchLeaderboard]);
  useEffect(() => {
    if (typeof window === "undefined") return;
    let es = null;
    let reconnectTimer = null;
    let active = true;
    function connect() {
      if (!active) return;
      es = new EventSource("/api/mining-events");
      es.addEventListener("mining_updated", () => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
          debounceRef.current = null;
          fetchLeaderboard(true);
        }, 2e3);
      });
      es.onerror = () => {
        es?.close();
        es = null;
        if (active) reconnectTimer = setTimeout(connect, 5e3);
      };
    }
    connect();
    return () => {
      active = false;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      es?.close();
    };
  }, [fetchLeaderboard]);
  const maxPower = Math.max(...entries.map((e) => e.miningPower), 0);
  const maxGems = Math.max(...entries.map((e) => e.gems), 0);
  const maxRewards = Math.max(...entries.map((e) => e.blockRewards), 0);
  const powerLeader = maxPower > 0 ? entries.find((e) => e.miningPower === maxPower) : null;
  const gemLeader = maxGems > 0 ? entries.find((e) => e.gems === maxGems) : null;
  const rewardLeader = maxRewards > 0 ? entries.find((e) => e.blockRewards === maxRewards) : null;
  function getBadges(entry) {
    const badges = [];
    if (powerLeader && entry.username === powerLeader.username && entry.rank > 3) badges.push("⚡ Power");
    if (gemLeader && entry.username === gemLeader.username && entry.rank > 3) badges.push("💎 Gems");
    if (rewardLeader && entry.username === rewardLeader.username && entry.rank > 3) badges.push("🏆 Earner");
    return badges;
  }
  const flashClass = flashTs > 0 ? "animate-pulse-once" : "";
  return /* @__PURE__ */ jsx("section", { className: "px-4 pb-10", children: /* @__PURE__ */ jsxs("div", { className: "max-w-6xl mx-auto", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-5", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("h2", { className: "font-['Space_Grotesk'] font-bold text-xl text-white", children: [
          "Global ",
          /* @__PURE__ */ jsx("span", { className: "text-gradient", children: "Leaderboard" })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-xs mt-0.5", children: entries.length === 0 && !loading ? "No miners yet — be the first!" : `Top ${entries.length} miner${entries.length !== 1 ? "s" : ""} ranked by BlueCoin balance` })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        lastUpdated && /* @__PURE__ */ jsxs("span", { className: "text-[10px] text-gray-700 hidden sm:block", children: [
          "updated ",
          lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[#00BFFF]/20 bg-[#00BFFF]/5", children: [
          /* @__PURE__ */ jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-[#00BFFF] animate-pulse" }),
          /* @__PURE__ */ jsx("span", { className: "text-[10px] text-[#00BFFF] font-semibold uppercase tracking-wide", children: "Live" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: `glass rounded-2xl border border-white/8 overflow-hidden ${flashClass}`, children: loading ? /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center py-16 gap-3", children: [
      /* @__PURE__ */ jsx("span", { className: "w-5 h-5 border-2 border-white/10 border-t-[#00BFFF] rounded-full animate-spin" }),
      /* @__PURE__ */ jsx("span", { className: "text-gray-600 text-sm", children: "Loading leaderboard…" })
    ] }) : entries.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center py-16 gap-3", children: [
      /* @__PURE__ */ jsx("span", { className: "text-4xl opacity-30", children: "⛏️" }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-500 text-sm font-medium", children: "No miners on the board yet." }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-700 text-xs", children: "Log in and start a rig to claim #1!" })
    ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-[44px_1fr_100px_80px_70px_1fr_90px] gap-2 px-4 py-2.5 border-b border-white/5 bg-white/2", children: [
        /* @__PURE__ */ jsx("span", { className: "text-[9px] text-gray-600 uppercase tracking-widest text-center", children: "Rank" }),
        /* @__PURE__ */ jsx("span", { className: "text-[9px] text-gray-600 uppercase tracking-widest", children: "Player" }),
        /* @__PURE__ */ jsx("span", { className: "text-[9px] text-gray-600 uppercase tracking-widest text-right", children: "BlueCoin" }),
        /* @__PURE__ */ jsx("span", { className: "text-[9px] text-gray-600 uppercase tracking-widest text-right hidden sm:block", children: "Gems" }),
        /* @__PURE__ */ jsx("span", { className: "text-[9px] text-gray-600 uppercase tracking-widest text-center hidden md:block", children: "Rigs" }),
        /* @__PURE__ */ jsx("span", { className: "text-[9px] text-gray-600 uppercase tracking-widest hidden lg:block", children: "Mining Power" }),
        /* @__PURE__ */ jsx("span", { className: "text-[9px] text-gray-600 uppercase tracking-widest text-right hidden md:block", children: "Earned BC" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "divide-y divide-white/[0.04]", children: entries.map((entry) => {
        const isMe = currentUsername?.toLowerCase() === entry.username.toLowerCase();
        const medal = MEDAL[entry.rank];
        const badges = getBadges(entry);
        return /* @__PURE__ */ jsxs(
          "div",
          {
            className: `grid grid-cols-[44px_1fr_100px_80px_70px_1fr_90px] gap-2 items-center px-4 py-3 transition-colors duration-200 ${isMe ? "bg-[#00BFFF]/5 border-l-2 border-[#00BFFF]/40" : medal ? "hover:bg-white/[0.02]" : "hover:bg-white/[0.015]"}`,
            children: [
              /* @__PURE__ */ jsx("div", { className: "flex justify-center", children: /* @__PURE__ */ jsx(RankBadge, { rank: entry.rank }) }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 min-w-0", children: [
                /* @__PURE__ */ jsx("div", { className: `w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-[11px] font-black ${isMe ? "bg-[#00BFFF]/15 text-[#00BFFF] border border-[#00BFFF]/30" : medal ? `${medal.bg} ${medal.color} border ${medal.border}` : "bg-white/5 text-gray-400 border border-white/8"}`, children: entry.username[0].toUpperCase() }),
                /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 flex-wrap", children: [
                    /* @__PURE__ */ jsx("span", { className: `text-sm font-semibold truncate ${isMe ? "text-[#00BFFF]" : "text-white"}`, children: entry.username }),
                    isMe && /* @__PURE__ */ jsx("span", { className: "text-[9px] px-1.5 py-0.5 rounded bg-[#00BFFF]/15 text-[#00BFFF] font-bold uppercase tracking-wide flex-shrink-0", children: "You" }),
                    badges.map((b) => /* @__PURE__ */ jsx("span", { className: "text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-gray-400 border border-white/8 font-medium flex-shrink-0 hidden sm:inline", children: b }, b))
                  ] }),
                  entry.activeRigs > 0 && /* @__PURE__ */ jsxs("span", { className: "text-[9px] text-gray-700 leading-none", children: [
                    entry.activeRigs,
                    " rig",
                    entry.activeRigs !== 1 ? "s" : "",
                    " mining"
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
                /* @__PURE__ */ jsx("span", { className: `text-sm font-bold tabular-nums ${isMe ? "text-[#00BFFF]" : "text-white"}`, children: entry.balance.toLocaleString() }),
                /* @__PURE__ */ jsx("span", { className: "text-gray-600 text-[10px] ml-1", children: "BC" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "text-right hidden sm:block", children: [
                /* @__PURE__ */ jsx("span", { className: "text-sm font-semibold tabular-nums text-purple-300", children: Math.floor(entry.gems).toLocaleString() }),
                /* @__PURE__ */ jsx("span", { className: "text-gray-600 text-[10px] ml-1", children: "💎" })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "text-center hidden md:block", children: /* @__PURE__ */ jsx(TopRigBadge, { entry }) }),
              /* @__PURE__ */ jsx("div", { className: "hidden lg:block", children: /* @__PURE__ */ jsx(PowerBar, { power: entry.miningPower, max: maxPower }) }),
              /* @__PURE__ */ jsxs("div", { className: "text-right hidden md:block", children: [
                /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold tabular-nums text-amber-400", children: entry.blockRewards.toLocaleString() }),
                /* @__PURE__ */ jsx("span", { className: "text-gray-600 text-[10px] ml-1", children: "BC" })
              ] })
            ]
          },
          entry.username
        );
      }) }),
      /* @__PURE__ */ jsx("div", { className: "px-4 py-3 border-t border-white/5 bg-white/[0.01] flex flex-wrap gap-x-5 gap-y-1", children: [
        { icon: "💎", label: "BlueCoin — current balance, primary rank metric" },
        { icon: "⚡", label: "Mining Power — active GH/s output" },
        { icon: "🏆", label: "Earned BC — total block rewards (last 50 blocks)" }
      ].map(({ icon, label }) => /* @__PURE__ */ jsxs("span", { className: "text-[9px] text-gray-700 flex items-center gap-1", children: [
        /* @__PURE__ */ jsx("span", { children: icon }),
        label
      ] }, label)) })
    ] }) })
  ] }) });
}
function formatCountdown(msRemaining) {
  if (msRemaining <= 0) return "0h 0m 0s";
  const totalSeconds = Math.floor(msRemaining / 1e3);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor(totalSeconds % 3600 / 60);
  const s = totalSeconds % 60;
  return `${h}h ${m}m ${s}s`;
}
function MiningRenewalBanner() {
  const { user, miningExpired, renewMining } = useMining();
  const [renewing, setRenewing] = useState(false);
  const [renewError, setRenewError] = useState(null);
  const [msLeft, setMsLeft] = useState(0);
  const expiresAt = user?.miningExpiresAt ?? null;
  useEffect(() => {
    if (expiresAt === null) {
      setMsLeft(0);
      return;
    }
    const update = () => setMsLeft(Math.max(0, expiresAt - Date.now()));
    update();
    const id = setInterval(update, 1e3);
    return () => clearInterval(id);
  }, [expiresAt]);
  const handleRenew = useCallback(async () => {
    setRenewing(true);
    setRenewError(null);
    const result = await renewMining();
    if (result.error) setRenewError(result.error);
    setRenewing(false);
  }, [renewMining]);
  if (!user) return null;
  if (miningExpired) {
    return /* @__PURE__ */ jsx("div", { className: "px-4 pb-6", children: /* @__PURE__ */ jsx("div", { className: "max-w-6xl mx-auto", children: /* @__PURE__ */ jsxs("div", { className: "relative overflow-hidden rounded-2xl border border-red-500/30 bg-gradient-to-r from-red-950/40 via-[#0B0F17] to-red-950/40 px-6 py-5", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-red-500/3 pointer-events-none" }),
      /* @__PURE__ */ jsxs("div", { className: "relative flex flex-col sm:flex-row items-start sm:items-center gap-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 flex-1 min-w-0", children: [
          /* @__PURE__ */ jsx("div", { className: "w-9 h-9 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center shrink-0", children: /* @__PURE__ */ jsx("span", { className: "text-red-400 text-lg", children: "⛔" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-red-400 font-bold text-sm font-['Space_Grotesk'] tracking-wide", children: "Mining Expired" }),
            /* @__PURE__ */ jsx("p", { className: "text-gray-500 text-xs mt-0.5", children: "Renew to continue earning Blue Coins. All rigs and progress are untouched." }),
            renewError && /* @__PURE__ */ jsx("p", { className: "text-red-400 text-xs mt-1", children: renewError })
          ] })
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: handleRenew,
            disabled: renewing,
            className: "shrink-0 px-5 py-2.5 rounded-xl font-semibold text-sm text-white\n                  bg-gradient-to-r from-[#00BFFF] to-[#0066FF]\n                  hover:opacity-90 active:scale-95 transition-all duration-200\n                  disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#00BFFF]/20",
            children: renewing ? /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx("span", { className: "w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" }),
              "Renewing…"
            ] }) : "⛏ Renew Mining"
          }
        )
      ] })
    ] }) }) });
  }
  return /* @__PURE__ */ jsx("div", { className: "px-4 pb-6", children: /* @__PURE__ */ jsx("div", { className: "max-w-6xl mx-auto", children: /* @__PURE__ */ jsx("div", { className: "relative overflow-hidden rounded-2xl border border-[#00BFFF]/20 bg-gradient-to-r from-[#00BFFF]/5 via-transparent to-[#00BFFF]/5 px-6 py-4", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row items-start sm:items-center gap-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 flex-1 min-w-0", children: [
      /* @__PURE__ */ jsx("div", { className: "w-8 h-8 rounded-xl bg-green-500/15 border border-green-500/30 flex items-center justify-center shrink-0", children: /* @__PURE__ */ jsx("span", { className: "w-2 h-2 rounded-full bg-green-400 animate-pulse block" }) }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "text-green-400 font-semibold text-xs uppercase tracking-widest font-['Space_Grotesk']", children: "Mining Active" }),
        /* @__PURE__ */ jsxs("p", { className: "text-white text-sm font-bold font-['Space_Grotesk'] mt-0.5", children: [
          "Time Remaining:",
          " ",
          /* @__PURE__ */ jsx("span", { className: "text-[#00BFFF] tabular-nums", children: formatCountdown(msLeft) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx(
      "button",
      {
        onClick: handleRenew,
        disabled: renewing,
        className: "shrink-0 px-4 py-2 rounded-xl font-semibold text-xs text-gray-400\n                border border-white/10 hover:border-[#00BFFF]/30 hover:text-[#00BFFF]\n                hover:bg-[#00BFFF]/5 transition-all duration-200\n                disabled:opacity-50 disabled:cursor-not-allowed",
        children: renewing ? "Renewing…" : "⟳ Renew Early"
      }
    )
  ] }) }) }) });
}
function MiningPage() {
  const {
    user,
    isLoading
  } = useMining();
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-[#0B0F17]", children: [
    /* @__PURE__ */ jsx(Navbar, {}),
    /* @__PURE__ */ jsx(MiningToast, {}),
    /* @__PURE__ */ jsxs("section", { className: "relative pt-64 pb-12 px-4 overflow-hidden", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-b from-[#0066FF]/5 to-transparent pointer-events-none" }),
      /* @__PURE__ */ jsx("div", { className: "absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-64 bg-[#0066FF]/12 blur-[120px] pointer-events-none" }),
      /* @__PURE__ */ jsxs("div", { className: "max-w-6xl mx-auto text-center relative", children: [
        /* @__PURE__ */ jsxs("div", { className: "inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#00BFFF]/20 bg-[#00BFFF]/5 text-[#00BFFF] text-xs font-semibold mb-6 tracking-wide uppercase", children: [
          /* @__PURE__ */ jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-[#00BFFF] animate-pulse" }),
          "Community Mining Network"
        ] }),
        /* @__PURE__ */ jsxs("h1", { className: "font-['Space_Grotesk'] font-black text-4xl sm:text-5xl text-white mb-4", children: [
          "BlueCoin ",
          /* @__PURE__ */ jsx("span", { className: "text-gradient", children: "Mining" })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-gray-500 max-w-md mx-auto text-sm", children: "Deploy mining rigs, solve blocks with the community, and earn BlueCoin — the Blue Network's premium cryptocurrency." })
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center py-24", children: /* @__PURE__ */ jsx("span", { className: "w-8 h-8 border-2 border-white/10 border-t-[#00BFFF] rounded-full animate-spin" }) }) : !user ? /* @__PURE__ */ jsx(LoginPanel, {}) : /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(UserStatsBar, {}),
      /* @__PURE__ */ jsx(MiningRenewalBanner, {}),
      /* @__PURE__ */ jsx(BlockProgress, {}),
      /* @__PURE__ */ jsx("section", { className: "px-4 pb-10", children: /* @__PURE__ */ jsxs("div", { className: "max-w-6xl mx-auto", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-5", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("h2", { className: "font-['Space_Grotesk'] font-bold text-xl text-white", children: [
              "My ",
              /* @__PURE__ */ jsx("span", { className: "text-gradient", children: "Rigs" })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-xs mt-0.5", children: user.rigs.length === 0 ? "No rigs yet — buy one below to start mining" : `${user.rigs.filter((r) => r.status === "mining").length} of ${user.rigs.length} rigs active` })
          ] }),
          user.rigs.length > 0 && /* @__PURE__ */ jsx("div", { className: "flex gap-2", children: /* @__PURE__ */ jsx(QuickActionButtons, {}) })
        ] }),
        user.rigs.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "glass rounded-2xl border border-white/8 py-16 text-center", children: [
          /* @__PURE__ */ jsx("p", { className: "text-5xl mb-4", children: "⛏️" }),
          /* @__PURE__ */ jsx("p", { className: "text-gray-400 font-semibold", children: "No rigs in your fleet yet" }),
          /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-sm mt-1", children: "Purchase a rig from the shop below to begin mining" })
        ] }) : /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 stagger", children: user.rigs.map((rig) => /* @__PURE__ */ jsx(RigCard, { rig }, rig.id)) })
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "max-w-6xl mx-auto px-4 mb-8", children: /* @__PURE__ */ jsx("div", { className: "border-t border-white/5" }) }),
      /* @__PURE__ */ jsx(RigShop, {})
    ] }),
    /* @__PURE__ */ jsx(MiningLeaderboard, { currentUsername: user?.username ?? null }),
    /* @__PURE__ */ jsx(Footer, {})
  ] });
}
function QuickActionButtons() {
  const {
    user,
    startAllRigs,
    stopAllRigs
  } = useMining();
  if (!user) return null;
  const idleCount = user.rigs.filter((r) => r.status === "idle").length;
  const miningCount = user.rigs.filter((r) => r.status === "mining").length;
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    idleCount > 0 && /* @__PURE__ */ jsxs("button", { onClick: startAllRigs, className: "px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#00BFFF]/10 text-[#00BFFF] border border-[#00BFFF]/20 hover:bg-[#00BFFF]/20 transition-all", children: [
      "▶ Start All (",
      idleCount,
      ")"
    ] }),
    miningCount > 0 && /* @__PURE__ */ jsxs("button", { onClick: stopAllRigs, className: "px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/5 text-gray-400 border border-white/10 hover:text-white hover:border-white/20 transition-all", children: [
      "⏸ Stop All (",
      miningCount,
      ")"
    ] })
  ] });
}
const SplitComponent = () => /* @__PURE__ */ jsx(MiningProvider, { children: /* @__PURE__ */ jsx(MiningPage, {}) });
export {
  SplitComponent as component
};
