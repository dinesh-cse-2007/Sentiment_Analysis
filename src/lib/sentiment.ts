export type SentimentLabel = 'positive' | 'negative' | 'neutral';

export interface WordAnalysis {
  word: string;
  sentiment: SentimentLabel;
  score: number;
  index: number;
}

export interface SentimentResult {
  label: SentimentLabel;
  score: number;
  positiveCount: number;
  negativeCount: number;
  neutralCount: number;
  words: WordAnalysis[];
  confidence: number;
}

const POSITIVE_WORDS: Record<string, number> = {
  good: 0.7, great: 0.9, excellent: 1.0, amazing: 1.0, awesome: 0.9,
  fantastic: 1.0, wonderful: 0.9, love: 1.0, like: 0.4, happy: 0.8,
  glad: 0.6, pleased: 0.7, best: 0.9, better: 0.6, beautiful: 0.8,
  perfect: 1.0, brilliant: 0.9, superb: 0.9, delightful: 0.8, enjoyable: 0.7,
  positive: 0.6, success: 0.8, successful: 0.8, win: 0.7, winning: 0.7,
  benefit: 0.6, beneficial: 0.6, help: 0.4, helpful: 0.6, recommend: 0.7,
  recommended: 0.7, impressive: 0.8, outstanding: 1.0, exceptional: 0.9,
  remarkable: 0.8, stunning: 0.9, gorgeous: 0.8, lovely: 0.8, marvelous: 0.9,
  terrific: 0.8, fabulous: 0.9, incredible: 1.0, magnificent: 0.9,
  pleasant: 0.6, pleasing: 0.7, grateful: 0.7, thankful: 0.7, joy: 0.8,
  joyful: 0.8, excited: 0.8, exciting: 0.8, thrilling: 0.8, charming: 0.7,
  elegant: 0.7, sleek: 0.6, smooth: 0.5, fast: 0.5, easy: 0.5,
  simple: 0.4, clear: 0.4, intuitive: 0.7, powerful: 0.7, effective: 0.6,
  efficient: 0.6, productive: 0.6, satisfying: 0.7, satisfied: 0.7,
  nice: 0.5, cool: 0.5, fun: 0.6, enjoy: 0.7, enjoyed: 0.7,
  admire: 0.6, appreciated: 0.7, appreciate: 0.6, favor: 0.5, favorite: 0.8,
  hope: 0.4, hopeful: 0.5, optimistic: 0.6, bless: 0.7, blessed: 0.7,
  bright: 0.5, generous: 0.7, kind: 0.6, warm: 0.5,
  welcome: 0.6, calm: 0.4, peaceful: 0.6, comfortable: 0.6,
  confident: 0.6, proud: 0.7, relief: 0.6, relieved: 0.6,
};

const NEGATIVE_WORDS: Record<string, number> = {
  bad: -0.7, terrible: -0.9, horrible: -1.0, awful: -0.9, hate: -1.0,
  dislike: -0.6, sad: -0.7, angry: -0.8, mad: -0.6, upset: -0.7,
  disappointed: -0.8, disappointing: -0.8, worst: -1.0, worse: -0.6,
  ugly: -0.7, poor: -0.6, fail: -0.8, failure: -0.8, failing: -0.8,
  broken: -0.7, boring: -0.6, dull: -0.5, annoying: -0.7, frustrated: -0.8,
  frustration: -0.8, frustrating: -0.8, painful: -0.8, pain: -0.7,
  hurt: -0.6, difficult: -0.5, hard: -0.3, confusing: -0.6, confused: -0.6,
  slow: -0.5, complicated: -0.5, complex: -0.3, messy: -0.6, sloppy: -0.6,
  useless: -0.8, worthless: -0.8, waste: -0.7, wasting: -0.7, wasted: -0.7,
  regret: -0.7, regretful: -0.7, sorry: -0.4, unhappy: -0.7, miserable: -0.9,
  depressing: -0.8, depressed: -0.8, negative: -0.6, weak: -0.5, wrong: -0.5,
  error: -0.6, errors: -0.6, bug: -0.6, buggy: -0.7, crash: -0.7,
  crashes: -0.7, crashing: -0.7, problem: -0.6, problems: -0.6, issue: -0.5,
  issues: -0.5, complaint: -0.7, complain: -0.6, complaining: -0.6,
  unfair: -0.6, unjust: -0.7, evil: -0.9, cruel: -0.8, hostile: -0.7,
  bitter: -0.6, disgusting: -0.9, gross: -0.6, nasty: -0.7, rotten: -0.7,
  stupid: -0.8, dumb: -0.6, foolish: -0.6, ridiculous: -0.6, absurd: -0.5,
  shame: -0.7, shameful: -0.7, embarrass: -0.6, embarrassing: -0.7,
  fear: -0.6, afraid: -0.6, scared: -0.7, terrified: -0.8, anxious: -0.6,
  worry: -0.5, worried: -0.6, nervous: -0.5, stressed: -0.6, stress: -0.5,
  tired: -0.4, exhausted: -0.6, lonely: -0.6, alone: -0.4, rejected: -0.7,
  ignored: -0.5, forgotten: -0.5, lost: -0.4, stuck: -0.5, trapped: -0.7,
  threat: -0.7, dangerous: -0.7, harmful: -0.6, damage: -0.6, damaged: -0.6,
  false: -0.4, lie: -0.6, dishonest: -0.7,
};

