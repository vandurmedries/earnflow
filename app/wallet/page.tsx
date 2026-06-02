'use client';

import { useEffect, useState } from 'react';
import Nav from '../../components/Nav';
import BalanceCard from '../../components/BalanceCard';
import EarningHistory from '../../components/EarningHistory';
import { getCurrentUser, getEarningsHistory, requestWithdrawAction, createProBoostCheckoutAction } from '../actions';
import { toast } from 'sonner';
import { User } from '../../lib/types';

export default function WalletPage() {
  const [user, setUser] = useState<User | null>(null);
  const [earnings, setEarnings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);

  async function load() {
    const u = await getCurrentUser();
    setUser(u);
    const e = await getEarningsHistory();
    setEarnings(e);
  }

  useEffect(() => { load(); }, []);

  async function handleWithdraw(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const res = await requestWithdrawAction(fd);
    setLoading(false);

    if (res.error) toast.error(res.error);
    else if (res.withdrawal) {
      toast.success(`Withdrawal request #${res.withdrawal.id.slice(-6)} submitted`, { description: `$${res.withdrawal.amount} • will be processed soon` });
      (e.target as HTMLFormElement).reset();
      load();
    }
  }

  async function handleBuyPro() {
    const res = await createProBoostCheckoutAction();
    if (res.error) {
      toast.error(res.error);
    } else if (res.url) {
      window.location.href = res.url; // redirect to Stripe
    }
  }

  if (!user) return null;

  return (
    <div>
      <Nav userName={user.name} />
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-6">
          <div className="text-xs tracking-[2px] text-emerald-500">CASH OUT</div>
          <h1 className="text-4xl font-semibold tracking-tighter">Wallet &amp; Payouts</h1>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <BalanceCard balance={user.balance} totalEarned={user.totalEarned} />
          </div>

          <div className="lg:col-span-2 card rounded-2xl p-6">
            <div className="font-semibold mb-3">Request a payout</div>
            <form onSubmit={handleWithdraw} className="space-y-3 text-sm">
              <div>
                <label className="text-xs text-zinc-400">AMOUNT (USD)</label>
                <input name="amount" type="number" step="0.01" min={user.isPro ? 1 : 5} max={user.balance} defaultValue={Math.min(user.isPro ? 5 : 10, user.balance).toFixed(2)} required className="w-full bg-black border border-white/10 px-4 py-2 rounded-xl font-mono" />
              </div>
              <div>
                <label className="text-xs text-zinc-400">METHOD</label>
                <select name="method" className="w-full bg-black border border-white/10 px-4 py-2 rounded-xl" defaultValue="paypal">
                  <option value="paypal">PayPal</option>
                  <option value="crypto">Crypto (BTC / ETH)</option>
                  <option value="venmo">Venmo</option>
                  <option value="bank">Bank Transfer (ACH)</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-zinc-400">DESTINATION (email / wallet / @username)</label>
                <input name="destination" required placeholder="you@paypal.com or 0x..." className="w-full bg-black border border-white/10 px-4 py-2 rounded-xl" />
              </div>

              <button disabled={loading} type="submit" className="btn-primary w-full py-2.5 rounded-xl font-medium mt-1">
                {loading ? 'Submitting request...' : 'Submit Withdrawal Request'}
              </button>
              <div className="text-[10px] text-amber-400/80">Min ${user.isPro ? '1' : '5'} {user.isPro ? '(Pro)' : ''}. Real payouts use Stripe Connect / PayPal in production.</div>
            </form>
          </div>
        </div>

        {/* Pro Boost upsell */}
        {!user.isPro && (
          <div className="mt-6 card rounded-3xl p-6 border border-violet-500/30 bg-violet-950/20">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="font-semibold text-lg flex items-center gap-2">🚀 Go Pro — 2x your earnings</div>
                <div className="text-sm text-zinc-400 mt-1">Unlock 2× rewards on tasks, offers &amp; Vibe Kanban. Instant cashouts (min $1). 30 days.</div>
              </div>
              <button onClick={handleBuyPro} className="btn-primary px-8 py-2.5 rounded-2xl font-medium whitespace-nowrap">
                Buy Pro Boost — $4.99
              </button>
            </div>
            <div className="text-[10px] text-violet-400/70 mt-2">One-time payment. Powered by Stripe. Real money in = real boost.</div>
          </div>
        )}
        {user.isPro && (
          <div className="mt-6 text-emerald-400 text-sm px-1">✅ You are Pro — 2x earnings active + instant cashouts enabled.</div>
        )}

        <div className="mt-8">
          <div className="font-semibold mb-3 px-1">Transaction history</div>
          <div className="card rounded-2xl p-2">
            <EarningHistory earnings={earnings} />
          </div>
        </div>

        <div className="mt-8 text-xs text-zinc-500 max-w-prose">
          All withdrawal requests are reviewed within 24-72h in a real deployment. Small demo withdrawals (&lt;$25) can be instantly marked paid from the admin panel for testing.
        </div>
      </div>
    </div>
  );
}
