import { jsxs, jsx } from "react/jsx-runtime";
import { N as Navbar, F as Footer } from "./Footer-CVsQY5Et.js";
import { useRef, useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { p as players } from "./router-Drx0aV7R.js";
import { e as computeRankings } from "./tiers-BAwtsToj.js";
import "./contentStore-BHVkzjvQ.js";
import "./syncStore-C_ozCmAO.js";
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
function Particles() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let animId;
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);
    const particles = [];
    const colors = ["#00BFFF", "#0099FF", "#0066FF", "#00E5FF"];
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2.5 + 0.5,
        alpha: Math.random() * 0.6 + 0.1,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
        for (let j = i + 1; j < particles.length; j++) {
          const dx = p.x - particles[j].x;
          const dy = p.y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = "#00BFFF";
            ctx.globalAlpha = (1 - dist / 100) * 0.15;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
        ctx.globalAlpha = 1;
      });
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);
  return /* @__PURE__ */ jsx(
    "canvas",
    {
      ref: canvasRef,
      className: "absolute inset-0 w-full h-full pointer-events-none"
    }
  );
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
      className: "group relative flex items-center gap-3 px-5 py-3 rounded-xl border border-[#00BFFF]/30 bg-[#00BFFF]/5 hover:bg-[#00BFFF]/10 hover:border-[#00BFFF]/60 transition-all duration-300 cursor-pointer ip-glow",
      children: [
        /* @__PURE__ */ jsx("span", { className: "text-lg", children: "🖥" }),
        /* @__PURE__ */ jsx("span", { className: "font-mono text-[#00BFFF] font-semibold tracking-wide text-sm sm:text-base", children: ip }),
        /* @__PURE__ */ jsx("span", { className: `ml-2 text-xs px-2 py-0.5 rounded-md transition-all duration-300 ${copied ? "bg-green-500/20 text-green-400 scale-110" : "bg-[#00BFFF]/10 text-[#00BFFF]/70 group-hover:bg-[#00BFFF]/20"}`, children: copied ? "✓ Copied!" : "Click to Copy" })
      ]
    }
  );
}
function Hero() {
  return /* @__PURE__ */ jsxs("section", { className: "relative min-h-screen flex items-center justify-center overflow-hidden pt-36 md:pt-32", children: [
    /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-br from-[#0B0F17] via-[#0d1526] to-[#0B0F17]" }),
    /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex items-center justify-center pointer-events-none", children: /* @__PURE__ */ jsx("div", { className: "w-[600px] h-[600px] rounded-full bg-[#0066FF]/10 blur-[120px]" }) }),
    /* @__PURE__ */ jsx(Particles, {}),
    /* @__PURE__ */ jsxs("div", { className: "relative z-10 text-center px-4 max-w-4xl mx-auto fade-in-up", children: [
      /* @__PURE__ */ jsx("div", { className: "flex justify-center mb-6", children: /* @__PURE__ */ jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsx("div", { className: "w-24 h-24 rounded-2xl bg-gradient-to-br from-[#00BFFF]/20 to-[#0066FF]/20 border border-[#00BFFF]/30 flex items-center justify-center text-5xl shadow-lg shadow-[#00BFFF]/10 hover:shadow-[#00BFFF]/30 transition-all duration-500 hover:scale-110", children: "⚔" }),
        /* @__PURE__ */ jsx("div", { className: "absolute -inset-1 rounded-2xl bg-gradient-to-br from-[#00BFFF]/20 to-[#0066FF]/20 blur-lg -z-10" })
      ] }) }),
      /* @__PURE__ */ jsx("h1", { className: "font-['Space_Grotesk'] font-black text-5xl sm:text-7xl lg:text-8xl tracking-tight mb-4 leading-none", children: /* @__PURE__ */ jsx("span", { className: "text-gradient", children: "BLUE TIERS" }) }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-400 text-lg sm:text-xl mb-8 max-w-xl mx-auto", children: "#1 Tier List for all types of players." }),
      /* @__PURE__ */ jsx("div", { className: "flex justify-center mb-10", children: /* @__PURE__ */ jsx(CopyIPButton, {}) }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row items-center justify-center gap-4", children: [
        /* @__PURE__ */ jsx(
          Link,
          {
            to: "/rankings",
            className: "btn-primary w-full sm:w-auto text-center px-8 py-3.5 rounded-xl font-semibold text-white text-sm tracking-wide transition-all duration-300 hover:scale-105",
            children: "View Rankings"
          }
        ),
        /* @__PURE__ */ jsxs(
          "a",
          {
            href: "https://discord.gg/DmEPAb3NFU",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "discord-btn w-full sm:w-auto text-center flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-white text-sm tracking-wide transition-all duration-300 hover:scale-105",
            children: [
              /* @__PURE__ */ jsx("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "currentColor", children: /* @__PURE__ */ jsx("path", { d: "M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057.1 18.08.114 18.1.12 18.12a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" }) }),
              "Join Discord"
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce opacity-50", children: /* @__PURE__ */ jsx("div", { className: "w-5 h-8 border-2 border-[#00BFFF]/40 rounded-full flex justify-center pt-1.5", children: /* @__PURE__ */ jsx("div", { className: "w-1 h-2 bg-[#00BFFF]/60 rounded-full" }) }) })
  ] });
}
function Features() {
  const features = [
    {
      icon: "🏆",
      title: "Competitive Rankings",
      description: "Track the best PvP players across all gamemodes with precise tier placements."
    },
    {
      icon: "⚔",
      title: "Multiple Gamemodes",
      description: "Rankings across all PvP styles — Crystal, Sword, Axe, Mace, UHC, and more."
    },
    {
      icon: "🌐",
      title: "Community Driven",
      description: "Managed by official testers who rigorously evaluate every player's skill."
    }
  ];
  return /* @__PURE__ */ jsxs("section", { className: "py-24 px-4 relative", children: [
    /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-b from-transparent via-[#00BFFF]/3 to-transparent pointer-events-none" }),
    /* @__PURE__ */ jsxs("div", { className: "max-w-6xl mx-auto", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-center mb-16", children: [
        /* @__PURE__ */ jsxs("h2", { className: "font-['Space_Grotesk'] font-bold text-3xl sm:text-4xl text-white mb-4", children: [
          "Why ",
          /* @__PURE__ */ jsx("span", { className: "text-gradient", children: "Blue Tiers?" })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-gray-500 max-w-md mx-auto", children: "The most accurate and trusted tier list in the Minecraft PvP community." })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: features.map((f) => /* @__PURE__ */ jsxs("div", { className: "feature-card group glass rounded-2xl p-8 border border-white/5 transition-all duration-300 hover:-translate-y-1", children: [
        /* @__PURE__ */ jsx("div", { className: "text-4xl mb-5", children: f.icon }),
        /* @__PURE__ */ jsx("h3", { className: "font-['Space_Grotesk'] font-semibold text-lg text-white mb-3", children: f.title }),
        /* @__PURE__ */ jsx("p", { className: "text-gray-500 text-sm leading-relaxed", children: f.description })
      ] }, f.title)) })
    ] })
  ] });
}
const rankings = computeRankings(players);
const totalRanked = players.filter(
  (p) => Object.values(p.ranks).some(Boolean)
).length;
const ht1Players = players.filter(
  (p) => Object.values(p.ranks).some((t) => t === "HT1")
).length;
const allPoints = [...rankings.values()].map((r) => r.totalPoints);
const avgScore = allPoints.length > 0 ? Math.round(allPoints.reduce((a, b) => a + b, 0) / allPoints.length) : 0;
let topPlayer = { name: "—", points: 0 };
players.forEach((p) => {
  const info = rankings.get(p.name);
  if (info && info.totalPoints > topPlayer.points) {
    topPlayer = { name: p.name, points: info.totalPoints };
  }
});
function useCountUp(target, duration = 2e3, active) {
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
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration, active]);
  return count;
}
function NumberStat({ label, value, suffix = "" }) {
  const [active, setActive] = useState(false);
  const ref = useRef(null);
  const count = useCountUp(value, 1800, active);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setActive(true);
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return /* @__PURE__ */ jsxs("div", { ref, className: "text-center", children: [
    /* @__PURE__ */ jsxs("div", { className: "font-['Space_Grotesk'] font-black text-4xl sm:text-5xl text-gradient mb-2", children: [
      count,
      suffix
    ] }),
    /* @__PURE__ */ jsx("div", { className: "text-gray-500 text-sm font-medium", children: label })
  ] });
}
function TextStat({ label, value, sub }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return /* @__PURE__ */ jsxs("div", { ref, className: "text-center", children: [
    /* @__PURE__ */ jsx(
      "div",
      {
        className: `font-['Space_Grotesk'] font-black text-3xl sm:text-4xl text-gradient mb-1 transition-opacity duration-700 ${visible ? "opacity-100" : "opacity-0"}`,
        children: value
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "text-[#00BFFF] text-xs font-semibold mb-1", children: sub }),
    /* @__PURE__ */ jsx("div", { className: "text-gray-500 text-sm font-medium", children: label })
  ] });
}
function Stats() {
  return /* @__PURE__ */ jsxs("section", { className: "py-24 px-4 relative overflow-hidden", children: [
    /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-r from-[#0066FF]/5 via-[#00BFFF]/8 to-[#0066FF]/5 pointer-events-none" }),
    /* @__PURE__ */ jsx("div", { className: "absolute inset-0 border-y border-[#00BFFF]/10 pointer-events-none" }),
    /* @__PURE__ */ jsxs("div", { className: "max-w-5xl mx-auto", children: [
      /* @__PURE__ */ jsx("div", { className: "text-center mb-16", children: /* @__PURE__ */ jsxs("h2", { className: "font-['Space_Grotesk'] font-bold text-3xl sm:text-4xl text-white mb-4", children: [
        "By the ",
        /* @__PURE__ */ jsx("span", { className: "text-gradient", children: "Numbers" })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-12", children: [
        /* @__PURE__ */ jsx(NumberStat, { label: "Total Ranked Players", value: totalRanked }),
        /* @__PURE__ */ jsx(NumberStat, { label: "HT1 Players", value: ht1Players }),
        /* @__PURE__ */ jsx(NumberStat, { label: "Average Player Score", value: avgScore, suffix: " pts" }),
        /* @__PURE__ */ jsx(
          TextStat,
          {
            label: "Highest Rated Player",
            value: topPlayer.name,
            sub: `${topPlayer.points} pts`
          }
        )
      ] })
    ] })
  ] });
}
function HomePage() {
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-[#0B0F17]", children: [
    /* @__PURE__ */ jsx(Navbar, {}),
    /* @__PURE__ */ jsx(Hero, {}),
    /* @__PURE__ */ jsx(Features, {}),
    /* @__PURE__ */ jsx(Stats, {}),
    /* @__PURE__ */ jsx(Footer, {})
  ] });
}
export {
  HomePage as component
};
