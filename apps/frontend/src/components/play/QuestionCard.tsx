import { useState, memo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Props {
  questionText?: string;
  hint?: string;
  difficulty?: number;
  loading?: boolean;
  isCompleted?: boolean;
  cooldownSeconds: number;
  onSubmit: (answer: string) => Promise<any>;
  questionImage?: string;
}

/**
 * QuestionCard - small presentational component for showing a question
 * Keeps the PlayPage UI code tiny and focused.
 * Memoized to prevent unnecessary re-renders.
 */
const QuestionCard = memo(function QuestionCard({
  questionText,
  hint,
  difficulty = 1,
  loading,
  isCompleted,
  cooldownSeconds,
  onSubmit,
  questionImage
}: Props) {
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!answer.trim()) {
      setMessage('Please enter an answer');
      return;
    }
    setSubmitting(true);
    setMessage(null);
    try {
      const res = await onSubmit(answer.trim());
      if (!res.ok) {
        setMessage(res.message || (res.data && res.data.result) || 'Submission failed');
      } else {
        setMessage(res.data?.result || 'Submitted');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Challenge</h2>
        <span className="px-3 py-1 rounded-full text-sm bg-muted">Difficulty: {difficulty}/5</span>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading question...</div>
      ) : (
        <>
          <div className='flex justify-center p-3'>

            {questionImage && <img src={questionImage} />}
          </div>
          <p className="text-lg mb-2">{questionText || 'No question available yet.'}</p>
          <p className="text-sm text-muted-foreground mb-4">Hint: {hint || '—'}</p>

          {isCompleted ? (
            <div className="text-center py-6">
              <div className="text-4xl">🎉</div>
              <div className="mt-2">You've completed this question.</div>
            </div>
          ) : (
            <>
              <Input
                id="answer-input"
                placeholder="Enter answer"
                value={answer}
                onChange={(e: any) => setAnswer(e.target.value)}
                disabled={cooldownSeconds > 0 || submitting}
                onKeyDown={(e: any) => e.key === 'Enter' && handleSubmit()}
              />
              <div className="mt-3 flex gap-2">
                <Button onClick={handleSubmit} disabled={submitting || cooldownSeconds > 0} className="flex-1">
                  {submitting ? 'Submitting...' : cooldownSeconds > 0 ? `Wait ${cooldownSeconds}s` : 'Submit'}
                </Button>
              </div>
              {message && <div className="mt-3 text-sm text-muted-foreground">{message}</div>}
            </>
          )}
        </>
      )}
    </div>
  );
});

export default QuestionCard;
