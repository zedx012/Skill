import { Target, Flame, Zap, Brain, Check, Clock } from 'lucide-react';
import type { DailyChallengeRow } from '@/lib/db-types';

const iconMap = {
  target: Target,
  flame: Flame,
  zap: Zap,
  brain: Brain,
  check: Check,
} as const;

const accentMap = {
  target: { text: 'text-blueprint-600', bg: 'bg-blueprint-500/8', bar: 'bg-blueprint-600' },
  flame: { text: 'text-signal-500', bg: 'bg-signal-500/8', bar: 'bg-signal-500' },
  zap: { text: 'text-brass-600', bg: 'bg-brass-500/8', bar: 'bg-brass-500' },
  brain: { text: 'text-moss-500', bg: 'bg-moss-500/8', bar: 'bg-moss-500' },
  check: { text: 'text-moss-500', bg: 'bg-moss-500/8', bar: 'bg-moss-500' },
} as const;

interface DailyQuestsProps {
  challenge: DailyChallengeRow | null;
  lessonsCompletedToday: number;
}

export function DailyQuests({ challenge, lessonsCompletedToday }: DailyQuestsProps) {
  if (!challenge) {
    return (
      <section className="bg-paper-50 rounded-xl shadow-panel overflow-hidden animate-fade-up" style={{ animationDelay: '200ms' }}>
        <div className="px-5 py-4 hairline-b">
          <span className="eyebrow-ink">03 / Daily Quests</span>
          <div className="font-display text-[15px] font-semibold text-ink-900 tracking-tightish mt-0.5">
            Today's Objectives
          </div>
        </div>
        <div className="p-8 text-center">
          <p className="text-[12px] text-ink-400">No daily challenge active. Check back tomorrow.</p>
        </div>
      </section>
    );
  }

  // Build a derived quest list from the challenge + user state
  const quests = [
    {
      id: 'daily-main',
      title: challenge.title,
      description: challenge.description ?? '',
      xp: challenge.xp_reward,
      progress: lessonsCompletedToday,
      target: 2,
      icon: 'target' as const,
    },
  ];

  const totalDone = quests.filter((q) => q.progress >= q.target).length;

  return (
    <section className="bg-paper-50 rounded-xl shadow-panel overflow-hidden animate-fade-up" style={{ animationDelay: '200ms' }}>
      <div className="px-5 py-4 hairline-b flex items-center justify-between">
        <div>
          <span className="eyebrow-ink">03 / Daily Quests</span>
          <div className="font-display text-[15px] font-semibold text-ink-900 tracking-tightish mt-0.5">
            Today's Objectives
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-ink-400" strokeWidth={2} />
          <span className="font-mono text-[11px] text-ink-400">Resets at midnight</span>
        </div>
      </div>
      <div className="divide-y divide-ink-900/5">
        {quests.map((q, i) => {
          const Icon = iconMap[q.icon];
          const a = accentMap[q.icon];
          const progressPct = Math.min(100, Math.round((q.progress / q.target) * 100));
          const isComplete = q.progress >= q.target;

          return (
            <div
              key={q.id}
              className="group flex items-center gap-3.5 px-4 py-3 hover:bg-ink-900/3 transition-colors duration-200 cursor-pointer animate-slide-in"
              style={{ animationDelay: `${i * 70}ms` }}
            >
              <div className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${a.bg}`}>
                <Icon className={`w-4 h-4 ${a.text}`} strokeWidth={2.1} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2 mb-1">
                  <span className={`text-[13px] font-medium truncate ${isComplete ? 'text-ink-400' : 'text-ink-900'}`}>
                    {q.title}
                  </span>
                  <span className="font-mono text-[11px] text-brass-600 tabular-nums shrink-0">+{q.xp} XP</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1 bg-ink-900/8 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${a.bar} rounded-full transition-all duration-700`}
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                  <span className="font-mono text-[10px] text-ink-400 tabular-nums shrink-0">
                    {q.progress}/{q.target}
                  </span>
                </div>
              </div>

              {isComplete && (
                <div className="w-5 h-5 rounded-full bg-moss-500 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-paper-50" strokeWidth={3} />
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="hairline px-5 py-3 flex items-center justify-between">
        <span className="text-[11px] text-ink-400">
          Complete for <span className="text-brass-600 font-medium">+{challenge.gem_reward} gems</span>
        </span>
        <span className="font-mono text-[11px] text-ink-500 tabular-nums">{totalDone}/{quests.length} done</span>
      </div>
    </section>
  );
}
