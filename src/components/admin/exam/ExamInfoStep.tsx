import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, Clock, BarChart3, FolderOpen, Hash, Sparkles, Info } from 'lucide-react';

interface ExamCategory {
  id: string;
  name: string;
}

interface ExamInfoStepProps {
  title: string;
  slug: string;
  description: string;
  categoryId: string;
  difficulty: string;
  durationMinutes: number;
  questionCount?: number;
  categories: ExamCategory[];
  isEditing: boolean;
  onTitleChange: (value: string) => void;
  onSlugChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onDifficultyChange: (value: string) => void;
  onDurationChange: (value: number) => void;
  onQuestionCountChange?: (value: number) => void;
}

export const ExamInfoStep = ({
  title,
  slug,
  description,
  categoryId,
  difficulty,
  durationMinutes,
  questionCount = 0,
  categories,
  isEditing,
  onTitleChange,
  onSlugChange,
  onDescriptionChange,
  onCategoryChange,
  onDifficultyChange,
  onDurationChange,
  onQuestionCountChange,
}: ExamInfoStepProps) => {
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (value: string) => {
    onTitleChange(value);
    if (!isEditing) {
      onSlugChange(generateSlug(value));
    }
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'easy': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30';
      case 'medium': return 'bg-amber-500/10 text-amber-600 border-amber-500/30';
      case 'hard': return 'bg-red-500/10 text-red-600 border-red-500/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header Card */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg mb-4">
          <FileText className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Thông tin đề thi</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Nhập các thông tin cơ bản về đề thi của bạn. Các trường có dấu (*) là bắt buộc.
        </p>
      </div>

      {/* Main Info Card */}
      <Card className="border-border/50 shadow-md overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 border-b border-border/50">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Thông tin cơ bản
          </CardTitle>
          <CardDescription>
            Tiêu đề và mô tả cho đề thi
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="flex items-center gap-2 text-sm font-medium">
              <FileText className="w-4 h-4 text-primary" />
              Tiêu đề đề thi <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="VD: Đề thi Toán lớp 12 - Chương 1 Hàm số"
              className="h-12 text-base border-border/50 focus:border-primary transition-colors"
            />
            <p className="text-xs text-muted-foreground">
              Đặt tên ngắn gọn, dễ hiểu cho đề thi của bạn
            </p>
          </div>

          {/* Slug */}
          <div className="space-y-2">
            <Label htmlFor="slug" className="flex items-center gap-2 text-sm font-medium">
              Đường dẫn (slug) <span className="text-destructive">*</span>
            </Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground bg-muted px-3 py-2.5 rounded-l-md border border-r-0 border-border/50">
                /exams/
              </span>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => onSlugChange(e.target.value)}
                placeholder="de-thi-toan-lop-12"
                className="h-11 font-mono text-sm border-border/50 rounded-l-none flex-1"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="flex items-center gap-2 text-sm font-medium">
              <Info className="w-4 h-4 text-primary" />
              Mô tả
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder="Mô tả ngắn về nội dung, mục đích và đối tượng của đề thi..."
              rows={4}
              className="resize-none border-border/50 focus:border-primary transition-colors"
            />
          </div>
        </CardContent>
      </Card>

      {/* Settings Card */}
      <Card className="border-border/50 shadow-md overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-accent/5 to-primary/5 border-b border-border/50">
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-accent" />
            Cấu hình đề thi
          </CardTitle>
          <CardDescription>
            Thiết lập danh mục, độ khó và thời gian
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Category */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <FolderOpen className="w-4 h-4 text-primary" />
                Danh mục
              </Label>
              <Select value={categoryId} onValueChange={onCategoryChange}>
                <SelectTrigger className="h-12 border-border/50">
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Difficulty */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <BarChart3 className="w-4 h-4 text-primary" />
                Độ khó
              </Label>
              <Select value={difficulty} onValueChange={onDifficultyChange}>
                <SelectTrigger className="h-12 border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      Dễ
                    </span>
                  </SelectItem>
                  <SelectItem value="medium">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                      Trung bình
                    </span>
                  </SelectItem>
                  <SelectItem value="hard">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500"></span>
                      Khó
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Duration */}
            <div className="space-y-3">
              <Label htmlFor="duration" className="flex items-center gap-2 text-sm font-medium">
                <Clock className="w-4 h-4 text-primary" />
                Thời gian làm bài
              </Label>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Input
                    id="duration"
                    type="number"
                    value={durationMinutes}
                    onChange={(e) => onDurationChange(parseInt(e.target.value) || 60)}
                    min={1}
                    max={300}
                    className="w-24 h-12 text-center text-lg font-semibold border-border/50"
                  />
                  <span className="text-muted-foreground">phút</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[15, 30, 45, 60, 90, 120, 180].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => onDurationChange(mins)}
                      className={`px-3 py-1.5 text-sm rounded-full border transition-all duration-200 ${durationMinutes === mins
                          ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                          : 'bg-muted/50 hover:bg-muted border-border/50 hover:border-primary/30'
                        }`}
                    >
                      {mins >= 60 ? `${mins / 60}h${mins % 60 ? mins % 60 : ''}` : `${mins}p`}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Question Count */}
            <div className="space-y-3">
              <Label htmlFor="questionCount" className="flex items-center gap-2 text-sm font-medium">
                <Hash className="w-4 h-4 text-primary" />
                Số lượng câu hỏi (dự kiến)
              </Label>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Input
                    id="questionCount"
                    type="number"
                    value={questionCount}
                    onChange={(e) => onQuestionCountChange?.(parseInt(e.target.value) || 0)}
                    min={0}
                    max={500}
                    className="w-24 h-12 text-center text-lg font-semibold border-border/50"
                  />
                  <span className="text-muted-foreground">câu</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[10, 20, 30, 40, 50, 100].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => onQuestionCountChange?.(count)}
                      className={`px-3 py-1.5 text-sm rounded-full border transition-all duration-200 ${questionCount === count
                          ? 'bg-accent text-accent-foreground border-accent shadow-sm'
                          : 'bg-muted/50 hover:bg-muted border-border/50 hover:border-accent/30'
                        }`}
                    >
                      {count} câu
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview Card */}
      {title && (
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Xem trước
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-background rounded-lg p-4 border border-border/50">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg text-foreground truncate">{title}</h3>
                  {description && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{description}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    {categoryId && (
                      <Badge variant="secondary" className="text-xs">
                        {categories.find(c => c.id === categoryId)?.name}
                      </Badge>
                    )}
                    <Badge className={`text-xs border ${getDifficultyColor(difficulty)}`}>
                      {difficulty === 'easy' ? 'Dễ' : difficulty === 'medium' ? 'Trung bình' : 'Khó'}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      {durationMinutes} phút
                    </Badge>
                    {questionCount > 0 && (
                      <Badge variant="outline" className="text-xs">
                        <Hash className="w-3 h-3 mr-1" />
                        {questionCount} câu
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
