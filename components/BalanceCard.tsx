'use client';

import { TrendingUp, ArrowUpRight } from 'lucide-react';

export default function BalanceCard({ balance, totalEarned, weeklyEarned }: { balance: number; totalEarned: number; weeklyEarned?: number }) {
  return (
    <div className="card rounded-2xl p-8">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-zinc-400 tracking-widest">CURRENT BALANCE</div>
          <div className="balance text-6xl font-semibold tracking-tighter mt-2 tabular-nums">
            ${balance.toFixed(2)}
          </div>
        </div>
        <div className="text-right">
          <div className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <TrendingUp size={13} /> LIVE
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 text-sm">
        <div>
          <div className="text-zinc-400 text-xs">TOTAL EARNED</div>
          <div className="font-semibold text-2xl tabular-nums mt-0.5">${totalEarned.toFixed(2)}</div>
        </div>
        <div>
          <div className="text-zinc-400 text-xs">THIS WEEK</div>
          <div className="font-semibold text-2xl tabular-nums mt-0.5 text-emerald-400">
            +${(weeklyEarned || 0).toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
}
