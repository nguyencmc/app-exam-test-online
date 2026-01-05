import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Clock,
    CheckCircle2,
    AlertCircle,
    GripVertical,
    Edit,
    Trash2,
    Video,
    FileText,
    HelpCircle,
} from 'lucide-react';

export interface Lesson {
    id: string;
    module_id: string;
    title: string;
    description: string | null;
    type: 'video' | 'article' | 'quiz' | 'exercise';
    content_url: string | null;
    duration_minutes: number;
    order_index: number;
    is_preview: boolean;
}

const lessonTypeIcons = {
    video: Video,
    article: FileText,
    quiz: HelpCircle,
    exercise: Edit,
};

const lessonTypeLabels = {
    video: 'Video',
    article: 'Bài viết',
    quiz: 'Quiz',
    exercise: 'Bài tập',
};

interface LessonItemProps {
    lesson: Lesson;
    onEdit: () => void;
    onDelete: () => void;
}

export const LessonItem = ({ lesson, onEdit, onDelete }: LessonItemProps) => {
    const Icon = lessonTypeIcons[lesson.type];
    const hasContent = !!lesson.content_url;

    return (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group">
            <GripVertical className="w-4 h-4 text-muted-foreground/30 opacity-0 group-hover:opacity-100" />
            <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate flex items-center gap-2">
                    {lesson.title}
                    {lesson.is_preview && (
                        <Badge variant="secondary" className="text-xs">Preview</Badge>
                    )}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{lessonTypeLabels[lesson.type]}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {lesson.duration_minutes} phút
                    </span>
                    {lesson.type === 'video' && (
                        <>
                            <span>•</span>
                            {hasContent ? (
                                <span className="flex items-center gap-1 text-green-600">
                                    <CheckCircle2 className="w-3 h-3" />
                                    Có video
                                </span>
                            ) : (
                                <span className="flex items-center gap-1 text-orange-500">
                                    <AlertCircle className="w-3 h-3" />
                                    Chưa có video
                                </span>
                            )}
                        </>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={onEdit}
                >
                    <Edit className="w-4 h-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={onDelete}
                >
                    <Trash2 className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
};
