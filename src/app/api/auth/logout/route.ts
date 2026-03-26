// import { createClient } from '@/lib/supabase/server'
// import { NextResponse } from 'next/server'

// export async function POST() {
//   const supabase = await createClient()
//   await supabase.auth.signOut()

//   return NextResponse.redirect(
//     new URL('/login', process.env.NEXT_PUBLIC_APP_URL!)
//   )
// }
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const supabase = await createClient()
  await supabase.auth.signOut()

  // Derive origin from the incoming request so this works in every environment
  // without depending on NEXT_PUBLIC_APP_URL being set correctly.
  const origin = new URL(req.url).origin
  return NextResponse.redirect(new URL('/login', origin))
}