import { request } from '@playwright/test'
import { mkdirSync } from 'fs'

export default async function globalSetup() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  const email = process.env.TEST_USER_EMAIL
  const password = process.env.TEST_USER_PASSWORD
  const secret = process.env.E2E_SECRET

  if (!supabaseUrl || !supabaseKey || !email || !password || !secret) {
    throw new Error(
      'Missing required env vars: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, TEST_USER_EMAIL, TEST_USER_PASSWORD, E2E_SECRET'
    )
  }

  // ── Pre-cleanup: delete leftover data from any previous failed runs ────────
  const signInRes = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: supabaseKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  if (signInRes.ok) {
    const { access_token } = (await signInRes.json()) as { access_token: string }
    await fetch(
      `${supabaseUrl}/rest/v1/bookmarks?id=neq.00000000-0000-0000-0000-000000000000`,
      {
        method: 'DELETE',
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${access_token}`,
          'Content-Type': 'application/json',
        },
      }
    )
  }

  // ── Authenticate via Next.js app to get properly-set SSR cookies ──────────
  const ctx = await request.newContext({ baseURL: 'http://localhost:3000' })

  const res = await ctx.post('/api/e2e/auth', {
    headers: { 'x-e2e-secret': secret },
    data: { email, password },
  })

  if (!res.ok()) {
    const body = await res.text()
    throw new Error(`E2E auth failed (${res.status()}): ${body}`)
  }

  mkdirSync('e2e/.auth', { recursive: true })
  await ctx.storageState({ path: 'e2e/.auth/user.json' })
  await ctx.dispose()
}
