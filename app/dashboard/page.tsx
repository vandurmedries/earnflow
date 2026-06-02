import { redirect } from 'next/navigation';
import { getDashboardData, getCurrentUser } from '../actions';
import Nav from '../../components/Nav';
import BalanceCard from '../../components/BalanceCard';
import EarningHistory from '../../components/EarningHistory';
import Link from 'next/link';
import { ArrowRight, Calendar, Users, Kanban } from 'lucide-react';

export default async function Dashboard() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const data = await getDashboardData();

  return (
    <div>
      <Nav userName={user.name} />

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="text-xs uppercase tracking-[2px] text-emerald-500">OVERVIEW</div>
            <h1 className="text-4xl font-semibold tracking-tighter">Welcome back, {user.name.split(' ')[0]}</h1>
          </div>
          <div className="text-right text-xs text-zinc-500">
            Member since {user.joinedAt} • {user.level}
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <BalanceCard balance={user.balance} totalEarned={user.totalEarned} weeklyEarned={data?.weeklyEarned} />
          </div>

          <div className="lg:col-span-5 card rounded-2xl p-6 flex flex-col">
            <div className="font-semibold mb-4 flex items-center gap-2"><Calendar size={18} /> Quick actions</div>
            
            <div className="space-y-2 text-sm flex-1">
              <Link href="/tasks" className="flex justify-between items-center px-4 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/5 group">
                Complete microtasks <ArrowRight className="group-hover:translate-x-0.5 transition" size={16} />
              </Link>
              <Link href="/referrals" className="flex justify-between items-center px-4 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/5 group">
                Share referral link <ArrowRight className="group-hover:translate-x-0.5 transition" size={16} />
              </Link>
              <Link href="/offers" className="flex justify-between items-center px-4 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/5 group">
                Browse high-value offers <ArrowRight className="group-hover:translate-x-0.5 transition" size={16} />
              </Link>
              <Link href="/vibe-kanban" className="flex justify-between items-center px-4 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/5 group">
                <span className="flex items-center gap-2"><Kanban size={15} /> Open Vibe Kanban</span> <ArrowRight className="group-hover:translate-x-0.5 transition" size={16} />
              </Link>
            </div>

            <div className="pt-4 border-t border-white/10 text-xs flex items-center gap-2 text-emerald-400">
              <Users size={14} /> {user.tasksCompleted} tasks completed • {user.streak} day streak
            </div>
          </div>
        </div>

        <div className="mt-8">
          <div className="flex items-baseline justify-between mb-3 px-1">
            <div className="font-semibold">Recent earnings</div>
            <Link href="/wallet" className="text-xs text-emerald-400 flex items-center gap-1 hover:underline">Full history &amp; cashout <ArrowRight size={13}/></Link>
          </div>
          <div className="card rounded-2xl p-2">
            <EarningHistory earnings={data?.recentEarnings || []} />
          </div>
        </div>

        <div className="mt-6 text-[11px] text-center text-zinc-500">
          Tip: Enable Auto-Earn in the tasks page for passive income simulation every 40 seconds.
        </div>
      </div>
    </div>
  );
}
