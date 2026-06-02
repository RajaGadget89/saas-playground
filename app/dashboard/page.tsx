import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { signOut } from './actions'
import { AddLinkForm } from './add-link-form'
import { BookmarkList } from './bookmark-list'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: bookmarks } = await supabase
    .from('bookmarks')
    .select('*')
    .order('created_at', { ascending: false })

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

        <BookmarkList bookmarks={bookmarks ?? []} />
      </div>
    </main>
  )
}
