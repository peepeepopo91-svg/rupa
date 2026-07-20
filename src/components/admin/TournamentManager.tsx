import { useState, useEffect } from 'react'
import type { Tournament, Team, Match, Prize, Reward, TournamentsFile } from '../../data/tournament'
import { STATUS_LABEL, MATCH_STATUS_LABEL, DEFAULT_PRIZES, DEFAULT_RULES } from '../../data/tournament'
import {
  getTournamentData, createTournament, updateTournament, deleteTournament,
  setActiveTournament, archiveTournament, duplicateTournament,
  updateTeamStatus, removeTeam,
  generateBracket, updateMatch,
  updatePrizes, updateRules,
  addAnnouncement, deleteAnnouncement,
} from '../../server/tournamentServer'
import { AdminPaginator } from './AdminPaginator'

// ─── Sub-tab types ────────────────────────────────────────────────────────────

type TTab = 'dashboard' | 'tournaments' | 'teams' | 'bracket' | 'matches' | 'prizes' | 'announcements' | 'rules'

const TTABS: { id: TTab; label: string; icon: string }[] = [
  { id: 'dashboard',     label: 'Dashboard',     icon: '🏠' },
  { id: 'tournaments',   label: 'Tournaments',   icon: '🏆' },
  { id: 'teams',         label: 'Teams',         icon: '👥' },
  { id: 'bracket',       label: 'Bracket',       icon: '⚔️' },
  { id: 'matches',       label: 'Matches',       icon: '🎮' },
  { id: 'prizes',        label: 'Prizes',        icon: '🎁' },
  { id: 'rules',         label: 'Rules',         icon: '📜' },
  { id: 'announcements', label: 'Announcements', icon: '📣' },
]

interface Props { admin: string }

// ─── Main component ───────────────────────────────────────────────────────────

