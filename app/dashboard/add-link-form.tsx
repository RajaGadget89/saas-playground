'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { addBookmark } from './actions'

interface MetadataResult {
  title: string | null
  description: string | null
  favicon_url: string | null
}

export function AddLinkForm() {
  const [expanded, setExpanded] = useState(false)
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [meta, setMeta] = useState<MetadataResult | null>(null)
  const [fetchLoading, setFetchLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function reset() {
    setUrl('')
    setTitle('')
    setMeta(null)
    setError(null)
    setFetchLoading(false)
  }

  function cancel() {
    reset()
    setExpanded(false)
  }

  async function handleUrlBlur() {
    const trimmed = url.trim()
    if (!trimmed || (!trimmed.startsWith('http://') && !trimmed.startsWith('https://'))) return

    setFetchLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/metadata?url=${encodeURIComponent(trimmed)}`)
      if (res.status === 401) {
        setError('Session expired. Please refresh the page.')
        return
      }
      if (!res.ok) {
        setError('Invalid or unsupported URL.')
        return
      }
      const data: MetadataResult = await res.json()
      setMeta(data)
      if (data.title) setTitle(data.title)
    } catch {
      // network error — let user proceed without metadata
    } finally {
      setFetchLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const trimmedUrl = url.trim()
    if (!trimmedUrl) return

    startTransition(async () => {
      const result = await addBookmark({
        url: trimmedUrl,
        title: title.trim() || null,
        description: meta?.description ?? null,
        favicon_url: meta?.favicon_url ?? null,
      })

      if (result.error) {
        setError(result.error)
        return
      }

      reset()
      setExpanded(false)
    })
  }

  if (!expanded) {
    return (
      <Button variant="outline" onClick={() => setExpanded(true)}>
        + Add Link
      </Button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border border-border p-4">
      <div className="space-y-2">
        <Input
          type="url"
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onBlur={handleUrlBlur}
          required
          autoFocus
        />
        {fetchLoading && (
          <p className="text-xs text-muted-foreground">Fetching metadata…</p>
        )}
        {(meta || url) && (
          <Input
            type="text"
            placeholder="Title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={500}
          />
        )}
      </div>

      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={isPending || fetchLoading}>
          {isPending ? 'Saving…' : 'Save'}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={cancel} disabled={isPending}>
          Cancel
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </form>
  )
}
