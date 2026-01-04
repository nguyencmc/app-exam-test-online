import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import {
    ChevronLeft,
    ChevronRight,
    Save,
    Loader2,
    Sparkles,
    Clock,
    Wand2,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Question } from '@/pages/admin/ExamCreatorV2';

interface FocusedEditorProps {
    question: Question;
    questionIndex: number;
    totalQuestions: number;
    onUpdateQuestion: (field: keyof Question, value: string) => void;
    onNavigate: (index: number) => void;
    onSave: () => void;
    saving: boolean;
    lastSaved: Date | null;
    isMobile?: boolean;
}

const OPTIONS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'] as const;

export const FocusedEditor = ({
    question,
    questionIndex,
    totalQuestions,
    onUpdateQuestion,
    onNavigate,
    onSave,
    saving,
    lastSaved,
    isMobile = false,
}: FocusedEditorProps) => {
    const { toast } = useToast();

    // Check if multiple answers (comma-separated)
    const correctAnswers = question.correct_answer.split(',').map(a => a.trim()).filter(Boolean);

    // Multi-answer mode state
    const [multiAnswerMode, setMultiAnswerMode] = useState(correctAnswers.length > 1);

    // AI loading states
    const [aiAnswerLoading, setAiAnswerLoading] = useState(false);
    const [aiExplainLoading, setAiExplainLoading] = useState(false);

    // Get visible options (at least 4, or all that have content)
    const getVisibleOptions = () => {
        const minOptions = 4;
        let lastFilledIndex = 3; // At least show A-D

        OPTIONS.forEach((opt, idx) => {
            const key = `option_${opt.toLowerCase()}` as keyof Question;
            if (question[key]) {
                lastFilledIndex = Math.max(lastFilledIndex, idx);
            }
        });

        return OPTIONS.slice(0, Math.max(minOptions, lastFilledIndex + 2));
    };

    const visibleOptions = getVisibleOptions();

    // Handle answer selection
    const handleAnswerToggle = (option: string, checked: boolean) => {
        if (multiAnswerMode) {
            // Multi-answer mode: toggle the option
            const current = new Set(correctAnswers);
            if (checked) {
                current.add(option);
            } else {
                current.delete(option);
            }
            onUpdateQuestion('correct_answer', Array.from(current).sort().join(','));
        } else {
            // Single answer mode: replace
            if (checked) {
                onUpdateQuestion('correct_answer', option);
            }
        }
    };

    // Format time ago
    const formatTimeAgo = (date: Date) => {
        const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
        if (seconds < 60) return `${seconds}s trước`;
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes} phút trước`;
        const hours = Math.floor(minutes / 60);
        return `${hours} giờ trước`;
    };

    // AI Analyze and Select Correct Answer
    const handleAISelectAnswer = async () => {
        if (!question.question_text.trim()) {
            toast({ title: 'Lỗi', description: 'Vui lòng nhập nội dung câu hỏi', variant: 'destructive' });
            return;
        }

        if (!question.option_a.trim() || !question.option_b.trim()) {
            toast({ title: 'Lỗi', description: 'Cần có ít nhất 2 đáp án A và B', variant: 'destructive' });
            return;
        }

        setAiAnswerLoading(true);
        try {
            // Build options list
            let optionsText = `A. ${question.option_a}\nB. ${question.option_b}`;
            if (question.option_c) optionsText += `\nC. ${question.option_c}`;
            if (question.option_d) optionsText += `\nD. ${question.option_d}`;
            if (question.option_e) optionsText += `\nE. ${question.option_e}`;
            if (question.option_f) optionsText += `\nF. ${question.option_f}`;
            if (question.option_g) optionsText += `\nG. ${question.option_g}`;
            if (question.option_h) optionsText += `\nH. ${question.option_h}`;

            const { data, error } = await supabase.functions.invoke('generate-questions', {
                body: {
                    content: `Phân tích câu hỏi trắc nghiệm sau và xác định đáp án đúng:

CÂU HỎI: ${question.question_text}

CÁC ĐÁP ÁN:
${optionsText}

Hãy phân tích và chọn đáp án đúng nhất. Giải thích tại sao đáp án đó là đúng.`,
                    questionCount: 1,
                    difficulty: 'medium',
                },
            });

            if (error) throw error;

            if (data?.questions?.[0]) {
                const result = data.questions[0];
                // Only update correct_answer and explanation, keep existing options
                if (result.correct_answer) {
                    onUpdateQuestion('correct_answer', result.correct_answer.toUpperCase());
                }
                if (result.explanation) {
                    onUpdateQuestion('explanation', result.explanation);
                }

                toast({
                    title: 'Thành công',
                    description: `AI đã chọn đáp án ${result.correct_answer || 'A'}`
                });
            } else {
                throw new Error('Không nhận được phản hồi từ AI');
            }
        } catch (error: any) {
            console.error('AI select error:', error);
            toast({
                title: 'Lỗi AI',
                description: error.message || 'Không thể phân tích đáp án',
                variant: 'destructive'
            });
        } finally {
            setAiAnswerLoading(false);
        }
    };

    // AI Generate Explanation
    const handleAIExplanation = async () => {
        if (!question.question_text.trim() || !question.correct_answer) {
            toast({ title: 'Lỗi', description: 'Cần có câu hỏi và đáp án đúng', variant: 'destructive' });
            return;
        }

        setAiExplainLoading(true);
        try {
            const correctOption = `option_${question.correct_answer.toLowerCase()}` as keyof Question;
            const correctText = question[correctOption] as string;

            const { data, error } = await supabase.functions.invoke('generate-questions', {
                body: {
                    content: `Giải thích tại sao đáp án "${correctText}" là đúng cho câu hỏi: "${question.question_text}"\n\nCác đáp án khác:\nA. ${question.option_a}\nB. ${question.option_b}\nC. ${question.option_c}\nD. ${question.option_d}`,
                    questionCount: 1,
                    difficulty: 'medium',
                },
            });

            if (error) throw error;

            if (data?.questions?.[0]?.explanation) {
                onUpdateQuestion('explanation', data.questions[0].explanation);
                toast({ title: 'Thành công', description: 'Đã tạo giải thích bằng AI' });
            } else {
                throw new Error('Không nhận được giải thích từ AI');
            }
        } catch (error: any) {
            console.error('AI explain error:', error);
            toast({
                title: 'Lỗi AI',
                description: error.message || 'Không thể tạo giải thích',
                variant: 'destructive'
            });
        } finally {
            setAiExplainLoading(false);
        }
    };

    return (
        <div className={isMobile
            ? "flex-1 flex flex-col overflow-hidden"
            : "flex-1 flex flex-col h-[calc(100vh-64px)] overflow-hidden"
        }>
            {/* Top Bar - Hide on mobile since parent has header */}
            {!isMobile && (
                <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-card">
                    <div className="flex items-center gap-4">
                        <h2 className="text-lg font-semibold">
                            Câu hỏi {questionIndex + 1}
                            <span className="text-muted-foreground font-normal"> / {totalQuestions}</span>
                        </h2>
                        <Badge variant="outline" className="text-xs">
                            {question.correct_answer ? (correctAnswers.length > 1 ? 'Nhiều đáp án' : 'Một đáp án') : 'Chưa chọn'}
                        </Badge>
                    </div>

                    {/* Dot Navigation */}
                    <div className="flex items-center gap-1.5">
                        {Array.from({ length: Math.min(totalQuestions, 12) }).map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => onNavigate(idx)}
                                className={`w-2.5 h-2.5 rounded-full transition-all ${idx === questionIndex
                                    ? 'bg-primary scale-125'
                                    : 'bg-muted hover:bg-muted-foreground/50'
                                    }`}
                            />
                        ))}
                        {totalQuestions > 12 && (
                            <span className="text-xs text-muted-foreground ml-1">+{totalQuestions - 12}</span>
                        )}
                    </div>

                    {/* Save Status */}
                    <div className="flex items-center gap-3">
                        {lastSaved && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Đã lưu {formatTimeAgo(lastSaved)}
                            </span>
                        )}
                        <Button onClick={onSave} disabled={saving} size="sm">
                            {saving ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Đang lưu...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    Lưu đề thi
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            )}

            {/* Main Editor */}
            <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-3xl mx-auto space-y-6">
                    {/* Question Text */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label className="text-base font-medium">Nội dung câu hỏi</Label>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-primary"
                                onClick={handleAISelectAnswer}
                                disabled={aiAnswerLoading || !question.question_text.trim() || !question.option_a.trim()}
                            >
                                {aiAnswerLoading ? (
                                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                ) : (
                                    <Wand2 className="w-4 h-4 mr-1" />
                                )}
                                AI Trả lời
                            </Button>
                        </div>
                        <Textarea
                            placeholder="Nhập nội dung câu hỏi..."
                            value={question.question_text}
                            onChange={(e) => onUpdateQuestion('question_text', e.target.value)}
                            className="min-h-[120px] text-base resize-none"
                        />
                    </div>

                    {/* Answer Options */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label className="text-base font-medium">Đáp án</Label>
                            <div className="flex items-center gap-3">
                                <span className="text-xs text-muted-foreground">
                                    Nhiều đáp án đúng
                                </span>
                                <Switch
                                    checked={multiAnswerMode}
                                    onCheckedChange={(checked) => {
                                        setMultiAnswerMode(checked);
                                        // If switching to single mode & have multiple, keep first
                                        if (!checked && correctAnswers.length > 1) {
                                            onUpdateQuestion('correct_answer', correctAnswers[0]);
                                        }
                                    }}
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            {visibleOptions.map((option) => {
                                const key = `option_${option.toLowerCase()}` as keyof Question;
                                const value = question[key] as string;
                                const isCorrect = correctAnswers.includes(option);

                                return (
                                    <div
                                        key={option}
                                        className={`flex items-start gap-3 p-4 rounded-xl border-2 transition-all ${isCorrect
                                            ? 'border-green-500 bg-green-500/5'
                                            : 'border-border hover:border-primary/30'
                                            }`}
                                    >
                                        {/* Selection Control - Always checkbox */}
                                        <div className="pt-0.5">
                                            <Checkbox
                                                checked={isCorrect}
                                                onCheckedChange={(checked) => handleAnswerToggle(option, checked as boolean)}
                                                className="w-5 h-5"
                                            />
                                        </div>

                                        {/* Option Label */}
                                        <div
                                            className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-semibold ${isCorrect
                                                ? 'bg-green-500 text-white'
                                                : 'bg-muted text-muted-foreground'
                                                }`}
                                        >
                                            {option}
                                        </div>

                                        {/* Option Input */}
                                        <Input
                                            placeholder={`Nhập đáp án ${option}...`}
                                            value={value}
                                            onChange={(e) => onUpdateQuestion(key, e.target.value)}
                                            className="flex-1 border-0 bg-transparent focus-visible:ring-0 px-0 text-base"
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Explanation */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label className="text-base font-medium">Giải thích (tùy chọn)</Label>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-primary"
                                onClick={handleAIExplanation}
                                disabled={aiExplainLoading || !question.correct_answer}
                            >
                                {aiExplainLoading ? (
                                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                ) : (
                                    <Sparkles className="w-4 h-4 mr-1" />
                                )}
                                AI Giải thích
                            </Button>
                        </div>
                        <Textarea
                            placeholder="Nhập giải thích cho đáp án đúng..."
                            value={question.explanation}
                            onChange={(e) => onUpdateQuestion('explanation', e.target.value)}
                            className="min-h-[100px] text-base resize-none"
                        />
                    </div>
                </div>
            </div>

            {/* Bottom Navigation */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-card">
                <Button
                    variant="outline"
                    onClick={() => onNavigate(Math.max(0, questionIndex - 1))}
                    disabled={questionIndex === 0}
                >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Câu trước
                </Button>

                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                        Dùng phím
                        <kbd className="mx-1 px-1.5 py-0.5 bg-muted rounded text-xs">←</kbd>
                        <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">→</kbd>
                        để chuyển câu
                    </span>
                </div>

                <Button
                    variant="outline"
                    onClick={() => onNavigate(Math.min(totalQuestions - 1, questionIndex + 1))}
                    disabled={questionIndex === totalQuestions - 1}
                >
                    Câu sau
                    <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
            </div>
        </div>
    );
};
