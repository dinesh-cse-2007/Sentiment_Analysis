import { Trash2, Clock } from 'lucide-react';
import { SentimentRecord } from '@/lib/supabase';

interface HistoryPanelProps {
  records: SentimentRecord[];
  onSelect: (record: SentimentRecord) => void;
  onDelete: (id: string) => void;
  selectedId: string | null;
}

const SENTIMENT_DOT: Record<string, string> = {
  positive: 'bg-emerald-500',
  negative: 'bg-red-500',
  neutral: 'bg-slate-400',
};

const SENTIMENT_LABEL: Record<string, string> = {
  positive: 'text-emerald-600',
  negative: 'text-red-600',
  neutral: 'text-slate-500',
};

function formatTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString();
}

export default function HistoryPanel({ records, onSelect, onDelete, selectedId }: HistoryPanelProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-slate-600" />
        <h3 className="text-lg font-semibold text-slate-800">History</h3>
        {records.length > 0 && (
          <span className="ml-auto text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
            {records.length}
          </span>
        )}
      </div>

      {records.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 text-center py-12">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-3">
            <Clock className="w-8 h-8 text-slate-300" />
          </div>
          <p className="text-sm text-slate-400 max-w-[200px]">
            Your analyzed texts will appear here for quick review.
          </p>
        </div>
      ) : (
        <div className="space-y-2 overflow-y-auto flex-1 pr-1">
          {records.map((record) => (
            <div
              key={record.id}
              onClick={() => onSelect(record)}
              className={`group cursor-pointer rounded-xl border p-3 transition-all ${
                selectedId === record.id
                  ? 'border-slate-800 bg-slate-50 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
              }`}
            >
              <div className="flex items-start gap-2">
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${SENTIMENT_DOT[record.sentiment]}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700 line-clamp-2 leading-snug">
                    {record.input_text}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className={`text-xs font-semibold capitalize ${SENTIMENT_LABEL[record.sentiment]}`}>
                      {record.sentiment}
                    </span>
                    <span className="text-xs text-slate-400">
                      {record.score > 0 ? '+' : ''}{record.score.toFixed(2)}
                    </span>
                    <span className="text-xs text-slate-300 ml-auto">{formatTime(record.created_at)}</span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(record.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 flex-shrink-0"
                  aria-label="Delete record"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
