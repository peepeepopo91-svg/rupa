import { useState } from 'react'
import { useMining } from '../../context/MiningContext'

export function LoginPanel() {
  const { login } = useMining()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [showPass, setShowPass] = useState(false)

  const handle = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await login(username, password)
    if (result.error) setError(result.error)
    setLoading(false)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="w-full max-w-md">
        {/* Glow orb */}
        <div className="absolute left-1/2 -translate-x-1/2 w-72 h-72 bg-[#0066FF]/15 blur-[80px] rounded-full pointer-events-none" />

        <div className="relative glass rounded-2xl border border-white/8 p-8 shadow-2xl shadow-black/60">
          {/* Icon */}
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-6 mx-auto"
            style={{ background: 'linear-gradient(135deg,#0099FF22,#0066FF33)', boxShadow: '0 0 30px rgba(0,102,255,0.2)' }}
          >
            ⛏️
          </div>

          <h2 className="font-['Space_Grotesk'] font-black text-2xl text-white text-center mb-1">
            BlueCoin <span className="text-gradient">Mining</span>
          </h2>
          <p className="text-gray-500 text-sm text-center mb-8">
            Enter your credentials to access the mining network
          </p>

          <form onSubmit={handle} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={e => { setUsername(e.target.value); setError('') }}
                placeholder="Your username"
                autoComplete="username"
                autoFocus
                className="w-full bg-white/3 border border-white/10 hover:border-white/20 focus:border-[#00BFFF]/50 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none transition-all duration-200 text-sm"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError('') }}
                  placeholder="Your password"
                  autoComplete="current-password"
                  className="w-full bg-white/3 border border-white/10 hover:border-white/20 focus:border-[#00BFFF]/50 rounded-xl px-4 py-3 pr-11 text-white placeholder-gray-600 outline-none transition-all duration-200 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors text-sm"
                  tabIndex={-1}
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="text-red-400 text-xs font-medium flex items-center gap-1 -mt-1">
                <span>⚠</span> {error}
              </p>
            )}

            <button
              type="submit"
              disabled={!username.trim() || !password || loading}
              className="btn-primary w-full py-3 rounded-xl font-semibold text-sm text-white transition-all duration-300 disabled:opacity-40 disabled:pointer-events-none relative overflow-hidden"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verifying…
                </span>
              ) : (
                'Enter Mining Network →'
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-white/5 space-y-2">
            {[
              '🔒 Access is restricted to authorised accounts',
              '🔄 Your mining progress is saved automatically',
            ].map(txt => (
              <p key={txt} className="text-gray-600 text-xs flex items-start gap-2">{txt}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
