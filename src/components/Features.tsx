// Real gamemodes from src/data/gamemodes.ts
const MODES = [
  { label: 'Sword',   icon: '⚔️' },
  { label: 'Crystal', icon: '💎' },
  { label: 'Axe',     icon: '🪓' },
  { label: 'Mace',    icon: '🔨' },
  { label: 'UHC',     icon: '🏆' },
  { label: 'Nethpot', icon: '🧪' },
  { label: 'Diapot',  icon: '⚗️' },
]

export function Features() {
  return (
    <section className="py-20 px-4 relative overflow-hidden">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="font-black text-4xl sm:text-5xl text-white leading-tight">
            Every game mode<br />you could imagine
          </h2>
          <p className="text-white/40 text-sm mt-3">7 competitive PvP modes, each with its own ranked tier list.</p>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          {MODES.map((mode) => (
            <div
              key={mode.label}
              className="
                group flex flex-col items-center justify-center gap-3
                w-32 h-32 sm:w-36 sm:h-36
                rounded-2xl bg-white/4 border border-white/8
                hover:border-white/20 hover:bg-white/8
                transition-all duration-200 cursor-pointer
              "
            >
              <span className="text-4xl select-none">{mode.icon}</span>
              <span className="text-white/60 text-xs font-medium group-hover:text-white transition-colors">
                {mode.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
