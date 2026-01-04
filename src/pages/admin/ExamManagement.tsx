import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  Plus,
  Search,
  Edit,
  Trash2,
  ArrowLeft,
  Users,
  HelpCircle,
  Eye,
  Copy,
  Clock,
  TrendingUp,
  Filter,
  LayoutGrid,
  List,
  MoreVertical,
  Sparkles,
  CheckSquare,
  Printer
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { PrintExamDialog } from '@/components/admin/PrintExamDialog';

interface Exam {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  question_count: number | null;
  attempt_count: number | null;
  difficulty: string | null;
  duration_minutes: number | null;
  created_at: string;
  category_id: string | null;
}

interface ExamCategory {
  id: string;
  name: string;
  slug: string;
}

const ExamManagement = () => {
  const { isAdmin, isTeacher, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [exams, setExams] = useState<Exam[]>([]);
  const [categories, setCategories] = useState<ExamCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [selectedExams, setSelectedExams] = useState<string[]>([]);
  const [showBulkDelete, setShowBulkDelete] = useState(false);

  const hasAccess = isAdmin || isTeacher;

  useEffect(() => {
    if (!roleLoading && !hasAccess) {
      navigate('/');
      toast({
        title: "Không có quyền truy cập",
        description: "Bạn cần quyền Teacher hoặc Admin",
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

    const [{ data: examsData }, { data: categoriesData }] = await Promise.all([
      supabase.from('exams').select('*').order('created_at', { ascending: false }),
      supabase.from('exam_categories').select('id, name, slug'),
    ]);

    setExams(examsData || []);
    setCategories(categoriesData || []);
    setLoading(false);
  };

  const handleDelete = async (examId: string) => {
    const { error: questionsError } = await supabase
      .from('questions')
      .delete()
      .eq('exam_id', examId);

    if (questionsError) {
      toast({
        title: "Lỗi",
        description: "Không thể xóa câu hỏi của đề thi",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from('exams')
      .delete()
      .eq('id', examId);

    if (error) {
      toast({
        title: "Lỗi",
        description: "Không thể xóa đề thi",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Thành công",
      description: "Đã xóa đề thi",
    });

    fetchData();
  };

  const handleBulkDelete = async () => {
    for (const examId of selectedExams) {
      await supabase.from('questions').delete().eq('exam_id', examId);
      await supabase.from('exams').delete().eq('id', examId);
    }

    toast({
      title: "Thành công",
      description: `Đã xóa ${selectedExams.length} đề thi`,
    });

    setSelectedExams([]);
    setShowBulkDelete(false);
    fetchData();
  };

  const handleCopyExam = async (exam: Exam) => {
    // Create a copy of the exam
    const { data: newExam, error } = await supabase
      .from('exams')
      .insert({
        title: `${exam.title} (Bản sao)`,
        slug: `${exam.slug}-copy-${Date.now()}`,
        description: exam.description,
        difficulty: exam.difficulty,
        duration_minutes: exam.duration_minutes,
        category_id: exam.category_id,
        question_count: 0,
        attempt_count: 0,
      })
      .select()
      .single();

    if (error || !newExam) {
      toast({
        title: "Lỗi",
        description: "Không thể sao chép đề thi",
        variant: "destructive",
      });
      return;
    }

    // Copy questions
    const { data: questions } = await supabase
      .from('questions')
      .select('*')
      .eq('exam_id', exam.id);

    if (questions && questions.length > 0) {
      const newQuestions = questions.map(q => ({
        exam_id: newExam.id,
        question_text: q.question_text,
        question_type: q.question_type,
        options: q.options,
        correct_answer: q.correct_answer,
        explanation: q.explanation,
        points: q.points,
        order_index: q.order_index,
      }));

      await supabase.from('questions').insert(newQuestions);

      // Update question count
      await supabase
        .from('exams')
        .update({ question_count: questions.length })
        .eq('id', newExam.id);
    }

    toast({
      title: "Thành công",
      description: "Đã sao chép đề thi",
    });

    fetchData();
  };

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

  const filteredExams = exams.filter(exam => {
    const matchesSearch = exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exam.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || exam.category_id === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || exam.difficulty === selectedDifficulty;
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  // Stats calculations
  const totalQuestions = exams.reduce((sum, exam) => sum + (exam.question_count || 0), 0);
  const totalAttempts = exams.reduce((sum, exam) => sum + (exam.attempt_count || 0), 0);
  const avgDuration = exams.length > 0
    ? Math.round(exams.reduce((sum, exam) => sum + (exam.duration_minutes || 60), 0) / exams.length)
    : 0;

  const toggleSelectExam = (examId: string) => {
    setSelectedExams(prev =>
      prev.includes(examId)
        ? prev.filter(id => id !== examId)
        : [...prev, examId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedExams.length === filteredExams.length) {
      setSelectedExams([]);
    } else {
      setSelectedExams(filteredExams.map(e => e.id));
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
        {/* Header with Gradient */}
        <div className="relative mb-8 p-6 rounded-2xl bg-gradient-to-r from-primary/10 via-accent/10 to-primary/5 border border-primary/20 overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link to={isAdmin ? "/admin" : "/teacher"}>
                <Button variant="ghost" size="icon" className="shrink-0">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-primary/10">
                    <FileText className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                  </div>
                  Quản lý đề thi
                </h1>
                <p className="text-muted-foreground mt-1 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Tạo và quản lý các bài kiểm tra
                </p>
              </div>
            </div>
            <Link to="/admin/exams/create-v2">
              <Button className="gap-2 shadow-lg bg-gradient-to-r from-primary to-accent hover:opacity-90 w-full md:w-auto">
                <Plus className="w-4 h-4" />
                Tạo đề thi mới
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
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

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm đề thi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[160px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Danh mục" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả danh mục</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger className="w-[140px]">
                <TrendingUp className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Độ khó" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả độ khó</SelectItem>
                <SelectItem value="easy">Dễ</SelectItem>
                <SelectItem value="medium">Trung bình</SelectItem>
                <SelectItem value="hard">Khó</SelectItem>
              </SelectContent>
            </Select>

            <div className="hidden md:flex border rounded-lg overflow-hidden">
              <Button
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('table')}
                className="rounded-none"
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'card' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('card')}
                className="rounded-none"
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedExams.length > 0 && (
          <div className="mb-4 p-3 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">
                Đã chọn {selectedExams.length} đề thi
              </span>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setSelectedExams([])}>
                Bỏ chọn
              </Button>
              <AlertDialog open={showBulkDelete} onOpenChange={setShowBulkDelete}>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="gap-1">
                    <Trash2 className="w-4 h-4" />
                    Xóa
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Xóa {selectedExams.length} đề thi?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Hành động này không thể hoàn tác. Tất cả câu hỏi trong các đề thi sẽ bị xóa.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Hủy</AlertDialogCancel>
                    <AlertDialogAction onClick={handleBulkDelete}>
                      Xóa tất cả
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        )}

        {/* Exams Content */}
        <Card className="border-border/50">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredExams.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                  <FileText className="w-10 h-10 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-lg mb-2">
                  {searchQuery || selectedCategory !== 'all' || selectedDifficulty !== 'all'
                    ? 'Không tìm thấy đề thi nào'
                    : 'Chưa có đề thi nào'}
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Bắt đầu tạo đề thi đầu tiên của bạn
                </p>
                <Link to="/admin/exams/create-v2">
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    Tạo đề thi đầu tiên
                  </Button>
                </Link>
              </div>
            ) : viewMode === 'table' ? (
              /* Table View */
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedExams.length === filteredExams.length && filteredExams.length > 0}
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
                    {filteredExams.map((exam) => {
                      const diffConfig = getDifficultyConfig(exam.difficulty);
                      return (
                        <TableRow key={exam.id} className={cn(
                          selectedExams.includes(exam.id) && "bg-primary/5"
                        )}>
                          <TableCell>
                            <Checkbox
                              checked={selectedExams.includes(exam.id)}
                              onCheckedChange={() => toggleSelectExam(exam.id)}
                            />
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{exam.title}</p>
                              {exam.description && (
                                <p className="text-sm text-muted-foreground line-clamp-1">
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
                            {new Date(exam.created_at).toLocaleDateString('vi-VN')}
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
                                <DropdownMenuItem onClick={() => handleCopyExam(exam)}>
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
                                      <AlertDialogAction onClick={() => handleDelete(exam.id)}>
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
            ) : null}

            {/* Card View (Mobile + Optional Desktop) */}
            <div className={cn(
              "grid gap-4 p-4",
              viewMode === 'card' ? 'md:grid-cols-2 lg:grid-cols-3' : 'md:hidden'
            )}>
              {filteredExams.map((exam) => {
                const diffConfig = getDifficultyConfig(exam.difficulty);
                return (
                  <Card
                    key={exam.id}
                    className={cn(
                      "border-border/50 hover:border-primary/30 transition-all hover:shadow-lg group",
                      selectedExams.includes(exam.id) && "border-primary bg-primary/5"
                    )}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={selectedExams.includes(exam.id)}
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
                                <DropdownMenuItem onClick={() => handleCopyExam(exam)}>
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
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={() => handleDelete(exam.id)}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Xóa
                                </DropdownMenuItem>
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
          </CardContent>
        </Card>

        {/* Results count */}
        {!loading && filteredExams.length > 0 && (
          <p className="text-sm text-muted-foreground mt-4 text-center">
            Hiển thị {filteredExams.length} / {exams.length} đề thi
          </p>
        )}
      </main>
    </div>
  );
};

export default ExamManagement;
