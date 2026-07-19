import { useState } from 'react'
import { getEconomyOverrides, saveEconomyOverrides } from '../../store/miningStore'
import type { EconomyOverrides } from '../../store/miningStore'
import { MINING_CONSTANTS, EXCHANGE_CONSTANTS } from '../../data/mining'
import { addLog } from '../../store/adminStore'

interface Props { admin: string }

interface FieldDef {
  key: keyof EconomyOverrides
  label: string
  defaultVal: number
  min: number
  max: number
  step: number
  unit: string
  desc: string
  section: 'exchange' | 'mining'
}

const FIELDS: FieldDef[] = [
  // Exchange
  { key: 'BASE_RATE',          label: 'Base Rate',            defaultVal: EXCHANGE_CONSTANTS.BASE_RATE,           min: 1,    max: 10000, step: 1,     unit: 'Gems/BC',  desc: 'Centre-point of the exchange rate wave', section: 'exchange' },
  { key: 'MIN_RATE',           label: 'Min Rate',             defaultVal: EXCHANGE_CONSTANTS.MIN_RATE,            min: 1,    max: 9999,  step: 1,     unit: 'Gems/BC',  desc: 'Minimum rate the wave can reach',        section: 'exchange' },
  { key: 'MAX_RATE',           label: 'Max Rate',             defaultVal: EXCHANGE_CONSTANTS.MAX_RATE,            min: 2,    max: 10000, step: 1,     unit: 'Gems/BC',  desc: 'Maximum rate the wave can reach',        section: 'exchange' },
  { key: 'DAILY_TX_LIMIT',     label: 'Daily TX Limit',       defaultVal: EXCHANGE_CONSTANTS.DAILY_TX_LIMIT,      min: 1,    max: 100,   step: 1,     unit: 'trades/day', desc: 'Exchange transactions allowed per day', section: 'exchange' },
  { key: 'FEE_PCT',            label: 'Exchange Fee',         defaultVal: EXCHANGE_CONSTANTS.FEE_PCT,             min: 0,    max: 0.5,   step: 0.001, unit: '% (0-1)',  desc: 'Fee taken from each exchange output',    section: 'exchange' },
  // Mining
  { key: 'BLOCK_REWARD',       label: 'Block Reward',         defaultVal: MINING_CONSTANTS.BLOCK_REWARD,          min: 1,    max: 100000,step: 1,     unit: 'BC',       desc: 'BC distributed when a block is solved', section: 'mining' },
  { key: 'BLOCK_INTERVAL_MS',  label: 'Block Interval',       defaultVal: MINING_CONSTANTS.BLOCK_INTERVAL_MS,     min: 5000, max: 3600000,step:1000,  unit: 'ms',       desc: 'Time between block solutions',          section: 'mining' },
  { key: 'FINDER_BONUS_PCT',   label: 'Finder Bonus',         defaultVal: MINING_CONSTANTS.FINDER_BONUS_PCT,      min: 0,    max: 1,     step: 0.01,  unit: '% (0-1)',  desc: 'Fraction of reward for block finder',   section: 'mining' },
  { key: 'EQUAL_SPLIT_PCT',    label: 'Equal Split',          defaultVal: MINING_CONSTANTS.EQUAL_SPLIT_PCT,       min: 0,    max: 1,     step: 0.01,  unit: '% (0-1)',  desc: 'Fraction split equally among miners',   section: 'mining' },
  { key: 'HASHRATE_SHARE_PCT', label: 'Hashrate Share',       defaultVal: MINING_CONSTANTS.HASHRATE_SHARE_PCT,    min: 0,    max: 1,     step: 0.01,  unit: '% (0-1)',  desc: 'Fraction distributed by hashrate',      section: 'mining' },
  { key: 'STARTING_BALANCE',   label: 'Starting Balance',     defaultVal: MINING_CONSTANTS.STARTING_BALANCE,      min: 0,    max: 100000,step: 1,     unit: 'BC',       desc: 'BC given to new users on signup',       section: 'mining' },
]

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

