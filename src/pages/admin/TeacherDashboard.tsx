import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Headphones, 
  Layers,
  GraduationCap,
  ChevronRight,
  Plus,
  BookOpen,
  TrendingUp
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Stats {
  totalExams: number;
  totalQuestions: number;
  totalFlashcardSets: number;
  totalPodcasts: number;
}

interface RecentExam {
  id: string;
  title: string;
  slug: string;
  question_count: number | null;
  attempt_count: number | null;
  created_at: string;
}

const TeacherDashboard = () => {
  const { user } = useAuth();
  const { isAdmin, isTeacher, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [stats, setStats] = useState<Stats>({
    totalExams: 0,
    totalQuestions: 0,
    totalFlashcardSets: 0,
    totalPodcasts: 0,
  });
  const [recentExams, setRecentExams] = useState<RecentExam[]>([]);
  const [loading, setLoading] = useState(true);

  const hasAccess = isAdmin || isTeacher;

  useEffect(() => {
    if (!roleLoading && !hasAccess) {
      navigate('/');
      toast({
        title: "Không có quyền truy cập",
        description: "Bạn cần quyền Teacher hoặc Admin để truy cập trang này",
        variant: "destructive",
      });
    }
  }, [hasAccess, roleLoading, navigate, toast]);

  useEffect(() => {
    if (hasAccess) {
      fetchData();
    }
  }, [hasAccess]);

  const fetchData = async () => {
    setLoading(true);
    
    const [
      { count: examsCount },
      { count: questionsCount },
      { count: flashcardsCount },
      { count: podcastsCount },
      { data: exams },
    ] = await Promise.all([
      supabase.from('exams').select('*', { count: 'exact', head: true }),
      supabase.from('questions').select('*', { count: 'exact', head: true }),
      supabase.from('flashcard_sets').select('*', { count: 'exact', head: true }),
      supabase.from('podcasts').select('*', { count: 'exact', head: true }),
      supabase.from('exams').select('*').order('created_at', { ascending: false }).limit(5),
    ]);

    setStats({
      totalExams: examsCount || 0,
      totalQuestions: questionsCount || 0,
      totalFlashcardSets: flashcardsCount || 0,
      totalPodcasts: podcastsCount || 0,
    });

    setRecentExams(exams || []);
    setLoading(false);
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

  const statCards = [
    { title: 'Đề thi', value: stats.totalExams, icon: FileText, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { title: 'Câu hỏi', value: stats.totalQuestions, icon: BookOpen, color: 'text-green-500', bg: 'bg-green-500/10' },
    { title: 'Flashcard Sets', value: stats.totalFlashcardSets, icon: Layers, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { title: 'Podcasts', value: stats.totalPodcasts, icon: Headphones, color: 'text-pink-500', bg: 'bg-pink-500/10' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <GraduationCap className="w-8 h-8 text-primary" />
              Teacher Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">Tạo và quản lý nội dung học tập</p>
          </div>
          {isAdmin && (
            <Link to="/admin">
              <Button variant="outline" className="gap-2">
                Chuyển sang Admin
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat) => (
            <Card key={stat.title} className="border-border/50">
              <CardContent className="p-4">
                <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <p className="text-2xl font-bold text-foreground">{stat.value.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <h2 className="text-xl font-semibold mb-4">Tạo nội dung mới</h2>
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Link to="/admin/exams/create">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow border-border/50 group h-full">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Plus className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">Tạo đề thi</h3>
                  <p className="text-sm text-muted-foreground">Thêm đề thi và câu hỏi mới</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
          
          <Link to="/admin/flashcards/create">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow border-border/50 group h-full">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center group-hover:bg-orange-500/20 transition-colors">
                  <Layers className="w-6 h-6 text-orange-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">Tạo Flashcard</h3>
                  <p className="text-sm text-muted-foreground">Thêm bộ thẻ ghi nhớ</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
          
          <Link to="/admin/podcasts/create">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow border-border/50 group h-full">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center group-hover:bg-pink-500/20 transition-colors">
                  <Headphones className="w-6 h-6 text-pink-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">Tạo Podcast</h3>
                  <p className="text-sm text-muted-foreground">Thêm bài nghe mới</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Management Links */}
        <h2 className="text-xl font-semibold mb-4">Quản lý nội dung</h2>
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Link to="/admin/exams">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow border-border/50 group h-full">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-purple-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">Quản lý đề thi</h3>
                  <p className="text-sm text-muted-foreground">{stats.totalExams} đề thi</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
          
          <Link to="/admin/flashcards">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow border-border/50 group h-full">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                  <Layers className="w-6 h-6 text-orange-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">Quản lý Flashcard</h3>
                  <p className="text-sm text-muted-foreground">{stats.totalFlashcardSets} bộ thẻ</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
          
          <Link to="/admin/podcasts">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow border-border/50 group h-full">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center">
                  <Headphones className="w-6 h-6 text-pink-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">Quản lý Podcast</h3>
                  <p className="text-sm text-muted-foreground">{stats.totalPodcasts} podcast</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Recent Exams */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Đề thi gần đây
            </CardTitle>
            <CardDescription>
              Các đề thi mới được tạo gần đây
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : recentExams.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Chưa có đề thi nào</p>
                <Link to="/admin/exams/create">
                  <Button className="mt-4" variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Tạo đề thi đầu tiên
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentExams.map((exam) => (
                  <Link 
                    key={exam.id} 
                    to={`/admin/exams/${exam.id}`}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div>
                      <h4 className="font-medium text-foreground">{exam.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {exam.question_count || 0} câu hỏi • {exam.attempt_count || 0} lượt làm
                      </p>
                    </div>
                    <Badge variant="outline">
                      {new Date(exam.created_at).toLocaleDateString('vi-VN')}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default TeacherDashboard;
