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

function useCountUp(target: number, duration = 2000, active: boolean) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!active) return
    let start = 0
    const step = target / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)
    return () => clearInterval(timer)
  }, [target, duration, active])

  return count
}

function NumberStat({ label, value, suffix = '' }: { label: string; value: number; suffix?: string }) {
  const [active, setActive] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const count = useCountUp(value, 1800, active)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setActive(true) },
      { threshold: 0.5 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className="text-center">
      <div className="font-['Space_Grotesk'] font-black text-4xl sm:text-5xl text-gradient mb-2">
        {count}{suffix}
      </div>
      <div className="text-gray-500 text-sm font-medium">{label}</div>
    </div>
  )
}

function TextStat({ label, value, sub }: { label: string; value: string; sub: string }) {
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.5 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className="text-center">
      <div
        className={`font-['Space_Grotesk'] font-black text-3xl sm:text-4xl text-gradient mb-1 transition-opacity duration-700 ${visible ? 'opacity-100' : 'opacity-0'}`}
      >
        {value}
      </div>
      <div className="text-[#00BFFF] text-xs font-semibold mb-1">{sub}</div>
      <div className="text-gray-500 text-sm font-medium">{label}</div>
    </div>
  )
}

export function Stats() {
  return (
    <section className="py-24 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-[#0066FF]/5 via-[#00BFFF]/8 to-[#0066FF]/5 pointer-events-none" />
      <div className="absolute inset-0 border-y border-[#00BFFF]/10 pointer-events-none" />

      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-['Space_Grotesk'] font-bold text-3xl sm:text-4xl text-white mb-4">
            By the <span className="text-gradient">Numbers</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
          <NumberStat label="Total Ranked Players" value={totalRanked} />
          <NumberStat label="HT1 Players" value={ht1Players} />
          <NumberStat label="Average Player Score" value={avgScore} suffix=" pts" />
          <TextStat
            label="Highest Rated Player"
            value={topPlayer.name}
            sub={`${topPlayer.points} pts`}
          />
        </div>
      </div>
    </section>
  )
}
