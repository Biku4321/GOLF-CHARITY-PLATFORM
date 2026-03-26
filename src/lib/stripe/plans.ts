export const PLANS = {
  monthly: {
    name: 'Monthly',
    priceId: process.env.STRIPE_MONTHLY_PRICE_ID!,
    amount: 999,          // £9.99 in pence
    interval: 'month',
    charityMin: 10,       // 10% min charity
    prizePoolShare: 60,   // 60% goes to prize pool
  },
  yearly: {
    name: 'Yearly',
    priceId: process.env.STRIPE_YEARLY_PRICE_ID!,
    amount: 8999,         // £89.99 in pence (save ~25%)
    interval: 'year',
    charityMin: 10,
    prizePoolShare: 60,
  },
} as const

export type PlanType = keyof typeof PLANS

// Prize pool split per PDF spec
export const PRIZE_POOL_SPLIT = {
  five_match:   0.40,   // 40% jackpot
  four_match:   0.35,   // 35%
  three_match:  0.25,   // 25%
} as const

export function calculatePrizePool(activeSubs: number, planType: PlanType) {
  const plan        = PLANS[planType]
  const totalPool   = Math.floor(activeSubs * plan.amount * (plan.prizePoolShare / 100))
  return {
    total:      totalPool,
    five_match:  Math.floor(totalPool * PRIZE_POOL_SPLIT.five_match),
    four_match:  Math.floor(totalPool * PRIZE_POOL_SPLIT.four_match),
    three_match: Math.floor(totalPool * PRIZE_POOL_SPLIT.three_match),
  }
}

export function calculateCharity(amount: number, percentage: number) {
  return Math.floor(amount * (percentage / 100))
}