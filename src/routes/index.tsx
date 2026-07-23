import { createFileRoute } from '@tanstack/react-router'
import { Navbar } from '../components/Navbar'
import { Hero } from '../components/Hero'
import { Features } from '../components/Features'
import { Stats } from '../components/Stats'
import { Quote } from '../components/Quote'
import { Footer } from '../components/Footer'
import { StarField } from '../components/StarField'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <div className="relative min-h-screen" style={{ background: '#08000e' }}>
      {/* Fixed starfield + gradient glow layer */}
      <div className="fixed inset-0 pointer-events-none z-0" aria-hidden>
        <StarField />
        {/* Top radial purple glow */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 90% 65% at 55% 0%, rgba(100,20,160,0.45) 0%, transparent 65%), ' +
              'radial-gradient(ellipse 60% 40% at 20% 30%, rgba(60,0,120,0.25) 0%, transparent 55%)',
          }}
        />
      </div>

      {/* Page content */}
      <div className="relative z-10">
        <Navbar />
        <Hero />
        <Stats />
        <Quote />
        <Features />
        <Footer />
      </div>
    </div>
  )
}
