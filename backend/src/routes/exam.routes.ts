import { Router } from 'express';
import * as ExamController from '../controllers/exam.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.get('/', ExamController.getExams);
router.get('/category/:categorySlug', ExamController.getExamsByCategory);
router.get('/:idOrSlug', ExamController.getExam);

// Protected routes (require login)
router.post('/attempts', authMiddleware, ExamController.startAttempt);
router.put('/attempts/:attemptId', authMiddleware, ExamController.completeAttempt);
router.get('/user/attempts', authMiddleware, ExamController.getUserAttempts);

// Admin routes
router.get('/admin/all', authMiddleware, ExamController.getAdminExams);
router.post('/', authMiddleware, ExamController.createExam);
router.put('/:id', authMiddleware, ExamController.updateExam);
router.delete('/:id', authMiddleware, ExamController.deleteExam);

export default router;
