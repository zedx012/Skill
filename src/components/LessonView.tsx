import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Check, X, ChevronRight, Heart, Zap, Gem, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import type { QuestionWithOptions, LessonOptionRow } from '@/lib/db-types';

interface LessonViewProps {
  lessonId: string;
  courseId: string;
  lessonTitle: string;
  questions: QuestionWithOptions[];
  loading: boolean;
  error: string | null;
  onBack: () => void;
  onComplete: (score: number, totalQuestions: number) => void;
  onOutofHearts: () => void;
}

export function LessonView({
  lessonId, lessonTitle, questions, loading, error, onBack, onComplete, onOutofHearts,
}: LessonViewProps) {
  const { user, stats, refreshStats } = useAuth();
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [hearts, setHearts] = useState(stats?.hearts ?? 5);
  const [submitting, setSubmitting] = useState(false);
  const [outOfHearts, setOutOfHearts] = useState(false);
  const [heartError, setHeartError] = useState<string | null>(null);

  // Sync hearts from stats on mount
  useEffect(() => {
    if (stats) {
      setHearts(stats.hearts);
      if (stats.hearts === 0) setOutOfHearts(true);
    }
  }, [stats]);

  const question = questions[currentQ];
  const totalQuestions = questions.length;
  const progressPct = totalQuestions > 0 ? Math.round((currentQ / totalQuestions) * 100) : 0;

  const deductHeart = useCallback(async () => {
    if (!user) return;
    setSubmitting(true);
    setHeartError(null);
    try {
      const newHearts = Math.max(0, hearts - 1);
      const { error: updateError } = await supabase
        .from('user_stats')
        .update({ hearts: newHearts })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      setHearts(newHearts);
      await refreshStats();

      if (newHearts === 0) {
        setOutOfHearts(true);
      }
    } catch (err) {
      setHeartError(err instanceof Error ? err.message : 'Failed to update hearts');
    } finally {
      setSubmitting(false);
    }
  }, [user, hearts, refreshStats]);

  const handleSelectAnswer = useCallback((optionId: string) => {
    if (answered || submitting || outOfHearts) return;
    setSelectedOption(optionId);
  }, [answered, submitting, outOfHearts]);

  const handleSubmitAnswer = useCallback(() => {
    if (!selectedOption || answered || submitting || outOfHearts || !question) return;
    setAnswered(true);

    const correctOption = question.lesson_options.find((o) => o.is_correct);
    const isCorrect = selectedOption === correctOption?.id;

    if (isCorrect) {
      setCorrectCount((c) => c + 1);
    } else {
      // Deduct heart for incorrect answer
      deductHeart();
    }
  }, [selectedOption, answered, submitting, outOfHearts, question, deductHeart]);

  const handleNextQuestion = useCallback(() => {
    if (currentQ + 1 >= totalQuestions) {
      // Lesson complete
      onComplete(correctCount, totalQuestions);
    } else {
      setCurrentQ((q) => q + 1);
      setSelectedOption(null);
      setAnswered(false);
    }
  }, [currentQ, totalQuestions, correctCount, onComplete]);

  if (loading) {
    return (
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="h-[52px] hairline-b bg-paper-50" />
        <div className="flex-1 px-6 lg:px-10 py-8 max-w-[700px] w-full mx-auto">
          <div className="h-6 w-32 shimmer-bg rounded animate-shimmer mb-4" />
          <div className="h-32 shimmer-bg rounded-xl animate-shimmer mb-4" />
          <div className="h-12 shimmer-bg rounded-lg animate-shimmer mb-3" />
          <div className="h-12 shimmer-bg rounded-lg animate-shimmer mb-3" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 min-w-0 flex flex-col items-center justify-center p-8">
        <AlertCircle className="w-8 h-8 text-signal-500 mb-3" strokeWidth={1.5} />
        <p className="text-[14px] text-ink-500 mb-4">{error}</p>
        <button onClick={onBack} className="focus-ring px-4 py-2 bg-ink-900 text-paper-100 rounded-lg text-[13px] font-medium">
          Back to Course
        </button>
      </div>
    );
  }

  if (totalQuestions === 0) {
    return (
      <div className="flex-1 min-w-0 flex flex-col items-center justify-center p-8">
        <p className="text-[14px] text-ink-400 mb-4">This lesson has no questions yet.</p>
        <button onClick={onBack} className="focus-ring px-4 py-2 bg-ink-900 text-paper-100 rounded-lg text-[13px] font-medium">
          Back to Course
        </button>
      </div>
    );
  }

  // Out of hearts state
  if (outOfHearts) {
    return (
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="sticky top-0 z-30 bg-paper-100/80 backdrop-blur-md hairline-b">
          <div className="flex items-center justify-between px-6 lg:px-10 py-3.5 max-w-[700px] w-full mx-auto">
            <button onClick={onBack} className="focus-ring flex items-center gap-1.5 text-[12px] font-medium text-ink-500 hover:text-ink-900 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" strokeWidth={2} />
              Back to Course
            </button>
            <div className="flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-signal-500 fill-signal-500" strokeWidth={2} />
              <span className="font-mono text-[13px] text-signal-600 font-medium tabular-nums">0</span>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 max-w-[500px] w-full mx-auto text-center">
          <div className="w-16 h-16 rounded-full bg-signal-500/10 flex items-center justify-center mb-5">
            <Heart className="w-8 h-8 text-signal-500" strokeWidth={2} />
          </div>
          <h1 className="font-display text-display-sm text-ink-900 tracking-tightish mb-2">
            Out of Hearts
          </h1>
          <p className="text-[14px] text-ink-500 leading-relaxed mb-8">
            You've used all your hearts for now. Come back later to continue this lesson — your progress so far has been saved.
          </p>
          <button
            onClick={onOutofHearts}
            className="focus-ring group inline-flex items-center gap-2.5 px-5 py-3 bg-ink-900 text-paper-100 rounded-lg font-medium text-[13px] hover:bg-ink-800 transition-all duration-200 shadow-lifted"
          >
            Return to Dashboard
            <ChevronRight className="w-4 h-4 opacity-60 group-hover:translate-x-0.5 group-hover:opacity-100 transition-all" strokeWidth={2} />
          </button>
        </div>
      </div>
    );
  }

  const correctOptionId = question?.lesson_options.find((o) => o.is_correct)?.id;
  const isCorrect = answered && selectedOption === correctOptionId;

  return (
    <div className="flex-1 min-w-0 flex flex-col">
      {/* Header with progress + hearts */}
      <div className="sticky top-0 z-30 bg-paper-100/80 backdrop-blur-md hairline-b">
        <div className="flex items-center gap-4 px-6 lg:px-10 py-3.5 max-w-[700px] w-full mx-auto">
          <button onClick={onBack} className="focus-ring flex items-center gap-1.5 text-[12px] font-medium text-ink-500 hover:text-ink-900 transition-colors shrink-0">
            <ArrowLeft className="w-3.5 h-3.5" strokeWidth={2} />
            <span className="hidden sm:inline">Exit</span>
          </button>

          {/* Progress bar */}
          <div className="flex-1 h-2 bg-ink-900/8 rounded-full overflow-hidden">
            <div
              className="h-full bg-blueprint-600 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          {/* Hearts */}
          <div className="flex items-center gap-1.5 shrink-0">
            <Heart className="w-4 h-4 text-signal-500 fill-signal-500" strokeWidth={2} />
            <span className="font-mono text-[13px] text-ink-700 font-medium tabular-nums">{hearts}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 px-6 lg:px-10 py-8 max-w-[700px] w-full mx-auto">
        {/* Question counter */}
        <div className="flex items-baseline justify-between mb-4 animate-fade-up">
          <span className="eyebrow-ink">{lessonTitle}</span>
          <span className="font-mono text-[12px] text-ink-500 tabular-nums">
            Question {currentQ + 1} of {totalQuestions}
          </span>
        </div>

        {/* Question */}
        <div key={currentQ} className="animate-fade-up">
          <h1 className="font-display text-[22px] font-semibold text-ink-900 tracking-tightish leading-snug mb-6 text-balance">
            {question?.question}
          </h1>

          {/* Options */}
          <div className="space-y-2.5 mb-6">
            {question?.lesson_options.map((option: LessonOptionRow) => {
              const isSelected = selectedOption === option.id;
              const showCorrect = answered && option.is_correct;
              const showIncorrect = answered && isSelected && !option.is_correct;

              return (
                <button
                  key={option.id}
                  onClick={() => handleSelectAnswer(option.id)}
                  disabled={answered || submitting}
                  className={`focus-ring w-full flex items-center gap-3 px-4 py-3.5 rounded-lg border text-left transition-all duration-200 ${
                    showCorrect
                      ? 'border-moss-500 bg-moss-500/8'
                      : showIncorrect
                      ? 'border-signal-500 bg-signal-500/8'
                      : isSelected
                      ? 'border-blueprint-500 bg-blueprint-500/8'
                      : answered
                      ? 'border-ink-900/8 bg-paper-50 opacity-50'
                      : 'border-ink-900/10 bg-paper-50 hover:border-ink-900/20 hover:bg-paper-200'
                  }`}
                >
                  <div className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors ${
                    showCorrect
                      ? 'border-moss-500 bg-moss-500'
                      : showIncorrect
                      ? 'border-signal-500 bg-signal-500'
                      : isSelected
                      ? 'border-blueprint-500 bg-blueprint-500'
                      : 'border-ink-900/15'
                  }`}>
                    {showCorrect ? (
                      <Check className="w-3.5 h-3.5 text-paper-50" strokeWidth={3} />
                    ) : showIncorrect ? (
                      <X className="w-3.5 h-3.5 text-paper-50" strokeWidth={3} />
                    ) : isSelected ? (
                      <div className="w-2 h-2 rounded-full bg-paper-50" />
                    ) : null}
                  </div>
                  <span className={`text-[14px] flex-1 ${
                    showCorrect ? 'text-moss-700 font-medium'
                    : showIncorrect ? 'text-signal-700 font-medium'
                    : isSelected ? 'text-ink-900 font-medium'
                    : 'text-ink-700'
                  }`}>
                    {option.option_text}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Feedback */}
          {answered && (
            <div className={`rounded-lg p-4 mb-6 animate-fade-in ${
              isCorrect ? 'bg-moss-500/8 border border-moss-500/20' : 'bg-signal-500/8 border border-signal-500/20'
            }`}>
              <div className="flex items-start gap-2.5">
                <div className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                  isCorrect ? 'bg-moss-500' : 'bg-signal-500'
                }`}>
                  {isCorrect ? (
                    <Check className="w-3.5 h-3.5 text-paper-50" strokeWidth={3} />
                  ) : (
                    <X className="w-3.5 h-3.5 text-paper-50" strokeWidth={3} />
                  )}
                </div>
                <div>
                  <div className={`text-[13px] font-semibold mb-1 ${
                    isCorrect ? 'text-moss-700' : 'text-signal-700'
                  }`}>
                    {isCorrect ? 'Correct!' : 'Not quite right'}
                  </div>
                  {question?.explanation && (
                    <div className="text-[13px] text-ink-600 leading-relaxed">
                      {question.explanation}
                    </div>
                  )}
                  {!isCorrect && (
                    <div className="text-[12px] text-signal-600 mt-2 flex items-center gap-1">
                      <Heart className="w-3 h-3 fill-signal-500 text-signal-500" strokeWidth={2} />
                      <span className="font-mono">-1 heart</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {heartError && (
            <div className="text-[12px] text-signal-600 mb-4">{heartError}</div>
          )}

          {/* Action button */}
          {!answered ? (
            <button
              onClick={handleSubmitAnswer}
              disabled={!selectedOption || submitting}
              className="focus-ring group w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-ink-900 text-paper-100 rounded-lg font-medium text-[14px] hover:bg-ink-800 transition-all duration-200 shadow-lifted disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? 'Checking…' : 'Check Answer'}
            </button>
          ) : (
            <button
              onClick={handleNextQuestion}
              className="focus-ring group w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-ink-900 text-paper-100 rounded-lg font-medium text-[14px] hover:bg-ink-800 transition-all duration-200 shadow-lifted"
            >
              {currentQ + 1 >= totalQuestions ? 'Finish Lesson' : 'Next Question'}
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" strokeWidth={2} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
