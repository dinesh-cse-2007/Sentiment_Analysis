import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface SentimentRecord {
  id: string;
  input_text: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  score: number;
  positive_count: number;
  negative_count: number;
  neutral_count: number;
  top_words: Array<{ word: string; sentiment: string; score: number; index: number }>;
  created_at: string;
}
