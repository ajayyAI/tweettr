import { useState } from 'react';
import { Plus, Trash2, Lightbulb, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Sample } from '@/lib/types';
import { getSamples, setSamples } from '@/lib/storage';
import { toast } from 'sonner';

interface SampleManagerProps {
  onSamplesChange?: (samples: Sample[]) => void;
}

export function SampleManager({ onSamplesChange }: SampleManagerProps) {
  const [samples, setSamplesState] = useState<Sample[]>(getSamples());
  const [newSampleText, setNewSampleText] = useState('');
  const [showConfirmLong, setShowConfirmLong] = useState(false);

  const updateSamples = (updated: Sample[]) => {
    setSamplesState(updated);
    setSamples(updated);
    onSamplesChange?.(updated);
  };

  const addSample = () => {
    if (!newSampleText.trim()) {
      toast.error('Sample text cannot be empty');
      return;
    }

    const wordCount = newSampleText.trim().split(/\s+/).length;
    
    if (wordCount > 25 && !showConfirmLong) {
      setShowConfirmLong(true);
      return;
    }

    const newSample: Sample = {
      id: crypto.randomUUID(),
      text: newSampleText.trim(),
      weight: 1.0,
      createdAt: new Date().toISOString(),
    };

    updateSamples([...samples, newSample]);
    setNewSampleText('');
    setShowConfirmLong(false);
    toast.success('Sample added');
  };

  const removeSample = (id: string) => {
    updateSamples(samples.filter(s => s.id !== id));
    toast.success('Sample removed');
  };

  const updateWeight = (id: string, weight: number) => {
    updateSamples(
      samples.map(s => s.id === id ? { ...s, weight } : s)
    );
  };

  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium flex items-center gap-2">
        <Lightbulb className="h-4 w-4" />
        Viral-Inspired Samples (Few-Shot)
      </Label>

      <div className="space-y-2">
        <Textarea
          value={newSampleText}
          onChange={(e) => setNewSampleText(e.target.value)}
          placeholder="Paste a viral tweet example (one per entry)..."
          className="min-h-[80px] text-sm resize-none"
        />
        
        {showConfirmLong && (
          <Alert className="bg-muted/50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              This sample is longer than 25 words. By default, it will be paraphrased. 
              Click "Add anyway" to confirm.
            </AlertDescription>
          </Alert>
        )}

        <Button
          onClick={addSample}
          size="sm"
          className="w-full"
          variant={showConfirmLong ? 'destructive' : 'default'}
        >
          <Plus className="h-4 w-4 mr-2" />
          {showConfirmLong ? 'Add anyway' : 'Add Sample'}
        </Button>
      </div>

      {samples.length > 0 && (
        <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
          {samples.map((sample) => (
            <Card key={sample.id} className="p-3 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs flex-1 break-words leading-relaxed">{sample.text}</p>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeSample(sample.id)}
                  className="h-6 w-6 shrink-0"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground">Weight</Label>
                  <span className="text-xs font-medium">{sample.weight?.toFixed(1) || 1.0}</span>
                </div>
                <Slider
                  value={[sample.weight || 1.0]}
                  onValueChange={([value]) => updateWeight(sample.id, value)}
                  min={0.1}
                  max={2.0}
                  step={0.1}
                  className="w-full"
                />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
