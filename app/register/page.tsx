'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { registerAction } from '../actions';
import { toast } from 'sonner';
import Link from 'next/link';

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [ref, setRef] = useState('');
  const router = useRouter();

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    setRef(p.get('ref') || '');
  }, []);

  async function handle(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    if (ref) fd.set('ref', ref);
    const res = await registerAction(fd);
    setLoading(false);
    if (res.error) toast.error(res.error);
    else {
      toast.success('Account created! Welcome.');
      router.push('/dashboard');
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-6 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="block mb-8 text-center text-2xl font-semibold tracking-tight"><span className="money-green">Earn</span>Flow</Link>

        <div className="card rounded-3xl p-8">
          <h1 className="text-2xl font-semibold mb-1 text-center">Start earning today</h1>
          {ref && <p className="text-center text-emerald-400 text-sm mb-6">You were referred — both of you earn a bonus.</p>}

          <form onSubmit={handle} className="space-y-4">
            <input name="name" placeholder="Full name" required className="w-full bg-black border border-white/15 rounded-2xl px-5 py-3" />
            <input name="email" type="email" placeholder="Email address" required className="w-full bg-black border border-white/15 rounded-2xl px-5 py-3" />
            <input name="password" type="password" placeholder="Create a password" minLength={4} required className="w-full bg-black border border-white/15 rounded-2xl px-5 py-3" />
            {ref && <input type="hidden" name="ref" value={ref} />}

            <button disabled={loading} className="btn-primary w-full py-3.5 rounded-2xl font-semibold mt-2">{loading ? 'Creating account...' : 'Create account & claim $0.50 bonus'}</button>
          </form>

          <p className="text-center mt-6 text-sm text-zinc-400">
            Already have an account? <Link href="/login" className="text-emerald-400 underline">Sign in</Link>
          </p>
        </div>

        <div className="text-center text-xs mt-6 text-zinc-500">Free to join • No credit card • Real earning potential</div>
      </div>
    </div>
  );
}
