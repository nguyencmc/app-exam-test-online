import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    BookOpen,
    Plus,
    Search,
    Edit,
    Trash2,
    ArrowLeft,
    Star,
    Eye,
    User,
    Sparkles,
    Upload
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { PdfImportDialog } from '@/components/admin/books/PdfImportDialog';

interface Book {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    author_name: string | null;
    cover_url: string | null;
    category_id: string | null;
    page_count: number | null;
    read_count: number | null;
    rating: number | null;
    difficulty: string | null;
    is_featured: boolean | null;
    created_at: string;
}

interface BookCategory {
    id: string;
    name: string;
}

const difficultyColors: Record<string, string> = {
    beginner: 'bg-green-500/10 text-green-600 border-green-500/20',
    intermediate: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
    advanced: 'bg-red-500/10 text-red-600 border-red-500/20',
};

const difficultyLabels: Record<string, string> = {
    beginner: 'Cơ bản',
    intermediate: 'Trung cấp',
    advanced: 'Nâng cao',
};

const BookManagement = () => {
    const { isAdmin, isTeacher, loading: roleLoading } = useUserRole();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [books, setBooks] = useState<Book[]>([]);
    const [categories, setCategories] = useState<BookCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [pdfDialogOpen, setPdfDialogOpen] = useState(false);

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

        const [{ data: booksData }, { data: categoriesData }] = await Promise.all([
            supabase.from('books').select('*').order('created_at', { ascending: false }),
            supabase.from('book_categories').select('id, name'),
        ]);

        setBooks(booksData || []);
        setCategories(categoriesData || []);
        setLoading(false);
    };

    const handleDelete = async (bookId: string) => {
        const { error } = await supabase
            .from('books')
            .delete()
            .eq('id', bookId);

        if (error) {
            toast({
                title: "Lỗi",
                description: "Không thể xóa sách: " + error.message,
                variant: "destructive",
            });
            return;
        }

        toast({
            title: "Thành công",
            description: "Đã xóa sách",
        });

        fetchData();
    };

    const toggleFeatured = async (bookId: string, currentFeatured: boolean | null) => {
        const { error } = await supabase
            .from('books')
            .update({ is_featured: !currentFeatured })
            .eq('id', bookId);

        if (error) {
            toast({
                title: "Lỗi",
                description: "Không thể cập nhật trạng thái nổi bật",
                variant: "destructive",
            });
            return;
        }

        toast({
            title: "Thành công",
            description: currentFeatured ? "Đã bỏ nổi bật" : "Đã đánh dấu nổi bật",
        });

        fetchData();
    };

    const getCategoryName = (categoryId: string | null) => {
        if (!categoryId) return 'Chưa phân loại';
        const category = categories.find(c => c.id === categoryId);
        return category?.name || 'Không xác định';
    };

    const filteredBooks = books.filter(book => {
        const matchesSearch =
            book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            book.author_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            book.description?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory = !selectedCategory || book.category_id === selectedCategory;

        return matchesSearch && matchesCategory;
    });

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
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Link to={isAdmin ? "/admin" : "/teacher"}>
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                                <BookOpen className="w-8 h-8 text-emerald-500" />
                                Quản lý Sách
                            </h1>
                            <p className="text-muted-foreground mt-1">{books.length} cuốn sách</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link to="/admin/book-categories">
                            <Button variant="outline" className="gap-2">
                                Quản lý danh mục
                            </Button>
                        </Link>
                        <Button
                            variant="outline"
                            className="gap-2"
                            onClick={() => setPdfDialogOpen(true)}
                        >
                            <Upload className="w-4 h-4" />
                            Import PDF
                        </Button>
                        <Link to="/admin/books/create">
                            <Button className="gap-2">
                                <Plus className="w-4 h-4" />
                                Thêm sách mới
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                            placeholder="Tìm kiếm sách, tác giả..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Select
                        value={selectedCategory || "all"}
                        onValueChange={(v) => setSelectedCategory(v === "all" ? null : v)}
                    >
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Tất cả danh mục" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả danh mục</SelectItem>
                            {categories.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id}>
                                    {cat.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <Card className="border-border/50">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-emerald-500/10">
                                    <BookOpen className="w-5 h-5 text-emerald-500" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{books.length}</p>
                                    <p className="text-sm text-muted-foreground">Tổng sách</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-border/50">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-amber-500/10">
                                    <Sparkles className="w-5 h-5 text-amber-500" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{books.filter(b => b.is_featured).length}</p>
                                    <p className="text-sm text-muted-foreground">Nổi bật</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-border/50">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-blue-500/10">
                                    <Eye className="w-5 h-5 text-blue-500" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">
                                        {books.reduce((sum, b) => sum + (b.read_count || 0), 0).toLocaleString()}
                                    </p>
                                    <p className="text-sm text-muted-foreground">Lượt đọc</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-border/50">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-purple-500/10">
                                    <Star className="w-5 h-5 text-purple-500" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">
                                        {books.length > 0
                                            ? (books.reduce((sum, b) => sum + (b.rating || 0), 0) / books.filter(b => b.rating).length || 0).toFixed(1)
                                            : '0'}
                                    </p>
                                    <p className="text-sm text-muted-foreground">Rating TB</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Books Table */}
                <Card className="border-border/50">
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="flex items-center justify-center h-64">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                        ) : filteredBooks.length === 0 ? (
                            <div className="text-center py-16">
                                <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                                <p className="text-muted-foreground text-lg mb-4">
                                    {searchQuery || selectedCategory ? 'Không tìm thấy sách nào' : 'Chưa có sách nào'}
                                </p>
                                <Link to="/admin/books/create">
                                    <Button>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Thêm sách đầu tiên
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[80px]">Ảnh bìa</TableHead>
                                        <TableHead>Tiêu đề</TableHead>
                                        <TableHead>Tác giả</TableHead>
                                        <TableHead>Danh mục</TableHead>
                                        <TableHead>Độ khó</TableHead>
                                        <TableHead>Rating</TableHead>
                                        <TableHead>Lượt đọc</TableHead>
                                        <TableHead>Trạng thái</TableHead>
                                        <TableHead className="text-right">Thao tác</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredBooks.map((book) => (
                                        <TableRow key={book.id}>
                                            <TableCell>
                                                <div className="w-12 h-16 rounded overflow-hidden bg-muted">
                                                    {book.cover_url ? (
                                                        <img
                                                            src={book.cover_url}
                                                            alt={book.title}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <BookOpen className="w-6 h-6 text-muted-foreground" />
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium line-clamp-1">{book.title}</p>
                                                    {book.description && (
                                                        <p className="text-sm text-muted-foreground line-clamp-1">
                                                            {book.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    <User className="w-4 h-4 text-muted-foreground" />
                                                    <span className="text-sm">{book.author_name || 'Chưa rõ'}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{getCategoryName(book.category_id)}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                {book.difficulty && (
                                                    <Badge
                                                        variant="outline"
                                                        className={difficultyColors[book.difficulty] || ''}
                                                    >
                                                        {difficultyLabels[book.difficulty] || book.difficulty}
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {book.rating && (
                                                    <div className="flex items-center gap-1">
                                                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                                        <span>{book.rating}</span>
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    <Eye className="w-4 h-4 text-muted-foreground" />
                                                    {book.read_count || 0}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => toggleFeatured(book.id, book.is_featured)}
                                                    className={book.is_featured ? 'text-amber-500' : 'text-muted-foreground'}
                                                >
                                                    <Sparkles className="w-4 h-4 mr-1" />
                                                    {book.is_featured ? 'Nổi bật' : 'Thường'}
                                                </Button>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link to={`/admin/books/${book.id}`}>
                                                        <Button variant="ghost" size="icon">
                                                            <Edit className="w-4 h-4" />
                                                        </Button>
                                                    </Link>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="text-destructive">
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Xóa sách này?</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Sách "{book.title}" sẽ bị xóa vĩnh viễn. Hành động này không thể hoàn tác.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Hủy</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => handleDelete(book.id)}>
                                                                    Xóa
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </main>

            {/* PDF Import Dialog */}
            <PdfImportDialog
                open={pdfDialogOpen}
                onOpenChange={setPdfDialogOpen}
                categories={categories}
                onSuccess={fetchData}
            />
        </div>
    );
};

export default BookManagement;
