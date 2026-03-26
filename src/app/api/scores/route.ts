import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const scoreSchema = z.object({
  stableford_score: z.number().min(1).max(45),
  score_date:       z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
})

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('id').eq('auth_user_id', user.id).single()

  const { data: scores } = await supabase
    .from('scores')
    .select('*')
    .eq('user_id', profile!.id)
    .order('score_date', { ascending: false })
    .limit(5)

  return NextResponse.json({ scores: scores ?? [] })
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  try {
    const body = await req.json()
    const { stableford_score, score_date } = scoreSchema.parse(body)

    const { data: profile } = await supabase
      .from('profiles').select('id').eq('auth_user_id', user.id).single()

    // Check subscription
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('status')
      .eq('user_id', profile!.id)
      .eq('status', 'active')
      .single()

    if (!sub) return NextResponse.json(
      { error: 'Active subscription required' }, { status: 403 }
    )

    // Rolling 5 logic — DB trigger handles delete
    const { data: score, error } = await supabase
      .from('scores')
      .insert({ user_id: profile!.id, stableford_score, score_date })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ score }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 422 })
  }
}