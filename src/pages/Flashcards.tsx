import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  RotateCcw,
  ArrowLeft,
  Search,
  Sparkles,
  Brain,
  TrendingUp,
  Target,
  Shuffle,
  Undo2,
  List,
  LayoutGrid,
  Check,
  X,
  Layers,
  BookOpen,
  Play
} from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { LuckyWheel } from "@/components/flashcard/LuckyWheel";
import { EmbedDialog } from "@/components/flashcard/EmbedDialog";
import { MatchingGame } from "@/components/flashcard/MatchingGame";

interface FlashcardSet {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  card_count: number | null;
}

interface Flashcard {
  id: string;
  front_text: string;
  back_text: string;
  card_order: number | null;
}

interface UserProgress {
  flashcard_id: string;
  is_remembered: boolean;
}

type CardStatus = 'known' | 'unknown' | 'unseen';

const Flashcards = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedSet, setSelectedSet] = useState<FlashcardSet | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isAnimating, setIsAnimating] = useState(false);
  const [slideDirection, setSlideDirection] = useState<"left" | "right" | null>(null);

  // New state for classification system
  const [knownCards, setKnownCards] = useState<Set<string>>(new Set());
  const [unknownCards, setUnknownCards] = useState<Set<string>>(new Set());
  const [cardHistory, setCardHistory] = useState<Array<{ cardId: string, action: 'known' | 'unknown' }>>([]);
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');
  const [isRetryMode, setIsRetryMode] = useState(false);
  const [retryCards, setRetryCards] = useState<Flashcard[]>([]);

  // Fetch flashcard sets
  const { data: sets, isLoading: setsLoading } = useQuery({
    queryKey: ["flashcard-sets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("flashcard_sets")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as FlashcardSet[];
    },
  });

  // Fetch flashcards for selected set
  const { data: cards, isLoading: cardsLoading } = useQuery({
    queryKey: ["flashcards", selectedSet?.id],
    queryFn: async () => {
      if (!selectedSet) return [];
      const { data, error } = await supabase
        .from("flashcards")
        .select("*")
        .eq("set_id", selectedSet.id)
        .order("card_order", { ascending: true });
      if (error) throw error;
      return data as Flashcard[];
    },
    enabled: !!selectedSet,
  });

  // Fetch user progress
  const { data: userProgress } = useQuery({
    queryKey: ["flashcard-progress", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("user_flashcard_progress")
        .select("flashcard_id, is_remembered")
        .eq("user_id", user.id);
      if (error) throw error;
      return data as UserProgress[];
    },
    enabled: !!user,
  });

  // Initialize progress from database
  useEffect(() => {
    if (userProgress && cards) {
      const known = new Set<string>();
      const unknown = new Set<string>();
      userProgress.forEach((p) => {
        if (p.is_remembered) {
          known.add(p.flashcard_id);
        } else {
          unknown.add(p.flashcard_id);
        }
      });
      setKnownCards(known);
      setUnknownCards(unknown);
    }
  }, [userProgress, cards]);

  // Get active cards (either all cards or retry cards)
  const activeCards = isRetryMode ? retryCards : cards;

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedSet || !activeCards || activeCards.length === 0 || viewMode === 'list') return;

      switch (e.key) {
        case " ":
          e.preventDefault();
          setIsFlipped(!isFlipped);
          break;
        case "ArrowLeft":
          e.preventDefault();
          handleMarkCard('unknown');
          break;
        case "ArrowRight":
          e.preventDefault();
          handleMarkCard('known');
          break;
        case "Backspace":
          e.preventDefault();
          handleUndo();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedSet, activeCards, currentIndex, isFlipped, viewMode]);

  // Update progress mutation
  const updateProgressMutation = useMutation({
    mutationFn: async ({ flashcardId, isRemembered }: { flashcardId: string; isRemembered: boolean }) => {
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("user_flashcard_progress")
        .upsert({
          user_id: user.id,
          flashcard_id: flashcardId,
          is_remembered: isRemembered,
          last_reviewed_at: new Date().toISOString(),
          review_count: 1,
        }, {
          onConflict: "user_id,flashcard_id",
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flashcard-progress"] });
    },
  });

  const handleMarkCard = (status: 'known' | 'unknown') => {
    if (!activeCards || activeCards.length === 0 || isAnimating) return;

    const currentCard = activeCards[currentIndex];

    // Update local state
    if (status === 'known') {
      setKnownCards(prev => new Set([...prev, currentCard.id]));
      setUnknownCards(prev => {
        const newSet = new Set(prev);
        newSet.delete(currentCard.id);
        return newSet;
      });
    } else {
      setUnknownCards(prev => new Set([...prev, currentCard.id]));
      setKnownCards(prev => {
        const newSet = new Set(prev);
        newSet.delete(currentCard.id);
        return newSet;
      });
    }

    // Add to history for undo
    setCardHistory(prev => [...prev, { cardId: currentCard.id, action: status }]);

    // Save to database
    if (user) {
      updateProgressMutation.mutate({
        flashcardId: currentCard.id,
        isRemembered: status === 'known'
      });
    }

    // Animate and move to next card
    if (currentIndex < activeCards.length - 1) {
      setSlideDirection(status === 'known' ? "right" : "left");
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
        setIsFlipped(false);
        setIsAnimating(false);
        setSlideDirection(null);
      }, 250);
    } else {
      // End of cards
      toast({
        title: "🎉 Hoàn thành!",
        description: isRetryMode
          ? "Bạn đã ôn lại tất cả các thẻ chưa biết"
          : "Bạn đã xem hết tất cả các thẻ",
      });
    }
  };

  const handleUndo = () => {
    if (cardHistory.length === 0 || isAnimating) return;

    const lastAction = cardHistory[cardHistory.length - 1];

    // Remove from current classification
    if (lastAction.action === 'known') {
      setKnownCards(prev => {
        const newSet = new Set(prev);
        newSet.delete(lastAction.cardId);
        return newSet;
      });
    } else {
      setUnknownCards(prev => {
        const newSet = new Set(prev);
        newSet.delete(lastAction.cardId);
        return newSet;
      });
    }

    // Remove from history
    setCardHistory(prev => prev.slice(0, -1));

    // Go back to previous card
    if (currentIndex > 0) {
      setSlideDirection("right");
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prev) => prev - 1);
        setIsFlipped(false);
        setIsAnimating(false);
        setSlideDirection(null);
      }, 200);
    }

    toast({
      title: "↩️ Đã hoàn tác",
      description: "Thẻ đã được đưa về trạng thái chưa xem",
    });
  };

  const startRetryMode = () => {
    if (!cards) return;
    const cardsToRetry = cards.filter(card => unknownCards.has(card.id));
    if (cardsToRetry.length === 0) {
      toast({
        title: "Không có thẻ để ôn lại",
        description: "Chưa có thẻ nào trong ô 'Chưa biết'",
      });
      return;
    }
    setRetryCards(cardsToRetry);
    setIsRetryMode(true);
    setCurrentIndex(0);
    setIsFlipped(false);
    setCardHistory([]);
  };

  const exitRetryMode = () => {
    setIsRetryMode(false);
    setRetryCards([]);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const resetAllCards = () => {
    setKnownCards(new Set());
    setUnknownCards(new Set());
    setCardHistory([]);
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsRetryMode(false);
    setRetryCards([]);
  };

  const shuffleAndReset = () => {
    resetAllCards();
    toast({
      title: "🔀 Đã xáo trộn và reset",
      description: "Bắt đầu học lại từ đầu",
    });
  };

  const getCardStatus = (cardId: string): CardStatus => {
    if (knownCards.has(cardId)) return 'known';
    if (unknownCards.has(cardId)) return 'unknown';
    return 'unseen';
  };

  const handleLuckyWin = (points: number) => {
    // In a real app, update user points in DB
    console.log("Won points:", points);
  };

  // Get unique categories
  const categories = sets ? [...new Set(sets.map(s => s.category).filter(Boolean))] : [];

  // Filter sets
  const filteredSets = sets?.filter(set => {
    const matchesSearch = set.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      set.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || set.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Stats
  const totalCards = sets?.reduce((sum, set) => sum + (set.card_count || 0), 0) || 0;
  const totalRemembered = userProgress?.filter(p => p.is_remembered).length || 0;

  if (setsLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Show flashcard sets list
  if (!selectedSet) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1">
          {/* Hero Section */}
          <section className="relative py-12 bg-gradient-to-br from-primary/10 via-background to-accent/10 overflow-hidden">
            <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
            <div className="container mx-auto px-4 relative">
              <div className="max-w-3xl mx-auto text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-sm font-medium">Học thông minh hơn với Flashcards</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                  <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    Flashcards
                  </span>
                </h1>
                <p className="text-lg text-muted-foreground mb-8">
                  Ghi nhớ hiệu quả với phương pháp thẻ ghi nhớ và Spaced Repetition
                </p>

                <div className="flex flex-wrap justify-center gap-4 mt-8">
                  {user && (
                    <Link to="/flashcards/review">
                      <Button size="lg" className="gap-2 shadow-lg bg-gradient-to-r from-primary to-accent hover:opacity-90">
                        <Brain className="w-5 h-5" />
                        Ôn tập ngay
                      </Button>
                    </Link>
                  )}
                  <LuckyWheel onWin={handleLuckyWin} />
                </div>
              </div>
            </div>
          </section>

          {/* Stats Cards */}
          <section className="py-8 border-b border-border/50">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border-border/50 bg-gradient-to-br from-blue-500/5 to-blue-500/10">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-500/10">
                        <Layers className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{sets?.length || 0}</p>
                        <p className="text-xs text-muted-foreground">Bộ thẻ</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/50 bg-gradient-to-br from-emerald-500/5 to-emerald-500/10">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-emerald-500/10">
                        <BookOpen className="w-5 h-5 text-emerald-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{totalCards}</p>
                        <p className="text-xs text-muted-foreground">Tổng thẻ</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/50 bg-gradient-to-br from-amber-500/5 to-amber-500/10">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-amber-500/10">
                        <Check className="w-5 h-5 text-amber-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{totalRemembered}</p>
                        <p className="text-xs text-muted-foreground">Đã nhớ</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/50 bg-gradient-to-br from-purple-500/5 to-purple-500/10">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-purple-500/10">
                        <TrendingUp className="w-5 h-5 text-purple-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">
                          {totalCards > 0 ? Math.round((totalRemembered / totalCards) * 100) : 0}%
                        </p>
                        <p className="text-xs text-muted-foreground">Tiến độ</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* Sets List */}
          <section className="py-8">
            <div className="container mx-auto px-4">
              {/* Search and Filter */}
              <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="Tìm kiếm bộ thẻ..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                  <Button
                    variant={selectedCategory === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory("all")}
                    className="shrink-0"
                  >
                    Tất cả
                  </Button>
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category || "all")}
                      className="shrink-0"
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Sets Grid */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredSets?.map((set) => (
                  <Card
                    key={set.id}
                    className="cursor-pointer hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/30 group overflow-hidden"
                    onClick={() => setSelectedSet(set)}
                  >
                    <div className="h-2 bg-gradient-to-r from-primary to-accent" />
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg group-hover:text-primary transition-colors truncate">
                            {set.title}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {set.description}
                          </p>
                        </div>
                        {set.category && (
                          <Badge variant="secondary" className="uppercase text-xs shrink-0 ml-2">
                            {set.category}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Layers className="w-4 h-4" />
                            <span>{set.card_count} thẻ</span>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="gap-1 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          <Play className="w-4 h-4" />
                          Học ngay
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredSets?.length === 0 && (
                <Card className="text-center py-16">
                  <CardContent>
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                      <Layers className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">
                      {searchQuery || selectedCategory !== "all"
                        ? "Không tìm thấy bộ thẻ nào"
                        : "Chưa có bộ thẻ nào"}
                    </h3>
                    <p className="text-muted-foreground">
                      {searchQuery || selectedCategory !== "all"
                        ? "Thử tìm kiếm với từ khóa khác"
                        : "Các bộ flashcard sẽ xuất hiện ở đây"}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  // Show flashcard study view
  const currentCard = activeCards?.[currentIndex];
  const unseenCount = cards ? cards.length - knownCards.size - unknownCards.size : 0;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  if (isRetryMode) {
                    exitRetryMode();
                  } else {
                    setSelectedSet(null);
                    resetAllCards();
                  }
                }}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
                  {isRetryMode ? "Ôn lại thẻ chưa biết" : selectedSet.title}
                  {!isRetryMode && <EmbedDialog setId={selectedSet.id} title={selectedSet.title} />}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {isRetryMode
                    ? `${retryCards.length} thẻ cần ôn lại`
                    : selectedSet.description
                  }
                </p>
              </div>
            </div>

            {/* View Mode Toggle & Games */}
            <div className="flex items-center gap-2">
              <MatchingGame
                cards={cards || []}
                onComplete={(score) => {
                  // Handle game completion
                }}
              />
              <div className="hidden md:flex border rounded-lg overflow-hidden ml-2">
                <Button
                  variant={viewMode === 'cards' ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => setViewMode('cards')}
                  className="rounded-none h-9 w-9"
                >
                  <LayoutGrid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => setViewMode('list')}
                  className="rounded-none h-9 w-9"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
              <Button variant="outline" size="icon" onClick={shuffleAndReset}>
                <Shuffle className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Classification Boxes */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <Card className={cn(
              "border-2 transition-all",
              "border-green-500/30 bg-gradient-to-br from-green-500/5 to-green-500/10"
            )}>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="font-semibold text-green-600 dark:text-green-400">Đã biết</span>
                </div>
                <p className="text-3xl font-bold text-green-500">{knownCards.size}</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-muted bg-muted/30">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Layers className="w-5 h-5 text-muted-foreground" />
                  <span className="font-semibold text-muted-foreground">Chưa xem</span>
                </div>
                <p className="text-3xl font-bold text-muted-foreground">{unseenCount}</p>
              </CardContent>
            </Card>

            <Card className={cn(
              "border-2 transition-all cursor-pointer hover:shadow-md",
              "border-red-500/30 bg-gradient-to-br from-red-500/5 to-red-500/10",
              unknownCards.size >= 7 && "ring-2 ring-red-500 ring-offset-2"
            )}
              onClick={() => unknownCards.size > 0 && startRetryMode()}
            >
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <X className="w-5 h-5 text-red-500" />
                  <span className="font-semibold text-red-600 dark:text-red-400">Chưa biết</span>
                </div>
                <p className="text-3xl font-bold text-red-500">{unknownCards.size}</p>
                {unknownCards.size >= 7 && (
                  <p className="text-xs text-red-500 mt-1">Nhấn để thử lại!</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Retry Button */}
          {unknownCards.size >= 7 && !isRetryMode && (
            <div className="mb-6">
              <Button
                onClick={startRetryMode}
                className="w-full gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:opacity-90"
              >
                <RotateCcw className="w-4 h-4" />
                Thử lại {unknownCards.size} thẻ chưa biết
              </Button>
            </div>
          )}

          {/* Keyboard Hints */}
          <div className="hidden md:flex items-center justify-center gap-6 mb-4 text-xs text-muted-foreground bg-muted/30 rounded-lg p-3">
            <span className="flex items-center gap-1">
              <kbd className="px-2 py-1 rounded bg-muted font-mono">Space</kbd>
              Lật thẻ
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-2 py-1 rounded bg-muted font-mono">←</kbd>
              Chưa biết
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-2 py-1 rounded bg-muted font-mono">→</kbd>
              Đã biết
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-2 py-1 rounded bg-muted font-mono">Backspace</kbd>
              Hoàn tác
            </span>
          </div>

          {/* Content */}
          {cardsLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : viewMode === 'list' ? (
            /* List View - Terminology & Definitions */
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <List className="w-5 h-5" />
                  Danh sách Thuật ngữ & Định nghĩa
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {cards?.map((card, index) => {
                    const status = getCardStatus(card.id);
                    return (
                      <div
                        key={card.id}
                        className={cn(
                          "p-4 flex items-start gap-4 hover:bg-muted/50 transition-colors cursor-pointer",
                          status === 'known' && "bg-green-500/5",
                          status === 'unknown' && "bg-red-500/5"
                        )}
                        onClick={() => {
                          setCurrentIndex(index);
                          setViewMode('cards');
                          setIsFlipped(false);
                        }}
                      >
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-medium",
                          status === 'known' && "bg-green-500/20 text-green-600",
                          status === 'unknown' && "bg-red-500/20 text-red-600",
                          status === 'unseen' && "bg-muted text-muted-foreground"
                        )}>
                          {status === 'known' ? <Check className="w-4 h-4" /> :
                            status === 'unknown' ? <X className="w-4 h-4" /> :
                              index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground">{card.front_text}</p>
                          <p className="text-sm text-muted-foreground mt-1">{card.back_text}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ) : currentCard ? (
            /* Card View */
            <>
              {/* Progress indicator */}
              <div className="flex items-center justify-between text-sm mb-4">
                <span className="text-muted-foreground">
                  Thẻ {currentIndex + 1} / {activeCards?.length || 0}
                </span>
                {cardHistory.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={handleUndo} className="gap-1 text-muted-foreground">
                    <Undo2 className="w-4 h-4" />
                    Hoàn tác
                  </Button>
                )}
              </div>

              {/* Flashcard */}
              <div
                className={cn(
                  "perspective-1000 mb-6 cursor-pointer transition-all duration-300",
                  isAnimating && slideDirection === "left" && "translate-x-[-30px] opacity-0",
                  isAnimating && slideDirection === "right" && "translate-x-[30px] opacity-0"
                )}
                onClick={() => setIsFlipped(!isFlipped)}
              >
                <div
                  className="relative w-full h-72 md:h-80 transition-transform duration-500"
                  style={{
                    transformStyle: "preserve-3d",
                    transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                  }}
                >
                  {/* Front */}
                  <Card
                    className="absolute inset-0 flex items-center justify-center p-8 shadow-xl border-2 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800"
                    style={{ backfaceVisibility: "hidden" }}
                  >
                    <div className="text-center w-full">
                      <Badge variant="outline" className="mb-4 bg-background">
                        Thuật ngữ
                      </Badge>
                      <h2 className="text-2xl md:text-3xl font-bold text-foreground leading-tight">
                        {currentCard.front_text}
                      </h2>
                      <p className="text-sm text-muted-foreground mt-6 flex items-center justify-center gap-2">
                        <RotateCcw className="w-4 h-4" />
                        Nhấn để xem định nghĩa
                      </p>
                    </div>
                  </Card>

                  {/* Back */}
                  <Card
                    className="absolute inset-0 flex items-center justify-center p-8 shadow-xl border-2 bg-gradient-to-br from-primary/5 to-accent/5"
                    style={{
                      backfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                    }}
                  >
                    <div className="text-center w-full">
                      <Badge variant="outline" className="mb-4 bg-background">
                        Định nghĩa
                      </Badge>
                      <p className="text-xl md:text-2xl text-foreground leading-relaxed">
                        {currentCard.back_text}
                      </p>
                      <p className="text-sm text-muted-foreground mt-6 flex items-center justify-center gap-2">
                        <RotateCcw className="w-4 h-4" />
                        Nhấn để lật lại
                      </p>
                    </div>
                  </Card>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => handleMarkCard('unknown')}
                  disabled={isAnimating}
                  className="flex-1 max-w-[200px] h-14 text-red-500 border-red-200 hover:bg-red-500 hover:text-white hover:border-red-500 dark:border-red-500/30"
                >
                  <X className="w-6 h-6 mr-2" />
                  Chưa biết
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => handleMarkCard('known')}
                  disabled={isAnimating}
                  className="flex-1 max-w-[200px] h-14 text-green-500 border-green-200 hover:bg-green-500 hover:text-white hover:border-green-500 dark:border-green-500/30"
                >
                  <Check className="w-6 h-6 mr-2" />
                  Đã biết
                </Button>
              </div>

              {/* Reset/Actions */}
              <div className="flex items-center justify-center gap-4 mt-6">
                <Button variant="ghost" onClick={resetAllCards} className="text-muted-foreground">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Học lại từ đầu
                </Button>
              </div>
            </>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                  <Layers className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Không có thẻ nào</h3>
                <p className="text-muted-foreground">
                  Bộ flashcard này chưa có thẻ nào
                </p>
              </CardContent>
            </Card>
          )}

          {/* Completion message */}
          {activeCards && currentIndex === activeCards.length - 1 && knownCards.size === cards?.length && (
            <Card className="mt-6 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30">
              <CardContent className="py-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Check className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-xl font-bold text-green-600 dark:text-green-400 mb-2">
                  🎉 Xuất sắc! Bạn đã nhớ tất cả các thẻ!
                </h3>
                <p className="text-green-600/80 dark:text-green-500/80 mb-4">
                  Hãy tiếp tục ôn luyện với Spaced Repetition để ghi nhớ lâu hơn
                </p>
                <Link to="/flashcards/review">
                  <Button className="gap-2 bg-green-500 hover:bg-green-600">
                    <Brain className="w-4 h-4" />
                    Ôn tập thông minh
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Flashcards;
