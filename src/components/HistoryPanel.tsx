import { useState, useEffect, useMemo } from 'react';
import { Star, Eye, RefreshCw, Download, Trash2, Search, X, Calendar, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { HistoryItem } from '@/lib/types';
import { getHistory, updateHistoryItem, deleteHistoryItem, exportHistory } from '@/lib/storage';
import { toast } from 'sonner';
import { VariantCard } from './VariantCard';

interface HistoryPanelProps {
  onViewDetails?: (item: HistoryItem) => void;
  onRerun?: (item: HistoryItem) => void;
  refreshTrigger?: number;
}

export function HistoryPanel({ onViewDetails, onRerun, refreshTrigger }: HistoryPanelProps) {
  const [history, setHistory] = useState<HistoryItem[]>(getHistory());
  const [searchQuery, setSearchQuery] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  // Refresh when trigger changes
  useEffect(() => {
    setHistory(getHistory());
  }, [refreshTrigger]);

  const filteredHistory = useMemo(() => {
    let filtered = history;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.systemPrompt.toLowerCase().includes(query) ||
        item.variants.some(v => v.tweet.toLowerCase().includes(query))
      );
    }

    if (showFavoritesOnly) {
      filtered = filtered.filter(item => item.favorite);
    }

    return filtered;
  }, [history, searchQuery, showFavoritesOnly]);

  const toggleFavorite = (id: string) => {
    const item = history.find(h => h.id === id);
    if (item) {
      updateHistoryItem(id, { favorite: !item.favorite });
      setHistory(getHistory());
      toast.success(item.favorite ? 'Removed from favorites' : 'Added to favorites');
    }
  };

  const handleDelete = (id: string) => {
    deleteHistoryItem(id);
    setHistory(getHistory());
    toast.success('Generation deleted');
  };

  const handleExportSelected = (item: HistoryItem) => {
    exportHistory([item]);
    toast.success('Exported successfully');
  };

  const handleViewItem = (item: HistoryItem) => {
    setSelectedItem(item);
    setViewDialogOpen(true);
    onViewDetails?.(item);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b bg-muted/30">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Generation History</h2>
          <Button
            variant={showFavoritesOnly ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className="gap-2"
          >
            <Star className={`h-4 w-4 ${showFavoritesOnly ? 'fill-current' : ''}`} />
            {showFavoritesOnly ? 'Show All' : 'Favorites'}
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tweets and prompts..."
            className="pl-10 h-10"
          />
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {filteredHistory.length === 0 ? (
            <div className="text-center py-12">
              <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">
                {searchQuery ? 'No matching generations found' : 'No generations yet'}
              </p>
              <p className="text-sm text-muted-foreground">
                {searchQuery ? 'Try adjusting your search terms' : 'Generate some tweets to see them here'}
              </p>
            </div>
          ) : (
            filteredHistory.map((item) => (
              <Card key={item.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {new Date(item.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>

                    {/* Show the first tweet preview */}
                    <div className="bg-muted/50 rounded-lg p-3 mb-3">
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {item.variants[0]?.tweet || 'No tweet generated'}
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleFavorite(item.id)}
                    className="h-8 w-8 shrink-0"
                    title={item.favorite ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <Star className={`h-4 w-4 ${item.favorite ? 'fill-current text-yellow-500' : ''}`} />
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {item.provider}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {item.variants.length} variant{item.variants.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewItem(item)}
                      className="h-8 gap-1 text-xs"
                    >
                      <Eye className="h-3 w-3" />
                      <span className="hidden sm:inline">View</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => onRerun?.(item)}
                      className="h-8 gap-1 text-xs"
                    >
                      <RefreshCw className="h-3 w-3" />
                      <span className="hidden sm:inline">Use Settings</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(item.id)}
                      className="h-8 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                      title="Delete"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden">
          <DialogHeader className="pb-4">
            <DialogTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Generated Tweets
            </DialogTitle>
            {selectedItem && (
              <DialogDescription>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="secondary">
                    {selectedItem.provider}
                  </Badge>
                  <Badge variant="secondary">
                    {selectedItem.model}
                  </Badge>
                  <Badge variant="secondary">
                    {new Date(selectedItem.createdAt).toLocaleString()}
                  </Badge>
                  <Badge variant="secondary">
                    {selectedItem.variants.length} variant{selectedItem.variants.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
              </DialogDescription>
            )}
          </DialogHeader>

          {selectedItem && (
            <ScrollArea className="max-h-[calc(90vh-12rem)]">
              <div className="space-y-4 pr-4">
                {selectedItem.variants.map((variant, idx) => (
                  <VariantCard key={variant.id} variant={variant} index={idx} />
                ))}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
