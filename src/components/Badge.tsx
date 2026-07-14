interface BadgeProps {
  children: React.ReactNode
  pulse?: boolean
}

export function Badge({ children, pulse = false }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-semibold tracking-wide uppercase text-white bg-gradient-to-r from-[#0099FF] to-[#0066FF] shadow-[0_0_16px_rgba(0,153,255,0.45)] ${
        pulse ? 'badge-pulse' : ''
      }`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-white/90" />
      {children}
    </span>
  )
}
