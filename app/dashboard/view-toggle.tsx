'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { LayoutList, LayoutGrid } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { setViewPreference } from './actions'

export function ViewToggle({ view }: { view: 'list' | 'grid' }) {
  const router = useRouter()
  const [, startTransition] = useTransition()

  function toggle(next: 'list' | 'grid') {
    startTransition(async () => {
      await setViewPreference(next)
      router.refresh()
    })
  }

  return (
    <div className="flex gap-0.5">
      <Button
        size="sm"
        variant={view === 'list' ? 'secondary' : 'ghost'}
        onClick={() => toggle('list')}
        aria-label="List view"
        aria-pressed={view === 'list'}
      >
        <LayoutList className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant={view === 'grid' ? 'secondary' : 'ghost'}
        onClick={() => toggle('grid')}
        aria-label="Grid view"
        aria-pressed={view === 'grid'}
      >
        <LayoutGrid className="h-4 w-4" />
      </Button>
    </div>
  )
}
