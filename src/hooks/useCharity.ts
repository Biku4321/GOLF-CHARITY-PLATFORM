'use client'
import { useState } from 'react'
import useSWR from 'swr'

// Reusable fetcher for SWR
const fetcher = (url: string) => fetch(url).then(r => r.json())

export interface Charity {
  id:          string
  name:        string
  slug:        string
  description: string
  image_url:   string
  website_url: string
  is_featured: boolean
  charity_events: {
    id:         string
    title:      string
    event_date: string
    location:   string
  }[]
}

export function useCharities(search = '') {
  // SWR handles caching, loading states, and deduplication automatically
  const { data, error, isLoading } = useSWR(
    `/api/charities?search=${encodeURIComponent(search)}`, 
    fetcher
  )

  return { 
    charities: (data?.charities ?? []) as Charity[], 
    loading: isLoading,
    error 
  }
}

export function useMyCharity() {
  const [saving, setSaving] = useState(false)
  const [percentage, setPercentage] = useState<number | null>(null)

  const { data, isLoading, mutate } = useSWR('/api/profile/charity', fetcher)

  // Derived state
  const charity = (data?.charity ?? null) as Charity | null
  const currentPercentage = percentage ?? data?.charity_percentage ?? 10

  const updateCharity = async (charityId: string, pct: number) => {
    setSaving(true)
    
    // Optimistic UI update (update the UI instantly before the DB responds)
    mutate({ ...data, charity_percentage: pct }, false)

    await fetch('/api/profile/charity', {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ charity_id: charityId, charity_percentage: pct }),
    })
    
    // Revalidate with the server
    mutate()
    setSaving(false)
  }

  return { 
    charity, 
    percentage: currentPercentage, 
    loading: isLoading, 
    saving, 
    updateCharity, 
    setPercentage 
  }
}