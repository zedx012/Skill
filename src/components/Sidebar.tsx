import { useState } from 'react';
import {
  Compass,
  BookOpen,
  Target,
  Flame,
  Trophy,
  Settings,
  LifeBuoy,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';

type NavItem = {
  id: string;
  label: string;
  icon: typeof Compass;
  badge?: string;
};

const mainNav: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: Compass },
  { id: 'paths', label: 'Skill Paths', icon: BookOpen },
  { id: 'quests', label: 'Daily Quests', icon: Target },
  { id: 'streak', label: 'Streak Lab', icon: Flame },
  { id: 'trophies', label: 'Achievements', icon: Trophy },
];

const secondaryNav: NavItem[] = [
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'help', label: 'Support', icon: LifeBuoy },
];

export function Sidebar() {
  const [active, setActive] = useState('dashboard');
  const { stats, signOut } = useAuth();
  const streak = stats?.streak ?? 0;

  return (
    <aside className="hidden lg:flex flex-col w-60 shrink-0 bg-paper-50 hairline-r min-h-screen sticky top-0 h-screen">
      {/* Brand */}
      <div className="px-5 pt-6 pb-5">
        <div className="flex items-center gap-2.5">
          <div className="relative w-8 h-8 rounded-md bg-ink-900 flex items-center justify-center">
            <div className="absolute inset-1 rounded-sm border border-brass-400/40" />
            <div className="w-2 h-2 bg-brass-400 rounded-[1px]" />
          </div>
          <div>
            <div className="font-display font-semibold text-ink-900 text-[15px] leading-none tracking-tightish">
              Skilora
            </div>
            <div className="text-[9px] font-mono uppercase tracking-eyebrow text-ink-400 mt-1">
              Skill Atelier
            </div>
          </div>
        </div>
      </div>

      <div className="hairline mx-5" />

      {/* Primary nav */}
      <nav className="flex-1 px-3 pt-4">
        <div className="eyebrow px-2 mb-2">Workspace</div>
        <ul className="space-y-0.5">
          {mainNav.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActive(item.id)}
                  className={`focus-ring group w-full flex items-center gap-3 px-2.5 py-2 rounded-md text-[13px] font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-ink-900 text-paper-100'
                      : 'text-ink-500 hover:text-ink-900 hover:bg-ink-900/5'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-brass-400' : ''
                    }`}
                    strokeWidth={2}
                  />
                  <span className="flex-1 text-left">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Streak callout */}
      <div className="px-4 pb-3">
        <div className="rounded-lg bg-ink-900 p-3.5 relative overflow-hidden">
          <div className="absolute inset-0 blueprint-grid opacity-30" />
          <div className="relative">
            <div className="flex items-center gap-1.5 mb-1">
              <Flame className="w-3.5 h-3.5 text-signal-400" strokeWidth={2.2} />
              <span className="eyebrow text-ink-300">Current Streak</span>
            </div>
            <div className="font-mono text-2xl text-paper-100 font-semibold tabular-nums">
              {streak}<span className="text-ink-400 text-sm font-normal ml-1">days</span>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary nav + sign out */}
      <div className="px-3 pb-4">
        <div className="hairline mb-3" />
        <ul className="space-y-0.5">
          {secondaryNav.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActive(item.id)}
                  className="focus-ring group w-full flex items-center gap-3 px-2.5 py-2 rounded-md text-[13px] font-medium text-ink-500 hover:text-ink-900 hover:bg-ink-900/5 transition-all duration-200"
                >
                  <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" strokeWidth={2} />
                  <span className="flex-1 text-left">{item.label}</span>
                </button>
              </li>
            );
          })}
          <li>
            <button
              onClick={() => signOut()}
              className="focus-ring group w-full flex items-center gap-3 px-2.5 py-2 rounded-md text-[13px] font-medium text-ink-500 hover:text-signal-600 hover:bg-signal-500/5 transition-all duration-200"
            >
              <LogOut className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" strokeWidth={2} />
              <span className="flex-1 text-left">Sign Out</span>
            </button>
          </li>
        </ul>
      </div>
    </aside>
  );
}
