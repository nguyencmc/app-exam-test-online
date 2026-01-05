import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Flag } from 'lucide-react';

interface Question {
    id: string;
    question_text: string;
    option_a: string;
    option_b: string;
    option_c: string | null;
    option_d: string | null;
    option_e: string | null;
    option_f: string | null;
    option_g: string | null;
    option_h: string | null;
    correct_answer: string;
}

interface QuestionCardProps {
    question: Question;
    questionIndex: number;
    answers: Record<string, string[]>;
    isSubmitted: boolean;
    isFlagged: boolean;
    onAnswerSelect: (questionId: string, answer: string) => void;
    onToggleFlag: (questionId: string) => void;
    onPrevious: () => void;
    onNext: () => void;
    canGoPrevious: boolean;
    canGoNext: boolean;
}

export const QuestionCard = ({
    question,
    questionIndex,
    answers,
    isSubmitted,
    isFlagged,
    onAnswerSelect,
    onToggleFlag,
    onPrevious,
    onNext,
    canGoPrevious,
    canGoNext,
}: QuestionCardProps) => {
    const userAnswers = answers[question.id] || [];
    const correctAnswers = question.correct_answer?.split(',').map(a => a.trim()) || [];
    const isMultiAnswer = correctAnswers.length > 1;

    const getOptionClass = (option: string) => {
        const isSelected = userAnswers.includes(option);

        if (!isSubmitted) {
            return isSelected
                ? 'border-primary bg-primary/10 ring-2 ring-primary'
                : 'border-border hover:border-primary/50 hover:bg-muted/50';
        }

        const isCorrectOption = correctAnswers.includes(option);
        const userSelected = userAnswers.includes(option);

        if (isCorrectOption) {
            return 'border-green-500 bg-green-500/10 ring-2 ring-green-500';
        }
        if (userSelected && !isCorrectOption) {
            return 'border-red-500 bg-red-500/10 ring-2 ring-red-500';
        }
        return 'border-border opacity-50';
    };

    return (
        <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-xl font-semibold text-foreground mb-6">
                Câu {questionIndex + 1}: {question.question_text}
            </h2>

            {isMultiAnswer && !isSubmitted && (
                <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <p className="text-sm text-blue-500 font-medium">
                        💡 Câu hỏi này có nhiều đáp án đúng. Chọn tất cả các đáp án bạn cho là đúng.
                    </p>
                </div>
            )}

            <div className="space-y-3">
                {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map((option) => {
                    const optionKey = `option_${option.toLowerCase()}` as keyof Question;
                    const optionText = question[optionKey];
                    if (!optionText) return null;

                    const isSelected = userAnswers.includes(option);

                    return (
                        <button
                            key={option}
                            onClick={() => !isSubmitted && onAnswerSelect(question.id, option)}
                            disabled={isSubmitted}
                            className={`w-full text-left p-4 rounded-xl border transition-all ${getOptionClass(option)}`}
                        >
                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full mr-3 ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'
                                }`}>
                                {option}
                            </span>
                            {optionText as string}
                        </button>
                    );
                })}
            </div>

            {/* Navigation */}
            {!isSubmitted && (
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
                    <Button
                        variant="outline"
                        onClick={onPrevious}
                        disabled={!canGoPrevious}
                        className="md:px-4"
                        size="icon"
                    >
                        <ChevronLeft className="w-4 h-4 md:mr-2" />
                        <span className="hidden md:inline">Câu trước</span>
                    </Button>

                    <Button
                        variant={isFlagged ? "default" : "outline"}
                        onClick={() => onToggleFlag(question.id)}
                        className={`md:px-4 ${isFlagged ? "bg-orange-500 hover:bg-orange-600" : ""}`}
                        size="icon"
                    >
                        <Flag className="w-4 h-4 md:mr-2" />
                        <span className="hidden md:inline">{isFlagged ? "Bỏ đánh dấu" : "Đánh dấu"}</span>
                    </Button>

                    <Button
                        variant="outline"
                        onClick={onNext}
                        disabled={!canGoNext}
                        className="md:px-4"
                        size="icon"
                    >
                        <span className="hidden md:inline">Câu sau</span>
                        <ChevronRight className="w-4 h-4 md:ml-2" />
                    </Button>
                </div>
            )}
        </div>
    );
};
