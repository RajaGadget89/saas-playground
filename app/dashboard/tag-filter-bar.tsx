import Link from 'next/link'
import type { Tag } from './types'

export function TagFilterBar({ tags, activeTag }: { tags: Tag[]; activeTag?: string }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {tags.map((tag) => {
        const isActive = tag.name === activeTag
        return isActive ? (
          <Link
            key={tag.id}
            href="/dashboard"
            className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-xs font-medium text-primary-foreground"
          >
            {tag.name}
            <span aria-hidden>×</span>
          </Link>
        ) : (
          <Link
            key={tag.id}
            href={`/dashboard?tag=${encodeURIComponent(tag.name)}`}
            className="inline-flex items-center rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            {tag.name}
          </Link>
        )
      })}
    </div>
  )
}
