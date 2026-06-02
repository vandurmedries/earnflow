'use client';

import { useState } from 'react';
import { completeOfferAction } from '../app/actions';
import { toast } from 'sonner';

interface Offer {
  id: string;
  title: string;
  description: string;
  reward: number;
  category: string;
  timeEst: string;
  icon: string;
  link?: string;
}

export default function OfferCard({ offer, onComplete }: { offer: Offer; onComplete?: () => void }) {
  const [loading, setLoading] = useState(false);

  async function handleComplete() {
    setLoading(true);
    const res = await completeOfferAction(offer.id);
    setLoading(false);

    if (res.error) {
      toast.error(res.error);
    } else if ('amount' in res) {
      toast.success(`+$${res.amount.toFixed(2)} from offer!`);
      import('canvas-confetti').then(m => m.default({ particleCount: 180, spread: 90, origin: { y: 0.7 } }));
      onComplete?.();
    }
  }

  return (
    <div className="card rounded-2xl p-5">
      <div className="flex gap-4">
        <div className="text-4xl shrink-0 pt-1">{offer.icon}</div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold">{offer.title}</div>
          <div className="text-sm text-zinc-400 mt-1">{offer.description}</div>

          <div className="flex items-center gap-2 mt-3 text-xs">
            <span className="px-2 py-px bg-zinc-800 rounded text-zinc-400">{offer.timeEst}</span>
            <span className="px-2 py-px bg-zinc-800 rounded text-zinc-400">{offer.category}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        {offer.link && (
          <a href={offer.link} target="_blank" rel="noopener noreferrer" className="btn-secondary flex-1 text-center py-2 rounded-xl text-sm">
            Visit site
          </a>
        )}
        <button
          onClick={handleComplete}
          disabled={loading}
          className="btn-primary flex-1 py-2 rounded-xl text-sm font-medium"
        >
          {loading ? 'Verifying...' : `Complete +$${offer.reward.toFixed(2)}`}
        </button>
      </div>
      <div className="text-[10px] text-emerald-400/70 mt-1.5 text-center">One-time • Verified instantly in demo</div>
    </div>
  );
}
