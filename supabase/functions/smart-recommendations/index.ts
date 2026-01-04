import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, forceRefresh } = await req.json();
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    console.log('Smart recommendations request for user:', userId);

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get today's date in UTC
    const today = new Date().toISOString().split('T')[0];

    // Check for cached recommendations (unless forceRefresh is true)
    if (!forceRefresh) {
      const { data: cachedData } = await supabase
        .from('user_daily_recommendations')
        .select('recommendations_data, created_at')
        .eq('user_id', userId)
        .eq('recommendations_date', today)
        .single();

      if (cachedData) {
        console.log('Returning cached recommendations for date:', today);
        return new Response(JSON.stringify({
          ...cachedData.recommendations_data,
          fromCache: true,
          cachedAt: cachedData.created_at,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    console.log('No cache found, generating new recommendations...');

    // Fetch user's exam history
    const { data: attempts } = await supabase
      .from('exam_attempts')
      .select(`
        score,
        correct_answers,
        total_questions,
        exam:exams(title, category_id, difficulty)
      `)
      .eq('user_id', userId)
      .order('completed_at', { ascending: false })
      .limit(10);

    // Fetch available exams
    const { data: exams } = await supabase
      .from('exams')
      .select('id, title, description, difficulty, category_id')
      .limit(20);

    // Fetch flashcard progress
    const { data: flashcardProgress } = await supabase
      .from('user_flashcard_progress')
      .select('is_remembered, review_count')
      .eq('user_id', userId);

    // Build user context
    const userContext = {
      totalExams: attempts?.length || 0,
      averageScore: attempts?.length
        ? Math.round(attempts.reduce((acc, a) => acc + (a.score || 0), 0) / attempts.length)
        : 0,
      recentExams: attempts?.slice(0, 5).map(a => ({
        title: (a.exam as any)?.title,
        score: a.score,
        difficulty: (a.exam as any)?.difficulty,
      })) || [],
      flashcardStats: {
        total: flashcardProgress?.length || 0,
        remembered: flashcardProgress?.filter(f => f.is_remembered).length || 0,
      },
      availableExams: exams?.map(e => ({
        id: e.id,
        title: e.title,
        difficulty: e.difficulty,
      })) || [],
    };

    console.log('User context:', JSON.stringify(userContext, null, 2));

    const systemPrompt = `Bạn là hệ thống gợi ý học tập thông minh. Dựa trên lịch sử học tập của học sinh, hãy đưa ra các gợi ý phù hợp.

Phân tích:
- Điểm trung bình và xu hướng điểm số
- Độ khó phù hợp dựa trên hiệu suất
- Các chủ đề cần cải thiện
- Flashcards cần ôn tập`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemPrompt }]
          },
          contents: [
            { role: "user", parts: [{ text: `Dữ liệu học tập của học sinh:\n${JSON.stringify(userContext, null, 2)}\n\nHãy đưa ra gợi ý học tập.` }] }
          ],
          tools: [{
            functionDeclarations: [{
              name: "create_recommendations",
              description: "Tạo danh sách gợi ý học tập cho học sinh",
              parameters: {
                type: "object",
                properties: {
                  summary: { type: "string", description: "Tóm tắt ngắn về hiệu suất học tập" },
                  strengths: {
                    type: "array",
                    items: { type: "string" },
                    description: "Điểm mạnh của học sinh",
                  },
                  improvements: {
                    type: "array",
                    items: { type: "string" },
                    description: "Các điểm cần cải thiện",
                  },
                  recommendations: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        type: { type: "string", enum: ["exam", "flashcard", "practice", "review"], description: "Loại gợi ý" },
                        title: { type: "string", description: "Tiêu đề gợi ý" },
                        description: { type: "string", description: "Mô tả chi tiết" },
                        priority: { type: "string", enum: ["high", "medium", "low"], description: "Mức độ ưu tiên" },
                        examId: { type: "string", description: "ID bài thi (nếu có)" },
                      },
                      required: ["type", "title", "description", "priority"],
                    },
                  },
                  suggestedDifficulty: { type: "string", enum: ["easy", "medium", "hard"], description: "Độ khó phù hợp" },
                },
                required: ["summary", "strengths", "improvements", "recommendations", "suggestedDifficulty"],
              },
            }]
          }],
          toolConfig: {
            functionCallingConfig: {
              mode: "ANY",
              allowedFunctionNames: ["create_recommendations"]
            }
          }
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Quá nhiều yêu cầu, vui lòng thử lại sau." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402 || response.status === 403) {
        return new Response(JSON.stringify({ error: "API key không hợp lệ hoặc đã hết quota." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ error: "Lỗi Gemini API" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    console.log('Gemini response:', JSON.stringify(data, null, 2));

    // Extract recommendations from Gemini function call response
    const functionCall = data.candidates?.[0]?.content?.parts?.[0]?.functionCall;
    if (functionCall?.args) {
      // Save to cache for today
      const { error: cacheError } = await supabase
        .from('user_daily_recommendations')
        .upsert({
          user_id: userId,
          recommendations_date: today,
          recommendations_data: functionCall.args,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,recommendations_date',
        });

      if (cacheError) {
        console.error('Failed to cache recommendations:', cacheError);
      } else {
        console.log('Cached recommendations for date:', today);
      }

      return new Response(JSON.stringify({
        ...functionCall.args,
        fromCache: false,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Không thể tạo gợi ý" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Smart recommendations error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
