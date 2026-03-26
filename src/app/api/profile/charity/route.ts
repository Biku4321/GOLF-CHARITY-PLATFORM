import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('charity_percentage, charities(id, name, slug, description, image_url, website_url)')
    .eq('auth_user_id', user.id)
    .single()

  return NextResponse.json({
    charity:            profile?.charities ?? null,
    charity_percentage: profile?.charity_percentage ?? 10,
  })
}

export async function PUT(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { charity_id, charity_percentage } = await req.json()

  if (charity_percentage < 10 || charity_percentage > 100) {
    return NextResponse.json(
      { error: 'Percentage must be 10–100' }, { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from('profiles')
    .update({
      selected_charity_id: charity_id,
      charity_percentage,
    })
    .eq('auth_user_id', user.id)
    .select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ profile: data })
}