import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const entrySchema = z.object({
  draw_id: z.string().uuid(),
  // Five Stableford scores the user picks as their draw numbers (1–45)
  score_1: z.number().int().min(1).max(45),
  score_2: z.number().int().min(1).max(45),
  score_3: z.number().int().min(1).max(45),
  score_4: z.number().int().min(1).max(45),
  score_5: z.number().int().min(1).max(45),
})

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const body   = await req.json()
    const parsed = entrySchema.parse(body)

    // Resolve profile row id
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('auth_user_id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Must have an active subscription to enter
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('status')
      .eq('user_id', profile.id)
      .eq('status', 'active')
      .single()

    if (!sub) {
      return NextResponse.json(
        { error: 'Active subscription required to enter a draw' },
        { status: 403 }
      )
    }

    // Draw must be in an enterable state
    const { data: draw } = await supabase
      .from('draws')
      .select('id, status, draw_date')
      .eq('id', parsed.draw_id)
      .single()

    if (!draw) {
      return NextResponse.json({ error: 'Draw not found' }, { status: 404 })
    }

    if (!['upcoming', 'published', 'live'].includes(draw.status)) {
      return NextResponse.json(
        { error: 'This draw is not currently accepting entries' },
        { status: 409 }
      )
    }

    // One entry per user per draw — upsert on (draw_id, user_id)
    const { data: entry, error } = await supabase
      .from('draw_entries')
      .upsert(
        {
          draw_id:  parsed.draw_id,
          user_id:  profile.id,
          score_1:  parsed.score_1,
          score_2:  parsed.score_2,
          score_3:  parsed.score_3,
          score_4:  parsed.score_4,
          score_5:  parsed.score_5,
        },
        { onConflict: 'draw_id,user_id' }
      )
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ entry }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 422 })
  }
}

// GET — let a user check whether they already have an entry for a given draw
export async function GET(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const drawId = searchParams.get('draw_id')
  if (!drawId) return NextResponse.json({ error: 'draw_id required' }, { status: 400 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()

  const { data: entry } = await supabase
    .from('draw_entries')
    .select('*')
    .eq('draw_id', drawId)
    .eq('user_id', profile!.id)
    .single()

  return NextResponse.json({ entry: entry ?? null })
}