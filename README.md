# GolfGives — Play Golf. Give Back. Win Prizes.

> A full-stack subscription platform where golfers track scores, support charities, and compete in monthly prize draws — all in one place.

---

## What is GolfGives?

GolfGives connects three things golfers already care about: **the game**, **giving back**, and **winning something**. Members subscribe, log their last five Stableford scores after each round, and those scores automatically become their monthly draw numbers. A slice of every subscription goes directly to a charity of their choosing. Match three, four, or all five numbers — and win a share of the prize pool.

No lottery tickets. No separate charity donations. No manual entry. Just play golf.

---

## Feature Overview

### For Members
- **Subscription plans** — monthly (£9.99) or yearly (£89.99), managed through Stripe Checkout
- **Score tracking** — rolling window of the last 5 Stableford scores (1–45), enforced by a DB trigger
- **Draw entry** — 5 scores become 5 draw numbers; submit them once per draw from the dashboard
- **Three prize tiers** — match 3 (25%), 4 (35%), or 5 numbers (40% jackpot that rolls over if unclaimed)
- **Charity selection** — choose from a curated directory; set contribution percentage (10–100%); donate independently at any time
- **Winnings dashboard** — see all claims, statuses, and payout history
- **Winner verification** — submit screenshot proof of scores to claim a prize

### For Admins
- **Draw management** — create draws, configure random or algorithmic logic, publish results
- **Two draw algorithms** — standard random lottery, or a weighted draw based on real score frequency across all users
- **User management** — view all users, assign roles, inspect subscriptions
- **Charity management** — add/edit charities, set featured charity, toggle active status
- **Winner review** — approve or reject winner claims with admin notes
- **Reports** — subscription revenue, donation totals, draw history

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| Database & Auth | Supabase (PostgreSQL + Row Level Security) |
| Payments | Stripe (Checkout Sessions + Webhooks) |
| Email | Nodemailer (SMTP) |
| File uploads | UploadThing |
| State | Zustand |
| Forms | React Hook Form + Zod |
| Animation | Framer Motion |
| Charts | Recharts |

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/               # Login, signup, forgot-password pages
│   ├── (dashboard)/          # Member-facing dashboard, scores, draws, charity, settings
│   ├── (admin)/              # Admin panel — users, draws, charities, winners, reports
│   ├── api/
│   │   ├── auth/             # login · logout · signup · callback
│   │   ├── draws/            # GET draws · POST create · POST enter · publish · simulate
│   │   ├── scores/           # GET/POST user scores
│   │   ├── subscriptions/    # create · cancel · status
│   │   ├── stripe/webhook/   # Stripe event handler (checkout, renewal, cancellation)
│   │   ├── charities/        # CRUD for charity directory
│   │   ├── winners/          # claim · verify · payout
│   │   ├── donations/        # one-off donations
│   │   ├── profile/          # charity preference updates
│   │   └── admin/            # reports · user role management
│   ├── charities/            # Public charity directory
│   ├── how-it-works/         # Marketing page
│   ├── subscribe/            # Plan selection page
│   └── page.tsx              # Landing page
│
├── components/
│   ├── admin/                # DrawConfigForm, PayoutTable, WinnerVerifyCard, UserTable, ReportsChart
│   ├── charity/              # CharityCard, CharityProfile, CharitySearch, ContributionSlider
│   ├── dashboard/            # CharityWidget, DrawParticipationWidget, ScoreWidget, SubscriptionWidget, WinningsWidget
│   ├── draws/                # DrawCard, DrawNumberDisplay, DrawResultCard, DrawSimulator
│   ├── home/                 # HeroSection, HowItWorksSection, PricingSection, CharityImpactSection
│   ├── layout/               # Navbar, Footer, DashboardSidebar, AdminSidebar, MobileNav
│   ├── scores/               # ScoreEntryForm, ScoreCard, ScoreList
│   ├── subscription/         # PlanCard, StripeCheckout, SubscriptionStatus
│   └── ui/                   # Badge, Button, Card, Input, Modal, ProgressBar, Select, Spinner, Tabs, Toast
│
├── hooks/
│   ├── useAuth.ts            # Auth state, login, logout, signup
│   ├── useCharity.ts         # Charity data fetching
│   ├── useDraw.ts            # Draw listing and entry
│   ├── useScores.ts          # Score CRUD
│   └── useSubscription.ts    # Subscription status
│
├── lib/
│   ├── draw/
│   │   ├── randomDraw.ts        # Standard lottery (uniform random, no repeats)
│   │   ├── algorithmicDraw.ts   # Weighted draw — frequency-proportional probability
│   │   └── prizePool.ts         # Match counting, prize tier calc, per-winner split
│   ├── email/
│   │   ├── sendEmail.ts         # Nodemailer transport wrapper
│   │   └── templates/           # drawResult · winnerAlert · systemUpdate
│   ├── stripe/
│   │   ├── client.ts            # Stripe SDK instance
│   │   └── plans.ts             # Plan config, prize pool split constants, helpers
│   ├── supabase/
│   │   ├── client.ts            # Browser client (createBrowserClient)
│   │   ├── server.ts            # Server client (createServerClient + cookies)
│   │   └── middleware.ts        # Supabase SSR helpers
│   ├── utils.ts                 # cn(), formatPence(), formatDate(), getInitials(), clamp()
│   └── validations/
│       ├── authSchema.ts        # Login, signup, forgot-password Zod schemas
│       ├── scoreSchema.ts       # Score entry validation
│       └── charitySchema.ts     # Charity create/update validation
│
├── middleware.ts             # Route protection — auth guard + admin role check
│
├── store/
│   ├── authStore.ts          # Zustand — user, profile, isAdmin, isSubscribed
│   └── uiStore.ts            # Zustand — toasts, sidebar, modal
│
└── types/
    ├── user.ts · draw.ts · score.ts · subscription.ts · charity.ts · winner.ts
