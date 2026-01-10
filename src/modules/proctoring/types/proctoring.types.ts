// Proctoring Module Types

export interface ProctoringSession {
    id?: string;
    exam_attempt_id?: string;
    user_id: string;
    exam_id: string;
    camera_enabled: boolean;
    screen_enabled: boolean;
    started_at: string;
    ended_at?: string;
    created_at?: string;
    updated_at?: string;
}

export interface ProctoringEvent {
    id?: string;
    session_id: string;
    event_type: 'snapshot' | 'tab_switch' | 'fullscreen_exit' | 'copy_attempt' | 'violation' | 'recording';
    event_data?: Record<string, unknown>;
    media_url?: string;
    created_at?: string;
}

export interface ProctoringOptions {
    enableCamera: boolean;
    enableAntiCheat: boolean;
    enableFullscreen: boolean;
    enableScreenRecording?: boolean;
    snapshotInterval?: number; // milliseconds
}

export interface ProctoringState {
    sessionId: string | null;
    isActive: boolean;
    snapshotCount: number;
    violationCount: number;
    isUploading: boolean;
}
