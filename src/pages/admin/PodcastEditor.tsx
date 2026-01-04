import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Headphones, 
  ArrowLeft,
  Save,
  Upload,
  FileText,
  Clock,
  Plus,
  Trash2,
  Info,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from '@/hooks/use-toast';

interface PodcastCategory {
  id: string;
  name: string;
}

const PodcastEditor = () => {
  const { id } = useParams();
  const isEditing = !!id;
  const { isAdmin, isTeacher, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [categories, setCategories] = useState<PodcastCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Podcast fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [durationMinutes, setDurationMinutes] = useState(5);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [audioUrl, setAudioUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [transcript, setTranscript] = useState('');
  const [hostName, setHostName] = useState('The Best Study');
  const [episodeNumber, setEpisodeNumber] = useState(1);

  const hasAccess = isAdmin || isTeacher;

  useEffect(() => {
    if (!roleLoading && !hasAccess) {
      navigate('/');
    }
  }, [hasAccess, roleLoading, navigate]);

  useEffect(() => {
    fetchCategories();
    if (isEditing) {
      fetchPodcast();
    }
  }, [id]);

  const fetchCategories = async () => {
    const { data } = await supabase.from('podcast_categories').select('id, name');
    setCategories(data || []);
  };

  const fetchPodcast = async () => {
    setLoading(true);
    
    const { data: podcast, error } = await supabase
      .from('podcasts')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !podcast) {
      toast({
        title: "Lỗi",
        description: "Không tìm thấy podcast",
        variant: "destructive",
      });
      navigate('/admin/podcasts');
      return;
    }

    setTitle(podcast.title);
    setSlug(podcast.slug);
    setDescription(podcast.description || '');
    setCategoryId(podcast.category_id || '');
    setDifficulty(podcast.difficulty || 'intermediate');
    setAudioUrl(podcast.audio_url || '');
    setThumbnailUrl(podcast.thumbnail_url || '');
    setTranscript(podcast.transcript || '');
    setHostName(podcast.host_name || 'The Best Study');
    setEpisodeNumber(podcast.episode_number || 1);
    
    const totalSeconds = podcast.duration_seconds || 0;
    setDurationMinutes(Math.floor(totalSeconds / 60));
    setDurationSeconds(totalSeconds % 60);
    
    setLoading(false);
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!isEditing) {
      setSlug(generateSlug(value));
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !slug.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập tiêu đề và slug",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    const totalDurationSeconds = (durationMinutes * 60) + durationSeconds;

    try {
      if (isEditing) {
        const { error } = await supabase
          .from('podcasts')
          .update({
            title,
            slug,
            description: description || null,
            category_id: categoryId || null,
            difficulty,
            duration_seconds: totalDurationSeconds,
            audio_url: audioUrl || null,
            thumbnail_url: thumbnailUrl || null,
            transcript: transcript || null,
            host_name: hostName,
            episode_number: episodeNumber,
          })
          .eq('id', id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('podcasts')
          .insert({
            title,
            slug,
            description: description || null,
            category_id: categoryId || null,
            difficulty,
            duration_seconds: totalDurationSeconds,
            audio_url: audioUrl || null,
            thumbnail_url: thumbnailUrl || null,
            transcript: transcript || null,
            host_name: hostName,
            episode_number: episodeNumber,
          });

        if (error) throw error;
      }

      toast({
        title: "Thành công",
        description: isEditing ? "Đã cập nhật podcast" : "Đã tạo podcast mới",
      });

      navigate('/admin/podcasts');
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể lưu podcast",
        variant: "destructive",
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
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/admin/podcasts">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <Headphones className="w-8 h-8 text-pink-500" />
                {isEditing ? 'Chỉnh sửa podcast' : 'Tạo podcast mới'}
              </h1>
            </div>
          </div>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            <Save className="w-4 h-4" />
            {saving ? 'Đang lưu...' : 'Lưu podcast'}
          </Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Basic Info */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Thông tin cơ bản</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Tiêu đề *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Nhập tiêu đề podcast"
                />
              </div>

              <div>
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="ten-podcast"
                />
              </div>

              <div>
                <Label htmlFor="description">Mô tả</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mô tả về podcast"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Danh mục</Label>
                  <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn danh mục" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="difficulty">Độ khó</Label>
                  <Select value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Người mới</SelectItem>
                      <SelectItem value="intermediate">Trung cấp</SelectItem>
                      <SelectItem value="advanced">Nâng cao</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="host">Host</Label>
                  <Input
                    id="host"
                    value={hostName}
                    onChange={(e) => setHostName(e.target.value)}
                    placeholder="Tên host"
                  />
                </div>

                <div>
                  <Label htmlFor="episode">Số tập</Label>
                  <Input
                    id="episode"
                    type="number"
                    value={episodeNumber}
                    onChange={(e) => setEpisodeNumber(parseInt(e.target.value) || 1)}
                    min={1}
                  />
                </div>
              </div>

              <div>
                <Label>Thời lượng</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 0)}
                    min={0}
                    className="w-20"
                  />
                  <span className="text-muted-foreground">phút</span>
                  <Input
                    type="number"
                    value={durationSeconds}
                    onChange={(e) => setDurationSeconds(parseInt(e.target.value) || 0)}
                    min={0}
                    max={59}
                    className="w-20"
                  />
                  <span className="text-muted-foreground">giây</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Media & Content */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Media & Nội dung</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="audio-url">URL Audio</Label>
                <Input
                  id="audio-url"
                  value={audioUrl}
                  onChange={(e) => setAudioUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>

              <div>
                <Label htmlFor="thumbnail-url">URL Thumbnail</Label>
                <Input
                  id="thumbnail-url"
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Transcript Section */}
          <Card className="border-border/50 lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Transcript với Timestamps
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Nhập transcript với timestamps để đồng bộ hiển thị chữ theo audio
                  </CardDescription>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Info className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm">
                    <p className="font-medium mb-2">Định dạng Transcript:</p>
                    <p className="text-xs mb-2">Mỗi dòng có thể bắt đầu với timestamp:</p>
                    <code className="text-xs bg-muted p-1 rounded block mb-1">[00:00] Xin chào các bạn</code>
                    <code className="text-xs bg-muted p-1 rounded block mb-1">[00:05] Đây là bài học hôm nay</code>
                    <code className="text-xs bg-muted p-1 rounded block">[01:30] Cảm ơn đã theo dõi</code>
                  </TooltipContent>
                </Tooltip>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Quick timestamp buttons */}
              <div className="flex flex-wrap gap-2 pb-2">
                <Badge variant="outline" className="text-xs">
                  Định dạng: [MM:SS] Nội dung
                </Badge>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const mins = durationMinutes.toString().padStart(2, '0');
                    const secs = durationSeconds.toString().padStart(2, '0');
                    setTranscript(prev => prev + (prev ? '\n' : '') + `[${mins}:${secs}] `);
                  }}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Thêm timestamp cuối
                </Button>
              </div>

              {/* Transcript input */}
              <Textarea
                id="transcript"
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder={`[00:00] Xin chào các bạn, đây là podcast học tiếng Anh
[00:05] Hôm nay chúng ta sẽ học về chủ đề...
[00:15] Từ vựng đầu tiên là "vocabulary"
[00:30] Nghĩa là từ vựng trong tiếng Việt
[01:00] Hãy cùng luyện tập phát âm...`}
                className="min-h-[300px] font-mono text-sm"
              />

              {/* Transcript preview */}
              {transcript && (
                <div className="mt-4">
                  <Label className="mb-2 block">Xem trước Transcript</Label>
                  <div className="border rounded-lg p-4 bg-muted/50 max-h-[200px] overflow-y-auto">
                    {transcript.split('\n').map((line, index) => {
                      const timestampMatch = line.match(/^\[(\d{1,2}):(\d{2})\]/);
                      if (timestampMatch) {
                        const time = timestampMatch[0];
                        const content = line.replace(timestampMatch[0], '').trim();
                        return (
                          <div key={index} className="flex gap-2 mb-2">
                            <Badge variant="secondary" className="shrink-0 font-mono">
                              <Clock className="w-3 h-3 mr-1" />
                              {time.replace('[', '').replace(']', '')}
                            </Badge>
                            <span className="text-sm">{content}</span>
                          </div>
                        );
                      }
                      return line.trim() ? (
                        <p key={index} className="text-sm text-muted-foreground mb-2">{line}</p>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span>{transcript.split('\n').filter(l => l.trim()).length} dòng</span>
                <span>{transcript.length} ký tự</span>
                <span>
                  {transcript.match(/\[\d{1,2}:\d{2}\]/g)?.length || 0} timestamps
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default PodcastEditor;
