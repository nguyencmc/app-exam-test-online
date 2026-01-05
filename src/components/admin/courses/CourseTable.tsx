import { Link } from 'react-router-dom';
import { Course } from '@/types';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
    Video,
    MoreHorizontal,
    Eye,
    Edit,
    FileEdit,
    Trash2,
} from 'lucide-react';

interface CourseTableProps {
    courses: Course[];
    onDelete: (id: string) => void;
    // onTogglePublish: (id: string, status: boolean) => void;
}

export const CourseTable = ({ courses, onDelete }: CourseTableProps) => {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-[400px]">Khóa học</TableHead>
                    <TableHead>Danh mục</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {courses.map((course) => (
                    <TableRow key={course.id}>
                        <TableCell>
                            <div className="flex items-center gap-3">
                                <div className="w-16 h-10 rounded bg-muted overflow-hidden shrink-0">
                                    {course.image_url ? (
                                        <img
                                            src={course.image_url}
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
                                    <p className="text-xs text-muted-foreground truncate">
                                        {course.description || 'Chưa có mô tả'}
                                    </p>
                                </div>
                            </div>
                        </TableCell>
                        <TableCell>
                            <Badge variant="outline">{course.category || 'Chưa phân loại'}</Badge>
                        </TableCell>
                        <TableCell>
                            {/* Using is_official as a proxy for 'Featured/Official' status */}
                            <Badge
                                variant={course.is_official ? 'default' : 'secondary'}
                                className={course.is_official ? 'bg-blue-500' : ''}
                            >
                                {course.is_official ? 'Official' : 'Community'}
                            </Badge>
                        </TableCell>
                        <TableCell>
                            <span className="text-sm text-muted-foreground">
                                {new Date(course.created_at).toLocaleDateString('vi-VN')}
                            </span>
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
                                    {/* 
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => onTogglePublish(course.id, !!course.is_official)}>
                                        {course.is_official ? 'Hủy Official' : 'Set Official'}
                                    </DropdownMenuItem> 
                                    */}
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
                                                    onClick={() => onDelete(course.id)}
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
    );
};
