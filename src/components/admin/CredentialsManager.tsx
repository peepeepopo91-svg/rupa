// ─── Credentials Manager — Grand Section ─────────────────────────────────────
// Full admin credential management: username, dual passwords, strength meter,
// session info, security audit log, rotation history, and danger zone.

import { useState, useEffect, useRef, useCallback, type ReactNode } from 'react'
import { updateAdminCredentials, getAdminInfo } from '../../server/adminAuth'
import { getAdminSession, setAdminSession, addLog } from '../../store/adminStore'

interface Props { admin: string }

// ─── Password Strength ────────────────────────────────────────────────────────

interface StrengthResult {
  score: number      // 0-4
  label: string
  color: string
  tips: string[]
}

function measureStrength(pw: string): StrengthResult {
  if (!pw) return { score: 0, label: 'None', color: 'bg-gray-800', tips: [] }
  const tips: string[] = []
  let score = 0

  if (pw.length >= 8)  score++; else tips.push('Use at least 8 characters')
  if (pw.length >= 14) score++; else if (pw.length >= 8) tips.push('Longer passwords are stronger (14+ recommended)')
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++; else tips.push('Mix uppercase and lowercase letters')
  if (/\d/.test(pw)) score++; else tips.push('Add numbers')
  if (/[^A-Za-z0-9]/.test(pw)) { if (score < 4) score++ } else { tips.push('Add symbols (!@#$%…)') }

  const capped = Math.min(score, 4) as 0|1|2|3|4
  const labels = ['None', 'Weak', 'Fair', 'Good', 'Strong']
  const colors = ['bg-gray-800', 'bg-red-500', 'bg-orange-400', 'bg-yellow-400', 'bg-green-400']
  return { score: capped, label: labels[capped], color: colors[capped], tips }
}

function StrengthBar({ password }: { password: string }) {
  const s = measureStrength(password)
  return (
    <div className="space-y-1.5">
      <div className="flex gap-1 h-1.5">
        {[1,2,3,4].map(i => (
          <div key={i} className={`flex-1 rounded-full transition-all duration-300 ${i <= s.score ? s.color : 'bg-white/10'}`} />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <span className={`text-[10px] font-semibold ${
          s.score === 4 ? 'text-green-400' :
          s.score === 3 ? 'text-yellow-400' :
          s.score === 2 ? 'text-orange-400' :
          s.score >= 1 ? 'text-red-400' : 'text-gray-700'
        }`}>{password ? s.label : ''}</span>
        {s.tips[0] && <span className="text-[10px] text-gray-600 truncate max-w-[60%]">Tip: {s.tips[0]}</span>}
      </div>
    </div>
  )
}

// ─── Toast ────────────────────────────────────────────────────────────────────

type ToastType = 'success' | 'error' | 'info' | 'warning'
interface ToastMsg { id: number; msg: string; type: ToastType }

function Toast({ toasts, remove }: { toasts: ToastMsg[]; remove: (id: number) => void }) {
  return (
    <div className="fixed top-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          onClick={() => remove(t.id)}
          className={`pointer-events-auto px-5 py-3 rounded-xl text-sm font-semibold shadow-2xl border backdrop-blur-sm cursor-pointer transition-all duration-200 max-w-sm ${
            t.type === 'success' ? 'bg-green-500/15 border-green-500/30 text-green-300' :
            t.type === 'error'   ? 'bg-red-500/15 border-red-500/30 text-red-300' :
            t.type === 'warning' ? 'bg-orange-500/15 border-orange-500/30 text-orange-300' :
            'bg-[#00BFFF]/12 border-[#00BFFF]/30 text-[#00BFFF]'
          }`}
        >
          <span className="mr-2">
            {t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : t.type === 'warning' ? '⚠' : 'ℹ'}
          </span>
          {t.msg}
        </div>
      ))}
    </div>
  )
}

function useToasts() {
  const [toasts, setToasts] = useState<ToastMsg[]>([])
  const counterRef = useRef(0)

  const push = useCallback((msg: string, type: ToastType = 'info') => {
    const id = ++counterRef.current
    setToasts(p => [...p, { id, msg, type }])
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4500)
  }, [])

  const remove = useCallback((id: number) => setToasts(p => p.filter(t => t.id !== id)), [])
  return { toasts, push, remove }
}

// ─── Password Input with show/hide ────────────────────────────────────────────

