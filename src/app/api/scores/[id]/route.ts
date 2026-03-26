import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const updateScoreSchema = z.object({
  stableford_score: z.number().min(1).max(45).optional(),
  score_date:       z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
})

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  try {
    const body = await req.json()
    const parsed = updateScoreSchema.parse(body)

    const { data: profile } = await supabase
      .from('profiles').select('id').eq('auth_user_id', user.id).single()

    // Ensure the score actually belongs to the user trying to update it
    const { data: scoreCheck } = await supabase
      .from('scores').select('id').eq('id', id).eq('user_id', profile!.id).single()
      
    if (!scoreCheck) return NextResponse.json({ error: 'Score not found or forbidden' }, { status: 404 })

    const { data, error } = await supabase
      .from('scores').update(parsed).eq('id', id).select().single()

    if (error) throw error

    return NextResponse.json({ score: data })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 422 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  try {
    const { data: profile } = await supabase
      .from('profiles').select('id').eq('auth_user_id', user.id).single()

    // Ensure the score actually belongs to the user trying to delete it
    const { data: scoreCheck } = await supabase
      .from('scores').select('id').eq('id', id).eq('user_id', profile!.id).single()
      
    if (!scoreCheck) return NextResponse.json({ error: 'Score not found or forbidden' }, { status: 404 })

    const { error } = await supabase.from('scores').delete().eq('id', id)
    
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}