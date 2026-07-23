import { jsxs, jsx } from "react/jsx-runtime";
import { p as playersData, N as Navbar } from "./Navbar-CVxsxVyg.js";
import { useState, useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { Check, Copy } from "lucide-react";
import { p as players } from "./router-DB9jBhvF.js";
import { e as computeRankings } from "./tiers-BAwtsToj.js";
import { F as Footer } from "./Footer-B4ckZ12m.js";
import "react-dom";
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
import "./contentStore-Bptpfu9i.js";
import "./syncStore-C_ozCmAO.js";
const DiscordIcon = () => /* @__PURE__ */ jsx("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "currentColor", children: /* @__PURE__ */ jsx("path", { d: "M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057.1 18.08.114 18.1.12 18.12a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" }) });
const MODE_LABELS = {
  sword: "Sword",
  crystal: "Crystal",
  axe: "Axe",
  mace: "Mace",
  uhc: "UHC",
  nethpot: "Nethpot",
  diapot: "Diapot"
};
const ALL_ENTRIES = (() => {
  const entries = [];
  for (const p of playersData) {
    for (const [mode, tier] of Object.entries(p.ranks)) {
      if (tier && tier !== "NONE") {
        entries.push({ player: p.name, tier, mode: MODE_LABELS[mode] ?? mode });
      }
    }
  }
  return entries;
})();
function LiveTicker() {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    if (ALL_ENTRIES.length === 0) return;
    setIdx(Math.floor(Math.random() * ALL_ENTRIES.length));
    const timer = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx((i) => (i + 1) % ALL_ENTRIES.length);
        setVisible(true);
      }, 300);
    }, 5e3);
    return () => clearInterval(timer);
  }, []);
  if (ALL_ENTRIES.length === 0) return null;
  const activity = ALL_ENTRIES[idx];
  return /* @__PURE__ */ jsxs("div", { className: "inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm mb-8 backdrop-blur-sm", children: [
    /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5 shrink-0", children: [
      /* @__PURE__ */ jsxs("span", { className: "relative flex h-2 w-2", children: [
        /* @__PURE__ */ jsx("span", { className: "animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" }),
        /* @__PURE__ */ jsx("span", { className: "relative inline-flex rounded-full h-2 w-2 bg-red-500" })
      ] }),
      /* @__PURE__ */ jsx("span", { className: "text-red-400 font-bold text-[11px] tracking-wider", children: "LIVE" })
    ] }),
    /* @__PURE__ */ jsxs(
      "span",
      {
        className: "text-white/60 text-[12px] transition-opacity duration-300",
        style: { opacity: visible ? 1 : 0 },
        children: [
          /* @__PURE__ */ jsx("span", { className: "text-white font-semibold", children: activity.player }),
          " ",
          "got",
          " ",
          /* @__PURE__ */ jsx(
            "span",
            {
              style: {
                background: "linear-gradient(90deg, #00BFFF, #0066FF)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text"
              },
              className: "font-bold",
              children: activity.tier
            }
          ),
          " ",
          "in ",
          activity.mode
        ]
      }
    )
  ] });
}
function CopyIPButton() {
  const [copied, setCopied] = useState(false);
  const ip = "play.sennahosting.com";
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(ip);
      setCopied(true);
      setTimeout(() => setCopied(false), 2e3);
    } catch {
    }
  };
  return /* @__PURE__ */ jsxs(
    "button",
    {
      onClick: handleCopy,
      className: "group inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all duration-200 cursor-pointer mb-8",
      children: [
        /* @__PURE__ */ jsx("span", { className: "font-mono text-white/70 text-sm", children: ip }),
        /* @__PURE__ */ jsxs("span", { className: `flex items-center gap-1 text-xs transition-colors ${copied ? "text-green-400" : "text-white/30 group-hover:text-white/50"}`, children: [
          copied ? /* @__PURE__ */ jsx(Check, { size: 11 }) : /* @__PURE__ */ jsx(Copy, { size: 11 }),
          copied ? "Copied!" : "Copy"
        ] })
      ]
    }
  );
}
function Hero() {
  return /* @__PURE__ */ jsxs("section", { className: "relative flex flex-col items-center justify-center min-h-screen text-center px-4 pt-14 pb-8", children: [
    /* @__PURE__ */ jsx(LiveTicker, {}),
    /* @__PURE__ */ jsxs("h1", { className: "font-black leading-none tracking-tight mb-6 select-none", children: [
      /* @__PURE__ */ jsx("span", { className: "block text-[64px] sm:text-[96px] lg:text-[128px] text-white drop-shadow-2xl", children: "DOMINATE" }),
      /* @__PURE__ */ jsx(
        "span",
        {
          className: "block text-[64px] sm:text-[96px] lg:text-[128px]",
          style: {
            background: "linear-gradient(135deg, #00BFFF 0%, #0088FF 50%, #0044DD 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text"
          },
          children: "THE TIERS"
        }
      )
    ] }),
    /* @__PURE__ */ jsx("p", { className: "text-white/50 text-base sm:text-lg mb-8 max-w-md", children: "The ultimate Minecraft PvP tier ranking platform. Discover the best — and the worst." }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row items-center gap-3 mb-10", children: [
      /* @__PURE__ */ jsxs(
        "a",
        {
          href: "https://discord.gg/DmEPAb3NFU",
          target: "_blank",
          rel: "noopener noreferrer",
          className: "inline-flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold text-sm text-white transition-all duration-200 hover:opacity-90 hover:scale-[1.02]",
          style: { background: "linear-gradient(135deg, #5865F2, #4752c4)" },
          children: [
            /* @__PURE__ */ jsx(DiscordIcon, {}),
            "Join Discord"
          ]
        }
      ),
      /* @__PURE__ */ jsx(
        Link,
        {
          to: "/rankings",
          className: "inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/8 border border-white/15 text-white font-semibold text-sm hover:bg-white/12 hover:border-white/25 transition-all duration-200 hover:scale-[1.02]",
          children: "Leaderboards"
        }
      )
    ] }),
    /* @__PURE__ */ jsx(CopyIPButton, {}),
    /* @__PURE__ */ jsx("div", { className: "absolute bottom-6 left-1/2 -translate-x-1/2 opacity-20 animate-bounce", children: /* @__PURE__ */ jsx("div", { className: "w-4 h-7 border border-white/40 rounded-full flex justify-center pt-1.5", children: /* @__PURE__ */ jsx("div", { className: "w-0.5 h-1.5 bg-white rounded-full" }) }) })
  ] });
}
const MODES = [
  { label: "Sword", icon: "⚔️" },
  { label: "Crystal", icon: "💎" },
  { label: "Axe", icon: "🪓" },
  { label: "Mace", icon: "🔨" },
  { label: "UHC", icon: "🏆" },
  { label: "Nethpot", icon: "🧪" },
  { label: "Diapot", icon: "⚗️" }
];
function Features() {
  return /* @__PURE__ */ jsx("section", { className: "py-20 px-4 relative overflow-hidden", children: /* @__PURE__ */ jsxs("div", { className: "max-w-5xl mx-auto", children: [
    /* @__PURE__ */ jsxs("div", { className: "text-center mb-14", children: [
      /* @__PURE__ */ jsxs("h2", { className: "font-black text-4xl sm:text-5xl text-white leading-tight", children: [
        "Every game mode",
        /* @__PURE__ */ jsx("br", {}),
        "you could imagine"
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-white/40 text-sm mt-3", children: "7 competitive PvP modes, each with its own ranked tier list." })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex flex-wrap justify-center gap-4", children: MODES.map((mode) => /* @__PURE__ */ jsxs(
      "div",
      {
        className: "\n                group flex flex-col items-center justify-center gap-3\n                w-32 h-32 sm:w-36 sm:h-36\n                rounded-2xl bg-white/4 border border-white/8\n                hover:border-white/20 hover:bg-white/8\n                transition-all duration-200 cursor-pointer\n              ",
        children: [
          /* @__PURE__ */ jsx("span", { className: "text-4xl select-none", children: mode.icon }),
          /* @__PURE__ */ jsx("span", { className: "text-white/60 text-xs font-medium group-hover:text-white transition-colors", children: mode.label })
        ]
      },
      mode.label
    )) })
  ] }) });
}
computeRankings(players);
const totalRanked = players.filter(
  (p) => Object.values(p.ranks).some(Boolean)
).length;
const ht1Players = players.filter(
  (p) => Object.values(p.ranks).some((t) => t === "HT1")
).length;
const yearsRunning = 2;
function useCountUp(target, duration = 1600, active) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration, active]);
  return count;
}
function StatCard({
  value,
  label,
  accent = false,
  suffix = ""
}) {
  const [active, setActive] = useState(false);
  const ref = useRef(null);
  const count = useCountUp(value, 1600, active);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setActive(true);
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return /* @__PURE__ */ jsxs("div", { ref, className: "text-center", children: [
    accent ? /* @__PURE__ */ jsxs(
      "div",
      {
        className: "font-black text-5xl sm:text-6xl lg:text-7xl leading-none mb-2",
        style: {
          background: "linear-gradient(135deg, #00BFFF, #0088FF, #0044DD)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text"
        },
        children: [
          count.toLocaleString(),
          suffix
        ]
      }
    ) : /* @__PURE__ */ jsxs("div", { className: "font-black text-5xl sm:text-6xl lg:text-7xl leading-none mb-2 text-white", children: [
      count.toLocaleString(),
      suffix
    ] }),
    /* @__PURE__ */ jsx("div", { className: "text-white/40 text-sm font-medium", children: label })
  ] });
}
function Stats() {
  return /* @__PURE__ */ jsx("section", { className: "py-16 px-4 relative", children: /* @__PURE__ */ jsx("div", { className: "max-w-3xl mx-auto", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-8 sm:gap-16", children: [
    /* @__PURE__ */ jsx(StatCard, { value: totalRanked, label: "Total Testers" }),
    /* @__PURE__ */ jsx(StatCard, { value: ht1Players * 200 + 993, label: "Tests Completed", accent: true }),
    /* @__PURE__ */ jsx(StatCard, { value: yearsRunning, label: "Years Running", suffix: "+" })
  ] }) }) });
}
function Quote() {
  return /* @__PURE__ */ jsx("section", { className: "py-20 px-4 relative", children: /* @__PURE__ */ jsxs("div", { className: "max-w-4xl mx-auto text-center", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-4 flex-wrap", children: [
      /* @__PURE__ */ jsx("span", { className: "text-6xl text-white/20 font-serif leading-none select-none", children: "“" }),
      /* @__PURE__ */ jsxs("p", { className: "text-2xl sm:text-3xl font-bold text-white", children: [
        "It's so",
        " ",
        /* @__PURE__ */ jsxs("span", { className: "relative inline-block", children: [
          /* @__PURE__ */ jsx(
            "span",
            {
              className: "relative z-10",
              style: {
                background: "linear-gradient(90deg, #00BFFF, #0088FF, #0055DD)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text"
              },
              children: "accurate and fair"
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-[#00BFFF] via-[#0088FF] to-[#0055DD]" })
        ] }),
        " ",
        "to follow"
      ] }),
      /* @__PURE__ */ jsx("span", { className: "text-6xl text-white/20 font-serif leading-none select-none", children: "”" })
    ] }),
    /* @__PURE__ */ jsx("p", { className: "text-[#555555] text-sm mt-4", children: "— Blue Tiers community" })
  ] }) });
}
function HomePage() {
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen", children: [
    /* @__PURE__ */ jsx(Navbar, {}),
    /* @__PURE__ */ jsx(Hero, {}),
    /* @__PURE__ */ jsx(Stats, {}),
    /* @__PURE__ */ jsx(Quote, {}),
    /* @__PURE__ */ jsx(Features, {}),
    /* @__PURE__ */ jsx(Footer, {})
  ] });
}
export {
  HomePage as component
};
