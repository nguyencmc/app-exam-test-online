import { Request, Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';

// Get all published courses
export const getCourses = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const pageSize = parseInt(req.query.pageSize as string) || 10;
        const category = req.query.category as string;
        const search = req.query.search as string;
        const skip = (page - 1) * pageSize;

        const where: any = {};
        if (category && category !== 'all') where.category = category;
        if (search) where.title = { contains: search, mode: 'insensitive' };

        const [courses, total] = await Promise.all([
            prisma.course.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: pageSize,
            }),
            prisma.course.count({ where }),
        ]);

        res.json({
            data: courses,
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
        });
    } catch (error) {
        console.error('Get courses error:', error);
        res.status(500).json({ error: 'Failed to fetch courses' });
    }
};

// Get course by ID with modules
export const getCourse = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const course = await prisma.course.findUnique({
            where: { id },
            include: {
                modules: {
                    include: { lessons: true },
                    orderBy: { orderIndex: 'asc' },
                },
            },
        });

        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        res.json({ data: course });
    } catch (error) {
        console.error('Get course error:', error);
        res.status(500).json({ error: 'Failed to fetch course' });
    }
};

// Create course
export const createCourse = async (req: AuthRequest, res: Response) => {
    try {
        const course = await prisma.course.create({
            data: req.body,
        });
        res.status(201).json({ data: course });
    } catch (error) {
        console.error('Create course error:', error);
        res.status(500).json({ error: 'Failed to create course' });
    }
};

// Update course
export const updateCourse = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const course = await prisma.course.update({
            where: { id },
            data: req.body,
        });
        res.json({ data: course });
    } catch (error) {
        console.error('Update course error:', error);
        res.status(500).json({ error: 'Failed to update course' });
    }
};

// Delete course
export const deleteCourse = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.course.delete({ where: { id } });
        res.json({ message: 'Course deleted successfully' });
    } catch (error) {
        console.error('Delete course error:', error);
        res.status(500).json({ error: 'Failed to delete course' });
    }
};

// Enroll in course
export const enrollInCourse = async (req: AuthRequest, res: Response) => {
    try {
        const { courseId } = req.body;
        const userId = req.user?.id;

        if (!userId) return res.status(401).json({ error: 'Not authenticated' });

        const enrollment = await prisma.courseEnrollment.create({
            data: { courseId, userId },
        });

        res.status(201).json({ data: enrollment });
    } catch (error) {
        console.error('Enroll error:', error);
        res.status(500).json({ error: 'Failed to enroll' });
    }
};

// Get user's enrolled courses
export const getUserCourses = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ error: 'Not authenticated' });

        const enrollments = await prisma.courseEnrollment.findMany({
            where: { userId },
            include: { course: true },
            orderBy: { enrolledAt: 'desc' },
        });

        res.json({ data: enrollments.map((e) => e.course) });
    } catch (error) {
        console.error('Get user courses error:', error);
        res.status(500).json({ error: 'Failed to fetch courses' });
    }
};
