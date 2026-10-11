import { SentimentResult } from '@/lib/sentiment';

interface WordBreakdownProps {
  result: SentimentResult;
}

const SENTIMENT_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  positive: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  negative: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  neutral: { bg: 'bg-slate-50', text: 'text-slate-500', border: 'border-slate-200' },
};

export default function WordBreakdown({ result }: WordBreakdownProps) {
  const scoredWords = result.words;

  if (scoredWords.length === 0) {
    return (
      <div className="text-center text-slate-400 text-sm py-8">
        No sentiment-bearing words detected in this text.
      </div>
    );
  }

  const sorted = [...scoredWords].sort((a, b) => Math.abs(b.score) - Math.abs(a.score));

  return (
    <div className="space-y-4">
      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-center">
          <div className="text-2xl font-bold text-emerald-600">{result.positiveCount}</div>
          <div className="text-xs text-emerald-700 font-medium mt-0.5">Positive</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
          <div className="text-2xl font-bold text-slate-500">{result.neutralCount}</div>
          <div className="text-xs text-slate-600 font-medium mt-0.5">Neutral</div>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-center">
          <div className="text-2xl font-bold text-red-600">{result.negativeCount}</div>
          <div className="text-xs text-red-700 font-medium mt-0.5">Negative</div>
        </div>
      </div>

      {/* Word chips */}
      <div className="flex flex-wrap gap-2">
        {sorted.map((w, i) => {
          const style = SENTIMENT_STYLES[w.sentiment];
          return (
            <span
              key={`${w.word}-${i}`}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${style.bg} ${style.text} ${style.border} text-sm font-medium transition-all hover:scale-105 hover:shadow-sm cursor-default`}
              title={`Score: ${w.score > 0 ? '+' : ''}${w.score}`}
            >
              {w.word}
              <span className="text-xs opacity-60">
                {w.score > 0 ? '+' : ''}{w.score.toFixed(2)}
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
