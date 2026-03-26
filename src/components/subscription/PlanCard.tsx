'use client'
import { useState } from 'react'
import { useSubscription } from '@/hooks/useSubscription'
import { PLANS } from '@/lib/stripe/plans'
import type { PlanType } from '@/lib/stripe/plans'

export function PricingSection() {
  const [billingCycle, setBillingCycle] = useState<PlanType>('monthly')
  const [charityPct,   setCharityPct]   = useState(10)
  const { subscribe, loading, error }   = useSubscription()

  const plan     = PLANS[billingCycle]
  const charity  = Math.round(plan.amount * charityPct / 100)
  const pool     = Math.round(plan.amount * 0.60)
  const platform = Math.max(0, plan.amount - charity - pool)

  const fmt = (p: number) => `£${(p / 100).toFixed(2)}`

  return (
    <section className="max-w-3xl mx-auto px-4 py-16">

      {/* Billing Toggle */}
      <div className="flex items-center justify-center gap-4 mb-10">
        <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-gray-900' : 'text-gray-400'}`}>
          Monthly
        </span>
        <button
          onClick={() => setBillingCycle(c => c === 'monthly' ? 'yearly' : 'monthly')}
          className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
            billingCycle === 'yearly' ? 'bg-emerald-600' : 'bg-gray-300'
          }`}
        >
          <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
            billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-0'
          }`} />
        </button>
        <span className={`text-sm font-medium flex items-center gap-2 ${billingCycle === 'yearly' ? 'text-gray-900' : 'text-gray-400'}`}>
          Yearly
          <span className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded-full">
            save 25%
          </span>
        </span>
      </div>

      {/* Plan Cards */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">

        {/* Monthly */}
        <div className={`rounded-xl border p-6 transition-all ${
          billingCycle === 'monthly' ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-gray-200'
        }`}>
          <span className="bg-emerald-50 text-emerald-700 text-xs font-medium px-3 py-1 rounded-full">
            Monthly
          </span>
          <p className="text-3xl font-semibold mt-3 mb-0">
            £9.99
            <span className="text-sm font-normal text-gray-500">/mo</span>
          </p>
          <p className="text-xs text-gray-400 mb-4">Cancel anytime</p>

          <div className="space-y-2 mb-6 text-sm text-gray-600">
            {['Monthly draw entry', '5-score tracking', 'Charity contribution', 'Full dashboard'].map(f => (
              <div key={f} className="flex items-center gap-2">
                <span className="text-emerald-600 font-bold">✓</span> {f}
              </div>
            ))}
          </div>

          <button
            onClick={() => { setBillingCycle('monthly'); subscribe('monthly', charityPct) }}
            disabled={loading}
            className="w-full py-2.5 rounded-lg text-sm font-medium border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {loading && billingCycle === 'monthly' ? 'Redirecting...' : 'Choose Monthly'}
          </button>
        </div>

        {/* Yearly */}
        <div className={`rounded-xl border-2 p-6 transition-all ${
          billingCycle === 'yearly' ? 'border-emerald-500' : 'border-emerald-300'
        }`}>
          <div className="flex gap-2 flex-wrap mb-1">
            <span className="bg-emerald-50 text-emerald-700 text-xs font-medium px-3 py-1 rounded-full">Yearly</span>
            <span className="bg-amber-50 text-amber-700 text-xs font-medium px-3 py-1 rounded-full">Most popular</span>
          </div>
          <p className="text-3xl font-semibold mt-3 mb-0">
            £7.50
            <span className="text-sm font-normal text-gray-500">/mo</span>
          </p>
          <p className="text-xs text-gray-400 mb-0.5">£89.99 billed annually</p>
          <p className="text-xs text-emerald-600 font-semibold mb-4">You save £29.89</p>

          <div className="space-y-2 mb-6 text-sm text-gray-600">
            {['Everything in monthly', '12 draws guaranteed', 'Priority payout', 'Higher charity impact'].map(f => (
              <div key={f} className="flex items-center gap-2">
                <span className="text-emerald-600 font-bold">✓</span> {f}
              </div>
            ))}
          </div>

          <button
            onClick={() => { setBillingCycle('yearly'); subscribe('yearly', charityPct) }}
            disabled={loading}
            className="w-full py-2.5 rounded-lg text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors disabled:opacity-50"
          >
            {loading && billingCycle === 'yearly' ? 'Redirecting...' : 'Choose Yearly'}
          </button>
        </div>

      </div>

      {/* Charity Slider */}
      <div className="rounded-xl border border-gray-200 p-6">
        <h3 className="text-sm font-semibold mb-1">Your charity contribution</h3>
        <p className="text-xs text-gray-500 mb-4">Minimum 10%. Increase anytime.</p>

        <div className="flex items-center gap-4 mb-4">
          <input
            type="range" min={10} max={100} step={1}
            value={charityPct}
            onChange={e => setCharityPct(Number(e.target.value))}
            className="flex-1 accent-emerald-600"
          />
          <span className="text-sm font-semibold w-10 text-right">{charityPct}%</span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'To charity',  value: fmt(charity)  },
            { label: 'Prize pool',  value: fmt(pool)     },
            { label: 'Platform',    value: fmt(platform) },
          ].map(({ label, value }) => (
            <div key={label} className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">{label}</p>
              <p className="text-lg font-semibold">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <p className="text-red-500 text-sm text-center mt-4">{error}</p>
      )}

      <p className="text-center text-xs text-gray-400 mt-4">
        Secured by Stripe · Cancel anytime · No hidden fees
      </p>
    </section>
  )
}