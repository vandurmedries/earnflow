'use client';

import { useEffect, useState } from 'react';
import Nav from '../../components/Nav';
import TaskCard from '../../components/TaskCard';
import { getTasks } from '../../lib/store';
import { getCurrentUser, claimDailyAction, creditPassiveAction } from '../actions';
import { toast } from 'sonner';
import { User } from '../../lib/types';

export default function TasksPage() {
  const [tasks, setTasks] = useState(getTasks());
  const [user, setUser] = useState<User | null>(null);
  const [claiming, setClaiming] = useState(false);
  const [autoEarn, setAutoEarn] = useState(false);
  const [intervalId, setIntervalId] = useState<any>(null);

  async function load() {
    const u = await getCurrentUser();
    setUser(u);
  }

  useEffect(() => { load(); }, []);

  async function claimDaily() {
    setClaiming(true);
    const res = await claimDailyAction();
    setClaiming(false);
    if (res.error) toast.error(res.error);
    else if ('amount' in res) {
      toast.success(`+$${res.amount.toFixed(2)} daily bonus!`, { description: `Streak: ${res.newStreak} days` });
      load();
    }
  }

  function toggleAuto() {
    if (autoEarn) {
      if (intervalId) clearInterval(intervalId);
      setIntervalId(null);
      setAutoEarn(false);
      toast.info('Auto-earn stopped');
      return;
    }
    const id = setInterval(async () => {
      const amt = Math.random() * 0.32 + 0.12;
      await creditPassiveAction(Math.round(amt * 100) / 100, 'Passive micro-work credit (auto-earn)');
      load();
      toast.success(`+$${amt.toFixed(2)} passive`, { description: 'Auto-earn' });
    }, 38000);
    setIntervalId(id);
    setAutoEarn(true);
    toast.success('Auto-earn enabled', { description: 'Small credits every ~38s while on page' });
  }

  return (
    <div>
      <Nav userName={user?.name} />

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="uppercase tracking-[3px] text-xs text-emerald-500">EARN BY DOING</div>
            <h1 className="text-4xl tracking-tighter font-semibold">Microtasks</h1>
          </div>
          <div className="flex gap-3">
            <button onClick={claimDaily} disabled={claiming} className="btn-secondary px-5 py-2 rounded-2xl text-sm font-medium">
              {claiming ? 'Claiming...' : 'Claim Daily Bonus'}
            </button>
            <button onClick={toggleAuto} className={`px-5 py-2 rounded-2xl text-sm font-medium border ${autoEarn ? 'bg-emerald-600 border-emerald-500' : 'border-white/15'}`}>
              {autoEarn ? 'Stop Auto-Earn' : 'Enable Auto-Earn (demo)'}
            </button>
          </div>
        </div>

        <div className="text-sm text-zinc-400 mb-5 max-w-prose">Complete tasks to earn instantly. Most pay between $0.95 and $3.10. One completion per task per day to keep the economy fair.</div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {tasks.map(task => (
            <TaskCard key={task.id} task={task} onComplete={load} />
          ))}
        </div>

        <div className="mt-10 text-xs text-center text-zinc-500 max-w-sm mx-auto">
          Real platforms like Appen, Clickworker, and Remotasks pay similar rates. EarnFlow adds instant cashout simulation + referral upside.
        </div>
      </div>
    </div>
  );
}
