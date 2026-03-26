'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { use } from 'react'

export default function EditCharityPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id }  = use(params)
  const router  = useRouter()
  const [loading, setLoading] = useState(false)
  const [fetching,setFetching]= useState(true)
  const [error,   setError]   = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '', slug: '', description: '',
    image_url: '', website_url: '',
    is_featured: false, is_active: true,
  })

  useEffect(() => {
    fetch(`/api/charities/${id}`)
      .then(r => r.json())
      .then(d => {
        if (d.charity) setForm({
          name:        d.charity.name        ?? '',
          slug:        d.charity.slug        ?? '',
          description: d.charity.description ?? '',
          image_url:   d.charity.image_url   ?? '',
          website_url: d.charity.website_url ?? '',
          is_featured: d.charity.is_featured ?? false,
          is_active:   d.charity.is_active   ?? true,
        })
        setFetching(false)
      })
  }, [id])

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const res  = await fetch(`/api/charities/${id}`, {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(form),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error); setLoading(false); return }
    router.push('/admin/charities')
  }

  const handleDelete = async () => {
    if (!confirm('Deactivate this charity?')) return
    await fetch(`/api/charities/${id}`, { method: 'DELETE' })
    router.push('/admin/charities')
  }

  if (fetching) {
    return (
      <div className="p-8 max-w-2xl">
        <div className="h-64 bg-white rounded-xl border border-gray-200 animate-pulse" />
      </div>
    )
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <a href="/admin/charities"
            className="text-sm text-gray-400 hover:text-gray-600">← Back</a>
          <h1 className="text-2xl font-semibold">Edit charity</h1>
        </div>
        <button onClick={handleDelete}
          className="text-sm text-red-500 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50">
          Deactivate
        </button>
      </div>

      <form onSubmit={handleSubmit}
        className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name *</label>
            <input required type="text" value={form.name}
              onChange={e => set('name', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Slug *</label>
            <input required type="text" value={form.slug}
              onChange={e => set('slug', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea value={form.description} rows={3}
            onChange={e => set('description', e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Image URL</label>
            <input type="url" value={form.image_url}
              onChange={e => set('image_url', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Website URL</label>
            <input type="url" value={form.website_url}
              onChange={e => set('website_url', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
        </div>

        <div className="flex gap-6 pt-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is_featured}
              onChange={e => set('is_featured', e.target.checked)}
              className="accent-emerald-600" />
            <span className="text-sm">Featured on homepage</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is_active}
              onChange={e => set('is_active', e.target.checked)}
              className="accent-emerald-600" />
            <span className="text-sm">Active</span>
          </label>
        </div>

        {error && (
          <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading}
            className="bg-emerald-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50">
            {loading ? 'Saving...' : 'Save changes'}
          </button>
          <a href="/admin/charities"
            className="border border-gray-200 px-5 py-2.5 rounded-lg text-sm hover:bg-gray-50">
            Cancel
          </a>
        </div>
      </form>
    </div>
  )
}
