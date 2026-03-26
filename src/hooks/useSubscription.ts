'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { PlanType } from '@/lib/stripe/plans'

export function useSubscription() {
  const router  = useRouter()
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  const subscribe = async (plan_type: PlanType, charity_percentage = 10) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/subscriptions/create', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ plan_type, charity_percentage }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      // Redirect to Stripe Checkout
      window.location.href = data.url
    } catch (e: any) {
      setError(e.message)
      setLoading(false)
    }
  }

  const cancel = async () => {
    setLoading(true)
    setError(null)
    try {
      const res  = await fetch('/api/subscriptions/cancel', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      router.refresh()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return { subscribe, cancel, loading, error }
}