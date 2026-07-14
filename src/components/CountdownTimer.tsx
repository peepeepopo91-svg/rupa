import React, { useState, useEffect } from 'react'

interface TimeLeft {
  days: string
  hours: string
  minutes: string
  seconds: string
}

export function CountdownTimer() {
  // We compute the target time as 8 days from the first initialisation.
  // To avoid changing target on every hot reload during dev, we can store it or calculate once.
  const [targetDate] = useState(() => {
    const date = new Date()
    date.setDate(date.getDate() + 8)
    return date.getTime()
  })

  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: '08',
    hours: '23',
    minutes: '59',
    seconds: '59'
  })

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime()
      const difference = targetDate - now

      if (difference <= 0) {
        return {
          days: '00',
          hours: '00',
          minutes: '00',
          seconds: '00'
        }
      }

      const d = Math.floor(difference / (1000 * 60 * 60 * 24))
      const h = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
      const s = Math.floor((difference % (1000 * 60)) / 1000)

      return {
        days: d.toString().padStart(2, '0'),
        hours: h.toString().padStart(2, '0'),
        minutes: m.toString().padStart(2, '0'),
        seconds: s.toString().padStart(2, '0')
      }
    }

    setTimeLeft(calculateTimeLeft())

    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(interval)
  }, [targetDate])

  return (
    <div className="flex flex-col items-center gap-1.5 md:gap-2">
      <span className="text-[10px] md:text-xs font-bold text-[#00BFFF] uppercase tracking-[0.2em] font-['Space_Grotesk'] animate-[pulse_2s_infinite]">
        Registrations End In
      </span>
      <div className="flex gap-3 sm:gap-4 md:gap-6 justify-center">
        <TimeUnit value={timeLeft.days} label="D" />
        <TimeUnit value={timeLeft.hours} label="H" />
        <TimeUnit value={timeLeft.minutes} label="M" />
        <TimeUnit value={timeLeft.seconds} label="S" isSeconds />
      </div>
    </div>
  )
}

function TimeUnit({ value, label, isSeconds = false }: { value: string; label: string; isSeconds?: boolean }) {
  const [displayValue, setDisplayValue] = useState(value)
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    if (value !== displayValue) {
      setAnimate(true)
      const timer = setTimeout(() => {
        setDisplayValue(value)
        setAnimate(false)
      }, 300) // matches our slide/fade out duration
      return () => clearTimeout(timer)
    }
  }, [value, displayValue])

  return (
    <div className="flex flex-col items-center">
      <div className="relative min-w-[36px] sm:min-w-[44px] md:min-w-[54px] text-center overflow-hidden">
        <span
          className={`block font-['Outfit'] text-xl sm:text-2xl md:text-3xl font-black text-white select-none transition-all duration-300 ${
            isSeconds ? 'text-[#00BFFF] filter drop-shadow-[0_0_8px_rgba(0,191,255,0.6)]' : 'filter drop-shadow-[0_0_6px_rgba(255,255,255,0.3)]'
          } ${animate ? 'opacity-0 -translate-y-3' : 'opacity-100 translate-y-0'}`}
        >
          {displayValue}
        </span>
      </div>
      <span className="text-[9px] sm:text-[10px] md:text-xs font-bold text-gray-400 tracking-wider font-['Space_Grotesk']">
        {label}
      </span>
    </div>
  )
}
