'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Tables } from '@/lib/supabase/types'
import { updateBookmark, deleteBookmark } from './actions'

type Bookmark = Tables<'bookmarks'>
type Mode = 'view' | 'edit' | 'confirm-delete'

export function BookmarkCard({ bookmark }: { bookmark: Bookmark }) {
  const [mode, setMode] = useState<Mode>('view')
  const [title, setTitle] = useState(bookmark.title ?? '')
  const [description, setDescription] = useState(bookmark.description ?? '')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  let hostname = bookmark.url
  try {
    hostname = new URL(bookmark.url).hostname
  } catch {
    // malformed URL — show as-is
  }

  function startEdit() {
    setTitle(bookmark.title ?? '')
    setDescription(bookmark.description ?? '')
    setError(null)
    setMode('edit')
  }

  function handleSave() {
    setError(null)
    startTransition(async () => {
      const result = await updateBookmark({
        id: bookmark.id,
        title: title.trim() || null,
        description: description.trim() || null,
      })
      if ('error' in result) {
        setError(result.error ?? null)
        return
      }
      setMode('view')
    })
  }

  function handleDelete() {
    setError(null)
    startTransition(async () => {
      const result = await deleteBookmark({ id: bookmark.id })
      if ('error' in result) {
        setError(result.error ?? null)
        setMode('view')
      }
    })
  }

  if (mode === 'edit') {
    return (
      <li className="flex gap-3 rounded-lg border border-border p-3">
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
        <div className="min-w-0 flex-1 space-y-2">
          <Input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={500}
            autoFocus
          />
          <textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={2000}
            rows={3}
            className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSave} disabled={isPending}>
              {isPending ? 'Saving…' : 'Save'}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => { setError(null); setMode('view') }}
              disabled={isPending}
            >
              Cancel
            </Button>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
      </li>
    )
  }

  if (mode === 'confirm-delete') {
    return (
      <li className="flex gap-3 rounded-lg border border-border p-3">
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
        <div className="min-w-0 flex-1 space-y-2">
          <p className="truncate text-sm font-medium">{bookmark.title || bookmark.url}</p>
          <p className="truncate text-xs text-muted-foreground">{hostname}</p>
          <p className="text-sm">Delete this bookmark?</p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending}
            >
              {isPending ? 'Deleting…' : 'Confirm delete'}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => { setError(null); setMode('view') }}
              disabled={isPending}
            >
              Cancel
            </Button>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
      </li>
    )
  }

  return (
    <li className="flex gap-3 rounded-lg border border-border p-3">
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
      <div className="min-w-0 flex-1 space-y-0.5">
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
          <p className="text-xs text-muted-foreground line-clamp-2">{bookmark.description}</p>
        )}
      </div>
      <div className="flex shrink-0 gap-1">
        <Button
          size="sm"
          variant="ghost"
          className="h-7 px-2 text-xs"
          onClick={startEdit}
        >
          Edit
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 px-2 text-xs text-destructive hover:text-destructive"
          onClick={() => { setError(null); setMode('confirm-delete') }}
        >
          Delete
        </Button>
      </div>
    </li>
  )
}
