import { stripe } from '@/lib/stripe/client'
import { createClient } from '@/lib/supabase/server'
import { calculateCharity } from '@/lib/stripe/plans'
import { NextResponse } from 'next/server'
import type Stripe from 'stripe'

// NOTE: App Router routes receive the raw Request object by default.
// No body-parser config needed — Stripe raw body is read via req.text() below.

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: Request) {
  const body      = await req.text()
  const signature = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, WEBHOOK_SECRET)
  } catch (err: any) {
    console.error('[webhook] Invalid signature:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = await createClient()

  switch (event.type) {

    // ── Checkout completed → activate subscription ──────────────────
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      if (session.mode !== 'subscription') break

      const userId           = session.metadata?.supabase_user_id
      const planType         = session.metadata?.plan_type
      const charityPct       = Number(session.metadata?.charity_percentage ?? 10)
      const stripeSubId      = session.subscription as string

      const stripeSub = await stripe.subscriptions.retrieve(stripeSubId)

      await supabase.from('subscriptions').upsert({
        user_id:                userId,
        plan_type:              planType,
        status:                 'active',
        stripe_customer_id:     session.customer as string,
        stripe_subscription_id: stripeSubId,
        stripe_price_id:        stripeSub.items.data[0].price.id,
        current_period_start:   new Date(stripeSub.current_period_start * 1000).toISOString(),
        current_period_end:     new Date(stripeSub.current_period_end   * 1000).toISOString(),
      }, { onConflict: 'user_id' })

      // Get subscription DB record for donations
      const { data: subRecord } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('user_id', userId)
        .single()

      // Get charity — userId here is the Supabase auth UUID stored in auth_user_id
      // Get charity — userId here is the profile.id passed from checkout metadata
      const { data: profile } = await supabase
        .from('profiles')
        .select('selected_charity_id')
        .eq('id', userId)
        .single()

      // Auto-create charity donation record
      if (profile?.selected_charity_id && subRecord) {
        const plan         = (await import('@/lib/stripe/plans')).PLANS[planType as any]
        const donationAmt  = calculateCharity(plan.amount, charityPct)

        await supabase.from('donations').insert({
          user_id:         userId,
          charity_id:      profile.selected_charity_id,
          subscription_id: subRecord.id,
          amount_pence:    donationAmt,
          type:            'subscription_auto',
          status:          'completed',
        })
      }
      break
    }

    // ── Renewal ─────────────────────────────────────────────────────
    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice
      if (invoice.billing_reason !== 'subscription_cycle') break

      const stripeSubId = invoice.subscription as string
      const stripeSub   = await stripe.subscriptions.retrieve(stripeSubId)

      await supabase
        .from('subscriptions')
        .update({
          status:               'active',
          current_period_start: new Date(stripeSub.current_period_start * 1000).toISOString(),
          current_period_end:   new Date(stripeSub.current_period_end   * 1000).toISOString(),
        })
        .eq('stripe_subscription_id', stripeSubId)
      break
    }

    // ── Payment failed ───────────────────────────────────────────────
    case 'invoice.payment_failed': {
      const invoice     = event.data.object as Stripe.Invoice
      const stripeSubId = invoice.subscription as string

      await supabase
        .from('subscriptions')
        .update({ status: 'past_due' })
        .eq('stripe_subscription_id', stripeSubId)
      break
    }

    // ── Cancelled / deleted ──────────────────────────────────────────
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription

      await supabase
        .from('subscriptions')
        .update({
          status:       'cancelled',
          cancelled_at: new Date().toISOString(),
        })
        .eq('stripe_subscription_id', sub.id)
      break
    }

    // ── Updated (plan change, etc.) ──────────────────────────────────
    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription

      await supabase
        .from('subscriptions')
        .update({
          status:               sub.status as any,
          current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
          current_period_end:   new Date(sub.current_period_end   * 1000).toISOString(),
          stripe_price_id:      sub.items.data[0].price.id,
        })
        .eq('stripe_subscription_id', sub.id)
      break
    }
  }

  return NextResponse.json({ received: true })
}