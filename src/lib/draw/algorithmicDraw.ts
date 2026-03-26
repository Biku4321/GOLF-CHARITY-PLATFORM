// Weighted draw — based on user score frequency
interface ScoreFrequency {
  score:     number
  frequency: number
  weight:    number
}

export function buildFrequencyMap(allScores: number[]): ScoreFrequency[] {
  const freq: Record<number, number> = {}
  for (const s of allScores) {
    freq[s] = (freq[s] ?? 0) + 1
  }

  const total = allScores.length
  return Object.entries(freq).map(([score, count]) => ({
    score:     Number(score),
    frequency: count,
    weight:    count / total,
  })).sort((a, b) => b.frequency - a.frequency)
}

// Weighted random — more frequent scores have higher chance
export function runAlgorithmicDraw(
  allScores: number[],
  count = 5
): number[] {
  if (allScores.length < count) {
    // Fallback to random if not enough data
    return runRandomFallback(count)
  }

  const freqMap = buildFrequencyMap(allScores)
  const picked  = new Set<number>()
  const pool    = [...freqMap]

  while (picked.size < count && pool.length > 0) {
    const totalWeight = pool.reduce((s, f) => s + f.weight, 0)
    let   rand        = Math.random() * totalWeight

    for (let i = 0; i < pool.length; i++) {
      rand -= pool[i].weight
      if (rand <= 0) {
        picked.add(pool[i].score)
        pool.splice(i, 1)
        break
      }
    }
  }

  // Fill remaining with random if needed
  while (picked.size < count) {
    const r = Math.floor(Math.random() * 45) + 1
    picked.add(r)
  }

  return Array.from(picked).sort((a, b) => a - b)
}

function runRandomFallback(count: number): number[] {
  const numbers = new Set<number>()
  while (numbers.size < count) {
    numbers.add(Math.floor(Math.random() * 45) + 1)
  }
  return Array.from(numbers).sort((a, b) => a - b)
}