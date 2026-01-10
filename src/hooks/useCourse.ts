import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { courseService } from '@/modules/course';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useCourseDetail = (courseId: string) => {
    return useQuery({
        queryKey: ['course', courseId],
        queryFn: async () => {
            const course = await courseService.getCourseWithDetails(courseId);
            if (!course) throw new Error('Course not found');
            return course;
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

            return await courseService.getEnrollment(courseId, user.id);
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

            return await courseService.enrollInCourse(courseId, user.id);
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
            return await courseService.getLessonProgress(enrollmentId);
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
            await courseService.updateLessonProgress(enrollmentId, lessonId, completed);
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['lesson-progress', variables.enrollmentId] });
        },
    });
};
