import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, TrendingUp } from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
} from 'recharts';
import { cn } from '@/lib/utils';

interface ChartData {
    date: string;
    label: string;
    attempts: number;
    correct: number;
    accuracy: number;
    timeSpent: number;
}

type ViewType = 'week' | 'month';
type MetricType = 'attempts' | 'accuracy' | 'time';

const metricConfig = {
    attempts: { label: 'Số lượt làm bài', color: '#8b5cf6', dataKey: 'attempts' },
    accuracy: { label: 'Độ chính xác (%)', color: '#22c55e', dataKey: 'accuracy' },
    time: { label: 'Thời gian (phút)', color: '#f59e0b', dataKey: 'timeSpent' },
};

export const ProgressChart = () => {
    const { user } = useAuth();
    const [data, setData] = useState<ChartData[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<ViewType>('week');
    const [metric, setMetric] = useState<MetricType>('attempts');

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user, view]);

    const fetchData = async () => {
        setLoading(true);

        const today = new Date();
        const startDate = new Date();

        if (view === 'week') {
            startDate.setDate(today.getDate() - 7);
        } else {
            startDate.setDate(today.getDate() - 30);
        }

        const { data: activityData } = await supabase
            .from('user_daily_activity')
            .select('*')
            .eq('user_id', user?.id)
            .gte('activity_date', startDate.toISOString().split('T')[0])
            .order('activity_date', { ascending: true });

        // Generate full date range with zeros for missing days
        const dateRange: ChartData[] = [];
        const dayCount = view === 'week' ? 7 : 30;

        for (let i = dayCount; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            const activity = activityData?.find(a => a.activity_date === dateStr);
            const attempts = activity?.exams_completed || 0;
            const correct = activity?.correct_answers || 0;
            const questions = activity?.questions_answered || 0;

            dateRange.push({
                date: dateStr,
                label: date.toLocaleDateString('vi-VN', {
                    day: 'numeric',
                    month: view === 'month' ? 'numeric' : 'short'
                }),
                attempts,
                correct,
                accuracy: questions > 0 ? Math.round((correct / questions) * 100) : 0,
                timeSpent: activity?.time_spent_minutes || 0,
            });
        }

        setData(dateRange);
        setLoading(false);
    };

    const currentMetric = metricConfig[metric];

    // Calculate summary stats
    const totalAttempts = data.reduce((sum, d) => sum + d.attempts, 0);
    const avgAccuracy = data.filter(d => d.accuracy > 0).length > 0
        ? Math.round(data.filter(d => d.accuracy > 0).reduce((sum, d) => sum + d.accuracy, 0) / data.filter(d => d.accuracy > 0).length)
        : 0;
    const totalTime = data.reduce((sum, d) => sum + d.timeSpent, 0);

    if (loading) {
        return (
            <Card className="border-border/50">
                <CardContent className="p-6">
                    <div className="animate-pulse">
                        <div className="h-4 bg-muted rounded w-1/3 mb-4"></div>
                        <div className="h-64 bg-muted rounded"></div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-border/50">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <BarChart3 className="w-5 h-5 text-primary" />
                            Biểu đồ tiến độ
                        </CardTitle>
                        <CardDescription>
                            {view === 'week' ? '7 ngày qua' : '30 ngày qua'}
                        </CardDescription>
                    </div>

                    <div className="flex gap-2">
                        {/* View Toggle */}
                        <div className="flex rounded-lg border overflow-hidden">
                            <Button
                                variant="ghost"
                                size="sm"
                                className={cn(
                                    "rounded-none px-3",
                                    view === 'week' && "bg-primary text-primary-foreground"
                                )}
                                onClick={() => setView('week')}
                            >
                                Tuần
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className={cn(
                                    "rounded-none px-3",
                                    view === 'month' && "bg-primary text-primary-foreground"
                                )}
                                onClick={() => setView('month')}
                            >
                                Tháng
                            </Button>
                        </div>

                        {/* Metric Toggle */}
                        <div className="flex rounded-lg border overflow-hidden">
                            {Object.entries(metricConfig).map(([key, config]) => (
                                <Button
                                    key={key}
                                    variant="ghost"
                                    size="sm"
                                    className={cn(
                                        "rounded-none px-3 text-xs",
                                        metric === key && "bg-muted"
                                    )}
                                    onClick={() => setMetric(key as MetricType)}
                                >
                                    {config.label.split(' ')[0]}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {/* Summary Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20">
                        <p className="text-2xl font-bold text-purple-600">{totalAttempts}</p>
                        <p className="text-xs text-muted-foreground">Lượt làm bài</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-950/20">
                        <p className="text-2xl font-bold text-green-600">{avgAccuracy}%</p>
                        <p className="text-xs text-muted-foreground">Độ chính xác TB</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20">
                        <p className="text-2xl font-bold text-orange-600">{totalTime}</p>
                        <p className="text-xs text-muted-foreground">Phút học tập</p>
                    </div>
                </div>

                {/* Chart */}
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id={`gradient-${metric}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={currentMetric.color} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={currentMetric.color} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis
                                dataKey="label"
                                tick={{ fontSize: 11 }}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                tick={{ fontSize: 11 }}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'hsl(var(--card))',
                                    border: '1px solid hsl(var(--border))',
                                    borderRadius: '8px',
                                }}
                                labelStyle={{ fontWeight: 'bold' }}
                            />
                            <Area
                                type="monotone"
                                dataKey={currentMetric.dataKey}
                                stroke={currentMetric.color}
                                strokeWidth={2}
                                fill={`url(#gradient-${metric})`}
                                dot={{ fill: currentMetric.color, strokeWidth: 0, r: 3 }}
                                activeDot={{ r: 5, strokeWidth: 0 }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Trend indicator */}
                {data.length > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
                        <TrendingUp className="w-4 h-4" />
                        <span>
                            So với {view === 'week' ? 'tuần' : 'tháng'} trước
                        </span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
