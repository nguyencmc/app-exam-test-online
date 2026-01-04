import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  ArrowLeft, 
  Clock, 
  FileText, 
  Users, 
  TrendingUp,
  Star,
  ChevronRight,
  Filter
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const ExamCategoryDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [difficultyFilter, setDifficultyFilter] = useState('all');

  // Fetch category details
  const { data: category, isLoading: categoryLoading } = useQuery({
    queryKey: ['exam-category', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exam_categories')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch exams in this category
  const { data: exams, isLoading: examsLoading } = useQuery({
    queryKey: ['exams', category?.id, searchTerm, sortBy, difficultyFilter],
    queryFn: async () => {
      if (!category?.id) return [];
      
      let query = supabase
        .from('exams')
        .select('*')
        .eq('category_id', category.id);
      
      if (searchTerm) {
        query = query.ilike('title', `%${searchTerm}%`);
      }
      
      if (difficultyFilter !== 'all') {
        query = query.eq('difficulty', difficultyFilter);
      }
      
      switch (sortBy) {
        case 'popular':
          query = query.order('attempt_count', { ascending: false });
          break;
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'questions':
          query = query.order('question_count', { ascending: false });
          break;
        case 'pass_rate':
          query = query.order('pass_rate', { ascending: false });
          break;
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!category?.id,
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'hard':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'Dễ';
      case 'medium':
        return 'Trung bình';
      case 'hard':
        return 'Khó';
      default:
        return difficulty;
    }
  };

  const formatNumber = (num: number | null) => {
    if (!num) return '0';
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  if (categoryLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Không tìm thấy danh mục</h1>
          <Link to="/exams">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại danh sách
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Breadcrumb & Header */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-accent/10 py-12">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link to="/" className="hover:text-primary transition-colors">Trang chủ</Link>
            <ChevronRight className="w-4 h-4" />
            <Link to="/exams" className="hover:text-primary transition-colors">Đề thi</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground">{category.name}</span>
          </div>

          {/* Category Header */}
          <div className="flex items-start gap-6">
            {category.icon_url && (
              <img 
                src={category.icon_url} 
                alt={category.name}
                className="w-20 h-20 rounded-2xl object-cover"
              />
            )}
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                {category.name}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <FileText className="w-4 h-4" />
                  <span>{category.exam_count || 0} đề thi</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  <span>{formatNumber(category.attempt_count)} lượt thi</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span>{category.rating?.toFixed(1) || '5.0'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters & Search */}
      <section className="py-6 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                type="text"
                placeholder="Tìm kiếm đề thi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-muted/50 border-border"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                <SelectTrigger className="w-[140px] bg-muted/50">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Độ khó" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="easy">Dễ</SelectItem>
                  <SelectItem value="medium">Trung bình</SelectItem>
                  <SelectItem value="hard">Khó</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[160px] bg-muted/50">
                  <SelectValue placeholder="Sắp xếp" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">Phổ biến nhất</SelectItem>
                  <SelectItem value="newest">Mới nhất</SelectItem>
                  <SelectItem value="questions">Số câu hỏi</SelectItem>
                  <SelectItem value="pass_rate">Tỷ lệ đậu</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Exams Grid */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          {examsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-card rounded-xl p-6 animate-pulse">
                  <div className="h-6 bg-muted rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-muted rounded w-full mb-2"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : exams && exams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {exams.map((exam) => (
                <Link 
                  key={exam.id} 
                  to={`/exam/${exam.slug}`}
                  className="group"
                >
                  <div className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                          {exam.title}
                        </h3>
                      </div>
                      {exam.is_featured && (
                        <Badge className="bg-primary/20 text-primary border-primary/30 ml-2">
                          Nổi bật
                        </Badge>
                      )}
                    </div>

                    {/* Description */}
                    {exam.description && (
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                        {exam.description}
                      </p>
                    )}

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <FileText className="w-4 h-4" />
                        <span>{exam.question_count} câu hỏi</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{exam.duration_minutes} phút</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="w-4 h-4" />
                        <span>{formatNumber(exam.attempt_count)} lượt thi</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <TrendingUp className="w-4 h-4" />
                        <span>{exam.pass_rate?.toFixed(1)}% đậu</span>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <Badge 
                        variant="outline" 
                        className={getDifficultyColor(exam.difficulty || 'medium')}
                      >
                        {getDifficultyLabel(exam.difficulty || 'medium')}
                      </Badge>
                      <Button 
                        size="sm" 
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Làm bài
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Không tìm thấy đề thi
              </h3>
              <p className="text-muted-foreground">
                {searchTerm || difficultyFilter !== 'all' 
                  ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
                  : 'Danh mục này chưa có đề thi nào'}
              </p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ExamCategoryDetail;
