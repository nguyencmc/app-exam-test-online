import { Request, Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';

// Get all published exams (public)
export const getExams = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const pageSize = parseInt(req.query.pageSize as string) || 10;
        const skip = (page - 1) * pageSize;

        const [exams, total] = await Promise.all([
            prisma.exam.findMany({
                where: { isPublished: true },
                include: { category: true },
                orderBy: { createdAt: 'desc' },
                skip,
                take: pageSize,
            }),
            prisma.exam.count({ where: { isPublished: true } }),
        ]);

        res.json({
            data: exams,
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
        });
    } catch (error) {
        console.error('Get exams error:', error);
        res.status(500).json({ error: 'Failed to fetch exams' });
    }
};

// Get all exams for admin
export const getAdminExams = async (req: AuthRequest, res: Response) => {
    try {
        const exams = await prisma.exam.findMany({
            include: { category: true },
            orderBy: { createdAt: 'desc' },
        });
        res.json({ data: exams });
    } catch (error) {
        console.error('Get admin exams error:', error);
        res.status(500).json({ error: 'Failed to fetch exams' });
    }
};

// Get single exam by ID or slug
export const getExam = async (req: Request, res: Response) => {
    try {
        const { idOrSlug } = req.params;

        const exam = await prisma.exam.findFirst({
            where: {
                OR: [{ id: idOrSlug }, { slug: idOrSlug }],
            },
            include: {
                category: true,
                questions: { orderBy: { orderIndex: 'asc' } },
            },
        });

        if (!exam) {
            return res.status(404).json({ error: 'Exam not found' });
        }

        res.json({ data: exam });
    } catch (error) {
        console.error('Get exam error:', error);
        res.status(500).json({ error: 'Failed to fetch exam' });
    }
};

// Get exams by category
export const getExamsByCategory = async (req: Request, res: Response) => {
    try {
        const { categorySlug } = req.params;

        const exams = await prisma.exam.findMany({
            where: {
                isPublished: true,
                category: { slug: categorySlug },
            },
            include: { category: true },
            orderBy: { createdAt: 'desc' },
        });

        res.json({ data: exams });
    } catch (error) {
        console.error('Get exams by category error:', error);
        res.status(500).json({ error: 'Failed to fetch exams' });
    }
};

// Create exam (admin/teacher)
export const createExam = async (req: AuthRequest, res: Response) => {
    try {
        const { title, description, slug, durationMinutes, difficulty, categoryId, isPublished } = req.body;

        const exam = await prisma.exam.create({
            data: {
                title,
                description,
                slug,
                durationMinutes: durationMinutes || 30,
                difficulty: difficulty || 'medium',
                categoryId,
                isPublished: isPublished || false,
            },
        });

        res.status(201).json({ data: exam });
    } catch (error) {
        console.error('Create exam error:', error);
        res.status(500).json({ error: 'Failed to create exam' });
    }
};

// Update exam (admin/teacher)
export const updateExam = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const exam = await prisma.exam.update({
            where: { id },
            data: updateData,
        });

        res.json({ data: exam });
    } catch (error) {
        console.error('Update exam error:', error);
        res.status(500).json({ error: 'Failed to update exam' });
    }
};

// Delete exam (admin)
export const deleteExam = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        await prisma.exam.delete({ where: { id } });

        res.json({ message: 'Exam deleted successfully' });
    } catch (error) {
        console.error('Delete exam error:', error);
        res.status(500).json({ error: 'Failed to delete exam' });
    }
};

// Start exam attempt
export const startAttempt = async (req: AuthRequest, res: Response) => {
    try {
        const { examId } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const attempt = await prisma.examAttempt.create({
            data: {
                examId,
                userId,
            },
        });

        // Increment attempt count
        await prisma.exam.update({
            where: { id: examId },
            data: { attemptCount: { increment: 1 } },
        });

        res.status(201).json({ data: attempt });
    } catch (error) {
        console.error('Start attempt error:', error);
        res.status(500).json({ error: 'Failed to start attempt' });
    }
};

// Complete exam attempt
export const completeAttempt = async (req: AuthRequest, res: Response) => {
    try {
        const { attemptId } = req.params;
        const { score, totalQuestions, answers } = req.body;

        // Save answers
        if (answers && answers.length > 0) {
            await prisma.attemptAnswer.createMany({
                data: answers.map((a: any) => ({
                    attemptId,
                    questionId: a.questionId,
                    selectedAnswer: a.selectedAnswer,
                    isCorrect: a.isCorrect,
                })),
            });
        }

        // Update attempt
        const attempt = await prisma.examAttempt.update({
            where: { id: attemptId },
            data: {
                score,
                totalQuestions,
                completedAt: new Date(),
            },
        });

        res.json({ data: attempt });
    } catch (error) {
        console.error('Complete attempt error:', error);
        res.status(500).json({ error: 'Failed to complete attempt' });
    }
};

// Get user's exam history
export const getUserAttempts = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const attempts = await prisma.examAttempt.findMany({
            where: { userId },
            include: { exam: { select: { title: true, slug: true } } },
            orderBy: { startedAt: 'desc' },
        });

        res.json({ data: attempts });
    } catch (error) {
        console.error('Get user attempts error:', error);
        res.status(500).json({ error: 'Failed to fetch attempts' });
    }
};
