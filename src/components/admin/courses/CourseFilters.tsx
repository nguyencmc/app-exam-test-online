import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Search } from 'lucide-react';
// import {
//     Select,
//     SelectContent,
//     SelectItem,
//     SelectTrigger,
//     SelectValue,
// } from "@/components/ui/select";

interface CourseFiltersProps {
    searchQuery: string;
    onSearchChange: (value: string) => void;
    // levelFilter: string;
    // onLevelFilterChange: (value: string) => void;
    // statusFilter: string;
    // onStatusFilterChange: (value: string) => void;
}

export const CourseFilters = ({
    searchQuery,
    onSearchChange,
    // levelFilter,
    // onLevelFilterChange,
    // statusFilter,
    // onStatusFilterChange,
}: CourseFiltersProps) => {
    return (
        <Card className="mb-6">
            <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Tìm kiếm khóa học..."
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    {/* 
                     // TODO: Uncomment when 'level' and 'is_published' columns are confirmed or added to DB
                    <Select value={levelFilter} onValueChange={onLevelFilterChange}>
                        <SelectTrigger className="w-full md:w-40">
                            <SelectValue placeholder="Cấp độ" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả cấp độ</SelectItem>
                            <SelectItem value="beginner">Cơ bản</SelectItem>
                            <SelectItem value="intermediate">Trung cấp</SelectItem>
                            <SelectItem value="advanced">Nâng cao</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={statusFilter} onValueChange={onStatusFilterChange}>
                        <SelectTrigger className="w-full md:w-40">
                            <SelectValue placeholder="Trạng thái" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả</SelectItem>
                            <SelectItem value="published">Đã xuất bản</SelectItem>
                            <SelectItem value="draft">Bản nháp</SelectItem>
                        </SelectContent>
                    </Select> 
                    */}
                </div>
            </CardContent>
        </Card>
    );
};
