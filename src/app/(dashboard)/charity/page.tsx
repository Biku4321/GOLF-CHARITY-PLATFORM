'use client'
import { useState, useEffect } from 'react'
import { useCharities, useMyCharity } from '@/hooks/useCharity'

export default function CharityPage() {
  const [search,     setSearch]     = useState('')
  const [selecting,  setSelecting]  = useState(false)
  const [saved,      setSaved]      = useState(false)

  const { charities, loading }           = useCharities(search)
  const { charity, percentage,
          loading: myLoading, saving,
          updateCharity, setPercentage } = useMyCharity()

  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (saved) {
      timer = setTimeout(() => setSaved(false), 3000);
    }
    return () => clearTimeout(timer);
  }, [saved]);

  const handleSave = async () => {
    if (!selectedId) return
    await updateCharity(selectedId, percentage)
    setSaved(true)
    setSelecting(false)
    }
    
  if (myLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-2xl mx-auto space-y-4">
          {[1,2].map(i => (
            <div key={i} className="h-24 bg-white rounded-2xl border border-gray-200 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">

        <div className="mb-6">
          <h1 className="text-2xl font-semibold">My charity</h1>
          <p className="text-sm text-gray-500 mt-1">
            Part of every subscription goes to your chosen charity.
          </p>
        </div>

        {/* Current charity */}
        {charity && !selecting ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-5">
            <p className="text-xs text-gray-400 mb-3 font-medium uppercase tracking-wide">
              Currently supporting
            </p>
            <div className="flex items-center gap-4 mb-4">
              {charity.image_url ? (
                <img src={charity.image_url} alt={charity.name}
                  className="w-14 h-14 rounded-xl object-cover" />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <span className="text-emerald-700 font-bold text-xl">
                    {charity.name[0]}
                  </span>
                </div>
              )}
              <div>
                <p className="font-semibold">{charity.name}</p>
                <p className="text-sm text-gray-500 line-clamp-1">
                  {charity.description}
                </p>
              </div>
            </div>

            {/* Contribution slider */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">Contribution</p>
                <p className="text-sm font-semibold text-emerald-600">
                  {percentage}%
                </p>
              </div>
              <input
                type="range" min={10} max={100} step={1}
                value={percentage}
                onChange={e => setPercentage(Number(e.target.value))}
                className="w-full accent-emerald-600"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Min 10%</span>
                <span>Max 100%</span>
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => updateCharity(charity.id, percentage)}
                disabled={saving}
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save changes'}
              </button>
              <button
                onClick={() => { setSelecting(true); setSelectedId(charity.id) }}
                className="border border-gray-200 px-4 py-2 rounded-lg text-sm hover:bg-gray-50"
              >
                Change charity
              </button>
            </div>

            {saved && (
              <p className="text-xs text-emerald-600 mt-2">
                ✓ Saved successfully
              </p>
            )}
          </div>
        ) : (
          <>
            {/* Charity picker */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-5">
              <p className="text-sm font-semibold mb-3">
                {charity ? 'Change charity' : 'Choose a charity'}
              </p>
              <input
                type="search"
                placeholder="Search charities..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />

              {loading ? (
                <div className="space-y-2">
                  {[1,2,3].map(i => (
                    <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {charities.map(c => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedId(c.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                        selectedId === c.id
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {c.image_url ? (
                        <img src={c.image_url} alt={c.name}
                          className="w-10 h-10 rounded-lg object-cover shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                          <span className="text-emerald-700 font-bold">
                            {c.name[0]}
                          </span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{c.name}</p>
                        <p className="text-xs text-gray-500 truncate">
                          {c.description}
                        </p>
                      </div>
                      {selectedId === c.id && (
                        <span className="text-emerald-600 text-lg shrink-0">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Contribution % */}
            {selectedId && (
              <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-5">
                <p className="text-sm font-medium mb-3">
                  Set contribution percentage
                </p>
                <div className="flex items-center gap-4 mb-2">
                  <input
                    type="range" min={10} max={100} step={1}
                    value={percentage}
                    onChange={e => setPercentage(Number(e.target.value))}
                    className="flex-1 accent-emerald-600"
                  />
                  <span className="text-sm font-semibold w-10 text-right">
                    {percentage}%
                  </span>
                </div>
                <p className="text-xs text-gray-400">
                  Minimum 10% required
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={!selectedId || saving}
                className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-emerald-700 disabled:opacity-40"
              >
                {saving ? 'Saving...' : 'Confirm selection'}
              </button>
              {charity && (
                <button
                  onClick={() => setSelecting(false)}
                  className="border border-gray-200 px-5 py-2.5 rounded-xl text-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
              )}
            </div>
          </>
        )}

        {/* Independent donation */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 mt-5">
          <h2 className="text-sm font-semibold mb-1">
            Make an independent donation
          </h2>
          <p className="text-xs text-gray-500 mb-3">
            Donate directly to any charity, not tied to gameplay.
          </p>
          <IndependentDonationForm charities={charities} />
        </div>

      </div>
    </div>
  )
}

function IndependentDonationForm({ charities }: { charities: any[] }) {
  const [charityId, setCharityId] = useState('')
  const [amount,    setAmount]    = useState('')
  const [loading,   setLoading]   = useState(false)
  const [done,      setDone]      = useState(false)
  const [error,     setError]     = useState<string | null>(null)

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const res = await fetch('/api/donations', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        charity_id:   charityId,
        amount_pence: Math.round(Number(amount) * 100),
      }),
    })
    const data = await res.json()

    if (!res.ok) { setError(data.error); setLoading(false); return }
    setDone(true)
    setLoading(false)
  }

  if (done) {
    return (
      <p className="text-sm text-emerald-600 font-medium">
        ✓ Donation recorded. Thank you!
      </p>
    )
  }

  return (
    <form onSubmit={handleDonate} className="flex gap-3 flex-wrap">
      <select
        required value={charityId}
        onChange={e => setCharityId(e.target.value)}
        className="flex-1 min-w-[160px] border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
      >
        <option value="">Select charity</option>
        {charities.map(c => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>
      <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
        <span className="px-3 text-sm text-gray-400 bg-gray-50 border-r border-gray-200 py-2">
          £
        </span>
        <input
          type="number" min="1" step="0.01" required
          value={amount}
          onChange={e => setAmount(e.target.value)}
          placeholder="10.00"
          className="w-24 px-3 py-2 text-sm focus:outline-none"
        />
      </div>
      <button
        type="submit" disabled={loading}
        className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50"
      >
        {loading ? '...' : 'Donate'}
      </button>
      {error && <p className="w-full text-xs text-red-500">{error}</p>}
    </form>
  )
}