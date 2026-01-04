import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Target, Plus, Trophy, CheckCircle2, Flame, FileText, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Goal {
    id: string;
    goal_type: string;
    target_value: number;
    current_value: number;
    period_start: string;
    period_end: string | null;
    is_completed: boolean;
}

const goalTypeConfig: Record<string, { label: string; icon: React.ElementType; unit: string; color: string }> = {
    daily_exams: { label: 'Đề thi/ngày', icon: FileText, unit: 'đề', color: 'text-purple-500' },
    daily_questions: { label: 'Câu hỏi/ngày', icon: Target, unit: 'câu', color: 'text-blue-500' },
    daily_flashcards: { label: 'Flashcard/ngày', icon: Layers, unit: 'thẻ', color: 'text-orange-500' },
    streak_days: { label: 'Streak mục tiêu', icon: Flame, unit: 'ngày', color: 'text-red-500' },
};

export const GoalsSetting = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [goals, setGoals] = useState<Goal[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [newGoalType, setNewGoalType] = useState('daily_exams');
    const [newGoalTarget, setNewGoalTarget] = useState('3');

    useEffect(() => {
        if (user) {
            fetchGoals();
        }
    }, [user]);

    const fetchGoals = async () => {
        setLoading(true);
        const today = new Date().toISOString().split('T')[0];

        const { data } = await supabase
            .from('user_goals')
            .select('*')
            .eq('user_id', user?.id)
            .or(`period_end.is.null,period_end.gte.${today}`)
            .order('created_at', { ascending: false });

        if (data) {
            setGoals(data);
        }
        setLoading(false);
    };

    const createGoal = async () => {
        if (!user) return;

        const today = new Date();
        const periodEnd = new Date(today);

        // Set period based on goal type
        if (newGoalType.startsWith('daily')) {
            periodEnd.setDate(periodEnd.getDate() + 1);
        } else if (newGoalType === 'streak_days') {
            periodEnd.setDate(periodEnd.getDate() + parseInt(newGoalTarget));
        }

        const { error } = await supabase.from('user_goals').insert({
            user_id: user.id,
            goal_type: newGoalType,
            target_value: parseInt(newGoalTarget),
            current_value: 0,
            period_start: today.toISOString().split('T')[0],
            period_end: periodEnd.toISOString().split('T')[0],
        });

        if (error) {
            toast({
                title: 'Lỗi',
                description: 'Không thể tạo mục tiêu',
                variant: 'destructive',
            });
        } else {
            toast({
                title: 'Thành công! 🎯',
                description: 'Mục tiêu mới đã được tạo',
            });
            fetchGoals();
            setDialogOpen(false);
        }
    };

    const deleteGoal = async (goalId: string) => {
        const { error } = await supabase
            .from('user_goals')
            .delete()
            .eq('id', goalId);

        if (!error) {
            setGoals(goals.filter(g => g.id !== goalId));
            toast({
                title: 'Đã xóa mục tiêu',
            });
        }
    };

    if (loading) {
        return (
            <Card className="border-border/50">
                <CardContent className="p-6">
                    <div className="animate-pulse space-y-4">
                        <div className="h-4 bg-muted rounded w-1/3"></div>
                        <div className="h-8 bg-muted rounded"></div>
                        <div className="h-8 bg-muted rounded"></div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-border/50">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Target className="w-5 h-5 text-primary" />
                            Mục tiêu học tập
                        </CardTitle>
                        <CardDescription>Đặt và theo dõi mục tiêu hàng ngày</CardDescription>
                    </div>
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm" className="gap-1">
                                <Plus className="w-4 h-4" />
                                Thêm
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Tạo mục tiêu mới</DialogTitle>
                                <DialogDescription>
                                    Đặt mục tiêu học tập để theo dõi tiến độ mỗi ngày
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>Loại mục tiêu</Label>
                                    <Select value={newGoalType} onValueChange={setNewGoalType}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(goalTypeConfig).map(([key, config]) => (
                                                <SelectItem key={key} value={key}>
                                                    <div className="flex items-center gap-2">
                                                        <config.icon className={cn("w-4 h-4", config.color)} />
                                                        {config.label}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Số lượng mục tiêu</Label>
                                    <Input
                                        type="number"
                                        min="1"
                                        value={newGoalTarget}
                                        onChange={(e) => setNewGoalTarget(e.target.value)}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        {goalTypeConfig[newGoalType]?.unit} / {newGoalType.startsWith('daily') ? 'ngày' : 'tổng'}
                                    </p>
                                </div>
                            </div>

                            <DialogFooter>
                                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                                    Hủy
                                </Button>
                                <Button onClick={createGoal}>
                                    Tạo mục tiêu
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent>
                {goals.length === 0 ? (
                    <div className="text-center py-8">
                        <Trophy className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                        <p className="text-muted-foreground mb-3">Chưa có mục tiêu nào</p>
                        <Button variant="outline" size="sm" onClick={() => setDialogOpen(true)}>
                            <Plus className="w-4 h-4 mr-1" />
                            Tạo mục tiêu đầu tiên
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {goals.map((goal) => {
                            const config = goalTypeConfig[goal.goal_type];
                            const progress = Math.min((goal.current_value / goal.target_value) * 100, 100);
                            const Icon = config?.icon || Target;

                            return (
                                <div
                                    key={goal.id}
                                    className={cn(
                                        "p-4 rounded-lg border transition-colors",
                                        goal.is_completed
                                            ? "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800"
                                            : "bg-muted/30 border-border/50"
                                    )}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <Icon className={cn("w-5 h-5", config?.color)} />
                                            <span className="font-medium">{config?.label}</span>
                                            {goal.is_completed && (
                                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold">
                                                {goal.current_value}/{goal.target_value}
                                            </span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                                                onClick={() => deleteGoal(goal.id)}
                                            >
                                                ×
                                            </Button>
                                        </div>
                                    </div>
                                    <Progress
                                        value={progress}
                                        className={cn(
                                            "h-2",
                                            goal.is_completed && "[&>div]:bg-green-500"
                                        )}
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {goal.is_completed ? '✨ Hoàn thành!' : `${Math.round(progress)}% hoàn thành`}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
