import { Card, CardContent } from "@/components/ui/card";
import { FileText, HelpCircle, Users, Clock } from "lucide-react";
import { Exam } from "@/types";

interface ExamStatsProps {
    exams: Exam[];
}

export const ExamStats = ({ exams }: ExamStatsProps) => {
    const totalQuestions = exams.reduce((sum, exam) => sum + (exam.question_count || 0), 0);
    const totalAttempts = exams.reduce((sum, exam) => sum + (exam.attempt_count || 0), 0);
    const avgDuration = exams.length > 0
        ? Math.round(exams.reduce((sum, exam) => sum + (exam.duration_minutes || 60), 0) / exams.length)
        : 0;

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="border-border/50 bg-gradient-to-br from-blue-500/5 to-blue-500/10">
                <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-500/10">
                            <FileText className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{exams.length}</p>
                            <p className="text-xs text-muted-foreground">Tổng đề thi</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-border/50 bg-gradient-to-br from-emerald-500/5 to-emerald-500/10">
                <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-emerald-500/10">
                            <HelpCircle className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{totalQuestions}</p>
                            <p className="text-xs text-muted-foreground">Câu hỏi</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-border/50 bg-gradient-to-br from-amber-500/5 to-amber-500/10">
                <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-amber-500/10">
                            <Users className="w-5 h-5 text-amber-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{totalAttempts.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">Lượt làm</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-border/50 bg-gradient-to-br from-purple-500/5 to-purple-500/10">
                <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-purple-500/10">
                            <Clock className="w-5 h-5 text-purple-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{avgDuration}</p>
                            <p className="text-xs text-muted-foreground">Phút TB</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
