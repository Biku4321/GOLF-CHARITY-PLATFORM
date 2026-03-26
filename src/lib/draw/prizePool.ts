export const PRIZE_SPLIT = {
  five_match:  0.40,
  four_match:  0.35,
  three_match: 0.25,
} as const

export type MatchType = keyof typeof PRIZE_SPLIT

// How many numbers match between user entry and drawn numbers
export function countMatches(
  userNumbers:  number[],
  drawnNumbers: number[]
): number {
  const drawnSet = new Set(drawnNumbers)
  return userNumbers.filter(n => drawnSet.has(n)).length
}

export function getMatchType(matchCount: number): MatchType | null {
  if (matchCount >= 5) return 'five_match'
  if (matchCount === 4) return 'four_match'
  if (matchCount === 3) return 'three_match'
  return null
}

export function calculatePrizePools(
  totalPool:          number,
  jackpotCarryForward = 0
) {
  const jackpotPool = Math.floor(totalPool * PRIZE_SPLIT.five_match) + jackpotCarryForward
  const fourPool    = Math.floor(totalPool * PRIZE_SPLIT.four_match)
  const threePool   = Math.floor(totalPool * PRIZE_SPLIT.three_match)

  return { jackpotPool, fourPool, threePool }
}

export function calculatePrizePerWinner(
  poolAmount:   number,
  winnerCount:  number
): number {
  if (winnerCount === 0) return 0
  return Math.floor(poolAmount / winnerCount)
}