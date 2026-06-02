'use client';

import { useState } from 'react';
import { completeTaskAction } from '../app/actions';
import { toast } from 'sonner';
import { Clock, Award } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  reward: number;
  category: string;
  estMinutes: number;
  icon: string;
}

export default function TaskCard({ task, onComplete }: { task: Task; onComplete?: () => void }) {
  const [loading, setLoading] = useState(false);

  async function handleComplete() {
    setLoading(true);
    const res = await completeTaskAction(task.id);
    setLoading(false);

    if (res.error) {
      toast.error(res.error);
    } else if ('amount' in res) {
      toast.success(`+$${res.amount.toFixed(2)} earned!`, {
        description: task.title,
      });
      // Small confetti
      import('canvas-confetti').then(m => m.default({ particleCount: 120, spread: 70, origin: { y: 0.6 } }));
      onComplete?.();
    }
  }

  return (
    <div className="task-card card rounded-2xl p-5 flex flex-col">
      <div className="text-3xl mb-3">{task.icon}</div>
      <div className="font-semibold text-lg leading-tight mb-1">{task.title}</div>
      <div className="text-sm text-zinc-400 line-clamp-2 mb-4 flex-1">{task.description}</div>

      <div className="flex items-center justify-between text-xs mb-4">
        <div className="flex items-center gap-1 text-zinc-400">
          <Clock size={13} /> {task.estMinutes} min
        </div>
        <div className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">{task.category}</div>
      </div>

      <button
        onClick={handleComplete}
        disabled={loading}
        className="btn-primary w-full py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-70"
      >
        {loading ? 'Completing...' : (
          <>Complete &amp; Earn <span className="font-mono">${task.reward.toFixed(2)}</span> <Award size={15} /></>
        )}
      </button>
    </div>
  );
}
