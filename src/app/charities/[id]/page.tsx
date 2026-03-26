import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default async function CharityProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id }   = await params
  const supabase = await createClient()

  const { data: charity } = await supabase
    .from('charities')
    .select('*, charity_events(*)')
    .eq('id', id)
    .eq('is_active', true)
    .single()

  if (!charity) notFound()

  const upcomingEvents = (charity.charity_events ?? [])
    .filter((e: any) => new Date(e.event_date) >= new Date())
    .sort((a: any, b: any) =>
      new Date(a.event_date).getTime() - new Date(b.event_date).getTime()
    )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-6 py-10">

        {/* Back */}
        <Link href="/charities"
          className="text-sm text-gray-400 hover:text-gray-600 mb-6 block">
          ← All charities
        </Link>

        {/* Header card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <div className="flex items-start gap-5">
            {charity.image_url ? (
              <img
                src={charity.image_url} alt={charity.name}
                className="w-20 h-20 rounded-2xl object-cover shrink-0"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-emerald-100 flex items-center justify-center shrink-0">
                <span className="text-emerald-700 font-bold text-2xl">
                  {charity.name[0]}
                </span>
              </div>
            )}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-semibold">{charity.name}</h1>
                {charity.is_featured && (
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium">
                    Featured
                  </span>
                )}
              </div>
              {charity.website_url && (
                <a href={charity.website_url} target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-emerald-600 hover:underline">
                  {charity.website_url.replace(/^https?:\/\//, '')} →
                </a>
              )}
            </div>
          </div>

          {charity.description && (
            <p className="text-gray-600 mt-4 leading-relaxed">
              {charity.description}
            </p>
          )}

          <div className="mt-5 pt-5 border-t border-gray-100">
            <Link href="/signup"
              className="inline-block bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors">
              Support this charity →
            </Link>
          </div>
        </div>

        {/* Upcoming Events */}
        {upcomingEvents.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="font-semibold mb-4">Upcoming golf events</h2>
            <div className="space-y-3">
              {upcomingEvents.map((event: any) => (
                <div key={event.id}
                  className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="bg-emerald-100 rounded-lg p-2 text-center min-w-[48px]">
                    <p className="text-xs text-emerald-600 font-medium">
                      {new Date(event.event_date).toLocaleString('en-GB', { month: 'short' })}
                    </p>
                    <p className="text-lg font-bold text-emerald-700 leading-none">
                      {new Date(event.event_date).getDate()}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-sm">{event.title}</p>
                    {event.location && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        {event.location}
                      </p>
                    )}
                    {event.description && (
                      <p className="text-xs text-gray-400 mt-1">
                        {event.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}