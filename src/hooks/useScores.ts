'use client'
import { useState } from 'react'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export interface Score {
  id:               string
  stableford_score: number
  score_date:       string
  position_rank:    number
  created_at:       string
}

export function useScores() {
  const [error, setError] = useState<string | null>(null)
  
  // SWR fetching
  const { data, isLoading, mutate } = useSWR('/api/scores', fetcher)
  const scores = (data?.scores ?? []) as Score[]

  const addScore = async (stableford_score: number, score_date: string) => {
    setError(null)
    const res = await fetch('/api/scores', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ stableford_score, score_date }),
    })
    const responseData = await res.json()
    
    if (!res.ok) { 
      setError(responseData.error)
      return false 
    }
    
    // Tell SWR to re-fetch the scores immediately
    mutate()
    return true
  }

  const updateScore = async (id: string, stableford_score: number, score_date: string) => {
    setError(null)
    const res = await fetch(`/api/scores/${id}`, {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ stableford_score, score_date }),
    })
    const responseData = await res.json()
    
    if (!res.ok) { 
      setError(responseData.error)
      return false 
    }
    
    mutate()
    return true
  }

  const deleteScore = async (id: string) => {
    const res = await fetch(`/api/scores/${id}`, { method: 'DELETE' })
    if (res.ok) {
      mutate()
    }
  }

  return { 
    scores, 
    loading: isLoading, 
    error, 
    addScore, 
    updateScore, 
    deleteScore, 
    refetch: mutate 
  }
}