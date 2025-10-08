# Catalyst - Viral Tweet Generator

A minimal, privacy-first viral tweet generator powered by AI using the Vercel AI SDK.

## Features

- **System Prompt Editor**: Customize AI behavior with built-in templates
- **Viral-Inspired Samples**: Add few-shot examples to guide tweet generation
- **Multiple AI Providers**: Support for OpenAI, Anthropic, and Google via Vercel AI SDK
- **Local Storage**: All data (API keys, samples, history) stored locally in your browser
- **Generation History**: Automatically saves your last 50 generations with search and filtering
- **Light/Dark Theme**: Clean, minimal design with theme toggle
- **Export/Import**: Backup and restore your generation history

## Quick Start

1. **Install Dependencies**
   ```bash
   bun install
   ```

2. **Run Development Server**
   ```bash
   bun run dev
   ```

3. **Add Your API Key**
   - Select an AI provider (OpenAI, Anthropic, or Google)
   - Enter your API key in the "API Key" section
   - Keys are stored in browser localStorage (see Security Notes)

4. **Generate Tweets**
   - Customize or select a system prompt template
   - Optionally add viral tweet samples for style guidance
   - Adjust tone, character target, and number of variants
   - Click "Generate Viral Tweets"

## AI Integration

Catalyst uses the **Vercel AI SDK** exclusively for all LLM calls. This provides:
- Unified interface across multiple providers
- Built-in streaming support
- Type-safe API

**Documentation**: https://ai-sdk.dev/

### Supported Models

- **OpenAI**: GPT-4 Turbo, GPT-3.5 Turbo
- **Anthropic**: Claude 3 Opus, Claude 3 Sonnet
- **Google**: Gemini Pro

## Data Storage

All data is stored in browser localStorage:

- `catalyst.apiKey.{provider}` - API keys per provider
- `catalyst.samples` - Viral tweet samples for few-shot learning
- `catalyst.history` - Last 50 generations with full details
- `catalyst.theme` - Current theme (light/dark)
- `catalyst.lastProvider` - Last selected provider/model

## Security Notes

⚠️ **API keys are stored in localStorage** which has inherent security risks:

- localStorage data can be accessed by browser extensions
- Not suitable for production/sensitive keys
- Keys are stored in plain text (not encrypted)

**Recommended**: For production use, implement a server-side proxy that stores keys securely and makes AI calls on behalf of the client. See Vercel AI SDK docs for proxy patterns.

## Features in Detail

### System Prompts
- Pre-built templates for viral, educational, and thread-starter tweets
- Full customization support
- Automatically includes structural requirements (Hook/Context/Framework/Proof/CTA)

### Sample Management
- Add viral tweet examples to guide style
- Weight samples (0.1-2.0) to prioritize certain patterns
- Automatic paraphrasing for samples >25 words (prevents plagiarism)
- Style analysis feature to extract patterns

### Generation Controls
- **Tone**: Direct, Inspirational, or Snarky
- **Character Target**: 100-280 characters
- **Variants**: Generate 1-5 variations per request

### History Management
- Paginated list (10 items per page, up to 5 pages)
- Search across prompts and generated tweets
- Filter by provider or favorites
- Export/import JSON backups
- Quick re-run from history

## Tweet Structure

Every generated tweet follows this structure:

1. **Hook**: Attention-grabbing opening
2. **Context**: Setup and relevance
3. **Framework**: 3-7 actionable steps/insights
4. **Proof**: Credibility (data, examples, authority)
5. **CTA**: Clear call-to-action
6. **Hashtags**: Relevant tags
7. **Emoji**: Strategic emoji usage
8. **Final Tweet**: Complete single-line tweet

## Export/Import

Export your generation history:
- Click export button on individual items or bulk export
- Saves as JSON file with timestamp
- Import JSON to restore (automatically deduplicates)

## Build & Deploy

```bash
# Build for production
bun run build

# Preview production build
bun run preview
```

## Tech Stack

- **Framework**: React 18 + Vite
- **Styling**: TailwindCSS + shadcn/ui
- **Font**: Roboto Mono (monospace throughout)
- **AI**: Vercel AI SDK
- **State**: React Hooks + localStorage
- **Icons**: Lucide React

## Privacy

Catalyst is privacy-first:
- No analytics or tracking
- No server-side data collection
- All processing happens locally
- API calls go directly from your browser to AI providers

## Contributing

This is an open-source project. Contributions welcome!

## License

MIT License - feel free to use and modify.

---

Built with ❤️ for viral content creators
