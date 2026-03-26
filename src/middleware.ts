import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_ROUTES = ['/', '/charities', '/how-it-works', '/subscribe',
                       '/login', '/signup', '/forgot-password']
const ADMIN_ROUTES  = ['/admin']
const AUTH_ROUTES   = ['/login', '/signup']

export async function middleware(req: NextRequest) {
  let supabaseResponse = NextResponse.next({ request: req })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return req.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request: req })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Use getUser() — not getSession() — as recommended by Supabase for middleware
  const { data: { user } } = await supabase.auth.getUser()

  const path     = req.nextUrl.pathname
  const isPublic = PUBLIC_ROUTES.some(r => path === r || path.startsWith(r + '/'))
  const isAdmin  = ADMIN_ROUTES.some(r => path.startsWith(r))
  const isAuth   = AUTH_ROUTES.some(r => path.startsWith(r))

  // Redirect logged-in users away from auth pages
  if (user && isAuth) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // Redirect unauthenticated users to login for protected routes
  if (!user && !isPublic) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Admin route guard — check role in DB
  if (user && isAdmin) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('auth_user_id', user.id)
      .single()
    if (profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}