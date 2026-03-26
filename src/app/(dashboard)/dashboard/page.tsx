import { createClient } from '@/lib/supabase/server'
import { redirect }     from 'next/navigation'
import { SubscriptionWidget }        from '@/components/dashboard/SubscriptionWidget'
import { ScoreWidget }               from '@/components/dashboard/ScoreWidget'
import { CharityWidget }             from '@/components/dashboard/CharityWidget'
import { DrawParticipationWidget }   from '@/components/dashboard/DrawParticipationWidget'
import { WinningsWidget }            from '@/components/dashboard/WinningsWidget'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select(`
      full_name, role, charity_percentage,
      subscriptions(status, plan_type, current_period_end, cancelled_at),
      charities(id, name, image_url)
    `)
    .eq('auth_user_id', user.id)
    .single()

  const sub     = (profile?.subscriptions as any[])?.[0] ?? null
  const charity = (profile as any)?.charities ?? null

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">

        {/* Welcome */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">
            Welcome back, {profile?.full_name?.split(' ')[0] ?? 'Player'}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {new Date().toLocaleDateString('en-GB', {
              weekday: 'long', day: 'numeric', month: 'long'
            })}
          </p>
        </div>

        {/* Widget grid */}
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <SubscriptionWidget subscription={sub} />
          <CharityWidget
            charity={charity}
            percentage={profile?.charity_percentage ?? 10}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <ScoreWidget userId={user.id} />
          <DrawParticipationWidget userId={user.id} />
        </div>

        <WinningsWidget userId={user.id} />

      </div>
    </div>
  )
}