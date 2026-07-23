import { useState, useEffect, useRef } from 'react'
import type { Player } from '../data/players'

function useCountUp(target: number, duration = 1600, active: boolean) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!active) return
    let start = 0
    const step = target / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= target) { setCount(target); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [target, duration, active])
  return count
}

function StatCard({
  value,
  label,
  accent = false,
  suffix = '',
}: {
  value: number
  label: string
  accent?: boolean
  suffix?: string
}) {
  const [active, setActive] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const count = useCountUp(value, 1600, active)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setActive(true) },
      { threshold: 0.4 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className="text-center">
      {accent ? (
        <div
          className="font-black text-5xl sm:text-6xl lg:text-7xl leading-none mb-2"
          style={{
            background: 'linear-gradient(135deg, #00BFFF, #0088FF, #0044DD)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          {count.toLocaleString()}{suffix}
        </div>
      ) : (
        <div className="font-black text-5xl sm:text-6xl lg:text-7xl leading-none mb-2 text-white">
          {count.toLocaleString()}{suffix}
        </div>
      )}
      <div className="text-white/40 text-sm font-medium">{label}</div>
    </div>
  )
}

export function Stats({ players }: { players: Player[] }) {
  // Total players who have at least one ranked gamemode
  const totalRanked = players.filter((p) =>
    Object.values(p.ranks).some((t) => t && t !== 'NONE' && t !== 'None')
  ).length

  // Total individual rank placements (one "test" per player-gamemode pair that has a rank)
  const testsCompleted = players.reduce((acc, p) =>
    acc + Object.values(p.ranks).filter((t) => t && t !== 'NONE' && t !== 'None').length
  , 0)

  const yearsRunning = 2

  return (
    <section className="py-16 px-4 relative">
      <div className="max-w-3xl mx-auto">
        <div className="grid grid-cols-3 gap-8 sm:gap-16">
          <StatCard value={totalRanked}    label="Total Players" />
          <StatCard value={testsCompleted} label="Tests Completed" accent />
          <StatCard value={yearsRunning}   label="Years Running" suffix="+" />
        </div>
      </div>
    </section>
  )
}
