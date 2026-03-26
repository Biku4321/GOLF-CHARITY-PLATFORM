export default function HowItWorksPage() {
  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-semibold mb-8">How it works</h1>

        <div className="space-y-4">
          {[
            { step: '01', title: 'Subscribe', desc: 'Choose monthly or yearly plan. Part of your fee goes to charity.' },
            { step: '02', title: 'Enter your scores', desc: 'Log your last 5 Stableford scores after each round.' },
            { step: '03', title: 'Enter the draw', desc: 'Your scores automatically enter you into the monthly draw.' },
            { step: '04', title: 'Win prizes', desc: 'Match 3, 4, or 5 numbers to win from the prize pool.' },
          ].map(({ step, title, desc }) => (
            <div key={step} className="bg-white rounded-xl border border-gray-200 p-5 flex gap-4">
              <span className="text-2xl font-semibold text-emerald-600 w-10 shrink-0">{step}</span>
              <div>
                <h3 className="font-semibold mb-1">{title}</h3>
                <p className="text-sm text-gray-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}