import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { signOut } from './actions'
import { AddLinkForm } from './add-link-form'
import { BookmarkList } from './bookmark-list'
import { TagFilterBar } from './tag-filter-bar'
import { SearchBar } from './search-bar'
import { ViewToggle } from './view-toggle'
import type { BookmarkWithTags } from './types'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string; q?: string }>
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { tag: activeTag, q } = await searchParams
  const cookieStore = await cookies()
  const view = cookieStore.get('linkstash_view')?.value === 'grid' ? 'grid' : 'list'

  const { data } = await supabase
    .from('bookmarks')
    .select('*, bookmark_tags(tags(id, name))')
    .order('created_at', { ascending: false })

  const all = (data ?? []) as unknown as BookmarkWithTags[]

  const afterTagFilter = activeTag
    ? all.filter((b) => b.bookmark_tags.some((bt) => bt.tags?.name === activeTag))
    : all

  const filtered = q
    ? (() => {
        const lower = q.toLowerCase()
        return afterTagFilter.filter(
          (b) =>
            b.title?.toLowerCase().includes(lower) ||
            b.url.toLowerCase().includes(lower) ||
            b.description?.toLowerCase().includes(lower)
        )
      })()
    : afterTagFilter

  const allTags = Array.from(
    new Map(
      all
        .flatMap((b) => b.bookmark_tags.map((bt) => bt.tags))
        .filter((t): t is { id: string; name: string } => t !== null)
        .map((t) => [t.id, t])
    ).values()
  ).sort((a, b) => a.name.localeCompare(b.name))

  return (
    <main className="flex flex-col flex-1 px-4 py-8">
      <div className={`mx-auto w-full space-y-6 ${view === 'grid' ? 'max-w-5xl' : 'max-w-2xl'}`}>
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">My Bookmarks</h1>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <ViewToggle view={view} />
            <form action={signOut}>
              <Button variant="outline" size="sm" type="submit">
                Sign out
              </Button>
            </form>
          </div>
        </header>

        <AddLinkForm />

        <Suspense key={q ?? ''} fallback={<div className="h-9 rounded-md bg-muted animate-pulse" />}>
          <SearchBar initialQ={q} />
        </Suspense>

        {allTags.length > 0 && <TagFilterBar tags={allTags} activeTag={activeTag} q={q} />}

        <BookmarkList bookmarks={filtered} activeTag={activeTag} view={view} />
      </div>
    </main>
  )
}
