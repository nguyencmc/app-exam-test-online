import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSpacedRepetition } from '@/hooks/useSpacedRepetition';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Layers, ChevronRight, Clock, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReviewReminderProps {
    className?: string;
    compact?: boolean;
}

export const ReviewReminder = ({ className, compact = false }: ReviewReminderProps) => {
    const { stats, fetchStats, loading } = useSpacedRepetition();

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    if (loading) {
        return (
            <Card className={cn("border-border/50", className)}>
                <CardContent className="p-4">
                    <div className="animate-pulse flex items-center gap-4">
                        <div className="w-12 h-12 bg-muted rounded-xl"></div>
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-muted rounded w-1/2"></div>
                            <div className="h-3 bg-muted rounded w-1/3"></div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Don't show if no cards are due
    if (stats.cardsDueToday === 0 && compact) {
        return null;
    }

    if (compact) {
        return (
            <Link to="/flashcards?mode=review" className={className}>
                <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-800 hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                                <Bell className="w-5 h-5 text-orange-500" />
                            </div>
                            <div>
                                <p className="font-medium text-sm">
                                    {stats.cardsDueToday} thẻ cần ôn tập
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Nhấn để bắt đầu
                                </p>
                            </div>
                        </div>
                        <Badge variant="secondary" className="bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300">
                            <Clock className="w-3 h-3 mr-1" />
                            Hôm nay
                        </Badge>
                    </CardContent>
                </Card>
            </Link>
        );
    }

    return (
        <Card className={cn("border-border/50 overflow-hidden", className)}>
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-4 text-white">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                        <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">Ôn tập thông minh</h3>
                        <p className="text-sm text-white/80">Spaced Repetition System (SM-2)</p>
                    </div>
                </div>
            </div>

            <CardContent className="p-4 space-y-4">
                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-2xl font-bold text-orange-500">{stats.cardsDueToday}</p>
                        <p className="text-xs text-muted-foreground">Cần ôn hôm nay</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-2xl font-bold text-green-500">{stats.cardsLearned}</p>
                        <p className="text-xs text-muted-foreground">Đã thuộc</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-2xl font-bold text-blue-500">{stats.totalCards}</p>
                        <p className="text-xs text-muted-foreground">Tổng thẻ</p>
                    </div>
                </div>

                {/* CTA Button */}
                {stats.cardsDueToday > 0 ? (
                    <Link to="/flashcards?mode=review" className="block">
                        <Button className="w-full gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600">
                            <Layers className="w-4 h-4" />
                            Ôn tập {stats.cardsDueToday} thẻ ngay
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </Link>
                ) : (
                    <div className="text-center py-4">
                        <div className="w-16 h-16 mx-auto rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mb-3">
                            <Sparkles className="w-8 h-8 text-green-500" />
                        </div>
                        <p className="font-medium text-green-600 dark:text-green-400">
                            Tuyệt vời! Bạn đã ôn tập xong hôm nay
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                            Quay lại sau để ôn tập thêm
                        </p>
                    </div>
                )}

                {/* Info */}
                <div className="text-xs text-muted-foreground text-center border-t pt-3">
                    <p>
                        Độ khó trung bình: <span className="font-medium">{stats.averageEF.toFixed(2)}</span> EF
                    </p>
                </div>
            </CardContent>
        </Card>
    );
};
