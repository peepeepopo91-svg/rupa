// ─── Admin Authentication — Server-Only ──────────────────────────────────────
// Security model:
//   • Passwords stored as scrypt hashes in admin.yml (auto-upgraded from plaintext on first login)
//   • Rate limiting: 5 failed attempts → 15-minute IP lockout
//   • Sessions signed with HMAC-SHA256 using SESSION_SECRET env var
//   • Session expiry: 8 hours
//   • All string comparisons are constant-time (timingSafeEqual)

import { createServerFn } from '@tanstack/react-start'
import { getRequestIP } from '@tanstack/react-start/server'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { load as yamlLoad, dump as yamlDump } from 'js-yaml'
import { z } from 'zod'
import { scrypt, randomBytes, timingSafeEqual, createHmac } from 'node:crypto'
import { promisify } from 'node:util'

const scryptAsync = promisify(scrypt)

// ─── Constants ────────────────────────────────────────────────────────────────
const MAX_ATTEMPTS   = 5
const LOCKOUT_MS     = 15 * 60 * 1000   // 15 minutes
const SESSION_TTL_MS =  8 * 60 * 60 * 1000  // 8 hours

// ─── Rate Limiting (in-memory, per IP) ───────────────────────────────────────
interface RateLimitEntry { count: number; lockedUntil: number }
const rateLimitStore = new Map<string, RateLimitEntry>()

function checkRateLimit(ip: string): { blocked: boolean; remainingMs: number } {
  const now   = Date.now()
  const entry = rateLimitStore.get(ip)
  if (!entry) return { blocked: false, remainingMs: 0 }
  if (entry.lockedUntil > now) return { blocked: true, remainingMs: entry.lockedUntil - now }
  if (entry.lockedUntil > 0) rateLimitStore.delete(ip)   // expired lock — reset
  return { blocked: false, remainingMs: 0 }
}

function recordFailure(ip: string): number {
  const entry = rateLimitStore.get(ip) ?? { count: 0, lockedUntil: 0 }
  const count = entry.count + 1
  rateLimitStore.set(ip, {
    count,
    lockedUntil: count >= MAX_ATTEMPTS ? Date.now() + LOCKOUT_MS : 0,
  })
  return count
}

function clearFailures(ip: string) {
  rateLimitStore.delete(ip)
}

// ─── Password Hashing (Node built-in scrypt) ──────────────────────────────────
async function hashPassword(plain: string): Promise<string> {
  const salt = randomBytes(16).toString('hex')
  const hash = (await scryptAsync(plain, salt, 64)) as Buffer
  return `scrypt:${salt}:${hash.toString('hex')}`
}

async function verifyPassword(stored: string, input: string): Promise<boolean> {
  if (stored.startsWith('scrypt:')) {
    const parts = stored.split(':')
    if (parts.length !== 3) return false
    const [, salt, hashHex] = parts
    const inputHash  = (await scryptAsync(input, salt, 64)) as Buffer
    const storedHash = Buffer.from(hashHex, 'hex')
    if (inputHash.length !== storedHash.length) return false
    return timingSafeEqual(inputHash, storedHash)
  }
  // Plaintext fallback (pre-migration) — constant-time padded compare
  const a = Buffer.alloc(256, 0); a.write(stored)
  const b = Buffer.alloc(256, 0); b.write(input)
  return timingSafeEqual(a, b) && stored === input
}

// ─── Session Signing (HMAC-SHA256 + SESSION_SECRET) ───────────────────────────
function getSecret(): string {
  const s = process.env.SESSION_SECRET
  if (!s) throw new Error('SESSION_SECRET env var is not set')
  return s
}

function signSession(username: string, loginAt: number): string {
  return createHmac('sha256', getSecret())
    .update(`${username}:${loginAt}`)
    .digest('hex')
}

// ─── Credentials File ─────────────────────────────────────────────────────────
const AdminSchema = z.object({
  admin: z.object({
    username:  z.string(),
    password1: z.string(),
    password2: z.string(),
  }),
})

function loadAdminCredentials() {
  const filePath = resolve(process.cwd(), 'admin.yml')
  const raw      = readFileSync(filePath, 'utf8')
  return AdminSchema.parse(yamlLoad(raw))
}

