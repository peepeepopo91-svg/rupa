export function Quote() {
  return (
    <section className="py-20 px-4 relative">
      <div className="max-w-4xl mx-auto text-center">
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <span className="text-6xl text-white/20 font-serif leading-none select-none">&ldquo;</span>
          <p className="text-2xl sm:text-3xl font-bold text-white">
            It&apos;s so{' '}
            <span className="relative inline-block">
              <span
                className="relative z-10"
                style={{
                  background: 'linear-gradient(90deg, #00BFFF, #8b5cf6, #ec4899)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                accurate and fair
              </span>
              <span className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-[#00BFFF] via-[#8b5cf6] to-[#ec4899]" />
            </span>
            {' '}to follow
          </p>
          <span className="text-6xl text-white/20 font-serif leading-none select-none">&rdquo;</span>
        </div>
        <p className="text-[#555555] text-sm mt-4">— Blue Tiers community</p>
      </div>
    </section>
  )
}
