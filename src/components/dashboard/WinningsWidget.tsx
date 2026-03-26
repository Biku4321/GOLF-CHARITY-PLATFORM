'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export function WinningsWidget({ userId }: { userId: string }) {
  const [claims,  setClaims]  = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/winners')
      .then(r => r.json())
      .then(d => { setClaims(d.claims ?? []); setLoading(false) })
  }, [])

  const totalWon = claims
    .filter(c => c.status === 'paid')
    .reduce((s, c) => s + c.payout_amount, 0)

  const pending = claims.filter(c => c.status === 'pending' && !c.proof_url).length
  const approved = claims.filter(c => c.status === 'approved').length

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
          Winnings
        </p>
        <Link href="/winnings"
          className="text-xs text-emerald-600 hover:underline">
          View all →
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {[
          { label: 'Total won',      value: `£${(totalWon / 100).toFixed(2)}`, color: 'text-emerald-600' },
          { label: 'Total claims',   value: claims.length,                      color: 'text-gray-900'    },
          { label: 'Pending review', value: pending,                            color: 'text-amber-600'   },
          { label: 'Approved',       value: approved,                           color: 'text-blue-600'    },
        ].map(({ label, value, color }) => (
          <div key={label}
            className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-400 mb-1">{label}</p>
            <p className={`text-xl font-semibold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1,2].map(i => (
            <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : claims.length === 0 ? (
        <p className="text-sm text-gray-500">
          No winnings yet. Enter draws to win prizes.
        </p>
      ) : (
        <div className="space-y-2">
          {claims.slice(0, 3).map(claim => (
            <div key={claim.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div>
                <p className="text-sm font-medium">
                  {claim.draw_results?.match_type?.replace('_', ' ')}
                </p>
                <p className="text-xs text-gray-400">
                  £{(claim.payout_amount / 100).toFixed(2)} prize
                </p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                claim.status === 'paid'
                  ? 'bg-emerald-100 text-emerald-700'
                  : claim.status === 'approved'
                  ? 'bg-blue-100 text-blue-700'
                  : claim.status === 'rejected'
                  ? 'bg-red-100 text-red-600'
                  : 'bg-amber-100 text-amber-700'
              }`}>
                {claim.status}
              </span>
            </div>
          ))}
        </div>
      )}

      {pending > 0 && (
        <div className="mt-3 bg-amber-50 border border-amber-100 rounded-xl p-3">
          <p className="text-xs text-amber-700 font-medium">
            You have {pending} pending claim{pending !== 1 ? 's' : ''}.
          </p>
          <Link href="/winner-verify"
            className="text-xs text-amber-600 hover:underline mt-0.5 block">
            Submit proof to claim →
          </Link>
        </div>
      )}
    </div>
  )
}