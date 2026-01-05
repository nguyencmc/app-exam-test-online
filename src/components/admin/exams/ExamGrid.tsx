import { Card, CardContent } from "@/components/ui/card";
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
    Clock,
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

interface ExamGridProps {
    exams: Exam[];
    selectedExams: string[];
    toggleSelectExam: (id: string) => void;
    categories: ExamCategory[];
    onDelete: (id: string) => void;
    onDuplicate: (exam: Exam) => void;
    viewMode: 'table' | 'card';
}

export const ExamGrid = ({
    exams,
    selectedExams,
    toggleSelectExam,
    categories,
    onDelete,
    onDuplicate,
    viewMode
}: ExamGridProps) => {

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
        <div className={cn(
            "grid gap-4",
            viewMode === 'card' ? 'md:grid-cols-2 lg:grid-cols-3' : 'md:hidden'
        )}>
            {exams.map((exam) => {
                const diffConfig = getDifficultyConfig(exam.difficulty);
                const isSelected = selectedExams.includes(exam.id);

                return (
                    <Card
                        key={exam.id}
                        className={cn(
                            "border-border/50 hover:border-primary/30 transition-all hover:shadow-lg group",
                            isSelected && "border-primary bg-primary/5"
                        )}
                    >
                        <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                                <Checkbox
                                    checked={isSelected}
                                    onCheckedChange={() => toggleSelectExam(exam.id)}
                                    className="mt-1"
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold truncate">{exam.title}</h3>
                                            {exam.description && (
                                                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                                    {exam.description}
                                                </p>
                                            )}
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
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
                                    </div>

                                    <div className="flex flex-wrap gap-2 mt-3">
                                        <Badge variant="outline" className="text-xs">
                                            {getCategoryName(exam.category_id)}
                                        </Badge>
                                        <Badge className={cn("text-xs border", diffConfig.color)}>
                                            {diffConfig.label}
                                        </Badge>
                                    </div>

                                    <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-4 h-4" />
                                            {exam.duration_minutes || 60}p
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <HelpCircle className="w-4 h-4" />
                                            {exam.question_count || 0} câu
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Users className="w-4 h-4" />
                                            {exam.attempt_count || 0}
                                        </div>
                                    </div>

                                    <div className="flex gap-2 mt-4">
                                        <Link to={`/admin/exams/v2/${exam.id}`} className="flex-1">
                                            <Button variant="outline" size="sm" className="w-full gap-1">
                                                <Edit className="w-3 h-3" />
                                                Sửa
                                            </Button>
                                        </Link>
                                        <Link to={`/exam/${exam.slug}`}>
                                            <Button variant="ghost" size="sm" className="gap-1">
                                                <Eye className="w-3 h-3" />
                                                Xem
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
};
