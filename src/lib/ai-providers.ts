import { ProviderModel } from './types';

export const AVAILABLE_MODELS: ProviderModel[] = [
  // OpenAI Models (Latest 2025)
  {
    provider: 'openai',
    model: 'gpt-5',
    displayName: 'GPT-5 (Latest & Most Capable)',
  },
  {
    provider: 'openai',
    model: 'gpt-5-mini',
    displayName: 'GPT-5 Mini (Fast & Cost-Effective)',
  },
  {
    provider: 'openai',
    model: 'gpt-5-nano',
    displayName: 'GPT-5 Nano (Ultra Fast)',
  },
  {
    provider: 'openai',
    model: 'gpt-4o',
    displayName: 'GPT-4o (Previous Generation)',
  },
  
  // Anthropic Claude Models (Latest 2025)
  {
    provider: 'anthropic',
    model: 'claude-3-5-sonnet-20241022',
    displayName: 'Claude 3.5 Sonnet (Latest)',
  },
  {
    provider: 'anthropic',
    model: 'claude-3-5-haiku-20241022',
    displayName: 'Claude 3.5 Haiku (Fastest)',
  },
  {
    provider: 'anthropic',
    model: 'claude-3-opus-20240229',
    displayName: 'Claude 3 Opus (Most Capable)',
  },
  
  // Google Gemini Models (Latest 2025)
  {
    provider: 'google',
    model: 'gemini-2.5-pro',
    displayName: 'Gemini 2.5 Pro (Most Capable)',
  },
  {
    provider: 'google',
    model: 'gemini-2.0-flash-exp',
    displayName: 'Gemini 2.0 Flash (Latest)',
  },
  {
    provider: 'google',
    model: 'gemini-1.5-pro',
    displayName: 'Gemini 1.5 Pro (Stable)',
  },
  {
    provider: 'google',
    model: 'gemini-1.5-flash',
    displayName: 'Gemini 1.5 Flash (Fast)',
  },
];

export const SYSTEM_PROMPT_TEMPLATES = [
  {
    name: '2025 Viral Tweet (Default)',
    prompt: `You are an expert at creating viral tweets in the modern 2025 style. 

Key characteristics of 2025 viral tweets:
- Clean, minimal formatting (line breaks for readability)
- Strong opening hook that triggers curiosity or emotion
- Valuable, actionable content
- Minimal to NO emojis (rarely used in 2025)
- NO hashtags (almost extinct in 2025)
- Personal, authentic voice
- Data-driven when possible
- Clear structure with numbered points when applicable

Examples of viral patterns:
1. Contrarian take + numbered framework
2. Personal metrics/progress drop + what worked
3. Expert insight + free value (prompts, frameworks, etc.)

Create tweets that feel authentic, valuable, and shareable. Never copy more than 25 consecutive words from examples.`,
  },
  {
    name: 'Informative Thread Style',
    prompt: `Create thread-style tweets that educate and engage.

Structure:
- Attention-grabbing opening line (often contrarian or surprising)
- Brief context setup
- 3-7 numbered insights/steps
- Each point is concise and actionable
- Optional callback at the end

Style:
- Clean line breaks between sections
- Minimal emojis (if any)
- No hashtags
- Professional yet conversational tone`,
  },
  {
    name: 'Metric Drop / Progress',
    prompt: `Generate tweets showcasing real progress with metrics.

Format:
- Time frame statement (e.g., "We launched 69 days ago")
- Key metrics with clean formatting
- Brief explanation of what worked
- Personal, authentic voice
- Use emoji sparingly for metric bullets (💵 👀 🔍) but not everywhere

Focus on specifics, transparency, and actionable insights.`,
  },
  {
    name: 'Expert Insight / Value Drop',
    prompt: `Create tweets that position you as an expert while giving real value.

Pattern:
- Opening: Experience/authority statement
- Hook: What makes this valuable
- Value delivery: Actual framework/prompt/insight (not a tease)
- Optional P.S. for extra engagement

Style:
- Direct, no fluff
- Give the value upfront
- No bait-and-switch
- Clean formatting`,
  },
];

export const DEFAULT_SYSTEM_PROMPT = SYSTEM_PROMPT_TEMPLATES[0].prompt;
