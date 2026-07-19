import { useState, useMemo } from 'react'
import { useMining } from '../../context/MiningContext'
import { EXCHANGE_CONSTANTS } from '../../data/mining'
import type { ExchangeDirection } from '../../data/mining'
import { getRateHistory } from '../../store/miningStore'

// ─── Sparkline ────────────────────────────────────────────────────────────────

function Sparkline({ rates }: { rates: number[] }) {
  const min = Math.min(...rates)
  const max = Math.max(...rates)
  const range = max - min || 1
  const W = 200, H = 40
  const pts = rates.map((r, i) => `${(i / (rates.length - 1)) * W},${H - ((r - min) / range) * (H - 4) - 2}`)

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="w-full">
      <defs>
        <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#00BFFF" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#00BFFF" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        points={pts.join(' ')}
        fill="none"
        stroke="#00BFFF"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  )
}

// ─── Daily Limit Badge ────────────────────────────────────────────────────────

function TxLimitBadge({ used, limit }: { used: number; limit: number }) {
  const remaining = limit - used
  const exhausted = remaining <= 0
  return (
    <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border ${exhausted ? 'bg-red-500/8 border-red-500/20' : 'bg-[#00BFFF]/5 border-[#00BFFF]/15'}`}>
      <div className="flex-1">
        <p className={`text-[10px] uppercase tracking-widest font-semibold ${exhausted ? 'text-red-400' : 'text-gray-500'}`}>
          Daily Exchanges Remaining
        </p>
        <div className="flex items-baseline gap-1.5 mt-0.5">
          <span className={`font-black text-2xl font-['Space_Grotesk'] ${exhausted ? 'text-red-400' : 'text-white'}`}>
            {remaining}
          </span>
          <span className="text-gray-600 text-sm">/ {limit}</span>
        </div>
      </div>
      <div className="flex gap-1">
        {Array.from({ length: limit }, (_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i < remaining
                ? 'bg-[#00BFFF] shadow-[0_0_6px_rgba(0,191,255,0.8)]'
                : 'bg-white/10'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

// ─── Panel ────────────────────────────────────────────────────────────────────

export function ExchangePanel() {
  const { user, currentRate, exchange } = useMining()
  const [direction, setDirection]   = useState<ExchangeDirection>('bc-to-gems')
  const [inputValue, setInputValue] = useState('')
  const [lastTx, setLastTx]         = useState<{ gained: number; fee: number; direction: ExchangeDirection; at: number } | null>(null)
  const [txError, setTxError]       = useState('')
  const [loading, setLoading]       = useState(false)

  // Rate history (Gems/BC — no inversion needed)
  const rateHistory = useMemo(() => getRateHistory(Date.now()), [currentRate])
  const prevRate    = rateHistory.length > 1 ? rateHistory[rateHistory.length - 2] : currentRate
  const trendUp     = currentRate >= prevRate
  const deviation   = currentRate - EXCHANGE_CONSTANTS.BASE_RATE

  // Parse input
  const amount = parseFloat(inputValue) || 0

  // Compute preview amounts
  const isBC2Gems = direction === 'bc-to-gems'
  const gross     = isBC2Gems ? amount * currentRate : amount / currentRate
  const fee       = gross * EXCHANGE_CONSTANTS.FEE_PCT
  const net       = gross - fee

  // Daily tx limit — floor to integer (migrating old decimal shard-amount values)
  const txUsed      = Math.floor(user?.exchangeUsedToday ?? 0)
  const txLimit     = EXCHANGE_CONSTANTS.DAILY_TX_LIMIT
  const txRemaining = txLimit - txUsed
  const txExhausted = txRemaining <= 0

  const timeToReset = user ? Math.max(0, user.exchangeResetAt - Date.now()) : 0
  const resetHours  = Math.floor(timeToReset / 3_600_000)
  const resetMins   = Math.floor((timeToReset % 3_600_000) / 60_000)

  // Max amounts
  const maxBC   = Math.floor(user?.balance ?? 0)
  const maxGems = Math.floor(user?.gems ?? 0)

  function switchDirection(d: ExchangeDirection) {
    setDirection(d)
    setInputValue('')
    setTxError('')
    setLastTx(null)
  }

  async function handleExchange() {
    if (!amount || amount <= 0) return
    setTxError('')
    setLoading(true)
    await new Promise(r => setTimeout(r, 350))
    const result = exchange(amount, direction)
    if (result.error) {
      setTxError(result.error)
    } else {
      setLastTx({ gained: result.gained, fee: result.feePaid, direction, at: Date.now() })
      setInputValue('')
    }
    setLoading(false)
  }

  const canSubmit = !!user && amount > 0 && !loading && !txExhausted &&
    (isBC2Gems ? amount <= maxBC : amount <= maxGems)

  return (
    <div className="max-w-4xl mx-auto px-4 pb-16 space-y-6">

      {/* ── Rate card ─────────────────────────────────────────────────────── */}
      <div className="glass rounded-2xl border border-white/8 overflow-hidden">
        <div className="flex flex-col md:flex-row">

          {/* Live rate */}
          <div className="p-6 md:w-72 flex flex-col border-b md:border-b-0 md:border-r border-white/5">
            <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-3">Live Exchange Rate</p>

            <div className="flex items-end gap-2 mb-1">
              <span className="font-['Space_Grotesk'] font-black text-5xl text-white leading-none">
                {currentRate}
              </span>
              <div className="flex flex-col mb-1">
                <span className={`text-sm font-bold ${trendUp ? 'text-green-400' : 'text-red-400'}`}>
                  {trendUp ? '▲' : '▼'}
                </span>
                <span className={`text-[10px] font-semibold ${deviation >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {deviation >= 0 ? '+' : ''}{deviation}
                </span>
              </div>
            </div>
            <p className="text-gray-500 text-xs mb-4">💎 Gems per BC</p>

            {/* Rate range bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] text-gray-600">
                <span>Min {EXCHANGE_CONSTANTS.MIN_RATE}</span>
                <span>Base {EXCHANGE_CONSTANTS.BASE_RATE}</span>
                <span>Max {EXCHANGE_CONSTANTS.MAX_RATE}</span>
              </div>
              <div className="h-1 rounded-full bg-white/5 overflow-hidden relative">
                <div
                  className="absolute top-0 left-0 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.max(2, ((currentRate - EXCHANGE_CONSTANTS.MIN_RATE) / (EXCHANGE_CONSTANTS.MAX_RATE - EXCHANGE_CONSTANTS.MIN_RATE)) * 100)}%`,
                    background: 'linear-gradient(90deg, #0066FF, #00BFFF)',
                  }}
                />
              </div>
            </div>

            <p className="text-[9px] text-gray-700 mt-3 uppercase tracking-wide">
              Rate stabilizes algorithmically over a 4-hour cycle
            </p>
          </div>

          {/* Sparkline */}
          <div className="flex-1 p-6">
            <p className="text-[10px] text-gray-600 uppercase tracking-wide mb-3">Rate History (4h window)</p>
            <Sparkline rates={rateHistory} />
            <div className="flex justify-between mt-2">
              <span className="text-[9px] text-gray-700">4h ago</span>
              <span className="text-[9px] text-gray-700">now</span>
            </div>

            {/* Fee & limits summary */}
            <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-white/5">
              {[
                { label: 'Fee',           value: `${(EXCHANGE_CONSTANTS.FEE_PCT * 100).toFixed(0)}%` },
                { label: 'Daily Limit',   value: `${txLimit} trades` },
                { label: 'Remaining',     value: `${txRemaining} / ${txLimit}` },
              ].map(s => (
                <div key={s.label} className="text-center">
                  <p className="text-white font-bold text-sm">{s.value}</p>
                  <p className="text-[9px] text-gray-600 uppercase tracking-wide mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Converter ─────────────────────────────────────────────────────── */}
      <div className="glass rounded-2xl border border-white/8 p-6">

        {/* Direction toggle */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex rounded-xl border border-white/8 overflow-hidden bg-white/2 p-0.5 gap-0.5 flex-1">
            {(['bc-to-gems', 'gems-to-bc'] as ExchangeDirection[]).map(d => (
              <button
                key={d}
                onClick={() => switchDirection(d)}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  direction === d
                    ? 'bg-[#00BFFF]/15 text-[#00BFFF] border border-[#00BFFF]/25'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {d === 'bc-to-gems' ? '💎 BC → Gems' : '💰 Gems → BC'}
              </button>
            ))}
          </div>
          {/* Inline rate reminder */}
          <span className="text-[11px] text-gray-500 tabular-nums whitespace-nowrap">
            1 BC = <span className="text-[#00BFFF] font-semibold">{currentRate} 💎</span>
          </span>
        </div>

        {/* Daily limit badge */}
        <div className="mb-5">
          <TxLimitBadge used={txUsed} limit={txLimit} />
          {user && txRemaining > 0 && (
            <p className="text-[10px] text-gray-700 mt-1.5 text-right">
              Resets in {resetHours}h {resetMins}m
            </p>
          )}
        </div>

        {/* Input / Output grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {/* Input */}
          <div>
            <label className="block text-[10px] text-gray-500 uppercase tracking-wide mb-2">
              You Pay ({isBC2Gems ? 'BlueCoin' : 'Gems'})
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                value={inputValue}
                onChange={e => { setInputValue(e.target.value); setTxError('') }}
                placeholder="0"
                className="w-full bg-white/3 border border-white/10 hover:border-white/20 focus:border-[#00BFFF]/50 rounded-xl px-4 py-3 pr-16 text-white text-sm outline-none transition-all"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-500 font-semibold">
                {isBC2Gems ? 'BC' : '💎'}
              </span>
            </div>
            {user && (
              <div className="flex gap-1.5 mt-1.5">
                {[25, 50, 100, 'Max'].map(v => {
                  const maxVal = isBC2Gems ? maxBC : maxGems
                  const val = v === 'Max' ? maxVal : Math.min(v as number, maxVal)
                  return (
                    <button
                      key={v}
                      onClick={() => setInputValue(String(val))}
                      className="px-2 py-0.5 rounded text-[9px] text-gray-500 bg-white/3 border border-white/8 hover:text-white hover:border-white/20 transition-all"
                    >
                      {v === 'Max' ? `Max (${maxVal})` : `${v}`}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Output preview */}
          <div>
            <label className="block text-[10px] text-gray-500 uppercase tracking-wide mb-2">
              You Receive ({isBC2Gems ? 'Gems' : 'BlueCoin'})
            </label>
            <div className="w-full bg-white/2 border border-white/5 rounded-xl px-4 py-3 flex items-center justify-between">
              <span className={`text-sm font-bold ${net > 0 ? 'text-[#00BFFF]' : 'text-gray-600'}`}>
                {net > 0 ? net.toFixed(2) : '0'}
              </span>
              <span className="text-[10px] text-gray-500 font-semibold">
                {isBC2Gems ? '💎 Gems' : 'BC'}
              </span>
            </div>
            {amount > 0 && (
              <div className="mt-1.5 space-y-0.5">
                <p className="text-[10px] text-gray-600">Gross: {gross.toFixed(2)} {isBC2Gems ? '💎' : 'BC'}</p>
                <p className="text-[10px] text-gray-700">Fee (2%): −{fee.toFixed(2)} {isBC2Gems ? '💎' : 'BC'}</p>
              </div>
            )}
          </div>
        </div>

        {/* Conversion preview row */}
        {amount > 0 && (
          <div className="mb-4 p-3 rounded-xl bg-[#00BFFF]/5 border border-[#00BFFF]/15 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {isBC2Gems ? `1 BC = ${currentRate} 💎` : `${currentRate} 💎 = 1 BC`}
            </span>
            <span className="text-xs text-gray-400">
              {isBC2Gems
                ? `${amount} BC → ${net.toFixed(2)} 💎`
                : `${amount} 💎 → ${net.toFixed(2)} BC`
              }
            </span>
          </div>
        )}

        {txExhausted && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/8 border border-red-500/20 flex items-center gap-2">
            <span className="text-red-400 text-sm">🔒</span>
            <div>
              <p className="text-red-400 text-xs font-semibold">Exchange limit reached</p>
              <p className="text-red-400/60 text-[10px] mt-0.5">
                You have used all {txLimit} exchanges today. Resets in {resetHours}h {resetMins}m.
              </p>
            </div>
          </div>
        )}

        {txError && (
          <p className="mb-4 text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            ⚠ {txError}
          </p>
        )}

        {lastTx && (
          <div className="mb-4 p-3 rounded-xl bg-green-500/8 border border-green-500/20 flex items-center justify-between">
            <span className="text-green-400 text-xs">✓ Exchange complete</span>
            <span className="text-xs text-gray-400">
              +{Math.floor(lastTx.gained).toLocaleString()} {lastTx.direction === 'bc-to-gems' ? '💎 Gems' : 'BC'} received
            </span>
          </div>
        )}

        {!user ? (
          <div className="w-full py-3 rounded-xl text-sm text-center text-gray-600 border border-white/8">
            Log in to exchange
          </div>
        ) : (
          <button
            onClick={handleExchange}
            disabled={!canSubmit}
            className="btn-primary w-full py-3 rounded-xl font-semibold text-sm text-white transition-all disabled:opacity-40 disabled:pointer-events-none"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing…
              </span>
            ) : isBC2Gems ? (
              `Exchange ${amount || 0} BC → ${net > 0 ? net.toFixed(2) : '0'} 💎 Gems`
            ) : (
              `Exchange ${amount || 0} 💎 → ${net > 0 ? net.toFixed(2) : '0'} BC`
            )}
          </button>
        )}
      </div>

      {/* ── How it works ──────────────────────────────────────────────────── */}
      <div className="glass rounded-2xl border border-white/8 p-6">
        <h3 className="font-semibold text-sm text-white mb-4">How the Exchange Works</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              icon: '📈',
              title: 'Dynamic Rate',
              body: `The rate fluctuates between ${EXCHANGE_CONSTANTS.MIN_RATE}–${EXCHANGE_CONSTANTS.MAX_RATE} Gems/BC using two overlapping wave cycles, stabilizing around ${EXCHANGE_CONSTANTS.BASE_RATE} Gems/BC base.`,
            },
            {
              icon: '⚖️',
              title: 'Trading Fee',
              body: `A ${(EXCHANGE_CONSTANTS.FEE_PCT * 100).toFixed(0)}% transaction fee is deducted from the output. This helps stabilize the market and maintain reserve liquidity.`,
            },
            {
              icon: '🔒',
              title: 'Daily Limit',
              body: `Each account can perform up to ${EXCHANGE_CONSTANTS.DAILY_TX_LIMIT} exchange transactions per 24-hour window, in either direction. The limit resets automatically.`,
            },
          ].map(item => (
            <div key={item.title} className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xl">{item.icon}</span>
                <p className="text-xs font-semibold text-gray-300">{item.title}</p>
              </div>
              <p className="text-[11px] text-gray-600 leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
