import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('auth_user_id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 bg-gray-900 text-white p-4 shrink-0 sticky top-0 h-screen overflow-y-auto">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
          Admin Panel
        </p>
        <nav className="space-y-1">
          {[
            { href: '/admin',            label: 'Overview'   },
            { href: '/admin/users',      label: 'Users'      },
            { href: '/admin/draws',      label: 'Draws'      },
            { href: '/admin/charities',  label: 'Charities'  },
            { href: '/admin/winners',    label: 'Winners'    },
            { href: '/admin/reports',    label: 'Reports'    },
          ].map(({ href, label }) => (
            <Link key={href} href={href}
              className="block px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">
              {label}
            </Link>
          ))}
        </nav>
        <div className="mt-8">
          <Link href="/dashboard"
            className="block px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white">
            ← User dashboard
          </Link>
        </div>
      </aside>
      <main className="flex-1 bg-gray-50">{children}</main>
    </div>
  )
}