async function upgradePasswords(username: string, p1Plain: string, p2Plain: string) {
  try {
    const [h1, h2] = await Promise.all([hashPassword(p1Plain), hashPassword(p2Plain)])
    const filePath  = resolve(process.cwd(), 'admin.yml')
    writeFileSync(filePath, yamlDump({ admin: { username, password1: h1, password2: h2 } }), 'utf8')
    console.log('[adminAuth] Passwords upgraded to scrypt hashes')
  } catch (e) {
    console.error('[adminAuth] Password upgrade failed:', e)
  }
}

// ─── Server Functions ─────────────────────────────────────────────────────────

export const validateAdminCredentials = createServerFn({ method: 'POST' })
  .inputValidator(z.object({
    username:  z.string(),
    password1: z.string(),
    password2: z.string(),
  }))
  .handler(async ({ data }) => {
    // ── 1. Rate-limit check ──────────────────────────────────────────────────
    const ip = getRequestIP({ xForwardedFor: true }) ?? 'unknown'
    const rl  = checkRateLimit(ip)
    if (rl.blocked) {
      const mins = Math.ceil(rl.remainingMs / 60000)
      return {
        valid: false as const,
        error: `Too many failed attempts. Try again in ${mins} minute${mins === 1 ? '' : 's'}.`,
      }
    }

    // ── 2. Load credentials ───────────────────────────────────────────────────
    let cfg: ReturnType<typeof loadAdminCredentials>
    try {
      cfg = loadAdminCredentials()
    } catch (err) {
      console.error('[adminAuth] Failed to load admin.yml:', err)
      return { valid: false as const, error: 'Admin auth unavailable' }
    }

    const { admin } = cfg

    // ── 3. Constant-time username compare ─────────────────────────────────────
    const uA = Buffer.alloc(256, 0); uA.write(admin.username)
    const uB = Buffer.alloc(256, 0); uB.write(data.username.trim())
    const usernameOk = timingSafeEqual(uA, uB) && admin.username === data.username.trim()

    // ── 4. Verify passwords ───────────────────────────────────────────────────
    const [p1Ok, p2Ok] = await Promise.all([
      verifyPassword(admin.password1, data.password1),
      verifyPassword(admin.password2, data.password2),
    ])

    if (!usernameOk || !p1Ok || !p2Ok) {
      const failCount = recordFailure(ip)
      const remaining = MAX_ATTEMPTS - failCount
      const hint = remaining > 0
        ? ` (${remaining} attempt${remaining === 1 ? '' : 's'} remaining)`
        : ' — account locked for 15 minutes'
      return { valid: false as const, error: `Invalid credentials${hint}` }
    }

    // ── 5. Success ────────────────────────────────────────────────────────────
    clearFailures(ip)

    // Auto-upgrade plaintext passwords to scrypt on first successful login
    if (!admin.password1.startsWith('scrypt:') || !admin.password2.startsWith('scrypt:')) {
      void upgradePasswords(admin.username, data.password1, data.password2)
    }

    // Issue HMAC-signed session token
    const loginAt = Date.now()
    let token: string
    try {
      token = signSession(admin.username, loginAt)
    } catch {
      return { valid: false as const, error: 'Auth misconfigured — SESSION_SECRET is missing' }
    }

    return { valid: true as const, username: admin.username, loginAt, token }
  })

// ─── Token Verification (called on every admin page load) ─────────────────────
export const checkAdminToken = createServerFn({ method: 'POST' })
  .inputValidator(z.object({
    username: z.string(),
    loginAt:  z.number(),
    token:    z.string(),
  }))
  .handler(async ({ data }) => {
    // Check expiry first
    if (Date.now() - data.loginAt > SESSION_TTL_MS) {
      return { valid: false as const, reason: 'Session expired — please log in again' }
    }

    let expected: string
    try {
      expected = signSession(data.username, data.loginAt)
    } catch {
      return { valid: false as const, reason: 'Auth misconfigured — SESSION_SECRET is missing' }
    }

    try {
      const a = Buffer.from(data.token, 'hex')
      const b = Buffer.from(expected,   'hex')
      if (a.length !== b.length || !timingSafeEqual(a, b)) {
        return { valid: false as const, reason: 'Invalid session token' }
      }
    } catch {
      return { valid: false as const, reason: 'Malformed session token' }
    }

    return { valid: true as const }
  })
