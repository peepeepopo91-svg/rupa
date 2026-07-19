import { useState, useEffect } from 'react'
import { getLogs, clearLogs, addLog } from '../../store/adminStore'
import type { AdminLog } from '../../store/adminStore'
import { AdminPaginator } from './AdminPaginator'

const PAGE_SIZE = 10

interface Props { admin: string }

const ACTION_COLORS: Record<string, string> = {
  'player:add':     'bg-green-500/10 text-green-400 border-green-500/20',
  'player:edit':    'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'player:delete':  'bg-red-500/10 text-red-400 border-red-500/20',
  'player:import':  'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  'player:reset':   'bg-orange-500/10 text-orange-400 border-orange-500/20',
  'economy:save':   'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'economy:reset':  'bg-orange-500/10 text-orange-400 border-orange-500/20',
  'user:delete':    'bg-red-500/10 text-red-400 border-red-500/20',
  'user:edit':      'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'mining:give':    'bg-green-500/10 text-green-400 border-green-500/20',
  'mining:take':    'bg-red-500/10 text-red-400 border-red-500/20',
  'content:save':   'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  'content:reset':  'bg-orange-500/10 text-orange-400 border-orange-500/20',
  'event:save':     'bg-pink-500/10 text-pink-400 border-pink-500/20',
  'event:reset':    'bg-orange-500/10 text-orange-400 border-orange-500/20',
  'gamemode:add':   'bg-green-500/10 text-green-400 border-green-500/20',
  'gamemode:edit':  'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'gamemode:delete':'bg-red-500/10 text-red-400 border-red-500/20',
  'logs:clear':     'bg-gray-500/10 text-gray-400 border-gray-500/20',
}

function getColor(action: string) {
  return ACTION_COLORS[action] ?? 'bg-white/5 text-gray-400 border-white/10'
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts
  if (diff < 60_000)  return `${Math.floor(diff / 1000)}s ago`
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`
  return new Date(ts).toLocaleDateString()
}

export function ActivityLogs({ admin }: Props) {
  const [logs, setLogs]     = useState<AdminLog[]>(getLogs)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<string>('all')
  const [showConfirm, setShowConfirm] = useState(false)
  const [page, setPage]     = useState(1)

  const refresh = () => setLogs(getLogs())

  // Reset to page 1 when search or filter changes
  useEffect(() => { setPage(1) }, [search, filter])

  const actionTypes = ['all', ...Array.from(new Set(logs.map(l => l.action)))]

  const filtered = logs.filter(l => {
    const matchFilter = filter === 'all' || l.action === filter
    const q = search.toLowerCase()
    const matchSearch = !q || l.action.includes(q) || l.admin.includes(q) || (l.details ?? '').toLowerCase().includes(q)
    return matchFilter && matchSearch
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage   = Math.min(page, totalPages)
  const pagedLogs  = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  function handleClear() {
    clearLogs()
    addLog(admin, 'logs:clear', 'Cleared all activity logs')
    setShowConfirm(false)
    refresh()
  }

  return (
    <div className="space-y-6">
      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Logs',   value: logs.length },
          { label: 'Today',        value: logs.filter(l => Date.now() - l.timestamp < 86_400_000).length },
          { label: 'This Hour',    value: logs.filter(l => Date.now() - l.timestamp < 3_600_000).length },
          { label: 'Action Types', value: actionTypes.length - 1 },
        ].map(stat => (
          <div key={stat.label} className="glass rounded-xl border border-white/8 p-4 text-center">
            <p className="font-['Space_Grotesk'] font-black text-2xl text-white">{stat.value}</p>
            <p className="text-gray-600 text-xs mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search logs…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 bg-white/3 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-700 outline-none focus:border-[#00BFFF]/40 transition-all"
        />
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="bg-white/3 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#00BFFF]/40"
        >
          {actionTypes.map(a => (
            <option key={a} value={a} className="bg-[#0B0F17]">
              {a === 'all' ? 'All Actions' : a}
            </option>
          ))}
        </select>
        <button
          onClick={refresh}
          className="px-4 py-2.5 rounded-xl text-sm text-gray-400 border border-white/8 hover:border-white/20 hover:text-white transition-all"
        >
          ↻ Refresh
        </button>
        <button
          onClick={() => setShowConfirm(true)}
          className="px-4 py-2.5 rounded-xl text-sm text-red-400 border border-red-500/20 hover:bg-red-500/10 transition-all"
        >
          🗑 Clear All
        </button>
      </div>

      {/* Log table */}
      <div className="glass rounded-2xl border border-white/8 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-gray-600 text-sm">No logs found.</div>
        ) : (
          <div className="divide-y divide-white/5">
            {pagedLogs.map(log => (
              <div key={log.id} className="flex items-start gap-4 px-5 py-3.5 hover:bg-white/2 transition-colors">
                <span className={`mt-0.5 px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold border shrink-0 ${getColor(log.action)}`}>
                  {log.action}
                </span>
                <div className="flex-1 min-w-0">
                  {log.details && (
                    <p className="text-gray-400 text-xs truncate">{log.details}</p>
                  )}
                  <p className="text-gray-700 text-[10px] mt-0.5">by {log.admin}</p>
                </div>
                <span className="text-gray-700 text-[10px] shrink-0">{timeAgo(log.timestamp)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <AdminPaginator
        page={safePage}
        totalPages={totalPages}
        totalItems={filtered.length}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
      />

      {/* Confirm clear */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="glass rounded-2xl border border-red-500/20 p-6 max-w-sm w-full text-center">
            <div className="text-4xl mb-3">🗑️</div>
            <h3 className="text-white font-bold text-lg mb-2">Clear All Logs?</h3>
            <p className="text-gray-500 text-sm mb-6">This will permanently delete all {logs.length} activity log entries.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(false)} className="flex-1 py-2.5 rounded-xl text-sm text-gray-400 border border-white/10 hover:bg-white/5">Cancel</button>
              <button onClick={handleClear} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-red-400 border border-red-500/30 bg-red-500/10 hover:bg-red-500/20">Clear All</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
