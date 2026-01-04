import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AISidebar } from '@/components/admin/exam-v2/AISidebar';
import { FocusedEditor } from '@/components/admin/exam-v2/FocusedEditor';
import { TemplatePanel } from '@/components/admin/exam-v2/TemplatePanel';
import {
    Menu,
    FileText,
    Edit3,
    CheckSquare,
    List,
    Settings,
    ArrowLeft,
} from 'lucide-react';

export interface Question {
    id?: string;
    question_text: string;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
    option_e: string;
    option_f: string;
    option_g: string;
    option_h: string;
    correct_answer: string;
    explanation: string;
    question_order: number;
}

export interface ExamData {
    title: string;
    slug: string;
    description: string;
    categoryId: string;
    difficulty: string;
    durationMinutes: number;
}

interface ExamCategory {
    id: string;
    name: string;
}

const ExamCreatorV2 = () => {
    const { id } = useParams();
    const isEditing = !!id;
    const { isAdmin, isTeacher, loading: roleLoading } = useUserRole();
    const navigate = useNavigate();
    const { toast } = useToast();

    // State
    const [categories, setCategories] = useState<ExamCategory[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    // Current question index
    const [currentIndex, setCurrentIndex] = useState(0);

    // Mobile state
    const [mobileTab, setMobileTab] = useState<'editor' | 'info' | 'validate'>('editor');
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Exam data
    const [examData, setExamData] = useState<ExamData>({
        title: '',
        slug: '',
        description: '',
        categoryId: '',
        difficulty: 'medium',
        durationMinutes: 60,
    });

    // Questions
    const [questions, setQuestions] = useState<Question[]>([
        {
            question_text: '',
            option_a: '',
            option_b: '',
            option_c: '',
            option_d: '',
            option_e: '',
            option_f: '',
            option_g: '',
            option_h: '',
            correct_answer: '',
            explanation: '',
            question_order: 1,
        },
    ]);

    const hasAccess = isAdmin || isTeacher;

    // Fetch categories on mount
    useEffect(() => {
        const fetchCategories = async () => {
            const { data } = await supabase.from('exam_categories').select('id, name');
            setCategories(data || []);
        };
        fetchCategories();
    }, []);

    // Access control
    useEffect(() => {
        if (!roleLoading && !hasAccess) {
            navigate('/');
        }
    }, [hasAccess, roleLoading, navigate]);

    // Load existing exam for editing
    useEffect(() => {
        if (isEditing && id) {
            loadExam(id);
        }
    }, [id, isEditing]);

    const loadExam = async (examId: string) => {
        setLoading(true);
        try {
            const { data: exam, error } = await supabase
                .from('exams')
                .select('*')
                .eq('id', examId)
                .single();

            if (error || !exam) {
                toast({ title: 'Lỗi', description: 'Không tìm thấy đề thi', variant: 'destructive' });
                navigate('/admin/exams');
                return;
            }

            setExamData({
                title: exam.title,
                slug: exam.slug,
                description: exam.description || '',
                categoryId: exam.category_id || '',
                difficulty: exam.difficulty || 'medium',
                durationMinutes: exam.duration_minutes || 60,
            });

            const { data: questionsData } = await supabase
                .from('questions')
                .select('*')
                .eq('exam_id', examId)
                .order('question_order', { ascending: true });

            if (questionsData && questionsData.length > 0) {
                setQuestions(questionsData.map(q => ({
                    ...q,
                    option_e: q.option_e || '',
                    option_f: q.option_f || '',
                    option_g: q.option_g || '',
                    option_h: q.option_h || '',
                })));
            }
        } catch (error) {
            console.error('Error loading exam:', error);
        } finally {
            setLoading(false);
        }
    };

    // Add new question
    const addQuestion = useCallback(() => {
        const newQuestion: Question = {
            question_text: '',
            option_a: '',
            option_b: '',
            option_c: '',
            option_d: '',
            option_e: '',
            option_f: '',
            option_g: '',
            option_h: '',
            correct_answer: '',
            explanation: '',
            question_order: questions.length + 1,
        };
        setQuestions(prev => [...prev, newQuestion]);
        setCurrentIndex(questions.length);
    }, [questions.length]);

    // Update question
    const updateQuestion = useCallback((index: number, field: keyof Question, value: string) => {
        setQuestions(prev => prev.map((q, i) =>
            i === index ? { ...q, [field]: value } : q
        ));
    }, []);

    // Remove question
    const removeQuestion = useCallback((index: number) => {
        if (questions.length <= 1) {
            toast({ title: 'Lỗi', description: 'Phải có ít nhất 1 câu hỏi', variant: 'destructive' });
            return;
        }
        setQuestions(prev => prev.filter((_, i) => i !== index));
        if (currentIndex >= questions.length - 1) {
            setCurrentIndex(Math.max(0, questions.length - 2));
        }
    }, [questions.length, currentIndex, toast]);

    // Reorder questions
    const reorderQuestions = useCallback((fromIndex: number, toIndex: number) => {
        setQuestions(prev => {
            const newQuestions = [...prev];
            const [removed] = newQuestions.splice(fromIndex, 1);
            newQuestions.splice(toIndex, 0, removed);
            return newQuestions.map((q, i) => ({ ...q, question_order: i + 1 }));
        });
        if (currentIndex === fromIndex) {
            setCurrentIndex(toIndex);
        }
    }, [currentIndex]);

    // Validate question
    const validateQuestion = useCallback((question: Question) => {
        const errors: string[] = [];
        if (!question.question_text.trim()) errors.push('Thiếu nội dung câu hỏi');
        if (!question.option_a.trim()) errors.push('Thiếu đáp án A');
        if (!question.option_b.trim()) errors.push('Thiếu đáp án B');
        if (!question.correct_answer.trim()) errors.push('Chưa chọn đáp án đúng');
        return errors;
    }, []);

    // Save exam
    const handleSave = async () => {
        if (!examData.title.trim() || !examData.slug.trim()) {
            toast({ title: 'Lỗi', description: 'Vui lòng nhập tiêu đề và slug', variant: 'destructive' });
            return;
        }

        if (questions.length === 0) {
            toast({ title: 'Lỗi', description: 'Vui lòng thêm ít nhất 1 câu hỏi', variant: 'destructive' });
            return;
        }

        setSaving(true);
        try {
            let examId = id;

            const examPayload = {
                title: examData.title,
                slug: examData.slug,
                description: examData.description || null,
                category_id: examData.categoryId || null,
                difficulty: examData.difficulty,
                duration_minutes: examData.durationMinutes,
                question_count: questions.length,
            };

            if (isEditing) {
                const { error } = await supabase.from('exams').update(examPayload).eq('id', id);
                if (error) throw error;
            } else {
                const { data, error } = await supabase.from('exams').insert(examPayload).select().single();
                if (error) throw error;
                examId = data.id;
            }

            // Handle questions
            if (isEditing) {
                await supabase.from('questions').delete().eq('exam_id', examId);
            }

            const questionsToInsert = questions.map((q, index) => ({
                exam_id: examId,
                question_text: q.question_text,
                option_a: q.option_a,
                option_b: q.option_b,
                option_c: q.option_c || null,
                option_d: q.option_d || null,
                option_e: q.option_e || null,
                option_f: q.option_f || null,
                option_g: q.option_g || null,
                option_h: q.option_h || null,
                correct_answer: q.correct_answer,
                explanation: q.explanation || null,
                question_order: index + 1,
            }));

            const { error: questionsError } = await supabase.from('questions').insert(questionsToInsert);
            if (questionsError) throw questionsError;

            setLastSaved(new Date());
            toast({ title: 'Thành công', description: isEditing ? 'Đã cập nhật đề thi' : 'Đã tạo đề thi mới' });
            navigate('/admin/exams');
        } catch (error: any) {
            toast({ title: 'Lỗi', description: error.message || 'Không thể lưu đề thi', variant: 'destructive' });
        } finally {
            setSaving(false);
        }
    };

    // Handle AI generated questions
    const handleAIGenerate = useCallback((generatedQuestions: Question[]) => {
        setQuestions(prev => [...prev, ...generatedQuestions]);
        toast({ title: 'Thành công', description: `Đã thêm ${generatedQuestions.length} câu hỏi từ AI` });
    }, [toast]);

    // Handle template selection
    const handleTemplateSelect = useCallback((template: { questions: Question[]; examData: Partial<ExamData> }) => {
        if (template.examData) {
            setExamData(prev => ({ ...prev, ...template.examData }));
        }
        if (template.questions.length > 0) {
            setQuestions(template.questions);
            setCurrentIndex(0);
        }
    }, []);

    if (roleLoading || loading) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <div className="flex items-center justify-center h-[calc(100vh-64px)]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    if (!hasAccess) return null;

    const currentQuestion = questions[currentIndex];

    // Sidebar content for mobile sheet
    const SidebarContent = () => (
        <AISidebar
            examData={examData}
            questions={questions}
            currentIndex={currentIndex}
            categories={categories}
            onExamDataChange={setExamData}
            onSelectQuestion={(index) => {
                setCurrentIndex(index);
                setSidebarOpen(false);
            }}
            onAddQuestion={addQuestion}
            onRemoveQuestion={removeQuestion}
            onReorderQuestions={reorderQuestions}
            onAIGenerate={handleAIGenerate}
            onImportQuestions={setQuestions}
            validateQuestion={validateQuestion}
        />
    );

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />

            {/* Mobile Header */}
            <div className="lg:hidden flex items-center gap-2 px-4 py-3 border-b border-border bg-card">
                <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                    <SheetTrigger asChild>
                        <Button variant="outline" size="icon">
                            <Menu className="w-5 h-5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 w-80">
                        <SidebarContent />
                    </SheetContent>
                </Sheet>

                <div className="flex-1 min-w-0">
                    <h1 className="text-sm font-semibold truncate">
                        {examData.title || 'Đề thi mới'}
                    </h1>
                    <p className="text-xs text-muted-foreground">
                        Câu {currentIndex + 1}/{questions.length}
                    </p>
                </div>

                <Button size="sm" onClick={handleSave} disabled={saving}>
                    {saving ? 'Đang lưu...' : 'Lưu'}
                </Button>
            </div>

            {/* Mobile Tabs */}
            <div className="lg:hidden flex-1 flex flex-col overflow-hidden">
                <Tabs value={mobileTab} onValueChange={(v) => setMobileTab(v as any)} className="flex-1 flex flex-col">
                    <TabsList className="grid w-full grid-cols-3 rounded-none border-b">
                        <TabsTrigger value="editor" className="gap-2 text-xs">
                            <Edit3 className="w-4 h-4" />
                            <span className="hidden sm:inline">Soạn</span>
                        </TabsTrigger>
                        <TabsTrigger value="info" className="gap-2 text-xs">
                            <FileText className="w-4 h-4" />
                            <span className="hidden sm:inline">Thông tin</span>
                        </TabsTrigger>
                        <TabsTrigger value="validate" className="gap-2 text-xs">
                            <CheckSquare className="w-4 h-4" />
                            <span className="hidden sm:inline">Kiểm tra</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="editor" className="flex-1 m-0 overflow-hidden">
                        <FocusedEditor
                            question={currentQuestion}
                            questionIndex={currentIndex}
                            totalQuestions={questions.length}
                            onUpdateQuestion={(field, value) => updateQuestion(currentIndex, field, value)}
                            onNavigate={setCurrentIndex}
                            onSave={handleSave}
                            saving={saving}
                            lastSaved={lastSaved}
                            isMobile={true}
                        />
                    </TabsContent>

                    <TabsContent value="info" className="flex-1 m-0 overflow-auto p-4">
                        <MobileExamInfo
                            examData={examData}
                            categories={categories}
                            onExamDataChange={setExamData}
                        />
                    </TabsContent>

                    <TabsContent value="validate" className="flex-1 m-0 overflow-hidden">
                        <TemplatePanel
                            currentQuestion={currentQuestion}
                            validationErrors={validateQuestion(currentQuestion)}
                            onTemplateSelect={handleTemplateSelect}
                            isMobile={true}
                        />
                    </TabsContent>
                </Tabs>
            </div>

            {/* Desktop Layout */}
            <div className="hidden lg:flex flex-1 overflow-hidden">
                {/* Left Sidebar - AI + Outline */}
                <AISidebar
                    examData={examData}
                    questions={questions}
                    currentIndex={currentIndex}
                    categories={categories}
                    onExamDataChange={setExamData}
                    onSelectQuestion={setCurrentIndex}
                    onAddQuestion={addQuestion}
                    onRemoveQuestion={removeQuestion}
                    onReorderQuestions={reorderQuestions}
                    onAIGenerate={handleAIGenerate}
                    onImportQuestions={setQuestions}
                    validateQuestion={validateQuestion}
                />

                {/* Main Content - Focused Editor */}
                <FocusedEditor
                    question={currentQuestion}
                    questionIndex={currentIndex}
                    totalQuestions={questions.length}
                    onUpdateQuestion={(field, value) => updateQuestion(currentIndex, field, value)}
                    onNavigate={setCurrentIndex}
                    onSave={handleSave}
                    saving={saving}
                    lastSaved={lastSaved}
                />

                {/* Right Panel - Templates + Preview + Validation */}
                <TemplatePanel
                    currentQuestion={currentQuestion}
                    validationErrors={validateQuestion(currentQuestion)}
                    onTemplateSelect={handleTemplateSelect}
                />
            </div>
        </div>
    );
};

