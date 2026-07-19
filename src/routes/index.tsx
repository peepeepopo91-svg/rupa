import { createFileRoute } from '@tanstack/react-router'
import { Navbar } from '../components/Navbar'
import { Hero } from '../components/Hero'
import { Features } from '../components/Features'
import { Stats } from '../components/Stats'
import { Footer } from '../components/Footer'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <div className="min-h-screen bg-[#0B0F17]">
      <Navbar />
      <Hero />
      <Features />
      <Stats />
      <Footer />
    </div>
  )
}
