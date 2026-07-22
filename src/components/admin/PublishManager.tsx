// ─── Publish Manager ──────────────────────────────────────────────────────────
// SEO, sitemap, robots.txt, analytics, social preview, schema, checklist.

import { useState, useEffect } from 'react'
import { getSiteContent, saveSiteContent } from '../../store/contentStore'
import { addLog } from '../../store/adminStore'
import {
  savePublishConfig,
  generateSitemap,
  saveRobotsTxt,
  loadRobotsTxt,
  loadSitemapXml,
} from '../../server/publishServer'

interface Props { admin: string }

// ─── Tabs ─────────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'overview',  icon: '🏆', label: 'Overview'        },
  { id: 'meta',      icon: '🏷️', label: 'Meta Tags'       },
  { id: 'social',    icon: '👁️', label: 'Social Preview'  },
  { id: 'google',    icon: '🔍', label: 'Google Tools'    },
  { id: 'sitemap',   icon: '🗺️', label: 'Sitemap'         },
  { id: 'robots',    icon: '🤖', label: 'Robots.txt'      },
  { id: 'schema',    icon: '📐', label: 'Schema / JSON-LD'},
  { id: 'checklist', icon: '✅', label: 'SEO Checklist'   },
]

// ─── SEO Score ────────────────────────────────────────────────────────────────

interface ScoreItem { label: string; pts: number; pass: boolean; tip?: string }

