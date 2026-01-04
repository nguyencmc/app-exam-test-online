import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Flame, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DailyActivity {
    activity_date: string;
    exams_completed: number;
    questions_answered: number;
    flashcards_reviewed: number;
    time_spent_minutes: number;
}

interface StreakCalendarProps {
    weeks?: number;
}

export const StreakCalendar = ({ weeks = 12 }: StreakCalendarProps) => {
    const { user } = useAuth();
    const [activities, setActivities] = useState<Record<string, DailyActivity>>({});
    const [currentStreak, setCurrentStreak] = useState(0);
    const [longestStreak, setLongestStreak] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user]);

    const fetchData = async () => {
        setLoading(true);

        // Fetch profile for streak info
        const { data: profile } = await supabase
            .from('profiles')
            .select('current_streak, longest_streak')
            .eq('user_id', user?.id)
            .single();

        if (profile) {
            setCurrentStreak(profile.current_streak || 0);
            setLongestStreak(profile.longest_streak || 0);
        }

        // Fetch daily activities for the calendar
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - (weeks * 7));

        const { data: activityData } = await supabase
            .from('user_daily_activity')
            .select('*')
            .eq('user_id', user?.id)
            .gte('activity_date', startDate.toISOString().split('T')[0]);

        if (activityData) {
            const activityMap: Record<string, DailyActivity> = {};
            activityData.forEach(a => {
                activityMap[a.activity_date] = a;
            });
            setActivities(activityMap);
        }

        setLoading(false);
    };

    // Generate calendar grid
    const generateCalendarDays = () => {
        const days: Date[] = [];
        const today = new Date();
        const totalDays = weeks * 7;

        for (let i = totalDays - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            days.push(date);
        }

        return days;
    };

    const getActivityLevel = (date: Date): number => {
        const dateStr = date.toISOString().split('T')[0];
        const activity = activities[dateStr];

        if (!activity) return 0;

        const total = (activity.exams_completed || 0) +
            (activity.flashcards_reviewed || 0) +
            Math.floor((activity.questions_answered || 0) / 10);

        if (total === 0) return 0;
        if (total <= 2) return 1;
        if (total <= 5) return 2;
        if (total <= 10) return 3;
        return 4;
    };

    const getActivityColor = (level: number) => {
        switch (level) {
            case 0: return 'bg-muted hover:bg-muted/80';
            case 1: return 'bg-green-200 dark:bg-green-900 hover:bg-green-300 dark:hover:bg-green-800';
            case 2: return 'bg-green-400 dark:bg-green-700 hover:bg-green-500 dark:hover:bg-green-600';
            case 3: return 'bg-green-500 dark:bg-green-600 hover:bg-green-600 dark:hover:bg-green-500';
            case 4: return 'bg-green-600 dark:bg-green-500 hover:bg-green-700 dark:hover:bg-green-400';
            default: return 'bg-muted';
        }
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('vi-VN', {
            weekday: 'short',
            day: 'numeric',
            month: 'short'
        });
    };

    const days = generateCalendarDays();
    const weekDays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

    // Group days into weeks
    const weeksArray: Date[][] = [];
    for (let i = 0; i < days.length; i += 7) {
        weeksArray.push(days.slice(i, i + 7));
    }

    if (loading) {
        return (
            <Card className="border-border/50">
                <CardContent className="p-6">
                    <div className="animate-pulse">
                        <div className="h-4 bg-muted rounded w-1/3 mb-4"></div>
                        <div className="grid grid-cols-12 gap-1">
                            {[...Array(84)].map((_, i) => (
                                <div key={i} className="w-3 h-3 bg-muted rounded-sm"></div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-border/50">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Calendar className="w-5 h-5 text-primary" />
                        Lịch hoạt động
                    </CardTitle>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Flame className="w-4 h-4 text-orange-500" />
                            <span className="text-sm font-medium">{currentStreak} ngày streak</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                            Kỷ lục: {longestStreak} ngày
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex gap-1">
                    {/* Week day labels */}
                    <div className="flex flex-col gap-1 pr-2">
                        {weekDays.map((day, i) => (
                            <div key={day} className="h-3 text-[10px] text-muted-foreground flex items-center">
                                {i % 2 === 1 ? day : ''}
                            </div>
                        ))}
                    </div>

                    {/* Calendar grid */}
                    <div className="flex gap-1 overflow-x-auto">
                        {weeksArray.map((week, weekIndex) => (
                            <div key={weekIndex} className="flex flex-col gap-1">
                                {week.map((date, dayIndex) => {
                                    const level = getActivityLevel(date);
                                    const dateStr = date.toISOString().split('T')[0];
                                    const activity = activities[dateStr];
                                    const isToday = date.toDateString() === new Date().toDateString();

                                    return (
                                        <Tooltip key={dayIndex}>
                                            <TooltipTrigger>
                                                <div
                                                    className={cn(
                                                        "w-3 h-3 rounded-sm cursor-pointer transition-colors",
                                                        getActivityColor(level),
                                                        isToday && "ring-1 ring-primary ring-offset-1"
                                                    )}
                                                />
                                            </TooltipTrigger>
                                            <TooltipContent side="top" className="text-xs">
                                                <p className="font-medium">{formatDate(date)}</p>
                                                {activity ? (
                                                    <div className="text-muted-foreground">
                                                        <p>{activity.exams_completed || 0} đề thi</p>
                                                        <p>{activity.questions_answered || 0} câu hỏi</p>
                                                        <p>{activity.flashcards_reviewed || 0} flashcards</p>
                                                    </div>
                                                ) : (
                                                    <p className="text-muted-foreground">Không có hoạt động</p>
                                                )}
                                            </TooltipContent>
                                        </Tooltip>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Legend */}
                <div className="flex items-center justify-end gap-2 mt-4 text-xs text-muted-foreground">
                    <span>Ít</span>
                    {[0, 1, 2, 3, 4].map(level => (
                        <div
                            key={level}
                            className={cn("w-3 h-3 rounded-sm", getActivityColor(level))}
                        />
                    ))}
                    <span>Nhiều</span>
                </div>
            </CardContent>
        </Card>
    );
};