export function EconomyManager({ admin }: Props) {
  const [overrides, setOverrides] = useState<EconomyOverrides>(getEconomyOverrides)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [showConfirm,   setShowConfirm]   = useState(false)

  function showToastMsg(msg: string, type: 'success' | 'error' = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  function getValue(key: keyof EconomyOverrides, def: number): number {
    const v = overrides[key]
    return v !== undefined ? v : def
  }

  function handleChange(key: keyof EconomyOverrides, val: string) {
    const num = parseFloat(val)
    setOverrides(prev => ({ ...prev, [key]: isNaN(num) ? undefined : num }))
  }

  function handleSave() {
    // Validate
    const fin = overrides.FINDER_BONUS_PCT ?? MINING_CONSTANTS.FINDER_BONUS_PCT
    const eq  = overrides.EQUAL_SPLIT_PCT  ?? MINING_CONSTANTS.EQUAL_SPLIT_PCT
    const hr  = overrides.HASHRATE_SHARE_PCT ?? MINING_CONSTANTS.HASHRATE_SHARE_PCT
    const sum = fin + eq + hr
    if (Math.abs(sum - 1) > 0.01) {
      showToastMsg(`Finder + Equal + Hashrate must sum to ~1.0 (currently ${sum.toFixed(2)})`, 'error')
      return
    }
    saveEconomyOverrides(overrides)
    addLog(admin, 'economy:save', `Saved ${Object.keys(overrides).filter(k => (overrides as any)[k] !== undefined).length} overrides`)
    showToastMsg('Economy settings saved. Takes effect immediately.')
  }

  function handleReset() {
    saveEconomyOverrides({})
    setOverrides({})
    setShowConfirm(false)
    addLog(admin, 'economy:reset', 'Reset all economy overrides to defaults')
    showToastMsg('Economy reset to defaults.')
  }

  const sections = ['exchange', 'mining'] as const
  const hasOverrides = Object.values(overrides).some(v => v !== undefined)

  return (
    <div className="space-y-6 max-w-3xl">
      {toast && <AdminToast msg={toast.msg} type={toast.type} />}

      {/* Override status banner */}
      {hasOverrides && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-orange-500/8 border border-orange-500/20 text-orange-400 text-sm">
          <span>⚠</span>
          <span>Economy overrides are active. Default values are shown in grey.</span>
        </div>
      )}

      {sections.map(sec => (
        <div key={sec} className="glass rounded-2xl border border-white/8 p-6 space-y-5">
          <h3 className="font-['Space_Grotesk'] font-bold text-white text-base capitalize">
            {sec === 'exchange' ? '💱 Exchange Settings' : '⛏️ Mining Settings'}
          </h3>
          <div className="grid gap-5">
            {FIELDS.filter(f => f.section === sec).map(field => {
              const isOverridden = overrides[field.key] !== undefined
              const current = getValue(field.key, field.defaultVal)
              return (
                <div key={field.key} className="grid grid-cols-1 sm:grid-cols-[1fr_180px] gap-2 items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <label className="text-white text-sm font-semibold">{field.label}</label>
                      {isOverridden && (
                        <span className="text-[10px] bg-orange-500/15 text-orange-400 border border-orange-500/20 px-1.5 py-0.5 rounded-full">override</span>
                      )}
                    </div>
                    <p className="text-gray-600 text-xs mt-0.5">{field.desc}</p>
                    <p className="text-gray-700 text-[10px] mt-0.5">
                      Default: {field.defaultVal} {field.unit}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={current}
                      min={field.min}
                      max={field.max}
                      step={field.step}
                      onChange={e => handleChange(field.key, e.target.value)}
                      className={`flex-1 bg-white/3 border rounded-xl px-3 py-2 text-sm outline-none transition-all ${
                        isOverridden
                          ? 'border-orange-500/30 text-orange-300 focus:border-orange-500/60'
                          : 'border-white/10 text-white focus:border-[#00BFFF]/40'
                      }`}
                    />
                    <span className="text-gray-600 text-xs shrink-0 w-12">{field.unit}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {/* Sum reminder */}
      <div className="px-4 py-3 rounded-xl bg-blue-500/5 border border-blue-500/15 text-xs text-gray-500">
        <strong className="text-gray-400">Note:</strong> Finder Bonus + Equal Split + Hashrate Share must sum to 1.0.
        Current sum: <strong className={Math.abs(
          (overrides.FINDER_BONUS_PCT ?? MINING_CONSTANTS.FINDER_BONUS_PCT) +
          (overrides.EQUAL_SPLIT_PCT ?? MINING_CONSTANTS.EQUAL_SPLIT_PCT) +
          (overrides.HASHRATE_SHARE_PCT ?? MINING_CONSTANTS.HASHRATE_SHARE_PCT) - 1
        ) < 0.01 ? 'text-green-400' : 'text-red-400'}>
          {(
            (overrides.FINDER_BONUS_PCT ?? MINING_CONSTANTS.FINDER_BONUS_PCT) +
            (overrides.EQUAL_SPLIT_PCT ?? MINING_CONSTANTS.EQUAL_SPLIT_PCT) +
            (overrides.HASHRATE_SHARE_PCT ?? MINING_CONSTANTS.HASHRATE_SHARE_PCT)
          ).toFixed(2)}
        </strong>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <button onClick={handleSave} className="btn-primary px-6 py-2.5 rounded-xl text-sm font-semibold text-white">
          Save Changes
        </button>
        <button onClick={() => setShowConfirm(true)} className="px-6 py-2.5 rounded-xl text-sm text-gray-400 border border-white/10 hover:border-white/20 hover:text-white transition-all">
          Reset to Defaults
        </button>
      </div>

      {/* Confirm reset */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="glass rounded-2xl border border-orange-500/20 p-6 max-w-sm w-full text-center">
            <div className="text-4xl mb-3">⚙️</div>
            <h3 className="text-white font-bold text-lg mb-2">Reset Economy?</h3>
            <p className="text-gray-500 text-sm mb-6">All custom economy values will revert to their coded defaults.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(false)} className="flex-1 py-2.5 rounded-xl text-sm text-gray-400 border border-white/10 hover:bg-white/5">Cancel</button>
              <button onClick={handleReset} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-orange-400 border border-orange-500/30 bg-orange-500/10 hover:bg-orange-500/20">Reset</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
