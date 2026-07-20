import { jsx, jsxs } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { C as CONTENT_DEFAULTS, g as getSiteContent } from "./contentStore-DOO6P7qG.js";
function Footer() {
  const [content, setContent] = useState(CONTENT_DEFAULTS);
  useEffect(() => {
    setContent(getSiteContent());
  }, []);
  return /* @__PURE__ */ jsx("footer", { className: "border-t border-white/5 bg-[#0B0F17] pt-16 pb-8 px-4", children: /* @__PURE__ */ jsxs("div", { className: "max-w-6xl mx-auto", children: [
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-12 mb-12", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
          /* @__PURE__ */ jsx("span", { className: "text-2xl", children: "⚔" }),
          /* @__PURE__ */ jsxs("span", { className: "font-['Space_Grotesk'] font-bold text-xl", children: [
            /* @__PURE__ */ jsx("span", { className: "text-[#00BFFF]", children: "Blue" }),
            /* @__PURE__ */ jsx("span", { className: "text-white", children: " Tiers" })
          ] })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-sm leading-relaxed max-w-xs", children: "#1 Tier List for all types of players." })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h4", { className: "text-white font-semibold text-sm mb-4 tracking-wide uppercase", children: "Quick Links" }),
        /* @__PURE__ */ jsxs("ul", { className: "space-y-2", children: [
          [
            { to: "/", label: "Home" },
            { to: "/rankings", label: "Rankings" }
          ].map((link) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(
            Link,
            {
              to: link.to,
              className: "text-gray-500 hover:text-[#00BFFF] text-sm transition-colors duration-200",
              children: link.label
            }
          ) }, link.to)),
          /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(
            "a",
            {
              href: content.discordLink,
              target: "_blank",
              rel: "noopener noreferrer",
              className: "text-gray-500 hover:text-[#00BFFF] text-sm transition-colors duration-200",
              children: "Discord"
            }
          ) }),
          /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(
            Link,
            {
              to: "/admin",
              className: "text-gray-700 hover:text-gray-500 text-xs transition-colors duration-200",
              children: "Admin Panel"
            }
          ) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h4", { className: "text-white font-semibold text-sm mb-4 tracking-wide uppercase", children: "Connect" }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("div", { className: "text-gray-600 text-xs mb-1", children: "Server IP" }),
            /* @__PURE__ */ jsx("span", { className: "font-mono text-[#00BFFF] text-sm", children: content.serverIP })
          ] }),
          /* @__PURE__ */ jsxs(
            "a",
            {
              href: content.discordLink,
              target: "_blank",
              rel: "noopener noreferrer",
              className: "discord-btn inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all duration-300 hover:scale-105",
              children: [
                /* @__PURE__ */ jsx("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "currentColor", children: /* @__PURE__ */ jsx("path", { d: "M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057.1 18.08.114 18.1.12 18.12a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" }) }),
                "Join Discord"
              ]
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2", children: [
      /* @__PURE__ */ jsx("p", { className: "text-gray-700 text-xs", children: content.footerCopyright }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-700 text-xs", children: content.footerTagline })
    ] })
  ] }) });
}
export {
  Footer as F
};
