'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { registerAction, loginAction } from './actions';
import { toast } from 'sonner';
import { ArrowRight, Users, Zap, Shield, TrendingUp, Award, ListTodo, Gift } from 'lucide-react';

export default function Landing() {
  const [mode, setMode] = useState<'login' | 'register'>('register');
  const [loading, setLoading] = useState(false);
  const [refCode, setRefCode] = useState('');
  const router = useRouter();

  // Parse ref from URL if present
  if (typeof window !== 'undefined' && !refCode) {
    const p = new URLSearchParams(window.location.search);
    const r = p.get('ref');
    if (r) setRefCode(r);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = e.currentTarget;
    const fd = new FormData(form);

    if (refCode) fd.set('ref', refCode);

    const res = mode === 'register' 
      ? await registerAction(fd) 
      : await loginAction(fd);

    setLoading(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(mode === 'register' ? 'Welcome! Your account is ready.' : 'Welcome back!');
      router.push('/dashboard');
      router.refresh();
    }
  }

  const demoLogin = async () => {
    setLoading(true);
    const fd = new FormData();
    fd.set('email', 'demo@earnflow.app');
    fd.set('password', 'demo123');
    const res = await loginAction(fd);
    setLoading(false);
    if (res.error) toast.error(res.error);
    else {
      toast.success('Logged in as demo user');
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Top bar */}
      <div className="border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between text-sm">
          <div className="font-semibold tracking-tight text-lg"><span className="money-green">Earn</span>Flow</div>
          <div className="flex items-center gap-4 text-xs text-zinc-400">
            <div>12,847 earners • $291k paid out this month</div>
            <button onClick={demoLogin} className="underline hover:text-white">Try demo instantly</button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pt-16 pb-24 grid lg:grid-cols-2 gap-x-16 gap-y-12">
        {/* Hero / Value */}
        <div>
          <div className="inline-block text-xs tracking-[3px] text-emerald-400 bg-emerald-950 px-3 py-1 rounded-full mb-4">REAL MONEY. REAL FAST.</div>
          <h1 className="text-6xl leading-none font-semibold tracking-tighter">
            Earn money<br />online in minutes.
          </h1>
          <p className="mt-4 max-w-md text-xl text-zinc-400">
            Complete simple microtasks, refer friends, and finish offers. Get paid weekly or instantly to PayPal, crypto, or bank.
          </p>

          <div className="mt-8 flex flex-wrap gap-3 text-sm">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900 border border-white/10"><Zap size={16} className="text-emerald-400"/> Instant task payouts</div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900 border border-white/10"><Users size={16} className="text-emerald-400"/> 10% lifetime referrals</div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900 border border-white/10"><Shield size={16} className="text-emerald-400"/> $5 min cashout</div>
          </div>

          <div className="mt-10 grid grid-cols-3 gap-4 text-center">
            <div><div className="text-3xl font-semibold tabular-nums">8.4k</div><div className="text-xs text-zinc-500 mt-1">TASKS DONE TODAY</div></div>
            <div><div className="text-3xl font-semibold tabular-nums">$4.2k</div><div className="text-xs text-zinc-500 mt-1">PAID OUT TODAY</div></div>
            <div><div className="text-3xl font-semibold tabular-nums">41</div><div className="text-xs text-zinc-500 mt-1">AVG MIN / $10</div></div>
          </div>
        </div>

        {/* Auth Card */}
        <div className="card rounded-3xl p-8 lg:p-10">
          <div className="flex border-b border-white/10 mb-6">
            <button onClick={() => setMode('register')} className={`flex-1 pb-3 text-sm font-medium border-b-2 ${mode === 'register' ? 'border-emerald-500 text-white' : 'border-transparent text-zinc-400'}`}>Create account</button>
            <button onClick={() => setMode('login')} className={`flex-1 pb-3 text-sm font-medium border-b-2 ${mode === 'login' ? 'border-emerald-500 text-white' : 'border-transparent text-zinc-400'}`}>Sign in</button>
          </div>

          {refCode && mode === 'register' && (
            <div className="mb-4 text-xs px-3 py-2 bg-emerald-950 border border-emerald-800 rounded-xl text-emerald-400">
              🎉 Referred by <span className="font-mono font-semibold">{refCode}</span> — you both earn a signup bonus!
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="text-xs text-zinc-400 block mb-1.5">FULL NAME</label>
                <input name="name" required className="w-full bg-black border border-white/15 focus:border-emerald-600 rounded-xl px-4 py-3 text-lg outline-none" placeholder="Alex Rivera" />
              </div>
            )}

            <div>
              <label className="text-xs text-zinc-400 block mb-1.5">EMAIL</label>
              <input name="email" type="email" required defaultValue={mode === 'login' ? 'demo@earnflow.app' : ''} className="w-full bg-black border border-white/15 focus:border-emerald-600 rounded-xl px-4 py-3 text-lg outline-none" placeholder="you@work.com" />
            </div>

            <div>
              <label className="text-xs text-zinc-400 block mb-1.5">PASSWORD</label>
              <input name="password" type="password" required minLength={4} defaultValue={mode === 'login' ? 'demo123' : ''} className="w-full bg-black border border-white/15 focus:border-emerald-600 rounded-xl px-4 py-3 text-lg outline-none" placeholder="••••••••" />
            </div>

            {refCode && mode === 'register' && <input type="hidden" name="ref" value={refCode} />}

            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary w-full py-3.5 rounded-2xl text-base font-semibold flex items-center justify-center gap-2 mt-2 disabled:opacity-60"
            >
              {loading ? 'Please wait...' : mode === 'register' ? 'Create free account & start earning' : 'Sign in to dashboard'} 
              {!loading && <ArrowRight size={17} />}
            </button>
          </form>

          <div className="text-center mt-5">
            <button onClick={demoLogin} className="text-xs underline text-zinc-500 hover:text-zinc-300">or jump straight into the DEMO account</button>
          </div>

          <div className="text-[11px] text-center text-zinc-500 mt-6">
            By continuing you agree to our demo terms. Real payouts available after platform verification.
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="border-t border-white/10 bg-zinc-900/50 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-10">
            <div className="text-emerald-400 text-xs tracking-[2px]">HOW EARN FLOW WORKS</div>
            <div className="text-3xl font-semibold tracking-tight mt-2">Four proven ways to earn</div>
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            {[
              { icon: <ListTodo className="mx-auto" />, title: "Microtasks", desc: "Label data, transcribe, answer surveys. $0.90–$4 per task. Takes 4-12 minutes." },
              { icon: <Users className="mx-auto" />, title: "Referrals", desc: "Share your link. Earn $1.50 per signup + 8% of everything they earn, forever." },
              { icon: <Gift className="mx-auto" />, title: "Offer Wall", desc: "Complete high-value partner offers. $1.25 – $8.50 each. One-time easy wins." },
              { icon: <TrendingUp className="mx-auto" />, title: "Streaks + Passive", desc: "Daily login bonuses grow with your streak. Enable auto-earn mode for passive credits." },
            ].map((f, i) => (
              <div key={i} className="card rounded-2xl p-6 text-center">
                <div className="text-emerald-400 mb-3">{f.icon}</div>
                <div className="font-semibold mb-1.5">{f.title}</div>
                <div className="text-sm text-zinc-400">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <footer className="py-10 text-center text-xs text-zinc-500">
        EarnFlow is a fully functional demo money earning platform. All balances and cashouts are simulated until connected to real payment rails (Stripe Connect / PayPal Payouts).
      </footer>
    </div>
  );
}
