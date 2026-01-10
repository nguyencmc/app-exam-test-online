// Common Types shared across all modules

// Pagination
export interface PaginationParams {
    page: number;
    pageSize: number;
    search?: string;
    filters?: Record<string, any>;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

// API Error
export interface ApiError {
    message: string;
    code?: string;
    details?: unknown;
}

// Form helpers
export interface SelectOption {
    label: string;
    value: string;
}

// User Progress
export interface UserProgress {
    totalExams: number;
    completedExams: number;
    averageScore: number;
    totalStudyTime: number;
    currentStreak: number;
}

// Generic Result type for operations
export type Result<T, E = ApiError> =
    | { success: true; data: T }
    | { success: false; error: E };