```

---

## Getting Started

### Prerequisites

- Node.js 18 or later
- A [Supabase](https://supabase.com) project with the schema below applied
- A [Stripe](https://stripe.com) account with two recurring Price IDs (monthly + yearly)
- An SMTP server for email (Gmail, Resend, Postmark, etc.)

### 1. Clone and install

```bash
git clone https://github.com/your-org/golf-charity-platform.git
cd golf-charity-platform
npm install
```

### 2. Configure environment

```bash
cp .env.local .env.local.real   # keep a backup of the template
```

Fill in `.env.local` — see [Environment Variable Reference](#environment-variable-reference) below for every key.

### 3. Apply the database schema

Run the following in your Supabase SQL editor:

```sql
-- Profiles (created by trigger on auth.users insert)
create table profiles (
  id                  uuid primary key default gen_random_uuid(),
  auth_user_id        uuid unique references auth.users(id) on delete cascade,
  full_name           text,
  email               text,
  role                text not null default 'user' check (role in ('user','admin')),
  selected_charity_id uuid,
  charity_percentage  int not null default 10 check (charity_percentage between 10 and 100),
  avatar_url          text,
  created_at          timestamptz default now()
);

-- Charities
create table charities (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text unique not null,
  description text,
  image_url   text,
  website_url text,
  is_featured boolean default false,
  is_active   boolean default true,
  created_at  timestamptz default now()
);

alter table profiles
  add constraint fk_charity foreign key (selected_charity_id) references charities(id);

-- Subscriptions
create table subscriptions (
  id                      uuid primary key default gen_random_uuid(),
  user_id                 uuid unique references profiles(id) on delete cascade,
  plan_type               text not null check (plan_type in ('monthly','yearly')),
  status                  text not null default 'inactive',
  stripe_customer_id      text,
  stripe_subscription_id  text,
  stripe_price_id         text,
  current_period_start    timestamptz,
  current_period_end      timestamptz,
  cancelled_at            timestamptz,
  created_at              timestamptz default now()
);

-- Scores (rolling 5 per user)
create table scores (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid references profiles(id) on delete cascade,
  stableford_score int not null check (stableford_score between 1 and 45),
  score_date       date not null,
  created_at       timestamptz default now()
);

-- Trigger: keep only the 5 most recent scores per user
create or replace function enforce_rolling_scores() returns trigger language plpgsql as $$
begin
  delete from scores
  where user_id = new.user_id
    and id not in (
      select id from scores where user_id = new.user_id
      order by score_date desc, created_at desc
      limit 5
    );
  return new;
end;
$$;

create trigger rolling_scores_trigger
  after insert on scores
  for each row execute procedure enforce_rolling_scores();

-- Draws
create table draws (
  id                    uuid primary key default gen_random_uuid(),
  title                 text not null,
  draw_date             date not null,
  status                text not null default 'upcoming'
                          check (status in ('upcoming','live','published','cancelled')),
  logic_type            text not null default 'random'
                          check (logic_type in ('random','algorithmic')),
  prize_pool_total      int not null default 0,
  jackpot_carry_forward int not null default 0,
  published_at          timestamptz,
  created_at            timestamptz default now()
);

