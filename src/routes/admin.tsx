import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { getAdminSession, setAdminSession } from '../store/adminStore'
import type { AdminSession } from '../store/adminStore'
import { AdminLogin }  from '../components/admin/AdminLogin'
import { AdminLayout } from '../components/admin/AdminLayout'
import { loadAllData } from '../server/dataFiles'
import { savePlayers, saveGamemodes } from '../store/playersStore'
import { saveSiteContent, saveEventConfig } from '../store/contentStore'
import { saveEconomyOverrides } from '../store/miningStore'
import type { Player } from '../data/players'
import type { Gamemode } from '../data/gamemodes'
import type { EventConfig } from '../data/event'
import type { SiteContent } from '../store/contentStore'
import type { EconomyOverrides } from '../store/miningStore'

export const Route = createFileRoute('/admin')({
  component: AdminPage,
})

export type AdminSection =
  | 'dashboard'
  | 'tier-list'
  | 'gamemodes'
  | 'mining-mgmt'
  | 'economy'
  | 'users'
  | 'content'
  | 'events'
  | 'logs'
  | 'github-sync'

function AdminPage() {
  const [session, setSession] = useState<AdminSession | null>(null)
  const [section, setSection] = useState<AdminSection>('dashboard')
  const [dataReady, setDataReady] = useState(false)

  // On mount: check session and hydrate stores from GitHub JSON files
  useEffect(() => {
    setSession(getAdminSession())

    // Load canonical data from disk (written by GitHub saves)
    loadAllData()
      .then(d => {
        // Hydrate stores silently (no dirty marking)
        if (d.players)   savePlayers(d.players as Player[],         { silent: true })
        if (d.gamemodes) saveGamemodes(d.gamemodes as Gamemode[],   { silent: true })
        if (d.content)   saveSiteContent(d.content as SiteContent,  { silent: true })
        if (d.event)     saveEventConfig(d.event as EventConfig,    { silent: true })
        if (d.economy)   saveEconomyOverrides(d.economy as EconomyOverrides, { silent: true })
      })
      .catch(() => { /* falls back to localStorage defaults */ })
      .finally(() => setDataReady(true))
  }, [])

  function handleLogin(s: AdminSession) {
    setAdminSession(s)
    setSession(s)
  }

  function handleLogout() {
    setAdminSession(null)
    setSession(null)
  }

  if (!session) {
    return <AdminLogin onLogin={handleLogin} />
  }

  // Show a brief loading state while server data hydrates
  if (!dataReady) {
    return (
      <div className="min-h-screen bg-[#0B0F17] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="text-3xl animate-spin">⟳</div>
          <p className="text-gray-500 text-sm">Loading data from GitHub…</p>
        </div>
      </div>
    )
  }

  return (
    <AdminLayout
      session={session}
      section={section}
      setSection={setSection}
      onLogout={handleLogout}
    />
  )
}
