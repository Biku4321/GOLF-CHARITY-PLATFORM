import { stripe } from '@/lib/stripe/client'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('auth_user_id', user.id)
      .single()

    const { data: sub } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', profile!.id)
      .single()

    if (!sub?.stripe_subscription_id) {
      return NextResponse.json({ status: 'none', subscription: null })
    }

    // Real-time check from Stripe (as per PDF requirement)
    const stripeSub: any = await stripe.subscriptions.retrieve(sub.stripe_subscription_id)

    // Sync if mismatch
    if (stripeSub.status !== sub.status) {
      await supabase
        .from('subscriptions')
        .update({ status: stripeSub.status })
        .eq('id', sub.id)
    }

    return NextResponse.json({
      status:       stripeSub.status,
      plan_type:    sub.plan_type,
      period_end:   new Date(stripeSub.current_period_end * 1000).toISOString(),
      cancel_at_end: stripeSub.cancel_at_period_end,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}