// Exam Module - Barrel Export

// Services
export { examService } from './services/examService';

// Hooks
export { useAdminExams } from './hooks/useAdminExams';

// Types
export type {
    Exam,
    ExamInsert,
    ExamUpdate,
    Question,
    QuestionInsert,
    QuestionUpdate,
    ExamAttempt,
    ExamCategory,
    ExamWithQuestions,
    QuestionWithOptions,
    ExamAnswer,
} from './types/exam.types';
