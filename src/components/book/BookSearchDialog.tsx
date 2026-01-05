import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

interface BookSearchDialogProps {
    searchQuery: string;
    onSearchQueryChange: (query: string) => void;
    onSearch: () => void;
    searchResults: number[];
    currentSearchIndex: number;
    onNavigateSearch: (index: number) => void;
}

export const BookSearchDialog = ({
    searchQuery,
    onSearchQueryChange,
    onSearch,
    searchResults,
    currentSearchIndex,
    onNavigateSearch,
}: BookSearchDialogProps) => {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Search className="h-5 w-5" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Search in book</DialogTitle>
                </DialogHeader>
                <div className="flex gap-2">
                    <Input
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => onSearchQueryChange(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && onSearch()}
                    />
                    <Button onClick={onSearch}>Search</Button>
                </div>
                {searchResults.length > 0 && (
                    <div className="flex items-center justify-between mt-4">
                        <span className="text-sm text-muted-foreground">
                            {currentSearchIndex + 1} of {searchResults.length}
                        </span>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                    const newIndex = (currentSearchIndex - 1 + searchResults.length) % searchResults.length;
                                    onNavigateSearch(newIndex);
                                }}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                    const newIndex = (currentSearchIndex + 1) % searchResults.length;
                                    onNavigateSearch(newIndex);
                                }}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};
