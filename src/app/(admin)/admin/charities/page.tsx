import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import CharityToggleClient from './CharityToggleClient'

export default async function AdminCharitiesPage() {
  const supabase = await createClient()
  const { data: charities } = await supabase
    .from('charities')
    .select('*, charity_events(id)')
    .order('is_featured', { ascending: false })
    .order('name')

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Charities</h1>
        <Link href="/admin/charities/new"
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700">
          + Add charity
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {(charities ?? []).map(c => (
          <div key={c.id}
            className={`bg-white rounded-xl border p-5 ${
              !c.is_active ? 'opacity-50' : 'border-gray-200'
            }`}>
            <div className="flex items-start gap-4">
              {c.image_url ? (
                <img src={c.image_url} alt={c.name}
                  className="w-14 h-14 rounded-xl object-cover shrink-0" />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                  <span className="text-emerald-700 font-bold text-xl">{c.name[0]}</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold truncate">{c.name}</h3>
                  {c.is_featured && (
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full shrink-0">
                      Featured
                    </span>
                  )}
                  {!c.is_active && (
                    <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full shrink-0">
                      Inactive
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                  {c.description}
                </p>
                <p className="text-xs text-gray-400">
                  {(c.charity_events as any[])?.length ?? 0} events ·{' '}
                  {c.slug}
                </p>
              </div>
            </div>

            <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
              <Link href={`/admin/charities/${c.id}`}
                className="text-xs border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50">
                Edit
              </Link>
              <CharityToggleClient
                charityId={c.id}
                isActive={c.is_active}
                isFeatured={c.is_featured}
              />
            </div>
          </div>
        ))}
      </div>

      {(charities ?? []).length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-400 text-sm mb-4">No charities yet.</p>
          <Link href="/admin/charities/new"
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
            Add first charity
          </Link>
        </div>
      )}
    </div>
  )
}