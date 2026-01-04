import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FolderOpen, 
  Plus,
  Edit,
  Trash2,
  ArrowLeft,
  FileText,
  Headphones,
  BookOpen,
  Save,
  X,
  GripVertical
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { useToast } from '@/hooks/use-toast';

interface BaseCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon_url: string | null;
  display_order: number | null;
  is_featured: boolean | null;
  created_at: string;
}

interface ExamCategory extends BaseCategory {
  exam_count: number | null;
  question_count: number | null;
  attempt_count: number | null;
  rating: number | null;
  subcategory_count: number | null;
}

interface PodcastCategory extends BaseCategory {
  podcast_count: number | null;
}

interface BookCategory extends BaseCategory {
  book_count: number | null;
}

type CategoryType = 'exam' | 'podcast' | 'book';

const CategoryManagement = () => {
  const { isAdmin, isTeacher, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState<CategoryType>('exam');
  const [examCategories, setExamCategories] = useState<ExamCategory[]>([]);
  const [podcastCategories, setPodcastCategories] = useState<PodcastCategory[]>([]);
  const [bookCategories, setBookCategories] = useState<BookCategory[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<BaseCategory | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    icon_url: '',
    display_order: 0,
    is_featured: false,
  });
  const [saving, setSaving] = useState(false);

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
      fetchAllCategories();
    }
  }, [hasAccess]);

  const fetchAllCategories = async () => {
    setLoading(true);
    
    const [
      { data: examData },
      { data: podcastData },
      { data: bookData }
    ] = await Promise.all([
      supabase.from('exam_categories').select('*').order('display_order', { ascending: true }),
      supabase.from('podcast_categories').select('*').order('display_order', { ascending: true }),
      supabase.from('book_categories').select('*').order('display_order', { ascending: true }),
    ]);

    setExamCategories((examData || []) as ExamCategory[]);
    setPodcastCategories((podcastData || []) as PodcastCategory[]);
    setBookCategories((bookData || []) as BookCategory[]);
    setLoading(false);
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      icon_url: '',
      display_order: 0,
      is_featured: false,
    });
    setDialogOpen(true);
  };

  const handleOpenEdit = (category: BaseCategory) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      icon_url: category.icon_url || '',
      display_order: category.display_order || 0,
      is_featured: category.is_featured || false,
    });
    setDialogOpen(true);
  };

  const getTableName = (type: CategoryType) => {
    switch (type) {
      case 'exam': return 'exam_categories';
      case 'podcast': return 'podcast_categories';
      case 'book': return 'book_categories';
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập tên danh mục",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    const tableName = getTableName(activeTab);
    const slug = formData.slug || generateSlug(formData.name);

    if (editingCategory) {
      // Update
      const { error } = await supabase
        .from(tableName)
        .update({
          name: formData.name,
          slug,
          description: formData.description || null,
          icon_url: formData.icon_url || null,
          display_order: formData.display_order,
          is_featured: formData.is_featured,
        })
        .eq('id', editingCategory.id);

      if (error) {
        toast({
          title: "Lỗi",
          description: "Không thể cập nhật danh mục",
          variant: "destructive",
        });
        setSaving(false);
        return;
      }

      toast({
        title: "Thành công",
        description: "Đã cập nhật danh mục",
      });
    } else {
      // Create
      const { error } = await supabase
        .from(tableName)
        .insert({
          name: formData.name,
          slug,
          description: formData.description || null,
          icon_url: formData.icon_url || null,
          display_order: formData.display_order,
          is_featured: formData.is_featured,
        });

      if (error) {
        toast({
          title: "Lỗi",
          description: error.message.includes('duplicate') ? "Slug đã tồn tại" : "Không thể tạo danh mục",
          variant: "destructive",
        });
        setSaving(false);
        return;
      }

      toast({
        title: "Thành công",
        description: "Đã tạo danh mục mới",
      });
    }

    setSaving(false);
    setDialogOpen(false);
    fetchAllCategories();
  };

  const handleDelete = async (categoryId: string) => {
    const tableName = getTableName(activeTab);
    
    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', categoryId);

    if (error) {
      toast({
        title: "Lỗi",
        description: "Không thể xóa danh mục. Có thể danh mục đang được sử dụng.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Thành công",
      description: "Đã xóa danh mục",
    });
    
    fetchAllCategories();
  };

  const getCurrentCategories = () => {
    switch (activeTab) {
      case 'exam': return examCategories;
      case 'podcast': return podcastCategories;
      case 'book': return bookCategories;
    }
  };

  const getTabIcon = (type: CategoryType) => {
    switch (type) {
      case 'exam': return <FileText className="w-4 h-4" />;
      case 'podcast': return <Headphones className="w-4 h-4" />;
      case 'book': return <BookOpen className="w-4 h-4" />;
    }
  };

  const getItemCount = (category: BaseCategory) => {
    if (activeTab === 'exam') {
      return (category as ExamCategory).exam_count || 0;
    } else if (activeTab === 'podcast') {
      return (category as PodcastCategory).podcast_count || 0;
    } else {
      return (category as BookCategory).book_count || 0;
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

  const categories = getCurrentCategories();

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
                <FolderOpen className="w-8 h-8 text-primary" />
                Quản lý danh mục
              </h1>
              <p className="text-muted-foreground mt-1">Tạo và quản lý các danh mục nội dung</p>
            </div>
          </div>
          <Button onClick={handleOpenCreate} className="gap-2">
            <Plus className="w-4 h-4" />
            Tạo danh mục mới
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as CategoryType)} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="exam" className="gap-2">
              <FileText className="w-4 h-4" />
              Đề thi ({examCategories.length})
            </TabsTrigger>
            <TabsTrigger value="podcast" className="gap-2">
              <Headphones className="w-4 h-4" />
              Podcast ({podcastCategories.length})
            </TabsTrigger>
            <TabsTrigger value="book" className="gap-2">
              <BookOpen className="w-4 h-4" />
              Sách ({bookCategories.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getTabIcon(activeTab)}
                  Danh mục {activeTab === 'exam' ? 'Đề thi' : activeTab === 'podcast' ? 'Podcast' : 'Sách'}
                </CardTitle>
                <CardDescription>
                  Quản lý các danh mục để phân loại nội dung
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : categories.length === 0 ? (
                  <div className="text-center py-16">
                    <FolderOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground text-lg mb-4">Chưa có danh mục nào</p>
                    <Button onClick={handleOpenCreate}>
                      <Plus className="w-4 h-4 mr-2" />
                      Tạo danh mục đầu tiên
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">#</TableHead>
                        <TableHead>Tên danh mục</TableHead>
                        <TableHead>Slug</TableHead>
                        <TableHead>Mô tả</TableHead>
                        <TableHead>Số lượng</TableHead>
                        <TableHead>Nổi bật</TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categories.map((category, index) => (
                        <TableRow key={category.id}>
                          <TableCell className="text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <GripVertical className="w-4 h-4 text-muted-foreground/50" />
                              {index + 1}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {category.icon_url && (
                                <img src={category.icon_url} alt="" className="w-6 h-6 rounded" />
                              )}
                              <span className="font-medium">{category.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground font-mono text-sm">
                            {category.slug}
                          </TableCell>
                          <TableCell className="text-muted-foreground max-w-xs truncate">
                            {category.description || '-'}
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">{getItemCount(category)}</span>
                          </TableCell>
                          <TableCell>
                            {category.is_featured ? (
                              <span className="text-primary">✓</span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleOpenEdit(category)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="text-destructive">
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Xóa danh mục?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Hành động này không thể hoàn tác. Danh mục "{category.name}" sẽ bị xóa vĩnh viễn.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Hủy</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(category.id)}>
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
          </TabsContent>
        </Tabs>
      </main>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Chỉnh sửa danh mục' : 'Tạo danh mục mới'}
            </DialogTitle>
            <DialogDescription>
              {activeTab === 'exam' ? 'Danh mục đề thi' : activeTab === 'podcast' ? 'Danh mục Podcast' : 'Danh mục Sách'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tên danh mục *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ 
                    ...formData, 
                    name: e.target.value,
                    slug: editingCategory ? formData.slug : generateSlug(e.target.value)
                  });
                }}
                placeholder="VD: Toán học"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="slug">Slug (URL)</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="vd: toan-hoc"
                className="font-mono"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Mô tả ngắn về danh mục..."
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="icon_url">URL Icon</Label>
              <Input
                id="icon_url"
                value={formData.icon_url}
                onChange={(e) => setFormData({ ...formData, icon_url: e.target.value })}
                placeholder="https://example.com/icon.png"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="display_order">Thứ tự hiển thị</Label>
              <Input
                id="display_order"
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="is_featured">Đánh dấu nổi bật</Label>
              <Switch
                id="is_featured"
                checked={formData.is_featured}
                onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              <X className="w-4 h-4 mr-2" />
              Hủy
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Đang lưu...' : 'Lưu'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CategoryManagement;
