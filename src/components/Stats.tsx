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

const allPoints = [...rankings.values()].map((r) => r.totalPoints)
const avgScore = allPoints.length > 0
  ? Math.round(allPoints.reduce((a, b) => a + b, 0) / allPoints.length)
  : 0

let topPlayer = { name: '—', points: 0 }
players.forEach((p) => {
  const info = rankings.get(p.name)
  if (info && info.totalPoints > topPlayer.points) {
    topPlayer = { name: p.name, points: info.totalPoints }
  }
})

function useCountUp(target: number, duration = 1800, active: boolean) {
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

function StatItem({ label, value, suffix = '', text }: { label: string; value?: number; suffix?: string; text?: string }) {
  const [active, setActive] = useState(false)
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const count = useCountUp(value ?? 0, 1800, active)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setActive(true); setVisible(true) } },
      { threshold: 0.4 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className="text-center">
      <div className={`font-bold text-3xl sm:text-4xl text-white mb-1 transition-opacity duration-700 ${visible ? 'opacity-100' : 'opacity-0'}`}>
        {text ?? `${count}${suffix}`}
      </div>
      <div className="text-[#444444] text-xs font-medium tracking-wide">{label}</div>
    </div>
  )
}

export function Stats() {
  return (
    <section className="py-20 px-4 border-t border-[#111111]">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">By the Numbers</h2>
          <p className="text-[#555555] text-sm">Live stats from the Blue Tiers ranking system.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          <StatItem label="Total Ranked Players" value={totalRanked} />
          <StatItem label="HT1 Players" value={ht1Players} />
          <StatItem label="Average Player Score" value={avgScore} suffix=" pts" />
          <StatItem label="Highest Rated Player" text={topPlayer.name} />
        </div>
      </div>
    </section>
  )
}
