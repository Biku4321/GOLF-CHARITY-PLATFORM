'use client'
import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id }    = use(params)
  const router    = useRouter()
  const supabase  = createClient()

  const [user,    setUser]    = useState<any>(null)
  const [scores,  setScores]  = useState<any[]>([])
  const [sub,     setSub]     = useState<any>(null)
  const [claims,  setClaims]  = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)
  const [error,   setError]   = useState<string | null>(null)
  const [saved,   setSaved]   = useState(false)

  const [fullName, setFullName] = useState('')
  const [role,     setRole]     = useState('subscriber')
  const [charityPct, setCharityPct] = useState(10)

  useEffect(() => {
    const load = async () => {
      const [userRes, scoresRes] = await Promise.all([
        supabase.from('profiles')
          .select(`*, subscriptions(*), charities(name), winner_claims(id, status, payout_amount)`)
          .eq('id', id).single(),
        supabase.from('scores')
          .select('*').eq('user_id', id)
          .order('score_date', { ascending: false }),
      ])

      if (userRes.data) {
        setUser(userRes.data)
        setFullName(userRes.data.full_name ?? '')
        setRole(userRes.data.role ?? 'subscriber')
        setCharityPct(userRes.data.charity_percentage ?? 10)
        setSub((userRes.data.subscriptions as any[])?.[0] ?? null)
        setClaims((userRes.data.winner_claims as any[]) ?? [])
      }
      setScores(scoresRes.data ?? [])
      setLoading(false)
    }
    load()
  }, [id])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName, role, charity_percentage: charityPct })
      .eq('id', id)

    if (error) { setError(error.message) }
    else { setSaved(true); setTimeout(() => setSaved(false), 3000) }
    setSaving(false)
  }

  const handleDeleteScore = async (scoreId: string) => {
    if (!confirm('Delete this score?')) return
    await supabase.from('scores').delete().eq('id', scoreId)
    setScores(prev => prev.filter(s => s.id !== scoreId))
  }

  if (loading) {
    return (
      <div className="p-8 max-w-3xl">
        <div className="space-y-4">
          {[1,2,3].map(i => (
            <div key={i} className="h-32 bg-white rounded-xl border border-gray-200 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="p-8">
        <p className="text-gray-400">User not found.</p>
        <a href="/admin/users" className="text-sm text-emerald-600 hover:underline mt-2 block">
          ← Back to users
        </a>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-3xl space-y-5">
      <div className="flex items-center gap-4">
        <a href="/admin/users" className="text-sm text-gray-400 hover:text-gray-600">← Back</a>
        <h1 className="text-2xl font-semibold">Edit user</h1>
      </div>

      {/* Profile form */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold mb-4">Profile</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Full name</label>
              <input type="text" value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input type="email" disabled value={user.email ?? ''}
                className="w-full border border-gray-100 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Role</label>
              <select value={role} onChange={e => setRole(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                <option value="subscriber">Subscriber</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Charity % ({charityPct}%)
              </label>
              <input type="range" min={10} max={100} step={1}
                value={charityPct}
                onChange={e => setCharityPct(Number(e.target.value))}
                className="w-full accent-emerald-600 mt-2"
              />
            </div>
          </div>

          {user.charities?.name && (
            <p className="text-xs text-gray-500">
              Charity: <strong>{user.charities.name}</strong>
            </p>
          )}

          {error && (
            <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="flex items-center gap-3">
            <button type="submit" disabled={saving}
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50">
              {saving ? 'Saving...' : 'Save changes'}
            </button>
            {saved && <p className="text-sm text-emerald-600">✓ Saved</p>}
          </div>
        </form>
      </div>

      {/* Subscription */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold mb-4">Subscription</h2>
        {sub ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Status',   value: sub.status,    color: sub.status === 'active' ? 'text-emerald-600' : 'text-red-500' },
              { label: 'Plan',     value: sub.plan_type, color: 'text-gray-900' },
              { label: 'Renews',   value: sub.current_period_end
                  ? new Date(sub.current_period_end).toLocaleDateString('en-GB')
                  : '—',            color: 'text-gray-900' },
              { label: 'Stripe ID', value: sub.stripe_subscription_id?.slice(0,14) + '...', color: 'text-gray-400' },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-1">{label}</p>
                <p className={`text-sm font-medium capitalize ${color}`}>{value ?? '—'}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">No subscription found.</p>
        )}
      </div>

      {/* Scores */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold mb-4">
          Scores ({scores.length}/5)
        </h2>
        {scores.length === 0 ? (
          <p className="text-sm text-gray-400">No scores logged.</p>
        ) : (
          <div className="space-y-2">
            {scores.map((score, i) => (
              <div key={score.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm ${
                    i === 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {score.stableford_score}
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {score.stableford_score} pts
                      {i === 0 && (
                        <span className="ml-2 text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                          Latest
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(score.score_date).toLocaleDateString('en-GB', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                <button onClick={() => handleDeleteScore(score.id)}
                  className="text-xs text-red-400 hover:text-red-600 border border-red-100 px-2.5 py-1 rounded-lg hover:bg-red-50">
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Winner claims */}
      {claims.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold mb-4">Winner claims</h2>
          <div className="space-y-2">
            {claims.map(claim => (
              <div key={claim.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <p className="text-sm">Claim #{claim.id.slice(0, 8)}</p>
                <div className="flex items-center gap-3">
                  <p className="text-sm font-semibold">
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
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
