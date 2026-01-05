import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { PrintExamDialog } from "@/components/admin/PrintExamDialog";
import {
    HelpCircle,
    Users,
    MoreVertical,
    Eye,
    Edit,
    Copy,
    Printer,
    Trash2
} from "lucide-react";
import { Link } from "react-router-dom";
import { Exam, ExamCategory } from "@/types";
import { cn } from "@/lib/utils";

interface ExamTableProps {
    exams: Exam[];
    selectedExams: string[];
    toggleSelectExam: (id: string) => void;
    toggleSelectAll: () => void;
    categories: ExamCategory[];
    onDelete: (id: string) => void;
    onDuplicate: (exam: Exam) => void;
}

export const ExamTable = ({
    exams,
    selectedExams,
    toggleSelectExam,
    toggleSelectAll,
    categories,
    onDelete,
    onDuplicate
}: ExamTableProps) => {

    const getCategoryName = (categoryId: string | null) => {
        if (!categoryId) return 'Chưa phân loại';
        const category = categories.find(c => c.id === categoryId);
        return category?.name || 'Không xác định';
    };

    const getDifficultyConfig = (difficulty: string | null) => {
        switch (difficulty) {
            case 'easy':
                return { label: 'Dễ', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' };
            case 'hard':
                return { label: 'Khó', color: 'bg-red-500/10 text-red-600 border-red-500/20' };
            default:
                return { label: 'Trung bình', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20' };
        }
    };

    return (
        <div className="hidden md:block overflow-x-auto rounded-md border border-border/50">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-12">
                            <Checkbox
                                checked={selectedExams.length === exams.length && exams.length > 0}
                                onCheckedChange={toggleSelectAll}
                            />
                        </TableHead>
                        <TableHead>Tên đề thi</TableHead>
                        <TableHead>Danh mục</TableHead>
                        <TableHead>Độ khó</TableHead>
                        <TableHead>Thời gian</TableHead>
                        <TableHead>Câu hỏi</TableHead>
                        <TableHead>Lượt làm</TableHead>
                        <TableHead>Ngày tạo</TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {exams.map((exam) => {
                        const diffConfig = getDifficultyConfig(exam.difficulty);
                        const isSelected = selectedExams.includes(exam.id);

                        return (
                            <TableRow key={exam.id} className={cn(isSelected && "bg-primary/5")}>
                                <TableCell>
                                    <Checkbox
                                        checked={isSelected}
                                        onCheckedChange={() => toggleSelectExam(exam.id)}
                                    />
                                </TableCell>
                                <TableCell>
                                    <div>
                                        <p className="font-medium text-foreground">{exam.title}</p>
                                        {exam.description && (
                                            <p className="text-sm text-muted-foreground line-clamp-1 max-w-[200px]">
                                                {exam.description}
                                            </p>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline">{getCategoryName(exam.category_id)}</Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge className={cn("border", diffConfig.color)}>
                                        {diffConfig.label}
                                    </Badge>
                                </TableCell>
                                <TableCell>{exam.duration_minutes || 60} phút</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1">
                                        <HelpCircle className="w-4 h-4 text-muted-foreground" />
                                        {exam.question_count || 0}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1">
                                        <Users className="w-4 h-4 text-muted-foreground" />
                                        {exam.attempt_count || 0}
                                    </div>
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                    {new Date(exam.created_at).toLocaleDateString("vi-VN")}
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <MoreVertical className="w-4 h-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem asChild>
                                                <Link to={`/exam/${exam.slug}`} className="flex items-center">
                                                    <Eye className="w-4 h-4 mr-2" />
                                                    Xem trước
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild>
                                                <Link to={`/admin/exams/v2/${exam.id}`} className="flex items-center">
                                                    <Edit className="w-4 h-4 mr-2" />
                                                    Chỉnh sửa
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => onDuplicate(exam)}>
                                                <Copy className="w-4 h-4 mr-2" />
                                                Sao chép
                                            </DropdownMenuItem>
                                            <PrintExamDialog
                                                exam={exam}
                                                trigger={
                                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                                        <Printer className="w-4 h-4 mr-2" />
                                                        In đề thi
                                                    </DropdownMenuItem>
                                                }
                                            />
                                            <DropdownMenuSeparator />
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <DropdownMenuItem
                                                        className="text-destructive focus:text-destructive"
                                                        onSelect={(e) => e.preventDefault()}
                                                    >
                                                        <Trash2 className="w-4 h-4 mr-2" />
                                                        Xóa
                                                    </DropdownMenuItem>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Xóa đề thi?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Hành động này không thể hoàn tác. Tất cả câu hỏi trong đề thi sẽ bị xóa.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => onDelete(exam.id)}>
                                                            Xóa
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
};
