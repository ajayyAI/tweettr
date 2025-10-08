import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { GenerationOptions } from '@/lib/types';

interface GeneratorControlsProps {
  options: GenerationOptions;
  onChange: (options: GenerationOptions) => void;
}

export function GeneratorControls({ options, onChange }: GeneratorControlsProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="tone" className="text-sm font-medium">
          Tweet Style
        </Label>
        <Select
          value={options.tone}
          onValueChange={(value: 'direct' | 'inspirational' | 'snarky') =>
            onChange({ ...options, tone: value })
          }
        >
          <SelectTrigger id="tone" className="h-10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="direct">Direct & Informative</SelectItem>
            <SelectItem value="inspirational">Motivational</SelectItem>
            <SelectItem value="snarky">Bold & Provocative</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="char-target" className="text-sm font-medium">
            Target Length
          </Label>
          <span className="text-xs font-medium bg-muted px-2 py-1 rounded">
            {options.charTarget} chars
          </span>
        </div>
        <Slider
          id="char-target"
          value={[options.charTarget]}
          onValueChange={([value]) => onChange({ ...options, charTarget: value })}
          min={100}
          max={280}
          step={10}
          className="w-full"
        />
        <p className="text-xs text-muted-foreground">
          Longer tweets often perform better for educational content
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="variants" className="text-sm font-medium">
            Number of Tweets
          </Label>
          <span className="text-xs font-medium bg-muted px-2 py-1 rounded">
            {options.variantsRequested}
          </span>
        </div>
        <Slider
          id="variants"
          value={[options.variantsRequested]}
          onValueChange={([value]) => onChange({ ...options, variantsRequested: value })}
          min={1}
          max={5}
          step={1}
          className="w-full"
        />
        <p className="text-xs text-muted-foreground">
          Generate multiple options to find the best one
        </p>
      </div>
    </div>
  );
}
