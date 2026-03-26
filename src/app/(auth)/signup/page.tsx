'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const [fullName,  setFullName]  = useState('')
  const [email,     setEmail]     = useState('')
  const [password,  setPassword]  = useState('')
  const [error,     setError]     = useState<string | null>(null)
  const [loading,   setLoading]   = useState(false)
  const [success,   setSuccess]   = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          // emailRedirectTo only used when email confirm is ON
          emailRedirectTo: `${window.location.origin}/api/auth/callback`,
        },
      })

      if (error) {
        // Friendly messages for common errors
        if (error.message.toLowerCase().includes('rate limit') ||
            error.message.toLowerCase().includes('email rate')) {
          setError('Too many signups attempted. Please wait a few minutes and try again, or use a different email address.')
        } else if (error.message.toLowerCase().includes('already registered') ||
                   error.message.toLowerCase().includes('already exists')) {
          setError('This email is already registered. Please sign in instead.')
        } else if (error.message.toLowerCase().includes('password')) {
          setError('Password must be at least 8 characters long.')
        } else {
          setError(error.message)
        }
        return
      }

      // If email confirm is OFF in Supabase → session exists → redirect
      if (data.session) {
        window.location.href = '/dashboard'
        return
      }

      // Email confirm is ON → show confirmation message
      setSuccess(true)

    } catch (err: any) {
      setError('Connection failed. Please check your internet connection.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 p-8 text-center">
          <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-emerald-600 text-2xl">✓</span>
          </div>
          <h2 className="text-xl font-semibold mb-2">Check your email</h2>
          <p className="text-sm text-gray-500 mb-2">
            We sent a confirmation link to <strong>{email}</strong>.
          </p>
          <p className="text-xs text-gray-400 mb-6">
            Can't find it? Check your spam folder. The link expires in 1 hour.
          </p>
          <Link href="/login"
            className="text-sm text-emerald-600 font-medium hover:underline">
            Back to login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 p-8">

        <h1 className="text-2xl font-semibold mb-1">Create account</h1>
        <p className="text-sm text-gray-500 mb-6">Join the platform today</p>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Full name</label>
            <input
              type="text" required
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="John Smith"
              autoComplete="name"
              suppressHydrationWarning
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email" required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              suppressHydrationWarning
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password" required minLength={8}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Min 8 characters"
              autoComplete="new-password"
              suppressHydrationWarning
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <button
            type="submit" disabled={loading}
            suppressHydrationWarning
            className="w-full bg-emerald-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <div className="mt-5 p-3 bg-blue-50 border border-blue-100 rounded-lg">
          <p className="text-xs text-blue-700 font-medium mb-1">
            Having trouble signing up?
          </p>
          <p className="text-xs text-blue-600">
            If you see a "rate limit" error, Supabase free tier allows 3 signup emails per hour.
            Go to Supabase Dashboard → Authentication → Email → disable "Confirm email" for testing.
          </p>
        </div>

        <p className="text-sm text-gray-500 text-center mt-4">
          Already have an account?{' '}
          <Link href="/login" className="text-emerald-600 font-medium hover:underline">
            Sign in
          </Link>
        </p>

      </div>
    </div>
  )
}