import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useStudyGroupDetail } from '@/hooks/useStudyGroups';
import { useStudyGroups } from '@/hooks/useStudyGroups';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Users, MessageSquare, FileText, Send, ArrowLeft, 
  Link as LinkIcon, Crown, Shield, LogOut, Plus 
} from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const StudyGroupDetail = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { joinGroup, leaveGroup } = useStudyGroups();
  const {
    group,
    members,
    messages,
    resources,
    isMember,
    userRole,
    loading,
    sendMessage,
    addResource,
  } = useStudyGroupDetail(groupId || '');

  const [messageInput, setMessageInput] = useState('');
  const [addResourceOpen, setAddResourceOpen] = useState(false);
  const [newResource, setNewResource] = useState({
    title: '',
    description: '',
    type: 'link',
    url: '',
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageInput.trim()) return;
    const success = await sendMessage(messageInput);
    if (success) {
      setMessageInput('');
    }
  };

  const handleAddResource = async () => {
    const success = await addResource(
      newResource.title,
      newResource.description,
      newResource.type,
      newResource.url
    );
    if (success) {
      setAddResourceOpen(false);
      setNewResource({ title: '', description: '', type: 'link', url: '' });
    }
  };

  const handleJoin = async () => {
    if (groupId) {
      await joinGroup(groupId);
    }
  };

  const handleLeave = async () => {
    if (groupId && confirm('Bạn có chắc muốn rời nhóm này?')) {
      const success = await leaveGroup(groupId);
      if (success) {
        navigate('/study-groups');
      }
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'admin':
        return <Shield className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-foreground">Không tìm thấy nhóm</h1>
          <Button className="mt-4" onClick={() => navigate('/study-groups')}>
            Quay lại
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          className="mb-4 gap-2"
          onClick={() => navigate('/study-groups')}
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại
        </Button>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content */}
          <div className="flex-grow">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-foreground">{group.name}</h1>
                <p className="text-muted-foreground mt-1">{group.description}</p>
              </div>
              {user && !isMember && (
                <Button onClick={handleJoin}>Tham Gia Nhóm</Button>
              )}
              {isMember && userRole !== 'owner' && (
                <Button variant="outline" onClick={handleLeave} className="gap-2">
                  <LogOut className="h-4 w-4" />
                  Rời Nhóm
                </Button>
              )}
            </div>

            {isMember ? (
              <Tabs defaultValue="chat" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="chat" className="gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Thảo luận
                  </TabsTrigger>
                  <TabsTrigger value="resources" className="gap-2">
                    <FileText className="h-4 w-4" />
                    Tài liệu ({resources.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="chat">
                  <Card>
                    <CardContent className="p-0">
                      <ScrollArea className="h-[400px] p-4">
                        {messages.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>Chưa có tin nhắn nào</p>
                            <p className="text-sm">Hãy bắt đầu cuộc trò chuyện!</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {messages.map((message) => (
                              <div
                                key={message.id}
                                className={`flex gap-3 ${
                                  message.user_id === user?.id ? 'flex-row-reverse' : ''
                                }`}
                              >
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={message.profile?.avatar_url || ''} />
                                  <AvatarFallback>
                                    {(message.profile?.full_name || 'U')[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <div
                                  className={`max-w-[70%] ${
                                    message.user_id === user?.id
                                      ? 'bg-primary text-primary-foreground'
                                      : 'bg-muted'
                                  } rounded-lg p-3`}
                                >
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-medium">
                                      {message.profile?.full_name || 'Ẩn danh'}
                                    </span>
                                    <span className="text-xs opacity-70">
                                      {format(new Date(message.created_at), 'HH:mm', { locale: vi })}
                                    </span>
                                  </div>
                                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                </div>
                              </div>
                            ))}
                            <div ref={messagesEndRef} />
                          </div>
                        )}
                      </ScrollArea>
                      <div className="border-t p-4 flex gap-2">
                        <Input
                          placeholder="Nhập tin nhắn..."
                          value={messageInput}
                          onChange={(e) => setMessageInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        />
                        <Button onClick={handleSendMessage} size="icon">
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="resources">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Tài liệu chia sẻ</h3>
                    <Dialog open={addResourceOpen} onOpenChange={setAddResourceOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" className="gap-2">
                          <Plus className="h-4 w-4" />
                          Thêm tài liệu
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Chia sẻ tài liệu</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 mt-4">
                          <div>
                            <Label>Tiêu đề</Label>
                            <Input
                              value={newResource.title}
                              onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                              placeholder="VD: Tài liệu ôn thi IELTS Reading"
                            />
                          </div>
                          <div>
                            <Label>Mô tả</Label>
                            <Textarea
                              value={newResource.description}
                              onChange={(e) => setNewResource({ ...newResource, description: e.target.value })}
                              placeholder="Mô tả ngắn về tài liệu..."
                            />
                          </div>
                          <div>
                            <Label>Loại tài liệu</Label>
                            <Select
                              value={newResource.type}
                              onValueChange={(value) => setNewResource({ ...newResource, type: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="link">Liên kết</SelectItem>
                                <SelectItem value="note">Ghi chú</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          {newResource.type === 'link' && (
                            <div>
                              <Label>URL</Label>
                              <Input
                                value={newResource.url}
                                onChange={(e) => setNewResource({ ...newResource, url: e.target.value })}
                                placeholder="https://..."
                              />
                            </div>
                          )}
                          <Button 
                            onClick={handleAddResource} 
                            className="w-full"
                            disabled={!newResource.title.trim()}
                          >
                            Chia sẻ
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {resources.length === 0 ? (
                    <Card>
                      <CardContent className="py-8 text-center text-muted-foreground">
                        <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>Chưa có tài liệu nào</p>
                        <p className="text-sm">Hãy chia sẻ tài liệu đầu tiên!</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-3">
                      {resources.map((resource) => (
                        <Card key={resource.id}>
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-muted rounded">
                                {resource.resource_type === 'link' ? (
                                  <LinkIcon className="h-5 w-5" />
                                ) : (
                                  <FileText className="h-5 w-5" />
                                )}
                              </div>
                              <div className="flex-grow">
                                <h4 className="font-medium">{resource.title}</h4>
                                {resource.description && (
                                  <p className="text-sm text-muted-foreground">{resource.description}</p>
                                )}
                                {resource.resource_url && (
                                  <a
                                    href={resource.resource_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-primary hover:underline"
                                  >
                                    {resource.resource_url}
                                  </a>
                                )}
                                <p className="text-xs text-muted-foreground mt-1">
                                  {format(new Date(resource.created_at), 'dd/MM/yyyy HH:mm', { locale: vi })}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium">Tham gia nhóm để xem nội dung</h3>
                  <p className="text-muted-foreground mb-4">
                    Bạn cần tham gia nhóm để xem tin nhắn và tài liệu
                  </p>
                  {user ? (
                    <Button onClick={handleJoin}>Tham Gia Ngay</Button>
                  ) : (
                    <Button onClick={() => navigate('/auth')}>Đăng Nhập</Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Members */}
          <div className="w-full lg:w-80">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Thành viên ({members.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-3">
                    {members.map((member) => (
                      <div key={member.id} className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={member.profile?.avatar_url || ''} />
                          <AvatarFallback>
                            {(member.profile?.full_name || 'U')[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-grow">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">
                              {member.profile?.full_name || 'Ẩn danh'}
                            </span>
                            {getRoleBadge(member.role)}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            @{member.profile?.username || 'user'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default StudyGroupDetail;
