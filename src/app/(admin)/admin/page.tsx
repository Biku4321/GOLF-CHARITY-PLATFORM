import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function AdminOverviewPage() {
  const supabase = await createClient()

  const [
    { count: totalUsers },
    { count: activeSubs },
    { count: pendingClaims },
    { data:  recentDraws },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('subscriptions').select('*', { count: 'exact', head: true })
      .eq('status', 'active'),
    supabase.from('winner_claims').select('*', { count: 'exact', head: true })
      .eq('status', 'pending'),
    supabase.from('draws').select('*').order('created_at', { ascending: false }).limit(5),
  ])

  const stats = [
    { label: 'Total users',     value: totalUsers   ?? 0, color: 'text-gray-900'    },
    { label: 'Active subs',     value: activeSubs   ?? 0, color: 'text-emerald-600' },
    { label: 'Pending claims',  value: pendingClaims ?? 0, color: 'text-amber-600'  },
    { label: 'Prize pool est.', value: `£${((activeSubs ?? 0) * 5.99).toFixed(0)}`, color: 'text-emerald-600' },
  ]

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-6">Admin overview</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 mb-1">{label}</p>
            <p className={`text-2xl font-semibold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold">Recent draws</h2>
        </div>
        {(recentDraws ?? []).length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-400">
            No draws yet.{' '}
            <import Link from 'next/link' href="/admin/draws/new" className="text-emerald-600 hover:underline">
              Create first draw
            </import>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {recentDraws!.map(draw => (
              <div key={draw.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{draw.title}</p>
                  <p className="text-xs text-gray-400">{draw.month_year}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    draw.status === 'published' ? 'bg-emerald-100 text-emerald-700'
                    : draw.status === 'live'    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600'
                  }`}>
                    {draw.status}
                  </span>
                  <Link href={`/admin/draws/${draw.id}`}
                    className="text-xs text-emerald-600 hover:underline">
                    Manage →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}