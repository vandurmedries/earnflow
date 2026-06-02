'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function ProSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('session_id');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!sessionId) {
      setStatus('error');
      setMessage('No session ID provided.');
      return;
    }

    // Call server action or API to verify and upgrade
    async function verifyAndUpgrade() {
      try {
        const res = await fetch('/api/stripe/verify-pro', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        });
        const data = await res.json();

        if (data.success) {
          setStatus('success');
          setMessage('Congratulations! You are now a Pro user. Enjoy 2x earnings and instant cashouts.');
          // Refresh user data somehow, or redirect after delay
          setTimeout(() => router.push('/dashboard'), 2500);
        } else {
          setStatus('error');
          setMessage(data.error || 'Verification failed.');
        }
      } catch (e) {
        setStatus('error');
        setMessage('Failed to verify payment.');
      }
    }

    verifyAndUpgrade();
  }, [sessionId, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white p-6">
      <div className="card max-w-md w-full p-8 rounded-3xl text-center">
        {status === 'loading' && (
          <>
            <div className="animate-spin h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4" />
            <h1 className="text-2xl font-semibold">Verifying your Pro Boost...</h1>
            <p className="text-zinc-400 mt-2">This will only take a moment.</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-3xl font-semibold text-emerald-400">You're now Pro!</h1>
            <p className="mt-3 text-lg">{message}</p>
            <p className="text-sm text-zinc-400 mt-4">Redirecting to dashboard...</p>
            <Link href="/dashboard" className="btn-primary inline-block mt-6 px-6 py-2 rounded-xl">Go to Dashboard now</Link>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="text-6xl mb-4">😕</div>
            <h1 className="text-2xl font-semibold">Something went wrong</h1>
            <p className="mt-2 text-red-400">{message}</p>
            <Link href="/wallet" className="btn-secondary inline-block mt-6 px-6 py-2 rounded-xl">Back to Wallet</Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function ProSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ProSuccessContent />
    </Suspense>
  );
}
