'use client'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'

export function useAuth() {
  const supabase = createClient()
  const router   = useRouter()
  const [user,    setUser]    = useState<User | null>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) fetchProfile(session.user.id)
        else { setProfile(null); setLoading(false) }
      }
    )
    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (authId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*, subscriptions(status, current_period_end)')
      .eq('auth_user_id', authId)
      .single()
    setProfile(data)
    setLoading(false)
  }

  const signup = async (full_name: string, email: string, password: string) => {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ full_name, email, password }),
    })
    return res.json()
  }

  const login = async (email: string, password: string) => {
    const res  = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()          // resolve body BEFORE any navigation
    if (res.ok) router.push('/dashboard')  // redirect only after body is consumed
    return data
  }

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  const isAdmin      = profile?.role === 'admin'
  const isSubscribed = profile?.subscriptions?.[0]?.status === 'active'

  return { user, profile, loading, isAdmin, isSubscribed, signup, login, logout }
}