// Mobile Exam Info Component
const MobileExamInfo = ({
    examData,
    categories,
    onExamDataChange,
}: {
    examData: ExamData;
    categories: ExamCategory[];
    onExamDataChange: (data: ExamData) => void;
}) => {
    const generateSlug = (text: string) => {
        return text
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    };

    return (
        <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Thông tin đề thi
            </h2>

            <div className="space-y-4">
                <div>
                    <label className="text-sm font-medium">Tiêu đề</label>
                    <input
                        type="text"
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
                        className="w-full mt-1 px-3 py-2 border border-border rounded-lg bg-background text-sm"
                    />
                </div>

                <div>
                    <label className="text-sm font-medium">Slug (URL)</label>
                    <input
                        type="text"
                        placeholder="ielts-reading-test-1"
                        value={examData.slug}
                        onChange={(e) => onExamDataChange({ ...examData, slug: e.target.value })}
                        className="w-full mt-1 px-3 py-2 border border-border rounded-lg bg-background text-sm"
                    />
                </div>

                <div>
                    <label className="text-sm font-medium">Danh mục</label>
                    <select
                        value={examData.categoryId}
                        onChange={(e) => onExamDataChange({ ...examData, categoryId: e.target.value })}
                        className="w-full mt-1 px-3 py-2 border border-border rounded-lg bg-background text-sm"
                    >
                        <option value="">Chọn danh mục</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-medium">Độ khó</label>
                        <select
                            value={examData.difficulty}
                            onChange={(e) => onExamDataChange({ ...examData, difficulty: e.target.value })}
                            className="w-full mt-1 px-3 py-2 border border-border rounded-lg bg-background text-sm"
                        >
                            <option value="easy">Dễ</option>
                            <option value="medium">Trung bình</option>
                            <option value="hard">Khó</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-sm font-medium">Thời gian (phút)</label>
                        <input
                            type="number"
                            value={examData.durationMinutes}
                            onChange={(e) => onExamDataChange({ ...examData, durationMinutes: parseInt(e.target.value) || 60 })}
                            className="w-full mt-1 px-3 py-2 border border-border rounded-lg bg-background text-sm"
                        />
                    </div>
                </div>

                <div>
                    <label className="text-sm font-medium">Mô tả</label>
                    <textarea
                        placeholder="Mô tả ngắn về đề thi..."
                        value={examData.description}
                        onChange={(e) => onExamDataChange({ ...examData, description: e.target.value })}
                        className="w-full mt-1 px-3 py-2 border border-border rounded-lg bg-background text-sm min-h-[80px] resize-none"
                    />
                </div>
            </div>
        </div>
    );
};

export default ExamCreatorV2;
