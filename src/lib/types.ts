export interface Sample {
  id: string;
  text: string;
  sourceLabel?: string;
  tags?: string[];
  weight?: number;
  createdAt: string;
  styleSummary?: string;
}

export interface TweetVariant {
  id: string;
  hook: string;
  context: string;
  framework: string[];
  proof: string;
  cta: string;
  hashtags: string[];
  emoji: string[];
  tweet: string;
}

export interface StyleSummary {
  tone: string;
  common_hooks: string[];
  avg_length: number;
  hashtag_patterns: string[];
  emoji_usage: string[];
}

export interface GenerationOptions {
  tone: 'direct' | 'inspirational' | 'snarky';
  charTarget: number;
  variantsRequested: number;
}

export interface HistoryItem {
  id: string;
  createdAt: string;
  provider: string;
  model: string;
  systemPrompt: string;
  attachedSampleIds: string[];
  options: GenerationOptions;
  variants: TweetVariant[];
  favorite: boolean;
  tags: string[];
  styleSummary?: StyleSummary;
}

export type AIProvider = 'openai' | 'anthropic' | 'google';

export interface ProviderModel {
  provider: AIProvider;
  model: string;
  displayName: string;
}

export interface SavedSystemPrompt {
  id: string;
  name: string;
  prompt: string;
  createdAt: string;
  updatedAt?: string;
}
