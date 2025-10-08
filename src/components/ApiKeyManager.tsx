import { useState, useEffect } from 'react';
import { Eye, EyeOff, Trash2, AlertTriangle, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getApiKey, setApiKey, clearApiKey } from '@/lib/storage';

interface ApiKeyManagerProps {
  provider: string;
  onKeyChange?: () => void;
}

export function ApiKeyManager({ provider, onKeyChange }: ApiKeyManagerProps) {
  const [showKey, setShowKey] = useState(false);
  const [apiKey, setApiKeyValue] = useState(getApiKey(provider) || '');
  
  // Reload API key when provider changes
  useEffect(() => {
    setApiKeyValue(getApiKey(provider) || '');
  }, [provider]);

  const handleSave = () => {
    if (apiKey.trim()) {
      setApiKey(provider, apiKey.trim());
      onKeyChange?.();
    }
  };

  const handleClear = () => {
    clearApiKey(provider);
    setApiKeyValue('');
    onKeyChange?.();
  };

  const providerNames: Record<string, string> = {
    openai: 'OpenAI',
    anthropic: 'Anthropic',
    google: 'Google Gemini',
  };
  
  const savedKey = getApiKey(provider);
  const hasApiKey = savedKey && savedKey.trim().length > 0;

  return (
    <div className="space-y-3">
      <div>
        <Label htmlFor="api-key" className="text-sm font-medium flex items-center gap-2">
          API Key for {providerNames[provider] || provider}
          {hasApiKey && (
            <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-normal">
              <Check className="h-3 w-3" />
              Saved
            </span>
          )}
        </Label>
        <div className="flex gap-2 mt-1.5">
          <div className="relative flex-1">
            <Input
              id="api-key"
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKeyValue(e.target.value)}
              onBlur={handleSave}
              placeholder={`Enter your ${providerNames[provider] || provider} API key`}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={handleClear}
            disabled={!apiKey}
            aria-label="Clear API key"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!hasApiKey && (
        <Alert className="bg-muted/50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            API key required for this provider. Keys are stored securely in your browser's localStorage.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
