import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const signupSchema = z.object({
  full_name: z.string().min(2),
  email:     z.string().email(),
  password:  z.string().min(8),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { full_name, email, password } = signupSchema.parse(body)

    const supabase = await createClient()   // ← await lagao

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name } },
    })

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    return NextResponse.json({ user: data.user }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 422 })
  }
}