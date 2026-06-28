import { useState, useEffect, useRef } from 'react'
import { Link } from '@tanstack/react-router'

function Particles() {
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

    const particles: { x: number; y: number; vx: number; vy: number; size: number; alpha: number; color: string }[] = []
    const colors = ['#00BFFF', '#0099FF', '#0066FF', '#00E5FF']

    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2.5 + 0.5,
        alpha: Math.random() * 0.6 + 0.1,
        color: colors[Math.floor(Math.random() * colors.length)],
      })
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach((p, i) => {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.globalAlpha = p.alpha
        ctx.fill()

        // draw lines between close particles
        for (let j = i + 1; j < particles.length; j++) {
          const dx = p.x - particles[j].x
          const dy = p.y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 100) {
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = '#00BFFF'
            ctx.globalAlpha = (1 - dist / 100) * 0.15
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
        ctx.globalAlpha = 1
      })
      animId = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  )
}

function CopyIPButton() {
  const [copied, setCopied] = useState(false)
  const ip = 'play.sennahosting.com'

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(ip)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="group relative flex items-center gap-3 px-5 py-3 rounded-xl border border-[#00BFFF]/30 bg-[#00BFFF]/5 hover:bg-[#00BFFF]/10 hover:border-[#00BFFF]/60 transition-all duration-300 cursor-pointer ip-glow"
    >
      <span className="text-lg">🖥</span>
      <span className="font-mono text-[#00BFFF] font-semibold tracking-wide text-sm sm:text-base">
        {ip}
      </span>
      <span className={`ml-2 text-xs px-2 py-0.5 rounded-md transition-all duration-300 ${
        copied
          ? 'bg-green-500/20 text-green-400 scale-110'
          : 'bg-[#00BFFF]/10 text-[#00BFFF]/70 group-hover:bg-[#00BFFF]/20'
      }`}>
        {copied ? '✓ Copied!' : 'Click to Copy'}
      </span>
    </button>
  )
}

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0B0F17] via-[#0d1526] to-[#0B0F17]" />

      {/* Radial glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[600px] rounded-full bg-[#0066FF]/10 blur-[120px]" />
      </div>

      {/* Particles */}
      <Particles />

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto fade-in-up">
        {/* Logo icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#00BFFF]/20 to-[#0066FF]/20 border border-[#00BFFF]/30 flex items-center justify-center text-5xl shadow-lg shadow-[#00BFFF]/10 hover:shadow-[#00BFFF]/30 transition-all duration-500 hover:scale-110">
              ⚔
            </div>
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-[#00BFFF]/20 to-[#0066FF]/20 blur-lg -z-10" />
          </div>
        </div>

        {/* Title */}
        <h1 className="font-['Space_Grotesk'] font-black text-5xl sm:text-7xl lg:text-8xl tracking-tight mb-4 leading-none">
          <span className="text-gradient">BLUE TIERS</span>
        </h1>

        {/* Subtitle */}
        <p className="text-gray-400 text-lg sm:text-xl mb-8 max-w-xl mx-auto">
          #1 Tier List for all types of players.
        </p>

        {/* Copy IP */}
        <div className="flex justify-center mb-10">
          <CopyIPButton />
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/rankings"
            className="btn-primary w-full sm:w-auto text-center px-8 py-3.5 rounded-xl font-semibold text-white text-sm tracking-wide transition-all duration-300 hover:scale-105"
          >
            View Rankings
          </Link>
          <a
            href="https://discord.gg/DmEPAb3NFU"
            target="_blank"
            rel="noopener noreferrer"
            className="discord-btn w-full sm:w-auto text-center flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-white text-sm tracking-wide transition-all duration-300 hover:scale-105"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057.1 18.08.114 18.1.12 18.12a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
            Join Discord
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce opacity-50">
        <div className="w-5 h-8 border-2 border-[#00BFFF]/40 rounded-full flex justify-center pt-1.5">
          <div className="w-1 h-2 bg-[#00BFFF]/60 rounded-full" />
        </div>
      </div>
    </section>
  )
}
