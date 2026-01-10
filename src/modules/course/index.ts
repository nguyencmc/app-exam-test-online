// Course Module - Barrel Export

// Services
export { courseService } from './services/courseService';

// Hooks
export {
    useCourse,
    useCourseDetail,
    useEnrollment,
    useEnrollCourse,
    useLessonProgress,
    useUpdateLessonProgress
} from './hooks/useCourse';

// Types
export type {
    Course,
    CourseInsert,
    CourseUpdate,
    CourseModule,
    Lesson,
    CourseDetail,
    CourseEnrollment,
} from './types/course.types';
