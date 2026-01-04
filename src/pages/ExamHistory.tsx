import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Clock,
  Trophy,
  Calendar,
  CheckCircle2,
  XCircle,
  ChevronRight,
  FileText,
  History,
  LogIn,
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface ExamAttempt {
  id: string;
  exam_id: string;
  score: number;
  total_questions: number;
  correct_answers: number;
  time_spent_seconds: number;
  completed_at: string;
  answers: Record<string, string>;
  exam?: {
    title: string;
    slug: string;
    difficulty: string;
  };
}

const ExamHistory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedAttempt, setSelectedAttempt] = useState<string | null>(null);

  const { data: attempts, isLoading } = useQuery({
    queryKey: ["exam-history", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("exam_attempts")
        .select(`
          *,
          exam:exams(title, slug, difficulty)
        `)
        .eq("user_id", user.id)
        .order("completed_at", { ascending: false });

      if (error) throw error;
      return data as ExamAttempt[];
    },
    enabled: !!user?.id,
  });

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins} phút ${secs} giây`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-green-500/10";
    if (score >= 60) return "bg-yellow-500/10";
    return "bg-red-500/10";
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "medium":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "hard":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "Dễ";
      case "medium":
        return "Trung bình";
      case "hard":
        return "Khó";
      default:
        return difficulty;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
              <LogIn className="w-10 h-10 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold mb-4">Đăng nhập để xem lịch sử</h1>
            <p className="text-muted-foreground mb-6">
              Bạn cần đăng nhập để xem lịch sử làm bài và theo dõi tiến độ học tập
            </p>
            <Link to="/auth">
              <Button size="lg">
                <LogIn className="w-4 h-4 mr-2" />
                Đăng nhập ngay
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Header Section */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-accent/10 py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <History className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Lịch sử làm bài</h1>
              <p className="text-muted-foreground">
                Xem lại các bài thi đã làm và theo dõi tiến độ
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <Skeleton className="w-16 h-16 rounded-xl" />
                      <div className="flex-1">
                        <Skeleton className="h-6 w-2/3 mb-2" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : attempts && attempts.length > 0 ? (
            <div className="space-y-4">
              {attempts.map((attempt) => (
                <Card
                  key={attempt.id}
                  className="hover:border-primary/50 transition-all cursor-pointer"
                  onClick={() =>
                    setSelectedAttempt(
                      selectedAttempt === attempt.id ? null : attempt.id
                    )
                  }
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      {/* Score Circle */}
                      <div
                        className={`w-16 h-16 rounded-xl flex items-center justify-center ${getScoreBgColor(
                          attempt.score
                        )}`}
                      >
                        <div className="text-center">
                          <div
                            className={`text-2xl font-bold ${getScoreColor(
                              attempt.score
                            )}`}
                          >
                            {attempt.score}%
                          </div>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-semibold text-lg truncate">
                              {attempt.exam?.title || "Đề thi không tồn tại"}
                            </h3>
                            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>
                                  {format(
                                    new Date(attempt.completed_at),
                                    "dd/MM/yyyy HH:mm",
                                    { locale: vi }
                                  )}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>{formatDuration(attempt.time_spent_seconds)}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                <span>{attempt.correct_answers}/{attempt.total_questions}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {attempt.exam?.difficulty && (
                              <Badge
                                variant="outline"
                                className={getDifficultyColor(attempt.exam.difficulty)}
                              >
                                {getDifficultyLabel(attempt.exam.difficulty)}
                              </Badge>
                            )}
                            <ChevronRight
                              className={`w-5 h-5 text-muted-foreground transition-transform ${
                                selectedAttempt === attempt.id ? "rotate-90" : ""
                              }`}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {selectedAttempt === attempt.id && (
                      <div className="mt-6 pt-6 border-t border-border">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="text-center p-3 bg-muted/50 rounded-lg">
                            <div className="text-2xl font-bold text-primary">
                              {attempt.score}%
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Điểm số
                            </div>
                          </div>
                          <div className="text-center p-3 bg-muted/50 rounded-lg">
                            <div className="text-2xl font-bold text-green-500">
                              {attempt.correct_answers}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Câu đúng
                            </div>
                          </div>
                          <div className="text-center p-3 bg-muted/50 rounded-lg">
                            <div className="text-2xl font-bold text-red-500">
                              {attempt.total_questions - attempt.correct_answers}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Câu sai
                            </div>
                          </div>
                          <div className="text-center p-3 bg-muted/50 rounded-lg">
                            <div className="text-2xl font-bold">
                              {Math.floor(attempt.time_spent_seconds / 60)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Phút
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <Button
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/history/${attempt.id}`);
                            }}
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            Xem chi tiết
                          </Button>
                          {attempt.exam?.slug && (
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/exam/${attempt.exam?.slug}/take`);
                              }}
                            >
                              <Trophy className="w-4 h-4 mr-2" />
                              Làm lại
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                <FileText className="w-10 h-10 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Chưa có lịch sử làm bài</h2>
              <p className="text-muted-foreground mb-6">
                Bắt đầu làm bài thi để theo dõi tiến độ học tập
              </p>
              <Link to="/exams">
                <Button>Khám phá đề thi</Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ExamHistory;
