import { useState } from 'react'
import { getGamemodes, saveGamemodes, resetGamemodes } from '../../store/playersStore'
import type { Gamemode } from '../../data/gamemodes'
import type { PlayerRanks } from '../../data/players'
import { addLog } from '../../store/adminStore'

interface Props { admin: string }

const GAMEMODE_KEYS: (keyof PlayerRanks)[] = ['mace','sword','axe','crystal','uhc','nethpot','diapot']

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

const BLANK_GAMEMODE: Omit<Gamemode, 'key'> & { key: keyof PlayerRanks | '' } = {
  key: '',
  label: '',
  icon: '',
  fallback: '🎮',
}

export function GamemodeManager({ admin }: Props) {
  const [modes, setModes]       = useState<Gamemode[]>(getGamemodes)
  const [editing, setEditing]   = useState<Gamemode | null>(null)
  const [isNew, setIsNew]       = useState(false)
  const [toast, setToast]       = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [showConfirmReset, setShowConfirmReset] = useState(false)

  function showToastMsg(msg: string, type: 'success' | 'error' = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  function persist(updated: Gamemode[]) {
    setModes(updated)
    saveGamemodes(updated)
  }

  function handleSaveEdit() {
    if (!editing) return
    if (!editing.key || !editing.label) {
      showToastMsg('Key and label are required.', 'error')
      return
    }
    if (isNew && modes.find(m => m.key === editing.key)) {
      showToastMsg('A gamemode with this key already exists.', 'error')
      return
    }
    const updated = isNew
      ? [...modes, editing]
      : modes.map(m => m.key === editing.key ? editing : m)
    persist(updated)
    addLog(admin, isNew ? 'gamemode:add' : 'gamemode:edit', `${editing.label} (${editing.key})`)
    setEditing(null)
    showToastMsg(`Gamemode "${editing.label}" ${isNew ? 'added' : 'updated'}.`)
  }

  function handleDelete(key: string) {
    const gm = modes.find(m => m.key === key)
    persist(modes.filter(m => m.key !== key))
    setDeleteTarget(null)
    addLog(admin, 'gamemode:delete', `Deleted ${gm?.label ?? key}`)
    showToastMsg(`Gamemode deleted.`)
  }

  function moveUp(key: string) {
    const idx = modes.findIndex(m => m.key === key)
    if (idx === 0) return
    const updated = [...modes]
    ;[updated[idx - 1], updated[idx]] = [updated[idx], updated[idx - 1]]
    persist(updated)
  }

  function moveDown(key: string) {
    const idx = modes.findIndex(m => m.key === key)
    if (idx === modes.length - 1) return
    const updated = [...modes]
    ;[updated[idx], updated[idx + 1]] = [updated[idx + 1], updated[idx]]
    persist(updated)
  }

  function handleReset() {
    resetGamemodes()
    setModes(getGamemodes())
    setShowConfirmReset(false)
    addLog(admin, 'gamemode:edit', 'Reset gamemodes to defaults')
    showToastMsg('Gamemodes reset to defaults.')
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {toast && <AdminToast msg={toast.msg} type={toast.type} />}

      <div className="flex gap-3">
        <button
          onClick={() => { setEditing({ ...(BLANK_GAMEMODE as Gamemode) }); setIsNew(true) }}
          className="btn-primary px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
        >
          + Add Gamemode
        </button>
        <button
          onClick={() => setShowConfirmReset(true)}
          className="px-5 py-2.5 rounded-xl text-sm text-gray-400 border border-white/10 hover:border-white/20 hover:text-white transition-all"
        >
          Reset to Defaults
        </button>
      </div>

      {/* Gamemode list */}
      <div className="glass rounded-2xl border border-white/8 divide-y divide-white/5 overflow-hidden">
        {modes.length === 0 && (
          <div className="py-12 text-center text-gray-600 text-sm">No gamemodes configured.</div>
        )}
        {modes.map((gm, i) => (
          <div key={gm.key} className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/2 transition-colors">
            {/* Reorder */}
            <div className="flex flex-col gap-0.5">
              <button onClick={() => moveUp(gm.key)} disabled={i === 0} className="text-gray-700 hover:text-white disabled:opacity-20 text-xs leading-none px-0.5">▲</button>
              <button onClick={() => moveDown(gm.key)} disabled={i === modes.length - 1} className="text-gray-700 hover:text-white disabled:opacity-20 text-xs leading-none px-0.5">▼</button>
            </div>
            {/* Icon */}
            {gm.icon ? (
              <img src={gm.icon} alt={gm.label} className="w-7 h-7 rounded-md object-contain" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
            ) : (
              <span className="text-xl w-7 text-center">{gm.fallback}</span>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold">{gm.label}</p>
              <p className="text-gray-600 text-xs font-mono">key: {gm.key} · {gm.icon}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { setEditing({ ...gm }); setIsNew(false) }}
                className="px-3 py-1.5 rounded-lg text-xs text-[#00BFFF] border border-[#00BFFF]/20 hover:bg-[#00BFFF]/10 transition-all"
              >
                Edit
              </button>
              <button
                onClick={() => setDeleteTarget(gm.key)}
                className="px-3 py-1.5 rounded-lg text-xs text-red-400 border border-red-500/20 hover:bg-red-500/10 transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="glass rounded-2xl border border-white/10 p-6 w-full max-w-md space-y-4">
            <h3 className="text-white font-bold text-lg">{isNew ? 'Add Gamemode' : `Edit: ${editing.label}`}</h3>

            <div>
              <label className="text-xs text-gray-500 uppercase tracking-widest block mb-1.5">Data Key</label>
              {isNew ? (
                <select
                  value={editing.key}
                  onChange={e => setEditing(prev => prev ? { ...prev, key: e.target.value as keyof PlayerRanks } : prev)}
                  className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#00BFFF]/40"
                >
                  <option value="" className="bg-[#0B0F17]">— select key —</option>
                  {GAMEMODE_KEYS.map(k => (
                    <option key={k} value={k} disabled={!!modes.find(m => m.key === k)} className="bg-[#0B0F17]">{k}</option>
                  ))}
                </select>
              ) : (
                <input value={editing.key} readOnly className="w-full bg-white/5 border border-white/8 rounded-xl px-4 py-2.5 text-gray-400 text-sm" />
              )}
            </div>

            {[
              { key: 'label',    label: 'Display Label', placeholder: 'Sword' },
              { key: 'icon',     label: 'Icon Path',     placeholder: '/icons/Sword.png' },
              { key: 'fallback', label: 'Fallback Emoji', placeholder: '⚔' },
            ].map(f => (
              <div key={f.key}>
                <label className="text-xs text-gray-500 uppercase tracking-widest block mb-1.5">{f.label}</label>
                <input
                  type="text"
                  value={(editing as any)[f.key]}
                  onChange={e => setEditing(prev => prev ? { ...prev, [f.key]: e.target.value } : prev)}
                  placeholder={f.placeholder}
                  className="w-full bg-white/3 border border-white/10 hover:border-white/20 focus:border-[#00BFFF]/40 rounded-xl px-4 py-2.5 text-white text-sm outline-none transition-all placeholder-gray-700"
                />
              </div>
            ))}

            <div className="flex gap-3 pt-2">
              <button onClick={() => setEditing(null)} className="flex-1 py-2.5 rounded-xl text-sm text-gray-400 border border-white/10 hover:bg-white/5">Cancel</button>
              <button onClick={handleSaveEdit} className="flex-1 py-2.5 rounded-xl text-sm font-semibold btn-primary text-white">
                {isNew ? 'Add Gamemode' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="glass rounded-2xl border border-red-500/20 p-6 max-w-sm w-full text-center">
            <div className="text-4xl mb-3">🎮</div>
            <h3 className="text-white font-bold text-lg mb-2">Delete Gamemode?</h3>
            <p className="text-gray-500 text-sm mb-6">This removes <strong className="text-white">"{modes.find(m => m.key === deleteTarget)?.label}"</strong> from the list. Player ranks for this gamemode remain in the data.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2.5 rounded-xl text-sm text-gray-400 border border-white/10">Cancel</button>
              <button onClick={() => handleDelete(deleteTarget)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-red-400 border border-red-500/30 bg-red-500/10">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Reset confirm */}
      {showConfirmReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="glass rounded-2xl border border-orange-500/20 p-6 max-w-sm w-full text-center">
            <div className="text-4xl mb-3">🎮</div>
            <h3 className="text-white font-bold text-lg mb-2">Reset Gamemodes?</h3>
            <p className="text-gray-500 text-sm mb-6">All custom gamemode configuration will revert to the defaults in gamemodes.ts.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirmReset(false)} className="flex-1 py-2.5 rounded-xl text-sm text-gray-400 border border-white/10">Cancel</button>
              <button onClick={handleReset} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-orange-400 border border-orange-500/30 bg-orange-500/10">Reset</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
