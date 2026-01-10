import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useUserRole } from '@/modules/auth';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    BookOpen,
    ArrowLeft,
    Save,
    Image,
    Loader2,
    FileText,
    Sparkles
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BookCategory {
    id: string;
    name: string;
}

interface BookFormData {
    title: string;
    slug: string;
    description: string;
    author_name: string;
    cover_url: string;
    category_id: string;
    page_count: number;
    difficulty: string;
    is_featured: boolean;
    content: string;
}

const BookEditor = () => {
    const { id } = useParams();
    const isEditing = Boolean(id);
    const { isAdmin, isTeacher, loading: roleLoading } = useUserRole();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [categories, setCategories] = useState<BookCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState<BookFormData>({
        title: '',
        slug: '',
        description: '',
        author_name: '',
        cover_url: '',
        category_id: '',
        page_count: 0,
        difficulty: 'intermediate',
        is_featured: false,
        content: '',
    });

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
            fetchCategories();
            if (isEditing) {
                fetchBook();
            } else {
                setLoading(false);
            }
        }
    }, [hasAccess, id]);

    const fetchCategories = async () => {
        const { data } = await supabase
            .from('book_categories')
            .select('id, name')
            .order('display_order');

        setCategories(data || []);
    };

    const fetchBook = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('books')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !data) {
            toast({
                title: "Lỗi",
                description: "Không tìm thấy sách",
                variant: "destructive",
            });
            navigate('/admin/books');
            return;
        }

        setFormData({
            title: data.title || '',
            slug: data.slug || '',
            description: data.description || '',
            author_name: data.author_name || '',
            cover_url: data.cover_url || '',
            category_id: data.category_id || '',
            page_count: data.page_count || 0,
            difficulty: data.difficulty || 'intermediate',
            is_featured: data.is_featured || false,
            content: data.content || '',
        });
        setLoading(false);
    };

    const generateSlug = (title: string) => {
        return title
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd')
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    };

    const handleTitleChange = (title: string) => {
        setFormData(prev => ({
            ...prev,
            title,
            slug: generateSlug(title),
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            toast({
                title: "Lỗi",
                description: "Vui lòng nhập tiêu đề sách",
                variant: "destructive",
            });
            return;
        }

        setSaving(true);

        const bookData = {
            title: formData.title.trim(),
            slug: formData.slug || generateSlug(formData.title),
            description: formData.description.trim() || null,
            author_name: formData.author_name.trim() || null,
            cover_url: formData.cover_url.trim() || null,
            category_id: formData.category_id || null,
            page_count: formData.page_count || null,
            difficulty: formData.difficulty || null,
            is_featured: formData.is_featured,
            content: formData.content.trim() || null,
        };

        let error;

        if (isEditing) {
            const result = await supabase
                .from('books')
                .update(bookData)
                .eq('id', id);
            error = result.error;
        } else {
            const result = await supabase
                .from('books')
                .insert([bookData]);
            error = result.error;
        }

        setSaving(false);

        if (error) {
            toast({
                title: "Lỗi",
                description: error.message,
                variant: "destructive",
            });
            return;
        }

        toast({
            title: "Thành công",
            description: isEditing ? "Đã cập nhật sách" : "Đã tạo sách mới",
        });

        navigate('/admin/books');
    };

    if (roleLoading || loading) {
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

            <main className="container mx-auto px-4 py-8 max-w-4xl">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link to="/admin/books">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                            <BookOpen className="w-8 h-8 text-emerald-500" />
                            {isEditing ? 'Chỉnh sửa sách' : 'Thêm sách mới'}
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            {isEditing ? 'Cập nhật thông tin sách' : 'Điền thông tin để thêm sách vào thư viện'}
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <Card className="border-border/50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="w-5 h-5" />
                                Thông tin cơ bản
                            </CardTitle>
                            <CardDescription>Nhập tiêu đề, tác giả và mô tả</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Tiêu đề sách *</Label>
                                    <Input
                                        id="title"
                                        value={formData.title}
                                        onChange={(e) => handleTitleChange(e.target.value)}
                                        placeholder="Nhập tiêu đề sách..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="slug">Slug (URL)</Label>
                                    <Input
                                        id="slug"
                                        value={formData.slug}
                                        onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                                        placeholder="tu-dong-tao-tu-tieu-de"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="author">Tác giả</Label>
                                <Input
                                    id="author"
                                    value={formData.author_name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, author_name: e.target.value }))}
                                    placeholder="Tên tác giả..."
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Mô tả</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Mô tả ngắn về nội dung sách..."
                                    rows={3}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Category and Settings */}
                    <Card className="border-border/50">
                        <CardHeader>
                            <CardTitle>Phân loại & Cài đặt</CardTitle>
                            <CardDescription>Danh mục, độ khó và các tùy chọn khác</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="space-y-2">
                                    <Label>Danh mục</Label>
                                    <Select
                                        value={formData.category_id || "none"}
                                        onValueChange={(v) => setFormData(prev => ({ ...prev, category_id: v === "none" ? "" : v }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn danh mục" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">Chưa phân loại</SelectItem>
                                            {categories.map((cat) => (
                                                <SelectItem key={cat.id} value={cat.id}>
                                                    {cat.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Độ khó</Label>
                                    <Select
                                        value={formData.difficulty}
                                        onValueChange={(v) => setFormData(prev => ({ ...prev, difficulty: v }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="beginner">Cơ bản</SelectItem>
                                            <SelectItem value="intermediate">Trung cấp</SelectItem>
                                            <SelectItem value="advanced">Nâng cao</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="page_count">Số trang</Label>
                                    <Input
                                        id="page_count"
                                        type="number"
                                        min="0"
                                        value={formData.page_count || ''}
                                        onChange={(e) => setFormData(prev => ({ ...prev, page_count: parseInt(e.target.value) || 0 }))}
                                        placeholder="Số trang"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Sparkles className="w-5 h-5 text-amber-500" />
                                    <div>
                                        <p className="font-medium">Sách nổi bật</p>
                                        <p className="text-sm text-muted-foreground">Hiển thị ở vị trí đặc biệt trên trang chủ</p>
                                    </div>
                                </div>
                                <Switch
                                    checked={formData.is_featured}
                                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_featured: checked }))}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Cover Image */}
                    <Card className="border-border/50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Image className="w-5 h-5" />
                                Ảnh bìa
                            </CardTitle>
                            <CardDescription>URL hình ảnh bìa sách</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="cover_url">URL ảnh bìa</Label>
                                <Input
                                    id="cover_url"
                                    value={formData.cover_url}
                                    onChange={(e) => setFormData(prev => ({ ...prev, cover_url: e.target.value }))}
                                    placeholder="https://example.com/cover.jpg"
                                />
                            </div>

                            {formData.cover_url && (
                                <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
                                    <img
                                        src={formData.cover_url}
                                        alt="Preview"
                                        className="w-24 h-32 object-cover rounded shadow"
                                        onError={(e) => (e.currentTarget.style.display = 'none')}
                                    />
                                    <div>
                                        <p className="font-medium">Xem trước</p>
                                        <p className="text-sm text-muted-foreground">Ảnh bìa sẽ hiển thị như thế này</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Content */}
                    <Card className="border-border/50">
                        <CardHeader>
                            <CardTitle>Nội dung sách</CardTitle>
                            <CardDescription>Nội dung văn bản của sách (hỗ trợ Markdown)</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                value={formData.content}
                                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                                placeholder="Nhập nội dung sách ở đây... Hỗ trợ Markdown để định dạng văn bản."
                                rows={15}
                                className="font-mono text-sm"
                            />
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-4">
                        <Link to="/admin/books">
                            <Button type="button" variant="outline">
                                Hủy
                            </Button>
                        </Link>
                        <Button type="submit" disabled={saving}>
                            {saving ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Đang lưu...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    {isEditing ? 'Cập nhật' : 'Tạo sách'}
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default BookEditor;
