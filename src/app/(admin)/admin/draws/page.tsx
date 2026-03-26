'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function AdminDrawsPage() {
  const [draws,    setDraws]    = useState<any[]>([])
  const [loading,  setLoading]  = useState(true)
  const [simResult,setSimResult]= useState<any>(null)
  const [simming,  setSimming]  = useState(false)

  useEffect(() => {
    fetch('/api/draws').then(r => r.json()).then(d => {
      setDraws(d.draws ?? [])
      setLoading(false)
    })
  }, [])

  const simulate = async (drawId: string) => {
    setSimming(true)
    const res  = await fetch('/api/draws/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ draw_id: drawId }),
    })
    const data = await res.json()
    setSimResult(data)
    setSimming(false)
  }

  const publish = async (drawId: string) => {
    if (!confirm('Publish this draw? This cannot be undone.')) return
    const res  = await fetch('/api/draws/publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ draw_id: drawId }),
    })
    const data = await res.json()
    if (data.success) {
      window.location.reload()
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Draw management</h1>
        <Link href="/admin/draws/new"
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700">
          + New draw
        </Link>
      </div>

      {/* Sim Result */}
      {simResult && (
        <div className="bg-white rounded-xl border border-emerald-200 p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm">Simulation result</h3>
            <button onClick={() => setSimResult(null)}
              className="text-xs text-gray-400 hover:text-gray-600">
              Dismiss
            </button>
          </div>
          <div className="flex gap-2 mb-3">
            {simResult.drawn_numbers?.map((n: number) => (
              <span key={n}
                className="w-9 h-9 bg-emerald-100 text-emerald-700 font-semibold text-sm rounded-full flex items-center justify-center">
                {n}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-3 text-sm">
            {['five_match','four_match','three_match'].map(t => (
              <div key={t} className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">{t.replace('_', ' ')}</p>
                <p className="font-semibold">
                  {simResult.winners?.[t]?.length ?? 0} winners
                </p>
                <p className="text-xs text-gray-400">
                  £{((simResult.prize_pools?.[t] ?? 0) / 100).toFixed(2)} pool
                </p>
              </div>
            ))}
          </div>
          {simResult.jackpot_rolls_over && (
            <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2 mt-3">
              No 5-match winner — jackpot rolls over to next month.
            </p>
          )}
        </div>
      )}

      {/* Draws List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-gray-400">Loading...</div>
        ) : draws.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-400">No draws yet.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {draws.map(draw => (
              <div key={draw.id} className="px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{draw.title}</p>
                  <p className="text-xs text-gray-400">
                    {draw.month_year} · {draw.logic_type} ·{' '}
                    Pool: £{(draw.prize_pool_total / 100).toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    draw.status === 'published' ? 'bg-emerald-100 text-emerald-700'
                    : draw.status === 'live'    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600'
                  }`}>
                    {draw.status}
                  </span>
                  {draw.status !== 'published' && (
                    <>
                      <button
                        onClick={() => simulate(draw.id)}
                        disabled={simming}
                        className="text-xs border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 disabled:opacity-50">
                        {simming ? '...' : 'Simulate'}
                      </button>
                      <button
                        onClick={() => publish(draw.id)}
                        className="text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700">
                        Publish
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}