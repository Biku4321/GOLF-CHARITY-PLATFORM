'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export function DrawParticipationWidget({ userId }: { userId: string }) {
  const [draws,   setDraws]   = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/draws')
      .then(r => r.json())
      .then(d => { setDraws(d.draws ?? []); setLoading(false) })
  }, [])

  const upcoming  = draws.filter(d => d.status === 'upcoming')
  const published = draws.filter(d => d.status === 'published')

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
          Draws
        </p>
        <Link href="/draws"
          className="text-xs text-emerald-600 hover:underline">
          View all →
        </Link>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1,2].map(i => (
            <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : draws.length === 0 ? (
        <p className="text-sm text-gray-500">No draws available yet.</p>
      ) : (
        <div className="space-y-2">
          {upcoming.slice(0, 1).map(draw => (
            <div key={draw.id}
              className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-100">
              <div>
                <p className="text-sm font-medium">{draw.title}</p>
                <p className="text-xs text-emerald-600">
                  {draw.month_year} · Upcoming
                </p>
              </div>
              <span className="text-xs bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                Entering
              </span>
            </div>
          ))}
          {published.slice(0, 2).map(draw => (
            <div key={draw.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div>
                <p className="text-sm font-medium text-gray-700">{draw.title}</p>
                <p className="text-xs text-gray-400">{draw.month_year} · Results published</p>
              </div>
              <Link href="/draws"
                className="text-xs text-emerald-600 hover:underline">
                View →
              </Link>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-3">
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <p className="text-xl font-semibold">{draws.length}</p>
          <p className="text-xs text-gray-400">Total draws</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <p className="text-xl font-semibold text-emerald-600">
            {upcoming.length}
          </p>
          <p className="text-xs text-gray-400">Upcoming</p>
        </div>
      </div>
    </div>
  )
}