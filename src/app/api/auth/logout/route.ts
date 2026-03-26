import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  
  await supabase.auth.signOut()
  
  const requestUrl = new URL(request.url)
  
  return NextResponse.redirect(new URL('/login', requestUrl.origin), {
    status: 303
  })
}