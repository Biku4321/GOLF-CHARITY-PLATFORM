import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const donationSchema = z.object({
  charity_id:   z.string().uuid(),
  amount_pence: z.number().min(100),   // min £1
})

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('id').eq('auth_user_id', user.id).single()

  try {
    const body = await req.json()
    const { charity_id, amount_pence } = donationSchema.parse(body)

    const { data, error } = await supabase
      .from('donations')
      .insert({
        user_id:      profile!.id,
        charity_id,
        amount_pence,
        type:         'independent',
        status:       'completed',
      })
      .select().single()

    if (error) throw error
    return NextResponse.json({ donation: data }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 422 })
  }
}

export async function GET(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('id').eq('auth_user_id', user.id).single()

  const { data: donations } = await supabase
    .from('donations')
    .select('*, charities(name, image_url)')
    .eq('user_id', profile!.id)
    .order('created_at', { ascending: false })

  return NextResponse.json({ donations: donations ?? [] })
}