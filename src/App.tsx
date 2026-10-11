import { useState, useEffect, useCallback } from 'react';
import { Brain, Sparkles, Loader2, FileText, BarChart3, Trash2, RotateCcw } from 'lucide-react';
import SentimentGauge from '@/components/SentimentGauge';
import WordBreakdown from '@/components/WordBreakdown';
import HistoryPanel from '@/components/HistoryPanel';
import { analyzeSentiment, SentimentResult } from '@/lib/sentiment';
import { supabase, SentimentRecord } from '@/lib/supabase';

const SAMPLE_TEXTS = [
  "I absolutely love this product! It's incredibly well-designed and works perfectly every time. The attention to detail is outstanding.",
  "The service was terrible. My order arrived late, the quality was awful, and customer support was rude. Very disappointing experience.",
  "The weather today is okay. It's not great but not bad either. Just an ordinary day with some clouds and mild temperatures.",
  "I'm really happy with the results! The team did a fantastic job and the outcome exceeded all my expectations. Truly brilliant work!",
];

export default function App() {
  const [text, setText] = useState('');
  const [result, setResult] = useState<SentimentResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [history, setHistory] = useState<SentimentRecord[]>([]);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const loadHistory = useCallback(async () => {
    setLoadingHistory(true);
    const { data, error } = await supabase
      .from('sentiment_analysis')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Failed to load history:', error);
    } else if (data) {
      setHistory(data as SentimentRecord[]);
    }
    setLoadingHistory(false);
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleAnalyze = async () => {
    if (!text.trim() || analyzing) return;

    setAnalyzing(true);
    setSelectedHistoryId(null);

    // Simulate brief processing for UX
    await new Promise((r) => setTimeout(r, 350));

    const analysis = analyzeSentiment(text);
    setResult(analysis);

    const { error } = await supabase.from('sentiment_analysis').insert({
      input_text: text,
      sentiment: analysis.label,
      score: analysis.score,
      positive_count: analysis.positiveCount,
      negative_count: analysis.negativeCount,
      neutral_count: analysis.neutralCount,
      top_words: analysis.words,
    });

    if (error) {
      console.error('Failed to save analysis:', error);
    }

    await loadHistory();
    setAnalyzing(false);
  };

  const handleSelectHistory = (record: SentimentRecord) => {
    setSelectedHistoryId(record.id);
    setText(record.input_text);
    setResult({
      label: record.sentiment,
      score: record.score,
      positiveCount: record.positive_count,
      negativeCount: record.negative_count,
      neutralCount: record.neutral_count,
      words: record.top_words,
      confidence: Math.min(1, Math.abs(record.score) * 1.5),
    });
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('sentiment_analysis').delete().eq('id', id);
    if (error) {
      console.error('Failed to delete:', error);
      return;
    }
    setHistory((prev) => prev.filter((r) => r.id !== id));
    if (selectedHistoryId === id) {
      setSelectedHistoryId(null);
    }
  };

  const handleClear = () => {
    setText('');
    setResult(null);
    setSelectedHistoryId(null);
  };

  const handleSampleText = (sample: string) => {
    setText(sample);
    setResult(null);
    setSelectedHistoryId(null);
  };

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      {/* Header */}
      <header className="border-b border-slate-200/60 bg-white/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center shadow-md">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800 leading-tight">SentimentLens</h1>
              <p className="text-xs text-slate-400">AI-powered text sentiment analysis</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Real-time lexicon analysis</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Input + Results */}
          <div className="lg:col-span-2 space-y-6">
            {/* Input card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center gap-2">
                <FileText className="w-5 h-5 text-slate-600" />
                <h2 className="font-semibold text-slate-800">Enter Text to Analyze</h2>
              </div>
              <div className="p-5">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Type or paste any text here — a product review, a tweet, an email, a message... and see its emotional sentiment analyzed in real time."
                  className="w-full h-40 p-4 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm leading-relaxed resize-none focus:outline-none focus:border-slate-400 focus:bg-white transition-colors placeholder:text-slate-400"
                  maxLength={5000}
                />
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span>{wordCount} words</span>
                    <span>·</span>
                    <span>{charCount} / 5000 chars</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {text && (
                      <button
                        onClick={handleClear}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Clear
                      </button>
                    )}
                    <button
                      onClick={handleAnalyze}
                      disabled={!text.trim() || analyzing}
                      className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
                    >
                      {analyzing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Analyze
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Sample texts */}
            {!result && !analyzing && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-slate-600 mb-3">Try a sample text:</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {SAMPLE_TEXTS.map((sample, i) => (
                    <button
                      key={i}
                      onClick={() => handleSampleText(sample)}
                      className="text-left p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-white hover:shadow-sm transition-all group"
                    >
                      <p className="text-sm text-slate-600 leading-snug line-clamp-2 group-hover:text-slate-800">
                        {sample}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Results */}
            {result && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="p-5 border-b border-slate-100 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-slate-600" />
                  <h2 className="font-semibold text-slate-800">Analysis Results</h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    <div className="flex justify-center">
                      <SentimentGauge score={result.score} label={result.label} confidence={result.confidence} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-600 mb-3">Word Breakdown</h3>
                      <WordBreakdown result={result} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: History */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sticky top-24 h-[calc(100vh-7rem)]">
              {history.length > 0 && (
                <div className="flex justify-end mb-1">
                  <button
                    onClick={async () => {
                      const { error } = await supabase.from('sentiment_analysis').delete().neq('id', '00000000-0000-0000-0000-000000000000');
                      if (!error) {
                        setHistory([]);
                        setSelectedHistoryId(null);
                      }
                    }}
                    className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    Clear all
                  </button>
                </div>
              )}
              <HistoryPanel
                records={history}
                onSelect={handleSelectHistory}
                onDelete={handleDelete}
                selectedId={selectedHistoryId}
              />
            </div>
          </div>
        </div>

        {/* Empty state hint */}
        {!result && !analyzing && (
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 border border-slate-200 text-xs text-slate-500">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Results appear instantly after analysis — no external API calls needed
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
