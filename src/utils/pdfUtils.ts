import * as pdfjsLib from 'pdfjs-dist';

// Set worker source - v4.x uses .mjs extension
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.mjs`;

export interface PdfPage {
    pageNumber: number;
    text: string;
}

export interface PdfMetadata {
    title?: string;
    author?: string;
    subject?: string;
    pageCount: number;
}

export interface PdfChapter {
    title: string;
    content: string;
    startPage: number;
    endPage: number;
}

/**
 * Extract text content from all pages of a PDF file
 */
export async function extractTextFromPdf(file: File): Promise<PdfPage[]> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    const pages: PdfPage[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const text = textContent.items
            .map((item: any) => item.str)
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim();

        pages.push({
            pageNumber: i,
            text
        });
    }

    return pages;
}

/**
 * Extract metadata from PDF file
 */
export async function extractPdfMetadata(file: File): Promise<PdfMetadata> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const metadata = await pdf.getMetadata();

    const info = metadata.info as any;

    return {
        title: info?.Title || undefined,
        author: info?.Author || undefined,
        subject: info?.Subject || undefined,
        pageCount: pdf.numPages
    };
}

/**
 * Auto-split pages into chapters based on common patterns
 * Looks for patterns like: "Chapter 1", "Chương 1", "PART I", headings with all caps, etc.
 */
export function splitIntoChapters(pages: PdfPage[]): PdfChapter[] {
    const chapterPatterns = [
        /^(chapter|chương|phần|bài|part)\s*\d+/i,
        /^(chapter|chương|phần|bài|part)\s+[IVXLCDM]+/i,
        /^\d+\.\s+[A-Z]/,
        /^[IVXLCDM]+\.\s+/
    ];

    const chapters: PdfChapter[] = [];
    let currentChapter: PdfChapter | null = null;

    pages.forEach((page, index) => {
        const lines = page.text.split(/[.!?]\s+/);
        const firstLine = lines[0]?.trim() || '';

        // Check if this page starts a new chapter
        const isChapterStart = chapterPatterns.some(pattern => pattern.test(firstLine));

        if (isChapterStart || index === 0) {
            // Save previous chapter
            if (currentChapter) {
                currentChapter.endPage = page.pageNumber - 1;
                chapters.push(currentChapter);
            }

            // Start new chapter
            currentChapter = {
                title: isChapterStart ? firstLine.slice(0, 100) : `Phần ${chapters.length + 1}`,
                content: page.text,
                startPage: page.pageNumber,
                endPage: page.pageNumber
            };
        } else if (currentChapter) {
            // Append to current chapter
            currentChapter.content += '\n\n' + page.text;
            currentChapter.endPage = page.pageNumber;
        }
    });

    // Add last chapter
    if (currentChapter) {
        chapters.push(currentChapter);
    }

    // If no chapters detected, create one chapter per page or group pages
    if (chapters.length === 0 && pages.length > 0) {
        const pagesPerChapter = Math.ceil(pages.length / Math.min(10, pages.length));

        for (let i = 0; i < pages.length; i += pagesPerChapter) {
            const chapterPages = pages.slice(i, i + pagesPerChapter);
            chapters.push({
                title: `Phần ${Math.floor(i / pagesPerChapter) + 1}`,
                content: chapterPages.map(p => p.text).join('\n\n'),
                startPage: chapterPages[0].pageNumber,
                endPage: chapterPages[chapterPages.length - 1].pageNumber
            });
        }
    }

    return chapters;
}

/**
 * Generate a URL-friendly slug from text
 */
export function generateSlug(text: string): string {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
        .replace(/đ/g, 'd')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 100);
}
