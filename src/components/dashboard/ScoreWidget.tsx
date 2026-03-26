'use client'
import { useScores } from '@/hooks/useScores'
import Link from 'next/link'

export function ScoreWidget({ userId }: { userId: string }) {
  const { scores, loading } = useScores()

  const avg = scores.length > 0
    ? Math.round(scores.reduce((s, sc) => s + sc.stableford_score, 0) / scores.length)
    : null

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
          My scores
        </p>
        <Link href="/scores"
          className="text-xs text-emerald-600 hover:underline">
          Manage →
        </Link>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1,2,3].map(i => (
            <div key={i} className="h-8 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : scores.length === 0 ? (
        <div>
          <p className="text-sm text-gray-500 mb-3">No scores logged yet.</p>
          <Link href="/scores"
            className="text-sm text-emerald-600 hover:underline">
            Add your first score →
          </Link>
        </div>
      ) : (
        <>
          {/* Mini bar chart */}
          <div className="flex items-end gap-1.5 h-16 mb-3">
            {scores.map((score, i) => (
              <div key={score.id}
                className="flex-1 flex flex-col items-center gap-1">
                <div
                  className={`w-full rounded-sm transition-all ${
                    i === 0 ? 'bg-emerald-500' : 'bg-gray-200'
                  }`}
                  style={{ height: `${(score.stableford_score / 45) * 100}%` }}
                />
              </div>
            ))}
            {/* Empty slots */}
            {Array.from({ length: Math.max(0, 5 - scores.length) }).map((_, i) => (
              <div key={`empty-${i}`}
                className="flex-1 h-2 bg-gray-100 rounded-sm" />
            ))}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex gap-3">
              {scores.slice(0, 5).map((score, i) => (
                <div key={score.id} className="text-center">
                  <p className={`text-sm font-semibold ${
                    i === 0 ? 'text-emerald-600' : 'text-gray-700'
                  }`}>
                    {score.stableford_score}
                  </p>
                </div>
              ))}
            </div>
            {avg !== null && (
              <div className="text-right">
                <p className="text-xs text-gray-400">Avg</p>
                <p className="text-sm font-semibold text-gray-700">{avg}</p>
              </div>
            )}
          </div>

          {/* 5-slot progress */}
          <div className="flex gap-1 mt-3">
            {[0,1,2,3,4].map(i => (
              <div key={i} className={`h-1 flex-1 rounded-full ${
                i < scores.length ? 'bg-emerald-500' : 'bg-gray-200'
              }`} />
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {scores.length}/5 scores logged
          </p>
        </>
      )}
    </div>
  )
}