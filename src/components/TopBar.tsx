import { Search, Bell, ChevronDown } from 'lucide-react';
import { useAuth } from '@/lib/auth';

export function TopBar() {
  const { profile, stats } = useAuth();

  const username = profile?.username ?? 'User';
  const initials = username.slice(0, 2).toUpperCase();
  const level = stats ? Math.floor(stats.xp / 1000) + 1 : 1;

  return (
    <header className="sticky top-0 z-30 bg-paper-100/80 backdrop-blur-md hairline-b">
      <div className="flex items-center justify-between px-6 lg:px-10 py-3.5">
        {/* Breadcrumb / context */}
        <div className="flex items-center gap-2">
          <span className="eyebrow-ink">Workspace</span>
          <span className="text-ink-300 text-xs">/</span>
          <span className="text-[13px] font-medium text-ink-900">Dashboard</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2.5">
          <button className="focus-ring group flex items-center gap-2 px-3 py-1.5 rounded-md hairline-b border bg-paper-50 hover:bg-paper-200 transition-colors duration-200">
            <Search className="w-3.5 h-3.5 text-ink-400 group-hover:text-ink-700" strokeWidth={2} />
            <span className="text-[12px] text-ink-400 hidden sm:inline">Search paths, skills…</span>
            <kbd className="hidden md:inline font-mono text-[10px] text-ink-400 bg-ink-900/5 px-1.5 py-0.5 rounded">
              ⌘K
            </kbd>
          </button>

          <button className="focus-ring relative p-2 rounded-md hover:bg-ink-900/5 transition-colors duration-200">
            <Bell className="w-4 h-4 text-ink-600" strokeWidth={2} />
          </button>

          <div className="hairline-r h-6 mx-0.5" />

          <button className="focus-ring flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-md hover:bg-ink-900/5 transition-colors duration-200">
            <div className="w-7 h-7 rounded-full bg-blueprint-600 flex items-center justify-center text-paper-100 text-[11px] font-mono font-semibold">
              {initials}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-[12px] font-medium text-ink-900 leading-none">{username}</div>
              <div className="text-[10px] text-ink-400 font-mono mt-0.5">LVL {level}</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-ink-400 hidden sm:block" strokeWidth={2} />
          </button>
        </div>
      </div>
    </header>
  );
}
