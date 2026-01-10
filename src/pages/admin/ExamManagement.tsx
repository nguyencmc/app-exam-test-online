import { Link } from 'react-router-dom';
import { useUserRole } from '@/modules/auth';
import { Header } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Plus, ArrowLeft, Sparkles } from 'lucide-react';
import { ExamStats } from '@/components/admin/exams/ExamStats';
import { ExamFilters } from '@/components/admin/exams/ExamFilters';
import { ExamTable } from '@/components/admin/exams/ExamTable';
import { ExamGrid } from '@/components/admin/exams/ExamGrid';
import { useAdminExams } from '@/modules/exam';

const ExamManagement = () => {
  const { isAdmin, isTeacher, loading: roleLoading } = useUserRole();
  const {
    exams,
    allExams,
    categories,
    isLoading,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedDifficulty,
    setSelectedDifficulty,
    viewMode,
    setViewMode,
    selectedExams,
    toggleSelectExam,
    toggleSelectAll,
    handleDelete,
    handleDuplicate,
    handleBulkDelete
  } = useAdminExams();

  const hasAccess = isAdmin || isTeacher;

  if (roleLoading || isLoading) {
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
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Không có quyền truy cập</h1>
          <p className="text-muted-foreground">Bạn cần quyền Teacher hoặc Admin để truy cập trang này.</p>
        </div>
      </div>
    );
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

        <ExamStats exams={allExams} />

        <div className="space-y-6">
          <ExamFilters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedDifficulty={selectedDifficulty}
            setSelectedDifficulty={setSelectedDifficulty}
            categories={categories}
            viewMode={viewMode}
            setViewMode={setViewMode}
            selectedExams={selectedExams}
            clearSelection={() => toggleSelectAll([])}
            onBulkDelete={handleBulkDelete}
          />

          <Card className="border-border/50">
            <CardContent className="p-0">
              {exams.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                    <FileText className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    {searchQuery || selectedCategory !== "all" || selectedDifficulty !== "all"
                      ? "Không tìm thấy đề thi nào"
                      : "Chưa có đề thi nào"}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery || selectedCategory !== "all" || selectedDifficulty !== "all"
                      ? "Thử thay đổi bộ lọc tìm kiếm"
                      : "Bắt đầu tạo đề thi đầu tiên của bạn"}
                  </p>
                  <Link to="/admin/exams/create-v2">
                    <Button className="gap-2">
                      <Plus className="w-4 h-4" />
                      Tạo đề thi mới
                    </Button>
                  </Link>
                </div>
              ) : (
                <>
                  {viewMode === 'table' && (
                    <ExamTable
                      exams={exams}
                      selectedExams={selectedExams}
                      toggleSelectExam={toggleSelectExam}
                      toggleSelectAll={() => toggleSelectAll(exams.map(e => e.id))}
                      categories={categories}
                      onDelete={handleDelete}
                      onDuplicate={handleDuplicate}
                    />
                  )}
                  <ExamGrid
                    exams={exams}
                    selectedExams={selectedExams}
                    toggleSelectExam={toggleSelectExam}
                    categories={categories}
                    onDelete={handleDelete}
                    onDuplicate={handleDuplicate}
                    viewMode={viewMode}
                  />
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ExamManagement;
