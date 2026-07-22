import { createServerFn } from '@tanstack/react-start'
import { readFileSync, writeFileSync, mkdirSync, renameSync } from 'node:fs'
import { resolve } from 'node:path'
import { z } from 'zod'

const DATA_DIR = resolve(process.cwd(), 'data')
const ADS_FILE = 'ads-config.json'

export interface AdsConfig {
  enabled: boolean
  adProvider: 'placeholder' | 'adsense' | 'custom'
  adsensePublisherId: string
  adsenseSlotId: string
  adDurationSeconds: number
  renewMode: 'free' | 'ad-required' | 'ad-optional' | 'disabled'
  showAdOnExpired: boolean
  showAdOnEarlyRenew: boolean
  skipAllowed: boolean
  skipAfterSeconds: number
  customAdHtml: string
  rewardOnComplete: boolean
  rewardType: 'bluecoin' | 'gems'
  rewardAmount: number
  bannerAdEnabled: boolean
  bannerAdHtml: string
  estimatedRpm: number
  pageAds: Record<string, boolean>
  stats: {
    totalImpressions: number
    totalCompletions: number
    totalSkips: number
    estimatedRevenue: number
    lastReset: string | null
  }
}

const DEFAULT_CONFIG: AdsConfig = {
  enabled: true,
  adProvider: 'placeholder',
  adsensePublisherId: '',
  adsenseSlotId: '',
  adDurationSeconds: 5,
  renewMode: 'ad-required',
  showAdOnExpired: true,
  showAdOnEarlyRenew: false,
  skipAllowed: false,
  skipAfterSeconds: 3,
  customAdHtml: '',
  rewardOnComplete: false,
  rewardType: 'bluecoin',
  rewardAmount: 100,
  bannerAdEnabled: false,
  bannerAdHtml: '',
  estimatedRpm: 2.50,
  pageAds: { home: false, rankings: false, mining: false, exchange: false, shop: false, tournament: false },
  stats: { totalImpressions: 0, totalCompletions: 0, totalSkips: 0, estimatedRevenue: 0, lastReset: null },
}

function loadAdsConfig(): AdsConfig {
  try {
    const raw = readFileSync(resolve(DATA_DIR, ADS_FILE), 'utf8')
    return { ...DEFAULT_CONFIG, ...JSON.parse(raw) }
  } catch {
    return { ...DEFAULT_CONFIG }
  }
}

function writeAdsConfig(cfg: AdsConfig) {
  mkdirSync(DATA_DIR, { recursive: true })
  const tmp = resolve(DATA_DIR, ADS_FILE + '.tmp')
  writeFileSync(tmp, JSON.stringify(cfg, null, 2), 'utf8')
  renameSync(tmp, resolve(DATA_DIR, ADS_FILE))
}

// ─── Public: load config ──────────────────────────────────────────────────────

export const getAdsConfig = createServerFn({ method: 'GET' }).handler(async () => {
  return loadAdsConfig()
})

// ─── Admin: save full config ──────────────────────────────────────────────────

export const saveAdsConfig = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ config: z.any() }))
  .handler(async ({ data }) => {
    const current = loadAdsConfig()
    const merged: AdsConfig = { ...current, ...data.config, stats: current.stats }
    writeAdsConfig(merged)
    return { ok: true }
  })

// ─── Public: track ad events ─────────────────────────────────────────────────

export const trackAdEvent = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ event: z.enum(['impression', 'completion', 'skip']) }))
  .handler(async ({ data }) => {
    const cfg = loadAdsConfig()
    if (data.event === 'impression')  cfg.stats.totalImpressions  += 1
    if (data.event === 'completion')  {
      cfg.stats.totalCompletions += 1
      // Estimate revenue: RPM / 1000 per completion
      cfg.stats.estimatedRevenue = parseFloat(
        (cfg.stats.estimatedRevenue + cfg.estimatedRpm / 1000).toFixed(4)
      )
    }
    if (data.event === 'skip')        cfg.stats.totalSkips        += 1
    writeAdsConfig(cfg)
    return { ok: true }
  })

// ─── Admin: reset stats ───────────────────────────────────────────────────────

export const resetAdsStats = createServerFn({ method: 'POST' }).handler(async () => {
  const cfg = loadAdsConfig()
  cfg.stats = { totalImpressions: 0, totalCompletions: 0, totalSkips: 0, estimatedRevenue: 0, lastReset: new Date().toISOString() }
  writeAdsConfig(cfg)
  return { ok: true }
})
