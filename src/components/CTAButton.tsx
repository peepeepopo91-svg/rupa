interface CTAButtonProps {
  href: string
  children: React.ReactNode
}

export function CTAButton({ href, children }: CTAButtonProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="cta-shine group relative inline-flex items-center gap-2 overflow-hidden rounded-full px-5 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-bold tracking-wide text-white bg-gradient-to-r from-[#00BFFF] via-[#0099FF] to-[#0066FF] shadow-[0_0_20px_rgba(0,153,255,0.4)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_35px_rgba(0,191,255,0.6)] whitespace-nowrap"
    >
      <span className="relative z-10">{children}</span>
      <svg
        className="relative z-10 shrink-0 transition-transform duration-300 group-hover:translate-x-1"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
      >
        <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </a>
  )
}
