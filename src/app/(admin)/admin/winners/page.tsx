'use client'
import { useState, useEffect } from 'react'

export default function AdminWinnersPage() {
  const [claims,  setClaims]  = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter,  setFilter]  = useState<'pending'|'approved'|'paid'|'rejected'>('pending')

  const fetchClaims = async () => {
    setLoading(true)
    const res  = await fetch(`/api/winners?status=${filter}`)
    const data = await res.json()
    setClaims(data.claims ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchClaims() }, [filter])

  const verify = async (claimId: string, action: 'approved' | 'rejected') => {
    await fetch('/api/winners/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ claim_id: claimId, action }),
    })
    fetchClaims()
  }

  const markPaid = async (claimId: string) => {
    await fetch('/api/winners/payout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ claim_id: claimId }),
    })
    fetchClaims()
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-6">Winner verification</h1>

      <div className="flex gap-2 mb-6">
        {(['pending','approved','paid','rejected'] as const).map(s => (
          <button key={s}
            onClick={() => setFilter(s)}
            className={`text-sm px-4 py-1.5 rounded-full border transition-colors ${
              filter === s
                ? 'bg-gray-900 text-white border-gray-900'
                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}>
            {s}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-gray-400">Loading...</div>
        ) : claims.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-400">
            No {filter} claims.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {claims.map(claim => (
              <div key={claim.id} className="px-5 py-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium">
                      Claim #{claim.id.slice(0, 8)}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Payout: £{(claim.payout_amount / 100).toFixed(2)}
                    </p>
                    {claim.proof_url && (
                      <a href={claim.proof_url} target="_blank"
                        className="text-xs text-emerald-600 hover:underline mt-1 block">
                        View proof →
                      </a>
                    )}
                    {claim.admin_notes && (
                      <p className="text-xs text-gray-500 mt-1">
                        Note: {claim.admin_notes}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 items-center">
                    {claim.status === 'pending' && (
                      <>
                        <button onClick={() => verify(claim.id, 'approved')}
                          className="text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700">
                          Approve
                        </button>
                        <button onClick={() => verify(claim.id, 'rejected')}
                          className="text-xs border border-red-200 text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-50">
                          Reject
                        </button>
                      </>
                    )}
                    {claim.status === 'approved' && (
                      <button onClick={() => markPaid(claim.id)}
                        className="text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-lg">
                        Mark paid
                      </button>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      claim.status === 'paid'     ? 'bg-emerald-100 text-emerald-700'
                      : claim.status === 'approved'? 'bg-blue-100 text-blue-700'
                      : claim.status === 'rejected'? 'bg-red-100 text-red-700'
                      : 'bg-amber-100 text-amber-700'
                    }`}>
                      {claim.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}