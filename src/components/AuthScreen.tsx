import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { Flame, Zap, ArrowRight, AlertCircle } from 'lucide-react';

export function AuthScreen() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    if (mode === 'signup') {
      if (!username.trim()) {
        setError('Please enter a username.');
        setSubmitting(false);
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        setSubmitting(false);
        return;
      }
      const { error: signUpError } = await signUp(email, password, username.trim());
      if (signUpError) {
        setError(signUpError);
        setSubmitting(false);
      }
      // On success, onAuthStateChange fires and the app switches to the dashboard
    } else {
      const { error: signInError } = await signIn(email, password);
      if (signInError) {
        setError(signInError);
        setSubmitting(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-paper-100 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Blueprint grid backdrop */}
      <div className="absolute inset-0 blueprint-grid opacity-40" />
      <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-gradient-to-b from-blueprint-700/20 to-transparent blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-b from-brass-600/15 to-transparent blur-3xl" />

      <div className="relative w-full max-w-sm">
        {/* Brand */}
        <div className="flex items-center gap-2.5 mb-8 justify-center">
          <div className="relative w-10 h-10 rounded-md bg-ink-900 flex items-center justify-center">
            <div className="absolute inset-1 rounded-sm border border-brass-400/40" />
            <div className="w-2.5 h-2.5 bg-brass-400 rounded-[1px]" />
          </div>
          <div>
            <div className="font-display font-semibold text-ink-900 text-lg leading-none tracking-tightish">
              Skilora
            </div>
            <div className="text-[9px] font-mono uppercase tracking-eyebrow text-ink-400 mt-1">
              Skill Atelier
            </div>
          </div>
        </div>

        {/* Panel */}
        <div className="bg-paper-50 rounded-xl shadow-lifted overflow-hidden">
          {/* Tab switch */}
          <div className="flex hairline-b">
            <button
              onClick={() => { setMode('signin'); setError(null); }}
              className={`focus-ring flex-1 py-3 text-[13px] font-medium transition-colors ${
                mode === 'signin'
                  ? 'text-ink-900 border-b-2 border-blueprint-600 -mb-px'
                  : 'text-ink-400 hover:text-ink-600'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode('signup'); setError(null); }}
              className={`focus-ring flex-1 py-3 text-[13px] font-medium transition-colors ${
                mode === 'signup'
                  ? 'text-ink-900 border-b-2 border-blueprint-600 -mb-px'
                  : 'text-ink-400 hover:text-ink-600'
              }`}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <span className="eyebrow-ink">
                {mode === 'signin' ? 'Welcome Back' : 'Join the Atelier'}
              </span>
              <p className="text-[13px] text-ink-500 mt-1">
                {mode === 'signin'
                  ? 'Sign in to continue your learning streak.'
                  : 'Start building skills with XP, streaks, and quests.'}
              </p>
            </div>

            {mode === 'signup' && (
              <div>
                <label className="eyebrow block mb-1.5">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="focus-ring w-full px-3 py-2.5 rounded-md border border-ink-900/10 bg-paper-100 text-[13px] text-ink-900 placeholder:text-ink-300 transition-colors"
                  placeholder="your_name"
                  autoComplete="username"
                />
              </div>
            )}

            <div>
              <label className="eyebrow block mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="focus-ring w-full px-3 py-2.5 rounded-md border border-ink-900/10 bg-paper-100 text-[13px] text-ink-900 placeholder:text-ink-300 transition-colors"
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>

            <div>
              <label className="eyebrow block mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="focus-ring w-full px-3 py-2.5 rounded-md border border-ink-900/10 bg-paper-100 text-[13px] text-ink-900 placeholder:text-ink-300 transition-colors"
                placeholder="••••••••"
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                required
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 px-3 py-2.5 rounded-md bg-signal-500/8 border border-signal-500/20 animate-fade-in">
                <AlertCircle className="w-4 h-4 text-signal-600 shrink-0 mt-0.5" strokeWidth={2} />
                <span className="text-[12px] text-signal-700 leading-relaxed">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="focus-ring group w-full flex items-center justify-center gap-2 px-4 py-3 bg-ink-900 text-paper-100 rounded-lg font-medium text-[13px] hover:bg-ink-800 transition-all duration-200 shadow-lifted hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <span className="animate-pulse-soft">Please wait…</span>
              ) : (
                <>
                  {mode === 'signin' ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" strokeWidth={2} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer hints */}
        <div className="mt-6 flex items-center justify-center gap-4 text-ink-400">
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-brass-500" strokeWidth={2} />
            <span className="text-[11px] font-mono">Earn XP</span>
          </div>
          <div className="hairline-r h-3" />
          <div className="flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-signal-500" strokeWidth={2} />
            <span className="text-[11px] font-mono">Build Streaks</span>
          </div>
          <div className="hairline-r h-3" />
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-mono">Level Up</span>
          </div>
        </div>
      </div>
    </div>
  );
}
