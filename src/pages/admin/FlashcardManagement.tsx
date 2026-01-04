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
  Layers, 
  Plus,
  Search,
  Edit,
  Trash2,
  ArrowLeft,
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

interface FlashcardSet {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  card_count: number | null;
  is_public: boolean | null;
  created_at: string;
}

const FlashcardManagement = () => {
  const { isAdmin, isTeacher, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [sets, setSets] = useState<FlashcardSet[]>([]);
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
    
    const { data } = await supabase
      .from('flashcard_sets')
      .select('*')
      .order('created_at', { ascending: false });

    setSets(data || []);
    setLoading(false);
  };

  const handleDelete = async (setId: string) => {
    // First delete all flashcards in this set
    await supabase.from('flashcards').delete().eq('set_id', setId);

    const { error } = await supabase
      .from('flashcard_sets')
      .delete()
      .eq('id', setId);

    if (error) {
      toast({
        title: "Lỗi",
        description: "Không thể xóa bộ flashcard",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Thành công",
      description: "Đã xóa bộ flashcard",
    });
    
    fetchData();
  };

  const filteredSets = sets.filter(set =>
    set.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    set.description?.toLowerCase().includes(searchQuery.toLowerCase())
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
                <Layers className="w-8 h-8 text-orange-500" />
                Quản lý Flashcard
              </h1>
              <p className="text-muted-foreground mt-1">{sets.length} bộ thẻ</p>
            </div>
          </div>
          <Link to="/admin/flashcards/create">
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Tạo bộ thẻ mới
            </Button>
          </Link>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm bộ thẻ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Flashcard Sets Table */}
        <Card className="border-border/50">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredSets.length === 0 ? (
              <div className="text-center py-16">
                <Layers className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-lg mb-4">
                  {searchQuery ? 'Không tìm thấy bộ thẻ nào' : 'Chưa có bộ thẻ nào'}
                </p>
                <Link to="/admin/flashcards/create">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Tạo bộ thẻ đầu tiên
                  </Button>
                </Link>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên bộ thẻ</TableHead>
                    <TableHead>Danh mục</TableHead>
                    <TableHead>Số thẻ</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSets.map((set) => (
                    <TableRow key={set.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{set.title}</p>
                          {set.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {set.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{set.category || 'Chưa phân loại'}</Badge>
                      </TableCell>
                      <TableCell>{set.card_count || 0}</TableCell>
                      <TableCell>
                        <Badge variant={set.is_public ? 'default' : 'secondary'}>
                          {set.is_public ? 'Công khai' : 'Riêng tư'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(set.created_at).toLocaleDateString('vi-VN')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link to={`/admin/flashcards/${set.id}`}>
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
                                <AlertDialogTitle>Xóa bộ thẻ?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Hành động này không thể hoàn tác. Tất cả thẻ trong bộ sẽ bị xóa.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Hủy</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(set.id)}>
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

export default FlashcardManagement;
