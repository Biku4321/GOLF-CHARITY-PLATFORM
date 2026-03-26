'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const router   = useRouter()
  const supabase = createClient()

  const [profile,   setProfile]   = useState<any>(null)
  const [sub,       setSub]       = useState<any>(null)
  const [loading,   setLoading]   = useState(true)
  const [saving,    setSaving]    = useState(false)
  const [cancelling,setCancelling]= useState(false)
  const [saved,     setSaved]     = useState(false)
  const [error,     setError]     = useState<string | null>(null)

  const [fullName,  setFullName]  = useState('')
  const [oldPass,   setOldPass]   = useState('')
  const [newPass,   setNewPass]   = useState('')
  const [passMsg,   setPassMsg]   = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const [profileRes, subRes] = await Promise.all([
        fetch('/api/profile/charity'),
        fetch('/api/subscriptions/status'),
      ])
      const profileData = await profileRes.json()
      const subData     = await subRes.json()

      // Get full profile
      const { data: prof } = await supabase
        .from('profiles')
        .select('full_name, email, role')
        .eq('auth_user_id', user.id)
        .single()

      setProfile(prof)
      setFullName(prof?.full_name ?? '')
      setSub(subData)
      setLoading(false)
    }
    load()
  }, [])

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName })
      .eq('auth_user_id', user!.id)

    if (error) { setError(error.message) }
    else { setSaved(true); setTimeout(() => setSaved(false), 3000) }
    setSaving(false)
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPassMsg(null)
    if (newPass.length < 8) {
      setPassMsg('Password must be at least 8 characters')
      return
    }
    const { error } = await supabase.auth.updateUser({ password: newPass })
    if (error) { setPassMsg(error.message) }
    else {
      setPassMsg('Password updated successfully')
      setOldPass(''); setNewPass('')
    }
  }

  const handleCancelSub = async () => {
    if (!confirm('Cancel subscription? You will retain access until the end of the billing period.')) return
    setCancelling(true)
    const res = await fetch('/api/subscriptions/cancel', { method: 'POST' })
    if (res.ok) {
      setSub((prev: any) => ({ ...prev, status: 'cancelled', cancel_at_end: true }))
    }
    setCancelling(false)
  }

  const handleLogout = async () => {
  try {
    await supabase.auth.signOut();
    window.location.href = '/login';
  } catch (error) {
    console.error('Logout error:', error);
  }
}

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-2xl mx-auto space-y-4">
          {[1,2,3].map(i => (
            <div key={i} className="h-32 bg-white rounded-2xl border border-gray-200 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto space-y-5">

        <h1 className="text-2xl font-semibold">Settings</h1>

        {/* Profile */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-semibold mb-4">Profile</h2>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Full name</label>
              <input
                type="text" required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                suppressHydrationWarning
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email" disabled
                value={profile?.email ?? ''}
                className="w-full border border-gray-100 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-400"
              />
              <p className="text-xs text-gray-400 mt-1">Email cannot be changed.</p>
            </div>
            {error && (
              <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
            )}
            <div className="flex items-center gap-3">
              <button type="submit" disabled={saving}
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50">
                {saving ? 'Saving...' : 'Save changes'}
              </button>
              {saved && <p className="text-sm text-emerald-600">✓ Saved</p>}
            </div>
          </form>
        </div>

        {/* Password */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-semibold mb-4">Change password</h2>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">New password</label>
              <input
                type="password" minLength={8}
                value={newPass}
                onChange={e => setNewPass(e.target.value)}
                placeholder="Min 8 characters"
                suppressHydrationWarning
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            {passMsg && (
              <p className={`text-sm rounded-lg px-3 py-2 ${
                passMsg.includes('success')
                  ? 'text-emerald-600 bg-emerald-50'
                  : 'text-red-500 bg-red-50'
              }`}>{passMsg}</p>
            )}
            <button type="submit"
              className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700">
              Update password
            </button>
          </form>
        </div>

        {/* Subscription */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-semibold mb-4">Subscription</h2>
          {sub?.status && sub.status !== 'none' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-1">Status</p>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${
                      sub.status === 'active' ? 'bg-emerald-500' : 'bg-gray-400'
                    }`} />
                    <span className="text-sm font-medium capitalize">{sub.status}</span>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-1">Plan</p>
                  <p className="text-sm font-medium capitalize">{sub.plan_type ?? '—'}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 col-span-2">
                  <p className="text-xs text-gray-400 mb-1">
                    {sub.cancel_at_end ? 'Access until' : 'Renews on'}
                  </p>
                  <p className="text-sm font-medium">
                    {sub.period_end
                      ? new Date(sub.period_end).toLocaleDateString('en-GB', {
                          day: 'numeric', month: 'long', year: 'numeric'
                        })
                      : '—'}
                  </p>
                </div>
              </div>

              {sub.cancel_at_end ? (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                  <p className="text-sm text-amber-700">
                    Your subscription is cancelled and will end on the date above.
                  </p>
                </div>
              ) : sub.status === 'active' ? (
                <button
                  onClick={handleCancelSub}
                  disabled={cancelling}
                  className="text-sm text-red-500 border border-red-200 px-4 py-2 rounded-lg hover:bg-red-50 disabled:opacity-50">
                  {cancelling ? 'Cancelling...' : 'Cancel subscription'}
                </button>
              ) : null}
            </div>
          ) : (
            <div>
              <p className="text-sm text-gray-500 mb-3">You don't have an active subscription.</p>
              <a href="/subscribe"
                className="inline-block bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700">
                View plans →
              </a>
            </div>
          )}
        </div>

        {/* Danger zone */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-semibold mb-4">Account</h2>
          <button
            onClick={handleLogout}
            className="text-sm text-red-500 border border-red-200 px-4 py-2 rounded-lg hover:bg-red-50">
            Sign out
          </button>
        </div>

      </div>
    </div>
  )
}
