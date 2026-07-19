// ─── Mining Grand Section ─────────────────────────────────────────────────────
// Reads and writes exclusively through server functions (getAllMiningUsers /
// adminUpdateMiningUser). Subscribes to SSE so any change — from the mining
// page, another admin session, or a tick — appears here within milliseconds.

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { getAllMiningUsers, adminUpdateMiningUser, adminRenewMining, adminAdjustRenewal, adminResetRenewal } from '../../server/miningServer'
import { RIG_TIERS } from '../../data/mining'
import type { User, UserRig, RigStatus } from '../../data/mining'
import { addLog } from '../../store/adminStore'

interface Props { admin: string }

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(ms: number): string {
  const s = Math.floor((Date.now() - ms) / 1000)
  if (s < 5)   return 'just now'
  if (s < 60)  return `${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60)  return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24)  return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

function activeHashrate(user: User): number {
  return user.rigs
    .filter(r => r.status === 'mining')
    .reduce((sum, r) => {
      const tier = RIG_TIERS.find(t => t.id === r.tierId)
      return sum + (tier?.hashrate ?? 0)
    }, 0)
}

function userStatus(user: User): 'mining' | 'idle' | 'broken' | 'inactive' {
  if (user.rigs.some(r => r.status === 'mining')) return 'mining'
  if (user.rigs.some(r => r.status === 'broken')) return 'broken'
  if (user.rigs.length > 0) return 'idle'
  return 'inactive'
}

const STATUS_STYLE = {
  mining:   'text-green-400 bg-green-500/10 border-green-500/25',
  idle:     'text-gray-400 bg-white/5 border-white/10',
  broken:   'text-red-400 bg-red-500/10 border-red-500/25',
  inactive: 'text-gray-600 bg-white/3 border-white/5',
}

function StatusBadge({ status }: { status: 'mining' | 'idle' | 'broken' | 'inactive' }) {
  const labels = { mining: '⛏ Mining', idle: '— Idle', broken: '✕ Broken', inactive: '· No rigs' }
  return (
    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${STATUS_STYLE[status]}`}>
      {labels[status]}
    </span>
  )
}

