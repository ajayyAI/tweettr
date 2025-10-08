import { Copy, Share2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TweetVariant } from '@/lib/types';
import { toast } from 'sonner';
import { useState } from 'react';

interface VariantCardProps {
  variant: TweetVariant;
  index?: number;
}

export function VariantCard({ variant, index }: VariantCardProps) {
  const [copied, setCopied] = useState(false);
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const shareToX = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(variant.tweet)}`;
    window.open(url, '_blank');
  };

  // Character count
  const charCount = variant.tweet.length;
  const isOverLimit = charCount > 280;

  return (
    <Card className="p-6 space-y-4 hover:shadow-lg transition-shadow">
      {/* Header */}
      {index !== undefined && (
        <div className="flex items-center justify-between pb-2 border-b">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Tweet #{index + 1}
          </span>
          <span className={`text-xs font-medium ${isOverLimit ? 'text-red-500' : 'text-muted-foreground'}`}>
            {charCount} / 280 characters
          </span>
        </div>
      )}

      {/* Tweet Content */}
      <div className="space-y-3">
        <div className="text-base leading-relaxed whitespace-pre-wrap font-normal bg-muted/30 rounded-lg p-4 border">
          {variant.tweet}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <Button
          size="sm"
          variant={copied ? "default" : "outline"}
          className="flex-1 h-9"
          onClick={() => copyToClipboard(variant.tweet)}
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 mr-2" />
              Copy Tweet
            </>
          )}
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="flex-1 h-9"
          onClick={shareToX}
        >
          <Share2 className="h-4 w-4 mr-2" />
          Post to X
        </Button>
      </div>
    </Card>
  );
}
