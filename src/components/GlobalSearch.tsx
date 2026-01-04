import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from '@/components/ui/command';
import {
    FileText,
    BookOpen,
    Headphones,
    Layers,
    Search,
    ArrowRight,
    Loader2
} from 'lucide-react';

interface SearchResult {
    id: string;
    title: string;
    slug: string;
    type: 'exam' | 'book' | 'podcast' | 'flashcard';
    description?: string;
}

interface GlobalSearchProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export const GlobalSearch = ({ open: controlledOpen, onOpenChange }: GlobalSearchProps) => {
    const [internalOpen, setInternalOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<{
        exams: SearchResult[];
        books: SearchResult[];
        podcasts: SearchResult[];
        flashcards: SearchResult[];
    }>({
        exams: [],
        books: [],
        podcasts: [],
        flashcards: [],
    });
    const navigate = useNavigate();

    const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
    const setOpen = onOpenChange || setInternalOpen;

    // Keyboard shortcut: Ctrl+K / Cmd+K
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen(!isOpen);
            }
        };

        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, [isOpen, setOpen]);

    // Search function
    const performSearch = useCallback(async (searchQuery: string) => {
        if (!searchQuery.trim() || searchQuery.length < 2) {
            setResults({ exams: [], books: [], podcasts: [], flashcards: [] });
            return;
        }

        setLoading(true);

        try {
            const [examsResult, booksResult, podcastsResult, flashcardsResult] = await Promise.all([
                supabase
                    .from('exams')
                    .select('id, title, slug, description')
                    .ilike('title', `%${searchQuery}%`)
                    .limit(5),
                supabase
                    .from('books')
                    .select('id, title, slug, description')
                    .ilike('title', `%${searchQuery}%`)
                    .limit(5),
                supabase
                    .from('podcasts')
                    .select('id, title, slug, description')
                    .ilike('title', `%${searchQuery}%`)
                    .limit(5),
                supabase
                    .from('flashcard_decks')
                    .select('id, title, slug, description')
                    .ilike('title', `%${searchQuery}%`)
                    .limit(5),
            ]);

            setResults({
                exams: (examsResult.data || []).map(e => ({ ...e, type: 'exam' as const })),
                books: (booksResult.data || []).map(b => ({ ...b, type: 'book' as const })),
                podcasts: (podcastsResult.data || []).map(p => ({ ...p, type: 'podcast' as const })),
                flashcards: (flashcardsResult.data || []).map(f => ({ ...f, type: 'flashcard' as const })),
            });
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            performSearch(query);
        }, 300);

        return () => clearTimeout(timer);
    }, [query, performSearch]);

    const handleSelect = (result: SearchResult) => {
        setOpen(false);
        setQuery('');

        switch (result.type) {
            case 'exam':
                navigate(`/exam/${result.slug}`);
                break;
            case 'book':
                navigate(`/books/${result.slug}`);
                break;
            case 'podcast':
                navigate(`/podcasts/${result.slug}`);
                break;
            case 'flashcard':
                navigate(`/flashcards/${result.slug}`);
                break;
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'exam': return <FileText className="mr-2 h-4 w-4" />;
            case 'book': return <BookOpen className="mr-2 h-4 w-4" />;
            case 'podcast': return <Headphones className="mr-2 h-4 w-4" />;
            case 'flashcard': return <Layers className="mr-2 h-4 w-4" />;
            default: return <Search className="mr-2 h-4 w-4" />;
        }
    };

    const totalResults =
        results.exams.length +
        results.books.length +
        results.podcasts.length +
        results.flashcards.length;

    return (
        <CommandDialog open={isOpen} onOpenChange={setOpen}>
            <CommandInput
                placeholder="Tìm kiếm đề thi, sách, podcast, flashcards..."
                value={query}
                onValueChange={setQuery}
            />
            <CommandList>
                {loading && (
                    <div className="flex items-center justify-center py-6">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                )}

                {!loading && query.length >= 2 && totalResults === 0 && (
                    <CommandEmpty>
                        Không tìm thấy kết quả cho "{query}"
                    </CommandEmpty>
                )}

                {!loading && query.length < 2 && (
                    <div className="py-6 text-center text-sm text-muted-foreground">
                        <Search className="mx-auto mb-2 h-8 w-8 opacity-50" />
                        <p>Nhập từ khóa để tìm kiếm</p>
                        <p className="mt-1 text-xs">Nhấn <kbd className="px-1 py-0.5 bg-muted rounded text-xs">⌘K</kbd> để mở nhanh</p>
                    </div>
                )}

                {!loading && results.exams.length > 0 && (
                    <>
                        <CommandGroup heading="Đề thi">
                            {results.exams.map((exam) => (
                                <CommandItem
                                    key={exam.id}
                                    value={exam.title}
                                    onSelect={() => handleSelect(exam)}
                                    className="cursor-pointer"
                                >
                                    {getIcon('exam')}
                                    <div className="flex-1 min-w-0">
                                        <span className="truncate">{exam.title}</span>
                                    </div>
                                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                </CommandItem>
                            ))}
                        </CommandGroup>
                        <CommandSeparator />
                    </>
                )}

                {!loading && results.books.length > 0 && (
                    <>
                        <CommandGroup heading="Sách">
                            {results.books.map((book) => (
                                <CommandItem
                                    key={book.id}
                                    value={book.title}
                                    onSelect={() => handleSelect(book)}
                                    className="cursor-pointer"
                                >
                                    {getIcon('book')}
                                    <div className="flex-1 min-w-0">
                                        <span className="truncate">{book.title}</span>
                                    </div>
                                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                </CommandItem>
                            ))}
                        </CommandGroup>
                        <CommandSeparator />
                    </>
                )}

                {!loading && results.podcasts.length > 0 && (
                    <>
                        <CommandGroup heading="Podcasts">
                            {results.podcasts.map((podcast) => (
                                <CommandItem
                                    key={podcast.id}
                                    value={podcast.title}
                                    onSelect={() => handleSelect(podcast)}
                                    className="cursor-pointer"
                                >
                                    {getIcon('podcast')}
                                    <div className="flex-1 min-w-0">
                                        <span className="truncate">{podcast.title}</span>
                                    </div>
                                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                </CommandItem>
                            ))}
                        </CommandGroup>
                        <CommandSeparator />
                    </>
                )}

                {!loading && results.flashcards.length > 0 && (
                    <CommandGroup heading="Flashcards">
                        {results.flashcards.map((flashcard) => (
                            <CommandItem
                                key={flashcard.id}
                                value={flashcard.title}
                                onSelect={() => handleSelect(flashcard)}
                                className="cursor-pointer"
                            >
                                {getIcon('flashcard')}
                                <div className="flex-1 min-w-0">
                                    <span className="truncate">{flashcard.title}</span>
                                </div>
                                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                            </CommandItem>
                        ))}
                    </CommandGroup>
                )}
            </CommandList>
        </CommandDialog>
    );
};
