import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CourseModule {
    id: string;
    course_id: string;
    title: string;
    description: string | null;
    order_index: number;
    duration_minutes: number;
    lessons: CourseLesson[];
}

export interface CourseLesson {
    id: string;
    module_id: string;
    title: string;
    description: string | null;
    type: 'video' | 'article' | 'quiz' | 'exercise';
    content_url: string | null;
    duration_minutes: number;
    order_index: number;
    is_preview: boolean;
    resources: any;
}

export interface CourseDetail {
    id: string;
    title: string;
    description: string | null;
    level: string | null;
    duration_hours: number | null;
    language: string | null;
    price: number | null;
    discount_price: number | null;
    thumbnail_url: string | null;
    preview_video_url: string | null;
    student_count: number;
    rating_avg: number;
    rating_count: number;
    published: boolean;
    modules: CourseModule[];
    requirements: Array<{ requirement_text: string }>;
    outcomes: Array<{ outcome_text: string }>;
    instructors: Array<{
        user_id: string;
        bio: string | null;
        title: string | null;
        is_primary: boolean;
    }>;
}

export const useCourseDetail = (courseId: string) => {
    return useQuery({
        queryKey: ['course', courseId],
        queryFn: async () => {
            // Fetch course basic info
            const { data: course, error: courseError } = await supabase
                .from('courses')
                .select('*')
                .eq('id', courseId)
                .single();

            if (courseError) throw courseError;

            // Fetch modules with lessons
            const { data: modules, error: modulesError } = await supabase
                .from('course_modules')
                .select(`
          *,
          lessons:course_lessons(*)
        `)
                .eq('course_id', courseId)
                .order('order_index');

            if (modulesError) throw modulesError;

            // Fetch requirements
            const { data: requirements, error: reqError } = await supabase
                .from('course_requirements')
                .select('requirement_text')
                .eq('course_id', courseId)
                .order('order_index');

            if (reqError) throw reqError;

            // Fetch outcomes
            const { data: outcomes, error: outError } = await supabase
                .from('course_outcomes')
                .select('outcome_text')
                .eq('course_id', courseId)
                .order('order_index');

            if (outError) throw outError;

            // Fetch instructors
            const { data: instructors, error: instError } = await supabase
                .from('course_instructors')
                .select('user_id, bio, title, is_primary')
                .eq('course_id', courseId);

            if (instError) throw instError;

            return {
                ...course,
                modules: modules || [],
                requirements: requirements || [],
                outcomes: outcomes || [],
                instructors: instructors || [],
            } as CourseDetail;
        },
        enabled: !!courseId,
    });
};

export const useEnrollment = (courseId: string) => {
    return useQuery({
        queryKey: ['enrollment', courseId],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return null;

            const { data, error } = await supabase
                .from('course_enrollments')
                .select('*')
                .eq('course_id', courseId)
                .eq('user_id', user.id)
                .maybeSingle();

            if (error) throw error;
            return data;
        },
        enabled: !!courseId,
    });
};

export const useEnrollCourse = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: async (courseId: string) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Vui lòng đăng nhập để đăng ký khóa học');

            const { data, error } = await supabase
                .from('course_enrollments')
                .insert({
                    course_id: courseId,
                    user_id: user.id,
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: (_, courseId) => {
            queryClient.invalidateQueries({ queryKey: ['enrollment', courseId] });
            toast({
                title: 'Thành công!',
                description: 'Bạn đã đăng ký khóa học thành công',
            });
        },
        onError: (error: Error) => {
            toast({
                title: 'Lỗi',
                description: error.message,
                variant: 'destructive',
            });
        },
    });
};

export const useLessonProgress = (enrollmentId: string | null) => {
    return useQuery({
        queryKey: ['lesson-progress', enrollmentId],
        queryFn: async () => {
            if (!enrollmentId) return [];

            const { data, error } = await supabase
                .from('lesson_progress')
                .select('*')
                .eq('enrollment_id', enrollmentId);

            if (error) throw error;
            return data;
        },
        enabled: !!enrollmentId,
    });
};

export const useUpdateLessonProgress = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            enrollmentId,
            lessonId,
            completed,
        }: {
            enrollmentId: string;
            lessonId: string;
            completed: boolean;
        }) => {
            const { data, error } = await supabase
                .from('lesson_progress')
                .upsert({
                    enrollment_id: enrollmentId,
                    lesson_id: lessonId,
                    completed,
                    completed_at: completed ? new Date().toISOString() : null,
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['lesson-progress', variables.enrollmentId] });
        },
    });
};
