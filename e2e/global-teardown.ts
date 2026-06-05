export default async function globalTeardown() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  const email = process.env.TEST_USER_EMAIL
  const password = process.env.TEST_USER_PASSWORD

  if (!url || !key || !email || !password) {
    console.warn('Teardown: missing env vars, skipping cleanup')
    return
  }

  // Sign in via REST — avoids WebSocket dependency in Node 20
  const signInRes = await fetch(`${url}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: key, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  if (!signInRes.ok) {
    console.error('Teardown auth failed:', await signInRes.text())
    return
  }

  const { access_token } = (await signInRes.json()) as { access_token: string }

  // Delete all test-user bookmarks — RLS ensures only their rows are affected
  const deleteRes = await fetch(
    `${url}/rest/v1/bookmarks?id=neq.00000000-0000-0000-0000-000000000000`,
    {
      method: 'DELETE',
      headers: {
        apikey: key,
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
    }
  )

  if (!deleteRes.ok) {
    console.error('Teardown cleanup failed:', await deleteRes.text())
  }
}
