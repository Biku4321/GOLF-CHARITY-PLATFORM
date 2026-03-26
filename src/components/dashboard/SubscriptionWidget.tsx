import Link from 'next/link'

interface Props {
  subscription: {
    status:            string
    plan_type:         string
    current_period_end: string
    cancelled_at?:     string
  } | null
}

export function SubscriptionWidget({ subscription }: Props) {
  const isActive    = subscription?.status === 'active'
  const isCancelled = subscription?.status === 'cancelled'

  const periodEnd = subscription?.current_period_end
    ? new Date(subscription.current_period_end).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'long', year: 'numeric'
      })
    : null

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
          Subscription
        </p>
        <div className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
          isActive    ? 'bg-emerald-100 text-emerald-700'
          : isCancelled ? 'bg-red-100 text-red-600'
          : 'bg-gray-100 text-gray-500'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${
            isActive ? 'bg-emerald-500' : 'bg-gray-400'
          }`} />
          {subscription?.status ?? 'None'}
        </div>
      </div>

      {isActive ? (
        <>
          <p className="text-xl font-semibold capitalize mb-1">
            {subscription!.plan_type} plan
          </p>
          <p className="text-sm text-gray-500">
            {isCancelled ? 'Access until' : 'Renews'} {periodEnd}
          </p>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <Link href="/settings"
              className="text-sm text-emerald-600 hover:underline">
              Manage subscription →
            </Link>
          </div>
        </>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">
            Subscribe to enter monthly draws and track your scores.
          </p>
          <Link href="/subscribe"
            className="inline-block bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700">
            View plans →
          </Link>
        </>
      )}
    </div>
  )
}