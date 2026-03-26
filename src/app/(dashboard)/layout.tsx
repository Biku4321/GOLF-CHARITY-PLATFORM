import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div>
      <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-40">
        <Link href="/dashboard" className="font-semibold text-emerald-700 hover:text-emerald-800">
          GolfGives
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">Dashboard</Link>
          <Link href="/scores"    className="text-sm text-gray-600 hover:text-gray-900">Scores</Link>
          <Link href="/draws"     className="text-sm text-gray-600 hover:text-gray-900">Draws</Link>
          <Link href="/charity"   className="text-sm text-gray-600 hover:text-gray-900">Charity</Link>
          <Link href="/winnings"  className="text-sm text-gray-600 hover:text-gray-900">Winnings</Link>
          <Link href="/settings"  className="text-sm text-gray-600 hover:text-gray-900">Settings</Link>
          <form action="/api/auth/logout" method="POST">
            <button type="submit" className="text-sm text-red-500 hover:text-red-700">
              Logout
            </button>
          </form>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  )
}