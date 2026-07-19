import { useState } from 'react'
import { getEventConfig, saveEventConfig, resetEventConfig } from '../../store/contentStore'
import type { EventConfig } from '../../data/event'
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

export function EventManager({ admin }: Props) {
  const [form, setForm] = useState<EventConfig>(getEventConfig)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)

  function showToastMsg(msg: string, type: 'success' | 'error' = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  function set(key: keyof EventConfig, value: string) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  function handleSave() {
    saveEventConfig(form)
    addLog(admin, 'event:save', `Updated event: "${form.title}"`)
    showToastMsg('Event config saved. Navigate to homepage to see changes.')
  }

  function handleReset() {
    resetEventConfig()
    setForm(getEventConfig())
    setShowConfirm(false)
    addLog(admin, 'event:reset', 'Reset event config to defaults')
    showToastMsg('Event config reset to defaults.')
  }

  const endDate = form.registrationEnds ? new Date(form.registrationEnds) : null
  const isExpired = endDate ? endDate <= new Date() : false

  return (
    <div className="space-y-6 max-w-2xl">
      {toast && <AdminToast msg={toast.msg} type={toast.type} />}

      {/* Status */}
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm border ${
        isExpired
          ? 'bg-red-500/8 border-red-500/20 text-red-400'
          : 'bg-green-500/8 border-green-500/20 text-green-400'
      }`}>
        <span className={`w-2 h-2 rounded-full ${isExpired ? 'bg-red-400' : 'bg-green-400 animate-pulse'}`} />
        <span>Event is currently <strong>{isExpired ? 'expired / closed' : 'active'}</strong></span>
        {!isExpired && endDate && (
          <span className="text-gray-600 text-xs ml-auto">
            Ends {endDate.toLocaleDateString()}
          </span>
        )}
      </div>

      <div className="glass rounded-2xl border border-white/8 p-6 space-y-5">
        <h3 className="font-['Space_Grotesk'] font-bold text-white text-base">🎉 Event Banner Settings</h3>

        {[
          { key: 'title' as const,             label: 'Banner Title',           desc: 'Large event name shown in the banner',       type: 'text', placeholder: 'Blue Network PvP World Cup' },
          { key: 'subtitle' as const,          label: 'Subtitle',               desc: 'Small text below the title (open phase)',    type: 'text', placeholder: 'Registrations are now open!' },
          { key: 'registrationEnds' as const,  label: 'Registration End Date',  desc: 'ISO 8601 date-time (UTC). When this passes, the banner shows closed state.', type: 'datetime-local', placeholder: '' },
          { key: 'buttonText' as const,        label: 'CTA Button Text',        desc: 'Text on the action button when open',        type: 'text', placeholder: 'Participate Now!' },
          { key: 'buttonLink' as const,        label: 'CTA Button Link',        desc: 'URL the button opens (usually Discord)',     type: 'url',  placeholder: 'https://discord.gg/...' },
          { key: 'closedButtonText' as const,  label: 'Closed Button Text',     desc: 'Button label shown after event closes',      type: 'text', placeholder: 'Registrations Closed' },
        ].map(f => {
          // Convert ISO to local datetime for the input
          let inputValue = form[f.key]
          if (f.type === 'datetime-local' && inputValue) {
            try {
              const d = new Date(inputValue)
              inputValue = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
                .toISOString().slice(0, 16)
            } catch { /* ignore */ }
          }
          return (
            <div key={f.key}>
              <label className="block text-white text-sm font-semibold mb-1">{f.label}</label>
              <p className="text-gray-600 text-xs mb-2">{f.desc}</p>
              <input
                type={f.type}
                value={inputValue}
                onChange={e => {
                  let val = e.target.value
                  if (f.type === 'datetime-local' && val) {
                    val = new Date(val).toISOString()
                  }
                  set(f.key, val)
                }}
                placeholder={f.placeholder}
                className="w-full bg-white/3 border border-white/10 hover:border-white/20 focus:border-[#00BFFF]/40 rounded-xl px-4 py-3 text-white text-sm outline-none transition-all placeholder-gray-700"
              />
            </div>
          )
        })}
      </div>

      {/* Preview */}
      <div className="glass rounded-2xl border border-white/8 p-5">
        <h3 className="text-white font-semibold text-sm mb-3">👁 Preview</h3>
        <div className="p-4 rounded-xl bg-gradient-to-r from-[#070b12] via-[#09152a] to-[#070b12] border border-[#00BFFF]/15">
          <p className="font-['Space_Grotesk'] font-black text-sm text-white uppercase tracking-widest">
            <span className="text-[#00BFFF]">{form.title.startsWith('Blue') ? 'Blue' : ''}</span>
            {form.title.startsWith('Blue') ? form.title.slice(4) : form.title}
          </p>
          <p className="text-gray-400 text-xs mt-0.5">{isExpired ? 'Registrations are now closed.' : form.subtitle}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button onClick={handleSave} className="btn-primary px-6 py-2.5 rounded-xl text-sm font-semibold text-white">
          Save Event Config
        </button>
        <button onClick={() => setShowConfirm(true)} className="px-6 py-2.5 rounded-xl text-sm text-gray-400 border border-white/10 hover:border-white/20 hover:text-white transition-all">
          Reset to Defaults
        </button>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="glass rounded-2xl border border-orange-500/20 p-6 max-w-sm w-full text-center">
            <div className="text-4xl mb-3">🎉</div>
            <h3 className="text-white font-bold text-lg mb-2">Reset Event Config?</h3>
            <p className="text-gray-500 text-sm mb-6">Event settings will revert to the defaults from event.ts.</p>
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
