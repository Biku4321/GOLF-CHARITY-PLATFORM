import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const createDrawSchema = z.object({
  title:               z.string().min(2),
  month_year:          z.string().regex(/^\\d{4}-\\d{2}$/, 'Must be YYYY-MM format'),
  draw_date:           z.string().optional(),   // ISO datetime string, optional
  logic_type:          z.enum(['random', 'algorithmic']),
  prize_pool_total:    z.number().int().min(0).optional(),
  jackpot_carry_forward: z.number().int().min(0).optional(),
})

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { data: draws } = await supabase
    .from('draws')
    .select('*')
    .in('status', ['upcoming', 'published', 'live'])
    .order('draw_date', { ascending: false })

  return NextResponse.json({ draws: draws ?? [] })
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    // Admin only
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('auth_user_id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body    = await req.json()
    const payload = createDrawSchema.parse(body)

    const { data: draw, error } = await supabase
      .from('draws')
      .insert({
        ...payload,
        status:               'upcoming',
        prize_pool_total:     payload.prize_pool_total     ?? 0,
        jackpot_carry_forward: payload.jackpot_carry_forward ?? 0,
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ draw }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 422 })
  }
}