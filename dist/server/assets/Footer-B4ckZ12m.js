import { jsxs, jsx } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { C as CONTENT_DEFAULTS, g as getSiteContent } from "./contentStore-Bptpfu9i.js";
import { ExternalLink } from "lucide-react";
const DiscordIcon = ({ size = 20 }) => /* @__PURE__ */ jsx("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "currentColor", children: /* @__PURE__ */ jsx("path", { d: "M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057.1 18.08.114 18.1.12 18.12a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" }) });
const XIcon = () => /* @__PURE__ */ jsx("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "currentColor", children: /* @__PURE__ */ jsx("path", { d: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622 5.912-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" }) });
const TikTokIcon = () => /* @__PURE__ */ jsx("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "currentColor", children: /* @__PURE__ */ jsx("path", { d: "M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34l-.04-8.57a8.17 8.17 0 0 0 4.77 1.52V4.82a4.85 4.85 0 0 1-1-.13z" }) });
const YouTubeIcon = () => /* @__PURE__ */ jsx("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "currentColor", children: /* @__PURE__ */ jsx("path", { d: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" }) });
function Footer() {
  const [content, setContent] = useState(CONTENT_DEFAULTS);
  useEffect(() => {
    setContent(getSiteContent());
  }, []);
  return /* @__PURE__ */ jsxs("footer", { className: "relative bg-black border-t border-[#111111] overflow-hidden", children: [
    /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex items-center justify-center pointer-events-none select-none", "aria-hidden": true, children: /* @__PURE__ */ jsxs(
      "svg",
      {
        width: "600",
        height: "480",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "white",
        strokeWidth: "0.3",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        className: "opacity-[0.025]",
        children: [
          /* @__PURE__ */ jsx("polyline", { points: "14.5 17.5 3 6 3 3 6 3 17.5 14.5" }),
          /* @__PURE__ */ jsx("line", { x1: "13", y1: "19", x2: "19", y2: "13" }),
          /* @__PURE__ */ jsx("line", { x1: "16", y1: "16", x2: "20", y2: "20" }),
          /* @__PURE__ */ jsx("line", { x1: "19", y1: "21", x2: "21", y2: "19" }),
          /* @__PURE__ */ jsx("polyline", { points: "14.5 6.5 18 3 21 3 21 6 17.5 9.5" }),
          /* @__PURE__ */ jsx("line", { x1: "5", y1: "14", x2: "9", y2: "18" }),
          /* @__PURE__ */ jsx("line", { x1: "7", y1: "21", x2: "3", y2: "21" }),
          /* @__PURE__ */ jsx("line", { x1: "3", y1: "18", x2: "5", y2: "21" })
        ]
      }
    ) }),
    /* @__PURE__ */ jsxs("div", { className: "relative max-w-6xl mx-auto px-6 pt-16 pb-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-12 mb-12", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-[#444444] text-xs font-medium mb-4 tracking-widest uppercase", children: "navigate" }),
          /* @__PURE__ */ jsx("ul", { className: "space-y-3", children: [
            { to: "/", label: "Home", internal: true },
            { to: "/rankings", label: "Rankings", internal: true },
            { to: "/tournament", label: "Tournament", internal: true },
            { to: "/mining", label: "Mining", internal: true },
            { to: "/shop", label: "Shop", internal: true }
          ].map((link) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(
            Link,
            {
              to: link.to,
              className: "text-[#666666] hover:text-white text-sm transition-colors duration-150",
              children: link.label
            }
          ) }, link.to)) })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-[#444444] text-xs font-medium mb-4 tracking-widest uppercase", children: "social" }),
          /* @__PURE__ */ jsxs(
            "a",
            {
              href: content.discordLink,
              target: "_blank",
              rel: "noopener noreferrer",
              className: "inline-flex items-center gap-3 text-white hover:text-white/80 transition-colors mb-5 group",
              children: [
                /* @__PURE__ */ jsx(DiscordIcon, { size: 24 }),
                /* @__PURE__ */ jsx("span", { className: "text-2xl font-bold tracking-tight", children: "DISCORD" })
              ]
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
            /* @__PURE__ */ jsx("a", { href: "#", className: "text-[#555555] hover:text-white transition-colors", children: /* @__PURE__ */ jsx(XIcon, {}) }),
            /* @__PURE__ */ jsx("a", { href: "#", className: "text-[#555555] hover:text-white transition-colors", children: /* @__PURE__ */ jsx(TikTokIcon, {}) }),
            /* @__PURE__ */ jsx("a", { href: "#", className: "text-[#555555] hover:text-white transition-colors", children: /* @__PURE__ */ jsx(YouTubeIcon, {}) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-[#444444] text-xs font-medium mb-4 tracking-widest uppercase", children: "legal" }),
          /* @__PURE__ */ jsxs("ul", { className: "space-y-3", children: [
            [
              "Terms of Service",
              "Privacy Policy",
              "Refund Policy",
              "Screenshare Rules"
            ].map((item) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("a", { href: "#", className: "text-[#666666] hover:text-white text-sm transition-colors duration-150", children: item }) }, item)),
            /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(
              Link,
              {
                to: "/admin",
                className: "text-[#333333] hover:text-[#555555] text-xs transition-colors duration-150",
                children: "Admin Panel"
              }
            ) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "border-t border-[#111111] pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxs("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "white", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round", className: "opacity-60", children: [
            /* @__PURE__ */ jsx("polyline", { points: "14.5 17.5 3 6 3 3 6 3 17.5 14.5" }),
            /* @__PURE__ */ jsx("line", { x1: "13", y1: "19", x2: "19", y2: "13" }),
            /* @__PURE__ */ jsx("line", { x1: "16", y1: "16", x2: "20", y2: "20" }),
            /* @__PURE__ */ jsx("line", { x1: "19", y1: "21", x2: "21", y2: "19" }),
            /* @__PURE__ */ jsx("polyline", { points: "14.5 6.5 18 3 21 3 21 6 17.5 9.5" }),
            /* @__PURE__ */ jsx("line", { x1: "5", y1: "14", x2: "9", y2: "18" }),
            /* @__PURE__ */ jsx("line", { x1: "7", y1: "21", x2: "3", y2: "21" }),
            /* @__PURE__ */ jsx("line", { x1: "3", y1: "18", x2: "5", y2: "21" })
          ] }),
          /* @__PURE__ */ jsx("span", { className: "text-white font-semibold text-sm", children: "BlueTiers" }),
          /* @__PURE__ */ jsx("span", { className: "text-[#333333] text-xs", children: content.footerCopyright })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
          /* @__PURE__ */ jsxs("a", { href: "#", className: "text-[#333333] hover:text-[#666666] text-xs flex items-center gap-1 transition-colors", children: [
            content.footerTagline,
            /* @__PURE__ */ jsx(ExternalLink, { size: 10 })
          ] }),
          /* @__PURE__ */ jsxs("a", { href: "#", className: "text-[#333333] hover:text-[#666666] text-xs flex items-center gap-1 transition-colors", children: [
            "API Documentation",
            /* @__PURE__ */ jsx(ExternalLink, { size: 10 })
          ] })
        ] })
      ] })
    ] })
  ] });
}
export {
  Footer as F
};
