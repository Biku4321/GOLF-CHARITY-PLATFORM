'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function NewDrawPage() {
  const router  = useRouter()
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  const currentMonth = new Date().toISOString().slice(0, 7)

  const [form, setForm] = useState({
    title:              '',
    month_year:         currentMonth,
    logic_type:         'random',
    prize_pool_total:   0,
    jackpot_carry_forward: 0,
    draw_date:          '',
  })

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { error } = await supabase.from('draws').insert({
      ...form,
      prize_pool_total:      Math.round(form.prize_pool_total * 100),
      jackpot_carry_forward: Math.round(form.jackpot_carry_forward * 100),
      status: 'upcoming',
    })

    if (error) { setError(error.message); setLoading(false); return }
    router.push('/admin/draws')
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/draws" className="text-sm text-gray-400 hover:text-gray-600">← Back</Link>
        <h1 className="text-2xl font-semibold">New draw</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Draw title *</label>
            <input required type="text"
              value={form.title}
              onChange={e => set('title', e.target.value)}
              placeholder="January 2026 Draw"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Month (YYYY-MM) *</label>
            <input required type="month"
              value={form.month_year}
              onChange={e => set('month_year', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Draw logic</label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { val: 'random',      label: 'Random',      desc: 'Standard lottery-style draw' },
              { val: 'algorithmic', label: 'Algorithmic', desc: 'Weighted by score frequency' },
            ].map(({ val, label, desc }) => (
              <button key={val} type="button"
                onClick={() => set('logic_type', val)}
                className={`text-left p-3 rounded-xl border transition-all ${
                  form.logic_type === val
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Prize pool total (£)</label>
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
              <span className="px-3 py-2 text-sm text-gray-400 bg-gray-50 border-r border-gray-200">£</span>
              <input type="number" min="0" step="0.01"
                value={form.prize_pool_total}
                onChange={e => set('prize_pool_total', Number(e.target.value))}
                className="flex-1 px-3 py-2 text-sm focus:outline-none"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Split: 40% jackpot · 35% four-match · 25% three-match
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Jackpot carry forward (£)</label>
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
              <span className="px-3 py-2 text-sm text-gray-400 bg-gray-50 border-r border-gray-200">£</span>
              <input type="number" min="0" step="0.01"
                value={form.jackpot_carry_forward}
                onChange={e => set('jackpot_carry_forward', Number(e.target.value))}
                className="flex-1 px-3 py-2 text-sm focus:outline-none"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">From previous unclaimed jackpot</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Draw date</label>
          <input type="datetime-local"
            value={form.draw_date}
            onChange={e => set('draw_date', e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Pool preview */}
        {form.prize_pool_total > 0 && (
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs font-medium text-gray-500 mb-3">Prize pool breakdown</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: '5-match jackpot', pct: 0.40 },
                { label: '4-match',          pct: 0.35 },
                { label: '3-match',          pct: 0.25 },
              ].map(({ label, pct }) => {
                const base    = form.prize_pool_total * pct
                const jackpot = label.includes('5') ? base + form.jackpot_carry_forward : base
                return (
                  <div key={label} className="bg-white rounded-lg p-3 text-center border border-gray-100">
                    <p className="text-xs text-gray-400 mb-1">{label}</p>
                    <p className="text-base font-semibold">£{jackpot.toFixed(2)}</p>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {error && (
          <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading}
            className="bg-emerald-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50">
            {loading ? 'Creating...' : 'Create draw'}
          </button>
          <Link href="/admin/draws"
            className="border border-gray-200 px-5 py-2.5 rounded-lg text-sm hover:bg-gray-50">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
