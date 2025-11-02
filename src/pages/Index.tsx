import { useState, useEffect } from 'react';
import { Zap, Loader2, Sparkles, Settings, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ApiKeyManager } from '@/components/ApiKeyManager';
import { SystemPromptEditor } from '@/components/SystemPromptEditor';
import { SampleManager } from '@/components/SampleManager';
import { GeneratorControls } from '@/components/GeneratorControls';
import { VariantCard } from '@/components/VariantCard';
import { HistoryPanel } from '@/components/HistoryPanel';
import { AVAILABLE_MODELS, DEFAULT_SYSTEM_PROMPT } from '@/lib/ai-providers';
import { GenerationOptions, HistoryItem, TweetVariant } from '@/lib/types';
import { getTheme, setTheme, getLastProvider, setLastProvider, getSamples, setSamples, addHistoryItem, getApiKey } from '@/lib/storage';
import { generateWithVercel } from '@/lib/ai-generator';
import { toast } from 'sonner';

const Index = () => {
  const [theme, setThemeState] = useState<'light' | 'dark'>(getTheme());
  const [selectedModel, setSelectedModel] = useState(
    getLastProvider() || 'openai:gpt-5'
  );
  const [systemPrompt, setSystemPrompt] = useState(DEFAULT_SYSTEM_PROMPT);
  const [options, setOptions] = useState<GenerationOptions>({
    tone: 'direct',
    charTarget: 240,
    variantsRequested: 2,
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [variants, setVariants] = useState<TweetVariant[]>([]);
  const [historyRefresh, setHistoryRefresh] = useState(0);
  const [samplesRefresh, setSamplesRefresh] = useState(0);
  const [showExamples, setShowExamples] = useState(false);
  const [hasApiKey, setHasApiKey] = useState<boolean>(() => {
    const provider = (getLastProvider() || 'openai:gpt-5').split(':')[0];
    return Boolean(getApiKey(provider));
  });
  const [activeTab, setActiveTab] = useState<string>('generate');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    setTheme(theme);
  }, [theme]);

  const toggleTheme = () => {
    setThemeState(prev => prev === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    const provider = selectedModel.split(':')[0];
    setHasApiKey(Boolean(getApiKey(provider)));
  }, [selectedModel]);

  const handleGenerate = async () => {
    const [provider, model] = selectedModel.split(':');
    
    if (!provider || !model) {
      toast.error('Please select a model');
      return;
    }

    if (!systemPrompt.trim()) {
      toast.error('Please enter a system prompt');
      return;
    }

    setIsGenerating(true);
    setVariants([]);

    try {
      const samples = getSamples();
      const result = await generateWithVercel(
        provider as 'openai' | 'anthropic' | 'google',
        model,
        systemPrompt,
        'Create viral tweets following the system instructions.',
        options,
        samples
      );

      setVariants(result.variants);
      
      const historyItem: HistoryItem = {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        provider,
        model,
        systemPrompt,
        attachedSampleIds: samples.map(s => s.id),
        options,
        variants: result.variants,
        favorite: false,
        tags: [],
        styleSummary: result.style_summary,
      };
      
      addHistoryItem(historyItem);
      setHistoryRefresh(prev => prev + 1);
      setLastProvider(selectedModel);

      toast.success(`Generated ${result.variants.length} variants!`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Generation failed');
      console.error('Generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRerunFromHistory = (item: HistoryItem) => {
    // Load all settings from history
    setSystemPrompt(item.systemPrompt);
    setOptions(item.options);
    setSelectedModel(`${item.provider}:${item.model}`);
    
    // Restore the specific samples that were used in this generation
    if (item.attachedSampleIds && item.attachedSampleIds.length > 0) {
      const allSamples = getSamples();
      const usedSamples = allSamples.filter(sample => 
        item.attachedSampleIds.includes(sample.id)
      );
      
      // If we found the samples, restore them
      if (usedSamples.length > 0) {
        setSamples(usedSamples);
        setSamplesRefresh(prev => prev + 1); // Refresh the SampleManager
        toast.success(`Settings loaded! Restored ${usedSamples.length} example${usedSamples.length !== 1 ? 's' : ''} from this generation.`);
      } else {
        // Samples might have been deleted, keep current samples
        toast.success('Settings loaded! (Note: Original examples may have been removed)');
      }
    } else {
      // No samples were used in this generation
      toast.success('Settings loaded! Ready to generate with these settings.');
    }
    
    setActiveTab('generate');
    
    // Scroll to top to show the Generate tab
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 sm:h-16 items-center justify-between px-3 sm:px-4 lg:px-6 max-w-7xl">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-sm sm:text-lg font-bold leading-tight">Tweettr</h1>
              <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">AI-Powered Tweet Generation</p>
            </div>
          </div>
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto flex-1 px-3 sm:px-4 lg:px-6 py-4 sm:py-6 max-w-7xl">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-4 sm:mb-6">
            <TabsTrigger value="generate" className="gap-1 sm:gap-2 text-xs sm:text-sm">
              <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
              Generate
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-1 sm:gap-2 text-xs sm:text-sm">
              <History className="h-3 w-3 sm:h-4 sm:w-4" />
              History
            </TabsTrigger>
          </TabsList>

          {/* Generate Tab */}
          <TabsContent value="generate" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Configuration Column */}
              <div className="lg:col-span-1 space-y-3 sm:space-y-4">
                <Card className="p-3 sm:p-4">
                  <h3 className="text-sm font-semibold mb-3 sm:mb-4 flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Configuration
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="model-select" className="text-sm font-medium">
                        AI Model
                      </Label>
                      <Select value={selectedModel} onValueChange={setSelectedModel}>
                        <SelectTrigger id="model-select" className="h-10">
                          <SelectValue placeholder="Select a model" />
                        </SelectTrigger>
                        <SelectContent>
                          <div className="px-2 py-2 text-xs font-bold text-muted-foreground uppercase tracking-wide">OpenAI</div>
                          {AVAILABLE_MODELS.filter(m => m.provider === 'openai').map((m) => (
                            <SelectItem key={`${m.provider}:${m.model}`} value={`${m.provider}:${m.model}`} className="text-sm py-2">
                              {m.displayName}
                            </SelectItem>
                          ))}
                          <div className="px-2 py-2 text-xs font-bold text-muted-foreground uppercase tracking-wide mt-2">Anthropic Claude</div>
                          {AVAILABLE_MODELS.filter(m => m.provider === 'anthropic').map((m) => (
                            <SelectItem key={`${m.provider}:${m.model}`} value={`${m.provider}:${m.model}`} className="text-sm py-2">
                              {m.displayName}
                            </SelectItem>
                          ))}
                          <div className="px-2 py-2 text-xs font-bold text-muted-foreground uppercase tracking-wide mt-2">Google Gemini</div>
                          {AVAILABLE_MODELS.filter(m => m.provider === 'google').map((m) => (
                            <SelectItem key={`${m.provider}:${m.model}`} value={`${m.provider}:${m.model}`} className="text-sm py-2">
                              {m.displayName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <ApiKeyManager
                      provider={selectedModel.split(':')[0]}
                      onKeyChange={() => setHasApiKey(Boolean(getApiKey(selectedModel.split(':')[0])))}
                    />

                    <div className="pt-2 border-t">
                      <GeneratorControls options={options} onChange={setOptions} />
                    </div>

                    <div className="pt-2 border-t">
                      <Button
                        onClick={handleGenerate}
                        disabled={!hasApiKey || isGenerating}
                        className="w-full h-11 text-sm font-semibold"
                        size="lg"
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generating {options.variantsRequested}...
                          </>
                        ) : (
                          <>
                            <Sparkles className="mr-2 h-4 w-4" />
                            Generate Tweets
                          </>
                        )}
                      </Button>
                      {!hasApiKey && (
                        <p className="text-xs text-muted-foreground text-center mt-2">
                          Add an API key to enable generation
                        </p>
                      )}
                    </div>
                  </div>
                </Card>

                <Card className="p-3 sm:p-4">
                  <h3 className="text-sm font-semibold mb-3">Examples (Few-Shot)</h3>
                  <SampleManager key={samplesRefresh} />
                </Card>
              </div>

              {/* System Prompt & Results Column */}
              <div className="lg:col-span-2 space-y-3 sm:space-y-4">
                <Card className="p-3 sm:p-4">
                  <h3 className="text-sm font-semibold mb-3 sm:mb-4">System Prompt</h3>
                  <SystemPromptEditor value={systemPrompt} onChange={setSystemPrompt} />
                </Card>

                {variants.length > 0 && (
                  <Card className="p-3 sm:p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Sparkles className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold">Generated Tweets</h3>
                        <p className="text-xs text-muted-foreground">
                          {variants.length} variant{variants.length !== 1 ? 's' : ''} ready
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {variants.map((variant, idx) => (
                        <VariantCard key={variant.id} variant={variant} index={idx} />
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <Card>
              <HistoryPanel refreshTrigger={historyRefresh} onRerun={handleRerunFromHistory} />
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t bg-background/50 backdrop-blur">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 max-w-7xl">
          <div className="text-center text-sm text-muted-foreground">
            Built with ❤️ by{' '}
            <a
              href="https://github.com/ajayyai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 transition-colors"
            >
              @ajayyai
            </a>
            {' • '}
            <a
              href="https://github.com/ajayyai/tweettr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 transition-colors"
            >
              View on GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
