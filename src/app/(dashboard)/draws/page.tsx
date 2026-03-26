'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Draw {
  id:                  string
  title:               string
  month_year:          string
  status:              string
  logic_type:          string
  prize_pool_total:    number
  jackpot_carry_forward: number
  draw_date:           string | null
  published_at:        string | null
}

interface DrawResult {
  id:               string
  match_type:       string
  winning_numbers:  number[]
  prize_amount:     number
  winner_count:     number
  prize_per_winner: number
  jackpot_rolled_over: boolean
}

export default function DrawsPage() {
  const [draws,    setDraws]    = useState<Draw[]>([])
  const [results,  setResults]  = useState<Record<string, DrawResult[]>>({})
  const [loading,  setLoading]  = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/draws')
      .then(r => r.json())
      .then(d => {
        setDraws(d.draws ?? [])
        setLoading(false)
      })
  }, [])

  const loadResults = async (drawId: string) => {
    if (results[drawId]) { setExpanded(drawId); return }
    const res  = await fetch(`/api/draws/${drawId}`)
    const data = await res.json()
    setResults(prev => ({ ...prev, [drawId]: data.results ?? [] }))
    setExpanded(drawId)
  }

  const upcoming  = draws.filter(d => d.status === 'upcoming' || d.status === 'live')
  const published = draws.filter(d => d.status === 'published')

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-3xl mx-auto space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="h-24 bg-white rounded-2xl border border-gray-200 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">

        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Monthly draws</h1>
          <p className="text-sm text-gray-500 mt-1">
            Your scores automatically enter each monthly draw.
          </p>
        </div>

        {/* How draw works */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6">
          <h2 className="text-sm font-semibold mb-3">How the draw works</h2>
          <div className="grid grid-cols-3 gap-3">
            {[
              { match: '5 numbers', pool: '40%', badge: 'Jackpot', color: 'bg-emerald-100 text-emerald-700' },
              { match: '4 numbers', pool: '35%', badge: 'Major',   color: 'bg-blue-100 text-blue-700'     },
              { match: '3 numbers', pool: '25%', badge: 'Prize',   color: 'bg-amber-100 text-amber-700'   },
            ].map(({ match, pool, badge, color }) => (
              <div key={match} className="bg-gray-50 rounded-xl p-3 text-center">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${color}`}>
                  {badge}
                </span>
                <p className="text-sm font-semibold mt-2">{match}</p>
                <p className="text-xs text-gray-400">{pool} of pool</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-3">
            Jackpot rolls over to next month if unclaimed. Prizes split equally among multiple winners.
          </p>
        </div>

        {/* Upcoming */}
        {upcoming.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
              Upcoming
            </h2>
            <div className="space-y-3">
              {upcoming.map(draw => (
                <div key={draw.id}
                  className="bg-white rounded-2xl border border-emerald-200 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold">{draw.title}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">{draw.month_year}</p>
                    </div>
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-medium">
                      Entering
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                      <p className="text-xs text-gray-400 mb-1">Pool</p>
                      <p className="text-lg font-semibold">
                        £{(draw.prize_pool_total / 100).toFixed(0)}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                      <p className="text-xs text-gray-400 mb-1">Jackpot carry</p>
                      <p className="text-lg font-semibold">
                        £{(draw.jackpot_carry_forward / 100).toFixed(0)}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                      <p className="text-xs text-gray-400 mb-1">Draw type</p>
                      <p className="text-sm font-semibold capitalize">{draw.logic_type}</p>
                    </div>
                  </div>
                  {draw.draw_date && (
                    <p className="text-xs text-gray-400 mt-3">
                      Draw date: {new Date(draw.draw_date).toLocaleDateString('en-GB', {
                        day: 'numeric', month: 'long', year: 'numeric'
                      })}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Published results */}
        {published.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
              Past results
            </h2>
            <div className="space-y-3">
              {published.map(draw => (
                <div key={draw.id}
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                  <button
                    onClick={() => expanded === draw.id
                      ? setExpanded(null)
                      : loadResults(draw.id)
                    }
                    className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
                  >
                    <div className="text-left">
                      <h3 className="font-semibold">{draw.title}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">{draw.month_year}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                        Published
                      </span>
                      <span className="text-gray-400 text-sm">
                        {expanded === draw.id ? '▲' : '▼'}
                      </span>
                    </div>
                  </button>

                  {expanded === draw.id && results[draw.id] && (
                    <div className="border-t border-gray-100 p-5">
                      {/* Winning numbers */}
                      {results[draw.id][0]?.winning_numbers && (
                        <div className="mb-4">
                          <p className="text-xs text-gray-400 mb-2">Winning numbers</p>
                          <div className="flex gap-2">
                            {results[draw.id][0].winning_numbers.map(n => (
                              <div key={n}
                                className="w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                                {n}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Results breakdown */}
                      <div className="space-y-2">
                        {results[draw.id].map(result => (
                          <div key={result.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                            <div>
                              <p className="text-sm font-medium capitalize">
                                {result.match_type.replace('_', ' ')}
                              </p>
                              <p className="text-xs text-gray-400">
                                {result.winner_count} winner{result.winner_count !== 1 ? 's' : ''}
                                {result.jackpot_rolled_over && ' · Jackpot rolled over'}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold">
                                £{(result.prize_per_winner / 100).toFixed(2)} each
                              </p>
                              <p className="text-xs text-gray-400">
                                £{(result.prize_amount / 100).toFixed(2)} total
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {draws.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <p className="text-gray-400 text-sm">No draws available yet.</p>
            <p className="text-xs text-gray-400 mt-1">
              Check back soon — draws run monthly.
            </p>
          </div>
        )}

      </div>
    </div>
  )
}
