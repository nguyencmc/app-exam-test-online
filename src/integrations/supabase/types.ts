export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          badge_color: string
          category: string
          created_at: string
          description: string
          display_order: number | null
          icon: string
          id: string
          name: string
          points_reward: number
          requirement_type: string
          requirement_value: number
        }
        Insert: {
          badge_color?: string
          category?: string
          created_at?: string
          description: string
          display_order?: number | null
          icon?: string
          id?: string
          name: string
          points_reward?: number
          requirement_type: string
          requirement_value?: number
        }
        Update: {
          badge_color?: string
          category?: string
          created_at?: string
          description?: string
          display_order?: number | null
          icon?: string
          id?: string
          name?: string
          points_reward?: number
          requirement_type?: string
          requirement_value?: number
        }
        Relationships: []
      }
      book_bookmarks: {
        Row: {
          book_id: string | null
          created_at: string
          id: string
          position: number
          title: string | null
          user_id: string
        }
        Insert: {
          book_id?: string | null
          created_at?: string
          id?: string
          position: number
          title?: string | null
          user_id: string
        }
        Update: {
          book_id?: string | null
          created_at?: string
          id?: string
          position?: number
          title?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "book_bookmarks_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      book_categories: {
        Row: {
          book_count: number | null
          created_at: string
          description: string | null
          display_order: number | null
          icon_url: string | null
          id: string
          is_featured: boolean | null
          name: string
          slug: string
        }
        Insert: {
          book_count?: number | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          icon_url?: string | null
          id?: string
          is_featured?: boolean | null
          name: string
          slug: string
        }
        Update: {
          book_count?: number | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          icon_url?: string | null
          id?: string
          is_featured?: boolean | null
          name?: string
          slug?: string
        }
        Relationships: []
      }
      book_chapters: {
        Row: {
          book_id: string | null
          chapter_order: number | null
          created_at: string
          id: string
          position: number
          title: string
        }
        Insert: {
          book_id?: string | null
          chapter_order?: number | null
          created_at?: string
          id?: string
          position: number
          title: string
        }
        Update: {
          book_id?: string | null
          chapter_order?: number | null
          created_at?: string
          id?: string
          position?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "book_chapters_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      book_highlights: {
        Row: {
          book_id: string | null
          color: string | null
          created_at: string
          end_position: number
          highlighted_text: string
          id: string
          start_position: number
          user_id: string
        }
        Insert: {
          book_id?: string | null
          color?: string | null
          created_at?: string
          end_position: number
          highlighted_text: string
          id?: string
          start_position: number
          user_id: string
        }
        Update: {
          book_id?: string | null
          color?: string | null
          created_at?: string
          end_position?: number
          highlighted_text?: string
          id?: string
          start_position?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "book_highlights_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      book_notes: {
        Row: {
          book_id: string | null
          content: string
          created_at: string
          id: string
          position: number
          updated_at: string
          user_id: string
        }
        Insert: {
          book_id?: string | null
          content: string
          created_at?: string
          id?: string
          position: number
          updated_at?: string
          user_id: string
        }
        Update: {
          book_id?: string | null
          content?: string
          created_at?: string
          id?: string
          position?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "book_notes_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      books: {
        Row: {
          author_name: string | null
          category_id: string | null
          content: string | null
          cover_url: string | null
          created_at: string
          description: string | null
          difficulty: string | null
          id: string
          is_featured: boolean | null
          page_count: number | null
          rating: number | null
          read_count: number | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          author_name?: string | null
          category_id?: string | null
          content?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          difficulty?: string | null
          id?: string
          is_featured?: boolean | null
          page_count?: number | null
          rating?: number | null
          read_count?: number | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          author_name?: string | null
          category_id?: string | null
          content?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          difficulty?: string | null
          id?: string
          is_featured?: boolean | null
          page_count?: number | null
          rating?: number | null
          read_count?: number | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "books_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "book_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          category: string
          created_at: string
          creator_id: string | null
          creator_name: string | null
          description: string | null
          id: string
          image_url: string | null
          is_official: boolean | null
          subcategory: string | null
          term_count: number | null
          title: string
          topic: string | null
          updated_at: string
          view_count: number | null
        }
        Insert: {
          category?: string
          created_at?: string
          creator_id?: string | null
          creator_name?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_official?: boolean | null
          subcategory?: string | null
          term_count?: number | null
          title: string
          topic?: string | null
          updated_at?: string
          view_count?: number | null
        }
        Update: {
          category?: string
          created_at?: string
          creator_id?: string | null
          creator_name?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_official?: boolean | null
          subcategory?: string | null
          term_count?: number | null
          title?: string
          topic?: string | null
          updated_at?: string
          view_count?: number | null
        }
        Relationships: []
      }
      exam_attempts: {
        Row: {
          answers: Json | null
          completed_at: string
          correct_answers: number | null
          created_at: string
          exam_id: string | null
          id: string
          score: number | null
          time_spent_seconds: number | null
          total_questions: number | null
          user_id: string | null
        }
        Insert: {
          answers?: Json | null
          completed_at?: string
          correct_answers?: number | null
          created_at?: string
          exam_id?: string | null
          id?: string
          score?: number | null
          time_spent_seconds?: number | null
          total_questions?: number | null
          user_id?: string | null
        }
        Update: {
          answers?: Json | null
          completed_at?: string
          correct_answers?: number | null
          created_at?: string
          exam_id?: string | null
          id?: string
          score?: number | null
          time_spent_seconds?: number | null
          total_questions?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exam_attempts_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_categories: {
        Row: {
          attempt_count: number | null
          created_at: string
          display_order: number | null
          exam_count: number | null
          icon_url: string | null
          id: string
          is_featured: boolean | null
          name: string
          question_count: number | null
          rating: number | null
          slug: string
          subcategory_count: number | null
        }
        Insert: {
          attempt_count?: number | null
          created_at?: string
          display_order?: number | null
          exam_count?: number | null
          icon_url?: string | null
          id?: string
          is_featured?: boolean | null
          name: string
          question_count?: number | null
          rating?: number | null
          slug: string
          subcategory_count?: number | null
        }
        Update: {
          attempt_count?: number | null
          created_at?: string
          display_order?: number | null
          exam_count?: number | null
          icon_url?: string | null
          id?: string
          is_featured?: boolean | null
          name?: string
          question_count?: number | null
          rating?: number | null
          slug?: string
          subcategory_count?: number | null
        }
        Relationships: []
      }
      exams: {
        Row: {
          attempt_count: number | null
          category_id: string | null
          created_at: string
          description: string | null
          difficulty: string | null
          duration_minutes: number | null
          id: string
          is_featured: boolean | null
          pass_rate: number | null
          question_count: number | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          attempt_count?: number | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          difficulty?: string | null
          duration_minutes?: number | null
          id?: string
          is_featured?: boolean | null
          pass_rate?: number | null
          question_count?: number | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          attempt_count?: number | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          difficulty?: string | null
          duration_minutes?: number | null
          id?: string
          is_featured?: boolean | null
          pass_rate?: number | null
          question_count?: number | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exams_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "exam_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      flashcard_sets: {
        Row: {
          card_count: number | null
          category: string | null
          created_at: string
          creator_id: string | null
          description: string | null
          id: string
          is_public: boolean | null
          title: string
          updated_at: string
        }
        Insert: {
          card_count?: number | null
          category?: string | null
          created_at?: string
          creator_id?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          title: string
          updated_at?: string
        }
        Update: {
          card_count?: number | null
          category?: string | null
          created_at?: string
          creator_id?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      flashcards: {
        Row: {
          back_text: string
          card_order: number | null
          created_at: string
          front_text: string
          id: string
          set_id: string | null
        }
        Insert: {
          back_text: string
          card_order?: number | null
          created_at?: string
          front_text: string
          id?: string
          set_id?: string | null
        }
        Update: {
          back_text?: string
          card_order?: number | null
          created_at?: string
          front_text?: string
          id?: string
          set_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "flashcards_set_id_fkey"
            columns: ["set_id"]
            isOneToOne: false
            referencedRelation: "flashcard_sets"
            referencedColumns: ["id"]
          },
        ]
      }
      podcast_categories: {
        Row: {
          created_at: string
          description: string | null
          display_order: number | null
          icon_url: string | null
          id: string
          is_featured: boolean | null
          name: string
          podcast_count: number | null
          slug: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          icon_url?: string | null
          id?: string
          is_featured?: boolean | null
          name: string
          podcast_count?: number | null
          slug: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          icon_url?: string | null
          id?: string
          is_featured?: boolean | null
          name?: string
          podcast_count?: number | null
          slug?: string
        }
        Relationships: []
      }
      podcasts: {
        Row: {
          audio_url: string | null
          category_id: string | null
          created_at: string
          description: string | null
          difficulty: string | null
          duration_seconds: number | null
          episode_number: number | null
          host_name: string | null
          id: string
          is_featured: boolean | null
          listen_count: number | null
          slug: string
          thumbnail_url: string | null
          title: string
          transcript: string | null
          updated_at: string
        }
        Insert: {
          audio_url?: string | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          difficulty?: string | null
          duration_seconds?: number | null
          episode_number?: number | null
          host_name?: string | null
          id?: string
          is_featured?: boolean | null
          listen_count?: number | null
          slug: string
          thumbnail_url?: string | null
          title: string
          transcript?: string | null
          updated_at?: string
        }
        Update: {
          audio_url?: string | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          difficulty?: string | null
          duration_seconds?: number | null
          episode_number?: number | null
          host_name?: string | null
          id?: string
          is_featured?: boolean | null
          listen_count?: number | null
          slug?: string
          thumbnail_url?: string | null
          title?: string
          transcript?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "podcasts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "podcast_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          email: string | null
          expires_at: string | null
          full_name: string | null
          id: string
          level: number | null
          points: number | null
          total_correct_answers: number | null
          total_exams_taken: number | null
          total_questions_answered: number | null
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          expires_at?: string | null
          full_name?: string | null
          id?: string
          level?: number | null
          points?: number | null
          total_correct_answers?: number | null
          total_exams_taken?: number | null
          total_questions_answered?: number | null
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          expires_at?: string | null
          full_name?: string | null
          id?: string
          level?: number | null
          points?: number | null
          total_correct_answers?: number | null
          total_exams_taken?: number | null
          total_questions_answered?: number | null
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      questions: {
        Row: {
          correct_answer: string
          created_at: string
          exam_id: string | null
          explanation: string | null
          id: string
          option_a: string
          option_b: string
          option_c: string | null
          option_d: string | null
          option_e: string | null
          option_f: string | null
          option_g: string | null
          option_h: string | null
          question_order: number | null
          question_text: string
        }
        Insert: {
          correct_answer: string
          created_at?: string
          exam_id?: string | null
          explanation?: string | null
          id?: string
          option_a: string
          option_b: string
          option_c?: string | null
          option_d?: string | null
          option_e?: string | null
          option_f?: string | null
          option_g?: string | null
          option_h?: string | null
          question_order?: number | null
          question_text: string
        }
        Update: {
          correct_answer?: string
          created_at?: string
          exam_id?: string | null
          explanation?: string | null
          id?: string
          option_a?: string
          option_b?: string
          option_c?: string | null
          option_d?: string | null
          option_e?: string | null
          option_f?: string | null
          option_g?: string | null
          option_h?: string | null
          question_order?: number | null
          question_text?: string
        }
        Relationships: [
          {
            foreignKeyName: "questions_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
        ]
      }
      study_group_members: {
        Row: {
          group_id: string
          id: string
          joined_at: string
          role: string | null
          user_id: string
        }
        Insert: {
          group_id: string
          id?: string
          joined_at?: string
          role?: string | null
          user_id: string
        }
        Update: {
          group_id?: string
          id?: string
          joined_at?: string
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "study_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      study_group_messages: {
        Row: {
          content: string
          created_at: string
          group_id: string
          id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          group_id: string
          id?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          group_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_group_messages_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "study_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      study_group_resources: {
        Row: {
          created_at: string
          description: string | null
          group_id: string
          id: string
          resource_id: string | null
          resource_type: string | null
          resource_url: string | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          group_id: string
          id?: string
          resource_id?: string | null
          resource_type?: string | null
          resource_url?: string | null
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          group_id?: string
          id?: string
          resource_id?: string | null
          resource_type?: string | null
          resource_url?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_group_resources_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "study_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      study_groups: {
        Row: {
          category: string | null
          cover_image_url: string | null
          created_at: string
          creator_id: string
          description: string | null
          id: string
          is_public: boolean | null
          max_members: number | null
          member_count: number | null
          name: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          cover_image_url?: string | null
          created_at?: string
          creator_id: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          max_members?: number | null
          member_count?: number | null
          name: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          cover_image_url?: string | null
          created_at?: string
          creator_id?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          max_members?: number | null
          member_count?: number | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      user_book_progress: {
        Row: {
          book_id: string | null
          completed_at: string | null
          created_at: string
          current_position: number | null
          id: string
          is_completed: boolean | null
          last_read_at: string | null
          total_time_seconds: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          book_id?: string | null
          completed_at?: string | null
          created_at?: string
          current_position?: number | null
          id?: string
          is_completed?: boolean | null
          last_read_at?: string | null
          total_time_seconds?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          book_id?: string | null
          completed_at?: string | null
          created_at?: string
          current_position?: number | null
          id?: string
          is_completed?: boolean | null
          last_read_at?: string | null
          total_time_seconds?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_book_progress_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      user_flashcard_progress: {
        Row: {
          created_at: string
          flashcard_id: string | null
          id: string
          is_remembered: boolean | null
          last_reviewed_at: string | null
          review_count: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          flashcard_id?: string | null
          id?: string
          is_remembered?: boolean | null
          last_reviewed_at?: string | null
          review_count?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          flashcard_id?: string | null
          id?: string
          is_remembered?: boolean | null
          last_reviewed_at?: string | null
          review_count?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_flashcard_progress_flashcard_id_fkey"
            columns: ["flashcard_id"]
            isOneToOne: false
            referencedRelation: "flashcards"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_leaderboard: {
        Args: { limit_count?: number }
        Returns: {
          avatar_url: string
          full_name: string
          level: number
          points: number
          rank: number
          total_correct_answers: number
          total_exams_taken: number
          user_id: string
          username: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_user_expired: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user" | "teacher"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user", "teacher"],
    },
  },
} as const
