// ─── Earnings Manager ─────────────────────────────────────────────────────────
// Grand admin panel for monetisation: ad config, renew-button mode,
// page ads, revenue tracking, analytics, and advanced settings.

import { useState, useEffect, useCallback } from 'react'
import type { AdsConfig } from '../../server/earningsServer'
import { getAdsConfig, saveAdsConfig, resetAdsStats } from '../../server/earningsServer'
import { addLog } from '../../store/adminStore'

interface Props { admin: string }

const TABS = [
  { id: 'overview',   icon: '💹', label: 'Overview'      },
  { id: 'ad-setup',   icon: '🎯', label: 'Ad Setup'      },
  { id: 'renew',      icon: '🔄', label: 'Renew Button'  },
  { id: 'page-ads',   icon: '📄', label: 'Page Ads'      },
  { id: 'revenue',    icon: '💰', label: 'Revenue'       },
  { id: 'analytics',  icon: '📊', label: 'Analytics'     },
  { id: 'advanced',   icon: '⚙️', label: 'Advanced'      },
] as const
type Tab = typeof TABS[number]['id']

const PROVIDER_OPTIONS = [
  { value: 'placeholder', label: 'Placeholder (default)', desc: 'Shows a branded placeholder — configure a real provider below.' },
  { value: 'adsense',     label: 'Google AdSense',        desc: 'Serve real ads via your AdSense account.' },
  { value: 'custom',      label: 'Custom HTML',           desc: 'Paste any iframe or ad network code.' },
] as const

const RENEW_MODES = [
  { value: 'ad-required', label: 'Ad Required',  desc: 'Players must watch the full ad to renew.', color: '#f59e0b' },
  { value: 'ad-optional', label: 'Ad Optional',  desc: 'Ad is shown but can be closed without watching.', color: '#00BFFF' },
  { value: 'free',        label: 'Free',          desc: 'Renew works instantly — no ad shown.', color: '#22c55e' },
  { value: 'disabled',    label: 'Disabled',      desc: 'Renew button is hidden completely.', color: '#ef4444' },
] as const

function StatCard({ icon, label, value, sub, color = '#00BFFF' }: { icon: string; label: string; value: string; sub?: string; color?: string }) {
  return (
    <div
      className="rounded-2xl p-5 border flex flex-col gap-2"
      style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.06)' }}
    >
      <div className="flex items-center gap-2.5">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0"
          style={{ background: `${color}14`, border: `1px solid ${color}25` }}
        >
          {icon}
        </div>
        <span className="text-xs text-gray-500 font-medium">{label}</span>
      </div>
      <p className="text-2xl font-bold text-white font-['Space_Grotesk'] tabular-nums">{value}</p>
      {sub && <p className="text-[11px] text-gray-600">{sub}</p>}
    </div>
  )
}

function Toggle({ checked, onChange, label, desc }: { checked: boolean; onChange: (v: boolean) => void; label: string; desc?: string }) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <div className="relative mt-0.5 shrink-0">
        <input type="checkbox" className="sr-only" checked={checked} onChange={e => onChange(e.target.checked)} />
        <div
          className="w-10 h-5.5 rounded-full transition-all duration-200"
          style={{
            background: checked ? 'linear-gradient(135deg,#00BFFF,#0066FF)' : 'rgba(255,255,255,0.08)',
            boxShadow: checked ? '0 0 10px rgba(0,191,255,0.35)' : 'none',
            width: 40, height: 22,
          }}
        />
        <div
          className="absolute top-0.5 rounded-full bg-white transition-all duration-200 shadow"
          style={{ width: 18, height: 18, left: checked ? 20 : 2 }}
        />
      </div>
      <div>
        <p className="text-sm text-white font-medium">{label}</p>
        {desc && <p className="text-xs text-gray-500 mt-0.5">{desc}</p>}
      </div>
    </label>
  )
}

function Field({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{label}</label>
      {desc && <p className="text-[11px] text-gray-600 -mt-0.5">{desc}</p>}
      {children}
    </div>
  )
}

