// AI Module Types

// Request/Response types for AI Edge Functions

export interface GenerateQuestionsRequest {
    content: string;
    questionCount?: number;
    difficulty?: 'easy' | 'medium' | 'hard';
}

export interface GeneratedQuestion {
    question_text: string;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
    correct_answer: 'A' | 'B' | 'C' | 'D';
    explanation: string;
}

export interface GenerateQuestionsResponse {
    questions: GeneratedQuestion[];
    error?: string;
}

export interface ExplainAnswerRequest {
    question: string;
    options: string[];
    correctAnswer: string;
    userAnswer?: string;
}

export interface ExplainAnswerResponse {
    explanation: string;
    tips?: string[];
    error?: string;
}

export interface AITutorMessage {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export interface AITutorRequest {
    messages: AITutorMessage[];
    context?: string;
}

export interface AITutorResponse {
    message: string;
    suggestions?: string[];
    error?: string;
}

export interface AIRecommendation {
    type: 'exam' | 'course' | 'flashcard';
    item_id: string;
    title: string;
    reason: string;
    score: number;
}

export interface SmartRecommendationsResponse {
    recommendations: AIRecommendation[];
    error?: string;
}
