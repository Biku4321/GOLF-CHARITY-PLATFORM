'use client'
import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminDrawDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id }    = use(params)
  const router    = useRouter()
  const [draw,    setDraw]    = useState<any>(null)
  const [results, setResults] = useState<any[]>([])
  const [entries, setEntries] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [simResult, setSimResult] = useState<any>(null)
  const [simming,   setSimming]   = useState(false)
  const [publishing, setPublishing] = useState(false)

  useEffect(() => {
    fetch(`/api/draws/${id}`)
      .then(r => r.json())
      .then(d => {
        setDraw(d.draw)
        setResults(d.results ?? [])
        setLoading(false)
      })
  }, [id])

  const simulate = async () => {
    setSimming(true)
    setSimResult(null)
    const res  = await fetch('/api/draws/simulate', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ draw_id: id }),
    })
    const data = await res.json()
    setSimResult(data)
    setSimming(false)
  }

  const publish = async () => {
    if (!confirm('Publish this draw? Winners will be notified and claims created. This cannot be undone.')) return
    setPublishing(true)
    const res  = await fetch('/api/draws/publish', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ draw_id: id }),
    })
    const data = await res.json()
    if (data.success) {
      router.push('/admin/draws')
    } else {
      alert(data.error ?? 'Publish failed')
      setPublishing(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 max-w-3xl">
        <div className="space-y-4">
          {[1,2,3].map(i => (
            <div key={i} className="h-24 bg-white rounded-xl border border-gray-200 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (!draw) {
    return (
      <div className="p-8">
        <p className="text-gray-400">Draw not found.</p>
        <a href="/admin/draws" className="text-sm text-emerald-600 hover:underline mt-2 block">
          ← Back to draws
        </a>
      </div>
    )
  }

  const isPublished = draw.status === 'published'

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center gap-4 mb-6">
        <a href="/admin/draws" className="text-sm text-gray-400 hover:text-gray-600">← Back</a>
        <h1 className="text-2xl font-semibold">{draw.title}</h1>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
          isPublished
            ? 'bg-emerald-100 text-emerald-700'
            : draw.status === 'live'
            ? 'bg-blue-100 text-blue-700'
            : 'bg-gray-100 text-gray-600'
        }`}>
          {draw.status}
        </span>
      </div>

      {/* Draw info */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-5">
        <h2 className="text-sm font-semibold mb-4">Draw details</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Month',      value: draw.month_year },
            { label: 'Logic',      value: draw.logic_type },
            { label: 'Prize pool', value: `£${(draw.prize_pool_total / 100).toFixed(2)}` },
            { label: 'Jackpot carry', value: `£${(draw.jackpot_carry_forward / 100).toFixed(2)}` },
          ].map(({ label, value }) => (
            <div key={label} className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-1">{label}</p>
              <p className="text-sm font-semibold capitalize">{value}</p>
            </div>
          ))}
        </div>
        {draw.draw_date && (
          <p className="text-xs text-gray-400 mt-3">
            Draw date: {new Date(draw.draw_date).toLocaleString('en-GB')}
          </p>
        )}
        {draw.published_at && (
          <p className="text-xs text-gray-400 mt-1">
            Published: {new Date(draw.published_at).toLocaleString('en-GB')}
          </p>
        )}
      </div>

      {/* Prize pool breakdown */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-5">
        <h2 className="text-sm font-semibold mb-4">Prize pool breakdown</h2>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: '5-match jackpot', pct: 0.40, extra: draw.jackpot_carry_forward },
            { label: '4-match',          pct: 0.35, extra: 0 },
            { label: '3-match',          pct: 0.25, extra: 0 },
          ].map(({ label, pct, extra }) => {
            const base  = Math.floor(draw.prize_pool_total * pct)
            const total = base + extra
            return (
              <div key={label} className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-400 mb-1">{label}</p>
                <p className="text-lg font-semibold">£{(total / 100).toFixed(2)}</p>
                {extra > 0 && (
                  <p className="text-xs text-emerald-600">
                    +£{(extra / 100).toFixed(2)} carry
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Simulation result */}
      {simResult && (
        <div className="bg-white rounded-xl border border-emerald-200 p-5 mb-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold">Simulation result</h2>
            <button onClick={() => setSimResult(null)}
              className="text-xs text-gray-400 hover:text-gray-600">Dismiss</button>
          </div>

          <p className="text-xs text-gray-400 mb-2">Drawn numbers</p>
          <div className="flex gap-2 mb-4">
            {simResult.drawn_numbers?.map((n: number) => (
              <div key={n}
                className="w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                {n}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-3 mb-3">
            {['five_match', 'four_match', 'three_match'].map(t => (
              <div key={t} className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-400 mb-1 capitalize">{t.replace('_', ' ')}</p>
                <p className="text-lg font-semibold">
                  {simResult.winners?.[t]?.length ?? 0}
                </p>
                <p className="text-xs text-gray-400">winners</p>
              </div>
            ))}
          </div>

          <p className="text-xs text-gray-500">
            Total entries: {simResult.total_entries}
          </p>

          {simResult.jackpot_rolls_over && (
            <div className="mt-3 bg-amber-50 border border-amber-100 rounded-lg p-3">
              <p className="text-xs text-amber-700 font-medium">
                No 5-match winner — jackpot will roll over to next month.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Published results */}
      {isPublished && results.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-5">
          <h2 className="text-sm font-semibold mb-4">Official results</h2>
          {results[0]?.winning_numbers && (
            <div className="mb-4">
              <p className="text-xs text-gray-400 mb-2">Winning numbers</p>
              <div className="flex gap-2">
                {results[0].winning_numbers.map((n: number) => (
                  <div key={n}
                    className="w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {n}
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="space-y-2">
            {results.map(r => (
              <div key={r.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <p className="text-sm font-medium capitalize">
                    {r.match_type.replace('_', ' ')}
                  </p>
                  <p className="text-xs text-gray-400">
                    {r.winner_count} winner{r.winner_count !== 1 ? 's' : ''}
                    {r.jackpot_rolled_over && ' · Jackpot rolled over'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">
                    £{(r.prize_per_winner / 100).toFixed(2)} each
                  </p>
                  <p className="text-xs text-gray-400">
                    £{(r.prize_amount / 100).toFixed(2)} total
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      {!isPublished && (
        <div className="flex gap-3">
          <button
            onClick={simulate}
            disabled={simming}
            className="border border-gray-200 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50">
            {simming ? 'Running simulation...' : 'Run simulation'}
          </button>
          <button
            onClick={publish}
            disabled={publishing}
            className="bg-emerald-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50">
            {publishing ? 'Publishing...' : 'Publish results'}
          </button>
        </div>
      )}
    </div>
  )
}
