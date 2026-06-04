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

const updateSchema = z.object({
  id: z.string().uuid(),
  title: z.string().max(500).nullable(),
  description: z.string().max(2000).nullable(),
})

export async function updateBookmark(data: unknown) {
  const parsed = updateSchema.safeParse(data)
  if (!parsed.success) return { error: 'Invalid data' }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('bookmarks')
    .update({ title: parsed.data.title, description: parsed.data.description })
    .eq('id', parsed.data.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  return { success: true }
}

const addTagSchema = z.object({
  bookmarkId: z.string().uuid(),
  tagName: z.string().min(1).max(50),
})

export async function addTagToBookmark(data: unknown) {
  const parsed = addTagSchema.safeParse(data)
  if (!parsed.success) return { error: 'Invalid data' }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const normalizedName = parsed.data.tagName.trim().toLowerCase()
  if (!normalizedName) return { error: 'Tag name cannot be empty' }

  const { count, error: countError } = await supabase
    .from('bookmark_tags')
    .select('*', { count: 'exact', head: true })
    .eq('bookmark_id', parsed.data.bookmarkId)

  if (countError) return { error: countError.message }
  if ((count ?? 0) >= 10) return { error: 'Maximum 10 tags per bookmark' }

  const { data: tag, error: tagError } = await supabase
    .from('tags')
    .upsert({ user_id: user.id, name: normalizedName }, { onConflict: 'user_id,name' })
    .select('id')
    .single()

  if (tagError || !tag) return { error: tagError?.message ?? 'Failed to create tag' }

  const { error: linkError } = await supabase
    .from('bookmark_tags')
    .upsert(
      { bookmark_id: parsed.data.bookmarkId, tag_id: tag.id },
      { onConflict: 'bookmark_id,tag_id', ignoreDuplicates: true }
    )

  if (linkError) return { error: linkError.message }

  revalidatePath('/dashboard')
  return { success: true }
}

const removeTagSchema = z.object({
  bookmarkId: z.string().uuid(),
  tagId: z.string().uuid(),
})

export async function removeTagFromBookmark(data: unknown) {
  const parsed = removeTagSchema.safeParse(data)
  if (!parsed.success) return { error: 'Invalid data' }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('bookmark_tags')
    .delete()
    .eq('bookmark_id', parsed.data.bookmarkId)
    .eq('tag_id', parsed.data.tagId)

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  return { success: true }
}

const deleteSchema = z.object({
  id: z.string().uuid(),
})

export async function deleteBookmark(data: unknown) {
  const parsed = deleteSchema.safeParse(data)
  if (!parsed.success) return { error: 'Invalid data' }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase.from('bookmarks').delete().eq('id', parsed.data.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  return { success: true }
}
