import { m as markDirty } from "./syncStore-C_ozCmAO.js";
const EVENT = {
  title: "Blue Network PvP World Cup",
  subtitle: "Registrations are now open!",
  description: "",
  eventType: "pvp",
  registrationEnds: "2026-07-22T23:59:59Z",
  eventStartDate: "",
  eventEndDate: "",
  buttonText: "Participate Now!",
  buttonLink: "https://discord.gg/DmEPAb3NFU",
  closedButtonText: "Registrations Closed",
  prizePool: "",
  maxParticipants: 0,
  currentParticipants: 0,
  streamLink: "",
  rulesText: "",
  organizerName: "",
  visible: true,
  bannerStyle: "default",
  pinned: false
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
  // Homepage
  heroTitle: "BLUE TIERS",
  heroSubtitle: "#1 Tier List for all types of players.",
  serverIP: "play.sennahosting.com",
  discordLink: "https://discord.gg/DmEPAb3NFU",
  // Announcement
  announcementEnabled: false,
  announcementText: "",
  announcementType: "info",
  announcementLink: "",
  announcementLinkLabel: "Learn more",
  // Social
  twitterLink: "",
  youtubeLink: "",
  twitchLink: "",
  githubLink: "",
  // SEO
  seoTitle: "Blue Tiers — #1 Minecraft PvP Tier List",
  seoDescription: "The definitive tier list for all types of Minecraft PvP players. Rankings, mining, shop, and more.",
  seoKeywords: "minecraft, pvp, tier list, blue tiers, rankings",
  ogImageUrl: "",
  // Publish / Google
  canonicalUrl: "",
  ga4Id: "",
  gscVerificationTag: "",
  // Footer
  footerCopyright: "© 2026 Blue Tiers. All rights reserved.",
  footerTagline: "Not affiliated with Mojang or Microsoft.",
  footerShowServerIP: true,
  footerShowDiscord: true,
  footerShowSocials: true,
  footerExtra: ""
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
  getEventConfig as a,
  saveEventConfig as b,
  resetEventConfig as c,
  getSiteContent as g,
  resetSiteContent as r,
  saveSiteContent as s
};
