import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
    BookOpen,
    ArrowLeft,
    Save,
    Plus,
    Trash2,
    Edit,
    Video,
    FileText,
    HelpCircle,
    ChevronDown,
    GripVertical,
    Eye,
    Clock,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Upload,
} from 'lucide-react';
import VideoUploader from '@/components/admin/VideoUploader';
import { useToast } from '@/hooks/use-toast';

interface Course {
    id: string;
    title: string;
}

interface Module {
    id: string;
    course_id: string;
    title: string;
    description: string | null;
    order_index: number;
    duration_minutes: number;
    lessons: Lesson[];
}

interface Lesson {
    id: string;
    module_id: string;
    title: string;
    description: string | null;
    type: 'video' | 'article' | 'quiz' | 'exercise';
    content_url: string | null;
    duration_minutes: number;
    order_index: number;
    is_preview: boolean;
}

const lessonTypeIcons = {
    video: Video,
    article: FileText,
    quiz: HelpCircle,
    exercise: Edit,
};

const lessonTypeLabels = {
    video: 'Video',
    article: 'Bài viết',
    quiz: 'Quiz',
    exercise: 'Bài tập',
};

const ModuleLessonEditor = () => {
    const { id: courseId } = useParams();
    const { isAdmin, isTeacher, loading: roleLoading } = useUserRole();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [course, setCourse] = useState<Course | null>(null);
    const [modules, setModules] = useState<Module[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Dialog states
    const [moduleDialog, setModuleDialog] = useState(false);
    const [lessonDialog, setLessonDialog] = useState(false);
    const [editingModule, setEditingModule] = useState<Module | null>(null);
    const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
    const [targetModuleId, setTargetModuleId] = useState<string | null>(null);

    // Form states
    const [moduleForm, setModuleForm] = useState({ title: '', description: '' });
    const [lessonForm, setLessonForm] = useState<{
        title: string;
        description: string;
        type: 'video' | 'article' | 'quiz' | 'exercise';
        content_url: string;
        duration_minutes: number;
        is_preview: boolean;
    }>({
        title: '',
        description: '',
        type: 'video',
        content_url: '',
        duration_minutes: 0,
        is_preview: false,
    });

    // Expanded modules
    const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

    const hasAccess = isAdmin || isTeacher;

    useEffect(() => {
        if (!roleLoading && !hasAccess) {
            navigate('/');
        }
    }, [hasAccess, roleLoading, navigate]);

    useEffect(() => {
        if (courseId && hasAccess) {
            fetchCourseData();
        }
    }, [courseId, hasAccess]);

    const fetchCourseData = async () => {
        setLoading(true);
        try {
            // Fetch course
            const { data: courseData, error: courseError } = await supabase
                .from('courses')
                .select('id, title')
                .eq('id', courseId)
                .single();

            if (courseError) throw courseError;
            setCourse(courseData);

            // Fetch modules with lessons
            const { data: modulesData, error: modulesError } = await supabase
                .from('course_modules')
                .select(`
          *,
          lessons:course_lessons(*)
        `)
                .eq('course_id', courseId)
                .order('order_index', { ascending: true });

            if (modulesError) throw modulesError;

            // Sort lessons within each module
            const sortedModules = (modulesData || []).map((m: any) => ({
                ...m,
                lessons: (m.lessons || []).sort((a: Lesson, b: Lesson) => a.order_index - b.order_index),
            }));

            setModules(sortedModules);

            // Expand all modules by default
            setExpandedModules(new Set(sortedModules.map((m: Module) => m.id)));
        } catch (error: any) {
            toast({
                title: 'Lỗi',
                description: 'Không tìm thấy khóa học',
                variant: 'destructive',
            });
            navigate('/admin/courses');
        } finally {
            setLoading(false);
        }
    };

    // Module CRUD
    const openModuleDialog = (module?: Module) => {
        if (module) {
            setEditingModule(module);
            setModuleForm({ title: module.title, description: module.description || '' });
        } else {
            setEditingModule(null);
            setModuleForm({ title: '', description: '' });
        }
        setModuleDialog(true);
    };

    const saveModule = async () => {
        if (!moduleForm.title.trim()) {
            toast({ title: 'Lỗi', description: 'Vui lòng nhập tên module', variant: 'destructive' });
            return;
        }

        setSaving(true);
        try {
            if (editingModule) {
                const { error } = await supabase
                    .from('course_modules')
                    .update({
                        title: moduleForm.title,
                        description: moduleForm.description || null,
                    })
                    .eq('id', editingModule.id);

                if (error) throw error;

                setModules(prev => prev.map(m =>
                    m.id === editingModule.id
                        ? { ...m, title: moduleForm.title, description: moduleForm.description || null }
                        : m
                ));
            } else {
                const newOrderIndex = modules.length;
                const { data, error } = await supabase
                    .from('course_modules')
                    .insert({
                        course_id: courseId,
                        title: moduleForm.title,
                        description: moduleForm.description || null,
                        order_index: newOrderIndex,
                    })
                    .select()
                    .single();

                if (error) throw error;

                setModules(prev => [...prev, { ...data, lessons: [] }]);
                setExpandedModules(prev => new Set([...prev, data.id]));
            }

            toast({ title: 'Thành công', description: editingModule ? 'Đã cập nhật module' : 'Đã thêm module' });
            setModuleDialog(false);
        } catch (error: any) {
            toast({ title: 'Lỗi', description: error.message, variant: 'destructive' });
        } finally {
            setSaving(false);
        }
    };

    const deleteModule = async (moduleId: string) => {
        if (!confirm('Xóa module này sẽ xóa tất cả bài học bên trong. Tiếp tục?')) return;

        try {
            const { error } = await supabase
                .from('course_modules')
                .delete()
                .eq('id', moduleId);

            if (error) throw error;

            setModules(prev => prev.filter(m => m.id !== moduleId));
            toast({ title: 'Thành công', description: 'Đã xóa module' });
        } catch (error: any) {
            toast({ title: 'Lỗi', description: error.message, variant: 'destructive' });
        }
    };

    // Lesson CRUD
    const openLessonDialog = (moduleId: string, lesson?: Lesson) => {
        setTargetModuleId(moduleId);
        if (lesson) {
            setEditingLesson(lesson);
            setLessonForm({
                title: lesson.title,
                description: lesson.description || '',
                type: lesson.type,
                content_url: lesson.content_url || '',
                duration_minutes: lesson.duration_minutes,
                is_preview: lesson.is_preview,
            });
        } else {
            setEditingLesson(null);
            setLessonForm({
                title: '',
                description: '',
                type: 'video',
                content_url: '',
                duration_minutes: 0,
                is_preview: false,
            });
        }
        setLessonDialog(true);
    };

    const saveLesson = async () => {
        if (!lessonForm.title.trim()) {
            toast({ title: 'Lỗi', description: 'Vui lòng nhập tên bài học', variant: 'destructive' });
            return;
        }

        setSaving(true);
        try {
            if (editingLesson) {
                const { error } = await supabase
                    .from('course_lessons')
                    .update({
                        title: lessonForm.title,
                        description: lessonForm.description || null,
                        type: lessonForm.type,
                        content_url: lessonForm.content_url || null,
                        duration_minutes: lessonForm.duration_minutes,
                        is_preview: lessonForm.is_preview,
                    })
                    .eq('id', editingLesson.id);

                if (error) throw error;

                setModules(prev => prev.map(m => ({
                    ...m,
                    lessons: m.lessons.map(l =>
                        l.id === editingLesson.id
                            ? { ...l, ...lessonForm, description: lessonForm.description || null, content_url: lessonForm.content_url || null }
                            : l
                    ),
                })));
            } else {
                const module = modules.find(m => m.id === targetModuleId);
                const newOrderIndex = module ? module.lessons.length : 0;

                const { data, error } = await supabase
                    .from('course_lessons')
                    .insert({
                        module_id: targetModuleId,
                        title: lessonForm.title,
                        description: lessonForm.description || null,
                        type: lessonForm.type,
                        content_url: lessonForm.content_url || null,
                        duration_minutes: lessonForm.duration_minutes,
                        order_index: newOrderIndex,
                        is_preview: lessonForm.is_preview,
                    })
                    .select()
                    .single();

                if (error) throw error;

                setModules(prev => prev.map(m =>
                    m.id === targetModuleId
                        ? { ...m, lessons: [...m.lessons, data] }
                        : m
                ));
            }

            toast({ title: 'Thành công', description: editingLesson ? 'Đã cập nhật bài học' : 'Đã thêm bài học' });
            setLessonDialog(false);
        } catch (error: any) {
            toast({ title: 'Lỗi', description: error.message, variant: 'destructive' });
        } finally {
            setSaving(false);
        }
    };

    const deleteLesson = async (lessonId: string, moduleId: string) => {
        if (!confirm('Xác nhận xóa bài học này?')) return;

        try {
            const { error } = await supabase
                .from('course_lessons')
                .delete()
                .eq('id', lessonId);

            if (error) throw error;

            setModules(prev => prev.map(m =>
                m.id === moduleId
                    ? { ...m, lessons: m.lessons.filter(l => l.id !== lessonId) }
                    : m
            ));
            toast({ title: 'Thành công', description: 'Đã xóa bài học' });
        } catch (error: any) {
            toast({ title: 'Lỗi', description: error.message, variant: 'destructive' });
        }
    };

    const toggleModuleExpand = (moduleId: string) => {
        setExpandedModules(prev => {
            const next = new Set(prev);
            if (next.has(moduleId)) {
                next.delete(moduleId);
            } else {
                next.add(moduleId);
            }
            return next;
        });
    };

    const getTotalDuration = () => {
        return modules.reduce((total, m) =>
            total + m.lessons.reduce((t, l) => t + l.duration_minutes, 0), 0);
    };

    const getTotalLessons = () => {
        return modules.reduce((total, m) => total + m.lessons.length, 0);
    };

    if (roleLoading || loading) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <div className="container mx-auto px-4 py-8">
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!hasAccess) {
        return null;
    }

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main className="container mx-auto px-4 py-8 max-w-4xl">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <Link to="/admin/courses">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
                                <BookOpen className="w-7 h-7 text-blue-500" />
                                Nội dung khóa học
                            </h1>
                            {course && (
                                <p className="text-muted-foreground mt-1">{course.title}</p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex gap-4 text-sm text-muted-foreground">
                            <span>{modules.length} module</span>
                            <span>{getTotalLessons()} bài học</span>
                            <span>{Math.round(getTotalDuration() / 60 * 10) / 10}h</span>
                        </div>
                        <Link to={`/courses/${courseId}`}>
                            <Button variant="outline" size="sm" className="gap-2">
                                <Eye className="w-4 h-4" />
                                Xem trang
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Modules List */}
                <div className="space-y-4">
                    {modules.map((module, moduleIndex) => {
                        const isExpanded = expandedModules.has(module.id);
                        const LessonIcon = Video;

                        return (
                            <Card key={module.id} className="overflow-hidden">
                                <Collapsible open={isExpanded} onOpenChange={() => toggleModuleExpand(module.id)}>
                                    <CollapsibleTrigger asChild>
                                        <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-4">
                                            <div className="flex items-center gap-3">
                                                <GripVertical className="w-4 h-4 text-muted-foreground/50" />
                                                <ChevronDown
                                                    className={`w-4 h-4 transition-transform ${isExpanded ? '' : '-rotate-90'}`}
                                                />
                                                <div className="flex-1">
                                                    <CardTitle className="text-base flex items-center gap-2">
                                                        <Badge variant="outline" className="font-normal">
                                                            Chương {moduleIndex + 1}
                                                        </Badge>
                                                        {module.title}
                                                    </CardTitle>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        {module.lessons.length} bài học •
                                                        {module.lessons.reduce((t, l) => t + l.duration_minutes, 0)} phút
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={() => openModuleDialog(module)}
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-destructive hover:text-destructive"
                                                        onClick={() => deleteModule(module.id)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardHeader>
                                    </CollapsibleTrigger>

                                    <CollapsibleContent>
                                        <CardContent className="pt-0 pb-4">
                                            {/* Lessons */}
                                            <div className="space-y-2 mb-4">
                                                {module.lessons.map((lesson, lessonIndex) => {
                                                    const Icon = lessonTypeIcons[lesson.type];
                                                    const hasContent = !!lesson.content_url;

                                                    return (
                                                        <div
                                                            key={lesson.id}
                                                            className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
                                                        >
                                                            <GripVertical className="w-4 h-4 text-muted-foreground/30 opacity-0 group-hover:opacity-100" />
                                                            <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium truncate flex items-center gap-2">
                                                                    {lesson.title}
                                                                    {lesson.is_preview && (
                                                                        <Badge variant="secondary" className="text-xs">Preview</Badge>
                                                                    )}
                                                                </p>
                                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                                    <span>{lessonTypeLabels[lesson.type]}</span>
                                                                    <span>•</span>
                                                                    <span className="flex items-center gap-1">
                                                                        <Clock className="w-3 h-3" />
                                                                        {lesson.duration_minutes} phút
                                                                    </span>
                                                                    {lesson.type === 'video' && (
                                                                        <>
                                                                            <span>•</span>
                                                                            {hasContent ? (
                                                                                <span className="flex items-center gap-1 text-green-600">
                                                                                    <CheckCircle2 className="w-3 h-3" />
                                                                                    Có video
                                                                                </span>
                                                                            ) : (
                                                                                <span className="flex items-center gap-1 text-orange-500">
                                                                                    <AlertCircle className="w-3 h-3" />
                                                                                    Chưa có video
                                                                                </span>
                                                                            )}
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8"
                                                                    onClick={() => openLessonDialog(module.id, lesson)}
                                                                >
                                                                    <Edit className="w-4 h-4" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                                                    onClick={() => deleteLesson(lesson.id, module.id)}
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            {/* Add Lesson Button */}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full gap-2 border-dashed"
                                                onClick={() => openLessonDialog(module.id)}
                                            >
                                                <Plus className="w-4 h-4" />
                                                Thêm bài học
                                            </Button>
                                        </CardContent>
                                    </CollapsibleContent>
                                </Collapsible>
                            </Card>
                        );
                    })}

                    {/* Add Module Button */}
                    <Button
                        variant="outline"
                        className="w-full gap-2 h-14 border-dashed"
                        onClick={() => openModuleDialog()}
                    >
                        <Plus className="w-5 h-5" />
                        Thêm module mới
                    </Button>
                </div>
            </main>

            {/* Module Dialog */}
            <Dialog open={moduleDialog} onOpenChange={setModuleDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editingModule ? 'Chỉnh sửa module' : 'Thêm module mới'}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label htmlFor="module-title">Tên module *</Label>
                            <Input
                                id="module-title"
                                value={moduleForm.title}
                                onChange={(e) => setModuleForm(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="VD: Chương 1: Giới thiệu"
                            />
                        </div>
                        <div>
                            <Label htmlFor="module-desc">Mô tả</Label>
                            <Textarea
                                id="module-desc"
                                value={moduleForm.description}
                                onChange={(e) => setModuleForm(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Mô tả nội dung chương..."
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setModuleDialog(false)}>
                            Hủy
                        </Button>
                        <Button onClick={saveModule} disabled={saving}>
                            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {editingModule ? 'Cập nhật' : 'Thêm'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Lesson Dialog */}
            <Dialog open={lessonDialog} onOpenChange={setLessonDialog}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingLesson ? 'Chỉnh sửa bài học' : 'Thêm bài học mới'}
                        </DialogTitle>
                        <DialogDescription>
                            Nhập thông tin và nội dung cho bài học
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <Label htmlFor="lesson-title">Tên bài học *</Label>
                                <Input
                                    id="lesson-title"
                                    value={lessonForm.title}
                                    onChange={(e) => setLessonForm(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder="VD: Bài 1: Cài đặt môi trường"
                                />
                            </div>

                            <div>
                                <Label htmlFor="lesson-type">Loại bài học</Label>
                                <Select
                                    value={lessonForm.type}
                                    onValueChange={(v: any) => setLessonForm(prev => ({ ...prev, type: v }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="video">🎬 Video</SelectItem>
                                        <SelectItem value="article">📝 Bài viết</SelectItem>
                                        <SelectItem value="quiz">❓ Quiz</SelectItem>
                                        <SelectItem value="exercise">✏️ Bài tập</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="lesson-duration">Thời lượng (phút)</Label>
                                <Input
                                    id="lesson-duration"
                                    type="number"
                                    value={lessonForm.duration_minutes}
                                    onChange={(e) => setLessonForm(prev => ({ ...prev, duration_minutes: Number(e.target.value) }))}
                                    min={0}
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="lesson-desc">Mô tả</Label>
                            <Textarea
                                id="lesson-desc"
                                value={lessonForm.description}
                                onChange={(e) => setLessonForm(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Mô tả ngắn về nội dung bài học..."
                                rows={2}
                            />
                        </div>

                        {lessonForm.type === 'video' && (
                            <div>
                                <Label>Video</Label>
                                <div className="mt-2 space-y-3">
                                    <VideoUploader
                                        currentUrl={lessonForm.content_url}
                                        folder={`courses/${courseId}`}
                                        onUploadComplete={(url) => setLessonForm(prev => ({ ...prev, content_url: url }))}
                                    />
                                    <div className="text-center text-sm text-muted-foreground">hoặc</div>
                                    <Input
                                        value={lessonForm.content_url}
                                        onChange={(e) => setLessonForm(prev => ({ ...prev, content_url: e.target.value }))}
                                        placeholder="Nhập URL video (YouTube, Vimeo, MP4...)"
                                    />
                                </div>
                            </div>
                        )}

                        {lessonForm.type === 'article' && (
                            <div>
                                <Label htmlFor="article-content">Nội dung bài viết (HTML)</Label>
                                <Textarea
                                    id="article-content"
                                    value={lessonForm.content_url}
                                    onChange={(e) => setLessonForm(prev => ({ ...prev, content_url: e.target.value }))}
                                    placeholder="<h1>Tiêu đề</h1><p>Nội dung...</p>"
                                    rows={6}
                                    className="font-mono text-sm"
                                />
                            </div>
                        )}

                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <div>
                                <Label htmlFor="is-preview" className="cursor-pointer">Cho phép xem trước</Label>
                                <p className="text-sm text-muted-foreground">
                                    Người dùng chưa đăng ký có thể xem bài học này
                                </p>
                            </div>
                            <Switch
                                id="is-preview"
                                checked={lessonForm.is_preview}
                                onCheckedChange={(v) => setLessonForm(prev => ({ ...prev, is_preview: v }))}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setLessonDialog(false)}>
                            Hủy
                        </Button>
                        <Button onClick={saveLesson} disabled={saving}>
                            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {editingLesson ? 'Cập nhật' : 'Thêm'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ModuleLessonEditor;
