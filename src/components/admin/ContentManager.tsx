import { useState } from 'react'
import { getSiteContent, saveSiteContent, resetSiteContent } from '../../store/contentStore'
import type { SiteContent } from '../../store/contentStore'
import { addLog } from '../../store/adminStore'

interface Props { admin: string }

function AdminToast({ msg, type }: { msg: string; type: 'success' | 'error' }) {
  return (
    <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl text-sm font-semibold shadow-xl border ${
      type === 'success'
        ? 'bg-green-500/15 border-green-500/30 text-green-400'
        : 'bg-red-500/15 border-red-500/30 text-red-400'
    }`}>
      {type === 'success' ? '✓ ' : '⚠ '}{msg}
    </div>
  )
}

export function ContentManager({ admin }: Props) {
  const defaults = getSiteContent()
  const [form, setForm] = useState<Required<SiteContent>>(defaults)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)

  function showToastMsg(msg: string, type: 'success' | 'error' = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  function handleSave() {
    saveSiteContent(form)
    addLog(admin, 'content:save', 'Updated site content settings')
    showToastMsg('Content saved. Navigate to the page to see changes.')
  }

  function handleReset() {
    resetSiteContent()
    setForm(getSiteContent())
    setShowConfirm(false)
    addLog(admin, 'content:reset', 'Reset site content to defaults')
    showToastMsg('Content reset to defaults.')
  }

  const fields: { key: keyof Required<SiteContent>; label: string; desc: string; placeholder: string; multiline?: boolean }[] = [
    { key: 'heroTitle',       label: 'Hero Title',        desc: 'Large heading on the homepage hero',   placeholder: 'BLUE TIERS' },
    { key: 'heroSubtitle',    label: 'Hero Subtitle',     desc: 'Tagline below the hero title',          placeholder: '#1 Tier List for all types of players.' },
    { key: 'serverIP',        label: 'Server IP',         desc: 'Minecraft server IP shown in hero + footer', placeholder: 'play.sennahosting.com' },
    { key: 'discordLink',     label: 'Discord Link',      desc: 'Discord invite URL (buttons + footer)', placeholder: 'https://discord.gg/...' },
    { key: 'footerCopyright', label: 'Footer Copyright',  desc: 'Copyright line at bottom of footer',   placeholder: '© 2024 Blue Tiers. All rights reserved.' },
    { key: 'footerTagline',   label: 'Footer Tagline',    desc: 'Second line at bottom of footer',      placeholder: 'Not affiliated with Mojang or Microsoft.' },
  ]

  return (
    <div className="space-y-6 max-w-2xl">
      {toast && <AdminToast msg={toast.msg} type={toast.type} />}

      <div className="glass rounded-2xl border border-white/8 p-6 space-y-6">
        <div>
          <h3 className="font-['Space_Grotesk'] font-bold text-white text-base mb-0.5">🏠 Homepage & Footer</h3>
          <p className="text-gray-600 text-xs">Changes take effect when users navigate to the page.</p>
        </div>

        <div className="space-y-4">
          {fields.map(f => (
            <div key={f.key}>
              <label className="block text-white text-sm font-semibold mb-1">{f.label}</label>
              <p className="text-gray-600 text-xs mb-2">{f.desc}</p>
              {f.multiline ? (
                <textarea
                  value={form[f.key]}
                  onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  rows={3}
                  className="w-full bg-white/3 border border-white/10 hover:border-white/20 focus:border-[#00BFFF]/40 rounded-xl px-4 py-3 text-white text-sm outline-none transition-all placeholder-gray-700 resize-none"
                />
              ) : (
                <input
                  type="text"
                  value={form[f.key]}
                  onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  className="w-full bg-white/3 border border-white/10 hover:border-white/20 focus:border-[#00BFFF]/40 rounded-xl px-4 py-3 text-white text-sm outline-none transition-all placeholder-gray-700"
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Live preview strip */}
      <div className="glass rounded-2xl border border-white/8 p-5">
        <h3 className="text-white font-semibold text-sm mb-3">👁 Preview</h3>
        <div className="space-y-2 text-sm">
          <div className="flex gap-3">
            <span className="text-gray-600 w-24 shrink-0">Hero title:</span>
            <span className="text-[#00BFFF] font-black font-['Space_Grotesk']">{form.heroTitle}</span>
          </div>
          <div className="flex gap-3">
            <span className="text-gray-600 w-24 shrink-0">Tagline:</span>
            <span className="text-gray-400">{form.heroSubtitle}</span>
          </div>
          <div className="flex gap-3">
            <span className="text-gray-600 w-24 shrink-0">Server IP:</span>
            <span className="font-mono text-[#00BFFF]">{form.serverIP}</span>
          </div>
          <div className="flex gap-3">
            <span className="text-gray-600 w-24 shrink-0">Discord:</span>
            <span className="text-gray-400 truncate">{form.discordLink}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <button onClick={handleSave} className="btn-primary px-6 py-2.5 rounded-xl text-sm font-semibold text-white">
          Save Content
        </button>
        <button onClick={() => setShowConfirm(true)} className="px-6 py-2.5 rounded-xl text-sm text-gray-400 border border-white/10 hover:border-white/20 hover:text-white transition-all">
          Reset to Defaults
        </button>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="glass rounded-2xl border border-orange-500/20 p-6 max-w-sm w-full text-center">
            <div className="text-4xl mb-3">📝</div>
            <h3 className="text-white font-bold text-lg mb-2">Reset Content?</h3>
            <p className="text-gray-500 text-sm mb-6">Site content will revert to hardcoded defaults.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(false)} className="flex-1 py-2.5 rounded-xl text-sm text-gray-400 border border-white/10">Cancel</button>
              <button onClick={handleReset} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-orange-400 border border-orange-500/30 bg-orange-500/10">Reset</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
