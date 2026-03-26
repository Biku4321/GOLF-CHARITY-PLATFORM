'use client'
import useSWR from 'swr'
import { useSubscription } from '@/hooks/useSubscription'

const fetcher = (url: string) => fetch(url).then(r => r.json())

interface SubStatus {
  status:        string
  plan_type:     string
  period_end:    string
  cancel_at_end: boolean
}

export function SubscriptionStatus() {
  const { cancel, loading: cancelLoading } = useSubscription()
  
  // SWR replaces the entire useEffect block
  const { data: sub, isLoading } = useSWR<SubStatus>('/api/subscriptions/status', fetcher)

  if (isLoading) return <div className="animate-pulse h-24 bg-gray-100 rounded-xl" />

  const isActive  = sub?.status === 'active'
  const periodEnd = sub?.period_end
    ? new Date(sub.period_end).toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' })
    : '—'

  return (
    <div className="rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs text-gray-500 mb-1">Subscription</p>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-gray-400'}`} />
            <span className="text-sm font-semibold capitalize">
              {sub?.status ?? 'None'}
            </span>
            {sub?.plan_type && (
              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full capitalize">
                {sub.plan_type}
              </span>
            )}
          </div>
        </div>
        {isActive && !sub?.cancel_at_end && (
          <button
            onClick={cancel}
            disabled={cancelLoading}
            className="text-xs text-red-500 hover:text-red-700 border border-red-200 px-3 py-1.5 rounded-lg disabled:opacity-50"
          >
            {cancelLoading ? '...' : 'Cancel'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-0.5">
            {sub?.cancel_at_end ? 'Access until' : 'Renews on'}
          </p>
          <p className="font-medium">{periodEnd}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-0.5">Plan</p>
          <p className="font-medium capitalize">{sub?.plan_type ?? '—'}</p>
        </div>
      </div>

      {sub?.cancel_at_end && (
        <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2 mt-3">
          Your subscription will end on {periodEnd}. You can resubscribe anytime.
        </p>
      )}
    </div>
  )
}