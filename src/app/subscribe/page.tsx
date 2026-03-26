import Link from 'next/link'

export default function SubscribePage() {
  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-3xl font-semibold mb-2">Choose your plan</h1>
        <p className="text-gray-500 mb-8">Join thousands of golfers making a difference.</p>
        <Link href="/signup"
          className="bg-emerald-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors">
          Get started
        </Link>
      </div>
    </main>
  )
}
