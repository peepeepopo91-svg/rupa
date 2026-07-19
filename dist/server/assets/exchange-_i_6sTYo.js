import { jsxs, jsx } from "react/jsx-runtime";
import { N as Navbar, F as Footer } from "./Footer-BMXCFGB6.js";
import { useState, useMemo } from "react";
import { u as useMining, M as MiningProvider, a as MiningToast } from "./MiningToast-Cpdzjz6j.js";
import { g as getRateHistory, E as EXCHANGE_CONSTANTS } from "./miningStore-B8AuPTlT.js";
import "@tanstack/react-router";
import "./contentStore-CsQzCzSE.js";
import "./syncStore-C_ozCmAO.js";
import "./router-BSxSKO2b.js";
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
import "./miningServer-Bfx69aq4.js";
function Sparkline({ rates }) {
  const min = Math.min(...rates);
  const max = Math.max(...rates);
  const range = max - min || 1;
  const W = 200, H = 40;
  const pts = rates.map((r, i) => `${i / (rates.length - 1) * W},${H - (r - min) / range * (H - 4) - 2}`);
  return /* @__PURE__ */ jsxs("svg", { width: W, height: H, viewBox: `0 0 ${W} ${H}`, className: "w-full", children: [
    /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsxs("linearGradient", { id: "sparkFill", x1: "0", y1: "0", x2: "0", y2: "1", children: [
      /* @__PURE__ */ jsx("stop", { offset: "0%", stopColor: "#00BFFF", stopOpacity: "0.3" }),
      /* @__PURE__ */ jsx("stop", { offset: "100%", stopColor: "#00BFFF", stopOpacity: "0" })
    ] }) }),
    /* @__PURE__ */ jsx(
      "polyline",
      {
        points: pts.join(" "),
        fill: "none",
        stroke: "#00BFFF",
        strokeWidth: "1.5",
        strokeLinejoin: "round",
        strokeLinecap: "round"
      }
    )
  ] });
}
function TxLimitBadge({ used, limit }) {
  const remaining = limit - used;
  const exhausted = remaining <= 0;
  return /* @__PURE__ */ jsxs("div", { className: `flex items-center gap-3 px-4 py-2.5 rounded-xl border ${exhausted ? "bg-red-500/8 border-red-500/20" : "bg-[#00BFFF]/5 border-[#00BFFF]/15"}`, children: [
    /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
      /* @__PURE__ */ jsx("p", { className: `text-[10px] uppercase tracking-widest font-semibold ${exhausted ? "text-red-400" : "text-gray-500"}`, children: "Daily Exchanges Remaining" }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-baseline gap-1.5 mt-0.5", children: [
        /* @__PURE__ */ jsx("span", { className: `font-black text-2xl font-['Space_Grotesk'] ${exhausted ? "text-red-400" : "text-white"}`, children: remaining }),
        /* @__PURE__ */ jsxs("span", { className: "text-gray-600 text-sm", children: [
          "/ ",
          limit
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex gap-1", children: Array.from({ length: limit }, (_, i) => /* @__PURE__ */ jsx(
      "div",
      {
        className: `w-2 h-2 rounded-full transition-all duration-300 ${i < remaining ? "bg-[#00BFFF] shadow-[0_0_6px_rgba(0,191,255,0.8)]" : "bg-white/10"}`
      },
      i
    )) })
  ] });
}
function ExchangePanel() {
  const { user, currentRate, exchange } = useMining();
  const [direction, setDirection] = useState("bc-to-gems");
  const [inputValue, setInputValue] = useState("");
  const [lastTx, setLastTx] = useState(null);
  const [txError, setTxError] = useState("");
  const [loading, setLoading] = useState(false);
  const rateHistory = useMemo(() => getRateHistory(Date.now()), [currentRate]);
  const prevRate = rateHistory.length > 1 ? rateHistory[rateHistory.length - 2] : currentRate;
  const trendUp = currentRate >= prevRate;
  const deviation = currentRate - EXCHANGE_CONSTANTS.BASE_RATE;
  const amount = parseFloat(inputValue) || 0;
  const isBC2Gems = direction === "bc-to-gems";
  const gross = isBC2Gems ? amount * currentRate : amount / currentRate;
  const fee = gross * EXCHANGE_CONSTANTS.FEE_PCT;
  const net = gross - fee;
  const txUsed = Math.floor(user?.exchangeUsedToday ?? 0);
  const txLimit = EXCHANGE_CONSTANTS.DAILY_TX_LIMIT;
  const txRemaining = txLimit - txUsed;
  const txExhausted = txRemaining <= 0;
  const timeToReset = user ? Math.max(0, user.exchangeResetAt - Date.now()) : 0;
  const resetHours = Math.floor(timeToReset / 36e5);
  const resetMins = Math.floor(timeToReset % 36e5 / 6e4);
  const maxBC = Math.floor(user?.balance ?? 0);
  const maxGems = Math.floor(user?.gems ?? 0);
  function switchDirection(d) {
    setDirection(d);
    setInputValue("");
    setTxError("");
    setLastTx(null);
  }
  async function handleExchange() {
    if (!amount || amount <= 0) return;
    setTxError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 350));
    const result = exchange(amount, direction);
    if (result.error) {
      setTxError(result.error);
    } else {
      setLastTx({ gained: result.gained, fee: result.feePaid, direction, at: Date.now() });
      setInputValue("");
    }
    setLoading(false);
  }
  const canSubmit = !!user && amount > 0 && !loading && !txExhausted && (isBC2Gems ? amount <= maxBC : amount <= maxGems);
  return /* @__PURE__ */ jsxs("div", { className: "max-w-4xl mx-auto px-4 pb-16 space-y-6", children: [
    /* @__PURE__ */ jsx("div", { className: "glass rounded-2xl border border-white/8 overflow-hidden", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row", children: [
      /* @__PURE__ */ jsxs("div", { className: "p-6 md:w-72 flex flex-col border-b md:border-b-0 md:border-r border-white/5", children: [
        /* @__PURE__ */ jsx("p", { className: "text-[10px] text-gray-600 uppercase tracking-widest mb-3", children: "Live Exchange Rate" }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-end gap-2 mb-1", children: [
          /* @__PURE__ */ jsx("span", { className: "font-['Space_Grotesk'] font-black text-5xl text-white leading-none", children: currentRate }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col mb-1", children: [
            /* @__PURE__ */ jsx("span", { className: `text-sm font-bold ${trendUp ? "text-green-400" : "text-red-400"}`, children: trendUp ? "▲" : "▼" }),
            /* @__PURE__ */ jsxs("span", { className: `text-[10px] font-semibold ${deviation >= 0 ? "text-green-400" : "text-red-400"}`, children: [
              deviation >= 0 ? "+" : "",
              deviation
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-gray-500 text-xs mb-4", children: "💎 Gems per BC" }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-[10px] text-gray-600", children: [
            /* @__PURE__ */ jsxs("span", { children: [
              "Min ",
              EXCHANGE_CONSTANTS.MIN_RATE
            ] }),
            /* @__PURE__ */ jsxs("span", { children: [
              "Base ",
              EXCHANGE_CONSTANTS.BASE_RATE
            ] }),
            /* @__PURE__ */ jsxs("span", { children: [
              "Max ",
              EXCHANGE_CONSTANTS.MAX_RATE
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "h-1 rounded-full bg-white/5 overflow-hidden relative", children: /* @__PURE__ */ jsx(
            "div",
            {
              className: "absolute top-0 left-0 h-full rounded-full transition-all duration-500",
              style: {
                width: `${Math.max(2, (currentRate - EXCHANGE_CONSTANTS.MIN_RATE) / (EXCHANGE_CONSTANTS.MAX_RATE - EXCHANGE_CONSTANTS.MIN_RATE) * 100)}%`,
                background: "linear-gradient(90deg, #0066FF, #00BFFF)"
              }
            }
          ) })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-[9px] text-gray-700 mt-3 uppercase tracking-wide", children: "Rate stabilizes algorithmically over a 4-hour cycle" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex-1 p-6", children: [
        /* @__PURE__ */ jsx("p", { className: "text-[10px] text-gray-600 uppercase tracking-wide mb-3", children: "Rate History (4h window)" }),
        /* @__PURE__ */ jsx(Sparkline, { rates: rateHistory }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between mt-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-[9px] text-gray-700", children: "4h ago" }),
          /* @__PURE__ */ jsx("span", { className: "text-[9px] text-gray-700", children: "now" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-white/5", children: [
          { label: "Fee", value: `${(EXCHANGE_CONSTANTS.FEE_PCT * 100).toFixed(0)}%` },
          { label: "Daily Limit", value: `${txLimit} trades` },
          { label: "Remaining", value: `${txRemaining} / ${txLimit}` }
        ].map((s) => /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsx("p", { className: "text-white font-bold text-sm", children: s.value }),
          /* @__PURE__ */ jsx("p", { className: "text-[9px] text-gray-600 uppercase tracking-wide mt-0.5", children: s.label })
        ] }, s.label)) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "glass rounded-2xl border border-white/8 p-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-5", children: [
        /* @__PURE__ */ jsx("div", { className: "flex rounded-xl border border-white/8 overflow-hidden bg-white/2 p-0.5 gap-0.5 flex-1", children: ["bc-to-gems", "gems-to-bc"].map((d) => /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => switchDirection(d),
            className: `flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all duration-200 ${direction === d ? "bg-[#00BFFF]/15 text-[#00BFFF] border border-[#00BFFF]/25" : "text-gray-500 hover:text-gray-300"}`,
            children: d === "bc-to-gems" ? "💎 BC → Gems" : "💰 Gems → BC"
          },
          d
        )) }),
        /* @__PURE__ */ jsxs("span", { className: "text-[11px] text-gray-500 tabular-nums whitespace-nowrap", children: [
          "1 BC = ",
          /* @__PURE__ */ jsxs("span", { className: "text-[#00BFFF] font-semibold", children: [
            currentRate,
            " 💎"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-5", children: [
        /* @__PURE__ */ jsx(TxLimitBadge, { used: txUsed, limit: txLimit }),
        user && txRemaining > 0 && /* @__PURE__ */ jsxs("p", { className: "text-[10px] text-gray-700 mt-1.5 text-right", children: [
          "Resets in ",
          resetHours,
          "h ",
          resetMins,
          "m"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("label", { className: "block text-[10px] text-gray-500 uppercase tracking-wide mb-2", children: [
            "You Pay (",
            isBC2Gems ? "BlueCoin" : "Gems",
            ")"
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "number",
                min: "1",
                value: inputValue,
                onChange: (e) => {
                  setInputValue(e.target.value);
                  setTxError("");
                },
                placeholder: "0",
                className: "w-full bg-white/3 border border-white/10 hover:border-white/20 focus:border-[#00BFFF]/50 rounded-xl px-4 py-3 pr-16 text-white text-sm outline-none transition-all"
              }
            ),
            /* @__PURE__ */ jsx("span", { className: "absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-500 font-semibold", children: isBC2Gems ? "BC" : "💎" })
          ] }),
          user && /* @__PURE__ */ jsx("div", { className: "flex gap-1.5 mt-1.5", children: [25, 50, 100, "Max"].map((v) => {
            const maxVal = isBC2Gems ? maxBC : maxGems;
            const val = v === "Max" ? maxVal : Math.min(v, maxVal);
            return /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => setInputValue(String(val)),
                className: "px-2 py-0.5 rounded text-[9px] text-gray-500 bg-white/3 border border-white/8 hover:text-white hover:border-white/20 transition-all",
                children: v === "Max" ? `Max (${maxVal})` : `${v}`
              },
              v
            );
          }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("label", { className: "block text-[10px] text-gray-500 uppercase tracking-wide mb-2", children: [
            "You Receive (",
            isBC2Gems ? "Gems" : "BlueCoin",
            ")"
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "w-full bg-white/2 border border-white/5 rounded-xl px-4 py-3 flex items-center justify-between", children: [
            /* @__PURE__ */ jsx("span", { className: `text-sm font-bold ${net > 0 ? "text-[#00BFFF]" : "text-gray-600"}`, children: net > 0 ? net.toFixed(2) : "0" }),
            /* @__PURE__ */ jsx("span", { className: "text-[10px] text-gray-500 font-semibold", children: isBC2Gems ? "💎 Gems" : "BC" })
          ] }),
          amount > 0 && /* @__PURE__ */ jsxs("div", { className: "mt-1.5 space-y-0.5", children: [
            /* @__PURE__ */ jsxs("p", { className: "text-[10px] text-gray-600", children: [
              "Gross: ",
              gross.toFixed(2),
              " ",
              isBC2Gems ? "💎" : "BC"
            ] }),
            /* @__PURE__ */ jsxs("p", { className: "text-[10px] text-gray-700", children: [
              "Fee (2%): −",
              fee.toFixed(2),
              " ",
              isBC2Gems ? "💎" : "BC"
            ] })
          ] })
        ] })
      ] }),
      amount > 0 && /* @__PURE__ */ jsxs("div", { className: "mb-4 p-3 rounded-xl bg-[#00BFFF]/5 border border-[#00BFFF]/15 flex items-center justify-between", children: [
        /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500", children: isBC2Gems ? `1 BC = ${currentRate} 💎` : `${currentRate} 💎 = 1 BC` }),
        /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-400", children: isBC2Gems ? `${amount} BC → ${net.toFixed(2)} 💎` : `${amount} 💎 → ${net.toFixed(2)} BC` })
      ] }),
      txExhausted && /* @__PURE__ */ jsxs("div", { className: "mb-4 p-3 rounded-xl bg-red-500/8 border border-red-500/20 flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("span", { className: "text-red-400 text-sm", children: "🔒" }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-red-400 text-xs font-semibold", children: "Exchange limit reached" }),
          /* @__PURE__ */ jsxs("p", { className: "text-red-400/60 text-[10px] mt-0.5", children: [
            "You have used all ",
            txLimit,
            " exchanges today. Resets in ",
            resetHours,
            "h ",
            resetMins,
            "m."
          ] })
        ] })
      ] }),
      txError && /* @__PURE__ */ jsxs("p", { className: "mb-4 text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2", children: [
        "⚠ ",
        txError
      ] }),
      lastTx && /* @__PURE__ */ jsxs("div", { className: "mb-4 p-3 rounded-xl bg-green-500/8 border border-green-500/20 flex items-center justify-between", children: [
        /* @__PURE__ */ jsx("span", { className: "text-green-400 text-xs", children: "✓ Exchange complete" }),
        /* @__PURE__ */ jsxs("span", { className: "text-xs text-gray-400", children: [
          "+",
          lastTx.gained.toFixed(2),
          " ",
          lastTx.direction === "bc-to-gems" ? "💎 Gems" : "BC",
          " received"
        ] })
      ] }),
      !user ? /* @__PURE__ */ jsx("div", { className: "w-full py-3 rounded-xl text-sm text-center text-gray-600 border border-white/8", children: "Log in to exchange" }) : /* @__PURE__ */ jsx(
        "button",
        {
          onClick: handleExchange,
          disabled: !canSubmit,
          className: "btn-primary w-full py-3 rounded-xl font-semibold text-sm text-white transition-all disabled:opacity-40 disabled:pointer-events-none",
          children: loading ? /* @__PURE__ */ jsxs("span", { className: "flex items-center justify-center gap-2", children: [
            /* @__PURE__ */ jsx("span", { className: "w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" }),
            "Processing…"
          ] }) : isBC2Gems ? `Exchange ${amount || 0} BC → ${net > 0 ? net.toFixed(2) : "0"} 💎 Gems` : `Exchange ${amount || 0} 💎 → ${net > 0 ? net.toFixed(2) : "0"} BC`
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "glass rounded-2xl border border-white/8 p-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-semibold text-sm text-white mb-4", children: "How the Exchange Works" }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4", children: [
        {
          icon: "📈",
          title: "Dynamic Rate",
          body: `The rate fluctuates between ${EXCHANGE_CONSTANTS.MIN_RATE}–${EXCHANGE_CONSTANTS.MAX_RATE} Gems/BC using two overlapping wave cycles, stabilizing around ${EXCHANGE_CONSTANTS.BASE_RATE} Gems/BC base.`
        },
        {
          icon: "⚖️",
          title: "Trading Fee",
          body: `A ${(EXCHANGE_CONSTANTS.FEE_PCT * 100).toFixed(0)}% transaction fee is deducted from the output. This helps stabilize the market and maintain reserve liquidity.`
        },
        {
          icon: "🔒",
          title: "Daily Limit",
          body: `Each account can perform up to ${EXCHANGE_CONSTANTS.DAILY_TX_LIMIT} exchange transactions per 24-hour window, in either direction. The limit resets automatically.`
        }
      ].map((item) => /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xl", children: item.icon }),
          /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold text-gray-300", children: item.title })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-[11px] text-gray-600 leading-relaxed", children: item.body })
      ] }, item.title)) })
    ] })
  ] });
}
function ExchangePage() {
  const {
    user
  } = useMining();
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-[#0B0F17]", children: [
    /* @__PURE__ */ jsx(Navbar, {}),
    /* @__PURE__ */ jsx(MiningToast, {}),
    /* @__PURE__ */ jsxs("section", { className: "relative pt-64 pb-12 px-4 overflow-hidden", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-b from-[#0066FF]/5 to-transparent pointer-events-none" }),
      /* @__PURE__ */ jsx("div", { className: "absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-64 bg-[#6600FF]/10 blur-[100px] pointer-events-none" }),
      /* @__PURE__ */ jsxs("div", { className: "max-w-4xl mx-auto text-center relative", children: [
        /* @__PURE__ */ jsxs("div", { className: "inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-purple-500/20 bg-purple-500/5 text-purple-400 text-xs font-semibold mb-6 tracking-wide uppercase", children: [
          /* @__PURE__ */ jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" }),
          "Dynamic Market"
        ] }),
        /* @__PURE__ */ jsxs("h1", { className: "font-['Space_Grotesk'] font-black text-4xl sm:text-5xl text-white mb-4", children: [
          "BlueCoin ",
          /* @__PURE__ */ jsx("span", { className: "text-gradient", children: "Exchange" })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-gray-500 max-w-md mx-auto text-sm", children: "Convert your mined BlueCoin into Gems using the live dynamic exchange rate. Rate fluctuates algorithmically — time your trades wisely." }),
        user && /* @__PURE__ */ jsxs("div", { className: "mt-6 inline-flex items-center gap-4 px-5 py-3 rounded-2xl glass border border-white/8", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("span", { className: "text-[#00BFFF] text-sm", children: "💎" }),
            /* @__PURE__ */ jsx("span", { className: "text-white font-bold", children: Math.floor(user.balance).toLocaleString() }),
            /* @__PURE__ */ jsx("span", { className: "text-gray-500 text-xs", children: "BC" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "w-px h-5 bg-white/10" }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("span", { className: "text-purple-400 text-sm", children: "✨" }),
            /* @__PURE__ */ jsx("span", { className: "text-white font-bold", children: (user.gems ?? 0).toFixed(2) }),
            /* @__PURE__ */ jsx("span", { className: "text-gray-500 text-xs", children: "Gems" })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx(ExchangePanel, {}),
    /* @__PURE__ */ jsx(Footer, {})
  ] });
}
const SplitComponent = () => /* @__PURE__ */ jsx(MiningProvider, { children: /* @__PURE__ */ jsx(ExchangePage, {}) });
export {
  SplitComponent as component
};
