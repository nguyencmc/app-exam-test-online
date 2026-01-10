import { Request, Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';

// Get all public flashcard sets
export const getDecks = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const pageSize = parseInt(req.query.pageSize as string) || 10;
        const skip = (page - 1) * pageSize;

        const [decks, total] = await Promise.all([
            prisma.flashcardSet.findMany({
                where: { isPublic: true },
                orderBy: { createdAt: 'desc' },
                skip,
                take: pageSize,
            }),
            prisma.flashcardSet.count({ where: { isPublic: true } }),
        ]);

        res.json({
            data: decks,
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
        });
    } catch (error) {
        console.error('Get decks error:', error);
        res.status(500).json({ error: 'Failed to fetch decks' });
    }
};

// Get deck by ID with flashcards
export const getDeck = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const deck = await prisma.flashcardSet.findUnique({
            where: { id },
            include: {
                flashcards: { orderBy: { cardOrder: 'asc' } },
            },
        });

        if (!deck) {
            return res.status(404).json({ error: 'Deck not found' });
        }

        res.json({ data: deck });
    } catch (error) {
        console.error('Get deck error:', error);
        res.status(500).json({ error: 'Failed to fetch deck' });
    }
};

// Create flashcard
export const createFlashcard = async (req: AuthRequest, res: Response) => {
    try {
        const flashcard = await prisma.flashcard.create({
            data: req.body,
        });
        res.status(201).json({ data: flashcard });
    } catch (error) {
        console.error('Create flashcard error:', error);
        res.status(500).json({ error: 'Failed to create flashcard' });
    }
};

// Update flashcard
export const updateFlashcard = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const flashcard = await prisma.flashcard.update({
            where: { id },
            data: req.body,
        });
        res.json({ data: flashcard });
    } catch (error) {
        console.error('Update flashcard error:', error);
        res.status(500).json({ error: 'Failed to update flashcard' });
    }
};

// Delete flashcard
export const deleteFlashcard = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.flashcard.delete({ where: { id } });
        res.json({ message: 'Flashcard deleted successfully' });
    } catch (error) {
        console.error('Delete flashcard error:', error);
        res.status(500).json({ error: 'Failed to delete flashcard' });
    }
};

// Update flashcard progress
export const updateProgress = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const { flashcardId, quality } = req.body;

        if (!userId) return res.status(401).json({ error: 'Not authenticated' });

        const isRemembered = quality >= 3;

        await prisma.flashcardProgress.upsert({
            where: {
                userId_flashcardId: { userId, flashcardId },
            },
            create: {
                userId,
                flashcardId,
                isRemembered,
                reviewCount: 1,
                lastReviewedAt: new Date(),
            },
            update: {
                isRemembered,
                reviewCount: { increment: 1 },
                lastReviewedAt: new Date(),
            },
        });

        res.json({ message: 'Progress updated' });
    } catch (error) {
        console.error('Update progress error:', error);
        res.status(500).json({ error: 'Failed to update progress' });
    }
};
