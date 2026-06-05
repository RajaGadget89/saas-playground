import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  // Layer 1: block entirely on Vercel production
  if (process.env.VERCEL_ENV === 'production') {
    return NextResponse.json({ error: 'Not Found' }, { status: 404 })
  }

  // Layer 2a: secret must be explicitly set — 404 so the endpoint's existence is not revealed
  const secret = process.env.E2E_SECRET
  if (!secret) {
    return NextResponse.json({ error: 'Not Found' }, { status: 404 })
  }

  // Layer 2b: secret must match — separate check so intent is unambiguous
  if (request.headers.get('x-e2e-secret') !== secret) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json() as { email: string; password: string }
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: body.email,
    password: body.password,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 401 })
  }

  return NextResponse.json({ ok: true })
}
