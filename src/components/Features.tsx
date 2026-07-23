import { Trophy, Shield, Users } from 'lucide-react'

const features = [
  {
    icon: Trophy,
    title: 'Competitive Rankings',
    description: 'Track the best PvP players across all gamemodes with precise tier placements.',
  },
  {
    icon: Shield,
    title: 'Multiple Gamemodes',
    description: 'Rankings across all PvP styles — Crystal, Sword, Axe, Mace, UHC, and more.',
  },
  {
    icon: Users,
    title: 'Community Driven',
    description: "Managed by official testers who rigorously evaluate every player's skill.",
  },
]

export function Features() {
  return (
    <section className="py-24 px-4 border-t border-[#111111]">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Why Blue Tiers?
          </h2>
          <p className="text-[#555555] text-sm max-w-sm mx-auto">
            The most accurate and trusted tier list in the Minecraft PvP community.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {features.map((f) => {
            const Icon = f.icon
            return (
              <div
                key={f.title}
                className="group p-6 rounded-2xl bg-[#0d0d0d] border border-[#1a1a1a] hover:border-[#2a2a2a] transition-all duration-200"
              >
                <div className="w-9 h-9 rounded-xl bg-[#111111] border border-[#222222] flex items-center justify-center mb-4">
                  <Icon size={16} className="text-white" strokeWidth={1.8} />
                </div>
                <h3 className="font-semibold text-white text-[15px] mb-2">{f.title}</h3>
                <p className="text-[#555555] text-sm leading-relaxed">{f.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
