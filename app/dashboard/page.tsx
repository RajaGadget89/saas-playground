import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { signOut } from './actions'
import { AddLinkForm } from './add-link-form'
import { BookmarkList } from './bookmark-list'
import { TagFilterBar } from './tag-filter-bar'
import type { BookmarkWithTags } from './types'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { tag: activeTag } = await searchParams

  const { data } = await supabase
    .from('bookmarks')
    .select('*, bookmark_tags(tags(id, name))')
    .order('created_at', { ascending: false })

  const all = (data ?? []) as unknown as BookmarkWithTags[]

  const filtered = activeTag
    ? all.filter((b) => b.bookmark_tags.some((bt) => bt.tags?.name === activeTag))
    : all

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
      <div className="mx-auto w-full max-w-2xl space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">My Bookmarks</h1>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
          <form action={signOut}>
            <Button variant="outline" size="sm" type="submit">
              Sign out
            </Button>
          </form>
        </header>

        <AddLinkForm />

        {allTags.length > 0 && <TagFilterBar tags={allTags} activeTag={activeTag} />}

        <BookmarkList bookmarks={filtered} activeTag={activeTag} />
      </div>
    </main>
  )
}
