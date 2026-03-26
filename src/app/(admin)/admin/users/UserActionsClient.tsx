'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function UserActionsClient({
  userId, userRole,
}: {
  userId:   string
  userRole: string
}) {
  const router    = useRouter()
  const [loading, setLoading] = useState(false)

  const toggleRole = async () => {
    if (!confirm(`Change role to ${userRole === 'admin' ? 'subscriber' : 'admin'}?`)) return
    setLoading(true)
    await fetch(`/api/admin/users/${userId}/role`, {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        role: userRole === 'admin' ? 'subscriber' : 'admin'
      }),
    })
    router.refresh()
    setLoading(false)
  }

  return (
    <div className="flex gap-2">
      <Link href={`/admin/users/${userId}`}
        className="text-xs border border-gray-200 px-2.5 py-1 rounded-lg hover:bg-gray-50">
        Edit
      </Link>
      <button onClick={toggleRole} disabled={loading}
        className={`text-xs px-2.5 py-1 rounded-lg border disabled:opacity-50 ${
          userRole === 'admin'
            ? 'border-red-200 text-red-500 hover:bg-red-50'
            : 'border-purple-200 text-purple-600 hover:bg-purple-50'
        }`}>
        {loading ? '...' : userRole === 'admin' ? 'Demote' : 'Make admin'}
      </button>
    </div>
  )
}