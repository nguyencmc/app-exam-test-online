import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useStudyGroups } from '@/hooks/useStudyGroups';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, Search, BookOpen, Code, Languages, Calculator, Globe } from 'lucide-react';

const categoryIcons: Record<string, React.ReactNode> = {
  general: <BookOpen className="h-5 w-5" />,
  programming: <Code className="h-5 w-5" />,
  languages: <Languages className="h-5 w-5" />,
  math: <Calculator className="h-5 w-5" />,
  science: <Globe className="h-5 w-5" />,
};

const categoryLabels: Record<string, string> = {
  general: 'Tổng hợp',
  programming: 'Lập trình',
  languages: 'Ngôn ngữ',
  math: 'Toán học',
  science: 'Khoa học',
};

const StudyGroups = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { groups, myGroups, loading, createGroup, joinGroup } = useStudyGroups();
  const [searchQuery, setSearchQuery] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    category: 'general',
    isPublic: true,
  });

  const filteredGroups = groups.filter(
    group =>
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateGroup = async () => {
    const result = await createGroup(
      newGroup.name,
      newGroup.description,
      newGroup.category,
      newGroup.isPublic
    );
    if (result) {
      setCreateDialogOpen(false);
      setNewGroup({ name: '', description: '', category: 'general', isPublic: true });
      navigate(`/study-groups/${result.id}`);
    }
  };

  const handleJoinGroup = async (groupId: string) => {
    const success = await joinGroup(groupId);
    if (success) {
      navigate(`/study-groups/${groupId}`);
    }
  };

  const isGroupMember = (groupId: string) => {
    return myGroups.some(g => g.id === groupId);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Nhóm Học Tập</h1>
            <p className="text-muted-foreground mt-1">Học cùng nhau, tiến bộ cùng nhau</p>
          </div>
          
          {user && (
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Tạo Nhóm Mới
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Tạo Nhóm Học Tập Mới</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="name">Tên nhóm</Label>
                    <Input
                      id="name"
                      value={newGroup.name}
                      onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                      placeholder="VD: Luyện thi IELTS 7.0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Mô tả</Label>
                    <Textarea
                      id="description"
                      value={newGroup.description}
                      onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                      placeholder="Mô tả về mục tiêu và hoạt động của nhóm..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Danh mục</Label>
                    <Select
                      value={newGroup.category}
                      onValueChange={(value) => setNewGroup({ ...newGroup, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">Tổng hợp</SelectItem>
                        <SelectItem value="programming">Lập trình</SelectItem>
                        <SelectItem value="languages">Ngôn ngữ</SelectItem>
                        <SelectItem value="math">Toán học</SelectItem>
                        <SelectItem value="science">Khoa học</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="isPublic">Nhóm công khai</Label>
                    <Switch
                      id="isPublic"
                      checked={newGroup.isPublic}
                      onCheckedChange={(checked) => setNewGroup({ ...newGroup, isPublic: checked })}
                    />
                  </div>
                  <Button 
                    onClick={handleCreateGroup} 
                    className="w-full"
                    disabled={!newGroup.name.trim()}
                  >
                    Tạo Nhóm
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <Tabs defaultValue="explore" className="space-y-6">
          <TabsList>
            <TabsTrigger value="explore">Khám Phá</TabsTrigger>
            <TabsTrigger value="my-groups">
              Nhóm Của Tôi
              {myGroups.length > 0 && (
                <Badge variant="secondary" className="ml-2">{myGroups.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="explore">
            <div className="mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm nhóm học tập..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-6 bg-muted rounded w-3/4"></div>
                      <div className="h-4 bg-muted rounded w-1/2 mt-2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-4 bg-muted rounded w-full"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredGroups.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground">Chưa có nhóm nào</h3>
                <p className="text-muted-foreground">Hãy tạo nhóm đầu tiên để bắt đầu học cùng bạn bè!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredGroups.map((group) => (
                  <Card key={group.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {categoryIcons[group.category] || categoryIcons.general}
                          <Badge variant="outline">
                            {categoryLabels[group.category] || 'Tổng hợp'}
                          </Badge>
                        </div>
                        {group.is_public && (
                          <Badge variant="secondary">Công khai</Badge>
                        )}
                      </div>
                      <CardTitle className="mt-2">{group.name}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {group.description || 'Không có mô tả'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="h-4 w-4" />
                          <span>{group.member_count} thành viên</span>
                        </div>
                        {isGroupMember(group.id) ? (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate(`/study-groups/${group.id}`)}
                          >
                            Xem Nhóm
                          </Button>
                        ) : (
                          <Button 
                            size="sm"
                            onClick={() => handleJoinGroup(group.id)}
                          >
                            Tham Gia
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="my-groups">
            {!user ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground">Đăng nhập để xem nhóm của bạn</h3>
                <Button className="mt-4" onClick={() => navigate('/auth')}>
                  Đăng Nhập
                </Button>
              </div>
            ) : myGroups.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground">Bạn chưa tham gia nhóm nào</h3>
                <p className="text-muted-foreground">Khám phá và tham gia các nhóm học tập!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myGroups.map((group) => (
                  <Card 
                    key={group.id} 
                    className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => navigate(`/study-groups/${group.id}`)}
                  >
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        {categoryIcons[group.category] || categoryIcons.general}
                        <Badge variant="outline">
                          {categoryLabels[group.category] || 'Tổng hợp'}
                        </Badge>
                      </div>
                      <CardTitle className="mt-2">{group.name}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {group.description || 'Không có mô tả'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{group.member_count} thành viên</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default StudyGroups;
