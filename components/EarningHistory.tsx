'use client';

import { Earning } from '../lib/types';

const sourceLabels: Record<string, { label: string; color: string }> = {
  task: { label: 'Task', color: 'bg-blue-500/10 text-blue-400' },
  daily: { label: 'Daily', color: 'bg-amber-500/10 text-amber-400' },
  referral: { label: 'Referral', color: 'bg-violet-500/10 text-violet-400' },
  offer: { label: 'Offer', color: 'bg-pink-500/10 text-pink-400' },
  passive: { label: 'Passive', color: 'bg-teal-500/10 text-teal-400' },
  bonus: { label: 'Bonus', color: 'bg-emerald-500/10 text-emerald-400' },
};

export default function EarningHistory({ earnings }: { earnings: Earning[] }) {
  if (!earnings.length) {
    return <div className="text-zinc-500 text-sm py-8 text-center">No earnings yet. Complete tasks to get started.</div>;
  }

  return (
    <div className="space-y-1">
      {earnings.map((e, idx) => {
        const meta = sourceLabels[e.source] || sourceLabels.bonus;
        const isNegative = e.amount < 0;
        return (
          <div key={idx} className="earning-row flex items-center justify-between rounded-xl px-4 py-3 border border-transparent hover:border-zinc-800">
            <div className="flex items-center gap-3">
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${meta.color}`}>
                {meta.label.toUpperCase()}
              </span>
              <div>
                <div className="text-sm">{e.description}</div>
                <div className="text-[11px] text-zinc-500 font-mono">
                  {new Date(e.createdAt).toLocaleString()}
                </div>
              </div>
            </div>
            <div className={`font-semibold tabular-nums ${isNegative ? 'text-red-400' : 'text-emerald-400'}`}>
              {isNegative ? '' : '+'}${Math.abs(e.amount).toFixed(2)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
