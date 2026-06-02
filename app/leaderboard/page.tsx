import { redirect } from 'next/navigation';
import { getCurrentUser } from '../actions';
import Nav from '../../components/Nav';
import { getLeaderboard } from '../../lib/store';
import { Trophy } from 'lucide-react';

export default async function Leaderboard() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const board = getLeaderboard(12);

  return (
    <div>
      <Nav userName={user.name} />
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Trophy className="text-yellow-400" />
          <div>
            <div className="uppercase tracking-[2px] text-xs text-yellow-400">COMPETITION</div>
            <h1 className="text-4xl font-semibold tracking-tighter">Top Earners</h1>
          </div>
        </div>

        <div className="card rounded-3xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-xs text-zinc-400">
                <th className="py-3 pl-6 font-normal">#</th>
                <th className="py-3 font-normal">Earner</th>
                <th className="py-3 font-normal">Level</th>
                <th className="py-3 text-right pr-6 font-normal">Total Earned</th>
                <th className="py-3 text-right pr-6 font-normal">Tasks</th>
              </tr>
            </thead>
            <tbody>
              {board.map((entry, idx) => (
                <tr key={entry.id} className="border-b border-white/5 last:border-none">
                  <td className="pl-6 py-3.5 font-mono text-zinc-400">{idx + 1}</td>
                  <td className="py-3.5 font-medium">{entry.name}</td>
                  <td className="py-3.5"><span className="px-2 py-px text-xs rounded bg-white/5 text-white/60">{entry.level}</span></td>
                  <td className="py-3.5 text-right pr-6 font-semibold tabular-nums text-emerald-400">${entry.totalEarned.toFixed(2)}</td>
                  <td className="py-3.5 text-right pr-6 tabular-nums text-zinc-400">{entry.tasksCompleted}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="text-center mt-6 text-xs text-zinc-500">Climb the board by completing more tasks and building a strong referral network. Top earners make $600–$1800/mo.</div>
      </div>
    </div>
  );
}
