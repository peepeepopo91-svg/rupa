import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { N as Navbar } from "./Navbar-Do86Frob.js";
import { F as Footer } from "./Footer-DL61Y6vq.js";
import { g as getPlayerTotalPoints, a as getAverageTier, b as getAveragePoints, c as getHighestTier, d as getLowestTier, t as tierColors, e as computeRankings, f as tierSortValue, T as TIER_ORDER, h as TIER_POINTS } from "./tiers-BAwtsToj.js";
import { g as gamemodes } from "./gamemodes-jMLNKT3S.js";
import { createPortal } from "react-dom";
import { ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from "lucide-react";
import { R as Route } from "./router-BrvM1E3B.js";
import "@tanstack/react-router";
import "./event-C34uXxsB.js";
import "./contentStore-DOO6P7qG.js";
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
function GamemodeTile({ gm, tier }) {
  const [imgError, setImgError] = useState(false);
  const colors = tier && tier !== "None" ? tierColors[tier] : null;
  return /* @__PURE__ */ jsxs("div", { className: "group/tile relative flex flex-col items-center gap-2", children: [
    /* @__PURE__ */ jsx(
      "div",
      {
        className: `relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center border transition-all duration-300
          ${tier && colors ? `${colors.bg} ${colors.border} group-hover/tile:scale-110 group-hover/tile:border-[#00BFFF]/60 group-hover/tile:shadow-[0_0_20px_rgba(0,191,255,0.35)]` : "bg-white/3 border-white/10 opacity-30"}`,
        children: !imgError ? /* @__PURE__ */ jsx(
          "img",
          {
            src: gm.icon,
            alt: gm.label,
            width: 28,
            height: 28,
            className: "w-7 h-7 object-contain drop-shadow-[0_0_6px_rgba(0,191,255,0.25)]",
            onError: () => setImgError(true)
          }
        ) : /* @__PURE__ */ jsx("span", { className: "text-xl", children: gm.fallback })
      }
    ),
    /* @__PURE__ */ jsx("span", { className: `text-[11px] font-bold tracking-wide ${colors ? colors.text : "text-gray-700"}`, children: tier ?? "—" }),
    /* @__PURE__ */ jsxs("div", { className: "pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-10 opacity-0 scale-95 translate-y-1 transition-all duration-200 group-hover/tile:opacity-100 group-hover/tile:scale-100 group-hover/tile:translate-y-0", children: [
      /* @__PURE__ */ jsxs("div", { className: "glass border border-[#00BFFF]/20 rounded-lg px-3 py-1.5 text-center whitespace-nowrap shadow-xl shadow-black/40", children: [
        /* @__PURE__ */ jsx("div", { className: "text-white text-xs font-semibold", children: gm.label }),
        tier && colors && /* @__PURE__ */ jsx("div", { className: `text-[11px] font-bold ${colors.text}`, children: tier })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "w-2 h-2 bg-[#161B22] border-r border-b border-[#00BFFF]/20 rotate-45 mx-auto -mt-1" })
    ] })
  ] });
}
function PlayerProfileModal({ player, overallRank, totalPoints, overallTier, onClose }) {
  const [closing, setClosing] = useState(false);
  const [imgError, setImgError] = useState(false);
  const handleClose = useCallback(() => {
    setClosing(true);
    setTimeout(onClose, 180);
  }, [onClose]);
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [handleClose]);
  const points = totalPoints ?? getPlayerTotalPoints(player.ranks);
  const avgTier = overallTier ?? getAverageTier(player.ranks);
  const avgColors = avgTier ? tierColors[avgTier] : null;
  const avgPoints = getAveragePoints(player.ranks);
  const highestTier = getHighestTier(player.ranks);
  const lowestTier = getLowestTier(player.ranks);
  const nameMcUrl = `https://namemc.com/profile/${encodeURIComponent(player.name)}`;
  return createPortal(
    /* @__PURE__ */ jsx(
      "div",
      {
        className: `fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-[#05070c]/75 backdrop-blur-sm ${closing ? "modal-backdrop-out" : "modal-backdrop-in"}`,
        onClick: handleClose,
        role: "dialog",
        "aria-modal": "true",
        "aria-label": `${player.name} player profile`,
        children: /* @__PURE__ */ jsxs(
          "div",
          {
            onClick: (e) => e.stopPropagation(),
            className: `relative w-full max-w-2xl max-h-[92vh] sm:max-h-[88vh] overflow-y-auto glass rounded-2xl sm:rounded-3xl border border-[#00BFFF]/20 shadow-2xl shadow-[#00BFFF]/10 ${closing ? "modal-panel-out" : "modal-panel-in"}`,
            children: [
              /* @__PURE__ */ jsx("div", { className: "absolute -top-24 left-1/2 -translate-x-1/2 w-[420px] h-56 bg-[#0066FF]/20 blur-[100px] pointer-events-none" }),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: handleClose,
                  "aria-label": "Close profile",
                  className: "absolute top-4 right-4 z-10 w-9 h-9 rounded-full flex items-center justify-center bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-[#00BFFF]/40 hover:bg-[#00BFFF]/10 transition-all duration-200",
                  children: "✕"
                }
              ),
              /* @__PURE__ */ jsxs("div", { className: "relative px-6 sm:px-10 pt-10 sm:pt-12 pb-8", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center text-center", children: [
                  /* @__PURE__ */ jsxs("div", { className: "relative mb-4", children: [
                    /* @__PURE__ */ jsx("div", { className: "absolute inset-0 rounded-full bg-[#00BFFF]/40 blur-xl scale-110" }),
                    /* @__PURE__ */ jsx("div", { className: "relative w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1 bg-gradient-to-br from-[#00BFFF] via-[#0099FF] to-[#0066FF] shadow-[0_0_30px_rgba(0,191,255,0.45)]", children: /* @__PURE__ */ jsx("div", { className: "w-full h-full rounded-full overflow-hidden bg-[#0B0F17] flex items-center justify-center", children: !imgError ? /* @__PURE__ */ jsx(
                      "img",
                      {
                        src: player.head,
                        alt: player.name,
                        width: 112,
                        height: 112,
                        className: "w-full h-full object-cover",
                        onError: () => setImgError(true)
                      }
                    ) : /* @__PURE__ */ jsx("span", { className: "text-4xl", children: "👤" }) }) })
                  ] }),
                  /* @__PURE__ */ jsx("h2", { className: "font-['Space_Grotesk'] font-black text-2xl sm:text-3xl text-white leading-tight", children: player.name }),
                  avgTier && avgColors && /* @__PURE__ */ jsxs(
                    "div",
                    {
                      className: `mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${avgColors.bg} ${avgColors.text} ${avgColors.border}`,
                      children: [
                        "Average Tier: ",
                        avgTier
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsx("div", { className: "mt-2 text-gray-500 text-sm font-medium", children: player.region }),
                  /* @__PURE__ */ jsxs(
                    "a",
                    {
                      href: nameMcUrl,
                      target: "_blank",
                      rel: "noreferrer noopener",
                      className: "mt-4 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-[#00BFFF]/40 hover:bg-[#00BFFF]/10 text-gray-300 hover:text-[#00BFFF] text-xs font-semibold transition-all duration-200",
                      children: [
                        "NameMC",
                        /* @__PURE__ */ jsx("span", { "aria-hidden": "true", children: "↗" })
                      ]
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "mt-8", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
                    /* @__PURE__ */ jsx("span", { "aria-hidden": "true", children: "🏆" }),
                    /* @__PURE__ */ jsx("span", { className: "text-gray-500 text-xs font-bold tracking-widest uppercase", children: "Position" }),
                    /* @__PURE__ */ jsx("div", { className: "h-px flex-1 bg-white/8" })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "glass rounded-xl border border-white/8 px-5 py-4 flex items-center justify-between", children: [
                    /* @__PURE__ */ jsxs("div", { children: [
                      /* @__PURE__ */ jsx("div", { className: "text-white font-['Space_Grotesk'] font-bold text-lg", children: overallRank ? `#${overallRank} Overall` : "Unranked" }),
                      /* @__PURE__ */ jsx("div", { className: "text-gray-500 text-xs mt-0.5", children: highestTier && lowestTier ? `Best ${highestTier} · Worst ${lowestTier}` : "No gamemode placements yet" })
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
                      /* @__PURE__ */ jsxs("div", { className: "text-[#00BFFF] font-['Space_Grotesk'] font-black text-xl", children: [
                        points,
                        " pts"
                      ] }),
                      /* @__PURE__ */ jsxs("div", { className: "text-gray-600 text-[11px]", children: [
                        avgPoints.toFixed(1),
                        " avg / gamemode"
                      ] })
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "mt-6", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
                    /* @__PURE__ */ jsx("span", { "aria-hidden": "true", children: "⚔" }),
                    /* @__PURE__ */ jsx("span", { className: "text-gray-500 text-xs font-bold tracking-widest uppercase", children: "Tier Placements" }),
                    /* @__PURE__ */ jsx("div", { className: "h-px flex-1 bg-white/8" })
                  ] }),
                  /* @__PURE__ */ jsx("div", { className: "grid grid-cols-4 sm:grid-cols-7 gap-4 sm:gap-3 justify-items-center", children: gamemodes.map((gm) => /* @__PURE__ */ jsx(GamemodeTile, { gm, tier: player.ranks[gm.key] }, gm.key)) })
                ] })
              ] })
            ]
          }
        )
      }
    ),
    document.body
  );
}
function TierBadge({ tier }) {
  const colors = tierColors[tier];
  if (!colors) return null;
  return /* @__PURE__ */ jsx("span", { className: `text-xs font-bold px-1.5 py-0.5 rounded-md border ${colors.bg} ${colors.text} ${colors.border}`, children: tier });
}
function GamemodeIcon({ gm, tier }) {
  const [hovered, setHovered] = useState(false);
  const [iconError, setIconError] = useState(false);
  const ranked = tier && tier !== "None";
  const colors = ranked ? tierColors[tier] : null;
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: "relative",
      onMouseEnter: () => setHovered(true),
      onMouseLeave: () => setHovered(false),
      children: [
        /* @__PURE__ */ jsx(
          "div",
          {
            className: `w-9 h-9 rounded-lg flex items-center justify-center text-lg border transition-all duration-200 cursor-default
          ${ranked && colors ? `${colors.bg} ${colors.border} hover:shadow-lg hover:${colors.glow} hover:scale-110` : "bg-white/3 border-white/10 opacity-30"}`,
            children: !iconError ? /* @__PURE__ */ jsx(
              "img",
              {
                src: gm.icon,
                alt: gm.label,
                width: 18,
                height: 18,
                className: "w-[18px] h-[18px] object-contain",
                onError: () => setIconError(true)
              }
            ) : gm.fallback
          }
        ),
        hovered && ranked && /* @__PURE__ */ jsxs("div", { className: "absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-none", children: [
          /* @__PURE__ */ jsxs("div", { className: "glass border border-white/10 rounded-lg px-3 py-2 text-center whitespace-nowrap shadow-xl", children: [
            /* @__PURE__ */ jsx("div", { className: "text-white text-xs font-semibold mb-1", children: gm.label }),
            /* @__PURE__ */ jsx(TierBadge, { tier })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "w-2 h-2 bg-[#161B22] border-r border-b border-white/10 rotate-45 mx-auto -mt-1" })
        ] })
      ]
    }
  );
}
function PlayerCard({ player, totalPoints, overallRank, overallTier }) {
  const [imgError, setImgError] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const overallColors = overallTier ? tierColors[overallTier] : null;
  return /* @__PURE__ */ jsxs(
    "div",
    {
      onClick: () => setShowProfile(true),
      role: "button",
      tabIndex: 0,
      onKeyDown: (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setShowProfile(true);
        }
      },
      className: "player-card glass rounded-2xl border border-white/5 hover:border-[#00BFFF]/30 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#00BFFF]/5 group cursor-pointer",
      children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 mb-3", children: [
          /* @__PURE__ */ jsx("div", { className: "relative flex-shrink-0", children: !imgError ? /* @__PURE__ */ jsx(
            "img",
            {
              src: player.head,
              alt: player.name,
              width: 44,
              height: 44,
              className: "rounded-lg ring-2 ring-white/10 group-hover:ring-[#00BFFF]/30 transition-all duration-300",
              onError: () => setImgError(true)
            }
          ) : /* @__PURE__ */ jsx("div", { className: "w-11 h-11 rounded-lg bg-[#00BFFF]/10 border border-[#00BFFF]/20 flex items-center justify-center text-lg", children: "👤" }) }),
          /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-1", children: [
              /* @__PURE__ */ jsx("div", { className: "font-['Space_Grotesk'] font-semibold text-white text-sm leading-tight truncate", children: player.name }),
              totalPoints !== void 0 && /* @__PURE__ */ jsxs("span", { className: "flex-shrink-0 text-xs font-bold px-1.5 py-0.5 rounded-md bg-[#00BFFF]/10 text-[#00BFFF] border border-[#00BFFF]/20", children: [
                totalPoints,
                " pts"
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mt-0.5", children: [
              overallRank !== void 0 && /* @__PURE__ */ jsxs("span", { className: "text-gray-400 text-xs font-semibold", children: [
                "#",
                overallRank,
                " Overall"
              ] }),
              overallTier && overallColors && overallRank !== void 0 && /* @__PURE__ */ jsx("span", { className: "text-gray-700 text-xs", children: "·" }),
              overallTier && overallColors && /* @__PURE__ */ jsxs("span", { className: `text-xs font-semibold ${overallColors.text}`, children: [
                overallTier,
                " Avg"
              ] })
            ] }),
            overallRank === void 0 && /* @__PURE__ */ jsxs("div", { className: "text-gray-600 text-xs mt-0.5", children: [
              Object.values(player.ranks).filter((v) => v && v !== "None").length,
              " gamemodes"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-1.5", children: gamemodes.map((gm) => /* @__PURE__ */ jsx(
          GamemodeIcon,
          {
            gm,
            tier: player.ranks[gm.key]
          },
          gm.key
        )) }),
        showProfile && /* @__PURE__ */ jsx(
          PlayerProfileModal,
          {
            player,
            totalPoints,
            overallRank,
            overallTier,
            onClose: () => setShowProfile(false)
          }
        )
      ]
    }
  );
}
const PLAYERS_PER_PAGE = 24;
function RankingsPage() {
  const {
    players
  } = Route.useLoaderData();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [sortMode, setSortMode] = useState("points-desc");
  const [minTier, setMinTier] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isFading, setIsFading] = useState(false);
  const [renderPage, setRenderPage] = useState(1);
  const rankingsSectionRef = useRef(null);
  const globalRankings = useMemo(() => computeRankings(players), [players]);
  const filtered = useMemo(() => {
    return players.filter((p) => {
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (activeFilter !== "all" && (!p.ranks[activeFilter] || p.ranks[activeFilter] === "None")) return false;
      if (minTier !== "all") {
        const minVal = tierSortValue(minTier);
        const bestVal = activeFilter !== "all" ? tierSortValue(p.ranks[activeFilter]) : Math.min(...Object.values(p.ranks).filter(Boolean).map((t) => tierSortValue(t)));
        if (bestVal > minVal) return false;
      }
      return true;
    }).sort((a, b) => {
      const aInfo = globalRankings.get(a.name);
      const bInfo = globalRankings.get(b.name);
      if (sortMode === "points-desc") {
        if (activeFilter !== "all") {
          return tierSortValue(a.ranks[activeFilter]) - tierSortValue(b.ranks[activeFilter]);
        }
        return bInfo.totalPoints - aInfo.totalPoints;
      }
      if (sortMode === "points-asc") {
        if (activeFilter !== "all") {
          return tierSortValue(b.ranks[activeFilter]) - tierSortValue(a.ranks[activeFilter]);
        }
        return aInfo.totalPoints - bInfo.totalPoints;
      }
      if (sortMode === "name-asc") return a.name.localeCompare(b.name);
      if (sortMode === "name-desc") return b.name.localeCompare(a.name);
      return 0;
    });
  }, [search, activeFilter, sortMode, minTier, globalRankings]);
  useEffect(() => {
    setCurrentPage(1);
    setRenderPage(1);
  }, [search, activeFilter, sortMode, minTier]);
  const totalPages = Math.ceil(filtered.length / PLAYERS_PER_PAGE) || 1;
  const paginatedPlayers = useMemo(() => {
    const startIndex = (renderPage - 1) * PLAYERS_PER_PAGE;
    const endIndex = startIndex + PLAYERS_PER_PAGE;
    return filtered.slice(startIndex, endIndex);
  }, [filtered, renderPage]);
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages || newPage === currentPage) return;
    setIsFading(true);
    setCurrentPage(newPage);
    if (rankingsSectionRef.current) {
      rankingsSectionRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
    setTimeout(() => {
      setRenderPage(newPage);
      setIsFading(false);
    }, 200);
  };
  const sortOptions = [{
    value: "points-desc",
    label: "Points (High → Low)"
  }, {
    value: "points-asc",
    label: "Points (Low → High)"
  }, {
    value: "name-asc",
    label: "Name (A → Z)"
  }, {
    value: "name-desc",
    label: "Name (Z → A)"
  }];
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-[#0B0F17]", children: [
    /* @__PURE__ */ jsx(Navbar, {}),
    /* @__PURE__ */ jsxs("section", { className: "relative pt-64 pb-12 px-4 overflow-hidden", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-b from-[#00BFFF]/5 to-transparent pointer-events-none" }),
      /* @__PURE__ */ jsx("div", { className: "absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-64 bg-[#0066FF]/10 blur-[100px] pointer-events-none" }),
      /* @__PURE__ */ jsxs("div", { className: "max-w-6xl mx-auto text-center relative", children: [
        /* @__PURE__ */ jsxs("div", { className: "inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#00BFFF]/20 bg-[#00BFFF]/5 text-[#00BFFF] text-xs font-semibold mb-6 tracking-wide uppercase", children: [
          /* @__PURE__ */ jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-[#00BFFF] animate-pulse" }),
          "Live Rankings"
        ] }),
        /* @__PURE__ */ jsxs("h1", { className: "font-['Space_Grotesk'] font-black text-4xl sm:text-5xl text-white mb-4", children: [
          "Player ",
          /* @__PURE__ */ jsx("span", { className: "text-gradient", children: "Rankings" })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-gray-500 max-w-md mx-auto", children: "Official tier placements for the Blue Tiers network." })
      ] })
    ] }),
    /* @__PURE__ */ jsx("section", { className: "px-4 pb-6", children: /* @__PURE__ */ jsx("div", { className: "max-w-6xl mx-auto", children: /* @__PURE__ */ jsx("div", { className: "glass rounded-xl border border-white/5 p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2 justify-center", children: [
      /* @__PURE__ */ jsx("span", { className: "text-gray-600 text-xs font-semibold uppercase tracking-wide mr-2", children: "Tiers:" }),
      TIER_ORDER.map((tier) => {
        const colors = tierColors[tier];
        return /* @__PURE__ */ jsxs("span", { className: `px-3 py-1 rounded-lg text-xs font-bold border ${colors.bg} ${colors.text} ${colors.border}`, children: [
          tier,
          /* @__PURE__ */ jsxs("span", { className: "ml-1 opacity-60 font-normal", children: [
            TIER_POINTS[tier],
            "pt"
          ] })
        ] }, tier);
      }),
      /* @__PURE__ */ jsx("span", { className: "px-3 py-1 rounded-lg text-xs font-bold border bg-white/3 text-gray-600 border-white/10", children: "Unranked" })
    ] }) }) }) }),
    /* @__PURE__ */ jsx("section", { ref: rankingsSectionRef, className: "px-4 pb-8 scroll-mt-24", children: /* @__PURE__ */ jsxs("div", { className: "max-w-6xl mx-auto space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsx("div", { className: "absolute left-4 top-1/2 -translate-y-1/2 text-gray-500", children: /* @__PURE__ */ jsxs("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: [
          /* @__PURE__ */ jsx("circle", { cx: "11", cy: "11", r: "8" }),
          /* @__PURE__ */ jsx("path", { d: "m21 21-4.35-4.35" })
        ] }) }),
        /* @__PURE__ */ jsx("input", { type: "text", value: search, onChange: (e) => setSearch(e.target.value), placeholder: "Search player...", className: "w-full bg-white/3 border border-white/8 hover:border-white/15 focus:border-[#00BFFF]/50 rounded-xl pl-11 pr-4 py-3 text-white text-sm placeholder-gray-600 outline-none transition-all duration-200" }),
        search && /* @__PURE__ */ jsx("button", { onClick: () => setSearch(""), className: "absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors", children: "✕" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600 text-xs font-semibold uppercase tracking-wide", children: "Sort:" }),
          /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-1.5", children: sortOptions.map((opt) => /* @__PURE__ */ jsx("button", { onClick: () => setSortMode(opt.value), className: `px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${sortMode === opt.value ? "bg-[#00BFFF]/15 text-[#00BFFF] border border-[#00BFFF]/30" : "bg-white/3 text-gray-500 border border-white/8 hover:text-white hover:border-white/20"}`, children: opt.label }, opt.value)) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 ml-auto", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600 text-xs font-semibold uppercase tracking-wide", children: "Min Tier:" }),
          /* @__PURE__ */ jsxs("select", { value: minTier, onChange: (e) => setMinTier(e.target.value), className: "bg-white/3 border border-white/8 hover:border-white/15 focus:border-[#00BFFF]/50 rounded-lg px-3 py-1.5 text-xs text-white outline-none transition-all duration-200 cursor-pointer", children: [
            /* @__PURE__ */ jsx("option", { value: "all", className: "bg-[#111827]", children: "All Tiers" }),
            TIER_ORDER.map((t) => /* @__PURE__ */ jsxs("option", { value: t, className: "bg-[#111827]", children: [
              t,
              "+"
            ] }, t))
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2", children: [
        /* @__PURE__ */ jsx("button", { onClick: () => setActiveFilter("all"), className: `px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${activeFilter === "all" ? "bg-[#00BFFF]/15 text-[#00BFFF] border border-[#00BFFF]/30" : "bg-white/3 text-gray-500 border border-white/8 hover:text-white hover:border-white/20"}`, children: "All" }),
        gamemodes.map((gm) => /* @__PURE__ */ jsxs("button", { onClick: () => setActiveFilter(gm.key), className: `flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${activeFilter === gm.key ? "bg-[#00BFFF]/15 text-[#00BFFF] border border-[#00BFFF]/30" : "bg-white/3 text-gray-500 border border-white/8 hover:text-white hover:border-white/20"}`, children: [
          /* @__PURE__ */ jsx("span", { children: gm.fallback }),
          gm.label
        ] }, gm.key))
      ] })
    ] }) }),
    /* @__PURE__ */ jsx("section", { className: "px-4 pb-16", children: /* @__PURE__ */ jsx("div", { className: "max-w-6xl mx-auto", children: filtered.length > 0 ? /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center text-gray-600 text-xs mb-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          "Showing ",
          Math.min(filtered.length, (currentPage - 1) * PLAYERS_PER_PAGE + 1),
          "-",
          Math.min(filtered.length, currentPage * PLAYERS_PER_PAGE),
          " of ",
          filtered.length,
          " player",
          filtered.length !== 1 ? "s" : "",
          " found",
          activeFilter !== "all" && ` in ${gamemodes.find((g) => g.key === activeFilter)?.label}`
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          "Page ",
          currentPage,
          " of ",
          totalPages
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: `transition-opacity duration-200 ease-in-out ${isFading ? "opacity-0" : "opacity-100"}`, children: /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 stagger", children: paginatedPlayers.map((player) => {
        const info = globalRankings.get(player.name);
        return /* @__PURE__ */ jsx(PlayerCard, { player, totalPoints: info?.totalPoints, overallRank: info?.rank, overallTier: info?.overallTier }, player.name);
      }) }) }),
      totalPages > 1 && /* @__PURE__ */ jsx("div", { className: "mt-12 flex justify-center", children: /* @__PURE__ */ jsxs("nav", { className: "glass flex items-center justify-between gap-1 sm:gap-3 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl border border-white/5 shadow-lg shadow-black/40 relative overflow-hidden", "aria-label": "Pagination", children: [
        /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-r from-[#00BFFF]/5 to-[#0066FF]/5 pointer-events-none" }),
        /* @__PURE__ */ jsx("button", { onClick: () => handlePageChange(1), disabled: currentPage === 1, className: "p-2.5 sm:p-3 rounded-lg text-gray-400 hover:text-white hover:bg-[#00BFFF]/10 border border-transparent hover:border-[#00BFFF]/20 transition-all duration-200 disabled:opacity-30 disabled:pointer-events-none focus:outline-none focus:ring-1 focus:ring-[#00BFFF]/50", "aria-label": "Go to first page", children: /* @__PURE__ */ jsx(ChevronsLeft, { className: "w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-200 active:-translate-x-1" }) }),
        /* @__PURE__ */ jsx("button", { onClick: () => handlePageChange(currentPage - 1), disabled: currentPage === 1, className: "p-2.5 sm:p-3 rounded-lg text-gray-400 hover:text-white hover:bg-[#00BFFF]/10 border border-transparent hover:border-[#00BFFF]/20 transition-all duration-200 disabled:opacity-30 disabled:pointer-events-none focus:outline-none focus:ring-1 focus:ring-[#00BFFF]/50", "aria-label": "Go to previous page", children: /* @__PURE__ */ jsx(ChevronLeft, { className: "w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-200 active:-translate-x-1" }) }),
        /* @__PURE__ */ jsxs("div", { className: "px-3 sm:px-6 py-1 mx-1 flex flex-col items-center justify-center min-w-[100px] sm:min-w-[140px] select-none text-center", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-400 text-[10px] sm:text-xs font-semibold uppercase tracking-wider", children: "Rankings Navigation" }),
          /* @__PURE__ */ jsxs("span", { className: "font-['Space_Grotesk'] text-sm sm:text-base font-bold text-white mt-0.5", children: [
            "Page ",
            /* @__PURE__ */ jsx("span", { className: "text-gradient font-black", children: currentPage }),
            " ",
            /* @__PURE__ */ jsx("span", { className: "text-gray-600 font-normal", children: "/" }),
            " ",
            totalPages
          ] })
        ] }),
        /* @__PURE__ */ jsx("button", { onClick: () => handlePageChange(currentPage + 1), disabled: currentPage === totalPages, className: "p-2.5 sm:p-3 rounded-lg text-gray-400 hover:text-white hover:bg-[#00BFFF]/10 border border-transparent hover:border-[#00BFFF]/20 transition-all duration-200 disabled:opacity-30 disabled:pointer-events-none focus:outline-none focus:ring-1 focus:ring-[#00BFFF]/50", "aria-label": "Go to next page", children: /* @__PURE__ */ jsx(ChevronRight, { className: "w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-200 active:translate-x-1" }) }),
        /* @__PURE__ */ jsx("button", { onClick: () => handlePageChange(totalPages), disabled: currentPage === totalPages, className: "p-2.5 sm:p-3 rounded-lg text-gray-400 hover:text-white hover:bg-[#00BFFF]/10 border border-transparent hover:border-[#00BFFF]/20 transition-all duration-200 disabled:opacity-30 disabled:pointer-events-none focus:outline-none focus:ring-1 focus:ring-[#00BFFF]/50", "aria-label": "Go to last page", children: /* @__PURE__ */ jsx(ChevronsRight, { className: "w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-200 active:translate-x-1" }) })
      ] }) })
    ] }) : /* @__PURE__ */ jsxs("div", { className: "text-center py-24", children: [
      /* @__PURE__ */ jsx("div", { className: "text-5xl mb-4", children: "🔍" }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-500 text-lg font-semibold", children: "No players found" }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-700 text-sm mt-1", children: "Try a different search or filter" }),
      /* @__PURE__ */ jsx("button", { onClick: () => {
        setSearch("");
        setActiveFilter("all");
        setMinTier("all");
      }, className: "mt-4 px-5 py-2 rounded-lg bg-[#00BFFF]/10 text-[#00BFFF] text-sm hover:bg-[#00BFFF]/20 transition-colors border border-[#00BFFF]/20", children: "Clear filters" })
    ] }) }) }),
    /* @__PURE__ */ jsx(Footer, {})
  ] });
}
export {
  RankingsPage as component
};
