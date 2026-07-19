export function Features() {
  const features = [
    {
      icon: '🏆',
      title: 'Competitive Rankings',
      description: 'Track the best PvP players across all gamemodes with precise tier placements.',
    },
    {
      icon: '⚔',
      title: 'Multiple Gamemodes',
      description: 'Rankings across all PvP styles — Crystal, Sword, Axe, Mace, UHC, and more.',
    },
    {
      icon: '🌐',
      title: 'Community Driven',
      description: 'Managed by official testers who rigorously evaluate every player\'s skill.',
    },
  ]

  return (
    <section className="py-24 px-4 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#00BFFF]/3 to-transparent pointer-events-none" />
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-['Space_Grotesk'] font-bold text-3xl sm:text-4xl text-white mb-4">
            Why <span className="text-gradient">Blue Tiers?</span>
          </h2>
          <p className="text-gray-500 max-w-md mx-auto">
            The most accurate and trusted tier list in the Minecraft PvP community.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="feature-card group glass rounded-2xl p-8 border border-white/5 transition-all duration-300 hover:-translate-y-1">
              <div className="text-4xl mb-5">{f.icon}</div>
              <h3 className="font-['Space_Grotesk'] font-semibold text-lg text-white mb-3">
                {f.title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
