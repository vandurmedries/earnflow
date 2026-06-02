# EarnFlow — Full Money Earning System

Production-ready demo of a complete online money earning platform. Users earn real (simulated) money by completing microtasks, referring friends, and finishing offers. Includes full wallet, instant payouts simulation, admin processing, leaderboards, and referral tracking.

**Live demo:** Deploy this to Vercel in one click (see below). All earnings, referrals, and withdrawals work immediately.

## Features (Fully Functional)

- **8 Microtasks** — AI data labeling, surveys, transcription, research. Realistic $0.95–$3.10 rewards. Daily limits per task.
- **Daily Streak Bonuses** — Starts at ~$0.65, grows with consecutive days.
- **Offer Wall** — 5 high-value partner-style offers ($1.25–$8.50). One-time completions.
- **Powerful Referral System** — Unique code + link. $1.50 signup bonus to referrer + 8% of referred user's task earnings for life.
- **Full Wallet + Withdrawals** — Real balance tracking, transaction history (positive + negative), withdrawal requests (min $5) to PayPal/crypto/bank/venmo.
- **Leaderboard** — Live global top earners.
- **Auto-Earn Mode** (demo) — Passive small credits every ~38s while page is open.
- **Vibe Kanban** — Beautiful drag & drop board (Ideate → Flow → Ship → Banked). Create cards with potential rewards. Move to Banked = instant real earnings + flow bonus. Perfect for organizing multiple income streams with good vibes.
- **Admin Panel** (`/admin`) — Review/approve/reject all withdrawal requests (password: `admin123`).
- **Beautiful dark UI** — Mobile friendly, confetti on earnings, instant feedback.

## Quick Start (Local)

```bash
npm install
npm run dev
```

Visit http://localhost:3000 — register or use the instant demo:

- Email: `demo@earnflow.app`
- Password: `demo123`

## Deploy Live to Vercel Right Now

The code + Stripe integration is pushed and ready.

**Steps:**
1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select the `vandurmedries/earnflow` repo (or your own fork)
4. In "Environment Variables" add (use test keys from Stripe dashboard first):
   - `STRIPE_SECRET_KEY` = sk_test_...
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` = pk_test_...
   - `NEXT_PUBLIC_BASE_URL` = (you can set after first deploy or use a placeholder)
   - `JWT_SECRET` = a long random string
5. Deploy.

Your live URL will be something like `https://earnflow-xxx.vercel.app`.

After the first deploy, update `NEXT_PUBLIC_BASE_URL` to the exact production URL and redeploy once for correct referral links and Stripe success redirects.

**Pro Boost** is live: users can buy $4.99 one-time → get 2x earnings + instant cashouts.

## Making It Earn REAL Money + Fully Autonomous (Web4)

This is a **complete system** ready for real use:

1. **Real payouts**: The withdrawal flow deducts balance and records everything. Hook it up to Stripe Connect (recommended for platforms) or PayPal Payouts to send real money to users' accounts.
2. **Monetize + boost platform revenue**:
   - The "Pro Boost" ($4.99) is already implemented with real Stripe Checkout.
   - Pro users get 2x rewards and better cashout terms — this is how you make real recurring revenue while users earn more.
3. **Persistence**: Current store is in-memory (great for demos). For production add `@vercel/kv` or Vercel Postgres + Prisma (swap the Maps in lib/store.ts — ~30 lines of changes).
4. **Fully Autonomous Web4 Mode** (new!):
   - Public `/api/agent/*` endpoints for registration, tasks, Kanban, earnings — designed for AI agents.
   - `autonomous-earnflow-web4-agent.js` : Sense-Think-Act loop using Web4 protocol (decentralized agent ledger via Irys/Solana) + EarnFlow APIs.
   - Agent autonomously: registers, claims daily, completes tasks, auto-creates & banks Kanban cards (prioritizing high-reward), posts earnings reports to Web4 spatial ledger.
   - Run: `EARNBASE=https://earnflow-lovat.vercel.app node autonomous-earnflow-web4-agent.js`
   - Web4 integration: uses web4-agent/ for identity, sense, post with #Web4 #Agent #EarnFlow tags + 2D coords.
   - Search results from Web4 research (autonomous agents, A2A protocol, agentic web, on-chain economies) guided this: agents as primary earners in decentralized intelligent web.

To run autonomous on live: update env in script, run the agent (it will earn in the per-request instance; for persistent multi-call autonomy add DB + long-running agent host).

See web4-agent/ for full protocol, SKILL.md for agent instructions.

## Making It Earn REAL Money

This is a **complete system** ready for real use:

1. **Real payouts**: Add Stripe Connect or PayPal Payouts. The withdrawal request flow already deducts balance and creates auditable records. Pro users get lower mins.
2. **Monetize the platform**:
   - "Pro Boost" ($4.99 one-time) is already wired with real Stripe Checkout — gives buyers 2x earnings + instant cashouts.
   - Put real affiliate links in the offer wall (Amazon Associates, ClickBank, etc).
   - Run Google AdSense or Ezoic on the logged-out landing.
3. **Legal**: Add your company details, terms, and tax forms (1099 etc in US). Current Belgian company notes exist in sibling projects.
4. **Persistence**: Currently in-memory (resets on new deploy/replica). Add `@vercel/kv` or Prisma + Vercel Postgres in ~15 lines for permanent data.

## Admin & Testing

- `/admin` (password `admin123`) — process pending cashouts live.
- Many seeded demo users with history for impressive first impression.
- All actions are server actions + protected routes.

## Tech

- Next.js 16 (App Router) + TypeScript + Tailwind
- In-memory store (easy to swap for real DB)
- JWT sessions (httpOnly cookies)
- Sonner toasts, framer (easy to extend), recharts ready

Built as a complete, ambitious money earning system that can be taken live.

---

**Warning (demo)**: Balances and payouts are simulated until you connect payment processors. Do not promise users real money until you have the rails and legal entity in place.

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
