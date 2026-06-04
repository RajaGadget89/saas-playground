import type { BookmarkWithTags } from './types'
import { BookmarkCard } from './bookmark-card'

export function BookmarkList({
  bookmarks,
  activeTag,
}: {
  bookmarks: BookmarkWithTags[]
  activeTag?: string
}) {
  if (bookmarks.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        {activeTag
          ? `No bookmarks tagged "${activeTag}".`
          : 'No bookmarks yet. Add your first link above.'}
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
