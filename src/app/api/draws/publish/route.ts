import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { runRandomDraw } from '@/lib/draw/randomDraw'
import { runAlgorithmicDraw } from '@/lib/draw/algorithmicDraw'
import {
  countMatches, getMatchType,
  calculatePrizePools, calculatePrizePerWinner
} from '@/lib/draw/prizePool'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('auth_user_id', user.id).single()
  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { draw_id } = await req.json()

  const { data: draw } = await supabase
    .from('draws').select('*').eq('id', draw_id).single()
  if (!draw) return NextResponse.json({ error: 'Draw not found' }, { status: 404 })

  // 1. Get all active subscribers
  const { data: activeSubs } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('status', 'active')

  const activeUserIds = activeSubs?.map(s => s.user_id) || []

  // 2. Fetch all scores for active users, ordered by newest first
  const { data: rawScores } = await supabase
    .from('scores')
    .select('user_id, stableford_score')
    .in('user_id', activeUserIds)
    .order('score_date', { ascending: false })

  // 3. Group the latest 5 scores per user to create their automatic entry
  const userEntries = new Map<string, number[]>()
  for (const row of rawScores ?? []) {
    const userScores = userEntries.get(row.user_id) || []
    if (userScores.length < 5) {
      userScores.push(row.stableford_score)
      userEntries.set(row.user_id, userScores)
    }
  }

  // 4. Map to the expected entries format
  const entries = Array.from(userEntries.entries()).map(([user_id, scores]) => ({
    user_id,
    score_1: scores[0] || null,
    score_2: scores[1] || null,
    score_3: scores[2] || null,
    score_4: scores[3] || null,
    score_5: scores[4] || null,
  }))

  const allScores: number[] = []
  for (const e of entries ?? []) {
    [e.score_1, e.score_2, e.score_3, e.score_4, e.score_5]
      .forEach(s => s && allScores.push(s))
  }

  const drawnNumbers = draw.logic_type === 'algorithmic'
    ? runAlgorithmicDraw(allScores)
    : runRandomDraw()

  const winnerMap: Record<string, string[]> = {
    five_match: [], four_match: [], three_match: []
  }

  for (const entry of entries ?? []) {
    const userNums   = [entry.score_1, entry.score_2, entry.score_3,
                        entry.score_4, entry.score_5].filter(Boolean) as number[]
    const matchCount = countMatches(userNums, drawnNumbers)
    const matchType  = getMatchType(matchCount)
    if (matchType) winnerMap[matchType].push(entry.user_id)
  }

  const { jackpotPool, fourPool, threePool } = calculatePrizePools(
    draw.prize_pool_total, draw.jackpot_carry_forward
  )

  const jackpotRollsOver = winnerMap.five_match.length === 0

  // Insert draw results
  const results = []

  for (const [matchType, userIds] of Object.entries(winnerMap)) {
    const pool = matchType === 'five_match' ? jackpotPool
               : matchType === 'four_match' ? fourPool : threePool

    const { data: result } = await supabase
      .from('draw_results')
      .insert({
        draw_id,
        match_type:          matchType,
        winning_numbers:     drawnNumbers,
        matched_count:       matchType === 'five_match' ? 5 : matchType === 'four_match' ? 4 : 3,
        prize_amount:        pool,
        winner_count:        userIds.length,
        prize_per_winner:    calculatePrizePerWinner(pool, userIds.length),
        jackpot_rolled_over: matchType === 'five_match' && jackpotRollsOver,
      })
      .select().single()

    if (result) {
      results.push(result)
      // Create winner claims
      for (const userId of userIds) {
        await supabase.from('winner_claims').insert({
          draw_result_id: result.id,
          user_id:        userId,
          payout_amount:  calculatePrizePerWinner(pool, userIds.length),
          status:         'pending',
        })
      }
    }
  }

  // Update draw status + jackpot rollover
  await supabase.from('draws').update({
    status:       'published',
    published_at: new Date().toISOString(),
    ...(jackpotRollsOver && {
      jackpot_carry_forward: (draw.jackpot_carry_forward ?? 0) + jackpotPool
    })
  }).eq('id', draw_id)

  return NextResponse.json({
    success:        true,
    drawn_numbers:  drawnNumbers,
    results,
    jackpot_rolled: jackpotRollsOver,
  })
}