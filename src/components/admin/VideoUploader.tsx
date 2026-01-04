import { useState, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import {
    Upload,
    Video,
    X,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Play
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface VideoUploaderProps {
    onUploadComplete: (url: string) => void;
    currentUrl?: string;
    folder?: string;
    maxSizeMB?: number;
    className?: string;
}

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

const VideoUploader = ({
    onUploadComplete,
    currentUrl,
    folder = 'videos',
    maxSizeMB = 500,
    className,
}: VideoUploaderProps) => {
    const [isDragging, setIsDragging] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [status, setStatus] = useState<UploadStatus>('idle');
    const [previewUrl, setPreviewUrl] = useState<string | null>(currentUrl || null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const acceptedTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];

    const validateFile = (file: File): string | null => {
        if (!acceptedTypes.includes(file.type)) {
            return 'Chỉ hỗ trợ định dạng MP4, WebM, MOV, AVI';
        }
        if (file.size > maxSizeMB * 1024 * 1024) {
            return `Kích thước file vượt quá ${maxSizeMB}MB`;
        }
        return null;
    };

    const uploadFile = async (file: File) => {
        const validationError = validateFile(file);
        if (validationError) {
            setErrorMessage(validationError);
            setStatus('error');
            toast({
                title: 'Lỗi upload',
                description: validationError,
                variant: 'destructive',
            });
            return;
        }

        setStatus('uploading');
        setUploadProgress(0);
        setErrorMessage(null);

        try {
            // Generate unique filename
            const timestamp = Date.now();
            const fileExt = file.name.split('.').pop();
            const fileName = `${folder}/${timestamp}_${Math.random().toString(36).substring(7)}.${fileExt}`;

            // Create a local preview
            const localPreview = URL.createObjectURL(file);
            setPreviewUrl(localPreview);

            // Simulate progress for better UX (actual upload doesn't provide progress)
            const progressInterval = setInterval(() => {
                setUploadProgress((prev) => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return prev;
                    }
                    return prev + Math.random() * 10;
                });
            }, 200);

            // Upload to Supabase Storage
            const { data, error } = await supabase.storage
                .from('course-videos')
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: false,
                });

            clearInterval(progressInterval);

            if (error) {
                throw error;
            }

            // Get public URL
            const { data: urlData } = supabase.storage
                .from('course-videos')
                .getPublicUrl(data.path);

            setUploadProgress(100);
            setStatus('success');
            setPreviewUrl(urlData.publicUrl);
            onUploadComplete(urlData.publicUrl);

            toast({
                title: 'Upload thành công',
                description: 'Video đã được tải lên',
            });
        } catch (error: any) {
            console.error('Upload error:', error);
            setStatus('error');
            setErrorMessage(error.message || 'Không thể upload video');
            toast({
                title: 'Lỗi upload',
                description: error.message || 'Không thể upload video',
                variant: 'destructive',
            });
        }
    };

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        if (file) {
            uploadFile(file);
        }
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            uploadFile(file);
        }
    };

    const handleRemove = () => {
        setPreviewUrl(null);
        setStatus('idle');
        setUploadProgress(0);
        setErrorMessage(null);
        onUploadComplete('');
        if (inputRef.current) {
            inputRef.current.value = '';
        }
    };

    const handleClick = () => {
        if (status !== 'uploading') {
            inputRef.current?.click();
        }
    };

    return (
        <div className={className}>
            <input
                ref={inputRef}
                type="file"
                accept="video/mp4,video/webm,video/quicktime,video/x-msvideo"
                onChange={handleFileSelect}
                className="hidden"
            />

            {previewUrl && status !== 'uploading' ? (
                // Video Preview
                <Card className="relative overflow-hidden">
                    <video
                        src={previewUrl}
                        controls
                        className="w-full aspect-video bg-black"
                    >
                        Your browser does not support the video tag.
                    </video>
                    <div className="absolute top-2 right-2 flex gap-2">
                        {status === 'success' && (
                            <div className="bg-green-500/90 text-white px-2 py-1 rounded-md text-xs flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                Đã upload
                            </div>
                        )}
                        <Button
                            variant="destructive"
                            size="icon"
                            className="h-8 w-8"
                            onClick={handleRemove}
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </Card>
            ) : (
                // Upload Zone
                <Card
                    className={cn(
                        'relative border-2 border-dashed transition-all cursor-pointer',
                        isDragging && 'border-primary bg-primary/5',
                        status === 'error' && 'border-destructive bg-destructive/5',
                        status === 'uploading' && 'pointer-events-none',
                        'hover:border-primary/50 hover:bg-muted/50'
                    )}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={handleClick}
                >
                    <div className="flex flex-col items-center justify-center py-10 px-4">
                        {status === 'uploading' ? (
                            <>
                                <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                                <p className="text-sm text-muted-foreground mb-4">
                                    Đang tải lên... {Math.round(uploadProgress)}%
                                </p>
                                <Progress value={uploadProgress} className="w-full max-w-xs" />
                            </>
                        ) : status === 'error' ? (
                            <>
                                <AlertCircle className="w-12 h-12 text-destructive mb-4" />
                                <p className="text-sm text-destructive font-medium mb-2">
                                    {errorMessage}
                                </p>
                                <Button variant="outline" size="sm">
                                    Thử lại
                                </Button>
                            </>
                        ) : (
                            <>
                                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                    {isDragging ? (
                                        <Video className="w-8 h-8 text-primary" />
                                    ) : (
                                        <Upload className="w-8 h-8 text-primary" />
                                    )}
                                </div>
                                <p className="text-sm font-medium text-foreground mb-1">
                                    {isDragging ? 'Thả video vào đây' : 'Kéo thả video hoặc click để chọn'}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    MP4, WebM, MOV • Tối đa {maxSizeMB}MB
                                </p>
                            </>
                        )}
                    </div>
                </Card>
            )}
        </div>
    );
};

export default VideoUploader;