function Toast({ msg, type }: { msg: string; type: 'success' | 'error' }) {
  return (
    <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl text-sm font-semibold shadow-xl border ${
      type === 'success' ? 'bg-green-500/15 border-green-500/30 text-green-400'
                        : 'bg-red-500/15 border-red-500/30 text-red-400'
    }`}>
      {type === 'success' ? '✓ ' : '⚠ '}{msg}
    </div>
  )
}

function StatCard({
  label, value, sub, color = 'text-white',
}: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="glass rounded-xl border border-white/8 px-4 py-3">
      <p className="text-[9px] uppercase tracking-widest text-gray-600 mb-1">{label}</p>
      <p className={`font-['Space_Grotesk'] font-black text-xl ${color}`}>{value}</p>
      {sub && <p className="text-gray-700 text-[10px] mt-0.5">{sub}</p>}
    </div>
  )
}

// ─── User Detail Panel ────────────────────────────────────────────────────────

function UserDetailPanel({
  user,
  admin,
  onUpdate,
  onClose,
}: {
  user: User
  admin: string
  onUpdate: (u: User) => void
  onClose: () => void
}) {
  const [tab,       setTab]       = useState<'balance' | 'rigs' | 'history' | 'renewal'>('balance')
  const [bcAmt,     setBcAmt]     = useState('')
  const [gemAmt,    setGemAmt]    = useState('')
  const [giveTier,  setGiveTier]  = useState(RIG_TIERS[0]?.id ?? '')
  const [adjustMin, setAdjustMin] = useState('')
  const [saving,    setSaving]    = useState(false)
  const [toast,     setToast]     = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  function showMsg(msg: string, type: 'success' | 'error' = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  async function persist(updated: User, logAction: string, logMsg: string) {
    setSaving(true)
    try {
      await adminUpdateMiningUser({ data: { user: updated } })
      addLog(admin, logAction, logMsg)
      onUpdate(updated)
      showMsg(logMsg)
    } catch {
      showMsg('Save failed — server error', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleBC(dir: 'give' | 'take') {
    const amt = parseFloat(bcAmt)
    if (isNaN(amt) || amt <= 0) { showMsg('Enter a valid positive amount.', 'error'); return }
    const newBalance = dir === 'give' ? user.balance + amt : Math.max(0, user.balance - amt)
    const updated = { ...user, balance: newBalance }
    await persist(updated, `mining:${dir}`, `${dir === 'give' ? '+' : '-'}${amt} BC ${dir === 'give' ? 'to' : 'from'} ${user.username}`)
    setBcAmt('')
  }

  async function handleGems(dir: 'give' | 'take') {
    const amt = parseFloat(gemAmt)
    if (isNaN(amt) || amt <= 0) { showMsg('Enter a valid positive amount.', 'error'); return }
    const newGems = dir === 'give' ? (user.gems ?? 0) + amt : Math.max(0, (user.gems ?? 0) - amt)
    const updated = { ...user, gems: newGems }
    await persist(updated, `mining:${dir}`, `${dir === 'give' ? '+' : '-'}${amt} Gems ${dir === 'give' ? 'to' : 'from'} ${user.username}`)
    setGemAmt('')
  }

  async function handleGiveRig() {
    const tier = RIG_TIERS.find(t => t.id === giveTier)
    if (!tier) return
    const rig: UserRig = {
      id: `${tier.id}_admin_${Date.now().toString(36)}`,
      tierId: tier.id,
      name: tier.name,
      durability: tier.maxDurability,
      status: 'idle' as RigStatus,
      miningSince: null,
      purchasedAt: Date.now(),
    }
    const updated = { ...user, rigs: [...user.rigs, rig] }
    await persist(updated, 'mining:give', `Gave ${tier.name} rig to ${user.username}`)
  }

  async function handleRepairRig(rigId: string) {
    const rig  = user.rigs.find(r => r.id === rigId); if (!rig) return
    const tier = RIG_TIERS.find(t => t.id === rig.tierId)!
    const updated = {
      ...user,
      rigs: user.rigs.map(r =>
        r.id === rigId ? { ...r, durability: tier.maxDurability, status: 'idle' as RigStatus, miningSince: null } : r
      ),
    }
    await persist(updated, 'mining:give', `Repaired ${rig.name} for ${user.username}`)
  }

  async function handleBreakRig(rigId: string) {
    const rig = user.rigs.find(r => r.id === rigId); if (!rig) return
    const updated = {
      ...user,
      rigs: user.rigs.map(r =>
        r.id === rigId ? { ...r, durability: 0, status: 'broken' as RigStatus, miningSince: null } : r
      ),
    }
    await persist(updated, 'mining:take', `Broke ${rig.name} for ${user.username}`)
  }

  async function handleDeleteRig(rigId: string) {
    const rig = user.rigs.find(r => r.id === rigId); if (!rig) return
    const updated = { ...user, rigs: user.rigs.filter(r => r.id !== rigId) }
    await persist(updated, 'mining:take', `Removed ${rig.name} from ${user.username}`)
  }

  const status  = userStatus(user)
  const mhRate  = activeHashrate(user)
  const durPctOf = (rig: UserRig) => {
    const tier = RIG_TIERS.find(t => t.id === rig.tierId)!
    return Math.round((rig.durability / tier.maxDurability) * 100)
  }

  return (
    <div className="glass rounded-2xl border border-[#00BFFF]/20 overflow-hidden">
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      {/* Header */}
      <div className="px-6 py-4 border-b border-white/5 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-[#00BFFF]/10 border border-[#00BFFF]/20 flex items-center justify-center text-lg font-black text-[#00BFFF]">
          {user.username[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-bold text-sm leading-tight">{user.username}</p>
          <p className="text-gray-600 text-[10px] mt-0.5">
            Joined {new Date(user.createdAt).toLocaleDateString()} · Last active {timeAgo(user.lastCheckedAt)}
          </p>
        </div>
        <StatusBadge status={status} />
        <button onClick={onClose} className="text-gray-600 hover:text-white text-lg transition-colors">✕</button>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-4 divide-x divide-white/5 border-b border-white/5">
        {[
          { label: 'BlueCoin', value: Math.floor(user.balance).toLocaleString() + ' BC', color: 'text-amber-400' },
          { label: 'Gems',     value: Math.floor(user.gems ?? 0).toLocaleString() + ' 💎', color: 'text-purple-400' },
          { label: 'Rigs',     value: `${user.rigs.filter(r => r.status === 'mining').length} / ${user.rigs.length}`, color: 'text-[#00BFFF]' },
          { label: 'Hashrate', value: mhRate > 0 ? `${mhRate} MH/s` : '—', color: mhRate > 0 ? 'text-green-400' : 'text-gray-600' },
        ].map(s => (
          <div key={s.label} className="px-4 py-3 text-center">
            <p className="text-[9px] uppercase tracking-widest text-gray-600 mb-0.5">{s.label}</p>
            <p className={`font-['Space_Grotesk'] font-black text-base ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/5">
        {(['balance', 'rigs', 'history', 'renewal'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 text-xs font-semibold capitalize transition-all ${
              tab === t
                ? 'text-[#00BFFF] border-b-2 border-[#00BFFF]'
                : 'text-gray-600 hover:text-gray-400'
            }`}
          >
            {t === 'balance' ? '💰 Balance' : t === 'rigs' ? '⛏️ Rigs' : t === 'history' ? '📜 History' : '⏱ Renewal'}
          </button>
        ))}
      </div>

      <div className="p-5 space-y-4">

        {/* Balance tab */}
        {tab === 'balance' && (
          <>
            {/* BC */}
            <div className="space-y-2">
              <p className="text-white text-xs font-bold">💰 BlueCoin Operations</p>
              <div className="flex gap-2">
                <input
                  type="number" min="0" step="any" value={bcAmt}
                  onChange={e => setBcAmt(e.target.value)}
                  placeholder="Amount (BC)"
                  className="flex-1 bg-white/3 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#00BFFF]/40 placeholder-gray-700"
                />
                <button
                  disabled={saving}
                  onClick={() => handleBC('give')}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-green-400 border border-green-500/20 bg-green-500/8 hover:bg-green-500/15 transition-all disabled:opacity-40"
                >
                  + Give
                </button>
                <button
                  disabled={saving}
                  onClick={() => handleBC('take')}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-red-400 border border-red-500/20 bg-red-500/8 hover:bg-red-500/15 transition-all disabled:opacity-40"
                >
                  − Take
                </button>
              </div>
            </div>

            {/* Gems */}
            <div className="space-y-2">
              <p className="text-white text-xs font-bold">💎 Gems Operations</p>
              <div className="flex gap-2">
                <input
                  type="number" min="0" step="any" value={gemAmt}
                  onChange={e => setGemAmt(e.target.value)}
                  placeholder="Amount (Gems)"
                  className="flex-1 bg-white/3 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#00BFFF]/40 placeholder-gray-700"
                />
                <button
                  disabled={saving}
                  onClick={() => handleGems('give')}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-green-400 border border-green-500/20 bg-green-500/8 hover:bg-green-500/15 transition-all disabled:opacity-40"
                >
                  + Give
                </button>
                <button
                  disabled={saving}
                  onClick={() => handleGems('take')}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-red-400 border border-red-500/20 bg-red-500/8 hover:bg-red-500/15 transition-all disabled:opacity-40"
                >
                  − Take
                </button>
              </div>
            </div>

            {/* Exchange info */}
            <div className="rounded-xl border border-white/5 bg-white/2 px-4 py-3 text-[11px] text-gray-500 leading-relaxed">
              Exchange used today: <span className="text-gray-300 font-semibold">{user.exchangeUsedToday}</span> transactions
              {' · '}Resets: <span className="text-gray-300 font-semibold">{new Date(user.exchangeResetAt).toLocaleString()}</span>
            </div>
          </>
        )}

        {/* Rigs tab */}
        {tab === 'rigs' && (
          <>
            {/* Give rig */}
            <div className="space-y-2">
              <p className="text-white text-xs font-bold">⛏️ Give Rig</p>
              <div className="flex gap-2">
                <select
                  value={giveTier}
                  onChange={e => setGiveTier(e.target.value)}
                  className="flex-1 bg-white/3 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#00BFFF]/40"
                >
                  {RIG_TIERS.map(t => (
                    <option key={t.id} value={t.id} className="bg-[#0B0F17]">
                      {t.emoji} {t.name} — {t.hashrate} MH/s · {t.cost} BC
                    </option>
                  ))}
                </select>
                <button
                  disabled={saving}
                  onClick={handleGiveRig}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-[#00BFFF] border border-[#00BFFF]/20 bg-[#00BFFF]/8 hover:bg-[#00BFFF]/15 transition-all disabled:opacity-40"
                >
                  Give Rig
                </button>
              </div>
            </div>

            {/* Rigs list */}
            {user.rigs.length === 0 ? (
              <p className="text-gray-700 text-sm text-center py-4">No rigs owned.</p>
            ) : (
              <div className="rounded-xl border border-white/8 overflow-hidden divide-y divide-white/5">
                {user.rigs.map(rig => {
                  const tier   = RIG_TIERS.find(t => t.id === rig.tierId)!
                  const durPct = durPctOf(rig)
                  return (
                    <div key={rig.id} className="flex items-center gap-3 px-4 py-3 hover:bg-white/2 transition-colors">
                      <span className="text-lg">{tier?.emoji ?? '⛏'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-xs font-semibold">{rig.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <div className="flex-1 h-1 bg-white/5 rounded-full max-w-[80px]">
                            <div
                              className={`h-1 rounded-full transition-all ${
                                durPct > 60 ? 'bg-green-400' : durPct > 25 ? 'bg-amber-400' : 'bg-red-400'
                              }`}
                              style={{ width: `${durPct}%` }}
                            />
                          </div>
                          <span className="text-gray-600 text-[10px]">{durPct}%</span>
                          <span className={`text-[10px] font-semibold ${
                            rig.status === 'mining' ? 'text-green-400' :
                            rig.status === 'broken' ? 'text-red-400' : 'text-gray-500'
                          }`}>{rig.status}</span>
                        </div>
                      </div>
                      <div className="flex gap-1.5">
                        {rig.status !== 'broken' && (
                          <button
                            onClick={() => handleBreakRig(rig.id)}
                            disabled={saving}
                            className="px-2 py-1 rounded-lg text-[10px] text-red-400 border border-red-500/20 hover:bg-red-500/10 disabled:opacity-40 transition-all"
                          >Break</button>
                        )}
                        {(rig.status === 'broken' || durPct < 100) && (
                          <button
                            onClick={() => handleRepairRig(rig.id)}
                            disabled={saving}
                            className="px-2 py-1 rounded-lg text-[10px] text-green-400 border border-green-500/20 hover:bg-green-500/10 disabled:opacity-40 transition-all"
                          >Repair</button>
                        )}
                        <button
                          onClick={() => handleDeleteRig(rig.id)}
                          disabled={saving}
                          className="px-2 py-1 rounded-lg text-[10px] text-gray-500 border border-white/10 hover:text-red-400 hover:border-red-500/20 disabled:opacity-40 transition-all"
                        >Remove</button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {/* History tab */}
        {tab === 'history' && (
          <>
            {user.rewardHistory.length === 0 ? (
              <p className="text-gray-700 text-sm text-center py-4">No block rewards yet.</p>
            ) : (
              <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
                {user.rewardHistory.slice(0, 50).map((r, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/2 border border-white/5">
                    <div>
                      <span className="text-white text-xs font-semibold">Block #{r.blockNumber}</span>
                      <span className="text-gray-600 text-[10px] ml-2">{r.type.replace('_', ' ')}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-amber-400 text-xs font-bold">+{r.amount} BC</span>
                      <p className="text-gray-700 text-[10px]">{new Date(r.solvedAt).toLocaleTimeString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="text-gray-700 text-[10px] text-center">
              Total earned: <span className="text-amber-400 font-semibold">
                {user.rewardHistory.reduce((s, r) => s + r.amount, 0).toLocaleString()} BC
              </span> across {user.rewardHistory.length} blocks (last 50)
            </div>
          </>
        )}

        {/* Renewal tab */}
        {tab === 'renewal' && (() => {
          const now       = Date.now()
          const expiresAt = user.miningExpiresAt
          const isActive  = expiresAt !== null && expiresAt > now
          const msLeft    = expiresAt ? Math.max(0, expiresAt - now) : 0
          const hLeft     = Math.floor(msLeft / 3_600_000)
          const mLeft     = Math.floor((msLeft % 3_600_000) / 60_000)

          async function handleAdminRenew() {
            setSaving(true)
            try {
              await adminRenewMining({ data: { username: user.username } })
              addLog(admin, 'mining:renewal', `Renewed mining session for ${user.username}`)
              onUpdate({ ...user, miningExpiresAt: now + 12 * 3_600_000, miningRenewedAt: now })
              showMsg(`Mining renewed for ${user.username}`)
            } catch { showMsg('Save failed', 'error') }
            finally { setSaving(false) }
          }

          async function handleAdjust(sign: 1 | -1) {
            const mins = parseFloat(adjustMin)
            if (isNaN(mins) || mins <= 0) { showMsg('Enter a valid number of minutes.', 'error'); return }
            const deltaMs = sign * mins * 60_000
            setSaving(true)
            try {
              await adminAdjustRenewal({ data: { username: user.username, deltaMs } })
              addLog(admin, 'mining:renewal', `${sign > 0 ? 'Extended' : 'Reduced'} renewal by ${mins}m for ${user.username}`)
              const newExpiry = Math.max(now, (user.miningExpiresAt ?? now) + deltaMs)
              onUpdate({ ...user, miningExpiresAt: newExpiry })
              showMsg(`Timer ${sign > 0 ? 'extended' : 'reduced'} by ${mins}m`)
              setAdjustMin('')
            } catch { showMsg('Save failed', 'error') }
            finally { setSaving(false) }
          }

          async function handleReset() {
            setSaving(true)
            try {
              await adminResetRenewal({ data: { username: user.username } })
              addLog(admin, 'mining:renewal', `Reset mining session for ${user.username}`)
              onUpdate({ ...user, miningExpiresAt: null, miningRenewedAt: null })
              showMsg(`Mining session reset for ${user.username}`)
            } catch { showMsg('Save failed', 'error') }
            finally { setSaving(false) }
          }

          return (
            <>
              {/* Status info */}
              <div className="rounded-xl border border-white/8 bg-white/2 divide-y divide-white/5">
                {[
                  {
                    label: 'Mining Status',
                    value: isActive ? '✅ Active' : '❌ Expired',
                    color: isActive ? 'text-green-400' : 'text-red-400',
                  },
                  {
                    label: 'Time Remaining',
                    value: isActive ? `${hLeft}h ${mLeft}m` : '—',
                    color: isActive ? 'text-[#00BFFF]' : 'text-gray-600',
                  },
                  {
                    label: 'Expiration Time',
                    value: expiresAt ? new Date(expiresAt).toLocaleString() : 'Never set',
                    color: 'text-gray-300',
                  },
                  {
                    label: 'Last Renewal',
                    value: user.miningRenewedAt ? new Date(user.miningRenewedAt).toLocaleString() : 'Never',
                    color: 'text-gray-300',
                  },
                ].map(row => (
                  <div key={row.label} className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-gray-600 text-[11px]">{row.label}</span>
                    <span className={`text-[11px] font-semibold ${row.color}`}>{row.value}</span>
                  </div>
                ))}
              </div>

              {/* Renew button */}
              <div className="space-y-2">
                <p className="text-white text-xs font-bold">⏱ Session Control</p>
                <button
                  disabled={saving}
                  onClick={handleAdminRenew}
                  className="w-full px-4 py-2.5 rounded-xl text-sm font-semibold text-[#00BFFF] border border-[#00BFFF]/20 bg-[#00BFFF]/8 hover:bg-[#00BFFF]/15 transition-all disabled:opacity-40"
                >
                  ⟳ Renew (Full 12 h)
                </button>
                <button
                  disabled={saving}
                  onClick={handleReset}
                  className="w-full px-4 py-2.5 rounded-xl text-sm font-semibold text-red-400 border border-red-500/20 bg-red-500/8 hover:bg-red-500/15 transition-all disabled:opacity-40"
                >
                  ✕ Reset / Expire Now
                </button>
              </div>

              {/* Adjust time */}
              <div className="space-y-2">
                <p className="text-white text-xs font-bold">⏩ Adjust Time</p>
                <div className="flex gap-2">
                  <input
                    type="number" min="1" step="any" value={adjustMin}
                    onChange={e => setAdjustMin(e.target.value)}
                    placeholder="Minutes"
                    className="flex-1 bg-white/3 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#00BFFF]/40 placeholder-gray-700"
                  />
                  <button
                    disabled={saving}
                    onClick={() => handleAdjust(1)}
                    className="px-4 py-2.5 rounded-xl text-sm font-semibold text-green-400 border border-green-500/20 bg-green-500/8 hover:bg-green-500/15 transition-all disabled:opacity-40"
                  >+ Extend</button>
                  <button
                    disabled={saving}
                    onClick={() => handleAdjust(-1)}
                    className="px-4 py-2.5 rounded-xl text-sm font-semibold text-red-400 border border-red-500/20 bg-red-500/8 hover:bg-red-500/15 transition-all disabled:opacity-40"
                  >− Reduce</button>
                </div>
              </div>
            </>
          )
        })()}

      </div>
    </div>
  )
}

// ─── Grand Section ────────────────────────────────────────────────────────────

export function MiningManager({ admin }: Props) {
  const [users,    setUsers]    = useState<Record<string, User>>({})
  const [selected, setSelected] = useState<string | null>(null)
  const [search,   setSearch]   = useState('')
  const [sortBy,   setSortBy]   = useState<'balance' | 'gems' | 'rigs' | 'rate' | 'active'>('balance')
  const [loading,  setLoading]  = useState(true)
  const [sseOk,    setSseOk]    = useState(false)
  const [lastSync, setLastSync] = useState<number | null>(null)
  const [toast,    setToast]    = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  function showMsg(msg: string, type: 'success' | 'error' = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  // ── Load from server ────────────────────────────────────────────────────────
  const fetchUsers = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true)
    try {
      const data = await getAllMiningUsers()
      setUsers(data)
      setLastSync(Date.now())
    } catch {
      if (!quiet) showMsg('Failed to load mining data from server', 'error')
    } finally {
      if (!quiet) setLoading(false)
    }
  }, [])

  // ── SSE subscription ────────────────────────────────────────────────────────
  useEffect(() => {
    let es: EventSource | null = null
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null
    let active = true

    function connect() {
      if (!active) return
      es = new EventSource('/api/mining-events')

      es.addEventListener('mining_updated', () => {
        fetchUsers(true) // quiet refresh — no spinner
      })

      es.onopen = () => setSseOk(true)

      es.onerror = () => {
        setSseOk(false)
        es?.close()
        es = null
        if (active) reconnectTimer = setTimeout(connect, 5_000)
      }
    }

    connect()
    return () => {
      active = false
      setSseOk(false)
      if (reconnectTimer) clearTimeout(reconnectTimer)
      es?.close()
    }
  }, [fetchUsers])

  // ── Polling fallback (5 s) ──────────────────────────────────────────────────
  useEffect(() => {
    fetchUsers()
    pollRef.current = setInterval(() => fetchUsers(true), 5_000)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [fetchUsers])

  // ── Keep selected user in sync ──────────────────────────────────────────────
  const selectedUser = selected ? (users[selected] ?? null) : null

  function handleUpdate(updated: User) {
    setUsers(prev => ({ ...prev, [updated.username.toLowerCase()]: updated }))
    showMsg(`${updated.username} updated`)
  }

  // ── Computed stats ──────────────────────────────────────────────────────────
  const userList = useMemo(() => Object.values(users), [users])

  const stats = useMemo(() => {
    const totalBC      = userList.reduce((s, u) => s + u.balance, 0)
    const totalGems    = userList.reduce((s, u) => s + (u.gems ?? 0), 0)
    const activeMiners = userList.filter(u => u.rigs.some(r => r.status === 'mining')).length
    const totalRigs    = userList.reduce((s, u) => s + u.rigs.length, 0)
    const activeRigs   = userList.reduce((s, u) => s + u.rigs.filter(r => r.status === 'mining').length, 0)
    const totalRate    = userList.reduce((s, u) => s + activeHashrate(u), 0)

    const tierCounts: Record<string, number> = {}
    for (const u of userList) {
      for (const r of u.rigs) {
        tierCounts[r.tierId] = (tierCounts[r.tierId] ?? 0) + 1
      }
    }

    return { totalBC, totalGems, activeMiners, totalRigs, activeRigs, totalRate, tierCounts }
  }, [userList])

  // ── Filtered + sorted list ──────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return userList
      .filter(u => !q || u.username.toLowerCase().includes(q))
      .sort((a, b) => {
        if (sortBy === 'balance') return b.balance - a.balance
        if (sortBy === 'gems')    return (b.gems ?? 0) - (a.gems ?? 0)
        if (sortBy === 'rigs')    return b.rigs.length - a.rigs.length
        if (sortBy === 'rate')    return activeHashrate(b) - activeHashrate(a)
        if (sortBy === 'active')  return b.lastCheckedAt - a.lastCheckedAt
        return 0
      })
  }, [userList, search, sortBy])

  return (
    <div className="space-y-6">
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      {/* ── Connection status bar ──────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/2 border border-white/5 text-[11px]">
        <span className={`w-2 h-2 rounded-full shrink-0 ${sseOk ? 'bg-green-400 animate-pulse' : 'bg-amber-400'}`} />
        <span className={sseOk ? 'text-green-400' : 'text-amber-400'}>
          {sseOk ? 'Live — receiving real-time updates' : 'Polling (SSE reconnecting…)'}
        </span>
        <span className="text-gray-700 ml-auto">
          {lastSync ? `Synced ${timeAgo(lastSync)}` : 'Loading…'}
        </span>
        <button
          onClick={() => fetchUsers()}
          className="px-2.5 py-1 rounded-lg text-gray-500 border border-white/8 hover:border-white/15 hover:text-gray-300 transition-all"
        >↻ Refresh</button>
      </div>

      {/* ── Stats overview ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard label="Total Players" value={userList.length.toString()} color="text-white" />
        <StatCard label="Active Miners" value={stats.activeMiners.toString()} color="text-green-400"
          sub={`of ${userList.length} players`} />
        <StatCard label="Total BlueCoin" value={Math.floor(stats.totalBC).toLocaleString()}
          color="text-amber-400" sub="BC in circulation" />
        <StatCard label="Total Gems" value={Math.floor(stats.totalGems).toLocaleString()}
          color="text-purple-400" sub="gems in circulation" />
        <StatCard label="Network Rate" value={stats.totalRate > 0 ? `${stats.totalRate} MH/s` : '—'}
          color="text-[#00BFFF]" sub={`${stats.activeRigs} rigs active`} />
        <StatCard label="Total Rigs" value={stats.totalRigs.toString()}
          color="text-white" sub={`${stats.activeRigs} mining`} />
      </div>

      {/* ── Rig tier breakdown ─────────────────────────────────────────────── */}
      {stats.totalRigs > 0 && (
        <div className="glass rounded-xl border border-white/8 px-5 py-4">
          <p className="text-gray-600 text-[10px] uppercase tracking-widest mb-3">Rig Tier Distribution</p>
          <div className="flex flex-wrap gap-3">
            {RIG_TIERS.map(t => {
              const count = stats.tierCounts[t.id] ?? 0
              if (count === 0) return null
              return (
                <div key={t.id} className="flex items-center gap-2">
                  <span className="text-base">{t.emoji}</span>
                  <div>
                    <p className="text-white text-xs font-semibold">{t.name}</p>
                    <p className="text-gray-600 text-[10px]">{count} owned · {t.hashrate} MH/s each</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── User table ─────────────────────────────────────────────────────── */}
      <div className="glass rounded-2xl border border-white/8 overflow-hidden">
        {/* Table header */}
        <div className="px-5 py-4 border-b border-white/5 flex items-center gap-3 flex-wrap">
          <h3 className="font-['Space_Grotesk'] font-bold text-white text-sm">
            Players ({filtered.length}{search ? ` of ${userList.length}` : ''})
          </h3>
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search players…"
            className="ml-auto bg-white/3 border border-white/10 rounded-xl px-3 py-1.5 text-white text-xs outline-none focus:border-[#00BFFF]/40 placeholder-gray-700 w-44"
          />
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as typeof sortBy)}
            className="bg-white/3 border border-white/10 rounded-xl px-3 py-1.5 text-white text-xs outline-none focus:border-[#00BFFF]/40"
          >
            <option value="balance" className="bg-[#0B0F17]">Sort: BlueCoin</option>
            <option value="gems"    className="bg-[#0B0F17]">Sort: Gems</option>
            <option value="rigs"    className="bg-[#0B0F17]">Sort: Rigs</option>
            <option value="rate"    className="bg-[#0B0F17]">Sort: Hashrate</option>
            <option value="active"  className="bg-[#0B0F17]">Sort: Last Active</option>
          </select>
        </div>

        {loading ? (
          <div className="py-16 text-center text-gray-600 text-sm animate-pulse">Loading mining data…</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-gray-700 text-sm">
            {search ? 'No players match your search.' : 'No mining players registered yet.'}
          </div>
        ) : (
          <>
            {/* Column headers */}
            <div className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-x-4 px-5 py-2 text-[9px] uppercase tracking-widest text-gray-700 border-b border-white/3">
              <span>Player</span>
              <span className="text-right">BlueCoin</span>
              <span className="text-right">Gems</span>
              <span className="text-right">Rigs</span>
              <span className="text-right hidden sm:block">Rate</span>
              <span className="text-right">Status</span>
            </div>

            {/* Rows */}
            <div className="divide-y divide-white/3 max-h-[420px] overflow-y-auto">
              {filtered.map(u => {
                const st    = userStatus(u)
                const rate  = activeHashrate(u)
                const isSelected = selected === u.username.toLowerCase()
                return (
                  <button
                    key={u.username}
                    onClick={() => setSelected(isSelected ? null : u.username.toLowerCase())}
                    className={`w-full grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-x-4 px-5 py-3 text-left hover:bg-white/2 transition-colors items-center ${
                      isSelected ? 'bg-[#00BFFF]/5 border-l-2 border-[#00BFFF]' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-[#00BFFF]/10 border border-[#00BFFF]/20 flex items-center justify-center text-xs font-black text-[#00BFFF] shrink-0">
                        {u.username[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-white text-xs font-semibold truncate">{u.username}</p>
                        <p className="text-gray-700 text-[10px]">{timeAgo(u.lastCheckedAt)}</p>
                      </div>
                    </div>
                    <span className="text-amber-400 text-xs font-bold text-right tabular-nums">
                      {Math.floor(u.balance).toLocaleString()}
                    </span>
                    <span className="text-purple-400 text-xs font-bold text-right tabular-nums">
                      {Math.floor(u.gems ?? 0).toLocaleString()}
                    </span>
                    <span className="text-[#00BFFF] text-xs font-bold text-right tabular-nums">
                      {u.rigs.filter(r => r.status === 'mining').length}/{u.rigs.length}
                    </span>
                    <span className="text-green-400 text-xs font-bold text-right tabular-nums hidden sm:block">
                      {rate > 0 ? `${rate}` : '—'}
                    </span>
                    <div className="flex justify-end">
                      <StatusBadge status={st} />
                    </div>
                  </button>
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* ── User detail panel ──────────────────────────────────────────────── */}
      {selectedUser && (
        <UserDetailPanel
          user={selectedUser}
          admin={admin}
          onUpdate={handleUpdate}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}
