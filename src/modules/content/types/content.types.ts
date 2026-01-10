// Content Module Types (Books & Podcasts)

import type { Database } from '@/shared/integrations/supabase/types';

// Book types
export type Book = Database['public']['Tables']['books']['Row'];
export type BookCategory = Database['public']['Tables']['book_categories']['Row'];

// Podcast types
export type Podcast = Database['public']['Tables']['podcasts']['Row'];
export type PodcastCategory = Database['public']['Tables']['podcast_categories']['Row'];

// Extended types
export interface BookWithCategory extends Book {
    category?: BookCategory;
}

export interface PodcastWithCategory extends Podcast {
    category?: PodcastCategory;
}

export interface ReadingProgress {
    book_id: string;
    user_id: string;
    current_page: number;
    total_pages: number;
    last_read_at: string;
}

export interface ListeningProgress {
    podcast_id: string;
    user_id: string;
    current_position: number; // in seconds
    duration: number;
    last_listened_at: string;
}
