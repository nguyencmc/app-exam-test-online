import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useUserRole } from '@/modules/auth';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/modules/auth';
import { Header } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
    BookOpen,
    ArrowLeft,
    Save,
    Image,
    Video,
    DollarSign,
    Settings2,
    FileEdit,
} from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';

interface CourseForm {
    title: string;
    description: string;
    category: string;
    subcategory: string;
    level: string;
    language: string;
    price: number;
    discount_price: number | null;
    thumbnail_url: string;
    preview_video_url: string;
    duration_hours: number;
    published: boolean;
}

const initialForm: CourseForm = {
    title: '',
    description: '',
    category: '',
    subcategory: '',
    level: 'beginner',
    language: 'vi',
    price: 0,
    discount_price: null,
    thumbnail_url: '',
    preview_video_url: '',
    duration_hours: 0,
    published: false,
};

const categories = [
    { value: 'languages', label: 'Ngôn ngữ' },
    { value: 'programming', label: 'Lập trình' },
    { value: 'business', label: 'Kinh doanh' },
    { value: 'design', label: 'Thiết kế' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'music', label: 'Âm nhạc' },
    { value: 'photography', label: 'Nhiếp ảnh' },
    { value: 'personal-development', label: 'Phát triển bản thân' },
];

const CourseEditor = () => {
    const { id } = useParams();
    const isEditing = !!id;
    const { isAdmin, isTeacher, loading: roleLoading } = useUserRole();
    const { user } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [form, setForm] = useState<CourseForm>(initialForm);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const hasAccess = isAdmin || isTeacher;

    useEffect(() => {
        if (!roleLoading && !hasAccess) {
            navigate('/');
        }
    }, [hasAccess, roleLoading, navigate]);

    useEffect(() => {
        if (isEditing && hasAccess) {
            fetchCourse();
        }
    }, [id, hasAccess]);

    const fetchCourse = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('courses')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;

            if (data) {
                setForm({
                    title: data.title || '',
                    description: data.description || '',
                    category: data.category || '',
                    subcategory: data.subcategory || '',
                    level: data.level || 'beginner',
                    language: data.language || 'vi',
                    price: data.price || 0,
                    discount_price: data.discount_price,
                    thumbnail_url: data.thumbnail_url || '',
                    preview_video_url: data.preview_video_url || '',
                    duration_hours: data.duration_hours || 0,
                    published: data.published || false,
                });
            }
        } catch (error: any) {
            toast({
                title: 'Lỗi',
                description: 'Không tìm thấy khóa học',
                variant: 'destructive',
            });
            navigate('/admin/courses');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field: keyof CourseForm, value: any) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        if (!form.title.trim()) {
            toast({
                title: 'Lỗi',
                description: 'Vui lòng nhập tên khóa học',
                variant: 'destructive',
            });
            return;
        }

        setSaving(true);

        try {
            const payload = {
                title: form.title,
                description: form.description || null,
                category: form.category || null,
                subcategory: form.subcategory || null,
                level: form.level,
                language: form.language,
                price: form.price || 0,
                discount_price: form.discount_price || null,
                thumbnail_url: form.thumbnail_url || null,
                preview_video_url: form.preview_video_url || null,
                duration_hours: form.duration_hours || 0,
                published: form.published,
            };

            if (isEditing) {
                const { error } = await supabase
                    .from('courses')
                    .update(payload)
                    .eq('id', id);

                if (error) throw error;

                toast({
                    title: 'Thành công',
                    description: 'Đã cập nhật khóa học',
                });
            } else {
                const { data, error } = await supabase
                    .from('courses')
                    .insert({
                        ...payload,
                        creator_id: user?.id,
                    })
                    .select('id')
                    .single();

                if (error) throw error;

                toast({
                    title: 'Thành công',
                    description: 'Đã tạo khóa học mới',
                });

                // Redirect to content editor
                navigate(`/admin/courses/${data.id}/content`);
                return;
            }
        } catch (error: any) {
            toast({
                title: 'Lỗi',
                description: error.message || 'Không thể lưu khóa học',
                variant: 'destructive',
            });
        } finally {
            setSaving(false);
        }
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
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Link to="/admin/courses">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                                <BookOpen className="w-8 h-8 text-blue-500" />
                                {isEditing ? 'Chỉnh sửa khóa học' : 'Tạo khóa học mới'}
                            </h1>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {isEditing && (
                            <Link to={`/admin/courses/${id}/content`}>
                                <Button variant="outline" className="gap-2">
                                    <FileEdit className="w-4 h-4" />
                                    Quản lý nội dung
                                </Button>
                            </Link>
                        )}
                        <Button onClick={handleSave} disabled={saving} className="gap-2">
                            <Save className="w-4 h-4" />
                            {saving ? 'Đang lưu...' : 'Lưu khóa học'}
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6">
                    {/* Basic Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Settings2 className="w-5 h-5" />
                                Thông tin cơ bản
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="title">Tên khóa học *</Label>
                                <Input
                                    id="title"
                                    value={form.title}
                                    onChange={(e) => handleChange('title', e.target.value)}
                                    placeholder="VD: Lập trình ReactJS từ A-Z"
                                />
                            </div>

                            <div>
                                <Label htmlFor="description">Mô tả khóa học</Label>
                                <Textarea
                                    id="description"
                                    value={form.description}
                                    onChange={(e) => handleChange('description', e.target.value)}
                                    placeholder="Mô tả chi tiết về khóa học..."
                                    rows={4}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="category">Danh mục</Label>
                                    <Select
                                        value={form.category}
                                        onValueChange={(v) => handleChange('category', v)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn danh mục" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((cat) => (
                                                <SelectItem key={cat.value} value={cat.value}>
                                                    {cat.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="subcategory">Danh mục phụ</Label>
                                    <Input
                                        id="subcategory"
                                        value={form.subcategory}
                                        onChange={(e) => handleChange('subcategory', e.target.value)}
                                        placeholder="VD: React, JavaScript..."
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="level">Cấp độ</Label>
                                    <Select
                                        value={form.level}
                                        onValueChange={(v) => handleChange('level', v)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="beginner">Cơ bản (Beginner)</SelectItem>
                                            <SelectItem value="intermediate">Trung cấp (Intermediate)</SelectItem>
                                            <SelectItem value="advanced">Nâng cao (Advanced)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="language">Ngôn ngữ</Label>
                                    <Select
                                        value={form.language}
                                        onValueChange={(v) => handleChange('language', v)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="vi">Tiếng Việt</SelectItem>
                                            <SelectItem value="en">English</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Pricing */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <DollarSign className="w-5 h-5" />
                                Giá khóa học
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="price">Giá gốc (VNĐ)</Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        value={form.price}
                                        onChange={(e) => handleChange('price', Number(e.target.value))}
                                        min={0}
                                        step={1000}
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Để 0 nếu khóa học miễn phí
                                    </p>
                                </div>

                                <div>
                                    <Label htmlFor="discount_price">Giá khuyến mãi (VNĐ)</Label>
                                    <Input
                                        id="discount_price"
                                        type="number"
                                        value={form.discount_price || ''}
                                        onChange={(e) => handleChange('discount_price', e.target.value ? Number(e.target.value) : null)}
                                        min={0}
                                        step={1000}
                                        placeholder="Để trống nếu không giảm giá"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="duration">Thời lượng (giờ)</Label>
                                <Input
                                    id="duration"
                                    type="number"
                                    value={form.duration_hours}
                                    onChange={(e) => handleChange('duration_hours', Number(e.target.value))}
                                    min={0}
                                    step={0.5}
                                    className="w-32"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Media */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Image className="w-5 h-5" />
                                Hình ảnh & Video
                            </CardTitle>
                            <CardDescription>
                                Thêm ảnh thumbnail và video giới thiệu cho khóa học
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="thumbnail">URL Thumbnail</Label>
                                <Input
                                    id="thumbnail"
                                    value={form.thumbnail_url}
                                    onChange={(e) => handleChange('thumbnail_url', e.target.value)}
                                    placeholder="https://..."
                                />
                                {form.thumbnail_url && (
                                    <div className="mt-2 w-48 h-28 rounded-lg overflow-hidden bg-muted">
                                        <img
                                            src={form.thumbnail_url}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="preview_video">URL Video giới thiệu</Label>
                                <Input
                                    id="preview_video"
                                    value={form.preview_video_url}
                                    onChange={(e) => handleChange('preview_video_url', e.target.value)}
                                    placeholder="https://..."
                                />
                                {form.preview_video_url && (
                                    <div className="mt-2">
                                        <video
                                            src={form.preview_video_url}
                                            controls
                                            className="w-full max-w-md rounded-lg"
                                        />
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Publishing */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Xuất bản</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label htmlFor="published">Xuất bản khóa học</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Khi xuất bản, khóa học sẽ hiển thị cho người dùng
                                    </p>
                                </div>
                                <Switch
                                    id="published"
                                    checked={form.published}
                                    onCheckedChange={(v) => handleChange('published', v)}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
};

export default CourseEditor;