function Input({ value, onChange, placeholder, type = 'text' }: { value: string | number; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3.5 py-2.5 rounded-xl text-sm text-white placeholder-gray-600 outline-none transition-all"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', fontFamily: 'inherit' }}
      onFocus={e => (e.target.style.borderColor = 'rgba(0,191,255,0.4)')}
      onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
    />
  )
}

function Textarea({ value, onChange, placeholder, rows = 5 }: { value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-3.5 py-2.5 rounded-xl text-sm text-white placeholder-gray-600 outline-none resize-y transition-all font-mono"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
      onFocus={e => (e.target.style.borderColor = 'rgba(0,191,255,0.4)')}
      onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
    />
  )
}

function SectionBox({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border p-6 flex flex-col gap-5" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.06)' }}>
      <h3 className="text-sm font-bold text-white font-['Space_Grotesk'] flex items-center gap-2">{title}</h3>
      {children}
    </div>
  )
}

const PAGE_LABELS: Record<string, string> = {
  home: '🏠 Home',
  rankings: '📋 Rankings',
  mining: '⛏️ Mining',
  exchange: '💱 Exchange',
  shop: '🛒 Shop',
  tournament: '🏆 Tournament',
}

export function EarningsManager({ admin }: Props) {
  const [tab, setTab]         = useState<Tab>('overview')
  const [cfg, setCfg]         = useState<AdsConfig | null>(null)
  const [draft, setDraft]     = useState<AdsConfig | null>(null)
  const [saving, setSaving]   = useState(false)
  const [resetting, setResetting] = useState(false)
  const [saved, setSaved]     = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAdsConfig().then(data => {
      setCfg(data)
      setDraft(data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const patch = useCallback(<K extends keyof AdsConfig>(key: K, value: AdsConfig[K]) => {
    setDraft(d => d ? { ...d, [key]: value } : d)
  }, [])

  const patchPageAd = useCallback((page: string, value: boolean) => {
    setDraft(d => d ? { ...d, pageAds: { ...d.pageAds, [page]: value } } : d)
  }, [])

  const handleSave = useCallback(async () => {
    if (!draft) return
    setSaving(true)
    try {
      await saveAdsConfig({ data: { config: draft } })
      setCfg(draft)
      addLog(admin, 'earnings:save', `Saved ads config — provider: ${draft.adProvider}, mode: ${draft.renewMode}`)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }, [draft, admin])

  const handleReset = useCallback(async () => {
    if (!confirm('Reset all impression/revenue stats to zero? This cannot be undone.')) return
    setResetting(true)
    try {
      await resetAdsStats()
      const fresh = await getAdsConfig()
      setCfg(fresh)
      setDraft(fresh)
      addLog(admin, 'earnings:reset-stats', 'Reset all ad statistics')
    } catch (e) {
      console.error(e)
    } finally {
      setResetting(false)
    }
  }, [admin])

  if (loading || !draft || !cfg) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-2 border-[#00BFFF]/30 border-t-[#00BFFF] rounded-full animate-spin" />
      </div>
    )
  }

  const ctr = cfg.stats.totalImpressions > 0
    ? ((cfg.stats.totalCompletions / cfg.stats.totalImpressions) * 100).toFixed(1)
    : '0.0'
  const skipRate = cfg.stats.totalImpressions > 0
    ? ((cfg.stats.totalSkips / cfg.stats.totalImpressions) * 100).toFixed(1)
    : '0.0'
  const projectedMonthly = (cfg.stats.estimatedRevenue / Math.max(1, daysSinceReset(cfg))) * 30

  function daysSinceReset(c: AdsConfig) {
    if (!c.stats.lastReset) return 1
    return Math.max(1, Math.round((Date.now() - new Date(c.stats.lastReset).getTime()) / 86400000))
  }

  const isDirty = JSON.stringify(draft) !== JSON.stringify(cfg)

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6 pb-12">

      {/* ── Page header ──────────────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden rounded-2xl p-6 border"
        style={{ background: 'linear-gradient(135deg, rgba(0,191,255,0.07) 0%, rgba(0,102,255,0.05) 100%)', borderColor: 'rgba(0,191,255,0.15)' }}
      >
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at top right, rgba(0,191,255,0.06) 0%, transparent 70%)' }} />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white font-['Space_Grotesk'] flex items-center gap-2.5">
              💹 Earnings &amp; Monetisation
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Configure ads, renew-button behaviour, and track your revenue in one place.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {/* Global enable toggle */}
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-xs text-gray-500">Ads {draft.enabled ? 'ON' : 'OFF'}</span>
              <div className="relative">
                <input type="checkbox" className="sr-only" checked={draft.enabled} onChange={e => patch('enabled', e.target.checked)} />
                <div style={{ width: 40, height: 22, borderRadius: 11, background: draft.enabled ? 'linear-gradient(135deg,#00BFFF,#0066FF)' : 'rgba(255,255,255,0.08)', transition: 'background .2s', boxShadow: draft.enabled ? '0 0 10px rgba(0,191,255,0.3)' : 'none' }} />
                <div style={{ position: 'absolute', top: 2, left: draft.enabled ? 20 : 2, width: 18, height: 18, borderRadius: '50%', background: 'white', transition: 'left .2s', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }} />
              </div>
            </label>
            <button
              onClick={handleSave}
              disabled={saving || !isDirty}
              className="px-5 py-2.5 rounded-xl font-bold text-sm transition-all"
              style={{
                background: isDirty ? 'linear-gradient(135deg,#00BFFF,#0066FF)' : 'rgba(255,255,255,0.04)',
                color: isDirty ? 'white' : 'rgba(255,255,255,0.25)',
                boxShadow: isDirty ? '0 0 20px rgba(0,191,255,0.25)' : 'none',
                cursor: isDirty ? 'pointer' : 'not-allowed',
              }}
            >
              {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Tabs ─────────────────────────────────────────────────────────────── */}
      <div className="flex gap-1 flex-wrap">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="px-4 py-2 rounded-xl text-xs font-semibold transition-all"
            style={{
              background: tab === t.id ? 'rgba(0,191,255,0.12)' : 'rgba(255,255,255,0.03)',
              color: tab === t.id ? '#00BFFF' : 'rgba(255,255,255,0.45)',
              border: `1px solid ${tab === t.id ? 'rgba(0,191,255,0.3)' : 'rgba(255,255,255,0.05)'}`,
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ── Overview ─────────────────────────────────────────────────────────── */}
      {tab === 'overview' && (
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard icon="👁️" label="Total Impressions"  value={cfg.stats.totalImpressions.toLocaleString()} sub="Ads opened" color="#00BFFF" />
            <StatCard icon="✅" label="Completions"        value={cfg.stats.totalCompletions.toLocaleString()} sub={`${ctr}% completion rate`} color="#22c55e" />
            <StatCard icon="⏭️" label="Skips"              value={cfg.stats.totalSkips.toLocaleString()} sub={`${skipRate}% skip rate`} color="#f59e0b" />
            <StatCard icon="💵" label="Est. Revenue"       value={`$${cfg.stats.estimatedRevenue.toFixed(4)}`} sub={`$${cfg.estimatedRpm.toFixed(2)} RPM`} color="#a855f7" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SectionBox title="📈 Revenue Projections">
              <div className="flex flex-col gap-3">
                {[
                  { label: 'Today (est.)',  value: `$${(cfg.stats.estimatedRevenue).toFixed(4)}` },
                  { label: '30-day (est.)', value: `$${projectedMonthly.toFixed(2)}` },
                  { label: 'Per 1,000 views (RPM)', value: `$${cfg.estimatedRpm.toFixed(2)}` },
                ].map(row => (
                  <div key={row.label} className="flex justify-between items-center py-2.5 border-b border-white/5 last:border-0">
                    <span className="text-sm text-gray-500">{row.label}</span>
                    <span className="text-sm font-bold text-white tabular-nums">{row.value}</span>
                  </div>
                ))}
              </div>
            </SectionBox>

            <SectionBox title="⚙️ Current Configuration">
              <div className="flex flex-col gap-3">
                {[
                  { label: 'Ad Provider',    value: draft.adProvider },
                  { label: 'Renew Mode',     value: draft.renewMode },
                  { label: 'Ad Duration',    value: `${draft.adDurationSeconds}s` },
                  { label: 'Skip Allowed',   value: draft.skipAllowed ? 'Yes' : 'No' },
                  { label: 'Global Ads',     value: draft.enabled ? '✅ Enabled' : '🔴 Disabled' },
                ].map(row => (
                  <div key={row.label} className="flex justify-between items-center py-2.5 border-b border-white/5 last:border-0">
                    <span className="text-sm text-gray-500">{row.label}</span>
                    <span className="text-xs font-bold text-[#00BFFF] font-mono uppercase">{row.value}</span>
                  </div>
                ))}
              </div>
            </SectionBox>
          </div>
        </div>
      )}

      {/* ── Ad Setup ─────────────────────────────────────────────────────────── */}
      {tab === 'ad-setup' && (
        <div className="flex flex-col gap-5">
          <SectionBox title="🎯 Ad Provider">
            <div className="flex flex-col gap-3">
              {PROVIDER_OPTIONS.map(opt => (
                <label
                  key={opt.value}
                  className="flex items-start gap-3 cursor-pointer rounded-xl p-3.5 transition-all"
                  style={{
                    background: draft.adProvider === opt.value ? 'rgba(0,191,255,0.06)' : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${draft.adProvider === opt.value ? 'rgba(0,191,255,0.25)' : 'rgba(255,255,255,0.05)'}`,
                  }}
                >
                  <input
                    type="radio"
                    name="provider"
                    value={opt.value}
                    checked={draft.adProvider === opt.value}
                    onChange={() => patch('adProvider', opt.value as AdsConfig['adProvider'])}
                    className="mt-1 accent-[#00BFFF]"
                  />
                  <div>
                    <p className="text-sm font-semibold text-white">{opt.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </SectionBox>

          {draft.adProvider === 'adsense' && (
            <SectionBox title="📋 Google AdSense Settings">
              <div
                className="flex items-start gap-3 rounded-xl p-3.5 mb-1"
                style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)' }}
              >
                <span className="text-lg">⚠️</span>
                <div>
                  <p className="text-xs font-semibold text-amber-400">Before you start</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    You need a Google AdSense account with an approved site. Add your Publisher ID
                    and the AdSense script tag to your site's <code className="text-[#00BFFF]">&lt;head&gt;</code>.{' '}
                    <a href="https://support.google.com/adsense" target="_blank" rel="noopener" className="text-[#00BFFF] underline">AdSense Help ↗</a>
                  </p>
                </div>
              </div>
              <Field label="Publisher ID" desc='Format: ca-pub-XXXXXXXXXXXXXXXX'>
                <Input value={draft.adsensePublisherId} onChange={v => patch('adsensePublisherId', v)} placeholder="ca-pub-1234567890123456" />
              </Field>
              <Field label="Ad Slot ID" desc='The slot ID from your AdSense ad unit'>
                <Input value={draft.adsenseSlotId} onChange={v => patch('adsenseSlotId', v)} placeholder="1234567890" />
              </Field>
              <div className="text-[11px] text-gray-600 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <p className="font-semibold text-gray-500 mb-1">Add this to your &lt;head&gt; in <code>src/routes/__root.tsx</code>:</p>
                <code className="text-[#00BFFF] break-all">
                  {`<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${draft.adsensePublisherId || 'ca-pub-XXXX'}" crossorigin="anonymous"></script>`}
                </code>
              </div>
            </SectionBox>
          )}

          {draft.adProvider === 'custom' && (
            <SectionBox title="✏️ Custom Ad HTML">
              <p className="text-xs text-gray-500">
                Paste any ad network's embed code, an iframe, or custom HTML. It will be rendered inside the ad modal.
              </p>
              <Textarea
                value={draft.customAdHtml}
                onChange={v => patch('customAdHtml', v)}
                placeholder={'<iframe src="https://your-ad-network.com/ad?id=123" width="100%" height="250" frameborder="0"></iframe>'}
                rows={8}
              />
            </SectionBox>
          )}

          <SectionBox title="⏱️ Ad Duration">
            <Field label="Duration (seconds)" desc="How long the player must watch before they can continue.">
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={3} max={30}
                  value={draft.adDurationSeconds}
                  onChange={e => patch('adDurationSeconds', Number(e.target.value))}
                  className="flex-1 accent-[#00BFFF]"
                />
                <span
                  className="text-lg font-bold tabular-nums text-[#00BFFF] w-10 text-center"
                  style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                >
                  {draft.adDurationSeconds}s
                </span>
              </div>
            </Field>
          </SectionBox>
        </div>
      )}

      {/* ── Renew Button ─────────────────────────────────────────────────────── */}
      {tab === 'renew' && (
        <div className="flex flex-col gap-5">
          <SectionBox title="🔄 Renew Button Mode">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {RENEW_MODES.map(m => (
                <label
                  key={m.value}
                  className="flex items-start gap-3 cursor-pointer rounded-xl p-4 transition-all"
                  style={{
                    background: draft.renewMode === m.value ? `${m.color}0d` : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${draft.renewMode === m.value ? `${m.color}40` : 'rgba(255,255,255,0.05)'}`,
                  }}
                >
                  <input
                    type="radio"
                    name="renewMode"
                    value={m.value}
                    checked={draft.renewMode === m.value}
                    onChange={() => patch('renewMode', m.value as AdsConfig['renewMode'])}
                    className="mt-1"
                    style={{ accentColor: m.color }}
                  />
                  <div>
                    <p className="text-sm font-bold text-white">{m.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{m.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </SectionBox>

          <SectionBox title="📋 When to Show Ads">
            <div className="flex flex-col gap-4">
              <Toggle
                checked={draft.showAdOnExpired}
                onChange={v => patch('showAdOnExpired', v)}
                label="Show ad when mining is expired"
                desc='When the player clicks "⛏ Renew Mining" after expiry.'
              />
              <Toggle
                checked={draft.showAdOnEarlyRenew}
                onChange={v => patch('showAdOnEarlyRenew', v)}
                label="Show ad on early renew"
                desc='When the player clicks "⟳ Renew Early" while mining is still active.'
              />
            </div>
          </SectionBox>

          <SectionBox title="⏭️ Skip Settings">
            <div className="flex flex-col gap-4">
              <Toggle
                checked={draft.skipAllowed}
                onChange={v => patch('skipAllowed', v)}
                label="Allow players to skip the ad"
                desc="A skip button appears after the delay below. Skipping does not count as a completion."
              />
              {draft.skipAllowed && (
                <Field label="Skip available after (seconds)">
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={1} max={Math.max(1, draft.adDurationSeconds - 1)}
                      value={draft.skipAfterSeconds}
                      onChange={e => patch('skipAfterSeconds', Number(e.target.value))}
                      className="flex-1 accent-[#00BFFF]"
                    />
                    <span className="text-lg font-bold tabular-nums text-[#00BFFF] w-10 text-center font-['Space_Grotesk']">
                      {draft.skipAfterSeconds}s
                    </span>
                  </div>
                </Field>
              )}
            </div>
          </SectionBox>

          <SectionBox title="🎁 Reward on Completion">
            <div className="flex flex-col gap-4">
              <Toggle
                checked={draft.rewardOnComplete}
                onChange={v => patch('rewardOnComplete', v)}
                label="Give players a reward for watching the full ad"
                desc="Bonus currency credited after they click 'Complete & Renew'."
              />
              {draft.rewardOnComplete && (
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Reward Currency">
                    <select
                      value={draft.rewardType}
                      onChange={e => patch('rewardType', e.target.value as AdsConfig['rewardType'])}
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm text-white outline-none"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                      <option value="bluecoin">BlueCoin</option>
                      <option value="gems">Gems</option>
                    </select>
                  </Field>
                  <Field label="Amount">
                    <Input type="number" value={draft.rewardAmount} onChange={v => patch('rewardAmount', Number(v))} placeholder="100" />
                  </Field>
                </div>
              )}
            </div>
          </SectionBox>
        </div>
      )}

      {/* ── Page Ads ─────────────────────────────────────────────────────────── */}
      {tab === 'page-ads' && (
        <div className="flex flex-col gap-5">
          <SectionBox title="📄 Banner Ads per Page">
            <p className="text-xs text-gray-500">
              Enable a banner ad on specific pages. The banner HTML below is used on all enabled pages.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.keys(PAGE_LABELS).map(page => (
                <label
                  key={page}
                  className="flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all"
                  style={{
                    background: draft.pageAds[page] ? 'rgba(0,191,255,0.05)' : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${draft.pageAds[page] ? 'rgba(0,191,255,0.2)' : 'rgba(255,255,255,0.06)'}`,
                  }}
                >
                  <span className="text-sm text-white">{PAGE_LABELS[page]}</span>
                  <div className="relative">
                    <input type="checkbox" className="sr-only" checked={!!draft.pageAds[page]} onChange={e => patchPageAd(page, e.target.checked)} />
                    <div style={{ width: 36, height: 20, borderRadius: 10, background: draft.pageAds[page] ? 'linear-gradient(135deg,#00BFFF,#0066FF)' : 'rgba(255,255,255,0.08)', transition: 'background .2s' }} />
                    <div style={{ position: 'absolute', top: 2, left: draft.pageAds[page] ? 18 : 2, width: 16, height: 16, borderRadius: '50%', background: 'white', transition: 'left .2s' }} />
                  </div>
                </label>
              ))}
            </div>
          </SectionBox>

          <SectionBox title="🖼️ Banner Ad HTML">
            <Toggle
              checked={draft.bannerAdEnabled}
              onChange={v => patch('bannerAdEnabled', v)}
              label="Enable banner ads on selected pages"
              desc="Banner is rendered at the top of each enabled page."
            />
            {draft.bannerAdEnabled && (
              <Field label="Banner HTML" desc="Paste your ad network banner code, AdSense unit, or custom iframe.">
                <Textarea
                  value={draft.bannerAdHtml}
                  onChange={v => patch('bannerAdHtml', v)}
                  placeholder={'<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-XXXX" data-ad-slot="XXXX" data-ad-format="auto"></ins>'}
                  rows={6}
                />
              </Field>
            )}
          </SectionBox>
        </div>
      )}

      {/* ── Revenue ──────────────────────────────────────────────────────────── */}
      {tab === 'revenue' && (
        <div className="flex flex-col gap-5">
          <SectionBox title="💰 Revenue Settings">
            <Field label="Estimated RPM ($)" desc="Revenue per 1,000 ad impressions. Used for projections only — actual revenue comes from your ad network dashboard.">
              <div className="flex items-center gap-3">
                <span className="text-gray-500 text-sm">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={draft.estimatedRpm}
                  onChange={e => patch('estimatedRpm', parseFloat(e.target.value) || 0)}
                  className="flex-1 px-3.5 py-2.5 rounded-xl text-sm text-white outline-none"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                />
                <span className="text-gray-600 text-xs">per 1k views</span>
              </div>
            </Field>
          </SectionBox>

          <SectionBox title="📊 Revenue Calculator">
            <p className="text-xs text-gray-500">Estimate earnings at different impression volumes with your current RPM.</p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr>
                    {['Daily Impressions', 'Monthly Impressions', 'Est. Monthly Revenue', 'Est. Annual Revenue'].map(h => (
                      <th key={h} className="text-left py-2 px-3 text-gray-600 font-semibold uppercase tracking-widest border-b border-white/5">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[100, 500, 1000, 5000, 10000].map(daily => {
                    const monthly = daily * 30
                    const rev = (monthly / 1000) * draft.estimatedRpm
                    const annual = rev * 12
                    return (
                      <tr key={daily} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                        <td className="py-3 px-3 text-white font-medium tabular-nums">{daily.toLocaleString()}</td>
                        <td className="py-3 px-3 text-gray-400 tabular-nums">{monthly.toLocaleString()}</td>
                        <td className="py-3 px-3 text-green-400 font-bold tabular-nums">${rev.toFixed(2)}</td>
                        <td className="py-3 px-3 text-[#00BFFF] font-bold tabular-nums">${annual.toFixed(2)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </SectionBox>

          <SectionBox title="🔗 Ad Network Links">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { name: 'Google AdSense', url: 'https://www.google.com/adsense', desc: 'Most popular — great for content sites', icon: '🔵' },
                { name: 'Media.net',      url: 'https://www.media.net',          desc: 'Yahoo/Bing network, high RPM',          icon: '🟠' },
                { name: 'Ezoic',          url: 'https://www.ezoic.com',          desc: 'AI-optimised ad placement',              icon: '🟢' },
                { name: 'AdThrive',       url: 'https://www.adthrive.com',       desc: 'Premium publishers, top CPMs',           icon: '🟣' },
              ].map(n => (
                <a
                  key={n.name}
                  href={n.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 p-4 rounded-xl transition-all hover:bg-white/3"
                  style={{ border: '1px solid rgba(255,255,255,0.06)', textDecoration: 'none' }}
                >
                  <span className="text-xl">{n.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-white">{n.name} ↗</p>
                    <p className="text-xs text-gray-500 mt-0.5">{n.desc}</p>
                  </div>
                </a>
              ))}
            </div>
          </SectionBox>
        </div>
      )}

      {/* ── Analytics ────────────────────────────────────────────────────────── */}
      {tab === 'analytics' && (
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <StatCard icon="👁️" label="Impressions"    value={cfg.stats.totalImpressions.toLocaleString()} color="#00BFFF" />
            <StatCard icon="✅" label="Completions"    value={cfg.stats.totalCompletions.toLocaleString()} sub={`${ctr}% rate`} color="#22c55e" />
            <StatCard icon="⏭️" label="Skips"          value={cfg.stats.totalSkips.toLocaleString()} sub={`${skipRate}% rate`} color="#f59e0b" />
          </div>

          <SectionBox title="📋 Funnel Breakdown">
            <div className="flex flex-col gap-3">
              {[
                { label: 'Impressions (ad opened)',    value: cfg.stats.totalImpressions,  color: '#00BFFF' },
                { label: 'Completions (full watch)',   value: cfg.stats.totalCompletions,  color: '#22c55e' },
                { label: 'Skips',                      value: cfg.stats.totalSkips,         color: '#f59e0b' },
              ].map(row => {
                const pct = cfg.stats.totalImpressions > 0
                  ? (row.value / cfg.stats.totalImpressions) * 100
                  : 0
                return (
                  <div key={row.label} className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">{row.label}</span>
                      <span style={{ color: row.color }} className="font-bold tabular-nums">{row.value.toLocaleString()} ({pct.toFixed(1)}%)</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, background: row.color }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </SectionBox>

          <SectionBox title="💰 Revenue Breakdown">
            <div className="flex flex-col gap-3">
              {[
                { label: 'Estimated total earned',   value: `$${cfg.stats.estimatedRevenue.toFixed(4)}` },
                { label: 'Est. per impression',      value: `$${cfg.stats.totalImpressions > 0 ? (cfg.stats.estimatedRevenue / cfg.stats.totalImpressions).toFixed(6) : '0.000000'}` },
                { label: 'Active RPM setting',       value: `$${cfg.estimatedRpm.toFixed(2)}` },
                { label: 'Stats reset on',           value: cfg.stats.lastReset ? new Date(cfg.stats.lastReset).toLocaleDateString() : 'Never' },
              ].map(row => (
                <div key={row.label} className="flex justify-between items-center py-2.5 border-b border-white/5 last:border-0">
                  <span className="text-sm text-gray-500">{row.label}</span>
                  <span className="text-sm font-bold text-white tabular-nums">{row.value}</span>
                </div>
              ))}
            </div>
          </SectionBox>
        </div>
      )}

      {/* ── Advanced ─────────────────────────────────────────────────────────── */}
      {tab === 'advanced' && (
        <div className="flex flex-col gap-5">
          <SectionBox title="🔧 Global Controls">
            <div className="flex flex-col gap-4">
              <Toggle
                checked={draft.enabled}
                onChange={v => patch('enabled', v)}
                label="Global ad system enabled"
                desc="Master switch. When off, no ads are shown anywhere on the site — renew button reverts to free mode."
              />
            </div>
          </SectionBox>

          <SectionBox title="🔌 Integration Checklist">
            <div className="flex flex-col gap-3">
              {[
                {
                  label: 'AdSense script in <head>',
                  done: draft.adProvider !== 'adsense' || (!!draft.adsensePublisherId),
                  note: draft.adProvider === 'adsense' ? 'Add the <script> tag to src/routes/__root.tsx' : 'Only needed for AdSense',
                },
                {
                  label: 'Publisher ID configured',
                  done: draft.adProvider !== 'adsense' || !!draft.adsensePublisherId,
                  note: 'Set in Ad Setup → Google AdSense Settings',
                },
                {
                  label: 'Ad Slot ID configured',
                  done: draft.adProvider !== 'adsense' || !!draft.adsenseSlotId,
                  note: 'Set in Ad Setup → Google AdSense Settings',
                },
                {
                  label: 'Renew mode is not "free" or "disabled"',
                  done: draft.renewMode !== 'free' && draft.renewMode !== 'disabled',
                  note: 'Set in Renew Button tab',
                },
                {
                  label: 'Ad duration ≥ 5 seconds',
                  done: draft.adDurationSeconds >= 5,
                  note: 'Shorter durations may not count as valid impressions',
                },
              ].map(item => (
                <div key={item.label} className="flex items-start gap-3 py-2.5 border-b border-white/5 last:border-0">
                  <span className={`text-base mt-0.5 ${item.done ? 'text-green-400' : 'text-amber-400'}`}>{item.done ? '✅' : '⚠️'}</span>
                  <div>
                    <p className={`text-sm font-medium ${item.done ? 'text-white' : 'text-amber-300'}`}>{item.label}</p>
                    {!item.done && <p className="text-xs text-gray-500 mt-0.5">{item.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          </SectionBox>

          <div
            className="rounded-2xl border p-6 flex flex-col gap-4"
            style={{ borderColor: 'rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.03)' }}
          >
            <h3 className="text-sm font-bold text-red-400 flex items-center gap-2">🗑️ Danger Zone</h3>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 py-3 border-b border-white/5">
              <div>
                <p className="text-sm font-medium text-white">Reset All Statistics</p>
                <p className="text-xs text-gray-500 mt-0.5">Zeroes impressions, completions, skips, and revenue. Cannot be undone.</p>
              </div>
              <button
                onClick={handleReset}
                disabled={resetting}
                className="shrink-0 px-4 py-2 rounded-xl text-sm font-semibold text-red-400 border border-red-500/30 hover:bg-red-500/10 transition-all"
              >
                {resetting ? 'Resetting…' : '🗑️ Reset Stats'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Floating save bar ────────────────────────────────────────────────── */}
      {isDirty && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl"
          style={{ background: '#0f1520', border: '1px solid rgba(0,191,255,0.25)', boxShadow: '0 8px 32px rgba(0,0,0,0.6), 0 0 24px rgba(0,191,255,0.1)' }}
        >
          <span className="text-xs text-gray-400">Unsaved changes</span>
          <button
            onClick={() => setDraft(cfg)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-500 hover:text-white transition-colors"
          >
            Discard
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-1.5 rounded-lg text-xs font-bold text-white transition-all"
            style={{ background: 'linear-gradient(135deg,#00BFFF,#0066FF)', boxShadow: '0 0 12px rgba(0,191,255,0.3)' }}
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      )}
    </div>
  )
}
