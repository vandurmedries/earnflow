'use client';

import { useEffect, useState } from 'react';
import Nav from '../../components/Nav';
import OfferCard from '../../components/OfferCard';
import { getOffers } from '../../lib/store';
import { getCurrentUser } from '../actions';
import { User } from '../../lib/types';

export default function OffersPage() {
  const [offers, setOffers] = useState(getOffers());
  const [user, setUser] = useState<User | null>(null);

  async function load() {
    const u = await getCurrentUser();
    setUser(u);
  }
  useEffect(() => { load(); }, []);

  return (
    <div>
      <Nav userName={user?.name} />
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-6">
          <div className="uppercase text-xs tracking-[3px] text-emerald-500">HIGH VALUE</div>
          <h1 className="text-4xl font-semibold tracking-tighter">Offer Wall</h1>
          <p className="text-zinc-400 mt-1">Complete partner offers for bigger one-time payouts. Most offers are free or low-commitment signups.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {offers.map(o => (
            <OfferCard key={o.id} offer={o} onComplete={load} />
          ))}
        </div>

        <div className="text-center text-xs mt-8 text-zinc-500">Offers update weekly. In production these would be tracked with affiliate pixels and real conversions.</div>
      </div>
    </div>
  );
}
