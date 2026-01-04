import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // List of all tables to export
    const tables = [
      "achievements",
      "book_bookmarks",
      "book_categories",
      "book_chapters",
      "book_highlights",
      "book_notes",
      "books",
      "courses",
      "exam_attempts",
      "exam_categories",
      "exams",
      "flashcard_sets",
      "flashcards",
      "podcast_categories",
      "podcasts",
      "profiles",
      "questions",
      "study_group_members",
      "study_group_messages",
      "study_group_resources",
      "study_groups",
      "user_achievements",
      "user_book_progress",
      "user_flashcard_progress",
      "user_roles",
    ];

    const exportData: Record<string, any[]> = {};
    const errors: string[] = [];

    // Fetch data from each table
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select("*")
          .limit(10000); // Increase limit if needed

        if (error) {
          errors.push(`Error fetching ${table}: ${error.message}`);
          exportData[table] = [];
        } else {
          exportData[table] = data || [];
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        errors.push(`Error fetching ${table}: ${errorMessage}`);
        exportData[table] = [];
      }
    }

    const result = {
      exported_at: new Date().toISOString(),
      tables: exportData,
      table_counts: Object.fromEntries(
        Object.entries(exportData).map(([table, data]) => [table, data.length])
      ),
      errors: errors.length > 0 ? errors : undefined,
    };

    return new Response(JSON.stringify(result, null, 2), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