const NEGATORS = new Set([
  'not', 'no', 'never', "n't", 'neither', 'nor', 'cannot', "can't",
  "don't", "doesn't", "didn't", "won't", "wouldn't", "shouldn't",
  "couldn't", "isn't", "aren't", "wasn't", "weren't", "haven't",
  "hasn't", "hadn't", 'without', 'hardly', 'barely', 'rarely',
]);

const INTENSIFIERS: Record<string, number> = {
  very: 1.5, really: 1.4, so: 1.3, extremely: 1.8, incredibly: 1.7,
  absolutely: 1.6, totally: 1.4, completely: 1.5, utterly: 1.6,
  quite: 1.2, rather: 1.2, particularly: 1.3, exceptionally: 1.6,
  remarkably: 1.5, especially: 1.3, super: 1.4, highly: 1.4,
  deeply: 1.5, truly: 1.3, genuinely: 1.3,
};

const DIMINISHERS: Record<string, number> = {
  slightly: 0.5, somewhat: 0.6, kind: 0.7, sort: 0.7, barely: 0.3,
  hardly: 0.3, little: 0.5, a: 0.8, bit: 0.7,
  moderately: 0.7, fairly: 0.8, rather: 0.9,
};

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s']/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter((w) => w.length > 0);
}

function getWordScore(word: string): number {
  if (word in POSITIVE_WORDS) return POSITIVE_WORDS[word];
  if (word in NEGATIVE_WORDS) return NEGATIVE_WORDS[word];
  return 0;
}

export function analyzeSentiment(text: string): SentimentResult {
  const tokens = tokenize(text);
  const words: WordAnalysis[] = [];
  let totalScore = 0;
  let scoredWordCount = 0;
  let positiveCount = 0;
  let negativeCount = 0;
  let neutralCount = 0;

  for (let i = 0; i < tokens.length; i++) {
    const word = tokens[i];
    const baseScore = getWordScore(word);

    if (baseScore === 0) {
      neutralCount++;
      continue;
    }

    let score = baseScore;
    let modifier = 1;

    // Check previous 1-2 tokens for negators and intensifiers
    const prev1 = tokens[i - 1] ?? '';
    const prev2 = tokens[i - 2] ?? '';

    if (NEGATORS.has(prev1)) {
      modifier *= -0.75; // negation flips and dampens
    } else if (NEGATORS.has(prev2) && (prev1 in INTENSIFIERS || prev1 in DIMINISHERS)) {
      modifier *= -0.75;
      if (prev1 in INTENSIFIERS) modifier *= INTENSIFIERS[prev1];
      if (prev1 in DIMINISHERS) modifier *= DIMINISHERS[prev1];
    }

    if (prev1 in INTENSIFIERS) {
      modifier *= INTENSIFIERS[prev1];
    } else if (prev1 in DIMINISHERS) {
      modifier *= DIMINISHERS[prev1];
    }

    score = Math.max(-1, Math.min(1, baseScore * modifier));

    totalScore += score;
    scoredWordCount++;

    if (score > 0.1) positiveCount++;
    else if (score < -0.1) negativeCount++;
    else neutralCount++;

    const sentiment: SentimentLabel =
      score > 0.1 ? 'positive' : score < -0.1 ? 'negative' : 'neutral';

    words.push({ word, sentiment, score: Math.round(score * 100) / 100, index: i });
  }

  // Normalize score to -1..1
  const normalizedScore = scoredWordCount > 0 ? totalScore / Math.sqrt(scoredWordCount) : 0;
  const clampedScore = Math.max(-1, Math.min(1, normalizedScore));

  let label: SentimentLabel = 'neutral';
  if (clampedScore > 0.15) label = 'positive';
  else if (clampedScore < -0.15) label = 'negative';

  const confidence = Math.min(1, Math.abs(clampedScore) * (1 + scoredWordCount * 0.1));

  return {
    label,
    score: Math.round(clampedScore * 100) / 100,
    positiveCount,
    negativeCount,
    neutralCount,
    words,
    confidence: Math.round(confidence * 100) / 100,
  };
}
