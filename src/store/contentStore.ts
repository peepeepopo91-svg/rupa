// ─── Content Store — Site-wide CMS ───────────────────────────────────────────
// Stores site content overrides in localStorage. Components read from here first.
// Default values come from the static data files.

import { EVENT } from '../data/event'
import type { EventConfig } from '../data/event'
import { markDirty } from './syncStore'

const SITE_CONTENT_KEY  = 'bn_admin_content'
const EVENT_CONTENT_KEY = 'bn_admin_event'

export interface SiteContent {
  heroTitle?: string
  heroSubtitle?: string
  serverIP?: string
  discordLink?: string
  footerCopyright?: string
  footerTagline?: string
}

function safeGet<T>(key: string): T | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch { return null }
}

function safeSet(key: string, value: unknown) {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* quota */ }
}

// ─── Site Content ─────────────────────────────────────────────────────────────

export const CONTENT_DEFAULTS: Required<SiteContent> = {
  heroTitle:        'BLUE TIERS',
  heroSubtitle:     '#1 Tier List for all types of players.',
  serverIP:         'play.sennahosting.com',
  discordLink:      'https://discord.gg/DmEPAb3NFU',
  footerCopyright:  '© 2024 Blue Tiers. All rights reserved.',
  footerTagline:    'Not affiliated with Mojang or Microsoft.',
}

export function getSiteContent(): Required<SiteContent> {
  const overrides = safeGet<SiteContent>(SITE_CONTENT_KEY) ?? {}
  return { ...CONTENT_DEFAULTS, ...overrides }
}

export function saveSiteContent(content: SiteContent, opts?: { silent?: boolean }) {
  safeSet(SITE_CONTENT_KEY, content)
  if (!opts?.silent) markDirty('content')
}

export function resetSiteContent() {
  safeSet(SITE_CONTENT_KEY, {})
  markDirty('content')
}

// ─── Event Config ─────────────────────────────────────────────────────────────

export function getEventConfig(): EventConfig {
  const overrides = safeGet<Partial<EventConfig>>(EVENT_CONTENT_KEY) ?? {}
  return { ...EVENT, ...overrides }
}

export function saveEventConfig(config: EventConfig, opts?: { silent?: boolean }) {
  safeSet(EVENT_CONTENT_KEY, config)
  if (!opts?.silent) markDirty('event')
}

export function resetEventConfig() {
  safeSet(EVENT_CONTENT_KEY, {})
  markDirty('event')
}
