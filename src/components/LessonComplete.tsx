import { useEffect, useState } from 'react';
import { Check, Zap, Gem, Trophy, ChevronRight, Home, Star } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

interface LessonCompleteProps {
  lessonId: string;
  courseId: string;
  score: number;
  totalQuestions: number;
  xpReward: number;
  gemReward: number;
  nextLessonId: string | null;
  nextLessonTitle: string | null;
  wasAlreadyCompleted: boolean;
  onContinue: (lessonId: string) => void;
  onBackToCourse: () => void;
  onBackToDashboard: () => void;
}

export function LessonComplete({
  lessonId, courseId, score, totalQuestions, xpReward, gemReward,
  nextLessonId, nextLessonTitle, wasAlreadyCompleted,
  onContinue, onBackToCourse, onBackToDashboard,
}: LessonCompleteProps) {
  const { user, refreshStats } = useAuth();
  const [saving, setSaving] = useState(true);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let active = true;

    async function saveProgress() {
      setSaving(true);
      setSaveError(null);
      try {
        const now = new Date().toISOString();

        if (!wasAlreadyCompleted) {
          // Award XP + gems by updating user_stats
          const { data: currentStats } = await supabase
            .from('user_stats')
            .select('xp, gems')
            .eq('user_id', user!.id)
            .maybeSingle();

          const currentXp = currentStats?.xp ?? 0;
          const currentGems = currentStats?.gems ?? 0;

          const { error: statsError } = await supabase
            .from('user_stats')
            .update({
              xp: currentXp + xpReward,
              gems: currentGems + gemReward,
              last_activity_date: now.split('T')[0],
            })
            .eq('user_id', user!.id);

          if (statsError) throw statsError;
        }

        // Upsert lesson progress
        const { error: progressError } = await supabase
          .from('user_lesson_progress')
          .upsert({
            user_id: user!.id,
            lesson_id: lessonId,
            completed: true,
            score: score,
            completed_at: now,
          }, { onConflict: 'user_id,lesson_id' });

        if (progressError) throw progressError;

        await refreshStats();
        if (active) setSaving(false);
      } catch (err) {
        if (!active) return;
        setSaveError(err instanceof Error ? err.message : 'Failed to save progress');
        setSaving(false);
      }
    }

    saveProgress();
    return () => { active = false; };
  }, [user, lessonId, score, xpReward, gemReward, wasAlreadyCompleted, refreshStats]);

  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
  const passed = percentage >= 60;

  return (
    <div className="flex-1 min-w-0 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 max-w-[520px] w-full mx-auto">
        {saving ? (
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-blueprint-500/10 flex items-center justify-center mx-auto mb-4 animate-pulse-soft">
              <Zap className="w-6 h-6 text-blueprint-600" strokeWidth={2} />
            </div>
            <p className="text-[14px] text-ink-400 font-mono animate-pulse-soft">Saving your progress…</p>
          </div>
        ) : saveError ? (
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-signal-500/10 flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-6 h-6 text-signal-500" strokeWidth={2} />
            </div>
            <p className="text-[14px] text-ink-500 mb-2">Your answers were recorded, but there was an issue saving rewards.</p>
            <p className="text-[12px] text-signal-600 mb-6">{saveError}</p>
            <button onClick={onBackToCourse} className="focus-ring px-5 py-3 bg-ink-900 text-paper-100 rounded-lg font-medium text-[13px]">
              Back to Course
            </button>
          </div>
        ) : (
          <div className="w-full text-center animate-fade-up">
            {/* Trophy icon */}
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5 ${
              passed ? 'bg-moss-500/10' : 'bg-brass-500/10'
            }`}>
              {passed ? (
                <Trophy className="w-8 h-8 text-moss-500" strokeWidth={2} />
              ) : (
                <Star className="w-8 h-8 text-brass-500" strokeWidth={2} />
              )}
            </div>

            <h1 className="font-display text-display-md text-ink-900 tracking-tightish mb-2">
              Lesson Complete
            </h1>
            <p className="text-[14px] text-ink-500 mb-8">
              {passed ? 'Great work — you passed this lesson.' : 'Lesson completed. Keep practicing to improve your score.'}
            </p>

            {/* Score card */}
            <div className="bg-paper-50 rounded-xl shadow-panel overflow-hidden mb-6">
              <div className="grid grid-cols-3 divide-x divide-ink-900/8">
                {/* Score */}
                <div className="px-4 py-5">
                  <div className="eyebrow mb-1.5">Score</div>
                  <div className="font-mono text-2xl font-semibold text-ink-900 tabular-nums">
                    {score}<span className="text-ink-400 text-sm font-normal">/{totalQuestions}</span>
                  </div>
                  <div className="text-[11px] text-ink-400 font-mono mt-1">{percentage}%</div>
                </div>

                {/* XP */}
                <div className="px-4 py-5">
                  <div className="eyebrow mb-1.5">XP Earned</div>
                  <div className="flex items-center justify-center gap-1.5">
                    <Zap className="w-5 h-5 text-brass-500" strokeWidth={2} />
                    <span className="font-mono text-2xl font-semibold text-brass-600 tabular-nums">
                      {wasAlreadyCompleted ? 0 : '+' + xpReward}
                    </span>
                  </div>
                  <div className="text-[11px] text-ink-400 mt-1">
                    {wasAlreadyCompleted ? 'Already earned' : 'Added to total'}
                  </div>
                </div>

                {/* Gems */}
                <div className="px-4 py-5">
                  <div className="eyebrow mb-1.5">Gems</div>
                  <div className="flex items-center justify-center gap-1.5">
                    <Gem className="w-5 h-5 text-blueprint-500" strokeWidth={2} />
                    <span className="font-mono text-2xl font-semibold text-blueprint-600 tabular-nums">
                      {wasAlreadyCompleted ? 0 : '+' + gemReward}
                    </span>
                  </div>
                  <div className="text-[11px] text-ink-400 mt-1">
                    {wasAlreadyCompleted ? 'Already earned' : 'Added to total'}
                  </div>
                </div>
              </div>
            </div>

            {wasAlreadyCompleted && (
              <p className="text-[12px] text-ink-400 mb-6 flex items-center justify-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-moss-500" strokeWidth={2} />
                You already completed this lesson — rewards are only awarded once.
              </p>
            )}

            {/* Actions */}
            <div className="space-y-3">
              {nextLessonId && nextLessonTitle && (
                <button
                  onClick={() => onContinue(nextLessonId)}
                  className="focus-ring group w-full flex items-center justify-center gap-2.5 px-5 py-3.5 bg-ink-900 text-paper-100 rounded-lg font-medium text-[14px] hover:bg-ink-800 transition-all duration-200 shadow-lifted"
                >
                  Continue to: {nextLessonTitle}
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" strokeWidth={2} />
                </button>
              )}

              <div className="flex gap-3">
                <button
                  onClick={onBackToCourse}
                  className="focus-ring flex-1 px-5 py-3 bg-paper-50 hairline-b border rounded-lg font-medium text-[13px] text-ink-700 hover:bg-paper-200 transition-colors"
                >
                  Back to Course
                </button>
                <button
                  onClick={onBackToDashboard}
                  className="focus-ring flex-1 flex items-center justify-center gap-1.5 px-5 py-3 bg-paper-50 hairline-b border rounded-lg font-medium text-[13px] text-ink-700 hover:bg-paper-200 transition-colors"
                >
                  <Home className="w-3.5 h-3.5" strokeWidth={2} />
                  Dashboard
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
