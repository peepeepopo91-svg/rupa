import { createFileRoute } from '@tanstack/react-router'
import { Navbar } from '../components/Navbar'
import { Hero } from '../components/Hero'
import { Features } from '../components/Features'
import { Stats } from '../components/Stats'
import { Quote } from '../components/Quote'
import { Footer } from '../components/Footer'
import type { Player } from '../data/players'
import defaultPlayers from '../data/players'
import { loadAllData } from '../server/dataFiles'

export const Route = createFileRoute('/')({
  loader: async () => {
    try {
      const data = await loadAllData()
      return { players: (data.players as Player[] | null) ?? defaultPlayers }
    } catch {
      return { players: defaultPlayers }
    }
  },
  component: HomePage,
})

function HomePage() {
  const { players } = Route.useLoaderData()
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <Stats players={players} />
      <Quote />
      <Features />
      <Footer />
    </div>
  )
}
