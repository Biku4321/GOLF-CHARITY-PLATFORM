'use client'
import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminWinnerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id }    = use(params)
  const router    = useRouter()
  const [claim,   setClaim]   = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [note,    setNote]    = useState('')
  const [saving,  setSaving]  = useState(false)

  useEffect(() => {
    fetch(`/api/winners?status=all`)
      .then(r => r.json())
      .then(d => {
        const found = (d.claims ?? []).find((c: any) => c.id === id)
        setClaim(found ?? null)
        setNote(found?.admin_notes ?? '')
        setLoading(false)
      })
  }, [id])

  const verify = async (action: 'approved' | 'rejected') => {
    setSaving(true)
    const res = await fetch('/api/winners/verify', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ claim_id: id, action, admin_notes: note }),
    })
    const data = await res.json()
    if (res.ok) {
      setClaim((prev: any) => ({ ...prev, ...data.claim }))
    }
    setSaving(false)
  }

  const markPaid = async () => {
    setSaving(true)
    const res = await fetch('/api/winners/payout', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ claim_id: id }),
    })
    const data = await res.json()
    if (res.ok) {
      setClaim((prev: any) => ({ ...prev, ...data.claim }))
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="p-8 max-w-2xl">
        <div className="h-64 bg-white rounded-xl border border-gray-200 animate-pulse" />
      </div>
    )
  }

  if (!claim) {
    return (
      <div className="p-8">
        <p className="text-gray-400">Claim not found.</p>
        <a href="/admin/winners" className="text-sm text-emerald-600 hover:underline mt-2 block">
          ← Back to winners
        </a>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-2xl space-y-5">
      <div className="flex items-center gap-4">
        <a href="/admin/winners" className="text-sm text-gray-400 hover:text-gray-600">← Back</a>
        <h1 className="text-2xl font-semibold">Winner claim</h1>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
          claim.status === 'paid'     ? 'bg-emerald-100 text-emerald-700'
          : claim.status === 'approved'? 'bg-blue-100 text-blue-700'
          : claim.status === 'rejected'? 'bg-red-100 text-red-600'
          : 'bg-amber-100 text-amber-700'
        }`}>
          {claim.status}
        </span>
      </div>

      {/* Claim details */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold mb-4">Claim details</h2>
        <div className="grid grid-cols-2 gap-3 mb-4">
          {[
            { label: 'Claim ID',     value: claim.id.slice(0, 16) + '...' },
            { label: 'Payout',       value: `£${(claim.payout_amount / 100).toFixed(2)}` },
            { label: 'Match type',   value: claim.draw_results?.match_type?.replace('_', ' ') ?? '—' },
            { label: 'Submitted',    value: new Date(claim.submitted_at).toLocaleDateString('en-GB', {
                day: 'numeric', month: 'long', year: 'numeric'
              })
            },
          ].map(({ label, value }) => (
            <div key={label} className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-1">{label}</p>
              <p className="text-sm font-medium capitalize">{value}</p>
            </div>
          ))}
        </div>

        {claim.draw_results?.winning_numbers && (
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Winning numbers</p>
            <div className="flex gap-2">
              {claim.draw_results.winning_numbers.map((n: number) => (
                <div key={n}
                  className="w-9 h-9 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  {n}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Proof */}
        {claim.proof_url ? (
          <div>
            <p className="text-xs text-gray-400 mb-2">Submitted proof</p>
            <a href={claim.proof_url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-emerald-600 border border-emerald-200 px-3 py-2 rounded-lg hover:bg-emerald-50">
              View proof screenshot →
            </a>
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
            <p className="text-xs text-amber-700">No proof submitted yet.</p>
          </div>
        )}
      </div>

      {/* Admin note + actions */}
      {claim.status !== 'paid' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold mb-4">Review</h2>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Admin note (optional)</label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              rows={3}
              placeholder="Add a note for the winner or internal reference..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            />
          </div>

          <div className="flex gap-3">
            {claim.status === 'pending' && (
              <>
                <button
                  onClick={() => verify('approved')}
                  disabled={saving}
                  className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50">
                  {saving ? '...' : 'Approve claim'}
                </button>
                <button
                  onClick={() => verify('rejected')}
                  disabled={saving}
                  className="border border-red-200 text-red-500 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-50 disabled:opacity-50">
                  {saving ? '...' : 'Reject claim'}
                </button>
              </>
            )}
            {claim.status === 'approved' && (
              <button
                onClick={markPaid}
                disabled={saving}
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50">
                {saving ? '...' : 'Mark as paid'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Paid confirmation */}
      {claim.status === 'paid' && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-center">
          <p className="text-emerald-700 font-semibold mb-1">Payment completed</p>
          <p className="text-sm text-emerald-600">
            £{(claim.payout_amount / 100).toFixed(2)} paid on{' '}
            {claim.paid_at
              ? new Date(claim.paid_at).toLocaleDateString('en-GB', {
                  day: 'numeric', month: 'long', year: 'numeric'
                })
              : '—'
            }
          </p>
        </div>
      )}

      {/* Timeline */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold mb-4">Timeline</h2>
        <div className="space-y-3">
          {[
            { label: 'Submitted',  date: claim.submitted_at,  show: true },
            { label: 'Reviewed',   date: claim.reviewed_at,   show: !!claim.reviewed_at },
            { label: 'Paid',       date: claim.paid_at,        show: !!claim.paid_at },
          ].map(({ label, date, show }) => show ? (
            <div key={label} className="flex items-center gap-3">
              <div className="w-2 h-2 bg-emerald-500 rounded-full" />
              <span className="text-sm font-medium w-20">{label}</span>
              <span className="text-sm text-gray-400">
                {new Date(date).toLocaleString('en-GB')}
              </span>
            </div>
          ) : null)}
        </div>
      </div>
    </div>
  )
}
