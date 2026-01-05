import { useState, useRef, useCallback } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Upload,
    FileText,
    Loader2,
    CheckCircle,
    BookOpen,
    User,
    Layers,
    AlertCircle,
    X,
    FileUp,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import * as pdfjsLib from 'pdfjs-dist';

// Set worker source - v4.x uses .mjs extension
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.mjs`;

interface BookCategory {
    id: string;
    name: string;
}

interface PdfImportDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    categories: BookCategory[];
    onSuccess: () => void;
}

type ImportStep = 'upload' | 'preview' | 'configure' | 'importing' | 'done';

// Generate a URL-friendly slug from text
function generateSlug(text: string): string {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 100);
}

export function PdfImportDialog({
    open,
    onOpenChange,
    categories,
    onSuccess,
}: PdfImportDialogProps) {
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [step, setStep] = useState<ImportStep>('upload');
    const [file, setFile] = useState<File | null>(null);
    const [pageCount, setPageCount] = useState<number>(0);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);

    // Form fields
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [description, setDescription] = useState('');
    const [categoryId, setCategoryId] = useState<string>('');
    const [difficulty, setDifficulty] = useState<string>('beginner');

    const resetState = useCallback(() => {
        setStep('upload');
        setFile(null);
        setPageCount(0);
        setLoading(false);
        setProgress(0);
        setError(null);
        setTitle('');
        setAuthor('');
        setDescription('');
        setCategoryId('');
        setDifficulty('beginner');
    }, []);

    const handleFileSelect = useCallback(async (selectedFile: File) => {
        if (!selectedFile.type.includes('pdf')) {
            setError('Vui lòng chọn file PDF');
            return;
        }

        setFile(selectedFile);
        setLoading(true);
        setError(null);
        setStep('preview');

        try {
            // Extract metadata using pdfjs
            const arrayBuffer = await selectedFile.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            const metadata = await pdf.getMetadata();
            const info = metadata.info as any;

            setPageCount(pdf.numPages);

            // Auto-fill form fields
            setTitle(info?.Title || selectedFile.name.replace('.pdf', ''));
            setAuthor(info?.Author || '');

            setProgress(100);
            setStep('configure');
        } catch (err) {
            console.error('PDF metadata error:', err);
            // Still allow import even if metadata extraction fails
            setTitle(selectedFile.name.replace('.pdf', ''));
            setPageCount(0);
            setStep('configure');
        } finally {
            setLoading(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            handleFileSelect(droppedFile);
        }
    }, [handleFileSelect]);

    const handleImport = async () => {
        if (!file) return;

        setLoading(true);
        setStep('importing');
        setProgress(0);

        try {
            // Step 1: Upload PDF to Supabase Storage
            const fileExt = 'pdf';
            const fileName = `${generateSlug(title)}-${Date.now()}.${fileExt}`;
            const filePath = `books/${fileName}`;

            setProgress(20);

            const { error: uploadError } = await supabase.storage
                .from('books')
                .upload(filePath, file, {
                    contentType: 'application/pdf',
                    upsert: false,
                });

            if (uploadError) {
                // If bucket doesn't exist, show helpful error
                if (uploadError.message.includes('Bucket not found')) {
                    throw new Error('Storage bucket "books" chưa được tạo. Vui lòng tạo bucket trong Supabase Dashboard.');
                }
                throw uploadError;
            }

            setProgress(50);

            // Step 2: Get public URL
            const { data: urlData } = supabase.storage
                .from('books')
                .getPublicUrl(filePath);

            const pdfUrl = urlData.publicUrl;

            setProgress(70);

            // Step 3: Create book record
            const slug = generateSlug(title) + '-' + Date.now();

            const { error: bookError } = await supabase
                .from('books')
                .insert({
                    title,
                    slug,
                    author_name: author || null,
                    description: description || null,
                    category_id: categoryId || null,
                    difficulty,
                    page_count: pageCount || null,
                    pdf_url: pdfUrl,
                    is_featured: false,
                });

            if (bookError) throw bookError;

            setProgress(100);
            setStep('done');

            toast({
                title: 'Import thành công!',
                description: `Đã tạo sách "${title}"`,
            });

            // Close and refresh after a short delay
            setTimeout(() => {
                onSuccess();
                onOpenChange(false);
                resetState();
            }, 1500);
        } catch (err: any) {
            console.error('Import error:', err);
            setError(err.message || 'Không thể tạo sách. Vui lòng thử lại.');
            setStep('configure');
            toast({
                title: 'Lỗi',
                description: err.message || 'Không thể import sách',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) {
            onOpenChange(false);
            resetState();
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Upload className="w-5 h-5 text-primary" />
                        Import Sách từ PDF
                    </DialogTitle>
                    <DialogDescription>
                        {step === 'upload' && 'Chọn file PDF để upload và tạo sách mới'}
                        {step === 'preview' && 'Đang phân tích file PDF...'}
                        {step === 'configure' && 'Điền thông tin sách và xác nhận'}
                        {step === 'importing' && 'Đang upload và tạo sách...'}
                        {step === 'done' && 'Import hoàn tất!'}
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    {/* Upload Step */}
                    {step === 'upload' && (
                        <div
                            className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors"
                            onClick={() => fileInputRef.current?.click()}
                            onDrop={handleDrop}
                            onDragOver={(e) => e.preventDefault()}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf"
                                className="hidden"
                                onChange={(e) => {
                                    const f = e.target.files?.[0];
                                    if (f) handleFileSelect(f);
                                }}
                            />
                            <FileUp className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                            <p className="text-lg font-medium mb-2">
                                Kéo thả file PDF vào đây
                            </p>
                            <p className="text-sm text-muted-foreground mb-4">
                                hoặc click để chọn file
                            </p>
                            <Button variant="outline" size="sm">
                                <Upload className="w-4 h-4 mr-2" />
                                Chọn file PDF
                            </Button>

                            {error && (
                                <div className="mt-4 flex items-center gap-2 text-destructive justify-center">
                                    <AlertCircle className="w-4 h-4" />
                                    <span className="text-sm">{error}</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Preview/Loading Step */}
                    {step === 'preview' && (
                        <div className="text-center py-8">
                            <Loader2 className="w-12 h-12 mx-auto text-primary animate-spin mb-4" />
                            <p className="text-lg font-medium mb-2">Đang phân tích PDF...</p>
                            <Progress value={progress} className="w-48 mx-auto" />
                        </div>
                    )}

                    {/* Configure Step */}
                    {step === 'configure' && (
                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                            {/* File Info */}
                            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                                <FileText className="w-8 h-8 text-primary" />
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate">{file?.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {formatFileSize(file?.size || 0)} • {pageCount > 0 ? `${pageCount} trang` : 'Đang xử lý...'}
                                    </p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                        setStep('upload');
                                        setFile(null);
                                    }}
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>

                            {/* Form Fields */}
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title" className="flex items-center gap-2">
                                        <BookOpen className="w-4 h-4" />
                                        Tiêu đề sách *
                                    </Label>
                                    <Input
                                        id="title"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Nhập tiêu đề sách"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="author" className="flex items-center gap-2">
                                        <User className="w-4 h-4" />
                                        Tác giả
                                    </Label>
                                    <Input
                                        id="author"
                                        value={author}
                                        onChange={(e) => setAuthor(e.target.value)}
                                        placeholder="Nhập tên tác giả"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Mô tả</Label>
                                    <Textarea
                                        id="description"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Mô tả ngắn về sách"
                                        rows={3}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2">
                                            <Layers className="w-4 h-4" />
                                            Danh mục
                                        </Label>
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

                                    <div className="space-y-2">
                                        <Label>Độ khó</Label>
                                        <Select value={difficulty} onValueChange={setDifficulty}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="beginner">Cơ bản</SelectItem>
                                                <SelectItem value="intermediate">Trung cấp</SelectItem>
                                                <SelectItem value="advanced">Nâng cao</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <div className="flex items-center gap-2 text-destructive p-3 bg-destructive/10 rounded-lg">
                                    <AlertCircle className="w-4 h-4" />
                                    <span className="text-sm">{error}</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Importing Step */}
                    {step === 'importing' && (
                        <div className="text-center py-8">
                            <Loader2 className="w-12 h-12 mx-auto text-primary animate-spin mb-4" />
                            <p className="text-lg font-medium mb-2">Đang upload và tạo sách...</p>
                            <Progress value={progress} className="w-48 mx-auto" />
                            <p className="text-sm text-muted-foreground mt-2">
                                {progress < 50 ? 'Đang upload file...' : 'Đang lưu thông tin...'}
                            </p>
                        </div>
                    )}

                    {/* Done Step */}
                    {step === 'done' && (
                        <div className="text-center py-8">
                            <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
                            <p className="text-xl font-medium mb-2">Import thành công!</p>
                            <p className="text-muted-foreground">
                                Sách "{title}" đã được tạo
                            </p>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    {step === 'upload' && (
                        <Button variant="outline" onClick={handleClose}>
                            Hủy
                        </Button>
                    )}

                    {step === 'configure' && (
                        <>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setStep('upload');
                                    setFile(null);
                                }}
                            >
                                Chọn file khác
                            </Button>
                            <Button
                                onClick={handleImport}
                                disabled={!title.trim() || loading}
                            >
                                <Upload className="w-4 h-4 mr-2" />
                                Import sách
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
