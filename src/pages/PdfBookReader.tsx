import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/modules/auth";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
    ArrowLeft,
    BookOpen,
    ChevronLeft,
    ChevronRight,
    ZoomIn,
    ZoomOut,
    Maximize,
    Minimize,
    Sun,
    Moon,
    Loader2,
    RotateCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import * as pdfjsLib from 'pdfjs-dist';

// Set worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.mjs`;

interface Book {
    id: string;
    title: string;
    slug: string;
    pdf_url: string | null;
    author_name: string | null;
    page_count: number | null;
}

const PdfBookReader = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // PDF state
    const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [scale, setScale] = useState(1.2);
    const [rendering, setRendering] = useState(false);
    const [pageInputValue, setPageInputValue] = useState("1");

    // UI state
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(true);

    // Fetch book
    const { data: book, isLoading: bookLoading } = useQuery({
        queryKey: ["pdf-book-reader", slug],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("books")
                .select("id, title, slug, pdf_url, author_name, page_count")
                .eq("slug", slug)
                .maybeSingle();
            if (error) throw error;
            return data as Book | null;
        },
    });

    // Save reading progress mutation
    const saveProgressMutation = useMutation({
        mutationFn: async (page: number) => {
            if (!book?.id || !user?.id) return;

            await supabase
                .from("user_book_progress")
                .upsert({
                    user_id: user.id,
                    book_id: book.id,
                    current_position: page,
                    last_read_at: new Date().toISOString(),
                }, {
                    onConflict: "user_id,book_id",
                });
        },
    });

    // Load PDF document
    useEffect(() => {
        if (!book?.pdf_url) return;

        const loadPdf = async () => {
            try {
                const loadingTask = pdfjsLib.getDocument(book.pdf_url!);
                const pdf = await loadingTask.promise;
                setPdfDoc(pdf);
                setTotalPages(pdf.numPages);
            } catch (err) {
                console.error("Error loading PDF:", err);
                toast.error("Không thể tải file PDF");
            }
        };

        loadPdf();
    }, [book?.pdf_url]);

    // Render current page
    const renderPage = useCallback(async (pageNum: number) => {
        if (!pdfDoc || !canvasRef.current || rendering) return;

        setRendering(true);

        try {
            const page = await pdfDoc.getPage(pageNum);
            const canvas = canvasRef.current;
            const context = canvas.getContext("2d");

            if (!context) return;

            const viewport = page.getViewport({ scale });

            canvas.height = viewport.height;
            canvas.width = viewport.width;

            const renderContext = {
                canvasContext: context,
                viewport: viewport,
            };

            await page.render(renderContext).promise;
        } catch (err) {
            console.error("Error rendering page:", err);
        } finally {
            setRendering(false);
        }
    }, [pdfDoc, scale, rendering]);

    // Re-render when page or scale changes
    useEffect(() => {
        if (pdfDoc) {
            renderPage(currentPage);
        }
    }, [pdfDoc, currentPage, scale]);

    // Update page input when current page changes
    useEffect(() => {
        setPageInputValue(currentPage.toString());
    }, [currentPage]);

    // Auto-save progress
    useEffect(() => {
        const saveTimer = setTimeout(() => {
            if (user && book) {
                saveProgressMutation.mutate(currentPage);
            }
        }, 5000);

        return () => clearTimeout(saveTimer);
    }, [currentPage, user, book]);

    // Navigation functions
    const goToPage = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const nextPage = () => goToPage(currentPage + 1);
    const prevPage = () => goToPage(currentPage - 1);

    const handlePageInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            const page = parseInt(pageInputValue);
            if (!isNaN(page)) {
                goToPage(page);
            }
        }
    };

    // Zoom functions
    const zoomIn = () => setScale((s) => Math.min(s + 0.2, 3));
    const zoomOut = () => setScale((s) => Math.max(s - 0.2, 0.5));
    const resetZoom = () => setScale(1.2);

    // Fullscreen toggle
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            switch (e.key) {
                case "ArrowRight":
                case " ":
                    e.preventDefault();
                    nextPage();
                    break;
                case "ArrowLeft":
                    e.preventDefault();
                    prevPage();
                    break;
                case "+":
                case "=":
                    zoomIn();
                    break;
                case "-":
                    zoomOut();
                    break;
                case "f":
                    toggleFullscreen();
                    break;
                case "Escape":
                    if (isFullscreen) {
                        setIsFullscreen(false);
                    }
                    break;
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [currentPage, totalPages, isFullscreen]);

    // Hide controls on inactivity
    useEffect(() => {
        let timeout: NodeJS.Timeout;

        const handleMouseMove = () => {
            setShowControls(true);
            clearTimeout(timeout);
            timeout = setTimeout(() => setShowControls(false), 3000);
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            clearTimeout(timeout);
        };
    }, []);

    if (bookLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <BookOpen className="h-12 w-12 text-primary" />
                    <p className="text-muted-foreground">Đang tải sách...</p>
                </div>
            </div>
        );
    }

    if (!book || !book.pdf_url) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background">
                <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
                <h1 className="text-2xl font-bold text-foreground mb-2">Không tìm thấy sách</h1>
                <p className="text-muted-foreground mb-6">Sách này chưa có file PDF.</p>
                <Button onClick={() => navigate("/books")}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Quay lại
                </Button>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className={cn(
                "min-h-screen transition-colors duration-300 flex flex-col",
                isDarkMode ? "bg-zinc-900" : "bg-zinc-100"
            )}
        >
            {/* Top Bar */}
            <header
                className={cn(
                    "fixed top-0 left-0 right-0 z-50 transition-opacity duration-300",
                    isDarkMode ? "bg-zinc-900/95" : "bg-white/95",
                    "border-b",
                    isDarkMode ? "border-zinc-800" : "border-zinc-200",
                    showControls ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
            >
                <div className="container mx-auto px-4 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                                saveProgressMutation.mutate(currentPage);
                                navigate(`/book/${slug}`);
                            }}
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div className="hidden sm:block">
                            <h1 className={cn(
                                "text-sm font-medium line-clamp-1 max-w-[200px]",
                                isDarkMode ? "text-white" : "text-zinc-900"
                            )}>
                                {book.title}
                            </h1>
                            <p className="text-xs text-muted-foreground">{book.author_name}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Page Navigation */}
                        <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" onClick={prevPage} disabled={currentPage <= 1}>
                                <ChevronLeft className="h-5 w-5" />
                            </Button>
                            <div className="flex items-center gap-1">
                                <Input
                                    type="text"
                                    value={pageInputValue}
                                    onChange={(e) => setPageInputValue(e.target.value)}
                                    onKeyDown={handlePageInput}
                                    className="w-12 h-8 text-center text-sm"
                                />
                                <span className={cn(
                                    "text-sm",
                                    isDarkMode ? "text-zinc-400" : "text-zinc-600"
                                )}>
                                    / {totalPages}
                                </span>
                            </div>
                            <Button variant="ghost" size="icon" onClick={nextPage} disabled={currentPage >= totalPages}>
                                <ChevronRight className="h-5 w-5" />
                            </Button>
                        </div>

                        <div className="h-6 w-px bg-border mx-1" />

                        {/* Zoom Controls */}
                        <Button variant="ghost" size="icon" onClick={zoomOut}>
                            <ZoomOut className="h-4 w-4" />
                        </Button>
                        <span className={cn(
                            "text-xs w-12 text-center",
                            isDarkMode ? "text-zinc-400" : "text-zinc-600"
                        )}>
                            {Math.round(scale * 100)}%
                        </span>
                        <Button variant="ghost" size="icon" onClick={zoomIn}>
                            <ZoomIn className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={resetZoom}>
                            <RotateCw className="h-4 w-4" />
                        </Button>

                        <div className="h-6 w-px bg-border mx-1" />

                        {/* Theme & Fullscreen */}
                        <Button variant="ghost" size="icon" onClick={() => setIsDarkMode(!isDarkMode)}>
                            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={toggleFullscreen}>
                            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                        </Button>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="h-1 bg-muted">
                    <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${(currentPage / totalPages) * 100}%` }}
                    />
                </div>
            </header>

            {/* PDF Canvas */}
            <main className="flex-1 flex items-center justify-center pt-16 pb-4 overflow-auto">
                <div className="relative">
                    {rendering && (
                        <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    )}
                    <canvas
                        ref={canvasRef}
                        className={cn(
                            "shadow-2xl",
                            isDarkMode ? "shadow-black/50" : "shadow-zinc-400/50"
                        )}
                    />
                </div>
            </main>

            {/* Bottom Navigation (Mobile) */}
            <footer
                className={cn(
                    "fixed bottom-0 left-0 right-0 z-50 sm:hidden transition-opacity duration-300",
                    isDarkMode ? "bg-zinc-900/95" : "bg-white/95",
                    "border-t",
                    isDarkMode ? "border-zinc-800" : "border-zinc-200",
                    showControls ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
            >
                <div className="flex items-center justify-between p-2">
                    <Button variant="ghost" size="sm" onClick={prevPage} disabled={currentPage <= 1}>
                        <ChevronLeft className="h-5 w-5" />
                        Trước
                    </Button>
                    <span className={cn(
                        "text-sm font-medium",
                        isDarkMode ? "text-white" : "text-zinc-900"
                    )}>
                        {currentPage} / {totalPages}
                    </span>
                    <Button variant="ghost" size="sm" onClick={nextPage} disabled={currentPage >= totalPages}>
                        Sau
                        <ChevronRight className="h-5 w-5" />
                    </Button>
                </div>
            </footer>
        </div>
    );
};

export default PdfBookReader;
