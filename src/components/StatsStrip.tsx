import { useEffect, useRef, useState } from 'react';
import { Flame, Zap, Trophy, Clock, Gem } from 'lucide-react';
import type { UserStatsRow, ProfileRow } from '@/lib/db-types';
import { padNumber, formatNumber } from '@/lib/format';

interface StatCellProps {
  label: string;
  value: number;
  suffix?: string;
  sub?: string;
  icon: typeof Flame;
  accent: 'signal' | 'brass' | 'blueprint' | 'moss' | 'ink';
  animated: boolean;
}

const accentMap = {
  signal: { text: 'text-signal-500', bg: 'bg-signal-500/8', ring: 'text-signal-400' },
  brass: { text: 'text-brass-600', bg: 'bg-brass-500/8', ring: 'text-brass-500' },
  blueprint: { text: 'text-blueprint-600', bg: 'bg-blueprint-500/8', ring: 'text-blueprint-500' },
  moss: { text: 'text-moss-500', bg: 'bg-moss-500/8', ring: 'text-moss-400' },
  ink: { text: 'text-ink-700', bg: 'bg-ink-900/5', ring: 'text-ink-500' },
} as const;

function useCountUp(target: number, durationMs: number = 800) {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(target * eased));
      if (t < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, durationMs]);

  return value;
}

function StatCell({ label, value, suffix, sub, icon: Icon, accent, animated }: StatCellProps) {
  const displayValue = useCountUp(value, animated ? 900 : 0);
  const a = accentMap[accent];

  return (
    <div className="flex items-center gap-3 px-5 py-3 flex-1 min-w-0 group">
      <div className={`w-8 h-8 rounded-md flex items-center justify-center ${a.bg} shrink-0`}>
        <Icon className={`w-4 h-4 ${a.text}`} strokeWidth={2.1} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="eyebrow mb-0.5 truncate">{label}</div>
        <div className="flex items-baseline gap-1">
          <span className={`font-mono text-lg font-semibold tabular-nums text-ink-900 ${animated ? 'animate-count' : ''}`}>
            {typeof value === 'number' && value >= 1000 ? formatNumber(displayValue) : displayValue}
          </span>
          {suffix && <span className="text-[11px] text-ink-400 font-mono">{suffix}</span>}
        </div>
        {sub && <div className="text-[10px] text-ink-400 mt-0.5 truncate">{sub}</div>}
      </div>
    </div>
  );
}

const XP_PER_LEVEL = 1000;

function levelFromXp(xp: number) {
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const xpInLevel = xp % XP_PER_LEVEL;
  return { level, xpInLevel, xpToNext: XP_PER_LEVEL };
}

interface StatsStripProps {
  stats: UserStatsRow | null;
  profile: ProfileRow | null;
  achievementsUnlocked: number;
  achievementsTotal: number;
}

export function StatsStrip({ stats, profile, achievementsUnlocked, achievementsTotal }: StatsStripProps) {
  if (!stats) {
    return (
      <div className="bg-paper-50 hairline-b h-[60px] shimmer-bg animate-shimmer" />
    );
  }

  const { level, xpInLevel, xpToNext } = levelFromXp(stats.xp);
  const dailyGoal = profile?.daily_goal ?? 20;

  return (
    <div className="bg-paper-50 hairline-b overflow-hidden animate-fade-up">
      <div className="flex flex-col sm:flex-row">
        <StatCell
          label="Day Streak"
          value={stats.streak}
          suffix="days"
          icon={Flame}
          accent="signal"
          animated
        />
        <div className="hairline sm:hairline-r sm:border-t-0 border-t" />
        <StatCell
          label="Total XP"
          value={stats.xp}
          sub={`LVL ${level} · ${padNumber(xpInLevel)}/${padNumber(xpToNext)} to next`}
          icon={Zap}
          accent="brass"
          animated
        />
        <div className="hairline sm:hairline-r sm:border-t-0 border-t" />
        <StatCell
          label="Gems"
          value={stats.gems}
          sub="Premium currency"
          icon={Gem}
          accent="blueprint"
          animated
        />
        <div className="hairline sm:hairline-r sm:border-t-0 border-t" />
        <StatCell
          label="Hearts"
          value={stats.hearts}
          sub="Retry hearts"
          icon={Clock}
          accent="moss"
          animated
        />
        <div className="hairline sm:hairline-r sm:border-t-0 border-t" />
        <StatCell
          label="Achievements"
          value={achievementsUnlocked}
          sub={`of ${achievementsTotal} unlocked`}
          icon={Trophy}
          accent="ink"
          animated
        />
      </div>
    </div>
  );
}
