// Course Service - Course Module
// API calls for course management (Using Backend API)

import { api } from '@/lib/api';
import type {
    Course,
    CourseInsert,
    CourseUpdate,
    CourseModule,
    Lesson,
    CourseDetail,
} from '../types/course.types';
import type { PaginatedResponse } from '@/shared/types/common.types';

interface ApiResponse<T> {
    data: T;
}

interface PaginatedApiResponse<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export const courseService = {
    async getCourses(
        page = 1,
        pageSize = 10,
        filters?: { category?: string; subcategory?: string | null; is_official?: boolean; search?: string }
    ): Promise<PaginatedResponse<Course>> {
        const params = new URLSearchParams({
            page: page.toString(),
            pageSize: pageSize.toString(),
        });
        if (filters?.category) params.append('category', filters.category);
        if (filters?.search) params.append('search', filters.search);

        const response = await api.get<PaginatedApiResponse<Course>>(`/courses?${params}`);
        return {
            data: response.data,
            total: response.total,
            page: response.page,
            pageSize: response.pageSize,
            totalPages: response.totalPages,
        };
    },

    async getAdminCourses(page = 1, pageSize = 10, search = ''): Promise<PaginatedResponse<Course>> {
        const params = new URLSearchParams({ page: page.toString(), pageSize: pageSize.toString() });
        if (search) params.append('search', search);

        const response = await api.get<PaginatedApiResponse<Course>>(`/courses?${params}`);
        return {
            data: response.data,
            total: response.total,
            page: response.page,
            pageSize: response.pageSize,
            totalPages: response.totalPages,
        };
    },

    async getCourse(id: string): Promise<Course | null> {
        try {
            const response = await api.get<ApiResponse<Course>>(`/courses/${id}`);
            return response.data;
        } catch {
            return null;
        }
    },

    async getCourseWithDetails(id: string): Promise<CourseDetail | null> {
        try {
            const response = await api.get<ApiResponse<CourseDetail>>(`/courses/${id}`);
            return response.data;
        } catch {
            return null;
        }
    },

    async getCourseModules(courseId: string): Promise<CourseModule[]> {
        const course = await this.getCourse(courseId);
        return (course as any)?.modules || [];
    },

    async getLesson(lessonId: string): Promise<Lesson | null> {
        // TODO: Implement when backend supports lesson endpoint
        return null;
    },

    async createCourse(course: CourseInsert): Promise<Course> {
        const response = await api.post<ApiResponse<Course>>('/courses', course);
        return response.data;
    },

    async updateCourse(id: string, course: CourseUpdate): Promise<Course> {
        const response = await api.put<ApiResponse<Course>>(`/courses/${id}`, course);
        return response.data;
    },

    async deleteCourse(id: string): Promise<void> {
        await api.delete(`/courses/${id}`);
    },

    async enrollInCourse(courseId: string, userId: string): Promise<any> {
        const response = await api.post<ApiResponse<any>>('/courses/enroll', { courseId });
        return response.data;
    },

    async getEnrollment(courseId: string, userId: string): Promise<any | null> {
        // TODO: Implement when backend supports enrollment check
        return null;
    },

    async getUserCourses(userId: string): Promise<Course[]> {
        const response = await api.get<ApiResponse<Course[]>>('/courses/user/enrolled');
        return response.data;
    },

    async getLessonProgress(enrollmentId: string): Promise<any[]> {
        return [];
    },

    async updateLessonProgress(enrollmentId: string, lessonId: string, completed: boolean): Promise<void> {
        // TODO: Implement
    },
};
