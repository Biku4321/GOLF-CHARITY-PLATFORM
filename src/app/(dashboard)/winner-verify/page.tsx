'use client'
import { useState } from 'react'

export default function WinnerVerifyPage() {
  const [proofUrl,   setProofUrl]   = useState('')
  const [claimId,    setClaimId]    = useState('')
  const [submitted,  setSubmitted]  = useState(false)
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/winners/claim', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          claim_id:  claimId.trim() || undefined,
          proof_url: proofUrl.trim(),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Please try again.')
        return
      }

      setSubmitted(true)
    } catch {
      setError('Network error — please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center max-w-md">
          <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-emerald-600 text-2xl">✓</span>
          </div>
          <h2 className="text-xl font-semibold mb-2">Proof submitted</h2>
          <p className="text-sm text-gray-500">
            Our team will review your submission within 48 hours.
            You&apos;ll receive an email when it&apos;s approved.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-lg mx-auto">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <p className="text-sm font-medium text-amber-800">
            Winner verification required
          </p>
          <p className="text-xs text-amber-700 mt-1">
            Please upload a screenshot of your scores from the golf platform to claim your prize.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h1 className="text-xl font-semibold mb-5">Submit proof</h1>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Claim ID <span className="text-gray-400 font-normal">(from your winner email)</span>
              </label>
              <input
                type="text"
                value={claimId}
                onChange={e => setClaimId(e.target.value)}
                placeholder="e.g. 3f7a2b1c-..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Screenshot URL <span className="text-red-500">*</span>
              </label>
              <input
                type="url" required
                value={proofUrl}
                onChange={e => setProofUrl(e.target.value)}
                placeholder="https://i.imgur.com/..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <p className="text-xs text-gray-400 mt-1">
                Upload your screenshot to Imgur or any image host and paste the direct link here.
              </p>
            </div>

            <button
              type="submit" disabled={loading || !proofUrl.trim()}
              className="w-full bg-emerald-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Submitting…' : 'Submit proof'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}