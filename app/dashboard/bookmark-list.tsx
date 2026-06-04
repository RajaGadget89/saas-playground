import type { BookmarkWithTags } from './types'
import { BookmarkCard } from './bookmark-card'

export function BookmarkList({
  bookmarks,
  activeTag,
  view = 'list',
}: {
  bookmarks: BookmarkWithTags[]
  activeTag?: string
  view?: 'list' | 'grid'
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
    <ul className={view === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3' : 'space-y-2'}>
      {bookmarks.map((bookmark) => (
        <BookmarkCard key={bookmark.id} bookmark={bookmark} view={view} />
      ))}
    </ul>
  )
}
