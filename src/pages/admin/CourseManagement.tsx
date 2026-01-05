import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUserRole } from '@/hooks/useUserRole';
import { courseService } from '@/services/courseService';
import { Course } from '@/types';
import { Header } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { CourseTable } from '@/components/admin/courses/CourseTable';
import { CourseFilters } from '@/components/admin/courses/CourseFilters';
import {
    BookOpen,
    Plus,
    ArrowLeft,
} from 'lucide-react';

const CourseManagement = () => {
    const { isAdmin, isTeacher, loading: roleLoading } = useUserRole();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Note: Level and Status filters disabled until DB schema supports them
    const [levelFilter, setLevelFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    const hasAccess = isAdmin || isTeacher;

    useEffect(() => {
        if (!roleLoading && !hasAccess) {
            navigate('/');
        }
    }, [hasAccess, roleLoading, navigate]);

    useEffect(() => {
        if (hasAccess) {
            fetchCourses();
        }
    }, [hasAccess, searchQuery]);
    // Optimization: Add debounce for search in production, simplified here

    const fetchCourses = async () => {
        setLoading(true);
        try {
            // Use service instead of direct Supabase call
            // Pass filters to service (currently only search is implemented in schema)
            const result = await courseService.getAdminCourses(1, 100, searchQuery);
            setCourses(result.data);
        } catch (error: any) {
            console.error('Error fetching courses:', error);
            toast({
                title: 'Lỗi',
                description: 'Không thể tải danh sách khóa học',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await courseService.deleteCourse(id);

            setCourses(prev => prev.filter(c => c.id !== id));
            toast({
                title: 'Thành công',
                description: 'Đã xóa khóa học',
            });
        } catch (error: any) {
            toast({
                title: 'Lỗi',
                description: error.message || 'Không thể xóa khóa học',
                variant: 'destructive',
            });
        }
    };

    // const togglePublish = async (id: string, currentStatus: boolean) => {
    //     // TODO: Implement this when 'published' or 'is_official' toggling is supported by logic/schema
    //     // Currently relying on direct DB edits or 'is_official' flag which might be restricted
    // };

    if (roleLoading) {
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

            <main className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <Link to="/admin">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                                <BookOpen className="w-8 h-8 text-blue-500" />
                                Quản lý Khóa học
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                {courses.length} khóa học
                            </p>
                        </div>
                    </div>
                    <Link to="/admin/courses/create">
                        <Button className="gap-2">
                            <Plus className="w-4 h-4" />
                            Tạo khóa học mới
                        </Button>
                    </Link>
                </div>

                {/* Filters */}
                <CourseFilters
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                // levelFilter={levelFilter}
                // onLevelFilterChange={setLevelFilter}
                // statusFilter={statusFilter}
                // onStatusFilterChange={setStatusFilter}
                />

                {/* Courses Table */}
                <Card>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="flex items-center justify-center h-64">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                        ) : courses.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                                <BookOpen className="w-12 h-12 mb-4 opacity-50" />
                                <p>Không tìm thấy khóa học nào</p>
                            </div>
                        ) : (
                            <CourseTable
                                courses={courses}
                                onDelete={handleDelete}
                            // onTogglePublish={togglePublish}
                            />
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    );
};

export default CourseManagement;
