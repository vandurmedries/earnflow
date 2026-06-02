'use client';

import { useEffect, useState } from 'react';
import { getAllWithdrawalsForAdmin, processWithdrawalAdmin } from '../../lib/store';
import { toast } from 'sonner';

export default function Admin() {
  const [wds, setWds] = useState<any[]>([]);
  const [pass, setPass] = useState('');
  const [authed, setAuthed] = useState(false);

  function load() {
    setWds(getAllWithdrawalsForAdmin());
  }

  useEffect(() => { if (authed) load(); }, [authed]);

  function check() {
    // Demo admin password
    if (pass === 'admin123' || pass === 'demo') {
      setAuthed(true);
      toast.success('Admin access granted');
    } else {
      toast.error('Wrong password');
    }
  }

  async function process(id: string, status: 'paid' | 'rejected') {
    const ok = processWithdrawalAdmin(id, status, status === 'paid' ? 'Processed via demo' : '');
    if (ok) {
      toast.success(`Marked ${status}`);
      load();
    }
  }

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-6">
        <div className="card max-w-xs w-full p-8 rounded-3xl text-center">
          <div className="font-semibold mb-4">Admin Panel</div>
          <input value={pass} onChange={e => setPass(e.target.value)} onKeyDown={e => e.key === 'Enter' && check()} placeholder="Admin password" className="w-full bg-black border border-white/10 px-4 py-2 rounded mb-3" type="password" />
          <button onClick={check} className="btn-primary w-full py-2 rounded-xl">Enter</button>
          <div className="text-xs mt-4 text-zinc-500">Demo password: <span className="font-mono">admin123</span></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-semibold mb-1 tracking-tight">Admin • Withdrawals</h1>
      <p className="text-sm text-zinc-400 mb-6">Process pending cashouts. In production this would interface with banking APIs / Stripe.</p>

      <div className="card rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="text-xs text-zinc-400 border-b border-white/10">
            <tr>
              <th className="text-left pl-5 py-3 font-normal">User</th>
              <th className="text-left py-3 font-normal">Amount</th>
              <th className="text-left py-3 font-normal">Method / Dest</th>
              <th className="text-left py-3 font-normal">Requested</th>
              <th className="text-left py-3 font-normal">Status</th>
              <th className="text-right pr-5 py-3 font-normal">Actions</th>
            </tr>
          </thead>
          <tbody>
            {wds.length === 0 && <tr><td colSpan={6} className="text-center py-8 text-zinc-400">No withdrawals yet.</td></tr>}
            {wds.map(w => (
              <tr key={w.id} className="border-b border-white/5">
                <td className="pl-5 py-3">{w.userName}<div className="text-xs text-zinc-500">{w.userEmail}</div></td>
                <td className="font-semibold tabular-nums">${w.amount}</td>
                <td className="text-xs pr-2">{w.method}<br /><span className="font-mono text-emerald-300/70">{w.destination}</span></td>
                <td className="text-xs text-zinc-400">{new Date(w.createdAt).toLocaleDateString()}</td>
                <td>
                  <span className={`text-xs px-2 py-0.5 rounded ${w.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400' : w.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                    {w.status}
                  </span>
                </td>
                <td className="text-right pr-5">
                  {w.status === 'pending' && (
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => process(w.id, 'paid')} className="text-xs px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500">Mark Paid</button>
                      <button onClick={() => process(w.id, 'rejected')} className="text-xs px-3 py-1 rounded bg-zinc-700">Reject</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 text-xs text-center text-zinc-500">Also see global users and stats in the server console or extend this panel.</div>
    </div>
  );
}
