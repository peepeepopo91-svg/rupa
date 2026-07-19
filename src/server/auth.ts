// ─── Credential Validation — Server-Only ──────────────────────────────────────
// Reads credentials.yml at request time. Passwords never reach the client.

import { createServerFn } from '@tanstack/react-start'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { load as yamlLoad } from 'js-yaml'
import { z } from 'zod'

// ─── YAML shape ────────────────────────────────────────────────────────────────

const CredentialSchema = z.object({
  users: z.array(
    z.object({
      username: z.string(),
      password: z.string(),
      role: z.string().optional(),
      uuid: z.string().optional(),
      enabled: z.boolean().optional(),
    })
  ),
})

function loadCredentials() {
  const filePath = resolve(process.cwd(), 'credentials.yml')
  console.log('[auth] Loading credentials from:', filePath)
  const raw = readFileSync(filePath, 'utf8')
  const parsed = yamlLoad(raw)
  console.log('[auth] Raw YAML parsed:', JSON.stringify(parsed))
  const result = CredentialSchema.parse(parsed)
  console.log('[auth] Validated users:', result.users.map(u => u.username))
  return result
}

// ─── Server Function ──────────────────────────────────────────────────────────

export const validateCredentials = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ username: z.string(), password: z.string() }))
  .handler(async ({ data }) => {
    console.log('[auth] Attempt — username:', JSON.stringify(data.username), 'password:', JSON.stringify(data.password))

    let creds: ReturnType<typeof loadCredentials>
    try {
      creds = loadCredentials()
    } catch (err) {
      console.error('[auth] Failed to load credentials.yml:', err)
      return { valid: false as const, error: 'Auth system unavailable' }
    }

    const match = creds.users.find(u => {
      const usernameMatch = u.username.toLowerCase() === data.username.trim().toLowerCase()
      const passwordMatch = u.password === data.password.trim()
      console.log(
        `[auth] Checking user "${u.username}": usernameMatch=${usernameMatch}, passwordMatch=${passwordMatch}`
      )
      return usernameMatch && passwordMatch
    })

    if (!match) {
      console.log('[auth] No matching credentials found → rejected')
      return { valid: false as const, error: 'Invalid username or password' }
    }

    // Check if account has been disabled by an admin
    if (match.enabled === false) {
      console.log('[auth] Account is disabled → rejected')
      return { valid: false as const, error: 'This account has been disabled. Contact an administrator.' }
    }

    console.log('[auth] Credentials matched → accepted as', match.username, '/ role:', match.role ?? 'user')
    return { valid: true as const, username: match.username, role: match.role ?? 'user' }
  })
