import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FlashcardSet, Flashcard } from "@/types";
import { useFlashcardStudy } from "@/hooks/useFlashcardStudy";
import { cn } from "@/lib/utils";
import { EmbedDialog } from "@/components/flashcard/EmbedDialog";
import { MatchingGame } from "@/components/flashcard/MatchingGame";
import {
    ArrowLeft,
    RotateCcw,
    LayoutGrid,
    List,
    Shuffle,
    Check,
    X,
    Layers,
    Undo2
} from "lucide-react";
import { useState, useEffect } from "react";

interface FlashcardStudyProps {
    set: FlashcardSet;
    cards: Flashcard[];
    userProgress: any[];
    onExit: () => void;
}

export const FlashcardStudy = ({
    set,
    cards,
    userProgress,
    onExit
}: FlashcardStudyProps) => {
    const study = useFlashcardStudy(cards, userProgress);
    const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (viewMode === 'list') return;

            switch (e.key) {
                case " ":
                    e.preventDefault();
                    study.setIsFlipped(!study.isFlipped);
                    break;
                case "ArrowLeft":
                    e.preventDefault();
                    study.handleMarkCard('unknown');
                    break;
                case "ArrowRight":
                    e.preventDefault();
                    study.handleMarkCard('known');
                    break;
                case "Backspace":
                    e.preventDefault();
                    study.handleUndo();
                    break;
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [study, viewMode]);

    const unseenCount = cards ? cards.length - study.knownCards.size - study.unknownCards.size : 0;

    // Helper to get status for list view
    const getCardStatus = (cardId: string) => {
        if (study.knownCards.has(cardId)) return 'known';
        if (study.unknownCards.has(cardId)) return 'unknown';
        return 'unseen';
    };

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                            if (study.isRetryMode) {
                                study.exitRetryMode();
                            } else {
                                onExit();
                            }
                        }}
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
                            {study.isRetryMode ? "Ôn lại thẻ chưa biết" : set.title}
                            {!study.isRetryMode && <EmbedDialog setId={set.id} title={set.title} />}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {study.isRetryMode
                                ? `${study.retryCards.length} thẻ cần ôn lại`
                                : set.description
                            }
                        </p>
                    </div>
                </div>

                {/* View Mode Toggle & Games */}
                <div className="flex items-center gap-2">
                    <MatchingGame
                        cards={cards || []}
                        onComplete={(score) => {
                            console.log("Game completed with score:", score);
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
                    <Button variant="outline" size="icon" onClick={study.resetAllCards}>
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
                        <p className="text-3xl font-bold text-green-500">{study.knownCards.size}</p>
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
                    study.unknownCards.size >= 7 && "ring-2 ring-red-500 ring-offset-2"
                )}
                    onClick={() => study.unknownCards.size > 0 && study.startRetryMode()}
                >
                    <CardContent className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2 mb-1">
                            <X className="w-5 h-5 text-red-500" />
                            <span className="font-semibold text-red-600 dark:text-red-400">Chưa biết</span>
                        </div>
                        <p className="text-3xl font-bold text-red-500">{study.unknownCards.size}</p>
                        {study.unknownCards.size >= 7 && (
                            <p className="text-xs text-red-500 mt-1">Nhấn để thử lại!</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Retry Button */}
            {study.unknownCards.size >= 1 && !study.isRetryMode && (
                <div className="mb-6">
                    <Button
                        onClick={study.startRetryMode}
                        className="w-full gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:opacity-90"
                    >
                        <RotateCcw className="w-4 h-4" />
                        Thử lại {study.unknownCards.size} thẻ chưa biết
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
            {viewMode === 'list' ? (
                /* List View */
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
            ) : study.currentCard ? (
                /* Card View */
                <>
                    {/* Progress number */}
                    <div className="flex items-center justify-between text-sm mb-4">
                        <span className="text-muted-foreground">
                            Thẻ {study.currentIndex + 1} / {study.activeCards?.length || 0}
                        </span>
                        {study.cardHistory.length > 0 && (
                            <Button variant="ghost" size="sm" onClick={study.handleUndo} className="gap-1 text-muted-foreground">
                                <Undo2 className="w-4 h-4" />
                                Hoàn tác
                            </Button>
                        )}
                    </div>

                    <div className="relative h-[400px] w-full perspective-1000 group">
                        <div
                            className={cn(
                                "relative w-full h-full transition-all duration-500 transform-style-3d cursor-pointer shadow-xl rounded-xl",
                                study.isFlipped ? "rotate-y-180" : "",
                                study.isAnimating && study.slideDirection === "left" && "-translate-x-full opacity-0",
                                study.isAnimating && study.slideDirection === "right" && "translate-x-full opacity-0"
                            )}
                            onClick={() => study.setIsFlipped(!study.isFlipped)}
                        >
                            {/* Front Face */}
                            <div className="absolute w-full h-full backface-hidden">
                                <div className="w-full h-full p-8 rounded-xl border-2 border-border bg-card flex flex-col items-center justify-center text-center hover:border-primary/50 transition-colors">
                                    <div className="absolute top-4 left-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Thuật ngữ
                                    </div>
                                    <h3 className="text-3xl font-bold">{study.currentCard.front_text}</h3>
                                    <div className="absolute bottom-4 text-sm text-muted-foreground animate-pulse">
                                        Nhấn để lật thẻ
                                    </div>
                                </div>
                            </div>

                            {/* Back Face */}
                            <div className="absolute w-full h-full backface-hidden rotate-y-180">
                                <div className="w-full h-full p-8 rounded-xl border-2 border-primary/20 bg-primary/5 flex flex-col items-center justify-center text-center">
                                    <div className="absolute top-4 left-4 text-xs font-medium text-primary uppercase tracking-wider">
                                        Định nghĩa
                                    </div>
                                    <p className="text-xl leading-relaxed">{study.currentCard.back_text}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-center gap-8 mt-8">
                        <Button
                            variant="outline"
                            size="lg"
                            className="w-32 h-12 gap-2 border-red-200 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                            onClick={() => study.handleMarkCard('unknown')}
                            disabled={study.isAnimating}
                        >
                            <X className="w-5 h-5" />
                            Chưa biết
                        </Button>

                        <Button
                            variant="default"
                            size="lg"
                            className="w-32 h-12 gap-2 bg-green-600 hover:bg-green-700"
                            onClick={() => study.handleMarkCard('known')}
                            disabled={study.isAnimating}
                        >
                            <Check className="w-5 h-5" />
                            Đã biết
                        </Button>
                    </div>
                </>
            ) : (
                /* End of Set */
                <Card className="text-center py-16">
                    <CardContent>
                        <div className="mb-6 inline-flex p-4 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600">
                            <Sparkles className="w-12 h-12" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Chúc mừng!</h2>
                        <p className="text-muted-foreground mb-8">
                            Bạn đã hoàn thành tất cả các thẻ trong bộ này.
                        </p>
                        <Button onClick={study.resetAllCards} className="gap-2">
                            <RotateCcw className="w-4 h-4" />
                            Học lại
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};
