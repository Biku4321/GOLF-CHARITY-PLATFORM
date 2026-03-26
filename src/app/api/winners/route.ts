import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('role, id').eq('auth_user_id', user.id).single()

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') ?? 'pending'

  let query = supabase
    .from('winner_claims')
    .select('*, draw_results(match_type, prize_amount, winning_numbers, draw_id)')
    .order('created_at', { ascending: false })

  // Filter by status unless 'all'
  if (status !== 'all') {
    query = query.eq('status', status)
  }

  // Non-admin only sees own claims
  if (profile?.role !== 'admin') {
    query = query.eq('user_id', profile!.id)
  }

  const { data: claims, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ claims: claims ?? [] })
}