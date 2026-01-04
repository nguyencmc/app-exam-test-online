import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    Sparkles,
    ChevronDown,
    ChevronRight,
    Plus,
    Minus,
    GripVertical,
    FileText,
    CheckCircle2,
    AlertCircle,
    Circle,
    Loader2,
    Send,
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { ImportExportQuestions } from '@/components/admin/ImportExportQuestions';
import type { Question, ExamData } from '@/pages/admin/ExamCreatorV2';

interface AISidebarProps {
    examData: ExamData;
    questions: Question[];
    currentIndex: number;
    categories: { id: string; name: string }[];
    onExamDataChange: (data: ExamData) => void;
    onSelectQuestion: (index: number) => void;
    onAddQuestion: () => void;
    onRemoveQuestion: (index: number) => void;
    onReorderQuestions: (from: number, to: number) => void;
    onAIGenerate: (questions: Question[]) => void;
    onImportQuestions: (questions: Question[]) => void;
    validateQuestion: (question: Question) => string[];
}

export const AISidebar = ({
    examData,
    questions,
    currentIndex,
    categories,
    onExamDataChange,
    onSelectQuestion,
    onAddQuestion,
    onRemoveQuestion,
    onAIGenerate,
    onImportQuestions,
    validateQuestion,
}: AISidebarProps) => {
    const [aiPrompt, setAiPrompt] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const [examInfoOpen, setExamInfoOpen] = useState(true);
    const [questionsOpen, setQuestionsOpen] = useState(true);

    // Calculate progress
    const completedCount = questions.filter(q => validateQuestion(q).length === 0).length;
    const progress = (completedCount / questions.length) * 100;

    // Generate slug from title
    const generateSlug = (text: string) => {
        return text
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    };

    // Handle AI generation (mock for now)
    const handleAIGenerate = async () => {
        if (!aiPrompt.trim()) return;

        setAiLoading(true);
        try {
            // TODO: Connect to actual AI API
            // For now, create placeholder questions
            await new Promise(resolve => setTimeout(resolve, 1500));

            const mockQuestions: Question[] = [
                {
                    question_text: `[AI Generated] ${aiPrompt}`,
                    option_a: 'Đáp án A',
                    option_b: 'Đáp án B',
                    option_c: 'Đáp án C',
                    option_d: 'Đáp án D',
                    option_e: '',
                    option_f: '',
                    option_g: '',
                    option_h: '',
                    correct_answer: 'A',
                    explanation: 'Giải thích từ AI...',
                    question_order: questions.length + 1,
                },
            ];

            onAIGenerate(mockQuestions);
            setAiPrompt('');
        } finally {
            setAiLoading(false);
        }
    };

    const getQuestionStatus = (question: Question) => {
        const errors = validateQuestion(question);
        if (errors.length === 0) return 'complete';
        if (question.question_text.trim()) return 'partial';
        return 'empty';
    };

    return (
        <div className="w-80 min-w-[320px] border-r border-border bg-card flex flex-col h-[calc(100vh-64px)] overflow-hidden">
            {/* AI Assistant */}
            <div className="p-4 border-b border-border">
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-sm">AI Assistant</h3>
                        <p className="text-xs text-muted-foreground">Tạo câu hỏi tự động</p>
                    </div>
                </div>

                <div className="relative">
                    <Textarea
                        placeholder="Mô tả đề thi bạn muốn tạo... VD: 'Đề IELTS Reading về Environment, 10 câu'"
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        className="min-h-[80px] text-sm pr-10 resize-none"
                    />
                    <Button
                        size="icon"
                        className="absolute bottom-2 right-2 h-7 w-7"
                        onClick={handleAIGenerate}
                        disabled={aiLoading || !aiPrompt.trim()}
                    >
                        {aiLoading ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                            <Send className="w-3.5 h-3.5" />
                        )}
                    </Button>
                </div>
            </div>

            {/* Scrollable Content */}
            <ScrollArea className="flex-1">
                <div className="p-4 space-y-4">
                    {/* Exam Info Section */}
                    <Collapsible open={examInfoOpen} onOpenChange={setExamInfoOpen}>
                        <CollapsibleTrigger className="flex items-center gap-2 w-full text-left">
                            {examInfoOpen ? (
                                <ChevronDown className="w-4 h-4 text-muted-foreground" />
                            ) : (
                                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            )}
                            <FileText className="w-4 h-4 text-primary" />
                            <span className="font-medium text-sm">Thông tin đề thi</span>
                        </CollapsibleTrigger>

                        <CollapsibleContent className="pt-3 space-y-3">
                            <div>
                                <Label className="text-xs">Tiêu đề</Label>
                                <Input
                                    placeholder="VD: Đề thi IELTS Reading Test 1"
                                    value={examData.title}
                                    onChange={(e) => {
                                        const title = e.target.value;
                                        onExamDataChange({
                                            ...examData,
                                            title,
                                            slug: generateSlug(title),
                                        });
                                    }}
                                    className="h-8 text-sm"
                                />
                            </div>

                            <div>
                                <Label className="text-xs">Slug (URL)</Label>
                                <Input
                                    placeholder="ielts-reading-test-1"
                                    value={examData.slug}
                                    onChange={(e) => onExamDataChange({ ...examData, slug: e.target.value })}
                                    className="h-8 text-sm"
                                />
                            </div>

                            <div>
                                <Label className="text-xs">Danh mục</Label>
                                <Select
                                    value={examData.categoryId}
                                    onValueChange={(value) => onExamDataChange({ ...examData, categoryId: value })}
                                >
                                    <SelectTrigger className="h-8 text-sm">
                                        <SelectValue placeholder="Chọn danh mục" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((cat) => (
                                            <SelectItem key={cat.id} value={cat.id}>
                                                {cat.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <Label className="text-xs">Độ khó</Label>
                                    <Select
                                        value={examData.difficulty}
                                        onValueChange={(value) => onExamDataChange({ ...examData, difficulty: value })}
                                    >
                                        <SelectTrigger className="h-8 text-sm">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="easy">Dễ</SelectItem>
                                            <SelectItem value="medium">Trung bình</SelectItem>
                                            <SelectItem value="hard">Khó</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex-1">
                                    <Label className="text-xs">Thời gian (phút)</Label>
                                    <Input
                                        type="number"
                                        value={examData.durationMinutes}
                                        onChange={(e) => onExamDataChange({ ...examData, durationMinutes: parseInt(e.target.value) || 60 })}
                                        className="h-8 text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label className="text-xs">Mô tả</Label>
                                <Textarea
                                    placeholder="Mô tả ngắn về đề thi..."
                                    value={examData.description}
                                    onChange={(e) => onExamDataChange({ ...examData, description: e.target.value })}
                                    className="min-h-[60px] text-sm resize-none"
                                />
                            </div>
                        </CollapsibleContent>
                    </Collapsible>

                    {/* Questions Section */}
                    <Collapsible open={questionsOpen} onOpenChange={setQuestionsOpen}>
                        <CollapsibleTrigger className="flex items-center gap-2 w-full text-left">
                            {questionsOpen ? (
                                <ChevronDown className="w-4 h-4 text-muted-foreground" />
                            ) : (
                                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            )}
                            <span className="font-medium text-sm">Câu hỏi ({questions.length})</span>
                        </CollapsibleTrigger>

                        <CollapsibleContent className="pt-3 space-y-1">
                            {questions.map((question, index) => {
                                const status = getQuestionStatus(question);
                                const isActive = index === currentIndex;

                                return (
                                    <div
                                        key={index}
                                        className={`flex items-center gap-1.5 p-2 rounded-lg cursor-pointer transition-colors group ${isActive
                                            ? 'bg-primary/10 border border-primary/30'
                                            : 'hover:bg-muted/50'
                                            }`}
                                        onClick={() => onSelectQuestion(index)}
                                    >
                                        {/* Delete button at start */}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-5 w-5 flex-shrink-0 opacity-50 hover:opacity-100 hover:bg-destructive/20"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onRemoveQuestion(index);
                                            }}
                                        >
                                            <Minus className="w-3 h-3 text-destructive" />
                                        </Button>

                                        {status === 'complete' ? (
                                            <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                                        ) : status === 'partial' ? (
                                            <AlertCircle className="w-4 h-4 text-orange-500 flex-shrink-0" />
                                        ) : (
                                            <Circle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                        )}

                                        <span className="text-sm truncate flex-1 min-w-0">
                                            <span className="font-medium">Câu {index + 1}</span>
                                            {question.question_text && (
                                                <span className="text-muted-foreground ml-1 text-xs">
                                                    - {question.question_text.substring(0, 15)}...
                                                </span>
                                            )}
                                        </span>
                                    </div>
                                );
                            })}

                            {/* Add button at the end */}
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full mt-2 border border-dashed border-primary/30 hover:border-primary hover:bg-primary/5 text-primary"
                                onClick={onAddQuestion}
                            >
                                <Plus className="w-4 h-4 mr-1" />
                                Thêm câu hỏi
                            </Button>

                            {/* Import/Export */}
                            <div className="mt-3 pt-3 border-t border-border">
                                <ImportExportQuestions
                                    questions={questions}
                                    onImport={onImportQuestions}
                                />
                            </div>
                        </CollapsibleContent>
                    </Collapsible>
                </div>
            </ScrollArea>

            {/* Progress Footer */}
            <div className="p-4 border-t border-border">
                <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Tiến độ</span>
                    <span className="font-medium">{completedCount}/{questions.length}</span>
                </div>
                <Progress value={progress} className="h-2" />
            </div>
        </div>
    );
};
