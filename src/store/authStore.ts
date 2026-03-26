import { create } from 'zustand'
import type { User } from '@supabase/supabase-js'

interface Profile {
  id:                  string
  auth_user_id:        string
  full_name:           string | null
  email:               string | null
  role:                'subscriber' | 'admin'
  selected_charity_id: string | null
  charity_percentage:  number
  avatar_url:          string | null
  subscriptions?:      Array<{ status: string; current_period_end: string }>
}

interface AuthState {
  user:         User | null
  profile:      Profile | null
  loading:      boolean
  setUser:      (user: User | null) => void
  setProfile:   (profile: Profile | null) => void
  setLoading:   (loading: boolean) => void
  reset:        () => void
  isAdmin:      () => boolean
  isSubscribed: () => boolean
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user:    null,
  profile: null,
  loading: true,

  setUser:    (user)    => set({ user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ loading }),

  reset: () => set({ user: null, profile: null, loading: false }),

  isAdmin: () => get().profile?.role === 'admin',

  isSubscribed: () =>
    (get().profile?.subscriptions?.[0]?.status === 'active') ?? false,
}))