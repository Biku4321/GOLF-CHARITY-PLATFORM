import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const loginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, password } = loginSchema.parse(body)

    const supabase = await createClient()
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })

    // Real-time subscription status check
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('auth_user_id', data.user.id)
      .single()

    const { data: sub } = await supabase
      .from('subscriptions')
      .select('status, current_period_end')
      .eq('user_id', profile?.id)
      .eq('status', 'active')
      .single()

    return NextResponse.json({
      user:         data.user,
      role:         profile?.role,
      subscription: sub ?? null,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 422 })
  }
}