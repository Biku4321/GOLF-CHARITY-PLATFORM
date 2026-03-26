import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('auth_user_id', user.id).single()
  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { claim_id } = await req.json()

  const { data, error } = await supabase
    .from('winner_claims')
    .update({
      status:  'paid',
      paid_at: new Date().toISOString(),
    })
    .eq('id', claim_id)
    .eq('status', 'approved')   // only approved claims
    .select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ claim: data })
}