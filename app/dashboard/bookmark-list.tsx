import type { Tables } from '@/lib/supabase/types'

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
      {bookmarks.map((bookmark) => {
        let hostname = bookmark.url
        try {
          hostname = new URL(bookmark.url).hostname
        } catch {
          // malformed URL — show as-is
        }

        return (
          <li key={bookmark.id} className="flex gap-3 rounded-lg border border-border p-3">
            {bookmark.favicon_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={bookmark.favicon_url}
                alt=""
                width={16}
                height={16}
                className="mt-0.5 shrink-0 object-contain"
              />
            )}
            <div className="min-w-0 space-y-0.5">
              <a
                href={bookmark.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block truncate text-sm font-medium hover:underline"
              >
                {bookmark.title || bookmark.url}
              </a>
              <p className="truncate text-xs text-muted-foreground">{hostname}</p>
              {bookmark.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {bookmark.description}
                </p>
              )}
            </div>
          </li>
        )
      })}
    </ul>
  )
}
