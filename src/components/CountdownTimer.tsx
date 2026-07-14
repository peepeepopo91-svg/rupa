import { useEffect, useState } from 'react'

/**
 * Set to a fixed ISO string (e.g. '2026-08-15T23:59:59Z') once the real
 * registration deadline is confirmed. Leave `null` to keep the rolling
 * "8 days from first page load" placeholder.
 */
export const EVENT_DEADLINE: string | null = null
const FALLBACK_WINDOW_MS = 8 * 24 * 60 * 60 * 1000

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

function resolveTargetMs(): number {
  return EVENT_DEADLINE ? new Date(EVENT_DEADLINE).getTime() : Date.now() + FALLBACK_WINDOW_MS
}

function getTimeLeft(targetMs: number): TimeLeft {
  const diff = Math.max(0, targetMs - Date.now())
  return {
    days: Math.floor(diff / (24 * 60 * 60 * 1000)),
    hours: Math.floor((diff / (60 * 60 * 1000)) % 24),
    minutes: Math.floor((diff / (60 * 1000)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  }
}

function Unit({ value, label }: { value: number; label: string }) {
  const display = value.toString().padStart(2, '0')
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-lg bg-white/5 border border-[#00BFFF]/25 overflow-hidden flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
        <div className="absolute inset-0 bg-gradient-to-b from-[#00BFFF]/10 to-transparent pointer-events-none" />
        <span
          key={display}
          className="countdown-digit relative font-['Space_Grotesk'] font-bold text-lg sm:text-xl md:text-2xl lg:text-3xl text-white [text-shadow:0_0_12px_rgba(0,191,255,0.65)]"
        >
          {display}
        </span>
      </div>
      <span className="mt-1 text-[9px] sm:text-[10px] font-semibold tracking-widest uppercase text-gray-500">
        {label}
      </span>
    </div>
  )
}

export function CountdownTimer() {
  const [targetMs] = useState(resolveTargetMs)
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null)

  useEffect(() => {
    setTimeLeft(getTimeLeft(targetMs))
    const id = setInterval(() => {
      setTimeLeft(getTimeLeft(targetMs))
    }, 1000)
    return () => clearInterval(id)
  }, [targetMs])

  const t = timeLeft ?? { days: 0, hours: 0, minutes: 0, seconds: 0 }

  return (
    <div className="flex flex-col items-center gap-1.5 sm:gap-2">
      <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-[#00BFFF]/80">
        Registrations End In
      </span>
      <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2">
        <Unit value={t.days} label="D" />
        <span className="text-[#00BFFF]/40 font-bold pb-4 select-none">:</span>
        <Unit value={t.hours} label="H" />
        <span className="text-[#00BFFF]/40 font-bold pb-4 select-none">:</span>
        <Unit value={t.minutes} label="M" />
        <span className="text-[#00BFFF]/40 font-bold pb-4 select-none">:</span>
        <Unit value={t.seconds} label="S" />
      </div>
    </div>
  )
}
