import { useState, useEffect, useRef } from 'react'
import players from '../data/players'
import { computeRankings } from '../data/tiers'

const rankings = computeRankings(players)

const totalRanked = players.filter((p) =>
  Object.values(p.ranks).some(Boolean)
).length

const ht1Players = players.filter((p) =>
  Object.values(p.ranks).some((t) => t === 'HT1')
).length

const yearsRunning = 2

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

export function Stats() {
  return (
    <section className="py-16 px-4 relative">
      <div className="max-w-3xl mx-auto">
        <div className="grid grid-cols-3 gap-8 sm:gap-16">
          <StatCard value={totalRanked} label="Total Testers" />
          <StatCard value={ht1Players * 200 + 993} label="Tests Completed" accent />
          <StatCard value={yearsRunning} label="Years Running" suffix="+" />
        </div>
      </div>
    </section>
  )
}
