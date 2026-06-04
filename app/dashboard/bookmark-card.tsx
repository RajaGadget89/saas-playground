'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { BookmarkWithTags, Tag } from './types'
import { updateBookmark, deleteBookmark, addTagToBookmark, removeTagFromBookmark } from './actions'

type Mode = 'view' | 'edit' | 'confirm-delete'

export function BookmarkCard({ bookmark, view = 'list' }: { bookmark: BookmarkWithTags; view?: 'list' | 'grid' }) {
  const [mode, setMode] = useState<Mode>('view')
  const [title, setTitle] = useState(bookmark.title ?? '')
  const [description, setDescription] = useState(bookmark.description ?? '')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const [addingTag, setAddingTag] = useState(false)
  const [tagInput, setTagInput] = useState('')
  const [tagError, setTagError] = useState<string | null>(null)
  const [isTagPending, startTagTransition] = useTransition()

  const tags = bookmark.bookmark_tags
    .map((bt) => bt.tags)
    .filter((t): t is Tag => t !== null)

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

  function handleAddTag() {
    if (!tagInput.trim()) {
      setAddingTag(false)
      return
    }
    setTagError(null)
    startTagTransition(async () => {
      const result = await addTagToBookmark({
        bookmarkId: bookmark.id,
        tagName: tagInput.trim(),
      })
      if ('error' in result) {
        setTagError(result.error ?? null)
        return
      }
      setTagInput('')
      setAddingTag(false)
    })
  }

  function handleRemoveTag(tagId: string) {
    setTagError(null)
    startTagTransition(async () => {
      const result = await removeTagFromBookmark({
        bookmarkId: bookmark.id,
        tagId,
      })
      if ('error' in result) {
        setTagError(result.error ?? null)
      }
    })
  }

  const faviconSize = view === 'grid' ? 20 : 16
  const favicon = bookmark.favicon_url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={bookmark.favicon_url}
      alt=""
      width={faviconSize}
      height={faviconSize}
      className="shrink-0 object-contain"
      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
    />
  ) : null

  if (mode === 'edit') {
    return (
      <li className="flex gap-3 rounded-lg border border-border p-3">
        {favicon}
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
        {favicon}
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

  const tagsRow = (
    <div className="flex flex-wrap items-center gap-1 pt-1">
      {tags.map((tag) => (
        <span
          key={tag.id}
          className="inline-flex items-center gap-0.5 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
        >
          {tag.name}
          <button
            type="button"
            onClick={() => handleRemoveTag(tag.id)}
            disabled={isTagPending}
            className="ml-0.5 leading-none hover:text-destructive disabled:opacity-50"
            aria-label={`Remove tag ${tag.name}`}
          >
            ×
          </button>
        </span>
      ))}

      {addingTag ? (
        <input
          type="text"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { e.preventDefault(); handleAddTag() }
            if (e.key === 'Escape') { setTagInput(''); setAddingTag(false) }
          }}
          onBlur={() => {
            if (tagInput.trim()) handleAddTag()
            else setAddingTag(false)
          }}
          maxLength={50}
          placeholder="tag name"
          disabled={isTagPending}
          autoFocus
          className="h-5 w-24 rounded-full border border-input bg-background px-2 text-xs outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
        />
      ) : (
        <button
          type="button"
          onClick={() => setAddingTag(true)}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          + Add tag
        </button>
      )}
    </div>
  )

  const actionButtons = (
    <>
      <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={startEdit}>
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
    </>
  )

  if (view === 'grid') {
    return (
      <li className="flex flex-col rounded-lg border border-border p-4 hover:border-foreground/30">
        <div className="flex items-center gap-1.5 mb-2">
          {favicon}
          <p className="truncate text-xs text-muted-foreground">{hostname}</p>
        </div>
        <a
          href={bookmark.url}
          target="_blank"
          rel="noopener noreferrer"
          className="line-clamp-2 text-sm font-medium hover:underline mb-1"
        >
          {bookmark.title || bookmark.url}
        </a>
        {bookmark.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-1">{bookmark.description}</p>
        )}
        <div className="mt-auto">
          {tagsRow}
          {tagError && <p className="text-xs text-destructive">{tagError}</p>}
          <div className="flex justify-end gap-1 mt-2">
            {actionButtons}
          </div>
        </div>
      </li>
    )
  }

  return (
    <li className="flex gap-3 rounded-lg border border-border p-3">
      {favicon && <div className="mt-0.5">{favicon}</div>}
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
        {tagsRow}
        {tagError && <p className="text-xs text-destructive">{tagError}</p>}
      </div>

      <div className="flex shrink-0 gap-1">
        {actionButtons}
      </div>
    </li>
  )
}
