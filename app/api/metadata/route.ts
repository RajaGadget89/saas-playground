import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'
import ogs from 'open-graph-scraper'
import { z } from 'zod'

function isPrivateHost(hostname: string): boolean {
  if (['localhost', '127.0.0.1', '0.0.0.0', '::1'].includes(hostname)) return true
  return [
    /^127\.\d+\.\d+\.\d+$/,
    /^10\.\d+\.\d+\.\d+$/,
    /^192\.168\.\d+\.\d+$/,
    /^172\.(1[6-9]|2\d|30|31)\.\d+\.\d+$/,
    /^169\.254\.\d+\.\d+$/, // link-local / AWS instance metadata
  ].some((r) => r.test(hostname))
}

const querySchema = z
  .string()
  .url()
  .refine((url) => ['http:', 'https:'].includes(new URL(url).protocol), {
    message: 'Only http/https URLs are allowed',
  })
  .refine((url) => !isPrivateHost(new URL(url).hostname), {
    message: 'Private or internal URLs are not allowed',
  })

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const raw = new URL(request.url).searchParams.get('url') ?? ''
  const parsed = querySchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
  }

  const url = parsed.data

  try {
    const { result } = await ogs({ url, timeout: 5000 })

    const faviconUrl = result.favicon
      ? new URL(result.favicon, url).href
      : `https://${new URL(url).hostname}/favicon.ico`

    return NextResponse.json({
      title: result.ogTitle || result.twitterTitle || null,
      description: result.ogDescription || result.twitterDescription || null,
      favicon_url: faviconUrl,
    })
  } catch {
    return NextResponse.json({ title: null, description: null, favicon_url: null })
  }
}
