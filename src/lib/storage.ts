import { Sample, HistoryItem, SavedSystemPrompt } from './types';

const STORAGE_KEYS = {
  API_KEY: (provider: string) => `tweettr.apiKey.${provider}`,
  SAMPLES: 'tweettr.samples',
  HISTORY: 'tweettr.history',
  SAVED_PROMPTS: 'tweettr.savedSystemPrompts',
  COLLECTIONS: 'tweettr.collections',
  THEME: 'tweettr.theme',
  LAST_PROVIDER: 'tweettr.lastProvider',
} as const;

// API Keys
export const getApiKey = (provider: string): string | null => {
  return localStorage.getItem(STORAGE_KEYS.API_KEY(provider));
};

export const setApiKey = (provider: string, key: string): void => {
  localStorage.setItem(STORAGE_KEYS.API_KEY(provider), key);
};

export const clearApiKey = (provider: string): void => {
  localStorage.removeItem(STORAGE_KEYS.API_KEY(provider));
};

// Samples
export const getSamples = (): Sample[] => {
  const data = localStorage.getItem(STORAGE_KEYS.SAMPLES);
  return data ? JSON.parse(data) : [];
};

export const setSamples = (samples: Sample[]): void => {
  localStorage.setItem(STORAGE_KEYS.SAMPLES, JSON.stringify(samples));
};

// History (keep only last 50)
export const getHistory = (): HistoryItem[] => {
  const data = localStorage.getItem(STORAGE_KEYS.HISTORY);
  return data ? JSON.parse(data) : [];
};

export const addHistoryItem = (item: HistoryItem): void => {
  const history = getHistory();
  const updated = [item, ...history].slice(0, 50);
  localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
};

export const updateHistoryItem = (id: string, updates: Partial<HistoryItem>): void => {
  const history = getHistory();
  const updated = history.map(item => 
    item.id === id ? { ...item, ...updates } : item
  );
  localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
};

export const deleteHistoryItem = (id: string): void => {
  const history = getHistory();
  const updated = history.filter(item => item.id !== id);
  localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
};

export const clearHistory = (): void => {
  localStorage.removeItem(STORAGE_KEYS.HISTORY);
};

// Theme
export const getTheme = (): 'light' | 'dark' => {
  const stored = localStorage.getItem(STORAGE_KEYS.THEME);
  return stored ? (stored as 'light' | 'dark') : 'light'; // Default to light
};

export const setTheme = (theme: 'light' | 'dark'): void => {
  localStorage.setItem(STORAGE_KEYS.THEME, theme);
};

// Last Provider
export const getLastProvider = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.LAST_PROVIDER);
};

export const setLastProvider = (provider: string): void => {
  localStorage.setItem(STORAGE_KEYS.LAST_PROVIDER, provider);
};

// Export/Import
export const exportHistory = (items?: HistoryItem[]): void => {
  const data = items || getHistory();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `tweettr-history-${new Date().toISOString()}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

export const importHistory = (jsonData: string): void => {
  try {
    const imported = JSON.parse(jsonData) as HistoryItem[];
    const existing = getHistory();
    
    // Merge and dedupe by id
    const merged = [...imported, ...existing];
    const unique = Array.from(
      new Map(merged.map(item => [item.id, item])).values()
    ).slice(0, 50);
    
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(unique));
  } catch (error) {
    throw new Error('Invalid JSON format');
  }
};

// Saved System Prompts
export const getSavedSystemPrompts = (): SavedSystemPrompt[] => {
  const data = localStorage.getItem(STORAGE_KEYS.SAVED_PROMPTS);
  return data ? JSON.parse(data) : [];
};

export const setSavedSystemPrompts = (items: SavedSystemPrompt[]): void => {
  localStorage.setItem(STORAGE_KEYS.SAVED_PROMPTS, JSON.stringify(items));
};

export const upsertSavedSystemPrompt = (params: { id?: string; name: string; prompt: string }): SavedSystemPrompt => {
  const existing = getSavedSystemPrompts();
  const now = new Date().toISOString();

  if (params.id) {
    const updated = existing.map((item) =>
      item.id === params.id ? { ...item, name: params.name, prompt: params.prompt, updatedAt: now } : item
    );
    setSavedSystemPrompts(updated);
    return updated.find((i) => i.id === params.id)!;
  }

  const newItem: SavedSystemPrompt = {
    id: crypto.randomUUID(),
    name: params.name,
    prompt: params.prompt,
    createdAt: now,
    updatedAt: now,
  };
  const next = [newItem, ...existing];
  setSavedSystemPrompts(next);
  return newItem;
};

export const deleteSavedSystemPrompt = (id: string): void => {
  const existing = getSavedSystemPrompts();
  const next = existing.filter((i) => i.id !== id);
  setSavedSystemPrompts(next);
};
