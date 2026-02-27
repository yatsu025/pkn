import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/^["']|["']$/g, '')
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.replace(/^["']|["']$/g, '')

  if (!url || !key) {
    console.error('Supabase credentials missing:', { url, key })
  }

  return createBrowserClient(url!, key!)
}
