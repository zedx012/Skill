import type { SkillRow, UserStatsRow } from '@/lib/db-types';
import { pct } from '@/lib/format';

const skillColors: Record<string, string> = {
  Engineering: 'bg-blueprint-600',
  Data: 'bg-brass-500',
  Design: 'bg-signal-500',
  Strategy: 'bg-moss-500',
};

interface SkillProgressProps {
  skills: SkillRow[];
  stats: UserStatsRow | null;
}

export function SkillProgress({ skills, stats }: SkillProgressProps) {
  // Derive skill levels from total XP — each skill gets a proportional share
  const totalXp = stats?.xp ?? 0;
  const level = Math.floor(totalXp / 1000) + 1;
  const xpInLevel = totalXp % 1000;

  // Build skill progress from available skills + user's total XP distributed
  const skillEntries = skills.map((skill, i) => {
    const skillXp = Math.floor(totalXp / Math.max(skills.length, 1)) + (skills.length - i) * 50;
    const skillLevel = Math.floor(skillXp / 500) + 1;
    const xpInSkill = skillXp % 500;
    return {
      name: skill.name,
      level: skillLevel,
      xp: xpInSkill,
      nextLevelXp: 500,
      category: skill.name,
    };
  });

  return (
    <section className="bg-paper-50 rounded-xl shadow-panel overflow-hidden animate-fade-up" style={{ animationDelay: '180ms' }}>
      <div className="px-5 py-4 hairline-b">
        <span className="eyebrow-ink">Skill Levels</span>
        <div className="font-display text-[15px] font-semibold text-ink-900 tracking-tightish mt-0.5">
          Your Craft Inventory
        </div>
      </div>
      <div className="p-5 space-y-4">
        {skillEntries.map((skill, i) => {
          const progress = pct(skill.xp, skill.nextLevelXp);
          const color = skillColors[skill.category] ?? 'bg-ink-600';
          return (
            <div key={skill.name} className="animate-slide-in" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="flex items-baseline justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-medium text-ink-900">{skill.name}</span>
                  <span className="text-[10px] font-mono uppercase tracking-eyebrow text-ink-400">
                    LVL {skill.level}
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="font-mono text-[12px] text-ink-700 font-medium tabular-nums">LVL {skill.level}</span>
                  <span className="font-mono text-[10px] text-ink-400 tabular-nums">
                    {skill.xp}/{skill.nextLevelXp}
                  </span>
                </div>
              </div>
              <div className="h-1.5 bg-ink-900/8 rounded-full overflow-hidden">
                <div
                  className={`h-full ${color} rounded-full transition-all duration-1000 ease-out`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="hairline px-5 py-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-ink-400">{skills.length} skills available</span>
          <span className="font-mono text-[11px] text-ink-500 tabular-nums">
            Total: {totalXp.toLocaleString()} XP
          </span>
        </div>
      </div>
    </section>
  );
}
