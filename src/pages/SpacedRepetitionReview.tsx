import { useState, useEffect, useCallback } from 'react';
import { useSpacedRepetition } from '@/hooks/useSpacedRepetition';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    ArrowLeft,
    RotateCcw,
    ChevronLeft,
    ChevronRight,
    Sparkles,
    Clock,
    Brain,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

export const SpacedRepetitionReview = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();
    const {
        dueCards,
        fetchDueCards,
        rateCard,
        qualityDescriptions,
        loading,
        stats,
        fetchStats,
    } = useSpacedRepetition();

    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [reviewedCount, setReviewedCount] = useState(0);
    const [sessionComplete, setSessionComplete] = useState(false);

    useEffect(() => {
        if (user) {
            fetchDueCards();
            fetchStats();
        }
    }, [user, fetchDueCards, fetchStats]);

    const currentCard = dueCards[currentIndex];
    const totalDue = stats.cardsDueToday;
    const progressPercent = totalDue > 0 ? (reviewedCount / totalDue) * 100 : 0;

    const handleRate = async (quality: number) => {
        if (!currentCard) return;

        const result = await rateCard(currentCard.flashcard_id, quality);

        if (result) {
            const desc = qualityDescriptions.find(q => q.value === quality);
            toast({
                title: desc?.label || 'Đã đánh giá',
                description: `Ôn lại sau ${result.new_interval_days} ngày`,
            });

            setReviewedCount(prev => prev + 1);
            setIsFlipped(false);

            // Move to next card or finish
            if (currentIndex >= dueCards.length - 1) {
                // Check if there are more cards after removal
                setTimeout(() => {
                    if (dueCards.length <= 1) {
                        setSessionComplete(true);
                    } else {
                        setCurrentIndex(0);
                    }
                }, 300);
            }
        }
    };

    const goToNext = () => {
        if (currentIndex < dueCards.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setIsFlipped(false);
        }
    };

    const goToPrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
            setIsFlipped(false);
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <main className="container mx-auto px-4 py-16 text-center">
                    <Brain className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <h1 className="text-2xl font-bold mb-2">Đăng nhập để ôn tập</h1>
                    <Link to="/auth">
                        <Button size="lg" className="mt-4">Đăng nhập</Button>
                    </Link>
                </main>
                <Footer />
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <main className="container mx-auto px-4 py-8">
                    <div className="max-w-2xl mx-auto">
                        <div className="animate-pulse space-y-4">
                            <div className="h-8 bg-muted rounded w-1/3"></div>
                            <div className="h-80 bg-muted rounded"></div>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    if (sessionComplete || dueCards.length === 0) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <main className="container mx-auto px-4 py-16">
                    <div className="max-w-md mx-auto text-center">
                        <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mb-6 animate-bounce">
                            <Sparkles className="w-12 h-12 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
                            Tuyệt vời! 🎉
                        </h1>
                        <p className="text-lg text-muted-foreground mb-2">
                            Bạn đã hoàn thành ôn tập hôm nay
                        </p>
                        {reviewedCount > 0 && (
                            <p className="text-muted-foreground mb-6">
                                Đã ôn tập <span className="font-bold text-primary">{reviewedCount}</span> thẻ
                            </p>
                        )}
                        <div className="flex gap-4 justify-center">
                            <Link to="/flashcards">
                                <Button variant="outline" className="gap-2">
                                    <ArrowLeft className="w-4 h-4" />
                                    Quay lại
                                </Button>
                            </Link>
                            <Link to="/dashboard">
                                <Button className="gap-2">
                                    Dashboard
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto">
                    {/* Header */}
                    <div className="mb-6">
                        <Link to="/flashcards">
                            <Button variant="ghost" className="mb-4 gap-2">
                                <ArrowLeft className="w-4 h-4" />
                                Quay lại
                            </Button>
                        </Link>

                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold flex items-center gap-2">
                                    <Brain className="w-6 h-6 text-primary" />
                                    Ôn tập thông minh
                                </h1>
                                <p className="text-muted-foreground">Spaced Repetition System</p>
                            </div>
                            <Badge variant="secondary" className="gap-1">
                                <Clock className="w-3 h-3" />
                                {dueCards.length} thẻ còn lại
                            </Badge>
                        </div>
                    </div>

                    {/* Progress */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-muted-foreground">
                                Tiến độ: {reviewedCount}/{totalDue} thẻ
                            </span>
                            <span className="font-medium text-primary">
                                {Math.round(progressPercent)}%
                            </span>
                        </div>
                        <Progress value={progressPercent} className="h-2" />
                    </div>

                    {/* Flashcard */}
                    {currentCard && (
                        <>
                            <div
                                className="perspective-1000 mb-6 cursor-pointer"
                                onClick={() => setIsFlipped(!isFlipped)}
                            >
                                <div
                                    className="relative w-full h-80 transition-transform duration-500"
                                    style={{
                                        transformStyle: 'preserve-3d',
                                        transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                                    }}
                                >
                                    {/* Front */}
                                    <Card
                                        className="absolute inset-0 flex items-center justify-center p-8 border-2"
                                        style={{ backfaceVisibility: 'hidden' }}
                                    >
                                        <div className="text-center">
                                            <Badge variant="outline" className="mb-4">Mặt trước</Badge>
                                            <h2 className="text-3xl font-bold text-foreground">
                                                {currentCard.front_text}
                                            </h2>
                                            <p className="text-sm text-muted-foreground mt-4">
                                                Nhấn để xem đáp án
                                            </p>
                                        </div>
                                    </Card>

                                    {/* Back */}
                                    <Card
                                        className="absolute inset-0 flex items-center justify-center p-8 border-2 border-primary/30 bg-primary/5"
                                        style={{
                                            backfaceVisibility: 'hidden',
                                            transform: 'rotateY(180deg)',
                                        }}
                                    >
                                        <div className="text-center">
                                            <Badge variant="outline" className="mb-4">Mặt sau</Badge>
                                            <p className="text-xl text-foreground leading-relaxed">
                                                {currentCard.back_text}
                                            </p>
                                        </div>
                                    </Card>
                                </div>
                            </div>

                            {/* Navigation */}
                            <div className="flex items-center justify-center gap-4 mb-6">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={goToPrev}
                                    disabled={currentIndex === 0}
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </Button>
                                <span className="text-sm text-muted-foreground">
                                    {currentIndex + 1} / {dueCards.length}
                                </span>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={goToNext}
                                    disabled={currentIndex >= dueCards.length - 1}
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </Button>
                            </div>

                            {/* Quality Rating - Show only when flipped */}
                            {isFlipped && (
                                <div className="animate-fade-in">
                                    <p className="text-center text-sm font-medium mb-4">
                                        Bạn nhớ thẻ này như thế nào?
                                    </p>
                                    <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                                        {qualityDescriptions.map((q) => (
                                            <Button
                                                key={q.value}
                                                variant="outline"
                                                className={cn(
                                                    "flex flex-col h-auto py-3 px-2 hover:border-primary",
                                                    q.value < 3 && "hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-950/20",
                                                    q.value >= 3 && q.value < 5 && "hover:border-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-950/20",
                                                    q.value === 5 && "hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-950/20"
                                                )}
                                                onClick={() => handleRate(q.value)}
                                            >
                                                <span className={cn("font-bold text-lg", q.color)}>
                                                    {q.value}
                                                </span>
                                                <span className="text-xs font-medium">{q.label}</span>
                                                <span className="text-[10px] text-muted-foreground hidden md:block">
                                                    {q.description}
                                                </span>
                                            </Button>
                                        ))}
                                    </div>
                                    <p className="text-center text-xs text-muted-foreground mt-4">
                                        0-2: Quên → 3-5: Nhớ (số càng cao = nhớ càng tốt)
                                    </p>
                                </div>
                            )}
                        </>
                    )}

                    {/* Help text */}
                    <Card className="mt-8 bg-muted/30">
                        <CardContent className="p-4 text-sm text-muted-foreground">
                            <p className="font-medium mb-2">💡 Hướng dẫn SM-2:</p>
                            <ul className="list-disc list-inside space-y-1">
                                <li>Đánh giá mức độ nhớ từ 0 (quên hoàn toàn) đến 5 (nhớ tuyệt vời)</li>
                                <li>Thẻ khó nhớ sẽ xuất hiện sớm hơn, thẻ dễ nhớ sẽ xuất hiện sau</li>
                                <li>Ôn tập đều đặn mỗi ngày để hiệu quả tối đa</li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default SpacedRepetitionReview;
