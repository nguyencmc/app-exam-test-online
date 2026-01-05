import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Search,
    Filter,
    TrendingUp,
    LayoutGrid,
    List,
    Trash2,
    CheckSquare
} from "lucide-react";
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
import { ExamCategory } from "@/types";

interface ExamFiltersProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    selectedCategory: string;
    setSelectedCategory: (category: string) => void;
    selectedDifficulty: string;
    setSelectedDifficulty: (difficulty: string) => void;
    categories: ExamCategory[];
    viewMode: 'table' | 'card';
    setViewMode: (mode: 'table' | 'card') => void;
    selectedExams: string[];
    clearSelection: () => void;
    onBulkDelete: () => void;
}

export const ExamFilters = ({
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedDifficulty,
    setSelectedDifficulty,
    categories,
    viewMode,
    setViewMode,
    selectedExams,
    clearSelection,
    onBulkDelete,
}: ExamFiltersProps) => {
    return (
        <>
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
                        <Button variant="ghost" size="sm" onClick={clearSelection}>
                            Bỏ chọn
                        </Button>
                        <AlertDialog>
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
                                    <AlertDialogAction onClick={onBulkDelete}>
                                        Xóa tất cả
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>
            )}
        </>
    );
};
