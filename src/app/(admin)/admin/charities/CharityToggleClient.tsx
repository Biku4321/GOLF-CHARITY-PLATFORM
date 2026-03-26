'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CharityToggleClient({
  charityId, isActive, isFeatured,
}: {
  charityId:  string
  isActive:   boolean
  isFeatured: boolean
}) {
  const router  = useRouter()
  const [loading, setLoading] = useState(false)

  const update = async (patch: Record<string, boolean>) => {
    setLoading(true)
    await fetch(`/api/charities/${charityId}`, {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(patch),
    })
    router.refresh()
    setLoading(false)
  }

  return (
    <>
      <button
        onClick={() => update({ is_featured: !isFeatured })}
        disabled={loading}
        className={`text-xs px-3 py-1.5 rounded-lg border disabled:opacity-50 ${
          isFeatured
            ? 'border-amber-200 text-amber-600 bg-amber-50'
            : 'border-gray-200 text-gray-500 hover:bg-gray-50'
        }`}>
        {isFeatured ? 'Unfeature' : 'Feature'}
      </button>
      <button
        onClick={() => update({ is_active: !isActive })}
        disabled={loading}
        className={`text-xs px-3 py-1.5 rounded-lg border disabled:opacity-50 ${
          isActive
            ? 'border-red-200 text-red-500 hover:bg-red-50'
            : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
        }`}>
        {isActive ? 'Deactivate' : 'Activate'}
      </button>
    </>
  )
}