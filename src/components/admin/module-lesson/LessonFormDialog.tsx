import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2 } from 'lucide-react';
import VideoUploader from '@/components/admin/VideoUploader';

export interface LessonFormData {
    title: string;
    description: string;
    type: 'video' | 'article' | 'quiz' | 'exercise';
    content_url: string;
    duration_minutes: number;
    is_preview: boolean;
}

interface LessonFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    isEditing: boolean;
    formData: LessonFormData;
    onFormChange: (data: LessonFormData) => void;
    onSave: () => void;
    saving: boolean;
    courseId: string;
}

export const LessonFormDialog = ({
    open,
    onOpenChange,
    isEditing,
    formData,
    onFormChange,
    onSave,
    saving,
    courseId,
}: LessonFormDialogProps) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? 'Chỉnh sửa bài học' : 'Thêm bài học mới'}
                    </DialogTitle>
                    <DialogDescription>
                        Nhập thông tin và nội dung cho bài học
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <Label htmlFor="lesson-title">Tên bài học *</Label>
                            <Input
                                id="lesson-title"
                                value={formData.title}
                                onChange={(e) => onFormChange({ ...formData, title: e.target.value })}
                                placeholder="VD: Bài 1: Cài đặt môi trường"
                            />
                        </div>

                        <div>
                            <Label htmlFor="lesson-type">Loại bài học</Label>
                            <Select
                                value={formData.type}
                                onValueChange={(v: any) => onFormChange({ ...formData, type: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="video">🎬 Video</SelectItem>
                                    <SelectItem value="article">📝 Bài viết</SelectItem>
                                    <SelectItem value="quiz">❓ Quiz</SelectItem>
                                    <SelectItem value="exercise">✏️ Bài tập</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="lesson-duration">Thời lượng (phút)</Label>
                            <Input
                                id="lesson-duration"
                                type="number"
                                value={formData.duration_minutes}
                                onChange={(e) => onFormChange({ ...formData, duration_minutes: Number(e.target.value) })}
                                min={0}
                            />
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="lesson-desc">Mô tả</Label>
                        <Textarea
                            id="lesson-desc"
                            value={formData.description}
                            onChange={(e) => onFormChange({ ...formData, description: e.target.value })}
                            placeholder="Mô tả ngắn về nội dung bài học..."
                            rows={2}
                        />
                    </div>

                    {formData.type === 'video' && (
                        <div>
                            <Label>Video</Label>
                            <div className="mt-2 space-y-3">
                                <VideoUploader
                                    currentUrl={formData.content_url}
                                    folder={`courses/${courseId}`}
                                    onUploadComplete={(url) => onFormChange({ ...formData, content_url: url })}
                                />
                                <div className="text-center text-sm text-muted-foreground">hoặc</div>
                                <Input
                                    value={formData.content_url}
                                    onChange={(e) => onFormChange({ ...formData, content_url: e.target.value })}
                                    placeholder="Nhập URL video (YouTube, Vimeo, MP4...)"
                                />
                            </div>
                        </div>
                    )}

                    {formData.type === 'article' && (
                        <div>
                            <Label htmlFor="article-content">Nội dung bài viết (HTML)</Label>
                            <Textarea
                                id="article-content"
                                value={formData.content_url}
                                onChange={(e) => onFormChange({ ...formData, content_url: e.target.value })}
                                placeholder="<h1>Tiêu đề</h1><p>Nội dung...</p>"
                                rows={6}
                                className="font-mono text-sm"
                            />
                        </div>
                    )}

                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                            <Label htmlFor="is-preview" className="cursor-pointer">Cho phép xem trước</Label>
                            <p className="text-sm text-muted-foreground">
                                Người dùng chưa đăng ký có thể xem bài học này
                            </p>
                        </div>
                        <Switch
                            id="is-preview"
                            checked={formData.is_preview}
                            onCheckedChange={(v) => onFormChange({ ...formData, is_preview: v })}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Hủy
                    </Button>
                    <Button onClick={onSave} disabled={saving}>
                        {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        {isEditing ? 'Cập nhật' : 'Thêm'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
