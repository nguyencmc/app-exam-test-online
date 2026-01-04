import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  FileText,
  BookOpen,
  Headphones,
  Layers,
  Shield,
  TrendingUp,
  Activity,
  Settings,
  ChevronRight,
  Plus,
  Download
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';

interface Stats {
  totalUsers: number;
  totalExams: number;
  totalQuestions: number;
  totalFlashcardSets: number;
  totalPodcasts: number;
  totalBooks: number;
  totalAttempts: number;
}

interface UserWithRole {
  id: string;
  user_id: string;
  email: string | null;
  full_name: string | null;
  username: string | null;
  created_at: string;
  roles: string[];
}

const AdminDashboard = () => {
  const { user } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalExams: 0,
    totalQuestions: 0,
    totalFlashcardSets: 0,
    totalPodcasts: 0,
    totalBooks: 0,
    totalAttempts: 0,
  });
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      navigate('/');
      toast({
        title: "Không có quyền truy cập",
        description: "Bạn cần quyền Admin để truy cập trang này",
        variant: "destructive",
      });
    }
  }, [isAdmin, roleLoading, navigate, toast]);

  useEffect(() => {
    if (isAdmin) {
      fetchStats();
      fetchUsers();
    }
  }, [isAdmin]);

  const fetchStats = async () => {
    const [
      { count: usersCount },
      { count: examsCount },
      { count: questionsCount },
      { count: flashcardsCount },
      { count: podcastsCount },
      { count: booksCount },
      { count: attemptsCount },
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('exams').select('*', { count: 'exact', head: true }),
      supabase.from('questions').select('*', { count: 'exact', head: true }),
      supabase.from('flashcard_sets').select('*', { count: 'exact', head: true }),
      supabase.from('podcasts').select('*', { count: 'exact', head: true }),
      supabase.from('books').select('*', { count: 'exact', head: true }),
      supabase.from('exam_attempts').select('*', { count: 'exact', head: true }),
    ]);

    setStats({
      totalUsers: usersCount || 0,
      totalExams: examsCount || 0,
      totalQuestions: questionsCount || 0,
      totalFlashcardSets: flashcardsCount || 0,
      totalPodcasts: podcastsCount || 0,
      totalBooks: booksCount || 0,
      totalAttempts: attemptsCount || 0,
    });
  };

  const fetchUsers = async () => {
    setLoading(true);

    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      setLoading(false);
      return;
    }

    const { data: allRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('user_id, role');

    if (rolesError) {
      console.error('Error fetching roles:', rolesError);
    }

    const usersWithRoles: UserWithRole[] = (profiles || []).map(profile => ({
      id: profile.id,
      user_id: profile.user_id,
      email: profile.email,
      full_name: profile.full_name,
      username: profile.username,
      created_at: profile.created_at,
      roles: (allRoles || [])
        .filter(r => r.user_id === profile.user_id)
        .map(r => r.role),
    }));

    setUsers(usersWithRoles);
    setLoading(false);
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (newRole === 'none') {
      // Remove all roles
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (error) {
        toast({
          title: "Lỗi",
          description: "Không thể cập nhật quyền",
          variant: "destructive",
        });
        return;
      }
    } else {
      // Upsert the role
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (deleteError) {
        console.error('Error deleting old roles:', deleteError);
      }

      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role: newRole as 'admin' | 'moderator' | 'teacher' | 'user' });

      if (error) {
        toast({
          title: "Lỗi",
          description: "Không thể cập nhật quyền",
          variant: "destructive",
        });
        return;
      }
    }

    toast({
      title: "Thành công",
      description: "Đã cập nhật quyền người dùng",
    });

    fetchUsers();
  };

  const handleExportDatabase = async () => {
    setExporting(true);
    try {
      const response = await supabase.functions.invoke('export-database');

      if (response.error) {
        throw new Error(response.error.message);
      }

      const jsonData = JSON.stringify(response.data, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `database-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Thành công",
        description: "Đã xuất database ra file JSON",
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Lỗi",
        description: "Không thể xuất database",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
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

  if (!isAdmin) {
    return null;
  }

  const statCards = [
    { title: 'Người dùng', value: stats.totalUsers, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { title: 'Đề thi', value: stats.totalExams, icon: FileText, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { title: 'Câu hỏi', value: stats.totalQuestions, icon: Activity, color: 'text-green-500', bg: 'bg-green-500/10' },
    { title: 'Flashcard Sets', value: stats.totalFlashcardSets, icon: Layers, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { title: 'Podcasts', value: stats.totalPodcasts, icon: Headphones, color: 'text-pink-500', bg: 'bg-pink-500/10' },
    { title: 'Sách', value: stats.totalBooks, icon: BookOpen, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
    { title: 'Lượt làm bài', value: stats.totalAttempts, icon: TrendingUp, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  ];

  const quickLinks = [
    { title: 'Quản lý người dùng', icon: Users, href: '/admin/users', color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { title: 'Quản lý danh mục', icon: Layers, href: '/admin/categories', color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { title: 'Quản lý khóa học', icon: BookOpen, href: '/admin/courses', color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
    { title: 'Quản lý đề thi', icon: FileText, href: '/admin/exams', color: 'text-green-500', bg: 'bg-green-500/10' },
    { title: 'Quản lý Flashcard', icon: Layers, href: '/admin/flashcards', color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { title: 'Quản lý Podcast', icon: Headphones, href: '/admin/podcasts', color: 'text-pink-500', bg: 'bg-pink-500/10' },
  ];

  const quickActions = [
    { title: 'Tạo khóa học', desc: 'Thêm khóa học mới', icon: BookOpen, href: '/admin/courses/create', color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
    { title: 'Tạo đề thi', desc: 'Thêm đề thi mới', icon: Plus, href: '/admin/exams/create', color: 'text-primary', bg: 'bg-primary/10' },
    { title: 'Tạo Flashcard', desc: 'Thêm bộ thẻ ghi nhớ', icon: Layers, href: '/admin/flashcards/create', color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { title: 'Tạo Podcast', desc: 'Thêm bài nghe mới', icon: Headphones, href: '/admin/podcasts/create', color: 'text-pink-500', bg: 'bg-pink-500/10' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-4 md:py-8 pb-24 md:pb-8">
        {/* Mobile Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Shield className="w-5 h-5 md:w-6 md:h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl md:text-3xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground hidden md:block">Quản lý hệ thống và người dùng</p>
            </div>
          </div>
        </div>

        {/* Stats Grid - Mobile Optimized */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2 md:gap-4 mb-6">
          {statCards.map((stat) => (
            <Card key={stat.title} className="border-border/50">
              <CardContent className="p-3 md:p-4">
                <div className="flex items-center gap-2 md:flex-col md:items-start">
                  <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg ${stat.bg} flex items-center justify-center flex-shrink-0`}>
                    <stat.icon className={`w-4 h-4 md:w-5 md:h-5 ${stat.color}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-lg md:text-2xl font-bold text-foreground truncate">{stat.value.toLocaleString()}</p>
                    <p className="text-xs md:text-sm text-muted-foreground truncate">{stat.title}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Links - Mobile Grid */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Quản lý</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 md:gap-3">
            {quickLinks.map((link) => (
              <Link key={link.href} to={link.href}>
                <Card className="border-border/50 hover:border-primary/50 transition-colors h-full">
                  <CardContent className="p-3 md:p-4 flex flex-col items-center text-center gap-2">
                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl ${link.bg} flex items-center justify-center`}>
                      <link.icon className={`w-5 h-5 md:w-6 md:h-6 ${link.color}`} />
                    </div>
                    <span className="text-xs md:text-sm font-medium text-foreground leading-tight">{link.title}</span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Tạo mới</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-3">
            {quickActions.map((action) => (
              <Link key={action.href} to={action.href}>
                <Card className="cursor-pointer hover:shadow-md transition-all border-border/50 group">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl ${action.bg} flex items-center justify-center group-hover:scale-105 transition-transform flex-shrink-0`}>
                      <action.icon className={`w-5 h-5 md:w-6 md:h-6 ${action.color}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-foreground text-sm md:text-base">{action.title}</h3>
                      <p className="text-xs md:text-sm text-muted-foreground truncate">{action.desc}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Export Button - Mobile */}
        <div className="mb-6 md:hidden">
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={handleExportDatabase}
            disabled={exporting}
          >
            <Download className="w-4 h-4" />
            {exporting ? 'Đang xuất...' : 'Xuất Database'}
          </Button>
        </div>

        {/* Users Section */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <Users className="w-4 h-4 md:w-5 md:h-5" />
                  Người dùng gần đây
                </CardTitle>
                <CardDescription className="text-xs md:text-sm mt-1">
                  Phân quyền và quản lý người dùng
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="hidden md:flex gap-2"
                onClick={handleExportDatabase}
                disabled={exporting}
              >
                <Download className="w-4 h-4" />
                {exporting ? 'Đang xuất...' : 'Xuất Database'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0 md:p-6 md:pt-0">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <>
                {/* Mobile User List */}
                <div className="md:hidden divide-y divide-border">
                  {users.map((u) => (
                    <div key={u.id} className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-foreground truncate">{u.full_name || 'Chưa đặt tên'}</p>
                          <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                          {u.username && (
                            <p className="text-xs text-muted-foreground">@{u.username}</p>
                          )}
                        </div>
                        <div className="flex gap-1 flex-wrap justify-end">
                          {u.roles.length === 0 ? (
                            <Badge variant="outline" className="text-xs">User</Badge>
                          ) : (
                            u.roles.map((role) => (
                              <Badge
                                key={role}
                                variant={role === 'admin' ? 'default' : role === 'teacher' ? 'secondary' : 'outline'}
                                className="text-xs"
                              >
                                {role}
                              </Badge>
                            ))
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs text-muted-foreground">
                          {new Date(u.created_at).toLocaleDateString('vi-VN')}
                        </span>
                        <Select
                          value={u.roles[0] || 'none'}
                          onValueChange={(value) => handleRoleChange(u.user_id, value)}
                          disabled={u.user_id === user?.id}
                        >
                          <SelectTrigger className="w-28 h-8 text-xs">
                            <SelectValue placeholder="Chọn vai trò" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">User</SelectItem>
                            <SelectItem value="teacher">Teacher</SelectItem>
                            <SelectItem value="moderator">Moderator</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Table */}
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Người dùng</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Ngày tạo</TableHead>
                        <TableHead>Vai trò hiện tại</TableHead>
                        <TableHead>Thay đổi vai trò</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((u) => (
                        <TableRow key={u.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{u.full_name || 'Chưa đặt tên'}</p>
                              {u.username && (
                                <p className="text-sm text-muted-foreground">@{u.username}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{u.email}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(u.created_at).toLocaleDateString('vi-VN')}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1 flex-wrap">
                              {u.roles.length === 0 ? (
                                <Badge variant="outline">User</Badge>
                              ) : (
                                u.roles.map((role) => (
                                  <Badge
                                    key={role}
                                    variant={role === 'admin' ? 'default' : role === 'teacher' ? 'secondary' : 'outline'}
                                  >
                                    {role}
                                  </Badge>
                                ))
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={u.roles[0] || 'none'}
                              onValueChange={(value) => handleRoleChange(u.user_id, value)}
                              disabled={u.user_id === user?.id}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">User</SelectItem>
                                <SelectItem value="teacher">Teacher</SelectItem>
                                <SelectItem value="moderator">Moderator</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminDashboard;
