// Application-wide constants

export const APP_NAME = 'MyExamTest';

// API & Pagination
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 50;

// Toast durations (ms)
export const TOAST_DURATION = {
  SHORT: 3000,
  MEDIUM: 5000,
  LONG: 8000,
} as const;

// Exam settings
export const EXAM_SETTINGS = {
  MIN_QUESTIONS: 5,
  MAX_QUESTIONS: 200,
  DEFAULT_TIME_LIMIT: 60, // minutes
  PASSING_SCORE: 50, // percentage
} as const;

// User roles
export const USER_ROLES = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
  MODERATOR: 'moderator',
  USER: 'user',
} as const;

// Storage keys
export const STORAGE_KEYS = {
  THEME: 'theme',
  LOCALE: 'locale',
  EXAM_PROGRESS: 'exam_progress',
} as const;

// Route paths
export const ROUTES = {
  HOME: '/',
  AUTH: '/auth',
  DASHBOARD: '/dashboard',
  COURSES: '/courses',
  EXAMS: '/exams',
  FLASHCARDS: '/flashcards',
  PODCASTS: '/podcasts',
  BOOKS: '/books',
  LEADERBOARD: '/leaderboard',
  SETTINGS: '/settings',
  ADMIN: '/admin',
  TEACHER: '/teacher',
} as const;
