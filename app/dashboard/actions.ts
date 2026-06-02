'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

const bookmarkSchema = z.object({
  url: z.string().url(),
  title: z.string().max(500).nullable(),
  description: z.string().max(2000).nullable(),
  favicon_url: z.string().nullable(),
})

export async function addBookmark(data: unknown) {
  const parsed = bookmarkSchema.safeParse(data)
  if (!parsed.success) return { error: 'Invalid data' }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase.from('bookmarks').insert({
    user_id: user.id,
    url: parsed.data.url,
    title: parsed.data.title,
    description: parsed.data.description,
    favicon_url: parsed.data.favicon_url,
  })

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  return { success: true }
}
