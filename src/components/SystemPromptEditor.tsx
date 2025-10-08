import { useState } from 'react';
import { FileText, RotateCcw, Save, Trash2, MoreHorizontal, Edit2, Plus } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SYSTEM_PROMPT_TEMPLATES, DEFAULT_SYSTEM_PROMPT } from '@/lib/ai-providers';
import { getSavedSystemPrompts, upsertSavedSystemPrompt, deleteSavedSystemPrompt } from '@/lib/storage';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface SystemPromptEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function SystemPromptEditor({ value, onChange }: SystemPromptEditorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [savedName, setSavedName] = useState<string>('');
  const [savedPrompts, setSavedPrompts] = useState(getSavedSystemPrompts());

  const handleTemplateSelect = (templateName: string) => {
    const template = SYSTEM_PROMPT_TEMPLATES.find(t => t.name === templateName);
    if (template) {
      onChange(template.prompt);
      setSelectedTemplate(templateName);
    }
  };

  const handleReset = () => {
    onChange(DEFAULT_SYSTEM_PROMPT);
    setSelectedTemplate('');
  };

  const handleSave = () => {
    const name = savedName.trim() || `Prompt ${new Date().toLocaleString()}`;
    const item = upsertSavedSystemPrompt({ name, prompt: value });
    setSavedName(item.name);
    setSavedPrompts(getSavedSystemPrompts());
    toast.success('Prompt saved');
  };

  const handleLoadSaved = (id: string) => {
    const items = getSavedSystemPrompts();
    const item = items.find((i) => i.id === id);
    if (item) {
      onChange(item.prompt);
      setSavedName(item.name);
      setSelectedTemplate('');
      setSavedPrompts(items);
      toast.info('Loaded saved prompt');
    }
  };

  const handleRenameSaved = (id: string) => {
    const items = getSavedSystemPrompts();
    const item = items.find((i) => i.id === id);
    if (!item) return;
    const nextName = prompt('Rename prompt', item.name)?.trim();
    if (!nextName) return;
    upsertSavedSystemPrompt({ id, name: nextName, prompt: item.prompt });
    setSavedName(nextName);
    setSavedPrompts(getSavedSystemPrompts());
    toast.success('Prompt renamed');
  };

  const handleDeleteSaved = (id: string) => {
    deleteSavedSystemPrompt(id);
    setSavedPrompts(getSavedSystemPrompts());
    toast.success('Prompt deleted');
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
            <SelectTrigger className="w-[160px] h-9 text-xs">
              <SelectValue placeholder="Templates" />
            </SelectTrigger>
            <SelectContent>
              {SYSTEM_PROMPT_TEMPLATES.map((template) => (
                <SelectItem key={template.name} value={template.name} className="text-xs">
                  {template.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="h-9 px-3"
            title="Reset to default"
          >
            <RotateCcw className="h-3 w-3" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Input
            value={savedName}
            onChange={(e) => setSavedName(e.target.value)}
            placeholder="Name this prompt..."
            className="h-9 text-xs w-[180px]"
          />
          <Button size="sm" className="h-9 px-3" onClick={handleSave}>
            <Save className="h-3 w-3" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 px-2">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              {savedPrompts.length === 0 ? (
                <div className="px-3 py-2 text-xs text-muted-foreground">No saved prompts</div>
              ) : (
                savedPrompts.map((item) => (
                  <div key={item.id} className="flex items-center justify-between px-2 py-1.5 hover:bg-muted/50 rounded">
                    <button className="text-left text-xs truncate flex-1" onClick={() => handleLoadSaved(item.id)}>
                      {item.name}
                    </button>
                    <div className="flex items-center gap-1 ml-2">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleRenameSaved(item.id)}>
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDeleteSaved(item.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Textarea
        id="system-prompt"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter your custom system prompt or load a template above..."
        className="text-sm font-mono resize-none h-[280px] overflow-y-auto scrollbar-hide"
      />
      
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{value.length} characters</span>
        <span className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          Ready
        </span>
      </div>
    </div>
  );
}
