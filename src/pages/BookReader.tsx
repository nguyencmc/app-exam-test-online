import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import {
  ArrowLeft,
  BookOpen,
  Bookmark,
  BookmarkCheck,
  Settings,
  Search,
  Sun,
  Moon,
  List,
  Type,
  Highlighter,
  StickyNote,
  ChevronLeft,
  ChevronRight,
  X,
  Clock,
  Check,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Book {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  author_name: string | null;
  page_count: number | null;
}

interface Chapter {
  id: string;
  title: string;
  position: number;
  chapter_order: number;
}

interface Bookmark {
  id: string;
  position: number;
  title: string | null;
  created_at: string;
}

interface Highlight {
  id: string;
  start_position: number;
  end_position: number;
  highlighted_text: string;
  color: string;
  created_at: string;
}

interface Note {
  id: string;
  position: number;
  content: string;
  created_at: string;
}

interface ReadingProgress {
  id: string;
  current_position: number;
  total_time_seconds: number;
  is_completed: boolean;
}

const FONT_SIZES = [14, 16, 18, 20, 22, 24, 28];
const HIGHLIGHT_COLORS = [
  { name: "yellow", class: "bg-yellow-300/50" },
  { name: "green", class: "bg-green-300/50" },
  { name: "blue", class: "bg-blue-300/50" },
  { name: "pink", class: "bg-pink-300/50" },
  { name: "purple", class: "bg-purple-300/50" },
];

const BookReader = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const contentRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Reading settings
  const [fontSize, setFontSize] = useState(18);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [readingTime, setReadingTime] = useState(0);

  // UI states
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<number[]>([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(0);
  const [selectedText, setSelectedText] = useState("");
  const [selectionRange, setSelectionRange] = useState<{ start: number; end: number } | null>(null);
  const [showNoteDialog, setShowNoteDialog] = useState(false);
  const [noteContent, setNoteContent] = useState("");
  const [highlightColor, setHighlightColor] = useState("yellow");

  // Fetch book
  const { data: book, isLoading: bookLoading } = useQuery({
    queryKey: ["book-reader", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("books")
        .select("id, title, slug, content, author_name, page_count")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return data as Book | null;
    },
  });

  // Fetch chapters
  const { data: chapters = [] } = useQuery({
    queryKey: ["book-chapters", book?.id],
    queryFn: async () => {
      if (!book?.id) return [];
      const { data, error } = await supabase
        .from("book_chapters")
        .select("*")
        .eq("book_id", book.id)
        .order("chapter_order");
      if (error) throw error;
      return data as Chapter[];
    },
    enabled: !!book?.id,
  });

  // Fetch user's reading progress
  const { data: progress } = useQuery({
    queryKey: ["reading-progress", book?.id, user?.id],
    queryFn: async () => {
      if (!book?.id || !user?.id) return null;
      const { data, error } = await supabase
        .from("user_book_progress")
        .select("*")
        .eq("book_id", book.id)
        .eq("user_id", user.id)
        .maybeSingle();
      if (error && error.code !== "PGRST116") throw error;
      return data as ReadingProgress | null;
    },
    enabled: !!book?.id && !!user?.id,
  });

  // Fetch bookmarks
  const { data: bookmarks = [] } = useQuery({
    queryKey: ["book-bookmarks", book?.id, user?.id],
    queryFn: async () => {
      if (!book?.id || !user?.id) return [];
      const { data, error } = await supabase
        .from("book_bookmarks")
        .select("*")
        .eq("book_id", book.id)
        .eq("user_id", user.id)
        .order("position");
      if (error) throw error;
      return data as Bookmark[];
    },
    enabled: !!book?.id && !!user?.id,
  });

  // Fetch highlights
  const { data: highlights = [] } = useQuery({
    queryKey: ["book-highlights", book?.id, user?.id],
    queryFn: async () => {
      if (!book?.id || !user?.id) return [];
      const { data, error } = await supabase
        .from("book_highlights")
        .select("*")
        .eq("book_id", book.id)
        .eq("user_id", user.id)
        .order("start_position");
      if (error) throw error;
      return data as Highlight[];
    },
    enabled: !!book?.id && !!user?.id,
  });

  // Fetch notes
  const { data: notes = [] } = useQuery({
    queryKey: ["book-notes", book?.id, user?.id],
    queryFn: async () => {
      if (!book?.id || !user?.id) return [];
      const { data, error } = await supabase
        .from("book_notes")
        .select("*")
        .eq("book_id", book.id)
        .eq("user_id", user.id)
        .order("position");
      if (error) throw error;
      return data as Note[];
    },
    enabled: !!book?.id && !!user?.id,
  });

  // Save progress mutation
  const saveProgressMutation = useMutation({
    mutationFn: async (data: { position: number; timeSpent: number; isCompleted?: boolean }) => {
      if (!book?.id || !user?.id) return;
      
      const { error } = await supabase
        .from("user_book_progress")
        .upsert({
          user_id: user.id,
          book_id: book.id,
          current_position: data.position,
          total_time_seconds: data.timeSpent,
          is_completed: data.isCompleted || false,
          last_read_at: new Date().toISOString(),
          ...(data.isCompleted && { completed_at: new Date().toISOString() }),
        }, {
          onConflict: "user_id,book_id",
        });
      if (error) throw error;
    },
  });

  // Add bookmark mutation
  const addBookmarkMutation = useMutation({
    mutationFn: async (position: number) => {
      if (!book?.id || !user?.id) return;
      const { error } = await supabase
        .from("book_bookmarks")
        .insert({
          user_id: user.id,
          book_id: book.id,
          position,
          title: `Position ${position}`,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["book-bookmarks", book?.id, user?.id] });
      toast.success("Bookmark added");
    },
  });

  // Remove bookmark mutation
  const removeBookmarkMutation = useMutation({
    mutationFn: async (bookmarkId: string) => {
      const { error } = await supabase
        .from("book_bookmarks")
        .delete()
        .eq("id", bookmarkId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["book-bookmarks", book?.id, user?.id] });
      toast.success("Bookmark removed");
    },
  });

  // Add highlight mutation
  const addHighlightMutation = useMutation({
    mutationFn: async (data: { start: number; end: number; text: string; color: string }) => {
      if (!book?.id || !user?.id) return;
      const { error } = await supabase
        .from("book_highlights")
        .insert({
          user_id: user.id,
          book_id: book.id,
          start_position: data.start,
          end_position: data.end,
          highlighted_text: data.text,
          color: data.color,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["book-highlights", book?.id, user?.id] });
      toast.success("Highlight added");
      setSelectedText("");
      setSelectionRange(null);
    },
  });

  // Add note mutation
  const addNoteMutation = useMutation({
    mutationFn: async (data: { position: number; content: string }) => {
      if (!book?.id || !user?.id) return;
      const { error } = await supabase
        .from("book_notes")
        .insert({
          user_id: user.id,
          book_id: book.id,
          position: data.position,
          content: data.content,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["book-notes", book?.id, user?.id] });
      toast.success("Note added");
      setShowNoteDialog(false);
      setNoteContent("");
    },
  });

  // Delete note mutation
  const deleteNoteMutation = useMutation({
    mutationFn: async (noteId: string) => {
      const { error } = await supabase
        .from("book_notes")
        .delete()
        .eq("id", noteId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["book-notes", book?.id, user?.id] });
      toast.success("Note deleted");
    },
  });

  // Initialize position from progress
  useEffect(() => {
    if (progress?.current_position) {
      setCurrentPosition(progress.current_position);
    }
    if (progress?.total_time_seconds) {
      setReadingTime(progress.total_time_seconds);
    }
  }, [progress]);

  // Reading timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setReadingTime((prev) => prev + 1);
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Auto-save progress
  useEffect(() => {
    const saveTimer = setInterval(() => {
      if (user && book) {
        saveProgressMutation.mutate({
          position: currentPosition,
          timeSpent: readingTime,
        });
      }
    }, 30000); // Save every 30 seconds

    return () => clearInterval(saveTimer);
  }, [currentPosition, readingTime, user, book]);

  // Handle text selection
  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      setSelectedText(selection.toString().trim());
      // Get selection range relative to content
      const range = selection.getRangeAt(0);
      const preSelectionRange = range.cloneRange();
      if (contentRef.current) {
        preSelectionRange.selectNodeContents(contentRef.current);
        preSelectionRange.setEnd(range.startContainer, range.startOffset);
        const start = preSelectionRange.toString().length;
        setSelectionRange({
          start,
          end: start + selection.toString().length,
        });
      }
    }
  }, []);

  // Search in content
  const handleSearch = useCallback(() => {
    if (!searchQuery || !book?.content) return;
    const regex = new RegExp(searchQuery, "gi");
    const matches: number[] = [];
    let match;
    while ((match = regex.exec(book.content)) !== null) {
      matches.push(match.index);
    }
    setSearchResults(matches);
    setCurrentSearchIndex(0);
    if (matches.length === 0) {
      toast.info("No results found");
    } else {
      toast.success(`Found ${matches.length} results`);
    }
  }, [searchQuery, book?.content]);

  // Navigate chapters
  const goToChapter = (position: number) => {
    setCurrentPosition(position);
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  };

  // Calculate reading percentage
  const contentLength = book?.content?.length || 1;
  const readingPercentage = Math.min(100, Math.round((currentPosition / contentLength) * 100));

  // Format time
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins}m`;
  };

  // Check if current position has a bookmark
  const hasBookmarkAtPosition = bookmarks.some(
    (b) => Math.abs(b.position - currentPosition) < 100
  );

  if (bookLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <BookOpen className="h-12 w-12 text-primary" />
          <p className="text-muted-foreground">Loading book...</p>
        </div>
      </div>
    );
  }

  if (!book || !book.content) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-2">Book not found</h1>
        <p className="text-muted-foreground mb-6">This book doesn&apos;t have content yet.</p>
        <Button onClick={() => navigate("/books")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Books
        </Button>
      </div>
    );
  }

  return (
    <div className={cn(
      "min-h-screen transition-colors duration-300",
      isDarkMode ? "bg-zinc-900 text-zinc-100" : "bg-amber-50 text-zinc-900"
    )}>
      {/* Top Bar */}
      <header className={cn(
        "fixed top-0 left-0 right-0 z-50 border-b",
        isDarkMode ? "bg-zinc-900/95 border-zinc-800" : "bg-amber-50/95 border-amber-200"
      )}>
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                saveProgressMutation.mutate({
                  position: currentPosition,
                  timeSpent: readingTime,
                });
                navigate(`/book/${slug}`);
              }}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="hidden sm:block">
              <h1 className="text-sm font-medium line-clamp-1 max-w-[200px]">{book.title}</h1>
              <p className="text-xs text-muted-foreground">{book.author_name}</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Search */}
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
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                  <Button onClick={handleSearch}>Search</Button>
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
                          setCurrentSearchIndex(newIndex);
                          setCurrentPosition(searchResults[newIndex]);
                        }}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          const newIndex = (currentSearchIndex + 1) % searchResults.length;
                          setCurrentSearchIndex(newIndex);
                          setCurrentPosition(searchResults[newIndex]);
                        }}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>

            {/* Table of Contents */}
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
                  {chapters.length > 0 ? (
                    <div className="space-y-2">
                      {chapters.map((chapter) => (
                        <Button
                          key={chapter.id}
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => goToChapter(chapter.position)}
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
                              onClick={() => setCurrentPosition(bookmark.position)}
                            >
                              {bookmark.title}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => removeBookmarkMutation.mutate(bookmark.id)}
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
                          <div
                            key={note.id}
                            className="p-3 rounded-lg bg-muted"
                          >
                            <p className="text-sm">{note.content}</p>
                            <div className="flex items-center justify-between mt-2">
                              <Button
                                variant="link"
                                className="p-0 h-auto text-xs"
                                onClick={() => setCurrentPosition(note.position)}
                              >
                                Go to position
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => deleteNoteMutation.mutate(note.id)}
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

            {/* Bookmark toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                if (!user) {
                  toast.error("Please login to bookmark");
                  return;
                }
                const existingBookmark = bookmarks.find(
                  (b) => Math.abs(b.position - currentPosition) < 100
                );
                if (existingBookmark) {
                  removeBookmarkMutation.mutate(existingBookmark.id);
                } else {
                  addBookmarkMutation.mutate(currentPosition);
                }
              }}
            >
              {hasBookmarkAtPosition ? (
                <BookmarkCheck className="h-5 w-5 text-primary" />
              ) : (
                <Bookmark className="h-5 w-5" />
              )}
            </Button>

            {/* Settings */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Settings className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Reading Settings</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-6">
                  {/* Font Size */}
                  <div>
                    <label className="text-sm font-medium mb-3 flex items-center gap-2">
                      <Type className="h-4 w-4" />
                      Font Size: {fontSize}px
                    </label>
                    <Slider
                      value={[fontSize]}
                      min={14}
                      max={28}
                      step={2}
                      onValueChange={([value]) => setFontSize(value)}
                      className="mt-2"
                    />
                  </div>

                  {/* Theme */}
                  <div>
                    <label className="text-sm font-medium mb-3 block">Theme</label>
                    <div className="flex gap-2">
                      <Button
                        variant={!isDarkMode ? "default" : "outline"}
                        className="flex-1"
                        onClick={() => setIsDarkMode(false)}
                      >
                        <Sun className="h-4 w-4 mr-2" />
                        Light
                      </Button>
                      <Button
                        variant={isDarkMode ? "default" : "outline"}
                        className="flex-1"
                        onClick={() => setIsDarkMode(true)}
                      >
                        <Moon className="h-4 w-4 mr-2" />
                        Dark
                      </Button>
                    </div>
                  </div>

                  {/* Reading Stats */}
                  <div className="pt-4 border-t">
                    <h3 className="text-sm font-medium mb-4">Reading Stats</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 rounded-lg bg-muted">
                        <Clock className="h-5 w-5 mx-auto mb-1 text-primary" />
                        <p className="text-lg font-bold">{formatTime(readingTime)}</p>
                        <p className="text-xs text-muted-foreground">Time Spent</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-muted">
                        <BookOpen className="h-5 w-5 mx-auto mb-1 text-primary" />
                        <p className="text-lg font-bold">{readingPercentage}%</p>
                        <p className="text-xs text-muted-foreground">Completed</p>
                      </div>
                    </div>
                  </div>

                  {/* Mark as Complete */}
                  {readingPercentage >= 90 && !progress?.is_completed && (
                    <Button
                      className="w-full"
                      onClick={() => {
                        saveProgressMutation.mutate({
                          position: contentLength,
                          timeSpent: readingTime,
                          isCompleted: true,
                        });
                        toast.success("Congratulations! Book marked as completed!");
                      }}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Mark as Completed
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>

            {/* Theme toggle quick button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsDarkMode(!isDarkMode)}
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-muted">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${readingPercentage}%` }}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16 pb-20">
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <ScrollArea
            className="h-[calc(100vh-180px)]"
            onMouseUp={handleTextSelection}
          >
            <div
              ref={contentRef}
              className="prose prose-lg max-w-none"
              style={{
                fontSize: `${fontSize}px`,
                lineHeight: 1.8,
                color: isDarkMode ? "#e4e4e7" : "#18181b",
              }}
            >
              <p className="whitespace-pre-wrap leading-relaxed">
                {book.content}
              </p>
            </div>
          </ScrollArea>
        </div>
      </main>

      {/* Selection Toolbar */}
      {selectedText && user && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50">
          <div className={cn(
            "flex items-center gap-2 p-2 rounded-xl shadow-lg border",
            isDarkMode ? "bg-zinc-800 border-zinc-700" : "bg-white border-gray-200"
          )}>
            {/* Highlight colors */}
            {HIGHLIGHT_COLORS.map((color) => (
              <Button
                key={color.name}
                variant="ghost"
                size="icon"
                className={cn("h-8 w-8 rounded-full", color.class)}
                onClick={() => {
                  if (selectionRange) {
                    addHighlightMutation.mutate({
                      start: selectionRange.start,
                      end: selectionRange.end,
                      text: selectedText,
                      color: color.name,
                    });
                  }
                }}
              >
                <Highlighter className="h-4 w-4" />
              </Button>
            ))}
            
            {/* Add note */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setShowNoteDialog(true)}
            >
              <StickyNote className="h-4 w-4" />
            </Button>

            {/* Close */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => {
                setSelectedText("");
                setSelectionRange(null);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Add Note Dialog */}
      <Dialog open={showNoteDialog} onOpenChange={setShowNoteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Note</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedText && (
              <div className="p-3 rounded-lg bg-muted text-sm italic">
                "{selectedText}"
              </div>
            )}
            <Textarea
              placeholder="Write your note..."
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              rows={4}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowNoteDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (noteContent.trim() && selectionRange) {
                    addNoteMutation.mutate({
                      position: selectionRange.start,
                      content: noteContent,
                    });
                  }
                }}
                disabled={!noteContent.trim()}
              >
                Save Note
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bottom Bar */}
      <footer className={cn(
        "fixed bottom-0 left-0 right-0 border-t py-3",
        isDarkMode ? "bg-zinc-900/95 border-zinc-800" : "bg-amber-50/95 border-amber-200"
      )}>
        <div className="container mx-auto px-4 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {readingPercentage}% completed
          </span>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatTime(readingTime)}
            </Badge>
            {progress?.is_completed && (
              <Badge className="bg-green-500/10 text-green-600">
                <Check className="h-3 w-3 mr-1" />
                Completed
              </Badge>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default BookReader;