function calcScore(cfg: {
  seoTitle: string; seoDescription: string; seoKeywords: string
  ogImageUrl: string; canonicalUrl: string; ga4Id: string
  gscVerificationTag: string; sitemapDone: boolean
}): { score: number; items: ScoreItem[] } {
  const items: ScoreItem[] = []
  let score = 0

  // Title (20 pts)
  if (cfg.seoTitle) {
    const len = cfg.seoTitle.length
    const opt = len >= 50 && len <= 60
    score += opt ? 20 : 10
    items.push({ label: opt ? 'Title length is optimal (50–60 chars)' : 'Title set but not optimal length', pts: opt ? 20 : 10, pass: true, tip: 'Aim for 50–60 characters.' })
  } else {
    items.push({ label: 'Missing page title', pts: 20, pass: false, tip: 'Set a descriptive title in Meta Tags.' })
  }

  // Description (20 pts)
  if (cfg.seoDescription) {
    const len = cfg.seoDescription.length
    const opt = len >= 150 && len <= 160
    score += opt ? 20 : 10
    items.push({ label: opt ? 'Description length is optimal (150–160 chars)' : 'Description set but not optimal length', pts: opt ? 20 : 10, pass: true, tip: 'Aim for 150–160 characters.' })
  } else {
    items.push({ label: 'Missing meta description', pts: 20, pass: false, tip: 'Add a compelling description in Meta Tags.' })
  }

  // Keywords (10 pts)
  if (cfg.seoKeywords) { score += 10; items.push({ label: 'Keywords set', pts: 10, pass: true }) }
  else { items.push({ label: 'No keywords defined', pts: 10, pass: false, tip: 'Add comma-separated keywords.' }) }

  // OG Image (15 pts)
  if (cfg.ogImageUrl) { score += 15; items.push({ label: 'OG image set (social sharing)', pts: 15, pass: true }) }
  else { items.push({ label: 'Missing OG image', pts: 15, pass: false, tip: 'Add an image URL for social sharing previews.' }) }

  // Canonical URL (10 pts)
  if (cfg.canonicalUrl) { score += 10; items.push({ label: 'Canonical URL set', pts: 10, pass: true }) }
  else { items.push({ label: 'No canonical URL', pts: 10, pass: false, tip: 'Set your live domain URL.' }) }

  // GA4 (10 pts)
  if (cfg.ga4Id) { score += 10; items.push({ label: 'Google Analytics 4 connected', pts: 10, pass: true }) }
  else { items.push({ label: 'No analytics tracking', pts: 10, pass: false, tip: 'Connect Google Analytics in Google Tools.' }) }

  // GSC (5 pts)
  if (cfg.gscVerificationTag) { score += 5; items.push({ label: 'Search Console verified', pts: 5, pass: true }) }
  else { items.push({ label: 'Search Console not verified', pts: 5, pass: false, tip: 'Add GSC verification tag.' }) }

  // Sitemap (10 pts)
  if (cfg.sitemapDone) { score += 10; items.push({ label: 'Sitemap generated & accessible', pts: 10, pass: true }) }
  else { items.push({ label: 'Sitemap not yet generated', pts: 10, pass: false, tip: 'Generate your sitemap in the Sitemap tab.' }) }

  return { score, items }
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ msg, type, onClose }: { msg: string; type: 'success' | 'error' | 'info'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t) }, [onClose])
  const c = { success: 'bg-green-500/15 border-green-500/30 text-green-400', error: 'bg-red-500/15 border-red-500/30 text-red-400', info: 'bg-[#00BFFF]/10 border-[#00BFFF]/25 text-[#00BFFF]' }[type]
  const icons = { success: '✓', error: '⚠', info: 'ℹ' }
  return (
    <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl text-sm font-semibold shadow-2xl border flex items-center gap-2 ${c}`}>
      <span>{icons[type]}</span> {msg}
    </div>
  )
}

// ─── Field ────────────────────────────────────────────────────────────────────

function Field({ label, desc, value, onChange, placeholder, multiline, maxLength, mono = false, badge }: {
  label: string; desc?: string; value: string; onChange: (v: string) => void
  placeholder?: string; multiline?: boolean; maxLength?: number; mono?: boolean; badge?: string
}) {
  const cls = `w-full bg-white/3 border border-white/10 hover:border-white/20 focus:border-[#00BFFF]/40 rounded-xl px-4 py-3 text-white text-sm outline-none transition-all placeholder-gray-700 ${mono ? 'font-mono text-xs' : ''}`
  const warn = maxLength ? value.length > maxLength * 0.9 : false
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1">
        <label className="text-white text-sm font-semibold flex items-center gap-2">
          {label}
          {badge && <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#00BFFF]/15 text-[#00BFFF] uppercase tracking-wider">{badge}</span>}
        </label>
        {maxLength && <span className={`text-[10px] ${warn ? 'text-orange-400' : 'text-gray-600'}`}>{value.length}/{maxLength}</span>}
      </div>
      {desc && <p className="text-gray-600 text-xs mb-2">{desc}</p>}
      {multiline
        ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} maxLength={maxLength} rows={3} className={cls + ' resize-none'} />
        : <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} maxLength={maxLength} className={cls} />
      }
    </div>
  )
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({ icon, label, value, sub, color = '#00BFFF' }: { icon: string; label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div className="bg-white/2 border border-white/8 rounded-2xl p-4 flex items-center gap-4">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ background: `${color}18`, border: `1px solid ${color}30` }}>{icon}</div>
      <div className="min-w-0">
        <p className="text-gray-500 text-[10px] uppercase tracking-wider mb-0.5">{label}</p>
        <p className="text-white font-bold text-lg leading-tight">{value}</p>
        {sub && <p className="text-gray-600 text-[10px] mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

// ─── Gauge ────────────────────────────────────────────────────────────────────

function ScoreGauge({ score }: { score: number }) {
  const r = 70; const circ = 2 * Math.PI * r
  const pct = score / 100
  const offset = circ * (1 - pct * 0.75) // 270° arc
  const color = score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : score >= 40 ? '#f97316' : '#ef4444'
  const label = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Needs Work' : 'Poor'

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-44 h-44">
        <svg className="w-full h-full -rotate-[135deg]" viewBox="0 0 180 180">
          {/* Track */}
          <circle cx="90" cy="90" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="14" strokeDasharray={`${circ * 0.75} ${circ * 0.25}`} strokeLinecap="round" />
          {/* Value */}
          <circle cx="90" cy="90" r={r} fill="none" stroke={color} strokeWidth="14"
            strokeDasharray={`${circ * 0.75 * pct} ${circ * (1 - 0.75 * pct)}`}
            strokeLinecap="round" style={{ filter: `drop-shadow(0 0 8px ${color}80)`, transition: 'stroke-dasharray 0.8s cubic-bezier(.4,0,.2,1)' }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-black" style={{ color }}>{score}</span>
          <span className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">/ 100</span>
        </div>
      </div>
      <div className="text-center">
        <span className="text-sm font-bold" style={{ color }}>{label}</span>
        <p className="text-gray-600 text-[10px] mt-0.5">SEO Health Score</p>
      </div>
    </div>
  )
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────

function OverviewTab({ cfg, sitemapDone, setTab }: {
  cfg: ReturnType<typeof buildCfg>; sitemapDone: boolean; setTab: (t: string) => void
}) {
  const { score, items } = calcScore({ ...cfg, sitemapDone })
  const passing = items.filter(i => i.pass).length
  const failing = items.filter(i => !i.pass)

  return (
    <div className="space-y-6">
      {/* Score + stats */}
      <div className="bg-gradient-to-br from-white/3 to-white/1 border border-white/8 rounded-2xl p-6">
        <div className="flex flex-col lg:flex-row items-center gap-8">
          <ScoreGauge score={score} />
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
            <StatCard icon="✅" label="Passing" value={passing} sub={`of ${items.length} checks`} color="#22c55e" />
            <StatCard icon="⚠️" label="Issues" value={failing.length} sub="need attention" color="#f97316" />
            <StatCard icon="🔍" label="Analytics" value={cfg.ga4Id ? 'Active' : 'Off'} sub="Google Analytics 4" color={cfg.ga4Id ? '#22c55e' : '#ef4444'} />
            <StatCard icon="🗺️" label="Sitemap" value={sitemapDone ? 'Generated' : 'Missing'} sub="/sitemap.xml" color={sitemapDone ? '#22c55e' : '#f97316'} />
          </div>
        </div>
      </div>

      {/* Issues to fix */}
      {failing.length > 0 && (
        <div className="bg-white/2 border border-white/8 rounded-2xl p-5">
          <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-[10px]">!</span>
            Top Issues to Fix
          </h3>
          <div className="space-y-2">
            {failing.map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-red-500/5 border border-red-500/10">
                <span className="text-red-400 mt-0.5 shrink-0">✗</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-semibold">{item.label}</p>
                  {item.tip && <p className="text-gray-500 text-[10px] mt-0.5">{item.tip}</p>}
                </div>
                <span className="text-gray-600 text-[10px] shrink-0">−{item.pts} pts</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Score breakdown */}
      <div className="bg-white/2 border border-white/8 rounded-2xl p-5">
        <h3 className="text-white font-bold text-sm mb-4">Score Breakdown</h3>
        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className={item.pass ? 'text-green-400' : 'text-red-400'} style={{ fontSize: 12 }}>{item.pass ? '✓' : '✗'}</span>
              <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: item.pass ? '100%' : '0%', background: item.pass ? '#22c55e' : '#ef4444' }} />
              </div>
              <span className="text-gray-500 text-[10px] w-24 text-right truncate">{item.label}</span>
              <span className="text-gray-600 text-[10px] w-12 text-right">{item.pass ? `+${item.pts}` : `+0`} pts</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { icon: '🏷️', title: 'Edit Meta Tags', desc: 'Title, description, keywords', tab: 'meta' },
          { icon: '🗺️', title: 'Generate Sitemap', desc: 'Create sitemap.xml for Google', tab: 'sitemap' },
          { icon: '🔍', title: 'Connect Analytics', desc: 'Set up GA4 tracking', tab: 'google' },
        ].map(a => (
          <button key={a.tab} onClick={() => setTab(a.tab)}
            className="text-left p-4 rounded-2xl bg-[#00BFFF]/5 border border-[#00BFFF]/15 hover:bg-[#00BFFF]/10 hover:border-[#00BFFF]/30 transition-all group">
            <span className="text-2xl">{a.icon}</span>
            <p className="text-white font-bold text-sm mt-2">{a.title}</p>
            <p className="text-gray-500 text-[10px] mt-0.5">{a.desc}</p>
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Meta Tags Tab ────────────────────────────────────────────────────────────

function MetaTagsTab({ cfg, setCfg, onSave, saving }: {
  cfg: ReturnType<typeof buildCfg>; setCfg: (c: ReturnType<typeof buildCfg>) => void
  onSave: () => void; saving: boolean
}) {
  const up = (k: keyof ReturnType<typeof buildCfg>) => (v: string) => setCfg({ ...cfg, [k]: v })
  const titleLen = cfg.seoTitle.length
  const descLen  = cfg.seoDescription.length

  return (
    <div className="space-y-6">
      <div className="bg-white/2 border border-white/8 rounded-2xl p-5 space-y-5">
        <h3 className="text-white font-bold text-sm">Page Identity</h3>
        <Field label="Page Title" badge="critical"
          desc="Shown as the browser tab title and the blue headline in Google results."
          value={cfg.seoTitle} onChange={up('seoTitle')} maxLength={70}
          placeholder="Blue Tiers — #1 Minecraft PvP Tier List" />
        <div className="text-[10px] flex gap-4">
          <span className={titleLen >= 50 && titleLen <= 60 ? 'text-green-400' : titleLen > 0 ? 'text-orange-400' : 'text-gray-600'}>
            {titleLen >= 50 && titleLen <= 60 ? '✓ Optimal (50–60 chars)' : titleLen > 60 ? `⚠ Too long (${titleLen}/60)` : titleLen > 0 ? `⚠ Too short (${titleLen}/50)` : '— Not set'}
          </span>
        </div>

        <Field label="Meta Description" badge="critical"
          desc="Shown below the title in Google results. Aim for 150–160 characters."
          value={cfg.seoDescription} onChange={up('seoDescription')} maxLength={170} multiline
          placeholder="The definitive tier list for all types of Minecraft PvP players." />
        <div className="text-[10px] flex gap-4">
          <span className={descLen >= 150 && descLen <= 160 ? 'text-green-400' : descLen > 0 ? 'text-orange-400' : 'text-gray-600'}>
            {descLen >= 150 && descLen <= 160 ? '✓ Optimal (150–160 chars)' : descLen > 160 ? `⚠ Too long (${descLen}/160)` : descLen > 0 ? `⚠ Short (${descLen}/150)` : '— Not set'}
          </span>
        </div>

        <Field label="Keywords"
          desc="Comma-separated terms people search for. Not a direct ranking factor but helps context."
          value={cfg.seoKeywords} onChange={up('seoKeywords')}
          placeholder="minecraft, pvp, tier list, blue tiers, crystal pvp" />
      </div>

      <div className="bg-white/2 border border-white/8 rounded-2xl p-5 space-y-5">
        <h3 className="text-white font-bold text-sm">Social & Open Graph</h3>
        <Field label="OG Image URL" badge="recommended"
          desc="Image shown when the site is shared on Twitter, Discord, Facebook. Use 1200×630px."
          value={cfg.ogImageUrl} onChange={up('ogImageUrl')}
          placeholder="https://your-domain.com/og-image.png" />
        {cfg.ogImageUrl && (
          <div className="rounded-xl overflow-hidden border border-white/10 aspect-[2/1] bg-white/3">
            <img src={cfg.ogImageUrl} alt="OG preview" className="w-full h-full object-cover"
              onError={e => (e.currentTarget.style.display = 'none')} />
          </div>
        )}
      </div>

      <div className="bg-white/2 border border-white/8 rounded-2xl p-5 space-y-5">
        <h3 className="text-white font-bold text-sm">URL Settings</h3>
        <Field label="Canonical URL" badge="important"
          desc="Your site's permanent public URL. Tells Google which URL is the 'real' one."
          value={cfg.canonicalUrl} onChange={up('canonicalUrl')}
          placeholder="https://bluetiers.bolt.host" />
        <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/15 text-[11px] text-blue-300/70">
          ℹ️ The canonical URL is injected as <code className="font-mono bg-white/10 px-1 rounded">&lt;link rel="canonical"&gt;</code> and <code className="font-mono bg-white/10 px-1 rounded">og:url</code> on every page.
        </div>
      </div>

      <button onClick={onSave} disabled={saving}
        className="w-full py-3 rounded-xl font-bold text-sm bg-[#00BFFF] text-black hover:bg-[#00BFFF]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_20px_rgba(0,191,255,0.2)]">
        {saving ? '⟳ Saving…' : '💾 Save Meta Tags'}
      </button>
    </div>
  )
}

// ─── Social Preview Tab ───────────────────────────────────────────────────────

function SocialPreviewTab({ cfg }: { cfg: ReturnType<typeof buildCfg> }) {
  const title   = cfg.seoTitle       || 'Blue Tiers — #1 Minecraft PvP Tier List'
  const desc    = cfg.seoDescription || '#1 Tier List for all types of Minecraft PvP players.'
  const url     = cfg.canonicalUrl   || 'https://bluetiers.bolt.host'
  const ogImage = cfg.ogImageUrl
  const domain  = (() => { try { return new URL(url).hostname } catch { return url } })()

  return (
    <div className="space-y-6">
      {/* Google SERP */}
      <div className="bg-white/2 border border-white/8 rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">🔍</span>
          <h3 className="text-white font-bold text-sm">Google Search Result Preview</h3>
        </div>
        <div className="bg-white rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-5 h-5 rounded-full bg-[#00BFFF] flex items-center justify-center text-[8px] text-black font-black">B</div>
            <div>
              <p className="text-[#202124] text-xs font-medium leading-none">Blue Tiers</p>
              <p className="text-[#4d5156] text-[10px]">{domain}</p>
            </div>
          </div>
          <h4 className="text-[#1a0dab] text-lg font-normal hover:underline cursor-pointer leading-snug mt-1">{title}</h4>
          <p className="text-[#4d5156] text-sm mt-1 leading-relaxed">{desc.slice(0, 160)}{desc.length > 160 ? '…' : ''}</p>
          <p className="text-[#006621] text-xs mt-1">{url}</p>
          <div className="flex gap-4 mt-2">
            {['/rankings', '/mining', '/shop', '/tournament'].map(p => (
              <a key={p} className="text-[#1a0dab] text-xs hover:underline cursor-pointer">{p.slice(1).charAt(0).toUpperCase() + p.slice(2)}</a>
            ))}
          </div>
        </div>
        <p className="text-gray-600 text-[10px]">This is an approximation. Actual results may vary by search query.</p>
      </div>

      {/* Twitter Card */}
      <div className="bg-white/2 border border-white/8 rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">🐦</span>
          <h3 className="text-white font-bold text-sm">Twitter / X Card Preview</h3>
        </div>
        <div className="bg-white rounded-2xl overflow-hidden max-w-md">
          {ogImage ? (
            <div className="aspect-[2/1] bg-gray-100 overflow-hidden">
              <img src={ogImage} alt="OG" className="w-full h-full object-cover" onError={e => (e.currentTarget.style.display = 'none')} />
            </div>
          ) : (
            <div className="aspect-[2/1] bg-gradient-to-br from-[#0B0F17] to-[#1a2744] flex items-center justify-center">
              <p className="text-gray-600 text-xs">No OG image set</p>
            </div>
          )}
          <div className="p-3 border-t border-gray-100">
            <p className="text-[#536471] text-xs">{domain}</p>
            <p className="text-[#0f1419] text-sm font-bold leading-snug mt-0.5">{title}</p>
            <p className="text-[#536471] text-xs mt-0.5">{desc.slice(0, 100)}{desc.length > 100 ? '…' : ''}</p>
          </div>
        </div>
      </div>

      {/* Discord / Slack OG */}
      <div className="bg-white/2 border border-white/8 rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">💬</span>
          <h3 className="text-white font-bold text-sm">Discord / Slack Link Preview</h3>
        </div>
        <div className="bg-[#313338] rounded-xl overflow-hidden max-w-md border-l-4 border-[#00BFFF]">
          {ogImage && (
            <div className="aspect-video overflow-hidden">
              <img src={ogImage} alt="OG" className="w-full h-full object-cover" onError={e => (e.currentTarget.style.display = 'none')} />
            </div>
          )}
          <div className="p-3">
            <p className="text-[#00BFFF] text-xs font-semibold">{domain}</p>
            <p className="text-white text-sm font-semibold mt-0.5">{title}</p>
            <p className="text-[#b5bac1] text-xs mt-1">{desc.slice(0, 120)}{desc.length > 120 ? '…' : ''}</p>
          </div>
        </div>
        {!ogImage && (
          <p className="text-orange-400/70 text-[10px]">⚠ Add an OG Image in Meta Tags for richer social previews.</p>
        )}
      </div>
    </div>
  )
}

// ─── Google Tools Tab ─────────────────────────────────────────────────────────

function GoogleToolsTab({ cfg, setCfg, onSave, saving }: {
  cfg: ReturnType<typeof buildCfg>; setCfg: (c: ReturnType<typeof buildCfg>) => void
  onSave: () => void; saving: boolean
}) {
  const up = (k: keyof ReturnType<typeof buildCfg>) => (v: string) => setCfg({ ...cfg, [k]: v })
  const canonical = cfg.canonicalUrl || 'https://bluetiers.bolt.host'

  return (
    <div className="space-y-6">
      {/* GA4 */}
      <div className="bg-white/2 border border-white/8 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-500/15 border border-orange-500/25 flex items-center justify-center text-base">📊</div>
            <div>
              <h3 className="text-white font-bold text-sm">Google Analytics 4</h3>
              <p className="text-gray-600 text-[10px]">Track visitors, bounce rate, and user behaviour</p>
            </div>
          </div>
          {cfg.ga4Id && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-500/15 text-green-400 border border-green-500/25">● Active</span>}
        </div>

        <Field label="Measurement ID" desc='Found in GA4 → Admin → Data Streams → your stream. Looks like G-XXXXXXXXXX.'
          value={cfg.ga4Id} onChange={up('ga4Id')} placeholder="G-XXXXXXXXXX" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <a href="https://analytics.google.com/" target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold bg-orange-500/10 border border-orange-500/20 text-orange-300 hover:bg-orange-500/20 transition-all">
            🔗 Open Google Analytics
          </a>
          {cfg.ga4Id && (
            <a href={`https://analytics.google.com/analytics/web/#/p${cfg.ga4Id.replace('G-', '')}/reports/`} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold bg-green-500/10 border border-green-500/20 text-green-300 hover:bg-green-500/20 transition-all">
              📈 View Live Report
            </a>
          )}
        </div>

        <div className="p-3 rounded-xl bg-white/3 border border-white/8 text-[10px] text-gray-500 font-mono">
          {'<!-- Injected automatically into <head> when ID is saved -->'}<br />
          {cfg.ga4Id
            ? `<script async src="https://www.googletagmanager.com/gtag/js?id=${cfg.ga4Id}"></script>`
            : '// No GA4 ID set — enter your Measurement ID above'}
        </div>
      </div>

      {/* Google Search Console */}
      <div className="bg-white/2 border border-white/8 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/25 flex items-center justify-center text-base">🔎</div>
            <div>
              <h3 className="text-white font-bold text-sm">Google Search Console</h3>
              <p className="text-gray-600 text-[10px]">Verify ownership, submit sitemaps, monitor indexing</p>
            </div>
          </div>
          {cfg.gscVerificationTag && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-500/15 text-green-400 border border-green-500/25">● Verified</span>}
        </div>

        <Field label="Verification Tag Content"
          desc='In GSC → "Verify ownership" → "HTML tag" → copy only the content="..." value.'
          value={cfg.gscVerificationTag} onChange={up('gscVerificationTag')}
          placeholder="abc123xyz456..." />

        <div className="p-3 rounded-xl bg-white/3 border border-white/8 text-[10px] text-gray-500 font-mono">
          {cfg.gscVerificationTag
            ? `<meta name="google-site-verification" content="${cfg.gscVerificationTag}" />`
            : '// Enter the verification tag above — injected into <head> automatically'}
        </div>

        <div className="space-y-2">
          <p className="text-gray-500 text-[10px] font-semibold uppercase tracking-wider">How to verify</p>
          {[
            '1. Go to Google Search Console → Add Property',
            '2. Enter your domain (e.g. bluetiers.bolt.host)',
            '3. Choose "HTML tag" verification method',
            '4. Copy the content="..." value from the meta tag shown',
            '5. Paste it above and click Save — your site will be verified within minutes',
          ].map((step, i) => (
            <p key={i} className="text-gray-600 text-[10px]">{step}</p>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <a href="https://search.google.com/search-console/" target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold bg-blue-500/10 border border-blue-500/20 text-blue-300 hover:bg-blue-500/20 transition-all">
            🔗 Open Search Console
          </a>
          <a href={`https://search.google.com/search-console/inspect?resource_id=${encodeURIComponent(canonical)}&id=${encodeURIComponent(canonical + '/')}`}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold bg-green-500/10 border border-green-500/20 text-green-300 hover:bg-green-500/20 transition-all">
            🔍 Inspect URL
          </a>
        </div>
      </div>

      {/* PageSpeed */}
      <div className="bg-white/2 border border-white/8 rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-purple-500/15 border border-purple-500/25 flex items-center justify-center text-base">⚡</div>
          <div>
            <h3 className="text-white font-bold text-sm">Page Speed & Core Web Vitals</h3>
            <p className="text-gray-600 text-[10px]">Google uses speed as a ranking factor</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <a href={`https://pagespeed.web.dev/report?url=${encodeURIComponent(canonical)}`} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold bg-purple-500/10 border border-purple-500/20 text-purple-300 hover:bg-purple-500/20 transition-all">
            ⚡ Run PageSpeed Test
          </a>
          <a href={`https://www.google.com/search?q=site:${cfg.canonicalUrl || 'bluetiers.bolt.host'}`} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold bg-white/5 border border-white/10 text-gray-400 hover:bg-white/8 transition-all">
            🔎 Check Google Index
          </a>
        </div>
      </div>

      <button onClick={onSave} disabled={saving}
        className="w-full py-3 rounded-xl font-bold text-sm bg-[#00BFFF] text-black hover:bg-[#00BFFF]/90 disabled:opacity-50 transition-all shadow-[0_0_20px_rgba(0,191,255,0.2)]">
        {saving ? '⟳ Saving…' : '💾 Save Google Settings'}
      </button>
    </div>
  )
}

// ─── Sitemap Tab ──────────────────────────────────────────────────────────────

function SitemapTab({ cfg, sitemapDone, setSitemapDone, toast }: {
  cfg: ReturnType<typeof buildCfg>; sitemapDone: boolean; setSitemapDone: (v: boolean) => void
  toast: (m: string, t: 'success' | 'error' | 'info') => void
}) {
  const [extra, setExtra]       = useState('')
  const [generating, setGen]    = useState(false)
  const [xml, setXml]           = useState<string | null>(null)
  const canonical = cfg.canonicalUrl || 'https://bluetiers.bolt.host'

  useEffect(() => {
    loadSitemapXml().then(x => { if (x) { setXml(x); setSitemapDone(true) } }).catch(() => {})
  }, [])

  async function handleGenerate() {
    setGen(true)
    try {
      const additionalUrls = extra.split('\n').filter(u => u.trim())
      const res = await generateSitemap({ data: { baseUrl: canonical, additionalUrls } })
      setXml(res.xml)
      setSitemapDone(true)
      localStorage.setItem('pub_sitemap_done', '1')
      toast(`✓ Sitemap generated — ${res.count} URLs`, 'success')
    } catch (e: any) {
      toast('Failed to generate sitemap: ' + e.message, 'error')
    } finally {
      setGen(false)
    }
  }

  function copy() {
    if (!xml) return
    navigator.clipboard.writeText(xml).then(() => toast('Copied to clipboard', 'info'))
  }

  const sitemapUrl = canonical.replace(/\/$/, '') + '/sitemap.xml'

  return (
    <div className="space-y-6">
      {/* Status */}
      <div className={`p-4 rounded-2xl border flex items-start gap-3 ${sitemapDone ? 'bg-green-500/5 border-green-500/20' : 'bg-orange-500/5 border-orange-500/20'}`}>
        <span className="text-xl">{sitemapDone ? '✅' : '⚠️'}</span>
        <div>
          <p className={`font-bold text-sm ${sitemapDone ? 'text-green-400' : 'text-orange-400'}`}>
            {sitemapDone ? 'Sitemap generated and live' : 'Sitemap not yet generated'}
          </p>
          <p className="text-gray-500 text-[10px] mt-0.5">
            {sitemapDone ? `Available at ${sitemapUrl}` : 'Click Generate below to create your sitemap.xml'}
          </p>
        </div>
        {sitemapDone && (
          <a href={sitemapUrl} target="_blank" rel="noopener noreferrer"
            className="ml-auto px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 transition-all shrink-0">
            View Live ↗
          </a>
        )}
      </div>

      {/* Config */}
      <div className="bg-white/2 border border-white/8 rounded-2xl p-5 space-y-4">
        <h3 className="text-white font-bold text-sm">Sitemap Configuration</h3>
        <div className="p-3 rounded-xl bg-white/3 border border-white/8 space-y-2">
          <p className="text-gray-500 text-[10px] font-semibold uppercase tracking-wider">Included Core Pages</p>
          {['/ (Home) — priority 1.0', '/rankings — priority 0.9', '/tournament — priority 0.8', '/mining — priority 0.7', '/exchange — priority 0.6', '/shop — priority 0.6'].map(r => (
            <div key={r} className="flex items-center gap-2">
              <span className="text-green-400 text-[10px]">✓</span>
              <span className="text-gray-400 text-[10px] font-mono">{r}</span>
            </div>
          ))}
        </div>

        <div>
          <label className="text-white text-sm font-semibold block mb-1">Additional URLs (one per line)</label>
          <p className="text-gray-600 text-[10px] mb-2">Add custom paths like /about or /rules</p>
          <textarea value={extra} onChange={e => setExtra(e.target.value)} rows={3}
            className="w-full bg-white/3 border border-white/10 hover:border-white/20 focus:border-[#00BFFF]/40 rounded-xl px-4 py-3 text-white text-sm outline-none transition-all resize-none font-mono placeholder-gray-700"
            placeholder="/about&#10;/rules&#10;/apply" />
        </div>

        <p className="text-[10px] text-gray-600">Base URL: <span className="font-mono text-gray-400">{canonical}</span></p>
      </div>

      {/* Generate */}
      <button onClick={handleGenerate} disabled={generating}
        className="w-full py-3 rounded-xl font-bold text-sm bg-[#00BFFF] text-black hover:bg-[#00BFFF]/90 disabled:opacity-50 transition-all shadow-[0_0_20px_rgba(0,191,255,0.2)]">
        {generating ? '⟳ Generating…' : '🗺️ Generate Sitemap.xml'}
      </button>

      {/* Preview */}
      {xml && (
        <div className="bg-white/2 border border-white/8 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-bold text-sm">Generated Sitemap</h3>
            <button onClick={copy} className="px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/8 transition-all">
              📋 Copy XML
            </button>
          </div>
          <pre className="bg-black/30 rounded-xl p-4 text-[10px] font-mono text-gray-400 overflow-auto max-h-64 border border-white/5">{xml}</pre>
        </div>
      )}

      {/* Submit instructions */}
      <div className="bg-white/2 border border-white/8 rounded-2xl p-5 space-y-3">
        <h3 className="text-white font-bold text-sm">📬 Submit to Google</h3>
        {[
          '1. Generate your sitemap above',
          '2. Open Google Search Console',
          '3. Go to Sitemaps → Enter "sitemap.xml" → Submit',
          '4. Google will crawl and index your pages within days',
        ].map((s, i) => <p key={i} className="text-gray-500 text-[10px]">{s}</p>)}
        <a href="https://search.google.com/search-console/sitemaps" target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-[#00BFFF]/10 text-[#00BFFF] border border-[#00BFFF]/25 hover:bg-[#00BFFF]/20 transition-all">
          🔗 Open GSC Sitemaps
        </a>
      </div>
    </div>
  )
}

// ─── Robots Tab ───────────────────────────────────────────────────────────────

function RobotsTab({ cfg, toast }: { cfg: ReturnType<typeof buildCfg>; toast: (m: string, t: 'success' | 'error' | 'info') => void }) {
  const canonical   = cfg.canonicalUrl || 'https://bluetiers.bolt.host'
  const DEFAULT_TXT = `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\n\nSitemap: ${canonical.replace(/\/$/, '')}/sitemap.xml`

  const [content, setContent] = useState<string>(DEFAULT_TXT)
  const [saving, setSaving]   = useState(false)
  const [loaded, setLoaded]   = useState(false)

  useEffect(() => {
    loadRobotsTxt().then(txt => { if (txt) setContent(txt) }).catch(() => {}).finally(() => setLoaded(true))
  }, [])

  const PRESETS = [
    { label: 'Allow All',   value: `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\n\nSitemap: ${canonical.replace(/\/$/, '')}/sitemap.xml` },
    { label: 'Block Admin', value: `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\nDisallow: /private/\n\nUser-agent: GPTBot\nDisallow: /\n\nSitemap: ${canonical.replace(/\/$/, '')}/sitemap.xml` },
    { label: 'Block AI',    value: `User-agent: *\nAllow: /\nDisallow: /admin\n\nUser-agent: GPTBot\nDisallow: /\n\nUser-agent: ChatGPT-User\nDisallow: /\n\nUser-agent: CCBot\nDisallow: /\n\nSitemap: ${canonical.replace(/\/$/, '')}/sitemap.xml` },
  ]

  async function handleSave() {
    setSaving(true)
    try {
      await saveRobotsTxt({ data: { content } })
      toast('✓ robots.txt saved', 'success')
    } catch (e: any) {
      toast('Failed: ' + e.message, 'error')
    } finally { setSaving(false) }
  }

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-2xl border border-white/8 bg-white/2 text-[11px] text-gray-400">
        📄 <strong className="text-white">robots.txt</strong> tells search engine bots which pages to crawl. It's served at <span className="font-mono text-[#00BFFF]">/robots.txt</span>.
      </div>

      {/* Presets */}
      <div className="bg-white/2 border border-white/8 rounded-2xl p-5 space-y-3">
        <h3 className="text-white font-bold text-sm">Quick Presets</h3>
        <div className="grid grid-cols-3 gap-2">
          {PRESETS.map(p => (
            <button key={p.label} onClick={() => setContent(p.value)}
              className="py-2 px-3 rounded-xl text-xs font-semibold bg-white/4 border border-white/10 text-gray-300 hover:bg-white/8 hover:text-white transition-all">
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Editor */}
      <div className="bg-white/2 border border-white/8 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-bold text-sm">Edit robots.txt</h3>
          <span className="text-gray-600 text-[10px]">{content.split('\n').length} lines</span>
        </div>
        {!loaded ? (
          <div className="h-48 flex items-center justify-center text-gray-600 text-sm">Loading…</div>
        ) : (
          <textarea value={content} onChange={e => setContent(e.target.value)} rows={12}
            className="w-full bg-black/30 border border-white/10 hover:border-white/20 focus:border-[#00BFFF]/40 rounded-xl px-4 py-3 text-[#7dd3fc] text-xs font-mono outline-none transition-all resize-none" />
        )}

        {/* Inline reference */}
        <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-600">
          {[
            ['User-agent: *', 'Applies to all bots'],
            ['Allow: /', 'Allow all pages'],
            ['Disallow: /admin', 'Block /admin from crawling'],
            ['Sitemap: /sitemap.xml', 'Points bots to your sitemap'],
          ].map(([k, v]) => (
            <div key={k} className="flex gap-2">
              <code className="text-gray-400 shrink-0">{k}</code>
              <span>— {v}</span>
            </div>
          ))}
        </div>
      </div>

      <button onClick={handleSave} disabled={saving}
        className="w-full py-3 rounded-xl font-bold text-sm bg-[#00BFFF] text-black hover:bg-[#00BFFF]/90 disabled:opacity-50 transition-all shadow-[0_0_20px_rgba(0,191,255,0.2)]">
        {saving ? '⟳ Saving…' : '🤖 Save robots.txt'}
      </button>

      <div className="flex gap-2">
        <a href="/robots.txt" target="_blank" rel="noopener noreferrer"
          className="flex-1 text-center py-2.5 rounded-xl text-xs font-semibold bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/8 transition-all">
          View Live ↗
        </a>
        <a href="https://www.google.com/search?q=site:" target="_blank" rel="noopener noreferrer"
          className="flex-1 text-center py-2.5 rounded-xl text-xs font-semibold bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/8 transition-all">
          Check Index ↗
        </a>
      </div>
    </div>
  )
}

// ─── Schema Tab ───────────────────────────────────────────────────────────────

function SchemaTab({ cfg }: { cfg: ReturnType<typeof buildCfg> }) {
  const [copied, setCopied] = useState(false)
  const canonical = cfg.canonicalUrl || 'https://bluetiers.bolt.host'

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Blue Tiers',
    url: canonical,
    description: cfg.seoDescription || 'The definitive Minecraft PvP tier list.',
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${canonical}/rankings?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
    sameAs: [
      cfg.discordLink, cfg.twitterLink, cfg.youtubeLink, cfg.twitchLink,
    ].filter(Boolean),
    publisher: {
      '@type': 'Organization',
      name: 'Blue Tiers',
      url: canonical,
      logo: { '@type': 'ImageObject', url: `${canonical}/icons/icon-192x192.png` },
    },
  }

  const breadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home',       item: canonical },
      { '@type': 'ListItem', position: 2, name: 'Rankings',   item: `${canonical}/rankings` },
      { '@type': 'ListItem', position: 3, name: 'Tournament', item: `${canonical}/tournament` },
      { '@type': 'ListItem', position: 4, name: 'Mining',     item: `${canonical}/mining` },
      { '@type': 'ListItem', position: 5, name: 'Shop',       item: `${canonical}/shop` },
    ],
  }

  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      { '@type': 'Question', name: 'What is Blue Tiers?', acceptedAnswer: { '@type': 'Answer', text: 'Blue Tiers is the #1 Minecraft PvP tier list, ranking players across all gamemodes including Sword, Crystal, UHC, and more.' } },
      { '@type': 'Question', name: 'How do I get ranked?', acceptedAnswer: { '@type': 'Answer', text: 'Join our Discord and apply for a rank — our staff will review your gameplay and assign you a tier.' } },
    ],
  }

  const allSchema = [schema, breadcrumbs, faq]
  const jsonStr   = JSON.stringify(allSchema, null, 2)

  function copy() {
    navigator.clipboard.writeText(jsonStr).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
  }

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-2xl border border-[#00BFFF]/20 bg-[#00BFFF]/5 text-[11px] text-[#00BFFF]/80">
        📐 <strong>Structured Data (JSON-LD)</strong> helps Google understand your site, enabling rich results in search (sitelinks, FAQs, breadcrumbs). This is auto-generated from your settings and injected into every page.
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { type: 'WebSite', desc: 'Site identity + search action', icon: '🌐', color: '#00BFFF' },
          { type: 'BreadcrumbList', desc: 'Page hierarchy for rich results', icon: '🔗', color: '#8b5cf6' },
          { type: 'FAQPage', desc: 'FAQ snippets in search results', icon: '❓', color: '#22c55e' },
        ].map(s => (
          <div key={s.type} className="p-3 rounded-xl border bg-white/2 border-white/8">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-base">{s.icon}</span>
              <span className="text-white text-xs font-bold">{s.type}</span>
            </div>
            <p className="text-gray-600 text-[10px]">{s.desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-white/2 border border-white/8 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-bold text-sm">Generated JSON-LD</h3>
          <div className="flex gap-2">
            <button onClick={copy} className="px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/8 transition-all">
              {copied ? '✓ Copied!' : '📋 Copy'}
            </button>
            <a href="https://search.google.com/test/rich-results" target="_blank" rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-blue-500/10 border border-blue-500/20 text-blue-300 hover:bg-blue-500/20 transition-all">
              Test ↗
            </a>
          </div>
        </div>
        <pre className="bg-black/30 rounded-xl p-4 text-[10px] font-mono text-[#7dd3fc] overflow-auto max-h-96 border border-white/5">{jsonStr}</pre>
        <p className="text-gray-600 text-[10px]">This JSON-LD is auto-generated and injected into every page's <code className="font-mono bg-white/10 px-1 rounded">&lt;head&gt;</code>.</p>
      </div>

      <div className="bg-white/2 border border-white/8 rounded-2xl p-5 space-y-2">
        <h3 className="text-white font-bold text-sm">Validation Tools</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[
            ['Google Rich Results Test', 'https://search.google.com/test/rich-results', '🔍'],
            ['Schema.org Validator',     'https://validator.schema.org/',               '✅'],
          ].map(([label, url, icon]) => (
            <a key={label as string} href={url as string} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold bg-white/4 border border-white/10 text-gray-300 hover:bg-white/8 hover:text-white transition-all">
              <span>{icon as string}</span> {label as string}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Checklist Tab ────────────────────────────────────────────────────────────

const CHECKLIST_ITEMS = [
  { id: 'title',      cat: 'On-Page SEO',    label: 'Set a unique page title (50–60 chars)',               link: '' },
  { id: 'desc',       cat: 'On-Page SEO',    label: 'Write a compelling meta description (150–160 chars)', link: '' },
  { id: 'keywords',   cat: 'On-Page SEO',    label: 'Add relevant keywords',                               link: '' },
  { id: 'canonical',  cat: 'On-Page SEO',    label: 'Set canonical URL to your live domain',               link: '' },
  { id: 'ogimage',    cat: 'Social',         label: 'Upload OG image (1200×630px)',                        link: '' },
  { id: 'twitter',    cat: 'Social',         label: 'Verify Twitter card in Twitter Card Validator',       link: 'https://cards-dev.twitter.com/validator' },
  { id: 'ga4',        cat: 'Analytics',      label: 'Connect Google Analytics 4 (GA4)',                   link: '' },
  { id: 'gsc',        cat: 'Analytics',      label: 'Verify site in Google Search Console',               link: 'https://search.google.com/search-console/' },
  { id: 'sitemap',    cat: 'Technical SEO',  label: 'Generate sitemap.xml and submit to GSC',             link: '' },
  { id: 'robots',     cat: 'Technical SEO',  label: 'Configure robots.txt',                               link: '' },
  { id: 'pagespeed',  cat: 'Technical SEO',  label: 'Score 90+ on PageSpeed Insights',                   link: 'https://pagespeed.web.dev/' },
  { id: 'ssl',        cat: 'Technical SEO',  label: 'Site served over HTTPS',                             link: '' },
  { id: 'mobile',     cat: 'Technical SEO',  label: 'Pass Google Mobile-Friendly Test',                   link: 'https://search.google.com/test/mobile-friendly' },
  { id: 'schema',     cat: 'Structured Data','label': 'Validate JSON-LD structured data',                 link: 'https://search.google.com/test/rich-results' },
  { id: 'discord',    cat: 'Community',      label: 'Add Discord link for community trust signals',       link: '' },
  { id: 'social',     cat: 'Community',      label: 'Share site on social media',                         link: '' },
  { id: 'backlinks',  cat: 'Off-Page SEO',   label: 'Get listed on Minecraft community sites',            link: '' },
  { id: 'content',    cat: 'Off-Page SEO',   label: 'Update rankings regularly (freshness signal)',       link: '' },
]

function ChecklistTab() {
  const [done, setDone] = useState<Record<string, boolean>>(() => {
    try { return JSON.parse(localStorage.getItem('pub_checklist') || '{}') } catch { return {} }
  })

  function toggle(id: string) {
    const next = { ...done, [id]: !done[id] }
    setDone(next)
    localStorage.setItem('pub_checklist', JSON.stringify(next))
  }

  const cats = [...new Set(CHECKLIST_ITEMS.map(i => i.cat))]
  const total   = CHECKLIST_ITEMS.length
  const checked = Object.values(done).filter(Boolean).length
  const pct     = Math.round((checked / total) * 100)

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="bg-white/2 border border-white/8 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-white font-bold text-sm">SEO Checklist</h3>
            <p className="text-gray-600 text-[10px] mt-0.5">{checked}/{total} tasks completed</p>
          </div>
          <span className="text-2xl font-black" style={{ color: pct >= 80 ? '#22c55e' : pct >= 50 ? '#f59e0b' : '#ef4444' }}>{pct}%</span>
        </div>
        <div className="h-2 rounded-full bg-white/5 overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, background: pct >= 80 ? '#22c55e' : pct >= 50 ? '#f59e0b' : '#ef4444' }} />
        </div>
      </div>

      {/* Categories */}
      {cats.map(cat => (
        <div key={cat} className="bg-white/2 border border-white/8 rounded-2xl p-5 space-y-2">
          <h3 className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-3">{cat}</h3>
          {CHECKLIST_ITEMS.filter(i => i.cat === cat).map(item => (
            <div key={item.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/3 transition-all group cursor-pointer" onClick={() => toggle(item.id)}>
              <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${done[item.id] ? 'bg-green-500 border-green-500' : 'border-white/20 group-hover:border-white/40'}`}>
                {done[item.id] && <span className="text-white text-[10px] font-black">✓</span>}
              </div>
              <span className={`flex-1 text-sm transition-all ${done[item.id] ? 'text-gray-600 line-through' : 'text-gray-300'}`}>
                {item.label}
              </span>
              {item.link && (
                <a href={item.link} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                  className="px-2 py-0.5 rounded text-[10px] bg-white/5 text-gray-600 hover:text-[#00BFFF] hover:bg-[#00BFFF]/10 transition-all">
                  ↗
                </a>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

// ─── Config builder ───────────────────────────────────────────────────────────

function buildCfg() {
  const c = getSiteContent()
  return {
    seoTitle:           c.seoTitle           ?? '',
    seoDescription:     c.seoDescription     ?? '',
    seoKeywords:        c.seoKeywords        ?? '',
    ogImageUrl:         c.ogImageUrl         ?? '',
    canonicalUrl:       c.canonicalUrl       ?? '',
    ga4Id:              c.ga4Id              ?? '',
    gscVerificationTag: c.gscVerificationTag ?? '',
    discordLink:        c.discordLink        ?? '',
    twitterLink:        c.twitterLink        ?? '',
    youtubeLink:        c.youtubeLink        ?? '',
    twitchLink:         c.twitchLink         ?? '',
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function PublishManager({ admin }: Props) {
  const [tab, setTab]               = useState('overview')
  const [cfg, setCfg]               = useState(buildCfg)
  const [saving, setSaving]         = useState(false)
  const [sitemapDone, setSitemapDone] = useState(() => !!localStorage.getItem('pub_sitemap_done'))
  const [toast, setToast]           = useState<{ msg: string; type: 'success' | 'error' | 'info' } | null>(null)

  function showToast(msg: string, type: 'success' | 'error' | 'info') {
    setToast({ msg, type })
  }

  async function handleSave() {
    setSaving(true)
    try {
      // 1. Persist to contentStore (→ GitHub sync will commit it)
      const existing = getSiteContent()
      saveSiteContent({ ...existing, ...cfg })

      // 2. Also write directly to disk so root loader picks it up immediately
      await savePublishConfig({
        data: {
          canonicalUrl:       cfg.canonicalUrl,
          ga4Id:              cfg.ga4Id,
          gscVerificationTag: cfg.gscVerificationTag,
          seoTitle:           cfg.seoTitle,
          seoDescription:     cfg.seoDescription,
          seoKeywords:        cfg.seoKeywords,
          ogImageUrl:         cfg.ogImageUrl,
        },
      })

      addLog(admin, 'publish-config', 'Saved publish / SEO settings')
      showToast('✓ Publish settings saved — meta tags are now live', 'success')
    } catch (e: any) {
      showToast('Save failed: ' + e.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const activeTab = TABS.find(t => t.id === tab)!

  return (
    <div className="space-y-6">
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* Tab bar */}
      <div className="flex flex-wrap gap-1.5">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${
              tab === t.id
                ? 'bg-[#00BFFF]/15 border-[#00BFFF]/30 text-[#00BFFF]'
                : 'bg-white/3 border-white/8 text-gray-500 hover:text-gray-300 hover:bg-white/5'
            }`}>
            <span className="text-sm leading-none">{t.icon}</span> {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === 'overview'  && <OverviewTab     cfg={cfg} sitemapDone={sitemapDone} setTab={setTab} />}
      {tab === 'meta'      && <MetaTagsTab     cfg={cfg} setCfg={setCfg} onSave={handleSave} saving={saving} />}
      {tab === 'social'    && <SocialPreviewTab cfg={cfg} />}
      {tab === 'google'    && <GoogleToolsTab  cfg={cfg} setCfg={setCfg} onSave={handleSave} saving={saving} />}
      {tab === 'sitemap'   && <SitemapTab      cfg={cfg} sitemapDone={sitemapDone} setSitemapDone={setSitemapDone} toast={showToast} />}
      {tab === 'robots'    && <RobotsTab       cfg={cfg} toast={showToast} />}
      {tab === 'schema'    && <SchemaTab       cfg={cfg} />}
      {tab === 'checklist' && <ChecklistTab />}
    </div>
  )
}
