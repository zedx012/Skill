import { Medal, Flame, Trophy, Award, Star, Zap, Lock } from 'lucide-react';
import type { AchievementWithUnlocked } from '@/lib/db-types';

const iconMap = {
  medal: Medal,
  flame: Flame,
  trophy: Trophy,
  award: Award,
  star: Star,
  zap: Zap,
} as const;

const rarityMap = {
  common: { ring: 'ring-ink-900/10', label: 'text-ink-400', glow: '', bg: 'bg-ink-900/5', text: 'text-ink-700' },
  rare: { ring: 'ring-blueprint-500/20', label: 'text-blueprint-600', glow: 'from-blueprint-600/15', bg: 'bg-blueprint-500/10', text: 'text-blueprint-600' },
  epic: { ring: 'ring-signal-500/25', label: 'text-signal-600', glow: 'from-signal-600/15', bg: 'bg-signal-500/10', text: 'text-signal-600' },
  legendary: { ring: 'ring-brass-500/30', label: 'text-brass-600', glow: 'from-brass-500/20', bg: 'bg-brass-500/10', text: 'text-brass-600' },
} as const;

function inferRarity(name: string): keyof typeof rarityMap {
  const lower = name.toLowerCase();
  if (lower.includes('master') || lower.includes('legendary')) return 'legendary';
  if (lower.includes('iron') || lower.includes('deep')) return 'epic';
  if (lower.includes('polymath') || lower.includes('week')) return 'rare';
  return 'common';
}

interface AchievementTileProps {
  achievement: AchievementWithUnlocked;
  index: number;
}

function AchievementTile({ achievement, index }: AchievementTileProps) {
  const iconName = (achievement.icon ?? 'star').toLowerCase() as keyof typeof iconMap;
  const Icon = iconMap[iconName] ?? Star;
  const rarity = inferRarity(achievement.name);
  const r = rarityMap[rarity];
  const isUnlocked = achievement.user_achievements && achievement.user_achievements.length > 0;
  const unlockedDate = isUnlocked
    ? new Date(achievement.user_achievements[0].unlocked_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : null;

  return (
    <div
      className={`group relative bg-paper-50 rounded-lg p-4 ring-1 ${r.ring} transition-all duration-300 hover:shadow-lifted hover:-translate-y-0.5 animate-fade-up ${
        !isUnlocked ? 'opacity-60' : ''
      }`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {isUnlocked && r.glow && (
        <div className={`absolute inset-0 rounded-lg bg-gradient-to-b ${r.glow} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />
      )}
      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isUnlocked ? r.bg : 'bg-ink-900/5'}`}>
            {isUnlocked ? (
              <Icon className={`w-5 h-5 ${r.text}`} strokeWidth={2} />
            ) : (
              <Lock className="w-4 h-4 text-ink-300" strokeWidth={2} />
            )}
          </div>
          <span className={`text-[9px] font-mono uppercase tracking-eyebrow font-medium ${r.label}`}>
            {rarity}
          </span>
        </div>
        <div className="text-[13px] font-semibold text-ink-900 mb-0.5">{achievement.name}</div>
        <div className="text-[11px] text-ink-500 leading-relaxed mb-2">{achievement.description}</div>
        <div className="font-mono text-[10px] text-ink-400">
          {isUnlocked ? `Unlocked ${unlockedDate}` : 'Locked'}
        </div>
      </div>
    </div>
  );
}

interface AchievementsProps {
  achievements: AchievementWithUnlocked[];
}

export function Achievements({ achievements }: AchievementsProps) {
  const unlocked = achievements.filter((a) => a.user_achievements && a.user_achievements.length > 0).length;

  return (
    <section className="animate-fade-up" style={{ animationDelay: '240ms' }}>
      <div className="flex items-baseline justify-between mb-4">
        <div>
          <span className="eyebrow-ink">04 / Achievements</span>
          <div className="font-display text-display-sm text-ink-900 tracking-tightish mt-1">
            Trophy Cabinet
          </div>
        </div>
        <span className="font-mono text-[12px] text-ink-500 tabular-nums">
          {unlocked}/{achievements.length} unlocked
        </span>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {achievements.map((a, i) => (
          <AchievementTile key={a.id} achievement={a} index={i} />
        ))}
      </div>
    </section>
  );
}
