import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    ChevronLeft, ChevronRight, CheckCircle2, Circle, PlayCircle,
    FileText, Brain, Download, Menu, X
} from 'lucide-react';
import { useCourseDetail, useEnrollment, useLessonProgress, useUpdateLessonProgress } from '@/hooks/useCourse';
import { VideoPlayer } from '@/components/course/VideoPlayer';
import type { CourseLesson } from '@/hooks/useCourse';

const CourseLearning = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [currentLessonId, setCurrentLessonId] = useState<string | null>(null);

    const { data: course, isLoading } = useCourseDetail(id!);
    const { data: enrollment } = useEnrollment(id!);
    const { data: progress } = useLessonProgress(enrollment?.id || null);
    const updateProgress = useUpdateLessonProgress();

    // Get current lesson
    const allLessons = course?.modules.flatMap(m => m.lessons) || [];
    const currentLesson = allLessons.find(l => l.id === currentLessonId) || allLessons[0];
    const currentIndex = allLessons.findIndex(l => l.id === currentLesson?.id);

    const isLessonCompleted = (lessonId: string) => {
        return progress?.some(p => p.lesson_id === lessonId && p.completed) || false;
    };

    const getLessonIcon = (type: string) => {
        switch (type) {
            case 'video': return <PlayCircle className="w-4 h-4" />;
            case 'article': return <FileText className="w-4 h-4" />;
            case 'quiz': return <Brain className="w-4 h-4" />;
            default: return <PlayCircle className="w-4 h-4" />;
        }
    };

    const handleLessonComplete = () => {
        if (enrollment && currentLesson) {
            updateProgress.mutate({
                enrollmentId: enrollment.id,
                lessonId: currentLesson.id,
                completed: true,
            });
        }
    };

    const goToNextLesson = () => {
        if (currentIndex < allLessons.length - 1) {
            setCurrentLessonId(allLessons[currentIndex + 1].id);
        }
    };

    const goToPreviousLesson = () => {
        if (currentIndex > 0) {
            setCurrentLessonId(allLessons[currentIndex - 1].id);
        }
    };

    if (isLoading || !course || !currentLesson) {
        return (
            <div className="h-screen flex items-center justify-center">
                <div className="animate-pulse">Loading...</div>
            </div>
        );
    }

    if (!enrollment) {
        return (
            <div className="h-screen flex flex-col items-center justify-center">
                <h2 className="text-2xl font-bold mb-4">Bạn chưa đăng ký khóa học này</h2>
                <Button onClick={() => navigate(`/courses/${id}`)}>
                    Quay lại trang khóa học
                </Button>
            </div>
        );
    }

    const completedCount = progress?.filter(p => p.completed).length || 0;
    const progressPercent = (completedCount / allLessons.length) * 100;

    return (
        <div className="h-screen flex flex-col bg-background">
            {/* Top Bar */}
            <div className="flex items-center justify-between px-4 py-3 border-b">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/courses/${id}`)}
                    >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Quay lại
                    </Button>
                    <h1 className="font-semibold text-sm md:text-base truncate max-w-[200px] md:max-w-none">
                        {course.title}
                    </h1>
                </div>

                <div className="flex items-center gap-2">
                    <div className="hidden md:block text-sm text-muted-foreground">
                        {completedCount}/{allLessons.length} hoàn thành
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                    >
                        {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                    </Button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar */}
                <div
                    className={`${sidebarOpen ? 'w-full md:w-80' : 'w-0'
                        } transition-all duration-300 overflow-hidden border-r bg-card`}
                >
                    <div className="p-4 h-full overflow-y-auto">
                        <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">Tiến độ khóa học</span>
                                <span className="text-sm text-muted-foreground">
                                    {Math.round(progressPercent)}%
                                </span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                                <div
                                    className="bg-primary h-full rounded-full transition-all"
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>
                        </div>

                        <Separator className="my-4" />

                        <div className="space-y-4">
                            {course.modules.map((module) => (
                                <div key={module.id}>
                                    <h3 className="font-semibold text-sm mb-2">{module.title}</h3>
                                    <div className="space-y-1">
                                        {module.lessons.map((lesson) => {
                                            const isCompleted = isLessonCompleted(lesson.id);
                                            const isCurrent = lesson.id === currentLesson.id;

                                            return (
                                                <button
                                                    key={lesson.id}
                                                    onClick={() => setCurrentLessonId(lesson.id)}
                                                    className={`w-full flex items-center gap-2 p-2 rounded-lg text-left transition-colors ${isCurrent
                                                            ? 'bg-primary text-primary-foreground'
                                                            : 'hover:bg-muted'
                                                        }`}
                                                >
                                                    {isCompleted ? (
                                                        <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-green-500" />
                                                    ) : (
                                                        <Circle className="w-4 h-4 flex-shrink-0" />
                                                    )}
                                                    {getLessonIcon(lesson.type)}
                                                    <span className="text-sm flex-1 truncate">{lesson.title}</span>
                                                    <span className="text-xs opacity-70">{lesson.duration_minutes}p</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto">
                        <div className="max-w-5xl mx-auto p-6">
                            {/* Video/Content */}
                            {currentLesson.type === 'video' && currentLesson.content_url && (
                                <VideoPlayer
                                    src={currentLesson.content_url}
                                    onComplete={handleLessonComplete}
                                />
                            )}

                            {currentLesson.type === 'article' && (
                                <Card className="p-6 prose max-w-none">
                                    <div dangerouslySetInnerHTML={{ __html: currentLesson.content_url || '' }} />
                                </Card>
                            )}

                            {/* Lesson Info */}
                            <div className="mt-6">
                                <h2 className="text-2xl font-bold mb-2">{currentLesson.title}</h2>
                                {currentLesson.description && (
                                    <p className="text-muted-foreground mb-4">{currentLesson.description}</p>
                                )}

                                {!isLessonCompleted(currentLesson.id) && (
                                    <Button onClick={handleLessonComplete} className="mb-6">
                                        <CheckCircle2 className="w-4 h-4 mr-2" />
                                        Đánh dấu hoàn thành
                                    </Button>
                                )}
                            </div>

                            {/* Tabs */}
                            <Tabs defaultValue="overview" className="mt-6">
                                <TabsList>
                                    <TabsTrigger value="overview">Tổng quan</TabsTrigger>
                                    <TabsTrigger value="resources">Tài liệu</TabsTrigger>
                                    <TabsTrigger value="qa">Q&A</TabsTrigger>
                                </TabsList>

                                <TabsContent value="overview" className="mt-4">
                                    <Card className="p-6">
                                        <p className="text-muted-foreground">
                                            {currentLesson.description || 'Không có mô tả'}
                                        </p>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="resources" className="mt-4">
                                    <Card className="p-6">
                                        {currentLesson.resources && Array.isArray(currentLesson.resources) && currentLesson.resources.length > 0 ? (
                                            <div className="space-y-2">
                                                {currentLesson.resources.map((resource: any, idx: number) => (
                                                    <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                                                        <span className="text-sm">{resource.name}</span>
                                                        <Button variant="outline" size="sm">
                                                            <Download className="w-4 h-4 mr-2" />
                                                            Tải xuống
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-muted-foreground">Không có tài liệu</p>
                                        )}
                                    </Card>
                                </TabsContent>

                                <TabsContent value="qa" className="mt-4">
                                    <Card className="p-6">
                                        <p className="text-muted-foreground">Chức năng Q&A đang được phát triển</p>
                                    </Card>
                                </TabsContent>
                            </Tabs>
                        </div>
                    </div>

                    {/* Bottom Navigation */}
                    <div className="border-t p-4 flex items-center justify-between">
                        <Button
                            variant="outline"
                            onClick={goToPreviousLesson}
                            disabled={currentIndex === 0}
                        >
                            <ChevronLeft className="w-4 h-4 mr-2" />
                            Bài trước
                        </Button>

                        <div className="text-sm text-muted-foreground">
                            Bài {currentIndex + 1}/{allLessons.length}
                        </div>

                        <Button
                            onClick={goToNextLesson}
                            disabled={currentIndex === allLessons.length - 1}
                        >
                            Bài tiếp theo
                            <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseLearning;
