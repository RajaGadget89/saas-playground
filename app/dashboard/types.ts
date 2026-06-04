import type { Tables } from '@/lib/supabase/types'

export type Tag = { id: string; name: string }
export type BookmarkWithTags = Tables<'bookmarks'> & {
  bookmark_tags: Array<{ tags: Tag | null }>
}
