import { AuthProvider, useAuth } from '@/lib/auth';
import { useDashboardData } from '@/lib/use-dashboard-data';
import { Sidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';
import { StatsStrip } from '@/components/StatsStrip';
import { ContinueLearning } from '@/components/ContinueLearning';
import { SkillPaths } from '@/components/SkillPaths';
import { DailyQuests } from '@/components/DailyQuests';
import { Achievements } from '@/components/Achievements';
import { SkillProgress } from '@/components/SkillProgress';
import { AuthScreen } from '@/components/AuthScreen';

function Dashboard() {
  const { profile, stats } = useAuth();
  const {
    skills,
    courses,
    continueCourse,
    continueLessons,
    progress,
    achievements,
    dailyChallenge,
    loading,
  } = useDashboardData();

  const username = profile?.username ?? 'there';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const streak = stats?.streak ?? 0;
  const achievementsUnlocked = achievements.filter(
    (a) => a.user_achievements && a.user_achievements.length > 0
  ).length;
  const lessonsCompletedToday = progress.filter((p) => p.completed).length;

  if (loading) {
    return (
      <div className="flex-1 min-w-0 flex flex-col">
        <TopBar />
        <div className="h-[60px] shimmer-bg animate-shimmer" />
        <main className="flex-1 px-6 lg:px-10 py-8 max-w-[1280px] w-full mx-auto">
          <div className="h-8 w-64 shimmer-bg rounded animate-shimmer mb-6" />
          <div className="h-64 shimmer-bg rounded-xl animate-shimmer mb-6" />
          <div className="grid lg:grid-cols-2 gap-5 mb-6">
            <div className="h-48 shimmer-bg rounded-xl animate-shimmer" />
            <div className="h-48 shimmer-bg rounded-xl animate-shimmer" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex-1 min-w-0 flex flex-col">
      <TopBar />
      <StatsStrip
        stats={stats}
        profile={profile}
        achievementsUnlocked={achievementsUnlocked}
        achievementsTotal={achievements.length}
      />

      <main className="flex-1 px-6 lg:px-10 py-8 max-w-[1280px] w-full mx-auto">
        {/* Greeting */}
        <div className="mb-7 animate-fade-up">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="eyebrow-ink">Dashboard</span>
            <span className="font-mono text-[10px] text-ink-400">
              · {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
          </div>
          <h1 className="font-display text-display-lg text-ink-900 tracking-tightish text-balance">
            {greeting}, {username}.
          </h1>
          <p className="text-[14px] text-ink-500 mt-1.5">
            {streak > 0 ? (
              <>You're on a <span className="font-mono text-signal-600 font-medium">{streak}-day streak</span>. Pick up where you left off, or explore a new skill path below.</>
            ) : (
              <>Welcome to your atelier. Start a course to begin earning XP and building your streak.</>
            )}
          </p>
        </div>

        {/* Continue Learning — dominant module */}
        <div className="mb-10">
          <ContinueLearning course={continueCourse} lessons={continueLessons} progress={progress} />
        </div>

        {/* Quests + Skill Progress side by side */}
        <div className="grid lg:grid-cols-[1.4fr_1fr] gap-5 mb-10">
          <DailyQuests challenge={dailyChallenge} lessonsCompletedToday={lessonsCompletedToday} />
          <SkillProgress skills={skills} stats={stats} />
        </div>

        {/* Skill Paths catalog */}
        <div className="mb-10">
          <SkillPaths courses={courses} progress={progress} />
        </div>

        {/* Achievements */}
        <div className="mb-6">
          <Achievements achievements={achievements} />
        </div>

        {/* Footer */}
        <footer className="hairline pt-5 pb-2 flex items-center justify-between">
          <span className="text-[11px] text-ink-400 font-mono">Skilora · Skill Atelier v0.1</span>
          <span className="text-[11px] text-ink-400">Built for builders, not browsers.</span>
        </footer>
      </main>
    </div>
  );
}

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-paper-100 flex items-center justify-center">
        <div className="text-[13px] font-mono text-ink-400 animate-pulse-soft">Loading…</div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <div className="min-h-screen bg-paper-100 flex">
      <Sidebar />
      <Dashboard />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
