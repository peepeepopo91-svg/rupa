import { m as markDirty } from "./syncStore-C_ozCmAO.js";
const EVENT = {
  title: "Blue Network PvP World Cup",
  subtitle: "Registrations are now open!",
  registrationEnds: "2026-07-22T23:59:59Z",
  buttonText: "Participate Now!",
  buttonLink: "https://discord.gg/DmEPAb3NFU",
  closedButtonText: "Registrations Closed"
};
const SITE_CONTENT_KEY = "bn_admin_content";
const EVENT_CONTENT_KEY = "bn_admin_event";
function safeGet(key) {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
function safeSet(key, value) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
  }
}
const CONTENT_DEFAULTS = {
  heroTitle: "BLUE TIERS",
  heroSubtitle: "#1 Tier List for all types of players.",
  serverIP: "play.sennahosting.com",
  discordLink: "https://discord.gg/DmEPAb3NFU",
  footerCopyright: "© 2024 Blue Tiers. All rights reserved.",
  footerTagline: "Not affiliated with Mojang or Microsoft."
};
function getSiteContent() {
  const overrides = safeGet(SITE_CONTENT_KEY) ?? {};
  return { ...CONTENT_DEFAULTS, ...overrides };
}
function saveSiteContent(content, opts) {
  safeSet(SITE_CONTENT_KEY, content);
  if (!opts?.silent) markDirty("content");
}
function resetSiteContent() {
  safeSet(SITE_CONTENT_KEY, {});
  markDirty("content");
}
function getEventConfig() {
  const overrides = safeGet(EVENT_CONTENT_KEY) ?? {};
  return { ...EVENT, ...overrides };
}
function saveEventConfig(config, opts) {
  safeSet(EVENT_CONTENT_KEY, config);
  if (!opts?.silent) markDirty("event");
}
function resetEventConfig() {
  safeSet(EVENT_CONTENT_KEY, {});
  markDirty("event");
}
export {
  CONTENT_DEFAULTS as C,
  EVENT as E,
  getEventConfig as a,
  saveEventConfig as b,
  resetEventConfig as c,
  getSiteContent as g,
  resetSiteContent as r,
  saveSiteContent as s
};
