import { Button } from '@/components/ui/button';
import { List, Lock, Flag } from 'lucide-react';

interface QuestionNavigatorProps {
    questions: Array<{ id: string }>;
    currentQuestionIndex: number;
    answers: Record<string, string[]>;
    flaggedQuestions: Set<string>;
    isQuestionLocked: (index: number) => boolean;
    onQuestionSelect: (index: number) => void;
    onSubmit: () => void;
    answeredCount: number;
    showLegend?: boolean;
    user: any;
}

export const QuestionNavigator = ({
    questions,
    currentQuestionIndex,
    answers,
    flaggedQuestions,
    isQuestionLocked,
    onQuestionSelect,
    onSubmit,
    answeredCount,
    showLegend = true,
    user,
}: QuestionNavigatorProps) => {
    return (
        <div className="bg-card border border-border rounded-xl p-4 sticky top-32">
            <div className="flex items-center gap-2 mb-4">
                <List className="w-4 h-4" />
                <h3 className="font-semibold text-foreground">Danh sách câu hỏi</h3>
            </div>

            {/* Legend */}
            {showLegend && (
                <div className="flex flex-wrap gap-2 mb-3 text-xs">
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded bg-green-500/20 border border-green-500/30" />
                        <span className="text-muted-foreground">Đã làm</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded bg-orange-500/20 border border-orange-500/30" />
                        <span className="text-muted-foreground">Đánh dấu</span>
                    </div>
                    {!user && (
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded bg-gray-500/20 border border-gray-500/30 flex items-center justify-center">
                                <Lock className="w-2 h-2 text-gray-500" />
                            </div>
                            <span className="text-muted-foreground">Khóa</span>
                        </div>
                    )}
                </div>
            )}

            <div className="grid grid-cols-5 gap-2">
                {questions.map((q, index) => {
                    const isAnswered = answers[q.id]?.length > 0;
                    const isCurrent = index === currentQuestionIndex;
                    const isFlagged = flaggedQuestions.has(q.id);
                    const isLocked = isQuestionLocked(index);

                    return (
                        <button
                            key={q.id}
                            onClick={() => !isLocked && onQuestionSelect(index)}
                            disabled={isLocked}
                            className={`relative w-full aspect-square rounded-lg text-sm font-medium transition-all ${isLocked
                                ? 'bg-gray-500/10 text-gray-400 border border-gray-500/20 cursor-not-allowed'
                                : isCurrent
                                    ? 'bg-primary text-primary-foreground'
                                    : isFlagged
                                        ? 'bg-orange-500/20 text-orange-500 border border-orange-500/30'
                                        : isAnswered
                                            ? 'bg-green-500/20 text-green-500 border border-green-500/30'
                                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                }`}
                        >
                            {isLocked ? (
                                <Lock className="w-3 h-3 mx-auto" />
                            ) : (
                                index + 1
                            )}
                            {!isLocked && isFlagged && (
                                <Flag className="absolute top-0.5 right-0.5 w-2 h-2 text-orange-500" />
                            )}
                        </button>
                    );
                })}
            </div>

            <Button
                onClick={onSubmit}
                className="w-full mt-4"
            >
                Nộp bài ({answeredCount}/{questions.length})
            </Button>
        </div>
    );
};
