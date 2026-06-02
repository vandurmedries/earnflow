'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginAction } from '../actions';
import { toast } from 'sonner';
import Link from 'next/link';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handle(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const res = await loginAction(fd);
    setLoading(false);
    if (res.error) toast.error(res.error);
    else {
      router.push('/dashboard');
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-6">
      <div className="w-full max-w-md">
        <Link href="/" className="block mb-8 text-center text-2xl font-semibold tracking-tight"><span className="money-green">Earn</span>Flow</Link>

        <div className="card rounded-3xl p-8">
          <h1 className="text-2xl font-semibold mb-6 text-center">Welcome back</h1>

          <form onSubmit={handle} className="space-y-4">
            <input name="email" type="email" placeholder="Email" defaultValue="demo@earnflow.app" required className="w-full bg-black border border-white/15 rounded-2xl px-5 py-3" />
            <input name="password" type="password" placeholder="Password" defaultValue="demo123" required className="w-full bg-black border border-white/15 rounded-2xl px-5 py-3" />

            <button disabled={loading} className="btn-primary w-full py-3 rounded-2xl font-semibold">{loading ? 'Signing in...' : 'Sign in'}</button>
          </form>

          <p className="text-center mt-6 text-sm text-zinc-400">
            New here? <Link href="/register" className="text-emerald-400 underline">Create an account</Link>
          </p>
          <p className="text-center mt-1 text-[11px] text-zinc-500">Demo: demo@earnflow.app / demo123</p>
        </div>
      </div>
    </div>
  );
}
