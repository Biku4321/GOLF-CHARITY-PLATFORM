import { stripe } from '@/lib/stripe/client'
import { PLANS, calculateCharity } from '@/lib/stripe/plans'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { PlanType } from '@/lib/stripe/plans'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    const { plan_type, charity_percentage = 10 }: {
      plan_type: PlanType
      charity_percentage?: number
    } = await req.json()

    if (!PLANS[plan_type]) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    if (charity_percentage < 10 || charity_percentage > 100) {
      return NextResponse.json({ error: 'Charity % must be 10–100' }, { status: 400 })
    }

    // Get profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, email, full_name, selected_charity_id')
      .eq('auth_user_id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Check existing subscription
    const { data: existingSub } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id, status')
      .eq('user_id', profile.id)
      .single()

    if (existingSub?.status === 'active') {
      return NextResponse.json({ error: 'Already subscribed' }, { status: 409 })
    }

    // Get or create Stripe customer
    let customerId = existingSub?.stripe_customer_id
    if (!customerId) {
      const customer = await stripe.customers.create({
        email:    profile.email,
        name:     profile.full_name,
        metadata: { supabase_user_id: profile.id },
      })
      customerId = customer.id
    }

    const plan = PLANS[plan_type]

    // Create Stripe Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer:   customerId,
      mode:       'subscription',
      line_items: [{ price: plan.priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?subscription=success`,
      cancel_url:  `${process.env.NEXT_PUBLIC_APP_URL}/subscribe?cancelled=true`,
      metadata: {
        supabase_user_id:  profile.id,
        plan_type,
        charity_percentage: String(charity_percentage),
      },
      subscription_data: {
        metadata: {
          supabase_user_id:  profile.id,
          plan_type,
          charity_percentage: String(charity_percentage),
        },
      },
      allow_promotion_codes: true,
    })

    // Upsert subscription record (pending state)
    await supabase.from('subscriptions').upsert({
      user_id:             profile.id,
      plan_type,
      status:              'inactive',
      stripe_customer_id:  customerId,
      stripe_price_id:     plan.priceId,
    }, { onConflict: 'user_id' })

    // Update charity percentage on profile
    await supabase
      .from('profiles')
      .update({ charity_percentage })
      .eq('id', profile.id)

    return NextResponse.json({ url: checkoutSession.url })
  } catch (err: any) {
    console.error('[subscriptions/create]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}