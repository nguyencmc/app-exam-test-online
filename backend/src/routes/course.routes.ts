import { Router } from 'express';
import * as CourseController from '../controllers/course.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.get('/', CourseController.getCourses);
router.get('/:id', CourseController.getCourse);

// Protected routes
router.post('/enroll', authMiddleware, CourseController.enrollInCourse);
router.get('/user/enrolled', authMiddleware, CourseController.getUserCourses);

// Admin routes
router.post('/', authMiddleware, CourseController.createCourse);
router.put('/:id', authMiddleware, CourseController.updateCourse);
router.delete('/:id', authMiddleware, CourseController.deleteCourse);

export default router;
