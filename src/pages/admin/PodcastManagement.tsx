import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Headphones, 
  Plus,
  Search,
  Edit,
  Trash2,
  ArrowLeft,
  Clock
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
import { useToast } from '@/hooks/use-toast';

interface Podcast {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  duration_seconds: number | null;
  listen_count: number | null;
  difficulty: string | null;
  category_id: string | null;
  created_at: string;
}

interface PodcastCategory {
  id: string;
  name: string;
}

const PodcastManagement = () => {
  const { isAdmin, isTeacher, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [categories, setCategories] = useState<PodcastCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

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
    
    const [{ data: podcastsData }, { data: categoriesData }] = await Promise.all([
      supabase.from('podcasts').select('*').order('created_at', { ascending: false }),
      supabase.from('podcast_categories').select('id, name'),
    ]);

    setPodcasts(podcastsData || []);
    setCategories(categoriesData || []);
    setLoading(false);
  };

  const handleDelete = async (podcastId: string) => {
    const { error } = await supabase
      .from('podcasts')
      .delete()
      .eq('id', podcastId);

    if (error) {
      toast({
        title: "Lỗi",
        description: "Không thể xóa podcast",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Thành công",
      description: "Đã xóa podcast",
    });
    
    fetchData();
  };

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return 'Chưa phân loại';
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'Không xác định';
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const filteredPodcasts = podcasts.filter(podcast =>
    podcast.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    podcast.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                <Headphones className="w-8 h-8 text-pink-500" />
                Quản lý Podcast
              </h1>
              <p className="text-muted-foreground mt-1">{podcasts.length} podcast</p>
            </div>
          </div>
          <Link to="/admin/podcasts/create">
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Tạo podcast mới
            </Button>
          </Link>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm podcast..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Podcasts Table */}
        <Card className="border-border/50">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredPodcasts.length === 0 ? (
              <div className="text-center py-16">
                <Headphones className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-lg mb-4">
                  {searchQuery ? 'Không tìm thấy podcast nào' : 'Chưa có podcast nào'}
                </p>
                <Link to="/admin/podcasts/create">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Tạo podcast đầu tiên
                  </Button>
                </Link>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tiêu đề</TableHead>
                    <TableHead>Danh mục</TableHead>
                    <TableHead>Thời lượng</TableHead>
                    <TableHead>Độ khó</TableHead>
                    <TableHead>Lượt nghe</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPodcasts.map((podcast) => (
                    <TableRow key={podcast.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{podcast.title}</p>
                          {podcast.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {podcast.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{getCategoryName(podcast.category_id)}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          {formatDuration(podcast.duration_seconds)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            podcast.difficulty === 'beginner' ? 'secondary' : 
                            podcast.difficulty === 'advanced' ? 'destructive' : 'default'
                          }
                        >
                          {podcast.difficulty || 'intermediate'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Headphones className="w-4 h-4 text-muted-foreground" />
                          {podcast.listen_count || 0}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(podcast.created_at).toLocaleDateString('vi-VN')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link to={`/admin/podcasts/${podcast.id}`}>
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
                                <AlertDialogTitle>Xóa podcast?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Hành động này không thể hoàn tác.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Hủy</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(podcast.id)}>
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
    </div>
  );
};

export default PodcastManagement;
