'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useRef, useState, useTransition } from 'react'
import { Input } from '@/components/ui/input'

export function SearchBar({ initialQ }: { initialQ?: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [value, setValue] = useState(initialQ ?? '')

  function handleChange(next: string) {
    setValue(next)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (next.trim()) {
        params.set('q', next.trim())
      } else {
        params.delete('q')
      }
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`)
      })
    }, 300)
  }

  return (
    <Input
      type="search"
      placeholder="Search bookmarks…"
      value={value}
      onChange={(e) => handleChange(e.target.value)}
      className="w-full"
    />
  )
}
