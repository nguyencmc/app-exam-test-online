import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    BookOpen,
    Plus,
    Search,
    Edit,
    Trash2,
    Eye,
    Video,
    ArrowLeft,
    Users,
    Star,
    MoreHorizontal,
    FileEdit,
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from '@/hooks/use-toast';

interface Course {
    id: string;
    title: string;
    description: string | null;
    thumbnail_url: string | null;
    level: string | null;
    price: number | null;
    discount_price: number | null;
    published: boolean;
    student_count: number;
    rating_avg: number;
    duration_hours: number | null;
    category: string | null;
    created_at: string;
}

const CourseManagement = () => {
    const { isAdmin, isTeacher, loading: roleLoading } = useUserRole();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
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
    }, [hasAccess]);

    const fetchCourses = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('courses')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setCourses(data || []);
        } catch (error: any) {
            toast({
                title: 'Lỗi',
                description: error.message || 'Không thể tải danh sách khóa học',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const { error } = await supabase
                .from('courses')
                .delete()
                .eq('id', id);

            if (error) throw error;

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

    const togglePublish = async (id: string, currentStatus: boolean) => {
        try {
            const { error } = await supabase
                .from('courses')
                .update({ published: !currentStatus })
                .eq('id', id);

            if (error) throw error;

            setCourses(prev => prev.map(c =>
                c.id === id ? { ...c, published: !currentStatus } : c
            ));

            toast({
                title: 'Thành công',
                description: !currentStatus ? 'Đã xuất bản khóa học' : 'Đã ẩn khóa học',
            });
        } catch (error: any) {
            toast({
                title: 'Lỗi',
                description: error.message,
                variant: 'destructive',
            });
        }
    };

    // Filter courses
    const filteredCourses = courses.filter(course => {
        const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesLevel = levelFilter === 'all' || course.level === levelFilter;
        const matchesStatus = statusFilter === 'all' ||
            (statusFilter === 'published' && course.published) ||
            (statusFilter === 'draft' && !course.published);

        return matchesSearch && matchesLevel && matchesStatus;
    });

    const formatPrice = (price: number | null) => {
        if (!price) return 'Miễn phí';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(price);
    };

    const getLevelBadge = (level: string | null) => {
        switch (level) {
            case 'beginner':
                return <Badge variant="secondary" className="bg-green-100 text-green-700">Cơ bản</Badge>;
            case 'intermediate':
                return <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">Trung cấp</Badge>;
            case 'advanced':
                return <Badge variant="secondary" className="bg-red-100 text-red-700">Nâng cao</Badge>;
            default:
                return <Badge variant="outline">Chưa xác định</Badge>;
        }
    };

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
                                {courses.length} khóa học • {courses.filter(c => c.published).length} đã xuất bản
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
                <Card className="mb-6">
                    <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Tìm kiếm khóa học..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <Select value={levelFilter} onValueChange={setLevelFilter}>
                                <SelectTrigger className="w-full md:w-40">
                                    <SelectValue placeholder="Cấp độ" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả cấp độ</SelectItem>
                                    <SelectItem value="beginner">Cơ bản</SelectItem>
                                    <SelectItem value="intermediate">Trung cấp</SelectItem>
                                    <SelectItem value="advanced">Nâng cao</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-full md:w-40">
                                    <SelectValue placeholder="Trạng thái" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả</SelectItem>
                                    <SelectItem value="published">Đã xuất bản</SelectItem>
                                    <SelectItem value="draft">Bản nháp</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Courses Table */}
                <Card>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="flex items-center justify-center h-64">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                        ) : filteredCourses.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                                <BookOpen className="w-12 h-12 mb-4 opacity-50" />
                                <p>Không tìm thấy khóa học nào</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[300px]">Khóa học</TableHead>
                                        <TableHead>Cấp độ</TableHead>
                                        <TableHead>Giá</TableHead>
                                        <TableHead>Học viên</TableHead>
                                        <TableHead>Đánh giá</TableHead>
                                        <TableHead>Trạng thái</TableHead>
                                        <TableHead className="text-right">Thao tác</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredCourses.map((course) => (
                                        <TableRow key={course.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-16 h-10 rounded bg-muted overflow-hidden shrink-0">
                                                        {course.thumbnail_url ? (
                                                            <img
                                                                src={course.thumbnail_url}
                                                                alt={course.title}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center">
                                                                <Video className="w-4 h-4 text-muted-foreground" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-medium truncate">{course.title}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {course.duration_hours ? `${course.duration_hours}h` : 'Chưa có'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>{getLevelBadge(course.level)}</TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    {course.discount_price ? (
                                                        <>
                                                            <span className="font-medium text-green-600">
                                                                {formatPrice(course.discount_price)}
                                                            </span>
                                                            <span className="text-muted-foreground line-through text-xs ml-1">
                                                                {formatPrice(course.price)}
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <span className="font-medium">{formatPrice(course.price)}</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1 text-sm">
                                                    <Users className="w-3.5 h-3.5 text-muted-foreground" />
                                                    {course.student_count}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1 text-sm">
                                                    <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                                                    {course.rating_avg?.toFixed(1) || '0.0'}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={course.published ? 'default' : 'secondary'}
                                                    className={course.published ? 'bg-green-500' : ''}
                                                >
                                                    {course.published ? 'Đã xuất bản' : 'Bản nháp'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreHorizontal className="w-4 h-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem asChild>
                                                            <Link to={`/courses/${course.id}`} className="flex items-center gap-2">
                                                                <Eye className="w-4 h-4" />
                                                                Xem trang khóa học
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild>
                                                            <Link to={`/admin/courses/${course.id}`} className="flex items-center gap-2">
                                                                <Edit className="w-4 h-4" />
                                                                Sửa thông tin
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild>
                                                            <Link to={`/admin/courses/${course.id}/content`} className="flex items-center gap-2">
                                                                <FileEdit className="w-4 h-4" />
                                                                Quản lý nội dung
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={() => togglePublish(course.id, course.published)}
                                                        >
                                                            {course.published ? 'Ẩn khóa học' : 'Xuất bản'}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <DropdownMenuItem
                                                                    className="text-destructive focus:text-destructive"
                                                                    onSelect={(e) => e.preventDefault()}
                                                                >
                                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                                    Xóa khóa học
                                                                </DropdownMenuItem>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Xác nhận xóa?</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        Bạn sắp xóa khóa học "{course.title}".
                                                                        Hành động này không thể hoàn tác và sẽ xóa tất cả modules, lessons liên quan.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Hủy</AlertDialogCancel>
                                                                    <AlertDialogAction
                                                                        onClick={() => handleDelete(course.id)}
                                                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                                    >
                                                                        Xóa
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    );
};

export default CourseManagement;
