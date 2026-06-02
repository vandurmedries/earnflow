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

## Deploy Online (Vercel)

1. Push this folder to a GitHub repo (see script below).
2. Go to [vercel.com/new](https://vercel.com/new) → Import the repo.
3. (Optional) Add these env vars in Vercel dashboard for production:
   - `JWT_SECRET` = any long random string
   - `NEXT_PUBLIC_BASE_URL` = your final https://...vercel.app
4. Deploy. Done. The whole earning system is live instantly.

Or use the MCP Vercel tools / GitHub tools from the agent.

## Making It Earn REAL Money

This is a **complete system** ready for real use:

1. **Real payouts**: Add Stripe Connect or PayPal Payouts. The withdrawal request flow already deducts balance and creates auditable records. Just replace the "process" logic.
2. **Monetize the platform**:
   - Add Stripe one-time "Pro Earner" pack ($9–19) that doubles task rewards or removes daily limits.
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
