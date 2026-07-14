import { useEffect, useRef } from 'react'
import { Badge } from './Badge'
import { CountdownTimer } from './CountdownTimer'
import { CTAButton } from './CTAButton'

function BannerParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const particles: { x: number; y: number; vx: number; vy: number; size: number; alpha: number }[] = []
    for (let i = 0; i < 36; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        size: Math.random() * 1.8 + 0.4,
        alpha: Math.random() * 0.5 + 0.15,
      })
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach((p) => {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = '#00BFFF'
        ctx.globalAlpha = p.alpha
        ctx.fill()
      })
      ctx.globalAlpha = 1
      animId = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
}

export function EventBanner() {
  return (
    <div className="relative overflow-hidden border-b border-[#00BFFF]/10 banner-gradient">
      {/* Radial glows */}
      <div className="absolute -top-20 -left-16 w-64 h-64 rounded-full bg-[#0066FF]/20 blur-[90px] pointer-events-none" />
      <div className="absolute -top-20 -right-16 w-64 h-64 rounded-full bg-[#00BFFF]/20 blur-[90px] pointer-events-none" />

      {/* Floating particles */}
      <BannerParticles />

      {/* Glass top highlight */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-white/[0.02] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 md:py-4">
        <div className="flex flex-col md:flex-row items-center md:justify-between gap-5 md:gap-6 text-center md:text-left fade-in-up">
          {/* Left: event title + badge */}
          <div className="md:flex-1 min-w-0">
            <h2 className="font-['Space_Grotesk'] font-extrabold text-base sm:text-lg lg:text-xl tracking-tight text-white leading-tight">
              <span className="text-gradient">BLUE NETWORK</span> PVP WORLD CUP
            </h2>
            <p className="text-gray-400 text-xs sm:text-sm mt-0.5">Registrations are now open!</p>
            <div className="mt-2 flex justify-center md:justify-start">
              <Badge pulse>Registrations Closing Soon</Badge>
            </div>
          </div>

          {/* Center: countdown */}
          <div className="shrink-0">
            <CountdownTimer />
          </div>

          {/* Right: CTA */}
          <div className="shrink-0">
            <CTAButton href="https://discord.gg/DmEPAb3NFU">Participate Now!</CTAButton>
          </div>
        </div>
      </div>
    </div>
  )
}
