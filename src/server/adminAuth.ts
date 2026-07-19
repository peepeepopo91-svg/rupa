// ─── Admin Authentication — Server-Only ──────────────────────────────────────
// Reads admin.yml at request time. All three fields must match. Never reaches client.

import { createServerFn } from '@tanstack/react-start'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { load as yamlLoad } from 'js-yaml'
import { z } from 'zod'

const AdminSchema = z.object({
  admin: z.object({
    username: z.string(),
    password1: z.string(),
    password2: z.string(),
  }),
})

function loadAdminCredentials() {
  const filePath = resolve(process.cwd(), 'admin.yml')
  const raw = readFileSync(filePath, 'utf8')
  const parsed = yamlLoad(raw)
  return AdminSchema.parse(parsed)
}

export const validateAdminCredentials = createServerFn({ method: 'POST' })
  .inputValidator(z.object({
    username:  z.string(),
    password1: z.string(),
    password2: z.string(),
  }))
  .handler(async ({ data }) => {
    let cfg: ReturnType<typeof loadAdminCredentials>
    try {
      cfg = loadAdminCredentials()
    } catch (err) {
      console.error('[adminAuth] Failed to load admin.yml:', err)
      return { valid: false as const, error: 'Admin auth unavailable' }
    }

    const { admin } = cfg
    const usernameMatch  = admin.username  === data.username.trim()
    const password1Match = admin.password1 === data.password1
    const password2Match = admin.password2 === data.password2

    if (!usernameMatch || !password1Match || !password2Match) {
      return { valid: false as const, error: 'Invalid credentials' }
    }

    return { valid: true as const, username: admin.username }
  })
