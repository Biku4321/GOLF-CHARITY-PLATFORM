// import Stripe from 'stripe'

// export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//   apiVersion: '2024-06-20',
//  // typescript: true,
// })

import Stripe from 'stripe'

// typescript: true was removed in Stripe SDK v16 — types are now always included.
// apiVersion bumped to latest stable to keep webhook event shapes in sync.
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia' as any,
})