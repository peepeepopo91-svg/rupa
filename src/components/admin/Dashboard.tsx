import { useState, useEffect } from 'react'
import { getPlayers } from '../../store/playersStore'
import { getLogs } from '../../store/adminStore'
import { getPlayerTotalPoints } from '../../data/tiers'
import { getDashboardStats } from '../../server/miningServer'
import type { User, CommunityBlock } from '../../data/mining'
import type { EconomyOverrides } from '../../store/miningStore'
import type { Player } from '../../data/players'
import type { AdminLog } from '../../store/adminStore'

interface Props { admin: string }

interface StatCard {
  icon: string
  label: string
  value: string | number
  sub?: string
  color: string
}

interface DashData {
  stats: StatCard[]
  topPlayers: { player: Player; pts: number }[]
  recentActions: AdminLog[]
  dateLabel: string
}

export function Dashboard({ admin }: Props) {
  // All state starts null — SSR renders loading skeleton, no hydration mismatch
  const [data, setData] = useState<DashData | null>(null)

  useEffect(() => {
    // Fetch server data (disk) and read localStorage in one shot, client-only
    getDashboardStats()
      .catch(() => ({ users: {} as Record<string, User>, community: null as unknown as CommunityBlock, economy: {} as EconomyOverrides }))
      .then(server => {
        const players    = getPlayers()
        const logs       = getLogs()

        const allPoints  = players.map(p => getPlayerTotalPoints(p.ranks))
        const avgPts     = allPoints.length
          ? Math.round(allPoints.reduce((a, b) => a + b, 0) / allPoints.length)
          : 0
        const ht1Count   = players.filter(p => Object.values(p.ranks).some(r => r === 'HT1')).length
        const recentLogs = logs.filter(l => Date.now() - l.timestamp < 86_400_000).length

        const userList   = Object.values(server.users)
        const community  = server.community
        const economy    = server.economy ?? {}

        const totalBC    = userList.reduce((s, u) => s + (u.balance ?? 0), 0)
        const totalGems  = userList.reduce((s, u) => s + (u.gems ?? 0), 0)
        const activeRigs = userList.reduce((s, u) => s + u.rigs.filter(r => r.status === 'mining').length, 0)
        const totalRigs  = userList.reduce((s, u) => s + u.rigs.length, 0)
        const ovCount    = Object.keys(economy).filter(k => (economy as Record<string, unknown>)[k] !== undefined).length

        setData({
          stats: [
            { icon: '📋', label: 'Ranked Players',    value: players.length,                                   sub: `${ht1Count} in HT1`,             color: 'text-[#00BFFF]' },
            { icon: '⭐', label: 'Avg Player Score',   value: avgPts + ' pts',                                 sub: `${allPoints.filter(p=>p>0).length} scored`, color: 'text-yellow-400' },
            { icon: '👥', label: 'Mining Accounts',    value: userList.length,                                  sub: `${activeRigs} active rigs`,       color: 'text-green-400' },
            { icon: '₿',  label: 'Total BC in Circ',   value: Math.floor(totalBC).toLocaleString(),            sub: 'BlueCoin',                        color: 'text-amber-400' },
            { icon: '💎', label: 'Total Gems in Circ', value: Math.floor(totalGems).toLocaleString(),          sub: 'Gems',                            color: 'text-purple-400' },
            { icon: '⛏️', label: 'Total Mining Rigs',  value: totalRigs,                                       sub: `${activeRigs} running`,           color: 'text-cyan-400' },
            { icon: '🧱', label: 'Blocks Solved',      value: community?.totalSolved?.toLocaleString() ?? '0', sub: community ? `Block #${community.blockNumber}` : '', color: 'text-emerald-400' },
            { icon: '⚙️', label: 'Economy Overrides',  value: ovCount,                                         sub: ovCount ? 'Active' : 'Defaults',  color: ovCount ? 'text-orange-400' : 'text-gray-500' },
            { icon: '📊', label: 'Actions Today',      value: recentLogs,                                      sub: 'in logs',                        color: 'text-pink-400' },
          ],
          topPlayers: [...players]
            .sort((a, b) => getPlayerTotalPoints(b.ranks) - getPlayerTotalPoints(a.ranks))
            .slice(0, 5)
            .map(p => ({ player: p, pts: getPlayerTotalPoints(p.ranks) })),
          recentActions: logs.slice(0, 8),
          dateLabel: new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
        })
      })
  }, [])

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="glass rounded-2xl border border-white/8 p-6 bg-gradient-to-r from-[#00BFFF]/5 to-transparent">
        <div className="flex items-center gap-3">
          <div className="text-3xl">👋</div>
          <div>
            <h2 className="font-['Space_Grotesk'] font-black text-white text-xl">
              Welcome back, {admin}
            </h2>
            {/* Date rendered client-only to avoid SSR/client timezone mismatch */}
            <p className="text-gray-500 text-sm">{data?.dateLabel ?? ''}</p>
          </div>
        </div>
      </div>

      {/* Stat grid */}
      <div>
        <h3 className="text-gray-500 text-xs uppercase tracking-widest mb-4">Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-4">
          {data ? data.stats.map(card => (
            <div key={card.label} className="glass rounded-xl border border-white/8 p-5 hover:border-white/15 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <span className="text-2xl">{card.icon}</span>
              </div>
              <p className={`font-['Space_Grotesk'] font-black text-2xl ${card.color} leading-tight`}>
                {card.value}
              </p>
              <p className="text-white text-xs font-semibold mt-1">{card.label}</p>
              {card.sub && <p className="text-gray-600 text-[10px] mt-0.5">{card.sub}</p>}
            </div>
          )) : (
            // Skeleton — identical on SSR and initial client render
            Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="glass rounded-xl border border-white/8 p-5 animate-pulse">
                <div className="h-6 w-6 rounded bg-white/5 mb-3" />
                <div className="h-7 w-20 rounded bg-white/5 mb-2" />
                <div className="h-3 w-28 rounded bg-white/5" />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top players */}
        <div className="glass rounded-2xl border border-white/8 p-5">
          <h3 className="text-white font-bold text-sm mb-4">🏆 Top 5 Players</h3>
          {data ? (
            <div className="space-y-2.5">
              {data.topPlayers.map(({ player: p, pts }, i) => (
                <div key={p.name} className="flex items-center gap-3">
                  <span className="text-gray-700 text-xs w-4 font-mono">#{i + 1}</span>
                  <img src={p.head} alt={p.name} className="w-7 h-7 rounded-lg" onError={e => { (e.target as HTMLImageElement).src = '' }} />
                  <span className="text-white text-sm font-semibold flex-1 truncate">{p.name}</span>
                  <span className="text-gray-500 text-xs">{p.region}</span>
                  <span className="font-mono text-[#00BFFF] text-xs font-bold">{pts} pts</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-4 h-3 rounded bg-white/5" />
                  <div className="w-7 h-7 rounded-lg bg-white/5" />
                  <div className="flex-1 h-3 rounded bg-white/5" />
                  <div className="w-16 h-3 rounded bg-white/5" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent actions */}
        <div className="glass rounded-2xl border border-white/8 p-5">
          <h3 className="text-white font-bold text-sm mb-4">🕐 Recent Activity</h3>
          {!data ? (
            <div className="space-y-2.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-start gap-2.5 animate-pulse">
                  <div className="w-14 h-3 rounded bg-white/5 mt-0.5" />
                  <div className="flex-1 h-3 rounded bg-white/5" />
                </div>
              ))}
            </div>
          ) : data.recentActions.length === 0 ? (
            <p className="text-gray-600 text-sm text-center py-6">No recent activity</p>
          ) : (
            <div className="space-y-2.5">
              {data.recentActions.map(log => (
                <div key={log.id} className="flex items-start gap-2.5">
                  <span className="text-[10px] font-mono text-gray-700 mt-0.5 shrink-0 w-14">
                    {new Date(log.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] bg-white/5 text-gray-400 px-1.5 py-0.5 rounded-md font-mono">{log.action}</span>
                    {log.details && <p className="text-gray-600 text-[10px] mt-0.5 truncate">{log.details}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
