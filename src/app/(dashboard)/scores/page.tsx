'use client'
import { useState } from 'react'
import { useScores } from '@/hooks/useScores'

export default function ScoresPage() {
  const { scores, loading, error, addScore, updateScore, deleteScore } = useScores()

  const [newScore, setNewScore] = useState('')
  const [newDate,  setNewDate]  = useState(new Date().toISOString().split('T')[0])
  const [editId,   setEditId]   = useState<string | null>(null)
  const [editScore,setEditScore]= useState('')
  const [editDate, setEditDate] = useState('')
  const [saving,   setSaving]   = useState(false)

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newScore) return
    setSaving(true)
    await addScore(Number(newScore), newDate)
    setNewScore('')
    setSaving(false)
  }

  const handleUpdate = async (id: string) => {
    setSaving(true)
    await updateScore(id, Number(editScore), editDate)
    setEditId(null)
    setSaving(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">

        <div className="mb-6">
          <h1 className="text-2xl font-semibold">My Scores</h1>
          <p className="text-sm text-gray-500 mt-1">
            Last 5 Stableford scores · newest score replaces oldest
          </p>
        </div>

        {/* Add Score Form */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <h2 className="text-sm font-semibold mb-4">Add new score</h2>
          <form onSubmit={handleAdd} className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">
                Stableford score (1–45)
              </label>
              <input
                type="number" min={1} max={45} required
                value={newScore}
                onChange={e => setNewScore(e.target.value)}
                placeholder="e.g. 32"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">Date played</label>
              <input
                type="date" required
                value={newDate}
                max={new Date().toISOString().split('T')[0]}
                onChange={e => setNewDate(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit" disabled={saving}
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50"
              >
                {saving ? '...' : 'Add'}
              </button>
            </div>
          </form>
          {error && (
            <p className="text-xs text-red-500 mt-2">{error}</p>
          )}
        </div>

        {/* Scores List */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Score history</h2>
            <span className="text-xs text-gray-400">{scores.length} / 5 slots used</span>
          </div>

          {loading ? (
            <div className="p-5 space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : scores.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-400 text-sm">No scores yet. Add your first round above.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {scores.map((score, i) => (
                <div key={score.id} className="px-5 py-4">
                  {editId === score.id ? (
                    <div className="flex gap-3 items-end">
                      <div className="flex-1">
                        <input
                          type="number" min={1} max={45}
                          value={editScore}
                          onChange={e => setEditScore(e.target.value)}
                          className="w-full border border-emerald-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      <div className="flex-1">
                        <input
                          type="date"
                          value={editDate}
                          onChange={e => setEditDate(e.target.value)}
                          className="w-full border border-emerald-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdate(score.id)}
                          disabled={saving}
                          className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditId(null)}
                          className="border border-gray-200 px-3 py-1.5 rounded-lg text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-semibold text-sm ${
                          i === 0
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {score.stableford_score}
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {score.stableford_score} points
                            {i === 0 && (
                              <span className="ml-2 text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                                Latest
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(score.score_date).toLocaleDateString('en-GB', {
                              day: 'numeric', month: 'long', year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditId(score.id)
                            setEditScore(String(score.stableford_score))
                            setEditDate(score.score_date)
                          }}
                          className="text-xs text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteScore(score.id)}
                          className="text-xs text-red-500 border border-red-100 px-3 py-1.5 rounded-lg hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Progress bar */}
          <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
            <div className="flex gap-1.5">
              {[0,1,2,3,4].map(i => (
                <div key={i} className={`h-1.5 flex-1 rounded-full ${
                  i < scores.length ? 'bg-emerald-500' : 'bg-gray-200'
                }`} />
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-1.5">
              {5 - scores.length} slot{5 - scores.length !== 1 ? 's' : ''} remaining
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}