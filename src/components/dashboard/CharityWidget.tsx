import Link from 'next/link'

interface Props {
  charity: {
    id:        string
    name:      string
    image_url: string
  } | null
  percentage: number
}

export function CharityWidget({ charity, percentage }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
          My charity
        </p>
        <Link href="/charity"
          className="text-xs text-emerald-600 hover:underline">
          {charity ? 'Change →' : 'Choose →'}
        </Link>
      </div>

      {charity ? (
        <>
          <div className="flex items-center gap-3 mb-4">
            {charity.image_url ? (
              <img src={charity.image_url} alt={charity.name}
                className="w-12 h-12 rounded-xl object-cover" />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                <span className="text-emerald-700 font-bold text-lg">
                  {charity.name[0]}
                </span>
              </div>
            )}
            <div>
              <p className="font-semibold">{charity.name}</p>
              <p className="text-xs text-gray-500">
                {percentage}% of subscription
              </p>
            </div>
          </div>

          {/* Contribution bar */}
          <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>10%</span>
            <span className="text-emerald-600 font-medium">{percentage}%</span>
            <span>100%</span>
          </div>
        </>
      ) : (
        <div>
          <p className="text-sm text-gray-500 mb-3">
            You haven't chosen a charity yet.
          </p>
          <Link href="/charity"
            className="inline-block bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700">
            Choose a charity →
          </Link>
        </div>
      )}
    </div>
  )
}