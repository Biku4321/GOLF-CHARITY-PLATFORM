import { createClient } from '@/lib/supabase/server'

export default async function AdminReportsPage() {
  const supabase = await createClient()

  const [
    { count: totalUsers },
    { count: activeSubs },
    { data:  donations  },
    { data:  claims     },
    { data:  draws      },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('subscriptions').select('*', { count: 'exact', head: true })
      .eq('status', 'active'),
    supabase.from('donations').select('amount_pence, charities(name)')
      .eq('status', 'completed'),
    supabase.from('winner_claims').select('payout_amount, status'),
    supabase.from('draws').select('title, month_year, prize_pool_total, status')
      .order('created_at', { ascending: false }).limit(12),
  ])

  const totalDonated = (donations ?? []).reduce((s: number, d: any) => s + d.amount_pence, 0)
  const totalPaidOut = (claims ?? [])
    .filter((c: any) => c.status === 'paid')
    .reduce((s: number, c: any) => s + c.payout_amount, 0)

  // Charity breakdown
  const charityTotals: Record<string, number> = {}
  for (const d of donations ?? []) {
    const name = (d as any).charities?.name ?? 'Unknown'
    charityTotals[name] = (charityTotals[name] ?? 0) + (d as any).amount_pence
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-6">Reports & analytics</h1>

      {/* Top stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total users',       value: totalUsers ?? 0,
            sub: 'registered accounts' },
          { label: 'Active subscribers',value: activeSubs ?? 0,
            sub: 'paying members'       },
          { label: 'Total donated',     value: `£${(totalDonated / 100).toFixed(2)}`,
            sub: 'to charities'         },
          { label: 'Total paid out',    value: `£${(totalPaidOut / 100).toFixed(2)}`,
            sub: 'in prizes'            },
        ].map(({ label, value, sub }) => (
          <div key={label}
            className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-400 mb-1">{label}</p>
            <p className="text-2xl font-semibold">{value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">

        {/* Charity breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold mb-4">Charity contributions</h2>
          {Object.keys(charityTotals).length === 0 ? (
            <p className="text-sm text-gray-400">No donations yet.</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(charityTotals)
                .sort(([,a], [,b]) => b - a)
                .map(([name, total]) => {
                  const pct = Math.round((total / totalDonated) * 100)
                  return (
                    <div key={name}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="truncate">{name}</span>
                        <span className="font-medium ml-2 shrink-0">
                          £{(total / 100).toFixed(2)}
                        </span>
                      </div>
                      <div className="bg-gray-100 rounded-full h-1.5">
                        <div
                          className="bg-emerald-500 h-full rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
            </div>
          )}
        </div>

        {/* Draw history */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold mb-4">Draw history</h2>
          {(draws ?? []).length === 0 ? (
            <p className="text-sm text-gray-400">No draws yet.</p>
          ) : (
            <div className="space-y-2">
              {draws!.map(draw => (
                <div key={draw.month_year}
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{draw.title}</p>
                    <p className="text-xs text-gray-400">{draw.month_year}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">
                      £{(draw.prize_pool_total / 100).toFixed(2)}
                    </p>
                    <span className={`text-xs ${
                      draw.status === 'published'
                        ? 'text-emerald-600'
                        : 'text-gray-400'
                    }`}>
                      {draw.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
