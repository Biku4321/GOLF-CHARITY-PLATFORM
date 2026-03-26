import { createClient } from '@/lib/supabase/server'
import UserActionsClient from './UserActionsClient'

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; role?: string }>
}) {
  const { search = '', role = '' } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('profiles')
    .select(`
      id, full_name, email, role,
      charity_percentage, created_at,
      subscriptions(status, plan_type, current_period_end),
      charities(name)
    `)
    .order('created_at', { ascending: false })

  if (search) query = query.ilike('email', `%${search}%`)
  if (role)   query = query.eq('role', role)

  const { data: users } = await query

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Users</h1>
        <span className="text-sm text-gray-400">
          {users?.length ?? 0} total
        </span>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <form className="flex gap-3 flex-1">
          <input
            type="search" name="search"
            defaultValue={search}
            placeholder="Search by email..."
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <select name="role" defaultValue={role}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
            <option value="">All roles</option>
            <option value="subscriber">Subscriber</option>
            <option value="admin">Admin</option>
          </select>
          <button type="submit"
            className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium">
            Filter
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {['User', 'Role', 'Subscription', 'Charity %', 'Joined', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(users ?? []).map(user => {
                const sub     = (user.subscriptions as any[])?.[0]
                const charity = (user as any).charities
                return (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-xs font-bold shrink-0">
                          {user.full_name?.[0] ?? '?'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.full_name}</p>
                          <p className="text-xs text-gray-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        user.role === 'admin'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {sub ? (
                        <div>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            sub.status === 'active'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-red-100 text-red-600'
                          }`}>
                            {sub.status}
                          </span>
                          <p className="text-xs text-gray-400 mt-0.5 capitalize">
                            {sub.plan_type}
                          </p>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">None</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-100 rounded-full h-1.5">
                          <div
                            className="bg-emerald-500 h-full rounded-full"
                            style={{ width: `${user.charity_percentage}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-600">
                          {user.charity_percentage}%
                        </span>
                      </div>
                      {charity && (
                        <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[120px]">
                          {charity.name}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {new Date(user.created_at).toLocaleDateString('en-GB', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <UserActionsClient userId={user.id} userRole={user.role} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {(users ?? []).length === 0 && (
          <div className="p-8 text-center text-sm text-gray-400">
            No users found.
          </div>
        )}
      </div>
    </div>
  )
}