const MODES = [
  { label: 'Sword',        icon: '⚔️',  featured: false },
  { label: 'Crystal',      icon: '💎',  featured: false },
  { label: 'Mace',         icon: '🔨',  featured: true  },
  { label: 'Axe',          icon: '🪓',  featured: false },
  { label: 'UHC',          icon: '🍎',  featured: false },
  { label: 'Pot',          icon: '🧪',  featured: false },
  { label: 'Bedfight',     icon: '🛏️',  featured: true  },
  { label: 'Fireball',     icon: '🔥',  featured: false },
  { label: 'SMP',          icon: '🌍',  featured: false },
]

export function Features() {
  return (
    <section className="py-20 px-4 relative overflow-hidden">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="font-black text-4xl sm:text-5xl text-white leading-tight">
            Every game mode<br />you could imagine
          </h2>
        </div>

        {/* Staggered grid — mimic tiertests layout */}
        <div className="flex flex-wrap justify-center items-end gap-4">
          {MODES.map((mode, i) => {
            const big = mode.featured
            return (
              <div
                key={mode.label}
                className={`
                  group relative flex flex-col items-center justify-end
                  rounded-2xl bg-[#111111] border border-[#1e1e1e]
                  hover:border-[#2e2e2e] hover:bg-[#161616]
                  transition-all duration-200 cursor-pointer
                  ${big
                    ? 'w-32 h-36 sm:w-36 sm:h-40 -translate-y-4'
                    : 'w-28 h-28 sm:w-32 sm:h-32'
                  }
                  ${i % 3 === 1 ? '-translate-y-2' : ''}
                `}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <span className={`select-none ${big ? 'text-5xl mb-4' : 'text-4xl mb-3'}`}>
                  {mode.icon}
                </span>
                <span className="text-white/70 text-xs font-medium pb-3 group-hover:text-white transition-colors">
                  {mode.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
