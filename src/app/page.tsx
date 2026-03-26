import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

async function getFeaturedCharity() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('charities')
    .select('name, description, image_url')
    .eq('is_featured', true)
    .eq('is_active', true)
    .single()
  return data
}

async function getStats() {
  const supabase = await createClient()
  const [{ count: subs }, { data: donations }] = await Promise.all([
    supabase.from('subscriptions').select('*', { count: 'exact', head: true })
      .eq('status', 'active'),
    supabase.from('donations').select('amount_pence').eq('status', 'completed'),
  ])
  const totalDonated = (donations ?? []).reduce((s, d) => s + d.amount_pence, 0)
  return { subs: subs ?? 0, totalDonated }
}

export default async function HomePage() {
  const [charity, stats] = await Promise.all([getFeaturedCharity(), getStats()])

  return (
    <div className="min-h-screen bg-paper font-sans text-ink">

      {/* ── NAV ── */}
      <nav className="sticky top-0 z-50 bg-paper/90 backdrop-blur-md border-b border-ink/10 px-8">
        <div className="max-w-[1100px] mx-auto flex items-center justify-between h-16">
          <span className="font-display text-[22px] font-bold text-emerald tracking-tight">
            GolfGives
          </span>
          <div className="flex items-center gap-8">
            {[
              { href: '/charities',    label: 'Charities'    },
              { href: '/how-it-works', label: 'How it works' },
            ].map(({ href, label }) => (
              <Link 
                key={href} 
                href={href} 
                className="text-sm text-ink/70 hover:text-ink transition-colors font-normal"
              >
                {label}
              </Link>
            ))}
            <Link 
              href="/login" 
              className="text-sm text-ink/70 hover:text-ink transition-colors"
            >
              Sign in
            </Link>
            <Link 
              href="/signup" 
              className="bg-emerald text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-emerald-dark transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="max-w-[1100px] mx-auto px-8 pt-[100px] pb-[80px] grid md:grid-cols-2 gap-16 items-center">
        <div className="animate-fade-up">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 bg-gold-light border border-gold/30 rounded-full px-4 py-1.5 mb-7">
            <span className="w-1.5 h-1.5 bg-gold rounded-full" />
            <span className="text-xs text-[#8a6a1a] font-medium">
              Golf · Charity · Monthly draws
            </span>
          </div>

          <h1 className="font-display text-[clamp(40px,5vw,64px)] leading-[1.1] font-bold text-ink mb-6 tracking-tight">
            Play the game.<br />
            <em className="text-emerald italic">Change a life.</em>
          </h1>

          <p className="text-lg text-ink/70 leading-relaxed mb-10 max-w-[460px]">
            A subscription platform where your golf scores enter you into
            monthly prize draws — while a portion of every subscription
            funds a charity you believe in.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link 
              href="/signup" 
              className="bg-emerald text-white text-base font-medium px-8 py-3.5 rounded-xl hover:bg-emerald-dark transition-colors inline-block"
            >
              Start for £9.99/mo
            </Link>
            <Link 
              href="/how-it-works" 
              className="border-[1.5px] border-ink/20 text-ink text-base font-medium px-8 py-3.5 rounded-xl hover:bg-ink/5 transition-colors inline-block"
            >
              How it works
            </Link>
          </div>

          {/* Trust bar */}
          <div className="mt-12 pt-8 border-t border-ink/10 flex gap-8">
            {[
              { value: stats.subs.toString(), label: 'Active members' },
              { value: `£${(stats.totalDonated / 100).toFixed(0)}`, label: 'Donated to charity' },
              { value: 'Monthly', label: 'Prize draws' },
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="font-display text-2xl font-bold text-emerald leading-none">
                  {value}
                </p>
                <p className="text-xs text-ink/50 mt-1">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Hero visual */}
        <div className="relative animate-fade-up delay-200">
          <div className="bg-emerald rounded-3xl p-10 relative overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute -top-16 -right-16 w-60 h-60 bg-white/5 rounded-full" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/5 rounded-full" />

            {/* Score card mockup */}
            <div className="bg-white/10 rounded-xl p-3 mb-4 border border-white/15 backdrop-blur-sm relative z-10">
              <p className="text-[11px] text-white/60 mb-2">Your last 5 scores</p>
              <div className="flex gap-2">
                {[38, 34, 41, 36, 39].map((s, i) => (
                  <div 
                    key={i} 
                    className={`flex-1 rounded-lg p-2 text-center ${
                      i === 0 ? 'bg-white/20 border border-white/30' : 'bg-white/10'
                    }`}
                  >
                    <p className="font-display text-xl font-bold text-white">{s}</p>
                    <p className="text-[9px] text-white/50 mt-0.5">
                      {i === 0 ? 'Latest' : `R${5-i}`}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Draw ball */}
            <div className="bg-white/10 rounded-xl p-4 mb-4 border border-white/15 backdrop-blur-sm relative z-10">
              <p className="text-[11px] text-white/60 mb-3">This month's draw</p>
              <div className="flex gap-2 justify-center">
                {[14, 27, 36, 38, 41].map(n => (
                  <div 
                    key={n} 
                    className="w-10 h-10 bg-gold rounded-full flex items-center justify-center font-display font-bold text-sm text-[#3d2a00]"
                  >
                    {n}
                  </div>
                ))}
              </div>
            </div>

            {/* Winner badge */}
            <div className="bg-gold rounded-xl p-3 flex items-center gap-3 relative z-10">
              <div className="w-9 h-9 rounded-full bg-black/15 flex items-center justify-center font-display font-bold text-[#3d2a00] text-sm">
                J
              </div>
              <div>
                <p className="text-[13px] font-medium text-[#3d2a00]">
                  James won £420 this month
                </p>
                <p className="text-[11px] text-[#3d2a00]/60">
                  5-number match · January draw
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="bg-ink px-8 py-[100px]">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs text-gold tracking-[3px] font-medium uppercase mb-4">
              Simple by design
            </p>
            <h2 className="font-display text-[clamp(32px,4vw,48px)] text-white font-bold tracking-tight">
              Four steps to playing for good
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[2px]">
            {[
              {
                num: '01', title: 'Subscribe',
                desc: 'Choose monthly or yearly. A portion goes to charity, the rest enters the prize pool.',
                color: 'text-emerald',
              },
              {
                num: '02', title: 'Enter scores',
                desc: 'Log your last 5 Stableford scores (1–45) after each round. Simple and quick.',
                color: 'text-emerald',
              },
              {
                num: '03', title: 'Join the draw',
                desc: 'Your scores become your draw numbers. Match 3, 4, or all 5 to win prizes.',
                color: 'text-gold',
              },
              {
                num: '04', title: 'Give back',
                desc: 'Every subscription funds your chosen charity. Play golf, change lives.',
                color: 'text-gold',
              },
            ].map(({ num, title, desc, color }, i) => (
              <div 
                key={num} 
                className={`bg-white/5 p-10 ${i !== 0 ? 'border-t lg:border-t-0 lg:border-l border-white/5' : ''}`}
              >
                <p className={`font-display text-5xl font-bold opacity-30 leading-none mb-6 ${color}`}>
                  {num}
                </p>
                <h3 className="font-display text-[22px] text-white font-bold mb-3">{title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CHARITY IMPACT ── */}
      <section className="px-8 py-[100px]">
        <div className="max-w-[1100px] mx-auto grid md:grid-cols-2 gap-20 items-center">
          <div>
            <p className="text-xs text-emerald tracking-[3px] font-medium uppercase mb-4">
              Charity impact
            </p>
            <h2 className="font-display text-[clamp(28px,3.5vw,44px)] font-bold leading-[1.15] tracking-tight mb-6">
              Your subscription<br />
              <em className="text-emerald italic">funds real change</em>
            </h2>
            <p className="text-base text-ink/70 leading-relaxed mb-8">
              At least 10% of every subscription goes directly to the charity
              you choose. You can increase this percentage anytime — and make
              additional one-off donations independent of your plan.
            </p>
            <div className="flex flex-col gap-4">
              {[
                'Choose from our curated charity directory',
                'See upcoming charity golf events',
                'Increase your contribution % anytime',
                'Make independent donations anytime',
              ].map(item => (
                <div key={item} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-light flex items-center justify-center shrink-0">
                    <span className="text-emerald text-[11px] font-bold">✓</span>
                  </div>
                  <span className="text-sm text-ink/70">{item}</span>
                </div>
              ))}
            </div>
            <Link 
              href="/charities" 
              className="inline-block mt-8 border-[1.5px] border-emerald text-emerald hover:bg-emerald hover:text-white transition-colors text-sm font-medium px-6 py-2.5 rounded-lg"
            >
              Browse charities →
            </Link>
          </div>

          {/* Featured charity card */}
          {charity ? (
            <div className="bg-emerald-light rounded-3xl p-10 border border-emerald/15">
              <p className="text-[11px] text-emerald font-medium uppercase tracking-widest mb-5">
                Featured charity
              </p>
              {charity.image_url && (
                <img 
                  src={charity.image_url} 
                  alt={charity.name}
                  className="w-full h-[180px] object-cover rounded-xl mb-5"
                />
              )}
              <h3 className="font-display text-2xl font-bold text-ink mb-2.5">
                {charity.name}
              </h3>
              <p className="text-sm text-ink/70 leading-relaxed mb-5">
                {charity.description}
              </p>
              <Link 
                href="/charities" 
                className="bg-emerald text-white hover:bg-emerald-dark transition-colors text-[13px] font-medium px-5 py-2.5 rounded-lg inline-block"
              >
                Support this charity
              </Link>
            </div>
          ) : (
            <div className="bg-emerald-light rounded-3xl p-10 border border-emerald/15 flex items-center justify-center min-h-[320px]">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-emerald mx-auto mb-4 flex items-center justify-center text-white text-2xl">
                  ♡
                </div>
                <p className="font-display text-xl font-bold text-ink">
                  Choose your cause
                </p>
                <p className="text-[13px] text-ink/50 mt-2">
                  Browse our charity directory
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── PRIZE POOL ── */}
      <section className="bg-[#f2efe9] border-y border-ink/5 px-8 py-[100px]">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs text-gold tracking-[3px] uppercase font-medium mb-4">
              Monthly draws
            </p>
            <h2 className="font-display text-[clamp(28px,4vw,44px)] font-bold tracking-tight">
              Three ways to win every month
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                match: '5 numbers',
                pool:  '40% of pool',
                badge: 'Jackpot',
                note:  'Rolls over if unclaimed',
                bg:    'bg-emerald',
                text:  'text-white',
                sub:   'text-white/60',
                badgeBg: 'bg-white/15 text-white',
              },
              {
                match: '4 numbers',
                pool:  '35% of pool',
                badge: 'Major prize',
                note:  'Split among winners',
                bg:    'bg-paper',
                text:  'text-ink',
                sub:   'text-ink/50',
                badgeBg: 'bg-gold-light text-[#8a6a1a]',
              },
              {
                match: '3 numbers',
                pool:  '25% of pool',
                badge: 'Prize',
                note:  'Split among winners',
                bg:    'bg-paper',
                text:  'text-ink',
                sub:   'text-ink/50',
                badgeBg: 'bg-gold-light text-[#8a6a1a]',
              },
            ].map(({ match, pool, badge, note, bg, text, sub, badgeBg }) => (
              <div 
                key={match} 
                className={`${bg} rounded-2xl p-8 border border-ink/10`}
              >
                <span className={`inline-block ${badgeBg} text-[11px] font-semibold px-3 py-1 rounded-full mb-5 uppercase tracking-wide`}>
                  {badge}
                </span>
                <p className={`font-display text-2xl font-bold ${text} mb-1`}>{match}</p>
                <p className={`font-display text-lg ${text} opacity-70 mb-4`}>{pool}</p>
                <p className={`text-[13px] ${sub}`}>{note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="px-8 py-[100px]">
        <div className="max-w-[800px] mx-auto text-center">
          <p className="text-xs text-emerald tracking-[3px] uppercase font-medium mb-4">Pricing</p>
          <h2 className="font-display text-[clamp(28px,4vw,44px)] font-bold tracking-tight mb-12">
            Simple, transparent pricing
          </h2>

          <div className="grid md:grid-cols-2 gap-4 text-left">
            {[
              {
                name: 'Monthly',
                price: '£9.99',
                per: '/month',
                sub: 'Cancel anytime',
                featured: false,
                features: [
                  'Monthly draw entry',
                  '5-score tracking',
                  'Charity contribution (10%+)',
                  'Full dashboard',
                ],
              },
              {
                name: 'Yearly',
                price: '£89.99',
                per: '/year',
                sub: 'Save £29.89 vs monthly',
                featured: true,
                features: [
                  'Everything in monthly',
                  '12 draws guaranteed',
                  'Priority winner processing',
                  'Higher charity impact',
                ],
              },
            ].map(({ name, price, per, sub, featured, features }) => (
              <div 
                key={name} 
                className={`${featured ? 'bg-ink border-2 border-emerald' : 'bg-paper border-[1.5px] border-ink/10'} rounded-2xl p-9`}
              >
                {featured && (
                  <span className="inline-block bg-gold text-[#3d2a00] text-[11px] font-semibold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">
                    Most popular
                  </span>
                )}
                <p className={`text-sm font-medium ${featured ? 'text-white/60' : 'text-ink/50'} mb-1`}>
                  {name}
                </p>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className={`font-display text-[40px] font-bold ${featured ? 'text-white' : 'text-ink'}`}>
                    {price}
                  </span>
                  <span className={`text-sm ${featured ? 'text-white/40' : 'text-ink/50'}`}>
                    {per}
                  </span>
                </div>
                <p className={`text-xs font-medium ${featured ? 'text-gold' : 'text-emerald'} mb-6`}>
                  {sub}
                </p>

                <div className="flex flex-col gap-2.5 mb-7">
                  {features.map(f => (
                    <div key={f} className="flex gap-2.5 items-center">
                      <span className={`${featured ? 'text-gold' : 'text-emerald'} font-bold text-sm`}>✓</span>
                      <span className={`text-sm ${featured ? 'text-white/70' : 'text-ink/70'}`}>{f}</span>
                    </div>
                  ))}
                </div>

                <Link 
                  href="/signup" 
                  className={`block text-center text-sm font-medium px-6 py-3 rounded-xl transition-colors ${
                    featured 
                      ? 'bg-emerald text-white hover:bg-emerald-dark' 
                      : 'bg-transparent border-[1.5px] border-ink/20 text-ink hover:bg-ink/5'
                  }`}
                >
                  Get started →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-emerald px-8 py-[100px]">
        <div className="max-w-[700px] mx-auto text-center">
          <h2 className="font-display text-[clamp(32px,5vw,56px)] font-bold text-white tracking-tight leading-[1.1] mb-6">
            Ready to play for<br />
            <em className="text-gold">something bigger?</em>
          </h2>
          <p className="text-lg text-white/65 leading-relaxed mb-10">
            Join golfers who are turning their rounds into real charitable impact —
            while competing for monthly prizes.
          </p>
          <Link 
            href="/signup" 
            className="inline-block bg-gold text-[#3d2a00] hover:bg-[#e0bc55] transition-colors text-base font-semibold px-10 py-4 rounded-xl"
          >
            Start your subscription →
          </Link>
          <p className="text-[13px] text-white/40 mt-4">
            Secured by Stripe · Cancel anytime · No hidden fees
          </p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-ink px-8 py-12 border-t border-white/5">
        <div className="max-w-[1100px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <span className="font-display text-xl font-bold text-emerald">
            GolfGives
          </span>
          <div className="flex flex-wrap justify-center gap-8">
            {[
              { href: '/charities',    label: 'Charities'    },
              { href: '/how-it-works', label: 'How it works' },
              { href: '/login',        label: 'Sign in'      },
              { href: '/signup',       label: 'Get started'  },
            ].map(({ href, label }) => (
              <Link 
                key={href} 
                href={href} 
                className="text-[13px] text-white/40 hover:text-white transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>
          <p className="text-xs text-white/25">
            © {new Date().getFullYear()} GolfGives
          </p>
        </div>
      </footer>

    </div>
  )
}