import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    CheckCircle2,
    AlertTriangle,
    XCircle,
    Search,
    BookOpen,
    FileText,
    Calculator,
    Globe,
    Sparkles,
} from 'lucide-react';
import type { Question, ExamData } from '@/pages/admin/ExamCreatorV2';

interface TemplatePanelProps {
    currentQuestion: Question;
    validationErrors: string[];
    onTemplateSelect: (template: { questions: Question[]; examData: Partial<ExamData> }) => void;
    isMobile?: boolean;
}

interface Template {
    id: string;
    name: string;
    icon: React.ReactNode;
    color: string;
    questionCount: number;
    category: string;
}

const TEMPLATES: Template[] = [
    {
        id: 'ielts',
        name: 'IELTS Reading',
        icon: <Globe className="w-5 h-5" />,
        color: 'bg-blue-500',
        questionCount: 40,
        category: 'English',
    },
    {
        id: 'toeic',
        name: 'TOEIC Part 5',
        icon: <BookOpen className="w-5 h-5" />,
        color: 'bg-purple-500',
        questionCount: 30,
        category: 'English',
    },
    {
        id: 'math',
        name: 'Toán THPT',
        icon: <Calculator className="w-5 h-5" />,
        color: 'bg-green-500',
        questionCount: 50,
        category: 'Math',
    },
    {
        id: 'custom',
        name: 'Tùy chỉnh',
        icon: <FileText className="w-5 h-5" />,
        color: 'bg-orange-500',
        questionCount: 0,
        category: 'Custom',
    },
];

const VALIDATION_ITEMS = [
    { key: 'question_text', label: 'Nội dung câu hỏi', check: (q: Question) => !!q.question_text.trim() },
    { key: 'option_a', label: 'Có đáp án A', check: (q: Question) => !!q.option_a.trim() },
    { key: 'option_b', label: 'Có đáp án B', check: (q: Question) => !!q.option_b.trim() },
    { key: 'correct_answer', label: 'Đã chọn đáp án đúng', check: (q: Question) => !!q.correct_answer.trim() },
    { key: 'explanation', label: 'Có giải thích', check: (q: Question) => !!q.explanation.trim(), optional: true },
];

export const TemplatePanel = ({
    currentQuestion,
    validationErrors,
    onTemplateSelect,
    isMobile = false,
}: TemplatePanelProps) => {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredTemplates = TEMPLATES.filter((t) =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Generate mock template questions
    const handleTemplateClick = (template: Template) => {
        if (template.id === 'custom') {
            onTemplateSelect({ questions: [], examData: {} });
            return;
        }

        // Generate placeholder questions based on template
        const mockQuestions: Question[] = Array.from({ length: Math.min(5, template.questionCount) }).map((_, i) => ({
            question_text: `[${template.name}] Câu hỏi mẫu ${i + 1}`,
            option_a: 'Đáp án A',
            option_b: 'Đáp án B',
            option_c: 'Đáp án C',
            option_d: 'Đáp án D',
            option_e: '',
            option_f: '',
            option_g: '',
            option_h: '',
            correct_answer: 'A',
            explanation: '',
            question_order: i + 1,
        }));

        onTemplateSelect({
            questions: mockQuestions,
            examData: {
                title: `Đề ${template.name}`,
                description: `Đề thi mẫu ${template.name}`,
                difficulty: 'medium',
                durationMinutes: 60,
            },
        });
    };

    return (
        <div className={isMobile
            ? "flex-1 flex flex-col overflow-hidden"
            : "w-80 border-l border-border bg-card flex flex-col h-[calc(100vh-64px)]"
        }>
            {/* Templates Section */}
            <div className="p-4 border-b border-border">
                <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    Templates
                </h3>

                <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Tìm template..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 h-8 text-sm"
                    />
                </div>

                {/* Horizontal scrolling templates */}
                <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
                    {filteredTemplates.map((template) => (
                        <button
                            key={template.id}
                            onClick={() => handleTemplateClick(template)}
                            className="flex flex-col items-center gap-2 p-3 rounded-xl border border-border hover:border-primary/50 hover:bg-muted/50 transition-all flex-shrink-0 min-w-[80px]"
                        >
                            <div className={`w-10 h-10 rounded-lg ${template.color} flex items-center justify-center text-white`}>
                                {template.icon}
                            </div>
                            <span className="text-xs font-medium text-center whitespace-nowrap">{template.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Quick Preview */}
            <div className="p-4 border-b border-border">
                <h3 className="font-semibold text-sm mb-3">Quick Preview</h3>

                <Card className="bg-muted/30">
                    <CardContent className="p-3">
                        <p className="text-sm line-clamp-3">
                            {currentQuestion.question_text || (
                                <span className="text-muted-foreground italic">Chưa có nội dung câu hỏi...</span>
                            )}
                        </p>

                        {currentQuestion.option_a && (
                            <div className="mt-2 space-y-1">
                                {['A', 'B', 'C', 'D'].map((opt) => {
                                    const key = `option_${opt.toLowerCase()}` as keyof Question;
                                    const value = currentQuestion[key] as string;
                                    if (!value) return null;

                                    const isCorrect = currentQuestion.correct_answer.includes(opt);

                                    return (
                                        <div
                                            key={opt}
                                            className={`text-xs flex items-center gap-1.5 ${isCorrect ? 'text-green-500 font-medium' : 'text-muted-foreground'
                                                }`}
                                        >
                                            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${isCorrect ? 'bg-green-500 text-white' : 'bg-muted'
                                                }`}>
                                                {opt}
                                            </span>
                                            <span className="truncate">{value}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Validation Checklist */}
            <ScrollArea className="flex-1">
                <div className="p-4">
                    <h3 className="font-semibold text-sm mb-3">Validation</h3>

                    <div className="space-y-2">
                        {VALIDATION_ITEMS.map((item) => {
                            const isValid = item.check(currentQuestion);
                            const isOptional = item.optional;

                            return (
                                <div
                                    key={item.key}
                                    className={`flex items-center gap-2 p-2 rounded-lg ${isValid
                                        ? 'bg-green-500/10'
                                        : isOptional
                                            ? 'bg-orange-500/10'
                                            : 'bg-red-500/10'
                                        }`}
                                >
                                    {isValid ? (
                                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                                    ) : isOptional ? (
                                        <AlertTriangle className="w-4 h-4 text-orange-500 flex-shrink-0" />
                                    ) : (
                                        <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                                    )}
                                    <span className={`text-sm ${isValid
                                        ? 'text-green-700 dark:text-green-400'
                                        : isOptional
                                            ? 'text-orange-700 dark:text-orange-400'
                                            : 'text-red-700 dark:text-red-400'
                                        }`}>
                                        {item.label}
                                        {isOptional && !isValid && (
                                            <span className="text-xs ml-1">(tùy chọn)</span>
                                        )}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Summary Badge */}
                    <div className="mt-4 p-3 rounded-lg bg-muted/50 text-center">
                        {validationErrors.length === 0 ? (
                            <Badge className="bg-green-500">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Câu hỏi hoàn chỉnh
                            </Badge>
                        ) : (
                            <Badge variant="destructive">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                Còn {validationErrors.length} lỗi
                            </Badge>
                        )}
                    </div>
                </div>
            </ScrollArea>
        </div>
    );
};
