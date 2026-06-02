'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, LayoutDashboard, ListTodo, Users, Wallet, Gift, Trophy, Kanban } from 'lucide-react';

const links = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/tasks', label: 'Tasks', icon: ListTodo },
  { href: '/offers', label: 'Offers', icon: Gift },
  { href: '/vibe-kanban', label: 'Vibe Kanban', icon: Kanban },
  { href: '/referrals', label: 'Referrals', icon: Users },
  { href: '/wallet', label: 'Wallet', icon: Wallet },
  { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
];

export default function Nav({ userName }: { userName?: string }) {
  const pathname = usePathname();

  return (
    <nav className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-xl tracking-tight">
            <span className="money-green">Earn</span>Flow
          </Link>

          <div className="hidden md:flex items-center gap-1 text-sm">
            {links.map(l => {
              const Icon = l.icon;
              const active = pathname === l.href || pathname.startsWith(l.href + '/');
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`nav-link flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm ${active ? 'active bg-zinc-900' : 'text-zinc-400 hover:text-white'}`}
                >
                  <Icon size={15} /> {l.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-3 text-sm">
          {userName && (
            <div className="hidden sm:block text-zinc-400">
              Hi, <span className="text-white font-medium">{userName.split(' ')[0]}</span>
            </div>
          )}
          <form action="/api/logout" method="post">
            <button type="submit" className="btn-secondary flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm">
              <LogOut size={15} /> Logout
            </button>
          </form>
        </div>
      </div>

      {/* Mobile nav */}
      <div className="md:hidden border-t border-zinc-800 px-4 py-2 flex gap-1 overflow-x-auto text-xs">
        {links.map(l => {
          const Icon = l.icon;
          const active = pathname === l.href;
          return (
            <Link key={l.href} href={l.href} className={`flex-1 flex flex-col items-center py-1 rounded ${active ? 'text-emerald-400' : 'text-zinc-500'}`}>
              <Icon size={16} />
              <span className="mt-0.5">{l.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