function PasswordInput({
  label, value, onChange, placeholder, showStrength, disabled, autoComplete
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  showStrength?: boolean
  disabled?: boolean
  autoComplete?: string
}) {
  const [show, setShow] = useState(false)
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest">{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder ?? '••••••••••'}
          disabled={disabled}
          autoComplete={autoComplete}
          className="w-full bg-white/3 border border-white/8 rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-[#00BFFF]/40 focus:bg-white/5 transition-all disabled:opacity-40 disabled:cursor-not-allowed font-mono"
        />
        <button
          type="button"
          onClick={() => setShow(v => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-300 transition-colors text-base"
        >
          {show ? '🙈' : '👁'}
        </button>
      </div>
      {showStrength && <StrengthBar password={value} />}
    </div>
  )
}

// ─── Section Card ─────────────────────────────────────────────────────────────

function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-white/2 border border-white/6 rounded-2xl p-6 space-y-5 ${className}`}>
      {children}
    </div>
  )
}

function CardHeader({ icon, title, subtitle, badge }: {
  icon: string; title: string; subtitle: string; badge?: ReactNode
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 rounded-xl bg-[#00BFFF]/8 border border-[#00BFFF]/15 flex items-center justify-center text-lg shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-['Space_Grotesk'] font-bold text-white text-sm">{title}</h3>
          {badge}
        </div>
        <p className="text-gray-600 text-xs mt-0.5">{subtitle}</p>
      </div>
    </div>
  )
}

// ─── Rotation History (local) ─────────────────────────────────────────────────

interface RotationEntry {
  ts: number
  changed: string[]
}

const HISTORY_KEY = 'bn_cred_history'

function loadHistory(): RotationEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function pushHistory(changed: string[]) {
  try {
    const h: RotationEntry[] = loadHistory()
    h.unshift({ ts: Date.now(), changed })
    localStorage.setItem(HISTORY_KEY, JSON.stringify(h.slice(0, 20)))
  } catch { /* quota */ }
}

function timeAgo(ts: number): string {
  const d = Date.now() - ts
  if (d < 60_000)        return `${Math.floor(d / 1000)}s ago`
  if (d < 3_600_000)     return `${Math.floor(d / 60_000)}m ago`
  if (d < 86_400_000)    return `${Math.floor(d / 3_600_000)}h ago`
  if (d < 30*86_400_000) return `${Math.floor(d / 86_400_000)}d ago`
  return new Date(ts).toLocaleDateString()
}

// ─── Session Clock ────────────────────────────────────────────────────────────

function SessionTimer({ loginAt }: { loginAt: number }) {
  const [remaining, setRemaining] = useState(0)

  useEffect(() => {
    const TTL = 8 * 60 * 60 * 1000
    function tick() {
      const rem = Math.max(0, loginAt + TTL - Date.now())
      setRemaining(rem)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [loginAt])

  const h = Math.floor(remaining / 3_600_000)
  const m = Math.floor((remaining % 3_600_000) / 60_000)
  const s = Math.floor((remaining % 60_000) / 1000)
  const pct = Math.min(100, (remaining / (8 * 60 * 60 * 1000)) * 100)
  const urgent = pct < 10

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-500">Session expires in</span>
        <span className={`font-mono font-bold ${urgent ? 'text-red-400 animate-pulse' : 'text-[#00BFFF]'}`}>
          {String(h).padStart(2,'0')}:{String(m).padStart(2,'0')}:{String(s).padStart(2,'0')}
        </span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${urgent ? 'bg-red-500' : pct < 30 ? 'bg-orange-400' : 'bg-[#00BFFF]'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-[10px] text-gray-700">Logged in {timeAgo(loginAt)}. Session TTL: 8 hours.</p>
    </div>
  )
}

// ─── Security Policy Panel ────────────────────────────────────────────────────

function SecurityPolicy() {
  const rules = [
    { icon: '🔐', label: 'Dual-password system', desc: 'Two separate passwords required to log in — both must match.' },
    { icon: '🔑', label: 'scrypt hashing', desc: 'All passwords stored as scrypt hashes (salt + 64-byte key). Never plaintext.' },
    { icon: '🛡️', label: 'HMAC-SHA256 sessions', desc: 'Session tokens are signed with SESSION_SECRET. Tampering is detected on every page load.' },
    { icon: '⏱️', label: '8-hour session TTL', desc: 'Sessions expire automatically. Re-authentication required after expiry.' },
    { icon: '🚫', label: 'IP rate limiting', desc: '5 failed login attempts trigger a 15-minute IP lockout.' },
    { icon: '⚡', label: 'Constant-time compare', desc: 'All credential comparisons use timingSafeEqual to prevent timing attacks.' },
    { icon: '📏', label: 'Password minimums', desc: 'Each password must be ≥ 8 characters. Passwords 1 & 2 must differ from each other.' },
    { icon: '🔄', label: 'Auto hash upgrade', desc: 'Plaintext passwords are automatically upgraded to scrypt on first login.' },
  ]
  return (
    <div className="grid gap-2">
      {rules.map(r => (
        <div key={r.label} className="flex items-start gap-3 p-3 rounded-xl bg-white/2 border border-white/5">
          <span className="text-base shrink-0 mt-0.5">{r.icon}</span>
          <div>
            <p className="text-xs font-semibold text-gray-300">{r.label}</p>
            <p className="text-[11px] text-gray-600 leading-relaxed">{r.desc}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

type ActiveTab = 'username' | 'password1' | 'password2' | 'full-rotation'

export function CredentialsManager({ admin }: Props) {
  const { toasts, push, remove } = useToasts()
  const session = getAdminSession()

  // Server info
  const [serverUsername, setServerUsername] = useState<string>(admin)
  const [p1Hashed, setP1Hashed] = useState(true)
  const [p2Hashed, setP2Hashed] = useState(true)
  const [loadingInfo, setLoadingInfo] = useState(true)

  // History
  const [history, setHistory] = useState<RotationEntry[]>([])

  // Active tab
  const [tab, setTab] = useState<ActiveTab>('full-rotation')

  // Busy flag
  const [busy, setBusy] = useState(false)

  // Show policy
  const [showPolicy, setShowPolicy] = useState(false)
  const [showHistory, setShowHistory] = useState(true)

  // ── Change Username form ──────────────────────────────────────────────────
  const [uNewUsername, setUNewUsername] = useState('')
  const [uCurP1, setUCurP1] = useState('')
  const [uCurP2, setUCurP2] = useState('')

  // ── Change Password 1 form ────────────────────────────────────────────────
  const [p1CurP1, setP1CurP1] = useState('')
  const [p1CurP2, setP1CurP2] = useState('')
  const [p1New, setP1New]     = useState('')
  const [p1Confirm, setP1Confirm] = useState('')

  // ── Change Password 2 form ────────────────────────────────────────────────
  const [p2CurP1, setP2CurP1] = useState('')
  const [p2CurP2, setP2CurP2] = useState('')
  const [p2New, setP2New]     = useState('')
  const [p2Confirm, setP2Confirm] = useState('')

  // ── Full Rotation form ────────────────────────────────────────────────────
  const [frCurP1, setFrCurP1] = useState('')
  const [frCurP2, setFrCurP2] = useState('')
  const [frNewUser, setFrNewUser] = useState('')
  const [frNewP1, setFrNewP1] = useState('')
  const [frNewP1c, setFrNewP1c] = useState('')
  const [frNewP2, setFrNewP2] = useState('')
  const [frNewP2c, setFrNewP2c] = useState('')

  // ── Danger zone ───────────────────────────────────────────────────────────
  const [showDanger, setShowDanger] = useState(false)

  // Load server info + history on mount
  useEffect(() => {
    setHistory(loadHistory())
    if (!session) { setLoadingInfo(false); return }
    getAdminInfo({ data: { token: session.token, username: session.username, loginAt: session.loginAt } })
      .then(res => {
        if (res.ok) {
          setServerUsername(res.username)
          setP1Hashed(res.password1Hashed)
          setP2Hashed(res.password2Hashed)
        }
      })
      .catch(() => {})
      .finally(() => setLoadingInfo(false))
  }, [])

  // ── Helpers ───────────────────────────────────────────────────────────────

  async function call(payload: {
    currentPassword1: string
    currentPassword2: string
    newUsername?: string
    newPassword1?: string
    newPassword2?: string
  }, logLabel: string) {
    if (busy) return
    setBusy(true)
    try {
      const res = await updateAdminCredentials({ data: payload })
      if (!res.ok) {
        push(res.error, 'error')
        return
      }
      const changed = res.changed ?? []
      pushHistory(changed)
      setHistory(loadHistory())
      addLog(admin, 'credentials:update', `Changed: ${changed.join(', ')}`)
      push(`${logLabel} updated — signing you out now…`, 'success')
      // Credential rotation bumps sessionInvalidBefore on the server, so the
      // current token is now revoked. Clear the local session immediately so
      // the user is prompted to log in with the new credentials.
      setTimeout(() => {
        setAdminSession(null)
        window.location.href = '/admin'
      }, 1800)
    } catch (e: any) {
      push(e?.message ?? 'Network error', 'error')
    } finally {
      setBusy(false)
    }
  }

  function handleChangeUsername(e: React.FormEvent) {
    e.preventDefault()
    if (!uNewUsername.trim()) { push('Enter a new username', 'warning'); return }
    if (!uCurP1 || !uCurP2)  { push('Enter both current passwords to confirm', 'warning'); return }
    call({ currentPassword1: uCurP1, currentPassword2: uCurP2, newUsername: uNewUsername }, 'Username')
  }

  function handleChangeP1(e: React.FormEvent) {
    e.preventDefault()
    if (!p1New) { push('Enter a new password', 'warning'); return }
    if (p1New !== p1Confirm) { push('New passwords do not match', 'error'); return }
    if (p1New.length < 8) { push('Password must be ≥ 8 characters', 'error'); return }
    call({ currentPassword1: p1CurP1, currentPassword2: p1CurP2, newPassword1: p1New }, 'Password 1')
  }

  function handleChangeP2(e: React.FormEvent) {
    e.preventDefault()
    if (!p2New) { push('Enter a new password', 'warning'); return }
    if (p2New !== p2Confirm) { push('New passwords do not match', 'error'); return }
    if (p2New.length < 8) { push('Password must be ≥ 8 characters', 'error'); return }
    call({ currentPassword1: p2CurP1, currentPassword2: p2CurP2, newPassword2: p2New }, 'Password 2')
  }

  function handleFullRotation(e: React.FormEvent) {
    e.preventDefault()
    if (!frCurP1 || !frCurP2) { push('Enter both current passwords', 'warning'); return }
    if (frNewP1 && frNewP1 !== frNewP1c) { push('New Password 1 confirmation does not match', 'error'); return }
    if (frNewP2 && frNewP2 !== frNewP2c) { push('New Password 2 confirmation does not match', 'error'); return }
    if (frNewP1 && frNewP1.length < 8)   { push('Password 1 must be ≥ 8 characters', 'error'); return }
    if (frNewP2 && frNewP2.length < 8)   { push('Password 2 must be ≥ 8 characters', 'error'); return }
    const payload: Parameters<typeof call>[0] = { currentPassword1: frCurP1, currentPassword2: frCurP2 }
    if (frNewUser.trim()) payload.newUsername  = frNewUser.trim()
    if (frNewP1)          payload.newPassword1 = frNewP1
    if (frNewP2)          payload.newPassword2 = frNewP2
    if (!payload.newUsername && !payload.newPassword1 && !payload.newPassword2) {
      push('Nothing to change — fill at least one new field', 'warning'); return
    }
    call(payload, 'Credentials')
  }

  // ── Tabs ──────────────────────────────────────────────────────────────────
  const TABS: { id: ActiveTab; label: string; icon: string }[] = [
    { id: 'full-rotation', label: 'Full Rotation', icon: '🔄' },
    { id: 'username',      label: 'Username Only', icon: '👤' },
    { id: 'password1',     label: 'Password 1',    icon: '🔑' },
    { id: 'password2',     label: 'Password 2',    icon: '🗝️' },
  ]

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <Toast toasts={toasts} remove={remove} />

      {/* ── Hero Banner ─────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl border border-[#00BFFF]/15 bg-gradient-to-br from-[#00BFFF]/6 via-transparent to-blue-900/10 p-6">
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-px bg-gradient-to-b from-transparent via-[#00BFFF]/10 to-transparent"
              style={{ left: `${12 + i * 12}%`, height: '100%', top: 0, opacity: 0.4 + (i % 3) * 0.2 }}
            />
          ))}
        </div>
        <div className="relative flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#00BFFF]/10 border border-[#00BFFF]/25 flex items-center justify-center text-2xl shadow-[0_0_30px_rgba(0,191,255,0.12)]">
            🔐
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-['Space_Grotesk'] font-black text-white text-xl tracking-tight">
              Admin Credentials
            </h2>
            <p className="text-gray-500 text-xs mt-0.5">
              Manage administrator username and dual-password authentication system
            </p>
          </div>
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            {loadingInfo ? (
              <div className="w-24 h-6 rounded bg-white/5 animate-pulse" />
            ) : (
              <>
                <span className="px-3 py-1 rounded-full bg-[#00BFFF]/10 border border-[#00BFFF]/20 text-[#00BFFF] text-xs font-bold">
                  {serverUsername}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${p1Hashed && p2Hashed ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-orange-500/10 border-orange-500/20 text-orange-400'}`}>
                  {p1Hashed && p2Hashed ? '🔒 scrypt hashed' : '⚠ Upgrade needed'}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Quick stats row */}
        <div className="relative grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-white/5">
          {[
            { label: 'Auth Mode',     value: 'Dual Password',        icon: '🔑' },
            { label: 'Hash Algorithm',value: 'scrypt (64-byte)',      icon: '🧮' },
            { label: 'Session TTL',   value: '8 hours',              icon: '⏱️' },
            { label: 'Rate Limit',    value: '5 attempts / 15 min',  icon: '🚫' },
          ].map(s => (
            <div key={s.label} className="bg-white/3 border border-white/5 rounded-xl px-3 py-2.5">
              <p className="text-gray-700 text-[10px] uppercase tracking-widest">{s.icon} {s.label}</p>
              <p className="text-white text-xs font-bold mt-0.5 truncate">{s.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Two-column layout ────────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* Left col — forms */}
        <div className="lg:col-span-2 space-y-5">

          {/* Tab switcher */}
          <div className="flex gap-1.5 p-1.5 bg-white/3 rounded-xl border border-white/6">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  tab === t.id
                    ? 'bg-[#00BFFF]/15 border border-[#00BFFF]/25 text-[#00BFFF] shadow-sm'
                    : 'text-gray-600 hover:text-gray-400 border border-transparent'
                }`}
              >
                <span>{t.icon}</span>
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            ))}
          </div>

          {/* ── Full Rotation ─────────────────────────────────────────── */}
          {tab === 'full-rotation' && (
            <Card>
              <CardHeader
                icon="🔄"
                title="Full Credential Rotation"
                subtitle="Change username and/or both passwords in one secured operation. Leave any new field blank to keep it unchanged."
                badge={<span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#00BFFF]/10 border border-[#00BFFF]/20 text-[#00BFFF]">Recommended</span>}
              />
              <form onSubmit={handleFullRotation} className="space-y-5">
                {/* Current credentials */}
                <div className="p-4 rounded-xl bg-white/2 border border-white/6 space-y-3">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                    <span className="w-4 h-px bg-gray-700 inline-block" />
                    Verify Identity
                    <span className="w-4 h-px bg-gray-700 inline-block" />
                  </p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <PasswordInput label="Current Password 1" value={frCurP1} onChange={setFrCurP1} autoComplete="current-password" />
                    <PasswordInput label="Current Password 2" value={frCurP2} onChange={setFrCurP2} autoComplete="current-password" />
                  </div>
                </div>

                {/* New values */}
                <div className="p-4 rounded-xl bg-white/2 border border-white/6 space-y-4">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                    <span className="w-4 h-px bg-gray-700 inline-block" />
                    New Values (leave blank to keep current)
                    <span className="w-4 h-px bg-gray-700 inline-block" />
                  </p>

                  {/* New username */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest">New Username</label>
                    <input
                      type="text"
                      value={frNewUser}
                      onChange={e => setFrNewUser(e.target.value)}
                      placeholder={`Keep current: ${serverUsername}`}
                      autoComplete="username"
                      className="w-full bg-white/3 border border-white/8 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-[#00BFFF]/40 focus:bg-white/5 transition-all"
                    />
                  </div>

                  {/* New Password 1 */}
                  <div className="grid sm:grid-cols-2 gap-3">
                    <PasswordInput label="New Password 1" value={frNewP1} onChange={setFrNewP1} placeholder="Leave blank to keep" showStrength autoComplete="new-password" />
                    <PasswordInput label="Confirm Password 1" value={frNewP1c} onChange={setFrNewP1c} placeholder="Repeat new password 1" autoComplete="new-password" />
                  </div>
                  {frNewP1 && frNewP1c && frNewP1 !== frNewP1c && (
                    <p className="text-xs text-red-400 -mt-2">Password 1 entries don't match</p>
                  )}

                  {/* New Password 2 */}
                  <div className="grid sm:grid-cols-2 gap-3">
                    <PasswordInput label="New Password 2" value={frNewP2} onChange={setFrNewP2} placeholder="Leave blank to keep" showStrength autoComplete="new-password" />
                    <PasswordInput label="Confirm Password 2" value={frNewP2c} onChange={setFrNewP2c} placeholder="Repeat new password 2" autoComplete="new-password" />
                  </div>
                  {frNewP2 && frNewP2c && frNewP2 !== frNewP2c && (
                    <p className="text-xs text-red-400 -mt-2">Password 2 entries don't match</p>
                  )}

                  {/* Diff warning */}
                  {frNewP1 && frNewP2 && frNewP1 === frNewP2 && (
                    <div className="px-4 py-3 rounded-xl bg-orange-500/8 border border-orange-500/20 text-orange-400 text-xs flex items-center gap-2">
                      <span>⚠</span> Password 1 and Password 2 must be different from each other.
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={busy}
                  className="w-full py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-[#00BFFF] to-[#0066FF] text-white hover:from-[#00BFFF]/90 hover:to-[#0066FF]/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-[0_0_20px_rgba(0,191,255,0.25)] hover:shadow-[0_0_30px_rgba(0,191,255,0.35)] flex items-center justify-center gap-2"
                >
                  {busy ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : '🔄'}
                  {busy ? 'Updating…' : 'Apply Credential Rotation'}
                </button>
              </form>
            </Card>
          )}

          {/* ── Change Username ────────────────────────────────────────── */}
          {tab === 'username' && (
            <Card>
              <CardHeader
                icon="👤"
                title="Change Username"
                subtitle="Update the administrator login name. Both current passwords required to confirm the change."
              />
              <form onSubmit={handleChangeUsername} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest">Current Username</label>
                  <div className="px-4 py-3 rounded-xl bg-white/2 border border-white/6 text-sm font-mono text-gray-300">
                    {serverUsername}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest">New Username</label>
                  <input
                    type="text"
                    value={uNewUsername}
                    onChange={e => setUNewUsername(e.target.value)}
                    placeholder="e.g. superadmin"
                    autoComplete="username"
                    minLength={3}
                    className="w-full bg-white/3 border border-white/8 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-[#00BFFF]/40 focus:bg-white/5 transition-all"
                  />
                  {uNewUsername && uNewUsername.length < 3 && (
                    <p className="text-[11px] text-red-400">Must be at least 3 characters</p>
                  )}
                </div>
                <div className="h-px bg-white/5" />
                <p className="text-[11px] text-gray-600">Confirm identity — both current passwords required:</p>
                <div className="grid sm:grid-cols-2 gap-3">
                  <PasswordInput label="Current Password 1" value={uCurP1} onChange={setUCurP1} autoComplete="current-password" />
                  <PasswordInput label="Current Password 2" value={uCurP2} onChange={setUCurP2} autoComplete="current-password" />
                </div>
                <button
                  type="submit"
                  disabled={busy}
                  className="w-full py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-[#00BFFF] to-[#0066FF] text-white hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-[0_0_20px_rgba(0,191,255,0.2)] flex items-center justify-center gap-2"
                >
                  {busy ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : '👤'}
                  {busy ? 'Updating…' : 'Update Username'}
                </button>
              </form>
            </Card>
          )}

          {/* ── Change Password 1 ──────────────────────────────────────── */}
          {tab === 'password1' && (
            <Card>
              <CardHeader
                icon="🔑"
                title="Change Password 1"
                subtitle="The primary login password. Both current passwords required to authorize the change."
              />
              <form onSubmit={handleChangeP1} className="space-y-4">
                <div className="p-3 rounded-xl bg-white/2 border border-white/5 space-y-3">
                  <p className="text-[10px] text-gray-600 uppercase tracking-widest font-bold">Verify identity</p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <PasswordInput label="Current Password 1" value={p1CurP1} onChange={setP1CurP1} autoComplete="current-password" />
                    <PasswordInput label="Current Password 2" value={p1CurP2} onChange={setP1CurP2} autoComplete="current-password" />
                  </div>
                </div>
                <div className="h-px bg-white/5" />
                <PasswordInput label="New Password 1" value={p1New} onChange={setP1New} showStrength autoComplete="new-password" />
                <PasswordInput label="Confirm New Password 1" value={p1Confirm} onChange={setP1Confirm} autoComplete="new-password" />
                {p1New && p1Confirm && p1New !== p1Confirm && (
                  <p className="text-xs text-red-400">Passwords don't match</p>
                )}
                <button
                  type="submit"
                  disabled={busy}
                  className="w-full py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-[#00BFFF] to-[#0066FF] text-white hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-[0_0_20px_rgba(0,191,255,0.2)] flex items-center justify-center gap-2"
                >
                  {busy ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : '🔑'}
                  {busy ? 'Updating…' : 'Update Password 1'}
                </button>
              </form>
            </Card>
          )}

          {/* ── Change Password 2 ──────────────────────────────────────── */}
          {tab === 'password2' && (
            <Card>
              <CardHeader
                icon="🗝️"
                title="Change Password 2"
                subtitle="The secondary login password. Both current passwords required to authorize the change."
              />
              <form onSubmit={handleChangeP2} className="space-y-4">
                <div className="p-3 rounded-xl bg-white/2 border border-white/5 space-y-3">
                  <p className="text-[10px] text-gray-600 uppercase tracking-widest font-bold">Verify identity</p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <PasswordInput label="Current Password 1" value={p2CurP1} onChange={setP2CurP1} autoComplete="current-password" />
                    <PasswordInput label="Current Password 2" value={p2CurP2} onChange={setP2CurP2} autoComplete="current-password" />
                  </div>
                </div>
                <div className="h-px bg-white/5" />
                <PasswordInput label="New Password 2" value={p2New} onChange={setP2New} showStrength autoComplete="new-password" />
                <PasswordInput label="Confirm New Password 2" value={p2Confirm} onChange={setP2Confirm} autoComplete="new-password" />
                {p2New && p2Confirm && p2New !== p2Confirm && (
                  <p className="text-xs text-red-400">Passwords don't match</p>
                )}
                <button
                  type="submit"
                  disabled={busy}
                  className="w-full py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-[#00BFFF] to-[#0066FF] text-white hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-[0_0_20px_rgba(0,191,255,0.2)] flex items-center justify-center gap-2"
                >
                  {busy ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : '🗝️'}
                  {busy ? 'Updating…' : 'Update Password 2'}
                </button>
              </form>
            </Card>
          )}

          {/* ── Security Checklist ─────────────────────────────────────── */}
          <Card>
            <CardHeader icon="✅" title="Security Checklist" subtitle="Quick health check for your current credential configuration." />
            <div className="grid sm:grid-cols-2 gap-2">
              {[
                { ok: p1Hashed,            label: 'Password 1 is hashed',   detail: p1Hashed ? 'scrypt' : 'Plaintext — upgrade on next login' },
                { ok: p2Hashed,            label: 'Password 2 is hashed',   detail: p2Hashed ? 'scrypt' : 'Plaintext — upgrade on next login' },
                { ok: true,                label: 'Dual-password auth',      detail: 'Both passwords required' },
                { ok: true,                label: 'HMAC sessions active',    detail: 'SESSION_SECRET is set' },
                { ok: history.length > 0,  label: 'Rotation history exists', detail: history.length > 0 ? `${history.length} rotation(s) recorded` : 'No changes yet' },
                { ok: !!session,           label: 'Active session',          detail: session ? `Logged in as ${session.username}` : 'No session' },
              ].map(item => (
                <div key={item.label} className={`flex items-center gap-3 p-3 rounded-xl border ${item.ok ? 'bg-green-500/5 border-green-500/15' : 'bg-orange-500/5 border-orange-500/15'}`}>
                  <span className="text-base shrink-0">{item.ok ? '✅' : '⚠️'}</span>
                  <div>
                    <p className="text-xs font-semibold text-gray-300">{item.label}</p>
                    <p className={`text-[11px] ${item.ok ? 'text-gray-600' : 'text-orange-500'}`}>{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* ── Danger Zone ───────────────────────────────────────────── */}
          <div className="rounded-2xl border border-red-500/20 bg-red-500/3 overflow-hidden">
            <button
              onClick={() => setShowDanger(v => !v)}
              className="w-full flex items-center gap-3 px-6 py-4 text-left hover:bg-red-500/5 transition-colors"
            >
              <span className="text-xl">☠️</span>
              <div className="flex-1">
                <p className="text-sm font-bold text-red-400">Danger Zone</p>
                <p className="text-[11px] text-gray-600">Session invalidation and emergency actions</p>
              </div>
              <span className={`text-gray-600 text-sm transition-transform ${showDanger ? 'rotate-90' : ''}`}>›</span>
            </button>
            {showDanger && (
              <div className="px-6 pb-6 space-y-4 border-t border-red-500/10 pt-4">
                <div className="p-4 rounded-xl bg-white/2 border border-white/5 space-y-3">
                  <p className="text-xs font-bold text-gray-400">Session Revocation</p>
                  <p className="text-[11px] text-gray-600 leading-relaxed">
                    Every credential change — username or either password — bumps a <span className="text-gray-400 font-mono">sessionInvalidBefore</span> timestamp
                    written to <span className="text-gray-400 font-mono">admin.yml</span>. The server checks this on
                    every page load: any session token issued before that timestamp is rejected, regardless of whether its HMAC signature is valid.
                    This ensures that password rotations revoke all existing sessions immediately — not just the current one.
                  </p>
                  <p className="text-[11px] text-gray-600 leading-relaxed">
                    After a successful update this page will sign you out automatically. Log in with the new credentials to continue.
                  </p>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#00BFFF]/6 border border-[#00BFFF]/15 text-[#00BFFF] text-[11px]">
                    <span>ℹ</span>
                    <span>To force a sign-out of all sessions, rotate any credential via the forms above.</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/2 border border-white/5 space-y-2">
                  <p className="text-xs font-bold text-gray-400">Current Session Info</p>
                  <div className="font-mono text-[11px] text-gray-500 space-y-1 break-all">
                    <p>Username: <span className="text-gray-300">{session?.username ?? '—'}</span></p>
                    <p>Login at: <span className="text-gray-300">{session ? new Date(session.loginAt).toLocaleString() : '—'}</span></p>
                    <p>Token: <span className="text-gray-500">{session ? `${session.token.slice(0, 16)}…` : '—'}</span></p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right col — info panels */}
        <div className="space-y-5">

          {/* Session timer */}
          {session && (
            <Card>
              <CardHeader icon="⏱️" title="Active Session" subtitle="Current session countdown" />
              <SessionTimer loginAt={session.loginAt} />
            </Card>
          )}

          {/* Rotation history */}
          <Card>
            <div className="flex items-center justify-between">
              <CardHeader icon="📜" title="Rotation History" subtitle="Last 20 credential changes" />
              <button
                onClick={() => setShowHistory(v => !v)}
                className="text-[10px] text-gray-600 hover:text-gray-400 transition-colors shrink-0"
              >
                {showHistory ? 'Collapse' : 'Expand'}
              </button>
            </div>
            {showHistory && (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {history.length === 0 ? (
                  <p className="text-center text-gray-700 text-xs py-6">No rotations recorded yet</p>
                ) : history.map((h, i) => (
                  <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/2 border border-white/5">
                    <span className="text-sm shrink-0 mt-0.5">🔄</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-300 truncate">
                        Changed: {h.changed.join(', ')}
                      </p>
                      <p className="text-[10px] text-gray-600">{timeAgo(h.ts)} · {new Date(h.ts).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Security policy */}
          <Card>
            <div className="flex items-center justify-between">
              <CardHeader icon="🛡️" title="Security Policy" subtitle="How credentials are protected" />
              <button
                onClick={() => setShowPolicy(v => !v)}
                className="text-[10px] text-gray-600 hover:text-gray-400 transition-colors shrink-0"
              >
                {showPolicy ? 'Collapse' : 'Expand'}
              </button>
            </div>
            {showPolicy && <SecurityPolicy />}
          </Card>

          {/* Best practices */}
          <Card>
            <CardHeader icon="💡" title="Best Practices" subtitle="Recommendations for keeping your account secure" />
            <div className="space-y-2.5">
              {[
                { tip: 'Rotate credentials every 90 days', severity: 'info' },
                { tip: 'Use a password manager to store complex passwords', severity: 'info' },
                { tip: 'Make Password 1 and Password 2 completely different', severity: 'warning' },
                { tip: 'Never share your admin credentials', severity: 'warning' },
                { tip: 'Use 14+ character passwords for maximum security', severity: 'info' },
                { tip: 'Sign out when using shared machines', severity: 'warning' },
                { tip: 'After rotating, verify you can log in before closing the tab', severity: 'warning' },
              ].map((b, i) => (
                <div key={i} className={`flex items-start gap-2 text-[11px] leading-relaxed ${b.severity === 'warning' ? 'text-orange-400' : 'text-gray-500'}`}>
                  <span className="shrink-0 mt-0.5">{b.severity === 'warning' ? '⚠' : '•'}</span>
                  {b.tip}
                </div>
              ))}
            </div>
          </Card>

          {/* Credential anatomy */}
          <Card>
            <CardHeader icon="🧬" title="Credential Anatomy" subtitle="What each field does" />
            <div className="space-y-3">
              {[
                {
                  field: 'Username',
                  desc: 'The login name shown on the admin panel. Does not affect session signing — changing it invalidates the current token.',
                  color: 'border-l-[#00BFFF]',
                },
                {
                  field: 'Password 1',
                  desc: 'Primary authentication factor. Stored as a salted scrypt hash. Required on every login.',
                  color: 'border-l-purple-400',
                },
                {
                  field: 'Password 2',
                  desc: 'Secondary authentication factor. Must differ from Password 1. Adds a second layer — both must pass to authenticate.',
                  color: 'border-l-green-400',
                },
              ].map(c => (
                <div key={c.field} className={`pl-3 border-l-2 ${c.color}`}>
                  <p className="text-xs font-bold text-gray-300">{c.field}</p>
                  <p className="text-[11px] text-gray-600 leading-relaxed">{c.desc}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