-- Draw entries (one per user per draw, upsertable)
create table draw_entries (
  id         uuid primary key default gen_random_uuid(),
  draw_id    uuid references draws(id) on delete cascade,
  user_id    uuid references profiles(id) on delete cascade,
  score_1    int, score_2 int, score_3 int, score_4 int, score_5 int,
  entered_at timestamptz default now(),
  unique (draw_id, user_id)
);

-- Draw results (one row per match tier per draw)
create table draw_results (
  id                  uuid primary key default gen_random_uuid(),
  draw_id             uuid references draws(id) on delete cascade,
  match_type          text not null
                        check (match_type in ('five_match','four_match','three_match')),
  winning_numbers     int[] not null,
  matched_count       int not null,
  prize_amount        int not null,
  winner_count        int not null default 0,
  prize_per_winner    int not null default 0,
  jackpot_rolled_over boolean default false,
  created_at          timestamptz default now()
);

-- Winner claims
create table winner_claims (
  id             uuid primary key default gen_random_uuid(),
  draw_result_id uuid references draw_results(id) on delete cascade,
  user_id        uuid references profiles(id) on delete cascade,
  payout_amount  int not null,
  status         text not null default 'pending'
                   check (status in ('pending','proof_submitted','approved','rejected','paid')),
  proof_url      text,
  submitted_at   timestamptz,
  reviewed_at    timestamptz,
  admin_notes    text,
  created_at     timestamptz default now()
);

-- Donations
create table donations (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references profiles(id) on delete cascade,
  charity_id      uuid references charities(id),
  subscription_id uuid references subscriptions(id),
  amount_pence    int not null,
  type            text not null check (type in ('subscription_auto','one_off')),
  status          text not null default 'completed',
  created_at      timestamptz default now()
);
```

### 4. Run locally

```bash
npm run dev
```

App starts at `http://localhost:3000`.

### 5. Wire up Stripe webhooks (local dev)

```bash
# Install the Stripe CLI
brew install stripe/stripe-cli/stripe

# Forward events to your local server
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copy the `whsec_...` secret printed by the CLI into `STRIPE_WEBHOOK_SECRET` in `.env.local` and restart the dev server.

---

## How the Draw Works

Each month an admin triggers a draw from `/admin/draws`. Two draw algorithms are available:

**Random** — five unique numbers drawn uniformly at random from 1–45. Standard lottery behaviour, no bias.

**Algorithmic** — a weighted draw where each number's selection probability is proportional to how frequently that score appears across all entries in the draw. Scores submitted by more members are more likely to be drawn, tightening the link between real golf performance and the outcome.

After numbers are drawn, every entry is evaluated:

| Matches | Tier | Pool share |
|---|---|---|
| 5 | Jackpot | 40% |
| 4 | Major prize | 35% |
| 3 | Prize | 25% |

If no one matches all 5, the jackpot rolls forward and is added to next month's pool. Prize pools are split equally among all winners in each tier. Winners receive an email and must submit screenshot proof before an admin approves the payout.

---

## Subscription & Charity Flow

```
User subscribes via Stripe Checkout
          │
          ▼
Stripe fires checkout.session.completed
          │
          ├─► subscriptions row upserted (status: active)
          └─► donations row inserted for current period
                (amount calculated from plan × charity_percentage)

Renewal:  invoice.payment_succeeded → period dates updated
Failure:  invoice.payment_failed    → status set to past_due
Cancel:   customer.subscription.deleted → status set to cancelled
```

Users can adjust their `charity_percentage` (10–100%) anytime in Settings and make one-off donations independently of their plan.

---

## API Reference

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/signup` | — | Create account |
| POST | `/api/auth/login` | — | Sign in, returns profile + subscription status |
| POST | `/api/auth/logout` | ✓ | Sign out, redirect to `/login` |
| GET | `/api/scores` | ✓ | Get user's last 5 scores |
| POST | `/api/scores` | ✓ active sub | Submit a new score |
| GET | `/api/draws` | ✓ | List upcoming/live/published draws |
| POST | `/api/draws` | ✓ admin | Create a new draw |
| POST | `/api/draws/enter` | ✓ active sub | Enter or update draw entry |
| GET | `/api/draws/enter?draw_id=` | ✓ | Check existing entry for a draw |
| POST | `/api/draws/publish` | ✓ admin | Run draw algorithm, persist results |
| POST | `/api/draws/simulate` | ✓ admin | Dry-run a draw without saving |
| POST | `/api/subscriptions/create` | ✓ | Create Stripe Checkout Session |
| POST | `/api/subscriptions/cancel` | ✓ | Cancel subscription at period end |
| GET | `/api/subscriptions/status` | ✓ | Live status check via Stripe API |
| POST | `/api/stripe/webhook` | Stripe sig | Handle all Stripe lifecycle events |
| GET | `/api/charities` | — | List active charities (search + featured filter) |
| POST | `/api/charities` | ✓ admin | Create a charity |
| POST | `/api/winners/claim` | ✓ | Submit proof URL for a pending claim |
| POST | `/api/winners/verify` | ✓ admin | Approve or reject a winner claim |
| POST | `/api/winners/payout` | ✓ admin | Mark a claim as paid |
| PATCH | `/api/profile/charity` | ✓ | Update selected charity + percentage |
| POST | `/api/donations` | ✓ | Make a one-off donation |
| GET | `/api/admin/reports` | ✓ admin | Revenue, donations, draw stats |
| PATCH | `/api/admin/users/[id]/role` | ✓ admin | Promote or demote user role |

