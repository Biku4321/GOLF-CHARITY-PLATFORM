export function drawResultEmail(params: {
  userName:     string
  drawTitle:    string
  numbers:      number[]
  hasWon:       boolean
  matchType?:   string
  prizeAmount?: number
}) {
  const { userName, drawTitle, numbers, hasWon, matchType, prizeAmount } = params

  return `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px">
      <h2 style="color:#059669">Golf Charity Platform</h2>
      <h3>${drawTitle} — Results</h3>
      <p>Hi ${userName},</p>
      <p>The monthly draw has been completed. The winning numbers were:</p>
      <div style="display:flex;gap:8px;margin:16px 0">
        ${numbers.map(n => `
          <span style="
            width:40px;height:40px;background:#d1fae5;color:#065f46;
            border-radius:50%;display:inline-flex;align-items:center;
            justify-content:center;font-weight:bold;font-size:16px
          ">${n}</span>
        `).join('')}
      </div>
      ${hasWon ? `
        <div style="background:#d1fae5;border-radius:8px;padding:16px;margin:16px 0">
          <p style="color:#065f46;font-weight:bold;margin:0">
            🎉 Congratulations! You won!
          </p>
          <p style="color:#047857;margin:8px 0 0">
            Match type: ${matchType?.replace('_', ' ')}<br/>
            Prize: £${((prizeAmount ?? 0) / 100).toFixed(2)}
          </p>
        </div>
        <p>Please log in to submit your verification proof to claim your prize.</p>
      ` : `
        <p>Unfortunately you didn't win this month. Better luck next draw!</p>
      `}
      <p style="color:#6b7280;font-size:12px;margin-top:24px">
        Golf Charity Platform · Unsubscribe
      </p>
    </div>
  `
}
