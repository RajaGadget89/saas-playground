import type { Tables } from '@/lib/supabase/types'
import { BookmarkCard } from './bookmark-card'

type Bookmark = Tables<'bookmarks'>

export function BookmarkList({ bookmarks }: { bookmarks: Bookmark[] }) {
  if (bookmarks.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        No bookmarks yet. Add your first link above.
      </p>
    )
  }

  return (
    <ul className="space-y-2">
      {bookmarks.map((bookmark) => (
        <BookmarkCard key={bookmark.id} bookmark={bookmark} />
      ))}
    </ul>
  )
}
