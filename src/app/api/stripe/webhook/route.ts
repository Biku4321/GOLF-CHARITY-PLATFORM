import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16' as any,
})

// Initialize Supabase Service Role Client (Bypasses RLS for secure webhook operations)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature') as string

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  try {
    switch (event.type) {
      // ── Checkout completed → activate subscription ──────────────────
      case 'checkout.session.completed': {
        const session: any = event.data.object
        if (session.mode !== 'subscription') break

        const userId = session.metadata?.supabase_user_id
        const stripeSubId = session.subscription

        if (!userId || !stripeSubId) break

        const stripeSub: any = await stripe.subscriptions.retrieve(stripeSubId)
        const planType = stripeSub.items.data[0].price.lookup_key || 'monthly'

        const { data: subRecord } = await supabase
          .from('subscriptions')
          .upsert({
            user_id: userId,
            status: 'active',
            plan_type: planType,
            stripe_customer_id: session.customer,
            stripe_subscription_id: stripeSubId,
            stripe_price_id: stripeSub.items.data[0].price.id,
            current_period_start: new Date(stripeSub.current_period_start * 1000).toISOString(),
            current_period_end: new Date(stripeSub.current_period_end * 1000).toISOString(),
            cancel_at_end: stripeSub.cancel_at_period_end
          } as any, { onConflict: 'user_id' })
          .select()
          .single()

        // Get profile for charity
        const { data: profile } = await supabase
          .from('profiles')
          .select('selected_charity_id, charity_percentage')
          .eq('id', userId)
          .single()

        // Auto-create charity donation record
        if (profile?.selected_charity_id && subRecord) {
          const importedPlans: any = (await import('@/lib/stripe/plans')).PLANS
          const plan = importedPlans[planType as string] || importedPlans['monthly']
          
          const charityPct = profile.charity_percentage || 10
          const donationAmt = Math.round((plan.amount * charityPct) / 100)

          await supabase.from('donations').insert({
            user_id: userId,
            charity_id: profile.selected_charity_id,
            subscription_id: subRecord.id,
            amount_pence: donationAmt,
            status: 'completed'
          } as any)
        }
        break
      }

      // ── Invoice paid → renew subscription ──────────────────────────
      case 'invoice.payment_succeeded': {
        const invoice: any = event.data.object
        if (invoice.billing_reason !== 'subscription_cycle') break

        const stripeSubId = invoice.subscription
        if (!stripeSubId) break

        const stripeSub: any = await stripe.subscriptions.retrieve(stripeSubId)

        await supabase
          .from('subscriptions')
          .update({
            status: 'active',
            current_period_start: new Date(stripeSub.current_period_start * 1000).toISOString(),
            current_period_end: new Date(stripeSub.current_period_end * 1000).toISOString(),
          } as any)
          .eq('stripe_subscription_id', stripeSubId)
        break
      }

      // ── Subscription updated or deleted ────────────────────────────
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const stripeSub: any = event.data.object

        await supabase
          .from('subscriptions')
          .update({
            status: stripeSub.status,
            cancel_at_end: stripeSub.cancel_at_period_end,
            current_period_start: new Date(stripeSub.current_period_start * 1000).toISOString(),
            current_period_end: new Date(stripeSub.current_period_end * 1000).toISOString(),
          } as any)
          .eq('stripe_subscription_id', stripeSub.id)
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (err: any) {
    console.error('Webhook error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}