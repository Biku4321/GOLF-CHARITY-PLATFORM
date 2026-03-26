'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function WinningsPage() {
  const [claims,  setClaims]  = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter,  setFilter]  = useState('all')

  useEffect(() => {
    fetch('/api/winners')
      .then(r => r.json())
      .then(d => { setClaims(d.claims ?? []); setLoading(false) })
  }, [])

  const filtered = filter === 'all'
    ? claims
    : claims.filter(c => c.status === filter)

  const totalWon = claims
    .filter(c => c.status === 'paid')
    .reduce((s, c) => s + c.payout_amount, 0)

  const pending = claims.filter(c => c.status === 'pending' && !c.proof_url).length

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">

        <div className="mb-6">
          <h1 className="text-2xl font-semibold">My winnings</h1>
          <p className="text-sm text-gray-500 mt-1">
            Track your prize claims and payment status.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total won',    value: `£${(totalWon / 100).toFixed(2)}`, color: 'text-emerald-600' },
            { label: 'Total claims', value: claims.length,                      color: 'text-gray-900'    },
            { label: 'Pending',      value: claims.filter(c => c.status === 'pending').length,   color: 'text-amber-600'   },
            { label: 'Approved',     value: claims.filter(c => c.status === 'approved').length,  color: 'text-blue-600'    },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs text-gray-400 mb-1">{label}</p>
              <p className={`text-xl font-semibold ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Pending proof alert */}
        {pending > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <p className="text-sm font-medium text-amber-800">
              {pending} claim{pending !== 1 ? 's' : ''} awaiting proof submission
            </p>
            <Link href="/winner-verify"
              className="text-xs text-amber-600 hover:underline mt-1 block">
              Submit proof now →
            </Link>
          </div>
        )}

        {/* Filter tabs */}
        <div className="flex gap-2 mb-4">
          {['all', 'pending', 'approved', 'paid', 'rejected'].map(s => (
            <button key={s}
              onClick={() => setFilter(s)}
              className={`text-sm px-3 py-1.5 rounded-full border transition-colors capitalize ${
                filter === s
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}>
              {s}
            </button>
          ))}
        </div>

        {/* Claims list */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-8 space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-400 text-sm">No claims found.</p>
              <p className="text-xs text-gray-300 mt-1">
                Win a draw to see claims here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filtered.map(claim => (
                <div key={claim.id} className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-sm capitalize">
                        {claim.draw_results?.match_type?.replace('_', ' ') ?? 'Prize claim'}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Submitted {new Date(claim.submitted_at).toLocaleDateString('en-GB', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </p>
                      {claim.admin_notes && (
                        <p className="text-xs text-gray-500 mt-1 bg-gray-50 rounded px-2 py-1">
                          Note: {claim.admin_notes}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold">
                        £{(claim.payout_amount / 100).toFixed(2)}
                      </p>
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
                  </div>

                  {/* Status timeline */}
                  <div className="flex items-center gap-2 mt-3">
                    {['Submitted', 'Reviewed', 'Paid'].map((step, i) => {
                      const done = (
                        (i === 0) ||
                        (i === 1 && ['approved','rejected','paid'].includes(claim.status)) ||
                        (i === 2 && claim.status === 'paid')
                      )
                      return (
                        <div key={step} className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${done ? 'bg-emerald-500' : 'bg-gray-200'}`} />
                          <span className={`text-xs ${done ? 'text-emerald-600' : 'text-gray-400'}`}>
                            {step}
                          </span>
                          {i < 2 && <div className={`flex-1 h-px w-8 ${done ? 'bg-emerald-200' : 'bg-gray-200'}`} />}
                        </div>
                      )
                    })}
                  </div>

                  {claim.status === 'pending' && (
                    <Link href="/winner-verify"
                      className="mt-3 inline-block text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700">
                      Submit proof →
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
