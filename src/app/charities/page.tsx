'use client'
import { useState } from 'react'
import { useCharities } from '@/hooks/useCharity'
import Link from 'next/link'

export default function CharitiesPage() {
  const [search, setSearch] = useState('')
  const { charities, loading } = useCharities(search)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-semibold mb-2">
            Charities we support
          </h1>
          <p className="text-gray-500 mb-6">
            Every subscription contributes to a cause you choose.
          </p>
          <input
            type="search"
            placeholder="Search charities..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full max-w-sm border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">
        {loading ? (
          <div className="grid md:grid-cols-2 gap-4">
            {[1,2,3,4].map(i => (
              <div key={i}
                className="h-48 bg-white rounded-2xl border border-gray-200 animate-pulse" />
            ))}
          </div>
        ) : charities.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            No charities found.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {charities.map(c => (
              <Link href={`/charities/${c.id}`} key={c.id}
                className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-emerald-300 hover:shadow-sm transition-all group">

                <div className="flex items-start gap-4">
                  {c.image_url ? (
                    <img
                      src={c.image_url} alt={c.name}
                      className="w-14 h-14 rounded-xl object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                      <span className="text-emerald-700 font-bold text-lg">
                        {c.name[0]}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors">
                        {c.name}
                      </h3>
                      {c.is_featured && (
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium shrink-0">
                          Featured
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {c.description}
                    </p>
                    {c.charity_events?.length > 0 && (
                      <p className="text-xs text-emerald-600 mt-2">
                        {c.charity_events.length} upcoming event{c.charity_events.length !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}