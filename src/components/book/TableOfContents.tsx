import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { List, Bookmark, StickyNote, X } from 'lucide-react';

interface Chapter {
    id: string;
    title: string;
    position: number;
}

interface BookmarkItem {
    id: string;
    position: number;
    title: string | null;
}

interface NoteItem {
    id: string;
    position: number;
    content: string;
}

interface TableOfContentsProps {
    chapters: Chapter[];
    bookmarks: BookmarkItem[];
    notes: NoteItem[];
    onChapterSelect: (position: number) => void;
    onBookmarkSelect: (position: number) => void;
    onBookmarkRemove: (id: string) => void;
    onNoteSelect: (position: number) => void;
    onNoteDelete: (id: string) => void;
}

export const TableOfContents = ({
    chapters,
    bookmarks,
    notes,
    onChapterSelect,
    onBookmarkSelect,
    onBookmarkRemove,
    onNoteSelect,
    onNoteDelete,
}: TableOfContentsProps) => {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                    <List className="h-5 w-5" />
                </Button>
            </SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Table of Contents</SheetTitle>
                </SheetHeader>
                <ScrollArea className="h-[calc(100vh-100px)] mt-4">
                    {/* Chapters */}
                    {chapters.length > 0 ? (
                        <div className="space-y-2">
                            {chapters.map((chapter) => (
                                <Button
                                    key={chapter.id}
                                    variant="ghost"
                                    className="w-full justify-start"
                                    onClick={() => onChapterSelect(chapter.position)}
                                >
                                    {chapter.title}
                                </Button>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-center py-8">
                            No chapters defined
                        </p>
                    )}

                    {/* Bookmarks section */}
                    <div className="mt-8">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                            <Bookmark className="h-4 w-4" />
                            Bookmarks
                        </h3>
                        {bookmarks.length > 0 ? (
                            <div className="space-y-2">
                                {bookmarks.map((bookmark) => (
                                    <div key={bookmark.id} className="flex items-center gap-2">
                                        <Button
                                            variant="ghost"
                                            className="flex-1 justify-start text-sm"
                                            onClick={() => onBookmarkSelect(bookmark.position)}
                                        >
                                            {bookmark.title}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => onBookmarkRemove(bookmark.id)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground text-sm">No bookmarks yet</p>
                        )}
                    </div>

                    {/* Notes section */}
                    <div className="mt-8">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                            <StickyNote className="h-4 w-4" />
                            Notes
                        </h3>
                        {notes.length > 0 ? (
                            <div className="space-y-3">
                                {notes.map((note) => (
                                    <div key={note.id} className="p-3 rounded-lg bg-muted">
                                        <p className="text-sm">{note.content}</p>
                                        <div className="flex items-center justify-between mt-2">
                                            <Button
                                                variant="link"
                                                className="p-0 h-auto text-xs"
                                                onClick={() => onNoteSelect(note.position)}
                                            >
                                                Go to position
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6"
                                                onClick={() => onNoteDelete(note.id)}
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground text-sm">No notes yet</p>
                        )}
                    </div>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );
};
