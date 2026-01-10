import { Router } from 'express';
import * as FlashcardController from '../controllers/flashcard.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.get('/', FlashcardController.getDecks);
router.get('/:id', FlashcardController.getDeck);

// Protected routes
router.post('/progress', authMiddleware, FlashcardController.updateProgress);

// Admin routes
router.post('/', authMiddleware, FlashcardController.createFlashcard);
router.put('/:id', authMiddleware, FlashcardController.updateFlashcard);
router.delete('/:id', authMiddleware, FlashcardController.deleteFlashcard);

export default router;
