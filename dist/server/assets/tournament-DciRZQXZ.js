import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useEffect, useRef } from "react";
import { r as registerTeam, g as getTournamentData } from "./tournamentServer-BWO3KrbW.js";
import { S as STATUS_LABEL, b as STATUS_COLOR, M as MATCH_STATUS_LABEL } from "./tournament-BY9twqTI.js";
import { N as Navbar } from "./Navbar-Do86Frob.js";
import "./router-rI-2RV5_.js";
import "@tanstack/react-router";
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
import "./event-C34uXxsB.js";
function Countdown({ target }) {
  const [diff, setDiff] = useState(target - Date.now());
  useEffect(() => {
    const id = setInterval(() => setDiff(target - Date.now()), 1e3);
    return () => clearInterval(id);
  }, [target]);
  if (diff <= 0) return /* @__PURE__ */ jsx("span", { className: "text-red-400 font-bold text-sm", children: "Expired" });
  const d = Math.floor(diff / 864e5);
  const h = Math.floor(diff % 864e5 / 36e5);
  const m = Math.floor(diff % 36e5 / 6e4);
  const s = Math.floor(diff % 6e4 / 1e3);
  return /* @__PURE__ */ jsx("div", { className: "flex gap-3 justify-center", children: [["D", d], ["H", h], ["M", m], ["S", s]].map(([label, val]) => /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
    /* @__PURE__ */ jsx("div", { className: "text-2xl md:text-3xl font-black text-[#00BFFF] font-['Space_Grotesk'] tabular-nums w-14 h-14 flex items-center justify-center bg-[#00BFFF]/10 border border-[#00BFFF]/20 rounded-xl", children: String(val).padStart(2, "0") }),
    /* @__PURE__ */ jsx("div", { className: "text-[10px] text-gray-500 mt-1 uppercase tracking-widest", children: label })
  ] }, label)) });
}
function TournamentHome({ active, onRegisterClick }) {
  if (!active) {
    return /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center py-32 text-center", children: [
      /* @__PURE__ */ jsx("div", { className: "text-7xl mb-6 opacity-20", children: "🏆" }),
      /* @__PURE__ */ jsx("h2", { className: "font-['Space_Grotesk'] font-bold text-2xl text-white mb-3", children: "No Active Tournament" }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-500 max-w-md text-sm", children: "There are currently no active tournaments. Check the Announcements tab or come back soon." })
    ] });
  }
  const approvedTeams = active.teams.filter((t) => t.status === "approved");
  const totalPlayers = approvedTeams.reduce((n, t) => n + t.players.length, 0);
  const canRegister = active.status === "registration_open" || active.status === "live";
  const deadline = active.registrationDeadline;
  const start = active.startDate;
  const statCards = [
    { label: "Registered Teams", value: approvedTeams.length, icon: "👥" },
    { label: "Total Players", value: totalPlayers, icon: "⚔️" },
    { label: "Gamemode", value: active.gamemode || "—", icon: "🎮" },
    {
      label: "Team Size",
      value: active.maxTeamSize === active.minTeamSize ? `${active.maxTeamSize}v${active.maxTeamSize}` : `${active.minTeamSize}–${active.maxTeamSize}`,
      icon: "🧩"
    }
  ];
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "relative rounded-2xl overflow-hidden border border-white/8 bg-gradient-to-br from-[#0D1320] to-[#111827]", children: [
      active.banner && /* @__PURE__ */ jsx(
        "div",
        {
          className: "absolute inset-0 opacity-15 bg-cover bg-center",
          style: { backgroundImage: `url(${active.banner})` }
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-[#0D1320] via-[#0D1320]/60 to-transparent" }),
      /* @__PURE__ */ jsxs("div", { className: "relative px-8 md:px-12 py-10 text-center space-y-5", children: [
        /* @__PURE__ */ jsxs("div", { className: `inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-bold uppercase tracking-wider ${STATUS_COLOR[active.status]}`, children: [
          active.status === "live" && /* @__PURE__ */ jsx("span", { className: "w-2 h-2 rounded-full bg-red-400 animate-pulse" }),
          STATUS_LABEL[active.status]
        ] }),
        /* @__PURE__ */ jsx("h2", { className: "font-['Space_Grotesk'] font-black text-2xl md:text-4xl text-white", children: active.name }),
        active.description && /* @__PURE__ */ jsx("p", { className: "text-gray-400 max-w-xl mx-auto text-sm leading-relaxed", children: active.description }),
        deadline && canRegister && /* @__PURE__ */ jsxs("div", { className: "space-y-2 pt-1", children: [
          /* @__PURE__ */ jsx("p", { className: "text-gray-500 text-[11px] uppercase tracking-widest", children: "Registration closes in" }),
          /* @__PURE__ */ jsx(Countdown, { target: deadline })
        ] }),
        start && (active.status === "upcoming" || canRegister || active.status === "registration_closed") && /* @__PURE__ */ jsxs("div", { className: "space-y-2 pt-1", children: [
          /* @__PURE__ */ jsx("p", { className: "text-gray-500 text-[11px] uppercase tracking-widest", children: "Tournament starts in" }),
          /* @__PURE__ */ jsx(Countdown, { target: start })
        ] }),
        active.serverIp && /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-3 justify-center pt-2", children: /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => navigator.clipboard.writeText(active.serverIp),
            className: "px-5 py-3 rounded-xl bg-white/5 hover:bg-white/8 border border-white/10 text-white text-sm font-medium transition-all font-mono",
            children: [
              "📋 ",
              active.serverIp
            ]
          }
        ) })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3", children: statCards.map((c) => /* @__PURE__ */ jsxs("div", { className: "glass border border-white/5 rounded-xl p-5 text-center", children: [
      /* @__PURE__ */ jsx("div", { className: "text-2xl mb-2", children: c.icon }),
      /* @__PURE__ */ jsx("div", { className: "font-['Space_Grotesk'] font-bold text-xl text-white", children: c.value }),
      /* @__PURE__ */ jsx("div", { className: "text-gray-500 text-xs mt-1", children: c.label })
    ] }, c.label)) }),
    /* @__PURE__ */ jsxs("div", { className: "grid md:grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "glass border border-white/5 rounded-xl p-6 space-y-4", children: [
        /* @__PURE__ */ jsx("h3", { className: "font-['Space_Grotesk'] font-bold text-white text-sm", children: "Tournament Details" }),
        /* @__PURE__ */ jsx("div", { className: "space-y-3", children: [
          { label: "Status", value: STATUS_LABEL[active.status] },
          { label: "Gamemode", value: active.gamemode || "—" },
          { label: "Server IP", value: active.serverIp || "—" },
          {
            label: "Team Size",
            value: active.maxTeamSize === active.minTeamSize ? `${active.maxTeamSize} players` : `${active.minTeamSize}–${active.maxTeamSize} players`
          },
          { label: "Prize Pool", value: active.prizePool || "—" },
          ...deadline ? [{ label: "Reg. Deadline", value: new Date(deadline).toLocaleString() }] : [],
          ...start ? [{ label: "Start Date", value: new Date(start).toLocaleString() }] : []
        ].map(({ label, value }) => /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-500", children: label }),
          /* @__PURE__ */ jsx("span", { className: "text-white font-medium", children: value })
        ] }, label)) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "glass border border-white/5 rounded-xl p-6 space-y-4", children: [
        /* @__PURE__ */ jsx("h3", { className: "font-['Space_Grotesk'] font-bold text-white text-sm", children: "Top Prizes" }),
        active.prizes.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-xs", children: "Prizes will be announced soon." }) : /* @__PURE__ */ jsx("div", { className: "space-y-2", children: active.prizes.slice(0, 3).map((prize) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 p-3 rounded-lg bg-white/3 border border-white/5", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xl", children: prize.label.split(" ")[0] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-white text-xs font-semibold", children: prize.label.split(" ").slice(1).join(" ") }),
            /* @__PURE__ */ jsx("p", { className: "text-gray-500 text-[11px]", children: prize.rewards.map((r) => `${r.amount} ${r.label}`).join(" + ") })
          ] })
        ] }, prize.placement)) })
      ] })
    ] }),
    approvedTeams.length > 0 && /* @__PURE__ */ jsxs("div", { className: "glass border border-white/5 rounded-xl p-6 space-y-4", children: [
      /* @__PURE__ */ jsxs("h3", { className: "font-['Space_Grotesk'] font-bold text-white text-sm", children: [
        "Competing Teams ",
        /* @__PURE__ */ jsxs("span", { className: "text-gray-500 font-normal", children: [
          "(",
          approvedTeams.length,
          ")"
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2", children: approvedTeams.map((team) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 p-3 rounded-lg bg-white/3 border border-white/5", children: [
        /* @__PURE__ */ jsx("span", { className: "w-7 h-7 rounded-full bg-[#00BFFF]/15 border border-[#00BFFF]/20 flex items-center justify-center text-[10px] font-bold text-[#00BFFF]", children: team.name.slice(0, 2).toUpperCase() }),
        /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsx("p", { className: "text-white text-xs font-semibold truncate", children: team.name }),
          /* @__PURE__ */ jsxs("p", { className: "text-gray-500 text-[10px]", children: [
            team.players.length,
            "p"
          ] })
        ] })
      ] }, team.id)) })
    ] })
  ] });
}
function MatchDetailModal({ match, teams, onClose }) {
  const t1 = teams.find((t) => t.id === match.team1Id);
  const t2 = teams.find((t) => t.id === match.team2Id);
  const fields = [
    ["Match #", String(match.matchNumber)],
    ["Bracket", match.bracketSide.replace("_", " ")],
    ["Round", String(match.round + 1)],
    ["Status", MATCH_STATUS_LABEL[match.status]],
    ["Gamemode", match.gamemode || "—"],
    ["Arena", match.arena || "—"],
    ["Referee", match.referee || "—"],
    ["Scheduled", match.scheduledAt ? new Date(match.scheduledAt).toLocaleString() : "—"],
    ["Completed", match.completedAt ? new Date(match.completedAt).toLocaleString() : "—"]
  ];
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm", children: /* @__PURE__ */ jsxs("div", { className: "bg-[#111827] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/5", children: [
      /* @__PURE__ */ jsx("h2", { className: "font-['Space_Grotesk'] font-bold text-white text-lg", children: "Match Details" }),
      /* @__PURE__ */ jsx("button", { onClick: onClose, className: "text-gray-600 hover:text-white transition-colors text-xl", children: "✕" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "p-6 space-y-6", children: [
      /* @__PURE__ */ jsx("div", { className: "bg-[#0B0F17] rounded-xl p-6", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-4", children: [
        /* @__PURE__ */ jsx(TeamSide, { team: t1, score: match.score1, winner: match.winnerId === match.team1Id }),
        /* @__PURE__ */ jsx("div", { className: "text-gray-600 font-bold text-sm uppercase tracking-widest", children: "VS" }),
        /* @__PURE__ */ jsx(TeamSide, { team: t2, score: match.score2, winner: match.winnerId === match.team2Id, align: "right" })
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-2", children: fields.map(([label, value]) => /* @__PURE__ */ jsxs("div", { className: "bg-white/3 rounded-lg px-3 py-2", children: [
        /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-[10px] uppercase tracking-wider", children: label }),
        /* @__PURE__ */ jsx("p", { className: "text-white text-xs font-medium capitalize mt-0.5", children: value })
      ] }, label)) }),
      /* @__PURE__ */ jsx("div", { className: "grid md:grid-cols-2 gap-4", children: [t1, t2].map((team, idx) => team && /* @__PURE__ */ jsxs("div", { className: "bg-white/3 rounded-xl p-4 space-y-2", children: [
        /* @__PURE__ */ jsx("p", { className: "text-gray-400 text-xs font-bold uppercase tracking-wider", children: team.name }),
        team.players.map((p) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(
            "img",
            {
              src: `https://mc-heads.net/avatar/${p}/16`,
              onError: (e) => {
                e.target.style.display = "none";
              },
              className: "w-4 h-4 rounded-sm",
              alt: ""
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "text-white text-xs", children: p }),
          p === team.captain && /* @__PURE__ */ jsx("span", { className: "text-[9px] text-yellow-400 bg-yellow-400/10 px-1.5 py-0.5 rounded", children: "Captain" })
        ] }, p))
      ] }, idx)) }),
      match.notes && /* @__PURE__ */ jsxs("div", { className: "bg-[#00BFFF]/5 border border-[#00BFFF]/10 rounded-xl p-4", children: [
        /* @__PURE__ */ jsx("p", { className: "text-gray-400 text-xs font-bold uppercase tracking-wider mb-2", children: "Notes" }),
        /* @__PURE__ */ jsx("p", { className: "text-gray-300 text-sm", children: match.notes })
      ] }),
      match.replayLink && /* @__PURE__ */ jsx(
        "a",
        {
          href: match.replayLink,
          target: "_blank",
          rel: "noopener noreferrer",
          className: "flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-sm text-[#00BFFF] font-medium transition-all",
          children: "🎬 View Replay →"
        }
      )
    ] })
  ] }) });
}
function TeamSide({ team, score, winner, align = "left" }) {
  return /* @__PURE__ */ jsxs("div", { className: `flex-1 ${align === "right" ? "text-right" : "text-left"}`, children: [
    /* @__PURE__ */ jsx("p", { className: `font-['Space_Grotesk'] font-black text-3xl ${winner ? "text-[#00BFFF]" : "text-white"}`, children: score }),
    /* @__PURE__ */ jsx("p", { className: `text-sm font-semibold mt-1 ${winner ? "text-white" : "text-gray-400"}`, children: team?.name ?? /* @__PURE__ */ jsx("span", { className: "italic text-gray-600", children: "TBD" }) }),
    winner && /* @__PURE__ */ jsx("p", { className: "text-[10px] text-[#00BFFF] font-bold mt-0.5 uppercase tracking-wider", children: "Winner ✓" })
  ] });
}
function MatchCard({
  match,
  teams,
  onClick
}) {
  const t1 = teams.find((t) => t.id === match.team1Id);
  const t2 = teams.find((t) => t.id === match.team2Id);
  const statusColor = {
    live: "border-red-500/40 bg-red-500/5",
    completed: "border-white/10 bg-white/2",
    pending: "border-white/5 bg-white/2 opacity-60",
    scheduled: "border-[#00BFFF]/20 bg-[#00BFFF]/3",
    bye: "border-white/5 bg-white/2 opacity-40"
  };
  return /* @__PURE__ */ jsxs(
    "button",
    {
      onClick,
      className: `w-52 rounded-xl border p-3 text-left transition-all hover:scale-105 hover:shadow-lg ${statusColor[match.status] || "border-white/5"}`,
      children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsx(TeamRow, { team: t1, score: match.score1, winner: match.winnerId === match.team1Id }),
          /* @__PURE__ */ jsx("div", { className: "border-t border-white/5" }),
          /* @__PURE__ */ jsx(TeamRow, { team: t2, score: match.score2, winner: match.winnerId === match.team2Id })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-2 flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("span", { className: `text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded ${match.status === "live" ? "text-red-400 bg-red-400/10" : "text-gray-600"}`, children: [
            match.status === "live" && "🔴 ",
            MATCH_STATUS_LABEL[match.status]
          ] }),
          /* @__PURE__ */ jsxs("span", { className: "text-gray-700 text-[9px]", children: [
            "M",
            match.matchNumber
          ] })
        ] })
      ]
    }
  );
}
function TeamRow({ team, score, winner }) {
  return /* @__PURE__ */ jsxs("div", { className: `flex items-center justify-between gap-2 ${winner ? "text-[#00BFFF]" : "text-gray-400"}`, children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 min-w-0", children: [
      /* @__PURE__ */ jsx(
        "img",
        {
          src: `https://mc-heads.net/avatar/${team?.captain ?? "Steve"}/16`,
          onError: (e) => {
            e.target.style.display = "none";
          },
          className: "w-4 h-4 rounded-sm flex-shrink-0",
          alt: ""
        }
      ),
      /* @__PURE__ */ jsx("span", { className: `text-xs font-semibold truncate max-w-[100px] ${winner ? "text-white" : ""}`, children: team?.name ?? /* @__PURE__ */ jsx("span", { className: "text-gray-700 italic", children: "TBD" }) })
    ] }),
    /* @__PURE__ */ jsx("span", { className: `text-sm font-black font-['Space_Grotesk'] ${winner ? "text-[#00BFFF]" : ""}`, children: score })
  ] });
}
function TournamentBracket({ tournament }) {
  const [selected, setSelected] = useState(null);
  if (!tournament) {
    return /* @__PURE__ */ jsx(EmptyState$1, { message: "No active tournament." });
  }
  if (!tournament.bracket) {
    return /* @__PURE__ */ jsx(EmptyState$1, { message: "Bracket has not been generated yet." });
  }
  const { bracket, matches, teams } = tournament;
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("h2", { className: "font-['Space_Grotesk'] font-bold text-white text-xl", children: [
          tournament.name,
          " — Bracket"
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-gray-500 text-sm mt-0.5 capitalize", children: bracket.type.replace("_", " ") })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "text-xs text-gray-600 flex items-center gap-3", children: [
        /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsx("span", { className: "w-2 h-2 rounded-full bg-red-400" }),
          "Live"
        ] }),
        /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsx("span", { className: "w-2 h-2 rounded-full bg-[#00BFFF]" }),
          "Scheduled"
        ] }),
        /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsx("span", { className: "w-2 h-2 rounded-full bg-gray-700" }),
          "Pending"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "overflow-x-auto pb-6", children: /* @__PURE__ */ jsx("div", { className: "flex gap-8 items-start min-w-max py-4 px-2", children: bracket.rounds.map((round, ri) => {
      const roundMatches = round.matchIds.map((id) => matches.find((m) => m.id === id)).filter(Boolean);
      return /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2", children: [
        /* @__PURE__ */ jsx("div", { className: "text-center mb-4", children: /* @__PURE__ */ jsx("span", { className: "text-xs font-bold text-[#00BFFF] uppercase tracking-wider px-3 py-1 bg-[#00BFFF]/10 border border-[#00BFFF]/20 rounded-full", children: round.name }) }),
        /* @__PURE__ */ jsx(
          "div",
          {
            className: "flex flex-col justify-around",
            style: { gap: `${Math.pow(2, ri) * 16}px`, minHeight: `${Math.pow(2, bracket.rounds.length - 1) * 120}px` },
            children: roundMatches.map((match) => /* @__PURE__ */ jsx(
              MatchCard,
              {
                match,
                teams,
                onClick: () => setSelected(match)
              },
              match.id
            ))
          }
        )
      ] }, ri);
    }) }) }),
    selected && /* @__PURE__ */ jsx(
      MatchDetailModal,
      {
        match: selected,
        teams: tournament.teams,
        onClose: () => setSelected(null)
      }
    )
  ] });
}
function EmptyState$1({ message }) {
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center py-32 text-center", children: [
    /* @__PURE__ */ jsx("div", { className: "text-6xl mb-4 opacity-20", children: "⚔️" }),
    /* @__PURE__ */ jsx("p", { className: "text-gray-500", children: message })
  ] });
}
function MatchCountdown({ target }) {
  const [diff, setDiff] = useState(target - Date.now());
  useEffect(() => {
    const id = setInterval(() => setDiff(target - Date.now()), 1e3);
    return () => clearInterval(id);
  }, [target]);
  if (diff <= 0) return /* @__PURE__ */ jsx("span", { className: "text-green-400 font-bold text-xs", children: "Starting soon" });
  const h = Math.floor(diff / 36e5);
  const m = Math.floor(diff % 36e5 / 6e4);
  const s = Math.floor(diff % 6e4 / 1e3);
  return /* @__PURE__ */ jsxs("span", { className: "text-[#00BFFF] font-mono text-xs", children: [
    h > 0 && `${h}h `,
    m,
    "m ",
    s,
    "s"
  ] });
}
function TournamentSchedule({ tournament }) {
  if (!tournament) {
    return /* @__PURE__ */ jsx(EmptyState, {});
  }
  const { matches, teams } = tournament;
  const scheduled = [...matches].filter((m) => m.status !== "bye").sort((a, b) => {
    const order = { live: 0, scheduled: 1, pending: 2, completed: 3, bye: 4 };
    const ao = order[a.status] ?? 5;
    const bo = order[b.status] ?? 5;
    if (ao !== bo) return ao - bo;
    return (a.scheduledAt ?? 0) - (b.scheduledAt ?? 0);
  });
  if (scheduled.length === 0) {
    return /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center py-32 text-center", children: [
      /* @__PURE__ */ jsx("div", { className: "text-6xl mb-4 opacity-20", children: "📅" }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-500", children: "No matches scheduled yet." })
    ] });
  }
  const getTeam = (id) => teams.find((t) => t.id === id);
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsxs("h2", { className: "font-['Space_Grotesk'] font-bold text-white text-xl", children: [
        tournament.name,
        " — Schedule"
      ] }),
      /* @__PURE__ */ jsxs("p", { className: "text-gray-500 text-sm mt-0.5", children: [
        scheduled.length,
        " match(es) total"
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "space-y-3", children: scheduled.map((match) => {
      const t1 = getTeam(match.team1Id);
      const t2 = getTeam(match.team2Id);
      const statusColors = {
        live: "border-l-red-400",
        scheduled: "border-l-[#00BFFF]",
        completed: "border-l-green-500",
        pending: "border-l-gray-700"
      };
      return /* @__PURE__ */ jsx(
        "div",
        {
          className: `bg-[#111827] border border-white/5 rounded-xl p-4 border-l-4 ${statusColors[match.status] || "border-l-gray-700"}`,
          children: /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-4", children: [
            /* @__PURE__ */ jsx("div", { className: "w-20", children: /* @__PURE__ */ jsx("span", { className: `text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded ${match.status === "live" ? "bg-red-500/15 text-red-400" : match.status === "completed" ? "bg-green-500/10 text-green-400" : match.status === "scheduled" ? "bg-[#00BFFF]/10 text-[#00BFFF]" : "bg-white/5 text-gray-600"}`, children: MATCH_STATUS_LABEL[match.status] }) }),
            /* @__PURE__ */ jsxs("div", { className: "flex-1 flex items-center gap-3 min-w-0", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 min-w-0", children: [
                t1 && /* @__PURE__ */ jsx("img", { src: `https://mc-heads.net/avatar/${t1.captain}/16`, className: "w-5 h-5 rounded-sm flex-shrink-0", alt: "", onError: (e) => {
                  e.target.style.display = "none";
                } }),
                /* @__PURE__ */ jsx("span", { className: `text-sm font-semibold truncate ${match.winnerId === match.team1Id ? "text-[#00BFFF]" : "text-white"}`, children: t1?.name ?? "TBD" }),
                match.status === "completed" && /* @__PURE__ */ jsx("span", { className: "font-['Space_Grotesk'] font-black text-white", children: match.score1 })
              ] }),
              /* @__PURE__ */ jsx("span", { className: "text-gray-600 text-xs flex-shrink-0", children: "vs" }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 min-w-0", children: [
                match.status === "completed" && /* @__PURE__ */ jsx("span", { className: "font-['Space_Grotesk'] font-black text-white", children: match.score2 }),
                /* @__PURE__ */ jsx("span", { className: `text-sm font-semibold truncate ${match.winnerId === match.team2Id ? "text-[#00BFFF]" : "text-white"}`, children: t2?.name ?? "TBD" }),
                t2 && /* @__PURE__ */ jsx("img", { src: `https://mc-heads.net/avatar/${t2.captain}/16`, className: "w-5 h-5 rounded-sm flex-shrink-0", alt: "", onError: (e) => {
                  e.target.style.display = "none";
                } })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 text-xs text-gray-500 flex-shrink-0", children: [
              match.arena && /* @__PURE__ */ jsx("span", { children: match.arena }),
              match.gamemode && /* @__PURE__ */ jsx("span", { children: match.gamemode }),
              match.scheduledAt && match.status === "scheduled" && /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-end gap-0.5", children: [
                /* @__PURE__ */ jsx("span", { children: new Date(match.scheduledAt).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) }),
                /* @__PURE__ */ jsx(MatchCountdown, { target: match.scheduledAt })
              ] }),
              match.completedAt && match.status === "completed" && /* @__PURE__ */ jsx("span", { children: new Date(match.completedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }),
              /* @__PURE__ */ jsxs("span", { className: "text-gray-700", children: [
                "M",
                match.matchNumber
              ] })
            ] })
          ] })
        },
        match.id
      );
    }) })
  ] });
}
function EmptyState() {
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center py-32 text-center", children: [
    /* @__PURE__ */ jsx("div", { className: "text-6xl mb-4 opacity-20", children: "📅" }),
    /* @__PURE__ */ jsx("p", { className: "text-gray-500", children: "No active tournament." })
  ] });
}
function TournamentRules({ tournament }) {
  if (!tournament) {
    return /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center py-32 text-center", children: [
      /* @__PURE__ */ jsx("div", { className: "text-6xl mb-4 opacity-20", children: "📜" }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-500", children: "No active tournament." })
    ] });
  }
  const { rules, name } = tournament;
  return /* @__PURE__ */ jsxs("div", { className: "max-w-3xl mx-auto space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsxs("h2", { className: "font-['Space_Grotesk'] font-bold text-white text-xl", children: [
        name,
        " — Rules"
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-500 text-sm mt-0.5", children: "All participants must follow these rules. Staff decisions are final." })
    ] }),
    /* @__PURE__ */ jsx(RuleSection, { icon: "✅", title: "Allowed Mods", items: rules.allowedMods, color: "green" }),
    /* @__PURE__ */ jsx(RuleSection, { icon: "🖥️", title: "Allowed Clients", items: rules.allowedClients, color: "blue" }),
    /* @__PURE__ */ jsx(RuleSection, { icon: "⛔", title: "Banned Modifications", items: rules.bannedMods, color: "red" }),
    /* @__PURE__ */ jsx(TextRule, { icon: "🎬", title: "Replay Requirements", text: rules.replayRequirements }),
    /* @__PURE__ */ jsx(TextRule, { icon: "🔌", title: "Disconnect Rules", text: rules.disconnectRules }),
    /* @__PURE__ */ jsx(TextRule, { icon: "⚖️", title: "Staff Decisions", text: rules.staffDecisions }),
    rules.custom.length > 0 && /* @__PURE__ */ jsxs("div", { className: "bg-[#111827] border border-white/5 rounded-xl p-6 space-y-3", children: [
      /* @__PURE__ */ jsxs("h3", { className: "font-['Space_Grotesk'] font-semibold text-white flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("span", { children: "📋" }),
        " Tournament-Specific Rules"
      ] }),
      /* @__PURE__ */ jsx("ul", { className: "space-y-2", children: rules.custom.map((rule, i) => /* @__PURE__ */ jsxs("li", { className: "flex gap-3 text-sm", children: [
        /* @__PURE__ */ jsxs("span", { className: "text-[#00BFFF] font-bold flex-shrink-0", children: [
          i + 1,
          "."
        ] }),
        /* @__PURE__ */ jsx("span", { className: "text-gray-300", children: rule })
      ] }, i)) })
    ] })
  ] });
}
function RuleSection({ icon, title, items, color }) {
  const colorMap = {
    green: "text-green-400 bg-green-400/5 border-green-400/15",
    blue: "text-[#00BFFF] bg-[#00BFFF]/5 border-[#00BFFF]/15",
    red: "text-red-400 bg-red-400/5 border-red-400/15"
  };
  const dotColor = { green: "bg-green-400", blue: "bg-[#00BFFF]", red: "bg-red-400" };
  return /* @__PURE__ */ jsxs("div", { className: `rounded-xl border p-6 space-y-3 ${colorMap[color]}`, children: [
    /* @__PURE__ */ jsxs("h3", { className: "font-['Space_Grotesk'] font-semibold flex items-center gap-2", children: [
      /* @__PURE__ */ jsx("span", { children: icon }),
      " ",
      title
    ] }),
    items.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-sm italic", children: "None specified." }) : /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: items.map((item, i) => /* @__PURE__ */ jsxs("span", { className: `flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/20 text-white text-xs font-medium`, children: [
      /* @__PURE__ */ jsx("span", { className: `w-1.5 h-1.5 rounded-full ${dotColor[color]}` }),
      item
    ] }, i)) })
  ] });
}
function TextRule({ icon, title, text }) {
  return /* @__PURE__ */ jsxs("div", { className: "bg-[#111827] border border-white/5 rounded-xl p-6 space-y-2", children: [
    /* @__PURE__ */ jsxs("h3", { className: "font-['Space_Grotesk'] font-semibold text-white flex items-center gap-2", children: [
      /* @__PURE__ */ jsx("span", { children: icon }),
      " ",
      title
    ] }),
    /* @__PURE__ */ jsx("p", { className: "text-gray-400 text-sm leading-relaxed", children: text || "Not specified." })
  ] });
}
const PLACEMENT_STYLES = [
  { bg: "from-yellow-500/20 to-yellow-600/5", border: "border-yellow-500/30", accent: "text-yellow-400", glow: "shadow-yellow-500/10" },
  { bg: "from-gray-400/15 to-gray-500/5", border: "border-gray-400/25", accent: "text-gray-300", glow: "shadow-gray-400/10" },
  { bg: "from-orange-700/20 to-orange-800/5", border: "border-orange-700/30", accent: "text-orange-400", glow: "shadow-orange-700/10" }
];
const REWARD_ICONS = {
  coins: "💰",
  gems: "💎",
  rank: "👑",
  crate_keys: "🗝️",
  custom: "🎁"
};
function TournamentPrizes({ tournament }) {
  if (!tournament) {
    return /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center py-32 text-center", children: [
      /* @__PURE__ */ jsx("div", { className: "text-6xl mb-4 opacity-20", children: "🎁" }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-500", children: "No active tournament." })
    ] });
  }
  const { prizes, name, prizePool } = tournament;
  const sorted = [...prizes].sort((a, b) => a.placement - b.placement);
  return /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
    /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsx("h2", { className: "font-['Space_Grotesk'] font-black text-3xl text-white", children: name }),
      prizePool && /* @__PURE__ */ jsxs("p", { className: "text-[#00BFFF] font-semibold text-lg mt-1", children: [
        "Total Prize Pool: ",
        prizePool
      ] })
    ] }),
    sorted.length >= 1 && /* @__PURE__ */ jsx("div", { className: "grid md:grid-cols-3 gap-4", children: [sorted[0], sorted[1], sorted[2]].map((prize, idx) => {
      if (!prize) return null;
      const style = PLACEMENT_STYLES[idx] ?? PLACEMENT_STYLES[2];
      return /* @__PURE__ */ jsxs(
        "div",
        {
          className: `bg-gradient-to-b ${style.bg} border ${style.border} rounded-2xl p-6 text-center space-y-4 shadow-xl ${style.glow} ${idx === 0 ? "md:order-2" : idx === 1 ? "md:order-1" : "md:order-3"}`,
          children: [
            /* @__PURE__ */ jsx("div", { className: "text-5xl", children: prize.label.split(" ")[0] }),
            /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx("p", { className: `font-['Space_Grotesk'] font-black text-xl ${style.accent}`, children: prize.label.split(" ").slice(1).join(" ") }) }),
            /* @__PURE__ */ jsx("div", { className: "space-y-2", children: prize.rewards.map((r, ri) => /* @__PURE__ */ jsxs("div", { className: "bg-black/20 rounded-lg px-4 py-2.5 flex items-center justify-between gap-2", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx("span", { children: REWARD_ICONS[r.type] ?? "🎁" }),
                /* @__PURE__ */ jsx("span", { className: "text-white text-sm font-medium", children: r.label })
              ] }),
              /* @__PURE__ */ jsx("span", { className: `font-['Space_Grotesk'] font-black text-sm ${style.accent}`, children: r.amount })
            ] }, ri)) })
          ]
        },
        prize.placement
      );
    }) }),
    sorted.length > 3 && /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-['Space_Grotesk'] font-semibold text-white text-lg", children: "Other Prizes" }),
      /* @__PURE__ */ jsx("div", { className: "space-y-3", children: sorted.slice(3).map((prize) => /* @__PURE__ */ jsxs("div", { className: "bg-[#111827] border border-white/5 rounded-xl p-4 flex items-center gap-4", children: [
        /* @__PURE__ */ jsx("div", { className: "text-2xl w-10 text-center", children: prize.label.split(" ")[0] }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsx("p", { className: "text-white font-semibold text-sm", children: prize.label.split(" ").slice(1).join(" ") }),
          /* @__PURE__ */ jsx("p", { className: "text-gray-500 text-xs mt-1", children: prize.rewards.map((r) => `${REWARD_ICONS[r.type]} ${r.amount} ${r.label}`).join(" · ") })
        ] })
      ] }, prize.placement)) })
    ] }),
    prizes.length === 0 && /* @__PURE__ */ jsx("div", { className: "text-center py-16 text-gray-500", children: "No prizes configured yet." })
  ] });
}
function TournamentStats({ tournament }) {
  if (!tournament) {
    return /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center py-32 text-center", children: [
      /* @__PURE__ */ jsx("div", { className: "text-6xl mb-4 opacity-20", children: "📊" }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-500", children: "No active tournament." })
    ] });
  }
  const { matches, teams } = tournament;
  const totalMatches = matches.filter((m) => m.status !== "bye").length;
  const completedMatches = matches.filter((m) => m.status === "completed").length;
  const liveMatches = matches.filter((m) => m.status === "live").length;
  const remainingMatches = matches.filter((m) => m.status === "scheduled" || m.status === "pending").length;
  const approvedTeams = teams.filter((t) => t.status === "approved").length;
  const totalPlayers = teams.filter((t) => t.status === "approved").reduce((n, t) => n + t.players.length, 0);
  const pct = totalMatches > 0 ? Math.round(completedMatches / totalMatches * 100) : 0;
  const stats = [
    { label: "Approved Teams", value: approvedTeams, icon: "👥", color: "text-[#00BFFF]" },
    { label: "Total Players", value: totalPlayers, icon: "⚔️", color: "text-purple-400" },
    { label: "Total Matches", value: totalMatches, icon: "🎮", color: "text-white" },
    { label: "Completed", value: completedMatches, icon: "✅", color: "text-green-400" },
    { label: "Remaining", value: remainingMatches, icon: "⏳", color: "text-yellow-400" },
    { label: "Live Now", value: liveMatches, icon: "🔴", color: "text-red-400" }
  ];
  const teamStats = teams.filter((t) => t.status === "approved" || t.status === "eliminated").map((team) => {
    const teamMatches = matches.filter(
      (m) => (m.team1Id === team.id || m.team2Id === team.id) && m.status === "completed"
    );
    const wins = teamMatches.filter((m) => m.winnerId === team.id).length;
    const losses = teamMatches.length - wins;
    const wr = teamMatches.length > 0 ? Math.round(wins / teamMatches.length * 100) : null;
    return { team, wins, losses, played: teamMatches.length, wr };
  }).sort((a, b) => b.wins - a.wins || (b.wr ?? 0) - (a.wr ?? 0));
  return /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
    /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsxs("h2", { className: "font-['Space_Grotesk'] font-bold text-white text-xl", children: [
      tournament.name,
      " — Statistics"
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 md:grid-cols-3 gap-4", children: stats.map((s) => /* @__PURE__ */ jsxs("div", { className: "bg-[#111827] border border-white/5 rounded-xl p-5 text-center", children: [
      /* @__PURE__ */ jsx("div", { className: "text-2xl mb-2", children: s.icon }),
      /* @__PURE__ */ jsx("div", { className: `font-['Space_Grotesk'] font-black text-3xl ${s.color}`, children: s.value }),
      /* @__PURE__ */ jsx("div", { className: "text-gray-500 text-xs mt-1", children: s.label })
    ] }, s.label)) }),
    /* @__PURE__ */ jsxs("div", { className: "bg-[#111827] border border-white/5 rounded-xl p-6 space-y-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
        /* @__PURE__ */ jsx("p", { className: "text-white font-semibold text-sm", children: "Tournament Progress" }),
        /* @__PURE__ */ jsxs("span", { className: "font-['Space_Grotesk'] font-black text-xl text-[#00BFFF]", children: [
          pct,
          "%"
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "h-3 bg-white/5 rounded-full overflow-hidden", children: /* @__PURE__ */ jsx(
        "div",
        {
          className: "h-full bg-gradient-to-r from-[#00BFFF] to-[#0066FF] rounded-full transition-all duration-700",
          style: { width: `${pct}%` }
        }
      ) }),
      /* @__PURE__ */ jsxs("p", { className: "text-gray-600 text-xs", children: [
        completedMatches,
        " of ",
        totalMatches,
        " matches completed"
      ] })
    ] }),
    teamStats.length > 0 && /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-['Space_Grotesk'] font-semibold text-white text-lg", children: "Team Standings" }),
      /* @__PURE__ */ jsx("div", { className: "bg-[#111827] border border-white/5 rounded-xl overflow-hidden", children: /* @__PURE__ */ jsxs("table", { className: "w-full", children: [
        /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-white/5 text-gray-600 text-[11px] uppercase tracking-wider", children: [
          /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-3", children: "#" }),
          /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-3", children: "Team" }),
          /* @__PURE__ */ jsx("th", { className: "text-center px-3 py-3", children: "Played" }),
          /* @__PURE__ */ jsx("th", { className: "text-center px-3 py-3", children: "W" }),
          /* @__PURE__ */ jsx("th", { className: "text-center px-3 py-3", children: "L" }),
          /* @__PURE__ */ jsx("th", { className: "text-center px-3 py-3", children: "Win %" })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { children: teamStats.map(({ team, wins, losses, played, wr }, i) => /* @__PURE__ */ jsxs("tr", { className: "border-b border-white/3 hover:bg-white/2 transition-colors", children: [
          /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-gray-500 text-sm font-bold", children: i + 1 }),
          /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("img", { src: `https://mc-heads.net/avatar/${team.captain}/16`, className: "w-5 h-5 rounded-sm", alt: "", onError: (e) => {
              e.target.style.display = "none";
            } }),
            /* @__PURE__ */ jsx("span", { className: "text-white text-sm font-semibold", children: team.name })
          ] }) }),
          /* @__PURE__ */ jsx("td", { className: "px-3 py-3 text-center text-gray-400 text-sm", children: played }),
          /* @__PURE__ */ jsx("td", { className: "px-3 py-3 text-center text-green-400 text-sm font-bold", children: wins }),
          /* @__PURE__ */ jsx("td", { className: "px-3 py-3 text-center text-red-400 text-sm font-bold", children: losses }),
          /* @__PURE__ */ jsx("td", { className: "px-3 py-3 text-center", children: /* @__PURE__ */ jsx("span", { className: `font-['Space_Grotesk'] font-bold text-sm ${wr !== null ? wr >= 50 ? "text-[#00BFFF]" : "text-gray-400" : "text-gray-600"}`, children: wr !== null ? `${wr}%` : "—" }) })
        ] }, team.id)) })
      ] }) })
    ] })
  ] });
}
function TournamentArchive({ archives }) {
  const [selected, setSelected] = useState(null);
  const [view, setView] = useState("list");
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;
  if (selected) {
    return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => {
              setSelected(null);
              setView("list");
            },
            className: "text-gray-500 hover:text-white transition-colors text-sm flex items-center gap-1",
            children: "← Back to Archive"
          }
        ),
        /* @__PURE__ */ jsx("div", { className: "h-4 w-px bg-white/10" }),
        /* @__PURE__ */ jsx("h2", { className: "font-['Space_Grotesk'] font-bold text-white", children: selected.name })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex gap-2", children: ["list", "bracket", "stats"].map((v) => /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setView(v),
          className: `px-4 py-2 rounded-lg text-xs font-semibold capitalize transition-all ${view === v ? "bg-[#00BFFF]/15 text-[#00BFFF] border border-[#00BFFF]/30" : "text-gray-500 hover:text-white border border-white/5"}`,
          children: v === "list" ? "Overview" : v
        },
        v
      )) }),
      view === "list" && /* @__PURE__ */ jsx(ArchiveDetail, { tournament: selected }),
      view === "bracket" && /* @__PURE__ */ jsx(TournamentBracket, { tournament: selected }),
      view === "stats" && /* @__PURE__ */ jsx(TournamentStats, { tournament: selected })
    ] });
  }
  if (archives.length === 0) {
    return /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center py-32 text-center", children: [
      /* @__PURE__ */ jsx("div", { className: "text-6xl mb-4 opacity-20", children: "🗃️" }),
      /* @__PURE__ */ jsx("h2", { className: "font-['Space_Grotesk'] font-bold text-white text-xl mb-2", children: "No Archived Tournaments" }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-500", children: "Completed tournaments will appear here." })
    ] });
  }
  const sorted = [...archives].sort((a, b) => b.createdAt - a.createdAt);
  const total = sorted.length;
  const pages = Math.ceil(total / PER_PAGE);
  const paged = sorted.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h2", { className: "font-['Space_Grotesk'] font-bold text-white text-xl", children: "Tournament Archive" }),
      /* @__PURE__ */ jsxs("p", { className: "text-gray-500 text-sm mt-0.5", children: [
        total,
        " tournament(s) on record"
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "space-y-4", children: paged.map((t) => {
      const winner = getWinner(t);
      const approvedCt = t.teams.filter((tm) => tm.status === "approved").length;
      return /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setSelected(t),
          className: "w-full bg-[#111827] border border-white/5 hover:border-white/15 rounded-xl p-5 text-left transition-all group",
          children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4", children: [
            /* @__PURE__ */ jsx("div", { className: "w-12 h-12 rounded-xl bg-[#00BFFF]/10 border border-[#00BFFF]/20 flex items-center justify-center text-2xl flex-shrink-0", children: "🏆" }),
            /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
                /* @__PURE__ */ jsx("h3", { className: "font-['Space_Grotesk'] font-bold text-white group-hover:text-[#00BFFF] transition-colors", children: t.name }),
                /* @__PURE__ */ jsx("span", { className: `text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-wider ${STATUS_COLOR[t.status]}`, children: STATUS_LABEL[t.status] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-4 mt-2 text-xs text-gray-500", children: [
                t.startDate && /* @__PURE__ */ jsxs("span", { children: [
                  "📅 ",
                  new Date(t.startDate).toLocaleDateString()
                ] }),
                /* @__PURE__ */ jsxs("span", { children: [
                  "👥 ",
                  approvedCt,
                  " teams"
                ] }),
                /* @__PURE__ */ jsxs("span", { children: [
                  "🎮 ",
                  t.matches.filter((m) => m.status === "completed").length,
                  " matches"
                ] }),
                t.gamemode && /* @__PURE__ */ jsxs("span", { children: [
                  "⚔️ ",
                  t.gamemode
                ] }),
                winner && /* @__PURE__ */ jsxs("span", { className: "text-yellow-400 font-semibold", children: [
                  "🥇 ",
                  winner
                ] })
              ] }),
              t.description && /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-xs mt-2 truncate", children: t.description })
            ] }),
            /* @__PURE__ */ jsx("span", { className: "text-gray-600 group-hover:text-[#00BFFF] transition-colors flex-shrink-0", children: "→" })
          ] })
        },
        t.id
      );
    }) }),
    pages > 1 && /* @__PURE__ */ jsxs("div", { className: "flex justify-center gap-2", children: [
      /* @__PURE__ */ jsx("button", { onClick: () => setPage((p) => Math.max(1, p - 1)), disabled: page === 1, className: "px-3 py-1.5 rounded-lg text-xs border border-white/10 text-gray-500 hover:text-white disabled:opacity-30", children: "← Prev" }),
      /* @__PURE__ */ jsxs("span", { className: "px-3 py-1.5 text-xs text-gray-500", children: [
        page,
        " / ",
        pages
      ] }),
      /* @__PURE__ */ jsx("button", { onClick: () => setPage((p) => Math.min(pages, p + 1)), disabled: page === pages, className: "px-3 py-1.5 rounded-lg text-xs border border-white/10 text-gray-500 hover:text-white disabled:opacity-30", children: "Next →" })
    ] })
  ] });
}
function getWinner(t) {
  if (!t.bracket) return null;
  const lastRound = t.bracket.rounds[t.bracket.rounds.length - 1];
  if (!lastRound) return null;
  const finalMatchId = lastRound.matchIds[0];
  const finalMatch = t.matches.find((m) => m.id === finalMatchId);
  if (!finalMatch?.winnerId) return null;
  return t.teams.find((tm) => tm.id === finalMatch.winnerId)?.name ?? null;
}
function ArchiveDetail({ tournament: t }) {
  const winner = getWinner(t);
  const runnerUp = getRunnerUp(t);
  const approvedTeams = t.teams.filter((tm) => tm.status === "approved");
  const totalPlayers = approvedTeams.reduce((n, tm) => n + tm.players.length, 0);
  const completed = t.matches.filter((m) => m.status === "completed").length;
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [
      { label: "Teams", value: approvedTeams.length, icon: "👥" },
      { label: "Players", value: totalPlayers, icon: "⚔️" },
      { label: "Matches", value: completed, icon: "🎮" },
      { label: "Gamemode", value: t.gamemode || "—", icon: "🎯" }
    ].map((c) => /* @__PURE__ */ jsxs("div", { className: "bg-[#111827] border border-white/5 rounded-xl p-4 text-center", children: [
      /* @__PURE__ */ jsx("div", { className: "text-2xl mb-1", children: c.icon }),
      /* @__PURE__ */ jsx("div", { className: "font-['Space_Grotesk'] font-bold text-white text-xl", children: c.value }),
      /* @__PURE__ */ jsx("div", { className: "text-gray-500 text-xs", children: c.label })
    ] }, c.label)) }),
    (winner || runnerUp) && /* @__PURE__ */ jsxs("div", { className: "bg-gradient-to-br from-yellow-950/30 to-[#111827] border border-yellow-500/20 rounded-xl p-6 space-y-4", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-['Space_Grotesk'] font-bold text-white text-lg", children: "Final Results" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
        winner && /* @__PURE__ */ jsx(ResultRow, { icon: "🥇", label: "Champion", name: winner }),
        runnerUp && /* @__PURE__ */ jsx(ResultRow, { icon: "🥈", label: "Runner-up", name: runnerUp })
      ] })
    ] }),
    t.prizes.length > 0 && /* @__PURE__ */ jsxs("div", { className: "bg-[#111827] border border-white/5 rounded-xl p-6 space-y-3", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-['Space_Grotesk'] font-semibold text-white", children: "Prize Distribution" }),
      t.prizes.map((p) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 text-sm", children: [
        /* @__PURE__ */ jsx("span", { children: p.label.split(" ")[0] }),
        /* @__PURE__ */ jsx("span", { className: "text-white font-medium", children: p.label.split(" ").slice(1).join(" ") }),
        /* @__PURE__ */ jsxs("span", { className: "text-gray-500", children: [
          "— ",
          p.rewards.map((r) => `${r.amount} ${r.label}`).join(" + ")
        ] })
      ] }, p.placement))
    ] })
  ] });
}
function getRunnerUp(t) {
  if (!t.bracket) return null;
  const lastRound = t.bracket.rounds[t.bracket.rounds.length - 1];
  const finalMatch = t.matches.find((m) => m.id === lastRound?.matchIds[0]);
  if (!finalMatch?.winnerId) return null;
  const loserId = finalMatch.team1Id === finalMatch.winnerId ? finalMatch.team2Id : finalMatch.team1Id;
  return t.teams.find((tm) => tm.id === loserId)?.name ?? null;
}
function ResultRow({ icon, label, name }) {
  return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
    /* @__PURE__ */ jsx("span", { className: "text-2xl", children: icon }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("p", { className: "text-gray-500 text-xs uppercase tracking-wider", children: label }),
      /* @__PURE__ */ jsx("p", { className: "text-white font-bold", children: name })
    ] })
  ] });
}
const TYPE_STYLES = {
  info: { border: "border-[#00BFFF]/20", bg: "bg-[#00BFFF]/5", icon: "ℹ️", accent: "text-[#00BFFF]" },
  warning: { border: "border-yellow-500/20", bg: "bg-yellow-500/5", icon: "⚠️", accent: "text-yellow-400" },
  success: { border: "border-green-500/20", bg: "bg-green-500/5", icon: "✅", accent: "text-green-400" }
};
function TournamentAnnouncements({ tournament }) {
  if (!tournament) {
    return /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center py-32 text-center", children: [
      /* @__PURE__ */ jsx("div", { className: "text-6xl mb-4 opacity-20", children: "📣" }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-500", children: "No active tournament." })
    ] });
  }
  const { announcements, name } = tournament;
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6 max-w-3xl mx-auto", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsxs("h2", { className: "font-['Space_Grotesk'] font-bold text-white text-xl", children: [
        name,
        " — Announcements"
      ] }),
      /* @__PURE__ */ jsxs("p", { className: "text-gray-500 text-sm mt-0.5", children: [
        announcements.length,
        " announcement(s)"
      ] })
    ] }),
    announcements.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center py-20 text-center", children: [
      /* @__PURE__ */ jsx("div", { className: "text-5xl mb-4 opacity-20", children: "📣" }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-500", children: "No announcements yet. Check back soon!" })
    ] }) : /* @__PURE__ */ jsx("div", { className: "space-y-4", children: announcements.map((ann, i) => {
      const style = TYPE_STYLES[ann.type] ?? TYPE_STYLES.info;
      return /* @__PURE__ */ jsx(
        "div",
        {
          className: `border ${style.border} ${style.bg} rounded-xl p-5 space-y-2 ${i === 0 ? "ring-1 ring-white/5" : ""}`,
          children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xl flex-shrink-0", children: style.icon }),
            /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
                /* @__PURE__ */ jsx("h3", { className: `font-['Space_Grotesk'] font-bold text-white text-base`, children: ann.title }),
                i === 0 && /* @__PURE__ */ jsx("span", { className: "text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-white/10 text-gray-400", children: "Latest" })
              ] }),
              ann.body && /* @__PURE__ */ jsx("p", { className: "text-gray-400 text-sm mt-2 leading-relaxed", children: ann.body }),
              /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-xs mt-2", children: new Date(ann.createdAt).toLocaleString() })
            ] })
          ] })
        },
        ann.id
      );
    }) })
  ] });
}
function LiveTournament({ tournament }) {
  const [selected, setSelected] = useState(null);
  if (!tournament || tournament.status !== "live") {
    return /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center py-32 text-center", children: [
      /* @__PURE__ */ jsx("div", { className: "text-6xl mb-4 opacity-20", children: "🔴" }),
      /* @__PURE__ */ jsx("h2", { className: "font-['Space_Grotesk'] font-bold text-white text-xl mb-2", children: "Not Live" }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-500", children: "There is no tournament running right now. Check back soon!" })
    ] });
  }
  const { matches, teams } = tournament;
  const liveMatches = matches.filter((m) => m.status === "live");
  const scheduledMatches = matches.filter((m) => m.status === "scheduled").slice(0, 5);
  const completedCount = matches.filter((m) => m.status === "completed").length;
  const remaining = matches.filter((m) => m.status !== "completed" && m.status !== "bye").length;
  return /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
    /* @__PURE__ */ jsxs("div", { className: "bg-gradient-to-r from-red-950/50 to-red-900/20 border border-red-500/20 rounded-2xl p-6 flex items-center gap-4", children: [
      /* @__PURE__ */ jsx("div", { className: "w-12 h-12 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-2xl", children: "🔴" }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx("span", { className: "w-2 h-2 rounded-full bg-red-400 animate-pulse" }),
          /* @__PURE__ */ jsx("span", { className: "text-red-400 text-xs font-bold uppercase tracking-widest", children: "Tournament Live" })
        ] }),
        /* @__PURE__ */ jsx("h2", { className: "font-['Space_Grotesk'] font-bold text-white text-xl mt-1", children: tournament.name })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "ml-auto grid grid-cols-2 gap-4 text-center", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "font-['Space_Grotesk'] font-black text-2xl text-white", children: completedCount }),
          /* @__PURE__ */ jsx("p", { className: "text-gray-500 text-xs", children: "Completed" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "font-['Space_Grotesk'] font-black text-2xl text-[#00BFFF]", children: remaining }),
          /* @__PURE__ */ jsx("p", { className: "text-gray-500 text-xs", children: "Remaining" })
        ] })
      ] })
    ] }),
    liveMatches.length > 0 && /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("h3", { className: "font-['Space_Grotesk'] font-bold text-white text-lg flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("span", { className: "w-2 h-2 rounded-full bg-red-400 animate-pulse" }),
        "Live Now"
      ] }),
      /* @__PURE__ */ jsx("div", { className: "grid md:grid-cols-2 gap-4", children: liveMatches.map((m) => /* @__PURE__ */ jsx(LiveMatchCard, { match: m, teams, onClick: () => setSelected(m) }, m.id)) })
    ] }),
    liveMatches.length === 0 && /* @__PURE__ */ jsx("div", { className: "bg-[#111827] border border-white/5 rounded-xl p-8 text-center", children: /* @__PURE__ */ jsx("p", { className: "text-gray-500", children: "No matches are currently live. Check the schedule for upcoming matches." }) }),
    scheduledMatches.length > 0 && /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-['Space_Grotesk'] font-bold text-white text-lg", children: "Up Next" }),
      /* @__PURE__ */ jsx("div", { className: "space-y-3", children: scheduledMatches.map((m) => /* @__PURE__ */ jsx(ScheduledMatchRow, { match: m, teams, onClick: () => setSelected(m) }, m.id)) })
    ] }),
    selected && /* @__PURE__ */ jsx(MatchDetailModal, { match: selected, teams: tournament.teams, onClose: () => setSelected(null) })
  ] });
}
function LiveMatchCard({ match, teams, onClick }) {
  const t1 = teams.find((t) => t.id === match.team1Id);
  const t2 = teams.find((t) => t.id === match.team2Id);
  return /* @__PURE__ */ jsxs(
    "button",
    {
      onClick,
      className: "w-full bg-gradient-to-br from-red-950/30 to-[#111827] border border-red-500/30 rounded-xl p-5 text-left hover:border-red-500/50 transition-all",
      children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
          /* @__PURE__ */ jsx("span", { className: "w-2 h-2 rounded-full bg-red-400 animate-pulse" }),
          /* @__PURE__ */ jsx("span", { className: "text-red-400 text-xs font-bold uppercase tracking-wider", children: "Live" }),
          match.arena && /* @__PURE__ */ jsxs("span", { className: "text-gray-600 text-xs", children: [
            "· ",
            match.arena
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("div", { className: "text-center flex-1", children: [
            /* @__PURE__ */ jsx("p", { className: "text-white font-bold text-sm truncate", children: t1?.name ?? "TBD" }),
            /* @__PURE__ */ jsx("p", { className: "font-['Space_Grotesk'] font-black text-4xl text-white mt-1", children: match.score1 })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "text-gray-600 font-bold text-sm px-4", children: "VS" }),
          /* @__PURE__ */ jsxs("div", { className: "text-center flex-1", children: [
            /* @__PURE__ */ jsx("p", { className: "text-white font-bold text-sm truncate", children: t2?.name ?? "TBD" }),
            /* @__PURE__ */ jsx("p", { className: "font-['Space_Grotesk'] font-black text-4xl text-white mt-1", children: match.score2 })
          ] })
        ] })
      ]
    }
  );
}
function ScheduledMatchRow({ match, teams, onClick }) {
  const t1 = teams.find((t) => t.id === match.team1Id);
  const t2 = teams.find((t) => t.id === match.team2Id);
  return /* @__PURE__ */ jsxs(
    "button",
    {
      onClick,
      className: "w-full bg-[#111827] border border-white/5 hover:border-white/10 rounded-xl p-4 flex items-center gap-4 transition-all text-left",
      children: [
        /* @__PURE__ */ jsxs("div", { className: "text-gray-600 text-sm w-8 text-center font-bold", children: [
          "M",
          match.matchNumber
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("span", { className: "text-white text-sm font-semibold", children: t1?.name ?? "TBD" }),
          /* @__PURE__ */ jsx("span", { className: "text-gray-600 text-xs", children: "vs" }),
          /* @__PURE__ */ jsx("span", { className: "text-white text-sm font-semibold", children: t2?.name ?? "TBD" })
        ] }),
        match.scheduledAt && /* @__PURE__ */ jsx("span", { className: "text-gray-500 text-xs", children: new Date(match.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }),
        match.arena && /* @__PURE__ */ jsx("span", { className: "text-gray-600 text-xs", children: match.arena }),
        /* @__PURE__ */ jsx("span", { className: "text-[#00BFFF] text-xs font-semibold", children: "Scheduled" })
      ]
    }
  );
}
function TeamRegistration({ tournament, onClose }) {
  const requireCaptain = tournament.requireCaptain !== false;
  const [teamName, setTeamName] = useState("");
  const [captain, setCaptain] = useState("");
  const [players, setPlayers] = useState([""]);
  const [submitting, setSubmit] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const maxExtraSlots = requireCaptain ? tournament.maxTeamSize - 1 : tournament.maxTeamSize;
  const totalPlayers = requireCaptain ? [captain, ...players].filter((p) => p.trim()).length : players.filter((p) => p.trim()).length;
  function addPlayer() {
    if (players.length < maxExtraSlots) setPlayers((p) => [...p, ""]);
  }
  function setPlayer(idx, val) {
    setPlayers((p) => p.map((v, i) => i === idx ? val : v));
  }
  function removePlayer(idx) {
    setPlayers((p) => p.filter((_, i) => i !== idx));
  }
  async function submit(e) {
    e.preventDefault();
    setError("");
    if (!teamName.trim()) return setError("Team name is required");
    if (requireCaptain && !captain.trim()) return setError("Captain name is required");
    const allPlayers = requireCaptain ? [captain.trim(), ...players.map((p) => p.trim()).filter(Boolean)] : players.map((p) => p.trim()).filter(Boolean);
    if (allPlayers.length < tournament.minTeamSize) {
      return setError(`Minimum team size is ${tournament.minTeamSize} player(s)`);
    }
    if (allPlayers.length > tournament.maxTeamSize) {
      return setError(`Maximum team size is ${tournament.maxTeamSize} player(s)`);
    }
    setSubmit(true);
    try {
      const res = await registerTeam({
        data: {
          tournamentId: tournament.id,
          teamName: teamName.trim(),
          captain: requireCaptain ? captain.trim() : "",
          players: requireCaptain ? players.map((p) => p.trim()).filter(Boolean) : players.map((p) => p.trim()).filter(Boolean)
        }
      });
      if (res.success) {
        setSuccess(true);
      } else {
        setError(res.error || "Registration failed");
      }
    } catch {
      setError("Server error. Please try again.");
    } finally {
      setSubmit(false);
    }
  }
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm", children: /* @__PURE__ */ jsxs("div", { className: "bg-[#111827] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/5", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h2", { className: "font-['Space_Grotesk'] font-bold text-white text-lg", children: "Register Your Team" }),
        /* @__PURE__ */ jsx("p", { className: "text-gray-500 text-xs mt-0.5", children: tournament.name })
      ] }),
      /* @__PURE__ */ jsx("button", { onClick: onClose, className: "text-gray-600 hover:text-white transition-colors text-xl", children: "✕" })
    ] }),
    success ? /* @__PURE__ */ jsxs("div", { className: "p-8 text-center space-y-4", children: [
      /* @__PURE__ */ jsx("div", { className: "text-5xl", children: "✅" }),
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-white text-lg", children: "Registration Submitted!" }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-400 text-sm", children: "Your team has been submitted for review. You'll be notified once approved." }),
      /* @__PURE__ */ jsx("button", { onClick: onClose, className: "mt-4 px-6 py-2.5 rounded-xl bg-[#00BFFF] text-black font-bold text-sm", children: "Close" })
    ] }) : /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "p-6 space-y-5", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-xs text-gray-400 font-semibold mb-1.5 uppercase tracking-wider", children: "Team Name" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            value: teamName,
            onChange: (e) => setTeamName(e.target.value),
            placeholder: "e.g. Blue Dynasty",
            maxLength: 50,
            className: "w-full bg-[#0B0F17] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#00BFFF]/50"
          }
        )
      ] }),
      requireCaptain && /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("label", { className: "block text-xs text-gray-400 font-semibold mb-1.5 uppercase tracking-wider", children: [
          "Captain Username ",
          /* @__PURE__ */ jsx("span", { className: "text-[#00BFFF]", children: "👑" })
        ] }),
        /* @__PURE__ */ jsx(
          "input",
          {
            value: captain,
            onChange: (e) => setCaptain(e.target.value),
            placeholder: "Minecraft username",
            maxLength: 50,
            className: "w-full bg-[#0B0F17] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#00BFFF]/50"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-xs text-gray-400 font-semibold mb-1.5 uppercase tracking-wider", children: requireCaptain ? `Teammates (${Math.max(0, tournament.minTeamSize - 1)}–${tournament.maxTeamSize - 1})` : `Players (${tournament.minTeamSize}–${tournament.maxTeamSize})` }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          players.map((p, i) => /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                value: p,
                onChange: (e) => setPlayer(i, e.target.value),
                placeholder: requireCaptain ? `Player ${i + 2} username` : `Player ${i + 1} username`,
                maxLength: 50,
                className: "flex-1 bg-[#0B0F17] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#00BFFF]/50"
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: () => removePlayer(i),
                className: "px-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-xs",
                children: "✕"
              }
            )
          ] }, i)),
          players.length < maxExtraSlots && /* @__PURE__ */ jsxs(
            "button",
            {
              type: "button",
              onClick: addPlayer,
              className: "w-full py-2 rounded-lg border border-dashed border-white/10 text-gray-600 hover:text-gray-400 hover:border-white/20 text-xs transition-all",
              children: [
                "+ Add ",
                requireCaptain ? "Teammate" : "Player"
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-[#0B0F17] rounded-lg p-3 text-xs text-gray-500 flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("span", { children: "👥" }),
        /* @__PURE__ */ jsxs("span", { children: [
          "Total: ",
          /* @__PURE__ */ jsx("strong", { className: "text-white", children: totalPlayers }),
          " player(s) · Min ",
          tournament.minTeamSize,
          ", Max ",
          tournament.maxTeamSize
        ] })
      ] }),
      error && /* @__PURE__ */ jsx("div", { className: "bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg px-4 py-3", children: error }),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "submit",
          disabled: submitting,
          className: "w-full py-3 rounded-xl bg-[#00BFFF] hover:bg-[#00BFFF]/80 disabled:opacity-50 text-black font-bold text-sm transition-all",
          children: submitting ? "Submitting…" : "Submit Registration"
        }
      )
    ] })
  ] }) });
}
const TABS = [{
  id: "home",
  label: "Home",
  icon: "🏆"
}, {
  id: "bracket",
  label: "Bracket",
  icon: "⚔️"
}, {
  id: "schedule",
  label: "Schedule",
  icon: "📅"
}, {
  id: "live",
  label: "Live",
  icon: "🔴"
}, {
  id: "prizes",
  label: "Prizes",
  icon: "🎁"
}, {
  id: "rules",
  label: "Rules",
  icon: "📜"
}, {
  id: "stats",
  label: "Statistics",
  icon: "📊"
}, {
  id: "announcements",
  label: "Announcements",
  icon: "📣"
}, {
  id: "archive",
  label: "Archive",
  icon: "🗃️"
}];
function TournamentPage() {
  const [tab, setTab] = useState("home");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReg, setShowReg] = useState(false);
  const esRef = useRef(null);
  async function load() {
    try {
      const d = await getTournamentData();
      setData(d);
    } catch {
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
    const es = new EventSource("/api/tournament-events");
    esRef.current = es;
    es.addEventListener("tournament_updated", () => load());
    return () => es.close();
  }, []);
  const active = data?.activeTournamentId ? data.tournaments.find((t) => t.id === data.activeTournamentId) ?? null : null;
  const archives = data?.tournaments.filter((t) => t.status === "archived" || t.status === "completed") ?? [];
  const canRegister = active?.status === "registration_open" || active?.status === "live";
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-[#0B0F17] flex items-center justify-center", children: /* @__PURE__ */ jsx("span", { className: "w-8 h-8 border-2 border-white/10 border-t-[#00BFFF] rounded-full animate-spin" }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-[#0B0F17] text-white", children: [
    /* @__PURE__ */ jsx(Navbar, {}),
    /* @__PURE__ */ jsxs("section", { className: "relative pt-64 pb-10 px-4 overflow-hidden", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-b from-[#00BFFF]/5 to-transparent pointer-events-none" }),
      /* @__PURE__ */ jsx("div", { className: "absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-64 bg-[#00BFFF]/10 blur-[110px] pointer-events-none" }),
      /* @__PURE__ */ jsxs("div", { className: "max-w-6xl mx-auto text-center relative", children: [
        /* @__PURE__ */ jsxs("div", { className: "inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#00BFFF]/20 bg-[#00BFFF]/5 text-[#00BFFF] text-xs font-semibold mb-6 tracking-wide uppercase", children: [
          active?.status === "live" ? /* @__PURE__ */ jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" }) : /* @__PURE__ */ jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-[#00BFFF] animate-pulse" }),
          active ? `${STATUS_LABEL[active.status]} · ${active.name}` : "Tournament Hub"
        ] }),
        /* @__PURE__ */ jsxs("h1", { className: "font-['Space_Grotesk'] font-black text-4xl sm:text-5xl text-white mb-4", children: [
          "Blue Network ",
          /* @__PURE__ */ jsx("span", { className: "text-gradient", children: "Tournaments" })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-gray-500 max-w-md mx-auto text-sm", children: "Register your team, track live brackets, and compete for glory on the Blue Network." }),
        active && /* @__PURE__ */ jsxs("div", { className: "mt-6 inline-flex items-center gap-3 flex-wrap justify-center", children: [
          /* @__PURE__ */ jsxs("span", { className: `inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider ${STATUS_COLOR[active.status]}`, children: [
            active.status === "live" && /* @__PURE__ */ jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" }),
            STATUS_LABEL[active.status]
          ] }),
          active.prizePool && /* @__PURE__ */ jsxs("span", { className: "text-gray-500 text-xs", children: [
            "🏆 Prize Pool: ",
            /* @__PURE__ */ jsx("span", { className: "text-white font-semibold", children: active.prizePool })
          ] }),
          active.gamemode && /* @__PURE__ */ jsxs("span", { className: "text-gray-500 text-xs", children: [
            "🎮 ",
            /* @__PURE__ */ jsx("span", { className: "text-white font-semibold", children: active.gamemode })
          ] })
        ] }),
        active && (() => {
          if (canRegister) return /* @__PURE__ */ jsxs("div", { className: "mt-8", children: [
            /* @__PURE__ */ jsxs("button", { onClick: () => setShowReg(true), className: "inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#00BFFF] hover:bg-[#00BFFF]/85 text-black font-bold text-sm transition-all shadow-lg shadow-[#00BFFF]/25 hover:scale-105 hover:shadow-[#00BFFF]/40", children: [
              "⚔️ Register Your Team",
              /* @__PURE__ */ jsx("span", { className: "opacity-70", children: "→" })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-xs mt-2", children: active.status === "registration_open" ? "Registrations are open — spots are limited" : "Tournament is live — register to compete" })
          ] });
          if (active.status === "upcoming") return /* @__PURE__ */ jsxs("div", { className: "mt-8", children: [
            /* @__PURE__ */ jsx("div", { className: "inline-flex items-center gap-2 px-8 py-3.5 rounded-xl border border-white/10 text-gray-400 font-bold text-sm cursor-default", children: "🔔 Registration Opening Soon" }),
            /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-xs mt-2", children: "Stay tuned — watch the Announcements tab for updates" })
          ] });
          if (active.status === "registration_closed") return /* @__PURE__ */ jsxs("div", { className: "mt-8", children: [
            /* @__PURE__ */ jsx("div", { className: "inline-flex items-center gap-2 px-8 py-3.5 rounded-xl border border-white/10 text-gray-500 font-bold text-sm cursor-default", children: "🚫 Registration Closed" }),
            /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-xs mt-2", children: "The bracket is set — follow the matches in the Bracket tab" })
          ] });
          return null;
        })()
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "sticky top-16 z-30 bg-[#0B0F17]/95 backdrop-blur-md border-b border-white/5", children: /* @__PURE__ */ jsx("div", { className: "max-w-7xl mx-auto px-4", children: /* @__PURE__ */ jsx("div", { className: "flex gap-1 overflow-x-auto scrollbar-hide py-2", children: TABS.map((t) => /* @__PURE__ */ jsxs("button", { onClick: () => setTab(t.id), className: `flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${tab === t.id ? "bg-[#00BFFF]/15 text-[#00BFFF] border border-[#00BFFF]/30" : "text-gray-500 hover:text-gray-300 hover:bg-white/5 border border-transparent"}`, children: [
      /* @__PURE__ */ jsx("span", { children: t.icon }),
      t.label,
      t.id === "live" && active?.status === "live" && /* @__PURE__ */ jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" })
    ] }, t.id)) }) }) }),
    /* @__PURE__ */ jsxs("main", { className: "max-w-7xl mx-auto px-4 py-8", children: [
      tab === "home" && /* @__PURE__ */ jsx(TournamentHome, { active, onRegisterClick: canRegister ? () => setShowReg(true) : void 0 }),
      tab === "bracket" && /* @__PURE__ */ jsx(TournamentBracket, { tournament: active }),
      tab === "schedule" && /* @__PURE__ */ jsx(TournamentSchedule, { tournament: active }),
      tab === "live" && /* @__PURE__ */ jsx(LiveTournament, { tournament: active }),
      tab === "prizes" && /* @__PURE__ */ jsx(TournamentPrizes, { tournament: active }),
      tab === "rules" && /* @__PURE__ */ jsx(TournamentRules, { tournament: active }),
      tab === "stats" && /* @__PURE__ */ jsx(TournamentStats, { tournament: active }),
      tab === "announcements" && /* @__PURE__ */ jsx(TournamentAnnouncements, { tournament: active }),
      tab === "archive" && /* @__PURE__ */ jsx(TournamentArchive, { archives })
    ] }),
    /* @__PURE__ */ jsx("footer", { className: "border-t border-white/5 py-8 text-center text-gray-600 text-sm", children: "Blue Tiers · Tournament Hub · All results are final" }),
    showReg && active && /* @__PURE__ */ jsx(TeamRegistration, { tournament: active, onClose: () => setShowReg(false) })
  ] });
}
export {
  TournamentPage as component
};