---

## Route Protection

All auth and role enforcement runs in `src/middleware.ts` on every request except static assets. It calls `supabase.auth.getUser()` — the server-verified method, not `getSession()` — and redirects accordingly:

| Condition | Redirects to |
|---|---|
| Unauthenticated user → protected route | `/login` |
| Authenticated user → `/login` or `/signup` | `/dashboard` |
| Non-admin user → `/admin/*` | `/dashboard` |

---

## Deployment

### Vercel (recommended)

```bash
npm install -g vercel
vercel --prod
```

Set all environment variables under **Project → Settings → Environment Variables** in the Vercel dashboard.

Register a webhook endpoint in the [Stripe Dashboard](https://dashboard.stripe.com/webhooks) pointing to `https://yourdomain.com/api/stripe/webhook` and subscribe to:

- `checkout.session.completed`
- `invoice.payment_succeeded`
- `invoice.payment_failed`
- `customer.subscription.deleted`
- `customer.subscription.updated`

### Other platforms

The app is a standard Next.js App Router project and runs anywhere Node.js 18+ is available — Railway, Render, Fly.io, AWS App Runner, etc. Confirm `npm run build` passes cleanly before deploying.

---

## Environment Variable Reference

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✓ | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✓ | Public anon key (safe for browser) |
| `SUPABASE_SERVICE_ROLE_KEY` | ✓ | Service role key — server-only, never expose to client |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | ✓ | Stripe publishable key |
| `STRIPE_SECRET_KEY` | ✓ | Stripe secret key — server-only |
| `STRIPE_WEBHOOK_SECRET` | ✓ | Webhook signing secret (`whsec_...`) |
| `STRIPE_MONTHLY_PRICE_ID` | ✓ | Stripe Price ID for the monthly plan |
| `STRIPE_YEARLY_PRICE_ID` | ✓ | Stripe Price ID for the yearly plan |
| `NEXT_PUBLIC_APP_URL` | ✓ | Full production URL, no trailing slash |
| `EMAIL_HOST` | ✓ | SMTP hostname |
| `EMAIL_PORT` | ✓ | SMTP port (typically 587) |
| `EMAIL_USER` | ✓ | SMTP username |
| `EMAIL_PASS` | ✓ | SMTP password or app-specific password |
| `EMAIL_FROM` | ✓ | From address shown in outgoing emails |
| `UPLOADTHING_SECRET` | ✓ | UploadThing secret key |
| `UPLOADTHING_APP_ID` | ✓ | UploadThing app ID |

---

## Known Limitations & Roadmap

**Score verification** — scores are currently self-reported. A future version should integrate with handicap index APIs (e.g., England Golf, USGA GHIN) to verify round authenticity before accepting a draw entry.

**Payout automation** — winner payouts are a manual admin step today. Stripe Connect or PayPal Payouts could automate transfers directly to winners' bank accounts.

**Automated draw scheduling** — draws require a manual admin trigger. A Supabase Edge Function or Vercel Cron job should run the draw automatically on the scheduled date.

**Push notifications** — winners are currently notified by email only. Web push or SMS (via Twilio) would significantly improve claim rates.

**Leaderboard** — a public monthly score leaderboard would add social engagement and encourage more regular score submissions.

**Charity events** — the database schema includes a `charity_events` table but the admin UI for creating and managing events is not yet implemented.

---

## Contributing

1. Fork the repository and create a branch: `git checkout -b feat/your-feature`
2. Make your changes. Add tests where applicable.
3. Run `npm run lint` and resolve any issues.
4. Open a pull request with a clear description of what changed and why.

Please keep pull requests focused — one feature or fix per PR makes review much faster.

---

## License

MIT — see [LICENSE](./LICENSE) for full terms.

---

*Built with Next.js, Supabase, and Stripe. Designed to make every round of golf count for something bigger than a scorecard.*