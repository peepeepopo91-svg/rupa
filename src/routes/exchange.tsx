import { createFileRoute } from '@tanstack/react-router'
import { Navbar } from '../components/Navbar'
import { Footer } from '../components/Footer'
import { ExchangePanel } from '../components/exchange/ExchangePanel'
import { MiningToast } from '../components/mining/MiningToast'
import { MiningProvider, useMining } from '../context/MiningContext'

export const Route = createFileRoute('/exchange')({
  component: () => (
    <MiningProvider>
      <ExchangePage />
    </MiningProvider>
  ),
})

function ExchangePage() {
  const { user } = useMining()

  return (
    <div className="min-h-screen bg-[#0B0F17]">
      <Navbar />
      <MiningToast />

      {/* Page header */}
      <section className="relative pt-64 pb-12 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0066FF]/5 to-transparent pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-64 bg-[#6600FF]/10 blur-[100px] pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-purple-500/20 bg-purple-500/5 text-purple-400 text-xs font-semibold mb-6 tracking-wide uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            Dynamic Market
          </div>
          <h1 className="font-['Space_Grotesk'] font-black text-4xl sm:text-5xl text-white mb-4">
            BlueCoin <span className="text-gradient">Exchange</span>
          </h1>
          <p className="text-gray-500 max-w-md mx-auto text-sm">
            Convert your mined BlueCoin into Gems using the live dynamic exchange rate. Rate fluctuates algorithmically — time your trades wisely.
          </p>

          {user && (
            <div className="mt-6 inline-flex items-center gap-4 px-5 py-3 rounded-2xl glass border border-white/8">
              <div className="flex items-center gap-2">
                <span className="text-[#00BFFF] text-sm">💎</span>
                <span className="text-white font-bold">{Math.floor(user.balance).toLocaleString()}</span>
                <span className="text-gray-500 text-xs">BC</span>
              </div>
              <div className="w-px h-5 bg-white/10" />
              <div className="flex items-center gap-2">
                <span className="text-purple-400 text-sm">✨</span>
                <span className="text-white font-bold">{Math.floor(user.gems ?? 0).toLocaleString()}</span>
                <span className="text-gray-500 text-xs">Gems</span>
              </div>
            </div>
          )}
        </div>
      </section>

      <ExchangePanel />
      <Footer />
    </div>
  )
}
