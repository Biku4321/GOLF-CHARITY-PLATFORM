import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const charitySchema = z.object({
  name:        z.string().min(2),
  slug:        z.string().min(2),
  description: z.string().optional(),
  image_url:   z.string().url().optional(),
  website_url: z.string().url().optional(),
  is_featured: z.boolean().optional(),
  is_active:   z.boolean().optional(),
})

export async function GET(req: Request) {
  const supabase = await createClient()
  const { searchParams } = new URL(req.url)
  const search   = searchParams.get('search') ?? ''
  const featured = searchParams.get('featured')

  let query = supabase
    .from('charities')
    .select('*, charity_events(id, title, event_date, location)')
    .eq('is_active', true)
    .order('is_featured', { ascending: false })
    .order('name')

  if (search) {
    query = query.ilike('name', `%${search}%`)
  }
  if (featured === 'true') {
    query = query.eq('is_featured', true)
  }

  const { data: charities } = await query
  return NextResponse.json({ charities: charities ?? [] })
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('auth_user_id', user.id).single()
  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const body    = await req.json()
    const payload = charitySchema.parse(body)

    const { data, error } = await supabase
      .from('charities').insert(payload).select().single()

    if (error) throw error
    return NextResponse.json({ charity: data }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 422 })
  }
}