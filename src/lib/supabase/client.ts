import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Guard: provide clear error message during local dev when env vars are missing
if (typeof window !== 'undefined' && (!supabaseUrl || !supabaseKey)) {
  console.error(
    '[Supabase] NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set in .env.local'
  )
}

export const createClient = () =>
  createBrowserClient(
    supabaseUrl  ?? '',
    supabaseKey  ?? ''
  )