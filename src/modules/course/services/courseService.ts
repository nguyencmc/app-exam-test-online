// Course Service - Course Module
// API calls for course management

import { supabase } from '@/integrations/supabase/client';
import type {
    Course,
    CourseInsert,
    CourseUpdate,
    CourseModule,
    Lesson,
    CourseDetail,
} from '../types/course.types';
import type { PaginatedResponse } from '@/shared/types/common.types';

export const courseService = {
    /**
     * Get all published/official courses with pagination and filters
     */
    async getCourses(
        page = 1,
        pageSize = 10,
        filters?: {
            category?: string,
            subcategory?: string | null,
            is_official?: boolean,
            search?: string
        }
    ): Promise<PaginatedResponse<Course>> {
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        let query = supabase
            .from('courses')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false });

        if (filters?.category && filters.category !== 'all') {
            query = query.eq('category', filters.category);
        }

        if (filters?.subcategory) {
            query = query.eq('subcategory', filters.subcategory);
        }

        if (filters?.is_official !== undefined) {
            query = query.eq('is_official', filters.is_official);
        }

        if (filters?.search) {
            query = query.ilike('title', `%${filters.search}%`);
        }

        const { data, error, count } = await query.range(from, to);

        if (error) throw error;

        return {
            data: data || [],
            total: count || 0,
            page,
            pageSize,
            totalPages: Math.ceil((count || 0) / pageSize),
        };
    },

    /**
     * Get all courses for Admin dashboard
     */
    async getAdminCourses(page = 1, pageSize = 10, search = ''): Promise<PaginatedResponse<Course>> {
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        let query = supabase
            .from('courses')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false });

        if (search) {
            query = query.ilike('title', `%${search}%`);
        }

        const { data, error, count } = await query.range(from, to);

        if (error) throw error;

        return {
            data: data || [],
            total: count || 0,
            page,
            pageSize,
            totalPages: Math.ceil((count || 0) / pageSize),
        };
    },

    /**
     * Get course by ID with modules and lessons
     */
    async getCourse(id: string): Promise<Course | null> {
        const { data, error } = await supabase
            .from('courses')
            .select(`*, course_modules(*, lessons:course_lessons(*))`)
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }

        return data;
    },

    /**
     * Get full course details
     */
    async getCourseWithDetails(id: string): Promise<CourseDetail | null> {
        const [courseRes, modulesRes, reqRes, outlinesRes, instRes] = await Promise.all([
            supabase.from('courses').select('*').eq('id', id).single(),
            supabase.from('course_modules').select(`*, lessons:course_lessons(*)`).eq('course_id', id).order('order_index'),
            supabase.from('course_requirements').select('requirement_text').eq('course_id', id).order('order_index'),
            supabase.from('course_outcomes').select('outcome_text').eq('course_id', id).order('order_index'),
            supabase.from('course_instructors').select('user_id, bio, title, is_primary').eq('course_id', id)
        ]);

        if (courseRes.error) throw courseRes.error;

        return {
            ...courseRes.data,
            modules: modulesRes.data || [],
            requirements: reqRes.data || [],
            outcomes: outlinesRes.data || [],
            instructors: instRes.data || [],
        } as CourseDetail;
    },

    /**
     * Get modules for a course
     */
    async getCourseModules(courseId: string): Promise<CourseModule[]> {
        const { data, error } = await supabase
            .from('course_modules')
            .select('*, lessons:course_lessons(*)')
            .eq('course_id', courseId)
            .order('order_index', { ascending: true });

        if (error) throw error;
        return data || [];
    },

    /**
     * Get lesson by ID
     */
    async getLesson(lessonId: string): Promise<Lesson | null> {
        const { data, error } = await supabase
            .from('course_lessons')
            .select('*')
            .eq('id', lessonId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }

        return data;
    },

    /**
     * Create a new course
     */
    async createCourse(course: CourseInsert): Promise<Course> {
        const { data, error } = await supabase
            .from('courses')
            .insert(course)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Update a course
     */
    async updateCourse(id: string, course: CourseUpdate): Promise<Course> {
        const { data, error } = await supabase
            .from('courses')
            .update(course)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Delete a course
     */
    async deleteCourse(id: string): Promise<void> {
        const { error } = await supabase
            .from('courses')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    /**
     * Enroll user in a course
     */
    async enrollInCourse(courseId: string, userId: string): Promise<any> {
        const { data, error } = await supabase
            .from('course_enrollments')
            .insert({ course_id: courseId, user_id: userId })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Get enrollment status
     */
    async getEnrollment(courseId: string, userId: string): Promise<any | null> {
        const { data, error } = await supabase
            .from('course_enrollments')
            .select('*')
            .eq('course_id', courseId)
            .eq('user_id', userId)
            .maybeSingle();

        if (error) throw error;
        return data;
    },

    /**
     * Get user's enrolled courses
     */
    async getUserCourses(userId: string): Promise<Course[]> {
        const { data, error } = await supabase
            .from('course_enrollments')
            .select('courses(*)')
            .eq('user_id', userId)
            .order('enrolled_at', { ascending: false });

        if (error) throw error;
        return data?.map(e => e.courses).filter(Boolean) as Course[] || [];
    },

    async getLessonProgress(enrollmentId: string): Promise<any[]> {
        const { data, error } = await supabase
            .from('lesson_progress')
            .select('*')
            .eq('enrollment_id', enrollmentId);

        if (error) throw error;
        return data || [];
    },

    /**
     * Update lesson progress
     */
    async updateLessonProgress(enrollmentId: string, lessonId: string, completed: boolean): Promise<void> {
        const { error } = await supabase
            .from('lesson_progress')
            .upsert({
                enrollment_id: enrollmentId,
                lesson_id: lessonId,
                completed,
                completed_at: completed ? new Date().toISOString() : null,
            });

        if (error) throw error;
    },
};
