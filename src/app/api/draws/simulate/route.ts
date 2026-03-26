import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { runRandomDraw } from '@/lib/draw/randomDraw'
import { runAlgorithmicDraw } from '@/lib/draw/algorithmicDraw'
import { countMatches, getMatchType, calculatePrizePools } from '@/lib/draw/prizePool'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  // Admin only
  const { data: profile } = await supabase
    .from('profiles').select('role').eq('auth_user_id', user.id).single()
  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { draw_id } = await req.json()

  // Get draw
  const { data: draw } = await supabase
    .from('draws').select('*').eq('id', draw_id).single()
  if (!draw) return NextResponse.json({ error: 'Draw not found' }, { status: 404 })

  // Get all entries
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

  // Collect all scores for algorithmic draw
  const allScores: number[] = []
  for (const e of entries ?? []) {
    [e.score_1, e.score_2, e.score_3, e.score_4, e.score_5]
      .forEach(s => s && allScores.push(s))
  }

  // Run draw logic
  const drawnNumbers = draw.logic_type === 'algorithmic'
    ? runAlgorithmicDraw(allScores)
    : runRandomDraw()

  // Find winners
  const winners: Record<string, { userId: string; matchType: string; matchCount: number }[]> = {
    five_match:  [],
    four_match:  [],
    three_match: [],
  }

  for (const entry of entries ?? []) {
    const userNums   = [entry.score_1, entry.score_2, entry.score_3, entry.score_4, entry.score_5]
      .filter(Boolean) as number[]
    const matchCount = countMatches(userNums, drawnNumbers)
    const matchType  = getMatchType(matchCount)
    if (matchType) {
      winners[matchType].push({ userId: entry.user_id, matchType, matchCount })
    }
  }

  const { jackpotPool, fourPool, threePool } = calculatePrizePools(
    draw.prize_pool_total,
    draw.jackpot_carry_forward
  )

  return NextResponse.json({
    drawn_numbers:   drawnNumbers,
    total_entries:   entries?.length ?? 0,
    prize_pools: {
      five_match:  jackpotPool,
      four_match:  fourPool,
      three_match: threePool,
    },
    winners: {
      five_match:  winners.five_match,
      four_match:  winners.four_match,
      three_match: winners.three_match,
    },
    jackpot_rolls_over: winners.five_match.length === 0,
  })
}