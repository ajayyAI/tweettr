// This file contains the core AI generation logic using Vercel AI SDK
// All LLM calls MUST go through this abstraction

import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';
import { AIProvider, GenerationOptions, Sample, StyleSummary, TweetVariant } from './types';
import { getApiKey } from './storage';

interface GenerationResult {
  style_summary?: StyleSummary;
  variants: TweetVariant[];
}

export async function generateWithVercel(
  provider: AIProvider,
  model: string,
  systemMessage: string,
  userMessage: string,
  options: GenerationOptions,
  samples: Sample[] = []
): Promise<GenerationResult> {
  const apiKey = getApiKey(provider);
  
  if (!apiKey) {
    throw new Error(`No API key found for ${provider}. Please add your API key first.`);
  }

  // Create provider-specific client
  let aiProvider;
  switch (provider) {
    case 'openai':
      aiProvider = createOpenAI({ apiKey });
      break;
    case 'anthropic':
      aiProvider = createAnthropic({ apiKey });
      break;
    case 'google':
      aiProvider = createGoogleGenerativeAI({ apiKey });
      break;
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }

  // Build enhanced system message
  const enhancedSystemMessage = buildSystemMessage(systemMessage, options, samples);

  // Build user message
  const enhancedUserMessage = `${userMessage}\n\nGenerate ${options.variantsRequested} viral tweet variants.`;

  try {
    const result = await generateText({
      model: aiProvider(model),
      messages: [
        { role: 'system', content: enhancedSystemMessage },
        { role: 'user', content: enhancedUserMessage },
      ],
      temperature: 0.8,
    });

    // Parse the response
    const parsed = parseAIResponse(result.text);
    
    // Ensure we have valid variants
    if (!parsed.variants || parsed.variants.length === 0) {
      throw new Error('No variants generated');
    }

    return parsed;
  } catch (error) {
    console.error('AI Generation Error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to generate tweets');
  }
}

function buildSystemMessage(
  basePrompt: string,
  options: GenerationOptions,
  samples: Sample[]
): string {
  let message = basePrompt;

  // Add tone guidance
  message += `\n\nTONE: ${options.tone}`;
  message += `\nTARGET LENGTH: Aim for approximately ${options.charTarget} characters in the final tweet.`;

  // Add samples if provided
  if (samples.length > 0) {
    message += '\n\nEXAMPLES (for style reference only - do NOT copy):';
    
    const sortedSamples = [...samples].sort((a, b) => (b.weight || 1) - (a.weight || 1));
    
    sortedSamples.forEach((sample, idx) => {
      const text = sample.text.split(/\s+/).length > 25 
        ? `[Paraphrased: ${sample.text.substring(0, 100)}...]` 
        : sample.text;
      message += `\n${idx + 1}. (Weight: ${sample.weight || 1.0}) ${text}`;
    });

    if (samples.some(s => s.styleSummary)) {
      message += '\n\nSTYLE ANALYSIS:';
      samples.forEach(s => {
        if (s.styleSummary) {
          message += `\n${s.styleSummary}`;
        }
      });
    }
  }

  // Anti-plagiarism
  message += '\n\nIMPORTANT: Emulate the style and patterns but NEVER copy more than 25 consecutive words from examples. All content must be original.';

  // Request structured output
  message += `\n\nYou MUST respond with valid JSON in this exact format:
{
  "variants": [
    {
      "id": "unique-id",
      "tweet": "The complete viral tweet with proper line breaks (use \\n for line breaks). Make it authentic, valuable, and shareable. Follow 2025 viral tweet patterns."
    }
  ]
}

IMPORTANT: The "tweet" field should contain the COMPLETE, FINAL tweet ready to post. Use \\n for line breaks to create clean, readable formatting.`;

  return message;
}

function parseAIResponse(text: string): GenerationResult {
  try {
    // Try to extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Validate structure
    if (!parsed.variants || !Array.isArray(parsed.variants)) {
      throw new Error('Invalid response structure: missing variants array');
    }

    // Ensure each variant has required fields and generate IDs if missing
    parsed.variants = parsed.variants.map((v: Record<string, unknown>) => ({
      id: v.id || crypto.randomUUID(),
      tweet: v.tweet || '',
      // Legacy fields for backward compatibility (empty)
      hook: v.hook || '',
      context: v.context || '',
      framework: Array.isArray(v.framework) ? v.framework : [],
      proof: v.proof || '',
      cta: v.cta || '',
      hashtags: Array.isArray(v.hashtags) ? v.hashtags : [],
      emoji: Array.isArray(v.emoji) ? v.emoji : [],
    }));

    return {
      variants: parsed.variants,
      style_summary: parsed.style_summary,
    };
  } catch (error) {
    console.error('Parse error:', error);
    console.error('Raw text:', text);
    throw new Error('Failed to parse AI response. The model may not have returned valid JSON.');
  }
}
