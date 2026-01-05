import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ExamSubmitDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    answeredCount: number;
    totalQuestions: number;
    onSubmit: () => void;
}

export const ExamSubmitDialog = ({
    open,
    onOpenChange,
    answeredCount,
    totalQuestions,
    onSubmit,
}: ExamSubmitDialogProps) => {
    const unansweredCount = totalQuestions - answeredCount;

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Xác nhận nộp bài?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Bạn đã trả lời {answeredCount}/{totalQuestions} câu hỏi.
                        {unansweredCount > 0 && (
                            <span className="block mt-2 text-yellow-500">
                                Còn {unansweredCount} câu chưa trả lời!
                            </span>
                        )}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Tiếp tục làm bài</AlertDialogCancel>
                    <AlertDialogAction onClick={onSubmit}>Nộp bài</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};
