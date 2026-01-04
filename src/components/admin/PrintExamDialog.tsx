import { useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Printer, Loader2, FileText, Clock, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Question {
    id: string;
    question_text: string;
    question_type: string;
    options: string[]; // Changed from string[] | null
    correct_answer: string;
    explanation: string | null;
    points: number;
    order_index: number;
}

interface Exam {
    id: string;
    title: string;
    description: string | null;
    duration_minutes: number | null;
    question_count: number | null;
}

interface PrintExamDialogProps {
    exam: Exam;
    trigger?: React.ReactNode;
}

export const PrintExamDialog = ({ exam, trigger }: PrintExamDialogProps) => {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [showAnswers, setShowAnswers] = useState(false);
    const [showExplanations, setShowExplanations] = useState(false);
    const [showPoints, setShowPoints] = useState(true);
    const [schoolName, setSchoolName] = useState('');
    const [examCode, setExamCode] = useState('');
    const [notes, setNotes] = useState('');
    const [isPrinting, setIsPrinting] = useState(false);

    const printRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `${exam.title} - Đề thi`,
        onBeforePrint: async () => {
            setIsPrinting(true);
            return Promise.resolve();
        },
        onAfterPrint: () => {
            setIsPrinting(false);
        },
    });

    const fetchQuestions = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('questions')
            .select('*')
            .eq('exam_id', exam.id)
            .order('question_order', { ascending: true });

        if (error) {
            console.error('Error fetching questions:', error);
            toast({
                title: 'Lỗi',
                description: 'Không thể tải câu hỏi. Vui lòng thử lại sau.',
                variant: 'destructive',
            });
            setLoading(false);
            return;
        }

        // Map database fields to our internal format for printing
        const formattedQuestions = (data || []).map((q: any) => {
            const options = [];
            if (q.option_a) options.push(q.option_a);
            if (q.option_b) options.push(q.option_b);
            if (q.option_c) options.push(q.option_c);
            if (q.option_d) options.push(q.option_d);
            if (q.option_e) options.push(q.option_e);
            if (q.option_f) options.push(q.option_f);
            if (q.option_g) options.push(q.option_g);
            if (q.option_h) options.push(q.option_h);

            return {
                id: q.id,
                question_text: q.question_text,
                question_type: q.question_type || 'multiple_choice',
                options: options,
                correct_answer: q.correct_answer,
                explanation: q.explanation,
                points: q.points || 1,
                order_index: q.question_order || 0,
            };
        });

        setQuestions(formattedQuestions);
        setLoading(false);
    };

    const handleOpenChange = (isOpen: boolean) => {
        setOpen(isOpen);
        if (isOpen) {
            fetchQuestions();
        }
    };

    const getAnswerLabel = (index: number) => {
        return String.fromCharCode(65 + index); // A, B, C, D...
    };

    const totalPoints = questions.reduce((sum, q) => sum + (q.points || 1), 0);

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" size="sm" className="gap-2">
                        <Printer className="w-4 h-4" />
                        In đề thi
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Printer className="w-5 h-5" />
                        In đề thi: {exam.title}
                    </DialogTitle>
                    <DialogDescription>
                        Tùy chỉnh các thông tin trước khi in
                    </DialogDescription>
                </DialogHeader>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="flex-1 overflow-hidden flex flex-col md:flex-row gap-4">
                        {/* Settings Panel */}
                        <div className="w-full md:w-64 space-y-4 shrink-0">
                            <div className="space-y-3">
                                <h3 className="font-medium text-sm">Thông tin đề thi</h3>

                                <div className="space-y-2">
                                    <Label htmlFor="schoolName">Tên trường/đơn vị</Label>
                                    <Input
                                        id="schoolName"
                                        placeholder="VD: Trường THPT ABC"
                                        value={schoolName}
                                        onChange={(e) => setSchoolName(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="examCode">Mã đề thi</Label>
                                    <Input
                                        id="examCode"
                                        placeholder="VD: ĐỀ 001"
                                        value={examCode}
                                        onChange={(e) => setExamCode(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="notes">Ghi chú/Hướng dẫn</Label>
                                    <Textarea
                                        id="notes"
                                        placeholder="VD: Thí sinh không được sử dụng tài liệu..."
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        rows={3}
                                    />
                                </div>
                            </div>

                            <div className="space-y-3 pt-4 border-t">
                                <h3 className="font-medium text-sm">Tùy chọn hiển thị</h3>

                                <div className="flex items-center justify-between">
                                    <Label htmlFor="showPoints" className="text-sm">Hiện điểm mỗi câu</Label>
                                    <Switch
                                        id="showPoints"
                                        checked={showPoints}
                                        onCheckedChange={setShowPoints}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <Label htmlFor="showAnswers" className="text-sm">Hiện đáp án</Label>
                                    <Switch
                                        id="showAnswers"
                                        checked={showAnswers}
                                        onCheckedChange={setShowAnswers}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <Label htmlFor="showExplanations" className="text-sm">Hiện giải thích</Label>
                                    <Switch
                                        id="showExplanations"
                                        checked={showExplanations}
                                        onCheckedChange={setShowExplanations}
                                    />
                                </div>
                            </div>

                            <div className="pt-4 border-t text-sm text-muted-foreground">
                                <p>📝 {questions.length} câu hỏi</p>
                                <p>⏱️ {exam.duration_minutes || 60} phút</p>
                                <p>📊 Tổng điểm: {totalPoints}</p>
                            </div>
                        </div>

                        {/* Preview Panel */}
                        <div className="flex-1 border rounded-lg overflow-auto bg-white">
                            <div ref={printRef} className="p-8 print-content">
                                {/* Print Header */}
                                <div className="text-center mb-6 border-b pb-4">
                                    {schoolName && (
                                        <p className="text-sm font-medium uppercase mb-1">{schoolName}</p>
                                    )}
                                    <h1 className="text-xl font-bold uppercase">{exam.title}</h1>
                                    {examCode && (
                                        <p className="text-sm mt-1">Mã đề: <strong>{examCode}</strong></p>
                                    )}
                                    <div className="flex items-center justify-center gap-4 mt-2 text-sm text-gray-600">
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-4 h-4" />
                                            Thời gian: {exam.duration_minutes || 60} phút
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <FileText className="w-4 h-4" />
                                            Số câu: {questions.length}
                                        </span>
                                    </div>
                                </div>

                                {/* Student Info */}
                                <div className="mb-6 p-4 border rounded-lg bg-gray-50">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex items-center gap-2">
                                            <User className="w-4 h-4 text-gray-500" />
                                            <span>Họ và tên: .............................................</span>
                                        </div>
                                        <div>
                                            <span>Lớp: ..................</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Notes/Instructions */}
                                {notes && (
                                    <div className="mb-6 p-4 border-l-4 border-primary bg-primary/5 rounded-r-lg">
                                        <p className="text-sm italic">{notes}</p>
                                    </div>
                                )}

                                {/* Questions */}
                                <div className="space-y-6">
                                    {questions.map((question, index) => (
                                        <div key={question.id} className="question-item">
                                            <div className="flex gap-2">
                                                <span className="font-bold shrink-0">
                                                    Câu {index + 1}
                                                    {showPoints && <span className="text-gray-500 font-normal"> ({question.points || 1} điểm)</span>}
                                                    :
                                                </span>
                                                <div className="flex-1">
                                                    <p className="font-medium" dangerouslySetInnerHTML={{ __html: question.question_text }} />

                                                    {/* Multiple Choice Options */}
                                                    {question.options && question.options.length > 0 && (
                                                        <div className="mt-2 space-y-1 pl-4">
                                                            {question.options.map((option, optIndex) => {
                                                                const isCorrect = question.correct_answer === getAnswerLabel(optIndex);
                                                                // Or if correct answer is the full text match
                                                                const isCorrectText = question.correct_answer === option;

                                                                const highlight = showAnswers && (isCorrect || isCorrectText);

                                                                return (
                                                                    <div
                                                                        key={optIndex}
                                                                        className={`flex items-start gap-2 ${highlight ? 'text-green-600 font-medium' : ''}`}
                                                                    >
                                                                        <span className="font-medium">{getAnswerLabel(optIndex)}.</span>
                                                                        <span dangerouslySetInnerHTML={{ __html: option }} />
                                                                        {highlight && (
                                                                            <span className="text-green-600 ml-2">✓</span>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}

                                                    {/* Fallback if no options (e.g. True/False stored differently or Essay) */}
                                                    {(!question.options || question.options.length === 0) && (
                                                        <div className="mt-3 border-b border-dashed border-gray-400 pb-6">
                                                            {showAnswers && (
                                                                <p className="text-green-600 font-medium mt-2">
                                                                    Đáp án: {question.correct_answer}
                                                                </p>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* Explanation */}
                                                    {showExplanations && question.explanation && (
                                                        <div className="mt-2 p-2 bg-blue-50 border-l-2 border-blue-400 text-sm text-blue-800 rounded-r">
                                                            <strong>Giải thích:</strong> {question.explanation}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Answer Key (if showing answers) */}
                                {showAnswers && (
                                    <div className="mt-8 pt-4 border-t">
                                        <h3 className="font-bold mb-2">BẢNG ĐÁP ÁN</h3>
                                        <div className="grid grid-cols-5 md:grid-cols-10 gap-2 text-sm">
                                            {questions.map((q, index) => (
                                                <div key={q.id} className="text-center p-1 border rounded">
                                                    <span className="font-medium">{index + 1}.</span> {q.correct_answer}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Footer */}
                                <div className="mt-8 pt-4 border-t text-center text-sm text-gray-500">
                                    <p>--- HẾT ---</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <DialogFooter className="mt-4">
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Đóng
                    </Button>
                    <Button
                        onClick={() => handlePrint()}
                        disabled={loading || isPrinting || questions.length === 0}
                        className="gap-2"
                    >
                        {isPrinting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Printer className="w-4 h-4" />
                        )}
                        In đề thi
                    </Button>
                </DialogFooter>
            </DialogContent>

            {/* Print Styles */}
            <style>{`
        @media print {
          .print-content {
            padding: 20mm;
            font-size: 12pt;
            line-height: 1.6;
          }
          
          .question-item {
            page-break-inside: avoid;
          }
          
          @page {
            size: A4;
            margin: 15mm;
          }
        }
      `}</style>
        </Dialog>
    );
};

export default PrintExamDialog;
