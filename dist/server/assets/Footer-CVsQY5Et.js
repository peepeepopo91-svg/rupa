import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useState, useEffect, useRef } from "react";
import { useLocation, Link } from "@tanstack/react-router";
import { E as EVENT, C as CONTENT_DEFAULTS, g as getSiteContent } from "./contentStore-BHVkzjvQ.js";
function Badge() {
  return /* @__PURE__ */ jsxs("span", { className: "relative inline-flex items-center justify-center px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-[#0066FF] to-[#00BFFF] text-white shadow-[0_0_15px_rgba(0,191,255,0.3)] border border-[#00BFFF]/30 animate-[pulse_3s_infinite] select-none tracking-wide", children: [
    /* @__PURE__ */ jsx("span", { className: "absolute inset-0 rounded-full bg-[#00BFFF]/20 blur-sm -z-10" }),
    "Registrations Closing Soon"
  ] });
}
function CountdownTimer({ onExpire }) {
  const targetDate = new Date(EVENT.registrationEnds).getTime();
  const [isExpired, setIsExpired] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: "00",
    hours: "00",
    minutes: "00",
    seconds: "00"
  });
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = (/* @__PURE__ */ new Date()).getTime();
      const difference = targetDate - now;
      if (difference <= 0) {
        setIsExpired(true);
        onExpire?.(true);
        return {
          days: "00",
          hours: "00",
          minutes: "00",
          seconds: "00"
        };
      }
      setIsExpired(false);
      onExpire?.(false);
      const d = Math.floor(difference / (1e3 * 60 * 60 * 24));
      const h = Math.floor(difference % (1e3 * 60 * 60 * 24) / (1e3 * 60 * 60));
      const m = Math.floor(difference % (1e3 * 60 * 60) / (1e3 * 60));
      const s = Math.floor(difference % (1e3 * 60) / 1e3);
      return {
        days: d.toString().padStart(2, "0"),
        hours: h.toString().padStart(2, "0"),
        minutes: m.toString().padStart(2, "0"),
        seconds: s.toString().padStart(2, "0")
      };
    };
    setTimeLeft(calculateTimeLeft());
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1e3);
    return () => clearInterval(interval);
  }, [targetDate, onExpire]);
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-1.5 md:gap-2", children: [
    /* @__PURE__ */ jsx("span", { className: `text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] font-['Space_Grotesk'] ${isExpired ? "text-gray-500" : "text-[#00BFFF] uppercase tracking-[0.2em] animate-[pulse_2s_infinite]"}`, children: isExpired ? "Registrations Closed" : "Registrations End In" }),
    /* @__PURE__ */ jsxs("div", { className: "flex gap-3 sm:gap-4 md:gap-6 justify-center", children: [
      /* @__PURE__ */ jsx(TimeUnit, { value: timeLeft.days, label: "D", isExpired }),
      /* @__PURE__ */ jsx(TimeUnit, { value: timeLeft.hours, label: "H", isExpired }),
      /* @__PURE__ */ jsx(TimeUnit, { value: timeLeft.minutes, label: "M", isExpired }),
      /* @__PURE__ */ jsx(TimeUnit, { value: timeLeft.seconds, label: "S", isSeconds: true, isExpired })
    ] })
  ] });
}
function TimeUnit({ value, label, isSeconds = false, isExpired = false }) {
  const [displayValue, setDisplayValue] = useState(value);
  const [animate, setAnimate] = useState(false);
  useEffect(() => {
    if (value !== displayValue) {
      setAnimate(true);
      const timer = setTimeout(() => {
        setDisplayValue(value);
        setAnimate(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [value, displayValue]);
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center", children: [
    /* @__PURE__ */ jsx("div", { className: "relative min-w-[36px] sm:min-w-[44px] md:min-w-[54px] text-center overflow-hidden", children: /* @__PURE__ */ jsx(
      "span",
      {
        className: `block font-['Outfit'] text-xl sm:text-2xl md:text-3xl font-black select-none transition-all duration-300 ${isExpired ? "text-gray-500 filter drop-shadow-[0_0_2px_rgba(100,100,100,0.2)]" : isSeconds ? "text-[#00BFFF] filter drop-shadow-[0_0_8px_rgba(0,191,255,0.6)]" : "text-white filter drop-shadow-[0_0_6px_rgba(255,255,255,0.3)]"} ${animate ? "opacity-0 -translate-y-3" : "opacity-100 translate-y-0"}`,
        children: displayValue
      }
    ) }),
    /* @__PURE__ */ jsx("span", { className: `text-[9px] sm:text-[10px] md:text-xs font-bold tracking-wider font-['Space_Grotesk'] ${isExpired ? "text-gray-600" : "text-gray-400"}`, children: label })
  ] });
}
function CTAButton({ isDisabled = false }) {
  if (isDisabled) {
    return /* @__PURE__ */ jsx(
      "div",
      {
        className: "relative inline-flex items-center gap-2.5 px-6 py-3 rounded-full text-sm font-extrabold text-gray-400 bg-gray-800/80 border border-gray-700/50 shadow-[0_4px_15px_rgba(0,0,0,0.25)] select-none cursor-not-allowed overflow-hidden",
        children: /* @__PURE__ */ jsx("span", { className: "relative z-10 font-['Space_Grotesk'] tracking-wider uppercase", children: EVENT.closedButtonText })
      }
    );
  }
  return /* @__PURE__ */ jsxs(
    "a",
    {
      href: EVENT.buttonLink,
      target: "_blank",
      rel: "noopener noreferrer",
      className: "group relative inline-flex items-center gap-2.5 px-6 py-3 rounded-full text-sm font-extrabold text-white bg-gradient-to-r from-[#0066FF] via-[#0099FF] to-[#00BFFF] shadow-[0_4px_20px_rgba(0,102,255,0.3)] hover:shadow-[0_4px_25px_rgba(0,191,255,0.6)] transition-all duration-300 hover:-translate-y-0.5 overflow-hidden active:scale-95",
      children: [
        /* @__PURE__ */ jsx("span", { className: "absolute inset-0 w-1/2 h-full bg-white/20 transform -skew-x-12 -translate-x-full group-hover:animate-[shine_0.8s_ease-out_forwards]" }),
        /* @__PURE__ */ jsx("span", { className: "absolute inset-0 bg-[#00BFFF] opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-md -z-10" }),
        /* @__PURE__ */ jsx("span", { className: "relative z-10 font-['Space_Grotesk'] tracking-wider uppercase", children: EVENT.buttonText }),
        /* @__PURE__ */ jsx(
          "svg",
          {
            className: "w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300 relative z-10",
            fill: "none",
            stroke: "currentColor",
            strokeWidth: "2.5",
            viewBox: "0 0 24 24",
            children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" })
          }
        )
      ]
    }
  );
}
function EventBanner() {
  const canvasRef = useRef(null);
  const [isExpired, setIsExpired] = useState(false);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let animationFrameId;
    let width = canvas.width = canvas.offsetWidth;
    let height = canvas.height = canvas.offsetHeight;
    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener("resize", handleResize);
    class Particle {
      x;
      y;
      size;
      speedX;
      speedY;
      color;
      opacity;
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 1.5 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.speedY = (Math.random() - 0.5) * 0.3;
        this.opacity = Math.random() * 0.5 + 0.2;
        this.color = `rgba(0, 191, 255, ${this.opacity})`;
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x < 0 || this.x > width) this.speedX *= -1;
        if (this.y < 0 || this.y > height) this.speedY *= -1;
      }
      draw(context) {
        context.beginPath();
        context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        context.fillStyle = this.color;
        context.fill();
      }
    }
    const particles = [];
    const particleCount = 20;
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }
    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      particles.forEach((particle) => {
        particle.update();
        particle.draw(ctx);
      });
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();
    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);
  const renderTitle = () => {
    const defaultPrefix = "Blue Network";
    if (EVENT.title.startsWith(defaultPrefix)) {
      const remaining = EVENT.title.substring(defaultPrefix.length);
      return /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("span", { className: "text-[#00BFFF] drop-shadow-[0_0_8px_rgba(0,191,255,0.4)]", children: defaultPrefix }),
        remaining
      ] });
    }
    return EVENT.title;
  };
  return /* @__PURE__ */ jsxs("div", { className: "relative w-full overflow-hidden bg-gradient-to-r from-[#070b12] via-[#09152a] to-[#070b12] border-b border-[#00BFFF]/15 px-4 py-4 md:py-3.5 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8 shadow-[0_4px_30px_rgba(0,191,255,0.05)] select-none animate-[fadeIn_0.8s_ease-out] z-50", children: [
    /* @__PURE__ */ jsx("canvas", { ref: canvasRef, className: "absolute inset-0 w-full h-full pointer-events-none opacity-60" }),
    /* @__PURE__ */ jsx("div", { className: "absolute top-1/2 left-1/4 -translate-y-1/2 w-48 h-48 bg-[#0066FF]/5 blur-[60px] pointer-events-none rounded-full" }),
    /* @__PURE__ */ jsx("div", { className: "absolute top-1/2 right-1/4 -translate-y-1/2 w-48 h-48 bg-[#00BFFF]/5 blur-[60px] pointer-events-none rounded-full" }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center md:items-start text-center md:text-left gap-2 md:gap-1 relative z-10 md:pl-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row items-center gap-2 sm:gap-3", children: [
        /* @__PURE__ */ jsx("h2", { className: "font-['Space_Grotesk'] font-black text-sm sm:text-base md:text-lg text-white tracking-widest uppercase select-none", children: renderTitle() }),
        /* @__PURE__ */ jsx("div", { className: "hidden sm:block", children: /* @__PURE__ */ jsx(Badge, {}) })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-xs sm:text-sm font-medium text-gray-400 font-['Inter']", children: isExpired ? "Registrations are now closed." : EVENT.subtitle }),
      /* @__PURE__ */ jsx("div", { className: "sm:hidden mt-1", children: /* @__PURE__ */ jsx(Badge, {}) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "relative z-10 w-full md:w-auto", children: /* @__PURE__ */ jsx(CountdownTimer, { onExpire: setIsExpired }) }),
    /* @__PURE__ */ jsx("div", { className: "relative z-10 md:pr-4 flex justify-center items-center", children: /* @__PURE__ */ jsx(CTAButton, { isDisabled: isExpired }) })
  ] });
}
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/rankings", label: "Rankings" },
    { to: "/mining", label: "Mining", badge: "⛏️" },
    { to: "/exchange", label: "Exchange", badge: "◈" }
  ];
  const isActive = (to) => location.pathname === to;
  return /* @__PURE__ */ jsxs("header", { className: "fixed top-0 left-0 right-0 z-50 flex flex-col w-full", children: [
    /* @__PURE__ */ jsx(EventBanner, {}),
    /* @__PURE__ */ jsx(
      "nav",
      {
        className: `w-full transition-all duration-300 ${scrolled ? "bg-[#0B0F17]/95 backdrop-blur-md border-b border-[#00BFFF]/10 shadow-lg shadow-black/50" : "bg-[#0B0F17]/40 backdrop-blur-sm"}`,
        children: /* @__PURE__ */ jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between h-16", children: [
            /* @__PURE__ */ jsxs(Link, { to: "/", className: "flex items-center gap-2 group flex-shrink-0", children: [
              /* @__PURE__ */ jsx("span", { className: "text-2xl select-none", children: "⚔" }),
              /* @__PURE__ */ jsxs("span", { className: "font-['Space_Grotesk'] font-bold text-xl tracking-tight", children: [
                /* @__PURE__ */ jsx("span", { className: "text-[#00BFFF]", children: "Blue" }),
                /* @__PURE__ */ jsx("span", { className: "text-white", children: " Tiers" })
              ] })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "hidden md:flex items-center gap-1", children: navLinks.map((link) => /* @__PURE__ */ jsxs(
              Link,
              {
                to: link.to,
                className: `flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive(link.to) ? "text-[#00BFFF] bg-[#00BFFF]/10" : "text-gray-400 hover:text-white hover:bg-white/5"}`,
                children: [
                  link.badge && /* @__PURE__ */ jsx("span", { className: "text-[11px]", children: link.badge }),
                  link.label
                ]
              },
              link.to
            )) }),
            /* @__PURE__ */ jsx("div", { className: "hidden md:flex items-center", children: /* @__PURE__ */ jsxs(
              "a",
              {
                href: "https://discord.gg/DmEPAb3NFU",
                target: "_blank",
                rel: "noopener noreferrer",
                className: "discord-btn flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all duration-300",
                children: [
                  /* @__PURE__ */ jsx("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "currentColor", children: /* @__PURE__ */ jsx("path", { d: "M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057.1 18.08.114 18.1.12 18.12a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" }) }),
                  "Join Discord"
                ]
              }
            ) }),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => setMobileOpen(!mobileOpen),
                className: "md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors",
                children: /* @__PURE__ */ jsxs("div", { className: "w-5 h-4 flex flex-col justify-between", children: [
                  /* @__PURE__ */ jsx("span", { className: `block h-0.5 bg-current transition-all duration-300 ${mobileOpen ? "rotate-45 translate-y-1.5" : ""}` }),
                  /* @__PURE__ */ jsx("span", { className: `block h-0.5 bg-current transition-all duration-300 ${mobileOpen ? "opacity-0" : ""}` }),
                  /* @__PURE__ */ jsx("span", { className: `block h-0.5 bg-current transition-all duration-300 ${mobileOpen ? "-rotate-45 -translate-y-2" : ""}` })
                ] })
              }
            )
          ] }),
          mobileOpen && /* @__PURE__ */ jsxs("div", { className: "md:hidden pb-4 border-t border-white/10 mt-2 pt-4 space-y-1", children: [
            navLinks.map((link) => /* @__PURE__ */ jsxs(
              Link,
              {
                to: link.to,
                onClick: () => setMobileOpen(false),
                className: `flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive(link.to) ? "text-[#00BFFF] bg-[#00BFFF]/10" : "text-gray-400 hover:text-white hover:bg-white/5"}`,
                children: [
                  link.badge && /* @__PURE__ */ jsx("span", { className: "text-[11px]", children: link.badge }),
                  link.label
                ]
              },
              link.to
            )),
            /* @__PURE__ */ jsxs(
              "a",
              {
                href: "https://discord.gg/DmEPAb3NFU",
                target: "_blank",
                rel: "noopener noreferrer",
                className: "discord-btn flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-all duration-300 mt-2",
                children: [
                  /* @__PURE__ */ jsx("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "currentColor", children: /* @__PURE__ */ jsx("path", { d: "M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057.1 18.08.114 18.1.12 18.12a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" }) }),
                  "Join Discord"
                ]
              }
            )
          ] })
        ] })
      }
    )
  ] });
}
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
  Footer as F,
  Navbar as N
};
