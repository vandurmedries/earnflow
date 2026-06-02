'use client';

import { useEffect, useState } from 'react';
import Nav from '../../components/Nav';
import { getMyReferrals, getCurrentUser } from '../actions';
import { toast } from 'sonner';
import { Copy, Users } from 'lucide-react';
import { User } from '../../lib/types';

export default function ReferralsPage() {
  const [stats, setStats] = useState<any>(null);
  const [user, setUser] = useState<User | null>(null);

  async function load() {
    const u = await getCurrentUser();
    setUser(u);
    const s = await getMyReferrals();
    setStats(s);
  }

  useEffect(() => { load(); }, []);

  function copyLink() {
    if (!stats) return;
    navigator.clipboard.writeText(stats.link);
    toast.success('Referral link copied!');
  }

  return (
    <div>
      <Nav userName={user?.name} />
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="uppercase tracking-[3px] text-xs text-violet-400">VIRAL GROWTH</div>
          <h1 className="text-4xl font-semibold tracking-tighter">Referral Program</h1>
          <p className="text-lg text-zinc-400 mt-2">Earn $1.50 for every person who joins + 8% of all their future task and offer earnings for life.</p>
        </div>

        <div className="card rounded-3xl p-8">
          <div className="text-sm text-zinc-400 mb-2">YOUR UNIQUE CODE</div>
          <div className="font-mono text-4xl tracking-[4px] font-semibold mb-4 text-emerald-400">{stats?.code || 'EF-XXXX'}</div>

          <div className="flex gap-3 mb-8">
            <button onClick={copyLink} className="btn-primary flex-1 flex justify-center items-center gap-2 py-3 rounded-2xl">
              <Copy size={17} /> COPY REFERRAL LINK
            </button>
            <button onClick={() => {
              if (stats) window.open(`https://twitter.com/intent/tweet?text=Join%20me%20on%20EarnFlow%20and%20earn%20real%20money%20doing%20microtasks!%20${encodeURIComponent(stats.link)}`, '_blank');
            }} className="btn-secondary px-6 rounded-2xl">Tweet</button>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center border-t border-white/10 pt-6">
            <div>
              <div className="text-3xl font-semibold tabular-nums">{stats?.totalReferred || 0}</div>
              <div className="text-xs text-zinc-400">FRIENDS REFERRED</div>
            </div>
            <div>
              <div className="text-3xl font-semibold tabular-nums text-emerald-400">${(stats?.signupBonuses || 0).toFixed(2)}</div>
              <div className="text-xs text-zinc-400">SIGNUP BONUSES</div>
            </div>
            <div>
              <div className="text-3xl font-semibold tabular-nums">${(stats?.earningsFromRefs || 0).toFixed(2)}</div>
              <div className="text-xs text-zinc-400">EARNINGS FROM REFS</div>
            </div>
          </div>
        </div>

        <div className="mt-6 text-xs text-center text-zinc-500 flex items-center justify-center gap-2">
          <Users size={14} /> Share your link on Discord, Twitter, TikTok or WhatsApp groups. The best earners make $40–$180/mo passively from referrals.
        </div>
      </div>
    </div>
  );
}