export function TournamentManager({ admin }: Props) {
  const [tab, setTab]       = useState<TTab>('dashboard')
  const [data, setData]     = useState<TournamentsFile | null>(null)
  const [loading, setLoad]  = useState(true)
  const [msg, setMsg]       = useState<{ text: string; ok: boolean } | null>(null)

  async function load() {
    try { setData(await getTournamentData()) } catch {}
    finally { setLoad(false) }
  }

  useEffect(() => { load() }, [])

  function flash(text: string, ok = true) {
    setMsg({ text, ok })
    setTimeout(() => setMsg(null), 3500)
  }

  const active = data?.activeTournamentId
    ? (data.tournaments.find(t => t.id === data.activeTournamentId) ?? null)
    : null

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <div className="text-3xl animate-spin">⟳</div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Flash message */}
      {msg && (
        <div className={`px-4 py-3 rounded-xl text-sm font-semibold border ${msg.ok ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
          {msg.text}
        </div>
      )}

      {/* Sub-tab bar */}
      <div className="flex gap-1 flex-wrap">
        {TTABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
              tab === t.id
                ? 'bg-[#00BFFF]/15 text-[#00BFFF] border border-[#00BFFF]/30'
                : 'text-gray-500 hover:text-gray-300 border border-white/5'
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'dashboard'     && <TDashboard data={data} active={active} setTab={setTab} />}
      {tab === 'tournaments'   && <TTournaments data={data} active={active} flash={flash} reload={load} />}
      {tab === 'teams'         && <TTeams active={active} flash={flash} reload={load} />}
      {tab === 'bracket'       && <TBracket active={active} flash={flash} reload={load} />}
      {tab === 'matches'       && <TMatches active={active} flash={flash} reload={load} />}
      {tab === 'prizes'        && <TPrizes active={active} flash={flash} reload={load} />}
      {tab === 'rules'         && <TRules active={active} flash={flash} reload={load} />}
      {tab === 'announcements' && <TAnnouncements active={active} admin={admin} flash={flash} reload={load} />}
    </div>
  )
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

function TDashboard({ data, active, setTab }: { data: TournamentsFile | null; active: Tournament | null; setTab: (t: TTab) => void }) {
  const all = data?.tournaments ?? []
  const completed    = all.filter(t => t.status === 'completed' || t.status === 'archived').length
  const approvedTeams = active?.teams.filter(t => t.status === 'approved').length ?? 0
  const totalPlayers  = active?.teams.filter(t => t.status === 'approved').reduce((n, t) => n + t.players.length, 0) ?? 0
  const liveMatches   = active?.matches.filter(m => m.status === 'live').length ?? 0
  const completedM    = active?.matches.filter(m => m.status === 'completed').length ?? 0
  const remainingM    = active?.matches.filter(m => m.status === 'scheduled' || m.status === 'pending').length ?? 0

  return (
    <div className="space-y-6">
      {active ? (
        <div className="bg-gradient-to-r from-[#00BFFF]/10 to-transparent border border-[#00BFFF]/20 rounded-xl p-5 flex items-center gap-4">
          <span className="text-3xl">🏆</span>
          <div>
            <p className="text-[#00BFFF] text-xs uppercase font-bold tracking-widest">Active Tournament</p>
            <p className="text-white font-bold text-lg">{active.name}</p>
            <p className="text-gray-500 text-xs capitalize">{STATUS_LABEL[active.status]}</p>
          </div>
        </div>
      ) : (
        <div className="bg-[#111827] border border-white/5 rounded-xl p-5 text-center">
          <p className="text-gray-500 text-sm">No active tournament. <button onClick={() => setTab('tournaments')} className="text-[#00BFFF] hover:underline">Create one →</button></p>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Tournaments', value: all.length,     icon: '🏆', sub: `${completed} archived` },
          { label: 'Approved Teams',    value: approvedTeams,  icon: '👥', sub: `${totalPlayers} players` },
          { label: 'Completed Matches', value: completedM,     icon: '✅', sub: `${remainingM} remaining` },
          { label: 'Live Matches',      value: liveMatches,    icon: '🔴', sub: 'right now' },
        ].map(c => (
          <div key={c.label} className="bg-[#111827] border border-white/5 rounded-xl p-4">
            <div className="text-2xl mb-2">{c.icon}</div>
            <div className="font-['Space_Grotesk'] font-black text-2xl text-white">{c.value}</div>
            <div className="text-gray-500 text-xs mt-0.5">{c.label}</div>
            <div className="text-gray-700 text-[10px] mt-0.5">{c.sub}</div>
          </div>
        ))}
      </div>

      {/* Pending registrations */}
      {active && (
        <PendingRegistrations teams={active.teams} />
      )}
    </div>
  )
}

function PendingRegistrations({ teams }: { teams: Team[] }) {
  const pending = teams.filter(t => t.status === 'pending')
  if (pending.length === 0) return null
  return (
    <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4 space-y-2">
      <p className="text-yellow-400 text-xs font-bold uppercase tracking-wider">⚠️ {pending.length} Pending Registration(s)</p>
      <div className="flex flex-wrap gap-2">
        {pending.slice(0, 5).map(t => (
          <span key={t.id} className="text-white text-xs bg-white/5 px-2 py-1 rounded">{t.name}</span>
        ))}
        {pending.length > 5 && <span className="text-gray-500 text-xs px-2 py-1">+{pending.length - 5} more</span>}
      </div>
    </div>
  )
}

// ─── Tournaments CRUD ─────────────────────────────────────────────────────────

function TTournaments({ data, active, flash, reload }: { data: TournamentsFile | null; active: Tournament | null; flash: (t: string, ok?: boolean) => void; reload: () => void }) {
  const [editing, setEditing]   = useState<Partial<Tournament> | false>(false)
  const [saving, setSaving]     = useState(false)
  const [page, setPage]         = useState(1)
  const PER_PAGE = 10

  const all    = data?.tournaments ?? []
  const sorted = [...all].sort((a, b) => b.createdAt - a.createdAt)
  const paged  = sorted.slice((page - 1) * PER_PAGE, page * PER_PAGE)
  const pages  = Math.ceil(all.length / PER_PAGE)

  function startNew() {
    setEditing({
      name: '', description: '', banner: '', status: 'upcoming' as const,
      gamemode: '', serverIp: '', maxTeamSize: 2, minTeamSize: 2,
      registrationDeadline: null, startDate: null, prizePool: '',
    })
  }

  async function save() {
    if (editing === false) return
    if (!editing.name?.trim()) return flash('Tournament name is required', false)
    setSaving(true)
    try {
      if ('id' in editing && editing.id) {
        await updateTournament({ data: editing as any })
        flash('Tournament updated')
      } else {
        await createTournament({ data: editing as any })
        flash('Tournament created')
      }
      setEditing(false)
      reload()
    } catch { flash('Error saving tournament', false) }
    finally { setSaving(false) }
  }

  async function doDelete(id: string) {
    if (!confirm('Delete this tournament? This cannot be undone.')) return
    await deleteTournament({ data: { id } })
    flash('Tournament deleted')
    reload()
  }

  async function setActive(id: string | null) {
    await setActiveTournament({ data: { id } })
    flash(id ? 'Tournament set as active' : 'Active tournament cleared')
    reload()
  }

  async function doArchive(id: string) {
    await archiveTournament({ data: { id } })
    flash('Tournament archived')
    reload()
  }

  async function doDuplicate(id: string) {
    await duplicateTournament({ data: { id } })
    flash('Tournament duplicated')
    reload()
  }

  if (editing !== false) {
    return <TournamentForm editing={editing} setEditing={setEditing} save={save} saving={saving} />
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-gray-500 text-sm">{all.length} tournament(s)</p>
        <button onClick={startNew} className="px-4 py-2 rounded-lg bg-[#00BFFF] text-black text-xs font-bold hover:bg-[#00BFFF]/80 transition-all">
          + Create Tournament
        </button>
      </div>

      {all.length === 0 ? (
        <div className="text-center py-16 text-gray-600">No tournaments yet. Create your first one!</div>
      ) : (
        <div className="space-y-3">
          {paged.map(t => (
            <div key={t.id} className={`bg-[#111827] border rounded-xl p-4 flex items-center gap-4 ${active?.id === t.id ? 'border-[#00BFFF]/30' : 'border-white/5'}`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-white font-semibold text-sm">{t.name}</p>
                  {active?.id === t.id && <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#00BFFF]/15 text-[#00BFFF] font-bold uppercase">Active</span>}
                  <span className={`text-[9px] px-2 py-0.5 rounded-full border font-bold uppercase ${
                    { upcoming:'border-blue-400/20 text-blue-400', registration_open:'border-green-400/20 text-green-400', registration_closed:'border-yellow-400/20 text-yellow-400', live:'border-red-400/20 text-red-400', completed:'border-gray-400/20 text-gray-400', archived:'border-gray-600/20 text-gray-600' }[t.status] ?? 'border-white/10 text-gray-500'
                  }`}>
                    {STATUS_LABEL[t.status]}
                  </span>
                </div>
                <div className="flex gap-4 mt-1 text-xs text-gray-600">
                  <span>👥 {t.teams.filter(tm => tm.status === 'approved').length} teams</span>
                  <span>🎮 {t.matches.filter(m => m.status === 'completed').length}/{t.matches.filter(m => m.status !== 'bye').length} matches</span>
                  {t.gamemode && <span>⚔️ {t.gamemode}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
                <button onClick={() => setActive(active?.id === t.id ? null : t.id)} className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${active?.id === t.id ? 'border-[#00BFFF]/30 text-[#00BFFF] hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20' : 'border-white/10 text-gray-500 hover:text-[#00BFFF] hover:border-[#00BFFF]/20'}`}>
                  {active?.id === t.id ? 'Deactivate' : 'Set Active'}
                </button>
                <button onClick={() => setEditing(t)} className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold border border-white/10 text-gray-500 hover:text-white transition-all">Edit</button>
                <button onClick={() => doDuplicate(t.id)} className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold border border-white/10 text-gray-500 hover:text-white transition-all">Dup.</button>
                {t.status !== 'archived' && <button onClick={() => doArchive(t.id)} className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold border border-white/10 text-gray-500 hover:text-yellow-400 hover:border-yellow-400/20 transition-all">Archive</button>}
                <button onClick={() => doDelete(t.id)} className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold border border-white/5 text-gray-700 hover:text-red-400 hover:border-red-500/20 transition-all">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {pages > 1 && (
        <AdminPaginator page={page} totalPages={pages} totalItems={all.length} pageSize={PER_PAGE} onPageChange={setPage} />
      )}
    </div>
  )
}

function TournamentForm({ editing, setEditing, save, saving }: { editing: Partial<Tournament>; setEditing: (t: Partial<Tournament> | false) => void; save: () => void; saving: boolean }) {
  const set = (k: string, v: any) => setEditing({ ...(editing as Partial<Tournament>), [k]: v })
  const toDatetimeLocal = (ts: number | null | undefined) => ts ? new Date(ts - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''
  const fromDatetimeLocal = (s: string) => s ? new Date(s).getTime() : null

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => setEditing(false)} className="text-gray-500 hover:text-white text-sm">← Back</button>
        <h3 className="font-['Space_Grotesk'] font-bold text-white">{'id' in editing && editing.id ? 'Edit Tournament' : 'New Tournament'}</h3>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <Field label="Tournament Name *" value={editing.name ?? ''} onChange={v => set('name', v)} placeholder="e.g. Blue Network PvP World Cup" />
        <Field label="Gamemode" value={editing.gamemode ?? ''} onChange={v => set('gamemode', v)} placeholder="e.g. Crystal PvP" />
        <Field label="Server IP" value={editing.serverIp ?? ''} onChange={v => set('serverIp', v)} placeholder="play.example.com" />
        <Field label="Prize Pool" value={editing.prizePool ?? ''} onChange={v => set('prizePool', v)} placeholder="e.g. 50,000 BlueCoins" />
        <div>
          <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Status</label>
          <select value={editing.status ?? 'upcoming'} onChange={e => set('status', e.target.value)} className="w-full bg-[#0B0F17] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#00BFFF]/50">
            {(['upcoming','registration_open','registration_closed','live','completed','archived'] as const).map(s => (
              <option key={s} value={s}>{STATUS_LABEL[s]}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Min Team Size</label>
            <input type="number" min={1} max={50} value={editing.minTeamSize ?? 2} onChange={e => set('minTeamSize', +e.target.value)} className="w-full bg-[#0B0F17] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Max Team Size</label>
            <input type="number" min={1} max={50} value={editing.maxTeamSize ?? 2} onChange={e => set('maxTeamSize', +e.target.value)} className="w-full bg-[#0B0F17] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none" />
          </div>
        </div>
        <div>
          <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Registration Deadline</label>
          <input type="datetime-local" value={toDatetimeLocal(editing.registrationDeadline)} onChange={e => set('registrationDeadline', fromDatetimeLocal(e.target.value))} className="w-full bg-[#0B0F17] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Start Date</label>
          <input type="datetime-local" value={toDatetimeLocal(editing.startDate)} onChange={e => set('startDate', fromDatetimeLocal(e.target.value))} className="w-full bg-[#0B0F17] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none" />
        </div>
        <div className="md:col-span-2">
          <Field label="Banner URL" value={editing.banner ?? ''} onChange={v => set('banner', v)} placeholder="https://..." />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Description</label>
          <textarea value={editing.description ?? ''} onChange={e => set('description', e.target.value)} rows={3} placeholder="Tournament description..." className="w-full bg-[#0B0F17] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm resize-none focus:outline-none focus:border-[#00BFFF]/50 placeholder-gray-700" />
        </div>
      </div>
      <div className="flex gap-3">
        <button onClick={save} disabled={saving} className="px-6 py-2.5 rounded-lg bg-[#00BFFF] text-black text-xs font-bold hover:bg-[#00BFFF]/80 disabled:opacity-50 transition-all">
          {saving ? 'Saving…' : 'Save Tournament'}
        </button>
        <button onClick={() => setEditing(false)} className="px-6 py-2.5 rounded-lg border border-white/10 text-gray-500 text-xs font-bold hover:text-white transition-all">Cancel</button>
      </div>
    </div>
  )
}

// ─── Teams management ─────────────────────────────────────────────────────────

function TTeams({ active, flash, reload }: { active: Tournament | null; flash: (t: string, ok?: boolean) => void; reload: () => void }) {
  const [page, setPage]     = useState(1)
  const [filter, setFilter] = useState<string>('all')
  const PER_PAGE = 10

  if (!active) return <NoActiveTournament />

  const teams  = active.teams.filter(t => filter === 'all' || t.status === filter)
  const paged  = teams.slice((page - 1) * PER_PAGE, page * PER_PAGE)
  const pages  = Math.ceil(teams.length / PER_PAGE)

  async function setStatus(teamId: string, status: Team['status']) {
    await updateTeamStatus({ data: { tournamentId: active!.id, teamId, status, notes: '' } })
    flash(`Team ${status}`)
    reload()
  }

  async function doRemove(teamId: string) {
    if (!confirm('Remove this team?')) return
    await removeTeam({ data: { tournamentId: active!.id, teamId } })
    flash('Team removed')
    reload()
  }

  const statusCounts = ['pending','approved','rejected','eliminated','disqualified'].reduce((acc, s) => {
    acc[s] = active.teams.filter(t => t.status === s).length
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-gray-500 text-sm">{active.teams.length} total registrations</p>
        <div className="flex gap-2 flex-wrap">
          {['all','pending','approved','rejected','eliminated'].map(f => (
            <button key={f} onClick={() => { setFilter(f); setPage(1) }} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all ${filter === f ? 'bg-[#00BFFF]/15 border-[#00BFFF]/30 text-[#00BFFF]' : 'border-white/10 text-gray-600 hover:text-gray-300'}`}>
              {f}{f !== 'all' && statusCounts[f] ? ` (${statusCounts[f]})` : ''}
            </button>
          ))}
        </div>
      </div>

      {paged.length === 0 ? (
        <div className="text-center py-12 text-gray-600">No teams in this category.</div>
      ) : (
        <div className="space-y-3">
          {paged.map(team => (
            <div key={team.id} className="bg-[#111827] border border-white/5 rounded-xl p-4">
              <div className="flex items-start gap-4">
                <img src={`https://mc-heads.net/avatar/${team.captain}/32`} className="w-10 h-10 rounded-lg flex-shrink-0" alt="" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-white font-bold text-sm">{team.name}</p>
                    <TeamStatusBadge status={team.status} />
                  </div>
                  <p className="text-gray-500 text-xs mt-0.5">Captain: <span className="text-gray-300">{team.captain}</span></p>
                  <p className="text-gray-600 text-xs">{team.players.join(', ')}</p>
                  <p className="text-gray-700 text-[10px] mt-1">Registered {new Date(team.registeredAt).toLocaleString()}</p>
                </div>
                <div className="flex flex-col gap-1.5 flex-shrink-0">
                  {team.status !== 'approved'   && <ActionBtn label="Approve"  onClick={() => setStatus(team.id, 'approved')}  color="green" />}
                  {team.status !== 'rejected'   && <ActionBtn label="Reject"   onClick={() => setStatus(team.id, 'rejected')}  color="red" />}
                  {team.status !== 'eliminated' && <ActionBtn label="Eliminate" onClick={() => setStatus(team.id, 'eliminated')} color="yellow" />}
                  <ActionBtn label="Remove" onClick={() => doRemove(team.id)} color="red" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {pages > 1 && <AdminPaginator page={page} totalPages={pages} totalItems={active.teams.filter(t => filter === 'all' || t.status === filter).length} pageSize={PER_PAGE} onPageChange={setPage} />}
    </div>
  )
}

// ─── Bracket management ───────────────────────────────────────────────────────

function TBracket({ active, flash, reload }: { active: Tournament | null; flash: (t: string, ok?: boolean) => void; reload: () => void }) {
  const [generating, setGenerating] = useState(false)
  const [type, setType] = useState<'single_elimination' | 'double_elimination'>('single_elimination')

  if (!active) return <NoActiveTournament />

  const approvedTeams = active.teams.filter(t => t.status === 'approved')

  async function generate() {
    if (approvedTeams.length < 2) return flash('Need at least 2 approved teams', false)
    if (!confirm(`Generate a ${type.replace('_', ' ')} bracket with ${approvedTeams.length} teams? This will clear existing bracket and matches.`)) return
    setGenerating(true)
    try {
      const res = await generateBracket({ data: { tournamentId: active!.id, type, shuffle: true } })
      if (res.success) { flash('Bracket generated successfully'); reload() }
      else flash(res.error ?? 'Failed to generate bracket', false)
    } finally { setGenerating(false) }
  }

  return (
    <div className="space-y-6">
      <div className="bg-[#111827] border border-white/5 rounded-xl p-6 space-y-4">
        <h3 className="font-['Space_Grotesk'] font-semibold text-white">Generate Bracket</h3>
        <div className="flex items-center gap-3 flex-wrap">
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Bracket Type</label>
            <select value={type} onChange={e => setType(e.target.value as any)} className="bg-[#0B0F17] border border-white/10 rounded-lg px-3 py-2 text-white text-sm">
              <option value="single_elimination">Single Elimination</option>
              <option value="double_elimination">Double Elimination (coming soon)</option>
            </select>
          </div>
          <div className="text-sm text-gray-500 mt-5">
            {approvedTeams.length} approved team(s)
          </div>
        </div>
        <button onClick={generate} disabled={generating || approvedTeams.length < 2} className="px-5 py-2.5 rounded-lg bg-[#00BFFF] text-black text-xs font-bold disabled:opacity-40 hover:bg-[#00BFFF]/80 transition-all">
          {generating ? '⟳ Generating…' : '⚡ Generate Bracket'}
        </button>
      </div>

      {active.bracket && (
        <div className="space-y-3">
          <h3 className="font-['Space_Grotesk'] font-semibold text-white">Current Bracket</h3>
          <div className="flex flex-wrap gap-3">
            {active.bracket.rounds.map((round, ri) => (
              <div key={ri} className="bg-[#111827] border border-white/5 rounded-xl p-4 min-w-[160px]">
                <p className="text-[#00BFFF] text-xs font-bold uppercase tracking-wider mb-2">{round.name}</p>
                <p className="text-gray-400 text-sm">{round.matchIds.length} match(es)</p>
              </div>
            ))}
          </div>
          <p className="text-gray-600 text-xs">Use the Matches tab to edit individual match details and scores.</p>
        </div>
      )}

      {!active.bracket && (
        <div className="text-center py-12 text-gray-600">
          <div className="text-4xl mb-3 opacity-30">⚔️</div>
          <p>No bracket generated yet. Approve teams first, then generate a bracket.</p>
        </div>
      )}
    </div>
  )
}

// ─── Match management ─────────────────────────────────────────────────────────

function TMatches({ active, flash, reload }: { active: Tournament | null; flash: (t: string, ok?: boolean) => void; reload: () => void }) {
  const [editing, setEditing] = useState<Match | null>(null)
  const [saving, setSaving]   = useState(false)
  const [page, setPage]       = useState(1)
  const PER_PAGE = 10

  if (!active) return <NoActiveTournament />

  const matches = [...active.matches].filter(m => m.status !== 'bye').sort((a, b) => a.matchNumber - b.matchNumber)
  const paged   = matches.slice((page - 1) * PER_PAGE, page * PER_PAGE)
  const pages   = Math.ceil(matches.length / PER_PAGE)

  const getTeam = (id: string | null) => active.teams.find(t => t.id === id)

  async function save(m: Match) {
    setSaving(true)
    try {
      const res = await updateMatch({ data: { tournamentId: active!.id, matchId: m.id, score1: m.score1, score2: m.score2, winnerId: m.winnerId, status: m.status, scheduledAt: m.scheduledAt, arena: m.arena, gamemode: m.gamemode, referee: m.referee, notes: m.notes, replayLink: m.replayLink } })
      if (res.success) { flash('Match updated'); setEditing(null); reload() }
      else flash(res.error ?? 'Error', false)
    } finally { setSaving(false) }
  }

  if (editing) {
    return <MatchEditor match={editing} teams={active.teams} onSave={save} onCancel={() => setEditing(null)} saving={saving} />
  }

  if (matches.length === 0) {
    return (
      <div className="text-center py-12 text-gray-600">
        <p>No matches yet. Generate a bracket first.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-gray-500 text-sm">{matches.length} match(es)</p>
      {paged.map(m => {
        const t1 = getTeam(m.team1Id)
        const t2 = getTeam(m.team2Id)
        return (
          <div key={m.id} className="bg-[#111827] border border-white/5 rounded-xl p-4 flex items-center gap-4">
            <span className="text-gray-600 text-sm font-bold w-8 flex-shrink-0">M{m.matchNumber}</span>
            <div className="flex-1 min-w-0 flex items-center gap-2">
              <span className="text-white text-sm font-semibold truncate">{t1?.name ?? 'TBD'}</span>
              <span className="text-gray-600 text-xs font-black">{m.score1} — {m.score2}</span>
              <span className="text-white text-sm font-semibold truncate">{t2?.name ?? 'TBD'}</span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase ${
                m.status === 'live' ? 'bg-red-500/15 text-red-400' :
                m.status === 'completed' ? 'bg-green-500/10 text-green-400' :
                m.status === 'scheduled' ? 'bg-[#00BFFF]/10 text-[#00BFFF]' :
                'bg-white/5 text-gray-600'
              }`}>{MATCH_STATUS_LABEL[m.status]}</span>
              <button onClick={() => setEditing(m)} className="px-3 py-1.5 rounded-lg text-[10px] font-bold border border-white/10 text-gray-500 hover:text-white transition-all">Edit</button>
            </div>
          </div>
        )
      })}
      {pages > 1 && <AdminPaginator page={page} totalPages={pages} totalItems={matches.length} pageSize={PER_PAGE} onPageChange={setPage} />}
    </div>
  )
}

function MatchEditor({ match: init, teams, onSave, onCancel, saving }: { match: Match; teams: Team[]; onSave: (m: Match) => void; onCancel: () => void; saving: boolean }) {
  const [m, setM] = useState<Match>({ ...init })
  const set = (k: keyof Match, v: any) => setM(prev => ({ ...prev, [k]: v }))
  const toLocal = (ts: number | null) => ts ? new Date(ts - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''
  const t1 = teams.find(t => t.id === m.team1Id)
  const t2 = teams.find(t => t.id === m.team2Id)

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={onCancel} className="text-gray-500 hover:text-white text-sm">← Back</button>
        <h3 className="font-['Space_Grotesk'] font-bold text-white">Edit Match #{m.matchNumber}</h3>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Status</label>
          <select value={m.status} onChange={e => set('status', e.target.value)} className="w-full bg-[#0B0F17] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none">
            {(['pending','scheduled','live','completed','bye'] as const).map(s => <option key={s} value={s}>{MATCH_STATUS_LABEL[s]}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Winner</label>
          <select value={m.winnerId ?? ''} onChange={e => set('winnerId', e.target.value || null)} className="w-full bg-[#0B0F17] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none">
            <option value="">No winner yet</option>
            {t1 && <option value={t1.id}>{t1.name}</option>}
            {t2 && <option value={t2.id}>{t2.name}</option>}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">{t1?.name ?? 'Team 1'} Score</label>
          <input type="number" min={0} value={m.score1} onChange={e => set('score1', +e.target.value)} className="w-full bg-[#0B0F17] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">{t2?.name ?? 'Team 2'} Score</label>
          <input type="number" min={0} value={m.score2} onChange={e => set('score2', +e.target.value)} className="w-full bg-[#0B0F17] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none" />
        </div>
        <Field label="Arena" value={m.arena} onChange={v => set('arena', v)} placeholder="Arena name" />
        <Field label="Gamemode" value={m.gamemode} onChange={v => set('gamemode', v)} placeholder="e.g. Crystal PvP" />
        <Field label="Referee" value={m.referee} onChange={v => set('referee', v)} placeholder="Staff username" />
        <div>
          <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Scheduled At</label>
          <input type="datetime-local" value={toLocal(m.scheduledAt)} onChange={e => set('scheduledAt', e.target.value ? new Date(e.target.value).getTime() : null)} className="w-full bg-[#0B0F17] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none" />
        </div>
        <div className="md:col-span-2">
          <Field label="Replay Link" value={m.replayLink} onChange={v => set('replayLink', v)} placeholder="https://..." />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Notes</label>
          <textarea value={m.notes} onChange={e => set('notes', e.target.value)} rows={2} className="w-full bg-[#0B0F17] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm resize-none focus:outline-none" />
        </div>
      </div>
      <div className="flex gap-3">
        <button onClick={() => onSave(m)} disabled={saving} className="px-6 py-2.5 rounded-lg bg-[#00BFFF] text-black text-xs font-bold hover:bg-[#00BFFF]/80 disabled:opacity-50 transition-all">
          {saving ? 'Saving…' : 'Save Match'}
        </button>
        <button onClick={onCancel} className="px-6 py-2.5 rounded-lg border border-white/10 text-gray-500 text-xs font-bold hover:text-white transition-all">Cancel</button>
      </div>
    </div>
  )
}

// ─── Prizes management ────────────────────────────────────────────────────────

function TPrizes({ active, flash, reload }: { active: Tournament | null; flash: (t: string, ok?: boolean) => void; reload: () => void }) {
  const [prizes, setPrizes] = useState<Prize[]>(active?.prizes ?? DEFAULT_PRIZES)
  const [saving, setSaving] = useState(false)

  if (!active) return <NoActiveTournament />

  const REWARD_TYPES = ['coins','gems','rank','crate_keys','custom'] as const

  function addPlacement() {
    setPrizes(p => [...p, { placement: p.length + 1, label: `🏅 ${ordinal(p.length + 1)} Place`, rewards: [{ type: 'coins', label: 'BlueCoin', amount: '' }] }])
  }

  function addReward(pi: number) {
    setPrizes(p => p.map((prize, i) => i === pi ? { ...prize, rewards: [...prize.rewards, { type: 'coins', label: '', amount: '' }] } : prize))
  }

  function removeReward(pi: number, ri: number) {
    setPrizes(p => p.map((prize, i) => i === pi ? { ...prize, rewards: prize.rewards.filter((_, j) => j !== ri) } : prize))
  }

  function setReward(pi: number, ri: number, k: keyof Reward, v: string) {
    setPrizes(p => p.map((prize, i) => i === pi ? { ...prize, rewards: prize.rewards.map((r, j) => j === ri ? { ...r, [k]: v } : r) } : prize))
  }

  function setPrize(pi: number, k: keyof Prize, v: any) {
    setPrizes(p => p.map((prize, i) => i === pi ? { ...prize, [k]: v } : prize))
  }

  async function save() {
    setSaving(true)
    try {
      await updatePrizes({ data: { tournamentId: active!.id, prizes } })
      flash('Prizes updated')
      reload()
    } catch { flash('Error', false) }
    finally { setSaving(false) }
  }

  return (
    <div className="space-y-5">
      {prizes.map((prize, pi) => (
        <div key={pi} className="bg-[#111827] border border-white/5 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <Field label="" value={prize.label} onChange={v => setPrize(pi, 'label', v)} placeholder="🥇 First Place" />
            <button onClick={() => setPrizes(p => p.filter((_, i) => i !== pi))} className="text-gray-600 hover:text-red-400 transition-colors text-xs mt-4">Remove placement</button>
          </div>
          <div className="space-y-2">
            {prize.rewards.map((r, ri) => (
              <div key={ri} className="flex gap-2 items-end flex-wrap">
                <div>
                  <label className="block text-[10px] text-gray-600 mb-1">Type</label>
                  <select value={r.type} onChange={e => setReward(pi, ri, 'type', e.target.value)} className="bg-[#0B0F17] border border-white/10 rounded-lg px-2 py-2 text-white text-xs">
                    {REWARD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="flex-1 min-w-24">
                  <label className="block text-[10px] text-gray-600 mb-1">Label</label>
                  <input value={r.label} onChange={e => setReward(pi, ri, 'label', e.target.value)} placeholder="BlueCoin" className="w-full bg-[#0B0F17] border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none" />
                </div>
                <div className="flex-1 min-w-24">
                  <label className="block text-[10px] text-gray-600 mb-1">Amount</label>
                  <input value={r.amount} onChange={e => setReward(pi, ri, 'amount', e.target.value)} placeholder="10,000" className="w-full bg-[#0B0F17] border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none" />
                </div>
                <button onClick={() => removeReward(pi, ri)} className="text-gray-600 hover:text-red-400 text-xs mb-0.5">✕</button>
              </div>
            ))}
            <button onClick={() => addReward(pi)} className="text-xs text-[#00BFFF] hover:underline">+ Add reward</button>
          </div>
        </div>
      ))}
      <div className="flex gap-3">
        <button onClick={addPlacement} className="px-4 py-2 rounded-lg border border-white/10 text-gray-400 text-xs hover:text-white transition-all">+ Add Placement</button>
        <button onClick={save} disabled={saving} className="px-6 py-2.5 rounded-lg bg-[#00BFFF] text-black text-xs font-bold hover:bg-[#00BFFF]/80 disabled:opacity-50 transition-all">
          {saving ? 'Saving…' : 'Save Prizes'}
        </button>
      </div>
    </div>
  )
}

// ─── Rules management ─────────────────────────────────────────────────────────

function TRules({ active, flash, reload }: { active: Tournament | null; flash: (t: string, ok?: boolean) => void; reload: () => void }) {
  const [rules, setRules] = useState(active?.rules ?? DEFAULT_RULES)
  const [saving, setSaving] = useState(false)

  if (!active) return <NoActiveTournament />

  const setField = (k: keyof typeof rules, v: any) => setRules(r => ({ ...r, [k]: v }))
  const setList  = (k: keyof typeof rules, idx: number, v: string) => setRules(r => ({ ...r, [k]: (r[k] as string[]).map((x, i) => i === idx ? v : x) }))
  const addItem  = (k: keyof typeof rules) => setRules(r => ({ ...r, [k]: [...(r[k] as string[]), ''] }))
  const remItem  = (k: keyof typeof rules, idx: number) => setRules(r => ({ ...r, [k]: (r[k] as string[]).filter((_, i) => i !== idx) }))

  async function save() {
    setSaving(true)
    try {
      await updateRules({ data: { tournamentId: active!.id, ...rules } })
      flash('Rules updated')
      reload()
    } catch { flash('Error', false) }
    finally { setSaving(false) }
  }

  const ListField = ({ label, field }: { label: string; field: 'allowedMods' | 'allowedClients' | 'bannedMods' | 'custom' }) => (
    <div className="space-y-2">
      <label className="block text-xs text-gray-500 uppercase tracking-wider font-bold">{label}</label>
      {rules[field].map((item, i) => (
        <div key={i} className="flex gap-2">
          <input value={item} onChange={e => setList(field, i, e.target.value)} className="flex-1 bg-[#0B0F17] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none" />
          <button onClick={() => remItem(field, i)} className="px-2 text-gray-600 hover:text-red-400 transition-colors">✕</button>
        </div>
      ))}
      <button onClick={() => addItem(field)} className="text-xs text-[#00BFFF] hover:underline">+ Add</button>
    </div>
  )

  return (
    <div className="space-y-5">
      <div className="grid md:grid-cols-3 gap-5">
        <ListField label="Allowed Mods" field="allowedMods" />
        <ListField label="Allowed Clients" field="allowedClients" />
        <ListField label="Banned Modifications" field="bannedMods" />
      </div>
      <TextareaField label="Replay Requirements" value={rules.replayRequirements} onChange={v => setField('replayRequirements', v)} />
      <TextareaField label="Disconnect Rules" value={rules.disconnectRules} onChange={v => setField('disconnectRules', v)} />
      <TextareaField label="Staff Decisions" value={rules.staffDecisions} onChange={v => setField('staffDecisions', v)} />
      <ListField label="Custom Rules" field="custom" />
      <button onClick={save} disabled={saving} className="px-6 py-2.5 rounded-lg bg-[#00BFFF] text-black text-xs font-bold hover:bg-[#00BFFF]/80 disabled:opacity-50 transition-all">
        {saving ? 'Saving…' : 'Save Rules'}
      </button>
    </div>
  )
}

// ─── Announcements ────────────────────────────────────────────────────────────

function TAnnouncements({ active, flash, reload }: { active: Tournament | null; admin?: string; flash: (t: string, ok?: boolean) => void; reload: () => void }) {
  const [title, setTitle]   = useState('')
  const [body, setBody]     = useState('')
  const [type, setType]     = useState<'info' | 'warning' | 'success'>('info')
  const [posting, setPost]  = useState(false)
  const [page, setPage]     = useState(1)
  const PER_PAGE = 10

  if (!active) return <NoActiveTournament />

  const anns  = active.announcements
  const paged = anns.slice((page - 1) * PER_PAGE, page * PER_PAGE)
  const pages = Math.ceil(anns.length / PER_PAGE)

  async function post() {
    if (!title.trim()) return flash('Title is required', false)
    setPost(true)
    try {
      await addAnnouncement({ data: { tournamentId: active!.id, title: title.trim(), body: body.trim(), type } })
      flash('Announcement posted')
      setTitle(''); setBody('')
      reload()
    } catch { flash('Error', false) }
    finally { setPost(false) }
  }

  async function doDelete(annId: string) {
    await deleteAnnouncement({ data: { tournamentId: active!.id, announcementId: annId } })
    flash('Announcement deleted')
    reload()
  }

  const TYPE_COLORS = { info: 'text-[#00BFFF]', warning: 'text-yellow-400', success: 'text-green-400' }

  return (
    <div className="space-y-6">
      {/* Post form */}
      <div className="bg-[#111827] border border-white/5 rounded-xl p-5 space-y-4">
        <h3 className="font-['Space_Grotesk'] font-semibold text-white">Post Announcement</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <Field label="Title *" value={title} onChange={setTitle} placeholder="e.g. Brackets Released!" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Type</label>
            <select value={type} onChange={e => setType(e.target.value as any)} className="w-full bg-[#0B0F17] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none">
              <option value="info">ℹ️ Info</option>
              <option value="warning">⚠️ Warning</option>
              <option value="success">✅ Success</option>
            </select>
          </div>
        </div>
        <TextareaField label="Body (optional)" value={body} onChange={setBody} />
        <button onClick={post} disabled={posting} className="px-5 py-2.5 rounded-lg bg-[#00BFFF] text-black text-xs font-bold hover:bg-[#00BFFF]/80 disabled:opacity-50 transition-all">
          {posting ? 'Posting…' : '📣 Post Announcement'}
        </button>
      </div>

      {/* List */}
      {anns.length === 0 ? (
        <div className="text-center py-12 text-gray-600">No announcements yet.</div>
      ) : (
        <div className="space-y-3">
          {paged.map(ann => (
            <div key={ann.id} className="bg-[#111827] border border-white/5 rounded-xl p-4 flex items-start gap-3">
              <span className="text-lg flex-shrink-0">{{ info: 'ℹ️', warning: '⚠️', success: '✅' }[ann.type]}</span>
              <div className="flex-1 min-w-0">
                <p className={`font-semibold text-sm ${TYPE_COLORS[ann.type]}`}>{ann.title}</p>
                {ann.body && <p className="text-gray-500 text-xs mt-1 line-clamp-2">{ann.body}</p>}
                <p className="text-gray-700 text-[10px] mt-1">{new Date(ann.createdAt).toLocaleString()}</p>
              </div>
              <button onClick={() => doDelete(ann.id)} className="text-gray-600 hover:text-red-400 transition-colors text-xs flex-shrink-0">Delete</button>
            </div>
          ))}
          {pages > 1 && <AdminPaginator page={page} totalPages={pages} totalItems={anns.length} pageSize={PER_PAGE} onPageChange={setPage} />}
        </div>
      )}
    </div>
  )
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      {label && <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">{label}</label>}
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="w-full bg-[#0B0F17] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-700 focus:outline-none focus:border-[#00BFFF]/50" />
    </div>
  )
}

function TextareaField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">{label}</label>
      <textarea value={value} onChange={e => onChange(e.target.value)} rows={2} className="w-full bg-[#0B0F17] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm resize-none focus:outline-none placeholder-gray-700" />
    </div>
  )
}

function ActionBtn({ label, onClick, color }: { label: string; onClick: () => void; color: 'green' | 'red' | 'yellow' }) {
  const colors = { green: 'text-green-400 border-green-500/20 hover:bg-green-500/10', red: 'text-red-400 border-red-500/20 hover:bg-red-500/10', yellow: 'text-yellow-400 border-yellow-500/20 hover:bg-yellow-500/10' }
  return (
    <button onClick={onClick} className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${colors[color]}`}>{label}</button>
  )
}

function TeamStatusBadge({ status }: { status: Team['status'] }) {
  const colors: Record<string, string> = {
    approved: 'text-green-400 bg-green-400/10', pending: 'text-yellow-400 bg-yellow-400/10',
    rejected: 'text-red-400 bg-red-400/10', eliminated: 'text-gray-400 bg-gray-400/10',
    disqualified: 'text-orange-400 bg-orange-400/10',
  }
  return <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${colors[status] ?? ''}`}>{status}</span>
}

function NoActiveTournament() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="text-5xl mb-4 opacity-20">🏆</div>
      <p className="text-gray-500">No active tournament. Go to the Tournaments tab and set one as active.</p>
    </div>
  )
}

function ordinal(n: number): string {
  const s = ['th','st','nd','rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}
