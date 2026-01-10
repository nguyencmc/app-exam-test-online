// Proctoring Service
// Handles upload of proctoring data to Supabase Storage

import { supabase } from '@/integrations/supabase/client';

export interface ProctoringSession {
    id?: string;
    exam_attempt_id?: string;
    user_id: string;
    exam_id: string;
    camera_enabled: boolean;
    screen_enabled: boolean;
    started_at: string;
    ended_at?: string;
}

export interface ProctoringEvent {
    session_id: string;
    event_type: 'snapshot' | 'tab_switch' | 'fullscreen_exit' | 'copy_attempt' | 'violation';
    event_data?: Record<string, unknown>;
    media_url?: string;
}

const STORAGE_BUCKET = 'proctoring';

export const proctoringService = {
    /**
     * Create a new proctoring session
     */
    async createSession(session: Omit<ProctoringSession, 'id'>): Promise<string | null> {
        const { data, error } = await supabase
            .from('proctoring_sessions')
            .insert(session)
            .select('id')
            .single();

        if (error) {
            console.error('Failed to create proctoring session:', error);
            return null;
        }

        return data?.id || null;
    },

    /**
     * End a proctoring session
     */
    async endSession(sessionId: string): Promise<boolean> {
        const { error } = await supabase
            .from('proctoring_sessions')
            .update({ ended_at: new Date().toISOString() })
            .eq('id', sessionId);

        if (error) {
            console.error('Failed to end proctoring session:', error);
            return false;
        }

        return true;
    },

    /**
     * Upload a camera snapshot to Supabase Storage
     */
    async uploadSnapshot(
        sessionId: string,
        imageData: string, // base64 data URL
        userId: string
    ): Promise<string | null> {
        try {
            // Convert base64 to blob
            const base64Response = await fetch(imageData);
            const blob = await base64Response.blob();

            // Generate unique filename
            const timestamp = Date.now();
            const filename = `${userId}/${sessionId}/snapshot_${timestamp}.jpg`;

            // Upload to Supabase Storage
            const { data, error } = await supabase.storage
                .from(STORAGE_BUCKET)
                .upload(filename, blob, {
                    contentType: 'image/jpeg',
                    upsert: false,
                });

            if (error) {
                console.error('Failed to upload snapshot:', error);
                return null;
            }

            // Get public URL
            const { data: urlData } = supabase.storage
                .from(STORAGE_BUCKET)
                .getPublicUrl(data.path);

            return urlData?.publicUrl || null;
        } catch (error) {
            console.error('Error uploading snapshot:', error);
            return null;
        }
    },

    /**
     * Upload a screen recording chunk
     */
    async uploadRecording(
        sessionId: string,
        videoBlob: Blob,
        userId: string,
        chunkIndex: number
    ): Promise<string | null> {
        try {
            const filename = `${userId}/${sessionId}/recording_${chunkIndex}.webm`;

            const { data, error } = await supabase.storage
                .from(STORAGE_BUCKET)
                .upload(filename, videoBlob, {
                    contentType: 'video/webm',
                    upsert: false,
                });

            if (error) {
                console.error('Failed to upload recording:', error);
                return null;
            }

            const { data: urlData } = supabase.storage
                .from(STORAGE_BUCKET)
                .getPublicUrl(data.path);

            return urlData?.publicUrl || null;
        } catch (error) {
            console.error('Error uploading recording:', error);
            return null;
        }
    },

    /**
     * Log a proctoring event
     */
    async logEvent(event: ProctoringEvent): Promise<boolean> {
        const { error } = await supabase
            .from('proctoring_events')
            .insert({
                ...event,
                created_at: new Date().toISOString(),
            });

        if (error) {
            console.error('Failed to log proctoring event:', error);
            return false;
        }

        return true;
    },

    /**
     * Get all events for a session
     */
    async getSessionEvents(sessionId: string): Promise<ProctoringEvent[]> {
        const { data, error } = await supabase
            .from('proctoring_events')
            .select('*')
            .eq('session_id', sessionId)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Failed to get session events:', error);
            return [];
        }

        return data || [];
    },

    /**
     * Get all snapshots URLs for a session
     */
    async getSessionSnapshots(sessionId: string, userId: string): Promise<string[]> {
        const { data, error } = await supabase.storage
            .from(STORAGE_BUCKET)
            .list(`${userId}/${sessionId}`, {
                limit: 100,
                sortBy: { column: 'created_at', order: 'asc' },
            });

        if (error) {
            console.error('Failed to list snapshots:', error);
            return [];
        }

        return (data || [])
            .filter(file => file.name.startsWith('snapshot_'))
            .map(file => {
                const { data: urlData } = supabase.storage
                    .from(STORAGE_BUCKET)
                    .getPublicUrl(`${userId}/${sessionId}/${file.name}`);
                return urlData?.publicUrl || '';
            })
            .filter(Boolean);
    },
};

export default proctoringService;
