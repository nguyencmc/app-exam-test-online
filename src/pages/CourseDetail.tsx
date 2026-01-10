import { useParams, useNavigate, Link } from 'react-router-dom';
import { Header, Footer } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
    Play, Clock, Users, Star, CheckCircle2, Lock,
    ChevronDown, ChevronUp, PlayCircle, FileText, Brain
} from 'lucide-react';
import { useState } from 'react';
import { useCourseDetail, useEnrollment, useEnrollCourse } from '@/hooks/useCourse';
import { useAuth } from '@/modules/auth';
import { VideoPlayer } from '@/components/course/VideoPlayer';

const CourseDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [expandedModules, setExpandedModules] = useState<string[]>([]);

    const { data: course, isLoading } = useCourseDetail(id!);
    const { data: enrollment } = useEnrollment(id!);
    const enrollMutation = useEnrollCourse();

    const toggleModule = (moduleId: string) => {
        setExpandedModules(prev =>
            prev.includes(moduleId)
                ? prev.filter(id => id !== moduleId)
                : [...prev, moduleId]
        );
    };

    const handleEnroll = () => {
        if (!user) {
            navigate('/auth');
            return;
        }
        enrollMutation.mutate(id!);
    };

    const handleStartLearning = () => {
        navigate(`/courses/${id}/learn`);
    };

    const getLessonIcon = (type: string) => {
        switch (type) {
            case 'video': return <PlayCircle className="w-4 h-4" />;
            case 'article': return <FileText className="w-4 h-4" />;
            case 'quiz': return <Brain className="w-4 h-4" />;
            default: return <PlayCircle className="w-4 h-4" />;
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <div className="container mx-auto px-4 py-12">
                    <div className="animate-pulse space-y-4">
                        <div className="h-96 bg-muted rounded-lg" />
                        <div className="h-8 bg-muted rounded w-3/4" />
                        <div className="h-4 bg-muted rounded w-1/2" />
                    </div>
                </div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <div className="container mx-auto px-4 py-12 text-center">
                    <h1 className="text-2xl font-bold">Không tìm thấy khóa học</h1>
                </div>
            </div>
        );
    }

    const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
    const isEnrolled = !!enrollment;

    return (
        <div className="min-h-screen bg-background">
            <Header />

            {/* Hero Section */}
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 py-12">
                <div className="container mx-auto px-4">
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Left Content */}
                        <div className="lg:col-span-2">
                            <div className="mb-4">
                                <Link to="/courses" className="text-sm text-muted-foreground hover:text-primary">
                                    Khóa học
                                </Link>
                                <span className="mx-2 text-muted-foreground">/</span>
                                <span className="text-sm">{course.title}</span>
                            </div>

                            <h1 className="text-3xl md:text-4xl font-bold mb-4">{course.title}</h1>
                            <p className="text-lg text-muted-foreground mb-6">{course.description}</p>

                            <div className="flex flex-wrap items-center gap-4 mb-6">
                                <div className="flex items-center gap-1">
                                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                    <span className="font-bold">{course.rating_avg.toFixed(1)}</span>
                                    <span className="text-sm text-muted-foreground">
                                        ({course.rating_count} đánh giá)
                                    </span>
                                </div>
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                    <Users className="w-4 h-4" />
                                    {course.student_count} học viên
                                </div>
                                <Badge variant="secondary">{course.level}</Badge>
                            </div>

                            {/* Video Preview */}
                            {course.preview_video_url && (
                                <div className="mb-6">
                                    <VideoPlayer src={course.preview_video_url} />
                                </div>
                            )}
                        </div>

                        {/* Enrollment Card */}
                        <div className="lg:col-span-1">
                            <Card className="sticky top-4">
                                <CardContent className="p-6">
                                    {course.thumbnail_url && (
                                        <img
                                            src={course.thumbnail_url}
                                            alt={course.title}
                                            className="w-full rounded-lg mb-4"
                                        />
                                    )}

                                    {!isEnrolled ? (
                                        <>
                                            <div className="mb-4">
                                                {course.discount_price ? (
                                                    <>
                                                        <div className="text-3xl font-bold">
                                                            {course.discount_price.toLocaleString('vi-VN')}đ
                                                        </div>
                                                        <div className="text-sm text-muted-foreground line-through">
                                                            {course.price?.toLocaleString('vi-VN')}đ
                                                        </div>
                                                    </>
                                                ) : course.price ? (
                                                    <div className="text-3xl font-bold">
                                                        {course.price.toLocaleString('vi-VN')}đ
                                                    </div>
                                                ) : (
                                                    <div className="text-3xl font-bold">Miễn phí</div>
                                                )}
                                            </div>

                                            <Button
                                                className="w-full mb-4"
                                                size="lg"
                                                onClick={handleEnroll}
                                                disabled={enrollMutation.isPending}
                                            >
                                                Đăng ký ngay
                                            </Button>
                                        </>
                                    ) : (
                                        <Button
                                            className="w-full mb-4"
                                            size="lg"
                                            onClick={handleStartLearning}
                                        >
                                            <Play className="w-4 h-4 mr-2" />
                                            Tiếp tục học
                                        </Button>
                                    )}

                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-muted-foreground" />
                                            <span>{course.duration_hours} giờ học</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <PlayCircle className="w-4 h-4 text-muted-foreground" />
                                            <span>{totalLessons} bài học</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Users className="w-4 h-4 text-muted-foreground" />
                                            <span>{course.student_count} học viên</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-12">
                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        {/* What You'll Learn */}
                        {course.outcomes.length > 0 && (
                            <Card>
                                <CardContent className="p-6">
                                    <h2 className="text-2xl font-bold mb-4">Bạn sẽ học được gì</h2>
                                    <div className="grid md:grid-cols-2 gap-3">
                                        {course.outcomes.map((outcome, idx) => (
                                            <div key={idx} className="flex items-start gap-2">
                                                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                                                <span className="text-sm">{outcome.outcome_text}</span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Course Curriculum */}
                        <Card>
                            <CardContent className="p-6">
                                <h2 className="text-2xl font-bold mb-4">Nội dung khóa học</h2>
                                <p className="text-sm text-muted-foreground mb-4">
                                    {course.modules.length} chương • {totalLessons} bài học • {course.duration_hours} giờ
                                </p>

                                <div className="space-y-2">
                                    {course.modules.map((module) => (
                                        <div key={module.id} className="border rounded-lg">
                                            <button
                                                className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                                                onClick={() => toggleModule(module.id)}
                                            >
                                                <div className="flex items-center gap-3 text-left">
                                                    {expandedModules.includes(module.id) ? (
                                                        <ChevronUp className="w-5 h-5 flex-shrink-0" />
                                                    ) : (
                                                        <ChevronDown className="w-5 h-5 flex-shrink-0" />
                                                    )}
                                                    <div>
                                                        <h3 className="font-semibold">{module.title}</h3>
                                                        <p className="text-sm text-muted-foreground">
                                                            {module.lessons.length} bài học • {module.duration_minutes} phút
                                                        </p>
                                                    </div>
                                                </div>
                                            </button>

                                            {expandedModules.includes(module.id) && (
                                                <div className="border-t">
                                                    {module.lessons.map((lesson) => (
                                                        <div
                                                            key={lesson.id}
                                                            className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                {getLessonIcon(lesson.type)}
                                                                <span className="text-sm">{lesson.title}</span>
                                                                {lesson.is_preview && (
                                                                    <Badge variant="secondary" className="text-xs">
                                                                        Xem trước
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm text-muted-foreground">
                                                                    {lesson.duration_minutes} phút
                                                                </span>
                                                                {!lesson.is_preview && !isEnrolled && (
                                                                    <Lock className="w-4 h-4 text-muted-foreground" />
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Requirements */}
                        {course.requirements.length > 0 && (
                            <Card>
                                <CardContent className="p-6">
                                    <h2 className="text-2xl font-bold mb-4">Yêu cầu</h2>
                                    <ul className="space-y-2">
                                        {course.requirements.map((req, idx) => (
                                            <li key={idx} className="flex items-start gap-2 text-sm">
                                                <span className="text-muted-foreground">•</span>
                                                {req.requirement_text}
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default CourseDetail;
